// Mock resolvers for testing without database

// In-memory storage
const mockActivities: any[] = [];
const mockProgress: any[] = [];
let mockActivityId = 1;

export const mockResolvers = {
  Query: {
    me: () => ({
      id: 'mock-user-123',
      email: 'test@superhuman.no',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        onboardingCompleted: false,
      },
      activities: [],
      progress: [],
    }),
    
    categories: () => [
      { 
        id: 'physical', 
        name: 'Fysisk Helse', 
        icon: '💪', 
        color: '#FF6B6B',
        description: 'Forbedre din fysiske form, styrke og utholdenhet'
      },
      { 
        id: 'mental', 
        name: 'Mental Styrke', 
        icon: '🧠', 
        color: '#4ECDC4',
        description: 'Utvikle mental klarhet, fokus og emosjonell balanse'
      },
      { 
        id: 'career', 
        name: 'Karriere', 
        icon: '💼', 
        color: '#45B7D1',
        description: 'Bygg ferdigheter og oppnå profesjonelle mål'
      },
      { 
        id: 'social', 
        name: 'Sosiale Ferdigheter', 
        icon: '👥', 
        color: '#96CEB4',
        description: 'Styrk relasjoner og kommunikasjonsevner'
      },
    ],
    
    myActivities: () => mockActivities,
    myProgress: () => mockProgress,
    
    categoryProgress: () => ({
      id: '1',
      userId: 'mock-user-123',
      categoryId: 'physical',
      totalPoints: 250,
      level: 3,
      updatedAt: new Date().toISOString(),
      stats: {
        streakDays: 5,
        bestStreak: 12,
        totalActivities: 15,
        totalDuration: 450,
        weeklyGoal: 50,
        monthlyProgress: 0.75,
        achievements: ['First Step', '7 Day Streak'],
      },
    }),
    
    aiRecommendations: () => [
      {
        id: '1',
        icon: '💪',
        title: 'Tid for fysisk aktivitet',
        description: 'Start dagen med en kort gåtur eller hjemmetrening!',
        priority: 1,
        category: 'physical',
      },
      {
        id: '2',
        icon: '🧠',
        title: 'Tren hjernen din',
        description: 'Mental trening er like viktig som fysisk. Prøv meditasjon eller les en bok.',
        priority: 2,
        category: 'mental',
      },
    ],
    
    dailyGoals: () => [
      {
        id: '1',
        icon: '🎯',
        task: 'Fullfør minst én aktivitet i hver kategori',
        reward: '+50 bonus poeng',
        progress: 0,
        completed: false,
      },
      {
        id: '2',
        icon: '🔥',
        task: 'Oppretthold din streak',
        reward: '+25 streak poeng',
        progress: 0,
        completed: false,
      },
    ],
    
    leaderboard: () => [
      {
        userId: '1',
        userName: 'Alexander',
        totalPoints: 850,
        level: 9,
        rank: 1,
      },
      {
        userId: '2',
        userName: 'Emma',
        totalPoints: 720,
        level: 8,
        rank: 2,
      },
      {
        userId: '3',
        userName: 'Lars',
        totalPoints: 650,
        level: 7,
        rank: 3,
      },
    ],
    
    myFriends: () => [
      {
        id: 'friend-1',
        email: 'emma@test.com',
        name: 'Emma',
        totalScore: 850,
        level: 9,
        lastActive: new Date().toISOString()
      },
      {
        id: 'friend-2',
        email: 'lars@test.com',
        name: 'Lars',
        totalScore: 650,
        level: 7,
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    
    activeChallenges: () => [
      {
        id: '1',
        title: '7-dagers Treningsutfordring',
        description: 'Tren hver dag i en uke',
        icon: '🏋️',
        categoryId: 'physical',
        targetValue: 7,
        targetType: 'days',
        reward: 100,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        currentValue: 2,
        progress: 0.3,
        daysRemaining: 5,
        participants: [],
      },
    ],
    
    recentSocialActivities: () => [
      {
        id: '1',
        userId: '2',
        userName: 'Emma',
        userAvatar: null,
        type: 'activity_completed',
        icon: '💪',
        message: 'Emma fullførte Morgenjogg 5km',
        category: 'physical',
        categoryColor: '#FF6B6B',
        points: 25,
        timestamp: new Date().toISOString(),
      },
    ],
    
    friendsLeaderboard: () => [
      {
        userId: 'mock-user-123',
        userName: 'Test User',
        totalPoints: 250,
        level: 3,
        rank: 2,
      },
      {
        userId: 'friend-1',
        userName: 'Emma',
        totalPoints: 850,
        level: 9,
        rank: 1,
      },
      {
        userId: 'friend-2',
        userName: 'Lars',
        totalPoints: 650,
        level: 7,
        rank: 3,
      },
    ],
    
    pendingFriendRequests: () => [],
    
    myReferralCode: () => 'SHMOCKUSER',
  },
  
  Mutation: {
    register: (_: any, args: any) => ({
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 'mock-user-' + Date.now(),
        email: args.email,
        name: args.name || 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          onboardingCompleted: false,
        },
      },
    }),
    
    login: (_: any, args: any) => ({
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 'mock-user-123',
        email: args.email,
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          onboardingCompleted: false,
        },
      },
    }),
    
    saveActivity: (_: any, args: any) => {
      const activity = {
        id: String(mockActivityId++),
        userId: 'mock-user-123',
        categoryId: args.categoryId,
        name: args.name,
        duration: args.duration || 0,
        points: args.points,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      mockActivities.push(activity);
      
      // Update progress
      let progress = mockProgress.find(p => p.categoryId === args.categoryId);
      if (!progress) {
        progress = {
          id: String(mockProgress.length + 1),
          userId: 'mock-user-123',
          categoryId: args.categoryId,
          totalPoints: 0,
          level: 1,
          updatedAt: new Date().toISOString(),
          stats: {
            streakDays: 0,
            bestStreak: 0,
            totalActivities: 0,
            totalDuration: 0,
            weeklyGoal: 50,
            monthlyProgress: 0,
            achievements: [],
          },
        };
        mockProgress.push(progress);
      }
      
      progress.totalPoints += args.points;
      progress.level = Math.floor(progress.totalPoints / 100) + 1;
      progress.stats.totalActivities += 1;
      progress.stats.totalDuration += args.duration || 0;
      progress.updatedAt = new Date().toISOString();
      
      return activity;
    },
    
    sendAIMessage: async (_: any, args: any) => {
      const { message } = args;
      
      // Try to use real AI service even in mock mode
      try {
        const { AIService } = await import('../services/aiService');
        const aiService = new AIService();
        const response = await aiService.generateResponse(message, null, null);
        
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          suggestions: response.suggestions || ['Gi meg dagens tips', 'Analyser fremgang', 'Sett nye mål'],
        };
      } catch (error) {
        console.error('AI Service error in mock mode:', error);
        
        // Fallback to varying mock responses
        const responses = [
          {
            content: 'Flott spørsmål! La meg tenke på det... Basert på din profil, anbefaler jeg at du starter med små, oppnåelige mål. Hva ønsker du å fokusere på først - fysisk helse, mental styrke, eller kanskje karriereutvikling?',
            suggestions: ['Jeg vil fokusere på fysisk helse', 'Mental styrke er viktigst for meg', 'Hjelp meg med karrieremål']
          },
          {
            content: 'Jeg ser at du er motivert for endring! Det er fantastisk. Husker du at lasting forandring starter med små daglige vaner? La oss lage en plan sammen som passer din livsstil.',
            suggestions: ['Lag en morgenrutine for meg', 'Hvordan bygger jeg gode vaner?', 'Gi meg en ukeplan']
          },
          {
            content: 'Takk for at du deler dette med meg. Jeg forstår at det kan være utfordrende. Min erfaring tilsier at de beste resultatene kommer når vi fokuserer på én ting om gangen. Hva føles mest presserende for deg akkurat nå?',
            suggestions: ['Jeg sliter med motivasjon', 'Jeg trenger bedre struktur', 'Hvordan måler jeg fremgang?']
          },
          {
            content: 'Interessant perspektiv! Visste du at forskning viser at mennesker som tracker sin fremgang har 2x større sjanse for å nå målene sine? La meg hjelpe deg sette opp et system som fungerer for deg.',
            suggestions: ['Hvordan tracker jeg best?', 'Hvilke metrics er viktige?', 'Vis meg eksempler']
          },
          {
            content: 'Du stiller de riktige spørsmålene! Dette viser at du er klar for vekst. Basert på hva du forteller meg, tror jeg vi kan lage en skreddersydd tilnærming som passer perfekt for deg. Skal vi starte med å kartlegge dine styrker?',
            suggestions: ['Ja, la oss kartlegge mine styrker', 'Hva er mine svakheter?', 'Hvordan finner jeg balanse?']
          }
        ];
        
        // Use message hash to get consistent but varied responses
        const hash = message.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const responseIndex = hash % responses.length;
        const response = responses[responseIndex];
        
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          suggestions: response.suggestions,
        };
      }
    },
    
    sendFriendRequest: (_: any, { email }: any) => {
      console.log('Mock: Friend request sent to', email);
      return {
        success: true,
        message: `Venneforespørsel sendt til ${email}!`
      };
    },

    acceptFriendRequest: (_: any, { requestId }: any) => {
      console.log('Mock: Accepted friend request', requestId);
      return {
        success: true,
        message: 'Venneforespørsel godtatt!'
      };
    },

    declineFriendRequest: (_: any, { requestId }: any) => {
      console.log('Mock: Declined friend request', requestId);
      return {
        success: true,
        message: 'Venneforespørsel avvist'
      };
    },

    removeFriend: (_: any, { friendId }: any) => {
      console.log('Mock: Removed friend', friendId);
      return {
        success: true,
        message: 'Venn fjernet'
      };
    },

    joinChallenge: (_: any, { challengeId }: any) => {
      console.log('Mock: Joined challenge', challengeId);
      return {
        success: true,
        message: 'Du har blitt med i utfordringen!'
      };
    },

    leaveChallenge: (_: any, { challengeId }: any) => {
      console.log('Mock: Left challenge', challengeId);
      return {
        success: true,
        message: 'Du har forlatt utfordringen'
      };
    },

    applyReferralCode: (_: any, { code }: any) => {
      console.log('Mock: Applied referral code', code);
      if (code.startsWith('SH')) {
        return {
          success: true,
          message: 'Referral kode aktivert! Du får 30 dager gratis Elite.'
        };
      }
      return {
        success: false,
        message: 'Ugyldig referral kode'
      };
    },
  },
  
  // Type resolvers
  User: {},
  UserMetadata: {},
  ProgressStats: {},
};
