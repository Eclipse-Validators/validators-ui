'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Menu, X } from 'lucide-react';
import { ModeToggle } from '../mode-toggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { publicKey } = useWallet();

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Validators
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/" className="text-foreground hover:bg-muted px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              <Link href="/mint" className="text-foreground hover:bg-muted px-3 py-2 rounded-md text-sm font-medium">
                Mint
              </Link>
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
              <ModeToggle />
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="text-foreground hover:bg-muted block px-3 py-2 rounded-md text-base font-medium">
              Home
            </Link>
            <Link href="/airdrop" className="text-foreground hover:bg-muted block px-3 py-2 rounded-md text-base font-medium">
              Airdrop
            </Link>
            <div className="mt-4">
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 w-full justify-center" />
            </div>
            <div className="flex items-center justify-end space-x-2 p-4">
              <ModeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;