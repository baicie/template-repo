# 浏览器垃圾回收机制深度解析

垃圾回收（Garbage Collection，GC）是现代浏览器内存管理的核心机制。本文深入解析 V8 引擎的垃圾回收原理、算法实现和优化策略。

## 🧠 内存管理基础

### JavaScript 内存模型

```javascript
// JavaScript 内存分配示例
function memoryAllocationExample() {
  // 1. 栈内存 - 基本类型和引用
  let number = 42; // 栈内存
  let string = "hello"; // 字符串常量池
  let boolean = true; // 栈内存

  // 2. 堆内存 - 对象和数组
  let object = {
    // 堆内存
    name: "example",
    value: 100,
  };

  let array = [1, 2, 3, 4]; // 堆内存

  // 3. 闭包内存
  function createClosure() {
    let closureVar = "captured";
    return function () {
      return closureVar; // 闭包变量保持在内存中
    };
  }

  let closure = createClosure();
}

// 内存使用情况检测
class MemoryMonitor {
  constructor() {
    this.measurements = [];
  }

  // 测量内存使用
  measure(label) {
    if (!performance.memory) {
      console.warn("performance.memory not available");
      return;
    }

    const memory = performance.memory;
    const measurement = {
      label,
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize, // 已使用的JS堆内存
      totalJSHeapSize: memory.totalJSHeapSize, // JS堆总大小
      jsHeapSizeLimit: memory.jsHeapSizeLimit, // JS堆大小限制
    };

    this.measurements.push(measurement);

    console.log(`Memory [${label}]:`, {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      usage: `${(
        (memory.usedJSHeapSize / memory.totalJSHeapSize) *
        100
      ).toFixed(2)}%`,
    });

    return measurement;
  }

  // 分析内存增长趋势
  analyzeTrend() {
    if (this.measurements.length < 2) return;

    const first = this.measurements[0];
    const last = this.measurements[this.measurements.length - 1];
    const growth = last.usedJSHeapSize - first.usedJSHeapSize;
    const timeSpan = last.timestamp - first.timestamp;

    console.log("Memory Growth Analysis:", {
      growth: `${(growth / 1024 / 1024).toFixed(2)} MB`,
      timeSpan: `${timeSpan}ms`,
      rate: `${(((growth / timeSpan) * 1000) / 1024 / 1024).toFixed(4)} MB/s`,
    });
  }
}

// 使用示例
const monitor = new MemoryMonitor();
monitor.measure("Initial");

// 创建大量对象
const objects = [];
for (let i = 0; i < 100000; i++) {
  objects.push({ id: i, data: new Array(100).fill(i) });
}
monitor.measure("After allocation");

// 清理引用
objects.length = 0;
monitor.measure("After cleanup");
```

## 🔄 V8 垃圾回收机制

### 分代垃圾回收

V8 采用分代垃圾回收策略，将堆内存分为新生代和老生代：

```javascript
// V8 内存分代示例
class V8MemoryExample {
  constructor() {
    this.youngGeneration = []; // 新生代对象
    this.oldGeneration = []; // 老生代对象
  }

  // 模拟新生代对象创建
  createYoungObjects() {
    // 新创建的对象首先分配在新生代
    for (let i = 0; i < 1000; i++) {
      const obj = {
        id: i,
        timestamp: Date.now(),
        data: new Array(10).fill(Math.random()),
      };

      this.youngGeneration.push(obj);
    }

    console.log(`Young generation size: ${this.youngGeneration.length}`);
  }

  // 模拟对象晋升到老生代
  promoteToOldGeneration() {
    // 经过多次 Minor GC 仍存活的对象会晋升到老生代
    const survivedObjects = this.youngGeneration.filter((obj, index) => {
      // 模拟存活检测：偶数索引的对象存活
      return index % 2 === 0;
    });

    // 晋升到老生代
    this.oldGeneration.push(...survivedObjects);

    // 清理新生代
    this.youngGeneration = this.youngGeneration.filter((obj, index) => {
      return index % 2 !== 0;
    });

    console.log(
      `Objects promoted to old generation: ${survivedObjects.length}`
    );
    console.log(`Old generation size: ${this.oldGeneration.length}`);
  }

  // 模拟 Major GC
  performMajorGC() {
    const beforeSize = this.oldGeneration.length;

    // 标记清除算法：移除不可达对象
    this.oldGeneration = this.oldGeneration.filter((obj) => {
      // 模拟可达性检测
      return obj.id % 3 !== 0; // 假设 id 能被3整除的对象不可达
    });

    const afterSize = this.oldGeneration.length;
    const collected = beforeSize - afterSize;

    console.log(`Major GC completed: ${collected} objects collected`);
    console.log(`Old generation size after GC: ${afterSize}`);
  }
}
```

### 新生代垃圾回收 - Scavenge 算法

