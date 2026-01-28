---
title: 微前端完全指南
createTime: 2026-01-28 10:45:00
tags:
  - 微前端
  - 无界
  - 乾坤
  - Module Federation
  - 应用隔离
permalink: /architecture/micro-frontend-guide/
---

# 微前端完全指南

## 📅 文档信息

- **创建时间**：2026-01-28 10:45:00
- **核心主题**：微前端架构、无界（Wujie）、乾坤（qiankun）、应用通信、性能优化
- **适用场景**：大型单页应用、多团队协作、技术栈融合

## 一、微前端核心概念

### 1.1 什么是微前端？

> **微前端是将微服务理念应用于前端**，将单体前端应用拆分为多个独立的子应用，各子应用可独立开发、部署、运行。

```
传统单体应用：
┌────────────────────────────────────────┐
│          Monolithic Frontend           │
│  ┌────────┐ ┌────────┐ ┌────────┐     │
│  │ Module │ │ Module │ │ Module │     │
│  │   A    │ │   B    │ │   C    │     │
│  └────────┘ └────────┘ └────────┘     │
└────────────────────────────────────────┘
问题：耦合严重、技术栈统一、部署困难

微前端架构：
┌────────────────────────────────────────┐
│           Main Application             │
│  (主应用/基座)                          │
├────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  Sub-App │ │  Sub-App │ │Sub-App │ │
│  │  A (Vue) │ │B (React) │ │C (Ang.)│ │
│  └──────────┘ └──────────┘ └────────┘ │
└────────────────────────────────────────┘
优势：独立开发、技术栈无关、灵活部署
```

### 1.2 微前端解决的问题

| 问题 | 传统方案 | 微前端方案 |
|------|---------|-----------|
| **技术栈统一** | 全部使用同一框架 | 每个子应用独立选择 |
| **代码耦合** | 模块间强依赖 | 应用间解耦 |
| **部署风险** | 改动小功能也要全量发布 | 只发布修改的子应用 |
| **团队协作** | 代码冲突频繁 | 独立仓库、独立开发 |
| **包体积** | 单个巨大 bundle | 按需加载子应用 |
| **历史包袱** | 难以升级重构 | 逐步迁移 |

### 1.3 微前端实现方案对比

| 方案 | 技术栈 | 隔离方式 | 优势 | 劣势 |
|------|--------|---------|------|------|
| **iframe** | 无限制 | 浏览器原生隔离 | 完全隔离、简单 | 性能差、通信复杂、UI 不同步 |
| **qiankun** | 任意 | JS 沙箱 + CSS 隔离 | 生态成熟、阿里开源 | 沙箱机制复杂 |
| **无界（Wujie）** | 任意 | iframe + WebComponent | 隔离彻底、性能好 | 较新、生态小 |
| **Module Federation** | Webpack 5 | 运行时共享模块 | 性能最佳、官方支持 | 仅支持 Webpack 5 |
| **EMP** | 基于 MF | 运行时共享 | 简化配置 | 依赖 Webpack |

## 二、qiankun（乾坤）

### 2.1 核心原理

qiankun 基于 single-spa，提供了更完善的微前端解决方案。

**核心机制**：

```
┌──────────────────────────────────────────────┐
│             qiankun 工作流程                  │
├──────────────────────────────────────────────┤
│                                               │
│  1. 应用注册                                  │
│     ├─ 注册子应用（name、entry、路由）        │
│     └─ 配置生命周期钩子                       │
│                                               │
│  2. 应用加载                                  │
│     ├─ fetch 子应用 HTML                      │
│     ├─ 解析 HTML，提取 JS/CSS                 │
│     └─ 创建容器 DOM                           │
│                                               │
│  3. JS 沙箱                                   │
│     ├─ Proxy 沙箱（默认）                     │
│     ├─ 快照沙箱（不支持 Proxy 时）            │
│     └─ 隔离 window、document                  │
│                                               │
│  4. CSS 隔离                                  │
│     ├─ Shadow DOM（推荐）                     │
│     ├─ Scoped CSS                             │
│     └─ 动态添加/移除样式                      │
│                                               │
│  5. 应用通信                                  │
│     ├─ initGlobalState() 全局状态             │
│     ├─ props 传递                             │
│     └─ 自定义事件                             │
│                                               │
└──────────────────────────────────────────────┘
```

