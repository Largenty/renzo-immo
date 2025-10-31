# 🎯 Test Complet: Workflow Meubles + Pièces

## Objectif

Tester le flow complet depuis la création de meubles et pièces jusqu'à la génération d'images avec ces meubles.

---

## 📋 ÉTAPE 1: Créer un Type de Pièce

### 1.1 Accéder à la page

```
http://localhost:3000/dashboard/rooms
```

### 1.2 Créer "Salon"

1. Clique **"Ajouter une pièce"**
2. Remplis:
   - **Type:** Salon
   - **Nom FR:** Salon moderne
   - **Nom EN:** Modern Living Room
   - **Contraintes:**
     ```
     Maintain natural light from windows, respect electrical outlets placement
     near seating areas, ensure minimum 90cm circulation passages, preserve
     architectural features like fireplaces or columns
     ```
   - **Surface min:** 15
   - **Surface max:** 40
   - **Icône:** 🛋️
3. Clique **"Créer"**

✅ **Résultat attendu:** Une carte "Salon moderne" apparaît dans la liste

---

## 📋 ÉTAPE 2: Créer des Meubles pour le Salon

### 2.1 Accéder à la page

```
http://localhost:3000/dashboard/furniture
```

### 2.2 Créer le Canapé

1. Clique **"Ajouter un meuble"**
2. Remplis:
   - **Catégorie:** Assises
   - **Nom FR:** Canapé scandinave 3 places
   - **Nom EN:** Scandinavian 3-seater sofa
   - **Description:** Canapé au design épuré avec pieds en bois clair
   - **Pièces compatibles:** ✅ Salon, ✅ Bureau
   - **Dimensions:** Largeur 220, Profondeur 90, Hauteur 80
   - **Essentiel:** ✅ Oui
   - **Priorité:** 90
3. Clique **"Créer"**

### 2.3 Créer la Table Basse

1. Clique **"Ajouter un meuble"**
2. Remplis:
   - **Catégorie:** Tables
   - **Nom FR:** Table basse scandinave
   - **Nom EN:** Scandinavian coffee table
   - **Description:** Table basse rectangulaire en chêne naturel
   - **Pièces compatibles:** ✅ Salon
   - **Dimensions:** Largeur 120, Profondeur 60, Hauteur 45
   - **Essentiel:** ✅ Oui
   - **Priorité:** 85
3. Clique **"Créer"**

### 2.4 Créer l'Étagère

1. Clique **"Ajouter un meuble"**
2. Remplis:
   - **Catégorie:** Rangements
   - **Nom FR:** Étagère murale scandinave
   - **Nom EN:** Scandinavian wall shelf
   - **Description:** Étagère flottante en bois blanchi
   - **Pièces compatibles:** ✅ Salon, ✅ Chambre, ✅ Bureau
   - **Dimensions:** Largeur 180, Profondeur 25, Hauteur 30
   - **Essentiel:** Non
   - **Priorité:** 70
3. Clique **"Créer"**

### 2.5 Créer la Lampe

1. Clique **"Ajouter un meuble"**
2. Remplis:
   - **Catégorie:** Luminaires
   - **Nom FR:** Lampe arc design
   - **Nom EN:** Arc floor lamp
   - **Description:** Lampe sur pied avec arc en métal doré
   - **Pièces compatibles:** ✅ Salon, ✅ Chambre, ✅ Bureau
   - **Dimensions:** Hauteur 180
   - **Essentiel:** Non
   - **Priorité:** 60
3. Clique **"Créer"**

### 2.6 Créer les Plantes

1. Clique **"Ajouter un meuble"**
2. Remplis:
   - **Catégorie:** Déco
   - **Nom FR:** Plantes vertes en pot
   - **Nom EN:** Potted green plants
   - **Description:** Ensemble de plantes d'intérieur dans des paniers naturels
   - **Pièces compatibles:** ✅ Salon, ✅ Chambre, ✅ Cuisine, ✅ Bureau, ✅ Salle de bain
   - **Essentiel:** Non
   - **Priorité:** 50
3. Clique **"Créer"**

✅ **Résultat attendu:** 5 meubles créés, tous compatibles avec "Salon"

---

## 📋 ÉTAPE 3: Vérifier en Base de Données

### 3.1 Vérifier les meubles créés

