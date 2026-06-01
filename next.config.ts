const nextConfig = {
  // eslint wali line hata di gayi hai kyunki Next 16 usko support nahi kar raha
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
  // Ye Next.js 16 ke Turbopack error ko completely silence (chup) kar dega
  turbopack: {},
};

export default nextConfig;