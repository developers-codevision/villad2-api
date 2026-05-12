import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BlogCommentsService } from './blog-comments.service';
import { CreateBlogCommentDto } from './dto/create-blog-comment.dto';
import { UpdateBlogCommentDto } from './dto/update-blog-comment.dto';
import { FindBlogCommentsDto } from './dto/find-blog-comments.dto';
import { BlogComment, BlogCommentStatus } from './entities/blog-comment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('Comentarios de Blog')
@Controller('blog-comments')
export class BlogCommentsController {
  constructor(private readonly blogCommentsService: BlogCommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo comentario' })
  @ApiResponse({
    status: 201,
    description: 'Comentario creado exitosamente',
    type: BlogComment,
  })
  @ApiBody({ type: CreateBlogCommentDto })
  create(@Body() createBlogCommentDto: CreateBlogCommentDto) {
    return this.blogCommentsService.create(createBlogCommentDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Listar comentarios con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios' })
  @ApiQuery({
    name: 'postId',
    required: false,
    type: Number,
    description: 'Filtrar por articulo',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BlogCommentStatus,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Numero de pagina',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por pagina',
  })
  @ApiBearerAuth('access-token')
  findAll(
    @Query() findBlogCommentsDto: FindBlogCommentsDto,
    @Request() req: { user?: { roles?: string[] } },
  ) {
    if (findBlogCommentsDto.status !== BlogCommentStatus.ACTIVE) {
      const roles = req.user?.roles ?? [];
      if (!roles.includes(UserRole.ADMIN)) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return this.blogCommentsService.findAll(findBlogCommentsDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener comentario por ID' })
  @ApiResponse({ status: 200, description: 'Comentario encontrado' })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  findOne(@Param('id') id: string) {
    return this.blogCommentsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar comentario' })
  @ApiResponse({
    status: 200,
    description: 'Comentario actualizado',
    type: BlogComment,
  })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiBody({ type: UpdateBlogCommentDto })
  update(
    @Param('id') id: string,
    @Body() updateBlogCommentDto: UpdateBlogCommentDto,
  ) {
    return this.blogCommentsService.update(+id, updateBlogCommentDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cambiar estado del comentario' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
    type: BlogComment,
  })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(BlogCommentStatus) },
      },
    },
  })
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: BlogCommentStatus,
  ) {
    return this.blogCommentsService.changeStatus(+id, status);
  }

  @Patch(':id/response')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Responder comentario (agregar o eliminar)' })
  @ApiResponse({
    status: 200,
    description: 'Respuesta actualizada',
    type: BlogComment,
  })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        response: {
          type: 'string',
          nullable: true,
          description: 'Respuesta (null para eliminar)',
        },
      },
    },
  })
  updateResponse(
    @Param('id') id: string,
    @Body('response') response: string | null,
  ) {
    return this.blogCommentsService.updateResponse(+id, response);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar comentario' })
  @ApiResponse({ status: 204, description: 'Comentario eliminado' })
  @ApiResponse({ status: 404, description: 'Comentario no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del comentario' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.blogCommentsService.remove(+id);
  }
}
