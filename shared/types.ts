// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
// FluxWork — Shared TypeScript Types
// Omnivex Ecosystem

export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified: boolean;
  omnivexNcId?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser extends User {
  passwordHash?: never;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OmnivexNcHook {
  eventType: string;
  entityId: string;
  entityType: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface OmnivexNcResponse {
  processed: boolean;
  ncScore?: number;
  insights?: Record<string, unknown>;
  recommendations?: string[];
}

// Domain entity types
export interface DomainEntity {
  id: number;
  name: string;
  description?: string;
  status: string;
  metadata?: Record<string, unknown>;
  isPublic: boolean;
  userId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchParams {
  q?: string;
  status?: string;
  page: number;
  limit: number;
}

export type CreateInput<T extends DomainEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T extends DomainEntity> = Partial<CreateInput<T>>;
