import { existsSync, mkdirSync } from 'node:fs';
import { createLogger, format, transports } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, errors } = format;

// 自定义日志格式
const logFormat = printf(
  ({ level, message, timestamp, stack, context, ...meta }) => {
    let logMessage = `${timestamp} [${level}]`;

    if (context) {
      logMessage += ` [${context}]`;
    }

    logMessage += ` ${message}`;

    if (stack) {
      logMessage += `\n${stack}`;
    }

    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  },
);

// 控制台日志格式（带颜色）
const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  logFormat,
);

// 文件日志格式（无颜色）
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  logFormat,
);

// 创建日志传输器
const createTransports = () => {
  const logTransports = [];

  // 确保日志目录存在
  if (!existsSync('logs')) {
    mkdirSync('logs', { recursive: true });
  }

  // 控制台输出
  logTransports.push(
    new transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: consoleFormat,
    }),
  );

  // 错误日志文件
  logTransports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  );

  // 综合日志文件
  logTransports.push(
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
    }),
  );

  // 开发环境下的调试日志
  if (process.env.NODE_ENV !== 'production') {
    logTransports.push(
      new DailyRotateFile({
        filename: 'logs/debug-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'debug',
        format: fileFormat,
        maxSize: '20m',
        maxFiles: '7d',
        zippedArchive: true,
      }),
    );
  }

  return logTransports;
};

// 创建Winston logger实例
export const winstonLogger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: fileFormat,
  defaultMeta: { service: 'faker-api' },
  transports: createTransports(),
  // 确保始终有控制台输出作为最低要求
  exitOnError: false,
  silent: false,
  // 捕获未处理的异常和Promise拒绝
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

// NestJS Winston配置
export const winstonConfig = {
  instance: winstonLogger,
};
