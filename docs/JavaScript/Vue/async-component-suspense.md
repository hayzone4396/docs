---
title: Vue 异步组件与 Suspense 完全指南
date: 2026-01-19 10:42:00
tags:
  - Vue
  - Vue 3
  - 异步组件
  - Suspense
  - 性能优化
categories:
  - Vue
---

# Vue 异步组件与 Suspense 完全指南

异步组件和 Suspense 是 Vue 3 提供的强大功能，用于优化应用性能、实现代码分割和改善用户体验。本文将详细介绍它们的使用方法、应用场景和最佳实践。

## 什么是异步组件？

异步组件（Async Component）是一种延迟加载组件的技术，只在需要时才加载组件代码，而不是在应用初始化时一次性加载所有组件。

### 核心优势

- ✅ **代码分割**：将大型应用拆分成多个小块
- ✅ **按需加载**：只加载用户当前需要的组件
- ✅ **减少初始包体积**：提升首屏加载速度
- ✅ **优化性能**：降低内存占用和网络传输

### 传统方式 vs 异步组件

```vue
<!-- ❌ 传统方式：所有组件都会被打包到一起 -->
<script setup>
import ComponentA from './ComponentA.vue';
import ComponentB from './ComponentB.vue';
import ComponentC from './ComponentC.vue';
</script>

<!-- ✅ 异步组件：按需加载，分包处理 -->
<script setup>
import { defineAsyncComponent } from 'vue';

const ComponentA = defineAsyncComponent(() => import('./ComponentA.vue'));
const ComponentB = defineAsyncComponent(() => import('./ComponentB.vue'));
const ComponentC = defineAsyncComponent(() => import('./ComponentC.vue'));
</script>
```

## 什么是 Suspense？

Suspense 是 Vue 3 新增的内置组件，用于协调异步组件的加载状态，提供优雅的加载中状态处理。

### 核心功能

- ✅ **统一加载状态**：集中管理多个异步组件的加载
- ✅ **声明式 UI**：使用插槽定义加载和完成状态
- ✅ **嵌套支持**：支持多层嵌套的异步组件
- ✅ **错误处理**：配合 `onErrorCaptured` 处理加载错误

## 版本要求

- **Vue 3.0+**: 异步组件和 Suspense 是 Vue 3 的新特性
- **Vue 2.x**: 不支持 Suspense，异步组件使用不同 API
- **实验性特性**: Suspense 在 Vue 3 中仍是实验性功能，API 可能变化

## 基本使用

### 定义异步组件

#### 方式一：简单导入

```javascript
import { defineAsyncComponent } from 'vue';

// 简单的异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
);
```

#### 方式二：带配置选项

```javascript
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent({
  // 加载函数
  loader: () => import('./components/HeavyComponent.vue'),

  // 加载异步组件时使用的组件
  loadingComponent: LoadingSpinner,

  // 展示加载组件前的延迟时间，默认 200ms
  delay: 200,

  // 加载失败后展示的组件
  errorComponent: ErrorComponent,

  // 如果提供了 timeout，并且加载组件的时间超过了设定值，将显示错误组件
  // 默认：Infinity（永不超时）
  timeout: 3000,

  // 定义组件是否可挂起，默认 true
  suspensible: true,

  // 错误处理函数
  onError(error, retry, fail, attempts) {
    if (error.message.match(/fetch/) && attempts <= 3) {
      // 请求失败时重试，最多 3 次
      retry();
    } else {
      // 注意，retry/fail 类似于 promise 的 resolve/reject：
      // 必须调用其中一个才能继续错误处理
      fail();
    }
  },
});
```

### 使用 Suspense

#### 基本语法

```vue
<template>
  <Suspense>
    <!-- 默认插槽：异步组件 -->
    <template #default>
      <AsyncComponent />
    </template>

    <!-- 后备插槽：加载状态 -->
    <template #fallback>
      <div class="loading">加载中...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
);
</script>
```

#### 完整示例

```vue
<template>
  <div class="app">
    <h1>异步组件示例</h1>

    <Suspense>
      <!-- 渲染内容 -->
      <template #default>
        <UserProfile :userId="userId" />
      </template>

      <!-- 加载中状态 -->
      <template #fallback>
        <div class="loading-container">
          <LoadingSpinner />
          <p>加载用户信息中...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue';
import LoadingSpinner from './components/LoadingSpinner.vue';

const userId = ref(123);

// 定义异步组件
const UserProfile = defineAsyncComponent(() =>
  import('./components/UserProfile.vue')
);
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
</style>
```

