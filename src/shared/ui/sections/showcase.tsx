'use client'

import { BeforeAfter } from '../before-after'

export function Showcase() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Des résultats photoréalistes
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Découvrez la puissance de notre IA avec ces exemples de transformations
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="space-y-12">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Dépersonnalisation</h3>
            <BeforeAfter
              beforeImage="https://placehold.co/1920x1080/e2e8f0/64748b?text=Avant+Depersonnalisation"
              afterImage="https://placehold.co/1920x1080/dbeafe/3b82f6?text=Apres+Depersonnalisation"
              beforeLabel="Avant"
              afterLabel="Après"
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Home Staging</h3>
            <BeforeAfter
              beforeImage="https://placehold.co/1920x1080/e2e8f0/64748b?text=Avant+Home+Staging"
              afterImage="https://placehold.co/1920x1080/dbeafe/3b82f6?text=Apres+Home+Staging"
              beforeLabel="Vide"
              afterLabel="Meublé"
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Rénovation Virtuelle</h3>
            <BeforeAfter
              beforeImage="https://placehold.co/1920x1080/e2e8f0/64748b?text=Avant+Renovation"
              afterImage="https://placehold.co/1920x1080/dbeafe/3b82f6?text=Apres+Renovation"
              beforeLabel="Ancien"
              afterLabel="Rénové"
            />
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-sm text-slate-500 mt-12">
          💡 Déplacez le curseur pour comparer les résultats avant/après
        </p>
      </div>
    </section>
  )
}
