/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow loading GLB/FBX from external CDNs (TalkingHead, jsDelivr)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          { key: "Cross-Origin-Opener-Policy",   value: "same-origin-allow-popups" },
        ],
      },
    ];
  },

  webpack(config) {
    // Allow importing GLB/FBX files if you host your avatar locally
    config.module.rules.push({
      test: /\.(glb|gltf|fbx)$/,
      type: "asset/resource",
    });
    return config;
  },
};

module.exports = nextConfig;
