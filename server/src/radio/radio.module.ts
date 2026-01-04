import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RadioService } from './radio.service';
import { RadioController } from './radio.controller';
import { RadioShow } from '../radio-show.entity';
import { User } from '../user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RadioShow, User])],
  controllers: [RadioController],
  providers: [RadioService],
})
export class RadioModule {}
