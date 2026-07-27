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

class PurchaseItemDto {
  @ApiProperty({ example: 'variant-uuid' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 85000 })
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ example: ['IMEI12345', 'IMEI67890'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imeis?: string[];
}

export class CreatePurchaseDto {
  @ApiProperty({ example: 'INV-2023-001' })
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @ApiProperty({ example: 'supplier-uuid' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ example: '2023-10-25' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ type: [PurchaseItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];

  @ApiPropertyOptional({ example: 'First batch of S25' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
