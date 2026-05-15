# Node.js 核心基础深度解析

Node.js 作为基于 Chrome V8 引擎的 JavaScript 运行时，彻底改变了服务器端开发生态。本文将深入探讨 Node.js 的核心原理、事件循环机制、模块系统和性能优化策略。

## 🏗️ Node.js 架构原理

### V8 引擎与运行时环境

```javascript
// V8 引擎的 JavaScript 执行过程
// 1. 解析 (Parsing) - 生成 AST
// 2. 编译 (Compilation) - 生成字节码
// 3. 优化 (Optimization) - TurboFan 优化编译器

// 内存管理示例
function memoryExample() {
  // 新生代内存 (New Space) - 短生命周期对象
  const tempData = new Array(1000).fill(0);

  // 老生代内存 (Old Space) - 长生命周期对象
  global.persistentData = {
    cache: new Map(),
    config: {
      /* 配置信息 */
    },
  };

  // 垃圾回收触发条件
  if (process.memoryUsage().heapUsed > 50 * 1024 * 1024) {
    global.gc && global.gc(); // 手动触发 GC (需要 --expose-gc 标志)
  }
}

// 内存使用监控
function monitorMemory() {
  const usage = process.memoryUsage();
  console.log({
    rss: Math.round(usage.rss / 1024 / 1024) + "MB", // 常驻内存
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + "MB", // 堆总内存
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + "MB", // 已使用堆内存
    external: Math.round(usage.external / 1024 / 1024) + "MB", // 外部内存
  });
}

// V8 编译优化示例
function optimizedFunction(x, y) {
  // V8 会根据参数类型进行优化
  return x + y; // 如果总是传入数字，会被优化为快速数字相加
}

// 反优化触发 (Deoptimization)
function deoptimizationExample(obj) {
  return obj.property; // 如果 obj 的形状(shape)频繁变化，会导致反优化
}

// 正确的对象形状使用
class Point {
  constructor(x, y) {
    this.x = x; // 固定属性顺序
    this.y = y; // 有助于 V8 优化
  }
}
```

### 事件循环深度解析

```javascript
// 事件循环六个阶段详解
/*
┌───────────────────────────┐
┌─>│           timers          │  ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← internal use
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  ← fetch new I/O events
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  ← setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  ← socket.on('close', ...)
   └───────────────────────────┘
*/

// 事件循环优先级演示
console.log("=== Start ===");

// 1. 同步代码最高优先级
console.log("1. Synchronous");

// 2. process.nextTick 最高异步优先级
process.nextTick(() => {
  console.log("2. process.nextTick");
});

// 3. Promise 微任务队列
Promise.resolve().then(() => {
  console.log("3. Promise.resolve");
});

// 4. setImmediate (check 阶段)
setImmediate(() => {
  console.log("4. setImmediate");
});

// 5. setTimeout (timers 阶段)
setTimeout(() => {
  console.log("5. setTimeout");
}, 0);

// 6. I/O 操作 (poll 阶段)
require("fs").readFile(__filename, () => {
  console.log("6. fs.readFile");

  // 在 I/O 回调中，setImmediate 优先于 setTimeout
  setImmediate(() => console.log("6.1. setImmediate in I/O"));
  setTimeout(() => console.log("6.2. setTimeout in I/O"), 0);
});

console.log("=== End ===");

// 输出顺序：
// === Start ===
// 1. Synchronous
// === End ===
// 2. process.nextTick
// 3. Promise.resolve
// 5. setTimeout
// 4. setImmediate
// 6. fs.readFile
// 6.1. setImmediate in I/O
// 6.2. setTimeout in I/O
```

### 高级异步编程模式

