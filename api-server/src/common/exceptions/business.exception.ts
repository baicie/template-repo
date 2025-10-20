import { HttpException, HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  // 通用错误 1000-1999
  UNKNOWN_ERROR = 1000,
  VALIDATION_ERROR = 1001,
  UNAUTHORIZED = 1002,
  FORBIDDEN = 1003,
  NOT_FOUND = 1004,

  // 用户相关错误 2000-2999
  USER_NOT_FOUND = 2000,
  USER_ALREADY_EXISTS = 2001,
  INVALID_CREDENTIALS = 2002,

  // 商品相关错误 3000-3999
  PRODUCT_NOT_FOUND = 3000,
  INSUFFICIENT_STOCK = 3001,

  // 订单相关错误 4000-4999
  ORDER_NOT_FOUND = 4000,
  INVALID_ORDER_STATUS = 4001,
  ORDER_CANNOT_BE_CANCELLED = 4002,
}

export class BusinessException extends HttpException {
  constructor(
    message: string,
    errorCode: ErrorCode,
    httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
    translationKey?: string,
    translationArgs?: any,
  ) {
    super(
      {
        code: errorCode,
        message,
        translationKey,
        translationArgs,
        timestamp: new Date().toISOString(),
      },
      httpStatus,
    );
  }
}

// 具体的业务异常类
export class UserNotFoundException extends BusinessException {
  constructor(message = '用户不存在', translationKey = 'user.notFound') {
    super(
      message,
      ErrorCode.USER_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      translationKey,
    );
  }
}

export class ProductNotFoundException extends BusinessException {
  constructor(message = '商品不存在', translationKey = 'product.notFound') {
    super(
      message,
      ErrorCode.PRODUCT_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      translationKey,
    );
  }
}

export class OrderNotFoundException extends BusinessException {
  constructor(message = '订单不存在', translationKey = 'order.notFound') {
    super(
      message,
      ErrorCode.ORDER_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      translationKey,
    );
  }
}

export class InsufficientStockException extends BusinessException {
  constructor(
    message = '库存不足',
    translationKey = 'product.insufficientStock',
  ) {
    super(
      message,
      ErrorCode.INSUFFICIENT_STOCK,
      HttpStatus.BAD_REQUEST,
      translationKey,
    );
  }
}

export class InvalidCredentialsException extends BusinessException {
  constructor(
    message = '用户名或密码错误',
    translationKey = 'auth.login.invalidCredentials',
  ) {
    super(
      message,
      ErrorCode.INVALID_CREDENTIALS,
      HttpStatus.UNAUTHORIZED,
      translationKey,
    );
  }
}
