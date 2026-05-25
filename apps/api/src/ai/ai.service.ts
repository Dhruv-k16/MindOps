import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY is missing. AI features will run in MOCK mode.');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async structureBrainDump(text: string) {
    const prompt = `
      You are an expert startup founder and systems architect.
      Analyze the following brain dump and extract structured business nodes and their relationships.
      
      Nodes must be one of: IDEA, TASK, RISK, REVENUE, INSIGHT, DOCUMENT.
      Edges represent dependencies or pivots.

      Input: "${text}"

      Return ONLY a JSON object with the following structure, no markdown, no backticks:
      {
        "nodes": [{ "id": "string", "type": "string", "label": "string", "content": "string" }],
        "edges": [{ "source": "string", "target": "string", "label": "string" }]
      }
    `;

    if (!this.genAI) {
      return {
        nodes: [{ id: '1', type: 'IDEA', label: 'Mock Idea', content: 'Mock mode — no API key provided.' }],
        edges: []
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const raw = result.response.text().trim();
      // Strip markdown code fences if present
      const clean = raw.replace(/^```json\n?|\n?```$/g, '').trim();
      return JSON.parse(clean);
    } catch (err) {
      console.error('AI structureBrainDump error:', err);
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

    if (!this.genAI) {
      return "I'm running in MOCK mode because no Gemini API key was provided.";
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
      });
      const result = await model.generateContent(message);
      return result.response.text();
    } catch (err) {
      console.error('AI chat error:', err);
      return 'AI is temporarily unavailable. Please try again.';
    }
  }

  async generateEmbedding(text: string) {
    if (!this.genAI) {
      return new Array(768).fill(0); // Gemini embeddings are 768-dim
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      console.error('Embedding error:', err);
      return new Array(768).fill(0);
    }
  }
}