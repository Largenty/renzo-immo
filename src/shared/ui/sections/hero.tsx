'use client'

import Link from 'next/link'
import { Button } from '../button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Propulsé par l'Intelligence Artificielle</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight">
            Transformez vos espaces
            <br />
            avec l'<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">IA</span>
          </h1>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto">
            Dépersonnalisation, home staging et rénovation virtuelle en quelques clics.
            Vendez plus vite, vendez mieux.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">+32%</div>
              <div className="text-sm text-slate-600">de clics</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">+18%</div>
              <div className="text-sm text-slate-600">de visites</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">-20%</div>
              <div className="text-sm text-slate-600">de temps de vente</div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Voir la démo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <p className="text-sm text-slate-500 pt-8">
            Déjà utilisé par plus de 500 professionnels de l'immobilier
          </p>
        </div>
      </div>
    </section>
  )
}
