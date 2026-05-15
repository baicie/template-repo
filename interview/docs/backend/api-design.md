# RESTful API 设计与 GraphQL 实战

现代 API 设计需要在简洁性、灵活性和性能之间找到平衡。本文将深入探讨 RESTful API 的最佳实践、GraphQL 的优势与应用，以及 API 设计的进阶技巧。

## 🎯 API 设计哲学

### REST vs GraphQL 对比

| 特性         | RESTful API         | GraphQL            |
| ------------ | ------------------- | ------------------ |
| **数据获取** | 多次请求            | 单次精确查询       |
| **缓存策略** | HTTP 缓存友好       | 需要自定义缓存     |
| **学习成本** | 低                  | 中等               |
| **工具支持** | 成熟丰富            | 快速发展           |
| **版本管理** | URL/Header 版本控制 | Schema 演进        |
| **实时功能** | 需要额外方案        | 内置 Subscription  |
| **网络效率** | 可能过度获取        | 精确获取           |
| **适用场景** | 传统 CRUD、微服务   | 复杂查询、移动应用 |

## 🌐 RESTful API 设计精髓

### 资源设计与 URL 结构

```javascript
// 优秀的 RESTful API 设计
const express = require("express");
const router = express.Router();

// 1. 资源层次设计
/*
GET    /api/v1/users                    # 获取用户列表
POST   /api/v1/users                    # 创建用户
GET    /api/v1/users/:id                # 获取特定用户
PUT    /api/v1/users/:id                # 更新用户
DELETE /api/v1/users/:id                # 删除用户

GET    /api/v1/users/:id/posts          # 获取用户的文章
POST   /api/v1/users/:id/posts          # 为用户创建文章
GET    /api/v1/users/:id/posts/:postId  # 获取用户的特定文章

GET    /api/v1/posts                    # 获取所有文章
GET    /api/v1/posts/:id/comments       # 获取文章评论
POST   /api/v1/posts/:id/comments       # 添加评论
*/

// 2. 高级查询参数设计
class QueryBuilder {
  constructor(baseQuery) {
    this.query = baseQuery;
    this.filters = {};
    this.sorts = [];
    this.includes = [];
    this.page = 1;
    this.limit = 20;
  }

  // 过滤参数解析
  parseFilters(queryParams) {
    const operators = {
      eq: "=", // 等于
      ne: "!=", // 不等于
      gt: ">", // 大于
      gte: ">=", // 大于等于
      lt: "<", // 小于
      lte: "<=", // 小于等于
      in: "IN", // 包含
      like: "LIKE", // 模糊匹配
    };

    Object.keys(queryParams).forEach((key) => {
      if (key.startsWith("filter[")) {
        const match = key.match(/filter\[(.+)\](?:\[(.+)\])?/);
        if (match) {
          const field = match[1];
          const operator = match[2] || "eq";
          const value = queryParams[key];

          if (operators[operator]) {
            this.addFilter(field, operator, value);
          }
        }
      }
    });

    return this;
  }

  addFilter(field, operator, value) {
    if (!this.filters[field]) {
      this.filters[field] = [];
    }

    this.filters[field].push({ operator, value });
    return this;
  }

  // 排序参数解析
  parseSort(sortParam) {
    if (!sortParam) return this;

    const sortFields = sortParam.split(",");
    sortFields.forEach((field) => {
      const direction = field.startsWith("-") ? "DESC" : "ASC";
      const fieldName = field.replace(/^-/, "");
      this.sorts.push({ field: fieldName, direction });
    });

    return this;
  }

  // 关联查询参数
  parseIncludes(includeParam) {
    if (!includeParam) return this;

    this.includes = includeParam.split(",").map((include) => include.trim());
    return this;
  }

  // 分页参数
  parsePagination(queryParams) {
    this.page = parseInt(queryParams.page) || 1;
    this.limit = Math.min(parseInt(queryParams.limit) || 20, 100);
    return this;
  }

  // 构建最终查询
  build() {
    let query = this.query;
    const params = [];
    let paramIndex = 1;

    // 添加过滤条件
    const whereConditions = [];
    Object.keys(this.filters).forEach((field) => {
      this.filters[field].forEach((filter) => {
        const { operator, value } = filter;

        switch (operator) {
          case "eq":
            whereConditions.push(`${field} = $${paramIndex}`);
            params.push(value);
            paramIndex++;
            break;
          case "like":
            whereConditions.push(`${field} ILIKE $${paramIndex}`);
            params.push(`%${value}%`);
            paramIndex++;
            break;
          case "in":
            const values = Array.isArray(value) ? value : value.split(",");
            const placeholders = values.map(() => `$${paramIndex++}`).join(",");
            whereConditions.push(`${field} IN (${placeholders})`);
            params.push(...values);
            break;
        }
      });
    });

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    // 添加排序
    if (this.sorts.length > 0) {
      const sortClauses = this.sorts.map(
        (sort) => `${sort.field} ${sort.direction}`
      );
      query += ` ORDER BY ${sortClauses.join(", ")}`;
    }

    // 添加分页
    const offset = (this.page - 1) * this.limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(this.limit, offset);

    return {
      query,
      params,
      pagination: { page: this.page, limit: this.limit },
    };
  }
}

// 使用示例
router.get("/users", async (req, res) => {
  try {
    const queryBuilder = new QueryBuilder("SELECT * FROM users")
      .parseFilters(req.query)
      .parseSort(req.query.sort)
      .parseIncludes(req.query.include)
      .parsePagination(req.query);

    const { query, params, pagination } = queryBuilder.build();

    const result = await db.query(query, params);
    const total = await db.query("SELECT COUNT(*) FROM users", []);

    res.json({
      data: result.rows,
      meta: {
        pagination: {
          ...pagination,
          total: parseInt(total.rows[0].count),
          pages: Math.ceil(total.rows[0].count / pagination.limit),
        },
      },
      links: {
        self: `${req.originalUrl}`,
        first: `${req.baseUrl}?page=1&limit=${pagination.limit}`,
        last: `${req.baseUrl}?page=${Math.ceil(
          total.rows[0].count / pagination.limit
        )}&limit=${pagination.limit}`,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// URL 示例:
// GET /api/v1/users?filter[status]=active&filter[age][gte]=18&sort=-created_at,name&include=posts,profile&page=2&limit=10
```

