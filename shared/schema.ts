// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import { z } from 'zod';

// FluxWork — Shared Zod Validation Schemas

export const insertUserSchema = z.object({
  username: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().optional(),
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Domain-specific schemas
export const createItemSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().optional(),
  status: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  isPublic: z.boolean().optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const searchSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Omnivex NC Engine hook schema
export const omnivexNcHookSchema = z.object({
  eventType: z.string(),
  entityId: z.string(),
  entityType: z.string(),
  payload: z.record(z.unknown()),
  timestamp: z.string().datetime(),
});
