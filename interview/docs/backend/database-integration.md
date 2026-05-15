# 数据库集成实战指南

现代后端应用需要处理各种数据存储需求，从关系型数据库到 NoSQL 数据库，从缓存系统到搜索引擎。本文将深入探讨 Node.js 与主流数据库的集成方案、最佳实践和性能优化策略。

## 🗃️ 数据库选型决策

### 数据库类型对比

| 数据库类型   | 代表产品          | 适用场景           | 优势                  | 劣势         |
| ------------ | ----------------- | ------------------ | --------------------- | ------------ |
| **关系型**   | MySQL, PostgreSQL | 复杂查询、事务处理 | ACID、SQL 标准        | 扩展性有限   |
| **文档型**   | MongoDB, CouchDB  | 半结构化数据       | 灵活 Schema、水平扩展 | 查询能力有限 |
| **键值型**   | Redis, DynamoDB   | 缓存、会话存储     | 极高性能、简单        | 功能单一     |
| **列族型**   | Cassandra, HBase  | 大数据、时序数据   | 高可用、大容量        | 学习成本高   |
| **图数据库** | Neo4j, ArangoDB   | 关系分析、推荐系统 | 复杂关系查询          | 应用场景局限 |

## 🐘 PostgreSQL 深度集成

### 高级连接管理

```javascript
const { Pool, Client } = require("pg");
const { promisify } = require("util");

// 连接池配置
class DatabaseManager {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,

      // 连接池配置
      min: 2, // 最小连接数
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000, // 空闲超时
      connectionTimeoutMillis: 2000, // 连接超时

      // SSL 配置 (生产环境)
      ssl:
        process.env.NODE_ENV === "production"
          ? {
              rejectUnauthorized: false,
            }
          : false,

      // 连接重试
      acquireConnectionTimeout: 2000,

      // 应用名称 (便于监控)
      application_name: "nodejs_app",
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.pool.on("connect", (client) => {
      console.log("New client connected");

      // 设置客户端时区
      client.query('SET timezone = "UTC"');
    });

    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });

    this.pool.on("acquire", (client) => {
      console.log("Client acquired from pool");
    });

    this.pool.on("remove", (client) => {
      console.log("Client removed from pool");
    });
  }

  // 事务管理
  async transaction(callback) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // 批量操作
  async batchInsert(tableName, data, batchSize = 1000) {
    if (!data.length) return [];

    const keys = Object.keys(data[0]);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO ${tableName} (${keys.join(
      ", "
    )}) VALUES (${placeholders}) RETURNING id`;

    const results = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      await this.transaction(async (client) => {
        for (const item of batch) {
          const values = keys.map((key) => item[key]);
          const result = await client.query(query, values);
          results.push(result.rows[0]);
        }
      });
    }

    return results;
  }

  // 流式查询 (大数据集)
  async streamQuery(query, params, callback) {
    const client = await this.pool.connect();

    try {
      const stream = client.query(new QueryStream(query, params));

      stream.on("data", callback);

      return new Promise((resolve, reject) => {
        stream.on("end", resolve);
        stream.on("error", reject);
      });
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

// 使用示例
const db = new DatabaseManager();

// 用户服务示例
class UserService {
  // 复杂查询示例
  static async findUsersWithPosts(filters = {}) {
    const {
      search,
      minPosts,
      orderBy = "created_at",
      order = "DESC",
    } = filters;

    let query = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.created_at,
        COUNT(p.id) as post_count,
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'id', p.id,
            'title', p.title,
            'created_at', p.created_at
          ) ORDER BY p.created_at DESC
        ) FILTER (WHERE p.id IS NOT NULL) as recent_posts
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY u.id, u.email, u.name, u.created_at`;

    if (minPosts) {
      paramCount++;
      query += ` HAVING COUNT(p.id) >= $${paramCount}`;
      params.push(minPosts);
    }

    query += ` ORDER BY ${orderBy} ${order}`;

    const result = await db.pool.query(query, params);
    return result.rows;
  }

  // 全文搜索
  static async searchUsers(searchTerm) {
    const query = `
      SELECT 
        u.*,
        ts_rank(search_vector, plainto_tsquery('english', $1)) as rank
      FROM users u
      WHERE search_vector @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT 50
    `;

    const result = await db.pool.query(query, [searchTerm]);
    return result.rows;
  }

  // 数据统计
  static async getUserStats() {
    const query = `
      WITH user_stats AS (
        SELECT 
          u.id,
          u.created_at,
          COUNT(p.id) as post_count,
          COUNT(c.id) as comment_count,
          COALESCE(AVG(pr.rating), 0) as avg_rating
        FROM users u
        LEFT JOIN posts p ON u.id = p.user_id
        LEFT JOIN comments c ON u.id = c.user_id
        LEFT JOIN post_ratings pr ON p.id = pr.post_id
        GROUP BY u.id, u.created_at
      )
      SELECT 
        COUNT(*) as total_users,
        AVG(post_count) as avg_posts_per_user,
        AVG(comment_count) as avg_comments_per_user,
        AVG(avg_rating) as platform_avg_rating,
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_users_count
      FROM user_stats
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;

    const result = await db.pool.query(query);
    return result.rows;
  }
}
```

### TypeORM 高级应用

```typescript
// 实体定义
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";

