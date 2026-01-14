---
title: HTTP 缓存完全指南
date: 2026-01-14
tags: 
 - 缓存
categories:
 - 追求更好
---
# HTTP 缓存完全指南

## 什么是 HTTP 缓存

### 核心概念
::: info

**HTTP 缓存**是浏览器（或 CDN）保存已下载资源副本的机制，当再次需要这些资源时，直接从缓存读取，而不是重新从服务器下载。

:::

### 缓存的位置

```
用户请求流程：

1. 浏览器内存缓存（Memory Cache）
   ↓ 如果没有
2. 浏览器磁盘缓存（Disk Cache）
   ↓ 如果没有
3. Service Worker 缓存
   ↓ 如果没有
4. CDN 缓存
   ↓ 如果没有
5. 服务器（真实请求）
```

### 为什么需要缓存

**性能对比**：

```javascript
// 场景：加载一个 100KB 的 CSS 文件

从服务器下载（无缓存）:
- DNS 查询: 20ms
- TCP 连接: 50ms
- TLS 握手: 100ms
- 下载: 200ms
总时间: 370ms

从浏览器缓存读取:
总时间: 1-5ms

提升: 99%！
```

**带宽节省**：

```
假设网站每天 10,000 次访问
每次加载 2MB 资源

无缓存: 10,000 × 2MB = 20 GB/天
有缓存: 只有首次访问下载，约 2 GB/天
节省: 90%
```

---

## HTTP 缓存的工作原理

### 两种缓存机制

#### 1. 强缓存（Strong Cache）

**完全不发请求到服务器**

```
浏览器请求资源：

1. 检查本地缓存
2. 检查是否过期
3. 未过期 → 直接使用缓存 ✅
4. 已过期 → 进入协商缓存流程
```

**HTTP 响应头**：

```http
Cache-Control: max-age=31536000, public
Expires: Wed, 09 Jan 2027 00:00:00 GMT
```

**浏览器行为**：

```
首次请求:
GET /style.css
→ 200 OK (from server)
  Cache-Control: max-age=31536000
  下载并缓存

第二次请求（1 年内）:
GET /style.css
→ 200 OK (from disk cache)  ← 注意：没有网络请求
  直接从缓存读取，速度极快
```

**Chrome DevTools 中的显示**：

```
Status: 200
Size: (disk cache) 或 (memory cache)
Time: 0 ms
```

#### 2. 协商缓存（Negotiated Cache）

**发送请求到服务器，但可能不下载资源**

```
浏览器请求资源：

1. 检查本地缓存
2. 缓存已过期（或设置为 no-cache）
3. 发送请求到服务器，带上验证信息
4. 服务器检查资源是否修改
5. 未修改 → 返回 304 Not Modified ✅（不传输资源）
6. 已修改 → 返回 200 OK + 新资源
```

**HTTP 请求/响应**：

```http
首次请求:
GET /api/user
→ 200 OK
  Last-Modified: Wed, 08 Jan 2026 10:00:00 GMT
  ETag: "abc123xyz"
  Cache-Control: no-cache

第二次请求（发送验证信息）:
GET /api/user
If-Modified-Since: Wed, 08 Jan 2026 10:00:00 GMT
If-None-Match: "abc123xyz"

服务器响应（资源未变）:
→ 304 Not Modified  ← 注意：没有响应体
  只返回头部，浏览器使用本地缓存

服务器响应（资源已变）:
→ 200 OK
  Last-Modified: Wed, 09 Jan 2026 12:00:00 GMT
  ETag: "def456uvw"
  返回新的资源内容
```

**性能对比**：

```
强缓存命中:
- 网络请求: 0
- 传输数据: 0 KB
- 时间: 1-5 ms

协商缓存命中（304）:
- 网络请求: 1
- 传输数据: 约 0.5 KB（只传输头部）
- 时间: 50-100 ms

缓存未命中（200）:
- 网络请求: 1
- 传输数据: 完整资源大小
- 时间: 200-1000 ms
```

---

## 缓存控制指令详解

### Cache-Control 指令

#### 1. **max-age=\<seconds\>**

**含义**：资源的最大缓存时间（秒）

```http
Cache-Control: max-age=3600

解释：
- 从现在起 3600 秒（1 小时）内，资源有效
- 这段时间内，浏览器直接使用缓存，不发请求
- 超过 3600 秒后，进入协商缓存流程
```

**常用时间**：

