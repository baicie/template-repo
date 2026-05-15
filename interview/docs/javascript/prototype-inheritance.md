# JavaScript 原型与继承 - 深度剖析

## 核心概念概述

**原型（Prototype）**：JavaScript 中对象的一个特殊属性，用于实现属性和方法的继承。

**原型链（Prototype Chain）**：通过 `__proto__` 属性连接的对象链，用于属性查找和继承。

**继承（Inheritance）**：子对象获得父对象属性和方法的机制。

## 1. 原型基础概念 🎯

### 理解 prototype 和 **proto**

```javascript
// 函数的 prototype 属性
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function () {
  return `Hello, I'm ${this.name}`;
};

// 创建实例
const alice = new Person("Alice");

console.log(Person.prototype); // Person 构造函数的原型对象
console.log(alice.__proto__); // alice 实例的原型链指向
console.log(alice.__proto__ === Person.prototype); // true

// 原型链查找
console.log(alice.sayHello()); // "Hello, I'm Alice"
console.log(alice.hasOwnProperty("name")); // true - 自有属性
console.log(alice.hasOwnProperty("sayHello")); // false - 原型属性
```

### 原型链的工作机制

```javascript
// 原型链示例
function Animal(type) {
  this.type = type;
}

Animal.prototype.move = function () {
  return `${this.type} is moving`;
};

function Dog(name, breed) {
  Animal.call(this, "dog"); // 调用父构造函数
  this.name = name;
  this.breed = breed;
}

// 建立原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function () {
  return `${this.name} is barking`;
};

const buddy = new Dog("Buddy", "Golden Retriever");

// 原型链查找过程
console.log(buddy.name); // "Buddy" - 自有属性
console.log(buddy.bark()); // "Buddy is barking" - Dog.prototype
console.log(buddy.move()); // "dog is moving" - Animal.prototype
console.log(buddy.toString()); // "[object Object]" - Object.prototype

// 原型链：buddy -> Dog.prototype -> Animal.prototype -> Object.prototype -> null
```

### 原型链的完整图示

```javascript
// 完整的原型链关系
function Parent() {}
const child = new Parent();

