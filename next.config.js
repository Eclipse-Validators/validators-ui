/** @type {import('next').NextConfig} */
const { withAxiom } = require("next-axiom");
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/blip": ["./src/media/**/*"],
    },
  },
  images: {
    domains: ["shdw-drive.genesysgo.net"],
  },
};

module.exports = withAxiom(nextConfig);
