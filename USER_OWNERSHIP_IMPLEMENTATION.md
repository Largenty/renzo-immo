# 🔓 User Ownership pour Furniture & Rooms

**Date:** 2025-10-30
**Objectif:** Permettre aux users de créer leurs propres meubles/pièces tout en gardant les meubles/pièces par défaut non modifiables

---

## 📋 Résumé

Comme les **styles**, les **meubles** et **pièces** fonctionnent maintenant en 2 catégories :

1. **Par défaut** (`user_id = NULL`) :
   - Créés par les admins
   - Visibles par tous
   - Modifiables/supprimables uniquement par les admins

2. **Personnalisés** (`user_id = UUID`) :
   - Créés par les users
   - Visibles uniquement par leur créateur
   - Modifiables/supprimables par leur créateur

---

## ✅ CE QUI A ÉTÉ FAIT

### 1. Migration SQL créée

**Fichier:** `/supabase/migrations/20251030_add_user_ownership_to_furniture_rooms.sql`

**Modifications:**
```sql
-- Ajout de la colonne user_id (nullable)
ALTER TABLE furniture_catalog ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE room_specifications ADD COLUMN user_id UUID REFERENCES users(id);

-- Policies RLS mises à jour:
-- - SELECT: user_id IS NULL OR user_id = auth.uid()
-- - INSERT: user_id = auth.uid()
-- - UPDATE: user_id = auth.uid()
-- - DELETE: user_id = auth.uid()
```

### 2. Routes Furniture mises à jour

**✅ POST `/api/furniture`**
- Admin → `user_id = NULL` (meuble par défaut)
- User → `user_id = user.id` (meuble personnel)
- Audit log seulement si meuble par défaut

**✅ PATCH `/api/furniture/[id]`**
- Vérifie `user_id` du meuble existant
- Si `NULL` → check admin requis
- Si `user.id` → user peut modifier
- Si autre user → 403 Forbidden

**✅ DELETE `/api/furniture/[id]`**
- Même logique que PATCH

### 3. Routes Rooms partiellement mises à jour

**✅ POST `/api/rooms`**
- Même logique que furniture POST

**⚠️ PATCH `/api/rooms/[id]` - À FAIRE**
**⚠️ DELETE `/api/rooms/[id]` - À FAIRE**

---

## 🔧 CE QU'IL RESTE À FAIRE

### PATCH `/api/rooms/[id]`

Dans `/app/api/rooms/[id]/route.ts`, remplacer la fonction PATCH par:

