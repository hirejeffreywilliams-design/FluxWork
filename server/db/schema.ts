// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import { pgTable, serial, text, timestamp, integer, boolean, real, jsonb, varchar } from 'drizzle-orm/pg-core';

// FluxWork — Gig Economy Marketplace Platform
// Omnivex NC Engine Schema

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
    username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  isVerified: boolean('is_verified').default(false),
  omnivexNcId: text('omnivex_nc_id'),
  role: varchar('role', { length: 50 }).default('user'),
});

export const gig_listings = pgTable('gig_listings', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: integer('user_id'),
  name: text('name').notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active'),
  metadata: jsonb('metadata'),
  isPublic: boolean('is_public').default(true),
});

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: integer('user_id'),
  name: text('name').notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active'),
  metadata: jsonb('metadata'),
  isPublic: boolean('is_public').default(true),
});

export const user_skills = pgTable('user_skills', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: integer('user_id'),
  name: text('name').notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active'),
  metadata: jsonb('metadata'),
  isPublic: boolean('is_public').default(true),
});

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: integer('user_id'),
  name: text('name').notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active'),
  metadata: jsonb('metadata'),
  isPublic: boolean('is_public').default(true),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: integer('user_id').notNull(),
  amount: real('amount').notNull(),
  currency: varchar('currency', { length: 10 }).default('USD'),
  status: varchar('status', { length: 50 }).default('pending'),
  reference: text('reference'),
  metadata: jsonb('metadata'),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: integer('user_id'),
  name: text('name').notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active'),
  metadata: jsonb('metadata'),
  isPublic: boolean('is_public').default(true),
});

export const portfolios = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: integer('user_id'),
  name: text('name').notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active'),
  metadata: jsonb('metadata'),
  isPublic: boolean('is_public').default(true),
});

export const availability_slots = pgTable('availability_slots', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  scheduledAt: timestamp('scheduled_at'),
  duration: integer('duration'),
  status: varchar('status', { length: 50 }).default('pending'),
  metadata: jsonb('metadata'),
});

export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: integer('user_id'),
  name: text('name').notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active'),
  metadata: jsonb('metadata'),
  isPublic: boolean('is_public').default(true),
});

