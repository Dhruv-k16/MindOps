import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SnapshotService {
  constructor(private prisma: PrismaService) {}

  async createSnapshot(projectId: string, state: any) {
    return this.prisma.projectSnapshot.create({
      data: {
        projectId,
        state,
      },
    });
  }

  async getSnapshots(projectId: string) {
    return this.prisma.projectSnapshot.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getSnapshot(id: string) {
    return this.prisma.projectSnapshot.findUnique({
      where: { id },
    });
  }
}
