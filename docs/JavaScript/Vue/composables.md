---
title: Vue Composables（组合式函数）完全指南
date: 2025-01-19 11:21:12
tags:
  - Vue
  - Composables
  - Hooks
  - Composition API
categories:
  - JavaScript
  - Vue
---

# Vue Composables（组合式函数）完全指南

## 概述

Composables（组合式函数）是 Vue 3 Composition API 的核心概念之一，也被称为 **Hooks**。它允许我们将组件的逻辑提取到可复用的函数中，实现逻辑的组合与复用。

**核心概念**：
- **Composable**：利用 Composition API 封装和复用**有状态逻辑**的函数
- **命名约定**：以 `use` 开头（如 `useCounter`、`useMouse`）
- **本质**：包含响应式状态和副作用的可复用函数

## 一、什么是 Composable

### 1.1 基本概念

Composable 是一个利用 Vue 的 Composition API 来封装和复用**有状态逻辑**的函数。

```vue
<script setup>
import { ref } from 'vue';

// ✅ 这是一个 Composable
function useCounter(initialValue = 0) {
  const count = ref(initialValue);

  const increment = () => {
    count.value++;
  };

  const decrement = () => {
    count.value--;
  };

  return {
    count,
    increment,
    decrement
  };
}

// 使用 Composable
const { count, increment, decrement } = useCounter(0);
</script>

<template>
  <div>
    <p>计数：{{ count }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>
```

### 1.2 Composable vs 工具函数

```javascript
// ❌ 这不是 Composable，只是普通工具函数
function formatDate(date) {
  return date.toLocaleDateString();
}

// ✅ 这是 Composable（有状态）
function useCurrentTime() {
  const time = ref(new Date());

  const update = () => {
    time.value = new Date();
  };

  setInterval(update, 1000);

  return { time };
}
```

**区别**：
- **工具函数**：无状态，纯函数
- **Composable**：有状态，使用响应式 API

## 二、创建 Composable

### 2.1 基础示例

创建一个鼠标位置追踪的 Composable。

```javascript
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouse() {
  // 响应式状态
  const x = ref(0);
  const y = ref(0);

  // 更新鼠标位置
  const update = (event) => {
    x.value = event.pageX;
    y.value = event.pageY;
  };

  // 副作用：添加事件监听
  onMounted(() => {
    window.addEventListener('mousemove', update);
  });

  // 清理：移除事件监听
  onUnmounted(() => {
    window.removeEventListener('mousemove', update);
  });

  // 返回状态和方法
  return { x, y };
}
```

**使用：**

```vue
<template>
  <div>
    <p>鼠标位置：{{ x }}, {{ y }}</p>
  </div>
</template>

<script setup>
import { useMouse } from '@/composables/useMouse';

const { x, y } = useMouse();
</script>
```

### 2.2 接受参数

Composable 可以接受响应式参数。

```javascript
// composables/useFetch.js
import { ref, watchEffect, toValue } from 'vue';

export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);

  watchEffect(async () => {
    // toValue() 处理 ref 或普通值
    const urlValue = toValue(url);

    loading.value = true;
    data.value = null;
    error.value = null;

    try {
      const response = await fetch(urlValue);
      data.value = await response.json();
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  });

  return { data, error, loading };
}
```

**使用：**

```vue
<script setup>
import { ref } from 'vue';
import { useFetch } from '@/composables/useFetch';

const userId = ref(1);

// url 是响应式的，userId 变化时自动重新请求
const { data, error, loading } = useFetch(
  () => `/api/users/${userId.value}`
);
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误：{{ error.message }}</div>
    <div v-else>{{ data }}</div>

    <button @click="userId++">下一个用户</button>
  </div>
</template>
```

### 2.3 返回值规范

