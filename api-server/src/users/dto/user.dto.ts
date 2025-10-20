import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名称', example: '张三' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '邮箱地址', example: 'zhangsan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '年龄', example: 25 })
  @IsInt()
  @Min(0)
  age: number;
}

export class UpdateUserDto {
  @ApiProperty({ description: '用户名称', required: false, example: '张三' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '邮箱地址',
    required: false,
    example: 'zhangsan@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '年龄', required: false, example: 25 })
  @IsInt()
  @Min(0)
  @IsOptional()
  age?: number;
}

export class UserFilterDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: '用户名过滤', required: false, example: '张' })
  @IsString()
  @IsOptional()
  name?: string;
}