### HTTP 状态码与错误处理

```javascript
// 标准化的错误处理中间件
class APIError extends Error {
  constructor(
    message,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details = null
  ) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// 预定义错误类型
class ValidationError extends APIError {
  constructor(details) {
    super("Validation failed", 400, "VALIDATION_ERROR", details);
  }
}

class NotFoundError extends APIError {
  constructor(resource) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

class ConflictError extends APIError {
  constructor(message) {
    super(message, 409, "CONFLICT");
  }
}

class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

class ForbiddenError extends APIError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

class RateLimitError extends APIError {
  constructor(retryAfter) {
    super("Rate limit exceeded", 429, "RATE_LIMIT_EXCEEDED");
    this.retryAfter = retryAfter;
  }
}

// 全局错误处理中间件
const errorHandler = (error, req, res, next) => {
  // 记录错误
  console.error(`[${req.id}] Error:`, {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    user: req.user?.id,
  });

  // API 错误
  if (error instanceof APIError) {
    const response = {
      error: {
        code: error.code,
        message: error.message,
        timestamp: error.timestamp,
        requestId: req.id,
      },
    };

    if (error.details) {
      response.error.details = error.details;
    }

    if (error instanceof RateLimitError) {
      res.setHeader("Retry-After", error.retryAfter);
    }

    return res.status(error.statusCode).json(response);
  }

  // 数据库错误
  if (error.code === "23505") {
    // PostgreSQL unique violation
    return res.status(409).json({
      error: {
        code: "DUPLICATE_ENTRY",
        message: "Resource already exists",
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    });
  }

  // JWT 错误
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid authentication token",
        timestamp: new Date().toISOString(),
        requestId: req.id,
      },
    });
  }

  // 默认服务器错误
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  });
};

// 使用示例
router.post("/users", async (req, res, next) => {
  try {
    // 验证输入
    const validationErrors = validateUserInput(req.body);
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors);
    }

    // 检查重复
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // 创建用户
    const user = await User.create(req.body);

    // 返回创建成功响应
    res.status(201).json({
      data: user,
      meta: {
        message: "User created successfully",
      },
    });
  } catch (error) {
    next(error);
  }
});
```

### API 版本控制策略

