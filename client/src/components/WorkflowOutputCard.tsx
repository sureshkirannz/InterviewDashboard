import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { WorkflowOutput } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";

interface WorkflowOutputCardProps {
  output: WorkflowOutput;
}

export function WorkflowOutputCard({ output }: WorkflowOutputCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusConfig = () => {
    switch (output.status.toLowerCase()) {
      case 'success':
        return {
          icon: CheckCircle,
          variant: 'default' as const,
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-950/30',
          border: 'border-green-200 dark:border-green-800',
          label: 'Success'
        };
      case 'error':
      case 'failed':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-50 dark:bg-red-950/30',
          border: 'border-red-200 dark:border-red-800',
          label: 'Error'
        };
      case 'running':
        return {
          icon: Loader2,
          variant: 'secondary' as const,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-800',
          label: 'Running'
        };
      case 'pending':
        return {
          icon: Clock,
          variant: 'secondary' as const,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          border: 'border-amber-200 dark:border-amber-800',
          label: 'Pending'
        };
      default:
        return {
          icon: Clock,
          variant: 'secondary' as const,
          color: 'text-muted-foreground',
          bg: 'bg-muted',
          border: 'border-muted',
          label: output.status
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const relativeTime = formatDistanceToNow(new Date(output.timestamp), { addSuffix: true });
  const absoluteTime = format(new Date(output.timestamp), "MMM dd, yyyy HH:mm:ss");

  const renderDataValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const dataEntries = Object.entries(output.data as Record<string, any>);
  const displayEntries = dataEntries.slice(0, 3);
  const hasMoreEntries = dataEntries.length > 3;

  return (
    <Card
      className="p-4 md:p-6 hover-elevate transition-all duration-300 animate-in fade-in slide-in-from-top-4 zoom-in-95"
      data-testid={`card-workflow-${output.id}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.bg} border ${statusConfig.border}`}
              data-testid={`badge-status-${output.id}`}
            >
              <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.color} ${output.status.toLowerCase() === 'running' ? 'animate-spin' : ''}`} />
              <span className={`text-xs font-medium uppercase tracking-wide ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <span 
              className="text-sm font-mono text-muted-foreground truncate" 
              title={output.executionId}
              data-testid={`text-execution-id-${output.id}`}
            >
              #{output.executionId}
            </span>
          </div>
          <div className="text-right">
            <div 
              className="text-xs font-mono text-foreground" 
              title={absoluteTime}
              data-testid={`text-timestamp-${output.id}`}
            >
              {relativeTime}
            </div>
          </div>
        </div>

        {displayEntries.length > 0 && (
          <dl className="space-y-2">
            {displayEntries.map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1" data-testid={`field-${output.id}-${key}`}>
                <dt className="text-sm font-medium text-foreground" data-testid={`label-${output.id}-${key}`}>{key}</dt>
                <dd className="text-base text-foreground break-words font-mono text-sm bg-muted/50 px-3 py-2 rounded-md whitespace-pre-wrap" data-testid={`value-${output.id}-${key}`}>
                  {renderDataValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {(hasMoreEntries || isExpanded) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-center gap-2"
            data-testid={`button-expand-${output.id}`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show {dataEntries.length - 3} More Field{dataEntries.length - 3 !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}

        {isExpanded && (
          <div className="mt-2">
            <div className="text-sm font-medium mb-2 text-foreground">Full Data</div>
            <pre className="bg-muted/50 p-4 rounded-md overflow-x-auto max-h-96 overflow-y-auto text-sm font-mono text-foreground">
              {JSON.stringify(output.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
}
