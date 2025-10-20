import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException, ErrorCode } from '../exceptions/business.exception';
import type { ErrorResponse } from '../interfaces/response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly i18n: any) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let code: number;
    let details: any;

    // 获取当前语言
    const lang = this.i18n.resolveLanguage
      ? this.i18n.resolveLanguage(request)
      : 'zh';

    if (exception instanceof BusinessException) {
      // 业务异常
      const businessException = exception.getResponse() as any;
      status = exception.getStatus();
      code = businessException.code;

      // 如果有翻译key，使用翻译
      if (businessException.translationKey) {
        try {
          message = await this.i18n.translate(
            businessException.translationKey,
            {
              lang,
              args: businessException.translationArgs || {},
            },
          );
        } catch (_translationError) {
          // 翻译失败时使用原始消息
          message = businessException.message;
        }
      } else {
        message = businessException.message;
      }
    } else if (exception instanceof HttpException) {
      // HTTP异常
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        const responseMessage = (exceptionResponse as any).message;
        message = Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : String(responseMessage);
        details = exceptionResponse;
      } else {
        message = String(exceptionResponse) || exception.message;
      }

      code = this.mapHttpStatusToErrorCode(status);

      // 尝试翻译常见的HTTP错误
      try {
        const translatedMessage = await this.i18n.translate(
          `common.${this.getHttpErrorKey(status)}`,
          {
            lang,
          },
        );
        if (translatedMessage !== `common.${this.getHttpErrorKey(status)}`) {
          message = translatedMessage;
        }
      } catch {
        // 翻译失败时保持原消息
      }
    } else {
      // 未知异常
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = ErrorCode.UNKNOWN_ERROR;

      try {
        message = await this.i18n.translate('common.internalError', { lang });
      } catch {
        message = '服务器内部错误';
      }

      // 记录未知错误日志
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse: ErrorResponse = {
      success: false,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && { details }),
    };

    // 根据错误级别记录日志
    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception);
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${message}`);
    }

    response.status(status).json(errorResponse);
  }

  private mapHttpStatusToErrorCode(status: HttpStatus): number {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      default:
        return ErrorCode.UNKNOWN_ERROR;
    }
  }

  private getHttpErrorKey(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'badRequest';
      case HttpStatus.UNAUTHORIZED:
        return 'unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'forbidden';
      case HttpStatus.NOT_FOUND:
        return 'notFound';
      default:
        return 'error';
    }
  }
}
