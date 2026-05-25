import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { VectorService } from './vector.service';
import { AIModule } from '../ai';
import { forwardRef } from '@nestjs/common';

@Global()
@Module({
  imports: [forwardRef(() => AIModule)],
  providers: [PrismaService, VectorService],
  exports: [PrismaService, VectorService],
})
export class CommonModule {}
