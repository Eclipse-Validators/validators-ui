import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, EyeIcon } from "lucide-react";

import { Card, CardContent } from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { CopyableText } from "../ui/copyableText";
import { Skeleton } from "../ui/skeleton";

export interface Attribute {
  trait_type: string;
  value: string | number;
}

export interface BlipNftData {
  address: string;
  metadata?: {
    image: string;
    attributes?: Attribute[];
  };
}

export function AttributesList({ attributes }: { attributes: Attribute[] }) {
  return (
    <div className="mt-2 grid grid-cols-1 gap-2">
      {attributes.map((attr, index) => (
        <div key={index} className="rounded bg-muted p-1 text-xs">
          <div className="mb-1 font-semibold">{attr.trait_type}</div>
          <div className="rounded bg-card p-1">{attr.value}</div>
        </div>
      ))}
    </div>
  );
}

export function BlipNftCard({
  nft,
  loading,
}: {
  nft: BlipNftData;
  loading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getExplorerUrl = (address: string) => {
    return `${process.env.NEXT_PUBLIC_EXPLORER ?? "https://explorer.dev.eclipsenetwork.xyz"}/address/${address}`;
  };

  if (loading) {
    return (
      <Card className="overflow-hidden bg-card">
        <CardContent className="p-0">
          <Skeleton className="aspect-square w-full" />
          <div className="p-2">
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-card">
      <CardContent className="p-0">
        {nft.metadata ? (
          <div className="relative pb-[100%]">
            <img
              src={nft.metadata.image}
              alt="Blip"
              className="absolute left-0 top-0 h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-square items-center justify-center bg-muted">
            No image
          </div>
        )}
        <div className="p-2">
          <div className="flex items-center justify-between">
            <h3 className="flex-grow truncate text-sm font-semibold">Blip</h3>
            <div className="flex items-center space-x-2">
              <a
                href={getExplorerUrl(nft.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            <CopyableText text={nft.address} maxLength={6} />
          </p>

          {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="mt-2"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground">
                Details
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <AttributesList attributes={nft.metadata.attributes} />
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
