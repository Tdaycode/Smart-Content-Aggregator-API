import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly register: client.Registry;
  private readonly httpRequestDuration: client.Histogram<string>;
  private readonly httpRequestTotal: client.Counter<string>;
  private readonly httpRequestErrors: client.Counter<string>;
  private readonly articlesCreated: client.Counter<string>;
  private readonly recommendationsGenerated: client.Counter<string>;
  private readonly aiSummariesGenerated: client.Counter<string>;
  private readonly dbQueryDuration: client.Histogram<string>;

  constructor() {
    // Create a Registry
    this.register = new client.Registry();
    
    // Add default metrics
    client.collectDefaultMetrics({ register: this.register });

    // Custom metrics
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.register],
    });

    this.httpRequestTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.httpRequestErrors = new client.Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.register],
    });

    this.articlesCreated = new client.Counter({
      name: 'articles_created_total',
      help: 'Total number of articles created',
      labelNames: ['with_ai_summary'],
      registers: [this.register],
    });

    this.recommendationsGenerated = new client.Counter({
      name: 'recommendations_generated_total',
      help: 'Total number of recommendations generated',
      labelNames: ['strategy'],
      registers: [this.register],
    });

    this.aiSummariesGenerated = new client.Counter({
      name: 'ai_summaries_generated_total',
      help: 'Total number of AI summaries generated',
      labelNames: ['provider', 'success'],
      registers: [this.register],
    });

    this.dbQueryDuration = new client.Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'collection'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register],
    });
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  async getMetricsAsJson() {
    const metrics = await this.register.getMetricsAsJSON();
    return {
      metrics,
      timestamp: new Date().toISOString(),
    };
  }

  // Methods to record metrics
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestTotal.labels(method, route, statusCode.toString()).inc();
    this.httpRequestDuration.labels(method, route, statusCode.toString()).observe(duration);
  }

  recordHttpError(method: string, route: string, errorType: string) {
    this.httpRequestErrors.labels(method, route, errorType).inc();
  }

  recordArticleCreated(withAiSummary: boolean) {
    this.articlesCreated.labels(withAiSummary ? 'true' : 'false').inc();
  }

  recordRecommendationGenerated(strategy: string) {
    this.recommendationsGenerated.labels(strategy).inc();
  }

  recordAiSummaryGenerated(provider: string, success: boolean) {
    this.aiSummariesGenerated.labels(provider, success ? 'true' : 'false').inc();
  }

  recordDbQuery(operation: string, collection: string, duration: number) {
    this.dbQueryDuration.labels(operation, collection).observe(duration);
  }
}