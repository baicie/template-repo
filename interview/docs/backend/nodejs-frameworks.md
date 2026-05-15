# Node.js 框架实战指南

Node.js 生态系统中有众多优秀的 Web 框架，每个都有其独特的设计理念和应用场景。本文将深入对比 Express、Koa、Fastify 和 NestJS 等主流框架的特性、性能和最佳实践。

## 🎯 框架对比总览

| 特性           | Express  | Koa         | Fastify    | NestJS       |
| -------------- | -------- | ----------- | ---------- | ------------ |
| **设计理念**   | 简单灵活 | 洋葱模型    | 高性能     | 企业级架构   |
| **中间件**     | 回调风格 | async/await | 插件系统   | 装饰器模式   |
| **性能**       | 中等     | 中等        | 极高       | 中等         |
| **TypeScript** | 社区支持 | 社区支持    | 原生支持   | 原生支持     |
| **学习曲线**   | 平缓     | 中等        | 中等       | 陡峭         |
| **生态系统**   | 极丰富   | 丰富        | 快速增长   | Angular 风格 |
| **适用场景**   | 快速开发 | 现代应用    | 高性能 API | 大型企业项目 |

## 🚀 Express.js - 简洁而强大

### 基础架构与中间件

```javascript
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const app = express();

// 安全中间件
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS 配置
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = ["http://localhost:3000", "https://myapp.com"];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 响应压缩
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100个请求
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// 日志中间件
app.use(
  morgan("combined", {
    stream: require("fs").createWriteStream("./access.log", { flags: "a" }),
  })
);

// 请求解析
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 自定义中间件示例
const requestId = (req, res, next) => {
  req.id = Math.random().toString(36).substring(2, 15);
  res.setHeader("X-Request-ID", req.id);
  next();
};

const asyncWrapper = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.use(requestId);
```

### 高级路由设计

```javascript
const express = require("express");
const { body, param, query, validationResult } = require("express-validator");

// 路由模块化
class UserRouter {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // 参数验证中间件
    const validateUser = [
      body("email").isEmail().normalizeEmail(),
      body("password")
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
      body("name").trim().isLength({ min: 2, max: 50 }),
      this.handleValidationErrors,
    ];

    const validateUserId = [
      param("id").isMongoId(),
      this.handleValidationErrors,
    ];

    // 路由定义
    this.router.get(
      "/",
      query("page").optional().isInt({ min: 1 }),
      query("limit").optional().isInt({ min: 1, max: 100 }),
      asyncWrapper(this.getUsers)
    );

    this.router.get("/:id", validateUserId, asyncWrapper(this.getUserById));

    this.router.post("/", validateUser, asyncWrapper(this.createUser));

    this.router.put(
      "/:id",
      validateUserId,
      validateUser,
      asyncWrapper(this.updateUser)
    );

    this.router.delete("/:id", validateUserId, asyncWrapper(this.deleteUser));
  }

  handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }
    next();
  }

  async getUsers(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const users = await UserService.findAll({ offset, limit });
    const total = await UserService.count();

    res.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }

  async getUserById(req, res) {
    const user = await UserService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ data: user });
  }

  async createUser(req, res) {
    const userData = req.body;
    const user = await UserService.create(userData);
    res.status(201).json({
      data: user,
      message: "User created successfully",
    });
  }

  async updateUser(req, res) {
    const user = await UserService.update(req.params.id, req.body);
    res.json({
      data: user,
      message: "User updated successfully",
    });
  }

  async deleteUser(req, res) {
    await UserService.delete(req.params.id);
    res.status(204).send();
  }
}

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error(`[${req.id}] Error:`, error);

  // 数据库错误
  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: Object.values(error.errors).map((e) => e.message),
    });
  }

  // JWT 错误
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
    });
  }

  // 默认错误
  res.status(error.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message,
    requestId: req.id,
  });
});

// 使用路由
const userRouter = new UserRouter();
app.use("/api/users", userRouter.router);
```

