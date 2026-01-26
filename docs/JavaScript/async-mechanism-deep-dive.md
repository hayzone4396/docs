---
title: JavaScript 异步机制深度解析
description: 深入理解 JavaScript 单线程模型、事件循环机制、计时器原理及常见问题解析
tags:
  - JavaScript
  - 异步编程
  - 事件循环
  - Event Loop
date: 2026-01-23 16:15:00
---

# JavaScript 异步机制深度解析

## JavaScript 为什么是单线程？

### 单线程的本质原因

JavaScript 是一门单线程的语言，这是因为它运行在**浏览器的渲染主线程**中，而渲染主线程只有一个。

这个设计并非偶然，而是由 JavaScript 的设计目的决定的。作为浏览器脚本语言，JavaScript 的主要用途是操作 DOM，进行页面交互。试想一下，如果 JavaScript 是多线程的：

- 线程 A 正在删除某个 DOM 节点
- 线程 B 同时在修改这个节点的样式
- 这会导致严重的同步问题和不可预测的结果

为了避免这种复杂的线程同步问题，JavaScript 从诞生之日起就被设计为单线程语言。

### 渲染主线程的职责

渲染主线程承担着诸多重要工作，这些工作都在同一个线程中执行：

**主要职责：**
1. **解析 HTML**：构建 DOM 树
2. **解析 CSS**：构建 CSSOM 树
3. **执行 JavaScript**：运行脚本代码
4. **样式计算**：计算元素的最终样式
5. **布局（Layout）**：计算元素的位置和尺寸
6. **绘制（Paint）**：将元素绘制到屏幕
7. **处理用户交互**：响应点击、滚动等事件

所有这些任务都在一个线程中按顺序执行，如果某个任务耗时过长，就会阻塞后续任务。

## 同步模式的问题

如果 JavaScript 使用同步的方式执行所有任务，会带来严重的问题：

### 1. 主线程阻塞

```javascript
// 假设这是一个耗时的同步操作
function longRunningTask() {
  let result = 0;
  for (let i = 0; i < 1000000000; i++) {
    result += i;
  }
  return result;
}

// 执行这个任务时，页面会卡死
const result = longRunningTask();
console.log('任务完成'); // 只有等上面执行完才能输出
```

在这个例子中，主线程被完全占用，期间：
- 页面无法响应用户的任何操作
- 动画停止
- 界面完全卡死
- 给用户造成浏览器崩溃的假象

### 2. 资源浪费

当主线程在等待网络请求或计时器时：
- 主线程处于空闲状态，无法执行其他任务
- 消息队列中的任务无法得到执行
- 宝贵的 CPU 时间被浪费

### 3. 用户体验极差

```javascript
// 同步方式发送网络请求（假设）
const data = fetchDataSync('https://api.example.com/data');
console.log(data);

// 在等待网络响应期间（可能需要几秒钟）：
// - 页面完全冻结
// - 用户无法点击按钮
// - 无法滚动页面
// - 浏览器显示"页面未响应"
```

一方面会导致繁忙的主线程白白消耗时间，另一方面导致页面无法及时更新，给用户造成卡死现象。

## 异步模式的解决方案

为了解决同步模式的问题，浏览器采用**异步**的方式来避免主线程阻塞。

### 异步的工作机制

具体做法是：当某些任务发生时，主线程采用不同的处理策略。

**常见的异步任务类型：**
- **计时器**（setTimeout、setInterval）
- **网络请求**（fetch、XMLHttpRequest）
- **事件监听**（click、scroll 等）
- **I/O 操作**（文件读写，仅 Node.js）
- **Promise**
- **MutationObserver**

**处理流程：**

```
1. 主线程接收到异步任务
   ↓
2. 主线程将任务交给其他线程（如定时器线程、网络线程）
   ↓
3. 主线程立即结束该任务的执行
   ↓
4. 主线程转而执行后续代码
   ↓
5. 其他线程完成任务后，将回调函数包装成任务
   ↓
6. 将任务加入到消息队列的末尾排队
   ↓
7. 等待主线程调度执行
```

### 浏览器的多线程架构

虽然 JavaScript 是单线程的，但浏览器本身是多线程的：

**浏览器的主要线程：**