```sql
SELECT
  id,
  name_fr,
  category,
  room_types,
  is_essential,
  priority
FROM furniture_catalog
WHERE is_active = true
ORDER BY priority DESC;
```

**Résultat attendu:**
```
| name_fr                      | category  | room_types           | is_essential | priority |
|------------------------------|-----------|----------------------|--------------|----------|
| Canapé scandinave 3 places  | seating   | {salon,bureau}       | true         | 90       |
| Table basse scandinave       | table     | {salon}              | true         | 85       |
| Étagère murale scandinave    | storage   | {salon,chambre,...}  | false        | 70       |
| Lampe arc design             | lighting  | {salon,chambre,...}  | false        | 60       |
| Plantes vertes en pot        | decor     | {salon,chambre,...}  | false        | 50       |
```

### 3.2 Vérifier la pièce créée

```sql
SELECT
  id,
  room_type,
  display_name_fr,
  constraints_text,
  typical_area_min,
  typical_area_max
FROM room_specifications
WHERE room_type = 'salon';
```

**Résultat attendu:**
```
| room_type | display_name_fr | constraints_text                | area_min | area_max |
|-----------|-----------------|--------------------------------|----------|----------|
| salon     | Salon moderne   | Maintain natural light from... | 15.00    | 40.00    |
```

---

## 📋 ÉTAPE 4: Tester le Catalogue de Meubles par Pièce

### 4.1 Test de l'API

Ouvre une nouvelle fenêtre du terminal et exécute:

```bash
# Test: Récupérer les meubles pour "Salon"
curl -X GET "http://localhost:3000/api/furniture/catalog?transformationTypeId=home_staging_scandinave&roomType=salon" \
  -H "Cookie: <ton-cookie-de-session>"
```

**Résultat attendu:**
- Les 5 meubles créés apparaissent dans la réponse
- Chacun avec ses caractéristiques complètes

---

## 📋 ÉTAPE 5: Upload d'une Image avec les Meubles

### 5.1 Accéder à un projet

```
http://localhost:3000/dashboard/projects/[ton-project-id]
```

### 5.2 Upload avec sélection de meubles

1. Clique **"Ajouter des images"**
2. Upload une photo de salon vide
3. **Sélectionne le style:** Home Staging Scandinave
4. **Clique "Avec meubles"**
5. **Sélectionne le type de pièce:** Salon
6. **Observe:** Un toast "Meubles par défaut ajoutés" apparaît
7. **Clique "Personnaliser les meubles"**

✅ **Résultat attendu:**
- Le dialog s'ouvre
- Tu vois **exactement les 5 meubles** que tu as créés
- Chacun avec son nom, description, et checkbox

### 5.3 Sélectionner les meubles

1. **Coche les 5 meubles** (ou seulement ceux que tu veux)
2. Clique **"Appliquer la sélection"**
3. Le bouton affiche **"5 meubles sélectionnés"**
4. Clique **"Ajouter 1 photo(s) au projet"**

---

## 📋 ÉTAPE 6: Vérifier la Génération

### 6.1 Vérifier les logs du terminal

Tu devrais voir:

```bash
[Upload] Données envoyées: {
  transformationType: 'home_staging_scandinave',
  withFurniture: true,
  furnitureIds: [
    'uuid-canapé',
    'uuid-table',
    'uuid-étagère',
    'uuid-lampe',
    'uuid-plantes'
  ],
  furnitureCount: 5,
  roomType: 'salon'
}

========== IMAGE DATA FROM DATABASE ==========
{
  furniture_ids: [
    'uuid-canapé',
    'uuid-table',
    'uuid-étagère',
    'uuid-lampe',
    'uuid-plantes'
  ],  ← ✅ LES 5 MEUBLES SONT SAUVEGARDÉS!
  room_type: 'salon'
}

========== PROMPT COMPONENTS ==========
{
  furnitureVariants: [
    'Canapé scandinave 3 places',
    'Table basse scandinave',
    'Étagère murale scandinave',
    'Lampe arc design',
    'Plantes vertes en pot'
  ]  ← ✅ LES 5 MEUBLES SONT DANS LE PROMPT!
}

========== FINAL PROMPT GENERATED ==========
{
  furnitureCount: 5,
  promptPreview: 'Transform this living room into a Scandinavian home staging.

  ROOM CONSTRAINTS:
  Maintain natural light from windows, respect electrical outlets placement...

  STYLE: Home Staging Scandinave
  FURNITURE:
  1. Canapé scandinave 3 places - Canapé au design épuré avec pieds en bois clair
  2. Table basse scandinave - Table basse rectangulaire en chêne naturel
  3. Étagère murale scandinave - Étagère flottante en bois blanchi
  4. Lampe arc design - Lampe sur pied avec arc en métal doré
  5. Plantes vertes en pot - Ensemble de plantes d''intérieur...'
}
```

