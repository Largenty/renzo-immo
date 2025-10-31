import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthStoreProvider } from "@/components/providers/auth-store-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SEO_CONFIG, JSON_LD_ORGANIZATION, JSON_LD_PRODUCT } from "@/config/seo";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: SEO_CONFIG.title,
  description: SEO_CONFIG.description,
  keywords: SEO_CONFIG.keywords,
  openGraph: {
    title: SEO_CONFIG.title,
    description: SEO_CONFIG.description,
    url: SEO_CONFIG.url,
    siteName: "Renzo Immobilier",
    locale: SEO_CONFIG.locale,
    type: "website",
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
  return (
    <html lang="fr" className={GeistSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_ORGANIZATION) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_PRODUCT) }}
        />
      </head>
      <body className="font-sans">
        <QueryProvider>
          <AuthStoreProvider>
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
          </AuthStoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
