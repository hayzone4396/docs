---
title: 前端加密解密方案
createTime: 2026-01-27 18:08:56
tags:
  - 加密
  - 安全
  - CryptoJS
  - 3DES
permalink: /architecture/frontend-encryption/
---

# 前端加密解密方案

## 📅 文档信息

- **创建时间**：2026-01-27 18:08:56
- **适用场景**：前端敏感数据传输加密、接口数据加密
- **加密算法**：3DES (TripleDES)

## 概述

在前端开发中，敏感数据（如用户信息、支付数据、OSS 密钥等）在传输过程中需要进行加密处理，以保证数据安全。本文介绍基于 `CryptoJS` 的 3DES 加密解密方案。

## 技术选型

### 为什么选择 3DES？

| 特性 | 3DES | AES |
|------|------|-----|
| 密钥长度 | 168 位（24 字节） | 128/192/256 位 |
| 加密速度 | 较慢 | 快 |
| 安全性 | 中等（已被 AES 取代） | 高 |
| 兼容性 | 优秀（老系统支持） | 优秀 |
| 适用场景 | 需要兼容老系统 | 新项目推荐 |

**本方案选择 3DES 的原因**：
- 与后端系统保持一致（后端可能使用 Java 的 DESede 算法）
- 适合密钥长度为 24 字节的场景
- CryptoJS 库完美支持

## 核心实现

### 1. 安装依赖

```bash
npm install crypto-js
# 或
yarn add crypto-js
# 或
pnpm add crypto-js
```

### 2. 加密工具类

创建 `utils/crypto.js`：

```javascript
import CryptoJS from 'crypto-js'

// 密钥配置（24 字节）
const key = '1234567890abcDEFghiJKLmn';
// 初始化向量（8 字节）
const iv = '01234567';

// 将字符串密钥转换为加密所需的格式
const keyHex = CryptoJS.enc.Utf8.parse(key);
const ivHex = CryptoJS.enc.Utf8.parse(iv);

/**
 * 3DES 加密
 * @param {string} data - 需要加密的明文数据
 * @returns {string} 加密后的密文（Base64 编码）
 */
export function aesEncrypt(data) {
  // 注意：此处虽然函数名为 aesEncrypt，实际使用的是 3DES 算法（也叫 desede）
  const result = CryptoJS.TripleDES.encrypt(data, keyHex, {
    iv: ivHex,
    mode: CryptoJS.mode.CBC,        // CBC 模式
    padding: CryptoJS.pad.Pkcs7     // PKCS7 填充
  });
  return result.toString();
}

/**
 * 3DES 解密
 * @param {string} cipher - 加密后的密文（Base64 编码）
 * @returns {string} 解密后的明文
 */
export function aesDecrypt(cipher) {
  const decrypted = CryptoJS.TripleDES.decrypt(cipher, keyHex, {
    iv: ivHex,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return CryptoJS.enc.Utf8.stringify(decrypted);
}
```

## 使用示例

### 场景一：接口返回数据解密

```javascript
import { aesDecrypt } from '@/utils/crypto'

// 接口返回的加密数据
let res = `U2FsdGVkX1+xxx==`; // 示例加密数据

// 1. 去除空格（重要！）
res = res.replace(/\s/g, '');

console.log('加密的 OSS Key:', res);

// 2. 解密
const decryptedData = aesDecrypt(res);

// 3. 解析 JSON（如果数据是 JSON 格式）
const data = JSON.parse(decryptedData);

console.log('解密后的数据:', data);
```

### 场景二：发送数据前加密

```javascript
import { aesEncrypt } from '@/utils/crypto'

// 敏感数据对象
const sensitiveData = {
  userId: '12345',
  password: 'user@password',
  token: 'xyz-abc-token'
};

// 1. 转换为 JSON 字符串
const jsonString = JSON.stringify(sensitiveData);

// 2. 加密
const encrypted = aesEncrypt(jsonString);

// 3. 发送到后端
fetch('/api/secure-endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: encrypted
  })
});
```

