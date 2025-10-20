import { Hero } from "@/components/sections/hero";
import { LogosMarquee } from "@/components/sections/logos-marquee";
import { SolutionsGrid } from "@/components/sections/solutions-grid";
import { HowItWorks } from "@/components/sections/how-it-works";
import { BeforeAfter } from "@/components/sections/before-after";
import { ShowcaseGrid } from "@/components/sections/showcase-grid";
import { ResultsKPIs } from "@/components/sections/results-kpis";
import { ForWhom } from "@/components/sections/for-whom";
import { PricingSales } from "@/components/sections/pricing-sales";
import { ContactForm } from "@/components/sections/contact-form";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogosMarquee />
      <SolutionsGrid />
      <HowItWorks />
      <BeforeAfter />
      <ShowcaseGrid />
      <ResultsKPIs />
      <ForWhom />
      <PricingSales />
      <ContactForm />
    </>
  );
}
