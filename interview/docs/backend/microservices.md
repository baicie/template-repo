# 微服务架构实战指南

微服务架构通过将大型应用拆分为小型、独立部署的服务来提高系统的可维护性和扩展性。本文将深入探讨微服务设计原则、服务通信、数据管理和部署策略。

## 🏗️ 微服务设计原则

### 服务拆分策略

```javascript
// 按业务域拆分服务
const serviceMap = {
  userService: {
    port: 3001,
    domain: "User Management",
    responsibilities: ["用户注册登录", "用户信息管理", "用户权限控制"],
    database: "users_db",
    apis: ["/users", "/auth", "/profiles"],
  },

  orderService: {
    port: 3002,
    domain: "Order Management",
    responsibilities: ["订单创建", "订单状态管理", "订单查询"],
    database: "orders_db",
    apis: ["/orders", "/cart"],
  },

  paymentService: {
    port: 3003,
    domain: "Payment Processing",
    responsibilities: ["支付处理", "退款管理", "账单生成"],
    database: "payments_db",
    apis: ["/payments", "/billing"],
  },

  notificationService: {
    port: 3004,
    domain: "Communication",
    responsibilities: ["邮件发送", "短信通知", "推送消息"],
    database: "notifications_db",
    apis: ["/notifications", "/templates"],
  },
};

// 服务注册与发现
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthChecks = new Map();
  }

  // 注册服务
  register(serviceName, serviceInfo) {
    const service = {
      ...serviceInfo,
      id: `${serviceName}-${Date.now()}`,
      registeredAt: new Date(),
      lastHeartbeat: new Date(),
      status: "healthy",
    };

    this.services.set(serviceName, service);
    this.startHealthCheck(serviceName);

    console.log(
      `Service ${serviceName} registered at ${service.host}:${service.port}`
    );
    return service.id;
  }

  // 注销服务
  unregister(serviceName) {
    this.services.delete(serviceName);
    this.stopHealthCheck(serviceName);
    console.log(`Service ${serviceName} unregistered`);
  }

  // 发现服务
  discover(serviceName) {
    const service = this.services.get(serviceName);
    if (!service || service.status !== "healthy") {
      throw new Error(`Service ${serviceName} not available`);
    }
    return service;
  }

  // 获取所有健康服务实例
  getHealthyInstances(serviceName) {
    const services = Array.from(this.services.values());
    return services.filter(
      (s) => s.name === serviceName && s.status === "healthy"
    );
  }

  // 健康检查
  startHealthCheck(serviceName) {
    const checkInterval = setInterval(async () => {
      const service = this.services.get(serviceName);
      if (!service) {
        clearInterval(checkInterval);
        return;
      }

      try {
        const response = await fetch(
          `http://${service.host}:${service.port}/health`,
          {
            timeout: 5000,
          }
        );

        if (response.ok) {
          service.status = "healthy";
          service.lastHeartbeat = new Date();
        } else {
          service.status = "unhealthy";
        }
      } catch (error) {
        service.status = "unhealthy";
        console.error(`Health check failed for ${serviceName}:`, error.message);
      }
    }, 30000); // 每30秒检查一次

    this.healthChecks.set(serviceName, checkInterval);
  }

  stopHealthCheck(serviceName) {
    const checkInterval = this.healthChecks.get(serviceName);
    if (checkInterval) {
      clearInterval(checkInterval);
      this.healthChecks.delete(serviceName);
    }
  }
}

// 负载均衡器
class LoadBalancer {
  constructor(strategy = "round-robin") {
    this.strategy = strategy;
    this.counters = new Map();
  }

  // 选择服务实例
  selectInstance(instances) {
    if (instances.length === 0) {
      throw new Error("No healthy instances available");
    }

    switch (this.strategy) {
      case "round-robin":
        return this.roundRobin(instances);
      case "random":
        return this.random(instances);
      case "least-connections":
        return this.leastConnections(instances);
      default:
        return instances[0];
    }
  }

  roundRobin(instances) {
    const key = instances.map((i) => i.id).join(",");
    const counter = this.counters.get(key) || 0;
    const selectedIndex = counter % instances.length;
    this.counters.set(key, counter + 1);
    return instances[selectedIndex];
  }

  random(instances) {
    const randomIndex = Math.floor(Math.random() * instances.length);
    return instances[randomIndex];
  }