### 2.2 快速开始

#### 主应用配置

```javascript
// main/src/main.js
import { registerMicroApps, start } from 'qiankun';

// 注册子应用
registerMicroApps([
  {
    name: 'vue-app',           // 子应用名称
    entry: '//localhost:8081', // 子应用入口
    container: '#subapp-viewport', // 容器节点
    activeRule: '/vue',        // 激活路由
    props: {                   // 传递给子应用的数据
      msg: 'Hello from main app'
    }
  },
  {
    name: 'react-app',
    entry: '//localhost:8082',
    container: '#subapp-viewport',
    activeRule: '/react'
  }
], {
  // 生命周期钩子
  beforeLoad: app => console.log('before load', app.name),
  beforeMount: app => console.log('before mount', app.name),
  afterMount: app => console.log('after mount', app.name),
  beforeUnmount: app => console.log('before unmount', app.name),
  afterUnmount: app => console.log('after unmount', app.name)
});

// 启动 qiankun
start({
  sandbox: {
    strictStyleIsolation: true,  // 严格样式隔离（Shadow DOM）
    experimentalStyleIsolation: true // 实验性样式隔离（Scoped CSS）
  },
  prefetch: true,                 // 预加载
  singular: true                  // 单实例模式
});
```

#### 子应用配置（Vue）

```javascript
// vue-app/src/main.js
import Vue from 'vue';
import App from './App.vue';
import router from './router';

let instance = null;

// 渲染函数
function render(props = {}) {
  const { container } = props;

  instance = new Vue({
    router,
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app');
}

// 独立运行时直接渲染
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// qiankun 生命周期钩子
export async function bootstrap() {
  console.log('vue app bootstraped');
}

export async function mount(props) {
  console.log('props from main app', props);
  render(props);
}

export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = '';
  instance = null;
}
```

**Vue 子应用路由配置**：

```javascript
// vue-app/src/router.js
const router = new VueRouter({
  mode: 'history',
  // 关键：设置 base 为主应用的激活路由
  base: window.__POWERED_BY_QIANKUN__ ? '/vue' : '/',
  routes
});
```

**Vue 子应用打包配置**：

```javascript
// vue-app/vue.config.js
module.exports = {
  devServer: {
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*' // 允许跨域
    }
  },
  configureWebpack: {
    output: {
      library: 'vueApp',        // 库名称
      libraryTarget: 'umd',     // UMD 格式
      jsonpFunction: `webpackJsonp_vueApp` // 避免冲突
    }
  }
};
```

#### 子应用配置（React）

```javascript
// react-app/src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

function render(props) {
  const { container } = props;
  ReactDOM.render(
    <App />,
    container ? container.querySelector('#root') : document.getElementById('root')
  );
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

// qiankun 生命周期
export async function bootstrap() {}

export async function mount(props) {
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(
    container ? container.querySelector('#root') : document.getElementById('root')
  );
}
```

**React 子应用打包配置**：

```javascript
// react-app/config-overrides.js (使用 react-app-rewired)
module.exports = {
  webpack: (config) => {
    config.output.library = 'reactApp';
    config.output.libraryTarget = 'umd';
    config.output.jsonpFunction = 'webpackJsonp_reactApp';
    return config;
  },
  devServer: (configFunction) => {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.headers = {
        'Access-Control-Allow-Origin': '*'
      };
      return config;
    };
  }
};
```

### 2.3 JS 沙箱原理

qiankun 提供三种沙箱机制：

**1. Proxy 沙箱（默认，支持多实例）**

