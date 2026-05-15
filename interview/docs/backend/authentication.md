# 认证授权系统实战

身份认证和权限控制是现代应用安全的核心。本文将深入探讨 JWT、OAuth 2.0、Session 等认证方案的实现，以及基于角色的访问控制 (RBAC) 和细粒度权限管理策略。

## 🔐 JWT (JSON Web Tokens) 深度实战

### JWT 架构设计

```javascript
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

class JWTManager {
  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    this.accessTokenExpiry = "15m";
    this.refreshTokenExpiry = "7d";

    // 黑名单存储 (Redis)
    this.tokenBlacklist = new Set();
  }

  // 生成令牌对
  async generateTokenPair(payload) {
    const jti = crypto.randomUUID(); // JWT ID
    const tokenPayload = {
      ...payload,
      jti,
      type: "access",
    };

    const accessToken = jwt.sign(tokenPayload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: "myapp",
      audience: "myapp-users",
    });

    const refreshToken = jwt.sign(
      {
        userId: payload.userId,
        jti,
        type: "refresh",
      },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: "myapp",
      }
    );

    // 存储刷新令牌 (Redis)
    await this.storeRefreshToken(payload.userId, refreshToken, jti);

    return { accessToken, refreshToken };
  }

  // 验证访问令牌
  async verifyAccessToken(token) {
    try {
      // 检查黑名单
      if (this.tokenBlacklist.has(token)) {
        throw new Error("Token has been revoked");
      }

      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: "myapp",
        audience: "myapp-users",
      });

      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  // 刷新令牌
  async refreshTokens(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret);

      if (decoded.type !== "refresh") {
        throw new Error("Invalid refresh token");
      }

      // 验证刷新令牌是否存在于存储中
      const storedToken = await this.getStoredRefreshToken(
        decoded.userId,
        decoded.jti
      );
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error("Refresh token not found or invalid");
      }

      // 获取用户最新信息
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error("User not found or inactive");
      }

      // 撤销旧的刷新令牌
      await this.revokeRefreshToken(decoded.userId, decoded.jti);

      // 生成新的令牌对
      return this.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // 撤销令牌
  async revokeToken(token, type = "access") {
    try {
      const decoded = jwt.decode(token);

      if (type === "access") {
        // 将访问令牌加入黑名单
        this.tokenBlacklist.add(token);

        // 设置过期时间清理
        setTimeout(() => {
          this.tokenBlacklist.delete(token);
        }, 15 * 60 * 1000); // 15分钟后清理
      } else if (type === "refresh") {
        // 从存储中删除刷新令牌
        await this.revokeRefreshToken(decoded.userId, decoded.jti);
      }
    } catch (error) {
      console.error("Token revocation failed:", error);
    }
  }

  // 存储刷新令牌
  async storeRefreshToken(userId, token, jti) {
    const key = `refresh_token:${userId}:${jti}`;
    await redis.setex(key, 7 * 24 * 60 * 60, token); // 7天过期
  }

  // 获取存储的刷新令牌
  async getStoredRefreshToken(userId, jti) {
    const key = `refresh_token:${userId}:${jti}`;
    return await redis.get(key);
  }

  // 撤销刷新令牌
  async revokeRefreshToken(userId, jti) {
    const key = `refresh_token:${userId}:${jti}`;
    await redis.del(key);
  }

  // 撤销用户所有令牌
  async revokeAllUserTokens(userId) {
    const pattern = `refresh_token:${userId}:*`;
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// 认证中间件
const jwtManager = new JWTManager();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: {
          code: "NO_TOKEN",
          message: "Access token required",
        },
      });
    }

    const decoded = await jwtManager.verifyAccessToken(token);

    // 获取用户最新信息
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          code: "INVALID_USER",
          message: "User not found or inactive",
        },
      });
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: {
        code: "INVALID_TOKEN",
        message: error.message,
      },
    });
  }
};

// 可选认证中间件
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = await jwtManager.verifyAccessToken(token);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
        req.tokenPayload = decoded;
      }
    }
  } catch (error) {
    // 忽略认证错误，继续处理请求
    console.warn("Optional auth failed:", error.message);
  }

  next();
};
```

