import { IsString, IsOptional, IsArray } from 'class-validator';

export class PaypalOrderItemDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  unit_amount: string;

  @IsString()
  quantity: string;
}

export class CreatePaypalOrderDto {
  @IsString()
  intent: string;

  items: PaypalOrderItemDto[];

  @IsString()
  amount: string;

  @IsString()
  currency: string;

  @IsString()
  return_url: string;

  @IsString()
  cancel_url: string;

  @IsOptional()
  @IsString()
  reference_id?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class PaypalOrderResponseDto {
  @IsString()
  id: string;

  @IsString()
  status: string;

  @IsArray()
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}
