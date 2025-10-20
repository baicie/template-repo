import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class OrderItemDto {
  @ApiProperty({ description: '商品ID', example: 1 })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ description: '商品名称', example: 'iPhone 14' })
  @IsString()
  name: string;

  @ApiProperty({ description: '商品价格', example: 5999 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: '购买数量', example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: '用户ID', example: 1 })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({ description: '订单商品', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: '收货地址', example: '北京市朝阳区XX街道' })
  @IsString()
  address: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ description: '订单状态', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class OrderFilterDto {
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

  @ApiProperty({ description: '用户ID', required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  userId?: number;

  @ApiProperty({ description: '订单状态', required: false, enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
