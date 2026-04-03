import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DailyAttendanceService } from './daily-attendance.service';
import { CreateDailyAttendanceDto } from './dto/create-daily-attendance.dto';
import { UpdateDailyAttendanceDto } from './dto/update-daily-attendance.dto';

@ApiTags('Asistencia Diaria')
@Controller('daily-attendance')
export class DailyAttendanceController {
  constructor(
    private readonly dailyAttendanceService: DailyAttendanceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new dailyAttendance record' })
  create(@Body() createDailyAttendanceDto: CreateDailyAttendanceDto) {
    return this.dailyAttendanceService.create(createDailyAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dailyAttendance records' })
  findAll() {
    return this.dailyAttendanceService.findAll();
  }

  @Get('staff/:staffId')
  @ApiOperation({
    summary:
      'Get dailyAttendance records for a specific staff by their ID (with optional date filters)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Fecha de inicio (YYYY-MM-DD)',
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Fecha fin (YYYY-MM-DD)',
    type: String,
  })
  findByStaff(
    @Param('staffId') staffId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dailyAttendanceService.findByStaff(
      +staffId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an dailyAttendance record by ID' })
  findOne(@Param('id') id: string) {
    return this.dailyAttendanceService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an dailyAttendance record' })
  update(
    @Param('id') id: string,
    @Body() updateDailyAttendanceDto: UpdateDailyAttendanceDto,
  ) {
    return this.dailyAttendanceService.update(+id, updateDailyAttendanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an dailyAttendance record' })
  remove(@Param('id') id: string) {
    return this.dailyAttendanceService.remove(+id);
  }
}
