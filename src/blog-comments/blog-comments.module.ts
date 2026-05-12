import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogCommentsController } from './blog-comments.controller';
import { BlogCommentsService } from './blog-comments.service';
import { BlogComment } from './entities/blog-comment.entity';
import { Blog } from '../blog/entities/blog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlogComment, Blog])],
  controllers: [BlogCommentsController],
  providers: [BlogCommentsService],
  exports: [BlogCommentsService],
})
export class BlogCommentsModule {}