## 🧅 Koa.js - 洋葱圈模型

### 现代中间件架构

```javascript
const Koa = require("koa");
const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const helmet = require("koa-helmet");
const compress = require("koa-compress");

const app = new Koa();
const router = new Router();

// 全局错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : err.message,
      timestamp: new Date().toISOString(),
      path: ctx.path,
    };

    // 记录错误
    console.error("Unhandled error:", err);

    // 触发应用级错误事件
    app.emit("error", err, ctx);
  }
});

// 响应时间中间件
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set("X-Response-Time", `${ms}ms`);
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 请求日志
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const rt = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ctx.status} - ${rt}ms`);
});

// 安全头部
app.use(helmet());

// CORS
app.use(
  cors({
    origin: (ctx) => {
      const origin = ctx.headers.origin;
      const allowedOrigins = ["http://localhost:3000", "https://myapp.com"];
      return allowedOrigins.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// 响应压缩
app.use(
  compress({
    filter: (content_type) => /text/i.test(content_type),
    threshold: 2048,
    gzip: {
      flush: require("zlib").constants.Z_SYNC_FLUSH,
    },
    deflate: {
      flush: require("zlib").constants.Z_SYNC_FLUSH,
    },
  })
);

// 请求体解析
app.use(
  bodyParser({
    jsonLimit: "10mb",
    formLimit: "10mb",
    textLimit: "10mb",
  })
);

// 自定义中间件
const rateLimit = (options = {}) => {
  const { max = 100, window = 60000 } = options;
  const requests = new Map();

  return async (ctx, next) => {
    const key = ctx.ip;
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime: now + window });
    } else {
      const request = requests.get(key);
      if (now > request.resetTime) {
        request.count = 1;
        request.resetTime = now + window;
      } else {
        request.count++;
        if (request.count > max) {
          ctx.status = 429;
          ctx.body = { error: "Too Many Requests" };
          return;
        }
      }
    }

    await next();
  };
};

app.use(rateLimit({ max: 100, window: 60000 }));
```

### 高级路由与验证

```javascript
const Joi = require("joi");

// 验证中间件
const validate = (schema) => {
  return async (ctx, next) => {
    try {
      const { error, value } = schema.validate({
        body: ctx.request.body,
        query: ctx.query,
        params: ctx.params,
      });

      if (error) {
        ctx.status = 400;
        ctx.body = {
          error: "Validation Error",
          details: error.details.map((d) => ({
            field: d.path.join("."),
            message: d.message,
          })),
        };
        return;
      }

      ctx.validatedData = value;
      await next();
    } catch (err) {
      ctx.status = 400;
      ctx.body = { error: "Invalid input data" };
    }
  };
};

// 用户相关路由
class UserController {
  static async getUsers(ctx) {
    const { page = 1, limit = 10 } = ctx.validatedData.query;

    const users = await UserService.findAll({
      offset: (page - 1) * limit,
      limit,
    });

    ctx.body = {
      data: users,
      pagination: {
        page,
        limit,
        total: await UserService.count(),
      },
    };
  }

  static async createUser(ctx) {
    const userData = ctx.validatedData.body;

    try {
      const user = await UserService.create(userData);
      ctx.status = 201;
      ctx.body = {
        data: user,
        message: "User created successfully",
      };
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error
        ctx.status = 409;
        ctx.body = { error: "Email already exists" };
      } else {
        throw error;
      }
    }
  }
}

// 验证规则
const userSchemas = {
  getUsers: Joi.object({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().optional(),
    }),
  }),

  createUser: Joi.object({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required(),
      name: Joi.string().min(2).max(50).required(),
      role: Joi.string().valid("user", "admin").default("user"),
    }),
  }),
};

// 路由定义
router.get("/users", validate(userSchemas.getUsers), UserController.getUsers);

router.post(
  "/users",
  validate(userSchemas.createUser),
  UserController.createUser
);

