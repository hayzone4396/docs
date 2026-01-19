---
title: Vue computed 与 watch 完全指南
date: 2026-01-19 11:18:45
tags:
  - Vue
  - Computed
  - Watch
  - Composition API
categories:
  - JavaScript
  - Vue
---

# Vue computed 与 watch 完全指南

## 概述

`computed` 和 `watch` 是 Vue 中处理响应式数据变化的两个核心 API。理解它们的区别、使用场景和底层原理，是掌握 Vue 响应式系统的关键。

**核心 API**：
- `computed`：计算属性
- `watch`：侦听器
- `watchEffect`：自动依赖收集的侦听器
- `watchPostEffect` / `watchSyncEffect`：特定时机的侦听器

## 一、computed（计算属性）

### 1.1 基本用法

计算属性是基于响应式依赖进行缓存的。

```vue
<template>
  <div>
    <p>原始价格：¥{{ price }}</p>
    <p>折扣后价格：¥{{ discountedPrice }}</p>
    <p>最终价格：¥{{ finalPrice }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const price = ref(100);
const discount = ref(0.8);

// 只读计算属性
const discountedPrice = computed(() => {
  console.log('计算 discountedPrice');
  return price.value * discount.value;
});

// 计算属性会缓存结果
// 只有当 price 或 discount 变化时才会重新计算
const finalPrice = computed(() => {
  console.log('计算 finalPrice');
  return Math.round(discountedPrice.value);
});
</script>
```

### 1.2 可写计算属性

提供 getter 和 setter，实现双向计算。

```vue
<template>
  <div>
    <p>名：<input v-model="firstName" /></p>
    <p>姓：<input v-model="lastName" /></p>
    <p>全名：<input v-model="fullName" /></p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const firstName = ref('三');
const lastName = ref('张');

// 可写计算属性
const fullName = computed({
  // getter
  get() {
    return lastName.value + firstName.value;
  },
  // setter
  set(newValue) {
    // 拆分全名
    lastName.value = newValue[0];
    firstName.value = newValue.slice(1);
  }
});

// 修改 fullName 会触发 setter
// fullName.value = '李四';
// console.log(firstName.value); // '四'
// console.log(lastName.value); // '李'
</script>
```

### 1.3 计算属性缓存

计算属性会缓存结果，只有依赖变化时才重新计算。

```javascript
import { ref, computed } from 'vue';

const count = ref(0);
const message = ref('Hello');

// ✅ 计算属性：有缓存
const doubleCount = computed(() => {
  console.log('computed 执行');
  return count.value * 2;
});

// ❌ 方法：无缓存
const getDoubleCount = () => {
  console.log('方法执行');
  return count.value * 2;
};

// 多次访问计算属性，只计算一次
console.log(doubleCount.value); // 'computed 执行' 0
console.log(doubleCount.value); // 0（使用缓存，不打印）
console.log(doubleCount.value); // 0（使用缓存，不打印）

// 多次调用方法，每次都执行
console.log(getDoubleCount()); // '方法执行' 0
console.log(getDoubleCount()); // '方法执行' 0
console.log(getDoubleCount()); // '方法执行' 0

// 修改依赖后，计算属性会重新计算
count.value = 10;
console.log(doubleCount.value); // 'computed 执行' 20
```

### 1.4 Computed 进阶用法

```javascript
import { ref, computed } from 'vue';

// 基本用法
const count = ref(0);
const doubleCount = computed(() => count.value * 2);

// 格式化显示
const price = ref(100);
const formattedPrice = computed(() => {
  return `¥${price.value}`;
});

// 对象数据
const user = ref({ name: '张三', age: 25 });

const userInfo = computed(() => {
  return `${user.value.name} - ${user.value.age}岁`;
});

// 可写计算属性
const fullName = computed({
  get() {
    return `${user.value.name}`;
  },
  set(newValue) {
    user.value.name = newValue;
  }
});
```

### 1.5 计算属性的最佳实践

**✅ 应该做的：**

