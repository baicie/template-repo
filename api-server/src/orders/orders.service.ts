import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CreateOrderDto, OrderFilterDto } from './dto/order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
  ) {}

  async findAll(filter: OrderFilterDto) {
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    if (filter.userId) {
      queryBuilder.where('order.userId = :userId', { userId: filter.userId });
    }

    if (filter.status) {
      queryBuilder.andWhere('order.status = :status', {
        status: filter.status,
      });
    }

    // 计算分页
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(`订单ID ${id} 不存在`);
    }
    return order;
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { userId },
      relations: ['items'],
    });
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // 计算订单总金额
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 创建订单
    const order = this.ordersRepository.create({
      userId: createOrderDto.userId,
      totalAmount,
      status: OrderStatus.PENDING,
      address: createOrderDto.address,
    });

    // 先保存订单以获取ID
    const savedOrder = await this.ordersRepository.save(order);

    // 创建订单项
    const orderItems = createOrderDto.items.map((item) =>
      this.orderItemsRepository.create({
        ...item,
        order: savedOrder,
      }),
    );

    // 保存订单项
    const savedItems = await this.orderItemsRepository.save(orderItems);

    // 返回完整的订单信息
    savedOrder.items = savedItems;
    return savedOrder;
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.findById(id);

    // 检查状态转换是否合法
    this.validateStatusTransition(order.status, status);

    order.status = status;
    return await this.ordersRepository.save(order);
  }

  async cancel(id: number): Promise<Order> {
    const order = await this.findById(id);

    // 只有待付款或已付款的订单可以取消
    if (![OrderStatus.PENDING, OrderStatus.PAID].includes(order.status)) {
      throw new BadRequestException('只有待付款或已付款的订单可以取消');
    }

    order.status = OrderStatus.CANCELLED;
    return await this.ordersRepository.save(order);
  }

  // 验证订单状态转换是否合法
  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const allowedTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
      [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `订单状态从 ${currentStatus} 到 ${newStatus} 的转换不允许`,
      );
    }
  }
}