```javascript
// Scavenge 算法模拟实现
class ScavengeGC {
  constructor() {
    this.fromSpace = []; // From 空间
    this.toSpace = []; // To 空间
    this.roots = []; // 根对象集合
  }

  // 分配新对象
  allocate(object) {
    object._gcMarked = false;
    this.fromSpace.push(object);
    return object;
  }

  // 添加根对象
  addRoot(object) {
    this.roots.push(object);
  }

  // 执行 Scavenge GC
  scavenge() {
    console.log("Starting Scavenge GC...");
    console.log(`From space size: ${this.fromSpace.length}`);

    // 1. 清空 To 空间
    this.toSpace = [];

    // 2. 从根对象开始遍历
    this.roots.forEach((root) => {
      this.copyObject(root);
    });

    // 3. 处理 To 空间中的对象引用
    let processedCount = 0;
    while (processedCount < this.toSpace.length) {
      const obj = this.toSpace[processedCount];
      this.processObjectReferences(obj);
      processedCount++;
    }

    // 4. 交换空间
    const oldFromSpace = this.fromSpace;
    this.fromSpace = this.toSpace;
    this.toSpace = [];

    const collected = oldFromSpace.length - this.fromSpace.length;
    console.log(`Scavenge GC completed: ${collected} objects collected`);
    console.log(`Surviving objects: ${this.fromSpace.length}`);

    return collected;
  }

  // 复制对象到 To 空间
  copyObject(obj) {
    if (!obj || obj._gcMarked) return obj;

    // 标记已处理
    obj._gcMarked = true;

    // 复制到 To 空间
    const copiedObj = { ...obj };
    copiedObj._gcMarked = true;
    this.toSpace.push(copiedObj);

    // 更新原对象的转发地址
    obj._forwardingAddress = copiedObj;

    return copiedObj;
  }

  // 处理对象引用
  processObjectReferences(obj) {
    for (const key in obj) {
      if (key.startsWith("_gc")) continue; // 跳过 GC 元数据

      const value = obj[key];
      if (typeof value === "object" && value !== null) {
        if (value._forwardingAddress) {
          // 更新引用到新地址
          obj[key] = value._forwardingAddress;
        } else {
          // 复制引用的对象
          obj[key] = this.copyObject(value);
        }
      }
    }
  }
}

// 使用示例
const scavengeGC = new ScavengeGC();

// 创建对象图
const objA = scavengeGC.allocate({ name: "A", value: 1 });
const objB = scavengeGC.allocate({ name: "B", value: 2, ref: objA });
const objC = scavengeGC.allocate({ name: "C", value: 3 });

// 设置根对象
scavengeGC.addRoot(objB);

// 创建一些垃圾对象
for (let i = 0; i < 10; i++) {
  scavengeGC.allocate({ name: `Garbage${i}`, value: i });
}

// 执行 GC
scavengeGC.scavenge();
```

### 老生代垃圾回收 - 标记清除算法

```javascript
// 标记清除算法实现
class MarkSweepGC {
  constructor() {
    this.heap = []; // 堆内存
    this.roots = []; // 根对象
    this.freeList = []; // 空闲列表
  }

  // 分配对象
  allocate(object) {
    object._gcMarked = false;
    object._gcIndex = this.heap.length;
    this.heap.push(object);
    return object;
  }

  // 添加根对象
  addRoot(object) {
    this.roots.push(object);
  }

  // 执行标记清除 GC
  markSweep() {
    console.log("Starting Mark-Sweep GC...");
    console.log(`Heap size: ${this.heap.length}`);

    // 1. 标记阶段
    this.mark();

    // 2. 清除阶段
    const collected = this.sweep();

    console.log(`Mark-Sweep GC completed: ${collected} objects collected`);
    console.log(`Heap size after GC: ${this.heap.length}`);

    return collected;
  }

  // 标记阶段
  mark() {
    console.log("Mark phase started...");

    // 清除所有标记
    this.heap.forEach((obj) => {
      if (obj) obj._gcMarked = false;
    });

    // 从根对象开始标记
    this.roots.forEach((root) => {
      this.markObject(root);
    });

    const markedCount = this.heap.filter((obj) => obj && obj._gcMarked).length;
    console.log(`Mark phase completed: ${markedCount} objects marked`);
  }

  // 递归标记对象
  markObject(obj) {
    if (!obj || obj._gcMarked) return;

    // 标记当前对象
    obj._gcMarked = true;

    // 递归标记引用的对象
    for (const key in obj) {
      if (key.startsWith("_gc")) continue;

      const value = obj[key];
      if (typeof value === "object" && value !== null) {
        this.markObject(value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            this.markObject(item);
          }
        });
      }
    }
  }

  // 清除阶段
  sweep() {
    console.log("Sweep phase started...");

    let collected = 0;
    const newHeap = [];

    // 遍历堆，清除未标记的对象
    this.heap.forEach((obj, index) => {
      if (!obj) return;

      if (obj._gcMarked) {
        // 存活对象：更新索引并保留
        obj._gcIndex = newHeap.length;
        newHeap.push(obj);
      } else {
        // 垃圾对象：清除
        this.freeList.push(index);
        collected++;
      }
    });

    this.heap = newHeap;
    console.log(`Sweep phase completed: ${collected} objects swept`);

    return collected;
  }

  // 获取内存使用统计
  getStats() {
    const totalObjects = this.heap.length;
    const markedObjects = this.heap.filter(
      (obj) => obj && obj._gcMarked
    ).length;
    const freeSlots = this.freeList.length;

    return {
      totalObjects,
      markedObjects,
      freeSlots,
      memoryUsage: `${totalObjects} objects in heap`,
    };
  }
}

// 使用示例
const markSweepGC = new MarkSweepGC();

// 创建对象图
const root = markSweepGC.allocate({ name: "root" });
const child1 = markSweepGC.allocate({ name: "child1", parent: root });
const child2 = markSweepGC.allocate({ name: "child2", parent: root });
const grandchild = markSweepGC.allocate({ name: "grandchild", parent: child1 });

// 建立引用关系
root.children = [child1, child2];
child1.child = grandchild;

// 设置根对象
markSweepGC.addRoot(root);

// 创建垃圾对象
for (let i = 0; i < 20; i++) {
  markSweepGC.allocate({ name: `garbage${i}`, value: i });
}

console.log("Before GC:", markSweepGC.getStats());

// 执行 GC
markSweepGC.markSweep();

console.log("After GC:", markSweepGC.getStats());
```

