/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir acceso desde túnel Cloudflare en desarrollo
  allowedDevOrigins: [
    'cst-prime-collectables-attorneys.trycloudflare.com'
  ],
};

module.exports = nextConfig;
