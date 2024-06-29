"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import * as anchor from "@coral-xyz/anchor"
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react"
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js"

import { PROGRAM_ID_EDITIONS } from "../../lib/anchor/editions/constants"
import {
  IDL,
  LibreplexEditions,
} from "../../lib/anchor/editions/libreplex_editions"

interface Wallet {
  signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T>
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[]
  ): Promise<T[]>
  publicKey: PublicKey
}

type ProgramContextType = {
  program: anchor.Program<LibreplexEditions> | null
}

const EditionsContext = createContext<ProgramContextType | undefined>(undefined)

export function EditionsProgramProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [program, setProgram] =
    useState<anchor.Program<LibreplexEditions> | null>(null)
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  useEffect(() => {
    const setupProgram = async () => {
      let walletAdapter: Wallet
      if (wallet) {
        walletAdapter = wallet
      } else {
        const dummyKeypair = Keypair.generate()
        walletAdapter = {
          publicKey: dummyKeypair.publicKey,
          signTransaction: async (tx) => {
            console.log("no signer")
            return tx
          },
          signAllTransactions: async (txs) => {
            return txs.map((tx) => {
              console.log("no signer")
              return tx
            })
          },
        }
      }

      const provider = new anchor.AnchorProvider(
        connection,
        walletAdapter,
        anchor.AnchorProvider.defaultOptions()
      )

      const program = new anchor.Program<LibreplexEditions>(
        IDL,
        PROGRAM_ID_EDITIONS,
        provider
      )

      setProgram(program)
    }

    setupProgram()
  }, [wallet, wallet?.publicKey, connection])

  return (
    <EditionsContext.Provider value={{ program }}>
      {children}
    </EditionsContext.Provider>
  )
}

export function useEditionsProgram() {
  const context = useContext(EditionsContext)
  if (context === undefined) {
    throw new Error("useProgram must be used within a ProgramProvider")
  }
  return context
}
