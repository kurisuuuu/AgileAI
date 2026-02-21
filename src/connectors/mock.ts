import { Connector, UnifiedTask } from "../types.js";

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
    },
    {
      id: "MOCK-2",
      title: "Implement Jira Connector",
      description: "Allow the agent to interact with Jira issues.",
      status: "IN_PROGRESS",
      priority: "medium",
      provider: "mock",
      labels: ["feature"]
    }
  ];

  getName(): string {
    return "Mock";
  }

  async listTasks(): Promise<UnifiedTask[]> {
    return this.tasks;
  }

  async getTask(id: string): Promise<UnifiedTask | null> {
    return this.tasks.find(t => t.id === id) || null;
  }

  async createTask(task: Partial<UnifiedTask>): Promise<UnifiedTask> {
    const newTask: UnifiedTask = {
      id: `MOCK-${this.tasks.length + 1}`,
      title: task.title || "Untitled",
      description: task.description || "",
      status: task.status || "TODO",
      priority: task.priority || "medium",
      provider: "mock",
      labels: task.labels || []
    };
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<UnifiedTask>): Promise<UnifiedTask> {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Task ${id} not found`);
    this.tasks[index] = { ...this.tasks[index], ...updates };
    return this.tasks[index];
  }
}
