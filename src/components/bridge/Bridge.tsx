'use client'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { EthereumSection } from '@/components/bridge/EthereumSection'
import { SolanaSection } from "@/components/bridge/SolanaSection"
import { BridgeButton } from '@/components/bridge/BridgeButton'
import Image from 'next/image'
import { RecentBridgesTable } from '@/components/bridge/RecentBridgesTable'

type RecentTransaction = {
    hash: string
    amount: string
    timestamp: string
}

const STORAGE_KEY = 'recentBridgeTransactions';

export default function Bridge() {
    const [amount, setAmount] = useState('0.002')
    const [destinationAddress, setDestinationAddress] = useState('')
    const [isValidSolanaAddress, setIsValidSolanaAddress] = useState(false)
    const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
    const addTransaction = (hash: string, amount: string) => {
        const newTransaction: RecentTransaction = {
            hash,
            amount,
            timestamp: new Date().toLocaleString(),
        }
        const updatedTransactions = [newTransaction, ...recentTransactions].slice(0, 10);
        setRecentTransactions(updatedTransactions);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
    }
    useEffect(() => {
        const storedTransactions = sessionStorage.getItem(STORAGE_KEY);
        if (storedTransactions) {
            setRecentTransactions(JSON.parse(storedTransactions));
        }
    }, []);
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-4">
                <div className="text-center py-8">
                    <div className="flex justify-center">
                        <a href="https://validators.wtf" target="_blank" rel="noopener noreferrer">
                            <Image src="/logo/logotrans.png" alt="Eclipse Logo" width={100} height={100} />
                        </a>
                    </div>
                    <h1 className="text-4xl font-bold text-primary">Eclipse Bridge</h1>
                    <p className="text-xl text-muted-foreground mt-2">Bridge ETH to Eclipse</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 justify-center items-start">
                    <Card className="w-full md:w-[350px]">
                        <CardHeader>
                            <CardTitle>From Ethereum</CardTitle>
                            <CardDescription>Select network and amount</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EthereumSection
                                amount={amount}
                                setAmount={setAmount}
                            />
                        </CardContent>
                    </Card>
                    <Card className="w-full md:w-[350px]">
                        <CardHeader>
                            <CardTitle>To Eclipse</CardTitle>
                            <CardDescription>Connect your wallet or enter an address</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SolanaSection
                                destinationAddress={destinationAddress}
                                setDestinationAddress={setDestinationAddress}
                                isValidSolanaAddress={isValidSolanaAddress}
                                setIsValidSolanaAddress={setIsValidSolanaAddress}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-8 text-center">
                    <BridgeButton
                        amount={amount}
                        destinationAddress={destinationAddress}
                        isValidSolanaAddress={isValidSolanaAddress}
                        onTransactionSent={(hash) => addTransaction(hash, amount)}
                    />
                </div>
                {recentTransactions.length >= 1 && (
                    <div className="mt-8">
                        <RecentBridgesTable transactions={recentTransactions} />
                    </div>
                )}
            </main>
            <footer className="mt-auto py-4 text-center">
                <div className="flex justify-center items-center">
                    <span className="text-sm text-muted-foreground mr-2">Powered by</span>
                    <a href="https://validators.wtf" target="_blank" rel="noopener noreferrer">
                        <Image src="/logo/validatorswordmark.png" alt="Eclipse Logo" width={100} height={30} />
                    </a>
                </div>
            </footer>
        </div>
    )
}