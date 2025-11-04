# Domain: Images

## Vue d'ensemble

Le domaine **Images** gère tout ce qui concerne la génération et la transformation d'images via l'IA (NanoBanana API).

## Responsabilités

- Upload d'images originales
- Génération d'images transformées (IA)
- Gestion du status de génération (polling)
- Stockage des images (originales + transformées)
- Métadonnées des transformations
- Historique des générations par projet

## Structure

```
images/
├── models/
│   └── image.ts                 # Image entity
├── ports/
│   ├── ai-generator.ts          # IAIGenerator interface
│   └── image-repository.ts      # IImageRepository interface
├── services/
│   └── manage-images.ts         # Image business logic
├── business-rules/
│   └── (empty)
└── index.ts
```

## Models

### Image

```typescript
interface Image {
  id: string
  projectId: string
  userId: string

  // URLs
  originalUrl: string
  transformedUrl?: string | null

  // Transformation settings
  transformationType: 'depersonalization' | 'staging' | 'renovation' | 'custom'
  roomType?: string
  furnitureStyle?: string
  customPrompt?: string

  // Generation metadata
  prompt: string                    // Full prompt sent to AI
  seed?: number
  strength?: number                 // Transformation strength (0-1)
  nanoRequestId?: string            // NanoBanana task ID

  // Status tracking
  status: 'pending' | 'processing' | 'completed' | 'failed'
  errorMessage?: string | null

  // Dimensions
  width?: number
  height?: number
  roomWidth?: number
  roomLength?: number

  // Timestamps
  createdAt: Date
  updatedAt: Date
  completedAt?: Date | null
}
```

### GenerateImageInput

```typescript
interface GenerateImageInput {
  projectId: string
  originalImageUrl: string
  transformationType: string
  roomType?: string
  furnitureStyle?: string
  customPrompt?: string
  strength?: number
  seed?: number
}
```

### TransformImageResult

```typescript
interface TransformImageResult {
  imageId: string                   // Database image ID
  taskId: string                    // NanoBanana task ID
  status: 'pending' | 'processing'
  estimatedTime?: number            // Seconds
}
```

## Ports (Interfaces)

### IAIGenerator

Interface abstraite pour la génération d'images. Permet de changer de provider (NanoBanana → Replicate, Stability AI, etc.) sans impacter le domaine.

```typescript
interface IAIGenerator {
  /**
   * Generate a transformed image
   */
  generateImage(input: GenerateImageInput): Promise<TransformImageResult>

  /**
   * Check generation status
   */
  checkStatus(imageId: string, taskId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    transformedUrl?: string
    errorMessage?: string
  }>
}
```

### IImageRepository

```typescript
interface IImageRepository {
  // CRUD
  create(data: CreateImageData): Promise<Image>
  getById(id: string): Promise<Image | null>
  update(id: string, data: Partial<Image>): Promise<Image>
  delete(id: string): Promise<void>

  // Queries
  getByProjectId(projectId: string): Promise<Image[]>
  getByStatus(status: ImageStatus): Promise<Image[]>

  // Status updates
  updateStatus(id: string, status: ImageStatus, metadata?: object): Promise<void>
}
```

## Services

### ManageImagesService

**Fichier**: [src/domain/images/services/manage-images.ts](./services/manage-images.ts)

Orchestration de la génération d'images:

```typescript
class ManageImagesService {
  constructor(
    private aiGenerator: IAIGenerator,
    private imageRepository: IImageRepository,
    private storage: IProjectStorage
  ) {}

  async generateImage(input: GenerateImageInput): Promise<TransformImageResult> {
    // 1. Validate input
    validateGenerationInput(input)

    // 2. Create image record (status: pending)
    const image = await this.imageRepository.create({
      projectId: input.projectId,
      originalUrl: input.originalImageUrl,
      transformationType: input.transformationType,
      status: 'pending',
    })

    try {
      // 3. Call AI generator
      const result = await this.aiGenerator.generateImage(input)

      // 4. Update with task ID
      await this.imageRepository.update(image.id, {
        nanoRequestId: result.taskId,
        status: 'processing',
      })

      return {
        imageId: image.id,
        taskId: result.taskId,
        status: 'processing',
      }
    } catch (error) {
      // 5. Mark as failed
      await this.imageRepository.updateStatus(image.id, 'failed', {
        errorMessage: error.message,
      })
      throw error
    }
  }

  async checkGenerationStatus(imageId: string): Promise<ImageStatus> {
    const image = await this.imageRepository.getById(imageId)

    if (!image.nanoRequestId) {
      return { status: image.status }
    }

    // Poll AI provider
    const result = await this.aiGenerator.checkStatus(image.id, image.nanoRequestId)

    // Update if status changed
    if (result.status !== image.status) {
      await this.imageRepository.updateStatus(image.id, result.status, {
        transformedUrl: result.transformedUrl,
        errorMessage: result.errorMessage,
        completedAt: result.status === 'completed' ? new Date() : undefined,
      })
    }

    return result
  }
}
```