```javascript
import { ref, computed } from 'vue';

const todos = ref([
  { id: 1, text: '学习 Vue', done: true },
  { id: 2, text: '学习 React', done: false }
]);

// ✅ 好：简单的派生状态
const completedCount = computed(() => {
  return todos.value.filter(todo => todo.done).length;
});

// ✅ 好：格式化数据
const formattedTodos = computed(() => {
  return todos.value.map(todo => ({
    ...todo,
    status: todo.done ? '已完成' : '未完成'
  }));
});

// ✅ 好：组合多个数据源
const firstName = ref('三');
const lastName = ref('张');
const fullName = computed(() => lastName.value + firstName.value);
```

**❌ 不应该做的：**

```javascript
import { ref, computed } from 'vue';

const count = ref(0);

// ❌ 错误：不要在 computed 中修改响应式数据
const badComputed = computed(() => {
  count.value++; // ❌ 副作用
  return count.value * 2;
});

// ❌ 错误：不要执行异步操作
const asyncComputed = computed(async () => {
  const data = await fetch('/api/data'); // ❌ 异步
  return data;
});

// ❌ 错误：不要直接修改数组/对象
const list = ref([1, 2, 3]);
const badList = computed(() => {
  list.value.push(4); // ❌ 修改了原数组
  return list.value;
});
```

## 二、watch（侦听器）

### 2.1 侦听 ref

```javascript
import { ref, watch } from 'vue';

const count = ref(0);

// 侦听单个 ref
watch(count, (newValue, oldValue) => {
  console.log(`count 从 ${oldValue} 变为 ${newValue}`);
});

// 修改值，触发侦听器
count.value++; // 输出：count 从 0 变为 1
```

### 2.2 侦听 reactive 对象

```javascript
import { reactive, watch } from 'vue';

const user = reactive({
  name: '张三',
  age: 25
});

// ⚠️ 侦听整个 reactive 对象
watch(user, (newValue, oldValue) => {
  console.log('user 变化了');
  // 注意：newValue 和 oldValue 是同一个对象
  console.log(newValue === oldValue); // true
});

// 修改属性会触发侦听
user.name = '李四'; // 触发
user.age = 30; // 触发
```

### 2.3 侦听对象的特定属性

```javascript
import { reactive, watch } from 'vue';

const user = reactive({
  name: '张三',
  age: 25,
  address: {
    city: '北京'
  }
});

// 方式1：使用 getter 函数侦听特定属性
watch(
  () => user.name,
  (newName, oldName) => {
    console.log(`名字从 ${oldName} 变为 ${newName}`);
  }
);

// 方式2：侦听嵌套属性
watch(
  () => user.address.city,
  (newCity, oldCity) => {
    console.log(`城市从 ${oldCity} 变为 ${newCity}`);
  }
);

user.name = '李四'; // 触发第一个侦听器
user.address.city = '上海'; // 触发第二个侦听器
```

### 2.4 侦听多个数据源

```javascript
import { ref, watch } from 'vue';

const firstName = ref('三');
const lastName = ref('张');

// 侦听多个数据源（数组形式）
watch(
  [firstName, lastName],
  ([newFirst, newLast], [oldFirst, oldLast]) => {
    console.log(`名字从 ${oldLast}${oldFirst} 变为 ${newLast}${newFirst}`);
  }
);

firstName.value = '四'; // 触发
lastName.value = '李'; // 触发
```

### 2.5 deep（深度侦听）

```javascript
import { ref, watch } from 'vue';

const user = ref({
  name: '张三',
  profile: {
    age: 25,
    address: {
      city: '北京'
    }
  }
});

// ❌ 默认：浅层侦听，不会侦听嵌套属性变化
watch(user, (newValue) => {
  console.log('user 变化（浅层）');
});

user.value.profile.age = 30; // 不会触发

// ✅ deep: true，深度侦听所有嵌套属性
watch(
  user,
  (newValue) => {
    console.log('user 变化（深度）');
  },
  { deep: true }
);

user.value.profile.age = 30; // 触发
user.value.profile.address.city = '上海'; // 触发

// ⚠️ 注意：reactive 对象默认是深度侦听的
import { reactive } from 'vue';
const state = reactive({ nested: { count: 0 } });

watch(state, () => {
  console.log('state 变化');
}); // 自动深度侦听

state.nested.count++; // 触发
```