```javascript
// 回调地狱到现代异步编程的演进

// 1. 回调地狱 (Callback Hell)
function callbackHell() {
  getData((err, data) => {
    if (err) throw err;
    processData(data, (err, processed) => {
      if (err) throw err;
      saveData(processed, (err, result) => {
        if (err) throw err;
        console.log("Data saved:", result);
      });
    });
  });
}

// 2. Promise 链式调用
function promiseChain() {
  return getData()
    .then((data) => processData(data))
    .then((processed) => saveData(processed))
    .then((result) => console.log("Data saved:", result))
    .catch((err) => console.error("Error:", err));
}

// 3. async/await 现代写法
async function modernAsync() {
  try {
    const data = await getData();
    const processed = await processData(data);
    const result = await saveData(processed);
    console.log("Data saved:", result);
  } catch (err) {
    console.error("Error:", err);
  }
}

// 4. 并发控制与错误处理
class AsyncController {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(asyncFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn: asyncFn,
        resolve,
        reject,
      });
      this.tryNext();
    });
  }

  async tryNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.tryNext();
    }
  }
}

// 使用并发控制器
const controller = new AsyncController(3);

async function batchProcess(items) {
  const results = await Promise.all(
    items.map((item) => controller.add(() => processItem(item)))
  );
  return results;
}

// 5. 高级 Promise 模式
class PromiseUtils {
  // 带超时的 Promise
  static timeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Operation timeout")), ms)
      ),
    ]);
  }

  // 重试机制
  static async retry(asyncFn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await asyncFn();
      } catch (error) {
        if (i === maxRetries) throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i))
        );
      }
    }
  }

  // 批量处理
  static async batch(items, batchSize, processor) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((item) => processor(item))
      );
      results.push(...batchResults);
    }
    return results;
  }
}

// 使用示例
async function apiCall() {
  return PromiseUtils.timeout(
    PromiseUtils.retry(
      () => fetch("/api/data").then((res) => res.json()),
      3,
      1000
    ),
    5000
  );
}
```

## 📦 模块系统深度分析

### CommonJS vs ES Modules

```javascript
// CommonJS (Node.js 传统模块系统)
// math.js
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

// 导出方式 1: module.exports
module.exports = {
  add,
  multiply,
};

// 导出方式 2: exports 快捷方式
exports.subtract = (a, b) => a - b;

// 导入
const math = require("./math");
const { add, multiply } = require("./math");

// ES Modules (现代模块系统)
// math.mjs 或 package.json 中 "type": "module"

// 命名导出
export function add(a, b) {
  return a + b;
}

export const PI = 3.14159;

// 默认导出
export default class Calculator {
  add(a, b) {
    return a + b;
  }
  subtract(a, b) {
    return a - b;
  }
}

// 导入
import Calculator, { add, PI } from "./math.mjs";
import * as math from "./math.mjs";

// 动态导入
async function loadModule() {
  const { add } = await import("./math.mjs");
  return add(1, 2);
}

// 模块互操作性
// ESM 中使用 CommonJS
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const commonjsModule = require("./commonjs-module");

// CommonJS 中使用 ESM (需要动态导入)
async function useESM() {
  const esmModule = await import("./esm-module.mjs");
  return esmModule.default;
}
```

### 模块解析与缓存机制

```javascript
// 模块解析算法
/*
1. 核心模块: require('fs') -> Node.js 内置模块
2. 相对路径: require('./module') -> 当前目录
3. 绝对路径: require('/path/to/module') -> 绝对路径
4. node_modules: require('lodash') -> 查找 node_modules
*/

// 模块缓存查看
console.log("模块缓存:", require.cache);

// 清除模块缓存
function clearModuleCache(modulePath) {
  const fullPath = require.resolve(modulePath);
  delete require.cache[fullPath];
}

// 热重载实现
class ModuleHotReloader {
  constructor() {
    this.watchers = new Map();
  }

  watch(modulePath, callback) {
    const fs = require("fs");
    const path = require("path");

    const fullPath = require.resolve(modulePath);

    // 清除缓存并重新加载
    const reload = () => {
      try {
        delete require.cache[fullPath];
        const newModule = require(modulePath);
        callback(null, newModule);
      } catch (error) {
        callback(error, null);
      }
    };

    // 监听文件变化
    const watcher = fs.watchFile(fullPath, reload);
    this.watchers.set(modulePath, watcher);

    return () => {
      fs.unwatchFile(fullPath);
      this.watchers.delete(modulePath);
    };
  }
}

// 使用热重载
const hotReloader = new ModuleHotReloader();

hotReloader.watch("./config.js", (error, newConfig) => {
  if (error) {
    console.error("重载失败:", error);
  } else {
    console.log("配置已更新:", newConfig);
  }
});

// 模块循环依赖处理
// a.js
console.log("a starting");
exports.done = false;
const b = require("./b");
console.log("in a, b.done =", b.done);
exports.done = true;
console.log("a done");

// b.js
console.log("b starting");
exports.done = false;
const a = require("./a"); // 此时 a.done = false
console.log("in b, a.done =", a.done);
exports.done = true;
console.log("b done");

// main.js
console.log("main starting");
const a = require("./a");
const b = require("./b");
console.log("in main, a.done =", a.done, ", b.done =", b.done);
```

