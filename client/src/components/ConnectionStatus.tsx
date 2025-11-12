import { Signal } from "lucide-react";
import { ConnectionStatus as Status } from "@/hooks/use-websocket";

interface ConnectionStatusProps {
  status: Status;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'bg-green-500',
          text: 'Connected',
          textColor: 'text-green-700 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          pulse: false
        };
      case 'connecting':
        return {
          color: 'bg-amber-500',
          text: 'Connecting',
          textColor: 'text-amber-700 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-950/30',
          borderColor: 'border-amber-200 dark:border-amber-800',
          pulse: true
        };
      case 'disconnected':
        return {
          color: 'bg-red-500',
          text: 'Disconnected',
          textColor: 'text-red-700 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          borderColor: 'border-red-200 dark:border-red-800',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor}`}
      data-testid="connection-status"
    >
      <Signal className="h-3.5 w-3.5" />
      <div className="relative flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} data-testid="indicator-connection-dot" />
        <span className={`text-xs font-medium uppercase tracking-wide ${config.textColor}`} data-testid="text-connection-status">
          {config.text}
        </span>
      </div>
    </div>
  );
}
