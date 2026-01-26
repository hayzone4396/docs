---
title: Proxy vs Object.defineProperty 深度对比
description: 深入理解 Vue 2 和 Vue 3 响应式原理的核心差异，掌握 Proxy 和 defineProperty 的本质区别
tags:
  - Vue
  - Proxy
  - defineProperty
  - 响应式
date: 2026-01-23 17:20:15
---

# Proxy vs Object.defineProperty 深度对比

## 核心差异概述

Vue 2 和 Vue 3 响应式系统的最大区别在于底层实现机制：

- **Vue 2**：使用 `Object.defineProperty`
- **Vue 3**：使用 `Proxy`

**核心区别：**

> **Proxy 拦截对象所有基本操作**，它是全面的，没有任何遗漏的。
>
> **defineProperty 是众多基本方法的一个**，只能对已有属性的读写进行拦截。

## Object.defineProperty 详解

### 基本用法

```javascript
const obj = {
  name: 'Alice',
  age: 25
};

Object.defineProperty(obj, 'name', {
  get() {
    console.log('读取 name');
    return this._name;
  },
  set(newValue) {
    console.log('设置 name:', newValue);
    this._name = newValue;
  }
});

obj.name = 'Bob';   // 输出: 设置 name: Bob
console.log(obj.name); // 输出: 读取 name
```

### Vue 2 中的实现

```javascript
function defineReactive(obj, key, value) {
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log(`读取 ${key}:`, value);
      // 依赖收集
      return value;
    },
    set(newValue) {
      if (newValue === value) return;

      console.log(`设置 ${key}:`, newValue);
      value = newValue;
      // 触发更新
    }
  });
}

// 使用
const data = {
  message: 'Hello',
  count: 0
};

Object.keys(data).forEach(key => {
  defineReactive(data, key, data[key]);
});

data.message = 'Hi';  // 触发 set
console.log(data.message); // 触发 get
```

### defineProperty 的局限性

#### 1. 无法监听新增属性

```javascript
const obj = {
  name: 'Alice'
};

// 对现有属性设置监听
Object.defineProperty(obj, 'name', {
  get() {
    console.log('读取 name');
    return this._name;
  },
  set(value) {
    console.log('设置 name');
    this._name = value;
  }
});

// ✅ 可以监听
obj.name = 'Bob'; // 触发 set

// ❌ 无法监听新增属性
obj.age = 25; // 不会触发任何监听
console.log(obj.age); // 25，但没有触发 get
```

**Vue 2 的解决方案：**

```javascript
// Vue 2 需要手动添加响应式属性
Vue.set(obj, 'age', 25);

// 或者在 Vue 实例中
this.$set(this.obj, 'age', 25);
```

#### 2. 无法监听删除属性

```javascript
const obj = {
  name: 'Alice',
  age: 25
};

// 设置监听
Object.keys(obj).forEach(key => {
  defineReactive(obj, key, obj[key]);
});

// ❌ 删除属性无法监听
delete obj.age; // 不会触发任何回调
```

**Vue 2 的解决方案：**

```javascript
Vue.delete(obj, 'age');
// 或
this.$delete(this.obj, 'age');
```

#### 3. 无法监听数组变化

```javascript
const arr = [1, 2, 3];

// ❌ 无法监听数组索引修改
arr[0] = 10; // 不会触发监听

// ❌ 无法监听数组长度变化
arr.length = 0; // 不会触发监听
```

**Vue 2 的解决方案：**

```javascript
// Vue 2 重写了数组的 7 个变异方法
const arrayMethods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

arrayMethods.forEach(method => {
  const original = Array.prototype[method];

  Object.defineProperty(arr, method, {
    value: function(...args) {
      console.log(`调用了 ${method} 方法`);
      const result = original.apply(this, args);
      // 触发更新
      return result;
    }
  });
});

// 使用变异方法
arr.push(4); // 可以监听
arr.splice(0, 1); // 可以监听

// 但直接索引赋值仍然无法监听
arr[0] = 10; // 仍然无法监听
```

#### 4. 必须遍历对象所有属性

```javascript
// 需要遍历每个属性单独设置
function observe(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }

  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key]);
  });
}

const data = {
  user: {
    name: 'Alice',
    age: 25,
    address: {
      city: 'Beijing'
    }
  }
};

// 需要递归处理嵌套对象
observe(data);
observe(data.user);
observe(data.user.address);
```

#### 5. 性能问题

```javascript
// 对象属性很多时，初始化开销大
const bigData = {};
for (let i = 0; i < 10000; i++) {
  bigData[`prop${i}`] = i;
}

// 需要遍历 10000 个属性
Object.keys(bigData).forEach(key => {
  defineReactive(bigData, key, bigData[key]);
});
```

## Proxy 详解

### 基本用法

```javascript
const obj = {
  name: 'Alice',
  age: 25
};

const proxy = new Proxy(obj, {
  get(target, property) {
    console.log(`读取 ${property}`);
    return target[property];
  },
  set(target, property, value) {
    console.log(`设置 ${property}:`, value);
    target[property] = value;
    return true;
  }
});

proxy.name = 'Bob';  // 输出: 设置 name: Bob
console.log(proxy.name); // 输出: 读取 name
```