### 场景三：在 Axios 拦截器中使用

```javascript
import axios from 'axios'
import { aesEncrypt, aesDecrypt } from '@/utils/crypto'

// 请求拦截器：加密敏感数据
axios.interceptors.request.use(config => {
  // 如果需要加密请求体
  if (config.encrypt && config.data) {
    config.data = {
      encrypted: aesEncrypt(JSON.stringify(config.data))
    };
  }
  return config;
});

// 响应拦截器：解密返回数据
axios.interceptors.response.use(response => {
  // 如果响应数据是加密的
  if (response.data?.encrypted) {
    const decrypted = aesDecrypt(
      response.data.encrypted.replace(/\s/g, '')
    );
    response.data = JSON.parse(decrypted);
  }
  return response;
});

// 使用
axios.post('/api/data', {
  username: 'admin',
  password: '123456'
}, {
  encrypt: true  // 标记需要加密
});
```

## 关键知识点

### 1. 密钥和 IV

```javascript
// ❌ 错误：密钥长度不符合要求
const key = '123456';  // 太短

// ✅ 正确：3DES 需要 24 字节密钥
const key = '1234567890abcDEFghiJKLmn';  // 24 字符

// ✅ 正确：IV（初始化向量）需要 8 字节
const iv = '01234567';  // 8 字符
```

### 2. CBC 模式 vs ECB 模式

| 模式 | 安全性 | 需要 IV | 特点 |
|------|--------|---------|------|
| **CBC** | 高 | ✅ 需要 | 相同明文加密结果不同（推荐） |
| **ECB** | 低 | ❌ 不需要 | 相同明文加密结果相同（不推荐） |

```javascript
// ✅ 推荐：CBC 模式
CryptoJS.TripleDES.encrypt(data, keyHex, {
  iv: ivHex,
  mode: CryptoJS.mode.CBC
});

// ❌ 不推荐：ECB 模式（不够安全）
CryptoJS.TripleDES.encrypt(data, keyHex, {
  mode: CryptoJS.mode.ECB
});
```

### 3. 填充方式

```javascript
// PKCS7 填充（最常用）
padding: CryptoJS.pad.Pkcs7

// 其他填充方式
padding: CryptoJS.pad.Iso97971
padding: CryptoJS.pad.AnsiX923
padding: CryptoJS.pad.Iso10126
padding: CryptoJS.pad.ZeroPadding
padding: CryptoJS.pad.NoPadding
```

### 4. 数据预处理

```javascript
// ⚠️ 重要：解密前必须去除空格
let encrypted = `U2FsdGVk X1+xxx ==`;  // 可能包含空格

// ❌ 直接解密会失败
aesDecrypt(encrypted);  // Error!

// ✅ 去除空格后解密
encrypted = encrypted.replace(/\s/g, '');
aesDecrypt(encrypted);  // Success!
```

## 安全建议

### ⚠️ 密钥安全

```javascript
// ❌ 不要硬编码在前端代码中
const key = '1234567890abcDEFghiJKLmn';

// ✅ 推荐做法
// 1. 从环境变量读取
const key = import.meta.env.VITE_ENCRYPT_KEY;

// 2. 从后端接口动态获取（首次访问时）
const key = await fetchEncryptionKey();

// 3. 使用非对称加密传输密钥
```

### 🔒 最佳实践

1. **HTTPS**：加密只是辅助手段，HTTPS 是基础
2. **密钥轮换**：定期更换密钥，避免长期使用同一密钥
3. **前后端一致**：确保前后端使用相同的算法、模式、填充方式
4. **错误处理**：解密失败时要有友好的错误提示

```javascript
export function safeDecode(cipher) {
  try {
    const decrypted = aesDecrypt(cipher.replace(/\s/g, ''));
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('解密失败:', error);
    return null;
  }
}
```

### 🚫 常见错误

