import React, { useState } from 'react';
import { Copy, Check, ClipboardCopyIcon } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './tooltip';

interface CopyableTextProps {
    text: string;
    maxLength?: number;
}

export const CopyableText: React.FC<CopyableTextProps> = ({ text, maxLength }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayText = maxLength && text.length > maxLength
        ? `${text.slice(0, maxLength)}...`
        : text;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={copyToClipboard}>
                        <span className="text-sm truncate">{displayText}</span>
                        {copied ? <Check size={16} className="text-green-500" /> : <ClipboardCopyIcon size={16} />}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{copied ? 'Copied!' : 'Click to copy'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};