### 2.6 immediate（立即执行）

```javascript
import { ref, watch } from 'vue';

const count = ref(0);

// immediate: true，创建侦听器时立即执行一次
watch(
  count,
  (newValue, oldValue) => {
    console.log(`count: ${newValue}`);
  },
  { immediate: true }
);
// 输出：count: 0（立即执行）

count.value = 10;
// 输出：count: 10
```

### 2.7 flush 时机

控制侦听器回调的执行时机。

```javascript
import { ref, watch } from 'vue';

const count = ref(0);

// flush: 'pre'（默认）- 组件更新前执行
watch(
  count,
  () => {
    console.log('pre: 更新前');
  },
  { flush: 'pre' }
);

// flush: 'post' - 组件更新后执行
watch(
  count,
  () => {
    console.log('post: 更新后');
    // 可以访问更新后的 DOM
  },
  { flush: 'post' }
);

// flush: 'sync' - 同步执行（谨慎使用）
watch(
  count,
  () => {
    console.log('sync: 同步');
  },
  { flush: 'sync' }
);

count.value = 10;
// 输出顺序：sync -> pre -> post
```

### 2.8 停止侦听器

```javascript
import { ref, watch } from 'vue';

const count = ref(0);

// watch 返回一个停止函数
const stop = watch(count, (newValue) => {
  console.log(`count: ${newValue}`);

  // 条件停止
  if (newValue >= 10) {
    stop();
    console.log('侦听器已停止');
  }
});

count.value = 5; // 触发
count.value = 10; // 触发，然后停止
count.value = 15; // 不触发（已停止）
```

### 2.9 onCleanup（清理副作用）

```javascript
import { ref, watch } from 'vue';

const searchQuery = ref('');
const results = ref([]);

watch(searchQuery, async (newQuery, oldQuery, onCleanup) => {
  let cancelled = false;

  // 注册清理函数
  onCleanup(() => {
    cancelled = true;
    console.log('取消上一次请求');
  });

  // 模拟 API 请求
  const data = await fetch(`/api/search?q=${newQuery}`);

  // 如果已取消，不更新结果
  if (!cancelled) {
    results.value = await data.json();
  }
});

// 快速输入时，会取消之前未完成的请求
searchQuery.value = 'vue'; // 发起请求1
searchQuery.value = 'react'; // 取消请求1，发起请求2
```

## 三、watchEffect

### 3.1 基本用法

自动追踪依赖，无需手动指定侦听的数据源。

```javascript
import { ref, watchEffect } from 'vue';

const count = ref(0);
const message = ref('Hello');

// 自动追踪函数内使用的所有响应式数据
watchEffect(() => {
  console.log(`count: ${count.value}, message: ${message.value}`);
});
// 输出：count: 0, message: Hello（立即执行）

count.value = 10;
// 输出：count: 10, message: Hello

message.value = 'World';
// 输出：count: 10, message: World
```

### 3.2 停止侦听

```javascript
import { ref, watchEffect } from 'vue';

const count = ref(0);

const stop = watchEffect(() => {
  console.log(`count: ${count.value}`);

  if (count.value >= 10) {
    stop();
  }
});

count.value = 5; // 触发
count.value = 10; // 触发，然后停止
count.value = 15; // 不触发
```

### 3.3 清理副作用

```javascript
import { ref, watchEffect } from 'vue';

const id = ref(1);

watchEffect((onCleanup) => {
  const timer = setTimeout(() => {
    console.log(`加载数据 ${id.value}`);
  }, 1000);

  // 清理定时器
  onCleanup(() => {
    clearTimeout(timer);
    console.log('清理定时器');
  });
});

// 快速切换 id，会清理之前的定时器
id.value = 2;
id.value = 3;
```

### 3.4 执行时机

