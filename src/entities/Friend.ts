import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column('uuid')
  friendId!: string;

  @Column({ default: 'pending' })
  status!: string; // 'pending', 'accepted', 'blocked'

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'friendId' })
  friend!: User;

  @CreateDateColumn()
  createdAt!: Date;
}