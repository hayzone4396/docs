---
title: Node.js 模块查找策略详解
description: 深入理解 Node.js 模块解析机制，包括文件查找、文件夹查找、内置模块和第三方模块的完整流程
tags:
  - Node.js
  - Module
  - CommonJS
  - 模块解析
date: 2026-01-23 17:30:00
---

# Node.js 模块查找策略详解

## 模块查找概述

当在 Node.js 中使用 `require()` 加载模块时，Node.js 会按照特定的策略来查找模块。理解这个查找过程对于解决模块引用问题和优化项目结构非常重要。

```javascript
// Node.js 如何找到这些模块？
const fs = require('fs');           // 内置模块
const express = require('express'); // 第三方模块
const utils = require('./utils');   // 本地模块
const config = require('../config'); // 相对路径模块
```

## 模块查找的四大策略

Node.js 的模块查找遵循以下优先级顺序：

```
1. 文件查找
   ↓
2. 文件夹查找
   ↓
3. 内置模块
   ↓
4. 第三方模块（node_modules）
```

**重要规则：**
在策略 3（内置模块）和策略 4（第三方模块）中找到模块后，**再次遵循策略 1（文件查找）和策略 2（文件夹查找）**来加载具体的文件内容。

## 策略 1：文件查找

当 `require()` 的路径指向一个文件时，Node.js 会按照以下顺序尝试：

### 1.1 直接匹配

```javascript
// 如果文件存在且有扩展名，直接加载
require('./utils.js');    // ✅ 直接加载 utils.js
require('./config.json'); // ✅ 直接加载 config.json
```

### 1.2 自动补全扩展名

如果没有扩展名，Node.js 会按顺序尝试添加以下扩展名：

```javascript
require('./utils');

// Node.js 尝试顺序：
// 1. utils.js
// 2. utils.json
// 3. utils.node（C++ 扩展）
```

**扩展名优先级：**
```
.js > .json > .node
```

**示例：**

```javascript
// 项目结构
// ├── utils.js
// ├── utils.json
// └── index.js

// 在 index.js 中
require('./utils');  // 加载 utils.js（优先级最高）

// 如果删除 utils.js，则加载 utils.json
// 如果删除 utils.json，则加载 utils.node
```

### 1.3 支持的文件类型

**1. .js 文件（JavaScript）**

```javascript
// utils.js
module.exports = {
  add(a, b) {
    return a + b;
  }
};

// 使用
const utils = require('./utils');
console.log(utils.add(1, 2)); // 3
```

**2. .json 文件（JSON 数据）**

```json
// config.json
{
  "port": 3000,
  "host": "localhost"
}
```

```javascript
// 使用
const config = require('./config.json');
console.log(config.port); // 3000
```

**3. .node 文件（C++ 扩展）**

```javascript
// 加载 C++ 编译的模块
const addon = require('./addon.node');
```

## 策略 2：文件夹查找

当 `require()` 的路径指向一个文件夹时，Node.js 会按照以下规则查找：

### 2.1 package.json 的 main 字段

首先查找文件夹中的 `package.json`，读取 `main` 字段指定的入口文件。

```javascript
// 项目结构
// my-module/
// ├── package.json
// ├── index.js
// └── lib/
//     └── main.js

// package.json
{
  "name": "my-module",
  "main": "./lib/main.js"
}

// 使用
require('./my-module');  // 加载 my-module/lib/main.js
```

**注意事项：**

```javascript
// ❌ 错误：main 字段必须是相对路径
{
  "main": "lib/main.js"  // 缺少 ./
}

// ✅ 正确
{
  "main": "./lib/main.js"
}

// ✅ 也可以省略扩展名
{
  "main": "./lib/main"  // 会查找 main.js
}
```

### 2.2 默认查找 index.js

如果没有 `package.json` 或 `main` 字段，Node.js 会尝试加载 `index.js`。

```javascript
// 项目结构
// my-module/
// └── index.js

// 使用
require('./my-module');  // 加载 my-module/index.js
```

### 2.3 查找顺序总结

```
文件夹查找顺序：
1. 查找 package.json 的 main 字段
   ├─ 存在 → 加载 main 指定的文件
   └─ 不存在 → 继续
2. 查找 index.js
   ├─ 存在 → 加载 index.js
   └─ 不存在 → 抛出错误
```

**完整示例：**

```javascript
// 项目结构
// my-lib/
// ├── package.json
// ├── index.js
// └── lib/
//     ├── index.js
//     └── main.js

// 场景 1：有 package.json
// package.json: { "main": "./lib/main.js" }
require('./my-lib');  // 加载 lib/main.js

// 场景 2：package.json 的 main 是文件夹
// package.json: { "main": "./lib" }
require('./my-lib');  // 加载 lib/index.js

// 场景 3：没有 package.json
require('./my-lib');  // 加载 index.js
```

