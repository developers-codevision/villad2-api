import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog, BlogStatus } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FindBlogDto } from './dto/find-blog.dto';
import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const sanitizeHtml = require('sanitize-html') as typeof import('sanitize-html');

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  private sanitizeContent(content: string): string {
    return sanitizeHtml(content, {
      allowedTags: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'hr',
        'ul',
        'ol',
        'li',
        'blockquote',
        'pre',
        'code',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'strike',
        'a',
        'img',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'figure',
        'figcaption',
        'div',
        'span',
      ],
      allowedAttributes: {
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        div: ['class'],
        span: ['class'],
        table: ['class'],
        th: ['scope'],
        td: ['colspan', 'rowspan'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesAppliedToAttributes: ['href', 'src'],
      transformTags: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        a: sanitizeHtml.simpleTransform('a', {
          target: '_blank',
          rel: 'noopener noreferrer',
        }),
      },
    });
  }

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const sanitizedContent = this.sanitizeContent(createBlogDto.content);

    const blog = this.blogRepository.create({
      ...createBlogDto,
      content: sanitizedContent,
      publishedAt: createBlogDto.publishedAt
        ? new Date(createBlogDto.publishedAt)
        : undefined,
    });

    return await this.blogRepository.save(blog);
  }

  async findAll(findBlogDto: FindBlogDto): Promise<{
    blogs: Blog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, page = 1, limit = 10, search } = findBlogDto;

    const queryBuilder = this.blogRepository
      .createQueryBuilder('blog')
      .orderBy('blog.publishedAt', 'DESC')
      .addOrderBy('blog.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('blog.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(blog.title ILIKE :search OR blog.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await queryBuilder.getCount();
    const blogs = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      blogs,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { id } });

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return blog;
  }

  async findBySlug(slug: string): Promise<Blog> {
    const blog = await this.blogRepository.findOne({ where: { slug } });

    if (!blog) {
      throw new NotFoundException(`Blog with slug "${slug}" not found`);
    }

    return blog;
  }

  async update(id: number, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.findOne(id);
    const newImagePath = updateBlogDto.image;
    const oldImagePath = blog.image;

    const updateData: Partial<Blog> = {
      title: updateBlogDto.title,
      slug: updateBlogDto.slug,
      description: updateBlogDto.description,
      image: updateBlogDto.image,
      status: updateBlogDto.status,
    };

    if (updateBlogDto.content) {
      updateData.content = this.sanitizeContent(updateBlogDto.content);
    }

    if (updateBlogDto.publishedAt) {
      updateData.publishedAt = new Date(updateBlogDto.publishedAt);
    }

    if (newImagePath && newImagePath !== oldImagePath) {
      try {
        Object.assign(blog, updateData);
        const updatedBlog = await this.blogRepository.save(blog);

        if (oldImagePath) {
          const oldFilePath = path.join(process.cwd(), oldImagePath);
          try {
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath);
              console.log('Deleted old blog image:', oldImagePath);
            }
          } catch (deleteError) {
            console.error('Error deleting old blog image:', deleteError);
          }
        }

        return updatedBlog;
      } catch (error) {
        const filePath = path.join(process.cwd(), newImagePath);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.error('Cleaned up orphaned image:', newImagePath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up image:', cleanupError);
        }
        throw error;
      }
    }

    Object.assign(blog, updateData);
    return await this.blogRepository.save(blog);
  }

  async remove(id: number): Promise<void> {
    const blog = await this.findOne(id);

    if (blog.image) {
      const filePath = path.join(process.cwd(), blog.image);

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting blog image:', error);
      }
    }

    await this.blogRepository.remove(blog);
  }

  async changeStatus(id: number, status: BlogStatus): Promise<Blog> {
    const blog = await this.findOne(id);
    blog.status = status;
    return await this.blogRepository.save(blog);
  }
}
