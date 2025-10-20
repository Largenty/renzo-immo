import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEO_CONFIG, JSON_LD_ORGANIZATION, JSON_LD_PRODUCT } from "@/config/seo";
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
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
