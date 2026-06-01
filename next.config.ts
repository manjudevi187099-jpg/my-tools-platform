const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
    return config;
  },
  // 🌟 FIX: Turbopack ko missing webgpu module ignore karne ka instruction
  turbopack: {
    resolveAlias: {
      'onnxruntime-web/webgpu': 'onnxruntime-web',
    },
  },
};

export default nextConfig;