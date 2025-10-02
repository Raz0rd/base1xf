/** @type {import('next').NextConfig} */
const nextConfig = {
  // SSR + APIs habilitados, não usamos export
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // evita erro com o otimizador de imagens do Next
  },
  trailingSlash: true,

  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }

    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: false,
          vendors: false,
          ui: {
            name: 'ui',
            chunks: 'all',
            test: /[\\/]components[\\/]/,
            priority: 20,
          },
          hooks: {
            name: 'hooks',
            chunks: 'all',
            test: /[\\/]hooks[\\/]/,
            priority: 10,
          },
        },
      },
    }

    return config
  },

  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-switch',
      '@radix-ui/react-dialog'
    ],
  },
}

export default nextConfig
