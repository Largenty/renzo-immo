'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../card'
import { Button } from '../button'
import { Badge } from '../badge'

const plans = [
  {
    name: 'Starter',
    price: '19',
    credits: 20,
    description: 'Parfait pour commencer',
    features: [
      '20 crédits / mois',
      'Dépersonnalisation',
      'Home staging',
      'Support par email',
      'Qualité HD',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '49',
    credits: 100,
    description: 'Pour les professionnels',
    features: [
      '100 crédits / mois',
      'Toutes les transformations',
      'Rénovation virtuelle',
      'Support prioritaire',
      'API access',
    ],
    highlighted: true,
    badge: 'Populaire',
  },
  {
    name: 'Enterprise',
    price: '149',
    credits: 500,
    description: 'Pour les agences',
    features: [
      '500 crédits / mois',
      'Tout illimité',
      'Compte manager dédié',
      'Support 24/7',
      'Formation équipe',
      'Intégration personnalisée',
    ],
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Tarifs transparents
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choisissez le plan qui correspond à vos besoins. Sans engagement.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.highlighted
                  ? 'ring-2 ring-blue-600 shadow-xl scale-105'
                  : 'hover:shadow-lg transition-shadow'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">{plan.badge}</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-slate-900">{plan.price}€</span>
                  <span className="text-slate-600">/mois</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Link href="/auth/signup" className="w-full">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    size="lg"
                  >
                    Commencer
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust message */}
        <p className="text-center text-sm text-slate-500">
          Tous les plans incluent 7 jours d'essai gratuit. Annulation possible à tout moment.
        </p>
      </div>
    </section>
  )
}