```javascript
import { ref, computed, toRefs } from 'vue';

// ✅ 推荐：返回对象，方便解构
function useCounter() {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  const increment = () => count.value++;

  return {
    count,
    doubleCount,
    increment
  };
}

// 使用
const { count, increment } = useCounter();

// ✅ 如果需要保持解构后的响应式，使用 toRefs
function useUser() {
  const state = reactive({
    name: '张三',
    age: 25
  });

  return toRefs(state);
}

// 解构后仍然是响应式的
const { name, age } = useUser();
```

## 三、常用 Composables 实战

### 3.1 useCounter（计数器）

```javascript
// composables/useCounter.js
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0, options = {}) {
  const {
    min = -Infinity,
    max = Infinity,
    step = 1
  } = options;

  const count = ref(initialValue);

  const increment = () => {
    if (count.value + step <= max) {
      count.value += step;
    }
  };

  const decrement = () => {
    if (count.value - step >= min) {
      count.value -= step;
    }
  };

  const reset = () => {
    count.value = initialValue;
  };

  const set = (value) => {
    if (value >= min && value <= max) {
      count.value = value;
    }
  };

  const isMin = computed(() => count.value <= min);
  const isMax = computed(() => count.value >= max);

  return {
    count,
    increment,
    decrement,
    reset,
    set,
    isMin,
    isMax
  };
}
```

**使用：**

```vue
<template>
  <div>
    <p>计数：{{ count }}</p>
    <button @click="decrement" :disabled="isMin">-</button>
    <button @click="increment" :disabled="isMax">+</button>
    <button @click="reset">重置</button>
  </div>
</template>

<script setup>
import { useCounter } from '@/composables/useCounter';

const { count, increment, decrement, reset, isMin, isMax } = useCounter(0, {
  min: 0,
  max: 10,
  step: 2
});
</script>
```

### 3.2 useLocalStorage（本地存储）

```javascript
// composables/useLocalStorage.js
import { ref, watch } from 'vue';

export function useLocalStorage(key, defaultValue) {
  // 从 localStorage 读取初始值
  const read = () => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  };

  const data = ref(read());

  // 监听变化，自动保存
  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue));
    },
    { deep: true }
  );

  return data;
}
```

**使用：**

```vue
<template>
  <div>
    <input v-model="name" placeholder="输入姓名" />
    <p>保存的姓名：{{ name }}</p>
  </div>
</template>

<script setup>
import { useLocalStorage } from '@/composables/useLocalStorage';

// 自动同步到 localStorage
const name = useLocalStorage('user-name', '');
</script>
```

### 3.3 useDebounce（防抖）

```javascript
// composables/useDebounce.js
import { ref, watch } from 'vue';

export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value);

  let timeoutId;

  watch(value, (newValue) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  return debouncedValue;
}
```

**使用：**

```vue
<template>
  <div>
    <input v-model="searchQuery" placeholder="搜索..." />
    <p>防抖后的值：{{ debouncedQuery }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useDebounce } from '@/composables/useDebounce';

const searchQuery = ref('');
const debouncedQuery = useDebounce(searchQuery, 500);

// 使用防抖后的值进行搜索
watch(debouncedQuery, async (query) => {
  if (query) {
    const results = await search(query);
    console.log(results);
  }
});
</script>
```

### 3.4 useToggle（开关）

```javascript
// composables/useToggle.js
import { ref } from 'vue';

export function useToggle(initialValue = false) {
  const state = ref(initialValue);

  const toggle = () => {
    state.value = !state.value;
  };

  const setTrue = () => {
    state.value = true;
  };

  const setFalse = () => {
    state.value = false;
  };

  return {
    state,
    toggle,
    setTrue,
    setFalse
  };
}
```

**使用：**

```vue
<template>
  <div>
    <button @click="toggle">切换</button>
    <div v-if="isVisible">显示的内容</div>
  </div>
</template>

<script setup>
import { useToggle } from '@/composables/useToggle';

const { state: isVisible, toggle } = useToggle(false);
</script>
```

### 3.5 useEventListener（事件监听）

```javascript
// composables/useEventListener.js
import { onMounted, onUnmounted } from 'vue';

export function useEventListener(target, event, handler) {
  onMounted(() => {
    target.addEventListener(event, handler);
  });

  onUnmounted(() => {
    target.removeEventListener(event, handler);
  });
}
```

