import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import * as os from 'os';

@Injectable()
export class HealthService extends HealthIndicator {
  private isServiceReady = true;

  async isReady(): Promise<HealthIndicatorResult> {
    
    const isHealthy = this.isServiceReady;
    const result = this.getStatus('service', isHealthy, {
      message: isHealthy ? 'Service is ready' : 'Service is not ready',
    });
    
    if (!isHealthy) {
      throw new Error('Service is not ready');
    }
    
    return result;
  }

  setReady(ready: boolean) {
    this.isServiceReady = ready;
  }

  async getDetailedMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        loadAverage: os.loadavg(),
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: `${Math.floor(process.uptime())} seconds`,
        pid: process.pid,
      },
    };
  }
}