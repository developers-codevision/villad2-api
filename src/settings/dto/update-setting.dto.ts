import { IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  key?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  type?: string;
}
