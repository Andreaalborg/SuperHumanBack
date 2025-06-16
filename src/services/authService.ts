import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { generateToken } from '../middleware/auth';
import { validateInput, isValidEmail, isValidPassword, isValidName } from '../utils/validators';
import { UserProgress } from '../entities/UserProgress';
import { CATEGORIES } from '../config/constants';

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private userProgressRepository = AppDataSource.getRepository(UserProgress);
  
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { email, password, name } = input;
    
    // Validate input
    validateInput([
      { condition: isValidEmail(email), field: 'email', message: 'Invalid email format' },
      { condition: isValidPassword(password), field: 'password', message: `Password must be at least 6 characters` },
      { condition: !name || isValidName(name), field: 'name', message: 'Name is too long' },
    ]);
    
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = this.userRepository.create({
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      name: name || email.split('@')[0], // Default name from email
      metadata: {
        onboardingCompleted: false,
      },
    });
    
    // Save user
    const savedUser = await this.userRepository.save(user);
    
    // Ensure we have a single user, not an array
    const finalUser = Array.isArray(savedUser) ? savedUser[0] : savedUser;
    
    // Initialize progress for all categories
    const progressEntries = Object.values(CATEGORIES).map(categoryId => 
      this.userProgressRepository.create({
        userId: finalUser.id,
        categoryId,
        totalPoints: 0,
        level: 1,
        stats: {
          streakDays: 0,
          bestStreak: 0,
          totalActivities: 0,
          totalDuration: 0,
        },
      })
    );
    
    await this.userProgressRepository.save(progressEntries);
    
    // Generate token
    const token = generateToken(finalUser);
    
    return {
      token,
      user: finalUser,
    };
  }
  
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;
    
    // Validate input
    validateInput([
      { condition: isValidEmail(email), field: 'email', message: 'Invalid email format' },
      { condition: isValidPassword(password), field: 'password', message: 'Invalid password' },
    ]);
    
    // Find user with password
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      select: ['id', 'email', 'name', 'passwordHash', 'metadata', 'createdAt', 'updatedAt'],
    });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Remove password from response
    delete (user as any).passwordHash;
    
    return {
      token,
      user,
    };
  }
  
  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }
  
  async updateProfile(userId: string, updates: Partial<User['metadata']>): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update metadata
    user.metadata = {
      ...user.metadata,
      ...updates,
    };
    
    return await this.userRepository.save(user);
  }
  
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    // Validate new password
    validateInput([
      { condition: isValidPassword(newPassword), field: 'password', message: 'New password must be at least 6 characters' },
    ]);
    
    // Get user with password
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'passwordHash'],
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    
    if (!isOldPasswordValid) {
      throw new Error('Invalid old password');
    }
    
    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    
    return true;
  }
  
  async deleteAccount(userId: string, password: string): Promise<boolean> {
    // Get user with password
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'passwordHash'],
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordCorrect) {
      throw new Error('Invalid password');
    }
    
    // Delete user (cascades to related entities)
    await this.userRepository.remove(user);
    
    return true;
  }
}
