import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './User';

@Entity('user_progress')
@Unique(['userId', 'categoryId']) // En bruker kan bare ha én progress per kategori
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.progress)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'category_id', length: 50 })
  categoryId: string;

  @Column({ name: 'total_points', type: 'int', default: 0 })
  totalPoints: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Rom for mer data senere!
  @Column({ type: 'jsonb', default: {} })
  stats: {
    streakDays?: number;
    bestStreak?: number;
    totalActivities?: number;
    totalDuration?: number;
    weeklyGoal?: number;
    monthlyProgress?: number;
    achievements?: string[];
    milestones?: Array<{
      date: string;
      type: string;
      value: number;
    }>;
    [key: string]: any; // Tillater alle fremtidige felter
  };
}
