// config/multer-menu-images.config.ts
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const imagesDir = path.join(
  process.env.MEDIA_PATH || path.join(process.cwd(), 'media'),
  'menu-images',
);
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Unique names: product-250-<ts>-<rand>.jpg (multiple images appended, never overwrite)
export function multerMenuImageOptions() {
  return {
    storage: diskStorage({
      destination: (req, file, cb) => cb(null, imagesDir),
      filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `product-${req.params.id}-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const okExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(
        path.extname(file.originalname).toLowerCase(),
      );
      const okMime = /jpe?g|png|webp|gif/.test(file.mimetype);
      if (okExt && okMime) return cb(null, true);
      cb(new BadRequestException('Solo se permiten imágenes (jpg, png, webp, gif)') as any, false);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB c/u
      files: 12,
    },
  };
}