## Implémentation

### AI Adapter: NanoBanana

**Fichier**: [src/infrastructure/ai/nanobanana.adapter.ts](../../../infrastructure/ai/nanobanana.adapter.ts)

```typescript
export class NanoBananaAIGenerator implements IAIGenerator {
  async generateImage(input: GenerateImageInput): Promise<TransformImageResult> {
    // 1. Build prompt from template
    const prompt = buildPrompt({
      transformationType: input.transformationType,
      roomType: input.roomType,
      style: input.furnitureStyle,
      customPrompt: input.customPrompt,
    })

    // 2. Upload original image to get presigned URL
    const presignedUrl = await this.getPresignedUrl(input.originalImageUrl)

    // 3. Call NanoBanana API
    const response = await fetch('https://api.nanobanana.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NANOBANANA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: presignedUrl,
        prompt,
        strength: input.strength ?? 0.8,
        seed: input.seed,
        model: 'sdxl-turbo',
      }),
    })

    const data = await response.json()

    return {
      imageId: input.imageId,
      taskId: data.task_id,
      status: 'processing',
      estimatedTime: data.estimated_time,
    }
  }

  async checkStatus(imageId: string, taskId: string): Promise<StatusResult> {
    const response = await fetch(`https://api.nanobanana.com/v1/status/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NANOBANANA_API_KEY}`,
      },
    })

    const data = await response.json()

    if (data.status === 'completed') {
      // Download and upload to our storage
      const transformedUrl = await this.downloadAndStore(data.output_url, imageId)

      return {
        status: 'completed',
        transformedUrl,
      }
    }

    return {
      status: data.status,
      errorMessage: data.error,
    }
  }
}
```

**Client Stub** (prevent server imports in client):

**Fichier**: [src/infrastructure/ai/nanobanana-client.adapter.ts](../../../infrastructure/ai/nanobanana-client.adapter.ts)

```typescript
export class NanoBananaAIGeneratorClient implements IAIGenerator {
  async generateImage(): Promise<never> {
    throw new Error('Direct AI generation from client not allowed. Use API routes.')
  }