```typescript
/**
 * PATCH /api/rooms/[id]
 * Mettre à jour une pièce
 *
 * 🔒 SÉCURITÉ:
 * - Users peuvent modifier leurs propres pièces (user_id = their ID)
 * - Admins peuvent modifier les pièces par défaut (user_id = NULL)
 * - Les pièces par défaut ne peuvent PAS être modifiées par les users
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const roomId = params.id

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que la pièce existe et récupérer son user_id
    const { data: existingRoom, error: fetchError } = await supabase
      .from('room_specifications')
      .select('user_id')
      .eq('id', roomId)
      .single()

    if (fetchError || !existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Vérifier les permissions
    const isDefaultRoom = existingRoom.user_id === null
    const isOwnRoom = existingRoom.user_id === user.id

    if (isDefaultRoom) {
      // Pièce par défaut: vérifier droits admin
      const adminCheck = await requireAdmin(supabase, user.id)
      if (!adminCheck.isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot modify default room' },
          { status: 403 }
        )
      }
    } else if (!isOwnRoom) {
      // Pièce d'un autre user: interdit
      return NextResponse.json(
        { error: 'Forbidden: Cannot modify room of another user' },
        { status: 403 }
      )
    }

    // Parser et valider le body
    const body = await request.json()
    const validationResult = updateRoomInputSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const input: UpdateRoomInput = validationResult.data

    // Construire l'objet de mise à jour
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (input.display_name_fr !== undefined) updateData.display_name_fr = input.display_name_fr
    if (input.display_name_en !== undefined) updateData.display_name_en = input.display_name_en
    if (input.constraints_text !== undefined) updateData.constraints_text = input.constraints_text
    if (input.typical_area_min !== undefined) updateData.typical_area_min = input.typical_area_min
    if (input.typical_area_max !== undefined) updateData.typical_area_max = input.typical_area_max
    if (input.zones !== undefined) updateData.zones = input.zones
    if (input.description !== undefined) updateData.description = input.description
    if (input.icon_name !== undefined) updateData.icon_name = input.icon_name
    if (input.is_active !== undefined) updateData.is_active = input.is_active

    // Mettre à jour en base
    const { data: room, error } = await supabase
      .from('room_specifications')
      .update(updateData)
      .eq('id', roomId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }
      logger.error('[PATCH /api/rooms/[id]] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to update room' },
        { status: 500 }
      )
    }

    const roomSpec: RoomSpecification = {
      id: room.id,
      room_type: room.room_type,
      display_name_fr: room.display_name_fr,
      display_name_en: room.display_name_en,
      constraints_text: room.constraints_text,
      typical_area_min: room.typical_area_min,
      typical_area_max: room.typical_area_max,
      zones: room.zones,
      description: room.description,
      icon_name: room.icon_name,
      is_active: room.is_active,
      created_at: new Date(room.created_at),
      updated_at: new Date(room.updated_at),
    }

    logger.info('[PATCH /api/rooms/[id]] Room updated', {
      userId: user.id,
      roomId: roomSpec.id,
    })

    // 📊 AUDIT LOG: Enregistrer l'action admin (seulement si c'est une pièce par défaut)
    if (isDefaultRoom) {
      await logAdminAction({
        adminId: user.id,
        action: 'update_room',
        resourceType: 'room',
        resourceId: roomSpec.id,
        metadata: {
          updated_fields: input,
          room_type: roomSpec.room_type,
          is_default: true,
        },
        request,
      })
    }

    return NextResponse.json({ room: roomSpec })
  } catch (error) {
    logger.error('[PATCH /api/rooms/[id]] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### DELETE `/api/rooms/[id]`

Dans `/app/api/rooms/[id]/route.ts`, remplacer la fonction DELETE par:

```typescript
/**
 * DELETE /api/rooms/[id]
 * Supprimer une pièce
 *
 * 🔒 SÉCURITÉ:
 * - Users peuvent supprimer leurs propres pièces (user_id = their ID)
 * - Admins peuvent supprimer les pièces par défaut (user_id = NULL)
 * - Les pièces par défaut ne peuvent PAS être supprimées par les users
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const roomId = params.id

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que la pièce existe et récupérer son user_id
    const { data: existingRoom, error: fetchError } = await supabase
      .from('room_specifications')
      .select('user_id')
      .eq('id', roomId)
      .single()

    if (fetchError || !existingRoom) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Vérifier les permissions (même logique que PATCH)
    const isDefaultRoom = existingRoom.user_id === null
    const isOwnRoom = existingRoom.user_id === user.id

    if (isDefaultRoom) {
      // Pièce par défaut: vérifier droits admin
      const adminCheck = await requireAdmin(supabase, user.id)
      if (!adminCheck.isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden: Cannot delete default room' },
          { status: 403 }
        )
      }
    } else if (!isOwnRoom) {
      // Pièce d'un autre user: interdit
      return NextResponse.json(
        { error: 'Forbidden: Cannot delete room of another user' },
        { status: 403 }
      )
    }

    // Supprimer la pièce (soft delete)
    const { error } = await supabase
      .from('room_specifications')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', roomId)

    if (error) {
      logger.error('[DELETE /api/rooms/[id]] Database error', { error })
      return NextResponse.json(
        { error: 'Failed to delete room' },
        { status: 500 }
      )
    }

    logger.info('[DELETE /api/rooms/[id]] Room deleted', {
      userId: user.id,
      roomId,
    })

    // 📊 AUDIT LOG: Enregistrer l'action admin (seulement si c'est une pièce par défaut)
    if (isDefaultRoom) {
      await logAdminAction({
        adminId: user.id,
        action: 'delete_room',
        resourceType: 'room',
        resourceId: roomId,
        metadata: { is_default: true },
        request,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('[DELETE /api/rooms/[id]] Unexpected error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 📊 CHECKLIST

### Migrations SQL
- [x] Créer migration pour `furniture_catalog.user_id`
- [x] Créer migration pour `room_specifications.user_id`
- [ ] **À FAIRE:** Appliquer via Supabase Dashboard SQL Editor

### API Routes Furniture
- [x] POST: Ajout `user_id` + audit log conditionnel
- [x] PATCH: Check ownership + admin check si défaut
- [x] DELETE: Check ownership + admin check si défaut

### API Routes Rooms
- [x] POST: Ajout `user_id` + audit log conditionnel
- [ ] **À FAIRE:** PATCH: Check ownership + admin check si défaut
- [ ] **À FAIRE:** DELETE: Check ownership + admin check si défaut

---

## 🧪 Tests à effectuer

### Test 1: User crée son propre meuble
```bash
curl -X POST http://localhost:3000/api/furniture \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"name_fr":"Mon canapé","category":"seating","room_types":["salon"]}'

# Attendu: 201 Created avec user_id = user ID dans la DB
```

### Test 2: Admin crée un meuble par défaut
```bash
curl -X POST http://localhost:3000/api/furniture \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"name_fr":"Canapé standard","category":"seating","room_types":["salon"]}'

# Attendu: 201 Created avec user_id = NULL dans la DB
# Audit log créé
```

### Test 3: User essaye de modifier un meuble par défaut
```bash
curl -X PATCH http://localhost:3000/api/furniture/uuid-default-furniture \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"name_fr":"Nouveau nom"}'

# Attendu: 403 Forbidden "Cannot modify default furniture"
```

### Test 4: User modifie son propre meuble
```bash
curl -X PATCH http://localhost:3000/api/furniture/uuid-own-furniture \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"name_fr":"Nouveau nom"}'

# Attendu: 200 OK
# Pas d'audit log (meuble perso)
```

### Test 5: Admin modifie un meuble par défaut
```bash
curl -X PATCH http://localhost:3000/api/furniture/uuid-default-furniture \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"name_fr":"Nouveau nom"}'

# Attendu: 200 OK
# Audit log créé
```

### Test 6: User essaye de modifier le meuble d'un autre user
```bash
curl -X PATCH http://localhost:3000/api/furniture/uuid-other-user-furniture \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"name_fr":"Hack"}'

# Attendu: 403 Forbidden "Cannot modify furniture of another user"
```

### Test 7: Vérifier la liste des meubles
```bash
curl http://localhost:3000/api/furniture \
  -H "Authorization: Bearer USER_TOKEN"

# Attendu: Meubles par défaut (user_id = NULL) + meubles du user
# PAS les meubles des autres users
```

---

## 🎯 Comportement Final

| Action | Admin sur défaut | Admin sur perso | User sur défaut | User sur perso | User sur autre user |
|--------|------------------|-----------------|-----------------|----------------|---------------------|
| **CREATE** | user_id = NULL ✅ | user_id = admin.id ✅ | user_id = user.id ✅ | user_id = user.id ✅ | N/A |
| **READ** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **UPDATE** | ✅ + Audit | ✅ | ❌ 403 | ✅ | ❌ 403 |
| **DELETE** | ✅ + Audit | ✅ | ❌ 403 | ✅ | ❌ 403 |

---

## 📚 Avantages

✅ **Flexibilité:** Users peuvent créer des meubles/pièces personnalisés
✅ **Qualité:** Admins maintiennent un catalogue par défaut de qualité
✅ **Isolation:** Un user ne voit pas les créations des autres
✅ **Sécurité:** Meubles par défaut protégés contre modifications non autorisées
✅ **Audit:** Toutes les modifications admin sont loggées

---

**Dernière mise à jour:** 2025-10-30
