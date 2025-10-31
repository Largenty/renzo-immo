# 🚨 URGENT: Fix transformation_type Column Issue

## Problème

L'erreur: `Could not find the 'transformation_type_id' column of 'images' in the schema cache`

## Cause

La base de données Supabase en production utilise probablement **`transformation_type` (string)** au lieu de **`transformation_type_id` (UUID)**.

## Solutions possibles

### Option 1: Vérifier la vraie structure de la table

Allez dans Supabase Dashboard → SQL Editor et exécutez:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'images'
AND column_name LIKE '%transformation%';
```

### Option 2a: Si la colonne s'appelle `transformation_type`

Reverter les changements pour utiliser `transformation_type` au lieu de `transformation_type_id`:

```typescript
// Dans images-repository.supabase.ts
transformation_type: string  // Au lieu de transformation_type_id
```

###  Option 2b: Si la colonne s'appelle `transformation_type_id`

Mais que Supabase n'a pas rafraîchi son cache, forcer un reload:

1. Aller dans Supabase Dashboard
2. Settings → Database → Reset schema cache
3. OU redémarrer PostgREST

### Option 3: Migration manuelle

Si la colonne n'existe pas du tout, créer via SQL Editor:

```sql
-- Si la table existe mais sans la bonne colonne
ALTER TABLE images
ADD COLUMN transformation_type_id UUID REFERENCES transformation_types(id);

-- Migrer les données si nécessaire
-- (dépend de votre cas)
```

## Action immédiate

Je recommande **Option 1** en premier pour voir quelle est la vraie structure.
