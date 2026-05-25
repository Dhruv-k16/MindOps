import { Module } from '@nestjs/common';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { AIModule } from '../ai';
import { AuthModule } from '../auth';
import { CommonModule } from '../common';

@Module({
  imports: [AIModule, AuthModule, CommonModule],
  controllers: [JournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}