app.use(router.routes());
app.use(router.allowedMethods());
```

## ⚡ Fastify - 高性能框架

### 性能优化架构

```javascript
const fastify = require("fastify")({
  logger: {
    level: "info",
    prettyPrint: process.env.NODE_ENV === "development",
  },
  trustProxy: true,
  bodyLimit: 10485760, // 10MB
  keepAliveTimeout: 5000,
});

// JSON Schema 验证 (性能优化)
const userSchema = {
  type: "object",
  required: ["email", "password", "name"],
  properties: {
    email: {
      type: "string",
      format: "email",
      maxLength: 255,
    },
    password: {
      type: "string",
      minLength: 8,
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)",
    },
    name: {
      type: "string",
      minLength: 2,
      maxLength: 50,
    },
    role: {
      type: "string",
      enum: ["user", "admin"],
      default: "user",
    },
  },
  additionalProperties: false,
};

// 响应 Schema (自动序列化优化)
const userResponseSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
};

// 插件注册
async function registerPlugins(fastify) {
  // CORS 插件
  await fastify.register(require("@fastify/cors"), {
    origin: ["http://localhost:3000", "https://myapp.com"],
    credentials: true,
  });

  // 限流插件
  await fastify.register(require("@fastify/rate-limit"), {
    max: 100,
    timeWindow: "1 minute",
    cache: 10000,
    allowList: ["127.0.0.1"],
    redis: process.env.REDIS_URL, // 可选的 Redis 支持
  });

  // Helmet 安全插件
  await fastify.register(require("@fastify/helmet"), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  });

  // JWT 插件
  await fastify.register(require("@fastify/jwt"), {
    secret: process.env.JWT_SECRET,
    cookie: {
      cookieName: "token",
      signed: false,
    },
  });

  // 数据库插件 (MongoDB)
  await fastify.register(require("@fastify/mongodb"), {
    url: process.env.MONGODB_URL,
  });
}

// 钩子 (Hooks) 系统
fastify.addHook("preHandler", async (request, reply) => {
  // 请求 ID
  request.id = Math.random().toString(36).substring(2, 15);
  reply.header("x-request-id", request.id);
});

fastify.addHook("onSend", async (request, reply, payload) => {
  // 响应时间
  const responseTime = Date.now() - request.startTime;
  reply.header("x-response-time", `${responseTime}ms`);
  return payload;
});