### 高级认证流程

```javascript
// 认证服务
class AuthService {
  static async register(userData) {
    const { email, password, name } = userData;

    // 检查用户是否已存在
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // 密码强度验证
    if (!this.validatePasswordStrength(password)) {
      throw new ValidationError("Password does not meet security requirements");
    }

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      isActive: false, // 需要邮箱验证
      emailVerificationToken: crypto.randomUUID(),
    });

    // 发送验证邮件
    await this.sendVerificationEmail(user);

    return {
      message:
        "Registration successful. Please check your email for verification.",
      userId: user.id,
    };
  }

  static async login(credentials) {
    const { email, password, rememberMe = false } = credentials;

    // 查找用户
    const user = await User.findByEmail(email).select("+password");
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // 检查用户状态
    if (!user.isActive) {
      throw new UnauthorizedError(
        "Account not activated. Please verify your email."
      );
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // 记录失败尝试
      await this.recordFailedAttempt(user.id, req.ip);
      throw new UnauthorizedError("Invalid email or password");
    }

    // 检查账户锁定
    if (await this.isAccountLocked(user.id)) {
      throw new UnauthorizedError(
        "Account temporarily locked due to multiple failed attempts"
      );
    }

    // 更新最后登录时间
    await User.findByIdAndUpdate(user.id, {
      lastLoginAt: new Date(),
      lastLoginIP: req.ip,
    });

    // 生成令牌
    const tokenExpiry = rememberMe ? "30d" : "15m";
    const { accessToken, refreshToken } = await jwtManager.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 记录登录日志
    await this.logAuthEvent("LOGIN_SUCCESS", user.id, req.ip);

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken: rememberMe ? refreshToken : undefined,
      },
    };
  }

  static async logout(req) {
    const { user, tokenPayload } = req;

    // 撤销当前令牌
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      await jwtManager.revokeToken(token, "access");
    }

    // 如果提供了刷新令牌，也要撤销
    const refreshToken = req.body.refreshToken;
    if (refreshToken) {
      await jwtManager.revokeToken(refreshToken, "refresh");
    }

    // 记录登出日志
    await this.logAuthEvent("LOGOUT", user.id, req.ip);

    return { message: "Logged out successfully" };
  }

  static async logoutAll(userId, currentTokenJti) {
    // 撤销用户所有刷新令牌
    await jwtManager.revokeAllUserTokens(userId);

    // 记录登出所有设备日志
    await this.logAuthEvent("LOGOUT_ALL", userId);

    return { message: "Logged out from all devices" };
  }

  static async refreshTokens(refreshToken) {
    try {
      const { accessToken, refreshToken: newRefreshToken } =
        await jwtManager.refreshTokens(refreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedError(error.message);
    }
  }

  // 密码重置流程
  static async requestPasswordReset(email) {
    const user = await User.findByEmail(email);
    if (!user) {
      // 不透露用户是否存在
      return { message: "If the email exists, a reset link has been sent." };
    }

    // 生成重置令牌
    const resetToken = crypto.randomUUID();
    const resetExpiry = new Date(Date.now() + 3600000); // 1小时后过期

    await User.findByIdAndUpdate(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    });

    // 发送重置邮件
    await this.sendPasswordResetEmail(user, resetToken);

    return { message: "If the email exists, a reset link has been sent." };
  }

  static async resetPassword(token, newPassword) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid or expired reset token");
    }

    // 验证新密码强度
    if (!this.validatePasswordStrength(newPassword)) {
      throw new ValidationError("Password does not meet security requirements");
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
      passwordChangedAt: new Date(),
    });

    // 撤销所有现有令牌
    await jwtManager.revokeAllUserTokens(user.id);

    // 记录密码重置日志
    await this.logAuthEvent("PASSWORD_RESET", user.id);

    return { message: "Password reset successfully" };
  }

  // 账户安全相关方法
  static async recordFailedAttempt(userId, ip) {
    const key = `failed_attempts:${userId}`;
    const attempts = await redis.incr(key);
    await redis.expire(key, 900); // 15分钟过期

    if (attempts >= 5) {
      await this.lockAccount(userId, 1800); // 锁定30分钟
    }
  }

  static async isAccountLocked(userId) {
    const key = `account_locked:${userId}`;
    return await redis.exists(key);
  }

  static async lockAccount(userId, seconds) {
    const key = `account_locked:${userId}`;
    await redis.setex(key, seconds, "1");

    await this.logAuthEvent("ACCOUNT_LOCKED", userId);
  }

  static validatePasswordStrength(password) {
    // 至少8个字符，包含大小写字母、数字和特殊字符
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPassword.test(password);
  }

  static sanitizeUser(user) {
    const {
      password,
      passwordResetToken,
      emailVerificationToken,
      ...sanitized
    } = user.toObject();
    return sanitized;
  }

  static async logAuthEvent(event, userId, ip = null) {
    await AuthLog.create({
      event,
      userId,
      ip,
      userAgent: req.headers["user-agent"],
      timestamp: new Date(),
    });
  }
}
```

