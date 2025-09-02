export interface SummaryOptions {
    title?: string;
    maxLength?: number;
    style?: 'concise' | 'detailed' | 'bullet-points';
    language?: string;
  }
  
  export interface SummaryProvider {
    generateSummary(content: string, options?: SummaryOptions): Promise<string>;
  }