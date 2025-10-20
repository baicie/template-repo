import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const ctx = context.switchToHttp();
    const _request = ctx.getRequest();

    const startTime = Date.now();
    const logPrefix = `${className}.${methodName}`;

    // 记录方法调用开始
    this.logger.debug(`${logPrefix} - 开始执行`);

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        this.logger.debug(`${logPrefix} - 执行完成 (${duration}ms)`);
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        this.logger.error(
          `${logPrefix} - 执行失败 (${duration}ms): ${error.message}`,
          error.stack,
        );
        throw error;
      }),
    );
  }
}
