/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Temporarily ignore lint errors during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TS checks enabled to catch real type issues
    ignoreBuildErrors: false,
  },
  // Enable standalone output for Docker
  output: 'standalone',
};

export default nextConfig;


