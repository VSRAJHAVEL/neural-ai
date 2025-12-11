import { ObjectId, Collection } from 'mongodb';
import { getConnection } from './mongodb';

export interface MongoProject {
  _id?: ObjectId;
  userId: string;
  name: string;
  layout: any;
  createdAt: Date;
  updatedAt: Date;
}

async function getProjectsCollection(): Promise<Collection<MongoProject>> {
  const db = await getConnection();
  const collection = db.collection<MongoProject>('projects');
  
  // Create indexes
  try {
    await collection.createIndex({ userId: 1, createdAt: -1 });
    await collection.createIndex({ _id: 1 });
  } catch (e) {
    // Index might already exist
  }
  
  return collection;
}

export const projectHelpers = {
  async createProject(userId: string, name: string, layout: any): Promise<MongoProject> {
    const collection = await getProjectsCollection();
    const now = new Date();
    
    const result = await collection.insertOne({
      userId,
      name,
      layout,
      createdAt: now,
      updatedAt: now,
    });
    
    return {
      _id: result.insertedId,
      userId,
      name,
      layout,
      createdAt: now,
      updatedAt: now,
    };
  },

  async getUserProjects(userId: string): Promise<MongoProject[]> {
    const collection = await getProjectsCollection();
    return collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  },

  async getProject(projectId: string, userId: string): Promise<MongoProject | null> {
    const collection = await getProjectsCollection();
    try {
      return await collection.findOne({
        _id: new ObjectId(projectId),
        userId,
      });
    } catch {
      return null;
    }
  },

  async updateProject(projectId: string, userId: string, updates: Partial<MongoProject>): Promise<MongoProject | null> {
    const collection = await getProjectsCollection();
    try {
      const result = await collection.findOneAndUpdate(
        {
          _id: new ObjectId(projectId),
          userId,
        },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' as const }
      );
      return result ? result : null;
    } catch {
      return null;
    }
  },

  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    const collection = await getProjectsCollection();
    try {
      const result = await collection.deleteOne({
        _id: new ObjectId(projectId),
        userId,
      });
      return result.deletedCount > 0;
    } catch {
      return false;
    }
  },
};