@Entity("users")
@Index(["email"])
@Index(["name", "created_at"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  name: string;

  @Column({ select: false }) // 默认不查询密码
  password: string;

  @Column({ type: "enum", enum: ["user", "admin"], default: "user" })
  role: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @Column({ type: "tsvector", select: false })
  searchVector: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @BeforeInsert()
  @BeforeUpdate()
  updateSearchVector() {
    // 更新全文搜索向量
    this.searchVector = `${this.name} ${this.email}`;
  }
}

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column("text")
  content: string;

  @Column({ type: "jsonb", default: "[]" })
  tags: string[];

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE" })
  author: User;

  @Column()
  authorId: string;
}

// 数据访问层
import { Repository, DataSource, SelectQueryBuilder } from "typeorm";

export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  // 复杂查询构建器
  createUserQuery(): SelectQueryBuilder<User> {
    return this.createQueryBuilder("user")
      .leftJoinAndSelect("user.posts", "posts")
      .loadRelationCountAndMap("user.postCount", "user.posts");
  }

  // 分页查询
  async findWithPagination(options: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
  }) {
    const { page, limit, search, role } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.createUserQuery();

    if (search) {
      queryBuilder.where(
        "user.name ILIKE :search OR user.email ILIKE :search",
        { search: `%${search}%` }
      );
    }

    if (role) {
      queryBuilder.andWhere("user.role = :role", { role });
    }

    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy("user.createdAt", "DESC")
      .getManyAndCount();

    return {
      data: users,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // 原生 SQL 查询
  async getUserStatsByMonth() {
    return this.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as user_count,
        COUNT(*) FILTER (WHERE role = 'admin') as admin_count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);
  }

  // 事务操作
  async createUserWithProfile(userData: any, profileData: any) {
    return this.manager.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.save(User, userData);

      const profile = await transactionalEntityManager.save(Profile, {
        ...profileData,
        userId: user.id,
      });

      return { user, profile };
    });
  }
}
```

## 🍃 MongoDB 现代化应用

### Mongoose 高级模式

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

// 高级 Schema 定义
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          return /^\S+@\S+\.\S+$/.test(email);
        },
        message: "Please provide a valid email",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // 默认不查询密码
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    profile: {
      avatar: String,
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
      },
      social: {
        twitter: String,
        linkedin: String,
        github: String,
      },
      preferences: {
        notifications: {
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
        theme: {
          type: String,
          enum: ["light", "dark", "auto"],
          default: "auto",
        },
      },
    },

    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: Date,

    // 地理位置信息
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
      address: String,
    },

    // 版本控制
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt
    versionKey: false,

    // 虚拟字段
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 索引定义
userSchema.index({ email: 1 });
userSchema.index({ location: "2dsphere" });
userSchema.index({ createdAt: -1 });
userSchema.index({ name: "text", "profile.bio": "text" });

// 虚拟字段
userSchema.virtual("fullProfile").get(function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.profile?.avatar,
    bio: this.profile?.bio,
  };
});

// 中间件 (Hooks)
userSchema.pre("save", async function (next) {
  // 密码加密
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // 更新版本号
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }

  next();
});

userSchema.pre(/^find/, function (next) {
  // 默认只查询活跃用户
  this.find({ isActive: { $ne: false } });
  next();
});

userSchema.post("save", function (doc) {
  console.log(`User ${doc.name} has been saved`);
});

// 实例方法
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.updateLastLogin = function () {
  this.lastLoginAt = new Date();
  return this.save();
};

userSchema.methods.isNearby = function (
  longitude,
  latitude,
  maxDistance = 1000
) {
  if (!this.location?.coordinates) return false;

  const [userLng, userLat] = this.location.coordinates;
  const distance = this.calculateDistance(
    userLat,
    userLng,
    latitude,
    longitude
  );

  return distance <= maxDistance;
};

userSchema.methods.calculateDistance = function (lat1, lng1, lat2, lng2) {
  const R = 6371e3; // 地球半径 (米)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// 静态方法
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findNearby = function (
  longitude,
  latitude,
  maxDistance = 1000
) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
  });
};

userSchema.statics.getStatistics = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] },
        },
        avgProfileCompleteness: {
          $avg: {
            $cond: [{ $and: ["$profile.avatar", "$profile.bio"] }, 100, 50],
          },
        },
      },
    },
  ]);
};

const User = mongoose.model("User", userSchema);

// 高级查询示例
class UserService {
  // 聚合查询示例
  static async getUserAnalytics(timeRange = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    return User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          newUsers: { $sum: 1 },
          roles: { $push: "$role" },
        },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          newUsers: 1,
          adminCount: {
            $size: {
              $filter: {
                input: "$roles",
                cond: { $eq: ["$$this", "admin"] },
              },
            },
          },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);
  }

  // 复杂搜索
  static async searchUsers(options) {
    const {
      text,
      role,
      location,
      maxDistance = 1000,
      page = 1,
      limit = 10,
    } = options;

    const query = {};

    // 文本搜索
    if (text) {
      query.$text = { $search: text };
    }

    // 角色过滤
    if (role) {
      query.role = role;
    }

    // 地理位置搜索
    if (location) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [location.longitude, location.latitude],
          },
          $maxDistance: maxDistance,
        },
      };
    }

    const users = await User.find(query)
      .select("-password")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(text ? { score: { $meta: "textScore" } } : { createdAt: -1 });

    const total = await User.countDocuments(query);

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // 批量更新
  static async bulkUpdateUsers(updates) {
    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: update.data },
        upsert: false,
      },
    }));

    return User.bulkWrite(bulkOps);
  }
}
```

