"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPicker } from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

import { generateBlip, type CanvasConfig } from "../actions";

const ConfigExport = ({ config }: { config: CanvasConfig }) => {
  const [copied, setCopied] = useState(false);

  const configString = JSON.stringify(config, null, 2);

  const copyConfig = async () => {
    await navigator.clipboard.writeText(configString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-[#ff4d94]/30 bg-[#8b283c]/20 p-4">
      <div className="mb-2 flex items-center justify-between">
        <Label>Configuration Export</Label>
        <Button
          onClick={copyConfig}
          className="bg-[#ff4d94] hover:bg-[#ff4d94]/90"
          size="sm"
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <pre className="max-h-40 overflow-auto rounded bg-black/20 p-2 text-sm">
        <code>{configString}</code>
      </pre>
    </div>
  );
};

export default function PreviewPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    "https://arweave.net/PGGyjImnEhdicy9RMDng-vowIqbY7CpTUKi2_5XZl08?ext=png"
  );
  const [config, setConfig] = useState<CanvasConfig>({
    text: "Your Valentine's message here...",
    x: 200,
    y: 455,
    fontSize: 70,
    fontFamily: "Manrope",
    fillStyle: "#ffffff",
    shadowColor: "rgba(0, 0, 0, 0.7)",
    shadowBlur: 10,
    shadowOffsetX: 5,
    shadowOffsetY: 5,
  });
  const [clickCount, setClickCount] = useState(0);
  const clickTimeout = useRef<NodeJS.Timeout>();
  const [textOverflow, setTextOverflow] = useState<{
    right?: boolean;
    bottom?: boolean;
  }>({});

  // Template options from the main page
  const templates = [
    {
      uri: "https://arweave.net/PGGyjImnEhdicy9RMDng-vowIqbY7CpTUKi2_5XZl08?ext=png",
      name: "Validators",
    },
    {
      uri: "https://arweave.net/Tv6NY-P8jSHWgX5-t_DswyOUpQ6SsOd6rsfZXnCtU_Y?ext=png",
      name: "94L1",
    },
    {
      uri: "https://arweave.net/5mqX54T47CX9OYReHK2cWleDquiSRhuP6xPD6K2Ukf0?ext=png",
      name: "Makoto",
    },
    {
      uri: "https://arweave.net/xNg-bP-UtKr8XHE_iWohHHUunWJsKH7kHby8Io-AF94?ext=png",
      name: "MTG",
    },
    {
      uri: "https://arweave.net/BVTWD1X4EACbUXinX2SoCzfYglF_TDDZivZO8HijB8c?ext=png",
      name: "DanFarz",
    },
    {
      uri: "https://arweave.net/2lALp4UClaSuMAdM9f7DqdxhfLu4tD6CzQzjDmERvEE?ext=gif",
      name: "Ashes",
    },
    {
      uri: "https://arweave.net/7570C2s21UYRjCmsoGZ2iq3QWBxj1IyPKA0dzNHdy1w?ext=gif",
      name: "Ashes",
    },
    {
      uri: "https://arweave.net/Opo1BMaJOEL7frhtnlsstOpeTMj2uK71KHBGpRx3LJA?ext=gif",
      name: "Ash",
    },
    {
      uri: "https://arweave.net/Ot1Ju61AtjpOl2Tt5lyioOJeEi8SChjqUIuB35pKVDs?ext=gif",
      name: "Ash",
    },
    {
      uri: "https://arweave.net/sfEUHNREXt3fme5kJkhizJDFzeLcndfIt3bgs80uRp0?ext=png",
      name: "Apotiq1",
    },
    {
      uri: "https://arweave.net/6s2Jv_O2sFuw12p38wMq4NTit_KwiR8ADu9YcKeNdk8?ext=png",
      name: "94L1",
    },
    {
      uri: "https://arweave.net/5wCoYqrfh0nr10sdpzHSm1uaUadmfDxdJI4TN-n4Ljk?ext=png",
      name: "DanFarz",
    },
    {
      uri: "https://arweave.net/wTPoJZ5Ru0OmQRyKQHHeYTH6ww1i8GJn51aC4Q70x08?ext=png",
      name: "Notrev",
    },
    // Add other templates as needed
  ];

  const updateCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const templateImg = new (window.Image as any)();
    templateImg.crossOrigin = "anonymous";

    await new Promise((resolve, reject) => {
      templateImg.onload = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw template
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

        // Apply text configurations
        ctx.fillStyle = config.fillStyle;
        ctx.shadowColor = config.shadowColor;
        ctx.shadowBlur = config.shadowBlur;
        ctx.shadowOffsetX = config.shadowOffsetX;
        ctx.shadowOffsetY = config.shadowOffsetY;

        ctx.font = `${config.fontSize}px ${config.fontFamily}`;

        // Check for text overflow
        const lines = config.text?.split("\n") ?? [];
        const overflow = { right: false, bottom: false };

        lines.forEach((line, index) => {
          const metrics = ctx.measureText(line);
          const lineWidth = metrics.width;
          const lineHeight = config.fontSize;
          const totalHeight = (index + 1) * lineHeight;

          // Check right overflow
          if (config.x + lineWidth > canvas.width - 40) {
            // 40px margin
            overflow.right = true;
          }

          // Check bottom overflow
          if (config.y + totalHeight > canvas.height - 40) {
            // 40px margin
            overflow.bottom = true;
          }

          // Draw text
          ctx.fillText(line, config.x, config.y + index * config.fontSize);
        });

        setTextOverflow(overflow);
        resolve(true);
      };
      templateImg.onerror = reject;
      templateImg.src = selectedTemplate;
    });
  };

  // Update canvas when template or config changes
  useEffect(() => {
    updateCanvas();
  }, [selectedTemplate, config]);

  const handlePreviewClick = async () => {
    setClickCount((prev) => prev + 1);

    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
    }
    clickTimeout.current = setTimeout(() => setClickCount(0), 1000);

    if (clickCount === 2) {
      setClickCount(0);
      const toastId = toast.loading("Generating preview image...");

      try {
        const template = {
          uri: selectedTemplate,
          mint: "",
          artistWallet: "",
          artistName: "Preview",
          artistSocials: "",
          feePremiumLamports: 0,
        };

        const response = await generateBlip(
          template,
          config.text!,
          "preview",
          "preview",
          config
        );

        if (response?.error) {
          toast.error("Failed to generate preview", { id: toastId });
          return;
        }

        // Handle the preview data
        if (response.data?.preview) {
          const { buffer, contentType, extension } = response.data;
          // Convert base64 string to Uint8Array
          const binaryString = atob(buffer as string);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([bytes], { type: contentType });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `blip-preview.${extension}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          toast.success("Preview generated! Check your downloads folder.", {
            id: toastId,
          });
        }
      } catch (error) {
        toast.error("Failed to generate preview", { id: toastId });
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#C8003C] p-4 text-white">
      <div className="mx-auto max-w-6xl">
        <Card className="border-white/30 bg-[#B4003C]/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Blip Preview Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Preview Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preview</h3>
                <div className="relative">
                  <div
                    className="relative aspect-square rounded-lg border border-[#ff4d94]/30 bg-[#8b283c]/20"
                    onClick={handlePreviewClick}
                  >
                    <canvas
                      ref={canvasRef}
                      width={1280}
                      height={1280}
                      className="h-full w-full cursor-pointer rounded-lg"
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-white/50">
                      Triple click to download
                    </div>
                  </div>

                  {/* Overflow Indicators */}
                  {(textOverflow.right || textOverflow.bottom) && (
                    <div className="mt-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-yellow-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-yellow-500">
                          Text overflow detected:
                        </span>
                      </div>
                      <ul className="mt-1 list-inside list-disc text-yellow-500/80">
                        {textOverflow.right && (
                          <li>Text extends beyond right margin</li>
                        )}
                        {textOverflow.bottom && (
                          <li>Text extends beyond bottom margin</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.uri}
                      onClick={() => setSelectedTemplate(template.uri)}
                      className={`relative aspect-square rounded-lg border p-1 transition-all hover:opacity-90 ${
                        selectedTemplate === template.uri
                          ? "border-[#ff4d94] shadow-md shadow-[#ff4d94]/20"
                          : "border-[#ff4d94]/30"
                      }`}
                    >
                      <Image
                        src={template.uri}
                        alt={template.name}
                        layout="fill"
                        objectFit="contain"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuration Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuration</h3>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={config.text}
                    onChange={(e) =>
                      setConfig({ ...config, text: e.target.value })
                    }
                    className="border-[#ff4d94]/30 bg-[#8b283c]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>X Position: {config.x}</Label>
                    <Slider
                      value={[config.x]}
                      min={0}
                      max={1280}
                      step={1}
                      onValueChange={([x]) => setConfig({ ...config, x })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Y Position: {config.y}</Label>
                    <Slider
                      value={[config.y]}
                      min={0}
                      max={1280}
                      step={1}
                      onValueChange={([y]) => setConfig({ ...config, y })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size: {config.fontSize}px</Label>
                    <Slider
                      value={[config.fontSize]}
                      min={10}
                      max={200}
                      step={1}
                      onValueChange={([fontSize]) =>
                        setConfig({ ...config, fontSize })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Shadow Blur: {config.shadowBlur}</Label>
                    <Slider
                      value={[config.shadowBlur]}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={([shadowBlur]) =>
                        setConfig({ ...config, shadowBlur })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Shadow X Offset: {config.shadowOffsetX}</Label>
                    <Slider
                      value={[config.shadowOffsetX]}
                      min={-20}
                      max={20}
                      step={1}
                      onValueChange={([shadowOffsetX]) =>
                        setConfig({ ...config, shadowOffsetX })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Shadow Y Offset: {config.shadowOffsetY}</Label>
                    <Slider
                      value={[config.shadowOffsetY]}
                      min={-20}
                      max={20}
                      step={1}
                      onValueChange={([shadowOffsetY]) =>
                        setConfig({ ...config, shadowOffsetY })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker
                    label="Text Color"
                    value={config.fillStyle}
                    onChange={(color: any) =>
                      setConfig({ ...config, fillStyle: color })
                    }
                  />
                  <ColorPicker
                    label="Shadow Color"
                    value={config.shadowColor}
                    onChange={(color: any) =>
                      setConfig({ ...config, shadowColor: color })
                    }
                  />
                </div>

                <ConfigExport config={config} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
