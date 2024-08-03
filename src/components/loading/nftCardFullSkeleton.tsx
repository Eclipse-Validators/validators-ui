import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface NFTCardSkeletonProps {
  error?: string;
}

const NFTCardSkeleton: React.FC<NFTCardSkeletonProps> = ({ error }) => {
  return (
    <div className="container mx-auto p-4">
      <Card className="mx-auto w-full max-w-4xl">
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
              {!error && <Skeleton className="h-64 w-full rounded-lg" />}
            </div>
            <div className="mt-4 w-full md:mt-0 md:w-1/2 md:pl-4">
              {!error && (
                <>
                  <Skeleton className="mb-2 h-6 w-3/4" />
                  <Skeleton className="mb-4 h-6 w-full" />
                  <Skeleton className="mb-2 h-4 w-1/2" />
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
