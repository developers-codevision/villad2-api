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
} from '@nestjs/common';
import {
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

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully', type: Review })
  @ApiBody({ type: CreateReviewDto })
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews with optional filters' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  @ApiQuery({ name: 'status', required: false, enum: ReviewStatus, description: 'Filter by review status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  findAll(@Query() findReviewsDto: FindReviewsDto) {
    return this.reviewsService.findAll(findReviewsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiResponse({ status: 200, description: 'Review found', type: Review })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully', type: Review })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiBody({ type: UpdateReviewDto })
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change review status' })
  @ApiResponse({ status: 200, description: 'Review status updated successfully', type: Review })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(ReviewStatus) } } } })
  changeStatus(@Param('id') id: string, @Body('status') status: ReviewStatus) {
    return this.reviewsService.changeStatus(+id, status);
  }

  @Patch(':id/response')
  @ApiOperation({ summary: 'Add response to a review' })
  @ApiResponse({ status: 200, description: 'Response added successfully', type: Review })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiBody({ schema: { type: 'object', properties: { response: { type: 'string', description: 'Response text' } } } })
  addResponse(@Param('id') id: string, @Body('response') response: string) {
    return this.reviewsService.addResponse(+id, response);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }
}
