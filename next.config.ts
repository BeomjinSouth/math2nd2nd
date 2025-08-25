import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 빌드 차단을 피하기 위해 ESLint 오류로 빌드를 중단하지 않습니다.
    ignoreDuringBuilds: true,
  },
  // 터보팩 루트 경고 제거를 위한 루트 명시
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
