import { ProgressService } from '../services/progressService';
import { CATEGORIES, CATEGORY_INFO } from '../config/constants';

const progressService = new ProgressService();

export const progressResolvers = {
  Query: {
    myProgress: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const progress = await progressService.getUserProgress(context.user.id);
        return progress;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch progress');
      }
    },
    
    categoryProgress: async (_: any, { categoryId }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const progress = await progressService.getCategoryProgress(
          context.user.id,
          categoryId
        );
        
        if (!progress) {
          throw new Error('Category progress not found');
        }
        
        return progress;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch category progress');
      }
    },
    
    categories: async () => {
      // Return all available categories
      return Object.entries(CATEGORY_INFO).map(([id, info]) => ({
        id,
        ...info,
      }));
    },
    
    leaderboard: async (_: any, args: any, context: any) => {
      try {
        const leaderboard = await progressService.getLeaderboard({
          categoryId: args.categoryId,
          timeFrame: args.timeFrame || 'all',
          limit: args.limit || 10,
        });
        
        return leaderboard;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch leaderboard');
      }
    },
  },
  
  // Resolve nested fields
  ProgressStats: {
    streakDays: (parent: any) => parent.streakDays || 0,
    bestStreak: (parent: any) => parent.bestStreak || 0,
    totalActivities: (parent: any) => parent.totalActivities || 0,
    totalDuration: (parent: any) => parent.totalDuration || 0,
    weeklyGoal: (parent: any) => parent.weeklyGoal || null,
    monthlyProgress: (parent: any) => parent.monthlyProgress || null,
    achievements: (parent: any) => parent.achievements || [],
  },
};
