/**
 * Configuration centralisée des forfaits Renzo Immobilier
 * Permet de modifier facilement les prix et fonctionnalités
 */

export interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  credits: number;
  overage: number;
  seats: number;
  features: string[];
  popular?: boolean;
}

export interface PricingAddon {
  id: string;
  name: string;
  priceMonthly: number;
  description: string;
}

export interface PricingCoupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  appliesTo: string[];
}

export const PRICING = {
  currency: "EUR",
  note: "Crédits = 1 image rendue. HQ = 2 crédits.",
  monthly_discount: 0, // 0%
  yearly_discount: 0.2, // -20% / an
  plans: [
    {
      id: "starter",
      name: "Starter",
      priceMonthly: 19,
      priceYearly: 182,
      credits: 20,
      overage: 1.2,
      seats: 1,
      features: [
        "20 images/mois",
        "Avant/Après photoréaliste",
        "Usage annonces & réseaux",
        "Support standard",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      priceMonthly: 79,
      priceYearly: 758,
      credits: 120,
      overage: 0.9,
      seats: 3,
      popular: true,
      features: [
        "120 images/mois",
        "Styles avancés",
        "Watermark désactivable",
        "3 sièges équipe",
        "Support prioritaire",
      ],
    },
    {
      id: "agence",
      name: "Agence",
      priceMonthly: 249,
      priceYearly: 2388,
      credits: 500,
      overage: 0.6,
      seats: 10,
      features: [
        "500 images/mois",
        "10 sièges équipe",
        "Droits étendus B2B",
        "API & SSO (beta)",
        "Support dédié",
      ],
    },
  ] as PricingPlan[],
  addons: [
    {
      id: "white_label",
      name: "White-label",
      priceMonthly: 49,
      description: "Logo & bandeaux personnalisés",
    },
    {
      id: "priority",
      name: "Support+ SLA",
      priceMonthly: 79,
      description: "SLA 8x5, réponse <4h ouvrées",
    },
  ] as PricingAddon[],
  coupons: [
    {
      code: "RENZO20",
      type: "percent" as const,
      value: 20,
      appliesTo: ["pro", "agence"],
    },
  ] as PricingCoupon[],
  trial: {
    credits: 3,
    note: "Essai gratuit sans CB",
  },
};

/**
 * Calcule le prix avec coupon appliqué
 */
export function applyCoupon(
  price: number,
  coupon?: PricingCoupon
): number {
  if (!coupon) return price;
  if (coupon.type === "percent") {
    return price * (1 - coupon.value / 100);
  }
  return Math.max(0, price - coupon.value);
}

/**
 * Trouve le plan recommandé selon le volume d'images
 */
export function getRecommendedPlan(imagesPerMonth: number): PricingPlan {
  const plans = [...PRICING.plans].sort((a, b) => a.credits - b.credits);
  return (
    plans.find((p) => p.credits >= imagesPerMonth) ||
    plans[plans.length - 1]
  );
}