## 🚀 增量标记与并发标记

### 增量标记实现

```javascript
// 增量标记 GC
class IncrementalMarkingGC {
  constructor() {
    this.heap = [];
    this.roots = [];
    this.markingStack = [];
    this.markingState = "idle"; // idle, marking, sweeping
    this.markingProgress = 0;
    this.timeSliceMs = 5; // 每次标记的时间片
  }

  // 开始增量标记
  startIncrementalMarking() {
    if (this.markingState !== "idle") return;

    console.log("Starting incremental marking...");
    this.markingState = "marking";
    this.markingProgress = 0;

    // 初始化标记栈
    this.markingStack = [...this.roots];

    // 清除所有标记
    this.heap.forEach((obj) => {
      if (obj) obj._gcMarked = false;
    });

    // 开始增量标记循环
    this.scheduleMarkingStep();
  }

  // 调度标记步骤
  scheduleMarkingStep() {
    if (this.markingState !== "marking") return;

    // 使用 MessageChannel 实现微任务调度
    const channel = new MessageChannel();
    channel.port2.onmessage = () => {
      this.performMarkingStep();
    };
    channel.port1.postMessage(null);
  }

  // 执行标记步骤
  performMarkingStep() {
    const startTime = performance.now();
    let processedObjects = 0;

    // 在时间片内处理对象
    while (
      this.markingStack.length > 0 &&
      performance.now() - startTime < this.timeSliceMs
    ) {
      const obj = this.markingStack.pop();

      if (!obj || obj._gcMarked) continue;

      // 标记对象
      obj._gcMarked = true;
      processedObjects++;

      // 将引用的对象加入标记栈
      this.addReferencesToStack(obj);
    }

    this.markingProgress += processedObjects;

    console.log(`Marking step: ${processedObjects} objects processed`);
    console.log(`Total progress: ${this.markingProgress} objects`);

    // 检查是否完成标记
    if (this.markingStack.length === 0) {
      this.finishMarking();
    } else {
      // 继续下一个标记步骤
      this.scheduleMarkingStep();
    }
  }

  // 将对象引用添加到标记栈
  addReferencesToStack(obj) {
    for (const key in obj) {
      if (key.startsWith("_gc")) continue;

      const value = obj[key];
      if (typeof value === "object" && value !== null) {
        if (!value._gcMarked) {
          this.markingStack.push(value);
        }
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "object" && item !== null && !item._gcMarked) {
            this.markingStack.push(item);
          }
        });
      }
    }
  }

  // 完成标记阶段
  finishMarking() {
    console.log(
      `Incremental marking completed: ${this.markingProgress} objects marked`
    );
    this.markingState = "sweeping";
    this.performSweep();
  }

  // 执行清除
  performSweep() {
    console.log("Starting sweep phase...");

    let collected = 0;
    const newHeap = [];

    this.heap.forEach((obj) => {
      if (!obj) return;

      if (obj._gcMarked) {
        newHeap.push(obj);
      } else {
        collected++;
      }
    });

    this.heap = newHeap;
    this.markingState = "idle";

    console.log(`Sweep completed: ${collected} objects collected`);
    console.log(`Heap size: ${this.heap.length}`);
  }

  // 分配对象
  allocate(object) {
    object._gcMarked = false;
    this.heap.push(object);

    // 如果正在增量标记，需要特殊处理新分配的对象
    if (this.markingState === "marking") {
      // 新分配的对象标记为黑色（已处理）
      object._gcMarked = true;
      this.markingProgress++;
    }

    return object;
  }

  // 添加根对象
  addRoot(object) {
    this.roots.push(object);
  }
}

// 使用示例
const incrementalGC = new IncrementalMarkingGC();

// 创建大量对象
for (let i = 0; i < 1000; i++) {
  const obj = incrementalGC.allocate({
    id: i,
    data: new Array(100).fill(i),
  });

  if (i === 0) {
    incrementalGC.addRoot(obj);
  }

  if (i > 0) {
    // 创建引用链
    obj.prev = incrementalGC.heap[i - 1];
  }
}

// 开始增量标记
incrementalGC.startIncrementalMarking();
```

### 并发标记实现