## 🔑 OAuth 2.0 集成实战

### Google OAuth 2.0 实现

```javascript
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// OAuth 配置
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 查找现有用户
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
        });

        if (user) {
          // 更新 Google ID（如果用户之前通过邮箱注册）
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }

          // 更新最后登录信息
          user.lastLoginAt = new Date();
          await user.save();

          return done(null, user);
        }

        // 创建新用户
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0]?.value,
          isActive: true, // OAuth 用户默认激活
          provider: "google",
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// OAuth 路由
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      // 生成 JWT 令牌
      const { accessToken, refreshToken } = await jwtManager.generateTokenPair({
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
      });

      // 重定向到前端应用
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(
        `${process.env.CLIENT_URL}/auth/error?message=${encodeURIComponent(
          error.message
        )}`
      );
    }
  }
);
```

### 多平台 OAuth 统一管理

```javascript
// OAuth 提供商抽象
class OAuthProvider {
  constructor(name, config) {
    this.name = name;
    this.config = config;
  }

  async authenticate(profile) {
    throw new Error("authenticate method must be implemented");
  }

  async getUserInfo(accessToken) {
    throw new Error("getUserInfo method must be implemented");
  }
}

// Google OAuth 提供商
class GoogleOAuthProvider extends OAuthProvider {
  constructor(config) {
    super("google", config);
  }

  async authenticate(profile) {
    return {
      providerId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos[0]?.value,
    };
  }

  async getUserInfo(accessToken) {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.json();
  }
}

// GitHub OAuth 提供商
class GitHubOAuthProvider extends OAuthProvider {
  constructor(config) {
    super("github", config);
  }

  async authenticate(profile) {
    return {
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName || profile.username,
      avatar: profile.photos[0]?.value,
      username: profile.username,
    };
  }

  async getUserInfo(accessToken) {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
        "User-Agent": "MyApp",
      },
    });

    return response.json();
  }
}

// OAuth 管理器
class OAuthManager {
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  initializeProviders() {
    // 注册 Google 提供商
    if (process.env.GOOGLE_CLIENT_ID) {
      this.providers.set(
        "google",
        new GoogleOAuthProvider({
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
      );
    }

    // 注册 GitHub 提供商
    if (process.env.GITHUB_CLIENT_ID) {
      this.providers.set(
        "github",
        new GitHubOAuthProvider({
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        })
      );
    }
  }

  async handleOAuthCallback(providerName, profile) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Unknown OAuth provider: ${providerName}`);
    }

    const userInfo = await provider.authenticate(profile);

    // 查找或创建用户
    let user = await User.findOne({
      $or: [
        { [`${providerName}Id`]: userInfo.providerId },
        { email: userInfo.email },
      ],
    });

    if (user) {
      // 更新提供商信息
      user[`${providerName}Id`] = userInfo.providerId;
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      // 创建新用户
      user = await User.create({
        ...userInfo,
        [`${providerName}Id`]: userInfo.providerId,
        provider: providerName,
        isActive: true,
      });
    }

    return user;
  }

  async linkAccount(userId, providerName, providerProfile) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Unknown OAuth provider: ${providerName}`);
    }

    const userInfo = await provider.authenticate(providerProfile);

    // 检查提供商账户是否已被其他用户使用
    const existingUser = await User.findOne({
      [`${providerName}Id`]: userInfo.providerId,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new ConflictError("This account is already linked to another user");
    }

    // 链接账户
    await User.findByIdAndUpdate(userId, {
      [`${providerName}Id`]: userInfo.providerId,
    });

    return { message: `${providerName} account linked successfully` };
  }

  async unlinkAccount(userId, providerName) {
    const user = await User.findById(userId);

    // 确保用户至少保留一种登录方式
    const loginMethods = this.getUserLoginMethods(user);
    if (loginMethods.length <= 1) {
      throw new ValidationError(
        "Cannot unlink the last remaining login method"
      );
    }

    await User.findByIdAndUpdate(userId, {
      [`${providerName}Id`]: null,
    });

    return { message: `${providerName} account unlinked successfully` };
  }

  getUserLoginMethods(user) {
    const methods = [];

    if (user.password) methods.push("password");
    if (user.googleId) methods.push("google");
    if (user.githubId) methods.push("github");
    // 添加其他提供商...

    return methods;
  }
}
```

