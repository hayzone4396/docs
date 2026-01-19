---
title: 地址栏URL，闭包，NEW关键字
date: 2026-01-19 17:46:45
tags:
  - URL
  - 闭包
  - NEW
categories:
  - JavaScript
---

# JavaScript 核心概念

## 一、浏览器输入 URL 后的完整流程

当用户在浏览器地址栏输入 URL 并按下回车后，浏览器会经历以下步骤：

### 1. URL 解析
- 浏览器解析输入的 URL，识别协议（http/https）、域名、端口、路径等信息
- 检查 URL 是否合法

### 2. DNS 域名解析
DNS（Domain Name System）域名系统将域名解析为 IP 地址：

```
www.example.com → 93.184.216.34
```

**解析顺序**：
1. 浏览器 DNS 缓存
2. 操作系统 DNS 缓存
3. 路由器缓存
4. ISP（互联网服务提供商）DNS 服务器
5. 根域名服务器 → 顶级域名服务器 → 权威域名服务器

### 3. 建立 TCP 连接（三次握手）

客户端与服务器建立可靠的 TCP 连接：

```
第一次握手：客户端 → 服务器（SYN）
  "我想和你建立连接"

第二次握手：服务器 → 客户端（SYN + ACK）
  "收到，我也准备好了"

第三次握手：客户端 → 服务器（ACK）
  "好的，开始传输数据"
```

**三次握手的目的**：
- 确认双方的发送和接收能力
- 同步序列号
- 防止已失效的连接请求突然传到服务器

### 4. 发送 HTTP 请求

建立连接后，浏览器向服务器发送 HTTP 请求：

```http
GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0...
Accept: text/html,application/json
Cookie: session_id=abc123
```

**如果是 HTTPS**：
- 需要先进行 TLS/SSL 握手
- 建立加密通道
- 再发送加密的 HTTP 请求

### 5. 服务器处理请求并返回响应

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 1234
Set-Cookie: token=xyz789

<!DOCTYPE html>
<html>
...
</html>
```

### 6. 浏览器解析和渲染页面

#### a. 构建 DOM 树
解析 HTML 文档，构建 DOM（Document Object Model）树

#### b. 构建 CSSOM 树
解析 CSS，构建 CSSOM（CSS Object Model）树

#### c. 构建渲染树（Render Tree）
将 DOM 和 CSSOM 合并，生成渲染树（只包含可见元素）

#### d. 布局（Layout/Reflow）
计算每个节点在视口中的确切位置和大小

#### e. 绘制（Paint）
将渲染树转换为屏幕上的实际像素

#### f. 执行 JavaScript
- 遇到 `<script>` 标签会阻塞 HTML 解析
- 执行 JavaScript 代码
- 可能修改 DOM 和 CSSOM

#### g. 加载其他资源
- 图片、字体、视频等资源异步加载
- 触发重排（Reflow）和重绘（Repaint）

### 7. 断开连接（TCP 四次挥手）

数据传输完成后，客户端或服务器发起断开连接：

```
第一次挥手：客户端 → 服务器（FIN）
  "我的数据发送完了"

第二次挥手：服务器 → 客户端（ACK）
  "好的，我知道了"

第三次挥手：服务器 → 客户端（FIN）
  "我的数据也发送完了"

第四次挥手：客户端 → 服务器（ACK）
  "收到，再见"
```

**为什么是四次？**
- 因为 TCP 是全双工通信
- 每个方向的关闭都需要一次 FIN 和一次 ACK

### 8. 缓存机制

**首次访问后，浏览器会缓存资源**：

#### 强缓存
- `Cache-Control: max-age=3600`
- `Expires: Wed, 21 Oct 2026 07:28:00 GMT`
- 不发送请求，直接使用缓存

#### 协商缓存
- `Last-Modified` / `If-Modified-Since`
- `ETag` / `If-None-Match`
- 发送请求验证资源是否更新，未更新返回 304

### 流程图总结

```
输入 URL
  ↓
URL 解析
  ↓
DNS 解析 → 获取 IP 地址
  ↓
TCP 三次握手 → 建立连接
  ↓
发送 HTTP 请求
  ↓
服务器处理并返回响应
  ↓
浏览器解析渲染页面
  ├─ 构建 DOM 树
  ├─ 构建 CSSOM 树
  ├─ 合并为渲染树
  ├─ 布局计算
  ├─ 绘制页面
  └─ 执行 JavaScript
  ↓
TCP 四次挥手 → 断开连接
  ↓
