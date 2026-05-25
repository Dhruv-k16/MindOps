import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { SupabaseGuard } from '../auth/guards/supabase.guard';

@Controller('projects')
@UseGuards(SupabaseGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.projectsService.findAll(req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() data: { name: string; vision?: string }) {
    return this.projectsService.create({ 
      ...data, 
      ownerId: req.user.id 
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; vision?: string }) {
    return this.projectsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }
}