console.log("=== 原型链关系 ===");
console.log(child.__proto__ === Parent.prototype); // true
console.log(Parent.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true

console.log("=== 构造函数关系 ===");
console.log(Parent.prototype.constructor === Parent); // true
console.log(child.constructor === Parent); // true (通过原型链)

console.log("=== Function 和 Object 的关系 ===");
console.log(Parent.__proto__ === Function.prototype); // true
console.log(Function.prototype.__proto__ === Object.prototype); // true
console.log(Object.__proto__ === Function.prototype); // true
```

## 2. 继承的多种实现方式 🔄

### 1. 原型链继承

```javascript
// 原型链继承 - 基础版本
function Parent(name) {
  this.name = name;
  this.hobbies = ["reading", "coding"];
}

Parent.prototype.getName = function () {
  return this.name;
};

function Child(age) {
  this.age = age;
}

// 设置原型链
Child.prototype = new Parent("Default");

const child1 = new Child(10);
const child2 = new Child(12);

// 问题1：所有实例共享引用类型属性
child1.hobbies.push("gaming");
console.log(child2.hobbies); // ['reading', 'coding', 'gaming'] - 被意外修改

// 问题2：无法向父构造函数传参
console.log(child1.name); // "Default" - 无法自定义
```

### 2. 借用构造函数继承

```javascript
// 借用构造函数继承
function Parent(name) {
  this.name = name;
  this.hobbies = ["reading", "coding"];
}

Parent.prototype.getName = function () {
  return this.name;
};

function Child(name, age) {
  Parent.call(this, name); // 借用父构造函数
  this.age = age;
}

const child1 = new Child("Alice", 10);
const child2 = new Child("Bob", 12);

// 优点：解决了引用类型共享问题
child1.hobbies.push("gaming");
console.log(child1.hobbies); // ['reading', 'coding', 'gaming']
console.log(child2.hobbies); // ['reading', 'coding'] - 独立

// 缺点：无法继承原型方法
console.log(child1.getName); // undefined - 无法访问原型方法
```

### 3. 组合继承（最常用）

```javascript
// 组合继承 - 结合原型链和构造函数
function Parent(name) {
  this.name = name;
  this.hobbies = ["reading", "coding"];
}

Parent.prototype.getName = function () {
  return this.name;
};

Parent.prototype.getHobbies = function () {
  return this.hobbies.join(", ");
};

function Child(name, age) {
  Parent.call(this, name); // 第一次调用父构造函数
  this.age = age;
}

// 设置原型链
Child.prototype = new Parent(); // 第二次调用父构造函数
Child.prototype.constructor = Child;

Child.prototype.getAge = function () {
  return this.age;
};

const child1 = new Child("Alice", 10);
const child2 = new Child("Bob", 12);

// 优点：解决了前两种方式的问题
console.log(child1.getName()); // "Alice" - 可以传参
console.log(child1.getAge()); // 10 - 子类方法
child1.hobbies.push("gaming");
console.log(child1.hobbies); // ['reading', 'coding', 'gaming']
console.log(child2.hobbies); // ['reading', 'coding'] - 独立

// 缺点：调用了两次父构造函数
```

### 4. 原型式继承

```javascript
// 原型式继承 - Object.create 的模拟实现
function createObject(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}

// 使用 Object.create
const parent = {
  name: "Parent",
  hobbies: ["reading", "coding"],
  getName: function () {
    return this.name;
  },
};

const child1 = Object.create(parent);
child1.name = "Child1";

const child2 = Object.create(parent);
child2.name = "Child2";

console.log(child1.getName()); // "Child1"
console.log(child2.getName()); // "Child2"

// 问题：引用类型仍然共享
child1.hobbies.push("gaming");
console.log(child2.hobbies); // ['reading', 'coding', 'gaming']
```

### 5. 寄生式继承

```javascript
// 寄生式继承 - 在原型式继承基础上增强对象
function createChild(parent) {
  const clone = Object.create(parent); // 原型式继承

  // 增强对象
  clone.getInfo = function () {
    return `Name: ${this.name}, Age: ${this.age}`;
  };

  return clone;
}

const parent = {
  name: "Parent",
  age: 40,
};

const child = createChild(parent);
child.name = "Child";
child.age = 10;

console.log(child.getInfo()); // "Name: Child, Age: 10"
```

### 6. 寄生组合式继承（最优方案）

```javascript
// 寄生组合式继承 - 完美解决方案
function inheritPrototype(child, parent) {
  const prototype = Object.create(parent.prototype); // 创建父类原型的副本
  prototype.constructor = child; // 修正构造函数指向
  child.prototype = prototype; // 赋值给子类原型
}

function Parent(name) {
  this.name = name;
  this.hobbies = ["reading", "coding"];
}

Parent.prototype.getName = function () {
  return this.name;
};

function Child(name, age) {
  Parent.call(this, name); // 只调用一次父构造函数
  this.age = age;
}

// 建立继承关系
inheritPrototype(Child, Parent);

Child.prototype.getAge = function () {
  return this.age;
};

const child1 = new Child("Alice", 10);
const child2 = new Child("Bob", 12);

console.log(child1.getName()); // "Alice"
console.log(child1.getAge()); // 10
console.log(child1 instanceof Child); // true
console.log(child1 instanceof Parent); // true

// 优点：只调用一次父构造函数，性能最优
```

## 3. ES6 类语法 ✨

### 基础类定义

```javascript
// ES6 类语法
class Person {
  // 构造函数
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  // 实例方法
  getName() {
    return this.name;
  }

  getAge() {
    return this.age;
  }

  // 静态方法
  static getSpecies() {
    return "Homo sapiens";
  }

  // getter 和 setter
  get info() {
    return `${this.name} (${this.age} years old)`;
  }

  set age(value) {
    if (value < 0) {
      throw new Error("Age cannot be negative");
    }
    this._age = value;
  }

  get age() {
    return this._age;
  }
}

const person = new Person("Alice", 25);
console.log(person.getName()); // "Alice"
console.log(person.info); // "Alice (25 years old)"
console.log(Person.getSpecies()); // "Homo sapiens"
```

### ES6 类继承

```javascript
// ES6 类继承
class Animal {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }

  move() {
    return `${this.name} is moving`;
  }

  static getKingdom() {
    return "Animalia";
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name, "mammal"); // 调用父类构造函数
    this.breed = breed;
  }

  // 重写父类方法
  move() {
    return `${this.name} is running`;
  }

  // 新增方法
  bark() {
    return `${this.name} says woof!`;
  }

  // 调用父类方法
  walk() {
    return super.move(); // 调用父类的 move 方法
  }
}

