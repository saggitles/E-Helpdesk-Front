/** 
 * @type {import('next').NextConfig} 
 */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://e-helpdesk-back-r1nabbk9f-richard-blackers-projects.vercel.app/',
  },
  // GitHub Pages configuration
  basePath: process.env.NODE_ENV === 'production' ? '/E-Helpdesk-Front' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/E-Helpdesk-Front/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['e-helpdesk-back-r1nabbk9f-richard-blackers-projects.vercel.app'],
  },
  
  experimental: {},
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;