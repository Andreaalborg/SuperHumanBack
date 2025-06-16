import { ActivityService } from '../services/activityService';

const activityService = new ActivityService();

export const activityResolvers = {
  Query: {
    myActivities: async (_: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const result = await activityService.getUserActivities(context.user.id, {
          categoryId: args.categoryId,
          limit: args.limit || 20,
          offset: args.offset || 0,
          startDate: args.startDate,
          endDate: args.endDate,
        });
        
        return result;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch activities');
      }
    },
  },
  
  Mutation: {
    saveActivity: async (_: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const activity = await activityService.saveActivity(context.user.id, {
          categoryId: args.categoryId,
          name: args.name,
          duration: args.duration,
          points: args.points,
        });
        return activity;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to save activity');
      }
    },
    
    updateActivity: async (_: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const updateData: any = {};
        if (args.name !== undefined) updateData.name = args.name;
        if (args.duration !== undefined) updateData.duration = args.duration;
        if (args.points !== undefined) updateData.points = args.points;
        
        const activity = await activityService.updateActivity(
          context.user.id,
          args.id,
          updateData
        );
        return activity;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update activity');
      }
    },
    
    deleteActivity: async (_: any, { id }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const result = await activityService.deleteActivity(context.user.id, id);
        return result;
      } catch (error: any) {
        throw new Error(error.message || 'Failed to delete activity');
      }
    },
  },
  
  // Custom scalar resolver for JSON type
  JSON: {
    __serialize: (value: any) => value,
    __parseValue: (value: any) => value,
    __parseLiteral: (ast: any) => ast.value,
  },
};
