import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmbeddingService } from './embedding.service';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(
    private config: ConfigService,
    private embeddingService: EmbeddingService,
  ) {
    this.apiKey = this.config.get('MISTRAL_API_KEY');
    this.model = this.config.get('MISTRAL_MODEL', 'mistral-small-latest');
    this.baseUrl = this.config.get('MISTRAL_BASE_URL', 'https://api.mistral.ai');
  }

  private getSystemPrompt(): string {
    return `Eres el asistente virtual del Hostal Boutique Villa D2. Tu función es ayudar a los huéspedes con información sobre el menú, precios, horarios y recomendaciones.

INSTRUCCIONES:
1. Responde basándote en la información del menú proporcionada como contexto Y en el historial de la conversación
2. Si el usuario hace referencia a algo mencionado antes (ej: "¿y el otro?", "¿cuánto cuesta?", "el de antes"), usa el historial para entender a qué producto se refiere
3. Si la información no está en el menú ni en el historial, indícalo amablemente
4. Responde en el idioma del usuario (español o inglés)
5. Sé amable, profesional y conciso
6. Si un producto tiene descripción de ingredientes o alérgenos, menciónolos de forma natural
7. NO inventes información sobre precios, ingredientes o disponibilidad

FORMATO DE RESPUESTA:
- Responde como si estuvieras hablando con un huésped en persona
- NO uses asteriscos, guiones bajos, corchetes ni paréntesis para formatear
- NO uses esquemas ni listas con símbolos
- Estructura tus respuestas en párrafos naturales
- Si necesitas mencionar varios productos, descríbelos en texto corrido
- Usa puntuación natural: comas, puntos y comas, puntos
- Evita ser robótico o esquemático, sé conversacional y cálido`;
  }

  private formatProductContext(products: { product: any; score: number }[]): string {
    return products
      .map(({ product, score }) => {
        const cat = product.categoryProducts?.[0]?.category;
        const menu = cat?.menu;
        const parts = [
          `**${product.name}**`,
          menu ? `Menú: ${menu.name}` : null,
          cat ? `Categoría: ${cat.name}` : null,
          product.description ? `Descripción: ${product.description}` : null,
          product.privateDescription ? `Detalles: ${product.privateDescription}` : null,
          product.price ? `Precio: $${product.price} USD (+10% servicio)` : null,
          menu?.schedule ? `Horario: ${menu.schedule}` : null,
        ].filter(Boolean);
        return parts.join('\n');
      })
      .join('\n\n');
  }

  async chat(message: string, history?: ChatMessage[]): Promise<string> {
    this.logger.log(`Chat request: "${message.slice(0, 50)}..."`);

    // 1. Retrieve similar products
    const results = await this.embeddingService.searchSimilar(message, 5);

    if (!results.length) {
      return 'Lo siento, no encontré información relevante en el menú. ¿Podrías reformular tu pregunta o mencionar un plato específico?';
    }

    // 2. Build context
    const context = this.formatProductContext(results);

    // 3. Build messages
    const messages: ChatMessage[] = [
      { role: 'system', content: this.getSystemPrompt() },
      ...(history || []),
      {
        role: 'user',
        content: `CONTEXTO DEL MENÚ:\n${context}\n\nPREGUNTA DEL USUARIO:\n${message}`,
      },
    ];

    // 4. Call Mistral
    const resp = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      this.logger.error(`Mistral API error: ${resp.status} ${err}`);
      throw new Error(`LLM failed: ${resp.status}`);
    }

    const data = await resp.json();
    return data.choices[0].message.content;
  }
}
