# Archive - Anciennes Migrations de Prompts

**Date d'archivage** : 30 janvier 2025

## Pourquoi archivé ?

Ces migrations faisaient partie de l'ancien système de prompts (table `transformation_prompts` avec prompts hardcodés).

Elles ont été remplacées par le **Système Modulaire** (`MODULAR_001` à `MODULAR_005`).

## Fichiers archivés

### Migrations Home Staging
- `20250129_home_staging_industriel.sql`
- `20250129_home_staging_moderne_professional.sql`
- `20250129_home_staging_scandinave.sql`

### Migrations Rénovation
- `20250129_renovation_contemporaine.sql`
- `20250129_renovation_luxe.sql`

### Fixes de prompts
- `20250129_fix_depersonalization_prompt_correct_table.sql`
- `20250129_update_depersonalization_prompt.sql`
- `20250129_update_depersonalization_prompt_v2.sql`
- `20250129_check_before_transformation_type_fix.sql`

## ⚠️ Important

**NE PAS APPLIQUER CES MIGRATIONS**

Ces fichiers sont conservés uniquement pour référence. Le nouveau système modulaire rend ces migrations obsolètes.

## Système actuel

Les migrations actives se trouvent dans :
- `supabase/migrations/MODULAR_001_core_tables.sql`
- `supabase/migrations/MODULAR_002_seed_room_specs.sql`
- `supabase/migrations/MODULAR_003_seed_furniture_catalog.sql`
- `supabase/migrations/MODULAR_004_home_staging_styles.sql`
- `supabase/migrations/MODULAR_005_default_presets.sql`
