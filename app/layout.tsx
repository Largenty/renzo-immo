import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { AuthProvider } from "@/shared";
import { QueryProvider } from "@/shared";
import {
  SEO_CONFIG,
  JSON_LD_ORGANIZATION,
  JSON_LD_PRODUCT,
} from "@/config/seo";
import { ConditionalLayout, ErrorBoundary } from "@/shared";
import { logger } from "@/lib/logger";
import "./globals.css";

export const metadata: Metadata = {
  title: SEO_CONFIG.title,
  description: SEO_CONFIG.description,
  keywords: SEO_CONFIG.keywords,
  metadataBase: new URL(SEO_CONFIG.url),
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: SEO_CONFIG.title,
    description: SEO_CONFIG.description,
    url: SEO_CONFIG.url,
    siteName: "Renzo Immobilier",
    locale: SEO_CONFIG.locale,
    type: "website",
    images: SEO_CONFIG.ogImage ? [{ url: SEO_CONFIG.ogImage }] : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.title,
    description: SEO_CONFIG.description,
    creator: SEO_CONFIG.twitterHandle,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ Sérialiser les JSON-LD de manière sécurisée
  let organizationJsonLd = "";
  let productJsonLd = "";

  try {
    organizationJsonLd = JSON.stringify(JSON_LD_ORGANIZATION);
  } catch (error) {
    logger.error("Failed to serialize JSON_LD_ORGANIZATION:", error);
  }

  try {
    productJsonLd = JSON.stringify(JSON_LD_PRODUCT);
  } catch (error) {
    logger.error("Failed to serialize JSON_LD_PRODUCT:", error);
  }

  return (
    <html lang="fr" className={GeistSans.variable}>
      <head>
        {/* ✅ JSON-LD pour le SEO */}
        {organizationJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
          />
        )}
        {productJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: productJsonLd }}
          />
        )}
      </head>
      <body className="font-sans">
        {/* ✅ ErrorBoundary pour capturer les erreurs dans les providers */}
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
              <Toaster
                position="bottom-right"
                closeButton
                richColors
                toastOptions={{
                  duration: 4000,
                }}
              />
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
