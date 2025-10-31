# 🪑 Guide: Gestion des Meubles Personnalisés

## ✅ Ce qui a été créé

J'ai mis en place un système complet de gestion des meubles personnalisés pour ton application de home staging.

### 📁 Structure Créée

```
src/domain/furniture/
├── models/
│   └── furniture.ts          # Modèles TypeScript + validation Zod
├── hooks/
│   └── use-furniture.ts      # Hooks React Query (CRUD)
└── index.ts                  # Exports

app/api/furniture/
├── route.ts                  # GET (liste) + POST (créer)
└── [id]/
    └── route.ts              # GET/PATCH/DELETE (meuble spécifique)

app/dashboard/furniture/
└── page.tsx                  # Interface utilisateur

src/components/furniture/
└── furniture-form-dialog.tsx # Formulaire création/édition

src/components/ui/
└── delete-confirm-dialog.tsx # Dialog de confirmation suppression
```

## 🎯 Fonctionnalités

### Page `/dashboard/furniture`

- ✅ Liste tous les meubles du catalogue
- ✅ Recherche par nom (français ou anglais)
- ✅ Filtrage par catégorie
- ✅ Création de nouveaux meubles
- ✅ Édition des meubles existants
- ✅ Suppression (soft delete)

### Formulaire de Meuble

Champs disponibles:
- **Catégorie** (required): seating, table, storage, bed, lighting, decor, appliance, fixture
- **Nom français** (required): Ex: "Canapé scandinave"
- **Nom anglais** (required): Ex: "Scandinavian sofa"
- **Description**: Description générique du meuble
- **Types de pièces compatibles** (required): Sélection multiple (salon, chambre, cuisine, etc.)
- **Dimensions typiques**: Largeur, profondeur, hauteur (en cm)
- **Meuble essentiel**: Checkbox pour marquer si c'est un meuble indispensable
- **Priorité**: 0-100 (pour l'ordre d'affichage)

### APIs REST

#### `GET /api/furniture`
Récupère la liste des meubles actifs

**Response:**
```json
{
  "furniture": [
    {
      "id": "uuid",
      "category": "seating",
      "room_types": ["salon", "chambre"],
      "name_fr": "Canapé scandinave",
      "name_en": "Scandinavian sofa",
      "generic_description": "Canapé au design épuré...",
      "typical_dimensions": {
        "width": 220,
        "depth": 90,
        "height": 80
      },
      "is_essential": true,
      "priority": 90,
      "is_active": true,
      "created_at": "2025-01-30T...",
      "updated_at": "2025-01-30T..."
    }
  ]
}
```

#### `POST /api/furniture`
Créer un nouveau meuble

**Body:**
```json
{
  "category": "seating",
  "room_types": ["salon", "chambre"],
  "name_fr": "Canapé scandinave",
  "name_en": "Scandinavian sofa",
  "generic_description": "Canapé au design épuré avec pieds en bois clair",
  "typical_dimensions": {
    "width": 220,
    "depth": 90,
    "height": 80
  },
  "is_essential": true,
  "priority": 90
}
```

#### `GET /api/furniture/[id]`
Récupérer un meuble spécifique

#### `PATCH /api/furniture/[id]`
Mettre à jour un meuble

**Body:** (tous les champs sont optionnels)
```json
{
  "name_fr": "Nouveau nom",
  "priority": 95,
  "is_active": false
}
```

#### `DELETE /api/furniture/[id]`
Supprimer un meuble (soft delete, met `is_active` à false)

## 🧪 Comment Tester

### 1. Accéder à la page

```
http://localhost:3000/dashboard/furniture
```

### 2. Créer un meuble

1. Clique sur **"Ajouter un meuble"**
2. Remplis le formulaire:
   - Catégorie: **Assises**
   - Nom FR: **Canapé d'angle moderne**
   - Nom EN: **Modern corner sofa**
   - Description: **Grand canapé d'angle avec méridienne**
   - Pièces: Coche **Salon** et **Bureau**
   - Dimensions: 300 x 150 x 85 cm
   - Meuble essentiel: Coché
   - Priorité: 85
3. Clique **"Créer"**

Tu devrais voir une carte du meuble apparaître dans la liste.

### 3. Rechercher un meuble

- Tape "canapé" dans la barre de recherche
- Le meuble que tu viens de créer devrait apparaître

### 4. Filtrer par catégorie

- Clique sur le bouton **"Assises"**
- Seuls les meubles de type "seating" s'affichent

### 5. Éditer un meuble

- Clique sur **"Modifier"** sur la carte du meuble
- Change le nom ou la priorité
- Clique **"Mettre à jour"**

### 6. Supprimer un meuble

- Clique sur l'icône **poubelle** (🗑️)
- Confirme la suppression
- Le meuble disparaît de la liste

## 🔍 Vérification en Base de Données

Tu peux vérifier que les données sont bien créées:

```sql
SELECT
  id,
  category,
  name_fr,
  name_en,
  room_types,
  is_essential,
  priority,
  is_active,
  created_at
FROM furniture_catalog
ORDER BY priority DESC, created_at DESC
LIMIT 10;
```

## 📝 Prochaines Étapes

### Option 1: Créer la page de gestion des pièces

Page similaire pour gérer les types de pièces personnalisées (`room_specifications`).

### Option 2: Créer la page de gestion des variantes de style

Gérer les descriptions spécifiques de chaque meuble pour chaque style (`style_furniture_variants`).

Exemple:
- **Meuble**: Canapé
- **Style**: Home Staging Scandinave
- **Variante**: "Canapé 3 places en tissu gris clair avec pieds en chêne naturel, coussins beiges"

### Option 3: Créer la page de gestion des presets

Gérer les presets de meubles par défaut pour chaque combinaison style + pièce.

Exemple:
- **Style**: Home Staging Scandinave
- **Pièce**: Salon
- **Meubles**: Canapé scandinave + Table basse bois clair + Étagère murale + Lampe arc + Plantes

## 🐛 Dépannage

### Erreur: "Unauthorized"

Tu n'es pas connecté. Connecte-toi d'abord au dashboard.

### Erreur: "Failed to fetch furniture"

Vérifie que:
1. La table `furniture_catalog` existe en DB
2. Les migrations ont été appliquées
3. Le serveur Next.js tourne (`npm run dev`)

### La page ne s'affiche pas

Vérifie les logs du terminal pour voir les erreurs TypeScript ou de compilation.

### Les catégories ou types de pièces ne s'affichent pas

Vérifie que les ENUMs `furniture_category` et `room_type` existent en DB:

```sql
SELECT typname FROM pg_type WHERE typname IN ('furniture_category', 'room_type');
```

## ✨ Améliorations Possibles

- 📸 Upload d'images pour les meubles
- 🏷️ Tags personnalisés
- 📊 Statistiques d'utilisation des meubles
- 🔄 Import/Export CSV
- 🎨 Prévisualisation 3D
- 🌍 Support multilingue étendu

## 🎯 Résumé

Tu as maintenant:
- ✅ Une page complète de gestion des meubles
- ✅ Des APIs REST pour CRUD
- ✅ Un formulaire de création/édition
- ✅ Recherche et filtres
- ✅ Validation des données avec Zod
- ✅ Soft delete pour ne pas perdre de données

Dis-moi si tu veux que je continue avec les pièces personnalisées ou les variantes de style! 🚀
