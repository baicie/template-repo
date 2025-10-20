import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

describe('认证系统 E2E 测试', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // 配置与生产环境相同的管道和过滤器
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // 注意：在测试中我们需要手动获取i18n服务
    const i18nService = app.get('I18nService');
    app.useGlobalFilters(new GlobalExceptionFilter(i18nService));
    app.useGlobalInterceptors(new ResponseInterceptor());

    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/auth/register (POST)', () => {
    it('应该成功注册新用户', async () => {
      const registerData = {
        name: '测试用户E2E',
        email: `test-e2e-${Date.now()}@example.com`,
        password: 'password123',
        age: 25,
      };

      const response = await request(server)
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(registerData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('应该拒绝无效的注册数据', async () => {
      const invalidData = {
        name: 'A', // 太短
        email: 'invalid-email', // 无效邮箱
        password: '123', // 太短
        age: -1, // 无效年龄
      };

      await request(server)
        .post('/auth/register')
        .send(invalidData)
        .expect(400);
    });

    it('应该拒绝重复的邮箱注册', async () => {
      const registerData = {
        name: '测试用户',
        email: 'duplicate@example.com',
        password: 'password123',
        age: 25,
      };

      // 第一次注册
      await request(server)
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      // 第二次注册相同邮箱
      await request(server)
        .post('/auth/register')
        .send(registerData)
        .expect(409); // Conflict
    });
  });

  describe('/auth/login (POST)', () => {
    let testUser: any;

    beforeAll(async () => {
      // 创建测试用户
      const registerData = {
        name: '登录测试用户',
        email: `login-test-${Date.now()}@example.com`,
        password: 'password123',
        age: 30,
      };

      const response = await request(server)
        .post('/auth/register')
        .send(registerData);

      testUser = {
        ...registerData,
        access_token: response.body.data.access_token,
      };
    });

    it('应该成功登录有效用户', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      };

      const response = await request(server)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('access_token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('应该拒绝错误的密码', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword',
      };

      await request(server).post('/auth/login').send(loginData).expect(401);
    });

    it('应该拒绝不存在的用户', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await request(server).post('/auth/login').send(loginData).expect(401);
    });

    it('应该拒绝无效的请求数据', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      };

      await request(server).post('/auth/login').send(invalidData).expect(400);
    });
  });

  describe('/auth/profile (GET)', () => {
    let testUser: any;
    let accessToken: string;

    beforeAll(async () => {
      // 创建测试用户并获取token
      const registerData = {
        name: '个人信息测试用户',
        email: `profile-test-${Date.now()}@example.com`,
        password: 'password123',
        age: 28,
      };

      const response = await request(server)
        .post('/auth/register')
        .send(registerData);

      testUser = registerData;
      accessToken = response.body.data.access_token;
    });

    it('应该返回已认证用户的个人信息', async () => {
      const response = await request(server)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('应该拒绝未认证的请求', async () => {
      await request(server).get('/auth/profile').expect(401);
    });

    it('应该拒绝无效的token', async () => {
      await request(server)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('国际化支持测试', () => {
    it('应该根据请求头返回中文错误信息', async () => {
      const invalidData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      const response = await request(server)
        .post('/auth/login')
        .set('X-Lang', 'zh')
        .send(invalidData)
        .expect(401);

      // 验证返回的是中文错误信息
      expect(response.body.message).toMatch(/错误|失败/);
    });

    it('应该根据请求头返回英文错误信息', async () => {
      const invalidData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      const response = await request(server)
        .post('/auth/login')
        .set('X-Lang', 'en')
        .send(invalidData)
        .expect(401);

      // 验证返回的是英文错误信息
      expect(response.body.message).toMatch(/invalid|error|failed/i);
    });
  });
});
