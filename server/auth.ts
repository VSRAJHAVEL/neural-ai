import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { getConnection } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export interface AuthUser {
  _id?: ObjectId;
  id?: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

async function getUsersCollection(): Promise<Collection<AuthUser>> {
  const db = await getConnection();
  const collection = db.collection<AuthUser>('users');
  
  // Create indexes
  try {
    await collection.createIndex({ email: 1 }, { unique: true });
  } catch (e) {
    // Index might already exist
  }
  
  return collection;
}

export const authHelpers = {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateToken(user: { id: string; email: string }): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  },

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  },

  async signup(email: string, password: string): Promise<{ id: string; email: string; token: string }> {
    const collection = await getUsersCollection();
    
    // Check if user already exists
    const existing = await collection.findOne({ email });
    if (existing) {
      throw new Error('Email already in use');
    }
    
    // Hash password
    const passwordHash = await this.hashPassword(password);
    
    // Create user
    const result = await collection.insertOne({
      email,
      passwordHash,
      createdAt: new Date(),
    } as AuthUser);
    
    const userId = result.insertedId.toString();
    const token = this.generateToken({ id: userId, email });
    
    return { id: userId, email, token };
  },

  async signin(email: string, password: string): Promise<{ id: string; email: string; token: string }> {
    const collection = await getUsersCollection();
    
    const user = await collection.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    const userId = user._id!.toString();
    const token = this.generateToken({ id: userId, email: user.email });
    
    return { id: userId, email: user.email, token };
  },

  async getUserById(userId: string): Promise<AuthUser | null> {
    const collection = await getUsersCollection();
    try {
      return await collection.findOne({ _id: new ObjectId(userId) });
    } catch {
      return null;
    }
  },
};
