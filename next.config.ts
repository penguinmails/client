import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";


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
      "shared",
    ],
    ignoreDuringBuilds: false,
  },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
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
  // Turbopack configuration (replaces experimental.turbo)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
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

const withNextIntl = createNextIntlPlugin('./shared/config/i18n/request.ts');

export default withNextIntl(nextConfig);
