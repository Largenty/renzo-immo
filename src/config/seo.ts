/**
 * Configuration SEO centralisée pour Renzo Immobilier
 */

export const SEO_CONFIG = {
  title: "Renzo Immobilier — Rénovation virtuelle par IA",
  description:
    "Avant/Après photoréalistes en minutes. Dépersonnalisation, home staging, modernisation par IA. +32% de clics, +18% de visites. Essai gratuit.",
  keywords: [
    "rénovation virtuelle",
    "home staging virtuel",
    "IA immobilier",
    "avant après IA",
    "visualisation immobilière",
    "dépersonnalisation",
    "staging photo",
  ],
  url: "https://renzo-immo.fr",
  ogImage: "/og-image.jpg",
  twitterHandle: "@renzo_immo",
  locale: "fr_FR",
};

export const JSON_LD_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Renzo Immobilier",
  description: SEO_CONFIG.description,
  url: SEO_CONFIG.url,
  logo: `${SEO_CONFIG.url}/logo.png`,
  sameAs: [
    "https://twitter.com/renzo_immo",
    "https://linkedin.com/company/renzo-immo",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Sales",
    email: "contact@renzo-immo.fr",
    availableLanguage: ["French"],
  },
};

export const JSON_LD_PRODUCT = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Renzo Immobilier - Rénovation Virtuelle IA",
  description: SEO_CONFIG.description,
  brand: {
    "@type": "Brand",
    name: "Renzo",
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "19",
    highPrice: "249",
    offerCount: "3",
  },
};
