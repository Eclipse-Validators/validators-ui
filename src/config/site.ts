import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "Validators - Eclipse",
  author: "donny",
  description:
    "Validators minting on Eclipse",
  keywords: ["eclipse", "nft", "solana", "eth", "shadcn/ui"],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "https://rdev.pro",
  },
  links: {
    github: "https://validators.so",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
}
