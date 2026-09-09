import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Menu } from '../entities/menu.entity';
import { EmbeddingService } from './embedding.service';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantController } from './ai-assistant.controller';
import { MenuProductsModule } from '../products/products.module';
import { ProductsService } from '../products/products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, Menu]),
    MenuProductsModule,
  ],
  controllers: [AiAssistantController],
  providers: [EmbeddingService, AiAssistantService],
  exports: [EmbeddingService],
})
export class AiModule implements OnModuleInit {
  constructor(private productsService: ProductsService, private embeddingService: EmbeddingService) {}

  onModuleInit() {
    this.productsService.setEmbeddingService(this.embeddingService);
  }
}
