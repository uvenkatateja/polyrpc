/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to FastAPI backend during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
