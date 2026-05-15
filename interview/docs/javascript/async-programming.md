# JavaScript 异步编程 - 深度解析

## 核心概念概述

**异步编程**：允许程序在等待某些操作完成时继续执行其他任务的编程模式。

**事件循环**：JavaScript 运行时处理异步操作的核心机制。

**Promise**：用于处理异步操作的对象，代表一个异步操作的最终完成或失败。

**async/await**：基于 Promise 的语法糖，让异步代码看起来像同步代码。

## 1. 事件循环机制 🔄

### JavaScript 单线程与事件循环

```javascript
// JavaScript 是单线程的，但可以处理异步操作
console.log("1 - 同步代码开始");

setTimeout(() => {
  console.log("2 - 宏任务：setTimeout");
}, 0);

Promise.resolve().then(() => {
  console.log("3 - 微任务：Promise.then");
});

console.log("4 - 同步代码结束");

// 输出顺序：1 -> 4 -> 3 -> 2
// 原因：同步代码 -> 微任务 -> 宏任务
```

### 调用栈、任务队列和事件循环

```javascript
// 事件循环的详细演示
function first() {
  console.log("first - 调用栈");
  second();
}

function second() {
  console.log("second - 调用栈");

  // 宏任务
  setTimeout(() => {
    console.log("setTimeout - 宏任务队列");
  }, 0);

  // 微任务
  Promise.resolve().then(() => {
    console.log("Promise.then - 微任务队列");
  });

  console.log("second end - 调用栈");
}

console.log("start - 调用栈");
first();
console.log("end - 调用栈");

// 执行过程：
// 1. 调用栈执行同步代码
// 2. 遇到异步操作放入对应队列
// 3. 调用栈清空后，处理微任务队列
// 4. 微任务队列清空后，处理宏任务队列
// 5. 循环往复
```

### 宏任务与微任务

```javascript
// 宏任务和微任务的执行顺序
console.log("=== 任务执行顺序演示 ===");

// 宏任务
setTimeout(() => console.log("宏任务1: setTimeout"), 0);
setInterval(() => {
  console.log("宏任务2: setInterval");
  clearInterval(this); // 清除定时器
}, 0);

// 微任务
Promise.resolve().then(() => console.log("微任务1: Promise.then"));
queueMicrotask(() => console.log("微任务2: queueMicrotask"));

// 更多微任务
Promise.resolve()
  .then(() => {
    console.log("微任务3: Promise.then");
    return Promise.resolve();
  })
  .then(() => {
    console.log("微任务4: 链式 Promise.then");
  });

console.log("同步代码执行完毕");

// 任务优先级：
// 1. 同步代码（调用栈）
// 2. 微任务（Promise.then, queueMicrotask, MutationObserver）
// 3. 宏任务（setTimeout, setInterval, setImmediate, I/O, UI 渲染）
```

### Node.js 事件循环

```javascript
// Node.js 中的事件循环阶段
const fs = require("fs");

console.log("开始");

// immediate 队列
setImmediate(() => {
  console.log("setImmediate");
});

// timers 队列
setTimeout(() => {
  console.log("setTimeout");
}, 0);

// I/O 操作
fs.readFile(__filename, () => {
  console.log("fs.readFile");

  // 在 I/O 回调中的 immediate 和 timeout
  setImmediate(() => {
    console.log("setImmediate in I/O");
  });

  setTimeout(() => {
    console.log("setTimeout in I/O");
  }, 0);
});

// 微任务
Promise.resolve().then(() => {
  console.log("Promise.then");
});

console.log("结束");

// Node.js 事件循环阶段：
// 1. timers: 执行 setTimeout 和 setInterval 回调
// 2. pending callbacks: 执行 I/O 回调
// 3. idle, prepare: 内部使用
// 4. poll: 获取新的 I/O 事件
// 5. check: 执行 setImmediate 回调
// 6. close callbacks: 执行关闭回调
```

## 2. Promise 原理与实现 🤝

### Promise 基础用法

```javascript
// Promise 的三种状态
const promise1 = new Promise((resolve, reject) => {
  // pending 状态
  setTimeout(() => {
    resolve("成功"); // 变为 fulfilled 状态
  }, 1000);
});

const promise2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error("失败")); // 变为 rejected 状态
  }, 1000);
});

// 处理 Promise 结果
promise1
  .then((value) => {
    console.log("成功:", value);
    return value + " - 处理后";
  })
  .then((value) => {
    console.log("链式调用:", value);
  })
  .catch((error) => {
    console.log("错误:", error.message);
  })
  .finally(() => {
    console.log("总是执行");
  });
```