```javascript
import { ref, watchEffect, watchPostEffect, watchSyncEffect } from 'vue';

const count = ref(0);

// watchEffect（默认 flush: 'pre'）
watchEffect(() => {
  console.log('watchEffect:', count.value);
});

// watchPostEffect（flush: 'post'）- 组件更新后
watchPostEffect(() => {
  console.log('watchPostEffect:', count.value);
  // 可以访问更新后的 DOM
});

// watchSyncEffect（flush: 'sync'）- 同步执行
watchSyncEffect(() => {
  console.log('watchSyncEffect:', count.value);
});

count.value = 10;
// 输出顺序：watchSyncEffect -> watchEffect -> watchPostEffect
```

## 四、watch vs watchEffect

### 4.1 核心差异

| 特性 | watch | watchEffect |
|------|-------|-------------|
| **依赖指定** | 手动指定数据源 | 自动追踪依赖 |
| **执行时机** | 依赖变化时执行 | 立即执行 + 依赖变化时执行 |
| **访问旧值** | ✅ 可以访问 | ❌ 不可访问 |
| **惰性** | ✅ 默认惰性（可配置 immediate） | ❌ 立即执行 |
| **精确控制** | ✅ 更精确 | ❌ 自动依赖 |

### 4.2 使用场景对比

**使用 watch：**

```javascript
import { ref, watch } from 'vue';

const question = ref('');
const answer = ref('');

// ✅ 需要访问旧值
watch(question, (newQuestion, oldQuestion) => {
  console.log(`问题从 "${oldQuestion}" 变为 "${newQuestion}"`);
});

// ✅ 需要明确的数据源
watch(
  () => props.userId,
  async (newId) => {
    // 只有 userId 变化时才执行
    answer.value = await fetchAnswer(newId);
  }
);

// ✅ 需要惰性执行（不需要立即执行）
watch(searchQuery, async (query) => {
  // 只在 searchQuery 变化时查询
  results.value = await search(query);
});
```

**使用 watchEffect：**

```javascript
import { ref, watchEffect } from 'vue';

const count = ref(0);
const doubled = ref(0);

// ✅ 自动追踪依赖，代码更简洁
watchEffect(() => {
  doubled.value = count.value * 2;
  console.log(`count: ${count.value}, doubled: ${doubled.value}`);
});

// ✅ 多个依赖，自动追踪
const firstName = ref('三');
const lastName = ref('张');

watchEffect(() => {
  console.log(`全名：${lastName.value}${firstName.value}`);
});

// ✅ 副作用需要立即执行
watchEffect(() => {
  document.title = `计数：${count.value}`;
});
```

## 五、底层原理

### 5.1 computed 原理

computed 基于 **lazy evaluation（惰性求值）** 和 **缓存机制**：

```javascript
// 简化的 computed 实现原理
class ComputedRefImpl {
  constructor(getter) {
    this._value = undefined;
    this._dirty = true; // 标记是否需要重新计算
    this.effect = new ReactiveEffect(getter, () => {
      // 依赖变化时，标记为 dirty
      if (!this._dirty) {
        this._dirty = true;
        // 触发依赖此 computed 的更新
        triggerRefValue(this);
      }
    });
  }

  get value() {
    // 追踪依赖
    trackRefValue(this);

    // 只有 dirty 为 true 时才重新计算
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run(); // 执行 getter
    }

    return this._value; // 返回缓存值
  }
}

// 使用示例
const count = ref(0);
const doubled = computed(() => count.value * 2);

console.log(doubled.value); // 计算：0
console.log(doubled.value); // 缓存：0（不重新计算）

count.value = 10; // 标记 dirty = true

console.log(doubled.value); // 重新计算：20
```

**关键点**：
1. **依赖收集**：getter 执行时收集依赖
2. **标记机制**：依赖变化时标记 `_dirty = true`
3. **惰性计算**：访问 `.value` 时才计算
4. **缓存**：`_dirty` 为 false 时直接返回缓存值

### 5.2 watch 原理

watch 基于 **ReactiveEffect** 和 **scheduler（调度器）**：

