import { Context } from '../types';
import { AppDataSource } from '../config/database';
import { Activity } from '../entities/Activity';
import { UserProgress } from '../entities/UserProgress';
import { User } from '../entities/User';
import { aiService } from '../services/aiService';

export const aiResolvers = {
  Query: {
    aiRecommendations: async (_: any, __: any, context: Context) => {
      // Check if user is authenticated
      if (!context.userId) {
        // Return empty array instead of throwing error
        return [];
      }

      try {
        // Get user's recent activities to personalize recommendations
        const recentActivities = await AppDataSource.getRepository(Activity).find({
          where: { userId: context.userId },
          order: { completedAt: 'DESC' },
          take: 10,
        });

        // Get user's progress to identify weak areas
        const progress = await AppDataSource.getRepository(UserProgress).find({
          where: { userId: context.userId },
        });

        // Analyze patterns and generate recommendations
        // For now, return smart static recommendations based on data
        const recommendations = [];

        // Check physical activity
        const physicalActivities = recentActivities.filter(a => a.categoryId === 'physical');
        const daysSincePhysical = physicalActivities.length > 0 
          ? Math.floor((Date.now() - new Date(physicalActivities[0].completedAt).getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        if (daysSincePhysical > 2) {
          recommendations.push({
            id: '1',
            icon: '💪',
            title: 'Tid for fysisk aktivitet',
            description: `Du har ikke logget fysisk aktivitet på ${daysSincePhysical} dager. Prøv en kort gåtur eller hjemmetrening!`,
            priority: 1,
            category: 'physical',
          });
        }

        // Check mental activity
        const mentalActivities = recentActivities.filter(a => a.categoryId === 'mental');
        if (mentalActivities.length === 0 || mentalActivities.length < 3) {
          recommendations.push({
            id: '2',
            icon: '🧠',
            title: 'Tren hjernen din',
            description: 'Mental trening er like viktig som fysisk. Prøv meditasjon, puslespill eller les en bok.',
            priority: 2,
            category: 'mental',
          });
        }

        // Morning routine recommendation
        const morningActivities = recentActivities.filter(a => {
          const hour = new Date(a.completedAt).getHours();
          return hour >= 5 && hour <= 9;
        });

        if (morningActivities.length < 3) {
          recommendations.push({
            id: '3',
            icon: '🌅',
            title: 'Etabler en morgenrutine',
            description: 'Start dagen med meditasjon eller lett trening for økt produktivitet.',
            priority: 3,
            category: 'routine',
          });
        }

        // Balance recommendation
        const categoryCounts = progress.reduce((acc, p) => {
          acc[p.categoryId] = p.totalPoints;
          return acc;
        }, {} as Record<string, number>);

        const minCategory = Object.entries(categoryCounts).sort(([,a], [,b]) => a - b)[0];
        if (minCategory) {
          const [categoryId, points] = minCategory;
          const categoryNames: Record<string, string> = {
            physical: 'Fysisk helse',
            mental: 'Mental styrke',
            career: 'Karriere',
            social: 'Sosiale ferdigheter',
          };
          
          recommendations.push({
            id: '4',
            icon: '⚖️',
            title: `Fokuser på ${categoryNames[categoryId] || categoryId}`,
            description: `Denne kategorien har minst poeng (${points}). Balanse er nøkkelen til suksess!`,
            priority: 2,
            category: categoryId,
          });
        }

        // If no specific recommendations, add generic ones
        if (recommendations.length === 0) {
          recommendations.push(
            {
              id: '5',
              icon: '🎯',
              title: 'Sett nye mål',
              description: 'Du gjør det bra! Kanskje på tide å sette mer ambisiøse mål?',
              priority: 3,
              category: 'general',
            },
            {
              id: '6',
              icon: '🏆',
              title: 'Utfordre en venn',
              description: 'Inviter venner til en ukentlig utfordring for ekstra motivasjon.',
              priority: 3,
              category: 'social',
            }
          );
        }

        return recommendations.slice(0, 3); // Return top 3 recommendations
      } catch (error) {
        console.error('Error generating AI recommendations:', error);
        // Return fallback recommendations
        return [
          {
            id: '1',
            icon: '🎯',
            title: 'Start dagen med en aktivitet',
            description: 'Velg en aktivitet fra en av kategoriene for å komme i gang.',
            priority: 1,
            category: 'general',
          },
          {
            id: '2',
            icon: '💡',
            title: 'Utforsk nye ferdigheter',
            description: 'Prøv noe nytt i dag - læring er nøkkelen til vekst.',
            priority: 2,
            category: 'general',
          },
        ];
      }
    },

    dailyGoals: async (_: any, __: any, context: Context) => {
      // Check if user is authenticated
      if (!context.userId) {
        // Return empty array instead of throwing error
        return [];
      }

      try {
        // Get today's activities
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayActivities = await AppDataSource.getRepository(Activity).find({
          where: { 
            userId: context.userId,
            completedAt: {
              $gte: today,
            } as any,
          },
        });

        // Check which categories have been completed today
        const completedCategories = new Set(todayActivities.map(a => a.categoryId));
        const allCategories = ['physical', 'mental', 'career', 'social'];
        const remainingCategories = allCategories.filter(c => !completedCategories.has(c));

        // Generate daily goals based on progress
        const goals = [];

        // Main daily goal
        if (remainingCategories.length > 0) {
          goals.push({
            id: '1',
            icon: '🎯',
            task: `Fullfør minst én aktivitet i ${remainingCategories.length} gjenstående ${remainingCategories.length === 1 ? 'kategori' : 'kategorier'}`,
            reward: `+${remainingCategories.length * 25} bonus poeng`,
            progress: (4 - remainingCategories.length) / 4,
            completed: false,
          });
        } else {
          goals.push({
            id: '1',
            icon: '🏆',
            task: 'Alle kategorier fullført i dag!',
            reward: '+100 bonus poeng',
            progress: 1,
            completed: true,
          });
        }

        // Streak goal
        const streakDays = await getStreakDays(context.userId);
        goals.push({
          id: '2',
          icon: '🔥',
          task: `Oppretthold din ${streakDays} dagers streak`,
          reward: `+${streakDays * 5} streak poeng`,
          progress: todayActivities.length > 0 ? 1 : 0,
          completed: todayActivities.length > 0,
        });

        // Time-based goal
        const totalMinutesToday = todayActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
        const targetMinutes = 60; // 1 hour daily target
        goals.push({
          id: '3',
          icon: '⏱️',
          task: `Logg minst ${targetMinutes} minutter aktivitet`,
          reward: '+30 bonus poeng',
          progress: Math.min(totalMinutesToday / targetMinutes, 1),
          completed: totalMinutesToday >= targetMinutes,
        });

        return goals;
      } catch (error) {
        console.error('Error generating daily goals:', error);
        // Return fallback goals
        return [
          {
            id: '1',
            icon: '🎯',
            task: 'Fullfør minst én aktivitet i hver kategori',
            reward: '+50 bonus poeng',
            progress: 0,
            completed: false,
          },
        ];
      }
    },
  },

  Mutation: {
    sendAIMessage: async (_: any, args: any, context: Context) => {
      console.log('🔍 AI Message received, userId:', context.userId);
      
      if (!context.userId) {
        console.log('❌ User not authenticated, using mock user');
        // Use mock user for testing
        const mockUser = {
          id: 'mock-user-123',
          name: 'Test User',
          email: 'test@example.com',
          metadata: {}
        } as User;
        
        const response = await aiService.generateResponse(args.message, args.context || {}, mockUser);
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          suggestions: response.suggestions,
        };
      }

      const { message, context: aiContext } = args;

      try {
        // Get user information
        const user = await AppDataSource.getRepository(User).findOne({ where: { id: context.userId } });
        if (!user) {
          throw new Error('User not found');
        }

        // Use the new AI service
        console.log('📨 Calling AI service with message:', message);
        const response = await aiService.generateResponse(message, aiContext, user);
        console.log('📬 AI service responded');

        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          suggestions: response.suggestions,
        };
      } catch (error) {
        console.error('Error in AI chat:', error);
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Beklager, jeg har problemer med å svare akkurat nå. Prøv igjen om litt.',
          timestamp: new Date(),
          suggestions: [],
        };
      }
    },
  },
};