## 完整示例

### 1. 带数据获取的异步组件

```vue
<!-- UserProfile.vue -->
<template>
  <div class="user-profile">
    <img :src="user.avatar" :alt="user.name" />
    <h2>{{ user.name }}</h2>
    <p>{{ user.bio }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  userId: {
    type: Number,
    required: true,
  },
});

// 异步获取数据
const user = ref(null);

// 在 setup 中使用 await 会自动触发 Suspense
const response = await fetch(`/api/users/${props.userId}`);
user.value = await response.json();
</script>

<style scoped>
.user-profile {
  padding: 20px;
  text-align: center;
}

.user-profile img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
</style>
```

```vue
<!-- App.vue -->
<template>
  <Suspense>
    <template #default>
      <UserProfile :userId="123" />
    </template>

    <template #fallback>
      <div>加载用户信息中...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const UserProfile = defineAsyncComponent(() =>
  import('./UserProfile.vue')
);
</script>
```

### 2. 多个异步组件

```vue
<template>
  <Suspense>
    <template #default>
      <div class="dashboard">
        <!-- 多个异步组件会并行加载 -->
        <UserInfo :userId="userId" />
        <UserPosts :userId="userId" />
        <UserStats :userId="userId" />
      </div>
    </template>

    <template #fallback>
      <div class="loading-dashboard">
        <LoadingSkeleton />
      </div>
    </template>
  </Suspense>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue';
import LoadingSkeleton from './components/LoadingSkeleton.vue';

const userId = ref(123);

// 定义多个异步组件
const UserInfo = defineAsyncComponent(() => import('./components/UserInfo.vue'));
const UserPosts = defineAsyncComponent(() => import('./components/UserPosts.vue'));
const UserStats = defineAsyncComponent(() => import('./components/UserStats.vue'));
</script>
```

### 3. 嵌套 Suspense

```vue
<template>
  <!-- 外层 Suspense -->
  <Suspense>
    <template #default>
      <div class="layout">
        <Header />

        <main>
          <!-- 内层 Suspense：独立的加载状态 -->
          <Suspense>
            <template #default>
              <ArticleList />
            </template>

            <template #fallback>
              <ArticleListSkeleton />
            </template>
          </Suspense>
        </main>

        <Footer />
      </div>
    </template>

    <template #fallback>
      <LayoutSkeleton />
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const Header = defineAsyncComponent(() => import('./components/Header.vue'));
const ArticleList = defineAsyncComponent(() => import('./components/ArticleList.vue'));
const Footer = defineAsyncComponent(() => import('./components/Footer.vue'));
</script>
```

### 4. 错误处理

```vue
<template>
  <Suspense @pending="onPending" @resolve="onResolve" @fallback="onFallback">
    <template #default>
      <AsyncComponent />
    </template>

    <template #fallback>
      <LoadingState />
    </template>
  </Suspense>

  <!-- 错误边界 -->
  <div v-if="error" class="error-container">
    <p>加载失败：{{ error.message }}</p>
    <button @click="retry">重试</button>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent, onErrorCaptured } from 'vue';

const error = ref(null);
const retryCount = ref(0);

// 捕获错误
onErrorCaptured((err) => {
  error.value = err;
  return false; // 阻止错误继续传播
});

const AsyncComponent = defineAsyncComponent({
  loader: () => import('./components/DataComponent.vue'),
  errorComponent: ErrorComponent,
  timeout: 5000,
});

const retry = () => {
  error.value = null;
  retryCount.value++;
};

const onPending = () => {
  console.log('Suspense pending');
};

const onResolve = () => {
  console.log('Suspense resolved');
};

const onFallback = () => {
  console.log('Suspense fallback');
};
</script>
```

## 应用场景

### 1. 路由懒加载