```javascript
// 不同资源的 max-age 设置

1 小时:   max-age=3600
1 天:     max-age=86400
1 周:     max-age=604800
1 个月:   max-age=2592000
1 年:     max-age=31536000

// 特殊值
永不过期: max-age=31536000, immutable
立即过期: max-age=0
```

#### 2. **no-cache**（重要！）

**❌ 错误理解**：不使用缓存

**✅ 正确理解**：使用缓存，但每次都要验证

```http
Cache-Control: no-cache

实际行为：
1. 浏览器保存资源到缓存 ✅
2. 每次使用前，必须向服务器验证 ✅
3. 服务器返回 304 → 使用缓存
4. 服务器返回 200 → 下载新资源

等价于: Cache-Control: max-age=0, must-revalidate
```

**示例流程**：

```
首次请求:
GET /api/user
→ 200 OK
  Cache-Control: no-cache
  ETag: "v1"
  {"name": "Alice", "age": 25}
  浏览器缓存这个响应

第二次请求（必须验证）:
GET /api/user
If-None-Match: "v1"

服务器检查：
- 数据未变 → 304 Not Modified（不传输数据）
- 数据已变 → 200 OK + 新数据

关键点：虽然叫 no-cache，但实际上会缓存！
```

#### 3. **no-store**（真正的不缓存）

```http
Cache-Control: no-store

含义：
- 完全不缓存 ❌
- 每次都从服务器下载完整资源
- 用于敏感数据（如银行账户信息）
```

**no-cache vs no-store 对比**：

| 指令 | 是否缓存 | 是否验证 | 适用场景 |
|------|---------|---------|---------|
| **no-cache** | ✅ 缓存 | ✅ 每次验证 | API 接口、HTML |
| **no-store** | ❌ 不缓存 | N/A | 敏感数据、私密信息 |

#### 4. **public vs private**

```http
Cache-Control: public, max-age=3600

public:
- 可以被任何缓存保存（浏览器、CDN、代理服务器）
- 适用于公开资源（CSS、JS、图片）

Cache-Control: private, max-age=3600

private:
- 只能被浏览器缓存，不能被 CDN/代理缓存
- 适用于用户特定数据（个人信息、购物车）
```

#### 5. **immutable**

```http
Cache-Control: max-age=31536000, immutable

含义：
- 资源永不改变
- 即使用户刷新页面，也不重新验证
- 适用于带版本号的静态资源
```

**示例**：

```html
<!-- 带版本号的文件，永不改变 -->
<link rel="stylesheet" href="/style.css?v=1.2.3">
<script src="/app.js?v=abc123"></script>

<!-- 响应头 -->
Cache-Control: max-age=31536000, immutable

<!-- 优势：即使用户按 Ctrl+F5 强制刷新，也不会重新下载 -->
```

---

## no-cache 到底是什么

### 详细解释

```
Cache-Control: no-cache

这个指令的本质是：
"我允许你缓存这个资源，但每次使用前必须问我一声"
```

### 完整流程图

```
浏览器请求 /api/user（设置了 no-cache）

第一次:
┌──────────┐      GET /api/user      ┌──────────┐
│  浏览器  │ ───────────────────────> │  服务器  │
└──────────┘                          └──────────┘
                                             │
                                             │ 处理请求
                                             ↓
┌──────────┐    200 OK + 数据 + ETag   ┌──────────┐
│  浏览器  │ <─────────────────────── │  服务器  │
└──────────┘   Cache-Control:no-cache └──────────┘
     │
     │ 保存到缓存
     ↓
┌─────────┐
│ 浏览器  │
│ 缓存    │
│ ETag:v1 │
└─────────┘

第二次（马上访问同一 API）:
┌──────────┐     GET /api/user        ┌──────────┐
│  浏览器  │ ───────────────────────> │  服务器  │
└──────────┘   If-None-Match: "v1"    └──────────┘
                                             │
                                             │ 检查 ETag
                                             │ 数据未变
                                             ↓
┌──────────┐     304 Not Modified      ┌──────────┐
│  浏览器  │ <─────────────────────── │  服务器  │
└──────────┘    （没有响应体）          └──────────┘
     │
     │ 使用缓存的数据
     ↓
   显示数据
```

### 为什么 API 使用 no-cache

