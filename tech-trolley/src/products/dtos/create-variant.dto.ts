import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVariantDto {
  @ApiProperty({ example: 'Navy Blue' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: '8GB' })
  @IsString()
  @IsNotEmpty()
  ram: string;

  @ApiProperty({ example: '256GB' })
  @IsString()
  @IsNotEmpty()
  storage: string;

  @ApiProperty({ example: 85000 })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty({ example: 92000 })
  @IsNumber()
  @Min(0)
  sellingPrice: number;
}