## 🔄 Stream API 深度应用

### 四种流类型详解

```javascript
const { Readable, Writable, Transform, Duplex } = require("stream");
const fs = require("fs");
const crypto = require("crypto");

// 1. Readable Stream - 可读流
class NumberStream extends Readable {
  constructor(options) {
    super(options);
    this.current = 0;
    this.max = 100;
  }

  _read() {
    if (this.current < this.max) {
      this.push(`${this.current++}\n`);
    } else {
      this.push(null); // 结束流
    }
  }
}

// 2. Writable Stream - 可写流
class ConsoleWriteStream extends Writable {
  constructor(options) {
    super(options);
  }

  _write(chunk, encoding, callback) {
    console.log(`写入: ${chunk.toString().trim()}`);
    callback();
  }

  _final(callback) {
    console.log("写入完成");
    callback();
  }
}

// 3. Transform Stream - 转换流
class UpperCaseTransform extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

// 4. Duplex Stream - 双工流
class EchoStream extends Duplex {
  constructor(options) {
    super(options);
    this.buffer = [];
  }

  _read() {
    if (this.buffer.length > 0) {
      this.push(this.buffer.shift());
    }
  }

  _write(chunk, encoding, callback) {
    this.buffer.push(chunk);
    callback();
  }
}

// 流的组合使用
function streamExample() {
  const numberStream = new NumberStream();
  const upperCaseTransform = new UpperCaseTransform();
  const consoleWrite = new ConsoleWriteStream();

  // 管道连接
  numberStream.pipe(upperCaseTransform).pipe(consoleWrite);

  // 错误处理
  numberStream.on("error", (err) => console.error("读取错误:", err));
  upperCaseTransform.on("error", (err) => console.error("转换错误:", err));
  consoleWrite.on("error", (err) => console.error("写入错误:", err));
}

// 高性能文件处理
async function processLargeFile(inputFile, outputFile) {
  const readStream = fs.createReadStream(inputFile, {
    highWaterMark: 64 * 1024, // 64KB 缓冲区
  });

  const writeStream = fs.createWriteStream(outputFile);

  // 创建压缩转换流
  const gzipTransform = require("zlib").createGzip();

  // 创建加密转换流
  const cipher = crypto.createCipher("aes192", "secret-key");

  // 链式处理
  readStream
    .pipe(gzipTransform) // 压缩
    .pipe(cipher) // 加密
    .pipe(writeStream); // 写入

  return new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
    readStream.on("error", reject);
  });
}

// 流式数据处理管道
class StreamPipeline {
  constructor() {
    this.transforms = [];
  }

  addTransform(transformFn) {
    const transform = new Transform({
      transform(chunk, encoding, callback) {
        try {
          const result = transformFn(chunk, encoding);
          callback(null, result);
        } catch (error) {
          callback(error);
        }
      },
    });

    this.transforms.push(transform);
    return this;
  }

  process(readableStream) {
    return this.transforms.reduce(
      (stream, transform) => stream.pipe(transform),
      readableStream
    );
  }
}

// 使用流式管道
const pipeline = new StreamPipeline()
  .addTransform((chunk) => chunk.toString().toUpperCase())
  .addTransform((chunk) => `处理: ${chunk}`)
  .addTransform((chunk) => Buffer.from(chunk));

const inputStream = fs.createReadStream("input.txt");
const outputStream = fs.createWriteStream("output.txt");

pipeline.process(inputStream).pipe(outputStream);
```

## 📁 文件系统操作

### 异步文件操作最佳实践