### Proxy 可拦截的操作

Proxy 可以拦截多达 **13 种**基本操作：

```javascript
const proxy = new Proxy(target, {
  // 1. 属性读取
  get(target, property, receiver) {},

  // 2. 属性设置
  set(target, property, value, receiver) {},

  // 3. in 操作符
  has(target, property) {},

  // 4. delete 操作符
  deleteProperty(target, property) {},

  // 5. Object.getOwnPropertyNames()
  ownKeys(target) {},

  // 6. Object.getOwnPropertyDescriptor()
  getOwnPropertyDescriptor(target, property) {},

  // 7. Object.defineProperty()
  defineProperty(target, property, descriptor) {},

  // 8. Object.preventExtensions()
  preventExtensions(target) {},

  // 9. Object.getPrototypeOf()
  getPrototypeOf(target) {},

  // 10. Object.setPrototypeOf()
  setPrototypeOf(target, prototype) {},

  // 11. Object.isExtensible()
  isExtensible(target) {},

  // 12. 函数调用
  apply(target, thisArg, argumentsList) {},

  // 13. new 操作符
  construct(target, argumentsList, newTarget) {}
});
```

### Vue 3 中的实现

```javascript
function reactive(obj) {
  return new Proxy(obj, {
    get(target, property) {
      console.log(`读取 ${property}`);
      // 依赖收集
      const value = target[property];

      // 如果是对象，递归代理
      if (typeof value === 'object' && value !== null) {
        return reactive(value);
      }

      return value;
    },

    set(target, property, value) {
      console.log(`设置 ${property}:`, value);
      target[property] = value;
      // 触发更新
      return true;
    },

    deleteProperty(target, property) {
      console.log(`删除 ${property}`);
      const result = delete target[property];
      // 触发更新
      return result;
    }
  });
}

// 使用
const data = reactive({
  message: 'Hello',
  count: 0
});

data.message = 'Hi';  // 触发 set
console.log(data.message); // 触发 get
delete data.count; // 触发 deleteProperty
```

### Proxy 的优势

#### 1. 可以监听新增属性

```javascript
const data = reactive({
  name: 'Alice'
});

// ✅ 可以监听新增属性
data.age = 25; // 触发 set
console.log(data.age); // 触发 get
```

#### 2. 可以监听删除属性

```javascript
const data = reactive({
  name: 'Alice',
  age: 25
});

// ✅ 可以监听删除
delete data.age; // 触发 deleteProperty
```

#### 3. 可以监听数组变化

```javascript
const arr = reactive([1, 2, 3]);

// ✅ 可以监听索引修改
arr[0] = 10; // 触发 set

// ✅ 可以监听长度变化
arr.length = 0; // 触发 set

// ✅ 可以监听数组方法
arr.push(4); // 触发 set
arr.pop(); // 触发 deleteProperty
```

#### 4. 不需要遍历属性

```javascript
// Proxy 直接代理整个对象
const data = reactive({
  user: {
    name: 'Alice',
    age: 25
  }
});

// 自动处理嵌套对象（通过 get 递归代理）
data.user.name = 'Bob'; // 自动触发监听
```

#### 5. 更好的性能

```javascript
// 大对象也能高效处理
const bigData = {};
for (let i = 0; i < 10000; i++) {
  bigData[`prop${i}`] = i;
}

// Proxy 不需要遍历属性，初始化快
const proxy = reactive(bigData);
```

## 详细对比

### 功能对比表

| 功能 | defineProperty | Proxy |
|------|----------------|-------|
| 监听属性读取 | ✅ | ✅ |
| 监听属性设置 | ✅ | ✅ |
| 监听属性删除 | ❌ | ✅ |
| 监听属性新增 | ❌ | ✅ |
| 监听数组索引 | ❌ | ✅ |
| 监听数组长度 | ❌ | ✅ |
| 监听 in 操作 | ❌ | ✅ |
| 监听原型操作 | ❌ | ✅ |
| 需要遍历属性 | ✅ | ❌ |
| 嵌套对象处理 | 需提前递归 | 懒代理 |
| 浏览器兼容性 | IE9+ | 不支持 IE |
| 性能 | 初始化慢 | 初始化快 |

### 代码示例对比

**新增属性：**

```javascript
// defineProperty
const obj1 = { name: 'Alice' };
// 需要手动添加
Vue.set(obj1, 'age', 25);

// Proxy
const obj2 = reactive({ name: 'Alice' });
// 自动响应
obj2.age = 25;
```

**删除属性：**

```javascript
// defineProperty
const obj1 = { name: 'Alice', age: 25 };
// 需要手动删除
Vue.delete(obj1, 'age');

// Proxy
const obj2 = reactive({ name: 'Alice', age: 25 });
// 自动响应
delete obj2.age;
```

**数组操作：**

