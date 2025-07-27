/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['bcrypt', 'bcryptjs'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('bcrypt');
    }
    return config;
  },
}

export default nextConfig
