// rooms/rooms.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from '../config/multer.config';
import { FileService } from '../common/files/file.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    MulterModule.register(multerOptions),
  ],
  controllers: [RoomsController],
  providers: [RoomsService, FileService],
  exports: [RoomsService],
})
export class RoomsModule {}