```javascript
class ProxySandbox {
  constructor() {
    this.proxyWindow = {};
    this.isRunning = false;

    const fakeWindow = Object.create(null);

    this.proxy = new Proxy(fakeWindow, {
      get: (target, prop) => {
        // 优先从 fakeWindow 读取
        if (prop in target) {
          return target[prop];
        }
        // 否则从真实 window 读取
        return window[prop];
      },

      set: (target, prop, value) => {
        if (this.isRunning) {
          // 写入 fakeWindow
          target[prop] = value;
        }
        return true;
      },

      has: (target, prop) => {
        return prop in target || prop in window;
      }
    });
  }

  active() {
    this.isRunning = true;
  }

  inactive() {
    this.isRunning = false;
  }
}

// 使用
const sandbox = new ProxySandbox();
sandbox.active();

// 在沙箱中执行代码
with (sandbox.proxy) {
  window.myVar = 'hello'; // 写入 fakeWindow
  console.log(window.myVar); // 读取 fakeWindow
}

sandbox.inactive();
console.log(window.myVar); // undefined（真实 window 未被污染）
```

**2. 快照沙箱（不支持 Proxy 时，单实例）**

```javascript
class SnapshotSandbox {
  constructor() {
    this.windowSnapshot = {};
    this.modifyPropsMap = {};
  }

  active() {
    // 保存 window 快照
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop];
    }

    // 恢复上次的修改
    Object.keys(this.modifyPropsMap).forEach(prop => {
      window[prop] = this.modifyPropsMap[prop];
    });
  }

  inactive() {
    // 记录修改
    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = window[prop];
        // 恢复 window
        window[prop] = this.windowSnapshot[prop];
      }
    }
  }
}
```

### 2.4 CSS 隔离方案

**1. Shadow DOM（推荐）**

```javascript
start({
  sandbox: {
    strictStyleIsolation: true // 启用 Shadow DOM
  }
});

// 原理：
// 1. 创建 Shadow DOM 容器
const shadowRoot = container.attachShadow({ mode: 'open' });

// 2. 将子应用挂载到 Shadow DOM
shadowRoot.appendChild(subAppRoot);

// 效果：子应用样式完全隔离，不会影响主应用
```

**2. Scoped CSS**

```javascript
start({
  sandbox: {
    experimentalStyleIsolation: true // 启用 Scoped CSS
  }
});

// 原理：动态添加前缀
// 子应用样式：
.button { color: red; }

// 转换为：
div[data-qiankun-子应用名] .button { color: red; }
```

**3. 手动隔离（BEM、CSS Modules）**

```css
/* 子应用使用 BEM 命名 */
.vue-app__button { color: red; }
.react-app__button { color: blue; }
```

### 2.5 应用间通信

**1. initGlobalState（全局状态）**

```javascript
// 主应用
import { initGlobalState } from 'qiankun';

const actions = initGlobalState({
  user: { name: 'admin' },
  token: 'xxx'
});

// 监听变化
actions.onGlobalStateChange((state, prev) => {
  console.log('state changed', state, prev);
});

// 修改状态
actions.setGlobalState({
  user: { name: 'new user' }
});

// 子应用
export async function mount(props) {
  // 监听
  props.onGlobalStateChange((state, prev) => {
    console.log('子应用收到状态变化', state);
  });

  // 修改
  props.setGlobalState({
    token: 'new-token'
  });
}
```

**2. props 传递**

```javascript
// 主应用
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:8081',
    container: '#subapp',
    activeRule: '/vue',
    props: {
      data: { count: 0 },
      onCountChange: (count) => {
        console.log('count changed', count);
      }
    }
  }
]);

// 子应用
export async function mount(props) {
  console.log('props:', props.data);
  props.onCountChange(10);
}
```

**3. 自定义事件总线**

```javascript
// shared/eventBus.js
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

export default new EventBus();

// 主应用
import eventBus from './shared/eventBus';

registerMicroApps([
  {
    name: 'vue-app',
    props: { eventBus }
  }
]);

eventBus.on('dataChange', (data) => {
  console.log('received:', data);
});

// 子应用
export async function mount(props) {
  props.eventBus.emit('dataChange', { msg: 'hello' });
}
```

### 2.6 性能优化

**1. 预加载**

```javascript
import { prefetchApps } from 'qiankun';

// 空闲时预加载子应用
prefetchApps([
  { name: 'vue-app', entry: '//localhost:8081' },
  { name: 'react-app', entry: '//localhost:8082' }
]);
```

**2. 手动加载**

