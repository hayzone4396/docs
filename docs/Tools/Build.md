---
title: 多场景构建工具选型
date: 2026-05-16 15:53:30
tags:
  - 构建工具
  - 工具
categories:
  - Tools
---

# 前端打包构建工具 — 多场景选型

> [!CAUTION] 本文档整理自飞书课程文档，涵盖模块化规范发展史、构建工具演进、核心工具对比分析及进阶实践。

## 一、构建工具解决什么问题？

1. **构建工具解决什么问题**：开发效率、模块依赖管理、兼容性转译、资源处理、产物优化、工程化（规范/质量/发布）。
2. **构建工具的演进脉络**：

- 初版任务运行器：Grunt / Gulp
- 打包时代的基石：Webpack（生态与能力“全集”）
- 更轻量/更偏库：Rollup
- 零配置与工程体验：Parcel
- “突破 JS 性能瓶颈”：esbuild（Go）/ SWC（Rust）
- 依托浏览器能力的 bundleless：Snowpack → Vite（开发阶段）
- Rust 新一代 bundler：rspack（Webpack 思路 + Rust 性能）

3. **模块化规范是理解构建工具的底层前提**：CommonJS / AMD / CMD / ESM / UMD。

## 2. 构建工具分层认知：任务运行器 vs 打包器 vs 编译器 vs 开发服务器

| 类别                                    | 代表工具                           | 核心职责                             | 典型产出                    |
| --------------------------------------- | ---------------------------------- | ------------------------------------ | --------------------------- |
| 任务运行器（Task Runner）               | Grunt、Gulp                        | 串联“编译/压缩/复制/监听/刷新”等任务 | 若干中间文件 + 最终静态资源 |
| 打包器（Bundler）                       | Webpack、Rollup、Parcel、rspack    | 构建依赖图、打包、代码分割、资源处理 | bundle（或 chunks）         |
| 编译器 / 转译器（Compiler/Transformer） | Babel、SWC、esbuild                | 语法转译、压缩、部分打包能力         | JS/CSS 等编译后文件         |
| 开发服务器（Dev Server）                | Vite、Webpack Dev Server、Snowpack | 本地开发加载、HMR、依赖预构建/缓存   | 开发态按需编译输出          |

**关键理解**：

- “Vite 很快”很大一部分来自开发态利用浏览器 ESM + 依赖预构建（esbuild）+ 按需编译，而非“全量打包一次”。
- Webpack 强在**可定制 + 生态齐全**，代价是**配置复杂 + 大项目构建较慢**。

---

## 二、模块化规范

### 2.1 模块化雏形

在 JavaScript 发展初期，仅用于实现简单的页面交互逻辑。随着 Web 2.0 时代的到来、Ajax 技术的广泛应用以及 jQuery 等前端库层出不穷，前端代码日益膨胀，模块化管理成为刚需。

模块化解决的三个核心问题：

1. **外部模块的管理**
2. **内部模块的组织**
3. **模块源码到目标代码的编译和转换**

#### 模块化的目的

- 将复杂程序依据规则封装成几个块（文件），并组合在一起
- 块的内部数据与实现是私有的，只向外部暴露接口与其它模块通信

#### 模块化的进化过程

| 阶段                   | 方式                       | 优点                               | 缺点                               |
| ---------------------- | -------------------------- | ---------------------------------- | ---------------------------------- |
| **全局 function 模式** | 不同功能封装成不同全局函数 | 简单直接                           | 污染全局命名空间，容易命名冲突     |
| **namespace 模式**     | 简单对象封装               | 减少全局变量，解决命名冲突         | 数据不安全，外部可直接修改内部数据 |
| **IIFE 模式**          | 匿名函数自调用（闭包）     | 数据私有，外部只能通过暴露方法操作 | 模块间依赖关系不明确               |
| **IIFE 模式增强**      | 传入依赖参数（如 jQuery）  | 模块独立，依赖关系明显             | 需手动管理脚本加载顺序             |

#### 模块化的好处

- 避免命名冲突（减少命名空间污染）
- 更好的分离，按需加载
- 更高复用性
- 高可维护性

