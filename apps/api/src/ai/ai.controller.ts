import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { AIService } from './ai.service';
import { SupabaseGuard } from '../auth/guards/supabase.guard';
import { VectorService } from '../common/vector.service';

@Controller('ai')
@UseGuards(SupabaseGuard)
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly vectorService: VectorService
  ) {}

  @Post('brain-dump')
  async brainDump(@Body('text') text: string) {
    return this.aiService.structureBrainDump(text);
  }

  @Post(':projectId/chat')
  async chat(
    @Param('projectId') projectId: string,
    @Body('message') message: string
  ) {
    // 1. Fetch relevant context via semantic search
    const similarNodes = await this.vectorService.findSimilarNodes(projectId, message);
    const context = similarNodes.map(n => `[${n.type}] ${n.content.label}: ${n.content.content}`).join('\n');

    // 2. Generate AI response
    const response = await this.aiService.chat(message, context);
    
    return { response };
  }
}
