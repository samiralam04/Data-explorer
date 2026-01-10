import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
