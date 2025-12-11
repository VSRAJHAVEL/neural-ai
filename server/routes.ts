import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema } from "@shared/schema";
import { generateCodeWithAI, optimizeCodeWithAI, optimizeLayoutWithAI } from "./services/ai";
import { authHelpers } from "./auth";
import { authMiddleware } from "./middleware";
import { projectHelpers } from "./projects";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ==================== AUTH ROUTES ====================
  
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      const result = await authHelpers.signup(email, password);
      res.status(201).json({
        user: { id: result.id, email: result.email },
        token: result.token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Signup failed' });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      const result = await authHelpers.signin(email, password);
      res.json({
        user: { id: result.id, email: result.email },
        token: result.token,
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message || 'Invalid credentials' });
    }
  });

  app.post("/api/auth/logout", authMiddleware, (req, res) => {
    // Logout is handled client-side by removing token
    res.json({ message: 'Logged out successfully' });
  });

  // ==================== PROJECT ROUTES ====================
  
  app.post("/api/projects", authMiddleware, async (req, res) => {
    try {
      const { name, layout } = req.body;
      const userId = req.userId!;
      
      if (!name) {
        return res.status(400).json({ message: 'Project name is required' });
      }
      
      const project = await projectHelpers.createProject(userId, name, layout || { components: [] });
      res.status(201).json({
        id: project._id?.toString(),
        userId: project.userId,
        name: project.name,
        layout: project.layout,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Failed to create project' });
    }
  });

  app.get("/api/projects", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId!;
      const projects = await projectHelpers.getUserProjects(userId);
      
      res.json(projects.map(p => ({
        id: p._id?.toString(),
        userId: p.userId,
        name: p.name,
        layout: p.layout,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })));
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  app.get("/api/projects/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId!;
      const projectId = req.params.id;
      
      const project = await projectHelpers.getProject(projectId, userId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json({
        id: project._id?.toString(),
        userId: project.userId,
        name: project.name,
        layout: project.layout,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  });

  app.patch("/api/projects/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId!;
      const projectId = req.params.id;
      const { name, layout } = req.body;
      
      const project = await projectHelpers.updateProject(projectId, userId, { name, layout });
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json({
        id: project._id?.toString(),
        userId: project.userId,
        name: project.name,
        layout: project.layout,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ message: 'Failed to update project' });
    }
  });

  app.delete("/api/projects/:id", authMiddleware, async (req, res) => {
    try {
      const userId = req.userId!;
      const projectId = req.params.id;
      
      const success = await projectHelpers.deleteProject(projectId, userId);
      if (!success) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: 'Failed to delete project' });
    }
  });

  // ==================== AI ROUTES ====================

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { layout } = req.body;
      
      if (!layout) {
        return res.status(400).json({ error: 'Layout is required' });
      }

      const result = await generateCodeWithAI(layout);
      res.json(result);
    } catch (error) {
      console.error('Error generating code:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to generate code' 
      });
    }
  });

  app.post("/api/ai/optimize", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const result = await optimizeCodeWithAI(code);
      res.json(result);
    } catch (error) {
      console.error('Error optimizing code:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to optimize code' 
      });
    }
  });

  app.post("/api/ai/optimize-layout", async (req, res) => {
    try {
      const { layout } = req.body;
      
      if (!layout) {
        return res.status(400).json({ error: 'Layout is required' });
      }

      const result = await optimizeLayoutWithAI(layout);
      res.json(result);
    } catch (error) {
      console.error('Error optimizing layout:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to optimize layout' 
      });
    }
  });

  // ==================== SESSION MANAGEMENT ====================

  app.post("/api/session/start", async (req, res) => {
    try {
      const { userId, username, ipAddress, userAgent } = req.body;
      
      if (!userId || !username) {
        return res.status(400).json({ error: 'userId and username are required' });
      }

      const session = await storage.createSession({
        userId,
        username,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        isActive: true,
      });

      res.status(201).json(session);
    } catch (error) {
      console.error('Error starting session:', error);
      res.status(500).json({ error: 'Failed to start session' });
    }
  });

  app.post("/api/session/:sessionId/end", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.updateSessionLogout(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({ error: 'Failed to end session' });
    }
  });

  // ==================== ACTIVITY LOGGING ====================

  app.post("/api/activity/log", async (req, res) => {
    try {
      const { sessionId, userId, activityType, projectId, details } = req.body;
      
      if (!sessionId || !userId || !activityType) {
        return res.status(400).json({ error: 'sessionId, userId, and activityType are required' });
      }

      const activity = await storage.logActivity({
        sessionId,
        userId,
        activityType,
        projectId: projectId || undefined,
        details: details || {},
      });

      res.status(201).json(activity);
    } catch (error) {
      console.error('Error logging activity:', error);
      res.status(500).json({ error: 'Failed to log activity' });
    }
  });

  app.get("/api/activity/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const activities = await storage.getActivitiesBySession(sessionId);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  });

  app.get("/api/activity/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const activities = await storage.getActivitiesByUser(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  });

  // ==================== CODE GENERATION HISTORY ====================

  app.post("/api/code-generation/log", async (req, res) => {
    try {
      const { sessionId, userId, projectId, layoutSnapshot, generatedCode, generationType } = req.body;
      
      if (!sessionId || !userId || !layoutSnapshot || !generatedCode || !generationType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const generation = await storage.logCodeGeneration({
        sessionId,
        userId,
        projectId: projectId || undefined,
        layoutSnapshot,
        generatedCode,
        generationType,
      });

      res.status(201).json(generation);
    } catch (error) {
      console.error('Error logging code generation:', error);
      res.status(500).json({ error: 'Failed to log code generation' });
    }
  });

  app.get("/api/code-generation/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const generations = await storage.getCodeGenerationsBySession(sessionId);
      res.json(generations);
    } catch (error) {
      console.error('Error fetching code generations:', error);
      res.status(500).json({ error: 'Failed to fetch code generations' });
    }
  });

  app.get("/api/code-generation/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const generations = await storage.getCodeGenerationsByUser(userId, limit);
      res.json(generations);
    } catch (error) {
      console.error('Error fetching user code generations:', error);
      res.status(500).json({ error: 'Failed to fetch code generations' });
    }
  });

  // ==================== CHATBOT MESSAGES ====================

  app.post("/api/chatbot/message", async (req, res) => {
    try {
      const { sessionId, userId, role, content } = req.body;
      
      if (!sessionId || !userId || !role || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const message = await storage.logChatbotMessage({
        sessionId,
        userId,
        role,
        content,
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('Error logging chatbot message:', error);
      res.status(500).json({ error: 'Failed to log chatbot message' });
    }
  });

  app.get("/api/chatbot/messages/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatbotMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chatbot messages:', error);
      res.status(500).json({ error: 'Failed to fetch chatbot messages' });
    }
  });

  // ==================== COMPONENT USAGE ====================

  app.post("/api/component-usage/log", async (req, res) => {
    try {
      const { sessionId, userId, projectId, componentType, action } = req.body;
      
      if (!sessionId || !userId || !componentType || !action) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await storage.logComponentUsage({
        sessionId,
        userId,
        projectId: projectId || undefined,
        componentType,
        action,
      });

      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error logging component usage:', error);
      res.status(500).json({ error: 'Failed to log component usage' });
    }
  });

  app.get("/api/component-usage/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const usage = await storage.getComponentUsageBySession(sessionId);
      res.json(usage);
    } catch (error) {
      console.error('Error fetching component usage:', error);
      res.status(500).json({ error: 'Failed to fetch component usage' });
    }
  });

  return httpServer;
}
