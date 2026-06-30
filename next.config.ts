/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // 🔥 FIX: config aur isServer ko wapas ': any' de diya
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
    
    // NAYA UPDATE: Webpack ko canvas ignore karne ka order
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias.canvas = false;
    
    return config;
  },
  
  // FIX: Purana webgpu aur Naya canvas dono ko ignore karne ka instruction
  turbopack: {
    resolveAlias: {
      'onnxruntime-web/webgpu': 'onnxruntime-web',
      'canvas': false, 
    },
  },
};

export default nextConfig;