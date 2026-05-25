import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AIService } from '../ai/ai.service';

@Injectable()
export class VectorService {
  constructor(
    private prisma: PrismaService,
    private ai: AIService
  ) {}

  async upsertNodeMemory(nodeId: string, content: string) {
    const embedding = await this.ai.generateEmbedding(content);
    
    // We use raw query because pgvector isn't natively supported for vector operations in Prisma Client's high-level API yet
    const embeddingString = `[${embedding.join(',')}]`;
    
    await this.prisma.$executeRaw`
      INSERT INTO "Memory" ("id", "nodeId", "content", "embedding")
      VALUES (${crypto.randomUUID()}, ${nodeId}, ${content}, ${embeddingString}::vector)
      ON CONFLICT ("nodeId") DO UPDATE
      SET "content" = EXCLUDED."content", "embedding" = EXCLUDED."embedding";
    `;
  }

  async findSimilarNodes(projectId: string, query: string, limit = 5) {
    const embedding = await this.ai.generateEmbedding(query);
    const embeddingString = `[${embedding.join(',')}]`;

    // Semantic search using pgvector cosine distance
    const results: any[] = await this.prisma.$queryRaw`
      SELECT n.*, (m.embedding <=> ${embeddingString}::vector) as distance
      FROM "Node" n
      JOIN "Memory" m ON m."nodeId" = n.id
      WHERE n."projectId" = ${projectId}
      ORDER BY distance ASC
      LIMIT ${limit}
    `;

    return results;
  }
}
