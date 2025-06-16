import { LEVEL_THRESHOLDS } from '../config/constants';

// Calculate level from total points
export const calculateLevel = (totalPoints: number): number => {
  let level = 1;
  for (const [lvl, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
    if (totalPoints >= threshold) {
      level = parseInt(lvl);
    } else {
      break;
    }
  }
  return level;
};

// Calculate points needed for next level
export const pointsToNextLevel = (totalPoints: number): number => {
  const currentLevel = calculateLevel(totalPoints);
  if (currentLevel >= 10) return 0; // Max level
  
  const nextLevel = currentLevel + 1;
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel as keyof typeof LEVEL_THRESHOLDS];
  return nextThreshold - totalPoints;
};

// Calculate level progress percentage
export const levelProgress = (totalPoints: number): number => {
  const currentLevel = calculateLevel(totalPoints);
  if (currentLevel >= 10) return 100; // Max level
  
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel as keyof typeof LEVEL_THRESHOLDS];
  const nextThreshold = LEVEL_THRESHOLDS[(currentLevel + 1) as keyof typeof LEVEL_THRESHOLDS];
  
  const progressInLevel = totalPoints - currentThreshold;
  const totalPointsInLevel = nextThreshold - currentThreshold;
  
  return Math.round((progressInLevel / totalPointsInLevel) * 100);
};

// Format date for consistency
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Calculate streak
export const calculateStreak = (activities: Array<{ completedAt: Date }>): number => {
  if (activities.length === 0) return 0;
  
  // Sort activities by date
  const sortedActivities = [...activities].sort((a, b) => 
    b.completedAt.getTime() - a.completedAt.getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const activity of sortedActivities) {
    const activityDate = new Date(activity.completedAt);
    activityDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === streak) {
      streak++;
    } else if (dayDiff > streak) {
      break;
    }
  }
  
  return streak;
};

// Generate random achievement messages
export const getAchievementMessage = (type: string, value: number): string => {
  const messages = {
    streak: [
      `🔥 ${value} dagers streak! Keep it up!`,
      `💪 ${value} dager på rad! Du er ustoppelig!`,
      `⚡ Streak: ${value} dager! Fantastisk konsistens!`,
    ],
    level: [
      `🎉 Level ${value} oppnådd! Gratulerer!`,
      `🚀 Du har nådd level ${value}! Fortsett sånn!`,
      `⭐ Nytt level: ${value}! Du blir bedre hver dag!`,
    ],
    milestone: [
      `🏆 Milepæl oppnådd: ${value} poeng!`,
      `🎯 ${value} poeng totalt! Imponerende!`,
      `✨ Du har samlet ${value} poeng! Fantastisk innsats!`,
    ],
  };
  
  const messageList = messages[type as keyof typeof messages] || [`${type}: ${value}`];
  return messageList[Math.floor(Math.random() * messageList.length)];
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Parse duration string to minutes
export const parseDuration = (duration: string): number => {
  const match = duration.match(/(\d+)([hm])/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  return unit === 'h' ? value * 60 : value;
};

// Format duration from minutes
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};
