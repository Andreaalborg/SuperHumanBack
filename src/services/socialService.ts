import { AppDataSource } from '../config/database';
import { Friend } from '../entities/Friend';
import { User } from '../entities/User';
import { Activity } from '../entities/Activity';
import { UserProgress } from '../entities/UserProgress';
import { In, Not } from 'typeorm';

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  level: number;
  rank: number;
}

export interface SocialActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: string;
  icon: string;
  message: string;
  category: string;
  categoryColor: string;
  points?: number;
  timestamp: string;
}

export class SocialService {
  // Check if database is connected
  private checkDatabase() {
    if (!AppDataSource.isInitialized) {
      throw new Error('Database not connected - social features require database');
    }
  }

  // Friend Management
  async sendFriendRequest(userId: string, friendEmail: string): Promise<Friend> {
    this.checkDatabase();
    const friendRepository = AppDataSource.getRepository(Friend);
    const userRepository = AppDataSource.getRepository(User);
    
    // Find friend by email
    const friendUser = await userRepository.findOne({ where: { email: friendEmail } });
    if (!friendUser) {
      throw new Error('Bruker ikke funnet');
    }

    if (friendUser.id === userId) {
      throw new Error('Du kan ikke legge til deg selv som venn');
    }

    // Check if already friends or pending
    const existingFriend = await friendRepository.findOne({
      where: [
        { userId, friendId: friendUser.id },
        { userId: friendUser.id, friendId: userId }
      ]
    });

    if (existingFriend) {
      if (existingFriend.status === 'accepted') {
        throw new Error('Dere er allerede venner');
      } else if (existingFriend.status === 'pending') {
        throw new Error('Venneforespørsel allerede sendt');
      }
    }

    // Create friend request
    const friendRequest = friendRepository.create({
      userId,
      friendId: friendUser.id,
      status: 'pending'
    });

    return await friendRepository.save(friendRequest);
  }

  async acceptFriendRequest(userId: string, requestId: string): Promise<Friend> {
    this.checkDatabase();
    const friendRepository = AppDataSource.getRepository(Friend);
    
    const request = await friendRepository.findOne({ 
      where: { id: requestId, friendId: userId, status: 'pending' }
    });

    if (!request) {
      throw new Error('Venneforespørsel ikke funnet');
    }

    // Update request to accepted
    request.status = 'accepted';
    await friendRepository.save(request);

    // Create reciprocal friendship
    const reciprocal = friendRepository.create({
      userId: request.friendId,
      friendId: request.userId,
      status: 'accepted'
    });
    await friendRepository.save(reciprocal);

    return request;
  }

  async declineFriendRequest(userId: string, requestId: string): Promise<boolean> {
    this.checkDatabase();
    const friendRepository = AppDataSource.getRepository(Friend);
    
    const result = await friendRepository.delete({ 
      id: requestId, 
      friendId: userId, 
      status: 'pending' 
    });
    return result.affected !== 0;
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    this.checkDatabase();
    const friendRepository = AppDataSource.getRepository(Friend);
    
    // Remove both directions of friendship
    await friendRepository.delete([
      { userId, friendId, status: 'accepted' },
      { userId: friendId, friendId: userId, status: 'accepted' }
    ]);
    return true;
  }

  async getMyFriends(userId: string): Promise<User[]> {
    this.checkDatabase();
    const friendRepository = AppDataSource.getRepository(Friend);
    
    const friendships = await friendRepository.find({
      where: { userId, status: 'accepted' },
      relations: ['friend']
    });

    return friendships.map(f => f.friend);
  }

  async getPendingRequests(userId: string): Promise<Friend[]> {
    this.checkDatabase();
    const friendRepository = AppDataSource.getRepository(Friend);
    
    return await friendRepository.find({
      where: { friendId: userId, status: 'pending' },
      relations: ['user']
    });
  }

  // Leaderboard
  async getLeaderboard(timeframe: 'week' | 'month' | 'all' = 'all'): Promise<LeaderboardEntry[]> {
    this.checkDatabase();
    const userRepository = AppDataSource.getRepository(User);
    
    let dateFilter = '';
    
    if (timeframe === 'week') {
      dateFilter = "AND up.\"updatedAt\" >= NOW() - INTERVAL '7 days'";
    } else if (timeframe === 'month') {
      dateFilter = "AND up.\"updatedAt\" >= NOW() - INTERVAL '30 days'";
    }

    const query = `
      SELECT 
        u.id as "userId",
        u.name as "userName",
        COALESCE(SUM(up."totalPoints"), 0) as "totalPoints",
        COALESCE(MAX(FLOOR(SUM(up."totalPoints") / 100) + 1), 1) as "level"
      FROM users u
      LEFT JOIN user_progress up ON u.id = up."userId" ${dateFilter}
      GROUP BY u.id, u.name
      ORDER BY "totalPoints" DESC
      LIMIT 100
    `;

    const results = await userRepository.query(query);

    // Add rank
    return results.map((user: any, index: number) => ({
      ...user,
      totalPoints: parseInt(user.totalPoints),
      level: parseInt(user.level),
      rank: index + 1
    }));
  }

