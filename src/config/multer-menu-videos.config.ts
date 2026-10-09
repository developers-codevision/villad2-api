// config/multer-menu-videos.config.ts
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const videosDir = path.join(
  process.env.MEDIA_PATH || path.join(process.cwd(), 'media'),
  'menu-videos',
);
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Deterministic names: product-167.mp4 / cat-2.mp4 (replace = overwrite in place)
export function multerMenuVideoOptions(kind: 'product' | 'category') {
  const prefix = kind === 'category' ? 'cat' : 'product';
  return {
    storage: diskStorage({
      destination: (req, file, cb) => cb(null, videosDir),
      filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname).toLowerCase() || '.mp4';
        cb(null, `${prefix}-${req.params.id}${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const okExt = ['.mp4', '.webm', '.mov'].includes(
        path.extname(file.originalname).toLowerCase(),
      );
      const okMime = /mp4|webm|quicktime/.test(file.mimetype);
      if (okExt && okMime) return cb(null, true);
      cb(new BadRequestException('Solo se permiten videos (mp4, webm, mov)') as any, false);
    },
    limits: {
      fileSize: 25 * 1024 * 1024, // 25MB
    },
  };
}
