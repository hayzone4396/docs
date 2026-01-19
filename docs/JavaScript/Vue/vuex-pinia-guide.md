---
title: Vuex 与 Pinia 状态管理完全指南
date: 2026-01-19 11:00:00
tags:
  - Vue
  - Vuex
  - Pinia
  - 状态管理
  - 数据持久化
categories:
  - Vue
---

# Vuex 与 Pinia 状态管理完全指南

状态管理是 Vue 应用开发中的重要部分。本文将详细介绍 Vuex 和 Pinia 两种状态管理方案的使用方法、区别、数据持久化以及最佳实践。

## 状态管理的必要性

### 为什么需要状态管理？

在大型应用中，组件之间的数据共享变得复杂：

```
组件 A → 组件 B → 组件 C
  ↓        ↓        ↓
数据传递  数据传递  数据传递
  ↑        ↑        ↑
事件回传  事件回传  事件回传
```

**问题：**
- ❌ Props 层层传递
- ❌ 事件冒泡复杂
- ❌ 兄弟组件通信困难
- ❌ 状态难以追踪

**状态管理解决方案：**

```
┌─────────────────────┐
│   Vuex / Pinia      │ ← 集中式状态管理
│   (单一数据源)      │
└─────────────────────┘
    ↓     ↓     ↓
  组件A  组件B  组件C
```

## Vuex 完全指南

Vuex 是 Vue 官方的状态管理库，采用集中式存储管理应用的所有组件状态。

### 版本信息

- **Vuex 3.x**：适配 Vue 2
- **Vuex 4.x**：适配 Vue 3

### 核心概念

```
Actions (异步操作)
    ↓ dispatch
Store
    ↓ commit
Mutations (同步修改)
    ↓
State (状态)
    ↓
Getters (计算属性)
    ↓
Components (组件)
```

### 安装配置

```bash
# Vue 3 + Vuex 4
npm install vuex@next

# Vue 2 + Vuex 3
npm install vuex
```

### 基本使用

#### 1. 创建 Store

```javascript
// store/index.js
import { createStore } from 'vuex';

export default createStore({
  // 状态
  state: {
    count: 0,
    userInfo: {
      id: null,
      name: '',
      avatar: '',
    },
    todos: [],
  },

  // 计算属性
  getters: {
    // 获取计数的两倍
    doubleCount(state) {
      return state.count * 2;
    },

    // 获取已完成的待办事项
    doneTodos(state) {
      return state.todos.filter(todo => todo.done);
    },

    // 获取待办事项数量（可以返回函数）
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id === id);
    },
  },

  // 同步修改状态（必须是同步函数）
  mutations: {
    // 修改计数
    INCREMENT(state) {
      state.count++;
    },

    // 修改计数（带参数）
    INCREMENT_BY(state, payload) {
      state.count += payload;
    },

    // 修改用户信息
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
    },

    // 添加待办事项
    ADD_TODO(state, todo) {
      state.todos.push(todo);
    },
  },

  // 异步操作
  actions: {
    // 异步增加计数
    async incrementAsync({ commit }, payload) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      commit('INCREMENT_BY', payload);
    },

    // 获取用户信息
    async fetchUserInfo({ commit }, userId) {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const userInfo = await response.json();
        commit('SET_USER_INFO', userInfo);
        return userInfo;
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        throw error;
      }
    },

    // 添加待办事项
    addTodo({ commit }, todo) {
      commit('ADD_TODO', {
        id: Date.now(),
        text: todo,
        done: false,
      });
    },
  },
});
```

#### 2. 注册 Store

```javascript
// main.js
import { createApp } from 'vue';
import App from './App.vue';
import store from './store';

createApp(App)
  .use(store)
  .mount('#app');
```

#### 3. 组件中使用

##### Options API

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double Count: {{ doubleCount }}</p>
    <p>User: {{ userInfo.name }}</p>

    <button @click="increment">+1</button>
    <button @click="incrementBy(5)">+5</button>
    <button @click="asyncIncrement">Async +10</button>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