### Promise 链式调用

```javascript
// Promise 链式调用的数据传递
function fetchUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: `User${id}` });
    }, 100);
  });
}

function fetchPosts(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "Post 1", userId },
        { id: 2, title: "Post 2", userId },
      ]);
    }, 100);
  });
}

function fetchComments(postId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, content: "Comment 1", postId },
        { id: 2, content: "Comment 2", postId },
      ]);
    }, 100);
  });
}

// 链式调用避免回调地狱
fetchUser(1)
  .then((user) => {
    console.log("用户:", user);
    return fetchPosts(user.id);
  })
  .then((posts) => {
    console.log("文章:", posts);
    return fetchComments(posts[0].id);
  })
  .then((comments) => {
    console.log("评论:", comments);
  })
  .catch((error) => {
    console.error("发生错误:", error);
  });
```

### 手写 Promise 实现

```javascript
// 简化版 Promise 实现
class MyPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    this.state = MyPromise.PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === MyPromise.PENDING) {
        this.state = MyPromise.FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach((callback) => callback());
      }
    };

    const reject = (reason) => {
      if (this.state === MyPromise.PENDING) {
        this.state = MyPromise.REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((callback) => callback());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    // 参数默认值
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    // 返回新的 Promise 实现链式调用
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === MyPromise.FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      } else if (this.state === MyPromise.REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      } else if (this.state === MyPromise.PENDING) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise2;
  }

  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      return reject(new TypeError("Chaining cycle detected"));
    }

    if (x instanceof MyPromise) {
      x.then(resolve, reject);
    } else {
      resolve(x);
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(
      (value) => MyPromise.resolve(callback()).then(() => value),
      (reason) =>
        MyPromise.resolve(callback()).then(() => {
          throw reason;
        })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let completedCount = 0;

      if (promises.length === 0) {
        resolve(results);
        return;
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          (value) => {
            results[index] = value;
            completedCount++;
            if (completedCount === promises.length) {
              resolve(results);
            }
          },
          (reason) => reject(reason)
        );
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

// 测试自定义 Promise
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve("成功"), 1000);
});

promise
  .then((value) => {
    console.log("自定义 Promise:", value);
    return value + " - 链式";
  })
  .then((value) => {
    console.log("链式调用:", value);
  });
```

### Promise 静态方法

```javascript
// Promise.all - 所有 Promise 都成功才成功
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

Promise.all([promise1, promise2, promise3])
  .then((values) => {
    console.log("Promise.all 结果:", values); // [1, 2, 3]
  })
  .catch((error) => {
    console.log("Promise.all 错误:", error);
  });

// Promise.allSettled - 等待所有 Promise 都敲定
const mixedPromises = [
  Promise.resolve(1),
  Promise.reject(new Error("失败")),
  Promise.resolve(3),
];

Promise.allSettled(mixedPromises).then((results) => {
  console.log("Promise.allSettled 结果:", results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: Error: 失败 },
  //   { status: 'fulfilled', value: 3 }
  // ]
});

// Promise.race - 第一个敲定的 Promise 决定结果
const racePromises = [
  new Promise((resolve) => setTimeout(() => resolve("慢"), 1000)),
  new Promise((resolve) => setTimeout(() => resolve("快"), 100)),
];

Promise.race(racePromises).then((value) => {
  console.log("Promise.race 结果:", value); // '快'
});

// Promise.any - 第一个成功的 Promise 决定结果
const anyPromises = [
  Promise.reject(new Error("错误1")),
  Promise.reject(new Error("错误2")),
  Promise.resolve("成功"),
];

Promise.any(anyPromises)
  .then((value) => {
    console.log("Promise.any 结果:", value); // '成功'
  })
  .catch((error) => {
    console.log("Promise.any 错误:", error); // AggregateError
  });
```

## 3. async/await 语法 ✨

### 基础 async/await 用法