```javascript
const fs = require("fs").promises;
const path = require("path");
const { createReadStream, createWriteStream } = require("fs");

// 现代异步文件操作
class FileManager {
  // 安全的文件读取
  static async readFileSafe(filePath, options = {}) {
    const { encoding = "utf8", maxSize = 10 * 1024 * 1024 } = options;

    try {
      // 检查文件是否存在
      await fs.access(filePath, fs.constants.R_OK);

      // 检查文件大小
      const stats = await fs.stat(filePath);
      if (stats.size > maxSize) {
        throw new Error(`文件过大: ${stats.size} bytes`);
      }

      return await fs.readFile(filePath, encoding);
    } catch (error) {
      throw new Error(`读取文件失败: ${error.message}`);
    }
  }

  // 原子性文件写入
  static async writeFileAtomic(filePath, data, options = {}) {
    const tempPath = `${filePath}.tmp.${Date.now()}`;

    try {
      await fs.writeFile(tempPath, data, options);
      await fs.rename(tempPath, filePath);
    } catch (error) {
      // 清理临时文件
      try {
        await fs.unlink(tempPath);
      } catch {}
      throw error;
    }
  }

  // 递归目录操作
  static async createDirRecursive(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
  }

  // 目录遍历
  static async *walkDirectory(dirPath, options = {}) {
    const { includeFiles = true, includeDirs = false, filter } = options;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (includeDirs && (!filter || filter(fullPath, entry))) {
            yield { path: fullPath, type: "directory", stats: entry };
          }

          // 递归遍历子目录
          yield* this.walkDirectory(fullPath, options);
        } else if (entry.isFile()) {
          if (includeFiles && (!filter || filter(fullPath, entry))) {
            yield { path: fullPath, type: "file", stats: entry };
          }
        }
      }
    } catch (error) {
      console.error(`遍历目录失败 ${dirPath}:`, error.message);
    }
  }

  // 文件复制 (大文件友好)
  static async copyFile(source, destination) {
    const sourceStats = await fs.stat(source);

    // 小文件直接复制
    if (sourceStats.size < 1024 * 1024) {
      await fs.copyFile(source, destination);
      return;
    }

    // 大文件流式复制
    return new Promise((resolve, reject) => {
      const readStream = createReadStream(source);
      const writeStream = createWriteStream(destination);

      readStream.pipe(writeStream);

      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
      readStream.on("error", reject);
    });
  }

  // 文件监听
  static watchFile(filePath, callback) {
    const fs = require("fs");

    let fsWait = false;
    const watcher = fs.watch(filePath, (event, filename) => {
      if (filename && !fsWait) {
        fsWait = setTimeout(() => {
          fsWait = false;
        }, 100);
        callback(event, filename);
      }
    });

    return () => watcher.close();
  }
}

// 文件操作示例
async function fileOperationExample() {
  try {
    // 读取配置文件
    const config = JSON.parse(
      await FileManager.readFileSafe("./config.json", { maxSize: 1024 * 1024 })
    );

    // 创建日志目录
    await FileManager.createDirRecursive("./logs");

    // 遍历项目文件
    for await (const item of FileManager.walkDirectory("./src", {
      includeFiles: true,
      filter: (path) => path.endsWith(".js") || path.endsWith(".ts"),
    })) {
      console.log("发现源文件:", item.path);
    }

    // 备份重要文件
    await FileManager.copyFile("./package.json", "./backup/package.json");

    // 监听配置文件变化
    const stopWatching = FileManager.watchFile("./config.json", (event) => {
      console.log("配置文件发生变化:", event);
    });

    // 30秒后停止监听
    setTimeout(stopWatching, 30000);
  } catch (error) {
    console.error("文件操作失败:", error);
  }
}
```

## ⚡ 性能优化策略

### 内存管理与监控

