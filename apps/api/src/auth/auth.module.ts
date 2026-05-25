import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseGuard } from './guards/supabase.guard';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseGuard],
  exports: [SupabaseGuard],
})
export class AuthModule {}
