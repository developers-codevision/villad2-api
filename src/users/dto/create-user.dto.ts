import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/users/enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'admin123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'admin@hostal.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Nombre completo del usuario',
    example: 'Administrador del Sistema',
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del usuario',
    example: '+53 55555555',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Roles del usuario',
    enum: UserRole,
    isArray: true,
    example: [UserRole.ADMIN],
  })
  @IsEnum(UserRole, { each: true })
  @IsOptional()
  roles?: UserRole[] = [UserRole.USER];
}
