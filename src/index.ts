#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MockConnector } from "./connectors/mock.js";
import { Connector } from "./types.js";

// Initialize a connector
const activeConnector: Connector = new MockConnector();

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
    description: "List all tasks from the active agile project provider.",
    inputSchema: {}
  },
  async () => {
    const tasks = await activeConnector.listTasks();
    return {
      content: [
        {
          type: "text",
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
      id: z.string().describe("The ID of the task to retrieve."),
    }
  },
  async ({ id }) => {
    const task = await activeConnector.getTask(id);
    if (!task) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Task with ID ${id} not found.`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(task, null, 2),
        },
      ],
    };
  }
);

// Tool: create_task
server.registerTool(
  "create_task",
  {
    description: "Create a new task in the agile project provider.",
    inputSchema: {
      title: z.string().describe("The title of the task."),
      description: z.string().optional().describe("Detailed description of the task."),
      status: z.string().optional().describe("The workflow status (e.g., TODO, IN_PROGRESS)."),
      priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("The priority of the task."),
      labels: z.array(z.string()).optional().describe("Tags or labels to associate with the task."),
    }
  },
  async (args) => {
    const newTask = await activeConnector.createTask(args);
    return {
      content: [
        {
          type: "text",
          text: `Successfully created task: ${newTask.id}\n${JSON.stringify(newTask, null, 2)}`,
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
    inputSchema: {
      id: z.string().describe("The ID of the task to update."),
      title: z.string().optional().describe("The new title of the task."),
      description: z.string().optional().describe("The new description of the task."),
      status: z.string().optional().describe("The new status of the task."),
      priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("The new priority of the task."),
      labels: z.array(z.string()).optional().describe("The new set of labels for the task."),
    }
  },
  async ({ id, ...updates }) => {
    try {
      const updatedTask = await activeConnector.updateTask(id, updates);
      return {
        content: [
          {
            type: "text",
            text: `Successfully updated task: ${id}\n${JSON.stringify(updatedTask, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: error.message,
          },
        ],
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