```javascript
// API 的特点：
// 1. 数据经常变化（用户信息、订单状态）
// 2. 需要相对实时的数据
// 3. 但也不需要每次都下载完整数据

// 使用 no-cache 的好处：
GET /api/user

第一次: 下载 5 KB 数据，耗时 200ms
第二次: 验证（304），耗时 50ms，传输 0.5 KB
第三次: 验证（304），耗时 50ms，传输 0.5 KB

// 如果不缓存（no-store）:
第一次: 下载 5 KB，耗时 200ms
第二次: 下载 5 KB，耗时 200ms ← 浪费！
第三次: 下载 5 KB，耗时 200ms ← 浪费！

// 如果强缓存（max-age=3600）:
第一次: 下载 5 KB，耗时 200ms
第二次: 缓存命中，耗时 1ms ← 很快！
问题: 如果数据在 1 小时内变了，用户看到的是旧数据 ❌
```

### 实际测试

```bash
# 测试 no-cache 行为

# 首次请求
curl -I https://api.example.com/user
# 响应：
# HTTP/2 200
# Cache-Control: no-cache
# ETag: "abc123"
# Content-Length: 5120

# 第二次请求（带验证）
curl -I https://api.example.com/user \
  -H "If-None-Match: abc123"
# 响应：
# HTTP/2 304 Not Modified
# Cache-Control: no-cache
# ETag: "abc123"
# Content-Length: 0  ← 注意：没有响应体
```

---

## 短期缓存策略

### 什么是短期缓存

```http
Cache-Control: max-age=300

含义：
- 缓存 5 分钟（300 秒）
- 5 分钟内直接使用缓存，不发请求
- 5 分钟后进入协商缓存流程
```

### 适用场景

#### 1. **准实时数据 API**

```javascript
// 场景：股票价格、天气数据

// 特点：
// - 数据会变化，但不需要毫秒级实时
// - 可以接受几分钟的延迟

// 配置：
Cache-Control: max-age=300  // 5 分钟

// 效果：
GET /api/stock-price
第 1 次（00:00）: 从服务器下载
第 2 次（00:02）: 从缓存读取 ← 省时
第 3 次（00:04）: 从缓存读取 ← 省时
第 4 次（00:06）: 缓存过期，重新下载
```

#### 2. **数据统计 API**

```javascript
// 你的项目：data-statistics-project

// /api/nginx-deployments
// 特点：部署数据不会频繁变化（可能几分钟才变一次）

// 配置：
Cache-Control: max-age=60  // 1 分钟

// 好处：
// - 用户在仪表盘上来回切换页面，数据从缓存读取
// - 减轻服务器压力
// - 1 分钟后自动刷新，数据相对新鲜
```

### 常用的短期缓存时间

```javascript
// 根据数据更新频率选择

极短期（准实时）:
Cache-Control: max-age=10   // 10 秒
适用：在线人数、实时消息

短期（分钟级）:
Cache-Control: max-age=60   // 1 分钟
Cache-Control: max-age=300  // 5 分钟
适用：新闻列表、评论数、统计数据

中期（小时级）:
Cache-Control: max-age=3600  // 1 小时
适用：用户个人资料、配置信息

长期（天级）:
Cache-Control: max-age=86400  // 1 天
适用：城市列表、分类信息
```

---

## 不同资源的缓存策略

### 完整对照表

| 资源类型 | Cache-Control | 原因 | 示例 |
|---------|--------------|------|------|
| **HTML** | `no-cache` | 需要最新内容 | index.html |
| **CSS/JS（带版本号）** | `max-age=31536000, immutable` | 永不改变 | app.v1.2.3.css |
| **CSS/JS（无版本号）** | `max-age=86400` 或 `no-cache` | 可能更新 | style.css |
| **图片（产品图）** | `max-age=2592000` | 很少改变 | product-123.jpg |
| **图片（用户头像）** | `max-age=86400` | 可能更新 | avatar.jpg |
| **字体** | `max-age=31536000` | 永不改变 | roboto.woff2 |
| **API（用户数据）** | `private, no-cache` | 个人数据，需验证 | /api/user |
| **API（公开数据）** | `public, max-age=60` | 可短期缓存 | /api/stats |
| **API（敏感数据）** | `private, no-store` | 不能缓存 | /api/bank-account |

### 详细解释

#### 1. HTML 文件

```http
<!-- index.html -->
Cache-Control: no-cache
ETag: "v1.0.1"

原因：
✓ HTML 是入口文件，可能包含新功能
✓ 使用 no-cache 确保每次检查更新
✓ 如果未变，返回 304，速度也很快
✓ 如果已变，立即获取新版本

流程：
用户访问 → 验证 ETag → 304（使用缓存）
开发者部署新版本 → 用户访问 → 200（获取新 HTML）
```

#### 2. CSS/JS（带版本号）

