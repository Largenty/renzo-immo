"use client";

const logos = ["Century 21", "Foncia", "Laforêt", "Orpi", "Guy Hoquet", "Nexity"];

export function LogosMarquee() {
  return (
    <section className="border-y border-gray-200 bg-gray-50 py-12">
      <p className="mb-8 text-center text-sm text-gray-600">
        Ils nous font confiance
      </p>
      <div className="overflow-hidden">
        <div className="flex gap-12 animate-marquee">
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} className="flex min-w-[200px] items-center justify-center opacity-60">
              <span className="text-xl font-bold text-gray-700">{logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
