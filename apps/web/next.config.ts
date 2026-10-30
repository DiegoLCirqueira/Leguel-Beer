import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 90 para imagens com degradê escuro e arte, que mostram banding e artefatos em 75.
  images: { qualities: [75, 90] },
};

export default nextConfig;