```javascript
// 并发标记 GC (使用 Web Workers 模拟)
class ConcurrentMarkingGC {
  constructor() {
    this.heap = [];
    this.roots = [];
    this.markingWorker = null;
    this.markingState = "idle";
  }

  // 初始化标记工作线程
  initializeWorker() {
    const workerCode = `
      let heap = [];
      let markingStack = [];
      
      self.onmessage = function(e) {
        const { type, data } = e.data;
        
        switch (type) {
          case 'INIT_HEAP':
            heap = data.heap;
            markingStack = data.roots;
            self.postMessage({ type: 'HEAP_INITIALIZED' });
            break;
            
          case 'START_MARKING':
            performConcurrentMarking();
            break;
            
          case 'STOP_MARKING':
            markingStack = [];
            self.postMessage({ type: 'MARKING_STOPPED' });
            break;
        }
      };
      
      function performConcurrentMarking() {
        let processedCount = 0;
        const batchSize = 100;
        
        function processBatch() {
          let batchProcessed = 0;
          
          while (markingStack.length > 0 && batchProcessed < batchSize) {
            const obj = markingStack.pop();
            
            if (!obj || obj._gcMarked) continue;
            
            obj._gcMarked = true;
            processedCount++;
            batchProcessed++;
            
            // 添加引用对象到标记栈
            for (const key in obj) {
              if (key.startsWith('_gc')) continue;
              
              const value = obj[key];
              if (typeof value === 'object' && value !== null && !value._gcMarked) {
                markingStack.push(value);
              }
            }
          }
          
          // 报告进度
          self.postMessage({
            type: 'MARKING_PROGRESS',
            data: { processed: processedCount, remaining: markingStack.length }
          });
          
          if (markingStack.length > 0) {
            // 继续下一批次
            setTimeout(processBatch, 1);
          } else {
            // 标记完成
            self.postMessage({
              type: 'MARKING_COMPLETED',
              data: { totalProcessed: processedCount }
            });
          }
        }
        
        processBatch();
      }
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    this.markingWorker = new Worker(URL.createObjectURL(blob));

    this.markingWorker.onmessage = (e) => {
      this.handleWorkerMessage(e.data);
    };
  }

  // 处理工作线程消息
  handleWorkerMessage(message) {
    const { type, data } = message;

    switch (type) {
      case "HEAP_INITIALIZED":
        console.log("Heap initialized in worker");
        break;

      case "MARKING_PROGRESS":
        console.log(
          `Marking progress: ${data.processed} processed, ${data.remaining} remaining`
        );
        break;

      case "MARKING_COMPLETED":
        console.log(
          `Concurrent marking completed: ${data.totalProcessed} objects marked`
        );
        this.finalizeConcurrentMarking();
        break;

      case "MARKING_STOPPED":
        console.log("Concurrent marking stopped");
        this.markingState = "idle";
        break;
    }
  }

  // 开始并发标记
  startConcurrentMarking() {
    if (!this.markingWorker) {
      this.initializeWorker();
    }

    if (this.markingState !== "idle") return;

    console.log("Starting concurrent marking...");
    this.markingState = "marking";

    // 发送堆数据到工作线程
    this.markingWorker.postMessage({
      type: "INIT_HEAP",
      data: {
        heap: this.heap,
        roots: this.roots,
      },
    });

    // 开始标记
    setTimeout(() => {
      this.markingWorker.postMessage({ type: "START_MARKING" });
    }, 100);
  }

  // 完成并发标记
  finalizeConcurrentMarking() {
    this.markingState = "finalizing";

    // 在主线程中完成最终的清理工作
    setTimeout(() => {
      this.performFinalSweep();
    }, 10);
  }

  // 执行最终清除
  performFinalSweep() {
    console.log("Starting final sweep...");

    let collected = 0;
    const newHeap = [];

    this.heap.forEach((obj) => {
      if (!obj) return;

      if (obj._gcMarked) {
        newHeap.push(obj);
      } else {
        collected++;
      }
    });

    this.heap = newHeap;
    this.markingState = "idle";

    console.log(`Concurrent GC completed: ${collected} objects collected`);
    console.log(`Heap size: ${this.heap.length}`);
  }

  // 分配对象
  allocate(object) {
    object._gcMarked = false;
    this.heap.push(object);
    return object;
  }

  // 添加根对象
  addRoot(object) {
    this.roots.push(object);
  }

  // 清理资源
  cleanup() {
    if (this.markingWorker) {
      this.markingWorker.terminate();
      this.markingWorker = null;
    }
  }
}

// 使用示例
const concurrentGC = new ConcurrentMarkingGC();

// 创建复杂的对象图
const createObjectGraph = (depth, breadth) => {
  const root = concurrentGC.allocate({ id: "root", level: 0 });
  concurrentGC.addRoot(root);

  const queue = [{ obj: root, currentDepth: 0 }];

  while (queue.length > 0) {
    const { obj, currentDepth } = queue.shift();

    if (currentDepth < depth) {
      obj.children = [];

      for (let i = 0; i < breadth; i++) {
        const child = concurrentGC.allocate({
          id: `${obj.id}_${i}`,
          level: currentDepth + 1,
          parent: obj,
        });

        obj.children.push(child);
        queue.push({ obj: child, currentDepth: currentDepth + 1 });
      }
    }
  }

  return root;
};

// 创建对象图
createObjectGraph(5, 3);

// 添加一些垃圾对象
for (let i = 0; i < 500; i++) {
  concurrentGC.allocate({ id: `garbage_${i}`, data: new Array(100).fill(i) });
}

