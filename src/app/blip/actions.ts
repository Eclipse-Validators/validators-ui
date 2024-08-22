"use server";

import fs from "fs";
import { createCanvas, Image, registerFont } from "canvas";

const TEMPLATE_IMG = fs.readFileSync("./public/blip/placeholder.png");

registerFont("./public/fonts/Manrope-Regular.ttf", { family: "Manrope" });

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
    compressionLevel: 0,
    filters: canvas.PNG_FILTER_NONE,
  });

  return buffer;
}

export async function generateBlip(text: string) {
  return generateImage(text);
}
