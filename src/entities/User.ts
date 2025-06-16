import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Activity } from './Activity';
import { UserProgress } from './UserProgress';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    mainGoal?: string;
    focusAreas?: string[];
    dailyTime?: string;
    onboardingCompleted?: boolean;
    avatar?: string;
  };

  // Relations
  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];

  @OneToMany(() => UserProgress, (progress) => progress.user)
  progress: UserProgress[];
}