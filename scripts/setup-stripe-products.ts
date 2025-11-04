/**
 * Script pour créer automatiquement les produits et prix Stripe
 * Usage: npx tsx scripts/setup-stripe-products.ts
 */

import 'dotenv/config'; // Load .env file
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not defined in .env');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase credentials are not defined in .env');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

interface CreditPackConfig {
  name: string;
  credits: number;
  priceCents: number;
  displayOrder: number;
  popular: boolean;
  description: string;
}

const CREDIT_PACKS: CreditPackConfig[] = [
  {
    name: 'Pack Starter',
    credits: 50,
    priceCents: 999, // 9.99€ - 0.20€/crédit
    displayOrder: 1,
    popular: false,
    description: 'Parfait pour débuter - 50 crédits pour tester notre service',
  },
  {
    name: 'Pack Mini',
    credits: 100,
    priceCents: 1799, // 17.99€ - 0.18€/crédit
    displayOrder: 2,
    popular: false,
    description: 'Pack économique - 100 crédits pour vos premiers projets',
  },
  {
    name: 'Pack Standard',
    credits: 200,
    priceCents: 2999, // 29.99€ - 0.15€/crédit
    displayOrder: 3,
    popular: true,
    description: 'Le plus populaire - 200 crédits pour vos projets réguliers',
  },
  {
    name: 'Pack Plus',
    credits: 350,
    priceCents: 4499, // 44.99€ - 0.13€/crédit
    displayOrder: 4,
    popular: false,
    description: 'Plus de crédits - 350 crédits avec un meilleur tarif',
  },
  {
    name: 'Pack Premium',
    credits: 600,
    priceCents: 6999, // 69.99€ - 0.12€/crédit
    displayOrder: 5,
    popular: false,
    description: 'Pour les professionnels - 600 crédits pour vos gros projets',
  },
  {
    name: 'Pack Business',
    credits: 1000,
    priceCents: 9999, // 99.99€ - 0.10€/crédit
    displayOrder: 6,
    popular: false,
    description: 'Pour les agences - 1000 crédits avec un excellent rapport qualité-prix',
  },
  {
    name: 'Pack Pro',
    credits: 1500,
    priceCents: 12999, // 129.99€ - 0.087€/crédit
    displayOrder: 7,
    popular: false,
    description: 'Pack professionnel - 1500 crédits pour un usage intensif',
  },
  {
    name: 'Pack Enterprise',
    credits: 2500,
    priceCents: 19999, // 199.99€ - 0.08€/crédit
    displayOrder: 8,
    popular: false,
    description: 'Pour les grandes entreprises - 2500 crédits + support prioritaire',
  },
  {
    name: 'Pack Ultimate',
    credits: 3000,
    priceCents: 22999, // 229.99€ - 0.077€/crédit
    displayOrder: 9,
    popular: false,
    description: 'Le pack ultime - 3000 crédits avec le meilleur tarif dégressif',
  },
];

async function createStripeProduct(pack: CreditPackConfig) {
  console.log(`\n📦 Creating product: ${pack.name}`);

  try {
    // Create Stripe Product
    const product = await stripe.products.create({
      name: pack.name,
      description: pack.description,
      metadata: {
        credits: pack.credits.toString(),
        type: 'credit_pack',
      },
    });

    console.log(`✅ Product created: ${product.id}`);

    // Create Stripe Price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: pack.priceCents,
      currency: 'eur',
      metadata: {
        credits: pack.credits.toString(),
      },
    });

    console.log(`✅ Price created: ${price.id}`);

    return {
      productId: product.id,
      priceId: price.id,
    };
  } catch (error) {
    console.error(`❌ Error creating product ${pack.name}:`, error);
    throw error;
  }
}

async function upsertCreditPackInDatabase(
  pack: CreditPackConfig,
  stripeProductId: string,
  stripePriceId: string
) {
  console.log(`💾 Saving to database: ${pack.name}`);

  try {
    const { error } = await supabase.from('credit_packs').upsert(
      {
        name: pack.name,
        credits: pack.credits,
        price_cents: pack.priceCents,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
        is_active: true,
        display_order: pack.displayOrder,
        popular: pack.popular,
      },
      {
        onConflict: 'stripe_price_id',
      }
    );

    if (error) {
      throw error;
    }

    console.log(`✅ Saved to database`);
  } catch (error) {
    console.error(`❌ Error saving to database:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Setting up Stripe products and prices...\n');
  console.log(`Environment: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'TEST' : 'LIVE'}`);

  for (const pack of CREDIT_PACKS) {
    try {
      const { productId, priceId } = await createStripeProduct(pack);
      await upsertCreditPackInDatabase(pack, productId, priceId);
      console.log(`✅ ${pack.name} setup complete!\n`);
    } catch (error) {
      console.error(`❌ Failed to setup ${pack.name}:`, error);
      process.exit(1);
    }
  }

  console.log('\n🎉 All products and prices created successfully!');
  console.log('\n📋 Summary:');
  console.log(`   Products created: ${CREDIT_PACKS.length}`);
  console.log(`   Total credits available: ${CREDIT_PACKS.reduce((sum, p) => sum + p.credits, 0)}`);
  console.log(`\n🔗 Next steps:`);
  console.log(`   1. Verify products at: https://dashboard.stripe.com/products`);
  console.log(`   2. Test checkout flow in your app`);
  console.log(`   3. Configure webhooks at: https://dashboard.stripe.com/webhooks`);
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
