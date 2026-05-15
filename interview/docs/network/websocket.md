# WebSocket 实时通信详解

WebSocket 是现代 Web 应用实现实时双向通信的标准协议，它在单个 TCP 连接上提供全双工通信。本文将深入解析 WebSocket 的工作原理、应用场景和最佳实践。

## 🏗️ WebSocket 协议基础

### 协议升级过程

```http
客户端请求 (HTTP):
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Sec-WebSocket-Protocol: chat, superchat

服务器响应:
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: chat
```

### 握手验证过程

```javascript
// Sec-WebSocket-Key 生成 (客户端)
const webSocketKey = btoa(crypto.randomBytes(16));

// Sec-WebSocket-Accept 计算 (服务器)
const WEBSOCKET_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const acceptKey = crypto
  .createHash("sha1")
  .update(webSocketKey + WEBSOCKET_GUID)
  .digest("base64");
```

### WebSocket 帧结构

```
WebSocket 数据帧格式:
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
```

### 操作码 (Opcode) 类型

| Opcode  | 类型     | 描述             |
| ------- | -------- | ---------------- |
| **0x0** | 继续帧   | 分片消息的后续帧 |
| **0x1** | 文本帧   | UTF-8 文本数据   |
| **0x2** | 二进制帧 | 二进制数据       |
| **0x8** | 关闭帧   | 连接关闭         |
| **0x9** | Ping 帧  | 心跳检测         |
| **0xA** | Pong 帧  | 心跳响应         |

## 🔧 WebSocket API 详解

### 基础 API 使用

```javascript
// 创建 WebSocket 连接
const socket = new WebSocket("wss://example.com/socket", [
  "protocol1",
  "protocol2",
]);

// 连接状态
console.log(socket.readyState);
// 0: CONNECTING - 正在连接
// 1: OPEN - 连接已建立
// 2: CLOSING - 连接正在关闭
// 3: CLOSED - 连接已关闭

// 事件监听
socket.onopen = (event) => {
  console.log("WebSocket 连接已建立");
  console.log("协议:", socket.protocol);
  console.log("扩展:", socket.extensions);
};

socket.onmessage = (event) => {
  if (typeof event.data === "string") {
    // 文本消息
    const message = JSON.parse(event.data);
    handleTextMessage(message);
  } else if (event.data instanceof ArrayBuffer) {
    // 二进制消息
    const buffer = event.data;
    handleBinaryMessage(buffer);
  } else if (event.data instanceof Blob) {
    // Blob 数据
    event.data.arrayBuffer().then(handleBinaryMessage);
  }
};

socket.onerror = (error) => {
  console.error("WebSocket 错误:", error);
};

socket.onclose = (event) => {
  console.log("WebSocket 连接已关闭");
  console.log("关闭代码:", event.code);
  console.log("关闭原因:", event.reason);
  console.log("是否干净关闭:", event.wasClean);
};
```

### 发送不同类型的数据

```javascript
// 发送文本数据
socket.send("Hello WebSocket!");
socket.send(
  JSON.stringify({
    type: "message",
    content: "Hello World",
    timestamp: Date.now(),
  })
);

// 发送二进制数据
const buffer = new ArrayBuffer(8);
const view = new DataView(buffer);
view.setFloat64(0, Math.PI);
socket.send(buffer);

// 发送 Blob 数据
const blob = new Blob(["Hello"], { type: "text/plain" });
socket.send(blob);

// 发送 TypedArray
const uint8Array = new Uint8Array([1, 2, 3, 4, 5]);
socket.send(uint8Array.buffer);
```

## 💡 实际应用场景

### 实时聊天应用

```javascript
class ChatApplication {
  constructor(serverUrl) {
    this.socket = new WebSocket(serverUrl);
    this.messageHistory = [];
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.onopen = () => {
      this.updateConnectionStatus("已连接");
      this.authenticate();
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.socket.onclose = (event) => {
      this.updateConnectionStatus("连接已断开");
      if (!event.wasClean) {
        this.reconnect();
      }
    };
  }

  authenticate() {
    this.socket.send(
      JSON.stringify({
        type: "auth",
        token: localStorage.getItem("authToken"),
      })
    );
  }

  sendMessage(content) {
    if (this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: "message",
        content: content,
        timestamp: Date.now(),
        id: this.generateMessageId(),
      };

      this.socket.send(JSON.stringify(message));
      this.addToHistory(message);
    }
  }

  handleMessage(message) {
    switch (message.type) {
      case "message":
        this.displayMessage(message);
        break;
      case "user_joined":
        this.showUserJoined(message.user);
        break;
      case "user_left":
        this.showUserLeft(message.user);
        break;
      case "typing":
        this.showTypingIndicator(message.user);
        break;
    }
  }

  sendTypingIndicator() {
    this.socket.send(
      JSON.stringify({
        type: "typing",
        timestamp: Date.now(),
      })
    );
  }
}
```

