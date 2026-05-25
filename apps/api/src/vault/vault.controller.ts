import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { VaultService } from './vault.service';
import { SupabaseGuard } from '../auth/guards/supabase.guard';

@Controller('vault')
@UseGuards(SupabaseGuard)
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('nodes/:nodeId/assets')
  async getAssets(@Param('nodeId') nodeId: string) {
    return this.vaultService.getAssets(nodeId);
  }

  @Post('nodes/:nodeId/assets')
  async linkAsset(
    @Param('nodeId') nodeId: string,
    @Body() data: { name: string, url: string, type: string }
  ) {
    return this.vaultService.linkAsset(nodeId, data);
  }

  @Delete('assets/:id')
  async deleteAsset(@Param('id') id: string) {
    return this.vaultService.deleteAsset(id);
  }
}
