import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TrackingType {
  SERIALIZED = 'SERIALIZED',
  QUANTITY = 'QUANTITY',
}

export class CreateProductDto {
  @ApiProperty({ example: 'Samsung Galaxy S25' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'brand-uuid' })
  @IsUUID()
  brandId: string;

  @ApiProperty({ example: 'category-uuid' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ enum: TrackingType, example: TrackingType.SERIALIZED })
  @IsEnum(TrackingType)
  trackingType: TrackingType;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