```javascript
import { loadMicroApp } from 'qiankun';

// 手动控制加载时机
const microApp = loadMicroApp({
  name: 'vue-app',
  entry: '//localhost:8081',
  container: '#subapp'
});

// 卸载
microApp.unmount();
```

**3. 资源缓存**

```javascript
// 主应用：使用 import-html-entry 缓存
start({
  fetch: (url, ...args) => {
    // 自定义 fetch，添加缓存逻辑
    if (cache.has(url)) {
      return Promise.resolve(cache.get(url));
    }
    return window.fetch(url, ...args).then(response => {
      cache.set(url, response.clone());
      return response;
    });
  }
});
```

## 三、无界（Wujie）

### 3.1 核心原理

无界采用 **iframe + WebComponent** 方案，结合两者优势：

```
┌──────────────────────────────────────────────┐
│            无界架构设计                       │
├──────────────────────────────────────────────┤
│                                               │
│  ┌────────────────────────────────────┐     │
│  │      WebComponent 容器              │     │
│  │  ┌──────────────────────────────┐  │     │
│  │  │      iframe (JS 沙箱)         │  │     │
│  │  │   ├─ 执行子应用 JS             │  │     │
│  │  │   └─ 隔离 window/document    │  │     │
│  │  └──────────────────────────────┘  │     │
│  │  ┌──────────────────────────────┐  │     │
│  │  │   Shadow DOM (渲染容器)       │  │     │
│  │  │   └─ 渲染子应用 DOM           │  │     │
│  │  └──────────────────────────────┘  │     │
│  └────────────────────────────────────┘     │
│                                               │
│  优势：                                       │
│  ├─ iframe 天然 JS 隔离                       │
│  ├─ WebComponent 解决 iframe UI 问题         │
│  ├─ Shadow DOM 样式隔离                      │
│  └─ 性能优于纯 iframe                         │
│                                               │
└──────────────────────────────────────────────┘
```

**核心机制**：
- **iframe 作为 JS 沙箱**：隔离 window、document，执行子应用代码
- **WebComponent 作为容器**：解决 iframe 的 UI 同步问题
- **Shadow DOM**：承载子应用 DOM，样式隔离
- **劫持 DOM API**：将 iframe 内的 DOM 操作代理到 Shadow DOM

### 3.2 快速开始

#### 主应用配置

```javascript
// main/src/main.js
import WujieVue from 'wujie-vue3'; // Vue 3
// import WujieVue from 'wujie-vue2'; // Vue 2
// import WujieReact from 'wujie-react'; // React

const { setupApp, preloadApp, bus } = WujieVue;

// 注册子应用
setupApp({
  name: 'vue-app',
  url: '//localhost:8081',
  exec: true,    // 执行子应用 JS
  sync: true,    // 同步路由
  alive: false,  // 保活模式（切换时不销毁）
  fetch: (url, options) => window.fetch(url, options),
  props: {       // 传递给子应用
    msg: 'hello from main'
  },
  // 生命周期
  beforeLoad: (app) => console.log('before load', app),
  mounted: (app) => console.log('mounted', app),
  activated: (app) => console.log('activated', app),
  deactivated: (app) => console.log('deactivated', app),
  destroyed: (app) => console.log('destroyed', app)
});

// 预加载
preloadApp({ name: 'vue-app' });

// 使用 Vue 组件
app.use(WujieVue);
```

**Vue 主应用模板**：

```vue
<template>
  <div id="app">
    <nav>
      <router-link to="/vue">Vue App</router-link>
      <router-link to="/react">React App</router-link>
    </nav>

    <!-- 无界容器 -->
    <WujieVue
      width="100%"
      height="100%"
      name="vue-app"
      :url="vueUrl"
      :sync="true"
      :props="vueProps"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { bus } from 'wujie';

const vueUrl = ref('//localhost:8081');
const vueProps = ref({ msg: 'hello' });

// 全局通信
bus.$on('event-from-sub', (data) => {
  console.log('received from sub app:', data);
});
</script>
```

#### 子应用配置（无需改造）

无界的子应用**无需任何改造**，可以独立运行：

```javascript
// vue-app/src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');

// 无需生命周期钩子
```

**如果需要通信**：

