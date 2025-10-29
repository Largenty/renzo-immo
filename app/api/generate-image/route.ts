import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  let imageId: string | undefined

  try {
    const body = await request.json()
    imageId = body.imageId

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 })
    }

    // Créer le client Supabase
    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Récupérer les infos de l'image
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

    // 2. Récupérer le prompt approprié depuis la DB
    // Convertir with_furniture (boolean) en furniture_mode (text)
    let furnitureMode = 'auto'
    if (image.with_furniture === true) {
      furnitureMode = 'with'
    } else if (image.with_furniture === false) {
      furnitureMode = 'without'
    }

    const { data: promptData, error: promptError } = await supabase.rpc(
      'get_transformation_prompt',
      {
        p_transformation_type: image.transformation_type,
        p_room_type: image.room_type,
        p_furniture_mode: furnitureMode,
      }
    )

    if (promptError) {
      console.error('Error fetching prompt:', promptError)
      return NextResponse.json({
        error: 'Failed to get prompt. Did you run the create-prompts-table.sql script?',
        details: promptError.message
      }, { status: 500 })
    }

    // Utiliser le prompt personnalisé si fourni, sinon le prompt de la DB
    const finalPrompt = image.custom_prompt || promptData

    if (!finalPrompt) {
      console.error('No prompt available for this transformation')
      return NextResponse.json({
        error: 'No prompt configured for this transformation type. Please run create-prompts-table.sql script.'
      }, { status: 500 })
    }

    console.log('🎨 Generating image with prompt:', finalPrompt.substring(0, 100) + '...')

    // 3. Mettre à jour le statut à "processing"
    await supabase
      .from('images')
      .update({
        status: 'processing',
        processing_started_at: new Date().toISOString(),
      })
      .eq('id', imageId)

    // 4. Appeler l'API NanoBanana
    const nanoBananaApiKey = process.env.NANOBANANA_API_KEY

    if (!nanoBananaApiKey) {
      throw new Error('NANOBANANA_API_KEY not configured')
    }

    console.log('📡 Calling NanoBanana API...')

    // Détecter les dimensions EXACTES de l'image pour les préserver
    let imageSize = '16:9' // Default ratio pour NanoBanana
    let originalWidth: number | null = null
    let originalHeight: number | null = null

    try {
      // Utiliser sharp pour obtenir les dimensions (compatible Node.js)
      const imageBuffer = await fetch(image.original_url).then(r => r.arrayBuffer())
      const imageMetadata = await sharp(Buffer.from(imageBuffer)).metadata()
      originalWidth = imageMetadata.width || null
      originalHeight = imageMetadata.height || null

      // Calculer le ratio et trouver le plus proche parmi ceux supportés par NanoBanana
      // Ratios supportés: 1:1, 9:16, 16:9, 3:4, 4:3, 3:2, 2:3, 5:4, 4:5, 21:9
      if (!originalWidth || !originalHeight) {
        throw new Error('Could not get image dimensions')
      }
      const ratio = originalWidth / originalHeight
      const supportedRatios = {
        '1:1': 1,
        '16:9': 16/9,
        '9:16': 9/16,
        '4:3': 4/3,
        '3:4': 3/4,
        '3:2': 3/2,
        '2:3': 2/3,
        '5:4': 5/4,
        '4:5': 4/5,
        '21:9': 21/9,
      }

      // Trouver le ratio le plus proche
      let closestRatio = '16:9'
      let minDiff = Infinity

      for (const [ratioStr, ratioValue] of Object.entries(supportedRatios)) {
        const diff = Math.abs(ratio - ratioValue)
        if (diff < minDiff) {
          minDiff = diff
          closestRatio = ratioStr
        }
      }

      imageSize = closestRatio
      console.log(`📐 Original image dimensions: ${originalWidth}x${originalHeight} (ratio: ${ratio.toFixed(2)}, using NanoBanana ratio: ${imageSize})`)
    } catch (error) {
      console.warn('⚠️ Could not detect image dimensions, using default 16:9:', error)
    }

    // Pour l'instant, on va utiliser l'approche sans callback (simplifiée)
    // NanoBanana API endpoint corrigé
    const nanoBananaResponse = await fetch('https://api.nanobananaapi.ai/api/v1/nanobanana/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nanoBananaApiKey}`,
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        numImages: 1,
        type: 'IMAGETOIAMGE', // Note: faute de frappe dans leur API (IAMGE au lieu de IMAGE)
        image_size: imageSize, // Utilise le ratio détecté
        imageUrls: [image.original_url], // Array d'URLs d'images sources à transformer
        callBackUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/nanobanana-webhook', // Webhook pour recevoir le résultat
      }),
    }).catch((fetchError) => {
      console.error('❌ NanoBanana fetch error:', fetchError)
      console.error('Error details:', {
        message: fetchError.message,
        cause: fetchError.cause,
        code: fetchError.code,
      })
      throw new Error(`Failed to connect to NanoBanana API: ${fetchError.message}`)
    })

    if (!nanoBananaResponse.ok) {
      const errorText = await nanoBananaResponse.text()
      console.error('❌ NanoBanana API error:', errorText)
      throw new Error(`NanoBanana API failed: ${nanoBananaResponse.status} - ${errorText}`)
    }

    console.log('✅ NanoBanana API response received')

    const nanoBananaResult = await nanoBananaResponse.json()
    console.log('📦 NanoBanana result:', JSON.stringify(nanoBananaResult, null, 2))

    // 5. Récupérer l'URL de l'image générée ou l'ID de la tâche
    // La structure de réponse peut contenir soit une URL directe, soit un ID de tâche
    const taskId = nanoBananaResult.data?.taskId || nanoBananaResult.taskId
    const generatedImageUrl = nanoBananaResult.data?.imageUrl || nanoBananaResult.imageUrl || nanoBananaResult.url || nanoBananaResult.output?.[0]

    // Si NanoBanana retourne un ID de tâche au lieu d'une image directe
    // on devra implémenter du polling ou utiliser un webhook
    if (!generatedImageUrl && taskId) {
      // Pour l'instant, on laisse l'image en "processing"
      // et on retourne un message indiquant que c'est en cours
      console.log('⏳ NanoBanana task queued with ID:', taskId)

      // Sauvegarder le taskId ET les dimensions originales pour polling ultérieur
      await supabase
        .from('images')
        .update({
          metadata: {
            nanobanana_task_id: taskId,
            original_width: originalWidth,
            original_height: originalHeight
          }
        })
        .eq('id', imageId)

      return NextResponse.json({
        success: true,
        imageId,
        status: 'processing',
        message: 'Image generation started. This may take a few minutes.',
        taskId: taskId,
      })
    }

    if (!generatedImageUrl) {
      console.error('❌ No image URL in response:', nanoBananaResult)
      throw new Error('No image URL in NanoBanana response')
    }

    console.log('🖼️ Generated image URL:', generatedImageUrl)

    // 6. Télécharger l'image générée et l'uploader sur Supabase Storage
    const imageResponse = await fetch(generatedImageUrl)
    const imageBlob = await imageResponse.blob()

    const fileName = `transformed-${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(`${image.project_id}/${fileName}`, imageBlob, {
        contentType: 'image/png',
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error('Failed to upload transformed image')
    }

    // 7. Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(uploadData.path)

    console.log('✅ Image uploaded to Supabase Storage:', publicUrl)

    // 8. Mettre à jour l'image avec le résultat
    const completedAt = new Date().toISOString()
    const processingDuration =
      new Date(completedAt).getTime() - new Date(image.processing_started_at || completedAt).getTime()

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
      imageId,
      transformedUrl: publicUrl,
    })
  } catch (error: any) {
    console.error('Generate image error:', error)

    // Mettre l'image en statut "failed" si quelque chose a échoué
    if (imageId) {
      try {
        const supabase = await createClient()

        await supabase
          .from('images')
          .update({
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', imageId)
      } catch (e) {
        console.error('Failed to update error status:', e)
      }
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to generate image',
      },
      { status: 500 }
    )
  }
}
