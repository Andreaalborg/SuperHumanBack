import { AuthService } from '../services/authService';
import { verifyTokenAndGetUser } from '../middleware/auth';

const authService = new AuthService();

export const authResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      return await authService.getProfile(context.user.id);
    },
  },
  
  Mutation: {
    register: async (_: any, args: any) => {
      try {
        const result = await authService.register({
          email: args.email,
          password: args.password,
          name: args.name,
        });
        return result;
      } catch (error: any) {
        throw new Error(error.message || 'Registration failed');
      }
    },
    
    login: async (_: any, args: any) => {
      try {
        const result = await authService.login({
          email: args.email,
          password: args.password,
        });
        return result;
      } catch (error: any) {
        throw new Error(error.message || 'Login failed');
      }
    },
    
    updateProfile: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const updatedUser = await authService.updateProfile(context.user.id, input);
        return updatedUser;
      } catch (error: any) {
        throw new Error(error.message || 'Update failed');
      }
    },
    
    changePassword: async (_: any, { oldPassword, newPassword }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const result = await authService.changePassword(
          context.user.id,
          oldPassword,
          newPassword
        );
        return result;
      } catch (error: any) {
        throw new Error(error.message || 'Password change failed');
      }
    },
    
    deleteAccount: async (_: any, { password }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      try {
        const result = await authService.deleteAccount(context.user.id, password);
        return result;
      } catch (error: any) {
        throw new Error(error.message || 'Account deletion failed');
      }
    },
  },
  
  User: {
    activities: async (parent: any) => {
      // This would be resolved by activityResolver
      return [];
    },
    progress: async (parent: any) => {
      // This would be resolved by progressResolver
      return [];
    },
  },
  
  UserMetadata: {
    // Add any field resolvers if needed
  },
};
// Helper to create GraphQL context
export const createContext = async ({ req }: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { user: null, userId: null };
  }
  
  const user = await verifyTokenAndGetUser(token);
  return { 
    user,
    userId: user?.id || null
  };
};

