import 'reflect-metadata';
import { afterAll, beforeAll } from 'vitest';

// 设置测试环境变量
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET =
    'test-jwt-secret-key-for-testing-only-please-change-in-production';
  process.env.DB_TYPE = 'sqljs';
  process.env.DB_SYNCHRONIZE = 'true';
  process.env.DB_LOGGING = 'false';
  process.env.LOG_LEVEL = 'error'; // 减少测试时的日志输出
});

afterAll(async () => {
  // 清理测试环境
});
