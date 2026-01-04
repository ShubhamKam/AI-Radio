import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RadioShow } from './radio-show.entity';
import { Content } from './content.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ nullable: true })
  spotifyRefreshToken: string;

  @Column({ nullable: true })
  googleRefreshToken: string;

  @OneToMany(() => Content, (content) => content.user)
  contents: Content[];

  @OneToMany(() => RadioShow, (show) => show.user)
  shows: RadioShow[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
