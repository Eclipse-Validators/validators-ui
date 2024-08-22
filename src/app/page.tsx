import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const LandingPage: React.FC = () => {
    const images = [
        '/gallery/111.png',
        '/gallery/3327.png',
        '/gallery/3297.png',
        '/gallery/645.png',
        '/gallery/3292.png',
        '/gallery/3282.png',
        '/gallery/10.png',
        '/gallery/66.png',
    ]

    return (
        <div className="flex flex-col min-h-screen w-full">
            <div className="w-full py-12 flex justify-center main-bg bg-cover bg-center bg-no-repeat">
                <Image src="/logo/logotrans.png" alt="Validators Logo" width={200} height={50} />
            </div>
            <div className="flex-grow w-full bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-6">VALIDATORS HAVE LANDED ON ECLIPSE:</h1>
                        <h2 className="text-2xl mb-8">BORN ON SOLANA, LIVING ON CELESTIA, SETTLING ON ETHEREUM</h2>
                        <p className="text-lg mb-8">
                            Validators is a collection of 3333 anthropomorphic celestial beings, featuring 4
                            unique factions that celebrate the diversity of the Eclipse community.
                        </p>
                        <Link href="/mint">
                            <Button variant="secondary" size="lg">
                                Mint yours
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
                        {images.map((src, index) => (
                            <div key={index} className="aspect-square relative">
                                <Image src={src} alt={`Placeholder NFT ${index + 1}`} layout="fill" objectFit="cover" className="rounded-lg" />
                            </div>
                        ))}
                    </div>

                    <div className="text-center mb-12 max-w-3xl mx-auto">
                        <p className="text-lg mb-8 italic">
                            Long ago, Validators existed as a united race, guided by a collective purpose to
                            maintain cosmic balance and uphold the harmony of the universe. However, as
                            eons passed, subtle differences in their interpretations of this cosmic duty
                            emerged, leading to the formation of distinct factions among them...
                        </p>
                        <Link href="/mint">
                            <Button variant="secondary" size="lg">
                                Mint yours
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="w-full bg-[hsl(120,100%,88%)] py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                    <Image src="/logo/eclipselogo.png" alt="Eclipse Logo" width={300} height={75} />
                </div>
            </div>
            <div className="w-full bg-background py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                    <Image src="/logo/chainlogos.png" alt="Chain Logos" width={1000} height={100} />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;