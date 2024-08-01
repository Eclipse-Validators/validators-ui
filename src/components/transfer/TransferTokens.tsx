"use client"

import React, { useCallback, useEffect, useState } from "react"
import {
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction } from "@solana/web3.js"
import { useLogger } from "next-axiom"
import { toast } from "sonner"

import { useSPLTokens } from "@/lib/hooks/useWalletSplTokens"
import { useWalletTokens } from "@/lib/hooks/useWalletTokens"
import { FetchedTokenInfo } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TokenCard: React.FC<{
  token: FetchedTokenInfo
  isSelected: boolean
  onSelect: () => void
  amount: string
  onAmountChange: (amount: string) => void
}> = ({ token, isSelected, onSelect, amount, onAmountChange }) => (
  <Card
    className={`w-full max-w-sm cursor-pointer ${isSelected ? "ring-2 ring-purple-500" : ""}`}
    onClick={(e) => {
      // Prevent toggling when clicking on the input
      if (e.target instanceof HTMLInputElement) return
      onSelect()
    }}
  >
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>
          {token.metadata?.name ||
            token.mint.slice(0, 4) + "..." + token.mint.slice(-4)}
        </span>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()} // Prevent card click when clicking checkbox
        />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-4">
        {token.metadata?.image && (
          <img
            src={token.metadata.image}
            alt={token.metadata.name}
            className="h-16 w-16 rounded"
          />
        )}
        <div>
          <p>Balance: {token.amount}</p>
          <p>Symbol: {token.metadata?.symbol || "N/A"}</p>
          {token.decimals > 0 && (
            <Input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking input
              placeholder="Amount to send"
              className="mt-2"
            />
          )}
          {token.decimals === 0 && <></>}
        </div>
      </div>
    </CardContent>
  </Card>
)