**场景**：按路由拆分代码，提升首屏加载速度。

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/about',
    component: () => import('@/views/About.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

```vue
<!-- App.vue -->
<template>
  <Suspense>
    <template #default>
      <RouterView />
    </template>

    <template #fallback>
      <PageLoadingSpinner />
    </template>
  </Suspense>
</template>
```

### 2. 大型组件延迟加载

**场景**：富文本编辑器、图表库等大型组件按需加载。

```vue
<template>
  <div>
    <button @click="showEditor = true">打开编辑器</button>

    <Suspense v-if="showEditor">
      <template #default>
        <!-- 只在需要时加载富文本编辑器 -->
        <RichTextEditor v-model="content" />
      </template>

      <template #fallback>
        <div>加载编辑器中...</div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue';

const showEditor = ref(false);
const content = ref('');

// 富文本编辑器通常很大，异步加载可以显著减少初始包体积
const RichTextEditor = defineAsyncComponent(() =>
  import('./components/RichTextEditor.vue')
);
</script>
```

### 3. 数据预加载

**场景**：组件渲染前先获取数据。

```vue
<!-- ProductDetail.vue -->
<script setup>
import { ref } from 'vue';

const props = defineProps(['productId']);

// 在组件加载时异步获取数据
const product = ref(null);

// 使用顶层 await，Suspense 会等待数据加载完成
const response = await fetch(`/api/products/${props.productId}`);
product.value = await response.json();
</script>

<template>
  <div class="product-detail">
    <h1>{{ product.name }}</h1>
    <p>价格：¥{{ product.price }}</p>
    <p>{{ product.description }}</p>
  </div>
</template>
```

### 4. 条件加载

**场景**：基于用户权限或设备类型加载不同组件。

```vue
<template>
  <Suspense>
    <template #default>
      <component :is="currentComponent" />
    </template>

    <template #fallback>
      <LoadingComponent />
    </template>
  </Suspense>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const currentComponent = computed(() => {
  if (userStore.isAdmin) {
    // 管理员界面
    return defineAsyncComponent(() => import('./AdminDashboard.vue'));
  } else {
    // 普通用户界面
    return defineAsyncComponent(() => import('./UserDashboard.vue'));
  }
});
</script>
```

### 5. 分块加载列表

**场景**：长列表或复杂列表的性能优化。

```vue
<template>
  <div class="article-list">
    <Suspense v-for="page in pages" :key="page">
      <template #default>
        <ArticlePage :page="page" />
      </template>

      <template #fallback>
        <ArticlePageSkeleton />
      </template>
    </Suspense>

    <button @click="loadMore">加载更多</button>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue';

const pages = ref([1]);

const ArticlePage = defineAsyncComponent(() =>
  import('./components/ArticlePage.vue')
);

const loadMore = () => {
  pages.value.push(pages.value.length + 1);
};
</script>
```

### 6. 第三方库按需加载

**场景**：图表库、地图等大型第三方库。

```vue
<template>
  <div>
    <button @click="showChart = true">显示图表</button>

    <Suspense v-if="showChart">
      <template #default>
        <ChartComponent :data="chartData" />
      </template>

      <template #fallback>
        <div>加载图表库中...</div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent } from 'vue';

const showChart = ref(false);
const chartData = ref([/* 数据 */]);

// 异步加载包含 ECharts 的组件
const ChartComponent = defineAsyncComponent(() =>
  import('./components/EChartsComponent.vue')
);
</script>
```

## 性能优化

### 1. 代码分割策略

```javascript
// ✅ 推荐：按路由分割
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
  },
];

// ✅ 推荐：按功能分割
const Editor = defineAsyncComponent(() => import('@/components/Editor.vue'));
const Chart = defineAsyncComponent(() => import('@/components/Chart.vue'));

// ❌ 不推荐：过度分割（每个小组件都异步）
const Button = defineAsyncComponent(() => import('@/components/Button.vue'));
```

### 2. 预加载和预获取

```javascript
// Webpack 魔法注释
const Dashboard = defineAsyncComponent(() =>
  import(/* webpackPrefetch: true */ './Dashboard.vue')
);

const AdminPanel = defineAsyncComponent(() =>
  import(/* webpackPreload: true */ './AdminPanel.vue')
);

// Vite 动态导入
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);
```

### 3. 分包打包

**vite.config.js**

```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将大型库单独打包
          'vendor-charts': ['echarts', 'chart.js'],
          'vendor-editor': ['quill', '@tinymce/tinymce-vue'],

          // 按路由分包
          'route-admin': [
            './src/views/admin/Dashboard.vue',
            './src/views/admin/Users.vue',
          ],
        },
      },
    },
  },
};
```

### 4. 骨架屏优化

```vue
<template>
  <Suspense>
    <template #default>
      <UserProfile />
    </template>

    <template #fallback>
      <!-- 使用骨架屏代替简单的"加载中" -->
      <div class="skeleton">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
      </div>
    </template>
  </Suspense>
</template>

<style scoped>
.skeleton {
  padding: 20px;
}

.skeleton-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-line {
  height: 20px;
  margin: 10px 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
```

## Composable 封装

### useAsyncComponent

```javascript
// composables/useAsyncComponent.js
import { ref, defineAsyncComponent, onErrorCaptured } from 'vue';

export function useAsyncComponent(loader, options = {}) {
  const loading = ref(false);
  const error = ref(null);
  const retryCount = ref(0);

  const component = defineAsyncComponent({
    loader,
    loadingComponent: options.loadingComponent,
    errorComponent: options.errorComponent,
    delay: options.delay || 200,
    timeout: options.timeout || 3000,

    onError(err, retry, fail, attempts) {
      error.value = err;

      if (attempts <= 3) {
        retry();
        retryCount.value = attempts;
      } else {
        fail();
      }
    },
  });

  onErrorCaptured((err) => {
    error.value = err;
    return false;
  });

  const retry = () => {
    error.value = null;
    retryCount.value = 0;
  };

  return {
    component,
    loading,
    error,
    retryCount,
    retry,
  };
}
```

**使用：**

```vue
<script setup>
import { useAsyncComponent } from '@/composables/useAsyncComponent';

const {
  component: UserProfile,
  error,
  retry,
} = useAsyncComponent(() => import('./UserProfile.vue'));
</script>

<template>
  <Suspense>
    <template #default>
      <component :is="UserProfile" />
    </template>

    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>

  <div v-if="error">
    <p>加载失败：{{ error.message }}</p>
    <button @click="retry">重试</button>
  </div>
</template>
```

## 与 Vue 2 的对比

### Vue 2 异步组件

```javascript
// Vue 2 方式
export default {
  components: {
    AsyncComponent: () => import('./AsyncComponent.vue'),

    // 带选项的异步组件
    AsyncComponentWithOptions: () => ({
      component: import('./AsyncComponent.vue'),
      loading: LoadingComponent,
      error: ErrorComponent,
      delay: 200,
      timeout: 3000,
    }),
  },
};
```

### Vue 3 异步组件

```vue
<script setup>
import { defineAsyncComponent } from 'vue';

// Vue 3 方式
const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
);

// 带选项
const AsyncComponentWithOptions = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000,
});
</script>
```

### Suspense 对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 异步组件 | ✅ 支持 | ✅ 支持 |
| Suspense | ❌ 不支持 | ✅ 支持 |
| 顶层 await | ❌ 不支持 | ✅ 支持 |
| 加载状态管理 | 手动处理 | Suspense 自动处理 |
| 错误处理 | errorComponent | onErrorCaptured |

## 注意事项

### 1. Suspense 是实验性功能 ⚠️

```vue
<!-- Suspense 在 Vue 3 中仍处于实验阶段 -->
<Suspense>
  <!-- API 可能在未来版本中发生变化 -->
</Suspense>
```

**建议：**
- 在生产环境使用时要谨慎
- 关注 Vue 官方更新
- 做好降级方案

### 2. SSR 注意事项

```vue
<!-- 服务端渲染时，Suspense 需要特殊处理 -->
<script setup>
import { useSSRContext } from 'vue';

const ssrContext = useSSRContext();

// 在 SSR 中，需要等待所有异步组件加载完成
if (ssrContext) {
  const data = await fetchData();
}
</script>
```

### 3. 错误边界

Suspense 本身不处理错误，需要配合错误边界：

```vue
<script setup>
import { onErrorCaptured, ref } from 'vue';

const error = ref(null);

onErrorCaptured((err) => {
  error.value = err;
  return false; // 阻止错误继续传播
});
</script>

<template>
  <div v-if="error">
    <h2>出错了</h2>
    <p>{{ error.message }}</p>
  </div>

  <Suspense v-else>
    <!-- 组件 -->
  </Suspense>
</template>
```

### 4. 嵌套 Suspense 的性能

```vue
<!-- ❌ 不推荐：过度嵌套 -->
<Suspense>
  <Suspense>
    <Suspense>
      <DeepComponent />
    </Suspense>
  </Suspense>
</Suspense>

<!-- ✅ 推荐：合理的嵌套层级 -->
<Suspense>
  <PageLayout>
    <Suspense>
      <MainContent />
    </Suspense>
  </PageLayout>
</Suspense>
```

### 5. 避免滥用异步组件

```vue
<!-- ❌ 不要对小组件使用异步加载 -->
const Button = defineAsyncComponent(() => import('./Button.vue'));
const Icon = defineAsyncComponent(() => import('./Icon.vue'));

<!-- ✅ 只对大型组件使用异步加载 -->
const Dashboard = defineAsyncComponent(() => import('./Dashboard.vue'));
const Editor = defineAsyncComponent(() => import('./Editor.vue'));
```

## 最佳实践

### 1. 合理的加载状态

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>

    <template #fallback>
      <!-- ✅ 好：提供有意义的加载状态 -->
      <div class="loading-container">
        <Spinner />
        <p>正在加载内容...</p>
        <p class="hint">这可能需要几秒钟</p>
      </div>
    </template>
  </Suspense>
</template>
```

### 2. 超时处理

```javascript
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  timeout: 10000, // 10秒超时

  errorComponent: {
    template: `
      <div class="error">
        <p>组件加载超时</p>
        <button @click="$emit('retry')">重试</button>
      </div>
    `,
  },
});
```

### 3. 预加载关键路由

```javascript
// router/index.js
const router = createRouter({
  routes: [
    {
      path: '/dashboard',
      component: () => import('@/views/Dashboard.vue'),
      // 预加载依赖的组件
      beforeEnter: (to, from, next) => {
        import('@/components/ChartComponent.vue');
        import('@/components/TableComponent.vue');
        next();
      },
    },
  ],
});
```

### 4. 组合加载状态

```vue
<template>
  <Suspense @pending="onPending" @resolve="onResolve">
    <template #default>
      <AsyncComponent />
    </template>

    <template #fallback>
      <ProgressBar :progress="progress" />
    </template>
  </Suspense>
