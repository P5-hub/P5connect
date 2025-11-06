import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sony.ch",
      },
      {
        protocol: "https",
        hostname: "www.sony.ch",
      },
      {
        protocol: "https",
        hostname: "sony.scene7.com",   // ✅ hinzugefügt
        pathname: "/is/image/**",      // nur Produktbilder erlauben
      },
      {
        protocol: "https",
        hostname: "sony.scene7.com",
        pathname: "/is/image/sonyglobalsolutions/**",
      },
      {
        protocol: "https",
        hostname: "ozqlgctoaktktocqaxai.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
