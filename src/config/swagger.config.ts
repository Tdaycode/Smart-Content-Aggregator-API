import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Smart Content Aggregator API')
    .setDescription('A sophisticated content aggregation API with AI-powered features')
    .setVersion('1.0')
    .addTag('Articles', 'Article management endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Interactions', 'User interaction tracking')
    .addTag('Recommendations', 'Personalized content recommendations')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}