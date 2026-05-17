---
title: 前端性能优化
date: 2026-05-17 19:45:00
categories:
  - Architecture
---


# 前端性能优化 

>[!NOTE] 本文档整理自飞书课程，涵盖资源优化、HTTP 缓存、数据存储等核心知识点，适合面试前快速复习。

## 一、资源压缩与请求优化

### 1.1 资源压缩

| 资源类型 | 压缩工具 | 说明 |
|---------|---------|------|
| **JavaScript** | Terser、UglifyJS | 删除空白、注释、简化逻辑、变量重命名 |
| **CSS** | cssnano、Clean-CSS | 去除无用代码，压缩文件大小 |
| **图片** | ImageOptim、TinyPNG、cwebp | 无损压缩，WebP 格式更小 |
| **文本传输** | Gzip、Brotli | 服务器端压缩，Brotli 压缩率更高 |

**关键命令：**
```bash
# JS 压缩
npx terser src/app.js -o dist/app.min.js --compress --mangle

# 图片转 WebP
cwebp src/image.png -o dist/image.webp
```

**Nginx 配置 Gzip + Brotli：**
```nginx
gzip on;
gzip_types text/plain text/css application/javascript;
gzip_min_length 256;

brotli on;
brotli_types text/plain text/css application/javascript;
```

### 1.2 请求优化

| 优化手段 | 实现方式 |
|---------|---------|
| **减少 HTTP 请求** | 合并 CSS/JS 文件（Webpack 等构建工具） |
| **懒加载** | 图片进入视口才加载 `data-src` |
| **预加载** | `<link rel="preload">` 提前加载关键资源 |
| **预请求** | `<link rel="dns-prefetch/preconnect">` 提前 DNS 解析 |
| **HTTP/2** | 多路复用，一个连接并发多个请求 |
| **CDN** | 静态资源分发到全球节点 |

**懒加载示例：**
```html
<img data-src="actual.jpg" class="lazyload">
<script>
  document.querySelectorAll('.lazyload').forEach(img => {
    img.src = img.getAttribute('data-src');
  });
</script>
```

**预加载示例：**
```html
<link rel="preload" href="styles.css" as="style">
<link rel="preload" href="app.js" as="script">
<link rel="dns-prefetch" href="//cdn.example.com">
```

---

## 二、HTTP 缓存

### 2.1 缓存分类

```
浏览器请求资源
    ↓
强缓存（本地缓存）→ 命中 → 200 (from memory/disk cache)
    ↓ 未命中
协商缓存 → 命中 → 304 Not Modified
    ↓ 未命中
请求服务器 → 200 + 新资源
```

### 2.2 强缓存

| 响应头 | 版本 | 说明 |
|--------|------|------|
| **Expires** | HTTP 1.0 | 绝对时间，受本地时间影响 |
| **Cache-Control** | HTTP 1.1 | 相对时间，优先级更高 |

**Cache-Control 指令：**

| 指令 | 含义 |
|------|------|
| `max-age=3600` | 缓存 3600 秒 |
| `no-cache` | 缓存但需重新验证 |
| `no-store` | 不缓存 |
| `public` | 可被所有用户/代理缓存 |
| `private` | 仅浏览器缓存 |

### 2.3 协商缓存

| 响应头 | 请求头 | 说明 |
|--------|--------|------|
| **Last-Modified** | If-Modified-Since | 文件最后修改时间 |
| **ETag** | If-None-Match | 文件指纹（优先级更高）|

**ETag vs Last-Modified：**
- ETag 优先级更高
- Last-Modified 精度为秒，秒级修改检测不到
- ETag 计算有开销，分布式部署时各节点 ETag 可能不同

### 2.4 缓存状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 强缓存失效，返回新资源 |
| 200 (from disk cache) | 强缓存命中，磁盘缓存 |
| 200 (from memory cache) | 强缓存命中，内存缓存 |
| 304 | 协商缓存命中，资源未修改 |

### 2.5 缓存启用顺序

```
1. Cache-Control（强缓存）
2. Expires（强缓存）
3. If-None-Match / ETag（协商缓存）
4. If-Modified-Since / Last-Modified（协商缓存）
```

### 2.6 静态资源优化最佳实践

1. **配置超长时间的本地缓存** —— 节省带宽
2. **采用内容摘要作为缓存更新依据** —— 文件名带 hash
3. **静态资源 CDN 部署** —— 优化网络请求
4. **非覆盖式发布** —— 平滑升级，不破坏旧缓存

---

## 三、浏览器数据存储

### 3.1 四种存储方式对比

| 特性 | Cookie | LocalStorage | SessionStorage | IndexedDB |
|------|--------|--------------|----------------|-----------|
| **容量** | ~4KB | ~5MB | ~5MB | 理论上无上限 |
| **生命周期** | 可设置过期时间 | 永久（除非手动清除）| 页面会话结束 | 永久 |
| **作用域** | 同域名 | 同域名 | 同窗口/标签页 | 同域名 |
| **服务端通信** | 自动携带 | 不自动携带 | 不自动携带 | 不自动携带 |
| **数据类型** | 字符串 | 字符串 | 字符串 | 任意结构化数据 |
| **适用场景** | 身份认证、跟踪 | 持久化配置 | 临时状态 | 大量数据、离线应用 |

### 3.2 使用示例

```javascript
// Cookie
document.cookie = "username=John; expires=Thu, 18 Dec 2025 12:00:00 GMT; path=/";

// LocalStorage
localStorage.setItem('key', 'value');
localStorage.getItem('key');

// SessionStorage
sessionStorage.setItem('temp', 'data');

// IndexedDB（简化示例）
const request = indexedDB.open('myDB', 1);
request.onsuccess = (event) => {
  const db = event.target.result;
  // 进行数据库操作...
};
```