</template>

<script setup>
import { ref } from 'vue';

const progress = ref(0);

const onPending = () => {
  // 模拟加载进度
  const interval = setInterval(() => {
    progress.value += 10;
    if (progress.value >= 90) {
      clearInterval(interval);
    }
  }, 100);
};

const onResolve = () => {
  progress.value = 100;
};
</script>
```

### 5. 智能重试机制

```javascript
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./Component.vue'),

  onError(error, retry, fail, attempts) {
    // 指数退避重试
    const delay = Math.min(1000 * 2 ** attempts, 10000);

    if (attempts <= 3) {
      setTimeout(retry, delay);
    } else {
      fail();
    }
  },
});
```

## 打包分析

### 查看打包结果

```bash
# Vite
npm run build
npm run preview

# 查看分析报告
npm install -D rollup-plugin-visualizer
```

**vite.config.js**

```javascript
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
};
```

### 优化建议

根据打包分析结果：
1. **大型依赖**：异步加载
2. **共用依赖**：提取到 vendor chunk
3. **路由组件**：按路由分包
4. **按需导入**：使用 tree-shaking

## 常见问题

### Q1: Suspense 和 v-if 有什么区别？

**答案**：
- `v-if` 是条件渲染，组件存在或不存在
- `Suspense` 是异步渲染，提供加载中和完成两种状态
- `Suspense` 可以等待多个异步组件

### Q2: 为什么 Suspense 的 fallback 没有显示？

**答案**：
- 确保异步组件使用了 `defineAsyncComponent`
- 或在组件中使用了顶层 `await`
- 检查 `delay` 配置（默认 200ms）

### Q3: 如何在 setup 中使用异步数据？

**答案**：

```vue
<script setup>
// ✅ 使用顶层 await
const data = await fetchData();

