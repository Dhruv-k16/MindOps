import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class GraphService {
  constructor(private prisma: PrismaService) {}

  async getGraph(projectId: string) {
    const nodes = await this.prisma.node.findMany({ where: { projectId } });
    const edges = await this.prisma.edge.findMany({ where: { projectId } });

    // Map DB nodes to React Flow nodes
    const rfNodes = nodes.map(node => ({
      id: node.id,
      type: 'mindNode',
      position: { x: node.positionX, y: node.positionY },
      data: { 
        label: (node.content as any).label || 'New Node', 
        type: node.type,
        ... (node.content as any)
      }
    }));

    // Map DB edges to React Flow edges
    const rfEdges = edges.map(edge => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      label: edge.content,
    }));

    return { nodes: rfNodes, edges: rfEdges };
  }

  async saveGraph(projectId: string, data: { nodes: any[], edges: any[] }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete existing nodes and edges for this project
      // In a real app, you'd want to sync/upsert to avoid losing data linked to IDs
      await tx.edge.deleteMany({ where: { projectId } });
      await tx.node.deleteMany({ where: { projectId } });

      // 2. Create new nodes
      for (const node of data.nodes) {
        await tx.node.create({
          data: {
            id: node.id.startsWith('node-') ? undefined : node.id, // Use existing ID if it's not a temporary one
            projectId: projectId,
            type: node.data.type || 'IDEA',
            positionX: node.position.x,
            positionY: node.position.y,
            content: { label: node.data.label, ...node.data },
          }
        });
      }

      // 3. Create new edges
      for (const edge of data.edges) {
        await tx.edge.create({
          data: {
            projectId: projectId,
            sourceId: edge.source,
            targetId: edge.target,
            type: 'DEPENDENCY',
            content: edge.label,
          }
        });
      }

      return { success: true };
    });
  }
}
