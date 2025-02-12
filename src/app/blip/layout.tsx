import { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "💝 Send Valentine Messages on Eclipse | Validators.wtf",
  description:
    "Share your love on the blockchain! Send heartfelt Valentine messages that last forever on Eclipse. Connect your wallet to send Blips - where romance meets web3.",
  keywords:
    "Eclipse, blockchain messaging, Valentine messages, love letters, Blip, validators.wtf, blockchain romance, crypto valentine",
  openGraph: {
    title: "💝 Send Valentine Messages on Eclipse | Validators.wtf",
    description:
      "Share your love on the blockchain! Send heartfelt Valentine messages that last forever on Eclipse. Connect your wallet to send Blips - where romance meets web3.",
    url: "https://validators.wtf/blip",
    siteName: "Validators.wtf",
    type: "website",
    images: ["https://www.validators.wtf/blip/logovalentines1.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "💝 Send Valentine Messages on Eclipse | Validators.wtf",
    description:
      "Share your love on the blockchain! Send heartfelt Valentine messages that last forever on Eclipse. Connect your wallet to send Blips - where romance meets web3.",
    images: ["https://www.validators.wtf/blip/logovalentines1.png"],
    creator: "@Validators_",
  },
};

export default function BlipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
