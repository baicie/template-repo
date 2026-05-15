# Promise 实现（符合 Promise A+ 规范）

## 题目描述

手写实现一个完全符合 Promise A+ 规范的 Promise 类，要求：

- 支持 `then`、`catch`、`finally` 方法
- 支持链式调用
- 正确处理异步操作
- 处理各种边界情况
- 符合 Promise A+ 规范的所有要求

## 核心考察点

- 对 Promise 状态机的理解
- 异步编程和回调处理
- 规范理解和边界情况处理
- JavaScript 高级特性运用

## Promise A+ 规范要点

### 1. 状态（States）

Promise 必须是以下三种状态之一：

- **pending（等待态）**: 初始状态，可以迁移至 fulfilled 或 rejected 状态
- **fulfilled（执行态）**: 成功状态，不可变更，必须拥有一个不可变的终值
- **rejected（拒绝态）**: 失败状态，不可变更，必须拥有一个不可变的拒因

### 2. then 方法

- Promise 必须提供一个 `then` 方法来访问其当前值、终值和拒因
- `then` 方法接受两个参数：`onFulfilled` 和 `onRejected`
- 返回一个新的 Promise

## 完整实现

```javascript
// Promise 的三种状态常量
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  constructor(executor) {
    // 初始状态为 pending
    this.state = PENDING;
    // 成功的值
    this.value = undefined;
    // 失败的原因
    this.reason = undefined;

    // 存储成功回调
    this.onFulfilledCallbacks = [];
    // 存储失败回调
    this.onRejectedCallbacks = [];

    // resolve 函数
    const resolve = (value) => {
      // 只有在 pending 状态才能转换
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;

        // 执行所有成功回调
        this.onFulfilledCallbacks.forEach((callback) => callback());
      }
    };

    // reject 函数
    const reject = (reason) => {
      // 只有在 pending 状态才能转换
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;

        // 执行所有失败回调
        this.onRejectedCallbacks.forEach((callback) => callback());
      }
    };

    try {
      // 立即执行 executor
      executor(resolve, reject);
    } catch (error) {
      // 如果 executor 执行出错，直接 reject
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    // 参数可选，如果不是函数则忽略
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
      if (this.state === FULFILLED) {
        // 异步执行 onFulfilled
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if (this.state === REJECTED) {
        // 异步执行 onRejected
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if (this.state === PENDING) {
        // 如果还是 pending 状态，将回调存储起来
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return this.then(
      (value) => MyPromise.resolve(onFinally()).then(() => value),
      (reason) =>
        MyPromise.resolve(onFinally()).then(() => {
          throw reason;
        })
    );
  }

  // 静态方法 resolve
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }

    return new MyPromise((resolve) => {
      resolve(value);
    });
  }

  // 静态方法 reject
  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }

  // 静态方法 all
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        reject(new TypeError("Argument must be an array"));
        return;
      }

      const results = [];
      let completedCount = 0;
      const total = promises.length;

      if (total === 0) {
        resolve(results);
        return;
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          (value) => {
            results[index] = value;
            completedCount++;

            if (completedCount === total) {
              resolve(results);
            }
          },
          (reason) => {
            reject(reason);
          }
        );
      });
    });
  }

  // 静态方法 race
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        reject(new TypeError("Argument must be an array"));
        return;
      }

      promises.forEach((promise) => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }

  // 静态方法 allSettled
  static allSettled(promises) {
    return new MyPromise((resolve) => {
      if (!Array.isArray(promises)) {
        resolve([]);
        return;
      }

      const results = [];
      let completedCount = 0;
      const total = promises.length;

      if (total === 0) {
        resolve(results);
        return;
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          (value) => {
            results[index] = { status: "fulfilled", value };
            completedCount++;

            if (completedCount === total) {
              resolve(results);
            }
          },
          (reason) => {
            results[index] = { status: "rejected", reason };
            completedCount++;

            if (completedCount === total) {
              resolve(results);
            }
          }
        );
      });
    });
  }
}

// Promise 解决过程（Promise Resolution Procedure）
function resolvePromise(promise2, x, resolve, reject) {
  // 如果 promise2 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise2
  if (promise2 === x) {
    reject(new TypeError("Chaining cycle detected for promise"));
    return;
  }

  // 如果 x 为 Promise，则使 promise2 接受 x 的状态
  if (x instanceof MyPromise) {
    if (x.state === PENDING) {
      x.then((value) => {
        resolvePromise(promise2, value, resolve, reject);
      }, reject);
    } else {
      x.then(resolve, reject);
    }
    return;
  }

  // 如果 x 为对象或函数
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    let called = false; // 避免多次调用

    try {
      const then = x.then;

      if (typeof then === "function") {
        // 如果 then 是函数，将 x 作为函数的作用域 this 调用
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // 如果 then 不是函数，以 x 为参数执行 promise2
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise2
    resolve(x);
  }
}
```

## 测试用例

