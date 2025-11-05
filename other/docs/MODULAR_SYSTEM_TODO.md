# 🎯 Système Modulaire - Ce qu'il reste à faire

## ✅ Ce qui est FAIT

### Base de données (5 migrations SQL)

1. ✅ **MODULAR_001_core_tables.sql** - Tables de base
   - room_specifications
   - style_palettes
   - furniture_catalog
   - style_furniture_variants
   - room_furniture_presets

2. ✅ **MODULAR_002_seed_room_specs.sql** - 10 pièces configurées
   - salon, chambre, cuisine, salle_a_manger, salle_de_bain
   - wc, bureau, entree, terrasse, balcon

3. ✅ **MODULAR_003_seed_furniture_catalog.sql** - 23 meubles catalogués
   - Salon : canapé, fauteuil, table basse, lampadaire, plantes, tapis, tableaux
   - Chambre : lit, tables de chevet, lampes
   - Cuisine : tabourets de bar
   - Bureau : bureau, chaise, étagère
   - Salle de bain : meuble vasque, miroir
   - Salle à manger : table, chaises, suspension
   - Terrasse/Balcon : salon de jardin, plantes

4. ✅ **MODULAR_004_home_staging_styles.sql** - 3 styles complets
   - Home Staging Moderne (palette + ~10 variantes de meubles)
   - Home Staging Scandinave (palette + ~10 variantes de meubles)
   - Home Staging Industriel (palette + ~10 variantes de meubles)

5. ✅ **MODULAR_005_default_presets.sql** - 12 presets par défaut
   - 3 styles × 4 pièces (salon, chambre, bureau, salle à manger)

### Code TypeScript

1. ✅ **src/lib/prompts/prompt-builder.ts** - PromptBuilder class
   - buildPrompt() - Construction modulaire
   - getDefaultPreset() - Récupère preset par défaut
   - Fallback sur prompt_template si modulaire échoue
   - Logging complet

### Documentation

1. ✅ **MODULAR_PROMPTS_GUIDE.md** - Guide technique complet
2. ✅ **MODULAR_SYSTEM_TODO.md** - Ce fichier

---

## ⏳ Ce qu'il RESTE À FAIRE

### 1. Appliquer les migrations SQL (30 min)

**Via Supabase Dashboard** :

```bash
# Aller sur supabase.com → Ton projet → SQL Editor

# Copier/coller dans l'ordre :
1. MODULAR_001_core_tables.sql
2. MODULAR_002_seed_room_specs.sql
3. MODULAR_003_seed_furniture_catalog.sql
4. MODULAR_004_home_staging_styles.sql
5. MODULAR_005_default_presets.sql

# Cliquer "Run" pour chaque
```

**Vérification** :
```sql
-- Compter les données insérées
SELECT
  (SELECT COUNT(*) FROM room_specifications) as rooms,
  (SELECT COUNT(*) FROM style_palettes) as palettes,
  (SELECT COUNT(*) FROM furniture_catalog) as furniture,
  (SELECT COUNT(*) FROM style_furniture_variants) as variants,
  (SELECT COUNT(*) FROM room_furniture_presets) as presets;

-- Devrait retourner : 10, 3, 23, ~30, 12
```

---

### 2. Créer l'UI de sélection de meubles (2-3h)

**Composant nécessaire** : `src/components/modals/generate-image-modal.tsx`

**Features** :

1. **Sélecteur de style** (dropdown)
   - Home Staging Moderne
   - Home Staging Scandinave
   - Home Staging Industriel

2. **Sélecteur de type de pièce** (dropdown)
   - Salon, Chambre, Cuisine, Bureau, etc.

3. **Toggle "Avec meubles"**
   - Si OUI → Afficher sélection de meubles
   - Si NON → Passer furnitureIds = []

4. **Liste de meubles à cocher**
   - Charger depuis API le preset par défaut
   - Afficher avec descriptions adaptées au style
   - Checkbox par meuble
   - Séparer "Essentiels" et "Optionnels"

5. **Bouton "Utiliser preset par défaut"**
   - Recharge la sélection système

6. **Bouton "Sauvegarder ma sélection"** (optionnel)
   - Permet user de save son preset custom

7. **Preview du prompt** (optionnel)
   - Bouton "Prévisualiser" qui appelle buildPrompt()
   - Affiche le prompt final dans un dialog

**API endpoints à créer** :

```typescript
// GET /api/furniture/preset
// Query: styleId, roomType
// Returns: { furniture_ids: [...], furniture_details: [...] }

// GET /api/furniture/available
// Query: styleId, roomType
// Returns: { furniture: [...] } (tous les meubles dispos pour cette combo)
```

---

### 3. Mettre à jour l'API de génération (1h)

**Fichier** : `app/api/generate-image/route.ts`

**Changement** :

