import { Injectable } from '@nestjs/common';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { PaginatedResponseDto, PaginationDto } from '../dto/pagination.dto';

@Injectable()
export class PaginationService {
  /**
   * 通用分页查询方法
   */
  async paginate<T>(
    repository: Repository<T>,
    paginationDto: PaginationDto,
    options: FindManyOptions<T> = {},
    searchFields: (keyof T)[] = [],
  ): Promise<PaginatedResponseDto<T>> {
    const {
      page = 1,
      limit = 10,
      sortBy,
      sortOrder = 'DESC',
      search,
    } = paginationDto;

    // 构建查询条件
    const findOptions: FindManyOptions<T> = {
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    };

    // 添加排序
    if (sortBy) {
      findOptions.order = {
        [sortBy]: sortOrder,
      } as any;
    }

    // 添加搜索条件
    if (search && searchFields.length > 0) {
      const searchConditions = searchFields.map((field) => ({
        [field]: ILike(`%${search}%`),
      }));

      if (options.where) {
        // 如果已有where条件，需要合并
        findOptions.where = searchConditions.map((condition) => ({
          ...options.where,
          ...condition,
        })) as any;
      } else {
        findOptions.where = searchConditions as any;
      }
    }

    // 执行查询
    const [data, total] = await repository.findAndCount(findOptions);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * 使用QueryBuilder的分页查询
   */
  async paginateQueryBuilder<T>(
    queryBuilder: any,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<T>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'DESC' } = paginationDto;

    // 添加排序
    if (sortBy) {
      queryBuilder.orderBy(sortBy, sortOrder);
    }

    // 添加分页
    queryBuilder.skip((page - 1) * limit).take(limit);

    // 执行查询
    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResponseDto(data, total, page, limit);
  }

  /**
   * 计算分页偏移量
   */
  static getOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * 验证分页参数
   */
  static validatePagination(
    page: number,
    limit: number,
  ): { page: number; limit: number } {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // 最大100条

    return { page: validPage, limit: validLimit };
  }
}