### 在线协作编辑器

```javascript
class CollaborativeEditor {
  constructor(documentId) {
    this.documentId = documentId;
    this.socket = new WebSocket(`wss://api.example.com/docs/${documentId}`);
    this.operationQueue = [];
    this.setupOperationalTransform();
  }

  setupOperationalTransform() {
    this.socket.onmessage = (event) => {
      const operation = JSON.parse(event.data);
      this.applyRemoteOperation(operation);
    };
  }

  // 本地编辑操作
  onTextInsert(position, text) {
    const operation = {
      type: "insert",
      position: position,
      text: text,
      author: this.userId,
      timestamp: Date.now(),
    };

    this.applyLocalOperation(operation);
    this.sendOperation(operation);
  }

  onTextDelete(position, length) {
    const operation = {
      type: "delete",
      position: position,
      length: length,
      author: this.userId,
      timestamp: Date.now(),
    };

    this.applyLocalOperation(operation);
    this.sendOperation(operation);
  }

  sendOperation(operation) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(operation));
    } else {
      this.operationQueue.push(operation);
    }
  }

  // 操作转换算法
  transformOperation(op1, op2) {
    if (op1.type === "insert" && op2.type === "insert") {
      if (op1.position <= op2.position) {
        op2.position += op1.text.length;
      } else {
        op1.position += op2.text.length;
      }
    }
    // ... 其他转换逻辑
  }

  applyRemoteOperation(operation) {
    // 转换远程操作
    const transformedOp = this.transformAgainstLocalOps(operation);

    // 应用到编辑器
    this.applyToEditor(transformedOp);

    // 显示协作者光标
    this.updateCollaboratorCursor(operation.author, operation.position);
  }
}
```

### 实时游戏同步

```javascript
class RealtimeGame {
  constructor(gameId) {
    this.gameId = gameId;
    this.socket = new WebSocket(`wss://game.example.com/${gameId}`);
    this.gameState = {};
    this.players = new Map();
    this.setupGameSync();
  }

  setupGameSync() {
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleGameUpdate(data);
    };

    // 每帧发送游戏状态
    setInterval(() => {
      this.sendGameState();
    }, 1000 / 60); // 60 FPS
  }

  sendGameState() {
    if (this.socket.readyState === WebSocket.OPEN) {
      const state = {
        type: "player_update",
        playerId: this.playerId,
        position: this.player.position,
        rotation: this.player.rotation,
        velocity: this.player.velocity,
        timestamp: performance.now(),
      };

      this.socket.send(JSON.stringify(state));
    }
  }

  handleGameUpdate(data) {
    switch (data.type) {
      case "player_update":
        this.updatePlayerPosition(data);
        break;
      case "game_event":
        this.handleGameEvent(data);
        break;
      case "player_joined":
        this.addPlayer(data.player);
        break;
      case "player_left":
        this.removePlayer(data.playerId);
        break;
    }
  }

  // 延迟补偿和预测
  updatePlayerPosition(data) {
    const player = this.players.get(data.playerId);
    if (!player) return;

    const latency = performance.now() - data.timestamp;

    // 客户端预测
    const predictedPosition = this.extrapolatePosition(
      data.position,
      data.velocity,
      latency
    );

    // 平滑插值
    this.smoothInterpolation(player, predictedPosition);
  }

  extrapolatePosition(position, velocity, deltaTime) {
    return {
      x: position.x + (velocity.x * deltaTime) / 1000,
      y: position.y + (velocity.y * deltaTime) / 1000,
    };
  }
}
```

### 实时数据监控

```javascript
class RealTimeMonitoring {
  constructor(endpoints) {
    this.endpoints = endpoints;
    this.metrics = new Map();
    this.charts = new Map();
    this.connectToAll();
  }