缓存资源（供下次访问使用）
```

---

## 二、闭包（Closure）

### 什么是闭包？

闭包是指**有权访问另一个函数作用域中变量的函数**。

简单来说：内部函数引用了外部函数的变量，即使外部函数已经执行完毕，这些变量依然被保存在内存中。

### 闭包的基本形式

```javascript
function outer() {
  let count = 0; // 外部函数的变量

  return function inner() { // 内部函数（闭包）
    count++;
    console.log(count);
  };
}

const counter = outer();
counter(); // 1
counter(); // 2
counter(); // 3
```

### 闭包的特点

#### 1. 避免变量被污染（变量私有化）

```javascript
// 不使用闭包 - 全局变量容易被污染
let count = 0;
function increment() {
  count++;
}
count = 100; // 可以被外部随意修改

// 使用闭包 - 变量被保护
function createCounter() {
  let count = 0; // 私有变量
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
// count 无法被外部直接访问和修改
```

#### 2. 变量私有化

```javascript
function createPerson(name) {
  let _name = name; // 私有变量

  return {
    getName: () => _name,
    setName: (newName) => {
      if (newName && newName.length > 0) {
        _name = newName;
      }
    }
  };
}

const person = createPerson('张三');
console.log(person.getName()); // '张三'
person.setName('李四');
console.log(person.getName()); // '李四'
// 无法直接访问 _name
```

#### 3. 保存变量，常驻内存

```javascript
function createCache() {
  const cache = {}; // 常驻内存

  return {
    set(key, value) {
      cache[key] = value;
    },
    get(key) {
      return cache[key];
    },
    clear() {
      Object.keys(cache).forEach(key => delete cache[key]);
    }
  };
}

const myCache = createCache();
myCache.set('user', { name: '王五' });
console.log(myCache.get('user')); // { name: '王五' }
```

#### 4. 返回一个或多个方法

闭包通常返回函数或包含多个方法的对象。

### 闭包的应用场景

#### 1. 防抖（Debounce）

```javascript
function debounce(func, delay) {
  let timer = null; // 闭包保存的变量

  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 使用示例
const handleInput = debounce(() => {
  console.log('搜索请求');
}, 500);

// 用户连续输入，只有停止输入 500ms 后才会执行
input.addEventListener('input', handleInput);
```

#### 2. 节流（Throttle）

```javascript
function throttle(func, delay) {
  let lastTime = 0; // 闭包保存的变量

  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      func.apply(this, args);
    }
  };
}

// 使用示例
const handleScroll = throttle(() => {
  console.log('滚动事件');
}, 200);

window.addEventListener('scroll', handleScroll);
```

#### 3. 库的封装（模块化）

```javascript
const Calculator = (function() {
  // 私有变量和方法
  let result = 0;

  function validate(num) {
    return typeof num === 'number';
  }

  // 公共接口
  return {
    add(num) {
      if (validate(num)) result += num;
      return this;
    },
    subtract(num) {
      if (validate(num)) result -= num;
      return this;
    },
    multiply(num) {
      if (validate(num)) result *= num;
      return this;
    },
    getResult() {
      return result;
    },
    reset() {
      result = 0;
      return this;
    }
  };
})();

Calculator.add(10).multiply(2).subtract(5).getResult(); // 15
```

#### 4. 循环中的闭包问题

```javascript
// ❌ 错误示例 - var 没有块级作用域
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 3, 3, 3
  }, 1000);
}

// ✅ 使用闭包解决
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => {
      console.log(j); // 0, 1, 2
    }, 1000);
  })(i);
}

// ✅ 使用 let（推荐）
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // 0, 1, 2
  }, 1000);
}
```

### 闭包的注意事项

1. **内存泄漏风险**：闭包会使变量常驻内存，如果不再使用应及时解除引用
```javascript
let closure = createClosure();
// 使用完后
closure = null; // 解除引用
```

2. **性能考虑**：闭包会增加内存开销，不要滥用

3. **this 指向问题**：闭包中的 this 可能不是预期的对象
```javascript
const obj = {
  name: '对象',
  getName: function() {
    return function() {
      return this.name; // this 指向 window/global
    };
  }
};

// 解决方案：使用箭头函数或保存 this
const obj2 = {
  name: '对象',
  getName: function() {
    return () => this.name; // 箭头函数继承外层 this
  }
};
```

---

## 三、new 操作符的执行过程

### new 做了什么？

当使用 `new` 关键字调用构造函数时，JavaScript 引擎会执行以下步骤：

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const person = new Person('张三', 25);
```

