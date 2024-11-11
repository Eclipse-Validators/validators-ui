import { Suspense } from 'react'
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from 'react'
import { useAccount, useSendTransaction, usePrepareTransactionRequest, useBalance, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, encodeFunctionData, toHex, getContractError, Abi } from 'viem'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { base58 } from '@scure/base'
import { NETWORK_CONFIG } from '@/lib/config'
import { toast as sonnerToast } from 'sonner'
import { PublicKey } from '@solana/web3.js'

const abi: Abi = [
  {
    inputs: [
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
]

const pauseAbi = [{
  inputs: [],
  name: 'paused',
  outputs: [{ type: 'bool' }],
  stateMutability: 'view',
  type: 'function',
}] as const

const solanaToBytes32 = (solanaAddress: string) => {
  try {
    const publicKey = new PublicKey(solanaAddress);
    return toHex(publicKey.toBytes().slice(0, 32));
  } catch (error) {
    console.error('Invalid Solana address', error);
    throw new Error('Invalid Solana address');
  }
};

interface BridgeButtonProps {
  amount: string
  destinationAddress: string
  isValidSolanaAddress: boolean
  onTransactionSent: (hash: string) => void
}

// Separate the button logic into its own component
function BridgeButtonContent({ amount, destinationAddress, isValidSolanaAddress, onTransactionSent }: BridgeButtonProps) {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({ address });
  const { toast } = useToast()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const chainName = chain?.id === 1 ? 'mainnet' : 'sepolia'
  const networkConfig = useMemo(() => NETWORK_CONFIG[chainName], [chainName])

  // Add pause check
  const { data: isPaused } = useReadContract({
    address: networkConfig.etherBridgeAddress as `0x${string}`,
    abi: pauseAbi,
    functionName: 'paused',
    query: {
      staleTime: 5_000,
      select: (data) => Boolean(data),
    }
  })

  const { data: preparedTx, isError: isPrepareError, error: prepareError } = usePrepareTransactionRequest({
    to: networkConfig.etherBridgeAddress as `0x${string}`,
    account: address,
    value: amount ? parseEther(amount) : undefined,
    data: destinationAddress && isValidSolanaAddress
      ? encodeFunctionData({
        abi,
        functionName: 'deposit',
        args: [solanaToBytes32(destinationAddress), parseEther(amount || '0')],
      })
      : undefined,
    query: {
      enabled: Boolean(destinationAddress && isValidSolanaAddress && !isPaused),
    }
  })

  // Handle preparation errors
  useEffect(() => {
    if (isPrepareError && prepareError) {
      const getError = getContractError(prepareError, {
        abi: abi,
        address: networkConfig.etherBridgeAddress as `0x${string}`,
        args: [solanaToBytes32(destinationAddress), parseEther(amount || '0')],
        docsPath: '/docs/contract/simulateContract',
        functionName: 'deposit',
        sender: address,
      });

      // Don't show error toast if it's just paused
      if (!prepareError.message?.includes('0xd93c0665') && !getError.message?.includes('0xd93c0665')) {
        toast({
          title: "Transaction Preparation Failed",
          description: getError.message || prepareError?.message || "Failed to prepare transaction",
          variant: "destructive",
        })
      }
    }
  }, [isPrepareError, prepareError, toast, networkConfig.etherBridgeAddress, destinationAddress, amount, address])

  const { sendTransactionAsync, isPending: isSending, isSuccess: isConfirmed, isError: isError, error: error } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess: isTransactionConfirmed, error: confirmationError } =
    useWaitForTransactionReceipt({
      hash: txHash,
    })
  useEffect(() => {
    if (isError && error || !!confirmationError) {
      const message = error?.message || confirmationError?.message;
      if (!message?.includes('User rejected the request')) {
        toast({
          title: "Transaction Failed",
          description: message,
          variant: "destructive",
        })
      }
    }
    if (isTransactionConfirmed) {
      sonnerToast("Transaction Confirmed", {
        description: "Your bridge transaction has been confirmed.",
        action: {
          label: "View on Etherscan",
          onClick: () => window.open(`https://etherscan.io/tx/${txHash}`, '_blank', 'noopener,noreferrer'),
        },
      })
    }
  }, [toast, error, confirmationError, isError, isTransactionConfirmed, isConfirming, txHash])
  const handleBridge = async () => {
    if (!isConnected || !destinationAddress || !amount || !address || !chain || !preparedTx || isPaused) return
    if (parseFloat(amount) < 0.002) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than or equal to 0.002 ETH",
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await sendTransactionAsync(preparedTx)
      setTxHash(result)
      onTransactionSent(result)
      sonnerToast("Transaction Sent", {
        description: "Your transaction has been sent.",
        action: {
          label: "View on Etherscan",
          onClick: () => window.open(`https://etherscan.io/tx/${result}`, '_blank', 'noopener,noreferrer'),
        },
      })
    } catch (error) {
      console.error('Bridging failed:', error)
      toast({
        title: "Bridging Failed",
        description: (
          <div className="whitespace-normal break-words">
            <span>
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </span>
          </div>
        ),
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      size="lg"
      variant='default'
      onClick={handleBridge}
      disabled={!isConnected || !isValidSolanaAddress || !amount || isSending || isPaused || !preparedTx}
    >
      {isSending ? 'Bridging...' :
        isPaused ? 'Bridge Paused' :
          !preparedTx && isPrepareError ? 'Invalid Transaction' :
            'Bridge'}
    </Button>
  )
}

function BridgeButtonFallback() {
  return (
    <Button size="lg" variant="default" disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading
    </Button>
  )
}
export function BridgeButton(props: BridgeButtonProps) {
  return (
    <Suspense fallback={<BridgeButtonFallback />}>
      <BridgeButtonContent {...props} />
    </Suspense>
  )
}