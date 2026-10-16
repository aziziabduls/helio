/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.lumacdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.lu.ma',
      },
    ],
  },
};

export default nextConfig;
