import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWorkflowOutputSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/outputs", async (_req, res) => {
    try {
      const outputs = await storage.getOutputs();
      res.json(outputs);
    } catch (error) {
      console.error("Error fetching outputs:", error);
      res.status(500).json({ error: "Failed to fetch outputs" });
    }
  });

  app.post("/api/webhook", async (req, res) => {
    try {
      const payload = {
        executionId: req.body.executionId || req.body.execution_id,
        status: req.body.status,
        data: req.body.data,
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : undefined,
      };

      const validatedData = insertWorkflowOutputSchema.parse(payload);

      const dataToStore = {
        ...validatedData,
        executionId: validatedData.executionId || `exec-${Date.now()}`,
        timestamp: validatedData.timestamp || new Date(),
      };

      const output = await storage.addOutput(dataToStore);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_output',
            output,
          }));
        }
      });

      res.status(201).json(output);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        console.error("Error processing webhook:", error);
        res.status(500).json({ error: "Failed to process webhook" });
      }
    }
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on('pong', () => {
      // Client responded to ping, connection is alive
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clearInterval(pingInterval);
    });
  });

  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  return httpServer;
}
