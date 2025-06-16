import { Context } from '../types';
import { socialService } from '../services/socialService';
import { AppDataSource } from '../config/database';
import { Challenge } from '../entities/Challenge';
import { User } from '../entities/User';
import { LessThanOrEqual, MoreThanOrEqual, Between } from 'typeorm';

export const socialResolvers = {
  Query: {
    myFriends: async (_: any, __: any, context: Context) => {
      if (!context.userId) {
        return [];
      }

      try {
        const friends = await socialService.getMyFriends(context.userId);
        
        // Add additional fields needed by GraphQL schema
        const friendsWithStats = await Promise.all(
          friends.map(async (friend) => {
            const progressRepository = AppDataSource.getRepository('UserProgress');
            const progress = await progressRepository.find({
              where: { userId: friend.id }
            });

            const totalScore = progress.reduce((sum: number, p: any) => sum + p.totalPoints, 0);
            const level = Math.floor(totalScore / 100) + 1;

            return {
              ...friend,
              totalScore,
              level,
              lastActive: friend.updatedAt
            };
          })
        );

        return friendsWithStats;
      } catch (error) {
        console.error('Error fetching friends:', error);
        return [];
      }
    },

    leaderboard: async (_: any, { timeframe = 'all' }: any, context: Context) => {
      try {
        return await socialService.getLeaderboard(timeframe);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
    },

    friendsLeaderboard: async (_: any, __: any, context: Context) => {
      if (!context.userId) {
        return [];
      }

      try {
        return await socialService.getFriendsLeaderboard(context.userId);
      } catch (error) {
        console.error('Error fetching friends leaderboard:', error);
        return [];
      }
    },

    pendingFriendRequests: async (_: any, __: any, context: Context) => {
      if (!context.userId) {
        return [];
      }

      try {
        return await socialService.getPendingRequests(context.userId);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        return [];
      }
    },

    recentSocialActivities: async (_: any, { limit = 20 }: any, context: Context) => {
      if (!context.userId) {
        return [];
      }

      try {
        return await socialService.getRecentSocialActivities(context.userId);
      } catch (error) {
        console.error('Error fetching social activities:', error);
        return [];
      }
    },

    activeChallenges: async (_: any, __: any, context: Context) => {
      if (!context.userId) {
        return [];
      }

      try {
        const now = new Date();
        const challengeRepository = AppDataSource.getRepository(Challenge);
        
        // Get all active challenges
        const challenges = await challengeRepository.find({
          where: {
            isActive: true,
            startDate: LessThanOrEqual(now),
            endDate: MoreThanOrEqual(now),
          },
          relations: ['participants']
        });

        // Filter for user's challenges and calculate progress
        const userChallenges = challenges.filter(c => 
          c.participants.some(p => p.id === context.userId)
        );

        const challengesWithProgress = await Promise.all(
          userChallenges.map(async (challenge) => {
            const activityRepository = AppDataSource.getRepository('Activity');
            const activities = await activityRepository.find({
              where: {
                userId: context.userId,
                categoryId: challenge.categoryId,
                completedAt: Between(challenge.startDate, challenge.endDate)
              }
            });

            let currentValue = 0;
            if (challenge.targetType === 'points') {
              currentValue = activities.reduce((sum: number, a: any) => sum + a.points, 0);
            } else if (challenge.targetType === 'activities') {
              currentValue = activities.length;
            } else if (challenge.targetType === 'minutes') {
              currentValue = activities.reduce((sum: number, a: any) => sum + (a.duration || 0), 0);
            } else if (challenge.targetType === 'days') {
              // Count unique days with activities
              const uniqueDays = new Set(
                activities.map((a: any) => a.completedAt.toISOString().split('T')[0])
              );
              currentValue = uniqueDays.size;
            }

            const progress = Math.min((currentValue / challenge.targetValue), 1);
            const daysRemaining = Math.ceil(
              (challenge.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
              id: challenge.id,
              title: challenge.title,
              description: challenge.description,
              icon: challenge.icon,
              categoryId: challenge.categoryId,
              targetValue: challenge.targetValue,
              targetType: challenge.targetType,
              reward: challenge.reward,
              startDate: challenge.startDate.toISOString(),
              endDate: challenge.endDate.toISOString(),
              currentValue,
              progress,
              daysRemaining,
              participants: challenge.participants
            };
          })
        );

        return challengesWithProgress;
      } catch (error) {
        console.error('Error fetching challenges:', error);
        return [];
      }
    },

    myReferralCode: async (_: any, __: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      try {
        return await socialService.getReferralCode(context.userId);
      } catch (error) {
        console.error('Error getting referral code:', error);
        throw error;
      }
    }
  },

  Mutation: {
    sendFriendRequest: async (_: any, { email }: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      try {
        await socialService.sendFriendRequest(context.userId, email);
        return {
          success: true,
          message: 'Venneforespørsel sendt!'
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Kunne ikke sende venneforespørsel'
        };
      }
    },

    acceptFriendRequest: async (_: any, { requestId }: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      try {
        await socialService.acceptFriendRequest(context.userId, requestId);
        return {
          success: true,
          message: 'Venneforespørsel godtatt!'
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Kunne ikke godta venneforespørsel'
        };
      }
    },

    declineFriendRequest: async (_: any, { requestId }: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      try {
        await socialService.declineFriendRequest(context.userId, requestId);
        return {
          success: true,
          message: 'Venneforespørsel avvist'
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Kunne ikke avvise venneforespørsel'
        };
      }
    },

    removeFriend: async (_: any, { friendId }: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      try {
        await socialService.removeFriend(context.userId, friendId);
        return {
          success: true,
          message: 'Venn fjernet'
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Kunne ikke fjerne venn'
        };
      }
    },

    joinChallenge: async (_: any, { challengeId }: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      try {
        const challengeRepository = AppDataSource.getRepository(Challenge);
        const challenge = await challengeRepository.findOne({
          where: { id: challengeId },
          relations: ['participants']
        });

        if (!challenge) {
          throw new Error('Challenge ikke funnet');
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: context.userId } });
        if (!user) {
          throw new Error('Bruker ikke funnet');
        }

        // Check if already participating
        if (challenge.participants.some(p => p.id === context.userId)) {
          throw new Error('Du deltar allerede i denne utfordringen');
        }

        challenge.participants.push(user);
        await challengeRepository.save(challenge);

        return {
          success: true,
          message: 'Du har blitt med i utfordringen!'
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Kunne ikke bli med i utfordringen'
        };
      }
    },

    leaveChallenge: async (_: any, { challengeId }: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      try {
        const challengeRepository = AppDataSource.getRepository(Challenge);
        const challenge = await challengeRepository.findOne({
          where: { id: challengeId },
          relations: ['participants']
        });

        if (!challenge) {
          throw new Error('Challenge ikke funnet');
        }

        challenge.participants = challenge.participants.filter(p => p.id !== context.userId);
        await challengeRepository.save(challenge);

        return {
          success: true,
          message: 'Du har forlatt utfordringen'
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Kunne ikke forlate utfordringen'
        };
      }
    },

    applyReferralCode: async (_: any, { code }: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      try {
        await socialService.applyReferralCode(context.userId, code);
        return {
          success: true,
          message: 'Referral kode aktivert! Du får 30 dager gratis Elite.'
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Ugyldig referral kode'
        };
      }
    }
  }
};