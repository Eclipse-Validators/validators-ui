import React, { useState } from "react";
import { Check, ClipboardCopyIcon, LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Button } from "./button";

interface CopyButtonProps {
  textToCopy: string;
  buttonText: string;
  style?: {
    variant?:
      | "outline"
      | "ghost"
      | "default"
      | "destructive"
      | "secondary"
      | "link";
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
    className?: string;
  };
  copyIcon?: React.ReactNode;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  buttonText,
  style = { variant: "outline", size: "sm", className: "" },
  copyIcon = <ClipboardCopyIcon className="h-4 w-4" />,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopied(true);
        toast.success("Copied to clipboard!", {
          duration: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        toast.error("Failed to copy", {
          duration: 2000,
        });
      }
    );
  };

  return (
    <Button
      variant={style.variant}
      size={style.size}
      className={cn(
        style.className,
        `flex items-center ${buttonText ? "space-x-2" : ""}`
      )}
      onClick={handleCopy}
    >
      <span>{buttonText}</span>
      {copied ? <Check className="h-4 w-4 text-green-500" /> : copyIcon}
    </Button>
  );
};
