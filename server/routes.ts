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
      const data = insertWorkflowOutputSchema.parse({
        executionId: req.body.executionId || req.body.execution_id || `exec-${Date.now()}`,
        status: req.body.status || 'success',
        data: req.body.data || req.body,
        timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
      });

      const output = await storage.addOutput(data);

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

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  return httpServer;
}