const dog = new Dog("Buddy", "Golden Retriever");
console.log(dog.move()); // "Buddy is running" - 重写的方法
console.log(dog.bark()); // "Buddy says woof!" - 新增的方法
console.log(dog.walk()); // "Buddy is moving" - 父类的方法
console.log(Dog.getKingdom()); // "Animalia" - 继承的静态方法
```

### 私有字段和方法（ES2022）

```javascript
// 私有字段和方法
class BankAccount {
  // 私有字段
  #balance = 0;
  #accountNumber;

  constructor(accountNumber, initialBalance = 0) {
    this.#accountNumber = accountNumber;
    this.#balance = initialBalance;
  }

  // 私有方法
  #validateAmount(amount) {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }
  }

  // 公共方法
  deposit(amount) {
    this.#validateAmount(amount);
    this.#balance += amount;
    return this.#balance;
  }

  withdraw(amount) {
    this.#validateAmount(amount);
    if (amount > this.#balance) {
      throw new Error("Insufficient funds");
    }
    this.#balance -= amount;
    return this.#balance;
  }

  getBalance() {
    return this.#balance;
  }

  // 静态私有字段
  static #bankName = "MyBank";

  static getBankName() {
    return this.#bankName;
  }
}

const account = new BankAccount("123456", 1000);
console.log(account.deposit(500)); // 1500
console.log(account.getBalance()); // 1500
// console.log(account.#balance); // SyntaxError: 私有字段不能直接访问
```

### 抽象类和接口模拟

```javascript
// 模拟抽象类
class AbstractShape {
  constructor() {
    if (new.target === AbstractShape) {
      throw new Error("Cannot instantiate abstract class");
    }
  }

  // 抽象方法
  getArea() {
    throw new Error("Abstract method must be implemented");
  }

  // 具体方法
  displayInfo() {
    return `Area: ${this.getArea()}`;
  }
}

class Rectangle extends AbstractShape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  getArea() {
    return this.width * this.height;
  }
}

class Circle extends AbstractShape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  getArea() {
    return Math.PI * this.radius * this.radius;
  }
}

const rectangle = new Rectangle(5, 3);
const circle = new Circle(2);

console.log(rectangle.displayInfo()); // "Area: 15"
console.log(circle.displayInfo()); // "Area: 12.566370614359172"

// const shape = new AbstractShape(); // Error: Cannot instantiate abstract class
```

## 4. 原型链的高级应用 🚀

### 原型链的动态修改

```javascript
// 运行时修改原型链
function Person(name) {
  this.name = name;
}

const person = new Person("Alice");

// 动态添加原型方法
Person.prototype.greet = function () {
  return `Hello, I'm ${this.name}`;
};

console.log(person.greet()); // "Hello, I'm Alice"

// 修改现有实例的原型
const newProto = {
  speak: function () {
    return `${this.name} is speaking`;
  },
};

Object.setPrototypeOf(person, newProto);
console.log(person.speak()); // "Alice is speaking"
console.log(person.greet); // undefined - 原型链已改变
```

### 原型链污染防护

```javascript
// 防止原型链污染
function createSafeObject(proto) {
  const obj = Object.create(proto);

  // 冻结原型链
  let currentProto = obj;
  while (currentProto) {
    Object.freeze(currentProto);
    currentProto = Object.getPrototypeOf(currentProto);
  }

  return obj;
}

// 使用 Object.create(null) 创建无原型对象
const safeMap = Object.create(null);
safeMap.key = "value";
console.log(safeMap.toString); // undefined - 没有原型链
```

### 多重继承的模拟

```javascript
// JavaScript 中模拟多重继承
function mixin(...mixins) {
  return function (target) {
    mixins.forEach((mixin) => {
      Object.getOwnPropertyNames(mixin.prototype).forEach((name) => {
        if (name !== "constructor") {
          target.prototype[name] = mixin.prototype[name];
        }
      });
    });
  };
}