export default {
  computed: {
    // 方式一：直接访问
    count() {
      return this.$store.state.count;
    },

    // 方式二：使用 mapState
    ...mapState(['count', 'userInfo']),

    // 方式三：使用 mapState（对象形式）
    ...mapState({
      counter: 'count',
      user: 'userInfo',
    }),

    // 映射 getters
    ...mapGetters(['doubleCount', 'doneTodos']),
  },

  methods: {
    // 方式一：直接调用
    increment() {
      this.$store.commit('INCREMENT');
    },

    // 方式二：使用 mapMutations
    ...mapMutations(['INCREMENT', 'INCREMENT_BY']),

    // 方式三：使用 mapActions
    ...mapActions(['incrementAsync', 'fetchUserInfo']),

    // 自定义方法
    incrementBy(amount) {
      this.$store.commit('INCREMENT_BY', amount);
    },

    async asyncIncrement() {
      await this.$store.dispatch('incrementAsync', 10);
    },
  },

  mounted() {
    this.fetchUserInfo(123);
  },
};
</script>
```

##### Composition API（推荐）

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double Count: {{ doubleCount }}</p>
    <p>User: {{ userInfo.name }}</p>

    <button @click="increment">+1</button>
    <button @click="incrementBy(5)">+5</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

// State - 必须通过 computed 包装才能响应式
const count = computed(() => store.state.count);
const userInfo = computed(() => store.state.userInfo);

// Getters
const doubleCount = computed(() => store.getters.doubleCount);

// Mutations
const increment = () => {
  store.commit('INCREMENT');
};

const incrementBy = (amount) => {
  store.commit('INCREMENT_BY', amount);
};

// Actions
const fetchUser = async (userId) => {
  await store.dispatch('fetchUserInfo', userId);
};
</script>
```

### 模块化

#### 定义模块

```javascript
// store/modules/user.js
export default {
  // 命名空间（推荐开启）
  namespaced: true,

  state: {
    userInfo: null,
    token: '',
  },

  getters: {
    isLoggedIn(state) {
      return !!state.token;
    },
  },

  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
    },

    SET_TOKEN(state, token) {
      state.token = token;
    },
  },

  actions: {
    async login({ commit }, credentials) {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      const { token, userInfo } = await response.json();

      commit('SET_TOKEN', token);
      commit('SET_USER_INFO', userInfo);

      return userInfo;
    },

    logout({ commit }) {
      commit('SET_TOKEN', '');
      commit('SET_USER_INFO', null);
    },
  },
};
```

```javascript
// store/modules/cart.js
export default {
  namespaced: true,

  state: {
    items: [],
  },

  getters: {
    totalPrice(state) {
      return state.items.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    },

    itemCount(state) {
      return state.items.reduce((count, item) => count + item.quantity, 0);
    },
  },

  mutations: {
    ADD_ITEM(state, product) {
      const item = state.items.find(i => i.id === product.id);
      if (item) {
        item.quantity++;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
    },

    REMOVE_ITEM(state, productId) {
      const index = state.items.findIndex(i => i.id === productId);
      if (index > -1) {
        state.items.splice(index, 1);
      }
    },
  },

  actions: {
    addToCart({ commit }, product) {
      commit('ADD_ITEM', product);
    },
  },
};
```

#### 注册模块

```javascript
// store/index.js
import { createStore } from 'vuex';
import user from './modules/user';
import cart from './modules/cart';

export default createStore({
  modules: {
    user,
    cart,
  },
});
```

#### 使用模块

```vue
<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

// 访问模块的 state
const userInfo = computed(() => store.state.user.userInfo);
const cartItems = computed(() => store.state.cart.items);

// 访问模块的 getters
const isLoggedIn = computed(() => store.getters['user/isLoggedIn']);
const totalPrice = computed(() => store.getters['cart/totalPrice']);

// 调用模块的 mutations
const setToken = (token) => {
  store.commit('user/SET_TOKEN', token);
};

// 调用模块的 actions
const login = async (credentials) => {
  await store.dispatch('user/login', credentials);
};
</script>
```

### Vuex 数据持久化

#### 方式一：手动本地存储

