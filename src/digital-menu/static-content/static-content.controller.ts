import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { StaticContentService, StaticContentKey } from './static-content.service';
import { UpdateStaticContentDto } from './dto/update-static-content.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('api/menu-static-content')
@UseGuards(JwtAuthGuard)
export class StaticContentController {
  constructor(private readonly service: StaticContentService) {}

  @Get()
  getAll() {
    return this.service.getAll();
  }

  @Put(':key')
  update(
    @Param('key') key: StaticContentKey,
    @Body() dto: UpdateStaticContentDto,
  ) {
    return this.service.set(key, dto.value);
  }
}
