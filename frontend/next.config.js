/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Required for react-pdf-viewer to work with PDF.js
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