```javascript
// store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state: {
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
  },

  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
      // 同步到 localStorage
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
  },
});

export default store;
```

#### 方式二：使用 vuex-persistedstate 插件（推荐）

```bash
npm install vuex-persistedstate
```

```javascript
// store/index.js
import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import user from './modules/user';
import cart from './modules/cart';

export default createStore({
  modules: {
    user,
    cart,
  },

  plugins: [
    createPersistedState({
      // 存储的 key 值
      key: 'my-app',

      // 使用 localStorage（默认）
      storage: window.localStorage,

      // 需要持久化的模块
      paths: ['user', 'cart'],

      // 自定义存储方式
      // storage: {
      //   getItem: key => sessionStorage.getItem(key),
      //   setItem: (key, value) => sessionStorage.setItem(key, value),
      //   removeItem: key => sessionStorage.removeItem(key),
      // },
    }),
  ],
});
```

**高级配置：**

```javascript
createPersistedState({
  key: 'vuex',

  // 只持久化部分状态
  paths: ['user.userInfo', 'user.token', 'cart.items'],

  // 使用 sessionStorage
  storage: window.sessionStorage,

  // 自定义序列化
  reducer(state) {
    return {
      user: {
        userInfo: state.user.userInfo,
        token: state.user.token,
      },
    };
  },

  // 自定义状态恢复
  setState(key, state, storage) {
    return storage.setItem(key, JSON.stringify(state));
  },

  getState(key, storage) {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : undefined;
  },
})
```

## Pinia 完全指南

Pinia 是 Vue 官方推荐的新一代状态管理库，设计更简洁，性能更好。

### 版本信息

- **Pinia 2.x**：同时支持 Vue 2 和 Vue 3

### Vuex vs Pinia 核心区别

| 特性 | Vuex | Pinia |
|------|------|-------|
| **Mutations** | ✅ 必需 | ❌ 无（直接修改 state） |
| **模块化** | modules | 独立 store |
| **TypeScript** | 需要复杂配置 | 原生支持 |
| **DevTools** | ✅ 支持 | ✅ 更好支持 |
| **体积** | 较大 | 更小（~1KB） |
| **API** | 复杂 | 简洁 |
| **组合式** | 需要辅助函数 | 原生支持 |
| **性能** | 一般 | 更好 |

### 安装配置

```bash
npm install pinia
```

```javascript
// main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');
```

### 基本使用

#### 定义 Store

```javascript
// stores/user.js
import { defineStore } from 'pinia';

// 第一个参数是唯一 ID（模块名称）
export const useUserStore = defineStore('user', {
  // 状态
  state: () => ({
    userId: null,
    name: '张三',
    age: 18,
    avatar: '',
    token: '',
  }),

  // 计算属性
  getters: {
    // 自动推导返回类型
    isLoggedIn(state) {
      return !!state.token;
    },

    // 访问其他 getters
    userDisplayName(state) {
      return `${state.name} (${state.age}岁)`;
    },

    // 返回函数
    getUserById: (state) => {
      return (id) => state.userId === id;
    },

    // 访问其他 store 的数据
    cartItemCount() {
      const cartStore = useCartStore();
      return cartStore.items.length;
    },
  },

  // 方法（同步 + 异步）
  actions: {
    // 直接修改 state
    updateName(newName) {
      this.name = newName;
    },

    // 增加年龄
    increaseAge(val) {
      this.age += val;
    },

    // 异步登录
    async login(credentials) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        // 直接修改多个状态
        this.userId = data.userId;
        this.name = data.name;
        this.token = data.token;

        return data;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    // 登出
    logout() {
      this.$reset(); // 重置到初始状态
    },
  },
});
```

#### 组合式 API 风格（Setup Store）

```javascript
// stores/counter.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0);
  const name = ref('Counter');

  // getters
  const doubleCount = computed(() => count.value * 2);

  // actions
  function increment() {
    count.value++;
  }

  function incrementBy(amount) {
    count.value += amount;
  }

  async function asyncIncrement() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    count.value++;
  }

  // 必须返回
  return {
    count,
    name,
    doubleCount,
    increment,
    incrementBy,
    asyncIncrement,
  };
});
```