### 6.2 Vérifier l'image générée

Après quelques secondes/minutes, l'image transformée devrait contenir:

- ✅ Un canapé scandinave avec pieds en bois clair
- ✅ Une table basse en bois naturel
- ✅ Une étagère murale
- ✅ Une lampe sur pied design
- ✅ Des plantes vertes
- ✅ **PAS une pièce vide!**

---

## 📋 ÉTAPE 7: Test avec une Autre Pièce

### 7.1 Créer des meubles pour Chambre

Retourne sur `/dashboard/furniture` et crée:

1. **Lit double scandinave** (catégorie: Lits, pièces: Chambre)
2. **Table de chevet** (catégorie: Tables, pièces: Chambre)
3. **Armoire blanche** (catégorie: Rangements, pièces: Chambre, Dressing)

### 7.2 Upload une image de chambre

1. Upload une photo de chambre vide
2. Sélectionne **Home Staging Scandinave**
3. Clique **"Avec meubles"**
4. Sélectionne **Chambre**
5. Clique **"Personnaliser les meubles"**

✅ **Résultat attendu:**
- Tu vois **uniquement les meubles compatibles avec Chambre**
- Le lit, la table de chevet, l'armoire
- **PLUS** l'étagère, la lampe et les plantes (compatibles avec Chambre aussi)
- **MAIS PAS** le canapé ni la table basse (uniquement Salon)

---

## 🎯 Résumé du Flow Complet

```
1. User crée un type de pièce "Salon"
   └─> Définit les contraintes architecturales

2. User crée des meubles compatibles avec "Salon"
   └─> Canapé, Table basse, Étagère, Lampe, Plantes
   └─> Chaque meuble indique: "Compatible avec: Salon, Chambre..."

3. User upload une image
   └─> Sélectionne style "Home Staging Scandinave"
   └─> Clique "Avec meubles"
   └─> Sélectionne pièce "Salon"

4. Système charge les meubles compatibles
   └─> API /api/furniture/catalog?roomType=salon
   └─> Retourne UNIQUEMENT les meubles avec room_types contenant "salon"

5. User sélectionne les meubles voulus
   └─> Les furniture_ids sont sauvegardés en DB

6. Système génère le prompt
   └─> Inclut les contraintes de la pièce
   └─> Inclut la description de chaque meuble
   └─> Envoie à NanoBanana

7. Image générée
   └─> Contient les meubles demandés
   └─> Respecte les contraintes architecturales
   └─> Style scandinave appliqué
```

---

## ✅ Checklist de Validation

- [ ] Page `/dashboard/furniture` accessible
- [ ] Page `/dashboard/rooms` accessible
- [ ] Création d'un type de pièce réussie
- [ ] Création de 5 meubles réussie
- [ ] Meubles visibles dans la liste avec leurs pièces compatibles
- [ ] Upload d'image avec sélection de pièce
- [ ] Toast "Meubles par défaut ajoutés" apparaît
- [ ] Dialog "Personnaliser les meubles" affiche les bons meubles
- [ ] Sélection de meubles fonctionne
- [ ] Log montre `furnitureIds` non vide
- [ ] Log montre les noms des meubles dans le prompt
- [ ] Image générée contient les meubles

---

## 🎉 Conclusion

Si tous les tests passent, **le système fonctionne parfaitement!**

L'utilisateur peut:
1. ✅ Créer ses propres types de pièces avec contraintes
2. ✅ Créer ses propres meubles et les associer à des pièces
3. ✅ Lors de l'upload, voir uniquement les meubles compatibles
4. ✅ Générer des images avec exactement les meubles qu'il a créés

**C'est exactement ce que tu voulais!** 🚀
