import path from "node:path";
import type { NextConfig } from "next";

// Pin the project root to this folder. Without it Next guesses from the nearest
// lockfile, which goes wrong when the project sits inside another repository.
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: { root: projectRoot },
  images: {
    // Product photos are hosted on Unsplash.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
  },
};

export default nextConfig;
