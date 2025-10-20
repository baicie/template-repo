# 🚀 API Server 完整学习指南

## 📋 项目概述

这是一个基于 **NestJS** 框架构建的现代化企业级 API 服务器，集成了认证授权、数据管理、文件上传、国际化、日志系统等完整功能。

### 🎯 项目特点

- 🏗️ **模块化架构** - 清晰的模块划分，易于维护和扩展
- 🔐 **完整认证系统** - JWT + Passport 认证授权
- 📊 **数据库集成** - TypeORM + SQLite/MySQL/PostgreSQL
- 🌍 **国际化支持** - 中英双语，可扩展多语言
- 📝 **完善日志系统** - Winston 日志记录和管理
- 🛡️ **安全防护** - Helmet + 限流 + 数据验证
- 📚 **API文档** - Swagger/OpenAPI 自动生成
- 🧪 **测试覆盖** - 单元测试 + E2E测试
- 🐳 **容器化部署** - Docker + Docker Compose
- 📈 **监控指标** - 健康检查 + 性能监控

## 🛠️ 技术栈

### 核心框架

- **NestJS** `11.1.5` - Node.js 企业级框架
- **Express** - 底层HTTP服务器
- **TypeScript** `5.8.3` - 类型安全的JavaScript

### 数据层

- **TypeORM** `0.3.25` - ORM数据库抽象层
- **SQLite/SQL.js** - 开发环境数据库
- **Class Validator** - 数据验证装饰器
- **Class Transformer** - 数据转换工具

### 认证授权

- **Passport** + **JWT** - 认证策略
- **bcryptjs** - 密码加密
- **@nestjs/jwt** - JWT令牌管理

### 工具库

- **Winston** - 结构化日志
- **Joi** - 配置验证
- **Helmet** - 安全头设置
- **Compression** - 响应压缩
- **nestjs-i18n** - 国际化

### 开发工具

- **Vitest** - 测试框架
- **ESLint + Prettier** - 代码规范
- **Swagger** - API文档生成

## 🏗️ 项目架构

```
src/
├── main.ts                 # 应用入口，配置和启动
├── app.module.ts          # 根模块，整合所有功能模块
├── auth/                  # 认证授权模块
│   ├── auth.controller.ts # 登录注册接口
│   ├── auth.service.ts    # 认证业务逻辑
│   ├── jwt.strategy.ts    # JWT验证策略
│   ├── guards/            # 路由守卫
│   └── dto/               # 数据传输对象
├── users/                 # 用户管理模块
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── entities/          # 用户实体定义
│   └── dto/               # 用户相关DTO
├── products/              # 商品管理模块
├── orders/                # 订单管理模块
├── uploads/               # 文件上传模块
├── health/                # 健康检查模块
├── audit/                 # 审计日志模块
├── database/              # 数据库管理模块
├── language/              # 语言切换模块
├── common/                # 公共模块
│   ├── config/            # 配置管理
│   ├── filters/           # 全局异常过滤器
│   ├── interceptors/      # 拦截器
│   ├── decorators/        # 自定义装饰器
│   ├── entities/          # 公共实体
│   ├── exceptions/        # 自定义异常
│   └── services/          # 公共服务
└── i18n/                  # 国际化资源文件
    ├── zh/                # 中文资源
    └── en/                # 英文资源
```

## 🔧 核心模块详解

### 1. 认证授权模块 (auth/)

**功能特性:**

- 用户注册/登录
- JWT令牌生成和验证
- 密码加密存储
- 角色权限控制

**核心文件:**

```typescript
// auth.service.ts - 核心认证逻辑
@Injectable()
export class AuthService {
  async login(loginDto: LoginDto) {
    // 验证用户凭据
    const user = await this.validateUser(loginDto.email, loginDto.password);
    // 生成JWT令牌
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

// jwt.strategy.ts - JWT验证策略
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

**使用示例:**

```bash
# 注册新用户
POST /auth/register
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "password": "123456",
  "age": 25
}

