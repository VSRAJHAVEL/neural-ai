import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  layout: jsonb("layout").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// MongoDB Schemas for Activity Tracking (defined below in TypeScript)
// These will be used with MongoDB driver instead of PostgreSQL

// ==================== MongoDB Activity Tracking Types ====================

export interface UserSession {
  _id?: string;
  userId: string;
  username: string;
  loginTime: Date;
  logoutTime?: Date;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export type InsertSession = Omit<UserSession, '_id' | 'loginTime'>;

export interface ActivityLog {
  _id?: string;
  sessionId: string;
  userId: string;
  activityType: 'code_generation' | 'layout_change' | 'component_add' | 'component_remove' | 'chatbot_message' | 'project_save';
  projectId?: number;
  details?: Record<string, any>;
  timestamp: Date;
}

export type InsertActivity = Omit<ActivityLog, '_id' | 'timestamp'>;

export interface CodeGeneration {
  _id?: string;
  sessionId: string;
  userId: string;
  projectId?: number;
  layoutSnapshot: Record<string, any>;
  generatedCode: string;
  generationType: 'initial' | 'optimize' | 'regenerate';
  timestamp: Date;
}

export type InsertCodeGeneration = Omit<CodeGeneration, '_id' | 'timestamp'>;

export interface ChatbotMessage {
  _id?: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type InsertChatbotMessage = Omit<ChatbotMessage, '_id' | 'timestamp'>;

export interface ComponentUsage {
  _id?: string;
  sessionId: string;
  userId: string;
  projectId?: number;
  componentType: string;
  action: 'added' | 'removed' | 'modified' | 'used_in_generation';
  timestamp: Date;
}

export type InsertComponentUsage = Omit<ComponentUsage, '_id' | 'timestamp'>;