**使用：**

```vue
<script setup>
import { ref } from 'vue';
import { useEventListener } from '@/composables/useEventListener';

const key = ref('');

useEventListener(window, 'keydown', (e) => {
  key.value = e.key;
});
</script>

<template>
  <div>
    <p>按下的键：{{ key }}</p>
  </div>
</template>
```

### 3.6 useWindowSize（窗口尺寸）

```javascript
// composables/useWindowSize.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useWindowSize() {
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);

  const update = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  };

  onMounted(() => {
    window.addEventListener('resize', update);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', update);
  });

  return { width, height };
}
```

**使用：**

```vue
<template>
  <div>
    <p>窗口宽度：{{ width }}px</p>
    <p>窗口高度：{{ height }}px</p>
    <p v-if="width < 768">移动端</p>
    <p v-else>桌面端</p>
  </div>
</template>

<script setup>
import { useWindowSize } from '@/composables/useWindowSize';

const { width, height } = useWindowSize();
</script>
```

### 3.7 useAsync（异步操作）

```javascript
// composables/useAsync.js
import { ref } from 'vue';

export function useAsync(asyncFn) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);

  const execute = async (...args) => {
    loading.value = true;
    error.value = null;

    try {
      data.value = await asyncFn(...args);
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  };

  return {
    data,
    error,
    loading,
    execute
  };
}
```

**使用：**

```vue
<template>
  <div>
    <button @click="loadUser" :disabled="loading">加载用户</button>

    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误：{{ error.message }}</div>
    <div v-else-if="data">
      <p>姓名：{{ data.name }}</p>
      <p>邮箱：{{ data.email }}</p>
    </div>
  </div>
</template>

<script setup>
import { useAsync } from '@/composables/useAsync';

const fetchUser = async (id) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

const { data, error, loading, execute: loadUser } = useAsync(fetchUser);

// 手动触发
const handleClick = () => {
  loadUser(1);
};
</script>
```

## 四、组合多个 Composables

### 4.1 Composable 嵌套

Composable 可以相互调用，实现更复杂的功能。

```javascript
// composables/useMouseInElement.js
import { ref, computed } from 'vue';
import { useMouse } from './useMouse';
import { useEventListener } from './useEventListener';

export function useMouseInElement(target) {
  const { x, y } = useMouse();

  const elementX = ref(0);
  const elementY = ref(0);
  const isInside = ref(false);

  useEventListener(target, 'mouseenter', () => {
    isInside.value = true;
  });

  useEventListener(target, 'mouseleave', () => {
    isInside.value = false;
  });

  const relativeX = computed(() => {
    if (!isInside.value) return 0;
    const rect = target.value.getBoundingClientRect();
    return x.value - rect.left;
  });

  const relativeY = computed(() => {
    if (!isInside.value) return 0;
    const rect = target.value.getBoundingClientRect();
    return y.value - rect.top;
  });

  return {
    x: relativeX,
    y: relativeY,
    isInside
  };
}
```

### 4.2 组合示例：表单验证

```javascript
// composables/useForm.js
import { reactive, computed } from 'vue';

export function useForm(initialValues, validators) {
  const form = reactive({ ...initialValues });
  const errors = reactive({});
  const touched = reactive({});

  const validate = (field) => {
    if (validators[field]) {
      const error = validators[field](form[field]);
      errors[field] = error;
      return !error;
    }
    return true;
  };

  const validateAll = () => {
    let isValid = true;
    Object.keys(validators).forEach((field) => {
      if (!validate(field)) {
        isValid = false;
      }
    });
    return isValid;
  };

  const handleBlur = (field) => {
    touched[field] = true;
    validate(field);
  };

  const isValid = computed(() => {
    return Object.values(errors).every(error => !error);
  });

  const reset = () => {
    Object.assign(form, initialValues);
    Object.keys(errors).forEach(key => {
      errors[key] = '';
    });
    Object.keys(touched).forEach(key => {
      touched[key] = false;
    });
  };

  return {
    form,
    errors,
    touched,
    isValid,
    validate,
    validateAll,
    handleBlur,
    reset
  };
}
```

