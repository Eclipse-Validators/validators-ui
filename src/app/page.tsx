import React from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const LandingPage: React.FC = () => {
  const images = [
    "/gallery/111.png",
    "/gallery/3327.png",
    "/gallery/3297.png",
    "/gallery/645.png",
    "/gallery/3292.png",
    "/gallery/3282.png",
    "/gallery/10.png",
    "/gallery/66.png",
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="main-bg flex w-full justify-center bg-cover bg-center bg-no-repeat py-12">
        <Image
          src="/logo/logotrans.png"
          alt="Validators Logo"
          width={200}
          height={50}
        />
      </div>
      <div className="w-full flex-grow bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="mb-6 text-4xl font-bold">
              VALIDATORS HAVE LANDED ON ECLIPSE:
            </h1>
            <h2 className="mb-8 text-2xl">
              BORN ON SOLANA, LIVING ON CELESTIA, SETTLING ON ETHEREUM
            </h2>
            <p className="mb-8 text-lg">
              Validators is a collection of 3333 anthropomorphic celestial
              beings, featuring 4 unique factions that celebrate the diversity
              of the Eclipse community.
            </p>
            <Link target="_blank" href="https:///discord.gg/XRMXk5hKUn">
              <Button variant="secondary" size="lg">
                Buy OTC
              </Button>
            </Link>
          </div>

          <div className="mx-auto mb-12 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
            {images.map((src, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={src}
                  alt={`Placeholder NFT ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            ))}
          </div>

          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-8 text-lg italic">
              Long ago, Validators existed as a united race, guided by a
              collective purpose to maintain cosmic balance and uphold the
              harmony of the universe. However, as eons passed, subtle
              differences in their interpretations of this cosmic duty emerged,
              leading to the formation of distinct factions among them...
            </p>
            <Link target="_blank" href="https:///discord.gg/XRMXk5hKUn">
              <Button variant="secondary" size="lg">
                Buy OTC
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full bg-[hsl(120,100%,88%)] py-8">
        <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
          <Image
            src="/logo/eclipselogo.png"
            alt="Eclipse Logo"
            width={300}
            height={75}
          />
        </div>
      </div>
      <div className="w-full bg-background py-12">
        <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
          <Image
            src="/logo/chainlogos.png"
            alt="Chain Logos"
            width={1000}
            height={100}
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