```html
<!-- 带版本号或哈希 -->
<link rel="stylesheet" href="/css/style.css?v=1.2.3">
<script src="/js/app.abc123.js"></script>

<!-- 响应头 -->
Cache-Control: max-age=31536000, immutable

原因：
✓ 文件名包含版本号/哈希，文件内容永不改变
✓ 可以设置最长缓存时间（1 年）
✓ 更新时改变文件名，自动失效旧缓存

部署流程：
1. 开发者修改 CSS → 生成新文件 style.css?v=1.2.4
2. 更新 HTML 中的引用
3. 用户访问新 HTML → 发现新版本号 → 下载新 CSS
4. 旧版本缓存自然过期（没有页面引用了）
```

#### 3. API 接口（详细）

**用户特定数据**：

```http
GET /api/user/profile

Cache-Control: private, no-cache
ETag: "user-123-v5"

private: 只能浏览器缓存，CDN 不缓存（隐私保护）
no-cache: 每次验证，确保数据新鲜
```

**公开统计数据**：

```http
GET /api/statistics/daily

Cache-Control: public, max-age=300
Last-Modified: Wed, 09 Jan 2026 10:00:00 GMT

public: 可以被 CDN 缓存（减轻服务器压力）
max-age=300: 缓存 5 分钟（数据不需要秒级更新）
```

**敏感数据**：

```http
GET /api/bank/account

Cache-Control: private, no-store

private: 不能被 CDN 缓存
no-store: 浏览器也不缓存（安全第一）
```

---

## 项目实战配置

### 对于你的 data-statistics-project

#### 方案 A: Nginx 配置（推荐）

```nginx
# /etc/nginx/sites-available/data-statistics

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # ==================== HTML 文件 ====================
    location ~* \.html$ {
        # 协商缓存：每次验证，确保内容最新
        add_header Cache-Control "no-cache";
        etag on;
    }

    # ==================== CSS/JS（带版本号）====================
    location ~* \.(css|js)$ {
        # 检查是否带版本号参数（如 ?v=1.2.3）
        if ($args ~* "v=") {
            # 带版本号：强缓存 1 年
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # 不带版本号：短期缓存
        add_header Cache-Control "public, max-age=86400";
    }

    # ==================== 图片 ====================
    location ~* \.(jpg|jpeg|png|gif|svg|webp)$ {
        # 图片很少改变：缓存 30 天
        add_header Cache-Control "public, max-age=2592000";
    }

    # ==================== 字体 ====================
    location ~* \.(woff|woff2|ttf|eot)$ {
        # 字体永不改变：缓存 1 年
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # ==================== API 代理 ====================
    location /api/ {
        proxy_pass http://127.0.0.1:5000;

        # 默认不缓存（让 Flask 返回的头部决定）
        proxy_no_cache 1;
        proxy_cache_bypass 1;

        # 传递原始头部
        proxy_pass_header Cache-Control;
    }

    # ==================== 静态文件目录 ====================
    location /static/ {
        alias /path/to/static/;

        # CSS/JS/图片根据文件类型自动应用上面的规则

        # 额外优化
        gzip on;
        gzip_types text/css application/javascript;
    }
}
```

#### 方案 B: Flask 应用层配置