1. **渲染主线程（JS 引擎线程）**
   - 执行 JavaScript 代码
   - 负责页面渲染
   - 唯一，单线程

2. **定时器触发线程**
   - 管理 setTimeout 和 setInterval
   - 时间到了将回调加入任务队列

3. **HTTP 网络请求线程**
   - 处理网络请求
   - 请求完成后将回调加入任务队列

4. **事件触发线程**
   - 管理事件队列
   - 当事件被触发时，将回调加入任务队列

5. **GUI 渲染线程**
   - 负责渲染页面
   - 与 JS 引擎线程互斥（不能同时执行）

### 异步示例

```javascript
console.log('开始');

// 将计时任务交给定时器线程
setTimeout(() => {
  console.log('定时器回调执行');
}, 1000);

// 将网络请求交给网络线程
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => {
    console.log('网络请求完成', data);
  });

console.log('结束');

// 输出顺序：
// 开始
// 结束
// 定时器回调执行（1秒后）
// 网络请求完成（取决于网络速度）
```

### 异步模式的优势

在这种异步模式下：
- **浏览器永不阻塞**：主线程始终可以执行其他任务
- **流畅的用户体验**：页面保持响应，动画流畅
- **高效的资源利用**：主线程不会空闲等待
- **最大限度保证单线程流畅运行**

## 事件循环（Event Loop）详解

### 什么是事件循环

事件循环又叫**消息循环**，是浏览器渲染主线程的工作方式。

在 Chrome 的源码中，它开启一个不会结束的 for 循环，每次循环从消息队列中取出第一个任务执行，而其他线程只需要在合适的时候将任务加入到队列的末尾即可。

### 事件循环的伪代码

```javascript
// 简化的事件循环实现
while (true) {
  // 1. 从任务队列中取出一个任务
  const task = taskQueue.shift();

  // 2. 执行任务
  if (task) {
    task.execute();
  }

  // 3. 执行所有微任务
  while (microTaskQueue.length > 0) {
    const microTask = microTaskQueue.shift();
    microTask.execute();
  }

  // 4. 检查是否需要渲染
  if (shouldRender()) {
    render();
  }
}
```

### 宏任务与微任务（过时的分类）

过去，我们把消息队列简单分为**宏队列**和**微队列**：

**宏任务（Macro Task）：**
- script（整体代码）
- setTimeout
- setInterval
- I/O
- UI 渲染
- setImmediate（Node.js）

**微任务（Micro Task）：**
- Promise.then/catch/finally
- MutationObserver
- process.nextTick（Node.js）
- queueMicrotask

**传统理解（简化版）：**
```javascript
console.log('1'); // 同步任务

setTimeout(() => {
  console.log('2'); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // 微任务
});

console.log('4'); // 同步任务

// 输出：1 -> 4 -> 3 -> 2
```

### 现代任务队列模型

这种宏任务/微任务的简单分类目前**已无法满足复杂的浏览器环境**，取而代之的是一种**更加灵活多变的处理方式**。

根据 **W3C 官方的解释**：

**核心原则：**

1. **每个任务有不同的类型**
   - 定时器任务
   - 网络请求任务
   - 用户交互任务
   - 渲染任务
   - 等等...

2. **同类型任务必须在同一队列**
   - 所有定时器回调在定时器队列
   - 所有网络回调在网络队列
   - 保证同类任务的执行顺序

3. **不同任务可以属于不同队列**
   - 浏览器维护多个任务队列
   - 每个队列有自己的特点

4. **不同任务队列有不同优先级**
   - 用户交互 > 网络请求 > 定时器
   - 浏览器根据优先级决定执行顺序

5. **在一次事件循环中，由浏览器自行决定取哪个队列的任务**
   - 浏览器有调度算法
   - 优先执行重要任务
   - 防止某个队列"饿死"

6. **浏览器必须有一个微队列**
   - 微队列任务一定具有最高优先级
   - 必须优先调度执行
   - 在每个宏任务执行完后，立即清空所有微任务

### 完整的事件循环流程

```
开始新的事件循环
  ↓
从任务队列中选择一个任务（宏任务）
  ↓
执行该任务
  ↓
任务执行完成
  ↓
检查微任务队列
  ↓
执行所有微任务（直到队列清空）
  ↓
检查是否需要渲染页面
  ↓
如果需要，执行渲染
  ↓
回到循环开始，继续下一个宏任务
```