```javascript
// 子应用发送事件
if (window.$wujie) {
  window.$wujie.bus.$emit('event-from-sub', { data: 'hello' });

  // 接收主应用数据
  console.log(window.$wujie.props); // { msg: 'hello' }
}
```

### 3.3 保活模式（Keep-Alive）

```javascript
// 主应用：开启保活
setupApp({
  name: 'vue-app',
  url: '//localhost:8081',
  alive: true  // 关键配置
});

// 效果：
// 1. 子应用切换时不会销毁
// 2. 状态保持
// 3. 再次进入无需重新加载
```

**适用场景**：
- 表单填写中途切换，数据不丢失
- 列表页滚动位置保持
- 复杂应用的性能优化

### 3.4 应用降级

```javascript
setupApp({
  name: 'vue-app',
  url: '//localhost:8081',
  degrade: true  // 降级为 iframe
});

// 场景：
// - 子应用与无界不兼容
// - 某些特殊需求需要完全隔离
```

### 3.5 通信机制

**1. props 传递**

```javascript
// 主应用
<WujieVue
  name="vue-app"
  :props="{ user: { name: 'admin' } }"
/>

// 子应用
console.log(window.$wujie.props.user); // { name: 'admin' }
```

**2. 事件总线**

```javascript
// 主应用
import { bus } from 'wujie';

bus.$on('子应用事件', (data) => {
  console.log(data);
});

bus.$emit('主应用事件', { msg: 'hello' });

// 子应用
window.$wujie.bus.$on('主应用事件', (data) => {
  console.log(data);
});

window.$wujie.bus.$emit('子应用事件', { msg: 'world' });
```

**3. 路由同步**

```javascript
// 主应用
<WujieVue
  name="vue-app"
  :sync="true"  // 同步路由
/>

// 效果：
// 主应用路由：/vue/home
// 子应用路由：/home
// 自动同步
```

### 3.6 性能优化

**1. 预加载**

```javascript
import { preloadApp } from 'wujie';

// 空闲时预加载
preloadApp({ name: 'vue-app', url: '//localhost:8081' });
```

**2. 预执行**

```javascript
setupApp({
  name: 'vue-app',
  url: '//localhost:8081',
  exec: true  // 预执行 JS（提升首次渲染速度）
});
```

**3. 资源内联**

```javascript
setupApp({
  name: 'vue-app',
  url: '//localhost:8081',
  // 自定义 fetch，内联小文件
  fetch: (url) => {
    if (url.endsWith('.css') && fileSize < 10KB) {
      return inlineCSS(url);
    }
    return window.fetch(url);
  }
});
```

### 3.7 无界 vs qiankun

| 维度 | 无界 | qiankun |
|------|------|---------|
| **隔离方式** | iframe + WebComponent | JS 沙箱 |
| **JS 隔离** | 完美（iframe 天然隔离） | 较好（Proxy 沙箱） |
| **CSS 隔离** | 完美（Shadow DOM） | 较好（需配置） |
| **性能** | 快（iframe 优化） | 快（无 iframe） |
| **子应用改造** | ❌ 无需改造 | ✅ 需要改造 |
| **兼容性** | 现代浏览器 | 支持 IE11 |
| **生态** | 较新 | 成熟 |
| **学习曲线** | 低 | 中 |

## 四、Module Federation（模块联邦）

### 4.1 核心原理

Module Federation 是 Webpack 5 的官方方案，通过**运行时共享模块**实现微前端。

```
┌──────────────────────────────────────────┐
│        Module Federation 架构             │
├──────────────────────────────────────────┤
│                                           │
│  主应用 (Host)                             │
│  ├─ 暴露：Header 组件                      │
│  └─ 消费：Remote1/Button                  │
│                                           │
│  子应用 (Remote1)                         │
│  ├─ 暴露：Button、Table 组件               │
│  └─ 消费：Host/Header                     │
│                                           │
│  共享依赖：                                │
│  ├─ React: 由 Host 提供，Remote 复用       │
│  └─ Lodash: 各自加载（版本不兼容）          │
│                                           │
└──────────────────────────────────────────┘
```

