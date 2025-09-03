import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', 'text/plain');
    const metrics = await this.metricsService.getMetrics();
    res.send(metrics);
  }

  @Get('json')
  @ApiOperation({ summary: 'Metrics in JSON format' })
  async getMetricsJson() {
    return this.metricsService.getMetricsAsJson();
  }
}