#### 引入多个 script 后的问题

- **请求过多**：依赖多个模块就会发送多个请求
- **依赖模糊**：不清楚模块间依赖关系，加载顺序容易出错
- **难以维护**：牵一发而动全身

### 2.2 模块化发展时间线

| 年份 | 事件                                                                                     |
| ---- | ---------------------------------------------------------------------------------------- |
| 2009 | **CommonJS** 规范发起（ServerJS 项目更名），成为 Node.js 模块定义参照                    |
| 2011 | **RequireJS 1.0** 发布，提供异步加载模块能力，**AMD** 规范诞生                           |
| 2013 | **Grunt、Gulp** 第一版发布；**Browserify** 发布                                          |
| 2014 | **UMD** 发布；**Babel**（原 6to5）发布；**SystemJS** 发布；**Webpack** 首个稳定版发布    |
| 2015 | **ES6（ES2015）** 正式发布，首次从语言规范定义模块化；**Rollup** 发布，提供 Tree Shaking |
| 2017 | **Parcel** 发布，零配置打包工具                                                          |
| 2019 | **Snowpack** 将 node_modules 转为 ESM 的构建工具出现                                     |
| 2020 | **esbuild** 出现；**Snowpack** 内置使用 esbuild                                          |
| 2021 | **Vite** 发布                                                                            |

### 2.3 模块化规范详解

#### CommonJS

- **适用环境**：服务端（Node.js）
- **特点**：同步加载模块
- **语法**：`module.exports` / `require()`
- **加载机制**：运行时加载，输出的是**值的拷贝**

```javascript
// 定义模块
module.exports = {
  getMsg() {
    return 'hello';
  },
};

// 使用模块
const service = require('./module');
service.getMsg();
```

#### AMD（Asynchronous Module Definition）

- **适用环境**：浏览器端
- **代表实现**：RequireJS
- **特点**：异步加载，依赖前置
- **语法**：`define()` / `require()`

```javascript
// 定义模块
define(['dependency'], function (dependency) {
  return {
    showMsg() {
      /* ... */
    },
  };
});

// 使用模块
require(['alerter'], function (alerter) {
  alerter.showMsg();
});
```

#### CMD（Common Module Definition）

- **适用环境**：浏览器端
- **代表实现**：Sea.js
- **特点**：异步加载，**依赖就近**，延迟执行
- **语法**：`define(function(require, exports, module) { })`

```javascript
define(function (require, exports, module) {
  // 依赖就近
  var module2 = require('./module2');
  // 异步加载
  require.async('./module3', function (m3) {
    /* ... */
  });
  exports.xxx = value;
});
```

#### ESModule

- **适用环境**：浏览器 + 服务端（通用）
- **特点**：编译时确定依赖关系，输出**值的引用**
- **语法**：`export` / `import`

```javascript
// 分别暴露
export function foo() {
  /* ... */
}

// 默认暴露
export default function () {
  /* ... */
}

// 引入
import { foo } from './module';
import customName from './module';
```

**ESModule 与 CommonJS 的核心差异：**

1. CommonJS 输出**值的拷贝**，ESModule 输出**值的引用**
2. CommonJS 是**运行时加载**，ESModule 是**编译时输出接口**

#### UMD（Universal Module Definition）

- **适用环境**：通用（兼容所有环境）
- **特点**：同时满足 CommonJS、AMD、CMD 标准

```javascript
(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(); // CommonJS
  } else if (typeof define === 'function' && define.amd) {
    define(factory); // AMD
  } else {
    root.umdModule = factory(); // 全局变量
  }
})(this, function () {
  return { name: 'UMD模块' };
});
```

### 2.4 模块化规范对比

| 特性             | CommonJS | AMD       | CMD            | ESModule      | UMD    |
| ---------------- | -------- | --------- | -------------- | ------------- | ------ |
| **运行环境**     | 服务端   | 浏览器    | 浏览器         | 通用          | 通用   |
| **加载方式**     | 同步     | 异步      | 异步           | 编译时        | 自适应 |
| **依赖声明**     | 运行时   | 依赖前置  | 依赖就近       | 静态声明      | 自适应 |
| **输出方式**     | 值的拷贝 | 返回值    | module.exports | 值的引用      | 自适应 |
| **Tree Shaking** | ❌       | ❌        | ❌             | ✅            | ❌     |
| **代表工具**     | Node.js  | RequireJS | Sea.js         | 原生/构建工具 | —      |

