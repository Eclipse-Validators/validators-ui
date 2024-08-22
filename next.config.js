/** @type {import('next').NextConfig} */
const { withAxiom } = require("next-axiom");
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "./src/app/blip": [
        "./public/blip/placeholder.png",
        "./public/fonts/Manrope-Regular.ttf",
      ],
      "app/blip": [
        "./public/blip/placeholder.png",
        "./public/fonts/Manrope-Regular.ttf",
      ],
    },
  },
  images: {
    domains: ["shdw-drive.genesysgo.net"],
  },
};

module.exports = withAxiom(nextConfig);
