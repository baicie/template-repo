import 'reflect-metadata';
import * as fs from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcryptjs';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// 确保logs目录存在
function ensureLogsDirectory() {
  const logsDir = 'logs';
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📁 日志目录已创建: logs/');
  }
}

// 确保上传目录存在
function ensureUploadDirectory(uploadDir: string) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 上传目录已创建: ${uploadDir}`);
  }
}

async function seedDatabase(app: any) {
  // 获取数据源
  const dataSource = app.get(DataSource);

  // 获取repositories
  const userRepo = dataSource.getRepository(User);
  const productRepo = dataSource.getRepository(Product);
  const orderRepo = dataSource.getRepository(Order);
  const orderItemRepo = dataSource.getRepository(OrderItem);

  const userCount = await userRepo.count();
  const productCount = await productRepo.count();
  const orderCount = await orderRepo.count();

  if (userCount === 0) {
    // 创建加密密码
    const hashedPassword = await bcrypt.hash('123456', 10);

    await userRepo.save([
      {
        name: '张三',
        email: 'zhangsan@example.com',
        age: 28,
        password: hashedPassword,
        role: 'user',
      },
      {
        name: '李四',
        email: 'lisi@example.com',
        age: 32,
        password: hashedPassword,
        role: 'user',
      },
      {
        name: '管理员',
        email: 'admin@example.com',
        age: 30,
        password: hashedPassword,
        role: 'admin',
      },
    ]);
    console.log('用户种子数据已创建（默认密码：123456）');
  }

  if (productCount === 0) {
    await productRepo.save([
      {
        name: 'iPhone 14',
        price: 5999,
        category: '手机',
        description: 'Apple最新款手机',
        stock: 100,
      },
      {
        name: 'MacBook Pro',
        price: 12999,
        category: '电脑',
        description: '专业人士的首选',
        stock: 50,
      },
      {
        name: 'iPad Air',
        price: 4399,
        category: '平板',
        description: '轻薄强大的平板电脑',
        stock: 75,
      },
    ]);
    console.log('商品种子数据已创建');
  }

  if (orderCount === 0) {
    // 创建示例订单
    const orders = await orderRepo.save([
      {
        userId: 1,
        totalAmount: 5999,
        status: 'paid',
        address: '北京市朝阳区XX街道',
      },
      {
        userId: 2,
        totalAmount: 12999,
        status: 'shipped',
        address: '上海市浦东新区XX路',
      },
      {
        userId: 1,
        totalAmount: 8798,
        status: 'pending',
        address: '北京市朝阳区XX街道',
      },
    ]);

    // 为每个订单创建订单项
    await orderItemRepo.save([
      {
        productId: 1,
        name: 'iPhone 14',
        price: 5999,
        quantity: 1,
        order: orders[0],
      },
      {
        productId: 2,
        name: 'MacBook Pro',
        price: 12999,
        quantity: 1,
        order: orders[1],
      },
      {
        productId: 3,
        name: 'iPad Air',
        price: 4399,
        quantity: 2,
        order: orders[2],
      },
    ]);

    console.log('订单种子数据已创建');
  }
}

async function bootstrap() {
  // 确保日志目录存在
  ensureLogsDirectory();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const i18nService = app.get(I18nService);

  // 设置全局API前缀
  app.setGlobalPrefix('api');

  // 确保上传目录存在
  ensureUploadDirectory(configService.get<string>('upload.dest'));

  // 使用Winston作为默认logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 安全中间件配置
  app.use(
    helmet({
      contentSecurityPolicy:
        configService.get<string>('nodeEnv') === 'production'
          ? undefined
          : false,
      crossOriginEmbedderPolicy: false, // 允许Swagger UI正常工作
    }),
  );

  // 启用响应压缩
  app.use(compression());

  // 全局异常过滤器（注入i18n服务）
  app.useGlobalFilters(new GlobalExceptionFilter(i18nService));

  // 全局响应拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局日志拦截器（仅在开发环境启用详细日志）
  if (configService.get<string>('nodeEnv') !== 'production') {
    app.useGlobalInterceptors(new LoggingInterceptor());
  }

  // 全局管道验证
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 启用CORS（根据配置）
  const corsOrigin = configService.get<string>('security.corsOrigin');
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Lang'],
  });

  // 设置API文档
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('app.name'))
    .setDescription(configService.get<string>('app.description'))
    .setVersion(configService.get<string>('app.version'))
    .addBearerAuth() // 添加Bearer认证
    .addApiKey({ type: 'apiKey', name: 'X-Lang', in: 'header' }, 'lang')
    .addTag('用户管理')
    .addTag('商品管理')
    .addTag('订单管理')
    .addTag('用户认证')
    .addTag('文件上传')
    .addTag('语言管理')
    .addTag('健康检查')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 初始化种子数据
  try {
    await seedDatabase(app);
  } catch (error) {
    console.log('种子数据初始化跳过:', error.message);
  }

  const port = configService.get<number>('port');
  await app.listen(port);

  const authEnabled = configService.get<boolean>('auth.enabled');

  console.log(`🚀 服务器启动在 http://localhost:${port}/api`);
  console.log(`📚 API文档地址: http://localhost:${port}/docs`);
  console.log(`💚 健康检查: http://localhost:${port}/api/health`);
  console.log(`🔗 API前缀: /api (所有接口都以/api开头)`);
  console.log(`🌍 环境: ${configService.get<string>('nodeEnv')}`);
  console.log('✅ 统一错误处理已启用');
  console.log(
    `${authEnabled ? '🔐' : '🔓'} JWT认证系统: ${authEnabled ? '已启用' : '已禁用'}`,
  );
  console.log('✅ Winston日志系统已启用');
  console.log('🛡️ 安全防护已启用 (Helmet + 限流 + 压缩)');
  console.log('⚙️ 配置管理已启用');
  console.log('🌍 国际化(i18n)已启用 (中文/英文)');
  console.log('📝 日志文件位置: logs/');
  console.log('💡 语言切换: 请求头 X-Lang: zh/en');

  if (!authEnabled) {
    console.log('⚠️  警告: 认证已禁用，所有API接口无需JWT token即可访问！');
    console.log('⚠️  仅在开发/测试环境使用，生产环境请启用认证');
  }
}
bootstrap();