```javascript
// defineProperty
const arr1 = [1, 2, 3];
// 只能用变异方法
arr1.push(4); // ✅
arr1[0] = 10; // ❌ 无法监听
// 需要用 Vue.set
Vue.set(arr1, 0, 10);

// Proxy
const arr2 = reactive([1, 2, 3]);
// 所有操作都能监听
arr2.push(4); // ✅
arr2[0] = 10; // ✅
arr2.length = 0; // ✅
```

## 实战示例

### 实现简单的响应式系统

**defineProperty 版本：**

```javascript
class Vue2Reactive {
  constructor(data) {
    this.data = data;
    this.observe(data);
  }

  observe(obj) {
    if (typeof obj !== 'object' || obj === null) return;

    Object.keys(obj).forEach(key => {
      this.defineReactive(obj, key, obj[key]);
    });
  }

  defineReactive(obj, key, value) {
    // 递归处理嵌套对象
    this.observe(value);

    Object.defineProperty(obj, key, {
      get() {
        console.log(`[defineProperty] 读取 ${key}`);
        return value;
      },
      set: (newValue) => {
        if (newValue === value) return;
        console.log(`[defineProperty] 设置 ${key}:`, newValue);
        this.observe(newValue);
        value = newValue;
      }
    });
  }
}

// 使用
const vue2Data = new Vue2Reactive({
  user: {
    name: 'Alice',
    age: 25
  }
});

vue2Data.data.user.name = 'Bob'; // ✅ 监听到
vue2Data.data.user.email = 'bob@example.com'; // ❌ 监听不到
```

**Proxy 版本：**

```javascript
class Vue3Reactive {
  constructor(data) {
    this.data = this.reactive(data);
  }

  reactive(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    return new Proxy(obj, {
      get: (target, property) => {
        console.log(`[Proxy] 读取 ${String(property)}`);
        const value = target[property];

        // 懒代理：只有访问时才代理嵌套对象
        if (typeof value === 'object' && value !== null) {
          return this.reactive(value);
        }

        return value;
      },

      set: (target, property, value) => {
        console.log(`[Proxy] 设置 ${String(property)}:`, value);
        target[property] = value;
        return true;
      },

      deleteProperty: (target, property) => {
        console.log(`[Proxy] 删除 ${String(property)}`);
        return delete target[property];
      }
    });
  }
}

// 使用
const vue3Data = new Vue3Reactive({
  user: {
    name: 'Alice',
    age: 25
  }
});

vue3Data.data.user.name = 'Bob'; // ✅ 监听到
vue3Data.data.user.email = 'bob@example.com'; // ✅ 监听到
delete vue3Data.data.user.age; // ✅ 监听到
```

## 兼容性考虑

### Proxy 的兼容性

```javascript
// 检测 Proxy 支持
if (typeof Proxy !== 'undefined') {
  console.log('支持 Proxy');
} else {
  console.log('不支持 Proxy');
  // 降级方案
}
```

**浏览器支持：**
- Chrome 49+
- Firefox 18+
- Safari 10+
- Edge 12+
- ❌ IE 不支持（无法 polyfill）

### Vue 3 的兼容性处理

Vue 3 提供了 `@vue/reactivity` 包，可以在不同环境中使用：

```javascript
import { reactive, ref } from '@vue/reactivity';

// 现代浏览器使用 Proxy
const state = reactive({ count: 0 });

// 或使用 ref（内部也是 Proxy）
const count = ref(0);
```

## 性能对比

### 初始化性能

```javascript
// 测试大对象初始化
const bigObj = {};
for (let i = 0; i < 10000; i++) {
  bigObj[`prop${i}`] = i;
}

// defineProperty（慢）
console.time('defineProperty');
Object.keys(bigObj).forEach(key => {
  Object.defineProperty(bigObj, key, {
    get() { return this[`_${key}`]; },
    set(value) { this[`_${key}`] = value; }
  });
});
console.timeEnd('defineProperty'); // ~100ms

// Proxy（快）
console.time('Proxy');
const proxy = new Proxy(bigObj, {
  get(target, property) { return target[property]; },
  set(target, property, value) { target[property] = value; return true; }
});
console.timeEnd('Proxy'); // ~1ms
```

### 运行时性能

两者运行时性能接近，但 Proxy 在某些场景下略有优势。

## 总结

### 核心差异

| 方面 | defineProperty | Proxy |
|------|----------------|-------|
| 拦截范围 | 仅属性读写 | 所有基本操作 |
| 实现方式 | 属性劫持 | 对象代理 |
| 新增/删除 | 无法监听 | 可以监听 |
| 数组监听 | 需重写方法 | 原生支持 |
| 性能 | 初始化慢 | 初始化快 |
| 兼容性 | IE9+ | 现代浏览器 |
| 使用复杂度 | 需额外API | 更简洁 |

### 选择建议

**使用 defineProperty（Vue 2）：**
- 需要兼容 IE
- 项目已使用 Vue 2
- 数据结构固定

**使用 Proxy（Vue 3）：**
- 现代浏览器项目
- 需要更强大的响应式
- 新项目优先选择

Proxy 是未来趋势，提供了更完善、更强大的响应式能力。