### 实战示例：复杂的执行顺序

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => {
    console.log('3');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4');
  setTimeout(() => {
    console.log('5');
  }, 0);
});

Promise.resolve().then(() => {
  console.log('6');
});

console.log('7');

// 输出顺序：1 -> 7 -> 4 -> 6 -> 2 -> 3 -> 5
```

**执行分析：**

1. **同步代码**：输出 `1` 和 `7`
2. **第一轮微任务**：输出 `4` 和 `6`（Promise 回调）
3. **第二轮宏任务**：输出 `2`（setTimeout 回调）
4. **第三轮微任务**：输出 `3`（setTimeout 内的 Promise）
5. **第四轮宏任务**：输出 `5`（Promise 回调中的 setTimeout）

## 计时器的精确性问题

### JS 中的计时器能做到精确计时吗？

**答案：不能。**

计时器（setTimeout、setInterval）无法做到精确计时，主要有以下四个原因：

### 1. 硬件层面的限制

**计算机硬件没有原子钟，无法做到精确计时。**

- 普通计算机的时钟精度有限
- 受温度、电压等环境因素影响
- 存在固有的硬件误差
- 原子钟成本极高，不可能在个人计算机中使用

### 2. 操作系统的计时偏差

**操作系统的计时函数本身就有少量偏差，由于 JS 的计时器最终调用的是操作系统的函数，也就携带了这些偏差。**

不同操作系统的计时精度：
- **Windows**：约 15.6ms 的精度
- **macOS/Linux**：约 1ms 的精度
- 系统负载会影响计时精度

```javascript
// 即使设置 1ms，实际执行时间也会有偏差
let start = Date.now();
setTimeout(() => {
  let end = Date.now();
  console.log(`期望 1ms，实际 ${end - start}ms`);
}, 1);
// 可能输出：期望 1ms，实际 2ms（或更多）
```

### 3. 浏览器的最小延迟限制

**按照 W3C 的标准，浏览器实现计时器时，如果嵌套层级超过 5 层，则会带有 4 毫秒的最少时间。**

```javascript
// 嵌套层级超过 5 层，最小延迟变为 4ms
function nested(level) {
  console.log(`第 ${level} 层`);
  if (level < 10) {
    setTimeout(() => nested(level + 1), 0);
  }
}

nested(1);

// 前 5 层可能接近 0ms
// 第 6 层开始，每层至少 4ms
```

**原因：**
- 防止恶意脚本占用过多 CPU
- 避免页面卡死
- 浏览器安全机制

**规范说明：**
- 嵌套层级 < 5：延迟可以小于 4ms
- 嵌套层级 ≥ 5：延迟至少 4ms
- 这是强制性的限制

### 4. 事件循环的影响

**受事件循环的影响，计时器的回调函数只能在主线程空闲时运行，因此又带来了偏差。**

```javascript
console.log('开始');

setTimeout(() => {
  console.log('定时器回调');
}, 100);

// 模拟耗时操作，阻塞主线程
let start = Date.now();
while (Date.now() - start < 200) {
  // 阻塞 200ms
}

console.log('结束');

// 定时器设置 100ms，但实际要等主线程空闲（200ms 后）才执行
```

**执行流程：**
1. 启动定时器（100ms 后触发）
2. 100ms 到了，将回调加入任务队列
3. 但此时主线程正在执行同步代码（while 循环）
4. 主线程被阻塞，无法执行回调
5. 直到主线程空闲（200ms 后），才执行回调
6. **实际延迟超过了设定时间**

### 计时器延迟的综合示例

```javascript
// 测试计时器的实际精度
function testTimerAccuracy() {
  const delays = [0, 1, 4, 10, 100];

  delays.forEach(delay => {
    const start = performance.now();

    setTimeout(() => {
      const actual = performance.now() - start;
      const error = actual - delay;
      console.log(`设定 ${delay}ms，实际 ${actual.toFixed(2)}ms，误差 ${error.toFixed(2)}ms`);
    }, delay);
  });
}

testTimerAccuracy();