```typescript
// AVANT (ancien système)
import { selectPrompt } from '@/lib/prompts/prompt-selector';

const promptResult = await selectPrompt({
  transformationTypeId,
  roomType,
  withFurniture,
  customPrompt
});

// APRÈS (système modulaire)
import { buildPrompt } from '@/lib/prompts/prompt-builder';

const promptResult = await buildPrompt({
  transformationTypeId,
  roomType: normalizedRoomType,
  furnitureIds: body.furnitureIds || [], // ← Nouveau paramètre
  customPrompt
});
```

**Schéma de validation à mettre à jour** :

```typescript
// src/lib/validators/api-schemas.ts

export const generateImageRequestSchema = z.object({
  imageId: z.string().uuid(),
  furnitureIds: z.array(z.string().uuid()).optional(), // ← Ajouter
});
```

**Migration des données existantes** :

Table `images` → Ajouter colonne `furniture_ids` :

```sql
ALTER TABLE images
  ADD COLUMN furniture_ids UUID[] NULL DEFAULT '{}';

COMMENT ON COLUMN images.furniture_ids IS 'IDs des meubles sélectionnés pour cette transformation';
```

---

### 4. Ajouter les autres styles (2-3h)

**Styles manquants** :

1. **Dépersonnalisation** (sans meubles)
   - Pas besoin de furniture_variants
   - Juste room_specs + style_palette

2. **Dépersonnalisation Premium**
   - Idem mais qualité supérieure

3. **Rénovation Luxe**
   - Pas de meubles (juste finitions)
   - Style_palette avec matériaux premium

4. **Rénovation Contemporaine**
   - Pas de meubles
   - Style_palette moderne

**Fichier à créer** : `MODULAR_006_renovation_depersonalization_styles.sql`

---

### 5. Testing (1h)

**Tests à faire** :

1. **Test construction prompt** :
   ```typescript
   const result = await buildPrompt({
     transformationTypeId: 'uuid-moderne',
     roomType: 'salon',
     furnitureIds: ['uuid-canapé', 'uuid-table-basse']
   });
   console.log(result.prompt);
   // Vérifier que le prompt contient bien les descriptions des meubles
   ```

2. **Test preset par défaut** :
   ```typescript
   const furnitureIds = await getDefaultPreset('uuid-moderne', 'salon');
   console.log(furnitureIds);
   // Vérifier qu'on récupère bien 5 UUIDs
   ```

3. **Test génération image complète** :
   - Upload une image
   - Sélectionne style + room + meubles
   - Lance génération
   - Vérifie que NanoBanana reçoit le bon prompt

4. **Test fallback** :
   - Essayer avec un style qui n'a pas de palette
   - Vérifier que ça fallback sur prompt_template

---

## 📋 Checklist finale

Avant de considérer le système prêt :

- [ ] 5 migrations SQL appliquées
- [ ] Vérification : 10 rooms + 3 palettes + 23 meubles + ~30 variants + 12 presets
- [ ] Test : buildPrompt() retourne un prompt valide
- [ ] Test : getDefaultPreset() retourne des UUIDs
- [ ] UI modale créée avec sélection de meubles
- [ ] API endpoints /api/furniture/* créés
- [ ] API /api/generate-image mise à jour pour accepter furnitureIds
- [ ] Colonne images.furniture_ids ajoutée
- [ ] Test génération complète E2E
- [ ] Styles Dépersonnalisation et Rénovation ajoutés (optionnel mais recommandé)

---

## 🎯 Ordre recommandé

**Phase 1 (aujourd'hui)** :
1. Applique les 5 migrations SQL (30 min)
2. Test le PromptBuilder en TypeScript (15 min)
3. Crée l'UI modale basique (2h)

**Phase 2 (demain)** :
1. Crée les API endpoints furniture (1h)
2. Connecte l'UI à l'API (1h)
3. Met à jour l'API generate-image (1h)
4. Test E2E (30 min)

**Phase 3 (optionnel)** :
1. Ajoute les styles Dépersonnalisation/Rénovation (2h)
2. Améliore l'UI (preview, save presets, etc.)
3. Analytics sur les meubles utilisés

---

## ❓ Questions / Décisions à prendre

1. **UI** : Veux-tu un drawer (panneau latéral) ou une modale pour la sélection de meubles ?

2. **Presets user** : Veux-tu que les users puissent sauvegarder leurs sélections custom maintenant ou plus tard ?

3. **Preview** : Veux-tu un bouton "Prévisualiser le prompt" avant de générer ?

4. **Migration des images existantes** : Que faire des images déjà générées ? (Mettre furniture_ids = [] ?)

5. **Fallback** : Garder l'ancien système (transformation_prompts) en parallèle ou tout migrer vers modulaire ?

---

## 🚀 Prêt à continuer ?

Dis-moi par où tu veux commencer :

**A)** Appliquons les migrations SQL ensemble et testons le PromptBuilder

**B)** Je commence à créer l'UI de sélection de meubles

**C)** Je fais d'abord les API endpoints pour charger les meubles

**D)** Je crée tout le reste (UI + API + tests) en une fois

**Choix recommandé : A** (valider que la base fonctionne avant de faire l'UI)
