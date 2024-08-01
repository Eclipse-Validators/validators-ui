import { SiteConfig } from "@/types";

import { env } from "@/env.mjs";

export const siteConfig: SiteConfig = {
  name: "Validators - Eclipse",
  author: "@Validators_",
  description: "Validators minting on Eclipse",
  keywords: ["eclipse", "nft", "solana", "eth", "shadcn/ui"],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "https://validators.wtf",
  },
  links: {
    github: "https://validators.wtf",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/logo/logoblue.png`,
};
