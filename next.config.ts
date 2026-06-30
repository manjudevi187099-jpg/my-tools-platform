/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 🌟 NAYA AUR SABSE SAHI FIX: Next.js ko natively bolna ki canvas ko ignore kare
  experimental: {
    serverExternalPackages: ['canvas', 'pdfjs-dist'],
  },

  webpack: (config: any, { isServer }: any) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
      };
    }
    
    // Webpack ke liye canvas ignore (Purana backup)
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias.canvas = false;
    
    return config;
  },
  
  turbopack: {
    resolveAlias: {
      'onnxruntime-web/webgpu': 'onnxruntime-web',
      // 🔥 YAHAN SE HUMNE 'canvas: false' HATA DIYA HAI TAAKI ERROR NA AAYE
    },
  },
};

export default nextConfig;