**使用：**

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <input
        v-model="form.email"
        @blur="handleBlur('email')"
        placeholder="邮箱"
      />
      <span v-if="touched.email && errors.email" class="error">
        {{ errors.email }}
      </span>
    </div>

    <div>
      <input
        v-model="form.password"
        @blur="handleBlur('password')"
        type="password"
        placeholder="密码"
      />
      <span v-if="touched.password && errors.password" class="error">
        {{ errors.password }}
      </span>
    </div>

    <button type="submit" :disabled="!isValid">提交</button>
  </form>
</template>

<script setup>
import { useForm } from '@/composables/useForm';

const validators = {
  email: (value) => {
    if (!value) return '邮箱不能为空';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return '邮箱格式不正确';
    }
    return '';
  },
  password: (value) => {
    if (!value) return '密码不能为空';
    if (value.length < 6) return '密码至少6位';
    return '';
  }
};

const {
  form,
  errors,
  touched,
  isValid,
  validateAll,
  handleBlur,
  reset
} = useForm(
  { email: '', password: '' },
  validators
);

const handleSubmit = () => {
  if (validateAll()) {
    console.log('提交表单', form);
    reset();
  }
};
</script>
```

## 五、Composables 最佳实践

### 5.1 命名规范

```javascript
// ✅ 推荐：以 use 开头
export function useMouse() { }
export function useCounter() { }
export function useLocalStorage() { }

// ❌ 不推荐
export function mouse() { }
export function counter() { }
export function storage() { }
```

### 5.2 参数设计

```javascript
// ✅ 推荐：接受响应式参数和配置对象
export function useFetch(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    immediate = true
  } = options;

  // ...
}

// 使用
const url = ref('/api/users');
useFetch(url, {
  method: 'POST',
  immediate: false
});
```

### 5.3 返回值设计

```javascript
// ✅ 推荐：返回对象，方便解构和重命名
export function useCounter() {
  const count = ref(0);
  const increment = () => count.value++;

  return {
    count,
    increment
  };
}

// 使用时可以重命名
const { count: userCount, increment: incrementUser } = useCounter();

// ❌ 不推荐：返回数组（不能重命名）
export function useCounter() {
  const count = ref(0);
  const increment = () => count.value++;

  return [count, increment];
}
```

### 5.4 副作用清理

```javascript
// ✅ 推荐：自动清理副作用
export function useEventListener(target, event, handler) {
  onMounted(() => {
    target.addEventListener(event, handler);
  });

  // 自动清理
  onUnmounted(() => {
    target.removeEventListener(event, handler);
  });
}

// ❌ 不推荐：需要手动清理
export function useEventListener(target, event, handler) {
  target.addEventListener(event, handler);

  // 返回清理函数（使用者容易忘记调用）
  return () => {
    target.removeEventListener(event, handler);
  };
}
```

### 5.5 类型定义（TypeScript）

```typescript
// composables/useCounter.ts
import { ref, Ref } from 'vue';

interface UseCounterOptions {
  min?: number;
  max?: number;
  step?: number;
}