// 可能的输出：
// 设定 0ms，实际 1.20ms，误差 1.20ms
// 设定 1ms，实际 2.10ms，误差 1.10ms
// 设定 4ms，实际 5.50ms，误差 1.50ms
// 设定 10ms，实际 11.30ms，误差 1.30ms
// 设定 100ms，实际 101.80ms，误差 1.80ms
```

### 如何处理计时不准确的问题

**1. 使用 requestAnimationFrame（动画场景）**

```javascript
// 更适合动画，与浏览器刷新率同步（通常 16.67ms）
function animate() {
  // 动画逻辑
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

**2. 自校正的计时器**

```javascript
function accurateInterval(callback, interval) {
  let expected = Date.now() + interval;

  function step() {
    const drift = Date.now() - expected;
    callback();
    expected += interval;
    setTimeout(step, Math.max(0, interval - drift));
  }

  setTimeout(step, interval);
}

// 使用
accurateInterval(() => {
  console.log('每秒执行一次');
}, 1000);
```

**3. Web Workers（高精度场景）**

```javascript
// 在 Worker 中执行计时，不受主线程阻塞影响
const worker = new Worker('timer-worker.js');
worker.postMessage({ interval: 1000 });
worker.onmessage = (e) => {
  console.log('Worker 计时器触发', e.data);
};
```

## Class 转 Function 原理

ES6 的 Class 本质上是语法糖，最终会被转换为 ES5 的构造函数形式。理解这个转换过程有助于深入理解类的工作机制。

### Class 示例

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }

  static create(name) {
    return new Person(name);
  }
}

const person = new Person('Alice');
person.sayHello();
```

### 转换为 Function 的关键步骤

#### 1. 添加严格模式

Class 内部默认使用严格模式（'use strict'），转换后的函数也需要添加。

```javascript
function Person(name) {
  'use strict'; // 严格模式

  this.name = name;
}
```

**严格模式的影响：**
- 禁止 `this` 指向全局对象
- 禁止删除不可删除的属性
- 禁止重复参数名
- 等等...

#### 2. new.target 检查

Class 必须通过 `new` 调用，不能作为普通函数调用。转换后需要检查 `new.target`。

```javascript
function Person(name) {
  'use strict';

  // new.target 在 new 调用时指向构造函数，否则为 undefined
  if (new.target === undefined) {
    throw new TypeError('Class constructor Person cannot be invoked without "new"');
  }

  this.name = name;
}

// 错误用法：
// Person('Alice'); // TypeError
```

**new.target 说明：**
- `new.target` 是 ES6 新增的元属性
- 在通过 `new` 调用时，`new.target` 指向被调用的构造函数
- 在普通函数调用时，`new.target` 为 `undefined`
- 可以用来判断函数是否通过 `new` 调用

#### 3. 通过 Object.defineProperty 劫持原型方法

Class 的方法具有特殊属性，需要通过 `Object.defineProperty` 设置。

```javascript
// 实例方法
Object.defineProperty(Person.prototype, 'sayHello', {
  value: function sayHello() {
    'use strict';

    // 防止方法被当作构造函数调用
    if (new.target !== undefined) {
      throw new TypeError('sayHello is not a constructor');
    }

    console.log(`Hello, I'm ${this.name}`);
  },
  enumerable: false,    // 不可枚举（for...in 遍历不到）
  writable: true,       // 可写
  configurable: true    // 可配置
});
```

**关键特性：**

**a. 不可枚举（enumerable: false）**

```javascript
// Class 的方法不会出现在 for...in 中
for (let key in person) {
  console.log(key); // 只输出 'name'，不输出 'sayHello'
}

// 也不会出现在 Object.keys 中
console.log(Object.keys(person)); // ['name']
```

**b. 不能被 new 调用**

```javascript
// Class 的方法不能作为构造函数
// new person.sayHello(); // TypeError: sayHello is not a constructor
```

在方法内部通过检查 `new.target` 实现：

```javascript
value: function sayHello() {
  if (new.target !== undefined) {
    throw new TypeError('sayHello is not a constructor');
  }
  // 方法逻辑...
}
```

#### 4. 静态方法

静态方法直接添加到构造函数上，而不是原型。

```javascript
Object.defineProperty(Person, 'create', {
  value: function create(name) {
    'use strict';

    if (new.target !== undefined) {
      throw new TypeError('create is not a constructor');
    }

    return new Person(name);
  },
  enumerable: false,
  writable: true,
  configurable: true
});
```

### 完整的转换示例

```javascript
// ES6 Class
class Person {
  constructor(name) {
    this.name = name;
  }

  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }

  static create(name) {
    return new Person(name);
  }
}

