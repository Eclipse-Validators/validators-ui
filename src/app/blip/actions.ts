"use server";

import fs from "fs";
import path from "path";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { createCanvas, Image, registerFont } from "canvas";
import { applyPalette, GIFEncoder, quantize } from "gifenc";
import { decode, decodeFrames } from "modern-gif";
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

export type CanvasConfig = {
  text?: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fillStyle: string;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
};

function generateImage(
  text: string,
  templateBuffer: Buffer,
  config?: CanvasConfig
) {
  const canvas = createCanvas(1280, 1280);
  const ctx = canvas.getContext("2d");
  ctx.quality = "best";

  const placeholder = new Image();
  placeholder.src = templateBuffer;

  ctx.drawImage(placeholder, 0, 0, 1280, 1280);

  if (config) {
    ctx.fillStyle = config.fillStyle;
    ctx.shadowColor = config.shadowColor;
    ctx.shadowBlur = config.shadowBlur;
    ctx.shadowOffsetX = config.shadowOffsetX;
    ctx.shadowOffsetY = config.shadowOffsetY;
    ctx.font = `${config.fontSize}px ${config.fontFamily}`;
    ctx.fillText(text, config.x, config.y);
  } else {
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.font = "70px Manrope";
    ctx.strokeText(text, 200, 455);
    ctx.fillText(text, 200, 455);
  }

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

export type TemplateWithConfig = Template & {
  config?: CanvasConfig;
};

export async function generateBlip(
  template: TemplateWithConfig,
  message: string,
  to: string,
  from: string,
  config?: CanvasConfig
): Promise<{
  data: {
    preview?: boolean;
    buffer?: string;
    contentType?: string;
    extension?: string;
  };
  error?: string;
  serializedTxn?: string;
}> {
  try {
    const response = await fetch(template.uri);
    const templateBuffer = await response.arrayBuffer();

    let finalImgBuffer: Buffer;
    let contentType: string = "image/png";
    let extension: string = "png";

    if (template.artistName === "Ash" || template.artistName === "Ashes") {
      const gif = await generateGifWithText(
        message,
        Buffer.from(templateBuffer),
        template.config ?? config
      );
      const imgBuffer = Buffer.from(gif.split(",")[1], "base64");
      contentType = "image/gif";
      extension = "gif";
      finalImgBuffer = imgBuffer;
    } else {
      const imgBuffer = generateImage(
        message,
        Buffer.from(templateBuffer),
        template.config ?? config
      );
      finalImgBuffer = await compressImage(imgBuffer);
    }

    // If this is a preview request, return the buffer and content type
    if (to === "preview") {
      return {
        data: {
          preview: true,
          // @ts-ignore
          buffer: Buffer.from(finalImgBuffer).toString("base64"),
          contentType,
          extension,
        },
      };
    }

    // Continue with normal flow for non-preview requests
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
      // @ts-ignore
      data: responseData,
      serializedTxn: blipSerializedTxn,
    };
  } catch (err) {
    console.error(err);
    // @ts-ignore
    return {
      error: (err as Error).message.toString(),
    };
  }
}

export async function generateGifWithText(
  text: string,
  templateBuffer: Buffer,
  config?: CanvasConfig
) {
  try {
    //@ts-ignore
    const frames = await decodeFrames(templateBuffer);

    if (!frames || frames.length === 0) {
      throw new Error("No frames decoded from GIF");
    }

    console.time("Generating gif message");
    console.log("Processing frames:", {
      frameCount: frames.length,
      firstFrameSize: frames[0]
        ? `${frames[0].width}x${frames[0].height}`
        : "unknown",
    });

    const gif = GIFEncoder();

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      if (!frame || !frame.data) {
        throw new Error(`Invalid frame data at index ${i}`);
      }

      const canvas = createCanvas(frame.width, frame.height);
      const ctx = canvas.getContext("2d");

      // Create and verify imageData
      const imageData = ctx.createImageData(frame.width, frame.height);
      if (!imageData || !imageData.data) {
        throw new Error(`Failed to create image data for frame ${i}`);
      }

      // Copy frame data
      for (
        let i = 0;
        i < Math.min(frame.data.length, imageData.data.length);
        i++
      ) {
        imageData.data[i] = frame.data[i];
      }

      ctx.putImageData(imageData, 0, 0);

      // Apply text styling based on config
      if (config) {
        ctx.fillStyle = config.fillStyle;
        ctx.shadowColor = config.shadowColor;
        ctx.shadowBlur = config.shadowBlur;
        ctx.shadowOffsetX = config.shadowOffsetX;
        ctx.shadowOffsetY = config.shadowOffsetY;
        ctx.font = `${config.fontSize}px ${config.fontFamily}`;
        ctx.fillText(text, config.x, config.y);
      } else {
        // Default styling
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.font = "70px Manrope";
        ctx.fillText(text, 180, 300);
      }

      const newImageData = ctx.getImageData(0, 0, frame.width, frame.height);
      const rgba = new Uint8Array(frame.width * frame.height * 4);
      rgba.set(newImageData.data);

      // Set all alpha values to 255 (fully opaque)
      for (let j = 3; j < rgba.length; j += 4) {
        rgba[j] = 255;
      }

      // Quantize and apply palette
      const palette = quantize(rgba, 256);
      const index = applyPalette(rgba, palette);

      // Add frame to GIF
      gif.writeFrame(index, frame.width, frame.height, {
        palette,
        delay: frame.delay || 100,
      });
    }

    gif.finish();
    const output = gif.bytes();

    return `data:image/gif;base64,${Buffer.from(output).toString("base64")}`;
  } catch (err) {
    console.error("GIF generation error:", err);
    throw err;
  }
}