## 🛡️ 基于角色的访问控制 (RBAC)

### 权限模型设计

```javascript
// 权限数据模型
const PermissionSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  resource: { type: String, required: true }, // 资源类型
  action: { type: String, required: true }, // 操作类型
  conditions: Schema.Types.Mixed, // 条件规则
});

const RoleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
  isSystem: { type: Boolean, default: false }, // 系统角色不可删除
  createdAt: { type: Date, default: Date.now },
});

const UserRoleSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
  assignedAt: { type: Date, default: Date.now },
  expiresAt: Date, // 临时角色
});

// 权限管理器
class PermissionManager {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 300000; // 5分钟缓存
  }

  // 检查用户权限
  async hasPermission(userId, resource, action, context = {}) {
    const userPermissions = await this.getUserPermissions(userId);

    return userPermissions.some((permission) => {
      // 检查资源和操作匹配
      if (permission.resource !== resource || permission.action !== action) {
        return false;
      }

      // 检查条件
      if (permission.conditions) {
        return this.evaluateConditions(permission.conditions, context);
      }

      return true;
    });
  }

  // 获取用户权限（带缓存）
  async getUserPermissions(userId) {
    const cacheKey = `user_permissions:${userId}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.permissions;
      }
    }

    const permissions = await this.fetchUserPermissions(userId);

    this.cache.set(cacheKey, {
      permissions,
      timestamp: Date.now(),
    });

    return permissions;
  }

  // 从数据库获取用户权限
  async fetchUserPermissions(userId) {
    const userRoles = await UserRole.find({
      userId,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    }).populate({
      path: "roleId",
      populate: {
        path: "permissions",
      },
    });

    const permissions = [];

    for (const userRole of userRoles) {
      if (userRole.roleId && userRole.roleId.permissions) {
        permissions.push(...userRole.roleId.permissions);
      }
    }

    // 去重
    return permissions.filter(
      (permission, index, self) =>
        index ===
        self.findIndex((p) => p._id.toString() === permission._id.toString())
    );
  }

  // 评估权限条件
  evaluateConditions(conditions, context) {
    try {
      // 简单的条件评估器
      // 实际项目中可以使用更复杂的规则引擎

      if (conditions.owner && context.resourceOwnerId) {
        return context.userId === context.resourceOwnerId;
      }

      if (conditions.department && context.userDepartment) {
        return conditions.department === context.userDepartment;
      }

      if (conditions.timeRange) {
        const now = new Date();
        const start = new Date(conditions.timeRange.start);
        const end = new Date(conditions.timeRange.end);
        return now >= start && now <= end;
      }

      return true;
    } catch (error) {
      console.error("Condition evaluation error:", error);
      return false;
    }
  }

  // 清除用户权限缓存
  clearUserCache(userId) {
    this.cache.delete(`user_permissions:${userId}`);
  }

  // 分配角色
  async assignRole(userId, roleId, assignedBy, expiresAt = null) {
    // 检查角色是否存在
    const role = await Role.findById(roleId);
    if (!role) {
      throw new NotFoundError("Role");
    }

    // 检查是否已分配
    const existing = await UserRole.findOne({ userId, roleId });
    if (existing) {
      throw new ConflictError("Role already assigned to user");
    }

    // 分配角色
    await UserRole.create({
      userId,
      roleId,
      assignedBy,
      expiresAt,
    });

    // 清除缓存
    this.clearUserCache(userId);

    // 记录日志
    await this.logPermissionEvent("ROLE_ASSIGNED", {
      userId,
      roleId,
      assignedBy,
    });
  }

  // 撤销角色
  async revokeRole(userId, roleId) {
    await UserRole.deleteOne({ userId, roleId });
    this.clearUserCache(userId);

    await this.logPermissionEvent("ROLE_REVOKED", {
      userId,
      roleId,
    });
  }

  // 创建权限
  async createPermission(permissionData) {
    const permission = await Permission.create(permissionData);

    // 清除所有权限缓存
    this.cache.clear();

    return permission;
  }

  // 创建角色
  async createRole(roleData) {
    const role = await Role.create(roleData);
    return role;
  }

  // 记录权限事件
  async logPermissionEvent(event, data) {
    await PermissionLog.create({
      event,
      data,
      timestamp: new Date(),
    });
  }
}

