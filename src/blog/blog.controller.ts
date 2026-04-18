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
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FindBlogDto } from './dto/find-blog.dto';
import { BlogStatus } from './entities/blog.entity';
import { Blog } from './entities/blog.entity';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const multerBlogOptions = {
  storage: diskStorage({
    destination: (req, _file, callback) => {
      const uploadPath = path.join(process.cwd(), 'media', 'blog');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      callback(null, uploadPath);
    },
    filename: (_req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      callback(null, `blog-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
};

@ApiTags('Blog')
@Controller('blog')
@ApiExtraModels(CreateBlogDto, UpdateBlogDto)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', multerBlogOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear un nuevo artículo de blog' })
  @ApiResponse({
    status: 201,
    description: 'Artículo creado exitosamente',
    type: Blog,
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreateBlogDto) },
        {
          type: 'object',
          properties: {
            image: { type: 'string', format: 'binary' },
          },
        },
      ],
    },
  })
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    const imagePath = image ? `media/blog/${image.filename}` : undefined;
    return this.blogService.create({
      ...createBlogDto,
      image: imagePath,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los artículos del blog' })
  @ApiResponse({ status: 200, description: 'Lista de artículos' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BlogStatus,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Buscar en título o descripción',
  })
  findAll(@Query() findBlogDto: FindBlogDto) {
    return this.blogService.findAll(findBlogDto);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener artículo por slug' })
  @ApiResponse({ status: 200, description: 'Artículo encontrado', type: Blog })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  @ApiParam({ name: 'slug', description: 'URL slug del artículo' })
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener artículo por ID' })
  @ApiResponse({ status: 200, description: 'Artículo encontrado', type: Blog })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del artículo' })
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', multerBlogOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar un artículo' })
  @ApiResponse({
    status: 200,
    description: 'Artículo actualizado exitosamente',
    type: Blog,
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del artículo' })
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(UpdateBlogDto) },
        {
          type: 'object',
          properties: {
            image: {
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
    @Body() updateBlogDto: UpdateBlogDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    image?: Express.Multer.File,
  ) {
    const imagePath = image ? `media/blog/${image.filename}` : undefined;
    return this.blogService.update(+id, {
      ...updateBlogDto,
      image: imagePath,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar estado del artículo' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: Blog,
  })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del artículo' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(BlogStatus) },
      },
    },
  })
  changeStatus(@Param('id') id: string, @Body('status') status: BlogStatus) {
    return this.blogService.changeStatus(+id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un artículo' })
  @ApiResponse({ status: 204, description: 'Artículo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del artículo' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}
