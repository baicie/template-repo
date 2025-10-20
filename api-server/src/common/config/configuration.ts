export default () => ({
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  // Database
  database: {
    type: process.env.DB_TYPE || 'sqljs',
    location: process.env.DB_LOCATION || 'database.sqljs',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'development-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Authentication
  auth: {
    enabled: process.env.AUTH_ENABLED === 'false' ? false : true, // 默认开启，只有显式设置为false才关闭
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN || '*',
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60000,
      limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
    },
  },

  // File Upload
  upload: {
    dest: process.env.UPLOAD_DEST || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
  },

  // i18n
  i18n: {
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'zh',
    fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en',
  },

  // Application
  app: {
    name: process.env.APP_NAME || 'Faker API',
    description: process.env.APP_DESCRIPTION || '用于测试的API接口',
    version: process.env.APP_VERSION || '1.0.0',
  },
});
