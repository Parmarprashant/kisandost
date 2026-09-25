import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // ── Silence the lockfile workspace-root warning ──
  outputFileTracingRoot: "D:\\1winbackup\\desktop\\Ganpat University\\kisandost\\kisan-dost\\ventureHack\\kisan-next",

  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackMemoryOptimizations: true,
    webpackBuildWorker: false,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Memory cache — avoids disk I/O, keeps compiled modules in RAM
      config.cache = { type: 'memory' };

      // Limit webpack to 1 concurrent module compilation
      // This prevents multiple workers from each consuming 1-2 GB on Windows
      config.parallelism = 1;

      // Disable webpack's internal thread-loader (spawns child processes)
      // by setting the worker pool size to 0 (inline, single-process compilation)
      config.module = {
        ...config.module,
        rules: (config.module?.rules || []).map((rule: any) => {
          if (rule && rule.use && Array.isArray(rule.use)) {
            rule.use = rule.use.filter(
              (u: any) => !(typeof u === 'object' && u?.loader?.includes?.('thread-loader'))
            );
          }
          return rule;
        }),
      };
    }

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