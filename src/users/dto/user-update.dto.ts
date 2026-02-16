import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
  @IsString()
  @IsOptional()
  refreshToken?: string;

}