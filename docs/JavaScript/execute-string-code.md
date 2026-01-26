---
title: JavaScript 字符串代码执行方法详解
description: 深入理解 eval、setTimeout、script 标签、Function 构造函数四种执行字符串代码的方式及其差异
tags:
  - JavaScript
  - eval
  - Function
  - 代码执行
date: 2026-01-23 17:02:35
---

# JavaScript 字符串代码执行方法详解

## 需求场景

在某些场景下，我们需要动态执行字符串形式的 JavaScript 代码：

- 动态表达式计算
- 插件系统
- 模板引擎
- 在线代码编辑器
- 配置化页面
- DSL（领域特定语言）解析

## 四种执行方式对比

JavaScript 提供了多种方式来执行字符串代码，它们在**执行时机**、**作用域**、**性能**等方面存在显著差异。

### 核心差异一览表

| 方式 | 执行时机 | 作用域 | 访问外部变量 | 产生标签 | 安全性 |
|------|---------|--------|------------|---------|--------|
| eval | 同步 | 局部 | 可以 | 否 | 低 |
| setTimeout | 异步 | 全局 | 不可以 | 否 | 低 |
| script 标签 | 同步 | 全局 | 不可以 | 是 | 低 |
| Function | 同步 | 全局 | 不可以 | 否 | 相对较高 |

## 方法详解

### 方法一：eval（局部作用域，同步）

#### 基本用法

```javascript
const a = 100;

function exec(code) {
  eval(code);
}

exec('console.log("a", a)'); // 报错: a is not defined
```

#### 作用域特性

**eval 在局部作用域执行，无法访问外部变量（严格模式）。**

```javascript
const globalVar = 'global';

function testEval() {
  const localVar = 'local';

  // 严格模式下，eval 有自己的作用域
  'use strict';
  eval('var x = 10');
  console.log(x); // 报错: x is not defined

  // 可以访问当前函数作用域的变量
  eval('console.log(localVar)'); // 'local'
}

testEval();
```

**非严格模式下的差异：**

```javascript
function testNonStrict() {
  var localVar = 'local';

  // 非严格模式下，eval 可以创建局部变量
  eval('var x = 10');
  console.log(x); // 10

  // 也可以访问外部变量
  eval('console.log(localVar)'); // 'local'
}

testNonStrict();
```

#### 直接调用 vs 间接调用

```javascript
const a = 100;

// 直接调用：局部作用域
eval('console.log(a)'); // 100

// 间接调用：全局作用域
const indirectEval = eval;
indirectEval('console.log(a)'); // 报错: a is not defined
```

#### 优缺点

**优点：**
- 可以访问当前作用域的变量
- 执行速度相对较快（相比其他方式）
- 同步执行，便于控制流程

**缺点：**
- 严重的安全隐患（XSS 攻击）
- 破坏作用域链，影响性能优化
- 代码难以调试
- 大多数代码规范禁止使用

### 方法二：setTimeout（全局作用域，异步）

#### 基本用法

```javascript
const a = 100;

function exec(code) {
  setTimeout(code);
}

exec('console.log("a", a)'); // 报错: a is not defined（异步执行时）
```

#### 异步执行特性

```javascript
console.log('1');

setTimeout('console.log("2")'); // 异步执行

console.log('3');

// 输出顺序: 1 -> 3 -> 2
```

#### 全局作用域特性

```javascript
const a = 100;

function test() {
  const b = 200;

  // setTimeout 中的代码在全局作用域执行
  setTimeout(`
    console.log(typeof a); // 'undefined'（全局没有 a）
    console.log(typeof b); // 'undefined'（全局没有 b）
  `);
}

test();

// 如果在全局定义了变量
window.a = 100;
setTimeout('console.log(a)'); // 100
```

#### 延迟执行

```javascript
// 可以指定延迟时间
setTimeout('console.log("延迟 1 秒")', 1000);

// 默认延迟约为 4ms（取决于浏览器）
setTimeout('console.log("最小延迟")');
```

#### 优缺点

**优点：**
- 异步执行，不阻塞主线程
- 可以设置延迟时间

**缺点：**
- 异步执行，无法立即获取结果
- 全局作用域，无法访问局部变量
- 同样存在安全隐患
- 执行时机不确定

### 方法三：script 标签（全局作用域，同步）

#### 基本用法

```javascript
const a = 100;

function exec(code) {
  const script = document.createElement('script');
  script.innerHTML = code;
  document.body.appendChild(script);
}

exec('console.log("a", a)'); // 报错: a is not defined
```

#### 同步执行特性

```javascript
console.log('1');

const script = document.createElement('script');
script.innerHTML = 'console.log("2")';
document.body.appendChild(script); // 同步执行

console.log('3');

// 输出顺序: 1 -> 2 -> 3
```

#### 产生 DOM 标签

