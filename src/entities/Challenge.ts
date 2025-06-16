import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column()
  icon!: string;

  @Column()
  categoryId!: string;

  @Column()
  targetValue!: number;

  @Column({ default: 'points' })
  targetType!: string; // 'points', 'activities', 'minutes', etc.

  @Column()
  reward!: number;

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isPublic!: boolean;

  @Column('uuid')
  createdBy!: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'challenge_participants',
    joinColumn: { name: 'challengeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
  })
  participants!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}