**核心概念**：
- **Host（宿主应用）**：消费其他应用的模块
- **Remote（远程应用）**：暴露模块供其他应用使用
- **Shared（共享依赖）**：多个应用共享同一份依赖

### 4.2 配置示例

#### 主应用（Host）

```javascript
// webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',               // 应用名称
      filename: 'remoteEntry.js', // 远程入口文件

      // 暴露的模块
      exposes: {
        './Header': './src/components/Header'
      },

      // 消费的远程模块
      remotes: {
        remote1: 'remote1@http://localhost:8081/remoteEntry.js',
        remote2: 'remote2@http://localhost:8082/remoteEntry.js'
      },

      // 共享的依赖
      shared: {
        react: {
          singleton: true,      // 单例模式（只加载一次）
          requiredVersion: '^18.0.0'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0'
        }
      }
    })
  ]
};
```

**使用远程模块**：

```javascript
// 主应用
import React, { lazy, Suspense } from 'react';

// 动态导入远程模块
const RemoteButton = lazy(() => import('remote1/Button'));

function App() {
  return (
    <div>
      <h1>Host App</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <RemoteButton />
      </Suspense>
    </div>
  );
}
```

#### 子应用（Remote）

```javascript
// webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remote1',
      filename: 'remoteEntry.js',

      // 暴露的模块
      exposes: {
        './Button': './src/components/Button',
        './Table': './src/components/Table'
      },

      // 共享的依赖
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

### 4.3 动态 Remote

```javascript
// 运行时动态加载 remote
function loadComponent(scope, module) {
  return async () => {
    // 初始化共享作用域
    await __webpack_init_sharing__('default');

    const container = window[scope];
    await container.init(__webpack_share_scopes__.default);

    const factory = await container.get(module);
    return factory();
  };
}

// 使用
const RemoteButton = React.lazy(loadComponent('remote1', './Button'));
```

### 4.4 版本控制

```javascript
shared: {
  react: {
    singleton: true,
    requiredVersion: '^18.0.0',
    strictVersion: true  // 严格版本控制（不兼容会报错）
  },
  lodash: {
    singleton: false,    // 允许多个版本共存
    requiredVersion: false
  }
}
```

### 4.5 Module Federation vs 其他方案

| 维度 | Module Federation | qiankun | 无界 |
|------|------------------|---------|------|
| **粒度** | 组件级 | 应用级 | 应用级 |
| **技术栈** | 仅 Webpack 5 | 无限制 | 无限制 |
| **隔离** | 无隔离（共享运行时） | JS 沙箱 | iframe 隔离 |
| **性能** | 最佳（共享模块） | 好 | 好 |
| **适用场景** | 组件共享、微前端 | 微前端 | 微前端 |

## 五、实战案例：电商平台微前端架构

### 5.1 业务拆分

```
电商平台
├─ 主应用（基座）
│  ├─ 顶部导航
│  ├─ 侧边栏
│  └─ 路由管理
│
├─ 商品管理（Vue 3）
│  ├─ 商品列表
│  ├─ 商品详情
│  └─ 商品编辑
│
├─ 订单管理（React）
│  ├─ 订单列表
│  ├─ 订单详情
│  └─ 订单统计
│
├─ 用户管理（Angular）
│  ├─ 用户列表
│  ├─ 权限管理
│  └─ 角色配置
│
└─ 数据大屏（Svelte）
   ├─ 实时数据
   └─ 图表展示
```

### 5.2 技术选型

```javascript
// 主应用：Vue 3 + 无界
// 优势：子应用无需改造，开发体验好

// 配置
import { setupApp } from 'wujie-vue3';

const apps = [
  {
    name: 'product',
    url: 'http://product.example.com',
    activeRule: '/product',
    framework: 'Vue 3'
  },
  {
    name: 'order',
    url: 'http://order.example.com',
    activeRule: '/order',
    framework: 'React'
  },
  {
    name: 'user',
    url: 'http://user.example.com',
    activeRule: '/user',
    framework: 'Angular'
  }
];

apps.forEach(app => setupApp(app));
```

### 5.3 全局状态管理

```javascript
// shared/store.js
import { reactive } from 'vue';

// 全局状态
export const globalState = reactive({
  user: null,
  token: '',
  permissions: []
});

