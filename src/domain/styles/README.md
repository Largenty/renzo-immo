# Domain: Styles

## Vue d'ensemble

Le domaine **Styles** gère les types de transformations, styles de mobilier, et présets de génération.

## Responsabilités

- Types de transformations (staging, renovation, etc.)
- Styles de mobilier (modern, industrial, etc.)
- Palettes de couleurs et textures
- Présets de transformation
- Styles personnalisés utilisateur

## Structure

```
styles/
├── models/
│   ├── transformation-type.ts   # Transformation types
│   ├── custom-style.ts          # User custom styles
│   ├── room-specification.ts    # Room specs
│   └── furniture.ts             # Furniture catalog
├── ports/
│   └── styles-repository.ts     # IStylesRepository
└── index.ts
```

## Models

### TransformationType

```typescript
interface TransformationType {
  id: string
  slug: string                      // 'staging', 'renovation', etc.
  displayNameFr: string
  displayNameEn: string
  description?: string
  category: 'depersonalization' | 'staging' | 'renovation' | 'custom'
  iconName?: string
  basePromptTemplate?: string       // AI prompt template
  allowFurnitureToggle: boolean
  allowRoomTypeSelection: boolean
  creditCost: number                // Base cost
  isSystem: boolean                 // Can't be deleted
  isActive: boolean
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}
```

### CustomStyle

```typescript
interface CustomStyle {
  id: string
  userId: string
  name: string
  baseTransformationType: string    // References TransformationType
  customPrompt: string
  furnitureStyle?: string
  colorPalette?: string[]
  isDefault: boolean
  createdAt: Date
}
```

## Transformation Types

### Built-in Types

**Depersonalization** (`depersonalization`):
- Remove personal items
- Keep structure
- Neutral appearance
- Cost: 2 credits

**Home Staging** (`staging`):
- Add modern furniture
- Professional look
- Optimized for sales
- Cost: 2 credits

**Renovation** (`renovation`):
- Complete redesign
- New materials
- Structural changes
- Cost: 3 credits

**Custom** (`custom`):
- User-defined prompt
- Maximum flexibility
- Cost: 4 credits

## Furniture Styles

Catalog of furniture styles for staging:

- `modern` - Clean lines, minimalist
- `industrial` - Exposed materials, metal
- `scandinavian` - Light wood, white tones
- `bohemian` - Colorful, eclectic
- `contemporary` - Latest trends
- `classic` - Timeless elegance
- `rustic` - Natural materials
- `minimalist` - Essential only

## Color Palettes

**Neutral**:
- #FFFFFF White
- #F5F5F5 Off-white
- #D3D3D3 Light gray
- #A9A9A9 Dark gray

**Warm**:
- #FFF5E1 Cream
- #FFE4B5 Moccasin
- #DEB887 Burlywood
- #D2691E Chocolate

**Cool**:
- #E0F2F1 Pale cyan
- #B2DFDB Light teal
- #80CBC4 Medium teal
- #4DB6AC Dark teal

## Ports

```typescript
interface IStylesRepository {
  // Transformation types
  getAllTransformationTypes(): Promise<TransformationType[]>
  getTransformationTypeBySlug(slug: string): Promise<TransformationType | null>

  // Custom styles
  getUserCustomStyles(userId: string): Promise<CustomStyle[]>
  createCustomStyle(data: CreateCustomStyleData): Promise<CustomStyle>
  updateCustomStyle(id: string, data: Partial<CustomStyle>): Promise<CustomStyle>
  deleteCustomStyle(id: string): Promise<void>
}
```

## Implementation

### Hooks

**Fichier**: [src/application/styles/use-styles.ts](../../../application/styles/use-styles.ts)

```typescript
// Get all transformation types
const { data: types } = useAllTransformationTypes()

// Get user custom styles
const { data: customStyles } = useCustomStyles()

// Create custom style
const create = useCreateCustomStyle()
create.mutate({
  name: 'My Style',
  baseTransformationType: 'staging',
  customPrompt: 'Add plants and natural light',
  furnitureStyle: 'scandinavian',
})

// Update custom style
const update = useUpdateCustomStyle()
update.mutate({ id, name, customPrompt })

// Delete custom style
const remove = useDeleteCustomStyle()
remove.mutate(styleId)
```