console.log(`Initial heap size: ${concurrentGC.heap.length}`);

// 开始并发标记
concurrentGC.startConcurrentMarking();

// 清理示例
setTimeout(() => {
  concurrentGC.cleanup();
}, 10000);
```

## 🎯 内存泄漏检测与预防

### 内存泄漏检测器

```javascript
// 内存泄漏检测器
class MemoryLeakDetector {
  constructor() {
    this.snapshots = [];
    this.listeners = [];
    this.timers = new Set();
    this.observers = new Set();
    this.isMonitoring = false;
    this.leakThreshold = 50 * 1024 * 1024; // 50MB
  }

  // 开始监控
  startMonitoring(interval = 5000) {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log("Memory leak detection started");

    // 定期采集内存快照
    const monitorTimer = setInterval(() => {
      this.takeSnapshot();
      this.analyzeLeaks();
    }, interval);

    this.timers.add(monitorTimer);

    // 监听页面卸载事件
    window.addEventListener("beforeunload", () => {
      this.generateReport();
    });
  }

  // 停止监控
  stopMonitoring() {
    this.isMonitoring = false;
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers.clear();
    console.log("Memory leak detection stopped");
  }

  // 采集内存快照
  takeSnapshot() {
    if (!performance.memory) return;

    const memory = performance.memory;
    const snapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      listeners: this.countEventListeners(),
      timers: this.timers.size,
      observers: this.observers.size,
    };

    this.snapshots.push(snapshot);

    // 只保留最近50个快照
    if (this.snapshots.length > 50) {
      this.snapshots = this.snapshots.slice(-50);
    }

