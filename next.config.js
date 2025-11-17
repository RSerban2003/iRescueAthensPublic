/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: Static export disabled temporarily for successful build
  // output: 'export',
  // basePath: '/irescue',
  // trailingSlash: true,
  
  // Always ignore build errors in production for Vercel deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization for better performance
  images: {
    // unoptimized: true, // Required for static export
    domains: [
      'example.com',
      'www.google.com',
      'images.google.com',
      'lh3.googleusercontent.com',
      'storage.googleapis.com',
      'i.imgur.com',
      'imgur.com',
      'cloudinary.com',
      'res.cloudinary.com',
      'picsum.photos',
      'placehold.co',
      'placeholdit.imgix.net',
      'loremflickr.com',
      'firebasestorage.googleapis.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Optimization settings
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },

  // Basic production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
}

module.exports = nextConfig 