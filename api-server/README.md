# 🚀 NestJS API Server

现代化企业级 API 服务器，基于 NestJS 框架构建，集成完整的认证授权、数据管理、文件上传、国际化等功能。

## ✨ 核心特性

- 🔐 **JWT认证授权** - 完整的用户认证和角色权限系统
- 👥 **用户管理** - CRUD操作、搜索分页、用户统计
- 🛍️ **商品管理** - 商品增删改查、分类管理
- 📦 **订单系统** - 订单创建、状态管理、订单项关联
- 📁 **文件上传** - 多文件上传、类型验证、存储管理
- 🌍 **国际化支持** - 中英双语，可扩展多语言
- 📝 **完善日志** - Winston结构化日志、文件轮转
- 📚 **API文档** - Swagger自动生成交互式文档
- 🧪 **测试覆盖** - 单元测试、E2E测试、覆盖率报告
- 🐳 **容器化部署** - Docker + Docker Compose
- 🛡️ **安全防护** - Helmet安全头、API限流、数据验证
- 📊 **健康监控** - 服务健康检查、性能指标

## 🛠️ 技术栈

| 分类       | 技术选型                               |
| ---------- | -------------------------------------- |
| **框架**   | NestJS 11.x + Express + TypeScript 5.x |
| **数据库** | TypeORM + SQLite/MySQL/PostgreSQL      |
| **认证**   | JWT + Passport + bcryptjs              |
| **日志**   | Winston + 日志轮转                     |
| **测试**   | Vitest + 单元测试 + E2E测试            |
| **文档**   | Swagger/OpenAPI 3.0                    |
| **部署**   | Docker + PM2 + Nginx                   |
| **工具**   | ESLint + Prettier + Husky              |

## 🚀 快速开始

### 1. 环境准备

```bash
# 系统要求: Node.js 18+ | pnpm 8+ | Git

# 克隆项目
git clone <repository-url>
cd api-server

# 安装依赖
pnpm install
```

### 2. 环境配置

```bash
# 复制环境配置模板
cp .env.example .env

# 编辑配置文件 (必须设置JWT_SECRET)
vim .env
```

**关键配置项:**

```env
# JWT密钥 (必需，至少32字符)
JWT_SECRET=your-super-secret-jwt-key-must-be-at-least-32-characters-long

# 认证控制 (开发调试用)
AUTH_ENABLED=true  # 设置为false可禁用JWT认证

# 数据库配置
DB_TYPE=sqljs
DB_LOCATION=database.sqljs

# 服务端口
PORT=3000
```

### 3. 启动服务

```bash
# 开发模式 (热重载)
pnpm dev

# 生产模式
pnpm build
pnpm start:prod

# 调试模式
pnpm start:debug
```

### 4. 访问服务

- 🌐 **API服务**: http://localhost:3000/api
- 📖 **API文档**: http://localhost:3000/api/docs
- 💚 **健康检查**: http://localhost:3000/api/health

## 📋 API 接口概览

### 🔐 认证授权

```bash
POST /auth/register  # 用户注册
POST /auth/login     # 用户登录
```

### 👥 用户管理

```bash
GET    /users           # 获取用户列表 (支持分页/搜索)
POST   /users           # 创建用户 (需认证)
GET    /users/:id       # 获取用户详情
PUT    /users/:id       # 更新用户信息 (需认证)
DELETE /users/:id       # 删除用户 (需认证)
GET    /users/statistics/overview  # 用户统计
```

### 🛍️ 商品管理

```bash
GET    /products        # 获取商品列表
POST   /products        # 创建商品 (需认证)
GET    /products/:id    # 获取商品详情
PUT    /products/:id    # 更新商品 (需认证)
DELETE /products/:id    # 删除商品 (需认证)
```

### 📦 订单系统

```bash
GET    /orders          # 获取订单列表 (需认证)
POST   /orders          # 创建订单 (需认证)
GET    /orders/:id      # 获取订单详情 (需认证)
PUT    /orders/:id      # 更新订单状态 (需认证)
```

### 📁 文件上传

```bash
POST   /uploads         # 上传文件 (支持多文件)
GET    /uploads/:filename # 访问上传的文件
```

### 🌍 其他功能

```bash
GET    /health          # 健康检查
POST   /language/switch # 语言切换
GET    /audit           # 审计日志 (需管理员权限)
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 单元测试
pnpm test:unit

# E2E测试
pnpm test:e2e

# 测试覆盖率
pnpm test:cov

# 测试监听模式
pnpm test:watch

# 测试UI界面
pnpm test:ui
```

## 🐳 Docker 部署

### 快速部署

```bash
# 使用Docker Compose
docker-compose up -d

# 或单独构建
docker build -t api-server .
docker run -p 3000:3000 api-server
```

### 生产环境

```bash
# 构建生产镜像
docker build -f Dockerfile.prod -t api-server:prod .

# 运行生产容器
docker run -d \
  --name api-server \
  -p 3000:3000 \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/uploads:/app/uploads \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-production-secret \
  api-server:prod
```

## 🔧 开发指南

### 代码规范

```bash
# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 类型检查
pnpm build
```

### 添加新功能

```bash
# 生成新模块
nest generate module articles
nest generate controller articles
nest generate service articles
```

### Git 工作流

```bash
# 功能开发
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 提交规范: feat|fix|docs|style|refactor|test|chore
```

## 📊 项目结构

```
src/
├── main.ts              # 应用入口
├── app.module.ts        # 根模块
├── auth/                # 认证授权模块
├── users/               # 用户管理模块
├── products/            # 商品管理模块
├── orders/              # 订单管理模块
├── uploads/             # 文件上传模块
├── health/              # 健康检查模块
├── audit/               # 审计日志模块
├── database/            # 数据库管理模块
├── language/            # 语言切换模块
├── common/              # 公共模块
│   ├── config/          # 配置管理
│   ├── filters/         # 异常过滤器
│   ├── interceptors/    # 拦截器
│   ├── guards/          # 路由守卫
│   ├── decorators/      # 自定义装饰器
│   └── services/        # 公共服务
└── i18n/                # 国际化资源
```

## 📚 学习资源

### 完整文档

- 📖 **[API Server 完整学习指南](./docs/API-SERVER-GUIDE.md)** - 详细的学习文档

### 官方文档

- [NestJS 官方文档](https://docs.nestjs.com/)
- [TypeORM 文档](https://typeorm.io/)
- [Passport.js 文档](http://www.passportjs.org/)

### 相关项目

- [NestJS 示例项目](https://github.com/nestjs/nest/tree/master/sample)
- [Awesome NestJS](https://github.com/juliandavidmr/awesome-nestjs)

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙋‍♂️ 获取帮助

- 📖 查看 [完整学习指南](./docs/API-SERVER-GUIDE.md)
- 🐛 [报告问题](https://github.com/your-repo/issues)
- 💬 [讨论交流](https://github.com/your-repo/discussions)

---

**⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！**
