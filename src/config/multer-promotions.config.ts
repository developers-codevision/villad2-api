// config/multer-promotions.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// Asegúrate de que el directorio de medios exista
const mediaDir = path.join(process.cwd(), 'media/promotions');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

export const multerPromotionsOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      cb(null, mediaDir);
    },
    filename: (req, file, cb) => {
      const fileExt = extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png)'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};
