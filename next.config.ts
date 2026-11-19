import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Defense-in-depth: امن‌سازی هدرها در لایه اپلیکیشن (netlify.toml نیز تکمیل می‌کند)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
