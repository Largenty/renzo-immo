# 🏠 Guide: Gestion des Types de Pièces

## ✅ Ce qui a été créé

J'ai mis en place un système complet de gestion des types de pièces personnalisés avec leurs spécifications architecturales.

### 📁 Structure Créée

```
src/domain/rooms/
├── models/
│   └── room.ts                # Modèles TypeScript + validation Zod + constantes
├── hooks/
│   └── use-rooms.ts           # Hooks React Query (CRUD)
└── index.ts                   # Exports

app/api/rooms/
├── route.ts                   # GET (liste) + POST (créer)
└── [id]/
    └── route.ts               # GET/PATCH/DELETE (pièce spécifique)

app/dashboard/rooms/
└── page.tsx                   # Interface utilisateur

src/components/rooms/
└── room-form-dialog.tsx       # Formulaire création/édition
```

## 🎯 Fonctionnalités

### Page `/dashboard/rooms`

- ✅ Liste toutes les spécifications de pièces
- ✅ Recherche par nom (français, anglais ou type)
- ✅ Statistiques (total, résultats, pièces avec surface)
- ✅ Création de nouveaux types de pièces
- ✅ Édition des spécifications existantes
- ✅ Suppression (soft delete)

### Formulaire de Pièce

Champs disponibles:
- **Type de pièce** (required, non modifiable après création): 20 types prédéfinis
- **Nom français** (required): Ex: "Salon"
- **Nom anglais** (required): Ex: "Living Room"
- **Contraintes architecturales** (required): Instructions pour l'IA (min. 10 caractères)
- **Description**: Description générale du type de pièce
- **Surface typique**: Min et Max en m²
- **Icône**: Emoji pour représenter la pièce

### Types de Pièces Disponibles

```
🛋️ Salon (Living Room)
🛏️ Chambre (Bedroom)
🍳 Cuisine (Kitchen)
🍽️ Salle à manger (Dining Room)
🚿 Salle de bain (Bathroom)
🚽 WC (Toilet)
💼 Bureau (Office)
🚪 Entrée (Entrance)
🚶 Couloir (Hallway)
🌞 Terrasse (Terrace)
🏡 Balcon (Balcony)
🌳 Jardin (Garden)
🚗 Garage (Garage)
🍷 Cave (Cellar)
📦 Grenier (Attic)
🧺 Buanderie (Laundry)
👔 Dressing (Dressing Room)
🪴 Véranda (Veranda)
📐 Mezzanine (Mezzanine)
❓ Autre (Other)
```

### APIs REST

#### `GET /api/rooms`
Récupère la liste des pièces actives

**Response:**
```json
{
  "rooms": [
    {
      "id": "uuid",
      "room_type": "salon",
      "display_name_fr": "Salon",
      "display_name_en": "Living Room",
      "constraints_text": "Maintain natural light sources, respect electrical outlets placement...",
      "typical_area_min": 15.0,
      "typical_area_max": 40.0,
      "zones": null,
      "description": "Pièce principale de vie",
      "icon_name": "🛋️",
      "is_active": true,
      "created_at": "2025-01-30T...",
      "updated_at": "2025-01-30T..."
    }
  ]
}
```

#### `POST /api/rooms`
Créer une nouvelle spécification de pièce

**Body:**
```json
{
  "room_type": "salon",
  "display_name_fr": "Salon",
  "display_name_en": "Living Room",
  "constraints_text": "Maintain natural light sources, respect electrical outlets placement, ensure proper ventilation",
  "description": "Pièce principale de vie et de réception",
  "typical_area_min": 15.0,
  "typical_area_max": 40.0,
  "icon_name": "🛋️"
}
```

#### `GET /api/rooms/[id]`
Récupérer une pièce spécifique

#### `PATCH /api/rooms/[id]`
Mettre à jour une pièce (le `room_type` ne peut pas être modifié)

**Body:** (tous les champs sont optionnels)
```json
{
  "display_name_fr": "Nouveau nom",
  "constraints_text": "Nouvelles contraintes...",
  "typical_area_min": 20.0
}
```

#### `DELETE /api/rooms/[id]`
Supprimer une pièce (soft delete, met `is_active` à false)

## 🧪 Comment Tester

### 1. Accéder à la page

```
http://localhost:3000/dashboard/rooms
```

### 2. Créer une pièce

1. Clique sur **"Ajouter une pièce"**
2. Remplis le formulaire:
   - Type de pièce: **Salon**
   - Nom FR: **Salon moderne**
   - Nom EN: **Modern Living Room**
   - Contraintes: **Maintain natural light from windows, respect electrical outlets near seating areas, ensure sufficient space for circulation, preserve architectural features like fireplaces or columns**
   - Description: **Pièce principale dédiée à la vie et au repos, avec espace de réception**
   - Surface min: **15**
   - Surface max: **40**
   - Icône: **🛋️**
3. Clique **"Créer"**

Tu devrais voir une carte de la pièce apparaître dans la liste.

### 3. Rechercher une pièce

