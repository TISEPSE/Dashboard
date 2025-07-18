/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://192.168.1.138:3000'],
  experimental: {
    // Désactiver le dev build indicator qui peut causer des erreurs
    devOverlays: {
      indicator: false,
    },
  },
  // Configuration pour réduire les erreurs de console en développement
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
