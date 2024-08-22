/** @type {import('next').NextConfig} */
const { withAxiom } = require("next-axiom");
const nextConfig = {
  images: {
    domains: ["shdw-drive.genesysgo.net"],
  },
};

module.exports = withAxiom(nextConfig);
