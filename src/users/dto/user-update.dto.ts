import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Indica si el usuario está activo',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el usuario está verificado',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Token de actualización del usuario',
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
