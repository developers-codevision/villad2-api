import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FindReviewsDto } from './dto/find-reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepository.create(createReviewDto);
    return await this.reviewRepository.save(review);
  }

  async findAll(findReviewsDto: FindReviewsDto): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, page = 1, limit = 10 } = findReviewsDto;

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .orderBy('review.createdAt', 'DESC');

    if (status) {
      queryBuilder.where('review.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    const reviews = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      reviews,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    Object.assign(review, updateReviewDto);

    return await this.reviewRepository.save(review);
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewRepository.remove(review);
  }

  async changeStatus(id: number, status: ReviewStatus): Promise<Review> {
    const review = await this.findOne(id);
    review.status = status;
    return await this.reviewRepository.save(review);
  }

  async addResponse(id: number, response: string): Promise<Review> {
    const review = await this.findOne(id);
    review.response = response;
    return await this.reviewRepository.save(review);
  }
}
