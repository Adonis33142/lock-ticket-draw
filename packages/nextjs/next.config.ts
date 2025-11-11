import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Resolve @fhevm-sdk from node_modules
    const sdkPath = path.resolve(__dirname, "./node_modules/@fhevm-sdk");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@fhevm-sdk": sdkPath,
    };
    
    // Provide polyfill for idb in server-side rendering
    if (isServer) {
      // Replace idb with our polyfill using NormalModuleReplacementPlugin
      const polyfillPath = path.resolve(__dirname, "./utils/idb-polyfill.ts");
      config.resolve.alias = {
        ...config.resolve.alias,
        "idb": polyfillPath,
      };
    }
    return config;
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

module.exports = nextConfig;
