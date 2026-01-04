import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RadioShow } from '../radio-show.entity';
import { User } from '../user.entity';

@Injectable()
export class RadioService {
  private readonly logger = new Logger(RadioService.name);

  constructor(
    @InjectRepository(RadioShow)
    private radioShowRepo: Repository<RadioShow>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createDailyShow(userId: string): Promise<RadioShow> {
    this.logger.log(`Creating daily show for user ${userId}`);
    
    // TODO: 
    // 1. Fetch user contents (Content entity)
    // 2. Fetch external news/weather via integration
    // 3. Call AI LLM to generate script
    // 4. Call TTS to generate audio
    // 5. Save to DB

    const show = this.radioShowRepo.create({
      title: `Daily Mix - ${new Date().toLocaleDateString()}`,
      script: "Welcome to your AI Radio. Today we have some great updates for you...",
      audioUrl: "https://example.com/placeholder-audio.mp3",
      playlist: [
        { type: 'song', source: 'spotify', id: 'spotify:track:123' },
        { type: 'talk', source: 'tts', text: 'Now moving on to tech news.' }
      ],
      user: { id: userId } as User
    });

    return this.radioShowRepo.save(show);
  }

  async getShows(userId: string): Promise<RadioShow[]> {
    return this.radioShowRepo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }
}
