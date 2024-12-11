import { SiteConfig } from "@/types";

import { env } from "@/env.mjs";

export const siteConfig: SiteConfig = {
  name: "Validators.wtf | Eclipse Tools",
  author: "@Validators_",
  description: "Validators OG Mint on Eclipse, providing blockchain tools for bridging, burning tokens, and sending messages.",
  keywords: ["Eclipse", "blockchain", "crypto", "bridge", "token burner", "messaging"],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "https://validators.wtf",
  },
  links: {
    github: "https://github.com/Eclipse-Validators/validators-ui",
  },
  ogImage: `https://www.validators.wtf/logo/logoblue.png`,
};
