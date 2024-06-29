import { Program } from "@coral-xyz/anchor"
import {
    getAssociatedTokenAddressSync,
    TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token"
import { AnchorWallet } from "@solana/wallet-adapter-react"
import {
    ComputeBudgetProgram,
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmRawTransaction,
    SystemProgram,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js"

import { getEditionsPda } from "../../anchor/editions/pdas/getEditionsPda"
import { getHashlistPda } from "../../anchor/editions/pdas/getHashlistPda"
import { PROGRAM_ID_GROUP_EXTENSIONS } from "../constants"
import { decodeEditions } from "../editions/accounts"
import { LibreplexEditions } from "../editions/libreplex_editions"
import { getHashlistMarkerPda } from "../editions/pdas/getHashlistMarkerPda"
import { decodeEditionsControls } from "./accounts"
import { LibreplexEditionsControls } from "./libreplex_editions_controls"
import { getEditionsControlsPda } from "./pdas/getEditionsControlsPda"
import { getMinterStatsPda } from "./pdas/getMinterStatsPda"
import { getMinterStatsPhasePda } from "./pdas/getMinterStatsPhasePda"

export interface IMintWithControls {
    phaseIndex: number
    editionsId: string
    numberOfMints: number
}

const MAX_MINTS_PER_TRANSACTION = 2
export interface IExecutorParams<T> {
    wallet: AnchorWallet
    params: T
    connection: Connection
    editionsProgram: Program<LibreplexEditions>
    editionsControlsProgram: Program<LibreplexEditionsControls>
}
export const mintWithControls = async ({
    wallet,
    params,
    connection,
    editionsControlsProgram,
    editionsProgram,
}: IExecutorParams<IMintWithControls>) => {
    const { phaseIndex, editionsId, numberOfMints } = params
    const editions = new PublicKey(editionsId)

    const editionsData = await connection.getAccountInfo(editions)

    if (!editionsData) {
        throw Error("Editions not found")
    }

    const editionsObj = decodeEditions(editionsProgram)(
        editionsData.data,
        editions
    )

    const editionsControlsPda = getEditionsControlsPda(editions)

    const editionsControlsData =
        await connection.getAccountInfo(editionsControlsPda)

    const editionsControlsObj = decodeEditionsControls(editionsControlsProgram)(
        editionsControlsData?.data,
        editionsControlsPda
    )

    const hashlist = getHashlistPda(editions)[0]

    const minterStats = getMinterStatsPda(editions, wallet.publicKey)[0]

    const minterStatsPhase = getMinterStatsPhasePda(
        editions,
        wallet.publicKey,
        phaseIndex
    )[0]

    let remainingMints = numberOfMints
    console.log(editionsControlsData, editionsControlsObj)

    let txs: Transaction[] = []
    const mintsGlobal: PublicKey[] = []
    const membersGlobal: PublicKey[] = []
    //TODO: Split transactions into multiple to avoid txn too large errors
    while (remainingMints > 0) {
        const instructions: TransactionInstruction[] = []
        const mints: Keypair[] = []
        const members: Keypair[] = []
        instructions.push(
            ComputeBudgetProgram.setComputeUnitLimit({
                units: 850_000,
            })
        )

        for (
            let i = 0;
            i < Math.min(MAX_MINTS_PER_TRANSACTION, remainingMints);
            ++i
        ) {
            const mint = Keypair.generate()
            const member = Keypair.generate()

            mints.push(mint)
            members.push(member)
            mintsGlobal.push(mint.publicKey)
            membersGlobal.push(member.publicKey)

            const tokenAccount = getAssociatedTokenAddressSync(
                mint.publicKey,
                wallet.publicKey,
                false,
                TOKEN_2022_PROGRAM_ID
            )

            const hashlistMarker = getHashlistMarkerPda(editions, mint.publicKey)[0]

            instructions.push(
                await editionsControlsProgram.methods
                    .mintWithControls({
                        phaseIndex,
                    })
                    .accounts({
                        editionsDeployment: editions,
                        editionsControls: editionsControlsPda,
                        hashlist,
                        hashlistMarker,
                        payer: wallet.publicKey,
                        mint: mint.publicKey,
                        member: member.publicKey,
                        signer: wallet.publicKey,
                        minter: wallet.publicKey,
                        minterStats,
                        minterStatsPhase,
                        group: editionsObj?.item?.group,
                        groupExtensionProgram: PROGRAM_ID_GROUP_EXTENSIONS,
                        tokenAccount,
                        treasury: editionsControlsObj?.item?.treasury,
                        systemProgram: SystemProgram.programId,
                        tokenProgram: TOKEN_2022_PROGRAM_ID,
                        libreplexEditionsProgram: editionsProgram.programId,
                    })
                    .signers([mint, member])
                    .instruction()
            )
        }

        remainingMints -= MAX_MINTS_PER_TRANSACTION
        const tx = new Transaction().add(...instructions)
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
        tx.feePayer = wallet.publicKey
        tx.sign(...mints, ...members)
        txs.push(tx)
    }

    const txns = await wallet.signAllTransactions(txs)

    const promises = txns.map((item) => {
        return sendAndConfirmRawTransaction(connection, item.serialize())
    })

    await Promise.all(promises)

    return {
        editions,
        editionsControls: editionsControlsPda,
        mints: mintsGlobal,
        members: membersGlobal,
    }
}
