import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiSummaryService } from './ai-summary.service';
import { OpenAIProvider } from './providers/openai.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AiSummaryService, OpenAIProvider],
  exports: [AiSummaryService],
})
export class AiSummaryModule {}