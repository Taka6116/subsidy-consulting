import type { NextConfig } from "next";
import path from "path";

// 親ディレクトリなどに別の package-lock があると、Next が誤ったワークスペースルートを推論するのを防ぐ
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nts-video-assets.s3.ap-northeast-1.amazonaws.com",
        pathname: "/videos/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/diagnosis/:path*",
        destination: "/check",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