### 2.5 构建产物模块化标准（面试重点）

1. **CommonJS**：主要用于服务端，同步加载不适合浏览器
2. **AMD**：浏览器异步加载，但开发成本高，代码阅读困难
3. **CMD**：依赖就近，延迟执行，容易在 Node.js 中运行
4. **ESModule**：语言标准层面的模块功能，可取代 CommonJS 和 AMD，成为通用方案
5. **UMD**：同时满足 CommonJS、AMD、CMD 标准

---

## 三、构建工具演进与分类

构建工具的发展可以分为以下几代：

```
初版构建工具（Grunt/Gulp）
    ↓
现代打包构建工具基石（Webpack）
    ↓
基于 Webpack 改进的构建工具（Rollup/Parcel）
    ↓
突破 JavaScript 语言的构建工具（esbuild/SWC）← Go/Rust 实现
    ↓
基于 ES Module 的 bundleless 构建工具（Snowpack/Vite/Rspack）
```

**Bundle vs Bundleless 核心区别：**

| 特性         | Bundle（Webpack/Rollup） | Bundleless（Vite/Snowpack） |
| ------------ | ------------------------ | --------------------------- |
| **开发模式** | 启动时打包所有依赖       | 按需编译，毫秒级启动        |
| **HMR 速度** | 较慢（需重新打包）       | 极快（只编译当前文件）      |
| **依赖处理** | 递归遍历依赖树           | 浏览器原生 ESM 请求         |
| **生产构建** | 成熟的优化方案           | 通常回退到 Rollup/esbuild   |

**Bundleless 诞生的前提条件：**

- **HTTP2**：多路复用，同域名无并发请求限制
- **浏览器 ESM**：主流浏览器（Chrome/Edge/Firefox/Safari）均支持 `<script type="module">`

---

## 四、常见构建工具详解

### 4.1 初版构建工具

#### Grunt

- **定位**：The JavaScript Task Runner
- **特点**：基于配置的任务执行，每个任务需创建中间文件传递结果
- **缺点**：不支持 HMR、Scope Hoist 等现代特性
- **现状**：已被淘汰，仅作了解

#### Gulp
>[!TIP] 更像“自动化流水线”，适合做各种零散构建任务；不主打模块打包。

- **定位**：基于流的自动化构建工具
- **特点**：代码驱动（vs Grunt 的配置驱动），使用 Node.js 流实现高效文件处理
- **优点**：灵活性高，社区庞大
- **缺点**：需要较多配置，不负责模块打包（需配合 Webpack/Rollup）
- **适用场景**：自动化任务（编译 CSS、压缩图片、热重载等）

### 4.2 Webpack（现代构建基石）

>[!NOTE] Webpack 是现代前端打包工具的基石，详见专门的 Webpack 课程文档。

- **定位**：高度可配置的模块打包器
- **核心能力**：代码拆分、懒加载、HMR、持久缓存
- **优点**：高度可定制，生态系统完善，社区庞大
- **缺点**：配置复杂，打包速度较慢（大型项目）
- **适用场景**：大型复杂 SPA，需要高度自定义的项目

**Webpack 打包代码复杂的原因：**

- 诞生于 ESM 标准之前，使用 IIFE 实现模块作用域隔离
- 需要在浏览器中模拟 CommonJS 的 `require` 和 `module.exports`
- 为兼容早期 CJS npm 包，保留了 IIFE 结构和代码注入

### 4.3 Rollup

- **定位**：专注于 ES 模块的打包工具
- **特点**：轻量化，生成代码保持原始状态，无额外注入
- **核心优势**：原生 Tree Shaking，生成代码简洁
- **缺点**：生态系统较小，缺乏 devServer 和 HMR，不适合大型应用开发
- **适用场景**：构建 JavaScript 库/模块（Vue、React、Angular 源码均使用 Rollup）