```javascript
function exec(code) {
  const script = document.createElement('script');
  script.innerHTML = code;
  document.body.appendChild(script);
}

exec('console.log("Hello")');

// DOM 中会新增一个 <script> 标签
// <body>
//   <script>console.log("Hello")</script>
// </body>
```

**清理 script 标签：**

```javascript
function exec(code) {
  const script = document.createElement('script');
  script.innerHTML = code;
  document.body.appendChild(script);

  // 执行后移除标签
  script.remove();
}

exec('console.log("Hello")');
// script 标签已被移除
```

#### 全局作用域特性

```javascript
const a = 100;

function test() {
  const b = 200;

  const script = document.createElement('script');
  script.innerHTML = `
    console.log(typeof a); // 'undefined'（全局没有 a）
    console.log(typeof b); // 'undefined'（全局没有 b）

    // 可以创建全局变量
    window.globalVar = 'Hello';
  `;
  document.body.appendChild(script);
}

test();
console.log(window.globalVar); // 'Hello'
```

#### 加载外部脚本

```javascript
function loadScript(url) {
  const script = document.createElement('script');
  script.src = url;
  document.body.appendChild(script);

  // 监听加载完成
  script.onload = () => {
    console.log('脚本加载完成');
  };

  script.onerror = () => {
    console.error('脚本加载失败');
  };
}

loadScript('https://cdn.example.com/library.js');
```

#### 优缺点

**优点：**
- 同步执行，流程可控
- 可以加载外部脚本
- 与浏览器原生加载机制一致

**缺点：**
- 会产生额外的 DOM 元素
- 需要手动清理标签
- 全局作用域，无法访问局部变量
- 存在安全隐患（XSS）

### 方法四：Function 构造函数（全局作用域，同步，推荐）

#### 基本用法

```javascript
const a = 100;

function exec(code) {
  new Function(code)();
}

exec('console.log("a", a)'); // 报错: a is not defined
```

#### 同步执行特性

```javascript
console.log('1');

new Function('console.log("2")')(); // 同步执行

console.log('3');

// 输出顺序: 1 -> 2 -> 3
```

#### 全局作用域特性

```javascript
const a = 100;

function test() {
  const b = 200;

  // Function 构造函数中的代码在全局作用域执行
  const fn = new Function(`
    console.log(typeof a); // 'undefined'（全局没有 a）
    console.log(typeof b); // 'undefined'（全局没有 b）
  `);

  fn();
}

test();
```

#### 传递参数

```javascript
// Function 可以接收参数
const add = new Function('a', 'b', 'return a + b');
console.log(add(10, 20)); // 30

// 等价于
function add(a, b) {
  return a + b;
}
```

**动态执行带参数的代码：**

```javascript
function exec(code, params = {}) {
  // 将参数名和值提取
  const paramNames = Object.keys(params);
  const paramValues = Object.values(params);

  // 创建函数
  const fn = new Function(...paramNames, code);

  // 执行函数
  return fn(...paramValues);
}

// 使用
const result = exec('return a + b', { a: 10, b: 20 });
console.log(result); // 30

// 可以访问传入的参数
exec('console.log("Hello", name)', { name: 'Alice' });
// 输出: Hello Alice
```

#### 不产生额外标签

```javascript
function exec(code) {
  new Function(code)();
}

exec('console.log("Hello")');
// 不会在 DOM 中产生任何标签
```

#### 相对安全

```javascript
// Function 构造函数相对 eval 更安全
// 因为它只能访问全局作用域，无法访问局部变量

function dangerous() {
  const secret = 'password123';

  // Function 无法访问 secret
  try {
    new Function('console.log(secret)')();
  } catch (e) {
    console.log('无法访问 secret'); // 执行这里
  }
}

dangerous();
```

#### 优缺点

**优点：**
- 同步执行，流程可控
- 不产生额外的 DOM 元素
- 可以接收参数，灵活性高
- 相对 eval 更安全（无法访问局部作用域）
- 性能较好

**缺点：**
- 全局作用域，无法访问局部变量
- 仍然存在一定安全隐患
- 代码字符串较长时可读性差

## 完整示例对比

```javascript
const a = 100;

function testAll() {
  const b = 200;

  console.log('=== eval ===');
  try {
    eval('console.log("eval:", typeof a, typeof b)');
    // 输出: eval: undefined number
    // 可以访问 b，无法访问 a
  } catch (e) {
    console.error(e.message);
  }

  console.log('=== setTimeout ===');
  setTimeout(() => {
    console.log('setTimeout: 异步执行');
    try {
      eval('console.log(typeof a, typeof b)');
      // 输出: undefined undefined
      // 全局作用域，无法访问 a 和 b
    } catch (e) {
      console.error(e.message);
    }
  }, 0);

  console.log('=== script 标签 ===');
  const script = document.createElement('script');
  script.innerHTML = `
    console.log('script:', typeof a, typeof b);
    // 输出: script: undefined undefined
    // 全局作用域，无法访问 a 和 b
  `;
  document.body.appendChild(script);
  script.remove();

  console.log('=== Function ===');
  try {
    new Function('console.log("Function:", typeof a, typeof b)')();
    // 输出: Function: undefined undefined
    // 全局作用域，无法访问 a 和 b
  } catch (e) {
    console.error(e.message);
  }
}

testAll();
```

