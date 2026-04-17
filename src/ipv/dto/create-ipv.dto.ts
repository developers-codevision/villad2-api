import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IpvType } from '../entities/ipv.entity';

export class CreateIpvDto {
	@ApiProperty({
		example: 'COC-001',
		description: 'Código asignado al IPV',
	})
	@IsString()
	@IsNotEmpty()
	code: string;

	@ApiProperty({
		example: IpvType.COCINA,
		description: 'Tipo de IPV',
		enum: IpvType,
	})
	@IsEnum(IpvType)
	@IsNotEmpty()
	type: IpvType;

	@ApiPropertyOptional({
		example: 1,
		description: 'ID de Product asociado',
	})
	@IsNumber()
	@IsOptional()
	productId?: number;
}