```javascript
// 简化的 watch 实现原理
function watch(source, cb, options = {}) {
  let getter;

  // 处理不同的数据源
  if (isRef(source)) {
    getter = () => source.value;
  } else if (isReactive(source)) {
    getter = () => source;
    options.deep = true; // reactive 默认深度侦听
  } else if (isFunction(source)) {
    getter = source;
  }

  let oldValue;
  let cleanup;

  const onCleanup = (fn) => {
    cleanup = fn;
  };

  const job = () => {
    // 执行清理函数
    if (cleanup) {
      cleanup();
    }

    const newValue = effect.run(); // 获取新值

    // 执行回调
    cb(newValue, oldValue, onCleanup);

    oldValue = newValue;
  };

  // 创建 effect
  const effect = new ReactiveEffect(getter, () => {
    // 调度执行
    if (options.flush === 'sync') {
      job(); // 同步执行
    } else if (options.flush === 'post') {
      queuePostFlushCb(job); // 组件更新后执行
    } else {
      queueJob(job); // 默认：组件更新前执行
    }
  });

  // immediate：立即执行
  if (options.immediate) {
    job();
  } else {
    oldValue = effect.run(); // 初始化 oldValue
  }

  // 返回停止函数
  return () => {
    effect.stop();
  };
}
```

**关键点**：
1. **依赖收集**：执行 getter 函数收集依赖
2. **调度器**：控制回调执行时机（sync/pre/post）
3. **新旧值对比**：保存 oldValue，传递给回调
4. **清理机制**：onCleanup 处理副作用清理

### 5.3 watchEffect 原理

watchEffect 是 watch 的简化版本，自动追踪依赖：

```javascript
// watchEffect 实现原理
function watchEffect(effect, options) {
  return watch(effect, null, options);
}

// 等价于
function watchEffect(effect, options) {
  return doWatch(
    effect,
    null, // 没有回调
    {
      ...options,
      immediate: true // 立即执行
    }
  );
}
```

**关键点**：
1. 本质是特殊的 watch
2. 无需指定数据源，自动追踪
3. 默认 `immediate: true`
4. 没有旧值

## 六、实战示例

### 示例 1：搜索防抖

```vue
<template>
  <div>
    <input v-model="searchQuery" placeholder="搜索..." />
    <div v-if="loading">加载中...</div>
    <ul v-else>
      <li v-for="item in results" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const searchQuery = ref('');
const results = ref([]);
const loading = ref(false);

let timeoutId;

watch(searchQuery, (newQuery) => {
  // 清除之前的定时器（防抖）
  clearTimeout(timeoutId);

  if (!newQuery) {
    results.value = [];
    return;
  }

  loading.value = true;

  timeoutId = setTimeout(async () => {
    try {
      const response = await fetch(`/api/search?q=${newQuery}`);
      results.value = await response.json();
    } finally {
      loading.value = false;
    }
  }, 300); // 300ms 防抖
});
</script>
```

### 示例 2：表单验证

```vue
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <div>
        <input v-model="form.email" placeholder="邮箱" />
        <span v-if="emailError" class="error">{{ emailError }}</span>
      </div>
      <div>
        <input v-model="form.password" type="password" placeholder="密码" />
        <span v-if="passwordError" class="error">{{ passwordError }}</span>
      </div>
      <button :disabled="!isFormValid">提交</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';

const form = reactive({
  email: '',
  password: ''
});

const emailError = ref('');
const passwordError = ref('');

// 邮箱验证
watch(
  () => form.email,
  (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emailError.value = emailRegex.test(email) ? '' : '邮箱格式不正确';
  }
);

// 密码验证
watch(
  () => form.password,
  (password) => {
    passwordError.value = password.length >= 6 ? '' : '密码至少6位';
  }
);

// 表单是否有效
const isFormValid = computed(() => {
  return !emailError.value && !passwordError.value &&
         form.email && form.password;
});

const handleSubmit = () => {
  if (isFormValid.value) {
    console.log('提交表单', form);
  }
};
</script>
```

### 示例 3：数据同步