### 3.3 选型建议

| 场景 | 推荐方案 |
|------|---------|
| 用户登录态 | Cookie（HttpOnly + Secure）|
| 主题设置、用户偏好 | LocalStorage |
| 表单草稿、临时数据 | SessionStorage |
| 离线应用、大量数据缓存 | IndexedDB |

---

## 四、Service Worker

### 4.1 核心概念

- 独立于网页运行的脚本，在后台运行
- 可拦截和处理网络请求
- 实现离线访问、消息推送、后台同步
- PWA（渐进式 Web 应用）的核心技术

### 4.2 生命周期

```
注册 (register)
    ↓
安装 (install) → 缓存静态资源
    ↓
等待 (waiting) → 跳过：skipWaiting()
    ↓
激活 (activate) → 清理旧缓存
    ↓
空闲 (idle) → 浏览器周期性回收资源
    ↓
拦截请求 (fetch) → 缓存策略处理
```

### 4.3 核心代码

**注册 Service Worker：**
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.error('SW failed', err));
}
```

**Service Worker 文件：**
```javascript
// 安装阶段 - 预缓存
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll(['/', '/index.html', '/app.js']);
    })
  );
  self.skipWaiting(); // 跳过等待
});

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== 'v1').map(key => caches.delete(key))
      );
    })
  );
});

// 拦截请求 - 缓存策略
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

### 4.4 四大缓存策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| **仅缓存** | 只从缓存读取 | 静态资源 |
| **仅限网络** | 只从网络获取 | 实时数据 |
| **缓存优先，回退网络** | 先读缓存，无则请求网络 | 离线优先应用 |
| **网络优先，回退缓存** | 先请求网络，失败用缓存 | 需要最新数据但允许离线 |

### 4.5 Workbox（生产环境推荐）

Google 开发的 Service Worker 库，简化缓存管理：

```javascript
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

// 预缓存
precacheAndRoute(self.__WB_MANIFEST);

// 图片：缓存优先
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'images' })
);

// API：网络优先
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api' })
);

// CSS/JS：过时重验证
registerRoute(
  ({ url }) => url.pathname.endsWith('.css') || url.pathname.endsWith('.js'),
  new StaleWhileRevalidate({ cacheName: 'static' })
);
```

**Workbox 缓存策略：**
- **Network First**：先网络，失败用缓存
- **Cache First**：先缓存，无则请求网络
- **Stale While Revalidate**：先返回缓存，后台更新
- **Network Only**：只用网络
- **Cache Only**：只用缓存

---

## 五、面试答题模板

### 模板：前端性能优化

> "前端性能优化我从三个层面来回答：
> 
> **1. 资源层面**：
> - 代码压缩（Terser/cssnano）
> - 图片优化（WebP、懒加载）
> - 传输压缩（Gzip/Brotli）
> - 使用 CDN 分发静态资源
> 
> **2. 请求层面**：
> - 减少 HTTP 请求（合并文件、HTTP/2 多路复用）
> - 合理使用缓存（强缓存 + 协商缓存）
> - 预加载/预请求关键资源
> 
> **3. 缓存策略**：
> - 强缓存用 Cache-Control（相对时间，优先级高）
> - 协商缓存用 ETag（文件指纹，比 Last-Modified 更精确）
> - 静态资源文件名加 hash，实现非覆盖式发布"

### 模板：HTTP 缓存机制

> "HTTP 缓存分为强缓存和协商缓存：
> 
> **强缓存**不需要发请求到服务器，通过 Cache-Control（HTTP 1.1）或 Expires（HTTP 1.0）控制。Cache-Control 使用 max-age 相对时间，优先级更高，不受本地时间影响。
> 
> **协商缓存**是强缓存失效后，浏览器携带缓存标识向服务器验证。通过 Last-Modified/If-Modified-Since 或 ETag/If-None-Match 实现。ETag 是文件指纹，优先级更高，能解决秒级修改和文件内容未变但时间变的问题。
> 
> 缓存命中会返回 200(from cache) 或 304，未命中则返回 200 和新资源。"

### 模板：Service Worker

> "Service Worker 是运行在浏览器后台的独立线程，可以拦截网络请求、管理缓存，是实现 PWA 的核心技术。
> 
> 它的生命周期包括：注册 → 安装（install，缓存静态资源）→ 等待（waiting，可 skipWaiting 跳过）→ 激活（activate，清理旧缓存）→ 拦截请求（fetch）。
> 
> 实际应用中，我们常用 Workbox 来简化开发，它提供了预缓存、运行时缓存和多种缓存策略（Cache First、Network First、Stale While Revalidate 等），可以根据资源类型灵活配置。"

### 模板：浏览器存储方案选择

> "浏览器存储主要有四种：
> 
> - **Cookie**：4KB 左右，适合身份认证，会自动携带到服务端
> - **LocalStorage**：5MB，永久存储，适合用户偏好设置
> - **SessionStorage**：5MB，会话级存储，适合临时数据
> - **IndexedDB**：理论上无上限，支持结构化数据，适合离线应用和大量数据缓存
> 
> 选型时根据数据大小、生命周期、是否需要结构化来综合考虑。"

---

## 六、快速记忆卡片

### 缓存优先级口诀

```
Cache-Control 最优先，相对时间不怕改
ETag 指纹比时间准，协商缓存它当家
304 没修改，200 有新货
from cache 本地拿，性能优化就靠它
```

### Service Worker 生命周期

```
注册 → 安装（缓存）→ 等待 → 激活（清理）→ 拦截
```

### 存储方案选型

```
小数据 + 服务端通信 → Cookie
持久配置 → LocalStorage
临时状态 → SessionStorage
大数据 + 结构化 → IndexedDB
```

---

*文档生成时间：2025-05-17*
