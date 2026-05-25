import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JournalService } from './journal.service';
import { SupabaseGuard } from '../auth/guards/supabase.guard';

@Controller('journal')
@UseGuards(SupabaseGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  async getEntries(@Req() req: any) {
    const ownerId = req.user.sub || req.user.id; // Map from Supabase context
    // Fetch user from DB first or use internal DB ID
    return this.journalService.getEntries(ownerId);
  }

  @Post()
  async createEntry(@Req() req: any, @Body('content') content: string) {
    const ownerId = req.user.sub || req.user.id;
    return this.journalService.createEntry(ownerId, content);
  }
}
