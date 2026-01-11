import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Default nest logger is fine too if we are just logging to console, but let's use the one we improved.
    // Or better, let's just leave it default but ensure our services use the LoggerModule. 
    // Actually, to use Winston globally:
  });

  // Better approach for main.ts with NestJS 9+ and Winston is usually:
  // const app = await NestFactory.create(AppModule, { bufferLogs: true });
  // app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  // But let's stick to simple for now as we just need "logging" inside services.

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 4001;

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Product Data Explorer API')
    .setDescription('API documentation for the Scraper and Product Explorer')
    .setVersion('1.0')
    .addTag('Scrape')
    .addTag('Navigation')
    .addTag('Category')
    .addTag('Product')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable CORS
  app.enableCors();

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}
bootstrap();
