import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SaleItemDto {
  @ApiProperty({ example: 'variant-uuid' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 92000 })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ example: ['IMEI12345'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imeis?: string[];
}

export class CreateSaleDto {
  @ApiProperty({ example: 'INV-S-001' })
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @ApiProperty({ example: 'customer-uuid' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: '2023-10-26' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  discount: number;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  vat: number;

  @ApiProperty({ type: [SaleItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];
}
