"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Wallet } from "@coral-xyz/anchor"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { useTheme } from "next-themes"
import { toast, Toaster } from "sonner"

import { mintWithControls } from "@/lib/anchor/controls/mintWithControls"
import { useWalletBalance } from "@/lib/hooks/useWalletBalance"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import MintGallery from "@/components/mint/mintGallery"
import { useEditionsControlProgram } from "@/components/providers/EditionsControlProgramContext"
import { useEditionsProgram } from "@/components/providers/EditionsProgramContext"

export default function Home() {
  const { program: editionsControlsProgram } = useEditionsControlProgram()
  const { program: editionsProgram } = useEditionsProgram()
  const { balance, refreshBalance } = useWalletBalance()
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  const [numberOfMints, setNumberOfMints] = useState(1)
  const [isMinting, setIsMinting] = useState(false)
  const [mintedAddresses, setMintedAddresses] = useState<string[]>([])
  const { theme } = useTheme()

  const handleMint = async () => {
    if (!editionsControlsProgram || !editionsProgram || !wallet?.publicKey)
      return
    if (numberOfMints < 1) {
      toast.error("Number of mints must be greater than 0")
      return
    }
    setIsMinting(true)
    try {
      const results = await mintWithControls({
        wallet: wallet as Wallet,
        params: {
          editionsId:
            (process.env.NEXT_PUBLIC_DEPLOYMENTID as string) ??
            "HaCuUQ3nQKB4bVCoWqCmhWuySueS4WLWU9ZaohxkNYKP",
          phaseIndex: 0,
          numberOfMints,
        },
        connection,
        editionsProgram,
        editionsControlsProgram,
      })
      setMintedAddresses((prevAddresses) => [
        ...prevAddresses,
        ...results.mints.map((m) => m.toBase58()),
      ])
      toast.success("Minting successful!")
    } catch (error) {
      console.error("Minting failed:", error)
      toast.error("Minting failed. Please check the console for details.")
    } finally {
      setIsMinting(false)
      await refreshBalance()
    }
  }

  const handleNumberOfMintsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (Number(e.target.value) > 10) {
      toast.error("Number of mints must be less than 10 at a time!")
      return
    }
    setNumberOfMints(Number(e.target.value))
  }

  return (
    <div className="main-bg flex min-h-screen flex-col items-center justify-center bg-cover bg-fixed bg-center bg-no-repeat p-4 text-foreground">
      <Toaster theme={theme as "light" | "dark"} />
      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Image
            src="/logo/logotrans.png"
            alt="Validators Logo"
            width={150}
            height={50}
          />
        </div>
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Mint a Validator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mint Price: 0.03 ETH
            </p>
            <p className="text-sm text-muted-foreground">
              Balance: {balance.toFixed(2)}
            </p>
            <Input
              type="number"
              placeholder="Number of Mints"
              value={numberOfMints}
              onChange={handleNumberOfMintsChange}
              min={0}
              className="border-input bg-input"
            />
            <Button
              className="w-full"
              onClick={handleMint}
              variant="outline"
              disabled={!wallet?.publicKey || isMinting}
            >
              {isMinting ? "Minting..." : "Mint"}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-12 flex flex-col gap-4">
        {mintedAddresses.length > 0 && (
          <Card className="border-border bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Your recent mints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MintGallery mintAddresses={mintedAddresses} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
