import { ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

export interface Attribute {
    trait_type: string;
    value: string | number;
}

export interface NFTData {
    address: string;
    metadata?: {
        name: string;
        image: string;
        attributes?: Attribute[];
    };
}

export function AttributesList({ attributes }: { attributes: Attribute[] }) {
    return (
        <div className="grid grid-cols-2 gap-2 mt-2">
            {attributes.map((attr, index) => (
                <div key={index} className="bg-muted rounded p-1 text-xs">
                    <div className="font-semibold mb-1">{attr.trait_type}</div>
                    <div className="bg-card p-1 rounded">{attr.value}</div>
                </div>
            ))}
        </div>
    );
}

export function NFTCard({ nft, index, loading }: { nft: NFTData; index: number; loading: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    const getExplorerUrl = (address: string) => {
        return `${process.env.NEXT_PUBLIC_EXPLORER ?? 'https://explorer.dev.eclipsenetwork.xyz'}/address/${address}`;
    };

    if (loading) {
        return (
            <Card className="bg-card overflow-hidden">
                <CardContent className="p-0">
                    <Skeleton className="w-full aspect-square" />
                    <div className="p-2">
                        <Skeleton className="w-full h-4 mb-2" />
                        <Skeleton className="w-2/3 h-3" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card overflow-hidden">
            <CardContent className="p-0">
                {nft.metadata ? (
                    <div className="relative pb-[100%]">
                        <img
                            src={nft.metadata.image}
                            alt={nft.metadata.name}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="aspect-square bg-muted flex items-center justify-center">
                        No image
                    </div>
                )}
                <div className="p-2">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-semibold truncate">
                            {nft.metadata?.name || `NFT #${index + 1}`}
                        </h3>
                        <a
                            href={getExplorerUrl(nft.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{nft.address.slice(0, 6)}...</p>

                    {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
                        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
                            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground">
                                Attributes
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