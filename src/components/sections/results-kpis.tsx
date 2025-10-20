import { Card, CardContent } from "@/components/ui/card";

const kpis = [
  { label: "Taux de clic", value: "+32%", note: "vs annonces standards" },
  { label: "Visites organisées", value: "+18%", note: "selon pilotes" },
  { label: "Temps passé", value: "2.3x", note: "sur l'annonce" },
  { label: "Taux de contact", value: "+24%", note: "demandes de visite" },
];

export function ResultsKPIs() {
  return (
    <section className="py-24 gradient-bg-2">
      <div className="container max-w-5xl">
        <h2 className="mb-12 text-center text-4xl font-bold lg:text-5xl">
          <span className="gradient-text">Résultats mesurables</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-4">
          {kpis.map((kpi, i) => (
            <Card key={i} className="group bg-white border-blue-200/50 text-center hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="mb-2 text-4xl font-bold gradient-text group-hover:scale-110 transition-transform">{kpi.value}</div>
                <div className="mb-1 font-semibold text-gray-900">{kpi.label}</div>
                <div className="text-xs text-gray-500">{kpi.note}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-gray-500">
          * Indicateurs issus de pilotes avec agences partenaires
        </p>
      </div>
    </section>
  );
}
