import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 text-xl font-bold text-gray-900">Renzo</div>
            <p className="text-sm text-gray-600">
              Rénovation virtuelle par IA pour l'immobilier
            </p>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Légal</h3>
            <div className="space-y-2 text-sm">
              <Link href="/legal" className="block text-gray-600 hover:text-blue-600 transition-colors">
                Mentions légales
              </Link>
              <Link href="/privacy" className="block text-gray-600 hover:text-blue-600 transition-colors">
                Confidentialité
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Contact</h3>
            <p className="text-sm text-gray-600">contact@renzo-immo.fr</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          © 2025 Renzo Immobilier. Images générées par IA - rénovation virtuelle à titre illustratif.
        </div>
      </div>
    </footer>
  );
}
