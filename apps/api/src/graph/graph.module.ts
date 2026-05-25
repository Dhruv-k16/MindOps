import { Module } from '@nestjs/common';
import { GraphService } from './graph.service';
import { GraphController } from './graph.controller';
import { AuthModule } from '../auth/auth.module';
import { AIModule } from '../ai/ai.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [AuthModule, AIModule, CommonModule],
  controllers: [GraphController],
  providers: [GraphService],
  exports: [GraphService],
})
export class GraphModule {}
