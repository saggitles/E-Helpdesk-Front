/** 
 * @type {import('next').NextConfig} 
 */
const nextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://e-helpdesk-back-dgcjdsb9djh2hgbn.eastus-01.azurewebsites.net',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.azurewebsites.net',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      }
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'export',
  trailingSlash: true,
};

module.exports = nextConfig;