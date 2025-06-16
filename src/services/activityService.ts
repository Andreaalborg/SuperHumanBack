import { AppDataSource } from '../config/database';
import { Activity } from '../entities/Activity';
import { UserProgress } from '../entities/UserProgress';
import { validateInput, isValidCategory, isValidActivityDuration } from '../utils/validators';
import { calculateLevel, calculateStreak } from '../utils/helpers';

interface SaveActivityInput {
  categoryId: string;
  name: string;
  duration?: number;
  points: number;
  completedAt?: Date;
  data?: Record<string, any>;
}

interface ActivityStats {
  totalActivities: number;
  totalPoints: number;
  totalDuration: number;
  averagePoints: number;
  streakDays: number;
}

export class ActivityService {
  private activityRepository = AppDataSource.getRepository(Activity);
  private userProgressRepository = AppDataSource.getRepository(UserProgress);
  
  async saveActivity(userId: string, input: SaveActivityInput): Promise<Activity> {
    const { categoryId, name, duration, points, completedAt, data } = input;
    
    // Validate input
    validateInput([
      { condition: isValidCategory(categoryId), field: 'categoryId', message: 'Invalid category' },
      { condition: name.length > 0 && name.length <= 255, field: 'name', message: 'Activity name is required and must be less than 255 characters' },
      { condition: !duration || isValidActivityDuration(duration), field: 'duration', message: 'Invalid activity duration' },
      { condition: points >= 0 && points <= 1000, field: 'points', message: 'Points must be between 0 and 1000' },
    ]);
    
    // Create activity
    const activity = this.activityRepository.create({
      userId,
      categoryId,
      name: name.trim(),
      duration: duration || undefined,
      points,
      completedAt: completedAt || new Date(),
      data: data || {},
    });
    
    // Save activity
    const savedActivity = await this.activityRepository.save(activity);
    
    // Update user progress
    await this.updateUserProgress(userId, categoryId, points, duration || 0);
    
    return savedActivity;
  }
  
  async getUserActivities(
    userId: string,
    options?: {
      categoryId?: string;
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ activities: Activity[]; total: number }> {
    const query = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.userId = :userId', { userId });
    
    // Apply filters
    if (options?.categoryId) {
      query.andWhere('activity.categoryId = :categoryId', { categoryId: options.categoryId });
    }
    
    if (options?.startDate) {
      query.andWhere('activity.completedAt >= :startDate', { startDate: options.startDate });
    }
    
    if (options?.endDate) {
      query.andWhere('activity.completedAt <= :endDate', { endDate: options.endDate });
    }
    
    // Get total count
    const total = await query.getCount();
    
    // Apply pagination
    query.orderBy('activity.completedAt', 'DESC');
    
    if (options?.limit) {
      query.limit(options.limit);
    }
    
    if (options?.offset) {
      query.offset(options.offset);
    }
    
    const activities = await query.getMany();
    
    return { activities, total };
  }
  
  async getActivityById(userId: string, activityId: string): Promise<Activity | null> {
    return await this.activityRepository.findOne({
      where: { id: activityId, userId },
    });
  }
  
  async updateActivity(
    userId: string,
    activityId: string,
    updates: Partial<SaveActivityInput>
  ): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId, userId },
    });
    
    if (!activity) {
      throw new Error('Activity not found');
    }
    
    // Store old values
    const oldPoints = activity.points;
    const oldDuration = activity.duration || 0;
    const oldCategory = activity.categoryId;
    
    // Update activity
    Object.assign(activity, updates);
    
    // Validate updated activity
    validateInput([
      { condition: isValidCategory(activity.categoryId), field: 'categoryId', message: 'Invalid category' },
      { condition: activity.name.length > 0 && activity.name.length <= 255, field: 'name', message: 'Activity name is required' },
      { condition: !activity.duration || isValidActivityDuration(activity.duration), field: 'duration', message: 'Invalid activity duration' },
      { condition: activity.points >= 0 && activity.points <= 1000, field: 'points', message: 'Points must be between 0 and 1000' },
    ]);
    
    const updatedActivity = await this.activityRepository.save(activity);
    
    // Update progress if points or category changed
    if (oldPoints !== activity.points || oldCategory !== activity.categoryId) {
      // Remove old points
      await this.updateUserProgress(userId, oldCategory, -oldPoints, -oldDuration);
      // Add new points
      await this.updateUserProgress(userId, activity.categoryId, activity.points, activity.duration || 0);
    }
    
    return updatedActivity;
  }
  
  async deleteActivity(userId: string, activityId: string): Promise<boolean> {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId, userId },
    });
    
    if (!activity) {
      throw new Error('Activity not found');
    }
    
    // Update progress before deletion
    await this.updateUserProgress(
      userId,
      activity.categoryId,
      -activity.points,
      -(activity.duration || 0)
    );
    
    // Delete activity
    await this.activityRepository.remove(activity);
    
    return true;
  }
  
  async getActivityStats(userId: string, categoryId?: string): Promise<ActivityStats> {
    const query = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.userId = :userId', { userId });
    
    if (categoryId) {
      query.andWhere('activity.categoryId = :categoryId', { categoryId });
    }
    
    // Get all activities for streak calculation
    const activities = await query
      .orderBy('activity.completedAt', 'DESC')
      .getMany();
    
    // Calculate stats
    const totalActivities = activities.length;
    const totalPoints = activities.reduce((sum, act) => sum + act.points, 0);
    const totalDuration = activities.reduce((sum, act) => sum + (act.duration || 0), 0);
    const averagePoints = totalActivities > 0 ? Math.round(totalPoints / totalActivities) : 0;
    const streakDays = calculateStreak(activities);
    
    return {
      totalActivities,
      totalPoints,
      totalDuration,
      averagePoints,
      streakDays,
    };
  }
  
  private async updateUserProgress(
    userId: string,
    categoryId: string,
    pointsDelta: number,
    durationDelta: number
  ): Promise<void> {
    // Find or create progress entry
    let progress = await this.userProgressRepository.findOne({
      where: { userId, categoryId },
    });
    
    if (!progress) {
      progress = this.userProgressRepository.create({
        userId,
        categoryId,
        totalPoints: 0,
        level: 1,
        stats: {
          streakDays: 0,
          bestStreak: 0,
          totalActivities: 0,
          totalDuration: 0,
        },
      });
    }
    
    // Update points and stats
    progress.totalPoints = Math.max(0, progress.totalPoints + pointsDelta);
    progress.level = calculateLevel(progress.totalPoints);
    
    progress.stats.totalActivities = Math.max(0, (progress.stats.totalActivities || 0) + (pointsDelta > 0 ? 1 : -1));
    progress.stats.totalDuration = Math.max(0, (progress.stats.totalDuration || 0) + durationDelta);
    
    // Recalculate streak if adding activity
    if (pointsDelta > 0) {
      const activities = await this.activityRepository.find({
        where: { userId, categoryId },
        order: { completedAt: 'DESC' },
      });
      
      const streak = calculateStreak(activities);
      progress.stats.streakDays = streak;
      progress.stats.bestStreak = Math.max(progress.stats.bestStreak || 0, streak);
    }
    
    await this.userProgressRepository.save(progress);
  }
}
