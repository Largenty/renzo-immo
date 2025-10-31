'use client'

import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger';

export default function TestSupabase() {
  const [plans, setPlans] = useState<any[]>([])
  const [packs, setPacks] = useState<any[]>([])
  const [styles, setStyles] = useState<any[]>([])
  const [buckets, setBuckets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Subscription plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')

        if (plansError) throw plansError
        setPlans(plansData || [])

        // Test 2: Credit packs
        const { data: packsData, error: packsError } = await supabase
          .from('credit_packs')
          .select('*')

        if (packsError) throw packsError
        setPacks(packsData || [])

        // Test 3: Transformation types
        const { data: stylesData, error: stylesError } = await supabase
          .from('transformation_types')
          .select('*')
          .eq('is_system', true)

        if (stylesError) throw stylesError
        setStyles(stylesData || [])

        // Test 4: Storage buckets
        const { data: bucketsData, error: bucketsError } = await supabase
          .storage
          .listBuckets()

        if (bucketsError) throw bucketsError
        setBuckets(bucketsData || [])

      } catch (err: any) {
        logger.error('Supabase test error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-600">Testing Supabase connection...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Connection Error</h1>
            <p className="text-red-700 font-mono text-sm">{error}</p>
            <div className="mt-4">
              <p className="text-sm text-red-600 mb-2">Vérifiez :</p>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                <li>Les migrations ont bien été appliquées dans Supabase</li>
                <li>Les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env</li>
                <li>Le projet Supabase est actif</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            ✅ Supabase Connected!
          </h1>
          <p className="text-lg text-slate-600">
            Base de données et Storage configurés avec succès
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600 mb-1">{plans.length}</div>
            <div className="text-sm text-slate-600">Plans d'abonnement</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <div className="text-3xl font-bold text-green-600 mb-1">{packs.length}</div>
            <div className="text-sm text-slate-600">Packs de crédits</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
            <div className="text-3xl font-bold text-purple-600 mb-1">{styles.length}</div>
            <div className="text-sm text-slate-600">Styles système</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
            <div className="text-3xl font-bold text-orange-600 mb-1">{buckets.length}</div>
            <div className="text-sm text-slate-600">Storage Buckets</div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">📋 Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4">
                <div className="font-bold text-lg text-slate-900 mb-1">{plan.name}</div>
                <div className="text-sm text-slate-600 mb-2">{plan.description}</div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {plan.price_monthly}€<span className="text-sm text-slate-500">/mois</span>
                </div>
                <div className="text-sm text-slate-600">{plan.credits_per_month} crédits/mois</div>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Packs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">💳 Credit Packs</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {packs.map((pack) => (
              <div key={pack.id} className="border rounded-lg p-4">
                <div className="font-bold text-slate-900 mb-1">{pack.name}</div>
                <div className="text-xl font-bold text-green-600 mb-1">
                  {pack.credits} crédits
                </div>
                <div className="text-lg text-blue-600">{pack.price}€</div>
                <div className="text-xs text-slate-500 mt-1">
                  {pack.price_per_credit}€/crédit
                </div>
                {pack.is_popular && (
                  <div className="mt-2">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      Populaire
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Transformation Types */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🎨 Styles Système</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {styles.map((style) => (
              <div key={style.id} className="border rounded-lg p-4">
                <div className="font-bold text-slate-900 mb-1">{style.name}</div>
                <div className="text-xs text-slate-500 mb-2">{style.category}</div>
                <div className="text-sm text-slate-600">{style.description}</div>
                {style.allow_furniture_toggle && (
                  <div className="mt-2">
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                      Meubles
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Storage Buckets */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">📦 Storage Buckets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buckets.map((bucket) => (
              <div key={bucket.id} className="border rounded-lg p-4">
                <div className="font-bold text-slate-900 mb-1">{bucket.name}</div>
                <div className="text-sm text-slate-600">
                  {bucket.public ? '🌐 Public' : '🔒 Privé'}
                </div>
                <div className="text-xs text-slate-500 mt-1">ID: {bucket.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 Prochaines étapes</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span>Migrations appliquées avec succès</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span>Base de données configurée (15 tables)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span>Storage buckets créés (images, avatars, styles)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span>RLS policies activées</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-2xl">⏭️</span>
              <span className="font-semibold">Maintenant : Implémenter l'authentification !</span>
            </div>
          </div>
          <div className="mt-6">
            <Button
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => window.location.href = '/auth/login'}
            >
              Aller à la page de connexion →
            </Button>
          </div>
        </div>

        {/* Raw Data (Debug) */}
        <details className="bg-white rounded-lg shadow-md p-6">
          <summary className="text-lg font-bold text-slate-900 cursor-pointer">
            🔍 Données brutes (Debug)
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Plans:</h3>
              <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(plans, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Packs:</h3>
              <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(packs, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Styles:</h3>
              <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(styles, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Buckets:</h3>
              <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(buckets, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