**Webpack vs Rollup 打包差异：**

| 维度           | Webpack              | Rollup           |
| -------------- | -------------------- | ---------------- |
| **设计时期**   | ESM 标准之前         | ESM 标准之后     |
| **模块隔离**   | IIFE（立即执行函数） | ESM 原生         |
| **CJS 兼容**   | 注入大量模拟代码     | 无需（原生 ESM） |
| **代码体积**   | 较大（含运行时）     | 精简             |
| **构建速度**   | 较慢                 | 明显更快         |
| **配置复杂度** | 高                   | 简单             |
| **适用场景**   | 应用开发             | 库开发           |

### 4.4 Parcel

- **定位**：零配置打包器
- **特点**：开箱即用，多核处理 + 文件系统缓存
- **优点**：零配置，速度快，自动处理依赖
- **缺点**：定制性有限，社区和插件较少
- **适用场景**：个人项目、原型开发、小型应用

### 4.5 Esbuild

- **定位**：极快的 JavaScript 打包器（Go 语言实现）
- **核心优势**：比 Babel 快 **200 倍以上**

**Esbuild 极速的原因：**

| 因素              | 说明                                                     |
| ----------------- | -------------------------------------------------------- |
| **Go 语言编译型** | 编译阶段转译为机器码，无需解释器逐行翻译                 |
| **多线程支持**    | Go 天生多线程，多线程共享内存空间                        |
| **全量定制**      | 重写所有编译流程（JS/TS/JSX/JSON），放弃类型检查仅做转换 |
| **结构一致性**    | 各编译阶段共享相似 AST 结构，减少字符串与 AST 间转换     |

**Esbuild 特性：**

- 极快的构建速度，无需缓存
- 支持 ES6 和 CommonJS 模块
- 支持 ES6 模块 Tree Shaking
- 兼容 TypeScript 和 JSX 语法
- 支持 Source maps 和代码压缩
- 支持插件系统（4 个钩子：onResolve、onLoad、onStart、onEnd）

**基本使用：**

```bash
# 安装
npm install --save-exact --save-dev esbuild

# 打包
esbuild app.jsx --bundle --outfile=out.js

# 生产构建
esbuild app.jsx --bundle --minify --sourcemap --target=chrome58,firefox57,safari11,edge16
```

```javascript
// JavaScript API
import * as esbuild from 'esbuild';
await esbuild.build({
  entryPoints: ['app.jsx'],
  bundle: true,
  outfile: 'out.js',
});
```

### 4.6 SWC

- **定位**：Rust 实现的快速 Web 编译器，对标 Babel
- **特点**：多线程技术提升编译性能
- **配置**：与 Babel 相似，使用 `.swcrc` 配置文件
- **现状**：仍在完善中，部分功能（TypeScript 支持）尚不完善

  >[!IMPORTANT] SWC 由 Rust 实现，目标对标 Babel（甚至替代），支持多线程与插件；可通过 `.swcrc` 配置，也提供 CLI/API，并存在打包方向（spack/swpack 相关演进需跟进）

```bash
# 安装
npm i -D @swc/cli @swc/core

# 编译
npx swc source.js -o dist.js
```

### 4.7 Snowpack

- **定位**：轻量级免打包式开发构建工具
- **核心思路**：开发时免打包，每个文件只构建一次并缓存
- **npm 依赖处理**：将 npm 包单独打包为 ESM，可直接在浏览器运行
- **内置 esbuild**：默认使用 esbuild 编译 TypeScript/JSX
- **现状**：已被 Vite 取代，仅作了解

### 4.8 Vite

- **定位**：基于 ESM 的下一代前端构建工具
- **开发模式**：利用浏览器原生 ESM，按需编译，毫秒级启动
- **生产构建**：使用 Rollup 打包
- **优点**：极快的开发体验，现代化打包方式，配置简单
- **缺点**：生态系统较新，复杂项目可能需结合其他工具
- **适用场景**：Vue/React 现代前端开发，快速迭代项目

### 4.9 Rspack