// ❌ 不能在普通函数中 await
const loadData = async () => {
  const data = await fetchData(); // 这不会触发 Suspense
};
</script>
```

### Q4: 异步组件和路由懒加载有什么区别？

**答案**：
- **路由懒加载**：按路由拆分代码
- **异步组件**：按组件拆分代码
- 两者可以结合使用

### Q5: Suspense 可以嵌套吗？

**答案**：可以。内层 Suspense 可以独立控制加载状态。

```vue
<Suspense>
  <OuterComponent>
    <Suspense>
      <InnerComponent />
    </Suspense>
  </OuterComponent>
</Suspense>
```

## 实战案例

### 完整的仪表板应用

```vue
<!-- Dashboard.vue -->
<template>
  <div class="dashboard">
    <Suspense>
      <template #default>
        <div class="dashboard-grid">
          <!-- 统计卡片 -->
          <StatsCards />

          <!-- 图表区域 -->
          <Suspense>
            <template #default>
              <ChartsSection />
            </template>
            <template #fallback>
              <ChartsSkeleton />
            </template>
          </Suspense>

          <!-- 数据表格 -->
          <Suspense>
            <template #default>
              <DataTable />
            </template>
            <template #fallback>
              <TableSkeleton />
            </template>
          </Suspense>
        </div>
      </template>

      <template #fallback>
        <DashboardSkeleton />
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

