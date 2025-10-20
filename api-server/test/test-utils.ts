import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { vi } from 'vitest';

/**
 * 创建模拟的Repository
 */
export function createMockRepository<T = any>(): Partial<Repository<T>> {
  return {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    remove: vi.fn(),
    count: vi.fn(),
    exist: vi.fn(),
    createQueryBuilder: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      getOne: vi.fn(),
      getMany: vi.fn(),
      getManyAndCount: vi.fn(),
    } as any),
  };
}

/**
 * 创建测试模块的辅助函数
 */
export async function createTestingModule(
  providers: any[],
  imports: any[] = [],
): Promise<TestingModule> {
  return await Test.createTestingModule({
    imports,
    providers,
  }).compile();
}

/**
 * 为测试创建应用实例
 */
export async function createTestApp(
  module: TestingModule,
): Promise<INestApplication> {
  const app = module.createNestApplication();
  // 在这里添加全局配置
  return app;
}

/**
 * 生成测试用的JWT Token
 */
export function generateTestToken(payload: any = {}): string {
  const defaultPayload = {
    sub: 1,
    email: 'test@example.com',
    role: 'user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload,
  };

  // 这里应该使用测试用的JWT secret
  return Buffer.from(JSON.stringify(defaultPayload)).toString('base64');
}

/**
 * 生成测试数据的工厂函数
 */
export class TestDataFactory {
  static createUser(overrides: any = {}) {
    return {
      id: 1,
      name: '测试用户',
      email: 'test@example.com',
      age: 25,
      role: 'user',
      createdAt: new Date(),
      ...overrides,
    };
  }

  static createProduct(overrides: any = {}) {
    return {
      id: 1,
      name: '测试商品',
      price: 99.99,
      category: '测试分类',
      description: '测试商品描述',
      stock: 100,
      createdAt: new Date(),
      ...overrides,
    };
  }

  static createOrder(overrides: any = {}) {
    return {
      id: 1,
      userId: 1,
      totalAmount: 99.99,
      status: 'pending',
      address: '测试地址',
      createdAt: new Date(),
      ...overrides,
    };
  }
}

/**
 * 数据库清理工具
 */
export class DatabaseCleaner {
  static async clearDatabase(repositories: Repository<any>[]) {
    for (const repository of repositories) {
      await repository.clear();
    }
  }

  static async resetAutoIncrement(repositories: Repository<any>[]) {
    // SQLite specific reset
    for (const repository of repositories) {
      const tableName = repository.metadata.tableName;
      await repository.query(
        `DELETE FROM sqlite_sequence WHERE name='${tableName}'`,
      );
    }
  }
}
