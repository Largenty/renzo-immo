import { Upload, Palette, Sparkles, Share2 } from "lucide-react";

const steps = [
  { icon: Upload, title: "Upload 1-5 photos", desc: "Salon, cuisine, chambre" },
  { icon: Palette, title: "Choisissez un style", desc: "Contemporain, scandinave, bohème" },
  { icon: Sparkles, title: "L'IA modernise", desc: "Peinture, sols, mobilier virtuel" },
  { icon: Share2, title: "Avant/Après partageable", desc: "Prêt pour l'annonce" },
];

export function HowItWorks() {
  const gradients = [
    "from-blue-100 to-blue-200",
    "from-cyan-100 to-cyan-200",
    "from-blue-100 to-blue-200",
    "from-blue-100 to-blue-200"
  ];

  return (
    <section id="comment-ca-marche" className="py-24 bg-white">
      <div className="container max-w-6xl">
        <h2 className="mb-16 text-center text-4xl font-bold lg:text-5xl">
          <span className="gradient-text">Comment ça marche ?</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const gradient = gradients[i];
            return (
              <div key={i} className="group text-center">
                <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-md bg-gradient-to-br ${gradient} text-blue-700 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-500/30`}>
                  <Icon size={32} />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
