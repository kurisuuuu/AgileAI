import { Octokit } from "octokit";
import { z } from "zod";
import { Connector, UnifiedTask, Passport } from "../types.js";

export class GitHubConnector implements Connector {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(token: string, owner: string, repo: string) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
  }

  getName(): string {
    return "GitHub";
  }

  getCreateTaskSchema() {
    return z.object({
      title: z.string().describe("The title of the issue."),
      description: z.string().optional().describe("The contents of the issue (body)."),
      assignees: z.array(z.string()).optional().describe("Logins for Users to whom to assign this issue."),
      labels: z.array(z.string()).optional().describe("Labels to associate with this issue.")
    });
  }

  getUpdateTaskSchema() {
    return z.object({
      id: z.string().describe("The number that identifies the issue."),
      title: z.string().optional().describe("The title of the issue."),
      description: z.string().optional().describe("The contents of the issue (body)."),
      status: z.enum(["open", "closed"]).optional().describe("State of the issue."),
      state_reason: z.enum(["completed", "not_planned", "reopened"]).optional().describe("The reason for the state change."),
      labels: z.array(z.string()).optional().describe("Labels to associate with this issue."),
      assignees: z.array(z.string()).optional().describe("Logins for Users to whom to assign this issue.")
    });
  }

  private mapIssueToTask(issue: any): UnifiedTask {
    return {
      id: issue.number.toString(),
      title: issue.title,
      description: issue.body || "",
      status: issue.state.toUpperCase(),
      priority: this.extractPriority(issue.labels),
      assignee: issue.assignee?.login,
      labels: issue.labels.map((l: any) => typeof l === "string" ? l : l.name),
      url: issue.html_url,
      provider: "github",
      raw: issue
    };
  }

  private extractPriority(labels: any[]): "low" | "medium" | "high" | "critical" | undefined {
    const priorityLabels = labels.map((l: any) => (typeof l === "string" ? l : l.name).toLowerCase());
    if (priorityLabels.includes("priority:critical")) return "critical";
    if (priorityLabels.includes("priority:high")) return "high";
    if (priorityLabels.includes("priority:medium")) return "medium";
    if (priorityLabels.includes("priority:low")) return "low";
    return undefined;
  }

  async listTasks(passport: Passport): Promise<UnifiedTask[]> {
    const { data: issues } = await this.octokit.rest.issues.listForRepo({
      owner: this.owner,
      repo: this.repo,
      state: "all",
      per_page: 100
    });

    return issues
      .filter(issue => !issue.pull_request)
      .map(issue => this.mapIssueToTask(issue));
  }

  async getTask(id: string, passport: Passport): Promise<UnifiedTask | null> {
    try {
      const { data: issue } = await this.octokit.rest.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: parseInt(id)
      });
      return this.mapIssueToTask(issue);
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async createTask(task: any, passport: Passport): Promise<UnifiedTask> {
    const { data: issue } = await this.octokit.rest.issues.create({
      owner: this.owner,
      repo: this.repo,
      title: task.title,
      body: task.description,
      labels: task.labels,
      assignees: task.assignees
    });
    return this.mapIssueToTask(issue);
  }

  async updateTask(id: string, updates: any, passport: Passport): Promise<UnifiedTask> {
    const { data: issue } = await this.octokit.rest.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: parseInt(id),
      title: updates.title,
      body: updates.description,
      state: updates.status,
      state_reason: updates.state_reason,
      labels: updates.labels,
      assignees: updates.assignees
    });
    return this.mapIssueToTask(issue);
  }
}
