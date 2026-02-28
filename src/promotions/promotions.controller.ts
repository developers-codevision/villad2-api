import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { FindPromotionsDto } from './dto/find-promotions.dto';
import { PromotionStatus } from './entities/promotion.entity';
import { Promotion } from './entities/promotion.entity';
import { multerPromotionsOptions } from '../config/multer-promotions.config';

@ApiTags('Promotions')
@Controller('promotions')
@ApiExtraModels(CreatePromotionDto, UpdatePromotionDto)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo', multerPromotionsOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({ status: 201, description: 'Promotion created successfully', type: Promotion })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreatePromotionDto) },
        {
          type: 'object',
          properties: {
            photo: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      ],
    },
  })
  async create(
    @Body() createPromotionDto: CreatePromotionDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
        ],
        fileIsRequired: false,
      }),
    )
    photo?: Express.Multer.File,
  ) {
    const photoPath = photo ? `media/promotions/${photo.filename}` : undefined;
    return this.promotionsService.create({
      ...createPromotionDto,
      photo: photoPath,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all promotions with optional filters' })
  @ApiResponse({ status: 200, description: 'List of promotions' })
  @ApiQuery({ name: 'status', required: false, enum: PromotionStatus, description: 'Filter by promotion status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  findAll(@Query() findPromotionsDto: FindPromotionsDto) {
    return this.promotionsService.findAll(findPromotionsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a promotion by ID' })
  @ApiResponse({ status: 200, description: 'Promotion found', type: Promotion })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', multerPromotionsOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a promotion' })
  @ApiResponse({ status: 200, description: 'Promotion updated successfully', type: Promotion })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(UpdatePromotionDto) },
        {
          type: 'object',
          properties: {
            photo: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      ],
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
        ],
        fileIsRequired: false,
      }),
    )
    photo?: Express.Multer.File,
  ) {
    const photoPath = photo ? `media/promotions/${photo.filename}` : undefined;
    return this.promotionsService.update(+id, {
      ...updatePromotionDto,
      photo: photoPath,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change promotion status' })
  @ApiResponse({ status: 200, description: 'Promotion status updated successfully', type: Promotion })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(PromotionStatus) } } } })
  changeStatus(@Param('id') id: string, @Body('status') status: PromotionStatus) {
    return this.promotionsService.changeStatus(+id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a promotion' })
  @ApiResponse({ status: 204, description: 'Promotion deleted successfully' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(+id);
  }
}
