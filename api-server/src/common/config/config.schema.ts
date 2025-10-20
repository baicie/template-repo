import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Server
  PORT: Joi.number().port().default(3000),

  // Database
  DB_TYPE: Joi.string()
    .valid('sqljs', 'sqlite', 'mysql', 'postgres')
    .default('sqljs'),
  DB_LOCATION: Joi.string().default('database.sqljs'),
  DB_SYNCHRONIZE: Joi.boolean().default(true),
  DB_LOGGING: Joi.boolean().default(false),

  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),

  // Security
  CORS_ORIGIN: Joi.string().default('*'),
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),

  // File Upload
  UPLOAD_DEST: Joi.string().default('./uploads'),
  MAX_FILE_SIZE: Joi.number().default(5242880), // 5MB

  // i18n Configuration
  DEFAULT_LANGUAGE: Joi.string().valid('zh', 'en').default('zh'),
  FALLBACK_LANGUAGE: Joi.string().valid('zh', 'en').default('en'),

  // Application
  APP_NAME: Joi.string().default('Faker API'),
  APP_DESCRIPTION: Joi.string().default('用于测试的API接口'),
  APP_VERSION: Joi.string().default('1.0.0'),
});
