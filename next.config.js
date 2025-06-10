/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_PRIVY_APP_ID: 'cmbg3xtxt00ffju0mvd9uds6b'
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    }
    
    // Add module resolution fixes for packages without proper exports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    // Fix for @nemi-fi/wallet-sdk and similar packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@nemi-fi/wallet-sdk': require.resolve('@nemi-fi/wallet-sdk'),
    };
    
    // Add externals for server-side
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    return config;
  },
  experimental: {
    esmExternals: true,
  },
  transpilePackages: ['@nemi-fi/wallet-sdk'],
}

module.exports = nextConfig 