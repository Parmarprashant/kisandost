import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // ── Silence the lockfile workspace-root warning ──
  outputFileTracingRoot: "D:\\1winbackup\\desktop\\Ganpat University\\kisandost\\kisan-dost\\ventureHack\\kisan-next",

  // Keep memory reasonable on Windows without breaking CSS extraction
  experimental: {
    cpus: 2,
  },
  webpack: (config, { isServer }) => {
    // Exclude mapbox-gl from SSR bundle — it uses browser-only APIs
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({ 'mapbox-gl': 'mapbox-gl' });
      }
    }
    return config;
  },
};

export default withNextIntl(nextConfig);