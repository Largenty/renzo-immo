"use client";

import { useState } from "react";
import { PRICING } from "@/config/pricing";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function PricingSales() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="tarifs" className="py-24 gradient-bg-1">
      <div className="container max-w-6xl">
        <h2 className="mb-4 text-center text-4xl font-bold lg:text-5xl">
          <span className="gradient-text">Tarifs transparents</span>
        </h2>
        <p className="mb-8 text-center text-gray-600">
          {PRICING.note}
        </p>

        <div className="mb-12 flex justify-center gap-4">
          <button
            onClick={() => setIsYearly(false)}
            className={`rounded-md px-6 py-2 font-medium transition-all ${!isYearly ? "bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-white border border-gray-300 text-gray-600 hover:border-blue-300"}`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`rounded-md px-6 py-2 font-medium transition-all ${isYearly ? "bg-gradient-to-r from-blue-600 to-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-white border border-gray-300 text-gray-600 hover:border-blue-300"}`}
          >
            Annuel <span className="text-xs">(-20%)</span>
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PRICING.plans.map((plan) => (
            <Card
              key={plan.id}
              className={`group relative ${plan.popular ? "border-blue-400 border-2 shadow-2xl shadow-blue-500/20" : "border-blue-200/50"} bg-white hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-sm bg-gradient-to-r from-blue-600 to-blue-600 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                  Populaire
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-gray-900">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold gradient-text">
                    {isYearly ? plan.priceYearly : plan.priceMonthly}€
                  </span>
                  <span className="text-gray-500">
                    /{isYearly ? "an" : "mois"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className={`w-full ${plan.popular ? "bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white" : "border-blue-300 hover:bg-blue-50 text-blue-700"}`} variant={plan.popular ? "default" : "outline"}>
                  Choisir {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
