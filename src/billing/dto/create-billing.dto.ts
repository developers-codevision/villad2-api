import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNumber,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateBillingDto {
  @ApiProperty({ description: 'Client consecutive number' })
  @IsInt()
  clientNumber: number;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  nationality: string;

  @ApiPropertyOptional({ type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ type: String, format: 'date' })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({ type: String, format: 'date' })
  @IsDateString()
  checkOutDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  roomId?: number;

  @ApiPropertyOptional({ description: 'Immigration number provided by casero' })
  @IsOptional()
  @IsString()
  immigrationNumber?: string;

  @ApiProperty({ description: 'Accounting invoice consecutive number' })
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ description: 'Total amount in CUP' })
  @IsNumber()
  amountCup: number;
}