  connectToAll() {
    this.endpoints.forEach((endpoint) => {
      const socket = new WebSocket(`wss://monitoring.example.com/${endpoint}`);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.updateMetrics(endpoint, data);
      };

      socket.onopen = () => {
        // 订阅指标
        socket.send(
          JSON.stringify({
            type: "subscribe",
            metrics: ["cpu", "memory", "network", "disk"],
          })
        );
      };
    });
  }

  updateMetrics(endpoint, data) {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }

    const endpointMetrics = this.metrics.get(endpoint);
    endpointMetrics.push({
      ...data,
      timestamp: Date.now(),
    });

    // 保持最近 1000 个数据点
    if (endpointMetrics.length > 1000) {
      endpointMetrics.splice(0, endpointMetrics.length - 1000);
    }

    // 更新图表
    this.updateChart(endpoint, endpointMetrics);

    // 检查告警阈值
    this.checkAlerts(endpoint, data);
  }

  checkAlerts(endpoint, data) {
    const alerts = [];

    if (data.cpu > 90) {
      alerts.push({
        type: "cpu",
        level: "critical",
        message: `CPU 使用率过高: ${data.cpu}%`,
      });
    }

    if (data.memory > 85) {
      alerts.push({
        type: "memory",
        level: "warning",
        message: `内存使用率过高: ${data.memory}%`,
      });
    }

    alerts.forEach((alert) => this.showAlert(endpoint, alert));
  }
}
```

## 🔧 高级特性与优化

### 心跳机制实现

```javascript
class WebSocketWithHeartbeat {
  constructor(url, options = {}) {
    this.url = url;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.reconnectAttempts = 0;

    this.connect();
  }

  connect() {
    this.socket = new WebSocket(this.url);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.onopen = (event) => {
      console.log("WebSocket 连接建立");
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.onopen?.(event);
    };

    this.socket.onmessage = (event) => {
      // 重置心跳定时器
      this.resetHeartbeat();

      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        // 收到心跳响应
        this.lastPongTime = Date.now();
        return;
      }

      this.onmessage?.(event);
    };