- **定位**：基于 Rust 的高性能构建工具（字节跳动开源）
- **设计灵感**：Webpack，配置和插件机制高度兼容
- **核心优势**：
  - Rust 高性能 + 内存安全
  - 天生多线程并行处理
  - 高效依赖分析与缓存
  - 与 Webpack 高度兼容，迁移成本低

```bash
# 安装
npm install --save-dev @rspack/core @rspack/cli @rspack/plugin-react
```

---

## 五、构建工具全面对比

### 5.1 核心特性对比
1. 简要报告

| 工具        | 语言       | 定位         | 配置复杂度 | 构建速度         | Tree Shaking  | HMR | 代码拆分 | 插件生态       |
| ----------- | ---------- | ------------ | ---------- | ---------------- | ------------- | --- | -------- | -------------- |
| **Grunt**   | JS         | 任务运行器   | 中         | 慢               | ❌            | ❌  | ❌       | 中             |
| **Gulp**    | JS         | 任务运行器   | 中         | 中               | ❌            | ❌  | ❌       | 大             |
| **Webpack** | JS         | 模块打包器   | 高         | 慢               | ✅            | ✅  | ✅       | 非常大         |
| **Rollup**  | JS         | 库打包器     | 低         | 中               | ✅（ESM原生） | ❌  | ✅       | 中             |
| **Parcel**  | JS         | 零配置打包   | 极低       | 快               | ✅            | ✅  | ✅       | 小             |
| **Esbuild** | Go         | 极速编译器   | 低         | **极快**         | ✅            | ❌  | ✅       | 小             |
| **SWC**     | Rust       | Babel 替代   | 低         | **极快**         | ❌            | ❌  | ❌       | 小             |
| **Vite**    | JS/ESBuild | 现代构建工具 | 低         | **极快（开发）** | ✅            | ✅  | ✅       | 大（快速增长） |
| **Rspack**  | Rust       | Webpack 替代 | 中         | **极快**         | ✅            | ✅  | ✅       | 兼容 Webpack   |

2. 文字描述

| 工具    | 定位                                  | 优点                                           | 缺点/风险                                            | 更推荐的场景                                           |
| ------- | ------------------------------------- | ---------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| Grunt   | 早期任务运行器                        | 插件多、能串任务                               | 中间文件多、工程感弱、现代能力不足                   | 了解历史即可                                           |
| Gulp    | 流式任务运行器                        | 灵活、可编程、做自动化任务方便                 | 仍偏“任务”而非“模块打包”；现代项目使用少             | 构建流程里有大量自定义任务（图片/文档/资源流水线）     |
| Webpack | 全能 bundler                          | 生态最成熟、可满足复杂需求（loader/plugin）    | 配置复杂；大项目初次/全量构建慢                      | 企业级 SPA/MPA、需要深度定制、历史包袱/存量项目        |
| Rollup  | 轻量 bundler（偏库）                  | 产物更简洁；tree-shaking 强；配置相对简单      | devServer/HMR 能力弱；处理非 JS 资源需额外插件       | JS 库/组件库/SDK 打包；中小项目                        |
| Parcel  | 零配置 bundler                        | 上手快；缓存/多核；工程体验友好                | 深度定制能力弱；生态相对弱                           | Demo/原型/小项目                                       |
| Vite    | Dev Server + Bundler（生产用 Rollup） | 开发体验极快；配置更直观                       | 生态仍在演进；复杂场景需额外工程化                   | 新项目优先；Vue/React；追求迭代速度                    |
| esbuild | 高性能编译/打包工具                   | 速度极快（Go + 多线程 + 流程全重写）；API 简洁 | 生态/能力边界与成熟 bundler 不同；部分框架生态需评估 | 依赖预构建、构建加速、做工具底座（tsup/vite 预构建等） |
| SWC     | 高性能转译器（Rust）                  | 目标对标 Babel；多线程；可作为 babel 替代      | 功能成熟度需评估；插件生态与 Babel 不同              | 替换 Babel、提升转译速度（含 swc-loader 等）           |
| rspack  | Rust bundler（Webpack-like）          | 性能提升明显；配置思路接近 Webpack             | 兼容性与生态完善度需跟进                             | 需要 Webpack 思路但更快的新项目/团队尝试               |

