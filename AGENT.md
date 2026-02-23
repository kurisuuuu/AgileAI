# Agent Interaction Model

This document describes how AI agents interact with external agile/project management tools through the Agile MCP Server.

The focus of this project is **not agent autonomy**, but **safe and structured agent-tool interaction**.

---

## 🧠 Design Philosophy

AI agents should not directly call third-party APIs.

They should operate through a controlled execution layer that provides:

- Explicit capabilities
- Validation rules
- Permission boundaries
- Auditable actions

The MCP Server acts as that layer.

---

## 🏗 System Role of the MCP Server

Within the ecosystem:

- Agents = MCP Clients
- Agile MCP Server = MCP Server
- Agile Tools = External Providers

Agents never interact with Jira, GitHub, Trello, etc. directly.

All actions flow through MCP tools.

---

## 🔁 Agent Interaction Lifecycle

1. **Discovery**
   - Agent inspects available MCP tools
   - Learns supported operations

2. **Context Acquisition**
   - Agent queries tasks / backlog / metadata
   - Retrieves structured information

3. **Decision / Planning**
   - Agent determines desired actions
   - No assumptions about autonomy model

4. **Tool Invocation**
   - Agent calls MCP tools
   - Example: `create_task`, `update_status`

5. **Validation & Execution**
   - Server validates request
   - Connector translates into provider API call

6. **Result Handling**
   - Structured response returned to agent
   - Errors normalized

---

## 🛠 MCP Tool Model

All agent actions are represented as deterministic tools.

Examples:

- list_tasks()
- create_task()
- update_task()
- transition_status()
- add_comment()
- assign_task()

Tools must be:

- Explicit
- Predictable
- Validatable
- Provider-independent

---

## 🧱 Unified Data Abstraction

External tools differ significantly. The server defines strict internal schemas using **Zod** and **TypeScript interfaces**.

### UnifiedTask Schema
```typescript
interface UnifiedTask {
  id: string;          // Global unique identifier
  providerId: string;  // Original ID from GitHub/Jira
  title: string;
  description: string | null;
  status: string;
  priority?: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  labels: string[];
  url: string;         // Link to original tool
  metadata: Record<string, any>;
}
```

Connectors are responsible for the mapping:
**Unified Schema ↔ Provider Schema (GitHub GraphQL/Jira REST)**

---

## 🔌 Connector Responsibilities

Each connector must:

- Handle provider authentication
- Translate schemas
- Normalize errors
- Enforce provider constraints
- Expose capability metadata

Example connectors:

- Jira Connector
- Trello Connector
- GitHub Connector
- Linear Connector

---

## ⚠️ Validation & Safety Layer

The server is responsible for preventing unsafe actions.

Validation examples:

- Invalid state transitions
- Missing required fields
- Permission violations
- Provider rule conflicts
- Rate limiting / throttling

Agents are never trusted to enforce rules.

---

## 🔐 Permission & Control Concepts

Future extensions may include:

- Role-based permissions
- Human approval gates
- Action policies
- Tool capability restrictions

This ensures compatibility with human-managed workflows.

---

## 🧠 Agent Expectations

Agents interacting with this server should behave as disciplined tool users:

- Query before acting
- Respect tool contracts
- Handle structured errors
- Avoid assumptions about provider behavior

---

## 🔮 Future Evolution

Possible expansions:

- **OAuth2 Authentication:** Implement local CLI-based auth and browser-based OAuth flows to separate user and agent identities.
- Multi-provider routing
- Cross-tool synchronization
- Event / webhook integration
- Agent memory layers
- Policy engines

---

## 🎯 Primary Objective

Provide a reliable, safe, and standardized interface that allows AI agents to participate in agile/project-management workflows without tight coupling to any specific tool.

---
