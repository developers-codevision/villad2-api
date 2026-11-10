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
  ForbiddenException,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FindReviewsDto } from './dto/find-reviews.dto';
import { ReviewStatus } from './entities/review.entity';
import { Review } from './entities/review.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('Reseñas')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: Review,
  })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({
    status: 400,
    description: 'Campos inválidos o incompatibles con la base de datos',
  })
  @ApiResponse({
    status: 409,
    description: 'La reseña entra en conflicto con un registro existente',
  })
  @ApiResponse({
    status: 503,
    description:
      'Conflicto temporal de concurrencia o base de datos no disponible; la respuesta indica si se puede reintentar',
  })
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all reviews with optional filters' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ReviewStatus,
    description: 'Filter by review status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiBearerAuth('access-token')
  findAll(
    @Query() findReviewsDto: FindReviewsDto,
    @Request() req: { user?: { roles?: string[] } },
  ) {
    if (findReviewsDto.status !== ReviewStatus.ACTIVE) {
      const roles = req.user?.roles ?? [];
      if (!roles.includes(UserRole.ADMIN)) {
        throw new ForbiddenException(
          'Solo un administrador puede consultar reseñas pendientes o sin filtro de estado.',
        );
      }
    }

    return this.reviewsService.findAll(findReviewsDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiResponse({ status: 200, description: 'Review found', type: Review })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    type: Review,
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiBody({ type: UpdateReviewDto })
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Change review status' })
  @ApiResponse({
    status: 200,
    description: 'Review status updated successfully',
    type: Review,
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(ReviewStatus) },
      },
    },
  })
  changeStatus(@Param('id') id: string, @Body('status') status: ReviewStatus) {
    return this.reviewsService.changeStatus(+id, status);
  }

  @Patch(':id/response')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update response of a review (add or remove)' })
  @ApiResponse({
    status: 200,
    description: 'Response updated successfully',
    type: Review,
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        response: {
          type: 'string',
          nullable: true,
          description: 'Response text (null to remove response)',
        },
      },
    },
  })
  updateResponse(
    @Param('id') id: string,
    @Body('response') response: string | null,
  ) {
    return this.reviewsService.updateResponse(+id, response);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }
}