## 🔴 Redis 缓存策略

### 高级缓存模式

```javascript
const Redis = require("ioredis");

class RedisManager {
  constructor() {
    // Redis 集群配置
    this.redis = new Redis.Cluster(
      [
        { host: "127.0.0.1", port: 7000 },
        { host: "127.0.0.1", port: 7001 },
        { host: "127.0.0.1", port: 7002 },
      ],
      {
        redisOptions: {
          password: process.env.REDIS_PASSWORD,
          db: 0,
        },
        // 重试策略
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        // 集群配置
        enableOfflineQueue: false,
        clusterRetryDelay: 300,
      }
    );

    // 单机 Redis 备选方案
    this.fallbackRedis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.redis.on("connect", () => {
      console.log("Redis cluster connected");
    });

    this.redis.on("error", (err) => {
      console.error("Redis cluster error:", err);
    });

    this.redis.on("ready", () => {
      console.log("Redis cluster ready");
    });
  }

  // 缓存装饰器模式
  cache(options = {}) {
    const {
      ttl = 3600,
      keyPrefix = "cache",
      serialize = JSON.stringify,
      deserialize = JSON.parse,
    } = options;

    return (target, propertyName, descriptor) => {
      const method = descriptor.value;

      descriptor.value = async function (...args) {
        const cacheKey = `${keyPrefix}:${propertyName}:${Buffer.from(
          JSON.stringify(args)
        ).toString("base64")}`;

        try {
          // 尝试从缓存获取
          const cached = await this.redis.get(cacheKey);
          if (cached) {
            return deserialize(cached);
          }
        } catch (error) {
          console.warn("Cache read failed:", error);
        }

        // 执行原方法
        const result = await method.apply(this, args);

        try {
          // 写入缓存
          await this.redis.setex(cacheKey, ttl, serialize(result));
        } catch (error) {
          console.warn("Cache write failed:", error);
        }

        return result;
      };

      return descriptor;
    };
  }

  // 分布式锁
  async acquireLock(key, ttl = 10000, retries = 3) {
    const lockKey = `lock:${key}`;
    const lockValue = Math.random().toString(36).substring(7);

    for (let i = 0; i < retries; i++) {
      const result = await this.redis.set(lockKey, lockValue, "PX", ttl, "NX");

      if (result === "OK") {
        return {
          key: lockKey,
          value: lockValue,
          release: async () => {
            const script = `
              if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
              else
                return 0
              end
            `;
            return this.redis.eval(script, 1, lockKey, lockValue);
          },
        };
      }

      // 等待重试
      await new Promise((resolve) => setTimeout(resolve, 100 * (i + 1)));
    }

    throw new Error(`Failed to acquire lock for ${key}`);
  }

  // 限流器 (滑动窗口)
  async rateLimit(key, limit, window = 60) {
    const now = Date.now();
    const pipeline = this.redis.pipeline();

    // 清理过期的记录
    pipeline.zremrangebyscore(key, 0, now - window * 1000);

    // 添加当前请求
    pipeline.zadd(key, now, now);

    // 获取当前窗口内的请求数
    pipeline.zcard(key);

    // 设置过期时间
    pipeline.expire(key, window);

    const results = await pipeline.exec();
    const count = results[2][1];

    return {
      allowed: count <= limit,
      count,
      remaining: Math.max(0, limit - count),
      resetTime: now + window * 1000,
    };
  }

  // 发布订阅模式
  async setupPubSub() {
    const subscriber = this.redis.duplicate();
    const publisher = this.redis.duplicate();

    // 订阅器
    subscriber.on("message", (channel, message) => {
      try {
        const data = JSON.parse(message);
        this.handleMessage(channel, data);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    });

    return { subscriber, publisher };
  }

  // 会话存储
  async setSession(sessionId, data, ttl = 86400) {
    const key = `session:${sessionId}`;
    return this.redis.setex(key, ttl, JSON.stringify(data));
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async updateSession(sessionId, updates, ttl = 86400) {
    const key = `session:${sessionId}`;
    const current = await this.getSession(sessionId);

    if (current) {
      const updated = { ...current, ...updates };
      return this.redis.setex(key, ttl, JSON.stringify(updated));
    }

    return false;
  }

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    return this.redis.del(key);
  }

  // 排行榜功能
  async updateLeaderboard(leaderboard, member, score) {
    return this.redis.zadd(leaderboard, score, member);
  }

  async getLeaderboard(leaderboard, start = 0, end = 9, withScores = true) {
    if (withScores) {
      return this.redis.zrevrange(leaderboard, start, end, "WITHSCORES");
    }
    return this.redis.zrevrange(leaderboard, start, end);
  }

  async getMemberRank(leaderboard, member) {
    const rank = await this.redis.zrevrank(leaderboard, member);
    const score = await this.redis.zscore(leaderboard, member);
    return { rank: rank !== null ? rank + 1 : null, score };
  }
}

// 使用示例
const redisManager = new RedisManager();

class CachedUserService {
  @redisManager.cache({ ttl: 1800, keyPrefix: "user" })
  async getUserById(id) {
    return User.findById(id);
  }

  @redisManager.cache({ ttl: 3600, keyPrefix: "user_posts" })
  async getUserPosts(userId, page = 1) {
    return Post.find({ authorId: userId })
      .limit(10)
      .skip((page - 1) * 10)
      .sort({ createdAt: -1 });
  }

  // 分布式锁使用示例
  async updateUserProfile(userId, data) {
    const lock = await redisManager.acquireLock(`user_update:${userId}`);

    try {
      const user = await User.findById(userId);
      Object.assign(user, data);
      await user.save();

      // 清除相关缓存
      await this.invalidateUserCache(userId);

      return user;
    } finally {
      await lock.release();
    }
  }

  async invalidateUserCache(userId) {
    const pattern = `user:*:${Buffer.from(JSON.stringify([userId])).toString(
      "base64"
    )}`;
    const keys = await redisManager.redis.keys(pattern);

    if (keys.length > 0) {
      await redisManager.redis.del(...keys);
    }
  }
}
```

