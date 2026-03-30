import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAbsenceDto } from './create-absence.dto';

export class UpdateAbsenceDto extends PartialType(OmitType(CreateAbsenceDto, ['staffId'] as const)) {}