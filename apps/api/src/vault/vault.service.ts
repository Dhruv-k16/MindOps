import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class VaultService {
  constructor(private prisma: PrismaService) {}

  async linkAsset(nodeId: string, data: { name: string, url: string, type: string }) {
    return this.prisma.asset.create({
      data: {
        nodeId,
        name: data.name,
        url: data.url,
        type: data.type,
      },
    });
  }

  async getAssets(nodeId: string) {
    return this.prisma.asset.findMany({
      where: { nodeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteAsset(id: string) {
    return this.prisma.asset.delete({
      where: { id },
    });
  }
}
