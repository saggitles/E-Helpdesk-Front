/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  distDir: "dist",
  // Remove redundant env variables since they're already accessible from .env.local
};

module.exports = nextConfig;