import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RadioShow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  script: string; // The generated script

  @Column({ type: 'text', nullable: true })
  audioUrl: string; // The TTS output

  @Column({ type: 'jsonb', nullable: true })
  playlist: any[]; // List of songs/segments

  @ManyToOne(() => User, (user) => user.shows)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
