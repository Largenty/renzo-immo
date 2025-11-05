# 🎨 Système de Prompts Modulaires - Guide Complet

## 🎯 Vue d'ensemble

Le système modulaire permet de construire des prompts IA **dynamiquement** à partir de composants réutilisables :

- **Style Palettes** → Couleurs, matériaux, ambiance
- **Room Specifications** → Contraintes architecturales par pièce
- **Furniture Catalog** → Catalogue de meubles
- **Style Furniture Variants** → Comment chaque meuble se décline par style
- **Room Presets** → Sélections pré-configurées de meubles

### Avant vs Après

| ❌ Ancien système | ✅ Système modulaire |
|-------------------|----------------------|
| 55 prompts hardcodés | Composants réutilisables |
| Modifier = changer 55 prompts | Modifier = changer un composant |
| Pas de choix user | User choisit ses meubles |
| Fixed | Infiniment flexible |

---

## 📊 Architecture de la base de données

```
transformation_types (styles de base)
    ↓
    ├─→ style_palettes (couleurs, matériaux par style)
    │
    ├─→ room_specifications (contraintes par type de pièce)
    │
    ├─→ furniture_catalog (catalogue global de meubles)
    │       ↓
    │       └─→ style_furniture_variants (variantes par style)
    │
    └─→ room_furniture_presets (sélections pré-configurées)
```

---

## 🗄️ Tables créées

### 1. `room_specifications`

Spécifications et contraintes par type de pièce.

**Exemple** :
```json
{
  "room_type": "cuisine",
  "display_name_fr": "Cuisine",
  "display_name_en": "Kitchen",
  "constraints_text": "CRITICAL: Keep EXACT cabinet layout positions...",
  "typical_area_min": 5.0,
  "typical_area_max": 20.0,
  "zones": {
    "work_triangle": "Sink, stove, fridge efficient triangle",
    "prep_area": "Countertop workspace"
  }
}
```

**10 pièces configurées** : salon, chambre, cuisine, salle_a_manger, salle_de_bain, wc, bureau, entree, terrasse, balcon

---

### 2. `style_palettes`

Palette de couleurs, matériaux et ambiance par style.

**Exemple Home Staging Moderne** :
```json
{
  "transformation_type_id": "uuid...",
  "wall_colors": ["Pure white", "Light gray", "Off-white"],
  "floor_materials": ["Light oak wood planks", "Large format gray tiles (60x60cm)"],
  "accent_colors": ["Black", "Brushed steel"],
  "materials": ["Wood", "Metal", "Glass", "White quartz"],
  "ambiance_keywords": ["Minimal", "Clean lines", "Bright"],
  "lighting_style": "Recessed LED spotlights + minimal pendant lights",
  "general_instructions": "Create a modern, minimalist space..."
}
```

**3 styles configurés** : Home Staging Moderne, Scandinave, Industriel

---

### 3. `furniture_catalog`

Catalogue global de meubles réutilisables.

**Exemples** :
```json
[
  {
    "category": "seating",
    "room_types": ["salon"],
    "name_fr": "Canapé 3 places",
    "name_en": "3-seat sofa",
    "is_essential": true,
    "priority": 100
  },
  {
    "category": "table",
    "room_types": ["salon"],
    "name_fr": "Table basse",
    "name_en": "Coffee table",
    "is_essential": true,
    "priority": 90
  },
  {
    "category": "lighting",
    "room_types": ["salon", "bureau", "chambre"],
    "name_fr": "Lampadaire",
    "name_en": "Floor lamp",
    "is_essential": false,
    "priority": 70
  }
]
```

**23 meubles catalogués** couvrant salon, chambre, cuisine, bureau, salle à manger, salle de bain, terrasse

---

### 4. `style_furniture_variants`

Comment chaque meuble se décline selon le style.

**Exemple : Canapé 3 places**

**Version Moderne** :
```json
{
  "transformation_type_id": "home_staging_moderne",
  "furniture_id": "canapé-3-places",
  "description": "White leather 3-seat sofa with clean lines and brushed steel legs",
  "materials": ["White leather", "Brushed steel"],
  "colors": ["White", "Silver"]
}
```

**Version Scandinave** :
```json
{
  "transformation_type_id": "home_staging_scandinave",
  "furniture_id": "canapé-3-places",
  "description": "Light gray fabric sofa with natural wood legs and cozy cushions",
  "materials": ["Light gray fabric", "Natural wood"],
  "colors": ["Light gray", "Natural wood"]
}
```

**Version Industrielle** :
```json
{
  "transformation_type_id": "home_staging_industriel",
  "furniture_id": "canapé-3-places",
  "description": "Black or brown leather sofa with metal frame and industrial rivets",
  "materials": ["Dark leather", "Black metal"],
  "colors": ["Black", "Dark brown"]
}
```

