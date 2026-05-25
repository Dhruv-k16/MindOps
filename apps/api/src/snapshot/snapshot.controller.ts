import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SnapshotService } from './snapshot.service';
import { SupabaseGuard } from '../auth/guards/supabase.guard';

@Controller('snapshots')
@UseGuards(SupabaseGuard)
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @Get('project/:projectId')
  async getSnapshots(@Param('projectId') projectId: string) {
    return this.snapshotService.getSnapshots(projectId);
  }

  @Post('project/:projectId')
  async createSnapshot(
    @Param('projectId') projectId: string,
    @Body('state') state: any
  ) {
    return this.snapshotService.createSnapshot(projectId, state);
  }

  @Get(':id')
  async getSnapshot(@Param('id') id: string) {
    return this.snapshotService.getSnapshot(id);
  }
}