### 在组件中使用

```vue
<template>
  <div>
    <h1>{{ userStore.name }}</h1>
    <p>年龄: {{ age }}</p>
    <p>显示名称: {{ userStore.userDisplayName }}</p>
    <p>是否登录: {{ userStore.isLoggedIn }}</p>

    <button @click="handleIncreaseAge">增加年龄</button>
    <button @click="handleUpdateName">修改名字</button>
    <button @click="handleBatchUpdate">批量更新</button>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';

// 获取 store 实例
const userStore = useUserStore();

// ⚠️ 错误：直接解构会失去响应式
// const { name, age } = userStore;

// ✅ 正确：使用 storeToRefs 解构（保持响应式）
const { name, age, isLoggedIn } = storeToRefs(userStore);

// 方式一：直接修改单个属性
const handleUpdateName = () => {
  userStore.name = '李四';
};

// 方式二：调用 action
const handleIncreaseAge = () => {
  userStore.increaseAge(1);
};

// 方式三：$patch 对象形式（批量修改）
const handleBatchUpdate = () => {
  userStore.$patch({
    name: '王五',
    age: 20,
  });
};

// 方式四：$patch 函数形式（更灵活）
const handleBatchUpdateFn = () => {
  userStore.$patch((state) => {
    state.name = '赵六';
    state.age++;
    // 可以进行复杂操作
    if (state.age > 60) {
      state.age = 60;
    }
  });
};

// 方式五：$state 整体替换
const handleReplaceState = () => {
  userStore.$state = {
    userId: 1,
    name: '孙七',
    age: 25,
    avatar: '',
    token: '',
  };
};

// 重置状态
const handleReset = () => {
  userStore.$reset();
};
</script>
```

### Pinia 数据持久化

#### 方式一：手动持久化

```javascript
// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,
  }),

  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
  },
});
```

#### 方式二：使用 pinia-plugin-persistedstate（推荐）

```bash
npm install pinia-plugin-persistedstate
```

**配置插件：**

```javascript
// main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App).use(pinia).mount('#app');
```

**在 Store 中使用：**

```javascript
// stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '张三',
    age: 18,
    token: '',
  }),

  getters: {
    isLoggedIn(state) {
      return !!state.token;
    },
  },

  actions: {
    login(token) {
      this.token = token;
    },
  },

  // 开启持久化
  persist: true, // 默认存储到 localStorage，key 为 store id
});
```

**高级配置：**

```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '张三',
    age: 18,
    avatar: '',
    token: '',
    settings: {},
  }),

  persist: {
    // 自定义存储的 key
    key: 'my-user-store',

    // 使用 sessionStorage
    storage: sessionStorage,

    // 只持久化部分状态
    paths: ['name', 'age', 'token'],

    // 或排除某些状态
    // omit: ['settings'],

    // 自定义序列化
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },

    // 在状态恢复前后的钩子
    beforeRestore: (ctx) => {
      console.log('即将恢复状态');
    },
    afterRestore: (ctx) => {
      console.log('状态已恢复');
    },
  },
});
```

**多种存储策略：**

```javascript
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: {},
    preferences: {},
  }),

  persist: {
    // 多个存储策略
    strategies: [
      {
        key: 'user-auth',
        storage: localStorage,
        paths: ['token'],
      },
      {
        key: 'user-info',
        storage: sessionStorage,
        paths: ['userInfo'],
      },
      {
        key: 'user-prefs',
        storage: localStorage,
        paths: ['preferences'],
      },
    ],
  },
});
```

### 在多个 Store 之间共享数据

```javascript
// stores/cart.js
import { defineStore } from 'pinia';
import { useUserStore } from './user';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),

  getters: {
    // 访问其他 store
    userCartInfo(state) {
      const userStore = useUserStore();
      return {
        userId: userStore.userId,
        itemCount: state.items.length,
      };
    },
  },

  actions: {
    async addItem(product) {
      // 检查用户登录状态
      const userStore = useUserStore();

      if (!userStore.isLoggedIn) {
        throw new Error('请先登录');
      }

      this.items.push(product);
    },
  },
});
```

