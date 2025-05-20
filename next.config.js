/** 
 * @type {import('next').NextConfig} 
 */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://e-helpdesk-back-r1nabbk9f-richard-blackers-projects.vercel.app',
  },
  images: {
    unoptimized: true,
    domains: ['e-helpdesk-back-r1nabbk9f-richard-blackers-projects.vercel.app'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;