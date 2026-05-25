import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(ownerId: string) {
    const user = await this.prisma.user.findUnique({ where: { supabaseId: ownerId } });
    if (!user) return [];

    return this.prisma.project.findMany({
      where: { ownerId: user.id },
      include: {
        _count: {
          select: { nodes: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(data: { name: string; vision?: string; ownerId: string }) {
    // Ensure user exists (in a real app, this would be handled by auth)
    await this.prisma.user.upsert({
      where: { supabaseId: data.ownerId },
      update: {},
      create: { 
        supabaseId: data.ownerId,
        email: 'founder@mindops.ai' // Placeholder
      },
    });

    const user = await this.prisma.user.findUnique({ where: { supabaseId: data.ownerId } });
    if (!user) throw new Error('User creation/lookup failed');

    return this.prisma.project.create({
      data: {
        name: data.name,
        vision: data.vision,
        ownerId: user.id,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: { name?: string; vision?: string }) {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