### 5.2 适用场景对比

| 场景                      | 推荐工具         | 原因                                    |
| ------------------------- | ---------------- | --------------------------------------- |
| 大型复杂 SPA              | Webpack / Rspack | 强大的配置能力，丰富的插件生态          |
| JavaScript 库开发         | Rollup           | 原生 Tree Shaking，输出代码精简         |
| 快速原型/小型项目         | Parcel / Vite    | 零配置或低配置，开箱即用                |
| 现代框架开发（Vue/React） | Vite             | 极快的开发体验，框架官方推荐            |
| 任务自动化                | Gulp             | 灵活的流处理，适合 CSS 编译、图片压缩等 |
| 需要极致构建速度          | Esbuild / Rspack | Go/Rust 实现，性能远超 JS 工具          |
| Webpack 项目迁移          | Rspack           | 高度兼容 Webpack 配置和插件             |

### 5.3 性能对比（Esbuild vs Babel）

构建相同内容（TypeScript 源码），Esbuild 比 Babel 快 **200 倍以上**：

| 工具    | 构建时间 |
| ------- | -------- |
| Babel   | ~20s     |
| Esbuild | ~0.08s   |

---

## 六、构建工具选型指南

选择打包构建工具时，需综合考虑以下因素：

### 6.1 决策维度

| 维度                 | 考量点                                                                      |
| -------------------- | --------------------------------------------------------------------------- |
| **项目规模与复杂度** | 大型 SPA → Webpack/Rspack；库 → Rollup；小型 → Parcel/Vite                  |
| **开发体验**         | 快速迭代 → Vite；零配置 → Parcel                                            |
| **团队技术栈**       | 团队熟悉度优先；特定框架支持（Vite 对 Vue/React 开箱即用）                  |
| **项目需求**         | MPA → Webpack；现代化兼容 → Rollup/Vite                                     |
| **性能与优化**       | 体积优化 → Rollup（Tree Shaking）；速度优化 → Vite（开发）/ Webpack（生产） |
| **生态系统**         | 特殊需求 → Webpack（插件最丰富）；新项目 → Vite（快速发展）                 |
| **任务自动化**       | 图片压缩、文件监听等 → Gulp                                                 |

### 6.2 选型决策流程

```
开始
  ↓
是否构建 JavaScript 库？ → 是 → Rollup
  ↓ 否
项目是否已有 Webpack 配置且稳定？ → 是 → 继续使用 Webpack / 考虑迁移 Rspack
  ↓ 否
是否新项目且使用 Vue/React？ → 是 → Vite
  ↓ 否
是否需要零配置快速启动？ → 是 → Parcel
  ↓ 否
是否需要极致构建性能？ → 是 → Esbuild / Rspack
  ↓ 否
是否需要高度自定义？ → 是 → Webpack
  ↓ 否
→ Vite（通用推荐）
```

---

## 七、进阶：esbuild 封装

### 7.1 封装目标

通过 esbuild 封装一个类似 tsup 的工具，需要处理：

1. 工程化设计
2. 基础 API 封装
3. TypeScript 支持
4. DTS 生成（借助 Rollup + rollup-plugin-dts）
5. CSS 等静态资源处理
6. Chunk 与 Tree Shaking
7. 落地优化与发布

### 7.2 项目结构

```
miaoma-esbuilder/
├── src/
│   ├── cli.ts             # 命令行入口
│   ├── builder.ts         # 核心构建逻辑
│   ├── config.ts          # 配置文件解析
│   ├── plugins/           # 插件系统
│   └── utils.ts           # 工具函数
├── bin/
│   └── miaoma-esbuilder.js
├── examples/              # 示例项目
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

### 7.3 核心代码

**配置定义（config.ts）：**

```typescript
export interface Config {
  entry: string;
  outDir: string;
  format: ('esm' | 'cjs')[];
  minify: boolean;
  sourcemap: boolean;
  splitting: boolean;
}
```

**构建逻辑（builder.ts）：**

```typescript
import esbuild from 'esbuild';

