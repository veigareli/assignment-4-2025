import type { NextConfig } from "next";
require('./config/tracing');

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
