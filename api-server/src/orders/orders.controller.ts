import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import type { OrderFilterDto } from './dto/order.dto';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { Order } from './entities/order.entity';

@ApiTags('订单管理')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: '获取订单列表', description: '支持分页和过滤' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'userId', required: false, description: '用户ID' })
  @ApiQuery({ name: 'status', required: false, description: '订单状态' })
  @ApiResponse({ status: 200, description: '返回订单列表' })
  async getOrders(@Query() filter: OrderFilterDto): Promise<{
    data: Order[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return await this.ordersService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个订单' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiResponse({ status: 200, description: '返回订单信息' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async getOrderById(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return await this.ordersService.findById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户的订单列表' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '返回用户订单列表' })
  async getUserOrders(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Order[]> {
    return await this.ordersService.findByUserId(userId);
  }

  @Post()
  @ApiOperation({ summary: '创建订单' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: '订单创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async createOrder(
    @Body(ValidationPipe) createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return await this.ordersService.create(createOrderDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新订单状态' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: '订单状态更新成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return await this.ordersService.updateStatus(
      id,
      updateOrderStatusDto.status,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: '取消订单' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiResponse({ status: 200, description: '订单取消成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async cancelOrder(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return await this.ordersService.cancel(id);
  }
}