## 🔄 多数据库架构模式

### 读写分离与数据同步

```javascript
// 数据库路由器
class DatabaseRouter {
  constructor() {
    // 主数据库 (写)
    this.master = new Pool({
      host: process.env.DB_MASTER_HOST,
      port: process.env.DB_MASTER_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
    });

    // 从数据库 (读)
    this.slaves = [
      new Pool({
        host: process.env.DB_SLAVE1_HOST,
        port: process.env.DB_SLAVE1_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20,
      }),
      new Pool({
        host: process.env.DB_SLAVE2_HOST,
        port: process.env.DB_SLAVE2_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20,
      }),
    ];

    this.currentSlaveIndex = 0;
  }

  // 获取读数据库连接 (轮询负载均衡)
  getReadConnection() {
    const slave = this.slaves[this.currentSlaveIndex];
    this.currentSlaveIndex = (this.currentSlaveIndex + 1) % this.slaves.length;
    return slave;
  }

  // 获取写数据库连接
  getWriteConnection() {
    return this.master;
  }

  // 智能路由查询
  async query(sql, params, options = {}) {
    const { forceWriteDb = false, timeout = 5000, retries = 3 } = options;

    // 判断是否为写操作
    const isWriteOperation =
      /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\s+/i.test(sql);

    const db =
      isWriteOperation || forceWriteDb
        ? this.getWriteConnection()
        : this.getReadConnection();

    // 带重试的查询执行
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await Promise.race([
          db.query(sql, params),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Query timeout")), timeout)
          ),
        ]);

        return result;
      } catch (error) {
        console.error(`Query attempt ${attempt} failed:`, error.message);

        if (attempt === retries) {
          throw error;
        }

        // 等待后重试
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // 事务支持 (仅主库)
  async transaction(callback) {
    const client = await this.master.connect();

    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.master.end();
    await Promise.all(this.slaves.map((slave) => slave.end()));
  }
}

// 数据同步服务
class DataSyncService {
  constructor(sourceDb, targetDb) {
    this.sourceDb = sourceDb;
    this.targetDb = targetDb;
    this.syncQueue = [];
    this.isRunning = false;
  }

  async startSync() {
    if (this.isRunning) return;

    this.isRunning = true;

    // 监听数据库变更
    this.setupChangeStream();

    // 定期同步队列
    this.syncInterval = setInterval(() => {
      this.processSyncQueue();
    }, 5000);
  }

  setupChangeStream() {
    // 监听表变更 (需要数据库支持)
    this.sourceDb.query("LISTEN table_changes");

    this.sourceDb.on("notification", (notification) => {
      const change = JSON.parse(notification.payload);
      this.queueSync(change);
    });
  }

  queueSync(change) {
    this.syncQueue.push({
      ...change,
      timestamp: Date.now(),
    });
  }

  async processSyncQueue() {
    if (this.syncQueue.length === 0) return;

    const batch = this.syncQueue.splice(0, 100); // 批量处理

    try {
      await this.targetDb.transaction(async (client) => {
        for (const change of batch) {
          await this.applyChange(client, change);
        }
      });
    } catch (error) {
      console.error("Sync failed:", error);
      // 重新加入队列
      this.syncQueue.unshift(...batch);
    }
  }

  async applyChange(client, change) {
    const { operation, table, data, conditions } = change;

    switch (operation) {
      case "INSERT":
        const insertSql = this.buildInsertSql(table, data);
        await client.query(insertSql.sql, insertSql.values);
        break;

      case "UPDATE":
        const updateSql = this.buildUpdateSql(table, data, conditions);
        await client.query(updateSql.sql, updateSql.values);
        break;

      case "DELETE":
        const deleteSql = this.buildDeleteSql(table, conditions);
        await client.query(deleteSql.sql, deleteSql.values);
        break;
    }
  }

  buildInsertSql(table, data) {
    const keys = Object.keys(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO ${table} (${keys.join(
      ", "
    )}) VALUES (${placeholders})`;
    const values = keys.map((key) => data[key]);

    return { sql, values };
  }

  buildUpdateSql(table, data, conditions) {
    const dataKeys = Object.keys(data);
    const conditionKeys = Object.keys(conditions);

    const setClause = dataKeys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    const whereClause = conditionKeys
      .map((key, i) => `${key} = $${dataKeys.length + i + 1}`)
      .join(" AND ");

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const values = [
      ...dataKeys.map((key) => data[key]),
      ...conditionKeys.map((key) => conditions[key]),
    ];

    return { sql, values };
  }

  buildDeleteSql(table, conditions) {
    const keys = Object.keys(conditions);
    const whereClause = keys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(" AND ");

    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const values = keys.map((key) => conditions[key]);

    return { sql, values };
  }

  stopSync() {
    this.isRunning = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// 使用示例
const dbRouter = new DatabaseRouter();

class UserRepository {
  async findById(id) {
    const result = await dbRouter.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  async create(userData) {
    return dbRouter.transaction(async (client) => {
      const userResult = await client.query(
        "INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING *",
        [userData.email, userData.name, userData.password]
      );

      const user = userResult.rows[0];

      // 创建用户配置文件
      await client.query(
        "INSERT INTO user_profiles (user_id, preferences) VALUES ($1, $2)",
        [user.id, JSON.stringify(userData.preferences || {})]
      );

      return user;
    });
  }

  async search(query, options = {}) {
    const { limit = 10, offset = 0 } = options;

    // 复杂查询使用读库
    const result = await dbRouter.query(
      `
      SELECT u.*, up.preferences
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.name ILIKE $1 OR u.email ILIKE $1
      ORDER BY u.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [`%${query}%`, limit, offset]
    );

    return result.rows;
  }
}
```

---

🗂️ **现代应用的数据存储需求复杂多样，合理的数据库选型和架构设计是系统成功的关键。掌握关系型数据库的 ACID 特性、NoSQL 的灵活性、Redis 的高性能缓存，以及多数据库协同工作的模式，能够帮你构建健壮可扩展的数据层！**
