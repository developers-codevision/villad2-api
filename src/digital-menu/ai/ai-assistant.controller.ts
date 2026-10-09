import { Controller, Post, Body, Logger, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AiAssistantService } from './ai-assistant.service';
import { EmbeddingService } from './embedding.service';

@Controller('public/ai')
@Throttle({ default: { limit: 10, ttl: 60_000 } })
export class AiAssistantController {
  private readonly logger = new Logger(AiAssistantController.name);

  constructor(
    private aiService: AiAssistantService,
    private embeddingService: EmbeddingService,
  ) {}

  @Post('chat')
  async chat(@Body() body: any) {
    const message = String(body?.message || '').slice(0, 500);
    this.logger.log(`Chat: "${message.slice(0, 50)}..."`);
    const history = Array.isArray(body?.history)
      ? body.history
          .filter(
            (m: any) =>
              m &&
              (m.role === 'user' || m.role === 'assistant') &&
              typeof m.content === 'string',
          )
          .slice(-20)
          .map((m: any) => ({ role: m.role, content: m.content.slice(0, 1000) }))
      : undefined;
    const response = await this.aiService.chat(message, history);
    return { response };
  }

  @Post('embed-all')
  @UseGuards(JwtAuthGuard)
  async embedAll() {
    this.logger.log('Starting full embedding...');
    await this.embeddingService.embedAllProducts();
    return { success: true, message: 'All products embedded' };
  }
}