```javascript
// ❌ 错误1：密钥长度不对
const key = '12345';  // 太短，应该是 24 字节

// ❌ 错误2：忘记去除空格
aesDecrypt(encrypted);  // 可能失败

// ❌ 错误3：JSON.parse 前未检查
const data = JSON.parse(decrypted);  // 如果不是 JSON 会报错

// ✅ 正确做法
try {
  const decrypted = aesDecrypt(encrypted.replace(/\s/g, ''));
  const data = JSON.parse(decrypted);
} catch (error) {
  console.error('处理失败:', error);
}
```

## 性能优化

### 1. 缓存密钥对象

```javascript
// ❌ 每次都解析（性能差）
function encrypt(data) {
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const ivHex = CryptoJS.enc.Utf8.parse(iv);
  return CryptoJS.TripleDES.encrypt(data, keyHex, { iv: ivHex });
}

// ✅ 提前解析，复用（性能好）
const keyHex = CryptoJS.enc.Utf8.parse(key);
const ivHex = CryptoJS.enc.Utf8.parse(iv);

function encrypt(data) {
  return CryptoJS.TripleDES.encrypt(data, keyHex, { iv: ivHex });
}
```

### 2. Web Worker 处理大数据

```javascript
// worker.js
import CryptoJS from 'crypto-js'

self.onmessage = (e) => {
  const { type, data } = e.data;

  if (type === 'encrypt') {
    const result = CryptoJS.TripleDES.encrypt(data, keyHex, {
      iv: ivHex,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    self.postMessage({ result: result.toString() });
  }
};

// main.js
const worker = new Worker('worker.js');
worker.postMessage({ type: 'encrypt', data: largeData });
worker.onmessage = (e) => {
  console.log('加密完成:', e.data.result);
};
```

## TypeScript 类型定义

```typescript
import CryptoJS from 'crypto-js'

interface EncryptConfig {
  key: string;
  iv: string;
  mode?: typeof CryptoJS.mode.CBC;
  padding?: typeof CryptoJS.pad.Pkcs7;
}

class CryptoUtil {
  private keyHex: CryptoJS.lib.WordArray;
  private ivHex: CryptoJS.lib.WordArray;

  constructor(config: EncryptConfig) {
    this.keyHex = CryptoJS.enc.Utf8.parse(config.key);
    this.ivHex = CryptoJS.enc.Utf8.parse(config.iv);
  }

  encrypt(data: string): string {
    const result = CryptoJS.TripleDES.encrypt(data, this.keyHex, {
      iv: this.ivHex,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return result.toString();
  }

  decrypt(cipher: string): string {
    const decrypted = CryptoJS.TripleDES.decrypt(
      cipher.replace(/\s/g, ''),
      this.keyHex,
      {
        iv: this.ivHex,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return CryptoJS.enc.Utf8.stringify(decrypted);
  }

  decryptJSON<T = any>(cipher: string): T | null {
    try {
      const decrypted = this.decrypt(cipher);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('解密失败:', error);
      return null;
    }
  }
}

// 使用
const crypto = new CryptoUtil({
  key: '1234567890abcDEFghiJKLmn',
  iv: '01234567'
});

const encrypted = crypto.encrypt('Hello World');
const decrypted = crypto.decrypt(encrypted);
```

## 总结

### ✅ 优点

- 简单易用，CryptoJS 库支持完善
- 与 Java 后端 DESede 算法兼容
- 适合敏感数据传输加密

### ⚠️ 注意事项

- 3DES 已被视为不够安全，新项目建议使用 AES-256
- 密钥不要硬编码在前端代码中
- 必须配合 HTTPS 使用
- 前后端加密参数必须完全一致

### 🔗 参考资源

- [CryptoJS 官方文档](https://cryptojs.gitbook.io/docs/)
- [MDN Web Crypto API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Crypto_API)
- [OWASP 加密最佳实践](https://owasp.org/www-project-cryptographic-storage-cheat-sheet/)