## 配置开发工具

### Vite 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),

    // 自动导入 API
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia', // 自动导入 Pinia API
      ],
      dts: 'src/auto-imports.d.ts', // 生成 TypeScript 声明
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // 开发服务器配置
  server: {
    port: 3000,

    // 代理配置
    proxy: {
      '/api': {
        target: 'http://testapi.xuexiluxian.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### TypeScript 支持

#### Pinia TypeScript

```typescript
// stores/user.ts
import { defineStore } from 'pinia';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface UserState {
  userInfo: UserInfo | null;
  token: string;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    userInfo: null,
    token: '',
  }),

  getters: {
    isLoggedIn(state): boolean {
      return !!state.token;
    },

    displayName(state): string {
      return state.userInfo?.name || 'Guest';
    },
  },

  actions: {
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },

    async fetchUserInfo(userId: number): Promise<UserInfo> {
      const response = await fetch(`/api/users/${userId}`);
      const userInfo = await response.json();
      this.userInfo = userInfo;
      return userInfo;
    },
  },
});
```

#### 在组件中使用

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const { userInfo, isLoggedIn } = storeToRefs(userStore);

// TypeScript 会自动推导类型
const handleLogin = async () => {
  const user = await userStore.fetchUserInfo(123);
  console.log(user.name); // 类型安全
};
</script>
```

## 完整项目示例

### 目录结构

```
src/
├── stores/
│   ├── index.ts           # Pinia 实例
│   ├── user.ts            # 用户模块
│   ├── cart.ts            # 购物车模块
│   └── products.ts        # 产品模块
├── views/
│   ├── Home.vue
│   └── Cart.vue
├── components/
│   ├── Header.vue
│   └── ProductList.vue
├── main.ts
└── App.vue
```

### Store 定义

```typescript
// stores/index.ts
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;
```

```typescript
// stores/products.ts
import { defineStore } from 'pinia';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    productById: (state) => (id: number) => {
      return state.products.find(p => p.id === id);
    },

    sortedProducts: (state) => {
      return [...state.products].sort((a, b) => a.price - b.price);
    },
  },

  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('/api/products');
        this.products = await response.json();
      } catch (error) {
        this.error = '获取产品列表失败';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
  },
});
```

```typescript
// stores/cart.ts
import { defineStore } from 'pinia';
import { useUserStore } from './user';

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    totalPrice(state): number {
      return state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },

    totalItems(state): number {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },
  },

  actions: {
    addToCart(product: { id: number; name: string; price: number }) {
      const userStore = useUserStore();

      if (!userStore.isLoggedIn) {
        throw new Error('请先登录');
      }

      const existingItem = this.items.find(
        item => item.productId === product.id
      );

      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        });
      }
    },

    removeFromCart(productId: number) {
      const index = this.items.findIndex(item => item.productId === productId);
      if (index > -1) {
        this.items.splice(index, 1);
      }
    },

    clearCart() {
      this.items = [];
    },
  },

  persist: {
    key: 'shopping-cart',
    storage: localStorage,
  },
});
```

### 组件使用

```vue
<!-- components/Header.vue -->
<template>
  <header class="header">
    <h1>我的商店</h1>

    <div class="user-section">
      <template v-if="isLoggedIn">
        <span>{{ displayName }}</span>
        <button @click="handleLogout">退出</button>
      </template>
      <template v-else>
        <button @click="showLoginModal = true">登录</button>
      </template>
    </div>

    <div class="cart-icon">
      <span>🛒</span>
      <span class="cart-count">{{ totalItems }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { useCartStore } from '@/stores/cart';

const userStore = useUserStore();
const cartStore = useCartStore();

const { isLoggedIn, displayName } = storeToRefs(userStore);
const { totalItems } = storeToRefs(cartStore);

const showLoginModal = ref(false);

const handleLogout = () => {
  userStore.logout();
  cartStore.clearCart();
};
</script>
```

```vue
<!-- components/ProductList.vue -->
<template>
  <div class="product-list">
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else class="products">
      <div
        v-for="product in sortedProducts"
        :key="product.id"
        class="product-card"
      >
        <img :src="product.image" :alt="product.name" />
        <h3>{{ product.name }}</h3>
        <p class="price">¥{{ product.price }}</p>
        <button @click="addToCart(product)">加入购物车</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useProductsStore } from '@/stores/products';
