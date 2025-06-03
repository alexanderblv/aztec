/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_PRIVY_APP_ID: 'cmbg3xtxt00ffju0mvd9uds6b'
  },
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  experimental: {
    esmExternals: true,
  },
}

module.exports = nextConfig 