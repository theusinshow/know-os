import type { NextConfig } from "next";

import { BASE_SECURITY_HEADERS } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [...BASE_SECURITY_HEADERS]
      }
    ];
  },
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
