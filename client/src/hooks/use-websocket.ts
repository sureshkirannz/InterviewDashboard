import { useEffect, useRef, useState, useCallback } from 'react';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pingIntervalRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;
        
        // Send a heartbeat message every 25 seconds to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        setStatus('disconnected');
        wsRef.current = null;
        
        // Clear ping interval on close
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setStatus('connecting');
          reconnectTimeoutRef.current = setTimeout(connect, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setStatus('disconnected');
    }
  }, [onMessage, reconnectDelay, maxReconnectAttempts]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { status };
}
