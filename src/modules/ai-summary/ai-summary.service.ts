import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIProvider } from './providers/openai.provider';
import { SummaryProvider } from './providers/summary.provider.interface';


@Injectable()
export class AiSummaryService {
  private readonly logger = new Logger(AiSummaryService.name);
  private summaryProvider: SummaryProvider;

  constructor(
    private configService: ConfigService,
    private openAIProvider: OpenAIProvider,
  ) {
    this.summaryProvider = this.openAIProvider;
  }

  async generateSummary(content: string, title?: string): Promise<string> {
    try {
      // Check if OpenAI is configured
      const apiKey = this.configService.get<string>('openai.apiKey');
      
      if (!apiKey || apiKey === 'mock-api-key') {
        // Return mock summary for demo purposes
        return this.generateMockSummary(content, title);
      }

      // Generate real summary using OpenAI
      const summary = await this.summaryProvider.generateSummary(content, {
        title,
        maxLength: 150,
        style: 'concise',
      });

      this.logger.log('Successfully generated AI summary');
      return summary;
    } catch (error) {
      this.logger.error('Error generating AI summary', error);
      throw error;
    }
  }

  private generateMockSummary(content: string, title?: string): string {
    
    const prefix = title ? `This article about "${title}" discusses` : 'This article discusses';
    const wordCount = content.split(' ').length;
    
    return `${prefix} key insights across ${wordCount} words. The content explores important concepts and provides valuable information for readers interested in the topic.`;
  }
}