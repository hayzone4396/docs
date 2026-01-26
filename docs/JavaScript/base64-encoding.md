---
title: Base64 编码原理与应用
description: 深入理解 Base64 编码机制、字符集组成及前端应用场景
tags:
  - JavaScript
  - Base64
  - 编码
date: 2026-01-23 17:15:45
---

# Base64 编码原理与应用

## 什么是 Base64？

Base64 是一种基于 64 个可打印字符来表示二进制数据的编码方式。它常用于在文本协议中传输二进制数据，如在 HTTP、电子邮件等场景中。

### Base64 的名称由来

**Base64** 中的 **64** 指的是编码使用的字符总数。

## Base64 字符集组成

Base64 编码使用 **64 个字符**来表示数据，具体组成如下：

```
26 个小写字母：a-z  (26个字符)
26 个大写字母：A-Z  (26个字符)
10 个数字：    0-9  (10个字符)
2  个符号：    +  /  (2个字符)
-----------------------------------
总计：64 个字符
```

### 完整字符表

```javascript
const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

console.log(base64Chars.length); // 64
```

**字符索引对照表：**

| 索引 | 字符 | 索引 | 字符 | 索引 | 字符 | 索引 | 字符 |
|------|------|------|------|------|------|------|------|
| 0    | A    | 16   | Q    | 32   | g    | 48   | w    |
| 1    | B    | 17   | R    | 33   | h    | 49   | x    |
| 2    | C    | 18   | S    | 34   | i    | 50   | y    |
| 3    | D    | 19   | T    | 35   | j    | 51   | z    |
| 4    | E    | 20   | U    | 36   | k    | 52   | 0    |
| 5    | F    | 21   | V    | 37   | l    | 53   | 1    |
| 6    | G    | 22   | W    | 38   | m    | 54   | 2    |
| 7    | H    | 23   | X    | 39   | n    | 55   | 3    |
| 8    | I    | 24   | Y    | 40   | o    | 56   | 4    |
| 9    | J    | 25   | Z    | 41   | p    | 57   | 5    |
| 10   | K    | 26   | a    | 42   | q    | 58   | 6    |
| 11   | L    | 27   | b    | 43   | r    | 59   | 7    |
| 12   | M    | 28   | c    | 44   | s    | 60   | 8    |
| 13   | N    | 29   | d    | 45   | t    | 61   | 9    |
| 14   | O    | 30   | e    | 46   | u    | 62   | +    |
| 15   | P    | 31   | f    | 47   | v    | 63   | /    |

### 填充字符

除了这 64 个字符，Base64 还使用一个特殊的**填充字符** `=`，用于补齐编码后的字符串长度。

```
总字符：64 个编码字符 + 1 个填充字符 =
```

## Base64 编码原理

### 编码步骤

1. **将原始数据转换为二进制**
2. **每 6 位二进制分为一组**
3. **将每组转换为十进制（0-63）**
4. **查找对应的 Base64 字符**
5. **不足 6 位的补 0，不足 4 字符的补 `=`**

### 示例：编码 "Man"

```
原始文本：Man

步骤 1：转换为 ASCII 码
M = 77,  a = 97,  n = 110

步骤 2：转换为二进制（每个字符 8 位）
M: 01001101
a: 01100001
n: 01101110

步骤 3：合并为 24 位二进制
010011 010110 000101 101110

步骤 4：每 6 位分组
010011 | 010110 | 000101 | 101110

步骤 5：转换为十进制
19 | 22 | 5 | 46

步骤 6：查找 Base64 字符表
19 → T
22 → W
5  → F
46 → u

结果：TWFu
```

### 填充规则

当原始数据字节数不是 3 的倍数时，需要填充。

**示例 1：编码 "Ma"（2 字节）**

```
M: 01001101
a: 01100001

合并：01001101 01100001
分组：010011 | 010110 | 0001 (不足6位，补0)
      010011 | 010110 | 000100

转换：19 | 22 | 4
查表：T  | W  | E

不足 4 字符，补一个 =
结果：TWE=
```

**示例 2：编码 "M"（1 字节）**

```
M: 01001101

分组：010011 | 01 (不足6位，补0)
      010011 | 010000

转换：19 | 16
查表：T  | Q

不足 4 字符，补两个 ==
结果：TQ==
```

### 长度计算

```javascript
// 原始字节数 → Base64 字符数
// 公式：Math.ceil(原始字节数 / 3) * 4

function calcBase64Length(byteLength) {
  return Math.ceil(byteLength / 3) * 4;
}

console.log(calcBase64Length(3));  // 4  (3字节 → 4字符)
console.log(calcBase64Length(2));  // 4  (2字节 → 4字符，含1个=)
console.log(calcBase64Length(1));  // 4  (1字节 → 4字符，含2个==)
console.log(calcBase64Length(6));  // 8  (6字节 → 8字符)
```

**数据膨胀率：**
- Base64 编码后的数据大小约为原始数据的 **4/3 倍**（约 133.33%）
- 即增加约 **33%** 的体积

## JavaScript 中的 Base64

### 浏览器原生方法

JavaScript 提供了两个全局函数用于 Base64 编码和解码：

```javascript
// 编码：将字符串转换为 Base64
const encoded = btoa('Hello World');
console.log(encoded); // 'SGVsbG8gV29ybGQ='

// 解码：将 Base64 转换为字符串
const decoded = atob('SGVsbG8gV29ybGQ=');
console.log(decoded); // 'Hello World'
```

**函数名称的含义：**
- `btoa`：**b**inary **to** **a**scii（二进制转ASCII）
- `atob`：**a**scii **to** **b**inary（ASCII转二进制）

