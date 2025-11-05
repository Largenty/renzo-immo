const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addStrengthColumn() {
  console.log('\n🔧 Adding strength column to images table...\n');

  // Vérifier d'abord si la colonne existe déjà
  const { data: existingImages, error: checkError } = await supabase
    .from('images')
    .select('*')
    .limit(1);

  if (checkError) {
    console.log('❌ Error checking table:', checkError.message);
    return;
  }

  // Si on arrive à récupérer les images, la table existe
  if (existingImages && existingImages.length > 0) {
    const firstImage = existingImages[0];
    if ('strength' in firstImage) {
      console.log('✅ Column "strength" already exists in images table!\n');
      return;
    }
  }

  console.log('📝 Column does not exist yet. Please run this SQL in Supabase SQL Editor:\n');
  console.log('═'.repeat(70));
  console.log(`
ALTER TABLE images
ADD COLUMN IF NOT EXISTS strength DECIMAL(3,2) DEFAULT 0.15
CHECK (strength >= 0 AND strength <= 1);

COMMENT ON COLUMN images.strength IS 'AI transformation intensity (0-1). Default: 0.15';
  `);
  console.log('═'.repeat(70));
  console.log('\n✨ After running the SQL, strength will be available!\n');
}

addStrengthColumn().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
