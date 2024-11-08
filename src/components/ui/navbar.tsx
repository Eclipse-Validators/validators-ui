"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ChevronDown, Menu, X, FireExtinguisherIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ModeToggle } from "../mode-toggle";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev";
  const router = useRouter();

  const handleDropdownItemClick = (href: string) => {
    setIsDropdownOpen(false);
    router.push(href);
  };

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/logo/validatorswordmark.png"
              alt="Validators Logo"
              width={150}
              height={50}
            />
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Home
              </Link>
              <Link
                href="/bridge"
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Bridge
              </Link>
              <Link
                href="/blip"
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Blip
              </Link>
              <Link
                href="/gallery"
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Gallery
              </Link>
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                  Utilities <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onSelect={() => handleDropdownItemClick("/rugcheck")}
                  >
                    Rug Check
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleDropdownItemClick("/transfer")}
                  >
                    Transfer
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleDropdownItemClick("/viewer")}
                  >
                    Wallet Peek
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isDev && (
                <Link
                  href="/airdrop"
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Airdrop
                </Link>
              )}
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
              <ModeToggle />
            </div>
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/bridge"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Bridge
            </Link>
            <Link
              href="/blip"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Blip
            </Link>
            <Link
              href="/rugcheck"
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Rug Check
            </Link>
            <Link
              href="/gallery"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/transfer"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Transfer
            </Link>
            <Link
              href="/viewer"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              Wallet Peek
            </Link>
            {isDev && (
              <Link
                href="/airdrop"
                className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                onClick={() => setIsOpen(false)}
              >
                Airdrop
              </Link>
            )}
            <div className="mt-4">
              <WalletMultiButton className="w-full justify-center !bg-purple-600 hover:!bg-purple-700" />
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
