import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { SupabaseGuard } from '../auth/guards/supabase.guard';

@Controller('finance')
@UseGuards(SupabaseGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get(':projectId')
  async getFinanceEntries(@Param('projectId') projectId: string) {
    return this.financeService.getFinanceEntries(projectId);
  }

  @Post(':projectId')
  async createFinanceEntry(
    @Param('projectId') projectId: string,
    @Body() data: { type: string, category: string, amount: number, frequency: string }
  ) {
    return this.financeService.createFinanceEntry(projectId, data);
  }

  @Delete(':id')
  async deleteFinanceEntry(@Param('id') id: string) {
    return this.financeService.deleteFinanceEntry(id);
  }
}
