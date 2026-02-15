import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class FileService {
  private readonly uploadPath = path.join(process.cwd(), 'media/rooms');
  async saveFile(file: Express.Multer.File): Promise<string> {
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = path.join(this.uploadPath, fileName);

    // Ensure the directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
    // Read the file from disk and write it to the new location
    const fileContent = await fs.promises.readFile(file.path);
    await fs.promises.writeFile(filePath, fileContent);

    // Delete the temporary file
    await fs.promises.unlink(file.path);

    return `media/rooms/${fileName}`;
  }
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    try {
      await fs.promises.unlink(fullPath);
    } catch (error) {
      // Verificar si el error es porque el archivo no existe
      if (
        error instanceof Error &&
        'code' in error &&
        (error as NodeJS.ErrnoException).code !== 'ENOENT'
      ) {
        throw error;
      }
      // Si el error es ENOENT (archivo no existe), no hacemos nada
    }
  }
}
