/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in production to prevent the errors
  productionBrowserSourceMaps: false,
  
  // Enable compression for better performance
  compress: true,
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.oyoroomscdn.com',
      },
      {
        protocol: 'https',
        hostname: 'holidays-b2c.qbthl0.easypanel.host',
      },
      {
        protocol: 'https',
        hostname: 'api.tripbazaar.com',
      },
    ],
    // Optimize image loading
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    // Disable optimization for external images to avoid _next/image wrapper
    unoptimized: true,
  },
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@headlessui/react', 'react-icons', 'framer-motion'],
  },
  
  // Webpack optimizations
  webpack: (config: any, { dev, isServer }: { dev: boolean; isServer: boolean }) => {
    // Disable source maps in production
    if (!dev) {
      config.devtool = false;
    }
    
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
};

export default nextConfig;
