import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogComment, BlogCommentStatus } from './entities/blog-comment.entity';
import { CreateBlogCommentDto } from './dto/create-blog-comment.dto';
import { UpdateBlogCommentDto } from './dto/update-blog-comment.dto';
import { FindBlogCommentsDto } from './dto/find-blog-comments.dto';
import { Blog } from '../blog/entities/blog.entity';

@Injectable()
export class BlogCommentsService {
  constructor(
    @InjectRepository(BlogComment)
    private readonly blogCommentRepository: Repository<BlogComment>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  async create(createBlogCommentDto: CreateBlogCommentDto): Promise<BlogComment> {
    const blog = await this.blogRepository.findOne({
      where: { id: createBlogCommentDto.postId },
    });

    if (!blog) {
      throw new BadRequestException('Blog post not found');
    }

    const comment = this.blogCommentRepository.create({
      ...createBlogCommentDto,
      status: BlogCommentStatus.INACTIVE,
    });

    return await this.blogCommentRepository.save(comment);
  }

  async findAll(findBlogCommentsDto: FindBlogCommentsDto): Promise<{
    comments: (BlogComment & { postTitle?: string })[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, page = 1, limit = 10, postId } = findBlogCommentsDto;

    const queryBuilder = this.blogCommentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.post', 'post')
      .addSelect('post.titleEs', 'postTitle')
      .orderBy('comment.createdAt', 'DESC');

    if (postId) {
      queryBuilder.andWhere('comment.postId = :postId', { postId });
    }

    if (status) {
      queryBuilder.andWhere('comment.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    const { entities, raw } = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();

    const comments = entities.map((comment, index) => ({
      ...comment,
      postTitle: raw[index]?.postTitle ?? undefined,
    }));

    return {
      comments,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<BlogComment> {
    const comment = await this.blogCommentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Blog comment with id ${id} not found`);
    }

    return comment;
  }

  async update(
    id: number,
    updateBlogCommentDto: UpdateBlogCommentDto,
  ): Promise<BlogComment> {
    const comment = await this.findOne(id);

    Object.assign(comment, updateBlogCommentDto);
    return await this.blogCommentRepository.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.findOne(id);
    await this.blogCommentRepository.remove(comment);
  }

  async changeStatus(
    id: number,
    status: BlogCommentStatus,
  ): Promise<BlogComment> {
    const comment = await this.findOne(id);
    comment.status = status;
    return await this.blogCommentRepository.save(comment);
  }

  async updateResponse(
    id: number,
    response: string | null,
  ): Promise<BlogComment> {
    const comment = await this.findOne(id);
    comment.response = response ?? null;
    return await this.blogCommentRepository.save(comment);
  }
}
