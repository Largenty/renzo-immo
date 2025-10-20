"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap-utils";
import { ArrowRight, Check } from "lucide-react";

const solutions = [
  {
    title: "Dépersonnalisation Intelligente",
    description: "Transformez un bien encombré en espace neutre et moderne. Choisissez entre dépersonnalisation standard ou premium avec murs blancs et sols de base. Option avec ou sans meubles selon vos besoins.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=90",
    features: ["Suppression objets personnels", "Mode premium disponible", "Avec ou sans meubles", "Rendu photoréaliste"]
  },
  {
    title: "Home Staging Multi-Styles",
    description: "Plus de 8 styles prédéfinis (Moderne, Scandinave, Industriel, Luxe, Contemporain) ou créez vos propres styles personnalisés. Organisez par type de pièce (salon, cuisine, chambre, etc.) pour une gestion optimale.",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=90",
    features: ["8+ styles prédéfinis", "Styles personnalisables", "Organisation par pièce", "Mobilier photoréaliste"]
  },
  {
    title: "Rénovation & Styles Personnalisés",
    description: "Modernisez avec nos styles de rénovation luxe ou contemporain. Créez vos propres styles avec descriptions sur-mesure. Gérez tous vos projets depuis un dashboard intuitif avec suivi en temps réel.",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=90",
    features: ["Rénovation luxe & contemporaine", "Styles sur-mesure", "Dashboard de gestion", "Suivi temps réel"]
  }
];

export function SolutionsGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
            once: true
          }
        }
      );

      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll(".solution-card");
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: i * 0.2,
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                once: true
              }
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 gradient-bg-2">
      <div className="container max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header minimaliste style Jonite */}
        <div ref={titleRef} className="max-w-3xl mb-20">
          <div className="text-sm tracking-[0.2em] uppercase text-slate-500 mb-4">Nos Solutions</div>
          <h2 className="text-5xl lg:text-6xl font-light tracking-tight text-slate-900 mb-6">
            Une plateforme complète pour<br />
            <span className="gradient-text font-medium">transformer vos biens</span>
          </h2>
          <p className="text-lg text-slate-600 font-light leading-relaxed">
            Créez vos styles personnalisés, organisez par pièce, gérez vos projets. Notre IA s'adapte à vos besoins avec des rendus photoréalistes en quelques minutes.
          </p>
        </div>

        {/* Grid de solutions - style Jonite avec grandes images */}
        <div ref={cardsRef} className="space-y-24">
          {solutions.map((solution, index) => (
            <div
              key={solution.title}
              className={`solution-card grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                index % 2 === 1 ? "lg:grid-flow-dense" : ""
              }`}
            >
              {/* Image immersive */}
              <div className={`relative ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                <div className="relative aspect-[4/3] rounded-md overflow-hidden shadow-2xl group">
                  <Image
                    src={solution.image}
                    alt={solution.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>

              {/* Contenu minimaliste */}
              <div className={`space-y-6 ${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                <div className="inline-flex items-center gap-3 text-sm text-blue-600 font-medium">
                  <span className="w-8 h-px bg-blue-600"></span>
                  Solution {index + 1}
                </div>

                <h3 className="text-4xl lg:text-5xl font-light tracking-tight text-slate-900">
                  {solution.title}
                </h3>

                <p className="text-lg text-slate-600 leading-relaxed font-light">
                  {solution.description}
                </p>

                {/* Features list style Jonite */}
                <ul className="space-y-3 pt-4">
                  {solution.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-sm bg-blue-600"></div>
                      <span className="font-light">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA minimaliste */}
                <button className="group mt-6 inline-flex items-center gap-2 text-blue-600 font-medium hover:gap-3 transition-all duration-300">
                  En savoir plus
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA agressif avec urgence */}
        <div className="mt-32 pt-16 border-t border-slate-200">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-md p-12 lg:p-16 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-sm blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-sm blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-3xl">
              {/* Badge urgence */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-sm mb-6">
                <div className="w-2 h-2 rounded-sm bg-green-400 animate-pulse"></div>
                <span className="text-sm font-semibold">Offre limitée · 3 crédits gratuits</span>
              </div>

              <h3 className="text-4xl lg:text-5xl font-bold mb-6">
                Générez votre première photo HD maintenant
              </h3>

              <p className="text-xl text-blue-50 mb-8 font-light">
                <strong className="font-semibold">2,400+ agents</strong> vendent déjà plus vite avec Renzo.
                Rejoignez-les en 30 secondes, sans carte bancaire.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-blue-600 px-10 py-5 rounded-md transition-all duration-300 font-bold text-lg shadow-2xl">
                  Démarrer gratuitement
                  <ArrowRight size={22} />
                </button>
                <button className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:bg-white/10 text-white px-8 py-5 rounded-md transition-all duration-300 font-semibold">
                  Voir une démo rapide
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-8 mt-8 pt-8 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-green-300" />
                  <span className="text-sm text-blue-50">Sans engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-green-300" />
                  <span className="text-sm text-blue-50">Résultats en 3 min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-green-300" />
                  <span className="text-sm text-blue-50">Support 7j/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