// 路由定义
const userRoutes = async (fastify) => {
  // 获取用户列表
  fastify.get("/users", {
    schema: {
      querystring: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          search: { type: "string", maxLength: 100 },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: userResponseSchema,
            },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
                total: { type: "integer" },
                pages: { type: "integer" },
              },
            },
          },
        },
      },
    },
    preHandler: fastify.auth([fastify.authenticate]),
    handler: async (request, reply) => {
      const { page, limit, search } = request.query;
      const offset = (page - 1) * limit;

      const users = await UserService.findAll({ offset, limit, search });
      const total = await UserService.count({ search });

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    },
  });

  // 创建用户
  fastify.post("/users", {
    schema: {
      body: userSchema,
      response: {
        201: {
          type: "object",
          properties: {
            data: userResponseSchema,
            message: { type: "string" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const user = await UserService.create(request.body);
        reply.code(201);
        return {
          data: user,
          message: "User created successfully",
        };
      } catch (error) {
        if (error.code === 11000) {
          reply.code(409);
          throw new Error("Email already exists");
        }
        throw error;
      }
    },
  });
};

// 认证装饰器
fastify.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// 注册路由
fastify.register(userRoutes, { prefix: "/api" });

// 性能监控中间件
fastify.addHook("preHandler", (request, reply, done) => {
  request.startTime = Date.now();
  done();
});

// 启动服务器
const start = async () => {
  try {
    await registerPlugins(fastify);
    await fastify.listen({
      port: process.env.PORT || 3000,
      host: "0.0.0.0",
    });
    console.log("Server running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

## 🏗️ NestJS - 企业级架构

### 模块化架构设计

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { DatabaseConfig } from "./config/database.config";

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}`,
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // JWT 模块
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "7d" },
    }),

    // 业务模块
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}

// user/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { Exclude } from "class-transformer";
import * as bcrypt from "bcrypt";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // 响应时排除密码字段
  password: string;

  @Column()
  name: string;

  @Column({ default: "user" })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

// user/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsIn,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsOptional()
  @IsIn(["user", "admin"])
  role?: string = "user";
}

// user/user.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ data: User[]; total: number }> {
    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (search) {
      queryBuilder.where(
        "user.name ILIKE :search OR user.email ILIKE :search",
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .orderBy("user.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === "23505") {
        // PostgreSQL unique violation
        throw new ConflictException("Email already exists");
      }
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }
}

// user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { TransformInterceptor } from "../common/interceptors/transform.interceptor";

@ApiTags("users")
@Controller("users")
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all users" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({ status: 200, description: "Users retrieved successfully" })
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string
  ) {
    const { data, total } = await this.userService.findAll(page, limit, search);
    return {
      data,
      pagination: {
        page: page || 1,
        limit: limit || 10,
        total,
        pages: Math.ceil(total / (limit || 10)),
      },
    };
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "User retrieved successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 409, description: "Email already exists" })
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 204, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    await this.userService.remove(id);
  }
}
```

### 高级功能实现

```typescript
// common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get("user-agent") || "";
    const startTime = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - ${ip} - ${userAgent}`
    );

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const responseTime = Date.now() - startTime;

        this.logger.log(
          `Outgoing Response: ${method} ${url} - ${statusCode} - ${responseTime}ms`
        );
      })
    );
  }
}

// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || "Internal server error",
    };

    this.logger.error(
      `HTTP Exception: ${request.method} ${request.url} - ${status} - ${exception.message}`
    );

    response.status(status).json(errorResponse);
  }
}

// common/pipes/validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors.map((error) => ({
        field: error.property,
        constraints: Object.values(error.constraints || {}),
      }));

      throw new BadRequestException({
        message: "Validation failed",
        errors: errorMessages,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

// 启动文件 main.ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix("api");

  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === "production",
    })
  );

  // 全局拦截器
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger 文档
  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("API Documentation")
      .setDescription("The API description")
      .setVersion("1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);
  }

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
```

## 🔄 框架选择指南

### 性能对比测试

```javascript
// 性能测试脚本
const autocannon = require("autocannon");

async function benchmarkFramework(url, name) {
  console.log(`\n🧪 Testing ${name}...`);

  const result = await autocannon({
    url,
    connections: 100,
    duration: 30,
    pipelining: 1,
    requests: [
      {
        method: "GET",
        path: "/api/users",
      },
      {
        method: "POST",
        path: "/api/users",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "Password123",
          name: "Test User",
        }),
      },
    ],
  });

  console.log(`${name} Results:`);
  console.log(`- Requests/sec: ${result.requests.average}`);
  console.log(`- Latency: ${result.latency.average}ms`);
  console.log(`- Throughput: ${result.throughput.average} bytes/sec`);

  return result;
}

// 运行性能测试
async function runBenchmarks() {
  const frameworks = [
    { name: "Express", url: "http://localhost:3001" },
    { name: "Koa", url: "http://localhost:3002" },
    { name: "Fastify", url: "http://localhost:3003" },
    { name: "NestJS", url: "http://localhost:3004" },
  ];

  const results = [];

  for (const framework of frameworks) {
    try {
      const result = await benchmarkFramework(framework.url, framework.name);
      results.push({ ...framework, result });
    } catch (error) {
      console.error(`Failed to test ${framework.name}:`, error.message);
    }
  }

  // 排序结果
  results.sort((a, b) => b.result.requests.average - a.result.requests.average);

  console.log("\n🏆 Performance Ranking:");
  results.forEach((framework, index) => {
    console.log(
      `${index + 1}. ${framework.name}: ${
        framework.result.requests.average
      } req/sec`
    );
  });
}