# 用户登录
POST /auth/login
{
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

### 2. 用户管理模块 (users/)

**功能特性:**

- CRUD用户操作
- 用户搜索和分页
- 用户统计信息
- 软删除支持

**核心实体:**

```typescript
// user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  email: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar' })
  @Exclude() // 确保密码不会在响应中返回
  password: string;

  @Column({
    type: 'varchar',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 3. 数据库模块 (database/)

**功能特性:**

- 数据库连接管理
- 迁移和种子数据
- 数据库备份恢复

**配置示例:**

```typescript
// database configuration
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: configService.get<string>('database.type') as any,
    location: configService.get<string>('database.location'),
    synchronize: configService.get<boolean>('database.synchronize'),
    logging: configService.get<boolean>('database.logging'),
    entities: [User, Product, Order, OrderItem, AuditLog],
    autoLoadEntities: true,
  }),
  inject: [ConfigService],
});
```

### 4. 配置管理 (common/config/)

**环境配置:**

```typescript
// configuration.ts
export default () => ({
  // 服务器配置
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  // 数据库配置
  database: {
    type: process.env.DB_TYPE || 'sqljs',
    location: process.env.DB_LOCATION || 'database.sqljs',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'development-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // 安全配置
  security: {
    corsOrigin: process.env.CORS_ORIGIN || '*',
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60000,
      limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
    },
  },
});
```

### 5. 日志系统 (common/config/logger.config.ts)

**功能特性:**

- 分级日志记录
- 日志文件轮转
- 结构化日志格式
- 异常日志捕获

**配置示例:**

```typescript
// 日志配置
export const winstonLogger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack, context, ...meta }) => {
      let logMessage = `${timestamp} [${level}]`;
      if (context) logMessage += ` [${context}]`;
      logMessage += ` ${message}`;
      if (stack) logMessage += `\n${stack}`;
      return logMessage;
    }),
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});
```

## 🔌 API 接口文档

### 认证接口

#### POST /auth/register - 用户注册

```json
Request Body:
{
  "name": "string",
  "email": "string",
  "password": "string",
  "age": "number"
}

