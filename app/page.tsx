import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/hero";
import { LogosMarquee } from "@/components/sections/logos-marquee";
import { SolutionsGrid } from "@/components/sections/solutions-grid";
import { HowItWorks } from "@/components/sections/how-it-works";
import { ErrorBoundary } from "@/components/error-boundary";
import { SEO_CONFIG } from "@/config/seo";

// ✅ Lazy load les sections non-critiques pour améliorer les performances initiales
const BeforeAfter = dynamic(() =>
  import("@/components/sections/before-after").then((mod) => ({
    default: mod.BeforeAfter,
  })),
  { ssr: true }
);

const ShowcaseGrid = dynamic(() =>
  import("@/components/sections/showcase-grid").then((mod) => ({
    default: mod.ShowcaseGrid,
  })),
  { ssr: true }
);

const ResultsKPIs = dynamic(() =>
  import("@/components/sections/results-kpis").then((mod) => ({
    default: mod.ResultsKPIs,
  })),
  { ssr: true }
);

const ForWhom = dynamic(() =>
  import("@/components/sections/for-whom").then((mod) => ({
    default: mod.ForWhom,
  })),
  { ssr: true }
);

const PricingSales = dynamic(() =>
  import("@/components/sections/pricing-sales").then((mod) => ({
    default: mod.PricingSales,
  })),
  { ssr: true }
);

const ContactForm = dynamic(() =>
  import("@/components/sections/contact-form").then((mod) => ({
    default: mod.ContactForm,
  })),
  { ssr: true }
);

// ✅ Métadonnées spécifiques à la page d'accueil
export const metadata: Metadata = {
  title: SEO_CONFIG.title,
  description: SEO_CONFIG.description,
  openGraph: {
    title: SEO_CONFIG.title,
    description: SEO_CONFIG.description,
    url: SEO_CONFIG.url,
    siteName: "Renzo Immobilier",
    locale: SEO_CONFIG.locale,
    type: "website",
    images: SEO_CONFIG.ogImage ? [{ url: SEO_CONFIG.ogImage }] : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.title,
    description: SEO_CONFIG.description,
    creator: SEO_CONFIG.twitterHandle,
  },
};

// ✅ Fallback de chargement pour les sections lazy-loaded
const SectionSkeleton = () => (
  <div className="py-24 bg-gray-50 animate-pulse">
    <div className="container max-w-7xl">
      <div className="h-12 bg-gray-200 rounded-lg w-1/3 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export default function HomePage() {
  return (
    <>
      {/* ✅ Sections critiques chargées immédiatement */}
      <Hero />
      <LogosMarquee />
      <SolutionsGrid />
      <HowItWorks />

      {/* ✅ Sections lazy-loaded avec Suspense et ErrorBoundary */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <BeforeAfter />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <ShowcaseGrid />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <ResultsKPIs />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <ForWhom />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <PricingSales />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <ContactForm />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
