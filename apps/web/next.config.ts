import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 90 para imagens com degradê escuro e arte, que mostram banding e artefatos em 75.
  images: { qualities: [75, 90] },
  // Sem o botão "N" que o Next mostra no canto da tela durante o desenvolvimento.
  devIndicators: false,
};

export default nextConfig;