Response:
{
  "access_token": "string",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### POST /auth/login - 用户登录

```json
Request Body:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "access_token": "string",
  "user": {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

### 用户管理接口

#### GET /users - 获取用户列表

```json
Query Parameters:
- page: number (默认: 1)
- limit: number (默认: 10)
- search: string (可选)

Response:
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "email": "string",
      "age": "number",
      "role": "string",
      "createdAt": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

#### POST /users - 创建用户

```json
Request Body:
{
  "name": "string",
  "email": "string",
  "age": "number",
  "password": "string"
}

Headers:
Authorization: Bearer <token>
```

### 商品管理接口

#### GET /products - 获取商品列表

```json
Response:
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "price": "number",
      "category": "string",
      "description": "string",
      "stock": "number",
      "createdAt": "string"
    }
  ]
}
```

### 文件上传接口

#### POST /uploads - 上传文件

```json
Request: multipart/form-data
- file: File

Response:
{
  "filename": "string",
  "originalname": "string",
  "size": "number",
  "path": "string",
  "url": "string"
}
```

## 🚀 快速开始

### 1. 环境准备

**系统要求:**

- Node.js 18+
- pnpm 8+
- Git

**安装依赖:**

```bash
# 安装项目依赖
pnpm install

# 复制环境配置文件
cp .env.example .env
```

### 2. 环境配置

创建 `.env` 文件:

```bash
# 环境配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_TYPE=sqljs
DB_LOCATION=database.sqljs
DB_SYNCHRONIZE=true
DB_LOGGING=false

# JWT配置 (必需)
JWT_SECRET=your-super-secret-jwt-key-must-be-at-least-32-characters-long
JWT_EXPIRES_IN=24h

# 认证控制 (开发调试用)
AUTH_ENABLED=true  # 设置为false可禁用JWT认证，方便开发调试

# 日志配置
LOG_LEVEL=debug

# 安全配置
CORS_ORIGIN=http://localhost:5173
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# 文件上传配置
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880

# 国际化配置
DEFAULT_LANGUAGE=zh
FALLBACK_LANGUAGE=en

# 应用信息
APP_NAME=Faker API
APP_DESCRIPTION=用于测试的API接口
APP_VERSION=1.0.0
```

### 3. 运行项目

```bash
# 开发模式 (热重载)
pnpm dev

# 生产模式构建
pnpm build
pnpm start:prod

# 调试模式
pnpm start:debug
```

**访问地址:**

- API服务: http://localhost:3000/api
- API文档: http://localhost:3000/api/docs
- 健康检查: http://localhost:3000/api/health

### 4. 数据库操作

```bash
# 数据库同步 (开发环境自动)
# 在 DB_SYNCHRONIZE=true 时自动同步

# 查看数据库状态
# 启动时会自动创建种子数据

# 数据库备份 (SQLite)
cp database.sqljs database.backup.sqljs
```

## 🧪 测试指南

### 单元测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test:unit

# 测试覆盖率
pnpm test:cov

# 监听模式
pnpm test:watch

# 测试UI界面
pnpm test:ui
```

### E2E测试

```bash
# 运行端到端测试
pnpm test:e2e
```

### 测试示例

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  it('应该返回JWT token当登录成功时', async () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };
    const result = await service.login(loginDto);

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('user');
    expect(result.user.email).toBe(loginDto.email);
  });
});
```

## 🐳 部署指南

### Docker 部署

**1. 构建镜像:**

```bash
# 构建生产镜像
docker build -t api-server .

# 使用Docker Compose
docker-compose up -d
```

**2. Docker Compose 配置:**

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-production-secret
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
```

### 生产环境部署

**1. 环境准备:**

```bash
# 服务器配置
sudo apt update
sudo apt install -y nodejs npm nginx

# 安装pnpm
npm install -g pnpm

# 克隆项目
git clone <repository-url>
cd api-server
```

**2. 生产配置:**

```bash
# 设置生产环境变量
export NODE_ENV=production
export JWT_SECRET=your-production-secret-key
export DB_TYPE=mysql
export DB_HOST=localhost
export DB_PORT=3306
export DB_USERNAME=api_user
export DB_PASSWORD=secure_password
export DB_NAME=api_database

# 构建项目
pnpm install --frozen-lockfile
pnpm build
```

**3. 进程管理 (PM2):**

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start dist/main.js --name api-server

# 设置开机自启
pm2 startup
pm2 save
```

## 📊 监控和日志

### 日志管理

```bash
# 查看实时日志
tail -f logs/app-$(date +%Y-%m-%d).log

# 查看错误日志
tail -f logs/error-$(date +%Y-%m-%d).log

# 日志轮转配置
# 自动按日期轮转，保留30天
# 单文件最大20MB，超过自动压缩
```

### 健康检查

```bash
# 检查服务状态
curl http://localhost:3000/api/health

# 返回示例:
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  }
}
```

### 性能监控

```bash
# 查看进程状态
pm2 status

# 查看详细信息
pm2 info api-server

# 查看日志
pm2 logs api-server

# 重启服务
pm2 restart api-server
```

## 🔧 开发最佳实践

### 1. 代码规范

```bash
# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 类型检查
pnpm build
```

### 2. Git工作流

```bash
# 功能开发
git checkout -b feature/user-management
git add .
git commit -m "feat: add user CRUD operations"
git push origin feature/user-management

# 提交规范
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建工具相关
```

### 3. API设计原则

- **RESTful** - 遵循REST规范
- **版本控制** - 使用URL版本控制
- **错误处理** - 统一错误响应格式
- **数据验证** - 使用DTO和验证装饰器
- **响应格式** - 统一响应结构

### 4. 安全最佳实践

- **认证授权** - JWT + 角色权限
- **数据验证** - 输入验证和清理
- **错误处理** - 不暴露敏感信息
- **HTTPS** - 生产环境使用SSL
- **限流防护** - API调用频率限制

### 5. 认证控制功能

项目支持通过环境变量动态控制是否启用JWT认证：

```bash
# 启用认证（默认，生产环境推荐）
AUTH_ENABLED=true

# 禁用认证（开发调试用）
AUTH_ENABLED=false
```

**使用场景：**

- 开发阶段快速测试API接口
- 前端开发联调时避免token过期问题
- API文档演示和测试
- 自动化测试脚本

**注意事项：**

- 生产环境必须启用认证
- 禁用认证时会在控制台显示警告信息
- 禁用认证不影响角色权限检查（如果有用户上下文）

## 🐛 故障排除

### 常见问题

**1. 端口被占用**

```bash
# 查找占用端口的进程
lsof -i :3000

# 结束进程
kill -9 <PID>
```

**2. 数据库连接失败**

```bash
# 检查数据库配置
cat .env | grep DB_

# 查看数据库文件权限
ls -la database.sqljs

# 重新同步数据库
rm database.sqljs
pnpm dev
```

**3. JWT验证失败**

```bash
# 检查JWT配置
echo $JWT_SECRET

# 确保密钥长度至少32字符
# 重新生成token

# 开发调试：临时禁用认证
export AUTH_ENABLED=false
# 或修改.env文件：AUTH_ENABLED=false
```

**4. 文件上传失败**

```bash
# 检查上传目录权限
ls -la uploads/

# 创建上传目录
mkdir -p uploads
chmod 755 uploads
```

### 调试技巧

```bash
# 启用调试日志
export LOG_LEVEL=debug

# 查看详细错误信息
pnpm start:debug

# 数据库查询日志
export DB_LOGGING=true
```

## 📚 扩展开发

### 添加新模块

```bash
# 使用NestJS CLI生成模块
nest generate module articles
nest generate controller articles
nest generate service articles
nest generate class articles/dto/create-article.dto --no-spec
```

### 添加新的数据库实体

```typescript
// article.entity.ts
@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.articles)
  author: User;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 添加新的API接口

```typescript
// articles.controller.ts
@Controller('articles')
@UseGuards(JwtAuthGuard)
export class ArticlesController {
  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.articlesService.findAll(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }
}
```

## 🎯 学习路线建议

### 1. 基础阶段 (1-2周)

- 熟悉NestJS基本概念
- 理解依赖注入和装饰器
- 掌握模块、控制器、服务的关系
- 学习TypeORM基本操作

### 2. 进阶阶段 (2-3周)

- 深入理解认证授权机制
- 掌握中间件、拦截器、管道的使用
- 学习数据验证和错误处理
- 了解测试编写方法

### 3. 高级阶段 (3-4周)

- 微服务架构设计
- 性能优化技巧
- 安全最佳实践
- 生产环境部署和运维

### 4. 实践项目

- 扩展现有功能模块
- 添加实时通信(WebSocket)
- 集成第三方服务(支付、邮件)
- 实现数据缓存和队列

## 📖 参考资源

### 官方文档

- [NestJS官方文档](https://docs.nestjs.com/)
- [TypeORM文档](https://typeorm.io/)
- [Passport.js文档](http://www.passportjs.org/)

### 学习资源

- [NestJS中文文档](https://docs.nestjs.cn/)
- [TypeScript官方手册](https://www.typescriptlang.org/docs/)
- [Jest测试框架](https://jestjs.io/docs/getting-started)

### 社区资源

- [NestJS GitHub](https://github.com/nestjs/nest)
- [Awesome NestJS](https://github.com/juliandavidmr/awesome-nestjs)
- [NestJS Examples](https://github.com/nestjs/nest/tree/master/sample)

---

## 💡 总结

这个API服务器项目展示了现代Node.js后端开发的完整实践，涵盖了从基础的CRUD操作到高级的认证授权、日志监控等企业级功能。通过学习和实践这个项目，你将掌握：

- **现代后端架构设计**
- **企业级代码组织方式**
- **完整的开发到部署流程**
- **测试驱动的开发方法**
- **生产环境的运维技巧**

建议按照学习路线循序渐进，结合实际项目需求进行功能扩展，这样能更好地理解和掌握现代后端开发技术栈。

**Happy Coding! 🚀**
