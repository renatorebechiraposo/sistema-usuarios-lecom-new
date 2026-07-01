import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/lecom/:path*',
        destination: 'https://api.lecom.com.br/:path*', // A URL base da Lecom
      },
    ]
  },
}

module.exports = {
  allowedDevOrigins: ['172.22.156.95'],
}

export default nextConfig
