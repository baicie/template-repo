import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // 记录请求开始
    this.logger.log(`${method} ${url} - ${ip} - ${userAgent}`);

    // 监听响应完成
    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length') || 0;
      const responseTime = Date.now() - startTime;

      const logLevel = statusCode >= 400 ? 'warn' : 'log';
      const logMessage = `${method} ${url} ${statusCode} ${contentLength}bytes - ${responseTime}ms - ${ip}`;

      if (logLevel === 'warn') {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
