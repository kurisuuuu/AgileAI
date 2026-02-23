#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as dotenv from "dotenv";
import { MockConnector } from "./connectors/mock.js";
import { GitHubConnector } from "./connectors/github.js";
import { Connector, Principal } from "./types.js";
import { IdentityService } from "./identity/identity-service.js";

// Load environment variables
dotenv.config();

/**
 * Centralized Environment & Identity Logic
 */
const githubToken = process.env.GITHUB_TOKEN;
const githubOwner = process.env.GITHUB_OWNER;
const githubRepo = process.env.GITHUB_REPO;

let activeConnector: Connector;
let principal: Principal;

if (githubToken && githubOwner && githubRepo) {
  activeConnector = new GitHubConnector(githubToken, githubOwner, githubRepo);
  principal = {
    id: githubOwner,
    type: "user",
    name: githubOwner
  };
  console.error(`Using GitHub Connector for ${githubOwner}/${githubRepo}`);
} else {
  activeConnector = new MockConnector();
  principal = {
    id: "local-user",
    type: "user",
    name: "Local Developer"
  };
  console.error("Using Mock Connector (Missing GITHUB_TOKEN, OWNER, or REPO)");
}

const identityService = new IdentityService(principal);

// Create the MCP server
const server = new McpServer({
  name: "agile-mcp-server",
  version: "1.0.0",
});

/**
 * Register tools using the high-level McpServer API
 */

// Tool: list_tasks
server.registerTool(
  "list_tasks",
  {
    description: "List all tasks from the active agile project provider."
  },
  async () => {
    const passport = await identityService.getEffectivePassport();
    const tasks = await activeConnector.listTasks(passport);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(tasks, null, 2),
        },
      ],
    };
  }
);

// Tool: get_task
server.registerTool(
  "get_task",
  {
    description: "Retrieve a specific task by its unique ID.",
    inputSchema: {
      id: z.string().describe("The ID of the task to retrieve.")
    }
  },
  async (args) => {
    const { id } = args as { id: string };
    const passport = await identityService.getEffectivePassport();
    const task = await activeConnector.getTask(id, passport);
    if (!task) {
      return {
        isError: true,
        content: [{ type: "text" as const, text: `Task with ID ${id} not found.` }],
      };
    }
    return {
      content: [{ type: "text" as const, text: JSON.stringify(task, null, 2) }],
    };
  }
);

// Tool: create_task
server.registerTool(
  "create_task",
  {
    description: "Create a new task in the agile project provider.",
    inputSchema: activeConnector.getCreateTaskSchema().shape
  },
  async (args: any) => {
    const passport = await identityService.getEffectivePassport();
    const newTask = await activeConnector.createTask(args, passport);
    return {
      content: [
        {
          type: "text" as const,
          text: `Processed create for task ${newTask.id}. Current provider state:\n${JSON.stringify(newTask, null, 2)}`,
        },
      ],
    };
  }
);

// Tool: update_task
server.registerTool(
  "update_task",
  {
    description: "Update an existing task in the agile project provider.",
    inputSchema: activeConnector.getUpdateTaskSchema().shape
  },
  async (args: any) => {
    const { id, ...updates } = args;
    try {
      const passport = await identityService.getEffectivePassport();
      const updatedTask = await activeConnector.updateTask(id, updates, passport);
      return {
        content: [
          {
            type: "text" as const,
            text: `Processed update for task ${id}. Current provider state:\n${JSON.stringify(updatedTask, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [{ type: "text" as const, text: error.message }],
      };
    }
  }
);

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agile MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
