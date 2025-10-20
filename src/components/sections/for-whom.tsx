import { Building2, Users, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const targets = [
  {
    icon: Building2,
    title: "Agences immobilières",
    benefits: ["Plus de mandats exclusifs", "Annonces premium", "Démarquage concurrentiel"],
  },
  {
    icon: Users,
    title: "Promoteurs & marchands",
    benefits: ["Projection sur plans", "Options de finitions", "Accélération ventes VEFA"],
  },
  {
    icon: Home,
    title: "Particuliers vendeurs",
    benefits: ["Vente plus rapide", "Prix soutenu", "Moins de négociation"],
  },
];

export function ForWhom() {
  return (
    <section className="py-24 bg-white">
      <div className="container max-w-6xl">
        <h2 className="mb-12 text-center text-4xl font-bold lg:text-5xl">
          <span className="gradient-text">Pour qui ?</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {targets.map((t, i) => {
            const Icon = t.icon;
            return (
              <Card key={i} className="group bg-white border-blue-200/50 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
                <CardHeader>
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-md bg-gradient-to-br from-blue-100 to-blue-100 group-hover:scale-110 transition-transform">
                    <Icon className="text-blue-600" size={28} />
                  </div>
                  <CardTitle className="text-gray-900">{t.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {t.benefits.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-600">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
