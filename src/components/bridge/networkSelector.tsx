import React, { useMemo } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { mainnet, sepolia } from 'viem/chains'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const NetworkSelector = () => {
  const { chain } = useAccount()
  const { chains, switchChain } = useSwitchChain()
  

  const handleNetworkChange = (value: string) => {
    const chainId = parseInt(value)
    switchChain({ chainId })
  }
  const selectedChain = useMemo(() => chain?.id.toString() || mainnet.id.toString(), [chain])
  
  return (
    <Select onValueChange={handleNetworkChange} value={selectedChain}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Network" />
      </SelectTrigger>
      <SelectContent>
        {chains.map((chain) => (
          <SelectItem key={chain.id} value={chain.id.toString()}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}