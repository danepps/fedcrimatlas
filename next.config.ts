import type { NextConfig } from "next";

const pagesBuild = process.env.GITHUB_PAGES === "true";
const basePath = pagesBuild ? process.env.PAGES_BASE_PATH || "" : "";

const nextConfig: NextConfig = {
  output: pagesBuild ? "export" : undefined,
  trailingSlash: pagesBuild,
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
