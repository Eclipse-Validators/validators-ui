import { ConnectKitButton } from "connectkit"
import { Input } from "@/components/ui/input"
import { useAccount, useBalance } from 'wagmi'
import { NetworkSelector } from "@/components/bridge/networkSelector"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { Button } from "../ui/button"
import { ChevronsUpDown } from "lucide-react"

interface EthereumSectionProps {
  amount: string
  setAmount: (amount: string) => void
}

export function EthereumSection({ amount, setAmount }: EthereumSectionProps) {
  const { address, isConnecting, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({
    address, query: {
      refetchInterval: 10000
    }
  })
  const [isNetworkSelectorVisible, setNetworkSelectorVisible] = useState(false);

  const minimumBalance = 0.002;
  const isBalanceTooLow = balance && Number(balance.formatted) < minimumBalance;

  const toggleNetworkSelector = () => {
    setNetworkSelectorVisible(!isNetworkSelectorVisible);
  };
  return (
    <div className="space-y-4">
      <ConnectKitButton theme="midnight" />
      {isConnected && <Collapsible
        open={isNetworkSelectorVisible}
        onOpenChange={setNetworkSelectorVisible}
        className="space-y-2"
      >
        <div className="flex items-center justify-between space-x-4">
          <h4 className="text-sm font-semibold">
            {chain?.name}
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-2">
          <NetworkSelector />
        </CollapsibleContent>
      </Collapsible>
      }

      <Input
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        step="0.001"
        className="bg-input text-foreground border-input"
      />
      {isConnected && (
        <div className="flex items-center justify-between bg-muted p-2 rounded">
          <span className="text-sm font-medium text-muted-foreground">
            Balance: {isConnecting ? 'Loading...' : balance !== null ? `${isNaN(Number(balance?.formatted)) ? '0.00' : Number(balance?.formatted).toFixed(4)} ETH` : '0.0000 ETH'}
          </span>
        </div>
      )}
      {isBalanceTooLow && (
        <div className="text-xs text-destructive">
          Balance is too low. Minimum required: {minimumBalance} ETH
        </div>
      )}
    </div>
  )
}