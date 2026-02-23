import { describe, it, expect } from "vitest";
import { MockConnector } from "./connectors/mock.js";
import { Passport } from "./types.js";

describe("MockConnector", () => {
  const connector = new MockConnector();
  const mockPassport: Passport = {
    principal: { id: "test-user", type: "user", name: "Test User" },
    scopes: ["read", "write"]
  };

  it("lists tasks", async () => {
    const tasks = await connector.listTasks(mockPassport);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0]).toHaveProperty("id");
  });

  it("gets a specific task", async () => {
    const task = await connector.getTask("MOCK-1", mockPassport);
    expect(task).not.toBeNull();
    expect(task?.id).toBe("MOCK-1");
  });

  it("creates a new task with identity", async () => {
    const newTask = await connector.createTask({
      title: "New Test Task"
    }, mockPassport);
    expect(newTask.metadata?.createdBy?.name).toBe("Test User");
  });

  it("updates an existing task with audit trail", async () => {
    const updated = await connector.updateTask("MOCK-1", { status: "DONE" }, mockPassport);
    expect(updated.status).toBe("DONE");
    expect(updated.metadata?.auditLog?.some(log => log.includes("Test User"))).toBe(true);
  });
});