  leastConnections(instances) {
    return instances.reduce((least, current) =>
      (current.connections || 0) < (least.connections || 0) ? current : least
    );
  }
}
```

### API 网关实现

```javascript
const express = require("express");
const httpProxy = require("http-proxy-middleware");

class APIGateway {
  constructor() {
    this.app = express();
    this.serviceRegistry = new ServiceRegistry();
    this.loadBalancer = new LoadBalancer("round-robin");
    this.rateLimiters = new Map();

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // 请求日志
    this.app.use((req, res, next) => {
      req.startTime = Date.now();
      req.requestId = Math.random().toString(36).substring(2, 15);

      console.log(`[${req.requestId}] ${req.method} ${req.url}`);
      next();
    });

    // CORS
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

      if (req.method === "OPTIONS") {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // 限流
    this.app.use(this.rateLimitMiddleware());

    // 认证
    this.app.use(this.authMiddleware());
  }

  setupRoutes() {
    // 健康检查
    this.app.get("/health", (req, res) => {
      res.json({ status: "healthy", timestamp: new Date() });
    });

    // 服务代理路由
    this.app.use("/api/users/*", this.createServiceProxy("userService"));
    this.app.use("/api/orders/*", this.createServiceProxy("orderService"));
    this.app.use("/api/payments/*", this.createServiceProxy("paymentService"));
    this.app.use(
      "/api/notifications/*",
      this.createServiceProxy("notificationService")
    );

    // 聚合 API
    this.app.get("/api/dashboard", this.dashboardAggregator());

    // 404 处理
    this.app.use("*", (req, res) => {
      res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "API endpoint not found",
          path: req.originalUrl,
        },
      });
    });

    // 错误处理
    this.app.use(this.errorHandler());
  }

  createServiceProxy(serviceName) {
    return httpProxy({
      target: "http://placeholder", // 动态设置
      changeOrigin: true,
      pathRewrite: {
        [`^/api/${serviceName.replace("Service", "")}`]: "",
      },

      // 动态路由
      router: async (req) => {
        try {
          const instances =
            this.serviceRegistry.getHealthyInstances(serviceName);
          const selectedInstance = this.loadBalancer.selectInstance(instances);

          req.selectedService = selectedInstance;
          return `http://${selectedInstance.host}:${selectedInstance.port}`;
        } catch (error) {
          throw new Error(`Service ${serviceName} unavailable`);
        }
      },

      // 请求拦截
      onProxyReq: (proxyReq, req, res) => {
        // 添加请求头
        proxyReq.setHeader("X-Request-ID", req.requestId);
        proxyReq.setHeader("X-Forwarded-For", req.ip);
        proxyReq.setHeader("X-Gateway-Time", Date.now());

        if (req.user) {
          proxyReq.setHeader("X-User-ID", req.user.id);
          proxyReq.setHeader("X-User-Role", req.user.role);
        }
      },

      // 响应拦截
      onProxyRes: (proxyRes, req, res) => {
        const responseTime = Date.now() - req.startTime;

        // 添加响应头
        proxyRes.headers["X-Response-Time"] = `${responseTime}ms`;
        proxyRes.headers["X-Service-Instance"] = req.selectedService?.id;

        console.log(
          `[${req.requestId}] Response: ${proxyRes.statusCode} - ${responseTime}ms`
        );
      },

      // 错误处理
      onError: (err, req, res) => {
        console.error(`[${req.requestId}] Proxy error:`, err.message);

        res.status(503).json({
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Service temporarily unavailable",
            requestId: req.requestId,
          },
        });
      },
    });
  }

  rateLimitMiddleware() {
    return async (req, res, next) => {
      const key = req.ip;
      const now = Date.now();
      const windowMs = 60000; // 1分钟窗口
      const maxRequests = 100;

      if (!this.rateLimiters.has(key)) {
        this.rateLimiters.set(key, { count: 0, resetTime: now + windowMs });
      }

      const limiter = this.rateLimiters.get(key);

      if (now > limiter.resetTime) {
        limiter.count = 0;
        limiter.resetTime = now + windowMs;
      }

      if (limiter.count >= maxRequests) {
        return res.status(429).json({
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests",
            retryAfter: Math.ceil((limiter.resetTime - now) / 1000),
          },
        });
      }

      limiter.count++;
      next();
    };
  }

  authMiddleware() {
    return async (req, res, next) => {
      // 公开路径
      const publicPaths = ["/health", "/api/auth/login", "/api/auth/register"];
      if (publicPaths.some((path) => req.path.startsWith(path))) {
        return next();
      }

      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "Access token required",
          },
        });
      }

      try {
        // 验证 JWT 令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
      } catch (error) {
        return res.status(403).json({
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid access token",
          },
        });
      }
    };
  }

  // 聚合 API 示例
  dashboardAggregator() {
    return async (req, res) => {
      try {
        const userId = req.user.id;

        // 并行调用多个服务
        const [userInfo, recentOrders, notifications] = await Promise.all([
          this.callService("userService", `/users/${userId}`),
          this.callService("orderService", `/orders?userId=${userId}&limit=5`),
          this.callService(
            "notificationService",
            `/notifications?userId=${userId}&unread=true`
          ),
        ]);

        res.json({
          user: userInfo,
          recentOrders: recentOrders,
          unreadNotifications: notifications.length,
          timestamp: new Date(),
        });
      } catch (error) {
        res.status(500).json({
          error: {
            code: "AGGREGATION_FAILED",
            message: "Failed to aggregate dashboard data",
          },
        });
      }
    };
  }

  async callService(serviceName, path, options = {}) {
    const instances = this.serviceRegistry.getHealthyInstances(serviceName);
    const instance = this.loadBalancer.selectInstance(instances);

    const url = `http://${instance.host}:${instance.port}${path}`;

    const response = await fetch(url, {
      ...options,
      timeout: 5000,
    });

    if (!response.ok) {
      throw new Error(`Service call failed: ${response.statusText}`);
    }

    return response.json();
  }

  errorHandler() {
    return (error, req, res, next) => {
      console.error(`[${req.requestId}] Gateway error:`, error);

      res.status(500).json({
        error: {
          code: "GATEWAY_ERROR",
          message: "Internal gateway error",
          requestId: req.requestId,
        },
      });
    };
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`API Gateway started on port ${port}`);
    });
  }
}