```javascript
// async/await 基础语法
async function fetchData() {
  try {
    // await 只能在 async 函数中使用
    const user = await fetchUser(1);
    console.log("用户数据:", user);

    const posts = await fetchPosts(user.id);
    console.log("文章数据:", posts);

    const comments = await fetchComments(posts[0].id);
    console.log("评论数据:", comments);

    return { user, posts, comments };
  } catch (error) {
    console.error("获取数据失败:", error);
    throw error; // 重新抛出错误
  }
}

// async 函数返回 Promise
fetchData()
  .then((result) => {
    console.log("所有数据:", result);
  })
  .catch((error) => {
    console.error("处理失败:", error);
  });
```

### 并发处理

```javascript
// 错误的串行处理（性能差）
async function serialProcessing() {
  console.time("串行处理");

  const user1 = await fetchUser(1); // 等待 100ms
  const user2 = await fetchUser(2); // 等待 100ms
  const user3 = await fetchUser(3); // 等待 100ms

  console.timeEnd("串行处理"); // 约 300ms
  return [user1, user2, user3];
}

// 正确的并发处理（性能好）
async function parallelProcessing() {
  console.time("并发处理");

  // 同时发起请求
  const userPromises = [fetchUser(1), fetchUser(2), fetchUser(3)];

  const users = await Promise.all(userPromises);

  console.timeEnd("并发处理"); // 约 100ms
  return users;
}

// 有限并发控制
async function limitedConcurrency(tasks, limit = 2) {
  const results = [];
  const executing = [];

  for (const task of tasks) {
    const promise = task();
    results.push(promise);

    if (tasks.length >= limit) {
      executing.push(promise);

      if (executing.length >= limit) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex((p) => p === promise),
          1
        );
      }
    }
  }

  return Promise.all(results);
}

// 使用示例
const tasks = [
  () => fetchUser(1),
  () => fetchUser(2),
  () => fetchUser(3),
  () => fetchUser(4),
  () => fetchUser(5),
];

limitedConcurrency(tasks, 2).then((results) => {
  console.log("限制并发结果:", results);
});
```

### 错误处理模式

```javascript
// 多种错误处理方式
async function errorHandlingPatterns() {
  // 1. try-catch 包装整个函数
  try {
    const result1 = await riskOperation1();
    const result2 = await riskOperation2();
    return { result1, result2 };
  } catch (error) {
    console.error("操作失败:", error);
    return null;
  }
}

// 2. 单独处理每个操作
async function individualErrorHandling() {
  let result1, result2;

  try {
    result1 = await riskOperation1();
  } catch (error) {
    console.error("操作1失败:", error);
    result1 = "默认值1";
  }

  try {
    result2 = await riskOperation2();
  } catch (error) {
    console.error("操作2失败:", error);
    result2 = "默认值2";
  }

  return { result1, result2 };
}

// 3. 使用 Promise.allSettled 处理多个操作
async function allSettledErrorHandling() {
  const operations = [riskOperation1(), riskOperation2(), riskOperation3()];

  const results = await Promise.allSettled(operations);

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      console.error(`操作${index + 1}失败:`, result.reason);
      return null;
    }
  });
}

// 4. 自定义错误处理装饰器
function asyncErrorHandler(fn) {
  return async function (...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      console.error(`函数 ${fn.name} 执行失败:`, error);
      throw error;
    }
  };
}

const safeFunction = asyncErrorHandler(async function riskyFunction() {
  throw new Error("模拟错误");
});
```

### async/await 的实现原理

```javascript
// async/await 本质上是 Generator + Promise 的语法糖
function asyncToGenerator(generatorFunction) {
  return function (...args) {
    const generator = generatorFunction.apply(this, args);

    return new Promise((resolve, reject) => {
      function step(key, arg) {
        try {
          const info = generator[key](arg);
          const { value, done } = info;

          if (done) {
            resolve(value);
          } else {
            Promise.resolve(value).then(
              (val) => step("next", val),
              (err) => step("throw", err)
            );
          }
        } catch (error) {
          reject(error);
        }
      }

      step("next");
    });
  };
}

// 使用 Generator 实现异步流程
function* fetchDataGenerator() {
  try {
    const user = yield fetchUser(1);
    const posts = yield fetchPosts(user.id);
    const comments = yield fetchComments(posts[0].id);
    return { user, posts, comments };
  } catch (error) {
    console.error("Generator 错误:", error);
  }
}

// 转换为 async 函数
const fetchDataAsync = asyncToGenerator(fetchDataGenerator);

fetchDataAsync().then((result) => {
  console.log("Generator 转 async 结果:", result);
});
```

## 4. 异步编程模式与最佳实践 🚀

### 回调地狱的解决方案

