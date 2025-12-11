import axios from 'axios';

export interface ActivityLogData {
  sessionId: string;
  userId: string;
  activityType: 'code_generation' | 'layout_change' | 'component_add' | 'component_remove' | 'chatbot_message' | 'project_save' | 'component_usage';
  projectId?: number;
  details?: Record<string, any>;
}

export interface CodeGenerationData {
  sessionId: string;
  userId: string;
  projectId?: number;
  layoutSnapshot: Record<string, any>;
  generatedCode: string;
  generationType: 'initial' | 'optimize' | 'regenerate';
}

export interface ChatbotMessageData {
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ComponentUsageData {
  sessionId: string;
  userId: string;
  projectId?: number;
  componentType: string;
  action: 'added' | 'removed' | 'modified' | 'used_in_generation';
}

export interface SessionData {
  userId: string;
  username: string;
  ipAddress?: string;
  userAgent?: string;
}

class ActivityTracker {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private username: string | null = null;

  async initializeSession(userId: string, username: string, ipAddress?: string, userAgent?: string) {
    this.userId = userId;
    this.username = username;
    
    try {
      const response = await axios.post('/api/session/start', {
        userId,
        username,
        ipAddress,
        userAgent: userAgent || navigator.userAgent,
      });
      this.sessionId = response.data.id;
      console.log('Session started:', this.sessionId);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }

  async endSession() {
    if (!this.sessionId) {
      console.warn('No active session to end');
      return;
    }

    try {
      await axios.post(`/api/session/${this.sessionId}/end`);
      console.log('Session ended');
      this.sessionId = null;
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  async logActivity(data: Omit<ActivityLogData, 'sessionId' | 'userId'>) {
    if (!this.sessionId || !this.userId) {
      console.warn('Session not initialized');
      return;
    }

    try {
      await axios.post('/api/activity/log', {
        sessionId: this.sessionId,
        userId: this.userId,
        ...data,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  async logCodeGeneration(data: Omit<CodeGenerationData, 'sessionId' | 'userId'>) {
    if (!this.sessionId || !this.userId) {
      console.warn('Session not initialized');
      return;
    }

    try {
      await axios.post('/api/code-generation/log', {
        sessionId: this.sessionId,
        userId: this.userId,
        ...data,
      });
    } catch (error) {
      console.error('Failed to log code generation:', error);
    }
  }

  async logChatbotMessage(data: Omit<ChatbotMessageData, 'sessionId' | 'userId'>) {
    if (!this.sessionId || !this.userId) {
      console.warn('Session not initialized');
      return;
    }

    try {
      await axios.post('/api/chatbot/message', {
        sessionId: this.sessionId,
        userId: this.userId,
        ...data,
      });
    } catch (error) {
      console.error('Failed to log chatbot message:', error);
    }
  }

  async logComponentUsage(data: Omit<ComponentUsageData, 'sessionId' | 'userId'>) {
    if (!this.sessionId || !this.userId) {
      console.warn('Session not initialized');
      return;
    }

    try {
      await axios.post('/api/component-usage/log', {
        sessionId: this.sessionId,
        userId: this.userId,
        ...data,
      });
    } catch (error) {
      console.error('Failed to log component usage:', error);
    }
  }

  getSessionId() {
    return this.sessionId;
  }

  getUserId() {
    return this.userId;
  }

  isInitialized() {
    return !!this.sessionId && !!this.userId;
  }
}

export const activityTracker = new ActivityTracker();
