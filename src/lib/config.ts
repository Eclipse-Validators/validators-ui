import { mainnet, sepolia } from 'viem/chains';

export const NETWORK_CONFIG = {
  mainnet: {
    etherBridgeAddress: '0x2B08D7cF7EafF0f5f6623d9fB09b080726D4be11',
    chain: mainnet,
    rpc: 'https://empty-responsive-patron.quiknode.pro/91dfa8475605dcdec9afdc8273578c9f349774a1/',
  },
  sepolia: {
    etherBridgeAddress: '0x11b8db6bb77ad8cb9af09d0867bb6b92477dd68e',
    chain: sepolia,
    rpc: 'https://maximum-frosty-forest.ethereum-sepolia.quiknode.pro/cca5941eb8511a5df51881ed54cb91d4eec479a1/',
  },
};