    return snapshot;
  }

  // 统计事件监听器数量
  countEventListeners() {
    // 这是一个简化的实现，实际中需要更复杂的逻辑
    return this.listeners.length;
  }

  // 分析内存泄漏
  analyzeLeaks() {
    if (this.snapshots.length < 5) return;

    const recent = this.snapshots.slice(-5);
    const growth = this.calculateMemoryGrowth(recent);
    const trend = this.calculateGrowthTrend(recent);

    // 检测持续增长
    if (growth.avgGrowth > 5 * 1024 * 1024 && trend > 0.8) {
      this.reportPotentialLeak("持续内存增长", {
        avgGrowth: `${(growth.avgGrowth / 1024 / 1024).toFixed(2)} MB`,
        trend: trend.toFixed(2),
        duration: `${
          (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000
        }s`,
      });
    }

    // 检测内存使用超过阈值
    const current = recent[recent.length - 1];
    if (current.usedJSHeapSize > this.leakThreshold) {
      this.reportPotentialLeak("内存使用过高", {
        current: `${(current.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        threshold: `${(this.leakThreshold / 1024 / 1024).toFixed(2)} MB`,
      });
    }

    // 检测事件监听器泄漏
    if (current.listeners > 100) {
      this.reportPotentialLeak("事件监听器过多", {
        count: current.listeners,
      });
    }
  }

  // 计算内存增长
  calculateMemoryGrowth(snapshots) {
    let totalGrowth = 0;
    let validGrowthCount = 0;

    for (let i = 1; i < snapshots.length; i++) {
      const growth =
        snapshots[i].usedJSHeapSize - snapshots[i - 1].usedJSHeapSize;
      if (growth > 0) {
        totalGrowth += growth;
        validGrowthCount++;
      }
    }

    return {
      totalGrowth,
      avgGrowth: validGrowthCount > 0 ? totalGrowth / validGrowthCount : 0,
      validGrowthCount,
    };
  }

  // 计算增长趋势
  calculateGrowthTrend(snapshots) {
    const values = snapshots.map((s) => s.usedJSHeapSize);
    const n = values.length;

    // 简单线性回归计算趋势
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope > 0 ? Math.min(slope / (sumY / n), 1) : 0;
  }

  // 报告潜在泄漏
  reportPotentialLeak(type, details) {
    console.warn(`🚨 Potential Memory Leak Detected: ${type}`, details);

    // 触发自定义事件
    const event = new CustomEvent("memoryleak", {
      detail: { type, details, timestamp: Date.now() },
    });
    window.dispatchEvent(event);
  }

  // 生成内存使用报告
  generateReport() {
    if (this.snapshots.length === 0) return;

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const duration = (last.timestamp - first.timestamp) / 1000;
    const totalGrowth = last.usedJSHeapSize - first.usedJSHeapSize;

    const report = {
      duration: `${duration.toFixed(2)}s`,
      totalGrowth: `${(totalGrowth / 1024 / 1024).toFixed(2)} MB`,
      growthRate: `${(totalGrowth / duration / 1024 / 1024).toFixed(4)} MB/s`,
      peakUsage: `${
        Math.max(...this.snapshots.map((s) => s.usedJSHeapSize)) / 1024 / 1024
      } MB`,
      finalUsage: `${(last.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      snapshots: this.snapshots.length,
    };

    console.log("📊 Memory Usage Report:", report);
    return report;
  }

  // 注册事件监听器（用于跟踪）
  addEventListener(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this.listeners.push({ element, event, handler, options });
  }

  // 移除事件监听器
  removeEventListener(element, event, handler) {
    element.removeEventListener(event, handler);
    const index = this.listeners.findIndex(
      (l) => l.element === element && l.event === event && l.handler === handler
    );
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // 清理所有监听器
  cleanupListeners() {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
  }
}

// 使用示例
const leakDetector = new MemoryLeakDetector();

// 开始监控
leakDetector.startMonitoring(3000);

// 监听内存泄漏事件
window.addEventListener("memoryleak", (e) => {
  console.error("Memory leak detected:", e.detail);
  // 可以在这里触发报警或自动处理
});

// 模拟内存泄漏场景
function simulateMemoryLeak() {
  const leakyObjects = [];

  setInterval(() => {
    // 创建大对象但不释放引用
    const bigObject = {
      data: new Array(10000).fill(Math.random()),
      timestamp: Date.now(),
    };

    leakyObjects.push(bigObject);

    // 模拟 DOM 事件监听器泄漏
    const element = document.createElement("div");
    leakDetector.addEventListener(element, "click", () => {
      console.log("Leaked listener triggered");
    });
  }, 1000);
}

// 启动泄漏模拟（仅用于测试）
// simulateMemoryLeak();
```

### 常见内存泄漏模式与解决方案

```javascript
// 常见内存泄漏模式和解决方案
class MemoryLeakPatterns {
  // 1. 闭包引用泄漏
  static closureLeakExample() {
    console.log("=== 闭包引用泄漏示例 ===");

    // 问题代码
    function createLeakyFunction() {
      const largeData = new Array(1000000).fill("data");
      const smallData = largeData.slice(0, 10);

      return function () {
        // 只使用 smallData，但 largeData 也被保留
        return smallData.length;
      };
    }

    // 解决方案
    function createOptimizedFunction() {
      const largeData = new Array(1000000).fill("data");
      const smallData = largeData.slice(0, 10);

      // 显式清除不需要的引用
      largeData.length = 0;

      return function () {
        return smallData.length;
      };
    }

    const leaky = createLeakyFunction();
    const optimized = createOptimizedFunction();

    console.log("Leaky function result:", leaky());
    console.log("Optimized function result:", optimized());
  }

  // 2. DOM 引用泄漏
  static domReferenceLeakExample() {
    console.log("=== DOM 引用泄漏示例 ===");

    // 问题代码
    class LeakyComponent {
      constructor() {
        this.element = document.createElement("div");
        this.data = new Array(100000).fill("data");

        // DOM 元素保持对组件的引用
        this.element.componentRef = this;

        document.body.appendChild(this.element);
      }

      destroy() {
        // 只移除 DOM 元素，但没有清除引用
        document.body.removeChild(this.element);
      }
    }

    // 解决方案
    class OptimizedComponent {
      constructor() {
        this.element = document.createElement("div");
        this.data = new Array(100000).fill("data");

        document.body.appendChild(this.element);
      }

      destroy() {
        // 清除 DOM 引用
        if (this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }

        // 清除数据引用
        this.data = null;
        this.element = null;
      }
    }

    // 使用示例
    const leakyComponent = new LeakyComponent();
    const optimizedComponent = new OptimizedComponent();

    // 销毁组件
    setTimeout(() => {
      leakyComponent.destroy();
      optimizedComponent.destroy();
    }, 1000);
  }

  // 3. 定时器泄漏
  static timerLeakExample() {
    console.log("=== 定时器泄漏示例 ===");

    // 问题代码
    class LeakyTimer {
      constructor() {
        this.data = new Array(100000).fill("data");

        // 定时器保持对 this 的引用
        this.intervalId = setInterval(() => {
          console.log("Timer tick, data length:", this.data.length);
        }, 1000);
      }

      destroy() {
        // 忘记清除定时器
        this.data = null;
      }
    }

    // 解决方案
    class OptimizedTimer {
      constructor() {
        this.data = new Array(100000).fill("data");
        this.intervalId = setInterval(() => {
          console.log("Timer tick, data length:", this.data.length);
        }, 1000);
      }

      destroy() {
        // 清除定时器
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
        this.data = null;
      }
    }

    const leakyTimer = new LeakyTimer();
    const optimizedTimer = new OptimizedTimer();

    // 销毁定时器
    setTimeout(() => {
      leakyTimer.destroy();
      optimizedTimer.destroy();
    }, 5000);
  }

  // 4. 事件监听器泄漏
  static eventListenerLeakExample() {
    console.log("=== 事件监听器泄漏示例 ===");

    // 问题代码
    class LeakyEventHandler {
      constructor() {
        this.data = new Array(100000).fill("data");
        this.handleClick = this.handleClick.bind(this);

        // 添加事件监听器但不清理
        document.addEventListener("click", this.handleClick);
      }

      handleClick() {
        console.log("Click handled, data length:", this.data.length);
      }

      destroy() {
        // 忘记移除事件监听器
        this.data = null;
      }
    }

    // 解决方案
    class OptimizedEventHandler {
      constructor() {
        this.data = new Array(100000).fill("data");
        this.handleClick = this.handleClick.bind(this);

        document.addEventListener("click", this.handleClick);
      }

      handleClick() {
        console.log("Click handled, data length:", this.data.length);
      }

      destroy() {
        // 移除事件监听器
        document.removeEventListener("click", this.handleClick);
        this.data = null;
        this.handleClick = null;
      }
    }

    const leakyHandler = new LeakyEventHandler();
    const optimizedHandler = new OptimizedEventHandler();

    // 销毁处理器
    setTimeout(() => {
      leakyHandler.destroy();
      optimizedHandler.destroy();
    }, 3000);
  }

  // 5. 循环引用泄漏
  static circularReferenceExample() {
    console.log("=== 循环引用泄漏示例 ===");

    // 问题代码（在旧版本 IE 中会泄漏）
    function createCircularReference() {
      const parent = {
        name: "parent",
        data: new Array(100000).fill("data"),
      };

      const child = {
        name: "child",
        parent: parent,
      };

      parent.child = child; // 循环引用

      return parent;
    }

    // 解决方案
    function createOptimizedReference() {
      const parent = {
        name: "parent",
        data: new Array(100000).fill("data"),
      };

      const child = {
        name: "child",
        getParent() {
          return parent; // 通过方法访问，避免直接引用
        },
      };

      parent.child = child;

      // 提供清理方法
      parent.cleanup = function () {
        this.child = null;
        this.data = null;
      };

      return parent;
    }

    const circular = createCircularReference();
    const optimized = createOptimizedReference();

    // 清理引用
    setTimeout(() => {
      optimized.cleanup();
    }, 2000);
  }

  // 运行所有示例
  static runAllExamples() {
    this.closureLeakExample();
    this.domReferenceLeakExample();
    this.timerLeakExample();
    this.eventListenerLeakExample();
    this.circularReferenceExample();
  }
}

// 运行示例
MemoryLeakPatterns.runAllExamples();
```

## 📊 性能监控与优化

### GC 性能监控

```javascript
// GC 性能监控器
class GCPerformanceMonitor {
  constructor() {
    this.metrics = {
      gcEvents: [],
      performanceEntries: [],
      memorySnapshots: [],
    };

    this.observers = [];
    this.isMonitoring = false;
  }

  // 开始监控
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log("GC Performance monitoring started");

    // 监控 Performance API
    this.setupPerformanceObserver();

    // 定期采集内存快照
    this.setupMemoryMonitoring();

    // 监控页面性能
    this.setupPagePerformanceMonitoring();
  }

  // 设置性能观察器
  setupPerformanceObserver() {
    if (!window.PerformanceObserver) return;

    // 监控测量指标
    const measureObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes("gc") || entry.name.includes("garbage")) {
          this.metrics.gcEvents.push({
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now(),
          });
        }

        this.metrics.performanceEntries.push({
          name: entry.name,
          entryType: entry.entryType,
          duration: entry.duration,
          startTime: entry.startTime,
        });
      });
    });

    try {
      measureObserver.observe({
        entryTypes: ["measure", "navigation", "resource"],
      });
      this.observers.push(measureObserver);
    } catch (e) {
      console.warn("Could not observe performance entries:", e);
    }

    // 监控长任务
    if ("PerformanceObserver" in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.warn("Long task detected:", {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name,
            });

            // 长任务可能触发 GC
            this.recordPotentialGCTrigger("long-task", {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          });
        });

        longTaskObserver.observe({ entryTypes: ["longtask"] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn("Long task observer not supported");
      }
    }
  }

  // 设置内存监控
  setupMemoryMonitoring() {
    const monitorMemory = () => {
      if (!performance.memory) return;

      const snapshot = {
        timestamp: Date.now(),
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };

      this.metrics.memorySnapshots.push(snapshot);

      // 检测内存突然下降（可能的 GC 事件）
      if (this.metrics.memorySnapshots.length > 1) {
        const previous =
          this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 2];
        const current = snapshot;

        const memoryDrop = previous.usedJSHeapSize - current.usedJSHeapSize;
        const dropPercentage = memoryDrop / previous.usedJSHeapSize;

        if (memoryDrop > 1024 * 1024 && dropPercentage > 0.1) {
          // 1MB 且 10% 以上的下降
          this.recordGCEvent("memory-drop", {
            memoryFreed: memoryDrop,
            dropPercentage: dropPercentage * 100,
            beforeSize: previous.usedJSHeapSize,
            afterSize: current.usedJSHeapSize,
          });
        }
      }

      // 保持最近100个快照
      if (this.metrics.memorySnapshots.length > 100) {
        this.metrics.memorySnapshots = this.metrics.memorySnapshots.slice(-100);
      }
    };

    // 每秒监控一次
    const memoryTimer = setInterval(monitorMemory, 1000);

    // 清理时停止定时器
    this.cleanup = () => {
      clearInterval(memoryTimer);
    };
  }

  // 设置页面性能监控
  setupPagePerformanceMonitoring() {
    // 监控页面卡顿
    let lastFrameTime = performance.now();

    const checkFrameRate = () => {
      const currentTime = performance.now();
      const frameDuration = currentTime - lastFrameTime;

      // 如果单帧超过 50ms，可能发生了 GC
      if (frameDuration > 50) {
        this.recordPotentialGCTrigger("frame-drop", {
          frameDuration,
          expectedDuration: 16.67, // 60fps
        });
      }

      lastFrameTime = currentTime;

      if (this.isMonitoring) {
        requestAnimationFrame(checkFrameRate);
      }
    };

    requestAnimationFrame(checkFrameRate);
  }

  // 记录 GC 事件
  recordGCEvent(type, details) {
    const event = {
      type,
      timestamp: Date.now(),
      details,
      memoryBefore:
        this.metrics.memorySnapshots.length > 1
          ? this.metrics.memorySnapshots[
              this.metrics.memorySnapshots.length - 2
            ]
          : null,
      memoryAfter:
        this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1],
    };

    this.metrics.gcEvents.push(event);

    console.log(`GC Event [${type}]:`, event);
  }

  // 记录潜在的 GC 触发
  recordPotentialGCTrigger(trigger, details) {
    console.log(`Potential GC trigger [${trigger}]:`, details);

    this.recordGCEvent("potential-gc", { trigger, ...details });
  }

  // 获取性能报告
  getPerformanceReport() {
    const report = {
      monitoringDuration: this.isMonitoring
        ? Date.now() -
          (this.metrics.memorySnapshots[0]?.timestamp || Date.now())
        : 0,

      gcEvents: {
        total: this.metrics.gcEvents.length,
        types: this.groupBy(this.metrics.gcEvents, "type"),
        averageInterval: this.calculateAverageGCInterval(),
      },

      memoryUsage: {
        snapshots: this.metrics.memorySnapshots.length,
        peak: Math.max(
          ...this.metrics.memorySnapshots.map((s) => s.usedJSHeapSize)
        ),
        current:
          this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1]
            ?.usedJSHeapSize || 0,
        averageGrowthRate: this.calculateMemoryGrowthRate(),
      },

      performanceImpact: {
        longTasks: this.metrics.performanceEntries.filter(
          (e) => e.duration > 50
        ).length,
        totalBlockingTime: this.metrics.performanceEntries
          .filter((e) => e.duration > 50)
          .reduce((sum, e) => sum + e.duration, 0),
      },
    };

    return report;
  }

  // 计算平均 GC 间隔
  calculateAverageGCInterval() {
    if (this.metrics.gcEvents.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < this.metrics.gcEvents.length; i++) {
      intervals.push(
        this.metrics.gcEvents[i].timestamp -
          this.metrics.gcEvents[i - 1].timestamp
      );
    }

    return (
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    );
  }

  // 计算内存增长率
  calculateMemoryGrowthRate() {
    if (this.metrics.memorySnapshots.length < 2) return 0;

    const first = this.metrics.memorySnapshots[0];
    const last =
      this.metrics.memorySnapshots[this.metrics.memorySnapshots.length - 1];

    const growthBytes = last.usedJSHeapSize - first.usedJSHeapSize;
    const timeSpan = last.timestamp - first.timestamp;

    return growthBytes / timeSpan; // bytes per ms
  }

  // 分组辅助函数
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  // 停止监控
  stopMonitoring() {
    this.isMonitoring = false;

    // 断开观察器
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];

    // 执行清理
    if (this.cleanup) {
      this.cleanup();
    }

    console.log("GC Performance monitoring stopped");

    // 输出最终报告
    const report = this.getPerformanceReport();
    console.log("Final Performance Report:", report);

    return report;
  }
}

