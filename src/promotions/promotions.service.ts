import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion, PromotionStatus } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { FindPromotionsDto } from './dto/find-promotions.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const photoPath = createPromotionDto.photo;
    
    // If there's a photo but promotion creation fails, clean up the orphaned file
    if (photoPath) {
      try {
        const promotion = this.promotionRepository.create(createPromotionDto);
        return await this.promotionRepository.save(promotion);
      } catch (error) {
        // If database save fails, delete the uploaded file
        const filePath = path.join(process.cwd(), photoPath);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.error('Cleaned up orphaned photo:', photoPath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up photo:', cleanupError);
        }
        throw error;
      }
    }
    
    // No photo, just create the promotion
    const promotion = this.promotionRepository.create(createPromotionDto);
    return await this.promotionRepository.save(promotion);
  }

  async findAll(findPromotionsDto: FindPromotionsDto): Promise<{
    promotions: Promotion[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, page = 1, limit = 10 } = findPromotionsDto;

    const queryBuilder = this.promotionRepository
      .createQueryBuilder('promotion')
      .orderBy('promotion.createdAt', 'DESC');

    if (status) {
      queryBuilder.where('promotion.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    const promotions = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      promotions,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({ where: { id } });

    if (!promotion) {
      throw new NotFoundException(`Promotion with id ${id} not found`);
    }

    return promotion;
  }

  async update(id: number, updatePromotionDto: UpdatePromotionDto): Promise<Promotion> {
    const promotion = await this.findOne(id);
    let newPhotoPath = updatePromotionDto.photo;
    
    // If there's a new photo but update fails, clean up the orphaned file
    if (newPhotoPath && newPhotoPath !== promotion.photo) {
      try {
        Object.assign(promotion, updatePromotionDto);
        return await this.promotionRepository.save(promotion);
      } catch (error) {
        // If database save fails, delete the uploaded file
        const filePath = path.join(process.cwd(), newPhotoPath);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.error('Cleaned up orphaned photo:', newPhotoPath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up photo:', cleanupError);
        }
        throw error;
      }
    }
    
    // No new photo or same photo, just update normally
    Object.assign(promotion, updatePromotionDto);
    return await this.promotionRepository.save(promotion);
  }

  async remove(id: number): Promise<void> {
    const promotion = await this.findOne(id);

    // Delete photo file if exists
    if (promotion.photo) {
      const filePath = path.join(process.cwd(), promotion.photo);

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting promotion photo:', error);
      }
    }

    await this.promotionRepository.remove(promotion);
  }

  async changeStatus(id: number, status: PromotionStatus): Promise<Promotion> {
    const promotion = await this.findOne(id);
    promotion.status = status;
    return await this.promotionRepository.save(promotion);
  }

  async addPhoto(id: number, photo: string): Promise<Promotion> {
    const promotion = await this.findOne(id);
    promotion.photo = photo;
    return await this.promotionRepository.save(promotion);
  }

  async removePhoto(id: number, photo: string): Promise<Promotion> {
    const promotion = await this.findOne(id);

    // Delete the specified photo file if it exists
    const filePath = path.join(process.cwd(), photo);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting promotion photo:', error);
    }

    // Clear photo from promotion if it matches
    if (promotion.photo === photo) {
      promotion.photo = null;
      return await this.promotionRepository.save(promotion);
    }

    return promotion;
  }
}