    this.socket.onclose = (event) => {
      console.log("WebSocket 连接关闭");
      this.stopHeartbeat();

      if (
        !event.wasClean &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnect();
      }

      this.onclose?.(event);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket 错误:", error);
      this.onerror?.(error);
    };
  }

  startHeartbeat() {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping" }));

        // 检查是否收到 pong 响应
        setTimeout(() => {
          const now = Date.now();
          if (now - this.lastPongTime > this.heartbeatInterval * 2) {
            console.log("心跳超时，关闭连接");
            this.socket.close();
          }
        }, 5000);
      }
    }, this.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  resetHeartbeat() {
    this.lastPongTime = Date.now();
  }

  reconnect() {
    this.reconnectAttempts++;
    console.log(
      `尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)); // 指数退避
  }

  send(data) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(typeof data === "string" ? data : JSON.stringify(data));
    } else {
      throw new Error("WebSocket 连接未建立");
    }
  }

  close() {
    this.stopHeartbeat();
    this.socket.close();
  }
}
```

### 消息队列与重发机制

```javascript
class ReliableWebSocket {
  constructor(url) {
    this.url = url;
    this.messageQueue = [];
    this.pendingMessages = new Map();
    this.messageId = 0;
    this.connect();
  }

  connect() {
    this.socket = new WebSocketWithHeartbeat(this.url);

    this.socket.onopen = () => {
      // 连接建立后发送队列中的消息
      this.flushMessageQueue();
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "ack") {
        // 收到确认，从待发送队列中移除
        this.pendingMessages.delete(data.messageId);
        return;
      }

      // 发送确认消息
      if (data.messageId) {
        this.socket.send(
          JSON.stringify({
            type: "ack",
            messageId: data.messageId,
          })
        );
      }

      this.onmessage?.(event);
    };
  }

  send(data) {
    const message = {
      id: ++this.messageId,
      data: data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    if (this.socket.socket.readyState === WebSocket.OPEN) {
      this.sendMessage(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  sendMessage(message) {
    const payload = {
      messageId: message.id,
      data: message.data,
    };

    this.socket.send(JSON.stringify(payload));

    // 添加到待确认队列
    this.pendingMessages.set(message.id, message);

    // 设置重发定时器
    setTimeout(() => {
      if (this.pendingMessages.has(message.id)) {
        message.retryCount++;
        if (message.retryCount < 3) {
          this.sendMessage(message);
        } else {
          // 重发失败，从队列中移除
          this.pendingMessages.delete(message.id);
          this.onSendError?.(message);
        }
      }
    }, 3000);
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }
}
```

### 数据压缩

```javascript
// 使用 pako 库进行 gzip 压缩
import pako from "pako";

class CompressedWebSocket {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.setupCompression();
  }

  setupCompression() {
    this.socket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        // 解压缩二进制数据
        const compressed = new Uint8Array(event.data);
        const decompressed = pako.inflate(compressed, { to: "string" });
        const data = JSON.parse(decompressed);
        this.onmessage?.(data);
      } else {
        // 普通文本消息
        const data = JSON.parse(event.data);
        this.onmessage?.(data);
      }
    };
  }

  send(data) {
    const jsonString = JSON.stringify(data);

    // 大于 1KB 的数据进行压缩
    if (jsonString.length > 1024) {
      const compressed = pako.deflate(jsonString);
      this.socket.send(compressed.buffer);
    } else {
      this.socket.send(jsonString);
    }
  }
}
```

## 🔄 替代方案对比

### Server-Sent Events (SSE)

```javascript
// SSE 适用于单向推送
class ServerSentEventsClient {
  constructor(url) {
    this.eventSource = new EventSource(url);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.eventSource.onopen = () => {
      console.log("SSE 连接建立");
    };

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    // 自定义事件
    this.eventSource.addEventListener("notification", (event) => {
      const notification = JSON.parse(event.data);
      this.showNotification(notification);
    });

    this.eventSource.onerror = (error) => {
      console.error("SSE 错误:", error);
      // SSE 会自动重连
    };
  }
}

// 对比：WebSocket vs SSE
const comparison = {
  WebSocket: {
    advantages: ["双向通信", "二进制支持", "更少开销", "自定义协议"],
    disadvantages: ["复杂实现", "需要心跳机制", "防火墙问题"],
  },
  SSE: {
    advantages: ["自动重连", "简单实现", "HTTP 兼容性好", "事件类型支持"],
    disadvantages: ["仅单向通信", "连接数限制", "不支持二进制"],
  },
};
```

### Long Polling

```javascript
// 长轮询实现
class LongPollingClient {
  constructor(url) {
    this.url = url;
    this.isPolling = false;
    this.abortController = null;
  }

  startPolling() {
    this.isPolling = true;
    this.poll();
  }

  async poll() {
    while (this.isPolling) {
      try {
        this.abortController = new AbortController();

        const response = await fetch(this.url, {
          method: "GET",
          signal: this.abortController.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.onmessage?.(data);
        }

        // 立即发起下一次轮询
        if (this.isPolling) {
          this.poll();
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("轮询错误:", error);
          // 延迟后重试
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }
  }

  stopPolling() {
    this.isPolling = false;
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}
```

## 🛡️ 安全考虑

### 身份验证

```javascript
class SecureWebSocket {
  constructor(url, authToken) {
    this.url = url;
    this.authToken = authToken;
    this.connect();
  }

  connect() {
    // 通过 URL 参数传递令牌
    const wsUrl = `${this.url}?token=${this.authToken}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      // 或者通过第一条消息发送身份验证
      this.socket.send(
        JSON.stringify({
          type: "auth",
          token: this.authToken,
        })
      );
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "auth_result") {
        if (data.success) {
          this.isAuthenticated = true;
          this.onAuthenticated?.();
        } else {
          this.socket.close();
          this.onAuthError?.(data.error);
        }
        return;
      }

      if (!this.isAuthenticated) {
        console.warn("收到未认证的消息");
        return;
      }

      this.onmessage?.(event);
    };
  }
}
```

### 输入验证与过滤

```javascript
class ValidatedWebSocket {
  constructor(url, schema) {
    this.url = url;
    this.schema = schema;
    this.socket = new WebSocket(url);
    this.setupValidation();
  }

  setupValidation() {
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 验证数据格式
        if (!this.validateMessage(data)) {
          console.warn("收到无效消息格式:", data);
          return;
        }

        // 过滤危险内容
        const sanitizedData = this.sanitizeMessage(data);

        this.onmessage?.(sanitizedData);
      } catch (error) {
        console.error("消息处理错误:", error);
      }
    };
  }

  validateMessage(data) {
    // 检查必需字段
    if (!data.type || typeof data.type !== "string") {
      return false;
    }

    // 检查消息类型是否允许
    const allowedTypes = ["message", "notification", "update"];
    if (!allowedTypes.includes(data.type)) {
      return false;
    }

    // 检查数据大小
    if (JSON.stringify(data).length > 10000) {
      return false;
    }

    return true;
  }

  sanitizeMessage(data) {
    // XSS 防护
    if (data.content && typeof data.content === "string") {
      data.content = this.escapeHtml(data.content);
    }

    return data;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  send(data) {
    if (this.validateMessage(data)) {
      this.socket.send(JSON.stringify(data));
    } else {
      throw new Error("消息格式无效");
    }
  }
}
```

---

🏗️ **WebSocket 为现代 Web 应用提供了强大的实时通信能力，掌握其原理和最佳实践是构建高质量实时应用的关键！**
