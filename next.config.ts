import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Only run ESLint and TypeScript checks in local development
const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.CI;

const nextConfig: NextConfig = {
  eslint: {
    dirs: [
      "app",
      "components",
      "lib",
      "types",
      "hooks",
      "context",
      "i18n",
      "src",
      "features",
    ],
    // Only run ESLint during builds in local development
    ignoreDuringBuilds: !isLocalDev,
  },
  typescript: {
    // Only run TypeScript checks during builds in local development
    ignoreBuildErrors: !isLocalDev,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/9.x/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        port: "",
        pathname: "/vi/**",
      },
    ],
  },
  // Optimize chunk loading and prevent ChunkLoadError
  experimental: {
    // Optimize for stability over aggressive caching
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Webpack optimizations for chunk loading
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize chunk splitting for better loading
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
};

const withNextIntl = createNextIntlPlugin('./lib/config/i18n/request.ts');

export default withNextIntl(nextConfig);
