import * as anchor from "@coral-xyz/anchor";
import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import {
  createNoopSigner,
  createSignerFromKeypair,
  generateSigner,
  publicKey,
  signerIdentity,
  sol,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base64 } from "@metaplex-foundation/umi/serializers";
import { creators, group, metadata, mint, niftyAsset } from "@nifty-oss/asset";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection } from "@solana/web3.js";

import { BlipRadar, IDL } from "../anchor/blip/blip";

const BLIP_FEE__WALLET_ADDRESS = "6juCmFHoPnJTzhjJfcjFhCXeptCE89vp9dHP91EUaxR8";
const BLIP_GROUP__ACCOUNT_ADDRESS =
  "b1ipWX4C4xYRYvNg2YRPM6EUofH9NqU8PwUtTK5VCrx";

const BLIP_COLLECTION_ADDRESS = "7MWzy1jbS3KC561EnY6DBixqToVwMfDqd7eXcGXZkj2A"; //DEVNET: HZp57kjtHqxptkn5KL4nJsZV5LYvGWb2oteGtB3t93wy

export async function generateBlipTransaction(
  from: string,
  to: string,
  metadataJsonUri: string
) {
  const fromNoopSigner = createNoopSigner(publicKey(from));
  const umi = createUmi(
    process.env.NEXT_PUBLIC_NETWORK ?? "https://mainnetbeta-rpc.eclipse.xyz"
  )
    .use(niftyAsset())
    .use(signerIdentity(fromNoopSigner, true));

  const groupAccountUint8 = new Uint8Array(
    JSON.parse(process.env.BLIP_NIFTY_GROUP_AUTHORITY_SECRET_KEY ?? "[]")
  );
  const groupAccountKeypair =
    umi.eddsa.createKeypairFromSecretKey(groupAccountUint8);
  const groupAccountSigner = createSignerFromKeypair(umi, groupAccountKeypair);

  const assetSigner = generateSigner(umi);
  const mintBuilderGroup = mint(umi, {
    asset: assetSigner,
    owner: publicKey(to),
    authority: groupAccountSigner.publicKey,
    mutable: false,
    payer: fromNoopSigner,
    standard: 0,
    name: "Blip",
    extensions: [
      metadata({
        uri: metadataJsonUri,
        symbol: "Blip",
        description:
          "Blip is a Validator's messaging service on Eclipse. https://validators.wtf/",
      }),
      creators([{ address: publicKey(from), share: 100 }]),
    ],
  });

  const transferSolIx = transferSol(umi, {
    source: fromNoopSigner,
    destination: publicKey(BLIP_FEE__WALLET_ADDRESS),
    amount: sol(0.001),
  });

  const groupIx = group(umi, {
    authority: groupAccountSigner,
    group: publicKey(BLIP_GROUP__ACCOUNT_ADDRESS),
    asset: assetSigner.publicKey,
  });

  const txn = await transactionBuilder()
    .add(transferSolIx)
    .add(mintBuilderGroup.merge())
    .add(groupIx)
    .buildWithLatestBlockhash(umi);

  const nftSignedTxn = await assetSigner.signTransaction(txn);
  const groupSignedTxn = await groupAccountSigner.signTransaction(nftSignedTxn);
  const serializedTxn = umi.transactions.serialize(groupSignedTxn);
  return base64.deserialize(serializedTxn)[0];
}

export async function generateBlipTransactionV2(
  from: string,
  to: string,
  metadataJsonUri: string
) {
  const conn = new Connection(
    process.env.NEXT_PUBLIC_NETWORK ?? "https://mainnetbeta-rpc.eclipse.xyz"
  );
  const collectionAuthorityUnit8 = new Uint8Array(
    JSON.parse(process.env.BLIP_COLLECTION_AUTHORITY ?? "[]")
  );
  const collectionAuthKp = anchor.web3.Keypair.fromSecretKey(
    collectionAuthorityUnit8
  );
  const customWallet: AnchorWallet = {
    publicKey: collectionAuthKp.publicKey,
    signTransaction: async <
      T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction,
    >(
      transaction: T
    ): Promise<T> => {
      if (transaction instanceof anchor.web3.Transaction) {
        transaction.sign(collectionAuthKp);
      }
      return transaction;
    },
    signAllTransactions: async <
      T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction,
    >(
      transactions: T[]
    ): Promise<T[]> => {
      return transactions.map((tx) => {
        if (tx instanceof anchor.web3.Transaction) {
          tx.sign(collectionAuthKp);
        }
        return tx;
      });
    },
  };
  const provider = new anchor.AnchorProvider(conn, customWallet);

  anchor.setProvider(provider);
  const program = new anchor.Program<BlipRadar>(IDL, provider);
  const asset = anchor.web3.Keypair.generate();
  const payer = new anchor.web3.PublicKey(from);
  const receiver = new anchor.web3.PublicKey(to);
  const feeAccount = new anchor.web3.PublicKey(BLIP_FEE__WALLET_ADDRESS);

  const tx = await program.methods
    .sendBlip(metadataJsonUri)
    .accountsPartial({
      asset: asset.publicKey,
      payer: payer,
      receiver: receiver,
      feeDestination: feeAccount,
      mplCoreProgram: new anchor.web3.PublicKey(
        "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
      ),
      collection: new anchor.web3.PublicKey(BLIP_COLLECTION_ADDRESS),
      collectionAuthority: collectionAuthKp.publicKey,
      systemProgram: new anchor.web3.PublicKey(
        "11111111111111111111111111111111"
      ),
    })
    .transaction();
  const latestBlockhash = await conn.getLatestBlockhash();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
  tx.feePayer = payer;
  tx.partialSign(collectionAuthKp);
  tx.partialSign(asset);
  const txnUnit8 = Uint8Array.from(
    tx.serialize({
      verifySignatures: false,
      requireAllSignatures: false,
    })
  );
  return base64.deserialize(txnUnit8)[0];
}