**~30 variantes configurées** (3 styles × ~10 meubles)

---

### 5. `room_furniture_presets`

Sélections pré-configurées de meubles par style et pièce.

**Exemple : Salon Moderne** :
```json
{
  "transformation_type_id": "home_staging_moderne",
  "room_type": "salon",
  "name": "Salon Moderne Standard",
  "furniture_ids": [
    "uuid-canapé-3-places",
    "uuid-table-basse",
    "uuid-lampadaire",
    "uuid-plante-moyenne",
    "uuid-plante-petite"
  ],
  "is_system": true,
  "is_public": true
}
```

**12 presets configurés** (3 styles × 4 pièces principales)

---

## 🔧 Comment ça marche

### Flux de construction du prompt

```
User sélectionne :
  - Style : "Home Staging Moderne"
  - Room : "Salon"
  - Meubles : [canapé, table basse, lampadaire, 2 plantes]
    ↓
PromptBuilder.build() :
  1. Récupère style_palette → couleurs, matériaux, ambiance
  2. Récupère room_spec → contraintes cuisine
  3. Récupère furniture_variants → descriptions adaptées au style
  4. Assemble tout ensemble
    ↓
Prompt final :
  - Contraintes room (ne pas bouger les murs, fenêtres, etc.)
  - Style palette (blanc, bois clair, métal noir)
  - Liste des meubles avec descriptions adaptées
  - Instruction finale
```

### Exemple de prompt généré

**Input** :
- Style : Home Staging Moderne
- Room : Salon
- Meubles : [canapé, table basse, lampadaire, 2 plantes]

**Output** :
```
DO NOT CHANGE: Camera position, image crop, field of view, perspective lines, room boundaries.

MANDATORY PRESERVATION:
• Windows: Keep EXACT positions, sizes, frames
• Doors: Keep EXACT positions, sizes, frames, handles
• Ceiling: Keep height, moldings, ceiling fixtures
• Walls: Keep structural walls, columns
• Floor boundaries: Maintain room shape

STYLE: Home Staging Moderne
• Walls: Pure white OR Light gray OR Off-white
• Floor: Light oak wood planks OR Large format gray tiles (60x60cm) OR Light gray porcelain tiles
• Ambiance: Minimal, Clean lines, Uncluttered, Bright, Spacious, Contemporary
• Lighting: Recessed LED spotlights + minimal pendant lights

Create a modern, minimalist space with clean lines and neutral tones

FURNITURE TO ADD:
1. White leather 3-seat sofa with clean lines and brushed steel legs
2. Light wood coffee table with minimalist design and clean edges
3. Black metal floor lamp with simple cylindrical shade
4. Medium potted plant (Monstera or Fiddle Leaf Fig) in white ceramic pot (Simple geometric pot, no patterns)
5. Small succulent in white ceramic pot

RESULT: Home Staging Moderne living room with specified furniture, maintaining original architecture.
```

---

## 💻 Utilisation dans le code

### Construction d'un prompt

```typescript
import { buildPrompt } from '@/lib/prompts/prompt-builder';

// Construire le prompt
const result = await buildPrompt({
  transformationTypeId: 'uuid-home-staging-moderne',
  roomType: 'salon',
  furnitureIds: [
    'uuid-canapé',
    'uuid-table-basse',
    'uuid-lampadaire',
  ],
  customPrompt: null, // ou un prompt custom si fourni
});

console.log(result);
// {
//   prompt: "DO NOT CHANGE: Camera position...\n\nSTYLE: Home Staging Moderne...",
//   source: 'modular',
//   metadata: {
//     style_name: 'Home Staging Moderne',
//     room_name: 'Living Room',
//     furniture_count: 3
//   }
// }
```

### Récupérer le preset par défaut

```typescript
import { getDefaultPreset } from '@/lib/prompts/prompt-builder';

// Récupérer les meubles par défaut pour Salon Moderne
const furnitureIds = await getDefaultPreset(
  'uuid-home-staging-moderne',
  'salon'
);

console.log(furnitureIds);
// ['uuid-canapé', 'uuid-table-basse', 'uuid-lampadaire', ...]
```

---

## 🎨 Interface utilisateur (à venir)

### Modale de génération proposée

