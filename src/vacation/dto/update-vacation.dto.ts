import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateVacationDto } from './create-vacation.dto';


export class UpdateVacationDto extends PartialType(OmitType(CreateVacationDto, ['staffId'] as const) ) {}