```javascript
// 回调地狱问题
function callbackHell() {
  fetchUser(1, (err, user) => {
    if (err) throw err;
    fetchPosts(user.id, (err, posts) => {
      if (err) throw err;
      fetchComments(posts[0].id, (err, comments) => {
        if (err) throw err;
        console.log("回调地狱结果:", { user, posts, comments });
      });
    });
  });
}

// Promise 解决方案
function promiseSolution() {
  return fetchUser(1)
    .then((user) => fetchPosts(user.id))
    .then((posts) => fetchComments(posts[0].id))
    .then((comments) => console.log("Promise 解决方案结果:", comments))
    .catch((error) => console.error("Promise 错误:", error));
}

// async/await 解决方案
async function asyncAwaitSolution() {
  try {
    const user = await fetchUser(1);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    console.log("async/await 解决方案结果:", { user, posts, comments });
  } catch (error) {
    console.error("async/await 错误:", error);
  }
}
```

### 异步迭代器

```javascript
// 异步迭代器的使用
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

async function useAsyncIterator() {
  for await (const value of asyncGenerator()) {
    console.log("异步迭代器值:", value);
  }
}

// 自定义异步迭代器
class AsyncRange {
  constructor(start, end, delay = 100) {
    this.start = start;
    this.end = end;
    this.delay = delay;
  }

  async *[Symbol.asyncIterator]() {
    for (let i = this.start; i <= this.end; i++) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
      yield i;
    }
  }
}

async function useCustomAsyncIterator() {
  const range = new AsyncRange(1, 5, 200);

  for await (const num of range) {
    console.log("自定义异步迭代器:", num);
  }
}

useCustomAsyncIterator();
```

### 异步队列和调度

```javascript
// 异步任务队列
class AsyncQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject,
      });

      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

// 使用异步队列
const queue = new AsyncQueue(2); // 并发数为 2

const tasks = Array.from(
  { length: 10 },
  (_, i) => () =>
    new Promise((resolve) =>
      setTimeout(() => {
        console.log(`任务 ${i + 1} 完成`);
        resolve(i + 1);
      }, Math.random() * 1000)
    )
);

Promise.all(tasks.map((task) => queue.add(task))).then((results) => {
  console.log("所有任务完成:", results);
});
```

### 请求重试和超时处理

```javascript
// 带重试的异步请求
async function retryRequest(fn, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i === maxRetries) {
        throw lastError;
      }

      console.log(`请求失败，${delay}ms 后重试... (${i + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // 指数退避
    }
  }
}

// 超时处理
function withTimeout(promise, timeoutMs) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("请求超时")), timeoutMs);
  });

  return Promise.race([promise, timeout]);
}

// 组合使用
async function robustRequest(url) {
  const request = () => withTimeout(fetch(url), 5000);

  try {
    const response = await retryRequest(request, 3, 1000);
    return response.json();
  } catch (error) {
    console.error("请求最终失败:", error);
    throw error;
  }
}

// 使用示例
// robustRequest('https://api.example.com/data')
//   .then(data => console.log('数据:', data))
//   .catch(error => console.error('错误:', error));
```

## 5. 常见面试题和陷阱 💡

### 事件循环相关题目

```javascript
// 经典面试题：输出顺序
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => {
  console.log("3");
  Promise.resolve().then(() => console.log("4"));
});

console.log("5");

// 答案：1, 5, 3, 4, 2
// 解析：同步代码 -> 微任务 -> 宏任务

// 复杂版本
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

async1();

new Promise((resolve) => {
  console.log("promise1");
  resolve();
}).then(() => {
  console.log("promise2");
});

console.log("script end");

// 答案：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

### Promise 链式调用陷阱

```javascript
// Promise 链式调用的常见错误
// 错误示例 1：忘记返回 Promise
function badChaining() {
  return fetchUser(1)
    .then((user) => {
      fetchPosts(user.id); // 忘记 return！
    })
    .then((posts) => {
      console.log(posts); // undefined
    });
}

// 正确示例 1
function goodChaining() {
  return fetchUser(1)
    .then((user) => {
      return fetchPosts(user.id); // 正确返回 Promise
    })
    .then((posts) => {
      console.log(posts); // 正确的 posts 数据
    });
}

// 错误示例 2：错误的错误处理
function badErrorHandling() {
  return fetchUser(1)
    .then((user) => {
      return fetchPosts(user.id);
    })
    .catch((error) => {
      console.log("错误:", error);
      // 没有重新抛出错误，链式调用会继续
    })
    .then((posts) => {
      console.log(posts); // 即使发生错误也会执行
    });
}

// 正确示例 2
function goodErrorHandling() {
  return fetchUser(1)
    .then((user) => {
      return fetchPosts(user.id);
    })
    .catch((error) => {
      console.log("错误:", error);
      throw error; // 重新抛出错误
    })
    .then((posts) => {
      console.log(posts); // 只有成功时才执行
    });
}
```

