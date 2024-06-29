"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Menu, X } from "lucide-react"

import { ModeToggle } from "../mode-toggle"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { publicKey } = useWallet()

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-xl font-bold text-transparent">
                Validators
              </span>
            </Link>
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
                href="/mint"
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Mint
              </Link>
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
            >
              Home
            </Link>
            <Link
              href="/airdrop"
              className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
            >
              Airdrop
            </Link>
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
  )
}

export default Navbar
