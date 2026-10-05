---
title: Node.js Runtime 基础与常用模块精析
date: 2026-10-05 13:07:00
tags:
  - Node.js
  - 核心模块
  - 进程
categories:
  - Node.js
---

# Node.js Runtime 基础与常用模块精析

## 课程目标

> 💡 **提示**
> - 初中级：
>
>   1. **掌握 Node 项目初始化与调试：** 学习如何初始化一个 Node 项目，并掌握常用的调试工具与方法，理解 Node 项目的结构和运行原理，能够高效启动与调试 Node 应用。
>   2. **掌握 Node 包管理与模块化细节：** 深入理解 `package.json` 文件的配置细节，掌握依赖管理、版本控制、脚本执行等内容，了解常见的模块化规范与约定，如 CommonJS、ESM 等，提升项目的模块化与可维护性。
>   3. **掌握 Node 核心模块：** 熟练掌握 Node.js 中最常用的核心模块，包括 `fs`（文件系统）、`path`（路径处理）、`os`（操作系统信息）、`process`（进程管理）、`child_process`（子进程管理）等，能够有效利用这些模块进行开发。
>   4. **了解 Node promisify：** 了解如何将传统的回调函数转化为 Promise 形式，熟悉 `node:fs/promises` 和 `util.promisify` 的使用方法，掌握如何在 Node 中更高效地处理异步操作与链式调用。
> - 高级：
>
>   1. **掌握多版本 Node 环境管理：** 学习如何使用 Volta/nvm/n 等工具高效管理多个 Node.js 版本，确保在不同的开发与生产环境中，能灵活切换 Node 版本，确保版本一致性与兼容性。
>   2. **掌握 TypeScript 支持：** 掌握基于 TypeScript 的工程化设计，能够在 Node 项目中使用 TypeScript 编写代码、进行编译、调试与执行，提升项目的类型安全性与可维护性。
>   3. **掌握异步处理与流控制：** 深入理解 Node.js 中的异步编程模型，包括回调、Promise、async/await 等，掌握流（Stream）控制的基本概念与实际应用，能够处理复杂的异步操作与大数据流的高效传输。
>   4. **深入理解进程与子进程：** 深入理解 Node.js 中的进程与子进程的概念，学习如何使用 `child_process` 模块创建、管理子进程，处理跨进程通信，优化多任务处理及 CPU 密集型任务的执行。

## 一、Node.js 介绍与安装

### 什么是 Node.js？


Node.js 是一个开源的、跨平台的 JavaScript 运行时环境，它使得开发者可以使用 JavaScript 编写服务端代码。在浏览器之外的环境中运行 JavaScript 是它的一个重要特点。Node.js 基于 Google 的 V8 JavaScript 引擎，最初是为开发高效、可扩展的网络应用而设计的，尤其是在处理大量并发请求时表现优秀。


#### Node.js 的特点：

- **异步非阻塞**：Node.js 使用事件驱动和异步编程，这使得它能够高效处理 I/O 密集型任务，而不会阻塞线程。
- **轻量和高效**：Node.js 是基于事件循环的，这意味着它非常适合处理高并发的任务。
- **JavaScript 全栈开发**：开发者可以在服务器端和客户端同时使用 JavaScript，从而减少上下文切换的成本。


Node.js 的常用场景包括：

- Web 服务器
- RESTful API
- 实时聊天应用（如 WebSockets）
- 微服务架构
- 命令行工具
- Agent 产品内核


### 安装 Node.js


Node.js 的安装可以通过多种方式完成，其中最常见的两种是：

1. 直接安装 Node.js 官方版本
2. 使用工具（如 Volta 或 nvm）管理 Node.js 版本


**Volta** 是一个轻量级的 JavaScript 工具链管理工具，它能够帮助开发者管理 Node.js 版本及其相关工具（如 npm、yarn 等），并且提供了跨平台支持（Windows 和 Unix 系统）。


#### 为什么选择 Volta？


- **版本管理简单**：它能轻松管理多个 Node.js 版本，且不需要复杂的配置。
- **跨平台**：Volta 适用于 macOS、Linux 和 Windows。
- **项目隔离**：它支持为不同的项目设置不同的 Node.js 版本，保证开发环境的一致性。


#### 还有其他选择

- nvm，非常老牌的
- n


### 使用 Volta 安装 Node.js


#### 在 Windows 上安装 Volta


步骤如下：

