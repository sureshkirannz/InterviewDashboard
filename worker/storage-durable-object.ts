import { DurableObject } from "cloudflare:workers";
import { z } from "zod";

export interface Env {
  WORKFLOW_STORAGE: DurableObjectNamespace;
}

const insertWorkflowOutputSchema = z.object({
  executionId: z.string().optional(),
  status: z.string(),
  data: z.record(z.any()),
  timestamp: z.date().optional(),
});

interface WorkflowOutput {
  id: string;
  executionId: string;
  status: string;
  data: any;
  timestamp: Date;
}

export class WorkflowStorage extends DurableObject {
  private sessions: Set<WebSocket>;
  private outputs: WorkflowOutput[];

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.sessions = new Set();
    this.outputs = [];
    
    this.ctx.blockConcurrencyWhile(async () => {
      const stored = await this.ctx.storage.get<WorkflowOutput[]>("outputs");
      this.outputs = stored || [];
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      return this.handleWebSocket(request);
    }

    if (url.pathname === "/outputs" && request.method === "GET") {
      return new Response(JSON.stringify(this.outputs), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/webhook" && request.method === "POST") {
      return await this.handleWebhook(request);
    }

    return new Response("Not found", { status: 404 });
  }

  private handleWebSocket(request: Request): Response {
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);
    this.sessions.add(server);

    server.addEventListener("close", () => {
      this.sessions.delete(server);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private async handleWebhook(request: Request): Promise<Response> {
    try {
      const body = await request.json() as any;

      const payload = {
        executionId: body.executionId || body.execution_id,
        status: body.status,
        data: body.data,
        timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
      };

      const validatedData = insertWorkflowOutputSchema.parse(payload);

      const output: WorkflowOutput = {
        id: crypto.randomUUID(),
        executionId: validatedData.executionId || `exec-${Date.now()}`,
        status: validatedData.status,
        data: validatedData.data,
        timestamp: validatedData.timestamp || new Date(),
      };

      this.outputs.unshift(output);
      
      if (this.outputs.length > 20) {
        this.outputs = this.outputs.slice(0, 20);
      }

      await this.ctx.storage.put("outputs", this.outputs);

      this.broadcast({
        type: "new_output",
        output,
      });

      return new Response(JSON.stringify(output), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({ error: "Invalid request data", details: error.errors }), 
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to process webhook" }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  private broadcast(message: any): void {
    const messageStr = JSON.stringify(message);
    this.sessions.forEach((session) => {
      try {
        session.send(messageStr);
      } catch (err) {
        this.sessions.delete(session);
      }
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    // Handle incoming WebSocket messages if needed
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): Promise<void> {
    this.sessions.delete(ws);
  }
}
