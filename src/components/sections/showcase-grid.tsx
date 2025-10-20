"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { gsap } from "@/lib/gsap-utils";
import { ArrowRight } from "lucide-react";

const cases = [
  {
    title: "Salon daté → moderne",
    cat: "Rénovation",
    before: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80",
    after: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80",
  },
  {
    title: "Cuisine sombre → claire",
    cat: "Home staging",
    before: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80",
    after: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=600&q=80",
  },
  {
    title: "Chambre encombrée → épurée",
    cat: "Dépersonnalisation",
    before: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80",
    after: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80",
  },
  {
    title: "Bureau → coworking",
    cat: "Projection",
    before: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    after: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80",
  },
  {
    title: "Appart étudiant → familial",
    cat: "Transformation",
    before: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    after: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
  },
  {
    title: "Loft industriel → cosy",
    cat: "Modernisation",
    before: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&q=80",
    after: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=600&q=80",
  },
];

export function ShowcaseGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: i * 0.1,
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50">
      <div className="container max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Cas d'usage
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            De la dépersonnalisation au home staging, transformez n'importe quel espace
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c, i) => (
            <Card
              key={i}
              ref={(el) => {cardsRef.current[i] = el;}}
              className="group overflow-hidden bg-white border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={c.before}
                  alt={c.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-xs font-medium text-blue-400 mb-1">{c.cat}</div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {c.title}
                    <ArrowRight className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" size={16} />
                  </h3>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
