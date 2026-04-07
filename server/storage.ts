// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import bcrypt from 'bcrypt';
import type { User } from '../shared/types.js';

// Storage interface for FluxWork
export interface IStorage {
  // User operations
  getUser(id: number): Promise<(User & { passwordHash: string }) | null>;
  getUserByUsername(username: string): Promise<(User & { passwordHash: string }) | null>;
  getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  createUser(data: { username: string; email: string; password: string; displayName?: string }): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;

  // Generic entity CRUD
  getEntity(table: string, id: number): Promise<Record<string, unknown> | null>;
  listEntities(table: string, filters?: Record<string, unknown>, page?: number, limit?: number): Promise<{ items: Record<string, unknown>[]; total: number }>;
  createEntity(table: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
  updateEntity(table: string, id: number, data: Record<string, unknown>): Promise<Record<string, unknown> | null>;
  deleteEntity(table: string, id: number): Promise<boolean>;

  // Omnivex NC Engine hooks
  logNcEvent(eventType: string, entityId: string, payload: Record<string, unknown>): Promise<void>;
}

// In-memory storage implementation
class MemStorage implements IStorage {
  private users: Map<number, User & { passwordHash: string }> = new Map();
  private entities: Map<string, Map<number, Record<string, unknown>>> = new Map();
  private ncEvents: Array<Record<string, unknown>> = [];
  private nextId: Map<string, number> = new Map();

  private getId(table: string): number {
    const next = (this.nextId.get(table) || 0) + 1;
    this.nextId.set(table, next);
    return next;
  }

  async getUser(id: number) {
    return this.users.get(id) || null;
  }

  async getUserByUsername(username: string) {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return null;
  }

  async getUserByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async createUser(data: { username: string; email: string; password: string; displayName?: string }) {
    const id = this.getId('users');
    const passwordHash = await bcrypt.hash(data.password, 12);
    const now = new Date();
    const user: User & { passwordHash: string } = {
      id,
      username: data.username,
      email: data.email,
      passwordHash,
      displayName: data.displayName,
      isVerified: false,
      role: 'user',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(id: number, data: Partial<User>) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...data, id, updatedAt: new Date() };
    this.users.set(id, updated);
    const { passwordHash: _, ...safeUser } = updated;
    return safeUser;
  }

  async deleteUser(id: number) {
    return this.users.delete(id);
  }

  private getTable(table: string): Map<number, Record<string, unknown>> {
    if (!this.entities.has(table)) {
      this.entities.set(table, new Map());
    }
    return this.entities.get(table)!;
  }

  async getEntity(table: string, id: number) {
    return this.getTable(table).get(id) || null;
  }

  async listEntities(table: string, filters?: Record<string, unknown>, page = 1, limit = 20) {
    let items = Array.from(this.getTable(table).values());
    if (filters) {
      items = items.filter(item =>
        Object.entries(filters).every(([k, v]) => v === undefined || item[k] === v)
      );
    }
    const total = items.length;
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit), total };
  }

  async createEntity(table: string, data: Record<string, unknown>) {
    const id = this.getId(table);
    const now = new Date();
    const entity = { ...data, id, createdAt: now, updatedAt: now };
    this.getTable(table).set(id, entity);
    return entity;
  }

  async updateEntity(table: string, id: number, data: Record<string, unknown>) {
    const table_map = this.getTable(table);
    const existing = table_map.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    table_map.set(id, updated);
    return updated;
  }

  async deleteEntity(table: string, id: number) {
    return this.getTable(table).delete(id);
  }

  async logNcEvent(eventType: string, entityId: string, payload: Record<string, unknown>) {
    this.ncEvents.push({
      eventType,
      entityId,
      payload,
      timestamp: new Date().toISOString(),
      service: 'FluxWork',
    });
  }
}

export const storage = new MemStorage();
