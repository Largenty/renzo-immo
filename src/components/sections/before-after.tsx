"use client";

import { useState } from "react";

export function BeforeAfter() {
  const [position, setPosition] = useState(50);

  return (
    <section className="py-24 bg-gray-50">
      <div className="container max-w-4xl">
        <h2 className="mb-12 text-center text-4xl font-bold text-gray-900 lg:text-5xl">
          Avant/Après photoréaliste
        </h2>
        <div className="relative aspect-video overflow-hidden rounded-md bg-white shadow-2xl border border-gray-200">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            [Slider Avant/Après interactif]
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="absolute bottom-4 left-1/2 w-64 -translate-x-1/2 accent-blue-600"
            aria-label="Curseur avant/après"
          />
        </div>
      </div>
    </section>
  );
}
