import { z } from "zod";

/**
 * Identity & Principal Models (Google Paper / Agent Identity)
 */
export type PrincipalType = "user" | "agent" | "system";

export const PrincipalSchema = z.object({
  id: z.string().describe("Unique identifier for the principal"),
  type: z.enum(["user", "agent", "system"]),
  name: z.string().describe("Display name of the identity"),
  delegatedBy: z.string().optional().describe("ID of the user who delegated authority to this agent")
});

export type Principal = z.infer<typeof PrincipalSchema>;

/**
 * Passport: The internal token that flows through the system.
 * This can eventually be a signed JWT or a SPIFFE ID.
 */
export interface Passport {
  principal: Principal;
  scopes: string[];
  expiresAt?: Date;
}

/**
 * Unified Task Model
 */
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
  // Metadata for Identity Attribution
  metadata: z.object({
    createdBy: PrincipalSchema.optional(),
    updatedBy: PrincipalSchema.optional(),
    auditLog: z.array(z.string()).optional()
  }).optional(),
  raw: z.any().optional().describe("Raw provider-specific response for debugging")
});

export type UnifiedTask = z.infer<typeof UnifiedTaskSchema>;

/**
 * Connector Interface
 */
export interface Connector {
  getName(): string;
  getCreateTaskSchema(): z.ZodObject<any>;
  getUpdateTaskSchema(): z.ZodObject<any>;
  listTasks(passport: Passport): Promise<UnifiedTask[]>;
  getTask(id: string, passport: Passport): Promise<UnifiedTask | null>;
  createTask(task: any, passport: Passport): Promise<UnifiedTask>;
  updateTask(id: string, updates: any, passport: Passport): Promise<UnifiedTask>;
}
