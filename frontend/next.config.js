const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Cache configuration for production stability
  cacheMaxMemorySize: 50 * 1024 * 1024, // 50MB
  // Disable problematic caches in development to prevent corruption
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      isrMemoryCacheSize: 0, // Disable ISR memory cache in development
    }
  }),
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "pharmint.net",
      },
      {
        protocol: "http",
        hostname: "pharmint.net",
      },
    ],
  },
}

module.exports = nextConfig