const SkeletonCard: React.FC = () => (
  <Card className="w-full max-w-sm">
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-4" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded" />
        <div>
          <Skeleton className="mb-2 h-4 w-[100px]" />
          <Skeleton className="mb-2 h-4 w-[80px]" />
          <Skeleton className="h-8 w-[120px]" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const TransferTokens: React.FC = () => {
  const logger = useLogger()
  const { connection } = useConnection()
  const { publicKey, signAllTransactions } = useWallet()
  const {
    tokens: token2022Tokens,
    loading: loading2022,
    error: error2022,
    refreshTokens: refresh2022Tokens,
  } = useWalletTokens(true)
  const {
    tokens: splTokens,
    loading: loadingSPL,
    error: errorSPL,
    refreshTokens: refreshSPLTokens,
  } = useSPLTokens(true)
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [tokenAmounts, setTokenAmounts] = useState<{ [key: string]: string }>(
    {}
  )
  const [destinationAddress, setDestinationAddress] = useState("")
  const [isValidAddress, setIsValidAddress] = useState(false)
  const [activeTab, setActiveTab] = useState("token2022")

  useEffect(() => {
    const validateAddress = () => {
      try {
        new PublicKey(destinationAddress)
        setIsValidAddress(true)
      } catch (error) {
        setIsValidAddress(false)
      }
    }

    if (destinationAddress) {
      validateAddress()
    } else {
      setIsValidAddress(false)
    }
  }, [destinationAddress])

  const handleTokenSelection = (tokenAccount: string) => {
    setSelectedTokens((prev) =>
      prev.includes(tokenAccount)
        ? prev.filter((t) => t !== tokenAccount)
        : [...prev, tokenAccount]
    )
    const token = [...token2022Tokens, ...splTokens].find(
      (t) => t.tokenAccount === tokenAccount
    )
    if (token && token.decimals === 0) {
      setTokenAmounts((prev) => ({ ...prev, [tokenAccount]: "1" }))
    }
  }

  const handleAmountChange = (tokenAccount: string, amount: string) => {
    const token = [...token2022Tokens, ...splTokens].find(
      (t) => t.tokenAccount === tokenAccount
    )
    if (token && token.decimals > 0) {
      setTokenAmounts((prev) => ({ ...prev, [tokenAccount]: amount }))
    }
  }

  const handleTransfer = async () => {
    if (!publicKey || !signAllTransactions || !isValidAddress) return

    try {
      const MAX_TOKENS_PER_TRANSACTION = 5 // Adjust this value as needed
      const transactions: Transaction[] = []
      let currentTx = new Transaction()
      let tokenCount = 0

      const tokensToTransfer = activeTab === "spl" ? splTokens : token2022Tokens
      for (const tokenAccount of selectedTokens) {
        const programAddress =
          activeTab === "spl" ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID
        const token = tokensToTransfer.find(
          (t) => t.tokenAccount === tokenAccount
        )
        if (!token) continue

        const amount =
          token.decimals === 0
            ? 1
            : parseFloat(tokenAmounts[tokenAccount]) || token.amount
        if (amount > token.amount) {
          toast.error(
            `Insufficient balance for token ${token.metadata?.symbol || token.mint}`
          )
          continue
        }

        const destinationTokenAccount = getAssociatedTokenAddressSync(
          new PublicKey(token.mint),
          new PublicKey(destinationAddress),
          true,
          programAddress
        )
        let addCreateTokenAccountIx = false
        try {
          const accountExists = await connection.getAccountInfo(
            destinationTokenAccount
          )
          if (
            !accountExists ||
            !accountExists.data ||
            accountExists.data.length === 0
          ) {
            addCreateTokenAccountIx = true
          }
        } catch (err) {
          console.log("Error checking account:", err)
        }

        if (addCreateTokenAccountIx) {
          currentTx.add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              destinationTokenAccount,
              new PublicKey(destinationAddress),
              new PublicKey(token.mint),
              programAddress
            )
          )
        }

        const transferInstruction = createTransferInstruction(
          new PublicKey(token.tokenAccount),
          destinationTokenAccount,
          publicKey,
          amount * Math.pow(10, token.decimals),
          [],
          programAddress
        )

        currentTx.add(transferInstruction)
        if ((amount === 1 && token.decimals === 0) || amount === token.amount) {
          const tokenCloseInstruction = createCloseAccountInstruction(
            new PublicKey(token.tokenAccount),
            publicKey,
            publicKey,
            undefined,
            programAddress
          )
          currentTx.add(tokenCloseInstruction)
        }
        tokenCount++

        if (tokenCount === MAX_TOKENS_PER_TRANSACTION) {
          transactions.push(currentTx)
          currentTx = new Transaction()
          tokenCount = 0
        }
      }

      if (tokenCount > 0) {
        transactions.push(currentTx)
      }

      const { blockhash } = await connection.getLatestBlockhash()
      transactions.forEach((tx) => {
        tx.recentBlockhash = blockhash
        tx.feePayer = publicKey
      })

      const signedTransactions = await signAllTransactions(transactions)

      const promises = signedTransactions.map((tx) =>
        connection.sendRawTransaction(tx.serialize())
      )

      const signatures = await Promise.all(promises)

      const confirmations = await Promise.all(
        signatures.map((signature) => connection.confirmTransaction(signature))
      )
      if (confirmations.some((confirmation) => confirmation.value.err)) {
        logger.error("Some transfers failed, try again!", {
          signatures: signatures,
          confirmations: confirmations.map(
            (confirmation) => confirmation.value.err
          ),
        })
        toast.error("Some transfers failed, try again!")
      } else {
        toast.success(
          `Successfully transferred ${selectedTokens.length} tokens`,
          {
            description:
              "You can now view your transactions on the Solana blockchain",
            action: {
              label: "View Transactions",
              onClick: () =>
                window.open(
                  `https://${process.env.NEXT_PUBLIC_EXPLORER!}/tx/${signatures[0]}`,
                  "_blank"
                ),
            },
          }
        )
      }
    } catch (error) {
      logger.error("Transfer failed:", {
        error: error,
        destinationAddress: destinationAddress,
        selectedTokensCount: selectedTokens.length,
        activeTab: activeTab,
      })
      toast.error("Transfer failed. Please try again.")
    } finally {
      if (activeTab === "spl") {
        refreshSPLTokens()
      } else {
        refresh2022Tokens()
      }
    }
  }

  const renderTokenCards = useCallback(
    (tokens: FetchedTokenInfo[]) => {
      if (loadingSPL || loading2022) {
        return Array(6)
          .fill(0)
          .map((_, index) => <SkeletonCard key={index} />)
      }
      return tokens.map((token) => (
        <TokenCard
          key={token.tokenAccount}
          token={token}
          isSelected={selectedTokens.includes(token.tokenAccount)}
          onSelect={() => handleTokenSelection(token.tokenAccount)}
          amount={tokenAmounts[token.tokenAccount] || ""}
          onAmountChange={(amount) =>
            handleAmountChange(token.tokenAccount, amount)
          }
        />
      ))
    },
    [selectedTokens, tokenAmounts, handleTokenSelection, handleAmountChange]
  )

  if (errorSPL || error2022) return <div>Error: {errorSPL || error2022}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Transfer Tokens</h1>
      <div className="flex flex-col items-center space-y-4">
        <label htmlFor="destinationAddress" className="text-sm font-medium">
          Destination Address
        </label>
        <Input
          id="destinationAddress"
          autoComplete="off"
          type="text"
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
          placeholder="Enter destination address"
          className={`w-96 ${isValidAddress ? "border-green-500" : "border-red-500"}`}
        />
        {!isValidAddress && destinationAddress && (
          <p className="text-sm text-red-500">
            Please enter a Solana compatible address
          </p>
        )}
        <Button
          className="w-96"
          variant="outline"
          onClick={handleTransfer}
          disabled={!isValidAddress || selectedTokens.length === 0}
        >
          {selectedTokens.length > 0
            ? `Transfer ${selectedTokens.length} tokens`
            : "Select tokens to transfer"}
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="token2022">Token2022</TabsTrigger>
          <TabsTrigger value="spl">SPL Tokens</TabsTrigger>
        </TabsList>
        <TabsContent value="spl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {renderTokenCards(splTokens)}
          </div>
        </TabsContent>
        <TabsContent value="token2022">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {renderTokenCards(token2022Tokens)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TransferTokens