- Tape "salon" dans la barre de recherche
- La pièce que tu viens de créer devrait apparaître

### 4. Éditer une pièce

- Clique sur **"Modifier"** sur la carte de la pièce
- Note que le **type de pièce** n'est pas modifiable (affiché en lecture seule)
- Change le nom ou les contraintes
- Clique **"Mettre à jour"**

### 5. Supprimer une pièce

- Clique sur l'icône **poubelle** (🗑️)
- Confirme la suppression
- La pièce disparaît de la liste

## 🔍 Vérification en Base de Données

Tu peux vérifier que les données sont bien créées:

```sql
SELECT
  id,
  room_type,
  display_name_fr,
  display_name_en,
  constraints_text,
  typical_area_min,
  typical_area_max,
  icon_name,
  is_active,
  created_at
FROM room_specifications
WHERE is_active = true
ORDER BY display_name_fr;
```

## 📊 Exemple de Contraintes Architecturales

Voici des exemples de bonnes contraintes par type de pièce:

### Salon
```
Maintain natural light from windows, respect electrical outlets placement near seating areas,
ensure sufficient space for circulation (min 90cm passages), preserve architectural features
like fireplaces or columns, keep access to balcony/terrace if present
```

### Cuisine
```
Respect the work triangle (sink-stove-fridge), maintain minimum 120cm passage width,
ensure proper ventilation near cooking area, preserve plumbing connections,
keep electrical outlets above counter level (15cm from countertop)
```

### Chambre
```
Position bed away from door line of sight, ensure blackout capability,
maintain minimum 60cm circulation around bed, preserve closet access,
keep electrical outlets accessible near bedside areas
```

### Salle de bain
```
Respect waterproofing zones, maintain plumbing connections positions,
ensure proper ventilation (min 15 air changes/hour),
keep minimum 70cm free space in front of fixtures, preserve drainage slopes
```

## 🎨 Utilisation dans le Système

Les contraintes architecturales sont utilisées par le **PromptBuilder** pour:

1. ✅ Guider l'IA lors de la génération d'images
2. ✅ Assurer que les transformations respectent les normes
3. ✅ Maintenir la cohérence architecturale
4. ✅ Éviter les erreurs de placement de meubles

**Exemple de prompt généré:**

```
Transform this living room into a Scandinavian home staging.

ROOM CONSTRAINTS:
Maintain natural light from windows, respect electrical outlets placement near seating areas,
ensure sufficient space for circulation (min 90cm passages)...

STYLE: Home Staging Scandinave
PALETTE: White walls, light oak floor...
FURNITURE: Scandinavian sofa, Coffee table...
```

## 🔗 Intégration avec le Système

Les spécifications de pièces sont utilisées par:

- **`/api/furniture/catalog`** - Filtrer les meubles compatibles
- **`PromptBuilder`** - Inclure les contraintes dans le prompt
- **`ImageUploader`** - Afficher les types de pièces disponibles
- **`/api/furniture/preset`** - Charger les presets par type de pièce

## 🐛 Dépannage

### Erreur: "Ce type de pièce existe déjà"

Chaque `room_type` ne peut avoir qu'une seule spécification. Si tu veux modifier, édite la spécification existante au lieu d'en créer une nouvelle.

### Erreur: "Les contraintes doivent contenir au moins 10 caractères"

Les contraintes sont essentielles pour guider l'IA. Écris des contraintes détaillées et précises.

### La pièce n'apparaît pas dans l'uploader

Vérifie que `is_active = true` en base de données:

```sql
SELECT room_type, is_active FROM room_specifications WHERE room_type = 'salon';
```

## ✨ Prochaines Étapes

Maintenant que tu as:
- ✅ Page de gestion des **meubles** (`/dashboard/furniture`)
- ✅ Page de gestion des **pièces** (`/dashboard/rooms`)

Tu peux créer:

### Option B: Page de gestion des variantes de style 🎨

Gérer les descriptions spécifiques de chaque meuble pour chaque style.

**Exemple:**
- Meuble: **Canapé**
- Style: **Home Staging Scandinave**
- Variante: *"Canapé 3 places en tissu gris clair chiné avec pieds en chêne naturel, coussins décoratifs beiges et blancs, design épuré et minimaliste"*

### Option C: Page de gestion des presets 📋

Gérer les combinaisons de meubles par défaut pour chaque style + pièce.

**Exemple:**
- Style: **Home Staging Scandinave**
- Pièce: **Salon**
- Preset: [Canapé scandinave, Table basse bois clair, Étagère murale, Lampe arc, Plantes vertes]

## 🎯 Résumé

Tu as maintenant:
- ✅ Une page complète de gestion des types de pièces
- ✅ Des APIs REST pour CRUD
- ✅ Un formulaire de création/édition avec validation
- ✅ 20 types de pièces prédéfinis
- ✅ Contraintes architecturales personnalisables
- ✅ Recherche et statistiques
- ✅ Soft delete pour ne pas perdre de données

**Les spécifications de pièces sont maintenant intégrées dans le système de génération d'images!** 🚀
