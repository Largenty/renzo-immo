import { withSentryConfig } from '@sentry/nextjs';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rbtosufegzicxvenwtpt.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // ✅ Activer l'instrumentation pour Sentry
  experimental: {
    instrumentationHook: true,
  },

  // ✅ FIX WEBPACK WARNING: Optimiser le cache pour les gros fichiers
  webpack: (config, { isServer }) => {
    // Ignorer le warning pour les gros strings dans le cache
    config.infrastructureLogging = {
      level: 'error',
    };

    // ✅ NOTE: Tree-shaking is already enabled by default in Next.js
    // Named imports from lucide-react are automatically tree-shaken
    // No additional configuration needed

    return config;
  },

  // ✅ SECURITY HEADERS: Protection contre XSS, clickjacking, etc.
  async headers() {
    return [
      {
        // Appliquer à toutes les routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            // HSTS: Force HTTPS pendant 2 ans (incluant sous-domaines)
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // Prévient le clickjacking (uniquement sur même origine)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Bloque le sniffing de type MIME
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Active la protection XSS du navigateur
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // Contrôle les informations du Referer header
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            // Restreint les permissions du navigateur
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Pour ne pas uploader les sourcemaps en dev
  silent: process.env.NODE_ENV !== 'production',

  // Désactiver l'upload des sourcemaps si pas de token configuré
  dryRun: !process.env.SENTRY_AUTH_TOKEN,

  // Organisation et projet Sentry (à configurer)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

// Exporter la config avec Bundle Analyzer et Sentry
const configWithAnalyzer = withBundleAnalyzer(nextConfig);

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(configWithAnalyzer, sentryWebpackPluginOptions)
  : configWithAnalyzer;
