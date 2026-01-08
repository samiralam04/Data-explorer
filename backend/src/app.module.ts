import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrapeModule } from './scrape/scrape.module';
import { PrismaModule } from './prisma/prisma.module';
import { NavigationController } from './navigation/navigation.controller';
import { NavigationService } from './navigation/navigation.service';
import { CategoryController } from './category/category.controller';
import { CategoryService } from './category/category.service';
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ScrapeModule,
  ],
  controllers: [AppController, NavigationController, CategoryController, ProductController],
  providers: [AppService, NavigationService, CategoryService, ProductService],
})
export class AppModule { }
