import { CloudUpload } from "lucide-react";

export function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4"
      data-testid="empty-state"
    >
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="rounded-full bg-muted/50 p-6">
          <CloudUpload className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">
            No Workflow Outputs Yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure your n8n workflow to send data to this dashboard. New outputs will appear here in real-time as they're received.
          </p>
        </div>
        <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs font-mono text-muted-foreground">
            Webhook URL: <span className="text-foreground font-semibold" data-testid="text-webhook-url">{window.location.origin}/api/webhook</span>
          </p>
        </div>
      </div>
    </div>
  );
}
