import { describe, it, expect } from "vitest";
import { MockConnector } from "./connectors/mock.js";

describe("MockConnector", () => {
  const connector = new MockConnector();

  it("lists tasks", async () => {
    const tasks = await connector.listTasks();
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0]).toHaveProperty("id");
    expect(tasks[0]).toHaveProperty("title");
  });

  it("gets a specific task", async () => {
    const task = await connector.getTask("MOCK-1");
    expect(task).not.toBeNull();
    expect(task?.id).toBe("MOCK-1");
  });

  it("creates a new task", async () => {
    const newTask = await connector.createTask({
      title: "New Test Task",
      description: "A description"
    });
    expect(newTask.id).toContain("MOCK-");
    expect(newTask.title).toBe("New Test Task");
  });

  it("updates an existing task", async () => {
    const updated = await connector.updateTask("MOCK-1", { status: "DONE" });
    expect(updated.status).toBe("DONE");
  });
});