// 使用示例
const gcMonitor = new GCPerformanceMonitor();

// 开始监控
gcMonitor.startMonitoring();

// 模拟一些内存操作来触发 GC
function simulateMemoryOperations() {
  const objects = [];

  // 创建大量对象
  for (let i = 0; i < 100000; i++) {
    objects.push({
      id: i,
      data: new Array(100).fill(Math.random()),
    });
  }

  // 释放一部分对象
  objects.splice(0, 50000);

  // 创建更多对象
  for (let i = 0; i < 50000; i++) {
    objects.push({
      id: i + 100000,
      largeData: new Array(1000).fill(Math.random()),
    });
  }

  console.log("Memory operations completed");
}

// 运行模拟
setTimeout(() => {
  simulateMemoryOperations();
}, 2000);

// 5分钟后停止监控
setTimeout(() => {
  const finalReport = gcMonitor.stopMonitoring();
  console.log("Monitoring completed. Final report:", finalReport);
}, 5 * 60 * 1000);
```

---

## 🎯 总结

浏览器垃圾回收机制是现代 Web 应用性能的关键：

### 核心概念

- **分代回收**：新生代使用 Scavenge 算法，老生代使用标记清除算法
- **增量标记**：避免长时间阻塞主线程
- **并发标记**：利用多线程提高 GC 效率

### 关键算法

- **Scavenge**：复制算法，适用于短生命周期对象
- **Mark-Sweep**：标记清除，适用于长生命周期对象
- **Mark-Compact**：标记整理，减少内存碎片

### 性能优化

- **避免内存泄漏**：正确管理事件监听器、定时器、闭包
- **优化对象创建**：减少临时对象，复用对象池
- **监控内存使用**：及时发现和解决内存问题

### 最佳实践

- **及时清理引用**：避免不必要的对象保持
- **使用弱引用**：WeakMap、WeakSet 避免循环引用
- **性能监控**：持续监控内存使用和 GC 性能

理解垃圾回收机制有助于编写更高效、更稳定的 JavaScript 应用。

---

🎯 **下一步**: 深入了解 GC 原理后，建议学习 [浏览器性能优化](./performance.md) 来应用这些知识！
