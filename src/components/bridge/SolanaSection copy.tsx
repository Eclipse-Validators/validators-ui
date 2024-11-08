import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Input } from "@/components/ui/input"
import { PublicKey, Connection } from '@solana/web3.js'
import { Separator } from '@radix-ui/react-select'
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface SolanaSectionProps {
  destinationAddress: string
  setDestinationAddress: (address: string) => void
  isValidSolanaAddress: boolean
  setIsValidSolanaAddress: (isValid: boolean) => void
}

export function SolanaSection({ 
  destinationAddress, 
  setDestinationAddress, 
  isValidSolanaAddress, 
  setIsValidSolanaAddress 
}: SolanaSectionProps) {
  const { publicKey, connected } = useWallet()
  const [isManualInput, setIsManualInput] = useState(true)
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const connection = useMemo(() => new Connection(process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://mainnetbeta-rpc.eclipse.xyz'), [])
  const validateSolanaAddress = (address: string) => {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }

  const handleSolanaAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value
    setDestinationAddress(address)
    setIsValidSolanaAddress(validateSolanaAddress(address))
  }

  const fetchBalance = useCallback(async (address: string) => {
    setIsLoading(true)
    try {
      const publicKey = new PublicKey(address)
      const balance = await connection.getBalance(publicKey)
      setBalance(balance / 1e9)
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance(null)
    } finally {
      setIsLoading(false)
    }
  }, [connection])

  useEffect(() => {
    if (connected && publicKey) {
      setDestinationAddress(publicKey.toBase58())
      setIsValidSolanaAddress(true)
      setIsManualInput(false)
      fetchBalance(publicKey.toBase58())
    } else {
      if (!publicKey) {
        setDestinationAddress("")
        setIsValidSolanaAddress(false)
        setBalance(null)
      }
      setIsManualInput(true)
    }
  }, [connected, publicKey, setDestinationAddress, setIsValidSolanaAddress, fetchBalance])

  useEffect(() => {
    if (isValidSolanaAddress && destinationAddress) {
      fetchBalance(destinationAddress)
    }
  }, [isValidSolanaAddress, destinationAddress, fetchBalance])

  return (
    <div className="space-y-4">
      <WalletMultiButton className="!bg-secondary !text-secondary-foreground hover:!bg-secondary/80" />
      <Separator className="my-2 bg-border" />
      {!connected && !publicKey && (
        <div className="text-sm font-medium text-muted-foreground">OR</div>
      )}
      <Input
        placeholder="Destination Address..."
        value={connected && publicKey ? publicKey.toBase58() : destinationAddress}
        onChange={handleSolanaAddressChange}
        disabled={connected && publicKey !== null}
        className={`bg-input text-foreground border-input ${
          isManualInput
            ? isValidSolanaAddress
              ? "border-secondary"
              : "border-destructive"
            : "bg-muted text-muted-foreground"
        }`}
      />
      {!isValidSolanaAddress && isManualInput && (
        <div className="text-xs text-destructive">
          Please enter a Solana compatible address
        </div>
      )}
      {isValidSolanaAddress && (
        <div className="flex items-center justify-between bg-muted p-2 rounded">
          <span className="text-sm font-medium text-muted-foreground">
            Balance: {isLoading ? 'Loading...' : balance !== null ? `${balance.toFixed(4)} ETH` : '0.00 ETH'}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fetchBalance(destinationAddress)}
            disabled={isLoading}
            className="text-primary hover:text-primary/80"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
    </div>
  )
}