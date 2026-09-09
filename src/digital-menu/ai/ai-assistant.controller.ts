import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { EmbeddingService } from './embedding.service';

@Controller('public/ai')
export class AiAssistantController {
  private readonly logger = new Logger(AiAssistantController.name);

  constructor(
    private aiService: AiAssistantService,
    private embeddingService: EmbeddingService,
  ) {}

  @Post('chat')
  async chat(@Body() body: any) {
    const message = body?.message || '';
    this.logger.log(`Chat: "${message.slice(0, 50)}..."`);
    const response = await this.aiService.chat(message, body?.history);
    return { response };
  }

  @Post('embed-all')
  async embedAll() {
    this.logger.log('Starting full embedding...');
    await this.embeddingService.embedAllProducts();
    return { success: true, message: 'All products embedded' };
  }
}
