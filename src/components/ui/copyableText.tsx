import React, { useState } from "react";
import { Check, ClipboardCopyIcon, Copy } from "lucide-react";

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

export const CopyableText: React.FC<CopyableTextProps> = ({
  text,
  maxLength,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayText =
    maxLength && text.length > maxLength
      ? `${text.slice(0, maxLength)}...`
      : text;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex cursor-pointer items-center space-x-2"
            onClick={copyToClipboard}
          >
            <span className="truncate text-sm">{displayText}</span>
            {copied ? (
              <Check size={16} className="text-green-500" />
            ) : (
              <ClipboardCopyIcon size={16} />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Click to copy"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
