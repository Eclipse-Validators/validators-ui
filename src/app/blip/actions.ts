"use server";

import fs from "fs";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { createCanvas, Image, registerFont } from "canvas";
import sharp from "sharp";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const json = Buffer.from(process.env.ARWEAVE_KEY ?? "", "base64").toString();
const arweaveKey = JSON.parse(json) as JWKInterface;

export async function uploadJson(arweave: Arweave, tokenMetadata: any) {
  const transaction = await arweave.createTransaction(
    {
      data: tokenMetadata,
    },
    arweaveKey
  );
  transaction.addTag("Content-Type", "application/json");
  await arweave.transactions.sign(transaction, arweaveKey);
  const response = await arweave.transactions.post(transaction);

  if (response.status >= 400) {
    throw new Error("Unable to upload json");
  }

  return transaction;
}

export async function uploadImage(
  arweave: Arweave,
  imageType: string,
  image: ArrayBuffer
) {
  const transaction = await arweave.createTransaction(
    {
      data: image,
    },
    arweaveKey
  );
  transaction.addTag("Content-Type", imageType);
  await arweave.transactions.sign(transaction, arweaveKey);
  const response = await arweave.transactions.post(transaction);

  if (response.status >= 400) {
    throw new Error("Unable to upload image");
  }

  return transaction;
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  };
  return date.toLocaleString("en-US", options);
};

const TEMPLATE_IMG = fs.readFileSync("./public/blip/placeholder.png");

registerFont("./public/fonts/Manrope-Regular.ttf", { family: "Manrope" });

async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).png({ quality: 50, compressionLevel: 9 }).toBuffer();
}

function generateImage(text: string) {
  const canvas = createCanvas(1280, 1280);
  const ctx = canvas.getContext("2d");
  ctx.quality = "best";

  const placeholder = new Image();
  placeholder.src = TEMPLATE_IMG;

  ctx.drawImage(placeholder, 0, 0, 1280, 1280);

  ctx.fillStyle = "#fff";

  ctx.font = "70px Manrope";
  ctx.fillText(text, 200, 455);

  const buffer = canvas.toBuffer("image/png", {
    compressionLevel: 9,
    filters: canvas.PNG_FILTER_NONE,
  });

  return buffer;
}

export async function generateBlip(message: string, from: string) {
  try {
    const imgBuffer = generateImage(message);
    const compressedImgBuffer = await compressImage(imgBuffer);
    const imageTx = await uploadImage(
      arweave,
      "image/png",
      compressedImgBuffer
    );

    const imgTxId = imageTx.id;
    const imgUri = `https://www.arweave.net/${imageTx.id}?ext=png`;

    const tokenMetadata = {
      tokenName: "Blip",
      symbol: "Blip",
      description:
        "Blip is a Validator's messaging service on Eclipse. https://validators.wtf/",
      image: `https://www.arweave.net/${imgTxId}?ext=png`,
      attributes: [
        {
          trait_type: "Message",
          value: message.replace(/\n/g, " "),
        },
        {
          trait_type: "From",
          value: from,
        },
        {
          trait_type: "Date",
          value: formatDate(Date.now()),
        },
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: `https://www.arweave.net/${imgTxId}?ext=png`,
          },
        ],
      },
    };

    const jsonTx = await uploadJson(arweave, JSON.stringify(tokenMetadata));
    const jsonTxId = jsonTx.id;
    const jsonUri = `https://www.arweave.net/${jsonTxId}?ext=json`;

    const responseData = {
      imgUri,
      jsonUri,
    };

    return {
      data: responseData,
    };
  } catch (err) {
    return {
      error: (err as Error).message.toString(),
    };
  }
}