// 转换为 ES5（完整版）
function Person(name) {
  'use strict';

  // 检查是否通过 new 调用
  if (new.target === undefined) {
    throw new TypeError('Class constructor Person cannot be invoked without "new"');
  }

  this.name = name;
}

// 实例方法
Object.defineProperty(Person.prototype, 'sayHello', {
  value: function sayHello() {
    'use strict';

    // 不能作为构造函数
    if (new.target !== undefined) {
      throw new TypeError('sayHello is not a constructor');
    }

    console.log(`Hello, I'm ${this.name}`);
  },
  enumerable: false,
  writable: true,
  configurable: true
});

// 静态方法
Object.defineProperty(Person, 'create', {
  value: function create(name) {
    'use strict';

    if (new.target !== undefined) {
      throw new TypeError('create is not a constructor');
    }

    return new Person(name);
  },
  enumerable: false,
  writable: true,
  configurable: true
});
```

### 转换要点总结

| 特性 | Class | 转换后的 Function |
|------|-------|------------------|
| 严格模式 | 默认开启 | 手动添加 'use strict' |
| new 调用 | 必须 | 通过 new.target 检查 |
| 方法枚举 | 不可枚举 | enumerable: false |
| 方法可调用 | 不能 new | 检查 new.target |
| 原型方法 | 自动添加 | Object.defineProperty |
| 静态方法 | static | 添加到构造函数 |

## 浮点数精度问题

### 0.1 + 0.2 为什么不等于 0.3？

```javascript
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false
```

这是 JavaScript 中最著名的"怪异"现象之一，但实际上这不是 JavaScript 的问题，而是计算机底层存储机制导致的。

### 原因分析

**计算机存储是二进制的，二进制精度没有那么精确，在最后折算的时候会做取舍，所以导致了这个问题。**

#### 1. 计算机使用二进制存储数字

计算机内部所有数字都以二进制形式存储。十进制的小数转换为二进制时，可能会出现无限循环：

**十进制转二进制示例：**

```
0.1（十进制）→ 0.0001100110011001100110011001...（二进制，无限循环）
0.2（十进制）→ 0.0011001100110011001100110011...（二进制，无限循环）
```

就像十进制中 `1/3 = 0.33333...` 无限循环一样，二进制中很多十进制小数也无法精确表示。

#### 2. IEEE 754 双精度浮点数标准

JavaScript 使用 IEEE 754 双精度浮点数（64 位）存储数字：

```
符号位（1位） + 指数位（11位） + 尾数位（52位）
```

由于只有 52 位尾数，无限循环的二进制小数必须被截断，导致精度损失。

#### 3. 计算过程的误差累积

```
0.1（存储时已有误差）
+
0.2（存储时已有误差）
=
0.30000000000000004（误差累积）
```

**详细过程：**

```javascript
// 0.1 在内存中的实际值
0.1000000000000000055511151231257827021181583404541015625

// 0.2 在内存中的实际值
0.200000000000000011102230246251565404236316680908203125

// 相加后的实际值
0.3000000000000000444089209850062616169452667236328125

// 显示为
0.30000000000000004
```

### 解决方案

#### 方案 1：转换为整数计算

将小数转换为整数进行计算，最后再转换回小数。

```javascript
function add(a, b) {
  // 获取小数位数
  const maxDecimalLength = Math.max(
    getDecimalLength(a),
    getDecimalLength(b)
  );

  // 转换为整数
  const multiplier = Math.pow(10, maxDecimalLength);
  const result = (a * multiplier + b * multiplier) / multiplier;

  return result;
}

function getDecimalLength(num) {
  const str = num.toString();
  const index = str.indexOf('.');
  return index === -1 ? 0 : str.length - index - 1;
}

