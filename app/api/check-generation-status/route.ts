import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

/**
 * API route pour vérifier le statut d'une génération d'image NanoBanana
 * et récupérer l'image une fois qu'elle est prête
 */
export async function POST(request: NextRequest) {
  let imageId: string | undefined

  try {
    const body = await request.json()
    imageId = body.imageId

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Récupérer l'image avec son taskId
    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('*, projects!inner(user_id)')
      .eq('id', imageId)
      .single()

    if (imageError || !image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Vérifier que l'image appartient à l'utilisateur
    if (image.projects.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Vérifier qu'il y a bien un taskId
    console.log('📋 Image metadata:', image.metadata)
    const taskId = image.metadata?.nanobanana_task_id

    if (!taskId) {
      console.error('❌ No taskId found in metadata:', image.metadata)
      return NextResponse.json({
        error: 'No task ID found for this image',
        metadata: image.metadata
      }, { status: 400 })
    }

    console.log('🔍 Checking NanoBanana task status:', taskId)

    // 2. Appeler l'API NanoBanana pour vérifier le statut
    const nanoBananaApiKey = process.env.NANOBANANA_API_KEY

    if (!nanoBananaApiKey) {
      throw new Error('NANOBANANA_API_KEY not configured')
    }

    // Endpoint pour vérifier le statut (GET avec query param)
    const statusResponse = await fetch(
      `https://api.nanobananaapi.ai/api/v1/nanobanana/record-info?taskId=${taskId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${nanoBananaApiKey}`,
        },
      }
    )

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text()
      console.error('❌ NanoBanana status check error:', errorText)
      throw new Error(`Failed to check task status: ${statusResponse.status}`)
    }

    const statusResult = await statusResponse.json()
    console.log('📦 Task status:', JSON.stringify(statusResult, null, 2))

    // 3. Vérifier le statut de la tâche avec successFlag
    // 0 = en cours, 1 = complété, 2 = échec création, 3 = échec génération
    const successFlag = statusResult.data?.successFlag ?? statusResult.successFlag

    // L'URL est dans data.response.resultImageUrl ou data.response.originImageUrl
    const originImageUrl = statusResult.data?.response?.originImageUrl
    const resultImageUrl = statusResult.data?.response?.resultImageUrl

    // Chercher dans tous les endroits possibles
    const possibleUrls = [
      resultImageUrl,
      originImageUrl,
      statusResult.data?.originImageUrl,
      statusResult.data?.resultImageUrl,
      statusResult.data?.url,
      statusResult.data?.imageUrl,
      statusResult.url,
      statusResult.imageUrl,
    ].filter(Boolean)

    console.log('🎯 successFlag:', successFlag)
    console.log('🖼️ Possible URLs found:', possibleUrls)
    console.log('📋 Full data object:', statusResult.data)

    // Si l'image n'est pas encore prête (en cours)
    if (successFlag === 0) {
      return NextResponse.json({
        success: true,
        status: 'processing',
        message: 'Image generation still in progress',
      })
    }

    // Si la génération a échoué (2 ou 3)
    if (successFlag === 2 || successFlag === 3) {
      await supabase
        .from('images')
        .update({
          status: 'failed',
          error_message: successFlag === 2 ? 'Task creation failed' : 'Generation failed',
        })
        .eq('id', imageId)

      return NextResponse.json({
        success: false,
        status: 'failed',
        message: successFlag === 2 ? 'Task creation failed' : 'Generation failed',
      })
    }

    // Si l'image est prête (successFlag === 1)
    const imageUrl = possibleUrls[0] // Prendre la première URL disponible

    if (successFlag === 1 && imageUrl) {
      console.log('✅ Image ready! Using URL:', imageUrl)

      // 4. Télécharger l'image générée
      const imageResponse = await fetch(imageUrl)
      const generatedImageBuffer = await imageResponse.arrayBuffer()

      // 5. Récupérer les dimensions originales depuis metadata
      const originalWidth = image.metadata?.original_width
      const originalHeight = image.metadata?.original_height

      let finalImageBuffer = Buffer.from(generatedImageBuffer)

      // 6. Redimensionner l'image aux dimensions EXACTES de l'original
      if (originalWidth && originalHeight) {
        console.log(`🔄 Resizing image to exact original dimensions: ${originalWidth}x${originalHeight}`)
        finalImageBuffer = await sharp(generatedImageBuffer)
          .resize(originalWidth, originalHeight, {
            fit: 'fill', // Force exact dimensions
            kernel: sharp.kernel.lanczos3 // High quality resampling
          })
          .png() // Garder en PNG pour la qualité
          .toBuffer()
        console.log('✅ Image resized successfully')
      } else {
        console.warn('⚠️ Original dimensions not found in metadata, keeping generated size')
      }

      // 7. Uploader sur Supabase Storage
      const fileName = `transformed-${Date.now()}.png`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(`${image.project_id}/${fileName}`, finalImageBuffer, {
          contentType: 'image/png',
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error('Failed to upload transformed image')
      }

      // 8. Récupérer l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from('images').getPublicUrl(uploadData.path)

      console.log('✅ Image uploaded to Supabase Storage:', publicUrl)

      // 9. Mettre à jour l'image avec le résultat
      const completedAt = new Date().toISOString()
      const processingDuration =
        new Date(completedAt).getTime() -
        new Date(image.processing_started_at || completedAt).getTime()

      const { error: updateError } = await supabase
        .from('images')
        .update({
          status: 'completed',
          transformed_url: publicUrl,
          processing_completed_at: completedAt,
          processing_duration_ms: processingDuration,
        })
        .eq('id', imageId)

      if (updateError) {
        console.error('Error updating image:', updateError)
        throw new Error('Failed to update image status')
      }

      console.log('🎉 Image generation completed!')

      return NextResponse.json({
        success: true,
        status: 'completed',
        imageId,
        transformedUrl: publicUrl,
      })
    }

    // Si on arrive ici, le statut est inconnu
    return NextResponse.json({
      success: true,
      status: 'processing',
      message: 'Unknown status, keep polling',
    })
  } catch (error: any) {
    console.error('Check generation status error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to check generation status',
      },
      { status: 500 }
    )
  }
}
