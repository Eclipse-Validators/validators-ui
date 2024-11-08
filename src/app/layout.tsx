import "@/styles/globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import Navbar from "@/components/ui/navbar";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/footer";
import { GlobalConnectionProvider } from "@/components/GlobalConnectionProvider";
import { EditionsControlProgramProvider } from "@/components/providers/EditionsControlProgramContext";
import { EditionsProgramProvider } from "@/components/providers/EditionsProgramContext";
import SolanaWalletProvider from "@/components/SolanaWalletProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from '@next/third-parties/google'
import { EthereumProviders } from "@/components/EthProviders";
import { ValidatorBurnProgramProvider } from "@/components/providers/ValidatorBurnProgramContext";

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  metadataBase: new URL('https://validators.wtf'),
  title: {
    default: 'Validators.wtf | Eclipse Tools',
    template: '%s | Validators.wtf'
  },
  description: 'Eclipse blockchain tools for bridging, burning tokens, and sending messages.',
  keywords: ['Eclipse', 'blockchain', 'crypto', 'bridge', 'token burner', 'messaging'],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url.base,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@Validators_",
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "main-bg min-h-screen bg-cover bg-fixed bg-center bg-no-repeat antialiased",
          inter.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <EthereumProviders>
            <GlobalConnectionProvider>
              <SolanaWalletProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <EditionsProgramProvider>
                      <EditionsControlProgramProvider>
                        <ValidatorBurnProgramProvider>
                          {children}
                        </ValidatorBurnProgramProvider>
                      </EditionsControlProgramProvider>
                    </EditionsProgramProvider>
                  </main>
                  <Footer />
                  <Toaster />
                </div>
              </SolanaWalletProvider>
            </GlobalConnectionProvider>
          </EthereumProviders>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-0QLYYL5TGN" />
    </html>
  );
}
