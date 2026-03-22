import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js not to bundle these server-side packages — load from node_modules directly.
  // xrpl uses ws which has native bindings (bufferutil, utf-8-validate) that break when bundled.
  serverExternalPackages: ["xrpl", "bufferutil", "utf-8-validate"],
  experimental: {
    turbo: {},
  },
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
