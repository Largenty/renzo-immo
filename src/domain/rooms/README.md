# Domain: Rooms

## Vue d'ensemble

Le domaine **Rooms** gère les types de pièces et leurs spécifications (dimensions recommandées, zones fonctionnelles).

## Responsabilités

- Types de pièces (bedroom, living_room, kitchen, etc.)
- Spécifications par type (dimensions, zones)
- Règles métier pour validation des pièces
- Metadata pour l'IA (contexte de génération)

## Structure

```
rooms/
├── models/
│   └── room.ts                  # Room entity
├── ports/
│   └── rooms-repository.ts      # IRoomsRepository
├── services/
│   └── room.service.ts
└── index.ts
```

## Models

### Room

```typescript
interface Room {
  id: string
  name: string
  slug: string                   // 'living_room', 'bedroom', etc.
  displayNameFr: string
  displayNameEn: string
  category: 'residential' | 'commercial'
  minWidth?: number              // Meters
  maxWidth?: number
  minLength?: number
  maxLength?: number
  zones?: Record<string, string> // Functional zones
  isActive: boolean
  createdAt: Date
}
```

**Example zones** (for living_room):
```json
{
  "seating": "Main seating area with sofa",
  "tv": "TV and entertainment zone",
  "storage": "Storage and shelving area"
}
```

## Ports

```typescript
interface IRoomsRepository {
  getAll(): Promise<Room[]>
  getBySlug(slug: string): Promise<Room | null>
  getByCategory(category: string): Promise<Room[]>
}
```

## Common Room Types

### Residential

- `living_room` - Salon
- `bedroom` - Chambre
- `kitchen` - Cuisine
- `bathroom` - Salle de bain
- `dining_room` - Salle à manger
- `office` - Bureau
- `hallway` - Couloir
- `laundry_room` - Buanderie

### Commercial

- `office_space` - Espace bureau
- `reception` - Réception
- `meeting_room` - Salle de réunion
- `retail_space` - Espace commerce

## Usage in AI Generation

Room type influence le prompt de génération:

```typescript
const ROOM_CONTEXTS = {
  living_room: 'spacious living room with comfortable seating, natural light',
  bedroom: 'cozy bedroom with adequate storage, calming atmosphere',
  kitchen: 'functional kitchen with modern appliances, good workflow',
  // ...
}
```

## Database

### Table: `rooms`

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  display_name_fr VARCHAR(100) NOT NULL,
  display_name_en VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL,
  min_width DECIMAL(5,2),
  max_width DECIMAL(5,2),
  min_length DECIMAL(5,2),
  max_length DECIMAL(5,2),
  zones JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Seed Data

**Fichier**: [supabase/MODULAR_002_seed_room_specs.sql](../../../../supabase/MODULAR_002_seed_room_specs.sql)

## API Routes

- `GET /api/rooms` - List all active room types
- `GET /api/rooms/[id]` - Get room details

## UI Components

Room type selector in generation settings:

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select room type" />
  </SelectTrigger>
  <SelectContent>
    {rooms.map(room => (
      <SelectItem key={room.id} value={room.slug}>
        {room.displayNameFr}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Testing

```typescript
describe('RoomsRepository', () => {
  it('should list all active rooms', async () => {
    const rooms = await repository.getAll()
    expect(rooms.every(r => r.isActive)).toBe(true)
  })

  it('should get room by slug', async () => {
    const room = await repository.getBySlug('living_room')
    expect(room?.slug).toBe('living_room')
  })
})
```

---

**Maintainer**: Dev Team
**Last Updated**: 2025-11-04
