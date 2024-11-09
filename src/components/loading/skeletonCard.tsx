import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonCard: React.FC = () => (
    <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-4" />
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div>
                    <Skeleton className="mb-2 h-4 w-[100px]" />
                    <Skeleton className="mb-2 h-4 w-[80px]" />
                    <Skeleton className="h-8 w-[120px]" />
                </div>
            </div>
        </CardContent>
    </Card>
);