```
┌──────────────────────────────────────────┐
│  Générer une transformation IA          │
├──────────────────────────────────────────┤
│                                          │
│  🎨 Style                                │
│  [ Home Staging Moderne ▼ ]             │
│                                          │
│  🏠 Type de pièce                        │
│  [ Salon ▼ ]                             │
│                                          │
│  🪑 Meubles                              │
│  ☑ Avec meubles                          │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Sélection des meubles :            │ │
│  │                                    │ │
│  │ Essentiels :                       │ │
│  │ ☑ Canapé 3 places                  │ │
│  │   → Cuir blanc, pieds acier        │ │
│  │ ☑ Table basse                      │ │
│  │   → Bois clair, design minimal     │ │
│  │                                    │ │
│  │ Optionnels :                       │ │
│  │ ☑ Lampadaire                       │ │
│  │   → Métal noir, abat-jour simple   │ │
│  │ ☑ Plante décorative (2x)           │ │
│  │ ☐ Tableau mural                    │ │
│  │ ☐ Tapis                            │ │
│  │                                    │ │
│  │ [Utiliser preset par défaut]       │ │
│  │ [Sauvegarder ma sélection]         │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [ Annuler ]  [ Prévisualiser prompt ]  │
│                        [ Générer ✨ ]    │
└──────────────────────────────────────────┘
```

---

## 📦 Migrations SQL à appliquer

**Ordre d'application (IMPORTANT)** :

```bash
1. MODULAR_001_core_tables.sql          # Tables de base
2. MODULAR_002_seed_room_specs.sql      # 10 pièces
3. MODULAR_003_seed_furniture_catalog.sql # 23 meubles
4. MODULAR_004_home_staging_styles.sql  # 3 styles + variantes
5. MODULAR_005_default_presets.sql      # 12 presets
```

**Total** :
- 5 nouvelles tables
- 10 room specifications
- 23 furniture items
- 3 style palettes
- ~30 furniture variants
- 12 default presets

---

## ✅ Avantages du système modulaire

### 1. Flexibilité totale

**Ajouter un nouveau style** :
```sql
-- 1. Créer la palette
INSERT INTO style_palettes (...);

-- 2. Créer les variantes de meubles
INSERT INTO style_furniture_variants (...);

-- 3. Créer les presets
INSERT INTO room_furniture_presets (...);

-- C'est tout ! Le reste est réutilisé.
```

### 2. Personnalisation user

- User peut créer ses propres presets
- User peut choisir exactement quels meubles
- User peut sauvegarder ses sélections préférées
- User peut partager ses presets (is_public = true)

### 3. Maintenance facile

**Modifier un meuble** :
```sql
-- Modifier une seule fois la variante
UPDATE style_furniture_variants
SET description = 'New description...'
WHERE transformation_type_id = 'moderne'
  AND furniture_id = 'canapé';

-- Tous les prompts l'utilisent automatiquement
```

### 4. Scalabilité

- Ajouter des pièces (jardin, veranda, etc.) → 1 ligne dans room_specifications
- Ajouter des meubles → 1 ligne dans furniture_catalog + variantes
- Combiner = infinies possibilités

### 5. Données structurées

- Palette de couleurs → exploitable pour filtres UI
- Matériaux → exploitable pour search
- Catégories → exploitable pour organization
- Tout est queryable et analysable

---

## 🔄 Migration depuis l'ancien système

Les 55 prompts hardcodés peuvent être **migrés automatiquement** :

1. Parser les prompts existants
2. Extraire les meubles mentionnés
3. Peupler furniture_catalog et variants
4. Les prompts deviennent modulaires

**Mais** : Pas nécessaire ! Le système modulaire est **déjà fonctionnel** avec les 3 styles Home Staging.

---

## 🚀 Prochaines étapes

### Court terme (maintenant)

1. ✅ Appliquer les 5 migrations SQL
2. ✅ Tester PromptBuilder en TypeScript
3. ⏳ Créer l'UI de sélection de meubles
4. ⏳ Migrer l'API pour utiliser PromptBuilder

### Moyen terme (après)

1. Ajouter styles Dépersonnalisation (sans meubles)
2. Ajouter styles Rénovation (Luxe, Contemporaine)
3. Permettre users de créer custom styles
4. Analytics sur les meubles les plus utilisés

### Long terme

1. IA qui suggère les meilleurs meubles selon la pièce
2. Import de catalogues de meubles externes (IKEA, etc.)
3. Rendu 3D preview des meubles
4. Marketplace de presets custom

---

## 📊 Résumé des données

| Table | Lignes | Description |
|-------|--------|-------------|
| room_specifications | 10 | Types de pièces |
| style_palettes | 3 | Palettes de styles |
| furniture_catalog | 23 | Meubles catalogués |
| style_furniture_variants | ~30 | Variantes par style |
| room_furniture_presets | 12 | Presets par défaut |

**Total** : ~78 lignes de données structurées → Permet des milliers de combinaisons

---

## 🎉 Conclusion

Le système modulaire offre :

- ✅ **Flexibilité** → Combinaisons infinies
- ✅ **Personnalisation** → User choisit exactement
- ✅ **Maintenance** → Modifier un composant = effet partout
- ✅ **Scalabilité** → Ajouter facilement nouveaux styles/meubles
- ✅ **UX** → Interface intuitive de sélection
- ✅ **Données** → Tout est structuré et queryable

C'est un système **professionnel** et **scalable** prêt pour la production ! 🚀
