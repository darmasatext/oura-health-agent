import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - allowedDevOrigins existe pero TypeScript no lo reconoce en v16
  allowedDevOrigins: [
    'delete-legislature-making-rubber.trycloudflare.com',
    'opponent-perspectives-finished-tue.trycloudflare.com',
    'tanks-grain-height-scope.trycloudflare.com',
    'guild-struck-blacks-gibraltar.trycloudflare.com',
    'expertise-lbs-nascar-viewers.trycloudflare.com',
    'massachusetts-vary-architect-pontiac.trycloudflare.com'
  ],
};

export default nextConfig;