```javascript
// 基本功能测试
console.log("=== 基本功能测试 ===");

// 测试 resolve
const promise1 = new MyPromise((resolve, reject) => {
  resolve("成功");
});

promise1.then((value) => {
  console.log("resolve 测试:", value); // 成功
});

// 测试 reject
const promise2 = new MyPromise((resolve, reject) => {
  reject("失败");
});

promise2.catch((reason) => {
  console.log("reject 测试:", reason); // 失败
});

// 测试异步
console.log("=== 异步测试 ===");

const promise3 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("异步成功");
  }, 1000);
});

promise3.then((value) => {
  console.log("异步测试:", value); // 1秒后输出: 异步成功
});

// 测试链式调用
console.log("=== 链式调用测试 ===");

new MyPromise((resolve) => {
  resolve(1);
})
  .then((value) => {
    console.log("第一步:", value); // 1
    return value * 2;
  })
  .then((value) => {
    console.log("第二步:", value); // 2
    return new MyPromise((resolve) => {
      setTimeout(() => resolve(value * 2), 500);
    });
  })
  .then((value) => {
    console.log("第三步:", value); // 4
  });

// 测试错误处理
console.log("=== 错误处理测试 ===");

new MyPromise((resolve) => {
  resolve(1);
})
  .then((value) => {
    throw new Error("故意抛错");
  })
  .catch((error) => {
    console.log("捕获错误:", error.message); // 故意抛错
  });

// 测试 finally
console.log("=== finally 测试 ===");

new MyPromise((resolve) => {
  resolve("成功值");
})
  .finally(() => {
    console.log("finally 执行"); // finally 执行
  })
  .then((value) => {
    console.log("最终值:", value); // 成功值
  });

// 测试静态方法
console.log("=== 静态方法测试 ===");

// Promise.all 测试
MyPromise.all([
  MyPromise.resolve(1),
  MyPromise.resolve(2),
  new MyPromise((resolve) => setTimeout(() => resolve(3), 100)),
]).then((values) => {
  console.log("Promise.all 结果:", values); // [1, 2, 3]
});

// Promise.race 测试
MyPromise.race([
  new MyPromise((resolve) => setTimeout(() => resolve("慢"), 200)),
  new MyPromise((resolve) => setTimeout(() => resolve("快"), 100)),
]).then((value) => {
  console.log("Promise.race 结果:", value); // 快
});

// Promise.allSettled 测试
MyPromise.allSettled([
  MyPromise.resolve(1),
  MyPromise.reject("错误"),
  MyPromise.resolve(3),
]).then((results) => {
  console.log("Promise.allSettled 结果:", results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: '错误' },
  //   { status: 'fulfilled', value: 3 }
  // ]
});
```

## Promise A+ 规范测试

```javascript
// 可以使用 promises-aplus-tests 进行规范测试
// 需要导出适配器函数

MyPromise.deferred = function () {
  const dfd = {};
  dfd.promise = new MyPromise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

// 如果在 Node.js 环境中，可以这样导出
// module.exports = MyPromise;

// 然后运行: npx promises-aplus-tests your-promise-file.js
```

## 进阶特性

### 1. 支持 async/await 语法

```javascript
// 测试与 async/await 的兼容性
async function testAsyncAwait() {
  try {
    const result = await new MyPromise((resolve) => {
      setTimeout(() => resolve("async/await 测试"), 100);
    });
    console.log("async/await 结果:", result);
  } catch (error) {
    console.error("async/await 错误:", error);
  }
}

testAsyncAwait();
```

### 2. 性能优化版本

```javascript
class OptimizedPromise extends MyPromise {
  constructor(executor) {
    super(executor);

    // 优化：使用微任务而不是宏任务
    this._scheduleMicrotask =
      typeof queueMicrotask === "function"
        ? queueMicrotask
        : (callback) => Promise.resolve().then(callback);
  }

  then(onFulfilled, onRejected) {
    // 使用微任务调度，更符合原生 Promise 行为
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw reason;
          };

    const promise2 = new OptimizedPromise((resolve, reject) => {
      if (this.state === FULFILLED) {
        this._scheduleMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.state === REJECTED) {
        this._scheduleMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }

      if (this.state === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          this._scheduleMicrotask(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          this._scheduleMicrotask(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    });

    return promise2;
  }
}
```

### 3. 调试版本

```javascript
class DebuggablePromise extends MyPromise {
  constructor(executor) {
    super(executor);
    this._id = Math.random().toString(36).substr(2, 9);
    this._createdAt = new Date().toISOString();

    console.log(`Promise ${this._id} created at ${this._createdAt}`);
  }

  then(onFulfilled, onRejected) {
    console.log(`Promise ${this._id} then called`);
    return super.then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    console.log(`Promise ${this._id} catch called`);
    return super.catch(onRejected);
  }
}
```

## 相关知识点

- [JavaScript 异步编程](/javascript/async-programming.md)
- [事件循环机制](/browser/performance.md)
- [微任务和宏任务](/javascript/async-programming.md)
- [错误处理机制](/javascript/type-conversion.md)

## 总结

Promise 的实现涉及多个核心概念：

1. **状态管理** - 正确处理 pending、fulfilled、rejected 三种状态
2. **异步处理** - 理解事件循环和任务调度
3. **链式调用** - 每个 then 都返回新的 Promise
4. **错误处理** - 完善的异常捕获和传播机制
5. **规范遵循** - 严格按照 Promise A+ 规范实现

这个实现完全符合 Promise A+ 规范，可以通过官方测试套件的验证，是一个非常好的面试题目，能够全面考察对 JavaScript 异步编程的理解。