// 定义混入类
class Flyable {
  fly() {
    return `${this.name} is flying`;
  }
}

class Swimmable {
  swim() {
    return `${this.name} is swimming`;
  }
}

class Duck {
  constructor(name) {
    this.name = name;
  }
}

// 应用多重继承
mixin(Flyable, Swimmable)(Duck);

const duck = new Duck("Donald");
console.log(duck.fly()); // "Donald is flying"
console.log(duck.swim()); // "Donald is swimming"
```

## 5. 面试常见问题 💡

### 原型链查找机制

```javascript
// 原型链查找顺序演示
function Parent() {}
Parent.prototype.prop = "parent";

function Child() {}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.prop = "child";

const instance = new Child();
instance.prop = "instance";

console.log(instance.prop); // "instance" - 自有属性
delete instance.prop;
console.log(instance.prop); // "child" - Child.prototype
delete Child.prototype.prop;
console.log(instance.prop); // "parent" - Parent.prototype

// 属性查找顺序：
// 1. 实例自身属性
// 2. 构造函数的原型
// 3. 原型的原型
// 4. 直到 Object.prototype
// 5. 最后是 null
```

### new 操作符的实现

```javascript
// 手写 new 操作符
function myNew(constructor, ...args) {
  // 1. 创建新对象，原型指向构造函数的 prototype
  const obj = Object.create(constructor.prototype);

  // 2. 执行构造函数，绑定 this
  const result = constructor.apply(obj, args);

  // 3. 如果构造函数返回对象，则返回该对象；否则返回新创建的对象
  return result instanceof Object ? result : obj;
}

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function () {
  return `Hello, I'm ${this.name}`;
};

const person1 = new Person("Alice", 25);
const person2 = myNew(Person, "Bob", 30);

