import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SummaryProvider, SummaryOptions } from './summary.provider.interface';

import OpenAI from 'openai';

@Injectable()
export class OpenAIProvider implements SummaryProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    
    if (apiKey && apiKey !== 'mock-api-key') {
      this.openai = new OpenAI({
        apiKey,
      });
    }
  }

  async generateSummary(content: string, options?: SummaryOptions): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const { title, maxLength = 150, style = 'concise' } = options || {};

    const systemPrompt = `You are a professional content summarizer. Create a ${style} summary that captures the key points and main ideas.`;
    
    const userPrompt = title
      ? `Summarize the following article titled "${title}" in ${maxLength} words or less:\n\n${content}`
      : `Summarize the following content in ${maxLength} words or less:\n\n${content}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('openai.model') || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: this.configService.get<number>('openai.maxTokens') || 150,
        temperature: 0.7,
      });

      const summary = completion.choices[0]?.message?.content?.trim();
      
      if (!summary) {
        throw new Error('No summary generated');
      }

      return summary;
    } catch (error) {
      this.logger.error('OpenAI API error', error);
      throw error;
    }
  }
}