// 登录
export function login(user) {
  globalState.user = user;
  globalState.token = user.token;
  globalState.permissions = user.permissions;

  // 通知所有子应用
  bus.$emit('login', user);
}

// 登出
export function logout() {
  globalState.user = null;
  globalState.token = '';
  globalState.permissions = [];

  bus.$emit('logout');
}

// 子应用监听
window.$wujie?.bus.$on('login', (user) => {
  console.log('用户登录', user);
  // 更新子应用状态
});
```

### 5.4 性能优化策略

**1. 预加载高频子应用**

```javascript
import { preloadApp } from 'wujie';

// 登录后预加载
function afterLogin() {
  preloadApp({ name: 'product' }); // 商品管理（高频）
  preloadApp({ name: 'order' });   // 订单管理（高频）
}
```

**2. 保活核心应用**

```javascript
setupApp({
  name: 'product',
  url: 'http://product.example.com',
  alive: true  // 商品管理保活（避免重复加载）
});
```

**3. 资源缓存**

```javascript
// Service Worker 缓存子应用资源
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('remoteEntry.js')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open('micro-apps').then(cache => {
            cache.put(event.request, clone);
          });
          return res;
        });
      })
    );
  }
});
```

## 六、常见问题与解决方案

### 6.1 样式冲突

**问题**：主应用和子应用样式互相影响

**解决方案**：

```javascript
// 1. qiankun: 启用 Shadow DOM
start({
  sandbox: {
    strictStyleIsolation: true
  }
});

// 2. 无界: 自动隔离（Shadow DOM）
// 3. 手动隔离: BEM、CSS Modules、CSS-in-JS

// 4. 重置样式范围
/* 主应用 */
.main-app {
  /* 样式仅作用于主应用 */
}

/* 子应用 */
.sub-app-product {
  /* 样式仅作用于商品子应用 */
}
```

### 6.2 全局变量污染

**问题**：子应用修改了 window 全局变量

**解决方案**：

```javascript
// 1. qiankun: Proxy 沙箱自动隔离
// 2. 无界: iframe 天然隔离

// 3. 手动清理
export async function unmount() {
  // 卸载时清理全局变量
  delete window.myGlobalVar;
}
```

### 6.3 路由冲突

**问题**：主子应用路由冲突

**解决方案**：

```javascript
// 子应用路由加前缀
const router = new VueRouter({
  mode: 'history',
  base: '/product', // 与主应用的 activeRule 一致
  routes
});

// 主应用路由配置
registerMicroApps([
  {
    name: 'product',
    activeRule: '/product' // 匹配 /product/*
  }
]);
```

### 6.4 公共依赖重复加载

**问题**：每个子应用都打包了 React/Vue

**解决方案**：

```javascript
// 1. Module Federation: shared 配置
shared: {
  react: { singleton: true }
}

// 2. 主应用提供公共依赖
// externals 配置
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};

// 主应用引入
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
```

## 七、总结

### 7.1 方案选型建议

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| **大型企业应用** | qiankun | 生态成熟、稳定可靠 |
| **快速开发** | 无界 | 子应用无需改造、开发体验好 |
| **组件共享** | Module Federation | 性能最佳、官方支持 |
| **遗留系统集成** | iframe | 隔离彻底、兼容性好 |
| **多技术栈融合** | 无界 / qiankun | 技术栈无关 |

### 7.2 最佳实践

1. **明确边界**：按业务领域拆分，避免过细
2. **统一规范**：代码风格、接口规范、通信协议
3. **独立部署**：CI/CD 流水线、版本管理
4. **监控告警**：子应用加载失败、性能监控
5. **渐进式迁移**：从边缘模块开始，逐步迁移核心
6. **文档齐全**：架构文档、接入文档、通信协议

## 🔗 参考资源

- [qiankun 官方文档](https://qiankun.umijs.org/)
- [无界官方文档](https://wujie-micro.github.io/doc/)
- [Module Federation 官方文档](https://webpack.js.org/concepts/module-federation/)
- [micro-frontends.org](https://micro-frontends.org/)
- [微前端架构最佳实践](https://microfrontend.cn/)