### 执行步骤详解

#### 1. 创建一个新的空对象

```javascript
let obj = new Object(); // 或 let obj = {};
```

创建一个全新的空对象，作为将要返回的实例对象。

#### 2. 设置原型链

```javascript
obj.__proto__ = Person.prototype;
```

将新对象的 `__proto__` 指向构造函数的 `prototype` 属性，建立原型链。

这样新对象就可以访问构造函数原型上的属性和方法。

#### 3. 改变 this 指向并执行构造函数

```javascript
let result = Person.call(obj, '张三', 25);
```

- 将构造函数的 `this` 指向新创建的对象
- 执行构造函数中的代码
- 给新对象添加属性和方法

#### 4. 判断返回值类型

```javascript
// 如果构造函数返回了一个对象，则返回该对象
// 否则，返回第一步创建的新对象
const instance = (typeof result === 'object' && result !== null) ? result : obj;
```

**返回值规则**：
- 如果构造函数显式返回一个对象，则返回该对象
- 如果返回基本类型或没有返回值，则返回新创建的对象

### 示例演示

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person('李四', 30);

console.log(person.name); // '李四'
console.log(person.age); // 30
person.sayHello(); // "Hello, I'm 李四"
console.log(person.__proto__ === Person.prototype); // true
```

### 手动实现 new 操作符

```javascript
function myNew(constructor, ...args) {
  // 1. 创建一个新对象
  const obj = Object.create(null);

  // 2. 设置原型链
  obj.__proto__ = constructor.prototype;
  // 或使用：Object.setPrototypeOf(obj, constructor.prototype);

  // 3. 改变 this 指向并执行构造函数
  const result = constructor.apply(obj, args);

  // 4. 判断返回值类型
  return (typeof result === 'object' && result !== null) ? result : obj;
}

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const person = myNew(Person, '王五', 28);
console.log(person.name); // '王五'
person.sayHello(); // "Hello, I'm 王五"
```

### 更优雅的实现

```javascript
function myNew(constructor, ...args) {
  // 使用 Object.create 同时完成步骤 1 和 2
  const obj = Object.create(constructor.prototype);

  // 步骤 3：执行构造函数
  const result = constructor.apply(obj, args);

  // 步骤 4：判断返回值
  return result instanceof Object ? result : obj;
}
```

### 构造函数返回值的影响

#### 返回对象

```javascript
function Person(name) {
  this.name = name;
  return { age: 25 }; // 显式返回对象
}

const person = new Person('张三');
console.log(person); // { age: 25 }
console.log(person.name); // undefined
```

#### 返回基本类型

```javascript
function Person(name) {
  this.name = name;
  return '我是字符串'; // 返回基本类型
}

const person = new Person('张三');
console.log(person); // Person { name: '张三' }
console.log(person.name); // '张三'
```

#### 不返回任何值

```javascript
function Person(name) {
  this.name = name;
  // 没有 return 语句
}

const person = new Person('张三');
console.log(person); // Person { name: '张三' }
console.log(person.name); // '张三'
```

### new 与 Object.create 的区别

```javascript
// new 操作符
function Person(name) {
  this.name = name;
}
const person1 = new Person('张三');

// Object.create
const person2 = Object.create(Person.prototype);
Person.call(person2, '李四');

// 两者效果相同
console.log(person1.__proto__ === Person.prototype); // true
console.log(person2.__proto__ === Person.prototype); // true
```

### 注意事项

1. **必须使用 new 调用构造函数**
```javascript
function Person(name) {
  this.name = name;
}

const person1 = new Person('张三'); // ✅ 正确
const person2 = Person('李四'); // ❌ this 指向 window/global
```

2. **使用 ES6 class 自动要求 new**
```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}

const person = new Person('张三'); // ✅ 正确
const person2 = Person('李四'); // ❌ TypeError: Class constructor cannot be invoked without 'new'
```

3. **箭头函数不能作为构造函数**
```javascript
const Person = (name) => {
  this.name = name;
};

const person = new Person('张三'); // ❌ TypeError: Person is not a constructor
```

---

## 总结

这三个概念是 JavaScript 的核心知识点：

1. **浏览器加载流程**：从 DNS 解析到页面渲染的完整过程
2. **闭包**：函数式编程的重要特性，实现数据私有化和模块化
3. **new 操作符**：理解对象创建和原型链的关键

掌握这些概念对深入理解 JavaScript 至关重要。
