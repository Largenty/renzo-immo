/**
 * Modèle du domaine : Credit Pack
 * Représente un pack de crédits disponible à l'achat
 */

import { z } from 'zod';

// ============================================
// TYPES
// ============================================

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceCents: number; // Prix en centimes (ex: 999 = 9.99€)
  stripePriceId: string; // Stripe Price ID (price_xxx)
  stripeProductId: string; // Stripe Product ID (prod_xxx)
  isActive: boolean;
  displayOrder: number;
  popular: boolean; // Pack populaire/recommandé
  createdAt: string;
  updatedAt: string;
}

// DTO from database
export interface CreditPackDTO {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  stripe_price_id: string;
  stripe_product_id: string;
  is_active: boolean;
  display_order: number;
  popular: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// SCHÉMAS ZOD (validation)
// ============================================

export const creditPackSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  credits: z.number().int().positive(),
  priceCents: z.number().int().positive(),
  stripePriceId: z.string().min(1),
  stripeProductId: z.string().min(1),
  isActive: z.boolean(),
  displayOrder: z.number().int().nonnegative(),
  popular: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// TYPES INFÉRÉS
// ============================================

export type CreditPackInput = z.infer<typeof creditPackSchema>;

// ============================================
// MAPPERS
// ============================================

export function fromCreditPackDTO(dto: CreditPackDTO): CreditPack {
  return {
    id: dto.id,
    name: dto.name,
    credits: dto.credits,
    priceCents: dto.price_cents,
    stripePriceId: dto.stripe_price_id,
    stripeProductId: dto.stripe_product_id,
    isActive: dto.is_active,
    displayOrder: dto.display_order,
    popular: dto.popular,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

// ============================================
// HELPERS
// ============================================

export function formatPrice(priceCents: number): string {
  return (priceCents / 100).toFixed(2) + '€';
}

export function getPricePerCredit(priceCents: number, credits: number): string {
  const pricePerCredit = priceCents / credits / 100;
  return pricePerCredit.toFixed(3) + '€';
}
