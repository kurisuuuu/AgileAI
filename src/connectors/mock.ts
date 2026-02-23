import { z } from "zod";
import { Connector, UnifiedTask, Passport } from "../types.js";

export class MockConnector implements Connector {
  private tasks: UnifiedTask[] = [
    {
      id: "MOCK-1",
      title: "Integrate GitHub MCP Server",
      description: "Connect the project with the GitHub API.",
      status: "TODO",
      priority: "high",
      provider: "mock",
      labels: ["feature", "api"]
    }
  ];

  getName(): string {
    return "Mock";
  }

  getCreateTaskSchema() {
    return z.object({
      title: z.string().describe("The title of the task."),
      description: z.string().optional().describe("The contents of the task."),
      status: z.enum(["todo", "in_progress", "done"]).optional().describe("Workflow status."),
      labels: z.array(z.string()).optional().describe("Tags to associate with the task.")
    });
  }

  getUpdateTaskSchema() {
    return z.object({
      id: z.string().describe("The ID that identifies the task."),
      title: z.string().optional().describe("The title of the task."),
      description: z.string().optional().describe("The contents of the task."),
      status: z.enum(["todo", "in_progress", "done"]).optional().describe("Workflow status."),
      labels: z.array(z.string()).optional().describe("Tags to associate with the task.")
    });
  }

  async listTasks(passport: Passport): Promise<UnifiedTask[]> {
    return this.tasks;
  }

  async getTask(id: string, passport: Passport): Promise<UnifiedTask | null> {
    return this.tasks.find(t => t.id === id) || null;
  }

  async createTask(task: any, passport: Passport): Promise<UnifiedTask> {
    const newTask: UnifiedTask = {
      id: `MOCK-${this.tasks.length + 1}`,
      title: task.title || "Untitled",
      description: task.description || "",
      status: task.status || "TODO",
      priority: "medium",
      provider: "mock",
      labels: task.labels || [],
      metadata: {
        createdBy: passport.principal,
        auditLog: [`Created by ${passport.principal.type}:${passport.principal.name}`]
      }
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(id: string, updates: any, passport: Passport): Promise<UnifiedTask> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Task ${id} not found`);
    
    this.tasks[index] = { 
      ...this.tasks[index], 
      ...updates,
      metadata: {
        ...this.tasks[index].metadata,
        updatedBy: passport.principal,
        auditLog: [...(this.tasks[index].metadata?.auditLog || []), `Updated by ${passport.principal.name}`]
      }
    };
    return this.tasks[index];
  }
}