  async getFriendsLeaderboard(userId: string): Promise<LeaderboardEntry[]> {
    this.checkDatabase();
    const progressRepository = AppDataSource.getRepository(UserProgress);
    
    // Get user's friends
    const friends = await this.getMyFriends(userId);
    const friendIds = friends.map(f => f.id);
    
    // Include the user themselves
    friendIds.push(userId);

    if (friendIds.length === 0) {
      return [];
    }

    // Get progress for friends
    const progressData = await progressRepository.find({
      where: { userId: In(friendIds) },
      relations: ['user']
    });

    // Calculate total points per user
    const userPoints = new Map<string, { user: User; totalPoints: number }>();
    
    progressData.forEach(progress => {
      const current = userPoints.get(progress.userId) || { 
        user: progress.user, 
        totalPoints: 0 
      };
      current.totalPoints += progress.totalPoints;
      userPoints.set(progress.userId, current);
    });

    // Convert to leaderboard format and sort
    const leaderboard = Array.from(userPoints.values())
      .map(({ user, totalPoints }) => ({
        userId: user.id,
        userName: user.name,
        totalPoints,
        level: Math.floor(totalPoints / 100) + 1,
        rank: 0
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    // Add ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  }

  // Social Activity Feed
  async getRecentSocialActivities(userId: string): Promise<SocialActivity[]> {
    this.checkDatabase();
    const activityRepository = AppDataSource.getRepository(Activity);
    
    // Get user's friends
    const friends = await this.getMyFriends(userId);
    const friendIds = friends.map(f => f.id);

    if (friendIds.length === 0) {
      return [];
    }

    // Get recent activities from friends
    const activities = await activityRepository.find({
      where: { 
        userId: In(friendIds)
      },
      relations: ['user'],
      order: { completedAt: 'DESC' },
      take: 50
    });

    // Convert to social activity format
    return activities.map(activity => {
      // Get category info based on categoryId
      const categoryInfo = this.getCategoryInfo(activity.categoryId);
      
      return {
        id: activity.id,
        userId: activity.user.id,
        userName: activity.user.name,
        userAvatar: undefined, // Add avatar support later
        type: 'activity_completed',
        icon: categoryInfo.icon,
        message: `${activity.user.name} fullførte ${activity.name}`,
        category: activity.categoryId,
        categoryColor: categoryInfo.color,
        points: activity.points,
        timestamp: activity.completedAt ? activity.completedAt.toISOString() : new Date().toISOString()
      };
    });
  }

  // Referral System
  async getReferralCode(userId: string): Promise<string> {
    this.checkDatabase();
    const userRepository = AppDataSource.getRepository(User);
    
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('Bruker ikke funnet');
    }

    // Generate referral code from user ID (first 8 chars)
    return `SH${userId.substring(0, 8).toUpperCase()}`;
  }

  async applyReferralCode(userId: string, referralCode: string): Promise<boolean> {
    this.checkDatabase();
    const userRepository = AppDataSource.getRepository(User);
    
    // Extract user ID from referral code
    const referrerId = referralCode.substring(2).toLowerCase();
    
    // Find referrer
    const referrer = await userRepository.findOne({ 
      where: { id: referrerId } 
    });
    
    if (!referrer) {
      throw new Error('Ugyldig referral kode');
    }

    if (referrer.id === userId) {
      throw new Error('Du kan ikke bruke din egen referral kode');
    }

    // Add referrer as friend automatically
    await this.sendFriendRequest(userId, referrer.email);
    
    // TODO: Add referral rewards when payment system is ready
    
    return true;
  }

  // Helper method to get category info
  private getCategoryInfo(categoryId: string): { icon: string; color: string; name: string } {
    const categories: Record<string, { icon: string; color: string; name: string }> = {
      physical: { icon: '💪', color: '#FF6B6B', name: 'Fysisk Helse' },
      mental: { icon: '🧠', color: '#4ECDC4', name: 'Mental Styrke' },
      career: { icon: '💼', color: '#45B7D1', name: 'Karriere' },
      social: { icon: '👥', color: '#96CEB4', name: 'Sosiale Ferdigheter' },
      creative: { icon: '🎨', color: '#BB8FCE', name: 'Kreativitet' },
      learning: { icon: '📚', color: '#85C1E2', name: 'Læring' }
    };
    
    return categories[categoryId] || { icon: '📌', color: '#95A5A6', name: 'Annet' };
  }
}

export const socialService = new SocialService();