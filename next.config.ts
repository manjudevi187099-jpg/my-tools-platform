/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 🌟 FIX: Isko 'experimental' se bahar nikal kar seedha bahar (top-level) rakh diya hai
  serverExternalPackages: ['canvas', 'pdfjs-dist'],

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
    
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias.canvas = false;
    
    return config;
  },
  
  turbopack: {
    resolveAlias: {
      'onnxruntime-web/webgpu': 'onnxruntime-web',
    },
  },
};

export default nextConfig;