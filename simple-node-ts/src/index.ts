// src/index.ts
console.log("Hello, Node.js + TypeScript!");

// 定义一个简单的函数
function greet(name: string): string {
  return `你好, ${name}!`;
}

// 使用函数
const message = greet("世界");
console.log(message);

// 定义一个简单的类
class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  subtract(a: number, b: number): number {
    return a - b;
  }
}

// 使用类
const calc = new Calculator();
console.log("5 + 3 =", calc.add(5, 3));
console.log("10 - 4 =", calc.subtract(10, 4));

// 异步函数示例
async function fetchData(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("数据获取完成!");
    }, 1000);
  });
}

// 使用异步函数
fetchData().then((data) => {
  console.log(data);
});

export { greet, Calculator };
