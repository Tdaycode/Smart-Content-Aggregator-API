import { Module, Global } from '@nestjs/common';
import * as client from 'prom-client';

@Global()
@Module({
  providers: [
    {
      provide: 'PROMETHEUS_REGISTRY',
      useFactory: () => {
        const register = new client.Registry();
        client.collectDefaultMetrics({ register });
        return register;
      },
    },
  ],
  exports: ['PROMETHEUS_REGISTRY'],
})
export class PrometheusModule {}