// 启动网关
const gateway = new APIGateway();
gateway.start(3000);
```

## 📡 服务间通信

### 消息队列实现

```javascript
const amqp = require("amqplib");

class MessageQueue {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.queues = new Map();
    this.exchanges = new Map();
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // 处理连接错误
      this.connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
      });

      this.connection.on("close", () => {
        console.log("RabbitMQ connection closed");
        setTimeout(() => this.connect(), 5000); // 重连
      });

      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  // 声明交换器
  async declareExchange(name, type = "topic", options = {}) {
    await this.channel.assertExchange(name, type, {
      durable: true,
      ...options,
    });

    this.exchanges.set(name, { name, type, options });
  }

  // 声明队列
  async declareQueue(name, options = {}) {
    const queue = await this.channel.assertQueue(name, {
      durable: true,
      ...options,
    });

    this.queues.set(name, queue);
    return queue;
  }

  // 绑定队列到交换器
  async bindQueue(queueName, exchangeName, routingKey) {
    await this.channel.bindQueue(queueName, exchangeName, routingKey);
  }

  // 发布消息
  async publish(exchangeName, routingKey, message, options = {}) {
    const messageBuffer = Buffer.from(
      JSON.stringify({
        ...message,
        timestamp: new Date(),
        messageId: Math.random().toString(36).substring(2, 15),
      })
    );

    return this.channel.publish(exchangeName, routingKey, messageBuffer, {
      persistent: true,
      ...options,
    });
  }

  // 发送消息到队列
  async sendToQueue(queueName, message, options = {}) {
    const messageBuffer = Buffer.from(
      JSON.stringify({
        ...message,
        timestamp: new Date(),
        messageId: Math.random().toString(36).substring(2, 15),
      })
    );

    return this.channel.sendToQueue(queueName, messageBuffer, {
      persistent: true,
      ...options,
    });
  }

  // 消费消息
  async consume(queueName, handler, options = {}) {
    await this.channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content, msg);

          // 手动确认消息
          this.channel.ack(msg);
        } catch (error) {
          console.error("Message processing error:", error);

          // 拒绝消息并重新排队
          this.channel.nack(msg, false, true);
        }
      },
      {
        noAck: false,
        ...options,
      }
    );
  }

  // 延迟消息
  async publishDelayed(exchangeName, routingKey, message, delayMs) {
    const delayExchange = `${exchangeName}.delay`;
    const delayQueue = `${exchangeName}.delay.${delayMs}`;

    // 声明延迟交换器和队列
    await this.declareExchange(delayExchange, "direct");
    await this.declareQueue(delayQueue, {
      arguments: {
        "x-message-ttl": delayMs,
        "x-dead-letter-exchange": exchangeName,
        "x-dead-letter-routing-key": routingKey,
      },
    });

    return this.publish(delayExchange, delayQueue, message);
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

// 事件驱动架构
class EventBus {
  constructor() {
    this.messageQueue = new MessageQueue();
    this.eventHandlers = new Map();
  }

  async initialize() {
    await this.messageQueue.connect();

    // 声明事件交换器
    await this.messageQueue.declareExchange("events", "topic");

    // 为每个服务创建队列
    const serviceName = process.env.SERVICE_NAME;
    const eventQueue = `${serviceName}.events`;

    await this.messageQueue.declareQueue(eventQueue);
    await this.messageQueue.bindQueue(eventQueue, "events", `${serviceName}.*`);

    // 开始消费事件
    await this.messageQueue.consume(eventQueue, this.handleEvent.bind(this));
  }

  // 发布事件
  async publishEvent(eventType, data, options = {}) {
    const event = {
      type: eventType,
      data,
      source: process.env.SERVICE_NAME,
      version: "1.0",
      ...options,
    };

    const routingKey = `${process.env.SERVICE_NAME}.${eventType}`;

    await this.messageQueue.publish("events", routingKey, event);
    console.log(`Event published: ${eventType}`);
  }

  // 订阅事件
  subscribe(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }

    this.eventHandlers.get(eventType).push(handler);
  }

  // 处理事件
  async handleEvent(event, msg) {
    const handlers = this.eventHandlers.get(event.type) || [];

    for (const handler of handlers) {
      try {
        await handler(event.data, event);
      } catch (error) {
        console.error(`Event handler error for ${event.type}:`, error);
      }
    }
  }
}

