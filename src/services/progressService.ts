import { AppDataSource } from '../config/database';
import { UserProgress } from '../entities/UserProgress';
import { User } from '../entities/User';
import { Activity } from '../entities/Activity';
import { CATEGORIES, CATEGORY_INFO } from '../config/constants';
import { calculateLevel, pointsToNextLevel, levelProgress } from '../utils/helpers';

interface CategoryProgress {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  totalPoints: number;
  level: number;
  levelProgress: number;
  pointsToNextLevel: number;
  stats: UserProgress['stats'];
}

interface OverallProgress {
  totalScore: number;
  overallLevel: number;
  categories: CategoryProgress[];
  recentActivities: Activity[];
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export class ProgressService {
  private userProgressRepository = AppDataSource.getRepository(UserProgress);
  private userRepository = AppDataSource.getRepository(User);
  private activityRepository = AppDataSource.getRepository(Activity);
  
  async getUserProgress(userId: string): Promise<OverallProgress> {
    // Get all progress entries for user
    const progressEntries = await this.userProgressRepository.find({
      where: { userId },
    });
    
    // Calculate total score
    const totalScore = progressEntries.reduce((sum, p) => sum + p.totalPoints, 0);
    const overallLevel = calculateLevel(totalScore);
    
    // Update user's total score
    await this.userRepository.update(userId, {
      metadata: () => `
        jsonb_set(
          COALESCE(metadata, '{}'),
          '{totalScore}',
          '${totalScore}'::jsonb
        )
      `,
    });
    
    // Map progress entries to detailed category progress
    const categories: CategoryProgress[] = await Promise.all(
      Object.entries(CATEGORIES).map(async ([key, categoryId]) => {
        const progress = progressEntries.find(p => p.categoryId === categoryId) || {
          categoryId,
          totalPoints: 0,
          level: 1,
          stats: {
            streakDays: 0,
            bestStreak: 0,
            totalActivities: 0,
            totalDuration: 0,
          },
        };
        
        const categoryInfo = CATEGORY_INFO[categoryId];
        
        return {
          categoryId,
          categoryName: categoryInfo.name,
          categoryIcon: categoryInfo.icon,
          totalPoints: progress.totalPoints,
          level: progress.level,
          levelProgress: levelProgress(progress.totalPoints),
          pointsToNextLevel: pointsToNextLevel(progress.totalPoints),
          stats: progress.stats,
        };
      })
    );
    
    // Get recent activities
    const recentActivities = await this.activityRepository.find({
      where: { userId },
      order: { completedAt: 'DESC' },
      take: 10,
    });
    
    // Get achievements
    const achievements = await this.calculateAchievements(userId, progressEntries, totalScore);
    
    return {
      totalScore,
      overallLevel,
      categories,
      recentActivities,
      achievements,
    };
  }
  
  async getCategoryProgress(userId: string, categoryId: string): Promise<CategoryProgress | null> {
    const progress = await this.userProgressRepository.findOne({
      where: { userId, categoryId },
    });
    
    if (!progress) {
      return null;
    }
    
    const categoryInfo = CATEGORY_INFO[categoryId as keyof typeof CATEGORY_INFO];
    
    return {
      categoryId,
      categoryName: categoryInfo.name,
      categoryIcon: categoryInfo.icon,
      totalPoints: progress.totalPoints,
      level: progress.level,
      levelProgress: levelProgress(progress.totalPoints),
      pointsToNextLevel: pointsToNextLevel(progress.totalPoints),
      stats: progress.stats,
    };
  }
  
  async getLeaderboard(
    options?: {
      categoryId?: string;
      timeFrame?: 'all' | 'month' | 'week';
      limit?: number;
    }
  ): Promise<Array<{ user: User; score: number; rank: number }>> {
    const limit = options?.limit || 10;
    
    if (options?.categoryId) {
      // Category-specific leaderboard
      const results = await this.userProgressRepository
        .createQueryBuilder('progress')
        .leftJoinAndSelect('progress.user', 'user')
        .where('progress.categoryId = :categoryId', { categoryId: options.categoryId })
        .orderBy('progress.totalPoints', 'DESC')
        .limit(limit)
        .getMany();
      
      return results.map((result, index) => ({
        user: result.user,
        score: result.totalPoints,
        rank: index + 1,
      }));
    } else {
      // Overall leaderboard
      const results = await this.userProgressRepository
        .createQueryBuilder('progress')
        .select('progress.userId', 'userId')
        .addSelect('SUM(progress.totalPoints)', 'totalScore')
        .groupBy('progress.userId')
        .orderBy('totalScore', 'DESC')
        .limit(limit)
        .getRawMany();
      
      // Get user details
      const leaderboard = await Promise.all(
        results.map(async (result, index) => {
          const user = await this.userRepository.findOne({
            where: { id: result.userId },
          });
          
          return {
            user: user!,
            score: parseInt(result.totalScore),
            rank: index + 1,
          };
        })
      );
      
      return leaderboard;
    }
  }
  
  private async calculateAchievements(
    userId: string,
    progressEntries: UserProgress[],
    totalScore: number
  ): Promise<Achievement[]> {
    const achievements: Achievement[] = [];
    const userAchievements = new Set<string>();
    
    // Level achievements
    const overallLevel = calculateLevel(totalScore);
    if (overallLevel >= 5) {
      achievements.push({
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reached level 5',
        icon: '⭐',
        unlockedAt: new Date(),
      });
    }
    
    if (overallLevel >= 10) {
      achievements.push({
        id: 'level_10',
        name: 'SuperHuman',
        description: 'Reached the maximum level',
        icon: '🏆',
        unlockedAt: new Date(),
      });
    }
    
    // Streak achievements
    const maxStreak = Math.max(...progressEntries.map(p => p.stats.bestStreak || 0));
    if (maxStreak >= 7) {
      achievements.push({
        id: 'streak_7',
        name: 'Week Warrior',
        description: '7 day streak',
        icon: '🔥',
        unlockedAt: new Date(),
      });
    }
    
    if (maxStreak >= 30) {
      achievements.push({
        id: 'streak_30',
        name: 'Consistency King',
        description: '30 day streak',
        icon: '👑',
        unlockedAt: new Date(),
      });
    }
    
    // Category achievements
    const categoriesWithProgress = progressEntries.filter(p => p.totalPoints > 0).length;
    if (categoriesWithProgress >= 4) {
      achievements.push({
        id: 'well_rounded',
        name: 'Well Rounded',
        description: 'Progress in 4+ categories',
        icon: '🎯',
        unlockedAt: new Date(),
      });
    }
    
    if (categoriesWithProgress === Object.keys(CATEGORIES).length) {
      achievements.push({
        id: 'jack_of_all_trades',
        name: 'Jack of All Trades',
        description: 'Progress in all categories',
        icon: '🌟',
        unlockedAt: new Date(),
      });
    }
    
    // Activity count achievements
    const totalActivities = progressEntries.reduce((sum, p) => sum + (p.stats.totalActivities || 0), 0);
    if (totalActivities >= 100) {
      achievements.push({
        id: 'century',
        name: 'Century',
        description: 'Completed 100 activities',
        icon: '💯',
        unlockedAt: new Date(),
      });
    }
    
    return achievements;
  }
}