import { useCartStore } from '@/stores/cart';

const productsStore = useProductsStore();
const cartStore = useCartStore();

const { products, loading, error, sortedProducts } = storeToRefs(productsStore);

const addToCart = (product: any) => {
  try {
    cartStore.addToCart(product);
    alert('已添加到购物车');
  } catch (error: any) {
    alert(error.message);
  }
};

onMounted(() => {
  productsStore.fetchProducts();
});
</script>
```

## 从 Vuex 迁移到 Pinia

### 迁移步骤

#### 1. 安装 Pinia

```bash
npm install pinia
npm uninstall vuex
```

#### 2. 转换 Store

**Vuex:**

```javascript
// store/modules/user.js (Vuex)
export default {
  namespaced: true,

  state: {
    name: '',
    age: 0,
  },

  getters: {
    displayName(state) {
      return `${state.name} (${state.age})`;
    },
  },

  mutations: {
    SET_NAME(state, name) {
      state.name = name;
    },
  },

  actions: {
    updateName({ commit }, name) {
      commit('SET_NAME', name);
    },
  },
};
```

**Pinia:**

```javascript
// stores/user.js (Pinia)
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    age: 0,
  }),

  getters: {
    displayName(state) {
      return `${state.name} (${state.age})`;
    },
  },

  actions: {
    // 直接修改 state，不需要 mutations
    updateName(name) {
      this.name = name;
    },
  },
});
```

#### 3. 更新组件

**Vuex:**

```vue
<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const name = computed(() => store.state.user.name);

const updateName = (newName) => {
  store.dispatch('user/updateName', newName);
};
</script>
```

**Pinia:**

```vue
<script setup>
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const { name } = storeToRefs(userStore);

const updateName = (newName) => {
  userStore.updateName(newName);
  // 或直接修改
  // userStore.name = newName;
};
</script>
```

### 迁移对照表

| Vuex | Pinia | 说明 |
|------|-------|------|
| `state` | `state` | 相同 |
| `getters` | `getters` | 相同 |
| `mutations` | `actions` | 合并到 actions |
| `actions` | `actions` | 相同 |
| `modules` | 独立 store | 不需要 modules |
| `commit` | 直接修改或调用 action | 简化 |
| `dispatch` | 调用 action | 相同 |
| `mapState` | `storeToRefs` | 更简洁 |
| `mapGetters` | `storeToRefs` | 更简洁 |
| `mapMutations` | 直接调用方法 | 更直观 |
| `mapActions` | 直接调用方法 | 更直观 |

## 最佳实践

### 1. Store 命名规范

```javascript
// ✅ 推荐：use 开头 + Store 结尾
export const useUserStore = defineStore('user', {});
export const useCartStore = defineStore('cart', {});
export const useProductsStore = defineStore('products', {});

// ❌ 不推荐
export const UserStore = defineStore('user', {});
export const user = defineStore('user', {});
```

### 2. 合理拆分 Store

```javascript
// ✅ 推荐：按功能模块拆分
stores/
├── user.ts
├── cart.ts
├── products.ts
└── orders.ts

// ❌ 不推荐：一个巨大的 store
stores/
└── index.ts  // 包含所有状态
```

### 3. 使用 actions 处理业务逻辑

```javascript
// ✅ 推荐
export const useUserStore = defineStore('user', {
  actions: {
    async login(credentials) {
      // 业务逻辑集中在 action
      const response = await api.login(credentials);
      this.token = response.token;
      this.userInfo = response.userInfo;
      return response;
    },
  },
});

// ❌ 不推荐：在组件中处理业务逻辑
const handleLogin = async () => {
  const response = await api.login(credentials);
  userStore.token = response.token;
  userStore.userInfo = response.userInfo;
};
```

### 4. 使用 storeToRefs 解构

```javascript
// ✅ 推荐：使用 storeToRefs 保持响应式
const { name, age } = storeToRefs(userStore);

