import { Request, Response, NextFunction } from 'express';
import { authHelpers } from './auth';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.slice(7);
  const payload = authHelpers.verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  req.userId = payload.userId;
  req.userEmail = payload.email;
  next();
}
