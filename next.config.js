/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack is now default in Next.js 16
  // The webpack config below is for fallback to webpack if needed
  turbopack: {
    // Empty config to silence the migration warning
    // The webpack fallback config below will be used if --webpack flag is passed
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  // Désactiver l'export statique pour permettre les API routes
  // output: 'export'
};

module.exports = nextConfig;