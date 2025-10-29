"use client";

import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function CreditsInfoCard() {
  return (
    <Card className="modern-card p-6 bg-slate-50">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Zap className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Comment fonctionnent les crédits ?
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <strong className="text-slate-900">1 crédit</strong> = 1 image en
              qualité standard (1024x1024)
            </p>
            <p>
              <strong className="text-slate-900">2 crédits</strong> = 1 image en
              qualité HD (2048x2048)
            </p>
            <p>
              Les crédits de votre forfait se renouvellent chaque mois. Les
              crédits achetés en supplément n&apos;expirent jamais.
            </p>
            <p>
              <strong className="text-slate-900">Important :</strong> Si vous
              n&apos;avez plus de crédits disponibles, vous ne pourrez pas générer de
              nouvelles images ou apporter des modifications à vos projets.
              Pensez à acheter un pack de crédits supplémentaires ou à changer
              de forfait.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
