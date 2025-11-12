import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkflowOutput } from "@shared/schema";
import { WorkflowOutputCard } from "@/components/WorkflowOutputCard";
import { WorkflowOutputSkeleton } from "@/components/WorkflowOutputSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { LiveBadge } from "@/components/LiveBadge";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const [outputs, setOutputs] = useState<WorkflowOutput[]>([]);

  const { data: initialData, isLoading } = useQuery<WorkflowOutput[]>({
    queryKey: ['/api/outputs'],
  });

  useEffect(() => {
    if (initialData) {
      setOutputs(initialData);
    }
  }, [initialData]);

  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'new_output') {
      setOutputs((prev) => {
        const newOutputs = [data.output, ...prev];
        return newOutputs.slice(0, 20);
      });
      queryClient.invalidateQueries({ queryKey: ['/api/outputs'] });
    }
  }, []);

  const { status } = useWebSocket({
    onMessage: handleWebSocketMessage,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-dashboard-title">
              n8n Workflow Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <LiveBadge />
              <ConnectionStatus status={status} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        {outputs.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground" data-testid="text-last-updated">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        )}

        <div className="space-y-4" role="region" aria-live="polite" aria-label="Workflow outputs">
          {isLoading ? (
            <>
              <WorkflowOutputSkeleton />
              <WorkflowOutputSkeleton />
              <WorkflowOutputSkeleton />
              <WorkflowOutputSkeleton />
            </>
          ) : outputs.length === 0 ? (
            <EmptyState />
          ) : (
            outputs.map((output) => (
              <WorkflowOutputCard key={output.id} output={output} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
