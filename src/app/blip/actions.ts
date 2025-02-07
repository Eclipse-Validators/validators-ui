"use server";

import fs from "fs";
import path from "path";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { createCanvas, Image, registerFont } from "canvas";
import { decode, decodeFrames, encode } from "modern-gif";
import sharp from "sharp";

import { generateBlipTransactionV2, getTemplates, Template } from "@/lib/blip";

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
  image: Buffer
) {
  const arrayBuffer = image.buffer.slice(
    image.byteOffset,
    image.byteOffset + image.byteLength
  ) as ArrayBuffer;

  const transaction = await arweave.createTransaction(
    {
      data: arrayBuffer,
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

const TEMPLATE_IMG = fs.readFileSync(
  path.join(process.cwd(), "./public/blip/placeholder.png")
);
// read the font so vercel nft pulls it in
const FONT = fs.readFileSync(
  path.join(process.cwd(), "./public/fonts/Manrope-Regular.ttf")
);
console.log(FONT);

registerFont(path.join(process.cwd(), "./public/fonts/Manrope-Regular.ttf"), {
  family: "Manrope",
});

async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).png({ quality: 50, compressionLevel: 9 }).toBuffer();
}

function generateImage(text: string, templateBuffer: Buffer) {
  const canvas = createCanvas(1280, 1280);
  const ctx = canvas.getContext("2d");
  ctx.quality = "best";

  const placeholder = new Image();
  placeholder.src = templateBuffer;

  ctx.drawImage(placeholder, 0, 0, 1280, 1280);

  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)"; // Semi-transparent black shadow
  ctx.shadowBlur = 10; // Blur effect
  ctx.shadowOffsetX = 5; // Horizontal offset
  ctx.shadowOffsetY = 5; // Vertical offset

  ctx.font = "70px Manrope";
  ctx.strokeText(text, 200, 455); // Draw the outline first

  ctx.fillText(text, 200, 455);

  const buffer = canvas.toBuffer("image/png", {
    compressionLevel: 9,
    filters: canvas.PNG_FILTER_NONE,
  });

  return buffer;
}

export async function getConfigTemplates() {
  const templates = await getTemplates();
  return templates;
}

export async function generateBlip(
  template: Template,
  message: string,
  to: string,
  from: string
) {
  try {
    const response = await fetch(template.uri);
    const templateBuffer = await response.arrayBuffer();

    let finalImgBuffer: Buffer;
    let contentType: string = "image/png";
    let extension: string = "png";

    if (template.artistName === "Ash") {
      const gif = await generateGifWithText(
        message,
        Buffer.from(templateBuffer)
      );
      const imgBuffer = Buffer.from(gif.split(",")[1], "base64");
      contentType = "image/gif";
      extension = "gif";
      finalImgBuffer = imgBuffer;
    } else {
      const imgBuffer = generateImage(message, Buffer.from(templateBuffer));
      finalImgBuffer = await compressImage(imgBuffer);
    }

    // fs.writeFileSync(
    //   path.join(process.cwd(), "./public/blip/finalImgBuffer.png"),
    //   finalImgBuffer.toString("binary"),
    //   "binary"
    // );
    // return;

    const imageTx = await uploadImage(arweave, contentType, finalImgBuffer);
    const imgTxId = imageTx.id;
    const imgUri = `https://www.arweave.net/${imageTx.id}?ext=${extension}`;

    const attributes = [
      {
        trait_type: "Message",
        value: message.replace(/\n/g, " "),
      },
      {
        trait_type: "To",
        value: to,
      },
      {
        trait_type: "From",
        value: from,
      },
      {
        trait_type: "Date",
        value: formatDate(Date.now()),
      },
    ];

    if (template.artistName !== "Validators") {
      attributes.push({
        trait_type: "Artist",
        value: template.artistName,
      });
    }

    const tokenMetadata = {
      tokenName: "Blip",
      symbol: "Blip",
      description:
        "Blip is a Validator's messaging service on Eclipse. https://validators.wtf/",
      image: `https://www.arweave.net/${imgTxId}?ext=${extension}`,
      attributes,
      properties: {
        files: [
          {
            type: contentType,
            uri: `https://www.arweave.net/${imgTxId}?ext=${extension}`,
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

    console.log(responseData);

    const blipSerializedTxn = await generateBlipTransactionV2(
      template,
      from,
      to,
      jsonUri
    );

    return {
      data: responseData,
      serializedTxn: blipSerializedTxn,
    };
  } catch (err) {
    console.error(err);
    return {
      error: (err as Error).message.toString(),
    };
  }
}

export async function generateGifWithText(
  text: string,
  templateBuffer: Buffer
) {
  try {
    //@ts-ignore
    const frames = await decodeFrames(templateBuffer);
    console.time("Generating gif message");
    console.timeLog("Generating gif message", { frames: frames.length });

    const processedFrames = frames.map((frame) => {
      const canvas = createCanvas(frame.width, frame.height);
      const ctx = canvas.getContext("2d");

      const imageData = ctx.createImageData(frame.width, frame.height);
      imageData.data.set(frame.data);
      ctx.putImageData(imageData, 0, 0);

      ctx.font = "70px Manrope";
      ctx.fillText(text, 180, 300);

      const newImageData = ctx.getImageData(0, 0, frame.width, frame.height);

      return {
        ...frame,
        data: newImageData.data,
      };
    });

    const output = await encode({
      width: frames[0].width,
      height: frames[0].height,
      frames: processedFrames,
      maxColors: 256,
    });

    return `data:image/gif;base64,${Buffer.from(output).toString("base64")}`;
  } catch (err) {
    console.error("GIF generation error:", err);
    throw err;
  }
}
