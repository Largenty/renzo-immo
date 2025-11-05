import type { Metadata } from "next";
import { SEO_CONFIG } from "@/config/seo";
import { Hero, HowItWorks, Solutions, Showcase, Pricing, ContactCTA } from "@/shared";

export const metadata: Metadata = {
  title: SEO_CONFIG.title,
  description: SEO_CONFIG.description,
  keywords: SEO_CONFIG.keywords,
  openGraph: {
    title: SEO_CONFIG.title,
    description: SEO_CONFIG.description,
    images: [SEO_CONFIG.ogImage],
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Solutions />
      <Showcase />
      <Pricing />
      <ContactCTA />
    </main>
  );
}
