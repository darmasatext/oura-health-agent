/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir acceso desde túnel Cloudflare en desarrollo
  allowedDevOrigins: [
    'outlined-vote-black-retirement.trycloudflare.com'
  ],
};

module.exports = nextConfig;
