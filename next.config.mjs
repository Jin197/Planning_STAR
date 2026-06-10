/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Necessaire pour @supabase/ssr cote serveur
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