export async function build(config: Config) {
  for (const fmt of config.format) {
    await esbuild.build({
      entryPoints: [config.entry],
      outdir: config.outDir,
      bundle: true,
      minify: config.minify,
      sourcemap: config.sourcemap,
      format: fmt,
      splitting: config.splitting,
      target: ['esnext', 'chrome58', 'firefox57'],
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      define: {
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'development',
        ),
      },
      loader: { '.png': 'file', '.svg': 'file', '.css': 'css' },
      watch: process.env.NODE_ENV === 'development',
    });
  }
}
```

### 7.4 DTS 生成方案

esbuild 不支持 DTS 生成，需借助 Rollup：

```javascript
const { dts } = require('rollup-plugin-dts');
const flatDts = require('rollup-plugin-flat-dts');

module.exports = [
  {
    input: 'src/main.ts',
    output: {
      clean: true,
      file: 'es/bundle.js',
      format: 'es',
      plugins: [flatDts({ compilerOptions: { declarationMap: true } })],
    },
  },
];
```

---

## 八、进阶：基于 Rust 的前端工具链

### 8.1 为什么用 Rust/Go 重写前端工具？

JavaScript 单线程 + 解释执行的特性导致构建性能瓶颈。Go/Rust 作为编译型语言，天生支持多线程，可将构建速度提升数十到数百倍。

### 8.2 Rust 工具链实践要点

1. **环境搭建**：使用 Cargo 创建和管理项目
2. **命令行参数**：使用 `clap` crate 处理 CLI 参数
3. **AST 解析**：使用 `oxc_parser` 进行 JavaScript/TypeScript 代码的 AST 解析
4. **构建发布**：`cargo build --release` 生成优化后的二进制文件

### 8.3 oxc_parser 示例

```rust
use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

fn main() -> Result<(), String> {
    let source_text = std::fs::read_to_string("test.js").unwrap();
    let allocator = Allocator::default();
    let source_type = SourceType::from_path(Path::new("test.js")).unwrap();
    let ret = Parser::new(&allocator, &source_text, source_type).parse();
    // 输出 AST
    println!("{}", serde_json::to_string_pretty(&ret.program).unwrap());
    Ok(())
}
```

---

## 九、补充资料

### 官方文档

| 资源                 | 链接                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| MDN 模块化规范       | https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules |
| 模块化规范详解       | https://zh.javascript.info/modules-intro                              |
| Grunt                | https://gruntjs.com                                                   |
| Gulp                 | https://gulpjs.com                                                    |
| Rollup               | https://rollupjs.org                                                  |
| Parcel               | https://parceljs.org/                                                 |
| SWC                  | https://swc.rs/                                                       |
| Esbuild              | https://esbuild.github.io/                                            |
| tsup（esbuild 封装） | https://tsup.egoist.dev                                               |
| Rspack               | https://rspack.dev/zh/                                                |
| Rolldown             | https://github.com/rolldown/rolldown                                  |
| Rust 基础语法        | https://doc.rust-lang.org/book/                                       |
| oxc_parser           | https://docs.rs/oxc_parser/latest/oxc_parser/                         |

### 面试高频问题

1. **Webpack 和 Rollup 打包后的代码有什么区别？**
   - Webpack 使用 IIFE 包裹模块，注入 CJS 模拟代码，产物较大
   - Rollup 基于 ESM，无额外注入，产物精简

2. **Esbuild 为什么这么快？**
   - Go 语言编译型 + 多线程 + 全量定制编译流程 + 结构一致性

3. **什么是 Bundleless？与 Bundle 有什么区别？**
   - Bundleless 在开发时利用浏览器原生 ESM，按需编译，不打包所有依赖
   - Bundle 在启动时递归遍历所有依赖并打包
4. **构建工具选型时，有哪些误区？**

- 误区 1：只按“构建速度”选工具  
  → 应该同时看：生态、可维护性、可调试性、团队能力、部署形态。
- 误区 2：把“开发态很快”当成“生产构建一定快”  
  → 生产构建还涉及压缩、分包策略、缓存、兼容、SSR/多入口等复杂度。