// 使用示例
const eventBus = new EventBus();

// 用户服务事件
eventBus.subscribe("user.created", async (userData) => {
  console.log("User created:", userData);

  // 发送欢迎邮件
  await eventBus.publishEvent("email.send", {
    to: userData.email,
    template: "welcome",
    data: userData,
  });
});

// 订单服务事件
eventBus.subscribe("order.created", async (orderData) => {
  console.log("Order created:", orderData);

  // 发送订单确认
  await eventBus.publishEvent("notification.send", {
    userId: orderData.userId,
    type: "order_confirmation",
    data: orderData,
  });

  // 更新库存
  await eventBus.publishEvent("inventory.update", {
    items: orderData.items,
    operation: "decrease",
  });
});

// 支付服务事件
eventBus.subscribe("payment.completed", async (paymentData) => {
  console.log("Payment completed:", paymentData);

  // 更新订单状态
  await eventBus.publishEvent("order.update", {
    orderId: paymentData.orderId,
    status: "paid",
  });
});
```

## 🔄 分布式事务处理

### Saga 模式实现

```javascript
// Saga 编排器
class SagaOrchestrator {
  constructor() {
    this.sagas = new Map();
    this.compensations = new Map();
  }

  // 定义 Saga
  defineSaga(sagaName, steps) {
    this.sagas.set(sagaName, steps);
  }

  // 执行 Saga
  async executeSaga(sagaName, initialData) {
    const steps = this.sagas.get(sagaName);
    if (!steps) {
      throw new Error(`Saga ${sagaName} not found`);
    }

    const sagaId = Math.random().toString(36).substring(2, 15);
    const executionLog = [];

    try {
      let currentData = initialData;

      // 顺序执行每个步骤
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        console.log(`Executing step ${i + 1}/${steps.length}: ${step.name}`);

        const result = await this.executeStep(step, currentData);

        executionLog.push({
          step: step.name,
          status: "completed",
          data: result,
        });

        currentData = { ...currentData, ...result };
      }

      console.log(`Saga ${sagaName} completed successfully`);
      return currentData;
    } catch (error) {
      console.error(`Saga ${sagaName} failed at step:`, error.message);

      // 执行补偿操作
      await this.compensate(executionLog, error);

      throw error;
    }
  }

  // 执行步骤
  async executeStep(step, data) {
    try {
      const result = await step.action(data);
      return result;
    } catch (error) {
      error.stepName = step.name;
      throw error;
    }
  }

  // 执行补偿
  async compensate(executionLog, originalError) {
    console.log("Starting compensation...");

    // 反向执行补偿操作
    for (let i = executionLog.length - 1; i >= 0; i--) {
      const logEntry = executionLog[i];

      if (logEntry.status === "completed") {
        try {
          const step = this.findStepByName(logEntry.step);
          if (step.compensation) {
            console.log(`Compensating step: ${step.name}`);
            await step.compensation(logEntry.data);
          }
        } catch (compensationError) {
          console.error(
            `Compensation failed for ${logEntry.step}:`,
            compensationError
          );
          // 记录补偿失败，但继续其他补偿
        }
      }
    }

    console.log("Compensation completed");
  }

  findStepByName(stepName) {
    for (const [sagaName, steps] of this.sagas) {
      const step = steps.find((s) => s.name === stepName);
      if (step) return step;
    }
    return null;
  }
}

