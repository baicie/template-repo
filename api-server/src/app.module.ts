import { extname, join } from 'node:path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { APP_GUARD } from '@nestjs/core';
import { diskStorage } from 'multer';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthModule } from './health/health.module';
import { LanguageModule } from './language/language.module';
import { winstonConfig } from './common/config/logger.config';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import configuration from './common/config/configuration';
import { configValidationSchema } from './common/config/config.schema';
import { AuditModule } from './audit/audit.module';
import { DatabaseModule } from './database/database.module';
import { AuditLog } from './common/entities/audit-log.entity';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    // i18n国际化模块
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get<string>('i18n.fallbackLanguage'),
        loaderOptions: {
          path: join(__dirname, '/i18n/'),
          watch: true,
        },
        resolvers: [
          new QueryResolver(['lang', 'l']),
          new HeaderResolver(['x-custom-lang']),
          new CookieResolver(),
          AcceptLanguageResolver,
        ],
      }),
      inject: [ConfigService],
    }),
    // Winston日志模块
    WinstonModule.forRoot(winstonConfig),
    // API限流配置
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000,
          limit: 10,
        },
        {
          name: 'medium',
          ttl: configService.get<number>('security.throttle.ttl'),
          limit: configService.get<number>('security.throttle.limit'),
        },
        {
          name: 'long',
          ttl: 60 * 60 * 1000,
          limit: 1000,
        },
      ],
    }),
    // TypeORM 配置
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqljs' as const,
        database: new Uint8Array(),
        location: configService.get<string>('database.location'),
        autoSave: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}', AuditLog],
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
      }),
    }),
    // Multer文件上传配置
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('upload.dest'),
          filename: (_, file, callback) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = extname(file.originalname);
            const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
            callback(null, filename);
          },
        }),
        limits: {
          fileSize: configService.get<number>('upload.maxFileSize'),
        },
      }),
    }),
    // 业务模块
    UsersModule,
    ProductsModule,
    OrdersModule,
    AuthModule,
    UploadsModule,
    // 系统模块
    HealthModule,
    LanguageModule,
    AuditModule,
    DatabaseModule,
  ],
  providers: [
    // 全局启用限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 对所有路由应用日志中间件
  }
}
