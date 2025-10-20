# 🧪 测试指南

本项目使用 **Vitest** 作为测试框架，提供完整的单元测试、集成测试和E2E测试覆盖。

## 🚀 快速开始

### 运行所有测试

```bash
# 运行所有测试
pnpm test

# 观察模式运行测试
pnpm test:watch

# 生成测试覆盖率报告
pnpm test:cov

# 启动测试UI界面
pnpm test:ui
```

### 运行特定类型的测试

```bash
# 只运行单元测试
pnpm test:unit

# 只运行E2E测试
pnpm test:e2e
```

## 📊 测试覆盖率

项目配置了严格的测试覆盖率要求：

- **分支覆盖率**: 80%
- **函数覆盖率**: 80%
- **行覆盖率**: 80%
- **语句覆盖率**: 80%

覆盖率报告将生成在 `coverage/` 目录中。

## 🧩 测试架构

### 1. 单元测试 (`*.spec.ts`)

- 位置：与源代码同目录
- 测试：Service 层业务逻辑
- 示例：`src/auth/auth.service.spec.ts`

**特点**：

- 使用 Mock 替代外部依赖
- 快速执行
- 专注业务逻辑验证

### 2. 集成测试/E2E测试 (`test/*.e2e.spec.ts`)

- 位置：`test/` 目录
- 测试：完整的API端点
- 示例：`test/auth.e2e.spec.ts`

**特点**：

- 真实的HTTP请求
- 完整的应用上下文
- 验证端到端流程

## 🛠️ 测试工具

### TestDataFactory

用于生成测试数据：

```typescript
import { TestDataFactory } from '@test/test-utils';

const user = TestDataFactory.createUser({
  email: 'custom@example.com',
});
```

### createMockRepository

创建 TypeORM Repository 的Mock：

```typescript
import { createMockRepository } from '@test/test-utils';

const mockRepository = createMockRepository<User>();
```

### generateTestToken

生成测试用的JWT Token：

```typescript
import { generateTestToken } from '@test/test-utils';

const token = generateTestToken({
  sub: 1,
  role: 'admin',
});
```

## 📝 编写测试

### 单元测试示例

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    // 设置测试模块
  });

  describe('login', () => {
    it('应该返回JWT token当凭据正确时', async () => {
      // Arrange
      const loginDto = { email: 'test@example.com', password: 'password' };

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toHaveProperty('access_token');
    });
  });
});
```

### E2E测试示例

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import * as request from 'supertest';

describe('认证 E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // 设置测试应用
  });

  it('POST /auth/login', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('access_token');
      });
  });
});
```

## 🌍 国际化测试

测试支持多语言验证：

```typescript
it('应该返回中文错误信息', async () => {
  const response = await request(server)
    .post('/auth/login')
    .set('X-Lang', 'zh')
    .send(invalidData)
    .expect(401);

  expect(response.body.message).toMatch(/错误|失败/);
});
```

## 🔧 测试配置

### vitest.config.ts

- 测试环境：Node.js
- 覆盖率提供商：v8
- 全局设置：启用全局 API
- 超时时间：30秒

### test/setup.ts

- 环境变量配置
- 测试数据库设置
- 全局测试钩子

## 📈 最佳实践

1. **AAA模式**：Arrange（准备）、Act（执行）、Assert（断言）
2. **描述性测试名称**：清晰说明测试的功能和期望
3. **独立测试**：每个测试应该独立，不依赖其他测试
4. **Mock外部依赖**：隔离被测试的单元
5. **边界测试**：测试正常情况和异常情况
6. **数据清理**：每个测试后清理测试数据

## 🎯 覆盖的功能

- ✅ 用户认证（登录、注册、JWT验证）
- ✅ 权限控制（角色验证）
- ✅ 错误处理（自定义异常、国际化）
- ✅ 数据验证（DTO验证）
- ✅ API响应格式
- ✅ 国际化支持

## 🚨 CI/CD 集成

测试可以集成到CI/CD流程中：

```yaml
# GitHub Actions 示例
- name: 运行测试
  run: pnpm test:cov

- name: 上传覆盖率报告
  uses: codecov/codecov-action@v3
```