```python
# app.py 或创建一个 utils/cache.py

from functools import wraps
from flask import make_response
from datetime import datetime

def set_cache_control(max_age=None, no_cache=False, no_store=False,
                      private=False, public=True, immutable=False):
    """
    设置 Cache-Control 头部的装饰器

    参数:
        max_age: 最大缓存时间（秒）
        no_cache: 是否需要每次验证
        no_store: 是否完全不缓存
        private: 是否只允许浏览器缓存
        public: 是否允许 CDN 缓存
        immutable: 资源是否永不改变
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            response = make_response(f(*args, **kwargs))

            # 构建 Cache-Control 指令
            directives = []

            if no_store:
                directives.append('no-store')
            elif no_cache:
                directives.append('no-cache')
            elif max_age is not None:
                directives.append(f'max-age={max_age}')

            if private:
                directives.append('private')
            elif public:
                directives.append('public')

            if immutable:
                directives.append('immutable')

            if directives:
                response.headers['Cache-Control'] = ', '.join(directives)

            # 如果使用协商缓存，添加 ETag
            if no_cache and hasattr(response, 'data'):
                import hashlib
                etag = hashlib.md5(response.data).hexdigest()
                response.headers['ETag'] = f'"{etag}"'

            return response
        return decorated_function
    return decorator


# ==================== 使用示例 ====================

from flask import Blueprint, jsonify

api = Blueprint('api', __name__, url_prefix='/api')

# 1. 用户数据 API（私有，需验证）
@api.route('/user')
@set_cache_control(private=True, no_cache=True)
def get_user():
    """
    Cache-Control: private, no-cache
    ETag: "abc123"

    - 只允许浏览器缓存，不允许 CDN 缓存
    - 每次使用前必须验证
    """
    return jsonify({
        'id': 1,
        'name': 'Alice',
        'email': 'alice@example.com'
    })


# 2. 统计数据 API（公开，短期缓存）
@api.route('/statistics')
@set_cache_control(public=True, max_age=60)
def get_statistics():
    """
    Cache-Control: public, max-age=60

    - 允许 CDN 缓存
    - 缓存 1 分钟
    - 适合准实时数据
    """
    return jsonify({
        'total_users': 1000,
        'active_users': 150,
        'timestamp': datetime.now().isoformat()
    })


# 3. 配置数据 API（公开，长期缓存）
@api.route('/config')
@set_cache_control(public=True, max_age=3600)
def get_config():
    """
    Cache-Control: public, max-age=3600

    - 允许 CDN 缓存
    - 缓存 1 小时
    - 配置数据很少改变
    """
    return jsonify({
        'version': '1.0.0',
        'features': ['feature1', 'feature2']
    })


# 4. 敏感数据 API（不缓存）
@api.route('/bank-account')
@set_cache_control(private=True, no_store=True)
def get_bank_account():
    """
    Cache-Control: private, no-store

    - 只允许浏览器处理（不能被 CDN 缓存）
    - 完全不缓存（安全第一）
    """
    return jsonify({
        'account_number': '****1234',
        'balance': 10000.00
    })


# 5. Nginx 部署数据（你的项目实际场景）
@api.route('/nginx-deployments')
@set_cache_control(public=True, max_age=60)
def get_nginx_deployments():
    """
    Cache-Control: public, max-age=60

    - 部署数据不会频繁变化
    - 缓存 1 分钟，减轻数据库压力
    - 用户在页面间切换时，数据从缓存读取
    """
    # 查询数据库...
    deployments = query_nginx_deployments()
    return jsonify(deployments)
```

#### 方案 C: 在模板中添加版本号

```python
# app.py

@app.context_processor
def inject_config():
    import time
    # 使用时间戳或版本号
    version = str(int(time.time()))  # 或使用 git commit hash
    return dict(version=version)
```

```html
<!-- templates/index.html -->
<!DOCTYPE html>
<html>
<head>
    <!-- 自动添加版本号 -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}?v={{ version }}">
    <script src="{{ url_for('static', filename='js/main.js') }}?v={{ version }}"></script>
</head>
<body>
    <!-- 内容 -->
</body>
</html>

<!-- 生成的 HTML: -->
<!--
<link rel="stylesheet" href="/static/css/style.css?v=1704808800">
<script src="/static/js/main.js?v=1704808800"></script>

每次部署后，时间戳更新，浏览器下载新文件
-->
```

---

## 常见问题

### Q1: no-cache 和 max-age=0 有什么区别？

```http
Cache-Control: no-cache
等价于:
Cache-Control: max-age=0, must-revalidate

区别：
no-cache: 语义更清晰（"必须验证"）
max-age=0: 数值表示（"立即过期"）

实际效果：完全相同
```

### Q2: 如何强制清除缓存？

```javascript
// 方法1: 用户手动清除
// Chrome: Ctrl+Shift+Delete → 清除缓存

// 方法2: 开发者强制刷新
// Ctrl+F5 或 Cmd+Shift+R

// 方法3: 改变 URL（推荐）
旧: /style.css?v=1.0.0
新: /style.css?v=1.0.1
// URL 改变，缓存自动失效

// 方法4: 服务器设置
Cache-Control: no-cache
// 用户下次访问时会验证

// 方法5: Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => caches.delete(key))
            );
        })
    );
});
```

### Q3: 如何调试缓存问题？

**Chrome DevTools**：

```
1. Network 标签:
   - Size 列:
     • (disk cache) = 从磁盘缓存读取
     • (memory cache) = 从内存缓存读取
     • 数字（如 5.2 KB）= 从服务器下载

   - Status 列:
     • 200 OK = 新下载或从缓存读取
     • 304 Not Modified = 协商缓存命中

2. 禁用缓存测试:
   - 勾选 "Disable cache"（DevTools 打开时生效）
   - 模拟首次访问

3. 查看响应头:
   - 点击请求 → Headers 标签
   - 查看 Cache-Control、ETag、Last-Modified
```

