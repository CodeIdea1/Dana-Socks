/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "via.placeholder.com",
      "firebasestorage.googleapis.com",
      "dana-socks.vercel.app", // إضافة دومين موقعك
      "encrypted-tbn0.gstatic.com", // للصور من Google
      "example.com", // أي دومين آخر تستخدمه
    ],
    // إضافة إعدادات إضافية للصور
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  // إضافة إعدادات للروابط الخارجية
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
