import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'sk-xxxx') {
      console.warn('⚠️ OPENAI_API_KEY is missing or using placeholder. AI features will run in MOCK mode.');
      this.openai = null as any;
    } else {
      this.openai = new OpenAI({
        apiKey,
      });
    }
  }

  async structureBrainDump(text: string) {
    const prompt = `
      You are an expert startup founder and systems architect.
      Analyze the following brain dump and extract structured business nodes and their relationships.
      
      Nodes must be one of: IDEA, TASK, RISK, REVENUE, INSIGHT, DOCUMENT.
      Edges represent dependencies or pivots.

      Input: "${text}"

      Return ONLY a JSON object with the following structure:
      {
        "nodes": [{ "id": "string", "type": "string", "label": "string", "content": "string" }],
        "edges": [{ "source": "string", "target": "string", "label": "string" }]
      }
    `;

    try {
      if (!this.openai) {
        return {
          nodes: [
            { id: '1', type: 'IDEA', label: 'Mock Idea', content: 'This is a mock node because no API key was provided.' }
          ],
          edges: []
        };
      }
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0].message.content!);
    } catch (err) {
      console.error('AI Processing Error:', err);
      return { nodes: [], edges: [] };
    }
  }

  async chat(message: string, context: string) {
    const systemPrompt = `
      You are MindOps AI, a strategic co-founder assistant. 
      Your goal is to help the founder execute their project by providing strategic advice, identifying risks, and suggesting next steps.
      
      CURRENT PROJECT CONTEXT:
      ${context}

      Be concise, premium, and highly strategic. Avoid generic advice.
    `;

    if (!this.openai) {
      return "I'm running in MOCK mode because no OpenAI API key was provided. I can still help you with structural advice, but my intelligence is currently limited!";
    }
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
    });

    return response.choices[0].message.content;
  }

  async generateEmbedding(text: string) {
    if (!this.openai) {
      return new Array(1536).fill(0); // Return zero vector for mock
    }
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }
}
