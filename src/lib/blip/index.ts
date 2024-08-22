import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import {
  createNoopSigner,
  generateSigner,
  publicKey,
  signerIdentity,
  sol,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base64 } from "@metaplex-foundation/umi/serializers";
import { creators, metadata, mint, niftyAsset } from "@nifty-oss/asset";

const BLIP_FEE__WALLET_ADDRESS = "6juCmFHoPnJTzhjJfcjFhCXeptCE89vp9dHP91EUaxR8";

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

  const assetSigner = generateSigner(umi);
  const mintBuilderGroup = mint(umi, {
    asset: assetSigner,
    owner: publicKey(to),
    authority: publicKey(to),
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

  const txn = await transactionBuilder()
    .add(transferSolIx)
    .add(mintBuilderGroup.merge())
    .buildWithLatestBlockhash(umi);

  const nftSignedTxn = await assetSigner.signTransaction(txn);
  const serializedTxn = umi.transactions.serialize(nftSignedTxn);
  return base64.deserialize(serializedTxn)[0];
}
