import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkflowOutputSkeleton() {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>

        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </Card>
  );
}