console.log(add(0.1, 0.2)); // 0.3
```

#### 方案 2：字符串形式计算

写成字符串的形式，然后循环相加计算。

```javascript
function addStrings(num1, num2) {
  // 分离整数和小数部分
  const [int1, dec1 = ''] = num1.toString().split('.');
  const [int2, dec2 = ''] = num2.toString().split('.');

  // 补齐小数位
  const maxDecLen = Math.max(dec1.length, dec2.length);
  const decimal1 = dec1.padEnd(maxDecLen, '0');
  const decimal2 = dec2.padEnd(maxDecLen, '0');

  // 转换为整数字符串
  const str1 = int1 + decimal1;
  const str2 = int2 + decimal2;

  // 从后向前逐位相加
  let carry = 0;
  let result = '';
  const len = Math.max(str1.length, str2.length);

  for (let i = 0; i < len; i++) {
    const digit1 = parseInt(str1[str1.length - 1 - i] || '0');
    const digit2 = parseInt(str2[str2.length - 1 - i] || '0');
    const sum = digit1 + digit2 + carry;

    result = (sum % 10) + result;
    carry = Math.floor(sum / 10);
  }

  if (carry > 0) {
    result = carry + result;
  }

  // 插入小数点
  if (maxDecLen > 0) {
    result = result.slice(0, -maxDecLen) + '.' + result.slice(-maxDecLen);
  }

  return parseFloat(result);
}

console.log(addStrings(0.1, 0.2)); // 0.3
```

#### 方案 3：使用第三方库

利用专门的库处理精度问题，如 **Decimal.js**、**Big.js**、**bignumber.js** 等。

**Decimal.js 示例：**

```javascript
// 引入库
import Decimal from 'decimal.js';

// 基本运算
const a = new Decimal(0.1);
const b = new Decimal(0.2);
const result = a.plus(b);

console.log(result.toString()); // '0.3'
console.log(result.toNumber()); // 0.3

// 链式调用
const complex = new Decimal(0.1)
  .plus(0.2)
  .times(10)
  .dividedBy(3);

console.log(complex.toString()); // '1'

// 高精度计算
Decimal.set({ precision: 50 }); // 设置 50 位精度
const precise = new Decimal('0.1').plus('0.2');
console.log(precise.toString()); // '0.3'
```

**内部原理：**
- 使用字符串存储数字
- 实现了完整的四则运算算法
- 支持任意精度
- 避免了二进制转换的精度损失

#### 方案 4：设置精度阈值

对于显示场景，可以使用 `toFixed()` 或 `toPrecision()`：

```javascript
const result = 0.1 + 0.2;
console.log(result.toFixed(1)); // '0.3'
console.log(result.toPrecision(1)); // '0.3'

// 或者判断误差是否在可接受范围内
function isEqual(a, b, epsilon = 0.0001) {
  return Math.abs(a - b) < epsilon;
}

console.log(isEqual(0.1 + 0.2, 0.3)); // true
```

### 精度问题的最佳实践

**1. 金融计算**
- 使用整数（以分为单位，而不是元）
- 或使用 Decimal.js 等库

**2. 浮点数比较**
- 不要直接用 `===` 比较
- 使用误差范围判断

**3. 显示格式化**
- 使用 `toFixed()` 控制小数位
- 四舍五入到合适精度

**4. 避免累积误差**
- 减少运算次数
- 先计算再显示

## 总结

### 核心要点回顾

**1. JavaScript 单线程**
- 运行在浏览器渲染主线程
- 避免 DOM 操作的同步问题
- 采用异步机制防止阻塞

**2. 异步机制**
- 将耗时任务交给其他线程
- 完成后通过消息队列通知主线程
- 保证主线程永不阻塞

**3. 事件循环**
- 浏览器渲染主线程的工作方式
- 从任务队列中循环取任务执行
- 微任务优先级最高

**4. 计时器不精确**
- 硬件限制
- 操作系统偏差
- 浏览器最小延迟（嵌套 5 层 → 4ms）
- 事件循环影响

**5. Class 转 Function**
- 添加严格模式
- new.target 检查
- 方法不可枚举
- 方法不能被 new

**6. 浮点数精度**
- 二进制存储导致
- 使用整数或字符串计算
- 推荐使用 Decimal.js
- 比较时使用误差范围

理解这些底层机制，能够帮助我们写出更高质量、更高性能的 JavaScript 代码。
