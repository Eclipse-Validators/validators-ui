import { useEffect, useMemo, useState } from 'react'
import { useAccount, useSendTransaction, usePrepareTransactionRequest, useBalance, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, encodeFunctionData } from 'viem'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { base58 } from '@scure/base'
import { NETWORK_CONFIG } from '@/lib/config'
import { toast as sonnerToast } from 'sonner'

const abi = [
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

interface BridgeButtonProps {
  amount: string
  destinationAddress: string
  isValidSolanaAddress: boolean
  onTransactionSent: (hash: string) => void
}

export function BridgeButton({ amount, destinationAddress, isValidSolanaAddress, onTransactionSent }: BridgeButtonProps) {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({ address });
  console.log('account', address, isConnected, balance)
  const { toast } = useToast()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const chainName = chain?.id === 1 ? 'mainnet' : 'sepolia'
  const networkConfig = useMemo(() => NETWORK_CONFIG[chainName], [chainName])

  const { data: preparedTx } = usePrepareTransactionRequest({
    to: networkConfig.etherBridgeAddress as `0x${string}`,
    account: address,
    value: amount ? parseEther(amount) : undefined,
    data: destinationAddress && isValidSolanaAddress
      ? encodeFunctionData({
        abi,
        functionName: 'deposit',
        args: ['0x' + Buffer.from(base58.decode(destinationAddress)).toString('hex'), parseEther(amount || '0')],
      })
      : undefined,
  })

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
    if (!isConnected || !destinationAddress || !amount || !address || !chain || !preparedTx) return
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
      disabled={!isConnected || !isValidSolanaAddress || !amount || isSending || !preparedTx}
    >
      {isSending ? 'Bridging...' : 'Bridge'}
    </Button>
  )
}