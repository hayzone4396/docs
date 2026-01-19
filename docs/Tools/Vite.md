---
title: Vite 构建工具
date: 2026-01-19 11:44:00
tags:
  - Vite
  - 构建工具
categories:
  - Tools
---

# Vite 构建工具

## 概述

Vite 是新一代前端构建工具，利用浏览器原生 ES 模块特性，提供极速的开发体验。

## 核心特点

- **极速启动**：无需打包，即时启动开发服务器
- **快速热更新**：基于 ESM 的 HMR，更新速度与模块数量无关
- **按需编译**：只编译当前页面需要的代码
- **开箱即用**：内置支持 TypeScript、JSX、CSS 预处理器

## 快速开始

```bash
# 创建项目
npm create vite@latest my-app
cd my-app
npm install
npm run dev
```

## 基础配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  // 开发服务器
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser'
  }
});
```

## 常用插件

```javascript
import vue from '@vitejs/plugin-vue';           // Vue 3
import react from '@vitejs/plugin-react';       // React
import { viteMockServe } from 'vite-plugin-mock';  // Mock 数据
import compression from 'vite-plugin-compression'; // Gzip 压缩

export default defineConfig({
  plugins: [
    vue(),
    compression({ algorithm: 'gzip' })
  ]
});
```

## 环境变量

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=开发环境

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=生产环境
```

```javascript
// 使用环境变量
console.log(import.meta.env.VITE_API_BASE_URL);
console.log(import.meta.env.MODE); // 'development' 或 'production'
```

## 静态资源处理

```javascript
// 导入静态资源
import imgUrl from './img.png';             // 获取URL
import imgUrl from './img.png?url';         // 显式获取URL
import imgRaw from './shader.glsl?raw';     // 字符串形式
import Worker from './worker?worker';        // Web Worker
```

## 构建优化

```javascript
export default defineConfig({
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['element-plus']
        }
      }
    },

    // 大文件警告阈值
    chunkSizeWarningLimit: 1000
  }
});
```

## Vite vs Webpack

| 特性 | Vite | Webpack |
|------|------|---------|
| 启动速度 | 秒级 | 分钟级 |
| 热更新 | 毫秒级 | 秒级 |
| 配置复杂度 | 低 | 高 |
| 生态成熟度 | 快速发展 | 非常成熟 |
| 开发体验 | 优秀 | 良好 |

## 常见问题

### 引入第三方库报错？

```javascript
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    include: ['library-name']  // 预构建指定库
  }
});
```

### CSS 预处理器使用？

```bash
# 安装预处理器
npm install -D sass
npm install -D less
```

```vue
<style lang="scss">
$primary-color: #42b983;
.button {
  color: $primary-color;
}
</style>
```

## 参考资源

- [Vite 官方文档](https://cn.vitejs.dev/)
- [Awesome Vite](https://github.com/vitejs/awesome-vite)
- [Vite 插件列表](https://vitejs.dev/plugins/)
