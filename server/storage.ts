import { users, projects, type User, type InsertUser, type Project, type InsertProject, type UserSession, type InsertSession, type ActivityLog, type InsertActivity, type CodeGeneration, type InsertCodeGeneration, type ChatbotMessage, type InsertChatbotMessage, type ComponentUsage, type InsertComponentUsage } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { ObjectId } from "mongodb";
import {
  getUserSessionsCollection,
  getActivityLogsCollection,
  getCodeGenerationsCollection,
  getChatbotMessagesCollection,
  getComponentUsageCollection,
} from "./mongodb";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Session management
  createSession(session: InsertSession): Promise<UserSession>;
  getSession(sessionId: string): Promise<UserSession | undefined>;
  updateSessionLogout(sessionId: string): Promise<UserSession | undefined>;

  // Activity logging
  logActivity(activity: InsertActivity): Promise<ActivityLog>;
  getActivitiesBySession(sessionId: string): Promise<ActivityLog[]>;
  getActivitiesByUser(userId: string, limit?: number): Promise<ActivityLog[]>;

  // Code generation history
  logCodeGeneration(generation: InsertCodeGeneration): Promise<CodeGeneration>;
  getCodeGenerationsBySession(sessionId: string): Promise<CodeGeneration[]>;
  getCodeGenerationsByUser(userId: string, limit?: number): Promise<CodeGeneration[]>;

  // Chatbot messages
  logChatbotMessage(message: InsertChatbotMessage): Promise<ChatbotMessage>;
  getChatbotMessages(sessionId: string): Promise<ChatbotMessage[]>;

  // Component usage
  logComponentUsage(usage: InsertComponentUsage): Promise<void>;
  getComponentUsageBySession(sessionId: string): Promise<ComponentUsage[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.updatedAt));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ==================== MongoDB Activity Tracking ====================

  // Session Management
  async createSession(insertSession: InsertSession): Promise<UserSession> {
    const collection = await getUserSessionsCollection();
    const session: UserSession = {
      ...insertSession,
      loginTime: new Date(),
    };
    const result = await collection.insertOne(session);
    return { ...session, _id: result.insertedId.toString() };
  }

  async getSession(sessionId: string): Promise<UserSession | undefined> {
    const collection = await getUserSessionsCollection();
    try {
      const session = await collection.findOne({ _id: new ObjectId(sessionId) } as any);
      return session || undefined;
    } catch {
      return undefined;
    }
  }

  async updateSessionLogout(sessionId: string): Promise<UserSession | undefined> {
    const collection = await getUserSessionsCollection();
    try {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(sessionId) } as any,
        {
          $set: {
            logoutTime: new Date(),
            isActive: false,
          },
        },
        { returnDocument: 'after' }
      );
      return (result as any)?.value || undefined;
    } catch {
      return undefined;
    }
  }

  // Activity Logging
  async logActivity(insertActivity: InsertActivity): Promise<ActivityLog> {
    const collection = await getActivityLogsCollection();
    const activity: ActivityLog = {
      ...insertActivity,
      timestamp: new Date(),
    };
    const result = await collection.insertOne(activity);
    return { ...activity, _id: result.insertedId.toString() };
  }

  async getActivitiesBySession(sessionId: string): Promise<ActivityLog[]> {
    const collection = await getActivityLogsCollection();
    return await collection
      .find({ sessionId })
      .sort({ timestamp: -1 })
      .toArray();
  }

  async getActivitiesByUser(userId: string, limit: number = 100): Promise<ActivityLog[]> {
    const collection = await getActivityLogsCollection();
    return await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  // Code Generation History
  async logCodeGeneration(insertGeneration: InsertCodeGeneration): Promise<CodeGeneration> {
    const collection = await getCodeGenerationsCollection();
    const generation: CodeGeneration = {
      ...insertGeneration,
      timestamp: new Date(),
    };
    const result = await collection.insertOne(generation);
    return { ...generation, _id: result.insertedId.toString() };
  }

  async getCodeGenerationsBySession(sessionId: string): Promise<CodeGeneration[]> {
    const collection = await getCodeGenerationsCollection();
    return await collection
      .find({ sessionId })
      .sort({ timestamp: -1 })
      .toArray();
  }

  async getCodeGenerationsByUser(userId: string, limit: number = 50): Promise<CodeGeneration[]> {
    const collection = await getCodeGenerationsCollection();
    return await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  // Chatbot Messages
  async logChatbotMessage(insertMessage: InsertChatbotMessage): Promise<ChatbotMessage> {
    const collection = await getChatbotMessagesCollection();
    const message: ChatbotMessage = {
      ...insertMessage,
      timestamp: new Date(),
    };
    const result = await collection.insertOne(message);
    return { ...message, _id: result.insertedId.toString() };
  }

  async getChatbotMessages(sessionId: string): Promise<ChatbotMessage[]> {
    const collection = await getChatbotMessagesCollection();
    return await collection
      .find({ sessionId })
      .sort({ timestamp: 1 })
      .toArray();
  }

  // Component Usage
  async logComponentUsage(insertUsage: InsertComponentUsage): Promise<void> {
    const collection = await getComponentUsageCollection();
    const usage: ComponentUsage = {
      ...insertUsage,
      timestamp: new Date(),
    };
    await collection.insertOne(usage);
  }

  async getComponentUsageBySession(sessionId: string): Promise<ComponentUsage[]> {
    const collection = await getComponentUsageCollection();
    return await collection
      .find({ sessionId })
      .sort({ timestamp: -1 })
      .toArray();
  }
}

export const storage = new DatabaseStorage();
