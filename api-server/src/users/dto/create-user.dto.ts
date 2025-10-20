import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: '张三' })
  @IsString()
  name: string;

  @ApiProperty({ description: '邮箱地址', example: 'zhangsan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '年龄', example: 25 })
  @IsInt()
  @Min(1)
  age: number;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ description: '用户角色', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
