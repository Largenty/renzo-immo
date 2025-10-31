import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { generateImageLimiter, checkRateLimit } from '@/lib/rate-limit'
import { generateImageRequestSchema, validateRequest } from '@/lib/validators/api-schemas'
import { logger } from '@/lib/logger'
import { buildPrompt, type RoomType } from '@/lib/prompts/prompt-builder'

export async function POST(request: NextRequest) {
  let imageId: string | undefined

  try {
    const body = await request.json()

    // ✅ ZOD VALIDATION: Valider le body de la requête
    const validation = validateRequest(generateImageRequestSchema, body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.error,
          details: validation.details,
        },
        { status: 400 }
      )
    }

    imageId = validation.data.imageId

    // Créer le client Supabase
    const supabase = await createClient()

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ EMAIL VERIFICATION: Vérifier que l'email est confirmé
    if (!user.confirmed_at) {
      return NextResponse.json(
        {
          error: 'Email verification required',
          message: 'Please verify your email before generating images',
        },
        { status: 403 }
      )
    }

    // ✅ RATE LIMITING: Vérifier le rate limit par user ID
    const { success, limit, remaining, reset } = await checkRateLimit(
      generateImageLimiter,
      user.id
    )

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many image generation requests. Please try again later.',
          limit,
          remaining,
          reset: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
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

    // 🐛 DEBUG: Log COMPLET des données de l'image depuis la DB
    logger.info('========== IMAGE DATA FROM DATABASE ==========', {
      image_id: image.id,
      transformation_type: (image as any).transformation_type,
      transformation_type_id: (image as any).transformation_type_id,
      with_furniture: image.with_furniture,
      furniture_ids: (image as any).furniture_ids,
      room_type: image.room_type,
      custom_room: (image as any).custom_room,
      custom_prompt: image.custom_prompt,
      status: image.status,
      ALL_COLUMNS: Object.keys(image),
    })

    // 2. Récupérer le prompt approprié via le système modulaire
    const roomType = (image.room_type || null) as RoomType | null
    const furnitureIds = (image.furniture_ids || []) as string[]
    // 🔄 TEMPORAIRE: utiliser transformation_type (slug) au lieu de transformation_type_id (UUID)
    const transformationTypeId = (image as any).transformation_type || (image as any).transformation_type_id

    logger.info('🔍 Building modular prompt', {
      transformationTypeId,
      roomType,
      furnitureCount: furnitureIds.length,
      hasCustomPrompt: !!image.custom_prompt,
    })

    // ✅ PROMPT SANITIZATION: Nettoyer et valider le prompt personnalisé d'abord
    let sanitizedCustomPrompt: string | null = null
    if (image.custom_prompt) {
      const { sanitizeAndValidatePrompt } = await import('@/lib/validators/prompt-sanitizer')
      const promptValidation = sanitizeAndValidatePrompt(image.custom_prompt)

      if (!promptValidation.success) {
        logger.warn('Invalid custom prompt detected:', promptValidation.error)
        return NextResponse.json(
          {
            error: 'Invalid custom prompt',
            details: promptValidation.error,
          },
          { status: 400 }
        )
      }

      sanitizedCustomPrompt = promptValidation.prompt
    }

    // Construire le prompt avec le système modulaire
    const promptResult = await buildPrompt({
      transformationTypeId, // 🔄 Utiliser la variable définie plus haut
      roomType: roomType!,
      furnitureIds,
      customPrompt: sanitizedCustomPrompt,
    })

    if (!promptResult.prompt) {
      logger.error('No prompt available for this transformation', {
        transformationTypeId,
        roomType,
      })
      return NextResponse.json(
        {
          error: 'No prompt configured for this transformation type',
          details: 'Please ensure modular prompt system is properly configured',
        },
        { status: 500 }
      )
    }

    // 🐛 DEBUG: Log du prompt final généré
    logger.info('========== FINAL PROMPT GENERATED ==========', {
      source: promptResult.source,
      metadata: promptResult.metadata,
      promptLength: promptResult.prompt.length,
      promptPreview: promptResult.prompt.substring(0, 500) + '...',
      fullPrompt: promptResult.prompt,
    })

    logger.info('✅ Modular prompt built', {
      source: promptResult.source,
      styleName: promptResult.metadata?.style_name,
      roomName: promptResult.metadata?.room_name,
      furnitureCount: promptResult.metadata?.furniture_count,
      promptLength: promptResult.prompt.length,
    })

    logger.debug('🎨 Generating image with prompt:', promptResult.prompt.substring(0, 100) + '...')

    const finalPrompt = promptResult.prompt

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

    logger.debug('📡 Calling NanoBanana API...')

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
      logger.debug(`📐 Original image dimensions: ${originalWidth}x${originalHeight} (ratio: ${ratio.toFixed(2)}, using NanoBanana ratio: ${imageSize})`)
    } catch (error) {
      logger.warn('⚠️ Could not detect image dimensions, using default 16:9:', error)
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
        callBackUrl: (process.env.APP_URL || 'http://localhost:3000') + '/api/nanobanana-webhook', // Webhook pour recevoir le résultat
      }),
    }).catch((fetchError) => {
      logger.error('❌ NanoBanana fetch error:', fetchError)
      logger.error('Error details:', {
        message: fetchError.message,
        cause: fetchError.cause,
        code: fetchError.code,
      })
      throw new Error(`Failed to connect to NanoBanana API: ${fetchError.message}`)
    })

    if (!nanoBananaResponse.ok) {
      const errorText = await nanoBananaResponse.text()
      logger.error('❌ NanoBanana API error:', errorText)
      throw new Error(`NanoBanana API failed: ${nanoBananaResponse.status} - ${errorText}`)
    }

    logger.debug('✅ NanoBanana API response received')

    const nanoBananaResult = await nanoBananaResponse.json()
    logger.debug('📦 NanoBanana result:', JSON.stringify(nanoBananaResult, null, 2))

    // 5. Récupérer l'URL de l'image générée ou l'ID de la tâche
    // La structure de réponse peut contenir soit une URL directe, soit un ID de tâche
    const taskId = nanoBananaResult.data?.taskId || nanoBananaResult.taskId
    const requestId = nanoBananaResult.data?.requestId || nanoBananaResult.requestId || nanoBananaResult.data?.id || nanoBananaResult.id
    const generatedImageUrl = nanoBananaResult.data?.imageUrl || nanoBananaResult.imageUrl || nanoBananaResult.url || nanoBananaResult.output?.[0]

    // Si NanoBanana retourne un ID de tâche au lieu d'une image directe
    // on devra implémenter du polling ou utiliser un webhook
    if (!generatedImageUrl && taskId) {
      // Pour l'instant, on laisse l'image en "processing"
      // et on retourne un message indiquant que c'est en cours
      logger.debug('⏳ NanoBanana task queued with ID:', taskId)

      // Sauvegarder le taskId, requestId ET les dimensions originales pour polling ultérieur
      await supabase
        .from('images')
        .update({
          nano_request_id: requestId,
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
      logger.error('❌ No image URL in response:', nanoBananaResult)
      throw new Error('No image URL in NanoBanana response')
    }

    logger.debug('🖼️ Generated image URL:', generatedImageUrl)

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
      logger.error('Storage upload error:', uploadError)
      throw new Error('Failed to upload transformed image')
    }

    // 7. Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(uploadData.path)

    logger.debug('✅ Image uploaded to Supabase Storage:', publicUrl)

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
      logger.error('Error updating image:', updateError)
      throw new Error('Failed to update image status')
    }

    logger.debug('🎉 Image generation completed!')

    return NextResponse.json({
      success: true,
      imageId,
      transformedUrl: publicUrl,
    })
  } catch (error: any) {
    logger.error('Generate image error:', error)

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
        logger.error('Failed to update error status:', e)
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
