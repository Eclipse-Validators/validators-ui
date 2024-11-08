import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface CopyableTextProps {
  text: string;
  maxLength?: number;
}

const truncateAddress = (address: string, length: number) => {
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export function CopyableText({ text, maxLength = 0 }: CopyableTextProps) {
  const [copied, setCopied] = useState(false);
  const displayText = maxLength > 0 ? truncateAddress(text, maxLength) : text;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <span className="inline-flex items-center space-x-1">
      <span className="truncate">{displayText}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={copyToClipboard}
              className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? 'Copied!' : 'Click to copy'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}
