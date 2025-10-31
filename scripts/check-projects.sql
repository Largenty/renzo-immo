-- Vérifier les projets créés

-- 1. Tous les projets
SELECT
  id,
  name,
  user_id,
  address,
  description,
  cover_image_url,
  status,
  created_at
FROM projects
ORDER BY created_at DESC
LIMIT 10;

-- 2. Compter par utilisateur
SELECT
  u.email,
  COUNT(p.id) as "Nombre de projets"
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
GROUP BY u.email;
