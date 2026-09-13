/** @type {import('next').NextConfig} */
const versionDeploiement = process.env.GITHUB_SHA || Date.now().toString();

const nextConfig = {
  env: {
    NEXT_PUBLIC_VERSION_DEPLOIEMENT: versionDeploiement,
  },
  // Turbopack is now default in Next.js 16
  // The webpack config below is for fallback to webpack if needed
  turbopack: {
    // Empty config to silence the migration warning
    // The webpack fallback config below will be used if --webpack flag is passed
  },
  experimental: {
    // 20 Mo de fichiers encodés en Base64 représentent environ 27 Mo de JSON.
    proxyClientMaxBodySize: "30mb",
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
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
