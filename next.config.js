/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  distDir: "dist",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://e-helpdesk-back-r1nabbk9f-richard-blackers-projects.vercel.app/',
  },
  // Set proper asset prefix for GitHub Pages deployment
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
  basePath: '',
  images: {
    unoptimized: true,
    domains: ['e-helpdesk-back-r1nabbk9f-richard-blackers-projects.vercel.app'],
  },
  // Set cache headers to improve loading
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          }
        ],
      },
    ]
  }
};

module.exports = nextConfig;