## 策略 3：内置模块

Node.js 内置模块具有**最高优先级**，即使存在同名的本地文件或第三方模块，也会优先加载内置模块。

### 3.1 常用内置模块

```javascript
// 核心模块（无需安装）
const fs = require('fs');           // 文件系统
const path = require('path');       // 路径处理
const http = require('http');       // HTTP 服务器
const https = require('https');     // HTTPS 服务器
const crypto = require('crypto');   // 加密
const util = require('util');       // 实用工具
const stream = require('stream');   // 流
const events = require('events');   // 事件
const child_process = require('child_process'); // 子进程
```

### 3.2 内置模块的优先级

```javascript
// 即使创建了 fs.js 文件
// fs.js
module.exports = {
  custom: 'My custom fs'
};

// 使用
const fs = require('fs');  // 仍然加载内置的 fs 模块，而不是 fs.js

// 如果要加载自定义的 fs.js，必须使用相对路径
const myFs = require('./fs.js');
```

### 3.3 查看所有内置模块

```javascript
// 获取所有内置模块列表
console.log(require('module').builtinModules);

// 输出:
// [
//   'fs', 'path', 'http', 'https', 'crypto',
//   'util', 'stream', 'events', ...
// ]
```

## 策略 4：第三方模块（node_modules）

当模块不是内置模块且不以 `./`、`../` 或 `/` 开头时，Node.js 会在 `node_modules` 目录中查找。

### 4.1 查找路径

Node.js 会从当前目录开始，逐级向上查找 `node_modules` 目录，直到文件系统根目录。

```javascript
// 当前文件：/home/user/project/src/utils/helper.js
require('express');

// 查找路径（按顺序）：
// 1. /home/user/project/src/utils/node_modules/express
// 2. /home/user/project/src/node_modules/express
// 3. /home/user/project/node_modules/express
// 4. /home/user/node_modules/express
// 5. /home/node_modules/express
// 6. /node_modules/express
```

### 4.2 查找算法

```javascript
// 伪代码
function findModule(moduleName, currentPath) {
  const paths = [];

  // 从当前路径开始向上查找
  let dir = currentPath;
  while (dir !== '/') {
    paths.push(path.join(dir, 'node_modules', moduleName));
    dir = path.dirname(dir);
  }

  // 依次尝试每个路径
  for (const modulePath of paths) {
    if (exists(modulePath)) {
      return modulePath;
    }
  }

  throw new Error(`Cannot find module '${moduleName}'`);
}
```

### 4.3 实际示例

```javascript
// 项目结构
// /home/user/project/
// ├── node_modules/
// │   ├── express/
// │   │   ├── package.json
// │   │   └── index.js
// │   └── lodash/
// │       ├── package.json
// │       └── lodash.js
// └── src/
//     └── app.js

// 在 app.js 中
require('express');  // 找到 /home/user/project/node_modules/express
require('lodash');   // 找到 /home/user/project/node_modules/lodash
```

### 4.4 嵌套依赖

```javascript
// 项目结构
// project/
// ├── node_modules/
// │   ├── express/
// │   │   ├── node_modules/
// │   │   │   └── body-parser/    ← express 的依赖
// │   │   └── index.js
// │   └── body-parser/            ← 项目的直接依赖
// └── index.js

// 在 project/index.js 中
require('body-parser');  // 加载 project/node_modules/body-parser

// 在 express/index.js 中
require('body-parser');  // 加载 express/node_modules/body-parser
```

## 综合查找流程

### 完整流程图

```
require('moduleName')
    ↓
是否以 ./ ../ / 开头？
    ↓
  是 ─────────→ 文件查找
    |           ├─ 1. 完整文件名
    |           ├─ 2. 补全 .js
    |           ├─ 3. 补全 .json
    |           └─ 4. 补全 .node
    ↓               ↓
  否          找不到 ─→ 文件夹查找
    ↓                    ├─ 1. package.json 的 main
    |                    └─ 2. index.js
是内置模块？              ↓
    ↓                找不到 ─→ 报错
  是 ─────────→ 加载内置模块
    ↓
  否
    ↓
查找 node_modules
    ├─ 当前目录的 node_modules
    ├─ 父目录的 node_modules
    ├─ 祖父目录的 node_modules
    └─ ... 直到根目录
        ↓
    找到模块文件夹
        ↓
   再次执行文件查找和文件夹查找
        ↓
    加载模块
```

### 示例：require('express')

```javascript
// 在 /home/user/project/src/app.js 中
require('express');

// 查找过程：
// 1. 不是相对路径 → 不走文件查找
// 2. 检查是否是内置模块 → 不是
// 3. 在 node_modules 中查找：
//    - /home/user/project/src/node_modules/express ✗
//    - /home/user/project/node_modules/express ✓ 找到！
// 4. 读取 express/package.json 的 main 字段
//    - "main": "index.js"
// 5. 加载 /home/user/project/node_modules/express/index.js
```

