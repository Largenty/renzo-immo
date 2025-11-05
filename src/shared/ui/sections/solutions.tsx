'use client'

import { Eraser, Home, Paintbrush } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../card'
import { Badge } from '../badge'

const solutions = [
  {
    icon: Eraser,
    title: 'Dépersonnalisation',
    description: 'Supprimez les objets personnels et le désordre pour mettre en valeur l\'espace',
    features: [
      'Retrait des photos et décorations personnelles',
      'Nettoyage visuel des espaces',
      'Mise en valeur de l\'architecture',
    ],
    badge: 'Populaire',
  },
  {
    icon: Home,
    title: 'Home Staging Virtuel',
    description: 'Ajoutez du mobilier et de la décoration pour créer une ambiance accueillante',
    features: [
      'Plusieurs styles au choix',
      'Mobilier adapté aux dimensions',
      'Ambiances personnalisées',
    ],
    badge: 'Recommandé',
  },
  {
    icon: Paintbrush,
    title: 'Rénovation Virtuelle',
    description: 'Visualisez le potentiel d\'un bien après travaux de rénovation',
    features: [
      'Modernisation des espaces',
      'Changement de matériaux',
      'Projection avant travaux',
    ],
    badge: 'Nouveau',
  },
]

export function Solutions() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Nos solutions
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Trois types de transformations pour répondre à tous vos besoins
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon

            return (
              <Card key={index} className="relative hover:shadow-xl transition-shadow">
                {solution.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">{solution.badge}</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl">{solution.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-slate-600">{solution.description}</p>

                  <ul className="space-y-2">
                    {solution.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2 text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
