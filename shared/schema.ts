import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workflowOutputs = pgTable("workflow_outputs", {
  id: varchar("id").primaryKey(),
  executionId: text("execution_id").notNull(),
  status: text("status").notNull(),
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const insertWorkflowOutputSchema = createInsertSchema(workflowOutputs).omit({
  id: true,
});

export type InsertWorkflowOutput = z.infer<typeof insertWorkflowOutputSchema>;
export type WorkflowOutput = typeof workflowOutputs.$inferSelect;