// Legacy functions - kept for reference but replaced by AIService
/*
async function generateAIResponse(
  message: string,
  context: any,
  user: any
): Promise<{ content: string; suggestions: string[] }> {
  const lowerMessage = message.toLowerCase();

  // Analyze message intent
  if (lowerMessage.includes('anbefaling') || lowerMessage.includes('tips') || lowerMessage.includes('forslag')) {
    return await generateRecommendationResponse(context, user);
  }

  if (lowerMessage.includes('fremgang') || lowerMessage.includes('progress') || lowerMessage.includes('analyse')) {
    return await generateProgressAnalysis(context, user);
  }

  if (lowerMessage.includes('mål') || lowerMessage.includes('goal')) {
    return await generateGoalResponse(context, user);
  }

  if (lowerMessage.includes('søvn') || lowerMessage.includes('sleep')) {
    return generateSleepTips();
  }

  if (lowerMessage.includes('stress') || lowerMessage.includes('mental')) {
    return generateStressTips();
  }

  if (lowerMessage.includes('trening') || lowerMessage.includes('fysisk')) {
    return generateExerciseTips(context);
  }

  // Default conversational response
  return generateGeneralResponse(message, context, user);
}

async function generateRecommendationResponse(context: any, user: any) {
  const recommendations = [];
  
  // Check recent activities
  if (!context.recentActivities || context.recentActivities.length === 0) {
    recommendations.push('Start dagen med en kort meditasjon eller pustøvelse');
    recommendations.push('Ta en 15-minutters gåtur for å få blodet i gang');
  }

  // Check balance across categories
  const categoryCounts: Record<string, number> = {};
  context.recentActivities?.forEach((activity: any) => {
    categoryCounts[activity.categoryId] = (categoryCounts[activity.categoryId] || 0) + 1;
  });

  const missingCategories = ['physical', 'mental', 'career', 'social'].filter(
    cat => !categoryCounts[cat] || categoryCounts[cat] < 2
  );

  if (missingCategories.length > 0) {
    const categoryNames: Record<string, string> = {
      physical: 'fysisk aktivitet',
      mental: 'mental trening',
      career: 'karriereutvikling',
      social: 'sosiale aktiviteter',
    };
    
    recommendations.push(
      `Fokuser på ${categoryNames[missingCategories[0]]} - du har vært mindre aktiv her`
    );
  }

  const content = `Basert på din aktivitet og mål, anbefaler jeg:\n\n${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nHusk at små skritt hver dag fører til store resultater!`;

  return {
    content,
    suggestions: [
      'Hva kan jeg gjøre for bedre søvn?',
      'Gi meg en ukesplan',
      'Hvordan kan jeg redusere stress?',
    ],
  };
}

async function generateProgressAnalysis(context: any, user: any) {
  const totalScore = context.totalScore || 0;
  const level = Math.floor(totalScore / 100);
  const recentPoints = context.recentActivities?.reduce((sum: number, a: any) => sum + a.points, 0) || 0;

  let analysis = `Din fremgang ser ${totalScore > 500 ? 'fantastisk' : 'lovende'} ut! 📊\n\n`;
  analysis += `🏆 Total score: ${totalScore} poeng (Level ${level})\n`;
  analysis += `📈 Siste aktiviteter: ${recentPoints} poeng\n`;

  if (totalScore < 100) {
    analysis += '\nDu er i startfasen - fortsett slik, og du vil se rask fremgang!';
  } else if (totalScore < 500) {
    analysis += '\nDu bygger gode vaner. Fokuser på konsistens fremover.';
  } else {
    analysis += '\nImponerende innsats! Du er på vei mot å bli en ekte SuperHuman!';
  }

  return {
    content: analysis,
    suggestions: [
      'Hvilke områder bør jeg forbedre?',
      'Sammenlign meg med andre på mitt nivå',
      'Sett nye mål for meg',
    ],
  };
}

async function generateGoalResponse(context: any, user: any) {
  const userGoal = context.userGoals || user.metadata?.mainGoal || 'personlig vekst';
  const focusAreas = context.focusAreas || [];

  let content = `La oss sette noen konkrete mål basert på ditt hovedmål: "${userGoal}" 🎯\n\n`;
  
  content += 'Forslag til ukentlige mål:\n';
  content += '1. Fysisk: 150 minutter moderat aktivitet\n';
  content += '2. Mental: 10 minutter daglig meditasjon\n';
  content += '3. Karriere: Fullfør ett læringskurs eller les 50 sider fagstoff\n';
  content += '4. Sosialt: Ha minst 3 meningsfulle samtaler\n\n';
  
  content += 'Start med små, oppnåelige mål og øk gradvis!';

  return {
    content,
    suggestions: [
      'Lag en detaljert plan for uken',
      'Hvordan sporer jeg målene mine?',
      'Tilpass målene til min timeplan',
    ],
  };
}

function generateSleepTips() {
  return {
    content: `Her er mine beste tips for bedre søvn 😴:\n\n1. **Konsistent søvnrytme**: Legg deg og stå opp samme tid hver dag\n2. **Kveldrutine**: Start å roe ned 1 time før sengetid\n3. **Unngå skjermer**: Slå av elektronikk 30 min før du legger deg\n4. **Romtemperatur**: Hold soverommet kjølig (16-19°C)\n5. **Ingen koffein**: Unngå kaffe etter kl 14:00\n\nVil du at jeg skal minne deg på kveldrutinen din?`,
    suggestions: [
      'Lag en personlig kveldrutine',
      'Hvorfor er søvn så viktig?',
      'Track søvnkvaliteten min',
    ],
  };
}

function generateStressTips() {
  return {
    content: `Stressmestring er viktig for din totale helse 🧘‍♀️:\n\n1. **Pustøvelser**: 4-7-8 teknikken (pust inn 4, hold 7, pust ut 8)\n2. **Mikro-pauser**: Ta 2-minutters pauser hver time\n3. **Natur**: 20 minutter i naturen reduserer stresshormoner\n4. **Journaling**: Skriv ned 3 ting du er takknemlig for\n5. **Fysisk aktivitet**: Selv 10 min gange hjelper\n\nHvilken teknikk vil du prøve først?`,
    suggestions: [
      'Lær meg pustøvelser',
      'Hvordan identifisere stress-triggere?',
      'Lag en stress-håndteringsplan',
    ],
  };
}

function generateExerciseTips(context: any) {
  const recentPhysical = context.recentActivities?.filter((a: any) => a.categoryId === 'physical') || [];
  
  let content = `La oss optimalisere din fysiske trening 💪:\n\n`;
  
  if (recentPhysical.length === 0) {
    content += 'Jeg ser du ikke har logget fysisk aktivitet nylig. Start enkelt:\n';
    content += '• 10 min morgenstrekning\n';
    content += '• 15 min rask gange\n';
    content += '• 5 burpees x 3 sett\n';
  } else {
    content += 'Basert på din aktivitet, foreslår jeg:\n';
    content += '• Varier mellom styrke og kondisjon\n';
    content += '• Inkluder mobilitetstrening\n';
    content += '• Progressiv overbelastning - øk gradvis\n';
  }
  
  content += '\nHusk: Konsistens > Intensitet!';

  return {
    content,
    suggestions: [
      'Lag en treningsplan for uken',
      'Hvordan unngå skader?',
      'Beste øvelser for hjemmetrening',
    ],
  };
}

function generateGeneralResponse(message: string, context: any, user: any) {
  const name = user.name || 'der';
  
  const responses = [
    {
      content: `Hei ${name}! Det er flott at du tar initiativ til din egen utvikling. Hva kan jeg hjelpe deg med i dag?`,
      suggestions: ['Gi meg dagens anbefalinger', 'Analyser min fremgang', 'Hvordan kan jeg forbedre meg?'],
    },
    {
      content: `Jeg er her for å støtte deg på reisen mot å bli din beste versjon. Fortell meg hva du ønsker å jobbe med!`,
      suggestions: ['Sett nye mål', 'Tips for motivasjon', 'Se min statistikk'],
    },
    {
      content: `Hver dag er en ny mulighet for vekst! Hva skal vi fokusere på i dag?`,
      suggestions: ['Dagens prioriteringer', 'Balansere livet mitt', 'Øke produktiviteten'],
    },
  ];

  // Return a random general response
  return responses[Math.floor(Math.random() * responses.length)];
}

// Helper function to calculate streak days
async function getStreakDays(userId: string): Promise<number> {
  try {
    const activities = await AppDataSource.getRepository(Activity).find({
      where: { userId },
      order: { completedAt: 'DESC' },
      take: 365, // Check last year
    });

    if (activities.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Group activities by date
    const activityDates = new Set(
      activities.map(a => {
        const date = new Date(a.completedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    // Count consecutive days
    while (activityDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}
*/

// Helper function to calculate streak days - still needed
async function getStreakDays(userId: string): Promise<number> {
  try {
    const activities = await AppDataSource.getRepository(Activity).find({
      where: { userId },
      order: { completedAt: 'DESC' },
      take: 365, // Check last year
    });

    if (activities.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Group activities by date
    const activityDates = new Set(
      activities.map(a => {
        const date = new Date(a.completedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    // Count consecutive days
    while (activityDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}