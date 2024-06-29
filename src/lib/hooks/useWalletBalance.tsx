import { useCallback, useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function useWalletBalance() {
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState(0);

    const fetchBalance = useCallback(async () => {
        if (!wallet?.publicKey) {
            setBalance(0);
            return;
        }
        const balance = await connection.getBalance(wallet.publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
    }, [wallet?.publicKey, connection]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return {
        balance,
        refreshBalance: fetchBalance
    };
}