runBenchmarks();
```

### 选择决策矩阵

```javascript
// 框架选择辅助工具
class FrameworkSelector {
  constructor() {
    this.criteria = {
      performance: { weight: 0.25 },
      development_speed: { weight: 0.2 },
      learning_curve: { weight: 0.15 },
      ecosystem: { weight: 0.15 },
      typescript_support: { weight: 0.1 },
      enterprise_features: { weight: 0.1 },
      community: { weight: 0.05 },
    };

    this.frameworks = {
      express: {
        performance: 7,
        development_speed: 9,
        learning_curve: 9,
        ecosystem: 10,
        typescript_support: 7,
        enterprise_features: 6,
        community: 10,
      },
      koa: {
        performance: 7,
        development_speed: 8,
        learning_curve: 7,
        ecosystem: 8,
        typescript_support: 8,
        enterprise_features: 7,
        community: 8,
      },
      fastify: {
        performance: 10,
        development_speed: 8,
        learning_curve: 7,
        ecosystem: 7,
        typescript_support: 9,
        enterprise_features: 8,
        community: 7,
      },
      nestjs: {
        performance: 6,
        development_speed: 7,
        learning_curve: 4,
        ecosystem: 8,
        typescript_support: 10,
        enterprise_features: 10,
        community: 8,
      },
    };
  }

  calculateScore(framework) {
    let totalScore = 0;

    for (const [criterion, config] of Object.entries(this.criteria)) {
      const score = this.frameworks[framework][criterion];
      totalScore += score * config.weight;
    }

    return totalScore;
  }

  recommend(projectType) {
    const scores = {};

    for (const framework of Object.keys(this.frameworks)) {
      scores[framework] = this.calculateScore(framework);
    }

    // 根据项目类型调整权重
    if (projectType === "microservice") {
      scores.fastify *= 1.2;
      scores.express *= 1.1;
    } else if (projectType === "enterprise") {
      scores.nestjs *= 1.3;
      scores.express *= 0.9;
    } else if (projectType === "startup") {
      scores.express *= 1.2;
      scores.koa *= 1.1;
    }

    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([name, score]) => ({ name, score: score.toFixed(2) }));

    return sorted;
  }

  getRecommendation(requirements) {
    const { projectType, teamSize, timeline, performance_critical } =
      requirements;

    let recommendation = this.recommend(projectType);

    console.log(`\n📊 Framework Recommendation for ${projectType} project:`);
    console.log(
      `Team Size: ${teamSize}, Timeline: ${timeline}, Performance Critical: ${performance_critical}\n`
    );

    recommendation.forEach((framework, index) => {
      const emoji =
        index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "📍";
      console.log(
        `${emoji} ${framework.name.toUpperCase()}: ${framework.score} points`
      );
    });

    return recommendation[0];
  }
}

// 使用示例
const selector = new FrameworkSelector();

// 不同场景的推荐
const scenarios = [
  {
    name: "Startup MVP",
    projectType: "startup",
    teamSize: "small",
    timeline: "short",
    performance_critical: false,
  },
  {
    name: "Enterprise API",
    projectType: "enterprise",
    teamSize: "large",
    timeline: "long",
    performance_critical: false,
  },
  {
    name: "High-Performance Microservice",
    projectType: "microservice",
    teamSize: "medium",
    timeline: "medium",
    performance_critical: true,
  },
];

scenarios.forEach((scenario) => {
  console.log(`\n=== ${scenario.name} ===`);
  selector.getRecommendation(scenario);
});
```

---

🎯 **选择合适的 Node.js 框架需要考虑项目需求、团队技能和长期维护等多个因素。Express 适合快速开发，Koa 提供现代化体验，Fastify 追求极致性能，NestJS 适合大型企业项目。没有最好的框架，只有最适合的选择！**