  async checkStatus(): Promise<never> {
    throw new Error('Direct status check from client not allowed. Use API routes.')
  }
}
```

### Hooks React Query

**Fichier**: [src/application/images/use-images.ts](../../../application/images/use-images.ts)

```typescript
// Get images for a project
export function useProjectImages(projectId: string) {
  return useQuery({
    queryKey: ['images', 'project', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/images`)
      return response.json()
    },
    enabled: !!projectId,
  })
}

// Generate image
export function useGenerateImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: GenerateImageInput) => {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        body: JSON.stringify(input),
      })
      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate project images
      queryClient.invalidateQueries({
        queryKey: ['images', 'project', variables.projectId],
      })
    },
  })
}

// Poll generation status
export function usePollingGenerationStatus(imageId: string, taskId: string) {
  return useQuery({
    queryKey: ['images', 'status', imageId],
    queryFn: async () => {
      const response = await fetch('/api/check-generation-status', {
        method: 'POST',
        body: JSON.stringify({ imageId, taskId }),
      })
      return response.json()
    },
    enabled: !!imageId && !!taskId,
    refetchInterval: (data) => {
      // Stop polling if completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false
      }
      // Poll every 3 seconds
      return 3000
    },
  })
}

// Delete image
export function useDeleteImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (imageId: string) => {
      await fetch(`/api/images/${imageId}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] })
    },
  })
}
```

## API Routes

### POST /api/generate-image

**Fichier**: [app/api/generate-image/route.ts](../../../../app/api/generate-image/route.ts)

**Middleware**: `withAuth` + `withCredits(2, 'Image generation')`

```typescript
export const POST = withCredits(
  async (request: NextRequest) => {
    const body = await request.json()

    // Validate input
    const input = validateGenerationInput(body)

    // Generate image
    const service = new ManageImagesService(aiGenerator, imageRepo, storage)
    const result = await service.generateImage({
      ...input,
      userId: request.user.id,
    })

    return NextResponse.json(result)
  },
  {
    creditCost: 2,
    operation: 'Image generation',
    getMetadata: (req) => ({
      imageQuality: req.body.quality || 'standard',
      imageCount: 1,
      relatedProjectName: req.body.projectName,
    })
  }
)
```

### POST /api/check-generation-status

**Fichier**: [app/api/check-generation-status/route.ts](../../../../app/api/check-generation-status/route.ts)

**Middleware**: `withAuth`

```typescript
export const POST = withAuth(async (request: NextRequest) => {
  const { imageId, taskId } = await request.json()

  const service = new ManageImagesService(aiGenerator, imageRepo, storage)
  const status = await service.checkGenerationStatus(imageId)

  return NextResponse.json(status)
})
```

## Prompt Engineering

### Templates

**Fichier**: [src/lib/prompts/prompt-templates.ts](../../../lib/prompts/prompt-templates.ts)

```typescript
export const TRANSFORMATION_PROMPTS = {
  depersonalization: `
    Remove all personal items and decorations.
    Keep the room structure and lighting.
    Create a neutral, empty space.
  `,
  staging: `
    Add modern, stylish furniture and decorations.
    Professional real estate photography look.
    Clean, bright, and inviting atmosphere.
  `,
  renovation: `
    Complete interior redesign with new materials.
    Modern architectural elements.
    High-end finishes and fixtures.
  `,
}

export const ROOM_CONTEXTS = {
  living_room: 'spacious living room with natural light',
  bedroom: 'comfortable bedroom with adequate storage',
  kitchen: 'functional kitchen with modern appliances',
  bathroom: 'clean bathroom with good lighting',
  // ...
}

export const STYLE_MODIFIERS = {
  modern: 'clean lines, minimalist, contemporary',
  industrial: 'exposed materials, metal accents, concrete',
  scandinavian: 'light wood, white tones, cozy',
  // ...
}

export function buildPrompt(options: PromptOptions): string {
  const base = TRANSFORMATION_PROMPTS[options.transformationType]
  const room = ROOM_CONTEXTS[options.roomType] || ''
  const style = STYLE_MODIFIERS[options.style] || ''
  const custom = options.customPrompt || ''

  return `${base} ${room} ${style} ${custom}`.trim()
}
```

### Validation & Sanitization

**Fichier**: [src/lib/validators/prompt-sanitizer.ts](../../../lib/validators/prompt-sanitizer.ts)

```typescript
const BLOCKED_WORDS = ['nsfw', 'nude', 'violence', ...]

export function sanitizePrompt(prompt: string): string {
  let sanitized = prompt.trim()

  // Remove blocked words
  BLOCKED_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    sanitized = sanitized.replace(regex, '')
  })

  // Limit length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500)
  }

  return sanitized
}