### 示例：require('./utils')

```javascript
// 在 /home/user/project/src/app.js 中
require('./utils');

// 查找过程：
// 1. 是相对路径 → 走文件查找
// 2. 尝试文件查找：
//    - /home/user/project/src/utils ✗
//    - /home/user/project/src/utils.js ✓ 找到！
// 3. 加载 utils.js
```

## 模块缓存机制

### 缓存规则

Node.js 会缓存已加载的模块，同一模块第二次 `require` 时直接返回缓存。

```javascript
// utils.js
console.log('模块加载中...');
module.exports = {
  value: Math.random()
};

// app.js
const utils1 = require('./utils');  // 输出: 模块加载中...
const utils2 = require('./utils');  // 无输出（使用缓存）

console.log(utils1 === utils2);  // true（同一个对象）
console.log(utils1.value);       // 例如：0.123456
console.log(utils2.value);       // 0.123456（相同的值）
```

### 查看模块缓存

```javascript
// 查看所有已缓存的模块
console.log(require.cache);

// 输出：
// {
//   '/home/user/project/utils.js': Module { ... },
//   '/home/user/project/node_modules/express/index.js': Module { ... }
// }
```

### 清除缓存

```javascript
// 删除特定模块的缓存
const modulePath = require.resolve('./utils');
delete require.cache[modulePath];

// 再次 require 会重新加载
const utils = require('./utils');  // 重新执行模块代码
```

## require.resolve()

### 查找模块路径

`require.resolve()` 只查找模块路径，不加载模块。

```javascript
// 查找模块的绝对路径
const expressPath = require.resolve('express');
console.log(expressPath);
// /home/user/project/node_modules/express/index.js

const utilsPath = require.resolve('./utils');
console.log(utilsPath);
// /home/user/project/src/utils.js
```

### 查找所有可能的路径

```javascript
// 查看模块查找的所有路径
console.log(require.resolve.paths('express'));

// 输出：
// [
//   '/home/user/project/src/node_modules',
//   '/home/user/project/node_modules',
//   '/home/user/node_modules',
//   '/home/node_modules',
//   '/node_modules'
// ]
```

## ES Modules (ESM) 的查找策略

Node.js 的 ES Modules 查找策略与 CommonJS 类似，但有一些差异。

### 使用 ESM

```json
// package.json
{
  "type": "module"  // 启用 ESM
}
```

```javascript
// 使用 import
import fs from 'fs';
import express from 'express';
import utils from './utils.js';  // ⚠️ 必须包含 .js 扩展名

// 不能省略扩展名
import config from './config';  // ❌ 错误
import config from './config.js';  // ✅ 正确
```

### ESM vs CommonJS 差异

| 特性 | CommonJS | ES Modules |
|------|----------|------------|
| 扩展名 | 可省略 | 必须指定 |
| 文件夹 | 支持 index.js | 需要 package.json exports |
| 动态导入 | 支持 | 使用 import() |
| 缓存 | 基于文件路径 | 基于 URL |

## 最佳实践

### 1. 明确使用相对路径

```javascript
// ✅ 推荐：明确使用相对路径
const utils = require('./utils');

// ❌ 不推荐：依赖 node_modules 查找
const utils = require('utils');  // 可能误导为第三方包
```

### 2. 避免循环依赖

```javascript
// a.js
const b = require('./b');
module.exports = { name: 'A' };

// b.js
const a = require('./a');  // ⚠️ 循环依赖
module.exports = { name: 'B' };

// 此时 a.js 中的 b 可能是空对象或不完整的对象
```

### 3. 使用 package.json 的 main 字段

```json
{
  "main": "./lib/index.js"  // 明确指定入口
}
```

### 4. 合理组织目录结构

```
project/
├── src/
│   ├── utils/
│   │   ├── index.js        ← 统一导出
│   │   ├── string.js
│   │   └── array.js
│   └── app.js
└── package.json
```

```javascript
// utils/index.js
module.exports = {
  ...require('./string'),
  ...require('./array')
};

// app.js
const utils = require('./utils');  // 加载 utils/index.js
```

## 总结

### 查找策略优先级

```
1. 内置模块（最高优先级）
2. 相对/绝对路径模块（文件/文件夹查找）
3. 第三方模块（node_modules）
```

### 文件查找顺序

```
1. 完整文件名
2. 文件名 + .js
3. 文件名 + .json
4. 文件名 + .node
```

### 文件夹查找顺序

```
1. package.json 的 main 字段
2. index.js
```

### node_modules 查找路径

```
从当前目录开始，逐级向上查找，直到根目录
```

理解 Node.js 的模块查找策略，有助于：
- 快速定位模块加载问题
- 优化项目结构
- 避免模块冲突
- 提高开发效率

掌握这些原理，能够更好地使用 Node.js 进行开发。