// 权限装饰器
function requirePermission(resource, action) {
  return function (target, propertyName, descriptor) {
    const method = descriptor.value;

    descriptor.value = async function (req, res, next) {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required",
            },
          });
        }

        const hasPermission = await permissionManager.hasPermission(
          userId,
          resource,
          action,
          {
            userId,
            resourceOwnerId: req.params.userId || req.body.userId,
            userDepartment: req.user.department,
          }
        );

        if (!hasPermission) {
          return res.status(403).json({
            error: {
              code: "FORBIDDEN",
              message: `Insufficient permissions for ${action} on ${resource}`,
            },
          });
        }

        return method.apply(this, [req, res, next]);
      } catch (error) {
        next(error);
      }
    };

    return descriptor;
  };
}

// 使用示例
const permissionManager = new PermissionManager();

class UserController {
  @requirePermission("user", "read")
  async getUsers(req, res) {
    const users = await User.find();
    res.json({ data: users });
  }

  @requirePermission("user", "create")
  async createUser(req, res) {
    const user = await User.create(req.body);
    res.status(201).json({ data: user });
  }

  @requirePermission("user", "update")
  async updateUser(req, res) {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ data: user });
  }

  @requirePermission("user", "delete")
  async deleteUser(req, res) {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).send();
  }
}
```

---

🔐 **安全的认证授权系统是应用的基石。JWT 提供了无状态的认证方案，OAuth 2.0 实现了第三方登录集成，RBAC 确保了细粒度的权限控制。合理设计这些系统，配合完善的安全策略，能够构建出既安全又易用的身份认证体系！**
