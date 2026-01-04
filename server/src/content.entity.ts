import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum ContentType {
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document', // PDF, Docx
  WEB_SEARCH = 'web_search',
  TEXT = 'text',
  YOUTUBE = 'youtube',
  SPOTIFY = 'spotify'
}

@Entity()
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ContentType })
  type: ContentType;

  @Column({ type: 'text', nullable: true })
  sourceUrl: string;

  @Column({ type: 'text', nullable: true })
  rawText: string; // Extracted text

  @Column({ type: 'simple-array', nullable: true })
  embedding: number[]; // For vector search (placeholder)

  @ManyToOne(() => User, (user) => user.contents)
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