```javascript
// 版本控制实现
class APIVersionManager {
  constructor() {
    this.versions = new Map();
    this.deprecatedVersions = new Set();
  }

  // 注册版本处理器
  registerVersion(version, handler) {
    this.versions.set(version, handler);
  }

  // 标记版本为废弃
  deprecateVersion(version, sunsetDate) {
    this.deprecatedVersions.add(version);
    console.warn(
      `API version ${version} is deprecated. Sunset date: ${sunsetDate}`
    );
  }

  // 版本解析中间件
  versionMiddleware() {
    return (req, res, next) => {
      // 方法1: URL 路径版本控制
      const pathVersion = req.path.match(/^\/api\/v(\d+)\//)?.[1];

      // 方法2: Accept Header 版本控制
      const acceptHeader = req.headers.accept;
      const headerVersion = acceptHeader?.match(
        /application\/vnd\.myapi\.v(\d+)\+json/
      )?.[1];

      // 方法3: 自定义 Header 版本控制
      const customHeaderVersion = req.headers["api-version"];

      // 版本优先级: 自定义 Header > Accept Header > URL 路径
      const requestedVersion =
        customHeaderVersion || headerVersion || pathVersion || "1";

      // 检查版本是否存在
      if (!this.versions.has(requestedVersion)) {
        return res.status(400).json({
          error: {
            code: "UNSUPPORTED_VERSION",
            message: `API version ${requestedVersion} is not supported`,
            supportedVersions: Array.from(this.versions.keys()),
          },
        });
      }

      // 检查版本是否已废弃
      if (this.deprecatedVersions.has(requestedVersion)) {
        res.setHeader("API-Deprecation", "true");
        res.setHeader("API-Sunset-Date", "2024-12-31");
        res.setHeader("Link", '</api/v2/>; rel="successor-version"');
      }

      req.apiVersion = requestedVersion;
      req.versionHandler = this.versions.get(requestedVersion);

      next();
    };
  }
}

// 版本特定的处理器
const v1Handler = {
  formatUser: (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.createdAt,
  }),

  formatError: (error) => ({
    error: error.message,
    code: error.code,
  }),
};

const v2Handler = {
  formatUser: (user) => ({
    id: user.id,
    email: user.email,
    profile: {
      displayName: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    },
    metadata: {
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isVerified: user.isVerified,
    },
  }),

  formatError: (error) => ({
    error: {
      type: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
      traceId: error.traceId,
    },
  }),
};

// 使用版本管理器
const versionManager = new APIVersionManager();
versionManager.registerVersion("1", v1Handler);
versionManager.registerVersion("2", v2Handler);
versionManager.deprecateVersion("1", "2024-12-31");

app.use(versionManager.versionMiddleware());

// 版本感知的路由处理
router.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError("User");
    }

    // 使用版本特定的格式化器
    const formattedUser = req.versionHandler.formatUser(user);

    res.json({
      data: formattedUser,
      meta: {
        version: req.apiVersion,
      },
    });
  } catch (error) {
    next(error);
  }
});
```

## 🚀 GraphQL 深度实战

### Schema 设计与最佳实践

