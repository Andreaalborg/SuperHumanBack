import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.activities)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'category_id', length: 50 })
  categoryId: string;

  @Column()
  name: string;

  @Column({ type: 'int', nullable: true })
  duration: number; // minutes

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ name: 'completed_at', type: 'timestamp' })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Fleksibelt for ekstra data!
  @Column({ type: 'jsonb', default: {} })
  data: {
    distance?: number;
    calories?: number;
    heartRate?: number;
    notes?: string;
    location?: string;
    weather?: string;
    difficulty?: number;
    [key: string]: any; // Tillater alle fremtidige felter
  };
}
