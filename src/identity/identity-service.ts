import { Passport, Principal } from "../types.js";

/**
 * IdentityService is responsible for providing the current "Principal"
 * for tool execution.
 */
export class IdentityService {
  private principal: Principal;

  constructor(principal: Principal) {
    this.principal = principal;
  }

  /**
   * Generates a "Passport" for the current execution context.
   */
  async getEffectivePassport(): Promise<Passport> {
    return {
      principal: this.principal,
      scopes: ["read", "write"],
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    };
  }
}
