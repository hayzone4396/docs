---
title: webpack&vite
date: 2026-05-24 18:15:00
categories:
  - Tools
---

# Webpack 5 & Vite 构建优化 — 面试复习资料

>[!NOTE] 本文档整理自飞书课程，涵盖 Webpack 5 和 Vite 的开发构建优化、产物构建优化及面试高频题，适合面试前快速复习。

---

## 一、面试高频题

### 1. 关于 webpack 打包构建优化，之前做过哪些？

> 我在过往项目中，在使用 Webpack 进行打包构建优化时，常见的优化包括：
>
> 1. **代码分割（Code Splitting）**：使用 Webpack 的 `SplitChunksPlugin` 进行代码分割，将第三方库、公共代码与业务代码分离，提高缓存利用率和加载速度。
> 2. **Tree Shaking**：通过配置 `mode: 'production'` 或使用 `TerserPlugin`，移除未引用的代码，减少包体积。
> 3. **Lazy Loading（懒加载）**：使用 `import()` 动态加载模块，实现按需加载，减少初始加载时间。
> 4. **使用 CDN**：配置 `externals`，将常用的库如 React、Vue 等通过 CDN 引入，减少打包体积。
> 5. **缓存优化**：通过配置 `output.filename` 和 `output.chunkFilename` 中的 `[contenthash]`，生成基于文件内容的哈希值，避免不必要的缓存失效。
> 6. **开启持久化缓存（Persistent Caching）**：配置 `cache: { type: 'filesystem' }`，提高二次构建速度。
> 7. **优化 Loader**：使用多进程和缓存（如 `thread-loader` 和 `cache-loader`），提升构建速度。还可以通过限制 `babel-loader` 等处理范围来加速构建。
> 8. **优化开发体验**：使用 `webpack-dev-server` 的 HMR（热模块替换）功能，提高开发效率；或者通过配置 `resolve.alias` 缩短模块查找路径。

### 2. 你认为 Vite 相对于 Webpack 有哪些优势？

> Vite 相较于 Webpack 的主要优势包括：
>
> 1. **极速启动**：Vite 使用原生 ES 模块进行开发时的依赖加载，无需像 Webpack 一样对整个项目进行预打包。因此，Vite 的冷启动速度非常快，尤其是在大型项目中尤为明显。
> 2. **即时热更新（HMR）**：Vite 的 HMR 速度更快更灵敏，因为它基于 ES 模块，仅更新受影响的模块，而不需要重新构建整个包。
> 3. **更少的配置**：Vite 的默认配置已经足够健全，开箱即用，开发者通常不需要像使用 Webpack 一样编写大量的配置文件。
> 4. **现代化浏览器支持**：Vite 针对现代浏览器优化，默认使用 ES6+ 语法，省去了对旧浏览器的兼容配置。
> 5. **插件生态**：虽然 Vite 插件生态相对年轻，但其设计简单且功能强大，能够满足大多数场景的需求。
> 6. **构建速度快**：Vite 使用 esbuild 进行预构建，极大提高了依赖解析和打包的速度。此外，Vite 还使用 Rollup 作为生产环境打包工具，具有较好的打包优化能力。
> 7. **调试友好**：Vite 生成的源码更接近开发者的源码，调试体验更好，错误追踪更准确。

---

## 二、Webpack 5 开发构建优化

### 2.1 开发模式配置

```javascript
module.exports = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map', // 构建速度 vs 调试体验平衡
  devServer: {
    hot: true, // 启用 HMR
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
};
```

### 2.2 模块解析优化

| 配置项 | 作用 | 示例 |
|--------|------|------|
| `resolve.alias` | 路径别名，减少解析时间 | `'@components': path.resolve(__dirname, 'src/components/')` |
| `resolve.extensions` | 明确扩展名，减少尝试次数 | `['.js', '.jsx', '.json']` |
| `resolve.modules` | 明确模块路径，避免递归查找 | `[path.resolve(__dirname, 'src'), 'node_modules']` |

### 2.3 缓存优化

```javascript
module.exports = {
  cache: {
    type: 'filesystem', // Webpack 5 持久化缓存
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true, // Babel 缓存
        },
      },
    }],
  },
};
```

### 2.4 其他优化

| 优化手段 | 配置 |
|---------|------|
| **减少监听文件** | `watchOptions: { ignored: /node_modules/ }` |
| **多进程构建** | `thread-loader` |
| **DLL 预编译** | `DllPlugin` + `DllReferencePlugin`（第三方库不常变化时）|

---

## 三、Webpack 5 产物构建优化

### 3.1 生产模式配置

