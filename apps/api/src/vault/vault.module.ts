import { Module } from '@nestjs/common';
import { VaultService } from './vault.service';
import { VaultController } from './vault.controller';
import { AuthModule } from '../auth';
import { CommonModule } from '../common';

@Module({
  imports: [AuthModule, CommonModule],
  controllers: [VaultController],
  providers: [VaultService],
  exports: [VaultService],
})
export class VaultModule {}