### Q4: CDN 缓存和浏览器缓存有什么区别？

```
架构层级：

用户浏览器 ←─ 浏览器缓存
    ↓
CDN 边缘节点 ←─ CDN 缓存
    ↓
源服务器

区别：

浏览器缓存:
- 位置: 用户设备
- 受益者: 单个用户
- 控制: Cache-Control: private/public

CDN 缓存:
- 位置: CDN 服务器（全球分布）
- 受益者: 所有用户
- 控制: Cache-Control: public（必须）

示例：
Cache-Control: private, max-age=3600
→ 只在用户浏览器缓存 1 小时

Cache-Control: public, max-age=3600
→ 浏览器和 CDN 都缓存 1 小时
```

### Q5: 为什么 API 不用强缓存？

```javascript
// 场景：用户信息 API

// ❌ 错误：使用强缓存
GET /api/user
Cache-Control: max-age=3600  // 缓存 1 小时

问题：
1. 用户修改个人资料
2. 后端数据已更新
3. 前端仍显示 1 小时前的旧数据 ← 用户困惑！

// ✅ 正确：使用协商缓存
GET /api/user
Cache-Control: no-cache
ETag: "v1"

优势：
1. 用户修改个人资料
2. 后端数据更新，ETag 变为 "v2"
3. 前端下次请求验证，ETag 不匹配
4. 服务器返回 200 + 新数据 ← 立即看到更新

性能：
- 数据未变: 304 响应，只传输头部（~0.5 KB，50ms）
- 数据已变: 200 响应，传输新数据（~5 KB，200ms）

结论：API 需要数据新鲜度，不适合强缓存
```

### Q6: 实际开发中如何选择缓存策略？

**决策树**：

```
你的资源是什么类型？

├─ HTML 文件
│  └─ 使用: no-cache（确保内容最新）

├─ CSS/JS
│  ├─ 带版本号/哈希？
│  │  ├─ 是 → max-age=31536000, immutable
│  │  └─ 否 → max-age=86400 或 no-cache
│  └─

├─ 图片
│  ├─ 产品图（很少改变）→ max-age=2592000
│  └─ 用户头像（可能更新）→ max-age=86400

├─ API 接口
│  ├─ 用户数据（个人）→ private, no-cache
│  ├─ 统计数据（公开，准实时）→ public, max-age=60
│  ├─ 配置数据（很少变）→ public, max-age=3600
│  └─ 敏感数据（银行等）→ private, no-store

└─ 字体
   └─ max-age=31536000（永不改变）
```

---

## 总结

### 核心概念对照

| 术语 | 含义 | 网络请求 | 数据传输 | 适用场景 |
|------|------|---------|---------|---------|
| **强缓存** | 直接使用缓存 | ❌ 无 | ❌ 无 | 静态资源 |
| **协商缓存** | 验证后使用 | ✅ 有 | ⚠️ 可能无（304） | HTML、API |
| **no-cache** | 必须验证 | ✅ 有 | ⚠️ 看情况 | API、HTML |
| **no-store** | 完全不缓存 | ✅ 有 | ✅ 有 | 敏感数据 |
| **短期缓存** | 几分钟到几小时 | ⚠️ 过期后有 | ⚠️ 过期后有 | 准实时数据 |

### 你的项目推荐配置

```python
# data-statistics-project 推荐配置

1. HTML 文件:
   Cache-Control: no-cache
   ✓ 确保用户总能看到最新页面

2. CSS/JS（带版本号）:
   Cache-Control: public, max-age=31536000, immutable
   ✓ 最大化缓存效率

3. API 接口:
   - /api/user: private, no-cache（用户数据）
   - /api/nginx-deployments: public, max-age=60（统计数据）
   - /api/statistics: public, max-age=300（准实时数据）

4. 图片/字体:
   Cache-Control: public, max-age=2592000
   ✓ 长期缓存，减少带宽
```

### 快速参考

```http
# 常用配置速查

永久缓存（静态资源 + 版本号）:
Cache-Control: public, max-age=31536000, immutable

长期缓存（图片）:
Cache-Control: public, max-age=2592000

短期缓存（统计 API）:
Cache-Control: public, max-age=60

协商缓存（HTML、用户 API）:
Cache-Control: no-cache

不缓存（敏感数据）:
Cache-Control: private, no-store
```


