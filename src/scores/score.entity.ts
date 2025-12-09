import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from '../users/user.entity';
  
  @Entity()
  export class Score {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    playerName: string;
  
    @Column('int')
    score: number;
  
    @ManyToOne(() => User, (user) => user.scores, { eager: true })
    user: User;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  