## Prompt Templates

**Fichier**: [src/lib/prompts/prompt-templates.ts](../../../lib/prompts/prompt-templates.ts)

```typescript
export const TRANSFORMATION_PROMPTS = {
  depersonalization: `
    Remove all personal items, photos, decorations, and clutter.
    Keep the room structure, walls, floors, and ceiling intact.
    Maintain original lighting and windows.
    Create a clean, neutral, empty space ready for staging.
  `,

  staging: `
    Add professional, stylish furniture and decorations.
    Create an inviting, aspirational atmosphere.
    Use modern, tasteful pieces that appeal to buyers.
    Ensure good composition and visual balance.
    Professional real estate photography quality.
  `,

  renovation: `
    Complete interior redesign with new materials and finishes.
    Modern architectural elements and layout optimization.
    High-end fixtures, lighting, and built-ins.
    Transform the space while maintaining structural integrity.
  `,
}

export const STYLE_MODIFIERS = {
  modern: 'clean lines, minimalist furniture, neutral colors, contemporary design',
  industrial: 'exposed brick, metal accents, concrete, Edison bulbs, raw materials',
  scandinavian: 'light wood, white walls, hygge atmosphere, natural textures',
  // ...
}

export function buildPrompt({
  transformationType,
  roomType,
  furnitureStyle,
  customPrompt,
}: PromptOptions): string {
  const base = TRANSFORMATION_PROMPTS[transformationType]
  const room = ROOM_CONTEXTS[roomType] || ''
  const style = furnitureStyle ? STYLE_MODIFIERS[furnitureStyle] : ''
  const custom = customPrompt || ''

  return `${base} ${room} ${style} ${custom}`.trim()
}
```

## Database

### Table: `transformation_types`

```sql
CREATE TABLE transformation_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  display_name_fr VARCHAR(100) NOT NULL,
  display_name_en VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(30) NOT NULL,
  icon_name VARCHAR(50),
  base_prompt_template TEXT,
  allow_furniture_toggle BOOLEAN DEFAULT false,
  allow_room_type_selection BOOLEAN DEFAULT true,
  credit_cost INTEGER NOT NULL DEFAULT 2,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `custom_styles`

```sql
CREATE TABLE custom_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  base_transformation_type VARCHAR(50) REFERENCES transformation_types(slug),
  custom_prompt TEXT NOT NULL,
  furniture_style VARCHAR(50),
  color_palette JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## UI Components

**Transformation Type Selector**:

```tsx
<RadioGroup value={transformationType} onValueChange={setTransformationType}>
  {types.map(type => (
    <RadioGroupItem key={type.id} value={type.slug}>
      <Icon name={type.iconName} />
      <div>
        <h4>{type.displayNameFr}</h4>
        <p>{type.description}</p>
        <Badge>{type.creditCost} credits</Badge>
      </div>
    </RadioGroupItem>
  ))}
</RadioGroup>
```

**Furniture Style Selector**:

```tsx
<Select value={furnitureStyle} onValueChange={setFurnitureStyle}>
  <SelectTrigger>
    <SelectValue placeholder="Select furniture style" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="modern">Modern</SelectItem>
    <SelectItem value="industrial">Industrial</SelectItem>
    <SelectItem value="scandinavian">Scandinavian</SelectItem>
    {/* ... */}
  </SelectContent>
</Select>
```

## Business Rules

- Custom styles limited to 20 per user (free tier)
- Custom prompt max 500 characters
- System transformation types can't be modified
- Credit cost must be ≥ 1
- Transformation type slug must be unique

## Testing

```typescript
describe('buildPrompt', () => {
  it('should build complete prompt', () => {
    const prompt = buildPrompt({
      transformationType: 'staging',
      roomType: 'living_room',
      furnitureStyle: 'modern',
      customPrompt: 'Add plants',
    })

    expect(prompt).toContain('professional')
    expect(prompt).toContain('living room')
    expect(prompt).toContain('minimalist')
    expect(prompt).toContain('plants')
  })
})
```

---

**Maintainer**: Dev Team
**Last Updated**: 2025-11-04
