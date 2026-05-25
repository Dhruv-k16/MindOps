import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { ProjectsModule } from './projects';
import { AIModule } from './ai';
import { GraphModule } from './graph';
import { StorageModule } from './storage';
import { CommonModule } from './common';
import { JournalModule } from './journal';
import { FinanceModule } from './finance';
import { SnapshotModule } from './snapshot';
import { VaultModule } from './vault';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule, 
    AuthModule,
    ProjectsModule,
    AIModule,
    GraphModule,
    JournalModule,
    FinanceModule,
    SnapshotModule,
    VaultModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
