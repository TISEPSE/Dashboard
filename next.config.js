// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: true,
  },
  allowedDevOrigins: ['http://192.168.1.138:3000'],
}

module.exports = nextConfig
