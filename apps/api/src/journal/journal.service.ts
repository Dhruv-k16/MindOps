import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AIService } from '../ai/ai.service';

@Injectable()
export class JournalService {
  constructor(
    private prisma: PrismaService,
    private ai: AIService
  ) {}

  async createEntry(ownerId: string, content: string) {
    const user = await this.prisma.user.findUnique({ where: { supabaseId: ownerId } });
    if (!user) throw new Error('User not found');

    const prompt = `Analyze the sentiment of this founder's journal entry. 
    Return ONE word from: OPTIMISTIC, STRESSED, REFLECTIVE, TIRED, DETERMINED.
    Entry: "${content}"`;

    let sentiment = 'REFLECTIVE';
    try {
      const response = await this.ai.chat(prompt, '');
      if (response) {
        sentiment = response.trim().toUpperCase().split(' ')[0].replace(/[^A-Z]/g, '');
      }
    } catch (err) {
      console.error('Sentiment analysis failed', err);
    }

    return this.prisma.journalEntry.create({
      data: {
        ownerId: user.id,
        content,
        sentiment,
      },
    });
  }

  async getEntries(ownerId: string) {
    const user = await this.prisma.user.findUnique({ where: { supabaseId: ownerId } });
    if (!user) return [];

    return this.prisma.journalEntry.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