```javascript
import { ref, watch } from 'vue';

const localData = ref(null);

// 从 localStorage 加载数据
const loadData = () => {
  const saved = localStorage.getItem('userData');
  if (saved) {
    localData.value = JSON.parse(saved);
  }
};

// 监听数据变化，自动保存到 localStorage
watch(
  localData,
  (newData) => {
    if (newData) {
      localStorage.setItem('userData', JSON.stringify(newData));
      console.log('数据已保存');
    }
  },
  { deep: true }
);

// 初始化加载
loadData();
```

### 示例 4：响应式文档标题

```javascript
import { ref, watchEffect } from 'vue';

const count = ref(0);
const pageTitle = ref('首页');

// 自动更新文档标题
watchEffect(() => {
  document.title = `${pageTitle.value} - 计数: ${count.value}`;
});

const increment = () => {
  count.value++;
};
```

## 七、性能优化

### 7.1 避免不必要的深度侦听

```javascript
import { ref, watch } from 'vue';

const largeObject = ref({
  // 大量数据
  items: []
});

// ❌ 不好：深度侦听大对象，性能差
watch(largeObject, () => {
  console.log('变化');
}, { deep: true });

// ✅ 好：只侦听需要的属性
watch(
  () => largeObject.value.items.length,
  (newLength) => {
    console.log('数组长度变化:', newLength);
  }
);
```

### 7.2 使用计算属性缓存

```javascript
import { ref, computed } from 'vue';

const list = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

// ❌ 不好：方法每次都重新计算
const getFilteredList = () => {
  console.log('计算 filtered list');
  return list.value.filter(item => item > 5);
};

// ✅ 好：计算属性会缓存
const filteredList = computed(() => {
  console.log('计算 filtered list');
  return list.value.filter(item => item > 5);
});
```

### 7.3 及时停止不需要的侦听器

```javascript
import { ref, watch, onUnmounted } from 'vue';

const data = ref(null);

const stop = watch(data, (newData) => {
  console.log('数据变化', newData);
});

// 组件卸载时停止侦听
onUnmounted(() => {
  stop();
});

// 或者条件停止
const handleComplete = () => {
  stop();
};
```

## 八、常见问题

### Q1: computed 和 method 的区别？

**A**:
- **computed**：基于依赖缓存，依赖不变时返回缓存值
- **method**：每次调用都会执行

### Q2: watch 和 watchEffect 如何选择？

**A**:
- **watch**：需要访问旧值、明确的数据源、惰性执行
- **watchEffect**：自动追踪依赖、立即执行、代码更简洁

### Q3: 为什么 watch reactive 对象时，新旧值相同？

**A**: reactive 返回的是 Proxy 代理，新旧值指向同一个对象。如果需要旧值，使用 getter 函数侦听特定属性。

```javascript
// ❌ 新旧值相同
watch(user, (newValue, oldValue) => {
  console.log(newValue === oldValue); // true
});

// ✅ 可以获取旧值
watch(
  () => user.name,
  (newName, oldName) => {
    console.log(newName, oldName); // 不同
  }
);
```

### Q4: 如何停止 watchEffect？

**A**: watchEffect 返回停止函数。

```javascript
const stop = watchEffect(() => {
  // ...
});

// 停止侦听
stop();
```

### Q5: computed 可以有副作用吗？

**A**: 不应该。computed 应该是纯函数，不应该修改响应式数据或执行异步操作。

## 九、总结

### 核心要点

1. **computed**：
   - 基于依赖缓存
   - 用于派生状态
   - 应该是纯函数

2. **watch**：
   - 手动指定数据源
   - 可以访问旧值
   - 适合副作用操作

3. **watchEffect**：
   - 自动追踪依赖
   - 立即执行
   - 代码更简洁

### 使用建议

| 场景 | 推荐 API |
|------|---------|
| 派生状态 | computed |
| 格式化数据 | computed |
| 需要旧值 | watch |
| 异步操作 | watch |
| 副作用（DOM、网络） | watch / watchEffect |
| 自动追踪依赖 | watchEffect |

## 参考资源

- [Vue 3 官方文档 - 计算属性](https://cn.vuejs.org/guide/essentials/computed.html)
- [Vue 3 官方文档 - 侦听器](https://cn.vuejs.org/guide/essentials/watchers.html)
- [Vue 3 深入响应式系统](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)
