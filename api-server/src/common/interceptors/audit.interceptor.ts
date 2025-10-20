import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditLogService } from '../services/audit-log.service';
import { AuditAction, AuditEntityType } from '../entities/audit-log.entity';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditMetadata {
  action: AuditAction;
  entityType: AuditEntityType;
  description?: string;
}

/**
 * 审计日志装饰器
 */
export const AuditLog = (metadata: AuditMetadata) =>
  Reflector.prototype.getAllAndOverride.bind(null, AUDIT_LOG_KEY, metadata);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.getAllAndOverride<AuditMetadata>(
      AUDIT_LOG_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any; // JWT用户信息

    return next.handle().pipe(
      tap(async (result) => {
        try {
          // 提取实体ID（假设结果中包含id字段）
          let entityId: number | undefined;
          if (result?.data?.id) {
            entityId = result.data.id;
          } else if (result?.id) {
            entityId = result.id;
          } else if (request.params?.id) {
            entityId = parseInt(request.params.id);
          }

          // 记录审计日志
          await this.auditLogService.log({
            action: auditMetadata.action,
            entityType: auditMetadata.entityType,
            entityId,
            userId: user?.id,
            userName: user?.name || user?.email,
            description:
              auditMetadata.description ||
              `${auditMetadata.action} ${auditMetadata.entityType}`,
            newData: this.sanitizeData(result),
            request,
          });
        } catch (error) {
          // 审计日志记录失败不应影响正常流程
          console.error('审计日志记录失败:', error);
        }
      }),
    );
  }

  /**
   * 清理敏感数据
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };

    // 移除密码等敏感字段
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
      if (sanitized.data?.[field]) {
        sanitized.data[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
