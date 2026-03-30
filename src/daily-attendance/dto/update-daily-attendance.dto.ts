import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDailyAttendanceDto } from './create-daily-attendance.dto';

export class UpdateDailyAttendanceDto extends PartialType(OmitType(CreateDailyAttendanceDto, ['staffId'] as const)) {}