// 异步加载各个模块
const StatsCards = defineAsyncComponent(() =>
  import('./components/StatsCards.vue')
);

const ChartsSection = defineAsyncComponent(() =>
  import('./components/ChartsSection.vue')
);

const DataTable = defineAsyncComponent(() =>
  import('./components/DataTable.vue')
);
</script>
```

## 参考资源

### 官方文档
- [Vue 3 官方文档 - 异步组件](https://cn.vuejs.org/guide/components/async.html)
- [Vue 3 API 参考 - defineAsyncComponent](https://cn.vuejs.org/api/general.html#defineasynccomponent)
- [Vue 3 内置组件 - Suspense](https://cn.vuejs.org/guide/built-ins/suspense.html)
- [Vue 3 RFC - Suspense](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0026-async-component-api.html)

### 性能优化
- [Vite 代码分割](https://vitejs.dev/guide/features.html#async-chunk-loading-optimization)
- [Webpack 代码分割](https://webpack.js.org/guides/code-splitting/)
- [Chrome DevTools - 性能分析](https://developer.chrome.com/docs/devtools/performance/)
- [Lighthouse - 性能审计](https://developers.google.com/web/tools/lighthouse)

### 相关库
- [vue-router](https://router.vuejs.org/) - Vue 官方路由，支持路由懒加载
- [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components) - 组件自动导入
- [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages) - 基于文件的路由

### 示例项目
- [Vue 3 Examples - Suspense](https://github.com/vuejs/vue-next/tree/master/packages/vue/examples/suspense)
- [Vite Vue Template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-vue)
- [Vue Admin Template](https://github.com/PanJiaChen/vue-element-admin)

### 文章教程
- [Vue 3 异步组件深入理解](https://juejin.cn/post/6844904199272505357)
- [Suspense 实战指南](https://blog.vuejs.org/posts/vue-3-suspense.html)
- [性能优化：代码分割最佳实践](https://web.dev/code-splitting-suspense/)
- [构建高性能 Vue 应用](https://vueschool.io/articles/vuejs-tutorials/lazy-loading-and-code-splitting-in-vue-js/)

### 视频教程
- [Vue Mastery - Async Components](https://www.vuemastery.com/courses/vue-3-essentials/async-components)
- [Vue School - Code Splitting](https://vueschool.io/lessons/code-splitting-with-webpack)
- [Vue 3 性能优化实战](https://www.bilibili.com/video/BV1234567890)

### 工具
- [Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) - 打包分析
- [Speed Measure Plugin](https://github.com/stephencook/speed-measure-webpack-plugin) - 构建速度分析
- [Vue DevTools](https://devtools.vuejs.org/) - 开发者工具

## 总结

异步组件和 Suspense 是 Vue 3 提供的强大性能优化工具：

**核心优势：**
- ✅ **代码分割**：将应用拆分成多个小块，按需加载
- ✅ **性能提升**：减少初始包体积，加快首屏加载
- ✅ **用户体验**：优雅的加载状态，避免白屏
- ✅ **开发体验**：声明式 API，易于使用

**最佳实践：**
- 只对大型组件使用异步加载
- 合理设置 delay 和 timeout
- 提供有意义的加载状态
- 使用骨架屏代替简单的"加载中"
- 配合错误处理机制
- 分析打包结果，持续优化

**注意事项：**
- Suspense 仍是实验性功能
- 避免过度分割代码
- 注意 SSR 兼容性
- 做好错误处理和降级方案

通过合理使用异步组件和 Suspense，可以显著提升 Vue 应用的性能和用户体验！
