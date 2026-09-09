import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { EmbeddingService } from './embedding.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const embeddingService = app.get(EmbeddingService);

  console.log('Starting embedding seed...');
  await embeddingService.embedAllProducts();
  console.log('Embedding seed complete!');

  await app.close();
}

seed().catch((err) => {
  console.error('Embedding seed failed:', err);
  process.exit(1);
});
