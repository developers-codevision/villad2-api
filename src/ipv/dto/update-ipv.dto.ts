import { PartialType } from '@nestjs/swagger';
import { CreateIpvDto } from './create-ipv.dto';

export class UpdateIpvDto extends PartialType(CreateIpvDto) {}