```javascript
// 内存泄漏检测
class MemoryLeakDetector {
  constructor() {
    this.snapshots = [];
    this.isMonitoring = false;
  }

  startMonitoring(interval = 10000) {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitorInterval = setInterval(() => {
      this.takeSnapshot();
    }, interval);
  }

  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.isMonitoring = false;
    }
  }

  takeSnapshot() {
    const usage = process.memoryUsage();
    const timestamp = Date.now();

    this.snapshots.push({
      timestamp,
      ...usage,
      heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
    });

    // 只保留最近50个快照
    if (this.snapshots.length > 50) {
      this.snapshots = this.snapshots.slice(-50);
    }

    this.analyzeMemoryTrend();
  }

  analyzeMemoryTrend() {
    if (this.snapshots.length < 5) return;

    const recent = this.snapshots.slice(-5);
    const growth = recent.map((s) => s.heapUsedMB);

    // 简单的内存增长检测
    const avgGrowth =
      growth.reduce((sum, val, idx) => {
        if (idx === 0) return sum;
        return sum + (val - growth[idx - 1]);
      }, 0) /
      (growth.length - 1);

    if (avgGrowth > 10) {
      // 平均每次增长超过10MB
      console.warn("⚠️  检测到可能的内存泄漏，平均增长:", avgGrowth, "MB");
    }
  }

  getReport() {
    return {
      totalSnapshots: this.snapshots.length,
      current: this.snapshots[this.snapshots.length - 1],
      peak: this.snapshots.reduce((max, s) =>
        s.heapUsedMB > max.heapUsedMB ? s : max
      ),
    };
  }
}

// CPU 密集任务优化
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 创建工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
    // 重启工作进程
    cluster.fork();
  });

  // 负载均衡任务分发
  const tasks = [];
  const workerQueue = Object.values(cluster.workers);

  function distributeTask(task) {
    const worker = workerQueue.shift();
    workerQueue.push(worker);

    worker.send({
      type: "task",
      data: task,
      id: Math.random().toString(36),
    });
  }
} else {
  // 工作进程处理
  process.on("message", async (message) => {
    if (message.type === "task") {
      try {
        const result = await heavyComputation(message.data);
        process.send({
          type: "result",
          id: message.id,
          data: result,
        });
      } catch (error) {
        process.send({
          type: "error",
          id: message.id,
          error: error.message,
        });
      }
    }
  });
}

// Worker Threads 示例
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");

if (isMainThread) {
  // 主线程
  class ThreadPool {
    constructor(size = 4) {
      this.workers = [];
      this.queue = [];
      this.size = size;

      this.initWorkers();
    }

    initWorkers() {
      for (let i = 0; i < this.size; i++) {
        const worker = new Worker(__filename, {
          workerData: { isWorker: true },
        });

        worker.busy = false;
        this.workers.push(worker);
      }
    }

    async execute(taskData) {
      return new Promise((resolve, reject) => {
        const task = {
          data: taskData,
          resolve,
          reject,
        };

        const availableWorker = this.workers.find((w) => !w.busy);

        if (availableWorker) {
          this.runTask(availableWorker, task);
        } else {
          this.queue.push(task);
        }
      });
    }

    runTask(worker, task) {
      worker.busy = true;

      worker.postMessage(task.data);

      const onMessage = (result) => {
        worker.busy = false;
        worker.off("message", onMessage);
        worker.off("error", onError);

        task.resolve(result);

        // 处理队列中的下一个任务
        if (this.queue.length > 0) {
          const nextTask = this.queue.shift();
          this.runTask(worker, nextTask);
        }
      };

      const onError = (error) => {
        worker.busy = false;
        worker.off("message", onMessage);
        worker.off("error", onError);

        task.reject(error);
      };

      worker.on("message", onMessage);
      worker.on("error", onError);
    }

    destroy() {
      this.workers.forEach((worker) => worker.terminate());
    }
  }

  // 使用线程池
  const pool = new ThreadPool(4);

  async function performCPUIntensiveTask(data) {
    try {
      const result = await pool.execute(data);
      return result;
    } catch (error) {
      console.error("任务执行失败:", error);
      throw error;
    }
  }
} else {
  // 工作线程
  parentPort.on("message", (data) => {
    // 执行 CPU 密集任务
    const result = heavyComputation(data);
    parentPort.postMessage(result);
  });
}

// CPU 密集计算示例
function heavyComputation(data) {
  const start = Date.now();

  // 模拟复杂计算
  let result = 0;
  for (let i = 0; i < data.iterations || 1000000; i++) {
    result += Math.sqrt(i) * Math.sin(i);
  }

  return {
    result,
    executionTime: Date.now() - start,
    pid: process.pid,
  };
}

// 性能监控
const detector = new MemoryLeakDetector();
detector.startMonitoring(5000);

// 示例：启动性能监控
setInterval(() => {
  const report = detector.getReport();
  console.log("内存使用报告:", report.current);
}, 30000);
```

---

🚀 **Node.js 的核心在于理解其异步非阻塞的设计哲学。掌握事件循环、模块系统和流处理，是构建高性能后端应用的基础。合理的性能监控和优化策略，能够确保应用在生产环境中的稳定运行！**
