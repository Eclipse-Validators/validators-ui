// utils/bridge.ts
import { encodeFunctionData, parseEther } from 'viem'
import { NETWORK_CONFIG } from './config'
import { mainnet, sepolia } from 'viem/chains'
import { base58 } from '@scure/base'

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

export function prepareBridgeTransaction(
  destinationAddress: string,
  amountEther: string,
  chainName: 'mainnet' | 'sepolia'
) {
  const networkConfig = NETWORK_CONFIG[chainName]
  if (!networkConfig) {
    throw new Error(`No configuration found for chain: ${chainName}`)
  }

  const amountWei = parseEther(amountEther)
  const destinationHex = '0x' + Buffer.from(base58.decode(destinationAddress)).toString('hex')

  const data = encodeFunctionData({
    abi,
    functionName: 'deposit',
    args: [destinationHex, amountWei],
  })

  return {
    to: networkConfig.etherBridgeAddress as `0x${string}`,
    value: amountWei,
    data: data,
  }
}