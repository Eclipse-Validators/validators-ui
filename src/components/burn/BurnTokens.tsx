"use client";

import React, { useCallback, useDeferredValue, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

import Image from "next/image";
import { useSPLTokens } from "@/lib/hooks/useWalletSplTokens";
import { useWalletTokens } from "@/lib/hooks/useWalletTokens";
import { FetchedTokenInfo } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useValidatorBurnProgram } from "../providers/ValidatorBurnProgramContext";
import { TokenCard } from "./BurnTokenCard";
import BurnCart from "./BurnCart";
import { useEmptyTokenAccounts } from "@/lib/hooks/useEmptyTokenAccounts";
import { Skeleton } from "../ui/skeleton";
import { EmptyAccountCard } from "./EmptyAccountCard";
import { FEE_COLLECTOR_ADDRESS, getConfigPda } from "@/lib/anchor/burn/constants";
import { toast } from "sonner";
import { BN } from "@coral-xyz/anchor";
import { useCoreAssets } from "@/lib/hooks/useCoreAssets";
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

const BurnTokens: React.FC = () => {
    const { connection } = useConnection();
    const { publicKey, signAllTransactions } = useWallet();
    const { program } = useValidatorBurnProgram();

    const {
        tokens: token2022Tokens,
        loading: loading2022,
        error: error2022,
        refreshTokens: refresh2022Tokens,
    } = useWalletTokens(true);

    const {
        tokens: splTokens,
        loading: loadingSPL,
        error: errorSPL,
        refreshTokens: refreshSPLTokens,
    } = useSPLTokens(true);

    const {
        emptyAccounts,
        loading: loadingEmptyAccounts,
        error: errorEmptyAccounts,
        refreshEmptyAccounts,
    } = useEmptyTokenAccounts();

    const {
        tokens: coreAssets,
        loading: loadingCore,
        error: errorCore,
        refreshTokens: refreshCoreAssets,
    } = useCoreAssets();

    const [selectedTokensWithAmount, setSelectedTokensWithAmount] = useState<{
        [tokenAccount: string]: { token: FetchedTokenInfo; amount?: string };
    }>({});
    const [activeTab, setActiveTab] = useState("spl");
    const [isBurnDisabled, setIsBurnDisabled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearch = useDeferredValue(searchQuery);

    const handleTokenSelection = (token: FetchedTokenInfo) => {
        setSelectedTokensWithAmount(prev => {
            const newSelection = { ...prev };
            if (newSelection[token.tokenAccount]) {
                delete newSelection[token.tokenAccount];
            } else {
                newSelection[token.tokenAccount] = {
                    token,
                    amount: token.decimals === 0 ? "1" : ""
                };
            }
            return newSelection;
        });
    };

    const handleAmountChange = (tokenAccount: string, amount: string) => {
        setSelectedTokensWithAmount(prev => ({
            ...prev,
            [tokenAccount]: {
                ...prev[tokenAccount],
                amount
            }
        }));
    };

    const renderTokenCards = useCallback(
        (tokens: FetchedTokenInfo[]) => {
            if (loadingSPL || loading2022) {
                return (
                    <Card>
                        <CardContent className="flex h-32 items-center justify-center">
                            <p>Loading...</p>
                        </CardContent>
                    </Card>
                );
            }

            if (!tokens || tokens.length === 0) {
                return (
                    <Card>
                        <CardContent className="flex h-32 items-center justify-center">
                            <p className="text-center text-gray-500">No tokens found</p>
                        </CardContent>
                    </Card>
                );
            }

            const filteredTokens = tokens.filter(token =>
                token.metadata?.name?.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                token.mint.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                token.metadata?.symbol?.toLowerCase().includes(deferredSearch.toLowerCase())
            );

            return filteredTokens.map((token) => (
                <TokenCard
                    key={token.tokenAccount}
                    token={token}
                    isSelected={!!selectedTokensWithAmount[token.tokenAccount]}
                    onSelect={() => handleTokenSelection(token)}
                    amount={selectedTokensWithAmount[token.tokenAccount]?.amount || ""}
                    onAmountChange={(amount) => handleAmountChange(token.tokenAccount, amount)}
                />
            ));
        },
        [selectedTokensWithAmount, deferredSearch, loadingSPL, loading2022]
    );

    const renderEmptyAccounts = useCallback(
        (tokens: FetchedTokenInfo[]) => {
            if (loadingEmptyAccounts) {
                return Array(6)
                    .fill(0)
                    .map((_, index) => <Skeleton key={index} />);
            }

            if (!tokens || tokens.length === 0) {
                return (
                    <Card className="w-full max-w-sm">
                        <CardContent className="flex h-32 items-center justify-center">
                            <p className="text-center text-gray-500">No empty accounts found</p>
                        </CardContent>
                    </Card>
                );
            }

            const filteredTokens = tokens
                .filter(token =>
                    token.metadata?.name?.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                    token.mint.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                    token.metadata?.symbol?.toLowerCase().includes(deferredSearch.toLowerCase())
                )
                .sort((a, b) => a.mint.localeCompare(b.mint));

            return filteredTokens.map((token) => (
                <EmptyAccountCard
                    key={token.tokenAccount}
                    token={token}
                    isSelected={!!selectedTokensWithAmount[token.tokenAccount]}
                    onSelect={() => handleTokenSelection(token)}
                />
            ));
        },
        [selectedTokensWithAmount, deferredSearch, loadingEmptyAccounts]
    );

    const renderCoreAssets = useCallback(
        (tokens: FetchedTokenInfo[]) => {
            if (loadingCore) {
                return (
                    <Card>
                        <CardContent className="flex h-32 items-center justify-center">
                            <p>Loading...</p>
                        </CardContent>
                    </Card>
                );
            }

            if (!tokens || tokens.length === 0) {
                return (
                    <Card>
                        <CardContent className="flex h-32 items-center justify-center">
                            <p className="text-center text-gray-500">No Core NFTs found</p>
                        </CardContent>
                    </Card>
                );
            }

            const filteredTokens = tokens.filter(token =>
                token.metadata?.name?.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                token.mint.toLowerCase().includes(deferredSearch.toLowerCase())
            );

            return filteredTokens.map((token) => (
                <TokenCard
                    key={token.tokenAccount}
                    token={token}
                    isSelected={!!selectedTokensWithAmount[token.tokenAccount]}
                    onSelect={() => handleTokenSelection(token)}
                    amount="1"
                    onAmountChange={() => { }} // Core NFTs are always amount 1
                />
            ));
        },
        [selectedTokensWithAmount, deferredSearch, loadingCore]
    );

    const handleBurn = async () => {
        if (!publicKey || !program || !signAllTransactions) return;
        const [configAccount] = getConfigPda(program.programId);
        try {
            setIsBurnDisabled(true);
            const MAX_TOKENS_PER_TRANSACTION = 5;
            const transactions: Transaction[] = [];
            let currentTx = new Transaction();
            let tokenCount = 0;

            for (const [tokenAccount, { token, amount }] of Object.entries(selectedTokensWithAmount)) {
                // For empty accounts, use closeTokenAccount instruction
                if (token.amount === 0) {
                    const closeInstruction = await program.methods
                        .closeTokenAccount()
                        .accountsPartial({
                            payer: publicKey,
                            tokenAccount: new PublicKey(token.tokenAccount),
                            tokenProgram: token.programId,
                            feeCollector: FEE_COLLECTOR_ADDRESS,
                            config: configAccount,
                            systemProgram: SystemProgram.programId,
                        })
                        .instruction();

                    currentTx.add(closeInstruction);
                }
                // For NFTs (tokens with decimals = 0), use burnMetaplexNft
                else if (token.programId === MPL_CORE_PROGRAM_ID.toString()) {
                    const burnInstruction = await program.methods
                        .burnMetaplexCore()
                        .accountsPartial({
                            payer: publicKey,
                            asset: new PublicKey(token.mint),
                            collection: token.metadata?.collectionAddress ? new PublicKey(token.metadata.collectionAddress) : null,
                            feeCollector: FEE_COLLECTOR_ADDRESS,
                            config: configAccount,
                            mplCoreProgram: MPL_CORE_PROGRAM_ID,
                            systemProgram: SystemProgram.programId,
                        })
                        .instruction();

                    currentTx.add(burnInstruction);
                }
                else if (token.decimals === 0 && token.programId !== MPL_CORE_PROGRAM_ID.toString()) {
                    // const burnInstruction = await program.methods
                    //     .burnMetaplexNft()
                    //     .accountsPartial({
                    //         payer: publicKey,
                    //         tokenAccount: new PublicKey(token.tokenAccount),
                    //         mint: new PublicKey(token.mint),
                    //         metadata: /* need to derive metadata PDA */,
                    //         masterEdition: /* need to derive master edition PDA */,
                    //         tokenProgram: token.programId,
                    //         feeCollector: new PublicKey(FEE_COLLECTOR_ADDRESS),
                    //         config: new PublicKey(CONFIG_ADDRESS),
                    //     })
                    //     .instruction();

                    // currentTx.add(burnInstruction);
                }
                // For fungible tokens, use burnToken
                else {
                    console.log(token, amount);
                    const burnAmount = parseFloat(amount!) * Math.pow(10, token.decimals);
                    const burnAmountLamports = new BN(burnAmount);
                    const burnInstruction = await program.methods
                        .burn(burnAmountLamports)
                        .accountsPartial({
                            payer: publicKey,
                            tokenAccount: new PublicKey(token.tokenAccount),
                            mint: new PublicKey(token.mint),
                            tokenProgram: token.programId,
                            feeCollector: FEE_COLLECTOR_ADDRESS,
                            config: configAccount,
                            systemProgram: SystemProgram.programId,
                        })
                        .instruction();

                    currentTx.add(burnInstruction);
                }

                tokenCount++;
                if (tokenCount === MAX_TOKENS_PER_TRANSACTION) {
                    transactions.push(currentTx);
                    currentTx = new Transaction();
                    tokenCount = 0;
                }
            }

            if (tokenCount > 0) {
                transactions.push(currentTx);
            }

            const { blockhash } = await connection.getLatestBlockhash();
            transactions.forEach((tx) => {
                tx.recentBlockhash = blockhash;
                tx.feePayer = publicKey;
            });
            const signedTransactions = await signAllTransactions(transactions);
            for (const tx of signedTransactions) {
                const sig = await connection.sendRawTransaction(tx.serialize());
                await connection.confirmTransaction(sig, 'confirmed');
                toast.success(`Transaction confirmed: ${sig.slice(0, 8)}...`);
            }

            // Refresh all token lists
            refresh2022Tokens();
            refreshSPLTokens();
            refreshEmptyAccounts();
            refreshCoreAssets();

            // Clear selected tokens after successful burn
            setSelectedTokensWithAmount({});

        } catch (error) {
            console.error("Error burning tokens:", error);
            toast.error("Failed to burn tokens");
        } finally {
            setIsBurnDisabled(false);
        }
    };

    if (errorSPL || error2022 || errorEmptyAccounts || errorCore) return <div>Error: {errorSPL || error2022 || errorEmptyAccounts || errorCore}</div>;

    return (
        <div className="container mx-auto p-4 pb-32">
            <div className="flex items-center justify-center pb-24">
                <Image src="/blackhole.png" alt="Burn" width={150} height={150} />
            </div>
            <h1 className="mb-4 text-2xl font-bold">Burn Tokens</h1>

            <div className="mb-8 space-y-4 max-w-3xl">
                <p className="text-lg text-muted-foreground">
                    Reclaim ETH from unused accounts or burn tokens that will reduce token supply.
                </p>

                <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                        WARNING
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-500">
                        Burning your entire balance will close your token account and is not recoverable.
                        Closing empty accounts is safe.
                    </p>
                </div>

                <div className="p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-950/30">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Validators are not responsible for lost tokens or NFTs. Use at your own risk.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="spl">SPL Tokens</TabsTrigger>
                    <TabsTrigger value="token2022">Token-2022</TabsTrigger>
                    <TabsTrigger value="empty">Empty Accounts</TabsTrigger>
                    <TabsTrigger value="nfts">NFTs</TabsTrigger>
                </TabsList>

                <div className="relative mt-4">
                    <Input
                        type="text"
                        placeholder="Search tokens..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full max-w-sm pr-8"
                    />
                </div>

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

                <TabsContent value="empty">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {renderEmptyAccounts(emptyAccounts)}
                    </div>
                </TabsContent>

                <TabsContent value="nfts">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {renderCoreAssets(coreAssets)}
                    </div>
                </TabsContent>

            </Tabs>

            <BurnCart
                selectedTokens={Object.values(selectedTokensWithAmount)}
                onRemove={(tokenAccount) => {
                    setSelectedTokensWithAmount(prev => {
                        const newSelection = { ...prev };
                        delete newSelection[tokenAccount];
                        return newSelection;
                    });
                }}
                onBurn={handleBurn}
                isBurnDisabled={isBurnDisabled}
            />
        </div>
    );
};

export default BurnTokens;