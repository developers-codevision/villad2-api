import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IpvType } from '../entities/ipv.entity';

export class CreateIpvDto {
	
	@ApiProperty({
		example: IpvType.COCINA,
		description: 'Tipo de IPV',
		enum: IpvType,
	})
	@IsEnum(IpvType)
	@IsNotEmpty()
	type: IpvType;

	@ApiPropertyOptional({
		example: 'Revisión mensual de inventario',
		description: 'Comentarios adicionales o notas de revisión',
	})
	@IsString()
	@IsOptional()
	review?: string;

	@ApiPropertyOptional({
		example: 10,
		description: 'Cantidad de entradas de producto al inventario',
	})
	@IsNumber()
	@IsOptional()
	intake?: number;

	@ApiPropertyOptional({
		example: 2,
		description: 'Cantidad de mermas o pérdidas',
	})
	@IsNumber()
	@IsOptional()
	decrease?: number;

	@ApiPropertyOptional({
		example: 15,
		description: 'Cantidad consumida/facturada',
	})
	@IsNumber()
	@IsOptional()
	bills?: number;
}