// ❌ 错误：直接解构会失去响应式
const { name, age } = userStore;
```

### 5. 持久化敏感数据注意安全

```javascript
// ⚠️ 不要持久化敏感信息到 localStorage
export const useUserStore = defineStore('user', {
  state: () => ({
    password: '', // ❌ 不要持久化密码
    creditCard: '', // ❌ 不要持久化信用卡
    token: '', // ⚠️ 谨慎持久化 token
  }),

  persist: {
    paths: ['token'], // 只持久化 token
    // 或使用加密存储
  },
});
```

## 常见问题

### Q1: Pinia 中如何重置单个状态？

**答案**：直接赋值或使用 $patch

```javascript
// 重置单个状态
userStore.name = '';

// 重置多个状态
userStore.$patch({
  name: '',
  age: 0,
});

// 重置所有状态
userStore.$reset();
```

### Q2: 如何在 Pinia action 中调用另一个 action？

**答案**：直接调用 this.otherAction()

```javascript
actions: {
  async actionA() {
    // 调用同一 store 的其他 action
    await this.actionB();
  },

  async actionB() {
    // ...
  },
}
```

### Q3: 如何监听 Store 的变化？

**答案**：使用 $subscribe

```javascript
// 在组件中
userStore.$subscribe((mutation, state) => {
  console.log('Store 发生变化', mutation, state);
});

// 持久化监听（组件卸载后仍监听）
userStore.$subscribe(
  (mutation, state) => {
    console.log('Store 发生变化');
  },
  { detached: true }
);
```

### Q4: Pinia 支持插件吗？

**答案**：支持

```javascript
// 自定义插件
function myPiniaPlugin({ store }) {
  // 为每个 store 添加方法
  store.hello = () => {
    console.log(`Hello from ${store.$id}`);
  };
}

// 使用插件
const pinia = createPinia();
pinia.use(myPiniaPlugin);
```

## 参考资源

### 官方文档
- [Vuex 官方文档](https://vuex.vuejs.org/zh/)
- [Pinia 官方文档](https://pinia.vuejs.org/zh/)
- [Vue 3 官方文档](https://cn.vuejs.org/)

### 插件和工具
- [vuex-persistedstate](https://github.com/robinvdvleuten/vuex-persistedstate) - Vuex 持久化
- [pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate) - Pinia 持久化
- [unplugin-auto-import](https://github.com/antfu/unplugin-auto-import) - 自动导入

### 文章教程
- [Pinia vs Vuex 对比](https://pinia.vuejs.org/zh/introduction.html#comparison-with-vuex)
- [从 Vuex 迁移到 Pinia](https://pinia.vuejs.org/zh/cookbook/migration-vuex.html)
- [Pinia 最佳实践](https://pinia.vuejs.org/zh/cookbook/)

### 视频教程
- [Vue Mastery - Pinia](https://www.vuemastery.com/courses/pinia)
- [Vue School - State Management](https://vueschool.io/courses/state-management-with-pinia)

## 总结

### Vuex vs Pinia 选择建议

**使用 Vuex 的场景：**
- ✅ 已有大型 Vue 2 项目
- ✅ 团队熟悉 Vuex
- ✅ 不打算迁移

**使用 Pinia 的场景（推荐）：**
- ✅ 新项目
- ✅ Vue 3 项目
- ✅ 需要更好的 TypeScript 支持
- ✅ 追求更好的性能和开发体验

### 核心差异总结

| 特性 | Vuex | Pinia |
|------|------|-------|
| **学习曲线** | 陡峭 | 平缓 |
| **代码量** | 多 | 少 |
| **类型推导** | 需配置 | 自动 |
| **DevTools** | 支持 | 更好 |
| **官方推荐** | Vue 2 | Vue 3 |

**Pinia 的优势：**
- 更简洁的 API
- 更好的 TypeScript 支持
- 更小的体积
- 更好的性能
- 官方推荐

通过合理使用状态管理工具，可以显著提升 Vue 应用的可维护性和开发效率！
