"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Twitter } from "lucide-react";

import { cn } from "@/lib/utils";

interface FooterProps {
  variant?: "default" | "valentine";
}

export function Footer({ variant }: FooterProps) {
  const pathname = usePathname();
  const isValentine = variant === "valentine" || pathname === "/blip";

  return (
    <footer
      className={cn(
        "relative overflow-hidden",
        isValentine
          ? "border-t border-pink-300/20 bg-[#8b283c] shadow-[0_-4px_20px_-4px_rgba(236,72,153,0.1)] backdrop-blur-sm"
          : "mt-8 border-t bg-background"
      )}
    >
      <div className="container relative z-10 flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Image
            src="/logo/validatorswordmark.png"
            alt="Validators"
            width={100}
            height={100}
            className={cn(
              isValentine
                ? "opacity-90 brightness-0 invert transition-opacity hover:opacity-100"
                : ""
            )}
          />
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="https://twitter.com/@Validators_"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              isValentine
                ? "animate-heartbeat bg-pink-50/10 hover:bg-pink-50/20"
                : "hover:bg-muted"
            )}
          >
            <Twitter
              className={cn(
                "h-4 w-4",
                isValentine ? "text-pink-50" : "text-foreground"
              )}
            />
          </Link>
          <Link
            href="https://discord.gg/8cjJ55hKUz"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              isValentine
                ? "animate-heartbeat bg-pink-50/10 hover:bg-pink-50/20"
                : "hover:bg-muted"
            )}
          >
            <Image
              src="/icons/discord.svg"
              alt="Discord"
              width={16}
              height={16}
              className={cn(
                "transition-opacity",
                isValentine
                  ? "opacity-90 brightness-0 invert hover:opacity-100"
                  : ""
              )}
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
