import { type WorkflowOutput, type InsertWorkflowOutput } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getOutputs(): Promise<WorkflowOutput[]>;
  addOutput(output: InsertWorkflowOutput): Promise<WorkflowOutput>;
}

export class MemStorage implements IStorage {
  private outputs: WorkflowOutput[] = [];

  async getOutputs(): Promise<WorkflowOutput[]> {
    return [...this.outputs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async addOutput(insertOutput: InsertWorkflowOutput): Promise<WorkflowOutput> {
    const id = randomUUID();
    const output: WorkflowOutput = {
      ...insertOutput,
      id,
      timestamp: insertOutput.timestamp || new Date(),
    };
    
    this.outputs.unshift(output);
    
    if (this.outputs.length > 20) {
      this.outputs = this.outputs.slice(0, 20);
    }
    
    return output;
  }
}

export const storage = new MemStorage();
