'use client'

import { Upload, Wand2, Download, Check } from 'lucide-react'
import { Card } from '../card'

const steps = [
  {
    icon: Upload,
    title: 'Téléchargez vos photos',
    description: 'Importez les photos de votre bien immobilier en quelques clics',
    color: 'blue',
  },
  {
    icon: Wand2,
    title: 'Choisissez votre style',
    description: 'Sélectionnez le type de transformation : dépersonnalisation, home staging, ou rénovation',
    color: 'indigo',
  },
  {
    icon: Check,
    title: 'L\'IA transforme',
    description: 'Notre intelligence artificielle génère des rendus photoréalistes en quelques secondes',
    color: 'purple',
  },
  {
    icon: Download,
    title: 'Téléchargez le résultat',
    description: 'Récupérez vos images transformées en haute qualité, prêtes à publier',
    color: 'blue',
  },
]

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
}

export function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Quatre étapes simples pour transformer vos espaces
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            const colors = colorClasses[step.color as keyof typeof colorClasses]

            return (
              <Card key={index} className="relative p-6 hover:shadow-lg transition-shadow">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 ${colors.bg} ${colors.text} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {step.description}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
