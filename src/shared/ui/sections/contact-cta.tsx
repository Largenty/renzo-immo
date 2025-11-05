'use client'

import Link from 'next/link'
import { Button } from '../button'
import { ArrowRight, Mail } from 'lucide-react'

export function ContactCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          Prêt à transformer vos espaces ?
        </h2>

        {/* Description */}
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Rejoignez les centaines de professionnels qui utilisent déjà RENZO pour vendre plus vite et mieux.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="mailto:contact@renzo-immo.fr">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-white text-white hover:bg-white/10"
            >
              <Mail className="mr-2 h-5 w-5" />
              Nous contacter
            </Button>
          </a>
        </div>

        {/* Trust indicators */}
        <div className="pt-8 border-t border-blue-500/30">
          <p className="text-sm text-blue-100">
            Essai gratuit de 7 jours • Sans carte bancaire • Annulation à tout moment
          </p>
        </div>
      </div>
    </section>
  )
}
