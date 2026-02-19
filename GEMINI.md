# Agile MCP Server - Project Mandates

This document defines the specific engineering standards and architectural constraints for the Agile MCP Server.

## 🎯 Project Core Goal
To build a safe, tool-agnostic bridge between AI agents and agile project management tools using the Model Context Protocol (MCP).

## 🛠 Tech Stack & Conventions
- **Language**: TypeScript (Strict mode)
- **Runtime**: Node.js
- **Package Manager**: npm
- **Validation**: Zod (Required for all MCP tool schemas and provider responses)
- **MCP SDK**: `@modelcontextprotocol/sdk`

## 🏗 Architectural Rules
1. **Unified Schema First**: All data flowing to the agent MUST be mapped to the `UnifiedTask` or relevant unified models. No provider-specific raw JSON should reach the client.
2. **Connector Pattern**: Each agile tool (GitHub, Jira, etc.) must be implemented as a discrete class implementing a standard `Connector` interface.
3. **Stateless Core**: The core server must remain stateless. Provider authentication should be handled via environment variables or per-request configuration.
4. **Error Normalization**: Connectors must catch provider-specific errors (e.g., GitHub 404) and rethrow them as standardized MCP error types.

## 🔐 Safety & Integrity
- **Validation Mandate**: Never trust provider data or agent input. Use Zod to parse and validate every boundary.
- **Read-Only Default**: Ensure 'Query' tools are clearly separated from 'Mutation' tools.
- **Explicit Descriptions**: Every MCP tool must have a high-quality `description` field to help agents understand when and how to use it safely.

## 🧪 Development Workflow
- **Mocking**: A `MockConnector` must be maintained to allow testing the MCP lifecycle without external API calls.
- **Verification**: New features must be verified via the `mcp-inspector` or a local MCP client before being considered complete.