```javascript
module.exports = {
  mode: 'production', // 自动启用：代码压缩、Tree Shaking、Scope Hoisting
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: { drop_console: true }
      }
    })],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
`
```

### 3.2 Tree Shaking

- **前提**：使用 ES6 模块（`import`/`export`）
- **配置**：`sideEffects: false` 或 `sideEffects: ['*.css']`

```javascript
// package.json
{
  "sideEffects": false
  // 或
  "sideEffects": ["*.css", "*.scss"]
}
```

### 3.3 图片和资源优化

```javascript
module.exports = {
  module: {
    rules: [{
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192, // 小于 8KB 转 base64
          fallback: 'file-loader',
          name: '[name].[hash:8].[ext]',
        },
      }],
    }],
  },
};
```

### 3.4 代码分割和懒加载

```javascript
// 动态导入实现懒加载
function loadComponent() {
  return import('./component').then(module => {
    const component = module.default;
    // 使用 component
  });
}
```

### 3.5 产物分析

```bash
# 生成 stats.json
webpack --profile --json > stats.json

# 可视化分析
npx webpack-bundle-analyzer stats.json
```

**关键检查点：**
- 体积过大的资源
- 是否按需切分 chunk
- 模块依赖关系

---

## 四、Vite 开发构建优化

### 4.1 HMR 热更新

- Vite 默认启用 HMR
- 通过 WebSocket 与浏览器通信
- 仅更新变化模块，保持状态不变

### 4.2 依赖预构建

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['react', 'react-dom'], // 提前预构建
    exclude: ['some-large-lib'],      // 排除不需要的
  },
};
```

**esbuild 优势：**
- Go 语言编写，速度极快
- 比传统 JavaScript 构建工具快 10-100 倍

### 4.3 环境变量

```bash
# .env
VITE_API_URL=https://api.example.com
```

```javascript
// 代码中使用
const apiUrl = import.meta.env.VITE_API_URL;

// index.html 中使用
%VITE_API_URL%
```

### 4.4 文件监听优化

```javascript
export default {
  server: {
    watch: {
      ignored: ['**/large-static-files/**'],
    },
  },
};
```

---

## 五、Vite 产物构建优化

### 5.1 生产模式配置

```javascript
export default {
  build: {
    minify: 'terser', // 或 'esbuild'
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
};
```

| 压缩工具 | 特点 |
|---------|------|
| **Terser** | 压缩效果好，速度慢 |
| **esbuild** | 速度极快，压缩率较低 |

### 5.2 代码分割

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'], // 手动拆分
        },
      },
    },
  },
};
```

### 5.3 动态导入（懒加载）

```javascript
// 懒加载组件
const MyComponent = () => import('./components/MyComponent.vue');
```

### 5.4 资源优化

```javascript
export default {
  build: {
    assetsInlineLimit: 4096, // 小于 4KB 内联为 base64
  },
  plugins: [
    viteImagemin({ /* 图片压缩配置 */ }),
  ],
};
```

### 5.5 产物分析

```javascript
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  build: {
    rollupOptions: {
      plugins: [
        visualizer({
          filename: './dist/stats.html',
          open: true,
        }),
      ],
    },
  },
};
```

---

## 六、Webpack vs Vite 对比

### 6.1 核心差异

| 特性 | Webpack | Vite |
|------|---------|------|
| **开发模式** | 打包后提供服务 | 原生 ESM，按需加载 |
| **启动速度** | 慢（需打包） | 极快（毫秒级） |
| **HMR 速度** | 较慢 | 极快 |
| **配置复杂度** | 高 | 低（开箱即用） |
| **生产构建** | 自身处理 | Rollup |
| **生态成熟度** | 非常成熟 | 快速发展中 |

### 6.2 适用场景

| 场景 | 推荐工具 |
|------|---------|
| 大型复杂项目，需高度自定义 | Webpack |
| 快速原型开发，追求效率 | Vite |
| 现代框架开发（Vue/React） | Vite |
| 需要丰富插件生态 | Webpack |
| 追求极速开发体验 | Vite |

### 6.3 构建优化对比表

| 优化手段 | Webpack | Vite |
|---------|---------|------|
| 代码分割 | `splitChunks` | `manualChunks` |
| 懒加载 | `import()` | `import()` |
| Tree Shaking | `sideEffects` | 默认支持 |
| 压缩 | TerserPlugin | `build.minify` |
| 缓存 | `cache: 'filesystem'` | esbuild 预构建缓存 |
| 产物分析 | `webpack-bundle-analyzer` | `rollup-plugin-visualizer` |

---

## 七、快速记忆卡片

### Webpack 优化口诀

```
开发模式配 source-map，HMR 热更新效率高
路径别名 resolve，缓存 filesystem 加速好
产物分割 splitChunks，Tree Shaking 清无用
动态导入懒加载，analyzer 分析包大小
```

### Vite 优化口诀

```
原生 ESM 启动快，esbuild 预构建依赖
HMR 极速更新好，环境变量 import.meta
产物 Rollup 打包，manualChunks 分割妙
visualizer 分析包，配置简单效率高
```