1. 打开 [Volta 官方网站](https://volta.sh/)，下载 Windows 安装程序。
2. 运行安装程序并按照提示完成安装。


```python
# On most Unix systems including macOS, you can install with a single command:
winget install Volta.Volta

# Download and install Node.js:
volta install node@22

# Verify the Node.js version:
node -v # Should print "v22.15.0".

# Verify npm version:
npm -v # Should print "10.9.2".
```


安装成功后，你可以通过以下命令来检查是否安装成功：


```Bash
volta --version
```


这将输出 Volta 的版本号，确认安装无误。


#### 在 macOS/Linux 上安装 Volta


在 macOS 或 Linux 系统上，可以通过终端使用一行命令快速安装 Volta：


```Bash
curl https://get.volta.sh | bash
```


执行完后，重启终端，并使用以下命令验证安装是否成功：


```Bash
volta --version
```


#### 安装 Node.js 和 npm


安装 Volta 后，使用 Volta 安装 Node.js 版本：


```Bash
volta install node@22.15.0
```


这个命令会自动安装最新的 Node.js 和对应的 npm。你可以通过以下命令查看安装的版本：


```Bash
node -v
npm -v
```


你也可以指定某个特定版本的 Node.js 进行安装：


```Bash
volta install node@14
```


### 创建并管理项目


#### 使用 npm 初始化项目


安装 Node.js 和 npm 后，我们可以使用 `npm` 来初始化一个新的项目。


1. 创建一个新目录作为项目根目录：


```Bash
mkdir my-node-project
cd my-node-project
```


1. 使用 npm 初始化项目：


```Bash
npm init
```


在执行这个命令后，npm 会要求你输入一些项目信息（如项目名称、版本、作者等）。如果不需要特别配置，可以直接按回车键使用默认值。


最终，npm 会生成一个 `package.json` 文件，里面记录了项目的基础信息及依赖项。


#### 安装依赖


项目创建完成后，通常你需要为项目安装一些依赖库。比如，我们要安装 Express.js，一个常用的 Web 框架：


```Bash
npm install express
```


这将会在项目目录中生成一个 `node_modules` 文件夹，里面存放了 Express 及其依赖库。


### 编写与调试 Node.js 程序


接下来，我们编写一个简单的 Node.js 应用，并使用 npm 进行调试。


#### 创建一个简单的服务器


在项目目录中，创建一个 `index.js` 文件，代码如下：


```JavaScript
const express = require('express');
const app = express();

// 定义一个路由
app.get('/', (req, res) => {
  res.send('Hello, Node.js!');
});

// 监听端口 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
```


这个代码使用了 Express.js 来创建一个简单的服务器，监听在 `localhost:3000`，并在根路由上返回 “Hello, Node.js!” 字符串。


#### 运行项目


在项目目录中，运行以下命令启动服务器：


```Bash
node index.js
```


打开浏览器，访问 `http://localhost:3000`，你应该能看到页面上显示 “Hello, Node.js!”。


#### 使用 npm 脚本调试


为了方便调试，我们可以在 `package.json` 文件中定义一个脚本命令来启动服务器。打开 `package.json`，在 `scripts` 部分添加以下内容：


```JSON
"scripts": {
  "start": "node index.js"
}
```


现在，我们可以通过以下命令来启动服务器：


```Bash
npm start
```


这与直接运行 `node index.js` 的效果相同，但更符合 npm 的项目管理流程。

## 二、模块化与 package.json 详解

### 模块化


在 Node.js 中，模块化是开发应用程序的核心概念，它使得代码可以按照功能模块进行分割，易于维护、复用和扩展。Node.js 支持两种模块化规范：


1. **CommonJS**（CJS）：这是 Node.js 最初使用的模块化规范。
2. **ECMAScript Modules**（ESM）：这是现代 JavaScript 的官方模块化规范，自 ECMAScript 2015（ES6）引入。


#### CommonJS 模块化规范


**CommonJS** 是 Node.js 早期就支持的模块化标准，允许在服务端使用模块。在 CommonJS 中，每个文件都被视为一个独立的模块。你可以通过 `module.exports` 导出模块内容，并使用 `require()` 函数引入模块。


##### CommonJS 基本用法


- **导出模块**：使用 `module.exports` 或 `exports`。
- **引入模块**：使用 `require()`。


##### 示例


```JavaScript
// math.js - 定义模块
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// 使用 module.exports 导出模块
module.exports = {
  add,
  subtract,
};

// 或者也可以使用 exports（两者作用相同）
exports.add = add;
exports.subtract = subtract;
```


```JavaScript
// main.js - 引入并使用模块
const math = require('./math');

console.log(math.add(5, 3));        // 输出: 8
console.log(math.subtract(5, 3));   // 输出: 2
```


##### CommonJS 特点


- **同步加载**：`require()` 是同步的，这意味着模块会在需要时同步加载。这在服务端是可以接受的，但在浏览器中不够高效。
- **模块缓存**：加载的模块会被缓存，因此多次 `require()` 同一个模块时，模块只会被加载一次。


#### ECMAScript Modules（ESM）规范


随着 JavaScript 语言的发展，\*\*ECMAScript Modules (ESM)\*\* 被引入，成为 JavaScript 官方标准的模块系统。Node.js 从版本 12.17 开始支持 ESM，Node.js 通过引入 `.mjs` 文件扩展名和 `package.json` 中的 `"type": "module"` 字段来实现对 ESM 的支持。


##### ECMAScript Modules 基本用法


- **导出模块**：使用 `export` 关键字。
- **引入模块**：使用 `import` 关键字。


##### 示例


```JavaScript
// math.mjs - 定义模块
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
```


```JavaScript
// main.mjs - 引入并使用模块
import { add, subtract } from './math.mjs';

console.log(add(5, 3));        // 输出: 8
console.log(subtract(5, 3));   // 输出: 2
```


##### ESM 特点


- **静态解析**：ESM 是静态的，这意味着在代码编译时就能确定模块的依赖关系（相较于 CommonJS 的动态加载）。
- **异步加载**：`import` 支持异步加载，这在浏览器中更高效，特别是当你需要懒加载模块时。
- **严格模式**：所有的 ECMAScript 模块都默认处于严格模式（`"use strict"`）。
- **不允许动态导入和导出**：ESM 不支持像 CommonJS 那样的动态 `require`，必须在顶层进行 `import/export`。


#### 文件后缀与模块加载规则


##### CommonJS 文件后缀


对于 CommonJS 模块，文件通常使用 `.js` 后缀。如果你在 Node.js 中编写 CommonJS 模块，直接使用 `.js` 文件即可。


##### ECMAScript 模块的文件后缀


在 Node.js 中，可以通过以下两种方式启用 ESM：


1. **使用 `.mjs`**文件后缀：如果文件扩展名是 `.mjs`，Node.js 会将其视为 ESM。
2. **配置** `package.json`：在项目的 `package.json` 中设置 `"type": "module"`，这样即使文件是 `.js` 后缀，Node.js 也会将其作为 ESM 处理。


```JSON
{
  "type": "module"
}
```


##### 如何区分 CommonJS 和 ESM


Node.js 根据以下规则来确定模块系统：


- **CommonJS**：默认情况下，Node.js 中所有 `.js` 文件都被视为 CommonJS 模块，除非另有指定。
- **ESM**：当你使用 `.mjs` 扩展名，或者在 `package.json` 中指定 `"type": "module"`，所有的 `.js` 文件都会被视为 ESM 模块。


#### `require` 和 `import` 互操作性


尽管 Node.js 支持 CommonJS 和 ESM 两种规范，但两者在一起使用时需要注意一些限制：


##### 从 CommonJS 中引入 ESM


从 CommonJS 文件中引入 ESM 模块是有一定限制的。`require()` 无法直接加载 ESM 模块，必须使用 `import()` 函数（它是一个异步函数）。


```JavaScript
// 在 CommonJS 模块中动态引入 ESM 模块
(async () => {
  const math = await import('./math.mjs');
  console.log(math.add(5, 3));
})();
```


##### 从 ESM 中引入 CommonJS


ESM 模块可以直接通过 `import` 引入 CommonJS 模块，因为 Node.js 会将 CommonJS 模块包装成 ESM 格式以供使用。


```JavaScript
// 在 ESM 中引入 CommonJS 模块
import math from './math.js';  // 假设 math.js 是一个 CommonJS 模块
console.log(math.add(5, 3));
```


#### 选择 CommonJS 还是 ESM？


在实际开发中，选择使用 CommonJS 还是 ESM 取决于几个因素：


- **兼容性**：如果你要支持旧的 Node.js 版本（12 之前）或使用大量依赖的第三方库（特别是历史遗留的），CommonJS 可能更合适。
- **未来发展**：ESM 是 JavaScript 官方标准，未来会有更多的支持，因此如果是新项目，推荐使用 ESM。
- **生态系统**：目前 Node.js 生态中的大多数库仍然使用 CommonJS，但越来越多的库开始迁移到 ESM。


### package.json 【速查】


> 速查，需要时查看了解，不用全记

```TypeScript
  "main": "index.js", // npm require commonjs 包入口
  "module": "index.mjs", // ES Module 入口
  "bin": { // 可执行文件入口
    "miaoma-basic-cli": "./bin/basic"
  },
  "types": "index.d.ts", // 类型入口
  "exports": { // 外部暴露模块入口
    "./maioma.css": "./maioma.css"
  },
  "type": "module",
```

#### name（名称）


如果你计划发布你的包，`package.json` 中最重要的字段是 `name` 和 `version`，因为它们是必需的。`name` 和 `version` 共同组成一个假定完全唯一的标识符。包的更改应伴随版本号的更新。如果你不打算发布包，那么 `name` 和 `version` 字段是可选的。


`name` 就是你包的名称。


一些规则：


- 名称必须少于或等于 214 个字符。这包括范围包的范围部分。
- 范围包的名称可以以点（.）或下划线（\_）开头。如果没有范围，则不允许这样做。
- 新包的名称不能包含大写字母。
- 名称将成为 URL 的一部分、命令行中的参数以及文件夹名称。因此，名称不能包含任何非 URL 安全的字符。


一些建议：


- 不要使用与 Node 核心模块相同的名称。
- 不要在名称中使用 "js" 或 "node"。因为你正在编写 `package.json` 文件，默认情况下它是 JavaScript 项目，你可以通过 `engines` 字段指定运行环境。
- 名称可能会被传递给 `require()`，因此它应短小且具有描述性。
- 在命名之前，建议检查 npm 注册表，以确认是否已经存在相同名称的包：https://www.npmjs.com/
- 名称可以选择性地添加范围前缀，例如 `@myorg/mypackage`。详细信息请参阅 [scope](https://docs.npmjs.com/cli/v9/using-npm/scope)。


#### version（版本）


如果你计划发布包，`package.json` 中最重要的字段是 `name` 和 `version`，因为它们是必须的。`name` 和 `version` 共同构成唯一的标识符。包的更改应伴随版本号的更新。如果你不打算发布包，那么 `name` 和 `version` 字段是可选的。


版本号必须能够通过 [node-semver](https://github.com/npm/node-semver) 解析，它作为 npm 的依赖项捆绑在一起。（你可以通过 `npm install semver` 来单独使用它。）


#### description（描述）


为包添加描述。它是一个字符串，有助于用户通过 `npm search` 搜索到你的包。


#### keywords（关键词）


为包添加关键词。它是一个字符串数组，能够帮助用户通过 `npm search` 搜索到你的包。


#### homepage（主页）


项目主页的 URL。


示例：


```JSON
"homepage": "https://github.com/owner/project#readme"
```


#### bugs（问题报告）


项目的问题跟踪 URL 和/或用于报告问题的电子邮件地址。当人们遇到包的问题时，这些信息很有帮助。


应该是这样的格式：


```JSON
{
  "bugs": {
    "url": "https://github.com/owner/project/issues",
    "email": "project@hostname.com"
  }
}
```


你可以只指定 URL，也可以同时指定 URL 和电子邮件。如果只想提供 URL，可以将 `bugs` 字段值写成一个简单的字符串而不是对象。


如果提供了 URL，它将被 `npm bugs` 命令使用。


#### license（许可证）


你应该为包指定一个许可证，这样人们才能知道如何被允许使用它以及你施加的任何限制。


如果你使用的是常见的许可证，如 BSD-2-Clause 或 MIT，请添加当前的 SPDX 许可证标识符，如下所示：


```JSON
{
  "license": "BSD-3-Clause"
}
```


你可以查看 [SPDX 许可证 ID 列表](https://spdx.org/licenses/)。理想情况下，你应该选择一个由 [OSI](https://opensource.org/licenses/) 批准的许可证。


如果你的包受多个常见许可证保护，请使用 [SPDX 许可证表达式语法 2.0 字符串](https://spdx.dev/specifications/)，例如：


```JSON
{
  "license": "(ISC OR GPL-3.0)"
}
```


如果你使用的许可证没有被分配 SPDX 标识符，或者你使用自定义许可证，请使用如下字符串：


```JSON
{
  "license": "SEE LICENSE IN <filename>"
}
```


然后在包的顶层目录中包含一个名为 `<filename>` 的文件。


一些旧的包使用了许可证对象或包含许可证对象数组的 "licenses" 属性：


```JSON
// 非有效元数据
{
  "license": {
    "type": "ISC",
    "url": "https://opensource.org/licenses/ISC"
  }
}

// 非有效元数据
{
  "licenses": [
    {
      "type": "MIT",
      "url": "https://www.opensource.org/licenses/mit-license.php"
    },
    {
      "type": "Apache-2.0",
      "url": "https://opensource.org/licenses/apache2.0.php"
    }
  ]
}
```


这些风格现在已经被弃用。应该改用 SPDX 表达式，如下所示：


```JSON
{
  "license": "ISC"
}
```


```JSON
{
  "license": "(MIT OR Apache-2.0)"
}
```


如果你不希望他人在任何条件下使用私有或未发布的包，请使用：


```JSON
{
  "license": "UNLICENSED"
}
```


此外，考虑将 `private` 设置为 `true`，以防止包意外发布。


#### people fields: author, contributors（人员字段：作者、贡献者）


`author` 表示一个人，`contributors` 是一个人员数组。一个 "person" 是一个包含 `name` 字段的对象，可选的 `email` 和 `url` 字段，如下所示：


```JSON
{
  "name": "Barney Rubble",
  "email": "b@rubble.com",
  "url": "http://barnyrubble.tumblr.com/"
}
```


或者你可以将其简写为一个字符串，npm 会自动解析它：


```JSON
{
  "author": "Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)"
}
```


无论是 `email` 还是 `url` 都是可选的。


npm 还会使用你的 npm 用户信息设置顶级 `maintainers` 字段。


#### funding（资助）


你可以指定一个包含资助信息的 URL，提供用于帮助资助开发的信息。它可以是一个字符串 URL，或者是一个对象数组和字符串 URL 的组合。


示例：


```JSON
{
  "funding": {
    "type": "individual",
    "url": "http://example.com/donate"
  }
}
```


```JSON
{
  "funding": {
    "type": "patreon",
    "url": "https://www.patreon.com/my-account"
  }
}
```


```JSON
{
  "funding": "http://example.com/donate"
}
```


```JSON
{
  "funding": [
    {
      "type": "individual",
      "url": "http://example.com/donate"
    },
    "http://example.com/donateAlso",
    {
      "type": "patreon",
      "url": "https://www.patreon.com/my-account"
    }
  ]
}
```


用户可以使用 `npm fund` 子命令列出项目依赖项（直接或间接）的资助 URL。你还可以使用 `npm fund <projectname>` 来访问每个资助 URL（如果有多个 URL，则会访问第一个）。


#### files（文件）


可选的 `files` 字段是一个文件模式数组，描述当你的包作为依赖项安装时应包含的条目。文件模式的语法类似于 `.gitignore`，但相反：包括的文件、目录或通配符模式（如 `*`, `**/*` 等）将在打包时被包含。省略该字段将默认为 `["*"]`，这意味着它将包含所有文件。


某些特殊文件和目录也会被包含或排除，无论它们是否存在于 `files` 数组中（见下文）。


你还可以在包的根目录或子目录中提供 `.npmignore` 文件，该文件可以防止某些文件被包含。在根目录中，它不会覆盖 `files` 字段，但在子目录中会覆盖。`.npmignore` 文件的工作方式与 `.gitignore` 类似。如果存在 `.gitignore` 文件，但没有 `.npmignore` 文件，`.gitignore` 的内容将被使用。


某些文件总是会被包含，无论设置如何：


- `package.json`
- `README`
- `LICENSE` / `LICENCE`
- `main` 字段中的文件
- `bin` 字段中的文件


`README` 和 `LICENSE` 可以具有任意大小写和扩展名。


某些文件总是默认被忽略：


- `*.orig`
- `.*.swp`
- `.DS_Store`
- `._*`
- `.git`
- `.hg`
- `.lock-wscript`
- `.npmrc`
- `.svn`
- \`.wafpickle


-N\`

- `CVS`
- `config.gypi`
- `node_modules`
- `npm-debug.log`
- `package-lock.json`（如果希望它被发布，请使用 [`npm-shrinkwrap.json`](https://docs.npmjs.com/cli/v9/configuring-npm/npm-shrinkwrap-json)）
- `pnpm-lock.yaml`
- `yarn.lock`


大多数这些被忽略的文件可以通过在 `files` 字段中明确包含来包含，但以下文件不能被包含：


- `.git`
- `.npmrc`
- `node_modules`
- `package-lock.json`
- `pnpm-lock.yaml`
- `yarn.lock`


这些文件无法被包含。


#### exports（导出）


`exports` 提供了一种现代替代 `main` 的方式，允许定义多个入口点，支持环境之间的条件解析，并防止除了 `exports` 定义的入口点以外的任何其他入口点被访问。这种封装允许模块作者明确定义包的公共接口。有关更多详细信息，请参阅 [Node.js 文档中的包入口点](https://nodejs.org/api/packages.html#package-entry-points)。


#### main（主文件）


`main` 字段是一个模块 ID，表示程序的主要入口点。也就是说，如果你的包名为 `foo`，用户安装了它并执行了 `require("foo")`，则会返回你 `main` 模块的 `exports` 对象。


这应该是相对于包根目录的模块路径。


对于大多数模块，最合理的做法是提供一个主要脚本，通常没有其他文件。


如果 `main` 未设置，则默认使用包根目录中的 `index.js`。


#### browser（浏览器）


如果你的模块是为了客户端使用的，`browser` 字段应该被用于替代 `main` 字段。这有助于提示用户模块可能依赖于 Node.js 模块中不可用的浏览器原生 API（例如 `window`）。


#### bin（可执行文件）


许多包有一个或多个希望安装到 PATH 中的可执行文件。npm 让这件事变得非常容易（事实上，npm 自己就是通过这种功能来安装的）。


要使用它，在 `package.json` 中提供一个 `bin` 字段，它是命令名称到本地文件名的映射。当包被全局安装时，该文件将链接到全局 `bin` 目录中，或者在 Windows 上创建一个 `cmd` 文件，执行 `bin` 字段中指定的文件，从而可以通过 `name` 或 `name.cmd`（在 Windows PowerShell 上）运行它们。当该包作为另一个包的依赖项安装时，该文件将被链接，使得它可以直接通过 `npm exec` 或其他脚本中的 `npm run-script` 命令使用。


例如，`myapp` 可以这样定义：


```JSON
{
  "bin": {
    "myapp": "bin/cli.js"
  }
}
```


因此，当你安装 `myapp` 时，在类 Unix 操作系统中，它会从 `cli.js` 脚本创建一个符号链接到 `/usr/local/bin/myapp`，在 Windows 中，它会创建一个 `cmd` 文件，通常位于 `C:\Users\{Username}\AppData\Roaming\npm\myapp.cmd`，它会运行 `cli.js` 脚本。


如果你有一个可执行文件，并且它的名称应该与包的名称相同，那么你可以将其作为字符串提供。例如：


```JSON
{
  "name": "my-program",
  "version": "1.2.5",
  "bin": "path/to/program"
}
```


相当于：


```JSON
{
  "name": "my-program",
  "version": "1.2.5",
  "bin": {
    "my-program": "path/to/program"
  }
}
```


请确保 `bin` 中引用的文件以 `#!/usr/bin/env node` 开头，否则脚本将无法使用 `node` 可执行文件启动。


注意，你也可以使用 [directories.bin](https://docs.npmjs.com/cli/v9/configuring-npm/folders#executables) 字段设置可执行文件。


#### man（手册）


指定一个单独的文件或文件名数组，使其可以通过 `man` 程序找到。


如果只提供一个文件，它将被安装为 `man <pkgname>` 的结果，而不管其实际文件名是什么。例如：


```JSON
{
  "name": "foo",
  "version": "1.2.3",
  "description": "A packaged foo fooer for fooing foos",
  "main": "foo.js",
  "man": "./man/doc.1"
}
```


将 `./man/doc.1` 文件链接为 `man foo` 的目标。


如果文件名不以包名开头，则会添加前缀。例如：


```JSON
{
  "name": "foo",
  "version": "1.2.3",
  "description": "A packaged foo fooer for fooing foos",
  "main": "foo.js",
  "man": ["./man/foo.1", "./man/bar.1"]
}
```


将创建 `man foo` 和 `man foo-bar` 的条目。


手册文件必须以数字结尾，并且如果它们被压缩，则可以选择 `.gz` 后缀。数字决定了文件安装到哪个手册部分。


```JSON
{
  "name": "foo",
  "version": "1.2.3",
  "description": "A packaged foo fooer for fooing foos",
  "main": "foo.js",
  "man": ["./man/foo.1", "./man/foo.2"]
}
```


将创建 `man foo` 和 `man 2 foo` 的条目。


#### directories（目录）


CommonJS [Packages](http://wiki.commonjs.org/wiki/Packages/1.0) 规范详细说明了如何使用 `directories` 对象指示包的结构。如果你查看 [npm 的 package.json](https://registry.npmjs.org/npm/latest)，你会发现它有 `doc`、`lib` 和 `man` 目录。


未来，此信息可能会以其他创新方式使用。


##### directories.bin


如果你在 `directories.bin` 中指定了一个 `bin` 目录，该文件夹中的所有文件都将被添加。


由于 `bin` 指令的工作方式，指定 `bin` 路径并同时设置 `directories.bin` 是一个错误。如果你想要指定单个文件，请使用 `bin`，如果要包含现有 `bin` 目录中的所有文件，请使用 `directories.bin`。


##### directories.man


一个包含手册页面的文件夹。通过遍历文件夹生成一个 "man" 数组的语法糖。


#### repository（仓库）


指定代码存放的位置。这对于想要贡献的人来说很有帮助。如果 git 仓库在 GitHub 上，那么 `npm repo` 命令将能够找到你。


示例：


```JSON
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/npm/cli.git"
  }
}
```


URL 应该是一个公开可访问（可能只读）的 URL，可以直接提供给 VCS 程序，而无需修改。它不应是浏览器中用于显示的 HTML 项目页面的 URL。它是供计算机使用的。


对于 GitHub、GitHub Gist、Bitbucket 或 GitLab 仓库，你可以使用与 `npm install` 相同的简写语法：


```JSON
{
  "repository": "npm/npm",

  "repository": "github:user/repo",

  "repository": "gist:11081aaa281",

  "repository": "bitbucket:user/repo",

  "repository": "gitlab:user/repo"
}
```


如果 `package.json` 不在项目的根目录中（例如，如果它是 monorepo 的一部分），你可以指定它所在的目录：


```JSON
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/npm/cli.git",
    "directory": "workspaces/libnpmpublish"
  }
}
```


#### scripts（脚本）


`scripts` 属性是一个字典，包含在包生命周期的不同阶段运行的脚本命令。键是生命周期事件，值是运行的命令。


更多关于编写包脚本的内容，请参阅 [`scripts`](https://docs.npmjs.com/cli/v9/using-npm/scripts)。


#### config（配置）


`config` 对象可以用来设置包脚本中使用的配置参数，并在升级时保留。例如，如果包有以下内容：


```JSON
{
  "name": "foo",
  "config": {
    "port": "8080"
  }
}
```


它还可以有一个 `start` 命令，引用 `npm_package_config_port` 环境变量。


#### dependencies（依赖项）


`dependencies` 是一个简单的对象，映射包名称到版本范围。版本范围是一个包含一个或多个空格分隔描述符的字符串。依赖项也可以通过 tarball 或 git URL 指定。


**请不要将测试框架、转译器或其他“开发”工具放在 `dependencies`**\*\* 对象中。\*\* 有关详细信息，请参阅 `devDependencies`。


有关版本范围的更多信息，请参阅


 [semver](https://github.com/npm/node-semver#versions)。


- `version` 必须与 `version` 完全匹配。
- `>version` 必须大于 `version`。
- `>=version` 等。
- `<version`。
- `<=version`。
- `~version` “大致等于版本”。参见 [semver](https://github.com/npm/node-semver#versions)。
- `^version` “与版本兼容”。参见 [semver](https://github.com/npm/node-semver#versions)。
- `1.2.x` 1.2.0、1.2.1 等，但不包括 1.3.0。
- `http://...` 参见下文中的 'URLs as Dependencies'。
- `*` 匹配任何版本。
- `""`（空字符串）等同于 `*`。
- `version1 - version2` 等同于 `>=version1 <=version2`。
- `range1 || range2` 如果满足 `range1` 或 `range2`，则通过。
- `git...` 参见下文中的 'Git URLs as Dependencies'。
- `user/repo` 参见下文中的 'GitHub URLs'。
- `tag` 指定标记并发布为 `tag` 的特定版本。参见 [`npm dist-tag`](https://docs.npmjs.com/cli/v9/commands/npm-dist-tag)。
- `path/path/path` 参见下文中的 'Local Paths'。
- `npm:@scope/pkg@version` 自定义别名。参见 [`package-spec`](https://docs.npmjs.com/cli/v9/using-npm/package-spec#aliases)。


例如，以下都是有效的：


```JSON
{
  "dependencies": {
    "foo": "1.0.0 - 2.9999.9999",
    "bar": ">=1.0.2 <2.1.2",
    "baz": ">1.0.2 <=2.3.4",
    "boo": "2.0.1",
    "qux": "<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0",
    "asd": "http://asdf.com/asdf.tar.gz",
    "til": "~1.2",
    "elf": "~1.2.3",
    "two": "2.x",
    "thr": "3.3.x",
    "lat": "latest",
    "dyl": "file:../dyl",
    "kpg": "npm:pkg@1.0.0"
  }
}
```


##### URLs as Dependencies（URL 作为依赖项）


你可以用 tarball URL 替代版本范围。


在安装时，该 tarball 将被下载并本地安装到你的包中。


##### Git URLs as Dependencies（Git URL 作为依赖项）


Git URL 的格式为：


```Bash
<protocol>://[<user>[:<password>]@]<hostname>[:<port>][:][/]<path>[#<commit-ish> | #semver:<semver>]
```


`<protocol>` 可以是 `git`、`git+ssh`、`git+http`、`git+https` 或 `git+file`。


如果提供了 `#<commit-ish>`，它将用于克隆该确切的提交。如果 `commit-ish` 具有格式 `#semver:<semver>`，`<semver>` 可以是任何有效的 semver 范围或确切版本，npm 将查找匹配该范围的标签或 refs，就像它为注册表依赖项做的一样。如果既没有指定 `#commit-ish` 也没有指定 `#semver:<semver>`，则使用默认分支。


示例：


```Bash
git+ssh://git@github.com:npm/cli.git#v1.0.27
git+ssh://git@github.com/npm/cli#semver:^5.0
git+https://isaacs@github.com/npm/cli.git
git://github.com/npm/cli.git#v1.0.27
```


当从 `git` 仓库安装时，`package.json` 中的某些字段将导致 npm 认为需要进行构建。为此，npm 将克隆你的仓库到一个临时目录，安装其所有依赖项，运行相关脚本，然后打包并安装结果目录。


如果你的 git 依赖项使用了 `workspaces`，或者存在以下脚本中的任何一个，npm 将进行这种流程：


- `build`
- `prepare`
- `prepack`
- `preinstall`
- `install`
- `postinstall`


如果你的 git 仓库包含预构建的产物，你可能希望确保没有定义这些脚本，否则每次安装时都会重新构建依赖项。


##### GitHub URLs（GitHub URL）


从版本 1.1.65 开始，你可以仅使用 "foo": "user/foo-project" 的方式引用 GitHub URL。就像 git URL 一样，可以包含 `commit-ish` 后缀。例如：


```JSON
{
  "name": "foo",
  "version": "0.0.0",
  "dependencies": {
    "express": "expressjs/express",
    "mocha": "mochajs/mocha#4727d357ea",
    "module": "user/repo#feature/branch"
  }
}
```


##### Local Paths（本地路径）


从版本 2.0.0 开始，你可以提供指向包含包的本地目录的路径。可以通过 `npm install -S` 或 `npm install --save` 保存本地路径，使用以下任意形式：


```Bash
../foo/bar
~/foo/bar
./foo/bar
/foo/bar
```


它们将被标准化为相对路径并添加到 `package.json` 中。例如：


```JSON
{
  "name": "baz",
  "dependencies": {
    "bar": "file:../foo/bar"
  }
}
```


此功能对于本地离线开发和需要 npm 安装但不希望连接外部服务器的测试非常有用，但不应在发布包到公共注册表时使用。


*注意*：通过本地路径链接的包在运行 `npm install` 时不会安装其自己的依赖项。你必须从本地路径内部运行 `npm install`。


#### devDependencies（开发依赖）


如果有人计划在他们的程序中下载并使用你的模块，那么他们可能不希望或不需要下载和构建你使用的外部测试或文档框架。


在这种情况下，最好将这些额外的项目映射到 `devDependencies` 对象中。


这些项目在执行 `npm link` 或从包根目录运行 `npm install` 时会被安装，并且可以像任何其他 npm 配置参数一样进行管理。有关更多信息，请参阅 [`config`](https://docs.npmjs.com/cli/v9/using-npm/config)。


对于与平台无关的构建步骤，例如将 CoffeeScript 或其他语言编译为 JavaScript，使用 `prepare` 脚本来完成此操作，并将所需的包作为开发依赖项。


示例：


```JSON
{
  "name": "ethopia-waza",
  "description": "a delightfully fruity coffee varietal",
  "version": "1.2.3",
  "devDependencies": {
    "coffee-script": "~1.6.3"
  },
  "scripts": {
    "prepare": "coffee -o lib/ -c src/waza.coffee"
  },
  "main": "lib/waza.js"
}
```


`prepare` 脚本将在发布前运行，这样用户可以在不需要自己编译的情况下使用功能。在开发模式下（即本地运行 `npm install`），此脚本也会运行，以便于测试。


#### peerDependencies（对等依赖）


在某些情况下，你可能需要表示你的包与主工具或库的兼容性，而不一定对其进行 `require`。这通常被称为插件。特别是，你的模块可能会公开一个特定的接口，主包会根据文档来期望和指定这个接口。


例如：


```JSON
{
  "name": "tea-latte",
  "version": "1.3.5",
  "peerDependencies": {
    "tea": "2.x"
  }
}
```


这可以确保你的包 `tea-latte` 只能与主包 `tea` 的第二个大版本一起安装。运行 `npm install tea-latte` 可能会生成以下依赖关系图：


```Bash
├── tea-latte@1.3.5
└── tea@2.2.0
```


在 npm 版本 3 到 6 之间，`peerDependencies` 不会自动安装，如果发现无效版本的对等依赖项，npm 将发出警告。从 npm v7 开始，`peerDependencies` 默认会被安装。


尝试安装另一个有冲突要求的插件可能会导致错误，特别是在依赖树无法正确解析时。因此，确保插件的要求尽可能宽泛，并且不要将其锁定为特定补丁版本。


假设主包遵循 [semver](https://semver.org/)，只有主包的大版本号变更才会破


坏插件。因此，如果你的插件与主包的每个 1.x 版本都兼容，请使用 `"^1.0"` 或 `"1.x"` 来表达这一点。如果你依赖于 1.5.2 中引入的功能，请使用 `"^1.5.2"`。


#### peerDependenciesMeta（对等依赖元信息）


`peerDependenciesMeta` 字段为 npm 提供了更多关于如何使用对等依赖的信息。特别是，它允许将对等依赖标记为可选。npm 不会自动安装可选的对等依赖。这样，你可以与各种主包集成和交互，而无需安装所有主包。


例如：


```JSON
{
  "name": "tea-latte",
  "version": "1.3.5",
  "peerDependencies": {
    "tea": "2.x",
    "soy-milk": "1.2"
  },
  "peerDependenciesMeta": {
    "soy-milk": {
      "optional": true
    }
  }
}
```


#### bundleDependencies（捆绑依赖项）


此字段定义了发布包时要捆绑的包名数组。


在某些情况下，你需要本地保留 npm 包或通过单个文件下载它们。你可以通过在 `bundleDependencies` 数组中指定包名并执行 `npm pack` 来实现此目的。


例如：


如果我们定义了一个如下所示的 `package.json` 文件：


```JSON
{
  "name": "awesome-web-framework",
  "version": "1.0.0",
  "bundleDependencies": [
    "renderized",
    "super-streams"
  ]
}
```


运行 `npm pack` 将生成 `awesome-web-framework-1.0.0.tgz` 文件。该文件包含 `renderized` 和 `super-streams` 依赖项，可以通过执行 `npm install awesome-web-framework-1.0.0.tgz` 在新项目中安装这些依赖项。请注意，包名不包括任何版本信息，因为这些信息在 `dependencies` 中已经指定。


如果将其拼写为 `"bundledDependencies"`，它也会被接受。


或者，`"bundleDependencies"` 也可以定义为布尔值。`true` 表示将捆绑所有依赖项，`false` 表示不捆绑任何依赖项。


#### optionalDependencies（可选依赖）


如果某个依赖项可以使用，但你希望即使它找不到或安装失败，npm 也能继续安装，那么可以将其放在 `optionalDependencies` 对象中。这个对象的结构与 `dependencies` 类似，是包名到版本或 URL 的映射。区别在于构建失败不会导致安装失败。运行 `npm install --omit=optional` 将阻止安装这些依赖项。


仍然是你的程序需要处理没有依赖项的情况。例如，可以这样做：


```JavaScript
try {
  var foo = require('foo')
  var fooVersion = require('foo/package.json').version
} catch (er) {
  foo = null
}
if ( notGoodFooVersion(fooVersion) ) {
  foo = null
}

// ..然后在你的程序的某处..

if (foo) {
  foo.doFooThings()
}
```


`optionalDependencies` 中的条目将覆盖 `dependencies` 中相同名称的条目，因此最好只在一个地方声明依赖项。


#### overrides（覆盖）


如果你需要对依赖项的依赖项进行特定更改，例如替换具有已知安全问题的依赖版本、将现有依赖项替换为分支版本，或者确保某个包的相同版本在所有地方都被使用，那么你可以添加一个覆盖。


覆盖允许将依赖树中的包替换为另一个版本或完全替换为另一个包。这些更改可以指定得非常具体或非常宽泛。


覆盖仅在项目的根 `package.json` 文件中生效。已安装依赖项（包括 [workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces)）中的覆盖不会被考虑。已发布的包可以通过固定依赖项或使用 [`npm-shrinkwrap.json`](https://docs.npmjs.com/cli/v9/configuring-npm/npm-shrinkwrap-json) 文件来控制其解析。


要确保包 `foo` 始终安装为版本 `1.0.0`，无论你的依赖项依赖于哪个版本：


```JSON
{
  "overrides": {
    "foo": "1.0.0"
  }
}
```


上面是简写形式，完整的对象形式允许覆盖包本身以及其子项。这将确保 `foo` 始终是 `1.0.0`，同时也会让 `bar` 在任何深度上始终是 `1.0.0`：


```JSON
{
  "overrides": {
    "foo": {
      ".": "1.0.0",
      "bar": "1.0.0"
    }
  }
}
```


仅当 `foo` 是包 `bar` 的子包（或孙子包、曾孙子包等）时，才覆盖 `foo` 为 `1.0.0`：


```JSON
{
  "overrides": {
    "bar": {
      "foo": "1.0.0"
    }
  }
}
```


键可以嵌套到任意长度。仅当 `foo` 是 `bar` 的子包并且 `bar` 是 `baz` 的子包时，才覆盖 `foo`：


```JSON
{
  "overrides": {
    "baz": {
      "bar": {
        "foo": "1.0.0"
      }
    }
  }
}
```


覆盖的键还可以包含版本或版本范围。仅当 `foo` 是 `bar@2.0.0` 的子包时，将 `foo` 覆盖为 `1.0.0`：


```JSON
{
  "overrides": {
    "bar@2.0.0": {
      "foo": "1.0.0"
    }
  }
}
```


除非依赖项和覆盖本身具有相同的规范，否则你不能为你直接依赖的包设置覆盖。为了让这种限制更容易处理，覆盖可以定义为对直接依赖项的规范引用，通过在你希望版本匹配的包名前添加 `$`：


```JSON
{
  "dependencies": {
    "foo": "^1.0.0"
  },
  "overrides": {
    // 错误，将抛出 EOVERRIDE 错误
    // "foo": "^2.0.0"
    // 正确，规范匹配，因此允许覆盖
    // "foo": "^1.0.0"
    // 最佳，覆盖定义为对依赖项的引用
    "foo": "$foo",
    // 被引用的包不需要与被覆盖的包相同
    "bar": "$foo"
  }
}
```


#### engines（引擎）


你可以指定包兼容的 Node.js 版本：


```JSON
{
  "engines": {
    "node": ">=0.10.3 <15"
  }
}
```


与依赖项类似，如果你不指定版本（或者指定 `*` 作为版本），那么任何版本的 Node.js 都可以使用。


你还可以使用 `engines` 字段指定能够正确安装你程序的 npm 版本。例如：


```JSON
{
  "engines": {
    "npm": "~1.0.20"
  }
}
```


除非用户设置了 [`engine-strict`](https://docs.npmjs.com/cli/v9/using-npm/config#engine-strict) 配置标志，否则该字段仅为建议用途，当你的包作为依赖项安装时只会产生警告。


#### os（操作系统）


你可以指定模块运行在哪些操作系统上：


```JSON
{
  "os": ["darwin", "linux"]
}
```


你也可以阻止特定操作系统，只需在阻止的操作系统前加 `!`：


```JSON
{
  "os": ["!win32"]
}
```


主机操作系统通过 `process.platform` 确定。


你可以同时阻止和允许某个操作系统，尽管这没有什么意义。


#### cpu（CPU 架构）


如果你的代码只能在某些 CPU 架构上运行，你可以指定这些架构：


```JSON
{
  "cpu": ["x64", "ia32"]
}
```


与 `os` 选项类似，你也可以阻止某些架构：


```JSON
{
  "cpu": ["!arm", "!mips"]
}
```


主机架构通过 `process.arch` 确定。


#### private（私有）


如果你在 `package.json` 中设置 `"private": true`，npm 将拒绝发布该包。


这是防止私有仓库意外发布的方式。如果你希望确保某个包只发布到特定的注册表（例如，内部注册表），请使用下面描述的 `publishConfig` 字典，在发布时覆盖 `registry` 配置参数。


#### publishConfig（发布配置）


这是发布时使用的一组配置值。如果你希望设置标记、注册表或访问权限，这特别方便。你可以确保给定的包不会标记


为 "latest"，不会发布到全局公共注册表，或者默认情况下范围包是私有的。


请参阅 [`config`](https://docs.npmjs.com/cli/v9/using-npm/config) 以查看可覆盖的配置选项列表。


#### workspaces（工作区）


可选的 `workspaces` 字段是一个文件模式数组，描述了安装客户端应在本地文件系统中查找的每个 [工作区](https://docs.npmjs.com/cli/v9/using-npm/workspaces)，这些工作区需要链接到顶级 `node_modules` 文件夹。


它可以描述要用作工作区的文件夹的直接路径，也可以定义可以解析为这些文件夹的通配符。


在以下示例中，位于 `./packages` 文件夹中的所有文件夹将被视为工作区，只要它们包含有效的 `package.json` 文件：


```JSON
{
  "name": "workspace-example",
  "workspaces": ["./packages/*"]
}
```


有关更多示例，请参阅 [`workspaces`](https://docs.npmjs.com/cli/v9/using-npm/workspaces)。


#### DEFAULT VALUES（默认值）


npm 会根据包内容默认一些值。


- `"scripts": {"start": "node server.js"}`


  如果包根目录中有一个 `server.js` 文件，npm 会默认将启动命令设置为 `node server.js`。


- `"scripts":{"install": "node-gyp rebuild"}`


  如果包根目录中有一个 `binding.gyp` 文件，并且你没有定义 `install` 或 `preinstall` 脚本，npm 会默认使用 `node-gyp` 进行编译。


- `"contributors": [...]`


  如果包根目录中有一个 `AUTHORS` 文件，npm 会将每一行视为 `Name <email> (url)` 格式，其中 `email` 和 `url` 是可选的。以 `#` 开头或空行的行将被忽略。

## 三、TypeScript 支持

在 Node.js 项目中引入 TypeScript 支持可以提升代码的安全性、可读性和维护性。TypeScript 是 JavaScript 的超集，提供了类型系统和现代 ES6+ 特性的支持。它不仅帮助开发者避免常见的类型错误，还提供了更好的代码编辑器支持（如自动补全、类型检查等）。下面是如何在 Node.js 项目中添加 TypeScript 支持的详细步骤。


### 安装 TypeScript 与 @types/node


```Bash
npm install --save-dev typescript @types/node
```


安装完 `typescript` 后，你可以通过以下命令检查版本，确认安装是否成功：


```Bash
npx tsc --version
```


### 初始化 TypeScript 配置文件


TypeScript 使用 `tsconfig.json` 文件来管理编译选项和项目设置。你可以使用 `tsc --init` 命令在项目根目录下生成一个默认的 `tsconfig.json` 文件：


```Bash
npx tsc --init
```


生成的 `tsconfig.json` 文件包含了许多配置选项，你可以根据需要进行修改。下面是一个常用的配置示例：


```JSON
{
  "compilerOptions": {
    "types": ["node"],             // 这行非常重要，我们安装的 @types/node 这里生效
    "target": "ES6",              // 指定编译的目标版本 (如 ES5, ES6, ESNext)
    "module": "commonjs",          // 使用的模块系统（Node.js 默认使用 commonjs）
    "outDir": "./dist",            // 编译后的输出目录
    "rootDir": "./src",            // 源代码所在的目录
    "strict": true,                // 启用所有严格的类型检查选项
    "esModuleInterop": true,       // 允许 CommonJS 和 ES 模块之间的互操作性
    "skipLibCheck": true,          // 跳过库文件的类型检查
    "forceConsistentCasingInFileNames": true  // 强制文件名严格区分大小写
  },
  "include": ["src"],              // 包含的文件或目录
  "exclude": ["node_modules"]      // 排除的文件或目录
}
```


#### 常用配置说明：

- `target`: 指定生成的 JavaScript 代码的版本，通常选择 `ES6` 或 `ESNext`。
- `module`: Node.js 中通常使用 `commonjs` 模块化标准。
- `outDir`: 指定编译后的输出目录，通常放在 `dist` 文件夹中。
- `rootDir`: 指定源代码所在目录，通常是 `src` 文件夹。
- `strict`: 启用严格模式，包括类型检查和其他严格的语法约束。
- `esModuleInterop`: 允许 ESM 和 CommonJS 模块互操作。


### 添加 TypeScript 代码


在项目根目录下创建 `src` 文件夹，并在其中编写 TypeScript 代码。例如，创建一个简单的 `src/index.ts` 文件：


```TypeScript
// src/index.ts
const greet = (name: string): string => {
  return `Hello, ${name}!`;
};

console.log(greet("Node.js with TypeScript"));
```


### 编译 TypeScript 代码


你可以通过以下命令将 TypeScript 代码编译成 JavaScript：


```Bash
npx tsc
```


编译后的 JavaScript 代码将输出到 `dist` 目录（或根据 `tsconfig.json` 的配置决定）。输出的文件结构通常与源文件保持一致。


### 在 Node.js 中运行 TypeScript 编译后的代码


编译后，你可以通过 Node.js 运行输出的 JavaScript 文件。假设编译后的 `index.js` 位于 `dist` 目录下，使用以下命令运行它：


```Bash
node dist/index.js
```


你应该能够看到输出：`Hello, Node.js with TypeScript`。


### 使用 `ts-node` 直接运行 TypeScript 文件


在开发阶段，如果不想每次修改代码都编译，可以使用 `ts-node` 来直接运行 TypeScript 代码。`ts-node` 是一个可以直接执行 `.ts` 文件的工具。


首先安装 `ts-node`：


```Bash
npm install --save-dev ts-node
```


然后，可以使用以下命令直接运行 TypeScript 文件：


```Bash
npx ts-node src/index.ts
```


`ts-node` 会自动处理 TypeScript 文件的编译并运行。


### 使用 npm 脚本自动化


为了方便起见，我们可以在 `package.json` 中添加一些脚本来自动化常见任务，比如编译和运行 TypeScript 代码。编辑 `package.json`，添加以下 `scripts` 配置：


```JSON
{
  "scripts": {
    "build": "tsc",               // 编译 TypeScript 代码
    "start": "node dist/index.js", // 运行编译后的 JavaScript 代码
    "dev": "ts-node src/index.ts"  // 直接运行 TypeScript 文件（开发模式）
  }
}
```


现在你可以使用以下命令来执行这些任务：


- `npm run build`: 编译 TypeScript 代码
- `npm run start`: 运行编译后的 JavaScript 代码
- `npm run dev`: 在开发模式下直接运行 TypeScript 代码


> 🌅 **提示**
> 但一般在企业级开发中，我们都会选择使用打包构建工具来完成编译工作，一般情况不会用 tsc 直接进行编译。

## 四、核心模块详解

在 Node.js 中，核心模块提供了基本的系统操作和功能，无需额外安装任何依赖。需要注意一点的是，关于引入问题，这里做一个详细统一说明

> 🏝️ **提示**
> 以 fs 模块为例：
> **`fs`（无前缀）**：
> - 这种方式一直以来都是 Node.js 的默认引入方式，主要用于向后兼容。
> - 如果你确定项目中没有与核心模块同名的第三方模块，或者你希望代码能够兼容旧版本的 Node.js，那么使用 `require('fs')` 是完全可以接受的。
> **`node:fs`（有 `node:` 前缀）**：
> - 这种方式在 Node.js 14 及之后推荐使用，尤其适合防止潜在的命名冲突。
> - 在你需要确保安全引用核心模块时，或者你希望代码更具现代性且可以避免未来的模块冲突，建议使用 `node:` 前缀的方式。


### `fs` 模块


`fs`（File System）模块允许对文件系统进行操作，提供了文件读写、文件夹操作等功能。`fs` 支持同步和异步两种 API。


#### 常用方法：


- **读取文件**：

  - 异步：`fs.readFile()`
  - 同步：`fs.readFileSync()`
- **写入文件**：

  - 异步：`fs.writeFile()`
  - 同步：`fs.writeFileSync()`


- **检查文件或目录是否存在**：`fs.existsSync()`


- **读取目录**：

  - 异步：`fs.readdir()`
  - 同步：`fs.readdirSync()`


- **创建目录**：

  - 异步：`fs.mkdir()`
  - 同步：`fs.mkdirSync()`


#### 示例


##### 异步读取文件

```JavaScript
const fs = require('fs');

// 异步读取文件内容
fs.readFile('./example.txt', 'utf-8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```


##### 同步写入文件

```JavaScript
const fs = require('fs');

// 同步写入文件内容
fs.writeFileSync('./example.txt', 'Hello, Node.js!');
console.log('文件已写入');
```


### `path` 模块


`path` 模块提供了一些实用函数来处理和转换文件路径。它是与操作系统无关的，跨平台时会根据系统自动调整路径格式。


#### 常用方法：


- **`path.join()`**：将多个路径拼接成一个路径
- **`path.resolve()`**：将相对路径解析为绝对路径
- **`path.basename()`**：返回路径的最后一部分（文件名）
- **`path.dirname()`**：返回路径的目录部分
- **`path.extname()`**：返回文件的扩展名


#### 示例


```JavaScript
const path = require('path');

// 拼接路径
const fullPath = path.join(__dirname, 'files', 'example.txt');
console.log(fullPath);  // /Users/.../files/example.txt

// 获取文件名
const fileName = path.basename(fullPath);
console.log(fileName);  // example.txt

// 获取扩展名
const ext = path.extname(fullPath);
console.log(ext);  // .txt

// 获取绝对路径
const absolutePath = path.resolve('example.txt');
console.log(absolutePath);  // /Users/.../example.txt
```


### `os` 模块


`os` 模块提供了一些与操作系统相关的实用工具函数，可以获取系统信息、用户信息等。


#### 常用方法：


- **`os.arch()`**：返回操作系统的架构（如 `x64`）
- **`os.platform()`**：返回操作系统的平台（如 `win32`、`linux`、`darwin`）
- **`os.cpus()`**：返回系统的 CPU 信息
- **`os.freemem()`**：返回可用的系统内存
- **`os.totalmem()`**：返回系统的总内存
- **`os.homedir()`**：返回当前用户的主目录
- **`os.uptime()`**：返回系统运行时间（秒）


#### 示例


```JavaScript
const os = require('os');

// 获取操作系统架构
console.log(os.arch());  // x64

// 获取操作系统平台
console.log(os.platform());  // darwin (macOS) / linux / win32

// 获取系统 CPU 信息
console.log(os.cpus());

// 获取可用内存和总内存
console.log(`Free memory: ${os.freemem()} bytes`);
console.log(`Total memory: ${os.totalmem()} bytes`);

// 获取用户的主目录
console.log(os.homedir());

// 获取系统运行时间
console.log(`System uptime: ${os.uptime()} seconds`);
```


### `process` 模块


`process` 模块提供了与当前 Node.js 进程相关的功能，包括获取环境变量、退出进程、与操作系统交互等。


#### 常用属性与方法：


- **`process.argv`**：获取命令行参数
- **`process.env`**：访问环境变量
- **`process.exit()`**：退出当前进程
- **`process.cwd()`**：获取当前工作目录
- **`process.memoryUsage()`**：获取进程的内存使用情况
- **`process.nextTick()`**：将回调放入下一次事件循环中执行


#### 示例


##### 获取命令行参数

```JavaScript
// 运行 node app.js arg1 arg2
console.log(process.argv);  // ['node', 'app.js', 'arg1', 'arg2']
```


##### 退出进程

```JavaScript
console.log('即将退出进程');
process.exit(0);  // 0 表示成功退出
```


##### 读取环境变量

```JavaScript
console.log(process.env.NODE_ENV);  // 输出环境变量 NODE_ENV 的值
```


### `child_process` 模块


`child_process` 模块允许你创建子进程并在其中执行命令、运行外部程序或脚本。这对于处理复杂任务、外部工具集成、并发执行任务非常有用。


#### 常用方法：


- **`exec()`**：执行外部命令，返回标准输出。
- **`spawn()`**：启动一个新进程并与其进行流式通信。
- **`fork()`**：专门用于创建 Node.js 子进程，并进行进程间通信。


#### 示例


##### 使用 `exec` 执行外部命令

```JavaScript
const { exec } = require('child_process');

// 执行 shell 命令
exec('ls -lh', (error, stdout, stderr) => {
  if (error) {
    console.error(`执行出错: ${error}`);
    return;
  }
  console.log(`标准输出: ${stdout}`);
});
```


##### 使用 `spawn` 启动进程

```JavaScript
const { spawn } = require('child_process');

// 启动一个新的进程，执行 `ls -lh`
const ls = spawn('ls', ['-lh']);

// 输出子进程的标准输出
ls.stdout.on('data', (data) => {
  console.log(`输出: ${data}`);
});

// 捕获子进程的错误
ls.stderr.on('data', (data) => {
  console.error(`错误: ${data}`);
});

// 监听子进程的退出事件
ls.on('close', (code) => {
  console.log(`子进程退出，退出码: ${code}`);
});
```


### `util.promisify`


`util.promisify` 是 Node.js 提供的一个工具函数，它将传统回调风格的异步函数转换为返回 `Promise` 的函数。这样可以更方便地使用 `async/await` 来处理异步操作。


#### 常用场景


许多 Node.js 核心模块（如 `fs`）的异步方法使用回调函数，可以使用 `util.promisify` 将它们转换为 `Promise` 风格，以便在现代异步代码中使用。


#### 示例


##### 使用 `util.promisify` 将 `fs.readFile` 转换为 Promise 版本

```JavaScript
const fs = require('fs');
const util = require('util');

// 将 fs.readFile 转换为 Promise 风格
const readFile = util.promisify(fs.readFile);

// 使用 async/await 读取文件
(async () => {
  try {
    const data = await readFile('./example.txt', 'utf-8');
    console.log(data);
  } catch (error) {
    console.error(error);
  }
})();
```


通过 `promisify`，我们可以轻松将任何基于回调的异步函数转换为返回 `Promise` 的函数，这使得代码更加现代和简洁。


#### 总结


- **`fs`**：用于文件操作，支持同步和异步 API。
- **`path`**：提供文件路径处理功能，跨平台支持。
- **`os`**：提供操作系统相关信息，如平台、内存、CPU。
- **`process`**：与当前 Node.js 进程交互，获取命令行参数、环境变量等。
- **`child_process`**：用于创建子进程，执行外部命令或脚本。
- **`util.promisify`**：将回调风格的异步函数转换为 `Promise`，便于使用 `async/await`。

## 五、进程与子进程

在 Node.js 中，**进程（process）** 和 **子进程（child_process）** 是用于处理并行任务和执行外部命令的核心概念。它们为 Node.js 提供了在单线程的事件循环中处理多任务的能力，同时也能执行外部脚本或程序。


### 进程（Process）


Node.js 中的每个程序实例都是一个进程。通过 `process` 模块，Node.js 提供了与当前运行的进程进行交互的接口。


#### 进程的常用场景：

- 获取和设置环境变量。
- 获取命令行参数。
- 控制进程的生命周期，比如退出、发送信号等。


#### 进程中的常用属性和方法：


- **`process.argv`**：用于获取启动 Node.js 进程时传递的命令行参数。
- **`process.env`**：用于访问当前进程的环境变量。
- **`process.exit([code])`**：终止当前进程，并返回退出状态码（默认值为 `0` 表示成功，非零值表示错误）。
- **`process.cwd()`**：返回当前的工作目录。
- **`process.memoryUsage()`**：返回当前进程的内存使用情况。


#### 示例


##### 获取命令行参数


假设启动 Node.js 时传递了多个参数：


```Bash
node app.js arg1 arg2 arg3
```


在代码中，可以通过 `process.argv` 访问这些参数：


```JavaScript
// app.js
console.log(process.argv);  
// 输出: ['node', 'app.js', 'arg1', 'arg2', 'arg3']
```


##### 读取环境变量


环境变量可以通过 `process.env` 来访问。常见的例子是 `NODE_ENV` 环境变量，用于区分开发和生产环境。


```JavaScript
const env = process.env.NODE_ENV || 'development';
console.log(`当前环境是: ${env}`);
```


##### 终止进程


使用 `process.exit()` 可以手动终止进程，并设置一个退出码。非零的退出码通常表示错误或异常退出。


```JavaScript
if (someConditionFails) {
  console.log('条件失败，退出进程');
  process.exit(1);  // 非零退出码，表示出错
}
```


### 子进程（Child Process）


Node.js 的 `child_process` 模块提供了创建和管理子进程的功能。它允许你从 Node.js 应用程序中执行外部命令、启动其他程序或运行脚本。通过子进程，Node.js 可以在自身的单线程模型中实现并发任务的处理。


#### 子进程的常用场景：

- 执行外部命令或脚本（例如调用 shell 命令）。
- 创建并行任务，例如多进程并行处理任务。
- 在 Node.js 进程中调用其他 Node.js 程序或脚本。


#### 子进程模块的常用方法：


1. **`exec()`**：用于执行一个 shell 命令，返回标准输出和标准错误。适合短命令执行。
2. **`spawn()`**：用于启动一个新的进程，可以与其进行持续的流式通信。适合长时间运行的任务。
3. **`fork()`**：专门用于创建新的 Node.js 子进程，并允许在父进程和子进程之间传递消息。


> 🏆 **提示**
> exec 和 spawn 的详细对比


#### `exec()` 方法


`exec()` 是用来执行简单命令的，比如 shell 命令或其他外部脚本。它适合用于执行短时间内返回结果的命令。


##### 示例


```JavaScript
const { exec } = require('child_process');

// 执行一个 shell 命令
exec('ls -l', (error, stdout, stderr) => {
  if (error) {
    console.error(`执行错误: ${error}`);
    return;
  }
  console.log(`标准输出: ${stdout}`);
  console.error(`标准错误: ${stderr}`);
});
```


在这个例子中，`exec()` 执行了一个 `ls -l` 命令来列出当前目录的文件列表。


#### `spawn()` 方法 ✅


`spawn()` 用于创建一个新进程，并且可以通过数据流与这个进程进行通信。`spawn()` 适合长时间运行的任务或者需要不断与子进程交互的任务。


##### 示例


```JavaScript
const { spawn } = require('child_process');

// 启动一个新的进程，执行 `ls -l`
const ls = spawn('ls', ['-l']);

// 监听子进程的标准输出
ls.stdout.on('data', (data) => {
  console.log(`标准输出: ${data}`);
});

// 监听子进程的错误输出
ls.stderr.on('data', (data) => {
  console.error(`标准错误: ${data}`);
});

// 监听子进程的退出事件
ls.on('close', (code) => {
  console.log(`子进程退出，退出码: ${code}`);
});
```


在这个例子中，我们通过 `spawn()` 启动了一个 `ls -l` 命令，并持续接收该命令的输出。


#### `fork()` 方法


`fork()` 是 `child_process` 中的一个特殊方法，它专门用于创建新的 Node.js 进程，并且允许父子进程之间进行 IPC（进程间通信）。


`fork()` 启动的子进程是一个独立的 Node.js 进程，且可以通过 `message` 事件进行消息传递。


##### 示例


假设我们有一个 `child.js` 文件，内容如下：


```JavaScript
// child.js
process.on('message', (msg) => {
  console.log(`子进程接收到消息: ${msg}`);
  process.send(`你好，父进程！`);
});
```


然后，我们在父进程中使用 `fork()` 来启动这个子进程并与它通信：


```JavaScript
// main.js
const { fork } = require('child_process');

// 创建一个新的子进程，运行 child.js
const child = fork('./child.js');

// 向子进程发送消息
child.send('你好，子进程！');

// 接收子进程发来的消息
child.on('message', (msg) => {
  console.log(`父进程接收到消息: ${msg}`);
});
```


在这个例子中，父进程启动了 `child.js` 子进程，并通过 `send()` 和 `message` 事件来实现进程间的消息传递。


#### `spawn()` 与 `exec()` 的区别


- **`exec()`**：

  - 适合执行简单、短命令（如 shell 命令），一次性返回结果。
  - `exec()` 将整个命令的输出缓存在内存中，可能会导致内存溢出问题。
- **`spawn()`**：

  - 适合执行长时间运行的任务或需要流式处理数据的任务。
  - `spawn()` 是基于数据流的，输出和输入是通过流的方式处理，不会占用大量内存。


#### 总结


- **`exec()`**：用于执行外部命令，适合短时间的任务，返回的是标准输出和错误输出。
- **`spawn()`**：适用于长时间运行的任务，支持流式数据传输，可以持续监听输出。
- **`fork()`**：用于创建新的 Node.js 子进程，允许父子进程之间进行消息传递，是多进程并发任务的常用方式。


#### 使用子进程的场景


- **并行执行任务**：当有多个任务需要并行处理时，可以使用 `spawn()` 或 `fork()` 来创建多个子进程，从而提高应用的并发能力。
- **执行外部命令或脚本**：使用 `exec()` 来执行外部的 shell 命令、调用外部工具等。
- **分离任务**：如果一个任务可能导致崩溃或阻塞主进程，可以将其放入子进程中运行，以确保主进程的健壮性。


子进程在 Node.js 中提供了一种非常强大的方式来处理 CPU 密集型任务或与外部系统集成，从而增强了单线程的 Node.js 应用的并行处理能力。

## 六、面试真题

### 为什么有时使用 `node:fs`，而有时使用 `fs`？


**答案：**


1. **历史使用 `fs`**：

   - 在 Node.js 早期版本中，核心模块（如 `fs`、`path`、`http`）直接使用模块名称即可：`require('fs')`。这种方式简单且直观，是 Node.js 项目中长期以来的标准做法。


1. **引入 `node:`**命名空间（如 **`node:fs`** ）：

   - 在 Node.js 14 及之后的版本中，Node.js 引入了 `node:` 命名空间。这种做法主要是为了 \*\*明确区分核心模块和第三方模块\*\*。
   - 使用 `node:` 前缀可以保证你正在引用的是 Node.js 的核心模块，而不是一个意外安装的第三方模块（或用户定义的同名模块）。
   - 例如，如果项目中安装了一个第三方模块也叫 `fs`，那么 `require('fs')` 有可能会引用第三方模块，而不是 Node.js 的核心模块。通过使用 `require('node:fs')`，可以确保引用的总是 Node.js 提供的 `fs` 模块，而不会受其他模块影响。


**使用场景对比**


- **`fs`**（无前缀）：

  - 这种方式一直以来都是 Node.js 的默认引入方式，主要用于向后兼容。
  - 如果你确定项目中没有与核心模块同名的第三方模块，或者你希望代码能够兼容旧版本的 Node.js，那么使用 `require('fs')` 是完全可以接受的。


- **`node:fs`**（有 `node:` 前缀）：

  - 这种方式在 Node.js 14 及之后推荐使用，尤其适合防止潜在的命名冲突。
  - 在你需要确保安全引用核心模块时，或者你希望代码更具现代性且可以避免未来的模块冲突，建议使用 `node:` 前缀的方式。


**示例**


- **传统方式（无命名空间）**：

  ```JavaScript
  const fs = require('fs');
  
  fs.readFile('./example.txt', 'utf8', (err, data) => {
    if (err) throw err;
    console.log(data);
  });
  ```


- **命名空间导入方式（带 `node:`** 前缀）：

  ```JavaScript
  const fs = require('node:fs');
  
  fs.readFile('./example.txt', 'utf8', (err, data) => {
    if (err) throw err;
    console.log(data);
  });
  ```


**哪个更好？**


- **兼容性考虑**：如果你需要支持 Node.js 14 之前的版本，建议继续使用 `require('fs')`，因为 `node:` 命名空间在这些版本中并不支持。
- **现代实践**：如果你主要使用的是 Node.js 14 及更高版本，并且希望确保核心模块不被覆盖，`node:` 命名空间是一种更好的实践。


### 什么是 Buffer 和 Streams？两者有什么区别？


**答案**：


**Buffer** 和 **Streams** 都是用于处理二进制数据的核心模块，在处理文件、网络请求等 I/O 操作时非常重要。两者虽然相关，但用途和工作方式有很大区别。


#### **Buffer**

- **Buffer** 是用于处理二进制数据的临时存储区。它可以存储一段固定大小的二进制数据。由于 JavaScript 原生处理的是字符串类型，因此 `Buffer` 允许我们在不使用字符串的情况下操作原始字节数据。
- 在 Node.js 中，`Buffer` 类常用于一次性读取或写入数据，尤其是在文件操作、网络通信或加密处理时。
- **Buffer 的特点**：

  - 它在内存中分配固定大小的空间，并且数据一旦加载到 Buffer 中，就全部在内存中，适合一次性处理的数据。
  - 数据量较大时容易造成内存压力，因为它一次性将所有数据都加载到内存中。

**示例：**

```JavaScript
const fs = require('fs');

// 读取文件并返回 Buffer
fs.readFile('example.txt', (err, data) => {
  if (err) throw err;
  console.log(data);  // 输出的是二进制数据的 Buffer
});
```


#### **Streams**

- **Streams** 是处理数据的另一种方式，适合处理 **大数据量** 或 **连续流动的数据**，比如读取大文件、网络数据流等。Stream 是分段处理数据的，数据块被逐步加载和处理，内存占用更少。
- Node.js 中的 Stream 可以是可读、可写、双工（既可读又可写）、变换（数据经过某种转换）的流。
- **Streams 的特点**：

  - Stream 是“懒加载”的，数据只有在需要时才会被读取，这意味着处理大型文件时不会一次性占用大量内存。
  - 可以实时处理数据，比如实时处理 HTTP 响应、文件流等。


**示例：**

```JavaScript
const fs = require('fs');

// 使用 Stream 读取文件
const readStream = fs.createReadStream('example.txt');

readStream.on('data', (chunk) => {
  console.log(`读取到数据块: ${chunk}`);
});

readStream.on('end', () => {
  console.log('文件读取完毕');
});
```


**区别：**

- **Buffer**：一次性将数据全部加载到内存中，适用于小数据量的处理。
- **Streams**：将数据分块读取，适用于大数据量的逐步处理，更加节省内存。


### 进程与子进程的区别及使用场景？


**答案**：


在 Node.js 中，**进程（Process）**和 **子进程（Child Process）** 是用于处理并发任务的核心概念。Node.js 是单线程的，但是可以通过创建子进程来处理 CPU 密集型任务或执行外部命令，避免阻塞事件循环。


**进程（Process）**：

- **进程** 是运行中的程序实例，每个 Node.js 应用程序运行时都是一个独立的进程。进程中包含了代码、运行时上下文、系统资源等。
- Node.js 通过全局的 `process` 对象与当前运行的进程进行交互，比如获取命令行参数（`process.argv`）、获取环境变量（`process.env`）、退出进程（`process.exit()`）等。


**子进程（Child Process）**：

- **子进程** 是由主进程派生出来的，用于执行独立的任务。Node.js 提供了 `child_process` 模块来创建和管理子进程，常见的子进程类型包括：

  - `exec()`：执行一个 shell 命令，并返回标准输出。
  - `spawn()`：启动一个新的进程，并允许流式传输数据，适用于长时间运行的任务。
  - `fork()`：专门用于创建新的 Node.js 子进程，并允许与子进程进行进程间通信（IPC）。

**子进程的使用场景**：

- **执行外部命令**：比如调用 shell 命令或其他外部程序，可以使用 `exec()`。
- **处理 CPU 密集型任务**：例如大文件压缩、图片处理等，可以通过 `spawn()` 创建子进程并将这些任务移交给子进程处理，防止阻塞主线程。
- **多进程通信**：`fork()` 提供了与子进程之间进行通信的功能，适合需要父子进程协作的场景。


1. **exec() 示例**：

```JavaScript
const { exec } = require('child_process');

// 执行 shell 命令，列出当前目录下的文件
exec('ls -lh', (error, stdout, stderr) => {
  if (error) {
    console.error(`执行错误: ${error}`);
    return;
  }
  console.log(`标准输出: ${stdout}`);
});
```


1. **spawn() 示例**：

```JavaScript
const { spawn } = require('child_process');

// 创建子进程，执行 `ls -lh` 命令
const ls = spawn('ls', ['-lh']);

// 子进程的标准输出
ls.stdout.on('data', (data) => {
  console.log(`输出: ${data}`);
});

// 子进程的错误输出
ls.stderr.on('data', (data) => {
  console.error(`错误: ${data}`);
});

// 子进程结束
ls.on('close', (code) => {
  console.log(`子进程退出，退出码: ${code}`);
});
```


1. **fork() 示例**：

```JavaScript
const { fork } = require('child_process');

// 创建子进程，执行子文件 `child.js`
const child = fork('./child.js');

// 向子进程发送消息
child.send('Hello, child process!');

// 接收子进程发来的消息
child.on('message', (msg) => {
  console.log(`父进程收到消息: ${msg}`);
});
```


**进程与子进程的区别**：

- **进程**：是 Node.js 应用程序的运行实例，可以通过全局 `process` 对象进行交互。
- **子进程**：是从主进程中派生出来的独立执行任务的进程，适用于并发任务、CPU 密集型任务等场景。


**总结**：

- **进程** 是运行中的程序实例，通过 `process` 模块与其进行交互。
- **子进程** 是为了并行任务处理或执行外部命令，Node.js 提供了 `child_process` 模块来创建和管理子进程。


### 请说说 child_process 和 cluster 的区别？


`child_process` 和 `cluster` 是 Node.js 中用于进程管理的模块，它们在创建、管理子进程和处理多核并发任务时发挥着重要作用，但各自的功能和应用场景有所不同。以下是两者的详细区别：


**基本概念**


- **`child_process`**：

  - `child_process` 模块用于创建和控制子进程，可以执行系统命令、脚本或启动其他 Node.js 进程。它提供了多种方法（如 `exec`, `spawn`, `fork`, `execFile`）来创建子进程，并允许父进程与子进程进行通信。


- **`cluster`**：

  - `cluster` 模块专注于利用多核 CPU 来提高 Node.js 应用的并发性能。它通过 `child_process` 模块创建子进程（称为工作进程或 worker），这些工作进程共享同一个服务器端口，实现负载均衡的效果。


**实现机制**


- **`child_process`**的机制：

  - 允许创建完全独立的子进程，子进程可以是任何可执行文件、脚本或 Node.js 实例。
  - 子进程有自己独立的内存、运行环境，与父进程之间可以通过标准输入/输出、管道等方式进行通信。
  - 常用的创建子进程的方法包括：
  
    - `spawn()`: 用于执行命令，适合长时间运行的任务。
    - `exec()`: 用于执行命令，并将执行结果作为回调返回，适合短时间运行任务。
    - `fork()`: 专门用于创建 Node.js 子进程，允许父子进程之间通过内置消息传递机制通信。
    - `execFile()`: 用于执行特定文件，不像 `exec()` 会使用 shell。


- **`cluster`** 的机制：

  - `cluster` 利用 `child_process.fork()` 创建多个工作进程，每个工作进程都是独立的 Node.js 进程。
  - 这些工作进程通过 `cluster` 模块管理，共享同一个服务器端口，进行请求的负载均衡。
  - `cluster` 模块内置有主进程（master）和工作进程（worker）的概念，主进程负责管理和协调工作进程的创建、通信和终止。


**进程管理与通信**


- **`child_process`**：

  - 进程之间可以通过 `stdin`, `stdout`, `stderr` 进行通信，`fork()` 还支持基于消息的进程间通信（IPC）。
  - 需要开发者手动管理子进程的生命周期和错误处理。
  - 更灵活，适用于自定义进程创建和与非 Node.js 程序的集成。


- **`cluster`**：

  - 工作进程通过 `cluster.fork()` 创建，由主进程统一管理，自动处理负载均衡。
  - 进程间通信也通过 IPC 管道进行，但 `cluster` 会自动为工作进程分配连接请求。
  - 主要用于服务器环境下的多进程并发，不需要手动实现负载均衡逻辑。


**性能与应用场景**


- **`child_process`**：

  - 更灵活，可以用于创建任意子进程，不限于 Node.js。
  - 常用于执行外部命令、任务调度、与其他语言编写的程序交互等。
  - 性能依赖于具体实现，适合需要更多进程控制的场景。


- **`cluster`**：

  - 主要用于提升 Node.js 应用在多核 CPU 上的并发性能。
  - 适合 HTTP 服务器、WebSocket 服务器等需要处理大量并发请求的场景。
  - 性能优势在于自动进行负载均衡，但主要用于多进程架构的 Node.js 应用。


**错误处理**


- **`child_process`**：

  - 错误处理需要显式捕获子进程的事件，如 `error`, `exit` 等。
  - 子进程崩溃不会影响父进程，但可能需要额外的重启逻辑。


- **`cluster`**：

  - 主进程可以监听工作进程的崩溃，并自动重启失败的工作进程。
  - 提供更高的可靠性和自动化错误处理机制，适合稳定运行的服务。

## 补充资料

- 官方学习：https://nodejs.org/zh-cn/learn/manipulating-files/nodejs-file-stats
- 官方 API 速查：https://nodejs.org/docs/latest/api/
- package.json 速查：https://docs.npmjs.com/cli/v10/configuring-npm/package-json
- Volta：https://volta.sh/
- 多入口配置：https://nodejs.org/api/packages.html#package-entry-points
- 依赖版本控制：https://github.com/npm/node-semver#versions