console.log(person1.greet()); // "Hello, I'm Alice"
console.log(person2.greet()); // "Hello, I'm Bob"
console.log(person1 instanceof Person); // true
console.log(person2 instanceof Person); // true
```

### instanceof 的实现

```javascript
// 手写 instanceof 操作符
function myInstanceof(obj, constructor) {
  // 基本类型直接返回 false
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  // 获取对象的原型
  let proto = Object.getPrototypeOf(obj);

  // 沿着原型链查找
  while (proto !== null) {
    if (proto === constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

// 测试
function Person() {}
const person = new Person();

console.log(person instanceof Person); // true
console.log(myInstanceof(person, Person)); // true
console.log(person instanceof Object); // true
console.log(myInstanceof(person, Object)); // true
```

### 继承方式对比

```javascript
// 继承方式性能和特性对比
console.log("=== 继承方式对比 ===");

// 1. 原型链继承
function ProtoParent() {
  this.shared = ["a", "b"];
}
function ProtoChild() {}
ProtoChild.prototype = new ProtoParent();

// 2. 构造函数继承
function ConstructorParent() {
  this.shared = ["a", "b"];
}
function ConstructorChild() {
  ConstructorParent.call(this);
}

// 3. 组合继承
function ComboParent() {
  this.shared = ["a", "b"];
}
function ComboChild() {
  ComboParent.call(this);
}
ComboChild.prototype = new ComboParent();

// 4. 寄生组合继承
function ParasiteParent() {
  this.shared = ["a", "b"];
}
function ParasiteChild() {
  ParasiteParent.call(this);
}
ParasiteChild.prototype = Object.create(ParasiteParent.prototype);
ParasiteChild.prototype.constructor = ParasiteChild;

// 5. ES6 类继承
class ES6Parent {
  constructor() {
    this.shared = ["a", "b"];
  }
}
class ES6Child extends ES6Parent {
  constructor() {
    super();
  }
}

// 特性对比表
const comparison = {
  原型链继承: {
    引用类型共享: "是",
    可传参: "否",
    继承原型方法: "是",
    性能: "好",
  },
  构造函数继承: {
    引用类型共享: "否",
    可传参: "是",
    继承原型方法: "否",
    性能: "一般",
  },
  组合继承: {
    引用类型共享: "否",
    可传参: "是",
    继承原型方法: "是",
    性能: "一般（调用两次父构造函数）",
  },
  寄生组合继承: {
    引用类型共享: "否",
    可传参: "是",
    继承原型方法: "是",
    性能: "最优",
  },
  ES6类继承: {
    引用类型共享: "否",
    可传参: "是",
    继承原型方法: "是",
    性能: "最优（语法糖）",
  },
};

console.table(comparison);
```

## 6. 实际应用场景 🎯

### 插件系统设计

```javascript
// 基于原型链的插件系统
class PluginSystem {
  constructor() {
    this.plugins = [];
  }

  use(plugin) {
    if (typeof plugin.install === "function") {
      plugin.install(this);
      this.plugins.push(plugin);
    }
    return this;
  }

  extend(name, method) {
    this.prototype[name] = method;
    return this;
  }
}

// 插件示例
const LoggerPlugin = {
  install(system) {
    system.extend("log", function (message) {
      console.log(`[${new Date().toISOString()}] ${message}`);
    });
  },
};

const ValidatorPlugin = {
  install(system) {
    system.extend("validate", function (data, rules) {
      // 简单验证逻辑
      return Object.keys(rules).every((key) => {
        return rules[key](data[key]);
      });
    });
  },
};

// 使用插件系统
const app = new PluginSystem().use(LoggerPlugin).use(ValidatorPlugin);

// 扩展后可以使用新方法
// app.log('Application started');
// app.validate({name: 'Alice'}, {name: val => val.length > 0});
```

### 工厂模式与原型

```javascript
// 结合工厂模式和原型的对象创建
class ShapeFactory {
  static shapes = {};

  static register(name, shapeClass) {
    this.shapes[name] = shapeClass;
  }

  static create(name, ...args) {
    const ShapeClass = this.shapes[name];
    if (!ShapeClass) {
      throw new Error(`Shape ${name} not found`);
    }
    return new ShapeClass(...args);
  }
}

// 注册形状类
class Circle {
  constructor(radius) {
    this.radius = radius;
  }

  getArea() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  getArea() {
    return this.width * this.height;
  }
}

ShapeFactory.register("circle", Circle);
ShapeFactory.register("rectangle", Rectangle);

// 使用工厂创建对象
const circle = ShapeFactory.create("circle", 5);
const rectangle = ShapeFactory.create("rectangle", 4, 6);

console.log(circle.getArea()); // 78.54
console.log(rectangle.getArea()); // 24
```

## 面试重点总结 🎯

### 必须掌握的核心概念

1. **原型链机制**

   - `prototype` vs `__proto__` 的区别
   - 原型链查找顺序
   - `constructor` 属性的作用

2. **继承实现方式**

   - 6 种继承方式的优缺点
   - 寄生组合继承为什么是最优方案
   - ES6 类继承的本质

3. **关键操作符**
   - `new` 操作符的内部机制
   - `instanceof` 的工作原理
   - `Object.create()` 的作用

### 常考面试题

```javascript
// 1. 输出结果预测
function Foo() {}
Foo.prototype.a = 1;
const f1 = new Foo();
const f2 = new Foo();
f1.a = 2;
console.log(f1.a, f2.a); // 2, 1

// 2. 原型链修改
function Parent() {}
Parent.prototype.value = "parent";
function Child() {}
Child.prototype = new Parent();
const child = new Child();
Parent.prototype.value = "changed";
console.log(child.value); // 'changed'

// 3. 继承实现
// 要求实现一个完整的继承，包含私有属性和原型方法

// 4. 手写 new 操作符
// 要求实现 myNew 函数

// 5. 判断对象类型
// 如何准确判断一个对象是由哪个构造函数创建的
```

### 记忆要点

- **原型链**：对象通过 `__proto__` 连接的查找链
- **继承本质**：复用代码和建立对象间的关系
- **ES6 类**：语法糖，本质仍是原型继承
- **最佳实践**：使用 ES6 类语法或寄生组合继承

掌握原型与继承是深入理解 JavaScript 面向对象编程的关键！
