import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import {
  AuditAction,
  AuditEntityType,
  AuditLog,
} from '../entities/audit-log.entity';
import { PaginatedResponseDto, PaginationDto } from '../dto/pagination.dto';
import { PaginationService } from './pagination.service';

export interface AuditLogOptions {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: number;
  userId?: number;
  userName?: string;
  description?: string;
  oldData?: any;
  newData?: any;
  metadata?: any;
  request?: Request;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private paginationService: PaginationService,
  ) {}

  /**
   * 记录审计日志
   */
  async log(options: AuditLogOptions): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      userId: options.userId,
      userName: options.userName,
      description: options.description,
      oldData: options.oldData,
      newData: options.newData,
      metadata: options.metadata,
      userIp: this.extractIpFromRequest(options.request),
      userAgent: options.request?.headers['user-agent'],
    });

    return await this.auditLogRepository.save(auditLog);
  }

  /**
   * 快捷方法：记录创建操作
   */
  async logCreate(
    entityType: AuditEntityType,
    entityId: number,
    newData: any,
    userId?: number,
    userName?: string,
    request?: Request,
  ): Promise<AuditLog> {
    return this.log({
      action: AuditAction.CREATE,
      entityType,
      entityId,
      userId,
      userName,
      newData,
      description: `创建${entityType}记录`,
      request,
    });
  }

  /**
   * 快捷方法：记录更新操作
   */
  async logUpdate(
    entityType: AuditEntityType,
    entityId: number,
    oldData: any,
    newData: any,
    userId?: number,
    userName?: string,
    request?: Request,
  ): Promise<AuditLog> {
    return this.log({
      action: AuditAction.UPDATE,
      entityType,
      entityId,
      userId,
      userName,
      oldData,
      newData,
      description: `更新${entityType}记录`,
      request,
    });
  }

  /**
   * 快捷方法：记录删除操作
   */
  async logDelete(
    entityType: AuditEntityType,
    entityId: number,
    oldData: any,
    userId?: number,
    userName?: string,
    request?: Request,
  ): Promise<AuditLog> {
    return this.log({
      action: AuditAction.DELETE,
      entityType,
      entityId,
      userId,
      userName,
      oldData,
      description: `删除${entityType}记录`,
      request,
    });
  }

  /**
   * 快捷方法：记录软删除操作
   */
  async logSoftDelete(
    entityType: AuditEntityType,
    entityId: number,
    oldData: any,
    userId?: number,
    userName?: string,
    request?: Request,
  ): Promise<AuditLog> {
    return this.log({
      action: AuditAction.SOFT_DELETE,
      entityType,
      entityId,
      userId,
      userName,
      oldData,
      description: `软删除${entityType}记录`,
      request,
    });
  }

  /**
   * 快捷方法：记录登录操作
   */
  async logLogin(
    userId: number,
    userName: string,
    request?: Request,
    metadata?: any,
  ): Promise<AuditLog> {
    return this.log({
      action: AuditAction.LOGIN,
      entityType: AuditEntityType.AUTH,
      userId,
      userName,
      description: `用户${userName}登录系统`,
      metadata,
      request,
    });
  }

  /**
   * 获取审计日志列表
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<AuditLog>> {
    return await this.paginationService.paginate(
      this.auditLogRepository,
      paginationDto,
      {
        order: { createdAt: 'DESC' },
      },
      ['description', 'userName'], // 可搜索字段
    );
  }

  /**
   * 根据实体获取审计日志
   */
  async findByEntity(
    entityType: AuditEntityType,
    entityId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<AuditLog>> {
    return await this.paginationService.paginate(
      this.auditLogRepository,
      paginationDto,
      {
        where: { entityType, entityId },
        order: { createdAt: 'DESC' },
      },
    );
  }

  /**
   * 根据用户获取审计日志
   */
  async findByUser(
    userId: number,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<AuditLog>> {
    return await this.paginationService.paginate(
      this.auditLogRepository,
      paginationDto,
      {
        where: { userId },
        order: { createdAt: 'DESC' },
      },
    );
  }

  /**
   * 获取审计统计
   */
  async getStatistics(days = 30): Promise<{
    totalLogs: number;
    actionStats: { action: string; count: number }[];
    entityStats: { entityType: string; count: number }[];
    recentActivity: number;
  }> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const totalLogs = await this.auditLogRepository.count();

    // 按操作类型统计
    const actionStats = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(log.id)', 'count')
      .groupBy('log.action')
      .getRawMany();

    // 按实体类型统计
    const entityStats = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('log.entityType', 'entityType')
      .addSelect('COUNT(log.id)', 'count')
      .groupBy('log.entityType')
      .getRawMany();

    // 最近活动数量
    const recentActivity = await this.auditLogRepository
      .createQueryBuilder('log')
      .where('log.createdAt >= :date', { date: daysAgo })
      .getCount();

    return {
      totalLogs,
      actionStats: actionStats.map((item) => ({
        action: item.action,
        count: parseInt(item.count),
      })),
      entityStats: entityStats.map((item) => ({
        entityType: item.entityType,
        count: parseInt(item.count),
      })),
      recentActivity,
    };
  }

  /**
   * 清理旧的审计日志
   */
  async cleanupOldLogs(daysToKeep = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * 从请求中提取IP地址
   */
  private extractIpFromRequest(request?: Request): string | null {
    if (!request) return null;

    const forwarded = request.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers['x-real-ip'] as string;
    if (realIp) {
      return realIp;
    }

    return request.ip || null;
  }
}
