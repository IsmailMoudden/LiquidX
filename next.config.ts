import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint 9 flat config + Next.js 15 built-in linter have a known option mismatch.
  // Linting still works via `eslint .` — just skip it during `next build`.
  eslint: { ignoreDuringBuilds: true },
  // Tell Next.js not to bundle these server-side packages — load from node_modules directly.
  // xrpl uses ws which has native bindings (bufferutil, utf-8-validate) that break when bundled.
  serverExternalPackages: ["xrpl", "bufferutil", "utf-8-validate"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "media2.homegate.ch",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // xrpl uses Node built-ins — polyfill/stub them in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        "fs/promises": false,
      };
    }
    return config;
  },
};

export default nextConfig;