## 实际应用场景

### 场景 1：动态表达式计算器

```javascript
class ExpressionCalculator {
  static calculate(expression, variables = {}) {
    try {
      // 使用 Function 构造函数，传入变量
      const paramNames = Object.keys(variables);
      const paramValues = Object.values(variables);

      const fn = new Function(...paramNames, `return ${expression}`);
      return fn(...paramValues);
    } catch (error) {
      console.error('表达式计算错误:', error);
      return null;
    }
  }
}

// 使用
const result1 = ExpressionCalculator.calculate('a + b', { a: 10, b: 20 });
console.log(result1); // 30

const result2 = ExpressionCalculator.calculate('Math.sqrt(x)', { x: 16 });
console.log(result2); // 4

const result3 = ExpressionCalculator.calculate('price * (1 - discount)', {
  price: 100,
  discount: 0.2
});
console.log(result3); // 80
```

### 场景 2：模板引擎

```javascript
class SimpleTemplate {
  static render(template, data) {
    // 将模板中的 {{variable}} 替换为代码
    const code = template.replace(/\{\{(.+?)\}\}/g, (match, expression) => {
      return '${' + expression + '}';
    });

    // 构建函数体
    const functionBody = `return \`${code}\`;`;

    // 创建函数
    const paramNames = Object.keys(data);
    const paramValues = Object.values(data);

    const fn = new Function(...paramNames, functionBody);
    return fn(...paramValues);
  }
}

// 使用
const html = SimpleTemplate.render(
  '<h1>{{title}}</h1><p>{{content}}</p>',
  { title: 'Hello', content: 'World' }
);

console.log(html);
// <h1>Hello</h1><p>World</p>
```

### 场景 3：规则引擎

```javascript
class RuleEngine {
  static evaluate(rule, context) {
    try {
      const paramNames = Object.keys(context);
      const paramValues = Object.values(context);

      const fn = new Function(...paramNames, `return ${rule}`);
      return fn(...paramValues);
    } catch (error) {
      console.error('规则执行错误:', error);
      return false;
    }
  }
}

// 使用
const user = {
  age: 25,
  vipLevel: 3,
  totalSpent: 5000
};

// 检查用户是否符合优惠条件
const eligible1 = RuleEngine.evaluate(
  'age >= 18 && vipLevel >= 2',
  user
);
console.log(eligible1); // true

const eligible2 = RuleEngine.evaluate(
  'vipLevel >= 5 || totalSpent > 10000',
  user
);
console.log(eligible2); // false
```

### 场景 4：动态加载插件

```javascript
class PluginLoader {
  static loadPlugin(pluginCode) {
    return new Promise((resolve, reject) => {
      try {
        // 创建一个沙箱环境
        const sandbox = {
          console,
          setTimeout,
          setInterval
        };

        const paramNames = Object.keys(sandbox);
        const paramValues = Object.values(sandbox);

        // 执行插件代码
        const fn = new Function(...paramNames, pluginCode);
        const plugin = fn(...paramValues);

        resolve(plugin);
      } catch (error) {
        reject(error);
      }
    });
  }
}

// 使用
const pluginCode = `
  return {
    name: 'MyPlugin',
    init() {
      console.log('插件初始化');
    },
    execute(data) {
      console.log('执行插件:', data);
      return data.toUpperCase();
    }
  };
`;

PluginLoader.loadPlugin(pluginCode).then(plugin => {
  plugin.init(); // 插件初始化
  const result = plugin.execute('hello'); // 执行插件: hello
  console.log(result); // HELLO
});
```

## 安全性考虑

### 主要风险

所有动态执行字符串代码的方式都存在严重的安全隐患：

**1. XSS 攻击**

```javascript
// 危险示例：用户输入直接执行
const userInput = '<img src=x onerror=alert("XSS")>';
new Function(userInput)(); // 可能执行恶意代码
```

**2. 代码注入**

```javascript
// 危险示例：拼接用户输入
const username = 'admin"; maliciousCode(); "';
const code = `console.log("${username}")`;
new Function(code)(); // 恶意代码被执行
```

### 安全措施

**1. 输入验证和清理**

```javascript
function sanitizeCode(code) {
  // 移除危险字符和关键字
  const dangerous = ['eval', 'Function', 'setTimeout', 'setInterval'];

  for (const keyword of dangerous) {
    if (code.includes(keyword)) {
      throw new Error(`禁止使用 ${keyword}`);
    }
  }

  return code;
}

