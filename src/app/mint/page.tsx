"use client"

import React, { useState } from "react"
import { Wallet } from "@coral-xyz/anchor"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { useTheme } from "next-themes"
import { toast, Toaster } from "sonner"

import { mintWithControls } from "@/lib/anchor/controls/mintWithControls"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEditionsControlProgram } from "@/components/providers/EditionsControlProgramContext"
import { useEditionsProgram } from "@/components/providers/EditionsProgramContext"

export default function MintPage() {
  const { program: editionsControlsProgram } = useEditionsControlProgram()
  const { program: editionsProgram } = useEditionsProgram()
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  const [numberOfMints, setNumberOfMints] = useState(1)
  const [isMinting, setIsMinting] = useState(false)
  const { theme } = useTheme()

  const handleMint = async () => {
    if (!editionsControlsProgram || !editionsProgram || !wallet?.publicKey)
      return

    setIsMinting(true)
    try {
      await mintWithControls({
        wallet: wallet as Wallet,
        params: {
          editionsId: "GmYSwRy2VHePvxpqE4giwKAms9y3639HMQG14pUcdk45",
          phaseIndex: 0,
          numberOfMints,
        },
        connection,
        editionsProgram,
        editionsControlsProgram,
      })
      toast.success("Minting successful!")
    } catch (error) {
      console.error("Minting failed:", error)
      toast.error("Minting failed. Please check the console for details.")
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <Toaster theme={theme as "light" | "dark"} />
      <div className="relative z-10 w-full max-w-md space-y-8">
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Mint NFT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Number of Mints"
              value={numberOfMints}
              onChange={(e) => setNumberOfMints(Number(e.target.value))}
              min={1}
              className="border-input bg-input"
            />
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleMint}
              disabled={!wallet?.publicKey || isMinting}
            >
              {isMinting ? "Minting..." : "Mint NFT"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