// 订单处理 Saga 示例
const sagaOrchestrator = new SagaOrchestrator();

// 定义订单处理 Saga
sagaOrchestrator.defineSaga("order-processing", [
  {
    name: "validate-order",
    action: async (data) => {
      console.log("Validating order...");

      if (!data.items || data.items.length === 0) {
        throw new Error("Order must contain items");
      }

      return { orderId: Math.random().toString(36).substring(2, 15) };
    },
    compensation: async (data) => {
      console.log("No compensation needed for validation");
    },
  },

  {
    name: "reserve-inventory",
    action: async (data) => {
      console.log("Reserving inventory...");

      // 模拟库存检查和预留
      const reservations = data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        reservationId: Math.random().toString(36).substring(2, 15),
      }));

      // 模拟库存不足的情况
      if (Math.random() < 0.1) {
        throw new Error("Insufficient inventory");
      }

      return { reservations };
    },
    compensation: async (data) => {
      console.log("Releasing inventory reservations...");

      // 释放库存预留
      for (const reservation of data.reservations || []) {
        console.log(`Releasing reservation: ${reservation.reservationId}`);
      }
    },
  },

  {
    name: "process-payment",
    action: async (data) => {
      console.log("Processing payment...");

      // 模拟支付处理
      const totalAmount = data.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // 模拟支付失败
      if (Math.random() < 0.15) {
        throw new Error("Payment processing failed");
      }

      return {
        paymentId: Math.random().toString(36).substring(2, 15),
        amount: totalAmount,
        status: "completed",
      };
    },
    compensation: async (data) => {
      console.log("Refunding payment...");

      if (data.paymentId) {
        console.log(`Refunding payment: ${data.paymentId}`);
      }
    },
  },

  {
    name: "create-order",
    action: async (data) => {
      console.log("Creating order record...");

      const order = {
        id: data.orderId,
        items: data.items,
        paymentId: data.paymentId,
        reservations: data.reservations,
        status: "confirmed",
        createdAt: new Date(),
      };

      // 保存订单到数据库
      console.log("Order created:", order.id);

      return { order };
    },
    compensation: async (data) => {
      console.log("Canceling order...");

      if (data.order) {
        console.log(`Canceling order: ${data.order.id}`);
      }
    },
  },

  {
    name: "send-confirmation",
    action: async (data) => {
      console.log("Sending order confirmation...");

      // 发送确认邮件/短信
      console.log(`Confirmation sent for order: ${data.order.id}`);

      return { confirmationSent: true };
    },
    compensation: async (data) => {
      console.log("Sending cancellation notice...");

      if (data.order) {
        console.log(`Cancellation notice sent for order: ${data.order.id}`);
      }
    },
  },
]);

// 使用 Saga 处理订单
async function processOrder(orderData) {
  try {
    const result = await sagaOrchestrator.executeSaga(
      "order-processing",
      orderData
    );
    console.log("Order processed successfully:", result.order.id);
    return result;
  } catch (error) {
    console.error("Order processing failed:", error.message);
    throw error;
  }
}

// 测试订单处理
const testOrder = {
  userId: "user123",
  items: [
    { productId: "prod1", quantity: 2, price: 29.99 },
    { productId: "prod2", quantity: 1, price: 59.99 },
  ],
};

processOrder(testOrder);
```

---

🏗️ **微服务架构通过服务拆分提高了系统的可维护性和扩展性，但也带来了分布式系统的复杂性。合理的服务拆分、有效的服务通信、可靠的分布式事务处理和完善的监控体系，是构建成功微服务架构的关键要素！**
