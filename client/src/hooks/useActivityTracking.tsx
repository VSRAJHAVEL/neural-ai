import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { activityTracker } from '@/services/activity';

export function useActivityTracking() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const userId = (user as any).id || '';
      const username = (user as any).username || '';
      if (userId && username) {
        // Initialize session when user logs in
        activityTracker.initializeSession(
          userId,
          username,
          undefined,
          navigator.userAgent
        );

        // Cleanup: end session when component unmounts or user logs out
        return () => {
          if (activityTracker.isInitialized()) {
            activityTracker.endSession();
          }
        };
      }
    }
  }, [user]);

  return activityTracker;
}
