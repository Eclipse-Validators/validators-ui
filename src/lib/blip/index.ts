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

const BLIP_FEE__WALLET_ADDRESS = "6juCmFHoPnJTzhjJfcjFhCXeptCE89vp9dHP91EUaxR8";
const BLIP_GROUP__ACCOUNT_ADDRESS =
  "b1ipWX4C4xYRYvNg2YRPM6EUofH9NqU8PwUtTK5VCrx";

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
