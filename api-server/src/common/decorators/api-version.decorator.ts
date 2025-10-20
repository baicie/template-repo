import { SetMetadata } from '@nestjs/common';

export const API_VERSION_KEY = 'api_version';

/**
 * API版本装饰器
 */
export const ApiVersion = (version: string | string[]) =>
  SetMetadata(API_VERSION_KEY, Array.isArray(version) ? version : [version]);

/**
 * 标记为已废弃的API
 */
export const ApiDeprecated = (message?: string) =>
  SetMetadata('deprecated', {
    deprecated: true,
    message: message || '此API已废弃，请使用新版本',
  });

/**
 * 标记为实验性API
 */
export const ApiExperimental = (message?: string) =>
  SetMetadata('experimental', {
    experimental: true,
    message: message || '此API为实验性功能，可能会有变更',
  });
