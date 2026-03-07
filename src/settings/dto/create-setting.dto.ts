import { IsString, IsNumber, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  value: number;

  @IsString()
  @MaxLength(20)
  type?: string;
}