### 中文编码问题

直接使用 `btoa` 编码中文会报错：

```javascript
// ❌ 错误
btoa('你好'); // DOMException: Failed to execute 'btoa'
```

**原因：**
- `btoa` 只支持 Latin1 字符（单字节字符）
- 中文是多字节字符，需要先转换为 UTF-8

**解决方案：**

```javascript
// 方案 1：使用 encodeURIComponent
function base64Encode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

function base64Decode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

// 使用
const encoded = base64Encode('你好世界');
console.log(encoded); // '5L2g5aW95LiW55WM'

const decoded = base64Decode(encoded);
console.log(decoded); // '你好世界'
```

```javascript
// 方案 2：使用 TextEncoder/TextDecoder（现代浏览器）
function base64EncodeUnicode(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  return btoa(String.fromCharCode(...data));
}

function base64DecodeUnicode(str) {
  const decoder = new TextDecoder();
  const data = Uint8Array.from(atob(str), c => c.charCodeAt(0));
  return decoder.decode(data);
}

// 使用
const encoded = base64EncodeUnicode('你好世界');
const decoded = base64DecodeUnicode(encoded);
console.log(decoded); // '你好世界'
```

### Data URL（数据URL）

Base64 常用于 Data URL，可以直接在 HTML 中嵌入图片、字体等资源。

**格式：**
```
data:[<mediatype>][;base64],<data>
```

**示例：**

```javascript
// 图片转 Base64
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 使用
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const base64 = await imageToBase64(file);

  console.log(base64);
  // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...

  // 直接用于 img 标签
  const img = document.createElement('img');
  img.src = base64;
  document.body.appendChild(img);
});
```

```html
<!-- 在 HTML 中直接使用 -->
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..." alt="示例">
```

## Base64 应用场景

### 1. 图片内联

```html
<!-- 小图标直接嵌入，减少 HTTP 请求 -->
<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYi..." alt="icon">
```

### 2. 字体嵌入

```css
@font-face {
  font-family: 'CustomFont';
  src: url(data:font/woff2;base64,d09GMgABAAAAAB...) format('woff2');
}
```

### 3. 文件下载

```javascript
function downloadFile(content, filename, mimeType = 'text/plain') {
  const base64 = btoa(unescape(encodeURIComponent(content)));
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

// 使用
downloadFile('Hello World', 'hello.txt');
```

### 4. Canvas 导出

```javascript
const canvas = document.getElementById('myCanvas');

// 导出为 Base64
const base64 = canvas.toDataURL('image/png');

// 下载图片
const link = document.createElement('a');
link.href = base64;
link.download = 'canvas.png';
link.click();
```

### 5. 加密传输

```javascript
// 简单混淆（不是真正的加密）
function obfuscate(data) {
  return btoa(JSON.stringify(data));
}

function deobfuscate(encoded) {
  return JSON.parse(atob(encoded));
}

const data = { user: 'admin', token: '123456' };
const encoded = obfuscate(data);
console.log(encoded); // 混淆后的字符串

const decoded = deobfuscate(encoded);
console.log(decoded); // 原始数据
```

### 6. localStorage 存储二进制

```javascript
// 将二进制数据存储到 localStorage
function saveBinaryData(key, arrayBuffer) {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  localStorage.setItem(key, base64);
}

function loadBinaryData(key) {
  const base64 = localStorage.getItem(key);
  if (!base64) return null;

  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);

  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }

  return buffer;
}
```

## Base64 的优缺点

### 优点

1. **文本传输**：可以在文本协议中传输二进制数据
2. **减少请求**：小资源内联减少 HTTP 请求
3. **跨域友好**：不受同源策略限制
4. **简单实用**：浏览器原生支持，使用方便

### 缺点

1. **体积增大**：增加约 33% 的数据量
2. **编解码开销**：需要 CPU 计算
3. **不可读**：编码后的数据不易阅读
4. **缓存问题**：内联资源无法独立缓存

## 最佳实践

### 1. 适用场景

✅ **适合使用 Base64：**
- 小图标（< 10KB）
- 字体文件（首屏需要的）
- 少量配置数据
- 需要文本传输的二进制数据

❌ **不适合使用 Base64：**
- 大图片
- 视频文件
- 频繁变化的资源
- 需要独立缓存的资源

### 2. 性能优化

```javascript
// 缓存编码结果
const cache = new Map();

function cachedBase64Encode(str) {
  if (cache.has(str)) {
    return cache.get(str);
  }

  const encoded = btoa(str);
  cache.set(str, encoded);
  return encoded;
}
```

### 3. 错误处理

```javascript
function safeBase64Encode(str) {
  try {
    return btoa(encodeURIComponent(str));
  } catch (error) {
    console.error('Base64 编码失败:', error);
    return null;
  }
}

function safeBase64Decode(str) {
  try {
    return decodeURIComponent(atob(str));
  } catch (error) {
    console.error('Base64 解码失败:', error);
    return null;
  }
}
```

## 总结

### 关键要点

1. **Base64 使用 64 个字符编码**：26个小写 + 26个大写 + 10个数字 + 2个符号（+/）
2. **编码原理**：3 字节原始数据 → 4 字符 Base64
3. **数据膨胀**：约增加 33% 体积
4. **中文处理**：需配合 encodeURIComponent 或 TextEncoder
5. **应用场景**：Data URL、图片内联、文件下载等
6. **权衡使用**：小资源内联，大资源独立加载

Base64 是前端开发中常用的编码方式，理解其原理有助于更好地应用和优化。
