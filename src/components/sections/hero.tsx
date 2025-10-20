"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gsap } from "@/lib/gsap-utils";
import { ArrowRight, Sparkles, Clock, Shield } from "lucide-react";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.2 },
        0.3
      );

      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1 },
        "-=0.8"
      );

      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 },
          "-=0.6"
        );
      }

      tl.fromTo(
        statsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4"
      );

      tl.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.95, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 1.4 },
        "-=1.2"
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-white via-slate-50/30 to-white">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-blue-500/5 rounded-sm blur-[100px]"></div>
      <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-indigo-500/5 rounded-sm blur-[100px]"></div>

      <div className="container relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Content - Clean & Professional */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 glass">
              <Sparkles size={16} className="text-blue-600" />
              <span className="text-sm text-slate-700 font-medium">Intelligence Artificielle</span>
              <div className="w-px h-4 bg-slate-300"></div>
              <span className="text-xs text-blue-600 font-semibold">NOUVEAU</span>
            </div>

            <h1 ref={titleRef} className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <span className="block text-slate-900">Vendez vos biens</span>
              <span className="block gradient-text">+32% plus rapidement</span>
            </h1>

            <p ref={subtitleRef} className="text-xl sm:text-2xl text-slate-600 leading-relaxed font-light max-w-xl">
              Transformez vos photos immobilières en visuels HD professionnels en 3 minutes.{" "}
              <span className="text-slate-900 font-medium">Sans compétences techniques.</span>
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-7 text-lg font-semibold rounded-md btn-glow transition-all duration-300 shadow-lg">
                    Essayer gratuitement
                    <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={20} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-slate-200 sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900">
                      Commencez maintenant
                    </DialogTitle>
                    <DialogDescription className="text-slate-600 text-base">
                      3 crédits gratuits · Sans carte bancaire
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="email" className="text-slate-700 font-medium">Email professionnel</Label>
                      <Input id="email" type="email" placeholder="vous@agence.fr" className="mt-2 h-12 rounded-md bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500" />
                    </div>
                    <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-md text-base btn-glow font-semibold">
                      Créer mon compte →
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50 px-8 py-7 text-lg rounded-md text-slate-700 hover:text-blue-600 transition-all duration-300 font-medium">
                Voir la démo
              </Button>
            </div>

            {/* Trust indicators */}
            <div ref={statsRef} className="flex items-center gap-6 pt-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={16} className="text-blue-600" />
                <span><strong className="text-slate-900 font-semibold">3 minutes</strong> par photo</span>
              </div>
              <div className="w-px h-5 bg-slate-300"></div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Shield size={16} className="text-blue-600" />
                <span><strong className="text-slate-900 font-semibold">2,4k+</strong> professionnels</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
              <div>
                <div className="text-3xl lg:text-4xl font-bold gradient-text mb-1">150k+</div>
                <div className="text-sm text-slate-500 font-medium">Photos générées</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold gradient-text mb-1">2.4k+</div>
                <div className="text-sm text-slate-500 font-medium">Professionnels</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold gradient-text mb-1">4.9</div>
                <div className="text-sm text-slate-500 font-medium">Note moyenne</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div ref={imageRef} className="relative">
            <div className="animated-border p-1">
              <div className="relative h-[500px] lg:h-[650px] rounded-md overflow-hidden bg-white shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=90"
                  alt="Rénovation IA immobilière"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/5 to-transparent"></div>

                {/* Live badge */}
                <div className="absolute top-6 left-6 glass px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-sm bg-green-500"></div>
                      <div className="absolute inset-0 w-2 h-2 rounded-sm bg-green-500 animate-ping"></div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">En direct</div>
                      <div className="text-[10px] text-slate-600">348 photos aujourd'hui</div>
                    </div>
                  </div>
                </div>

                {/* Performance badge */}
                <div className="absolute bottom-6 right-6 glass px-5 py-3 border border-blue-200/50">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Sparkles className="text-white" size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">2m 47s</div>
                      <div className="text-xs text-slate-600">Qualité HD</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
