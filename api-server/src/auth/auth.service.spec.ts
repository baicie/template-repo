import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { InvalidCredentialsException } from '../common/exceptions/business.exception';
import { AuthService } from './auth.service';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    name: '测试用户',
    email: 'test@example.com',
    age: 25,
    password: 'hashedPassword123',
    role: UserRole.USER,
    createdAt: new Date(),
  };

  const mockUserRepository = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  const mockJwtService = {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    // 重置所有mock
    vi.clearAllMocks();

    // 重新设置 mockJwtService 的默认行为
    mockJwtService.sign.mockReturnValue('mock-jwt-token');
  });

  describe('validateUser', () => {
    it('应该返回用户信息（不包含密码）当凭据正确时', async () => {
      // Arrange
      const bcrypt = await import('bcryptjs');
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Act
      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        age: mockUser.age,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
      });
      expect(result.password).toBeUndefined();
    });

    it('应该返回null当用户不存在时', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(
        'nonexistent@example.com',
        'password123',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('应该返回null当密码错误时', async () => {
      // Arrange
      const bcrypt = await import('bcryptjs');
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      // Act
      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('应该返回JWT token和用户信息当登录成功时', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const userWithoutPassword = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        age: mockUser.age,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
      };

      vi.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: userWithoutPassword,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: userWithoutPassword.email,
        sub: userWithoutPassword.id,
        role: userWithoutPassword.role,
      });
    });

    it('应该抛出InvalidCredentialsException当凭据无效时', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      vi.spyOn(service, 'validateUser').mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
    });
  });

  describe('register', () => {
    it('应该创建新用户并返回JWT token', async () => {
      // Arrange
      const registerDto = {
        name: '新用户',
        email: 'newuser@example.com',
        password: 'password123',
        age: 20,
        role: UserRole.USER,
      };

      mockUserRepository.findOne.mockResolvedValue(null); // 用户不存在
      mockUserRepository.create.mockReturnValue(mockUser);
      const bcrypt = await import('bcryptjs');
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword123' as never);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        name: registerDto.name,
        email: registerDto.email,
        age: registerDto.age,
        password: 'hashedPassword123',
        role: UserRole.USER,
      });
    });

    it('应该抛出ConflictException当邮箱已存在时', async () => {
      // Arrange
      const registerDto = {
        name: '新用户',
        email: 'existing@example.com',
        password: 'password123',
        age: 20,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser); // 用户已存在

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe('validateUserById', () => {
    it('应该返回用户当ID存在时', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUserById(1);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('应该返回null当ID不存在时', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateUserById(999);

      // Assert
      expect(result).toBeNull();
    });
  });
});
