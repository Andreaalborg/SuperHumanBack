import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar Date
  scalar JSON

  # User type
  type User {
    id: ID!
    email: String!
    name: String
    createdAt: Date!
    updatedAt: Date!
    metadata: UserMetadata
    activities: [Activity!]
    progress: [UserProgress!]
  }

  type UserMetadata {
    age: Int
    gender: String
    height: Float
    weight: Float
    mainGoal: String
    focusAreas: [String!]
    dailyTime: String
    onboardingCompleted: Boolean
    avatar: String
  }

  # Activity type
  type Activity {
    id: ID!
    userId: ID!
    categoryId: String!
    name: String!
    duration: Int
    points: Int!
    completedAt: Date!
    createdAt: Date!
    data: JSON
  }

  # Progress type
  type UserProgress {
    id: ID!
    userId: ID!
    categoryId: String!
    totalPoints: Int!
    level: Int!
    updatedAt: Date!
    stats: ProgressStats
  }

  type ProgressStats {
    streakDays: Int
    bestStreak: Int
    totalActivities: Int
    totalDuration: Int
    weeklyGoal: Int
    monthlyProgress: Float
    achievements: [String!]
  }

  # Auth payload
  type AuthPayload {
    token: String!
    user: User!
  }

  # Category info
  type Category {
    id: String!
    name: String!
    icon: String!
    color: String!
    description: String!
  }

  # Leaderboard entry
  type LeaderboardEntry {
    userId: ID!
    userName: String!
    totalPoints: Int!
    level: Int!
    rank: Int!
  }

  # Success response
  type SuccessResponse {
    success: Boolean!
    message: String
  }

  # AI Recommendation
  type AIRecommendation {
    id: ID!
    icon: String!
    title: String!
    description: String!
    priority: Int
    category: String
  }

  # Daily Goal
  type DailyGoal {
    id: ID!
    icon: String!
    task: String!
    reward: String!
    progress: Float
    completed: Boolean!
  }

  # Friend type
  type Friend {
    id: ID!
    email: String!
    name: String
    totalScore: Int!
    level: Int!
    lastActive: Date
    metadata: UserMetadata
  }

  # Challenge type
  type Challenge {
    id: ID!
    title: String!
    description: String
    icon: String!
    categoryId: String!
    targetValue: Int!
    targetType: String!
    reward: Int!
    startDate: Date!
    endDate: Date!
    currentValue: Int
    progress: Float
    daysRemaining: Int
    participants: [User!]!
  }

  # Social Activity type
  type SocialActivity {
    id: ID!
    userId: ID!
    userName: String!
    userAvatar: String
    type: String!
    icon: String!
    message: String!
    category: String
    categoryColor: String
    points: Int
    timestamp: Date!
  }

  # AI Message type
  type AIMessage {
    id: ID!
    role: String!
    content: String!
    timestamp: Date!
    suggestions: [String!]
  }

  # Queries
  type Query {
    # User
    me: User
    
    # Categories
    categories: [Category!]!
    
    # Activities
    myActivities: [Activity!]!
    
    # Progress
    myProgress: [UserProgress!]!
    categoryProgress(categoryId: String!): UserProgress
    
    # Leaderboard
    leaderboard(categoryId: String, timeFrame: String, limit: Int): [LeaderboardEntry!]!
    
    # AI Features
    aiRecommendations: [AIRecommendation!]!
    dailyGoals: [DailyGoal!]!
    
    # Social Features
    myFriends: [Friend!]!
    activeChallenges: [Challenge!]!
    recentSocialActivities(limit: Int): [SocialActivity!]!
    friendsLeaderboard: [LeaderboardEntry!]!
    pendingFriendRequests: [Friend!]!
    myReferralCode: String!
  }

  # Mutations
  type Mutation {
    # Auth
    register(email: String!, password: String!, name: String): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    
    # User
    updateProfile(input: UpdateProfileInput!): User!
    changePassword(oldPassword: String!, newPassword: String!): SuccessResponse!
    deleteAccount(password: String!): SuccessResponse!
    
    # Activities
    saveActivity(
      categoryId: String!
      name: String!
      duration: Int
      points: Int!
    ): Activity!
    
    updateActivity(
      id: ID!
      name: String
      duration: Int
      points: Int
    ): Activity!
    
    deleteActivity(id: ID!): Boolean!
    
    # Social
    sendFriendRequest(email: String!): SuccessResponse!
    acceptFriendRequest(requestId: ID!): SuccessResponse!
    declineFriendRequest(requestId: ID!): SuccessResponse!
    removeFriend(friendId: ID!): SuccessResponse!
    joinChallenge(challengeId: ID!): SuccessResponse!
    leaveChallenge(challengeId: ID!): SuccessResponse!
    applyReferralCode(code: String!): SuccessResponse!
    
    # AI Coach
    sendAIMessage(message: String!, context: AIContextInput): AIMessage!
  }

  # Input types
  input UpdateProfileInput {
    name: String
    age: Int
    gender: String
    height: Float
    weight: Float
    mainGoal: String
    focusAreas: [String!]
    dailyTime: String
    avatar: String
  }

  input AIContextInput {
    totalScore: Int
    recentActivities: [RecentActivityInput!]
    userGoals: String
    focusAreas: [String!]
  }

  input RecentActivityInput {
    name: String!
    categoryId: String!
    points: Int!
  }
`;
