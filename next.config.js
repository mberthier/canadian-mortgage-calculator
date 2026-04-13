/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/mortgage-stress-test",
        destination: "/affordability",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