export function validatePrompt(prompt: string): { valid: boolean, errors: string[] } {
  const errors: string[] = []

  if (!prompt || prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty')
  }

  if (prompt.length > 500) {
    errors.push('Prompt too long (max 500 characters)')
  }

  BLOCKED_WORDS.forEach(word => {
    if (prompt.toLowerCase().includes(word)) {
      errors.push(`Prompt contains blocked word: ${word}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
```

## Image Storage Flow

### Upload Original

```
[User selects file]
     ↓
[Upload to Supabase Storage: /images/original/{projectId}/{filename}]
     ↓
[Get public URL]
     ↓
[Store in Image record]
```

### Generate Transformation

```
[Original image URL]
     ↓
[Generate presigned URL (24h TTL)]
     ↓
[Send to NanoBanana with prompt]
     ↓
[Poll status until completed]
     ↓
[Download transformed image]
     ↓
[Upload to Supabase Storage: /images/transformed/{projectId}/{imageId}.webp]
     ↓
[Update Image record with transformed URL]
     ↓
[Cleanup presigned URLs]
```

## UI Components

### Image Uploader

**Fichier**: [src/presentation/features/upload/components/image-uploader.tsx](../../../presentation/features/upload/components/image-uploader.tsx)

Features:
- Drag & drop
- Preview
- Validation (format, size)
- Progress bar
- Error handling

### Generation Settings

**Fichier**: [src/presentation/features/upload/components/generation-settings.tsx](../../../presentation/features/upload/components/generation-settings.tsx)

Features:
- Transformation type selector
- Room type selector
- Style selector
- Custom prompt input
- Strength slider
- Seed input (advanced)

### Generation Status

Real-time status display with polling:

```tsx
function GenerationStatus({ imageId, taskId }: Props) {
  const { data: status } = usePollingGenerationStatus(imageId, taskId)

  if (status?.status === 'completed') {
    return <Image src={status.transformedUrl} alt="Transformed" />
  }

  if (status?.status === 'failed') {
    return <Error message={status.errorMessage} />
  }

  return <Spinner text="Generating..." />
}
```

## Error Handling

### Common Errors

**Insufficient credits**:
```json
{
  "error": "Insufficient credits",
  "balance": 1,
  "required": 2
}
```

**Invalid image format**:
```json
{
  "error": "Invalid image format",
  "message": "Only JPEG, PNG, and WebP are supported"
}
```

**Generation failed**:
```json
{
  "error": "Generation failed",
  "message": "AI service returned an error",
  "details": "..."
}
```

**Timeout**:
```json
{
  "error": "Generation timeout",
  "message": "Image generation took too long"
}
```

## Performance

### Optimization Strategies

**Image Compression**:
- Original: Max 5MB, resize to 1920x1080 if larger
- Transformed: WebP format, 85% quality

**Polling**:
- Interval: 3 seconds
- Max retries: 100 (5 minutes total)
- Stop on completed/failed

**Caching**:
- React Query cache: 5 minutes
- CDN cache: 1 hour for completed images

## Testing

### Unit Tests

```typescript
describe('buildPrompt', () => {
  it('should build prompt from components', () => {
    const prompt = buildPrompt({
      transformationType: 'staging',
      roomType: 'living_room',
      style: 'modern',
    })

    expect(prompt).toContain('Add modern, stylish furniture')
    expect(prompt).toContain('living room')
    expect(prompt).toContain('minimalist')
  })
})

describe('sanitizePrompt', () => {
  it('should remove blocked words', () => {
    const sanitized = sanitizePrompt('Beautiful room with nsfw content')
    expect(sanitized).not.toContain('nsfw')
  })

  it('should trim length', () => {
    const long = 'a'.repeat(600)
    const sanitized = sanitizePrompt(long)
    expect(sanitized.length).toBe(500)
  })
})
```

### Integration Tests

```typescript
describe('POST /api/generate-image', () => {
  it('should generate image with valid input', async () => {
    const response = await POST({
      projectId: 'proj-123',
      originalImageUrl: 'https://...',
      transformationType: 'staging',
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('imageId')
    expect(data).toHaveProperty('taskId')
  })

  it('should reject insufficient credits', async () => {
    // Mock user with 0 credits
    const response = await POST({ ... })
    expect(response.status).toBe(402) // Payment Required
  })
})
```

## Monitoring

### Metrics

- Generation requests per minute
- Success rate
- Average generation time
- Failed generations (with reasons)
- Credit consumption per image

### Alerts

- 🚨 Generation failure rate > 10%
- ⚠️ Average generation time > 60s
- ⚠️ NanoBanana API errors
- 📊 Daily generation volume

## Troubleshooting

### Images stuck in "processing"

**Cause**: Polling stopped or NanoBanana API issue

**Solution**:
1. Check NanoBanana API status
2. Manually check status via API
3. Implement timeout (mark as failed after 5 minutes)

### Transformed images not loading

**Cause**: Storage URL expired or upload failed

**Solution**:
1. Verify Supabase Storage bucket permissions
2. Check upload logs
3. Regenerate image if needed

### Poor quality results

**Cause**: Prompt not specific enough or wrong strength

**Solution**:
1. Improve prompt templates
2. Adjust strength parameter (0.7-0.9 recommended)
3. Add more context to custom prompts

## Resources

- [NanoBanana API Docs](https://docs.nanobanana.com)
- [SDXL Model Card](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

**Maintainer**: Dev Team
**Last Updated**: 2025-11-04
