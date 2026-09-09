import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly dims: number;

  constructor(
    private config: ConfigService,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {
    this.apiKey = this.config.get('JINA_API_KEY');
    this.model = this.config.get('JINA_EMBEDDING_MODEL', 'jina-embeddings-v3');
    this.dims = +this.config.get('JINA_EMBEDDING_DIMS', '1024');
  }

  async generateEmbedding(texts: string[]): Promise<number[][]> {
    const resp = await fetch('https://api.jina.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
        dimensions: this.dims,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      this.logger.error(`Jina API error: ${resp.status} ${err}`);
      throw new Error(`Embedding failed: ${resp.status}`);
    }

    const data = await resp.json();
    return data.data.map((d: any) => d.embedding);
  }

  buildProductText(product: Product, categoryName?: string, menuName?: string): string {
    return [
      product.name,
      categoryName || '',
      menuName || '',
      product.description || '',
      product.privateDescription || '',
    ]
      .filter(Boolean)
      .join(' | ');
  }

  async embedProduct(product: Product, categoryName?: string, menuName?: string): Promise<void> {
    const text = this.buildProductText(product, categoryName, menuName);
    try {
      const [embedding] = await this.generateEmbedding([text]);
      product.embedding = JSON.stringify(embedding);
      await this.productRepo.save(product);
      this.logger.log(`Embedded product ${product.id}: "${product.name}"`);
    } catch (err) {
      this.logger.error(`Failed to embed product ${product.id}: ${(err as Error).message}`);
    }
  }

  async embedAllProducts(): Promise<void> {
    const products = await this.productRepo.find({
      relations: ['categoryProducts', 'categoryProducts.category', 'categoryProducts.category.menu'],
    });

    this.logger.log(`Embedding ${products.length} products...`);

    const texts = products.map((p) => {
      const cat = p.categoryProducts?.[0]?.category;
      const menu = cat?.menu;
      return this.buildProductText(p, cat?.name, menu?.name);
    });

    // Batch embed in chunks of 50 (Jina limit)
    for (let i = 0; i < texts.length; i += 50) {
      const batch = texts.slice(i, i + 50);
      const embeddings = await this.generateEmbedding(batch);

      for (let j = 0; j < batch.length; j++) {
        products[i + j].embedding = JSON.stringify(embeddings[j]);
      }
    }

    await this.productRepo.save(products);
    this.logger.log(`Embedded ${products.length} products successfully`);
  }

  cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async searchSimilar(query: string, topK = 5): Promise<{ product: Product; score: number }[]> {
    const [queryEmbedding] = await this.generateEmbedding([query]);

    const products = await this.productRepo.find({
      where: { active: true },
      relations: ['categoryProducts', 'categoryProducts.category', 'categoryProducts.category.menu'],
    });

    const scored = products
      .filter((p) => p.embedding)
      .map((p) => ({
        product: p,
        score: this.cosineSimilarity(queryEmbedding, JSON.parse(p.embedding)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  }
}