```javascript
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLUnionType,
  GraphQLInterfaceType,
} = require("graphql");

// 枚举类型定义
const UserRoleEnum = new GraphQLEnumType({
  name: "UserRole",
  values: {
    USER: { value: "user" },
    ADMIN: { value: "admin" },
    MODERATOR: { value: "moderator" },
  },
});

// 接口定义
const NodeInterface = new GraphQLInterfaceType({
  name: "Node",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolveType: (obj) => {
    if (obj.email) return UserType;
    if (obj.title) return PostType;
    return null;
  },
});

// 用户类型
const UserType = new GraphQLObjectType({
  name: "User",
  interfaces: [NodeInterface],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: UserRoleEnum },
    isActive: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },

    // 关联字段
    posts: {
      type: new GraphQLList(PostType),
      args: {
        first: { type: GraphQLInt, defaultValue: 10 },
        after: { type: GraphQLString },
        orderBy: { type: PostOrderByEnum },
      },
      resolve: async (user, args, context) => {
        return context.dataSources.postAPI.getPostsByUser(user.id, args);
      },
    },

    // 计算字段
    postCount: {
      type: GraphQLInt,
      resolve: async (user, args, context) => {
        return context.dataSources.postAPI.getPostCountByUser(user.id);
      },
    },

    // 权限相关字段
    canEdit: {
      type: GraphQLBoolean,
      resolve: (user, args, context) => {
        const currentUser = context.user;
        return (
          currentUser &&
          (currentUser.id === user.id || currentUser.role === "admin")
        );
      },
    },
  }),
});

// 文章类型
const PostType = new GraphQLObjectType({
  name: "Post",
  interfaces: [NodeInterface],
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: GraphQLString },
    excerpt: {
      type: GraphQLString,
      args: {
        length: { type: GraphQLInt, defaultValue: 200 },
      },
      resolve: (post, args) => {
        return post.content?.substring(0, args.length) + "...";
      },
    },
    published: { type: GraphQLBoolean },
    tags: { type: new GraphQLList(GraphQLString) },
    viewCount: { type: GraphQLInt },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },

    // 关联查询
    author: {
      type: UserType,
      resolve: async (post, args, context) => {
        return context.dataSources.userAPI.getUserById(post.authorId);
      },
    },

    comments: {
      type: new GraphQLList(CommentType),
      args: {
        first: { type: GraphQLInt, defaultValue: 20 },
        orderBy: { type: CommentOrderByEnum },
      },
      resolve: async (post, args, context) => {
        return context.dataSources.commentAPI.getCommentsByPost(post.id, args);
      },
    },
  }),
});

// 分页连接类型
const PostConnectionType = new GraphQLObjectType({
  name: "PostConnection",
  fields: {
    edges: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "PostEdge",
          fields: {
            node: { type: PostType },
            cursor: { type: GraphQLString },
          },
        })
      ),
    },
    pageInfo: {
      type: new GraphQLObjectType({
        name: "PageInfo",
        fields: {
          hasNextPage: { type: GraphQLBoolean },
          hasPreviousPage: { type: GraphQLBoolean },
          startCursor: { type: GraphQLString },
          endCursor: { type: GraphQLString },
        },
      }),
    },
    totalCount: { type: GraphQLInt },
  },
});

// 输入类型
const CreateUserInputType = new GraphQLInputObjectType({
  name: "CreateUserInput",
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: UserRoleEnum, defaultValue: "user" },
  },
});

const UpdateUserInputType = new GraphQLInputObjectType({
  name: "UpdateUserInput",
  fields: {
    name: { type: GraphQLString },
    role: { type: UserRoleEnum },
  },
});

// 查询根类型
const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    // 单个资源查询
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args, context) => {
        return context.dataSources.userAPI.getUserById(args.id);
      },
    },

    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: async (parent, args, context) => {
        return context.dataSources.postAPI.getPostById(args.id);
      },
    },

    // 列表查询 (Relay 规范)
    posts: {
      type: PostConnectionType,
      args: {
        first: { type: GraphQLInt },
        after: { type: GraphQLString },
        last: { type: GraphQLInt },
        before: { type: GraphQLString },
        filter: { type: PostFilterInputType },
        orderBy: { type: PostOrderByEnum },
      },
      resolve: async (parent, args, context) => {
        return context.dataSources.postAPI.getPostsConnection(args);
      },
    },

    // 搜索查询
    search: {
      type: new GraphQLList(SearchResultType),
      args: {
        query: { type: new GraphQLNonNull(GraphQLString) },
        type: { type: SearchTypeEnum },
        first: { type: GraphQLInt, defaultValue: 10 },
      },
      resolve: async (parent, args, context) => {
        return context.dataSources.searchAPI.search(args);
      },
    },

    // 当前用户
    me: {
      type: UserType,
      resolve: async (parent, args, context) => {
        if (!context.user) {
          throw new Error("Not authenticated");
        }
        return context.dataSources.userAPI.getUserById(context.user.id);
      },
    },
  },
});

// 变更根类型
const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser: {
      type: UserType,
      args: {
        input: { type: new GraphQLNonNull(CreateUserInputType) },
      },
      resolve: async (parent, args, context) => {
        // 权限检查
        if (!context.user || context.user.role !== "admin") {
          throw new Error("Insufficient permissions");
        }

        return context.dataSources.userAPI.createUser(args.input);
      },
    },

    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(UpdateUserInputType) },
      },
      resolve: async (parent, args, context) => {
        const user = await context.dataSources.userAPI.getUserById(args.id);

        // 权限检查：只能编辑自己或管理员可以编辑任何人
        if (
          !context.user ||
          (context.user.id !== user.id && context.user.role !== "admin")
        ) {
          throw new Error("Insufficient permissions");
        }

        return context.dataSources.userAPI.updateUser(args.id, args.input);
      },
    },

    createPost: {
      type: PostType,
      args: {
        input: { type: new GraphQLNonNull(CreatePostInputType) },
      },
      resolve: async (parent, args, context) => {
        if (!context.user) {
          throw new Error("Not authenticated");
        }

        return context.dataSources.postAPI.createPost({
          ...args.input,
          authorId: context.user.id,
        });
      },
    },
  },
});

// 订阅根类型 (实时功能)
const SubscriptionType = new GraphQLObjectType({
  name: "Subscription",
  fields: {
    postAdded: {
      type: PostType,
      args: {
        authorId: { type: GraphQLID },
      },
      subscribe: (parent, args, context) => {
        return context.pubsub.asyncIterator(["POST_ADDED"]);
      },
    },

    commentAdded: {
      type: CommentType,
      args: {
        postId: { type: new GraphQLNonNull(GraphQLID) },
      },
      subscribe: (parent, args, context) => {
        return context.pubsub.asyncIterator([`COMMENT_ADDED_${args.postId}`]);
      },
    },
  },
});

// Schema 组装
const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  subscription: SubscriptionType,
});
```

