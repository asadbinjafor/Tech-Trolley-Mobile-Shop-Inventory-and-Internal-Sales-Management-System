import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../user-role.enum';

export class RegisterDto {
  @ApiProperty({ example: 'Sales Employee' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'sales@techtrolley.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPass1!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must contain at least 8 characters.',
  })
  @MaxLength(12, {
    message: 'Password must contain no more than 12 characters.',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must include at least one uppercase letter.',
  })
  @Matches(/[a-z]/, {
    message: 'Password must include at least one lowercase letter.',
  })
  @Matches(/[0-9]/, {
    message: 'Password must include at least one number.',
  })
  @Matches(/[^A-Za-z0-9\s]/, {
    message: 'Password must include at least one special symbol.',
  })
  @Matches(/^\S*$/, {
    message: 'Password must not contain spaces.',
  })
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SALESPERSON })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
