import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async createFinanceEntry(projectId: string, data: { type: string, category: string, amount: number, frequency: string }) {
    return this.prisma.financeModel.create({
      data: {
        projectId,
        ...data,
      },
    });
  }

  async getFinanceEntries(projectId: string) {
    return this.prisma.financeModel.findMany({
      where: { projectId },
      orderBy: { date: 'asc' },
    });
  }

  async deleteFinanceEntry(id: string) {
    return this.prisma.financeModel.delete({
      where: { id },
    });
  }
}
