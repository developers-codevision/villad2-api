// rooms/rooms.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { FileService } from '../common/files/file.service';
import { RoomStatus } from './enums/room-enums.enum';
import { UpdateRoomDto } from './dto/create-room.dto';
@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly fileService: FileService,
  ) {}
  async create(
    createRoomDto: CreateRoomDto,
    files: {
      mainPhoto: Express.Multer.File[];
      additionalPhotos?: Express.Multer.File[];
    },
  ): Promise<Room> {
    const mainPhotoPath = await this.fileService.saveFile(files.mainPhoto[0]);

    let additionalPhotosPaths: string[] = [];
    if (files.additionalPhotos && files.additionalPhotos.length > 0) {
      additionalPhotosPaths = await Promise.all(
        files.additionalPhotos.map((file) => this.fileService.saveFile(file)),
      );
    }
    // Crear la habitación con las rutas de las imágenes
    const room = this.roomRepository.create({
      ...createRoomDto,
      mainPhoto: [mainPhotoPath],
      additionalPhotos: additionalPhotosPaths,
    });
    return this.roomRepository.save(room);
  }

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async update(
    id: number,
    updateRoomDto: UpdateRoomDto,
    files?: {
      mainPhoto?: Express.Multer.File[];
      additionalPhotos?: Express.Multer.File[];
    },
  ): Promise<Room> {
    const room = await this.findOne(id);

    const oldMain = room.mainPhoto || [];
    const oldAdditional = room.additionalPhotos || [];

    let finalMain = updateRoomDto.mainPhoto ?? oldMain;
    let finalAdditional = updateRoomDto.additionalPhotos ?? oldAdditional;

    if (!Array.isArray(finalMain)) finalMain = [];
    if (!Array.isArray(finalAdditional)) finalAdditional = [];

    if (files?.mainPhoto && files.mainPhoto.length > 0) {
      const savedMainPath = await this.fileService.saveFile(files.mainPhoto[0]);
      finalMain = [savedMainPath];
    }

    if (files?.additionalPhotos && files.additionalPhotos.length > 0) {
      const savedAdditionalPaths = await Promise.all(
        files.additionalPhotos.map((file) => this.fileService.saveFile(file)),
      );
      finalAdditional = [...finalAdditional, ...savedAdditionalPaths];
    }

    const oldSet = new Set<string>([...oldMain, ...oldAdditional]);
    const newSet = new Set<string>([...finalMain, ...finalAdditional]);
    const toDelete = [...oldSet].filter((p) => !newSet.has(p));

    await Promise.all(
      toDelete
        .filter((p) => typeof p === 'string' && p.startsWith('media/rooms/'))
        .map((p) => this.fileService.deleteFile(p)),
    );

    Object.assign(room, updateRoomDto);
    room.mainPhoto = finalMain;
    room.additionalPhotos = finalAdditional;

    return await this.roomRepository.save(room);
  }

  async remove(id: number): Promise<void> {
    const result = await this.roomRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
  }

  async updateStatus(id: number, status: RoomStatus): Promise<Room> {
    const room = await this.findOne(id);
    room.status = status;
    return await this.roomRepository.save(room);
  }

  async findAvailableRooms(roomType?: string): Promise<Room[]> {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .where('room.status = :status', { status: RoomStatus.AVAILABLE });

    if (roomType) {
      query.andWhere('room.roomType = :roomType', { roomType });
    }

    return await query.getMany();
  }
}