### async/await 常见陷阱

```javascript
// 错误：在循环中使用 await
async function badLoop() {
  const ids = [1, 2, 3, 4, 5];
  const results = [];

  // 串行执行，性能差
  for (const id of ids) {
    const result = await fetchUser(id);
    results.push(result);
  }

  return results;
}

// 正确：并发执行
async function goodLoop() {
  const ids = [1, 2, 3, 4, 5];

  // 并发执行，性能好
  const promises = ids.map((id) => fetchUser(id));
  const results = await Promise.all(promises);

  return results;
}

// forEach 与 await 的陷阱
async function forEachTrap() {
  const ids = [1, 2, 3];

  // 错误：forEach 不等待异步操作
  ids.forEach(async (id) => {
    const user = await fetchUser(id);
    console.log(user); // 可能乱序输出
  });

  console.log("完成"); // 立即执行，不等待
}

// 正确的处理方式
async function correctForEach() {
  const ids = [1, 2, 3];

  // 方式 1：使用 for...of
  for (const id of ids) {
    const user = await fetchUser(id);
    console.log(user); // 顺序输出
  }

  // 方式 2：使用 Promise.all
  const users = await Promise.all(ids.map(fetchUser));
  users.forEach((user) => console.log(user));

  console.log("完成"); // 在所有操作完成后执行
}
```

### 内存泄漏和性能问题

```javascript
// 潜在的内存泄漏
class DataProcessor {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Set();
  }

  async processData(id) {
    // 问题：没有清理完成的请求
    if (this.pendingRequests.has(id)) {
      return;
    }

    this.pendingRequests.add(id);

    try {
      const data = await fetchData(id);
      this.cache.set(id, data);
      return data;
    } finally {
      // 解决方案：清理完成的请求
      this.pendingRequests.delete(id);
    }
  }

  // 清理缓存的方法
  clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

// 正确的资源管理
class ImprovedDataProcessor {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.abortController = new AbortController();
  }

  async processData(id) {
    // 如果已有相同请求，返回现有 Promise
    if (this.pendingRequests.has(id)) {
      return this.pendingRequests.get(id);
    }

    const promise = this.fetchWithTimeout(id, 5000);
    this.pendingRequests.set(id, promise);

    try {
      const data = await promise;
      this.cache.set(id, data);
      return data;
    } finally {
      this.pendingRequests.delete(id);
    }
  }

  async fetchWithTimeout(id, timeout) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("超时")), timeout);
    });

    return Promise.race([fetchData(id), timeoutPromise]);
  }

  destroy() {
    this.abortController.abort();
    this.cache.clear();
    this.pendingRequests.clear();
  }
}
```

## 面试重点总结 🎯

### 必须掌握的核心概念

1. **事件循环机制**

   - 调用栈、任务队列、微任务队列
   - 宏任务和微任务的执行顺序
   - Node.js 与浏览器事件循环的差异

2. **Promise 原理**

   - 三种状态：pending、fulfilled、rejected
   - 链式调用的实现机制
   - 静态方法：all、race、allSettled、any

3. **async/await 语法**
   - 与 Promise 的关系
   - 错误处理最佳实践
   - 并发控制技巧

### 常考面试题模板

```javascript
// 1. 事件循环输出顺序
// 考查对宏任务、微任务的理解

// 2. Promise 实现
// 考查对 Promise 内部机制的理解

// 3. 并发控制
// 实现限制并发数的异步任务执行器

// 4. 错误处理
// 设计健壮的异步错误处理方案

// 5. 性能优化
// 避免串行执行，合理使用并发
```

### 记忆要点

- **事件循环**：单线程 + 异步非阻塞
- **Promise**：状态机 + 链式调用
- **async/await**：Promise 的语法糖
- **最佳实践**：并发优于串行，错误处理要完善

掌握异步编程是现代 JavaScript 开发的核心技能！