interface UseCounterReturn {
  count: Ref<number>;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export function useCounter(
  initialValue = 0,
  options: UseCounterOptions = {}
): UseCounterReturn {
  const { min = -Infinity, max = Infinity, step = 1 } = options;

  const count = ref(initialValue);

  const increment = () => {
    if (count.value + step <= max) {
      count.value += step;
    }
  };

  const decrement = () => {
    if (count.value - step >= min) {
      count.value -= step;
    }
  };

  const reset = () => {
    count.value = initialValue;
  };

  return {
    count,
    increment,
    decrement,
    reset
  };
}
```

## 六、实战案例

### 案例 1：分页器

```javascript
// composables/usePagination.js
import { ref, computed } from 'vue';

export function usePagination(items, itemsPerPage = 10) {
  const currentPage = ref(1);

  const totalPages = computed(() => {
    return Math.ceil(items.value.length / itemsPerPage);
  });

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.value.slice(start, end);
  });

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  const nextPage = () => {
    goToPage(currentPage.value + 1);
  };

  const prevPage = () => {
    goToPage(currentPage.value - 1);
  };

  const hasNext = computed(() => currentPage.value < totalPages.value);
  const hasPrev = computed(() => currentPage.value > 1);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev
  };
}
```

**使用：**

```vue
<template>
  <div>
    <ul>
      <li v-for="item in paginatedItems" :key="item.id">
        {{ item.name }}
      </li>
    </ul>

    <div class="pagination">
      <button @click="prevPage" :disabled="!hasPrev">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="!hasNext">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePagination } from '@/composables/usePagination';

const items = ref([
  { id: 1, name: '项目1' },
  { id: 2, name: '项目2' },
  // ... 更多项目
]);

const {
  currentPage,
  totalPages,
  paginatedItems,
  nextPage,
  prevPage,
  hasNext,
  hasPrev
} = usePagination(items, 5);
</script>
```

### 案例 2：无限滚动

```javascript
// composables/useInfiniteScroll.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useInfiniteScroll(callback, options = {}) {
  const { distance = 100 } = options;
  const isLoading = ref(false);

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const distanceToBottom = documentHeight - (scrollTop + windowHeight);

    if (distanceToBottom < distance && !isLoading.value) {
      isLoading.value = true;
      callback().finally(() => {
        isLoading.value = false;
      });
    }
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  return {
    isLoading
  };
}
```

**使用：**

```vue
<template>
  <div>
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>

    <div v-if="isLoading" class="loading">加载中...</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';

const items = ref([]);
const page = ref(1);

const loadMore = async () => {
  const response = await fetch(`/api/items?page=${page.value}`);
  const newItems = await response.json();
  items.value.push(...newItems);
  page.value++;
};

const { isLoading } = useInfiniteScroll(loadMore, {
  distance: 200
});

// 初始加载
loadMore();
</script>
```

## 七、常见问题

### Q1: Composable 什么时候执行？

**A**: Composable 在组件的 `setup` 函数中调用时执行。每个组件实例会独立执行一次。

### Q2: Composable 中的状态是共享的吗？

**A**: 不是。每次调用 Composable 都会创建新的状态实例。

```javascript
// 组件 A
const { count } = useCounter(); // count1

// 组件 B
const { count } = useCounter(); // count2（独立的）
```

### Q3: 如何创建全局共享的状态？

**A**: 在 Composable 外部定义状态。

```javascript
// 全局状态
const globalCount = ref(0);

export function useGlobalCounter() {
  const increment = () => {
    globalCount.value++;
  };

  return {
    count: globalCount, // 共享状态
    increment
  };
}
```

### Q4: Composable 可以在普通函数中调用吗？

**A**: 不可以。Composable 必须在 `setup` 函数或其他 Composable 中调用。

```javascript
// ❌ 错误
function normalFunction() {
  const { count } = useCounter(); // 错误
}

// ✅ 正确
export function useMyFeature() {
  const { count } = useCounter(); // 正确
  // ...
}
```

## 八、总结

### 核心要点

1. **Composable** 是封装和复用有状态逻辑的函数
2. **命名约定**：以 `use` 开头
3. **返回值**：返回对象，方便解构
4. **副作用清理**：使用生命周期钩子自动清理
5. **类型安全**：使用 TypeScript 提供类型定义

### 使用建议

- 提取可复用的逻辑到 Composable
- 保持 Composable 单一职责
- 提供清晰的 API 和类型定义
- 自动处理副作用清理
- 支持响应式参数

## 参考资源

- [Vue 3 官方文档 - 组合式函数](https://cn.vuejs.org/guide/reusability/composables.html)
- [VueUse - 常用 Composables 库](https://vueuse.org/)
- [Composition API FAQ](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
