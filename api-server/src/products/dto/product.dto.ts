import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: '商品名称', example: 'iPhone 14' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '商品价格', example: 5999 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: '商品分类', example: '手机' })
  @IsString()
  category: string;

  @ApiProperty({ description: '商品描述', example: 'Apple最新款手机' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '库存数量', example: 100 })
  @IsInt()
  @Min(0)
  stock: number;
}

export class UpdateProductDto {
  @ApiProperty({ description: '商品名称', required: false })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '商品价格', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ description: '商品分类', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: '商品描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '库存数量', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;
}

export class ProductFilterDto {
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

  @ApiProperty({ description: '商品分类', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: '最低价格', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ description: '最高价格', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number;
}
