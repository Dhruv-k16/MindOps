import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { GraphService } from './graph.service';
import { SupabaseGuard } from '../auth/guards/supabase.guard';

@Controller('projects/:projectId/graph')
@UseGuards(SupabaseGuard)
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Get()
  getGraph(@Param('projectId') projectId: string) {
    return this.graphService.getGraph(projectId);
  }

  @Post()
  saveGraph(
    @Param('projectId') projectId: string,
    @Body() data: { nodes: any[], edges: any[] }
  ) {
    return this.graphService.saveGraph(projectId, data);
  }
}
