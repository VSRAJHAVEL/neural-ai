import { MongoClient, Db, Collection } from 'mongodb';
import {
  UserSession,
  ActivityLog,
  CodeGeneration,
  ChatbotMessage,
  ComponentUsage,
} from '@shared/schema';

let client: MongoClient | null = null;
let db: Db | null = null;

async function getConnection(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/neural-ai';

  if (!mongoUrl) {
    throw new Error('MONGODB_URI must be set in environment variables');
  }

  client = new MongoClient(mongoUrl, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  await client.connect();
  db = client.db();

  // Create indexes for better query performance
  await createIndexes(db);

  console.log('Connected to MongoDB:', mongoUrl.split('?')[0]);
  return db;
}

async function createIndexes(database: Db) {
  try {
    // User Sessions indexes
    await database.collection('user_sessions').createIndex({ userId: 1, loginTime: -1 });
    await database.collection('user_sessions').createIndex({ sessionId: 1 });

    // Activity Logs indexes
    await database.collection('activity_logs').createIndex({ sessionId: 1, timestamp: -1 });
    await database.collection('activity_logs').createIndex({ userId: 1, timestamp: -1 });

    // Code Generations indexes
    await database.collection('code_generations').createIndex({ sessionId: 1, timestamp: -1 });
    await database.collection('code_generations').createIndex({ userId: 1, timestamp: -1 });

    // Chatbot Messages indexes
    await database.collection('chatbot_messages').createIndex({ sessionId: 1, timestamp: 1 });
    await database.collection('chatbot_messages').createIndex({ userId: 1, timestamp: -1 });

    // Component Usage indexes
    await database.collection('component_usage').createIndex({ sessionId: 1, timestamp: -1 });
    await database.collection('component_usage').createIndex({ userId: 1, componentType: 1 });

    console.log('MongoDB indexes created');
  } catch (error) {
    console.warn('Could not create indexes:', error);
  }
}

export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// Collection accessors
export async function getUserSessionsCollection(): Promise<Collection<UserSession>> {
  const database = await getConnection();
  return database.collection('user_sessions');
}

export async function getActivityLogsCollection(): Promise<Collection<ActivityLog>> {
  const database = await getConnection();
  return database.collection('activity_logs');
}

export async function getCodeGenerationsCollection(): Promise<Collection<CodeGeneration>> {
  const database = await getConnection();
  return database.collection('code_generations');
}

export async function getChatbotMessagesCollection(): Promise<Collection<ChatbotMessage>> {
  const database = await getConnection();
  return database.collection('chatbot_messages');
}

export async function getComponentUsageCollection(): Promise<Collection<ComponentUsage>> {
  const database = await getConnection();
  return database.collection('component_usage');
}

export async function initMongoDB(): Promise<void> {
  await getConnection();
}

export { getConnection };