function safeExec(code) {
  const sanitized = sanitizeCode(code);
  new Function(sanitized)();
}
```

**2. 白名单机制**

```javascript
class SafeExecutor {
  static allowedFunctions = new Set([
    'Math.sqrt',
    'Math.pow',
    'Math.abs',
    'Number',
    'String'
  ]);

  static execute(expression, variables) {
    // 检查表达式是否只使用允许的函数
    const tokens = expression.match(/\w+(\.\w+)?/g) || [];

    for (const token of tokens) {
      if (token.includes('.') && !this.allowedFunctions.has(token)) {
        throw new Error(`不允许使用: ${token}`);
      }
    }

    // 安全执行
    const fn = new Function(...Object.keys(variables), `return ${expression}`);
    return fn(...Object.values(variables));
  }
}

// 使用
SafeExecutor.execute('Math.sqrt(x)', { x: 16 }); // OK
SafeExecutor.execute('eval("alert(1)")', {}); // Error
```

**3. CSP（内容安全策略）**

```html
<!-- 在 HTML 中设置 CSP -->
<meta
  http-equiv="Content-Security-Policy"
  content="script-src 'self'; object-src 'none'"
>
```

**4. 使用沙箱环境**

```javascript
class Sandbox {
  static execute(code, context = {}) {
    // 创建受限的全局对象
    const sandbox = {
      console: {
        log: (...args) => console.log('[Sandbox]', ...args)
      },
      Math,
      Date,
      Array,
      Object,
      ...context
    };

    // 使用 with 语句限制作用域（注意：with 在严格模式下不可用）
    const fn = new Function(
      'sandbox',
      `with(sandbox) { ${code} }`
    );

    return fn(sandbox);
  }
}

// 使用
Sandbox.execute('console.log(Math.sqrt(16))');
// [Sandbox] 4
```

## 性能对比

```javascript
// 性能测试
function performanceTest() {
  const iterations = 10000;
  const code = 'let x = 1 + 1';

  // eval
  console.time('eval');
  for (let i = 0; i < iterations; i++) {
    eval(code);
  }
  console.timeEnd('eval');

  // Function
  console.time('Function');
  for (let i = 0; i < iterations; i++) {
    new Function(code)();
  }
  console.timeEnd('Function');

  // setTimeout（异步，不适合这种测试）
  console.time('setTimeout');
  let count = 0;
  for (let i = 0; i < iterations; i++) {
    setTimeout(() => {
      eval(code);
      count++;
      if (count === iterations) {
        console.timeEnd('setTimeout');
      }
    });
  }

  // script 标签
  console.time('script');
  for (let i = 0; i < iterations; i++) {
    const script = document.createElement('script');
    script.innerHTML = code;
    document.body.appendChild(script);
    script.remove();
  }
  console.timeEnd('script');
}

performanceTest();

// 结果（大致）:
// eval: ~10ms
// Function: ~15ms
// script: ~500ms（最慢，涉及 DOM 操作）
// setTimeout: 异步执行，不具可比性
```

## 最佳实践建议

### 1. 优先级选择

```
1. 避免使用（最优）
   ↓
2. 使用 Function 构造函数（次选）
   ↓
3. 使用 eval（谨慎）
   ↓
4. 使用 setTimeout/script（不推荐）
```

### 2. 使用场景建议

| 场景 | 推荐方案 |
|------|---------|
| 表达式计算 | Function 构造函数 + 参数传递 |
| 模板引擎 | 专业库（如 Handlebars）|
| 插件系统 | 独立脚本 + postMessage |
| 配置化 | JSON 配置 + 映射表 |
| 在线编辑器 | iframe 沙箱 |

### 3. 安全检查清单

- [ ] 永远不要执行未经验证的用户输入
- [ ] 使用白名单机制限制可用功能
- [ ] 实施 CSP 策略
- [ ] 使用沙箱环境隔离
- [ ] 记录和监控代码执行
- [ ] 定期安全审计

## 总结

### 关键要点

1. **eval**：局部作用域，同步，性能好，但安全性最差
2. **setTimeout**：全局作用域，异步，适合延迟执行
3. **script 标签**：全局作用域，同步，会产生 DOM 元素
4. **Function**：全局作用域，同步，不产生标签，推荐使用

### 推荐使用

**生产环境推荐：**
- 尽量避免动态执行字符串代码
- 必须使用时选择 Function 构造函数
- 实施严格的安全措施

**替代方案：**
- 使用配置映射表代替动态代码
- 使用专业库（模板引擎、规则引擎）
- 使用 Web Worker 隔离不受信任的代码

动态执行代码是一把双刃剑，应该谨慎使用，优先考虑更安全的替代方案。
