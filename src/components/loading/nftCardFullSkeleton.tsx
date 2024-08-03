import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface NFTCardSkeletonProps {
    error?: string;
}

const NFTCardSkeleton: React.FC<NFTCardSkeletonProps> = ({ error }) => {
    return (
        <div className="container mx-auto p-4">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>
                        {error ? (
                            <span className="text-red-500">{error}</span>
                        ) : (
                            <Skeleton className="h-8 w-3/4" />
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2">
                            {!error && <Skeleton className="w-full h-64 rounded-lg" />}
                        </div>
                        <div className="w-full md:w-1/2 md:pl-4 mt-4 md:mt-0">
                            {!error && (
                                <>
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-6 w-full mb-4" />
                                    <Skeleton className="h-4 w-1/2 mb-2" />
                                    <div className="grid grid-cols-2 gap-2">
                                        {[...Array(6)].map((_, index) => (
                                            <Skeleton key={index} className="h-12 w-full" />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NFTCardSkeleton;