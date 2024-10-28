/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'img.youtube.com',
            pathname: '/vi/**/hqdefault.jpg',
          },
        ],
      },
};

export default nextConfig;
