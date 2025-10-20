import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  PaginatedResponseDto,
  PaginationDto,
} from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';
import { UserNotFoundException } from '../common/exceptions/business.exception';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private paginationService: PaginationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 哈希密码
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || UserRole.USER,
    });

    return await this.usersRepository.save(user);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<User>> {
    return await this.paginationService.paginate(
      this.usersRepository,
      paginationDto,
      {
        select: ['id', 'name', 'email', 'age', 'role', 'createdAt'], // 排除密码
      },
      ['name', 'email'], // 可搜索字段
    );
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'age', 'role', 'createdAt'],
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async findById(id: number): Promise<User> {
    return this.findOne(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async softDelete(id: number): Promise<void> {
    const user = await this.findOne(id);
    // 软删除实现（这里简化为标记删除）
    user.name = `[已删除]${user.name}`;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await this.usersRepository.save(user);
  }

  async advancedSearch(
    query: string,
    role?: UserRole,
    paginationDto?: PaginationDto,
  ): Promise<PaginatedResponseDto<User>> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.age',
        'user.role',
        'user.createdAt',
      ]);

    // 添加搜索条件
    if (query) {
      queryBuilder.where('(user.name LIKE :query OR user.email LIKE :query)', {
        query: `%${query}%`,
      });
    }

    // 添加角色过滤
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    return await this.paginationService.paginateQueryBuilder(
      queryBuilder,
      paginationDto || new PaginationDto(),
    );
  }

  async getStatistics(): Promise<{
    totalUsers: number;
    usersByRole: { role: string; count: number }[];
    recentUsers: number;
  }> {
    const totalUsers = await this.usersRepository.count();

    // 按角色统计
    const usersByRole = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('user.role')
      .getRawMany();

    // 最近30天新用户
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :date', { date: thirtyDaysAgo })
      .getCount();

    return {
      totalUsers,
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: parseInt(item.count),
      })),
      recentUsers,
    };
  }
}
