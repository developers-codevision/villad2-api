import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RoomsService } from './rooms.service';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/create-room.dto';
import { RoomStatus, RoomType } from './enums/room-enums.enum';
import { RoomResponseDto } from './dto/response-room.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../config/multer.config';
@ApiTags('rooms')
@Controller('rooms')
@ApiExtraModels(UpdateRoomDto, CreateRoomDto)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainPhoto', maxCount: 1 },
        { name: 'additionalPhotos', maxCount: 10 },
      ],
      multerOptions,
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({
    status: 201,
    description: 'The room has been successfully created.',
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreateRoomDto) },
        {
          type: 'object',
          properties: {
            mainPhoto: {
              type: 'string',
              format: 'binary',
            },
            additionalPhotos: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
      ],
    },
  })
  async create(
    @UploadedFiles()
    files: {
      mainPhoto?: Express.Multer.File[];
      additionalPhotos?: Express.Multer.File[];
    },
    @Body() createRoomDto: CreateRoomDto,
  ) {
    console.log('Files:', files);
    console.log('CreateRoomDto:', createRoomDto);

    console.log(createRoomDto);
    return this.roomsService.create(createRoomDto, {
      mainPhoto: files.mainPhoto,
      additionalPhotos: files.additionalPhotos || [],
    });
  }
  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiResponse({
    status: 200,
    description: 'Return all rooms',
    type: [RoomResponseDto],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter rooms by type',
    enum: RoomType,
    example: RoomType.STANDARD,
  })
  async findAll(@Query('type') type?: RoomType): Promise<Room[]> {
    if (type) {
      return this.roomsService.findAvailableRooms(type);
    }
    return this.roomsService.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a room by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the room',
    type: RoomResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiParam({ name: 'id', description: 'Room ID', example: 1 })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Room> {
    return this.roomsService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainPhoto', maxCount: 1 },
        { name: 'additionalPhotos', maxCount: 10 },
      ],
      multerOptions,
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: getSchemaPath(UpdateRoomDto) },
        {
          type: 'object',
          properties: {
            mainPhoto: {
              type: 'string',
              format: 'binary',
            },
            additionalPhotos: {
              type: 'array',
              items: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
      ],
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: {
      mainPhoto?: Express.Multer.File[];
      additionalPhotos?: Express.Multer.File[];
    },
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    return this.roomsService.update(id, updateRoomDto, {
      mainPhoto: files?.mainPhoto,
      additionalPhotos: files?.additionalPhotos || [],
    });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.roomsService.remove(id);
  }

  @Put(':id/status/:status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status') status: RoomStatus,
  ): Promise<Room> {
    return this.roomsService.updateStatus(id, status);
  }
}