### DataLoader 与 N+1 问题解决

```javascript
const DataLoader = require("dataloader");

// DataSource 抽象类
class BaseDataSource {
  constructor(db) {
    this.db = db;
    this.initializeLoaders();
  }

  initializeLoaders() {
    // 用户 ID 批量加载器
    this.userLoader = new DataLoader(
      async (userIds) => {
        const users = await this.db.query(
          "SELECT * FROM users WHERE id = ANY($1)",
          [userIds]
        );

        // 保持顺序
        const userMap = new Map(users.rows.map((user) => [user.id, user]));
        return userIds.map((id) => userMap.get(id) || null);
      },
      {
        maxBatchSize: 100,
        cache: true,
        cacheKeyFn: (key) => key.toString(),
      }
    );

    // 文章作者批量加载器
    this.postAuthorLoader = new DataLoader(async (postIds) => {
      const posts = await this.db.query(
        `
          SELECT p.id as post_id, u.*
          FROM posts p
          JOIN users u ON p.author_id = u.id
          WHERE p.id = ANY($1)
        `,
        [postIds]
      );

      const authorMap = new Map(
        posts.rows.map((row) => [
          row.post_id,
          {
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
          },
        ])
      );

      return postIds.map((id) => authorMap.get(id) || null);
    });

    // 用户文章计数加载器
    this.userPostCountLoader = new DataLoader(async (userIds) => {
      const counts = await this.db.query(
        `
          SELECT author_id, COUNT(*) as count
          FROM posts
          WHERE author_id = ANY($1)
          GROUP BY author_id
        `,
        [userIds]
      );

      const countMap = new Map(
        counts.rows.map((row) => [row.author_id, parseInt(row.count)])
      );

      return userIds.map((id) => countMap.get(id) || 0);
    });
  }

  // 清除所有缓存
  clearCache() {
    this.userLoader.clearAll();
    this.postAuthorLoader.clearAll();
    this.userPostCountLoader.clearAll();
  }

  // 清除特定缓存
  clearUserCache(userId) {
    this.userLoader.clear(userId);
  }
}

// 用户数据源
class UserAPI extends BaseDataSource {
  async getUserById(id) {
    return this.userLoader.load(id);
  }

  async getUsersByIds(ids) {
    return this.userLoader.loadMany(ids);
  }

  async createUser(userData) {
    const result = await this.db.query(
      "INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [userData.email, userData.name, userData.password, userData.role]
    );

    const user = result.rows[0];

    // 预填充缓存
    this.userLoader.prime(user.id, user);

    return user;
  }

  async updateUser(id, userData) {
    const result = await this.db.query(
      "UPDATE users SET name = $2, role = $3, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id, userData.name, userData.role]
    );

    const user = result.rows[0];

    // 更新缓存
    this.userLoader.clear(id);
    this.userLoader.prime(id, user);

    return user;
  }

  async getPostCountByUser(userId) {
    return this.userPostCountLoader.load(userId);
  }
}

// 文章数据源
class PostAPI extends BaseDataSource {
  async getPostById(id) {
    const result = await this.db.query("SELECT * FROM posts WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  async getPostsByUser(userId, args = {}) {
    const { first = 10, after, orderBy = "CREATED_AT_DESC" } = args;

    let query = "SELECT * FROM posts WHERE author_id = $1";
    const params = [userId];

    // 处理游标分页
    if (after) {
      query += " AND created_at < $2";
      params.push(new Date(Buffer.from(after, "base64").toString()));
    }

    // 处理排序
    const orderMap = {
      CREATED_AT_ASC: "created_at ASC",
      CREATED_AT_DESC: "created_at DESC",
      TITLE_ASC: "title ASC",
      TITLE_DESC: "title DESC",
    };

    query += ` ORDER BY ${orderMap[orderBy] || "created_at DESC"}`;
    query += ` LIMIT $${params.length + 1}`;
    params.push(first);

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async getPostsConnection(args) {
    const { first, after, filter, orderBy } = args;

    // 构建基础查询
    let query = "SELECT * FROM posts WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    // 应用过滤器
    if (filter) {
      if (filter.published !== undefined) {
        query += ` AND published = $${paramIndex}`;
        params.push(filter.published);
        paramIndex++;
      }

      if (filter.tags && filter.tags.length > 0) {
        query += ` AND tags && $${paramIndex}`;
        params.push(filter.tags);
        paramIndex++;
      }

      if (filter.authorId) {
        query += ` AND author_id = $${paramIndex}`;
        params.push(filter.authorId);
        paramIndex++;
      }
    }

    // 游标分页
    if (after) {
      const cursor = JSON.parse(Buffer.from(after, "base64").toString());
      query += ` AND created_at < $${paramIndex}`;
      params.push(cursor.createdAt);
      paramIndex++;
    }

    // 排序
    query += " ORDER BY created_at DESC";

    // 限制数量 (多取一个用于判断是否有下一页)
    query += ` LIMIT $${paramIndex}`;
    params.push(first + 1);

    const result = await this.db.query(query, params);
    const posts = result.rows;

    const hasNextPage = posts.length > first;
    if (hasNextPage) {
      posts.pop(); // 移除多取的那一个
    }

    // 构建边和游标
    const edges = posts.map((post) => ({
      node: post,
      cursor: Buffer.from(
        JSON.stringify({
          createdAt: post.created_at,
          id: post.id,
        })
      ).toString("base64"),
    }));

    // 获取总数
    const countQuery = query
      .replace(/SELECT \*/, "SELECT COUNT(*)")
      .replace(/ LIMIT \$\d+$/, "");
    const totalResult = await this.db.query(countQuery, params.slice(0, -1));
    const totalCount = parseInt(totalResult.rows[0].count);

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!after,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount,
    };
  }

  async createPost(postData) {
    const result = await this.db.query(
      "INSERT INTO posts (title, content, author_id, published, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        postData.title,
        postData.content,
        postData.authorId,
        postData.published,
        postData.tags,
      ]
    );

    const post = result.rows[0];

    // 清除用户文章计数缓存
    this.userPostCountLoader.clear(post.author_id);

    return post;
  }
}

// 服务器设置
const { ApolloServer } = require("apollo-server-express");
const { PubSub } = require("graphql-subscriptions");

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: ({ req, connection }) => {
    // WebSocket 连接 (订阅)
    if (connection) {
      return {
        ...connection.context,
        pubsub,
      };
    }

    // HTTP 请求
    return {
      user: req.user, // 来自认证中间件
      dataSources: {
        userAPI: new UserAPI(db),
        postAPI: new PostAPI(db),
      },
      pubsub,
    };
  },

  // 查询复杂度分析
  validationRules: [
    require("graphql-query-complexity").createComplexityLimitRule(1000, {
      maximumComplexity: 1000,
      variables: {},
      onComplete: (complexity) => {
        console.log("Query complexity:", complexity);
      },
    }),
  ],

  // 查询深度限制
  validationRules: [require("graphql-depth-limit")(10)],

  // 开发工具
  introspection: process.env.NODE_ENV !== "production",
  playground: process.env.NODE_ENV !== "production",

  // 性能监控
  formatResponse: (response, { request, context }) => {
    console.log(`Query executed in ${Date.now() - request.startTime}ms`);
    return response;
  },
});
```

---

🎯 **优秀的 API 设计是用户体验的基础。RESTful API 以其简洁和缓存友好的特性适合大多数场景，而 GraphQL 则在复杂查询和精确数据获取方面表现卓越。选择合适的 API 设计模式，配合完善的错误处理、版本控制和性能优化，能够构建出既强大又易用的接口服务！**
