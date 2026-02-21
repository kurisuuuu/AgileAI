import { z } from "zod";

export const UnifiedTaskSchema = z.object({
  id: z.string().describe("Unique identifier for the task"),
  title: z.string().describe("Short title of the task"),
  description: z.string().optional().describe("Detailed description of the task"),
  status: z.string().describe("Current workflow status"),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Task priority level"),
  assignee: z.string().optional().describe("The user currently assigned to the task"),
  labels: z.array(z.string()).optional().describe("Tags or labels associated with the task"),
  url: z.string().optional().describe("Link to the task in the provider's UI"),
  provider: z.string().describe("The name of the agile tool provider (e.g., github, jira)"),
  raw: z.any().optional().describe("Raw provider-specific response for debugging")
});

export type UnifiedTask = z.infer<typeof UnifiedTaskSchema>;

export interface Connector {
  getName(): string;
  listTasks(options?: any): Promise<UnifiedTask[]>;
  getTask(id: string): Promise<UnifiedTask | null>;
  createTask(task: Partial<UnifiedTask>): Promise<UnifiedTask>;
  updateTask(id: string, updates: Partial<UnifiedTask>): Promise<UnifiedTask>;
}
