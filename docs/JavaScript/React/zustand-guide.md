---
title: Zustand 状态管理完全指南
date: 2026-01-20 16:02:08
tags:
  - React
  - Zustand
  - 状态管理
  - Jotai
  - MobX
categories:
  - React
---

# Zustand 状态管理完全指南

Zustand 是一个小巧、快速且可扩展的状态管理解决方案，基于简化的 Flux 原则。它拥有基于 Hooks 的舒适 API，既不繁琐也不固执己见，是 Redux 的轻量级替代方案。

## 一、为什么选择 Zustand？

### 核心优势

- 🎯 **极简 API**：没有样板代码，学习成本低
- 🚀 **性能优异**：基于订阅模式，精确更新
- 📦 **包体积小**：仅 1.2KB（gzipped）
- 🔧 **灵活易用**：不需要 Provider 包裹
- 🎨 **TypeScript 友好**：原生支持类型推导
- ⚡ **无依赖**：不依赖 React Context
- 🛠️ **中间件丰富**：支持 persist、devtools 等

### 与其他方案对比

```javascript
// ❌ Redux：需要大量样板代码
const INCREMENT = 'INCREMENT';
const reducer = (state, action) => {
  switch (action.type) {
    case INCREMENT: return { count: state.count + 1 };
    default: return state;
  }
};

// ❌ Context：性能问题 + 需要 Provider
const CountContext = createContext();
<CountContext.Provider value={value}>
  <App />
</CountContext.Provider>

// ✅ Zustand：简洁直观
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## 二、快速开始

### 安装

```bash
npm install zustand
# 或
yarn add zustand
# 或
pnpm add zustand
```

### 基本使用

```javascript
// stores/useCountStore.js
import { create } from 'zustand';

// 创建 store
const useCountStore = create((set) => ({
  // 状态
  count: 0,

  // 同步操作
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),

  // 带参数的操作
  incrementByAmount: (amount) => set((state) => ({ count: state.count + amount })),
}));

export default useCountStore;
```

```jsx
// components/Counter.jsx
import useCountStore from '@/stores/useCountStore';

function Counter() {
  // 订阅整个 store
  const { count, increment, decrement, reset } = useCountStore();

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default Counter;
```

### 选择性订阅（性能优化）

```jsx
// ✅ 只订阅需要的状态
function Counter() {
  // 只有 count 变化时才会重新渲染
  const count = useCountStore((state) => state.count);
  const increment = useCountStore((state) => state.increment);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}

// ❌ 不推荐：订阅整个 store
function BadExample() {
  const store = useCountStore(); // 任何状态变化都会重新渲染
  return <div>{store.count}</div>;
}
```

## 三、核心概念

### 1. set 函数

`set` 函数用于更新状态，支持两种方式：

```javascript
const useStore = create((set) => ({
  count: 0,
  user: { name: 'Alice', age: 25 },

  // 方式 1：直接传入新状态（浅合并）
  updateName: (name) => set({ user: { name } }), // ❌ 会丢失 age

  // 方式 2：函数式更新（推荐）
  updateNameCorrect: (name) => set((state) => ({
    user: { ...state.user, name }
  })),

  // 完全替换状态（第二个参数为 true）
  replaceState: () => set({ count: 0 }, true),
}));
```

### 2. get 函数

`get` 函数用于在 action 中获取最新状态：

```javascript
const useStore = create((set, get) => ({
  count: 0,
  multiplier: 2,

  // 使用 get 获取其他状态
  incrementByMultiplier: () => {
    const { count, multiplier } = get();
    set({ count: count + multiplier });
  },

  // 计算属性
  getTotal: () => {
    const { count, multiplier } = get();
    return count * multiplier;
  },
}));

// 在组件中使用
function Component() {
  const count = useStore((state) => state.count);
  const total = useStore((state) => state.getTotal());

  return <div>Count: {count}, Total: {total}</div>;
}
```

### 3. subscribe 订阅

可以在 React 组件外订阅状态变化：

```javascript
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// 订阅整个 store
const unsubscribe = useStore.subscribe((state) => {
  console.log('State changed:', state);
});

// 订阅特定状态
const unsubscribeCount = useStore.subscribe(
  (state) => state.count,
  (count) => {
    console.log('Count changed:', count);
  }
);

// 取消订阅
unsubscribe();
```

### 4. 异步操作

```javascript
const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,

  // 异步获取用户
  fetchUser: async (userId) => {
    set({ loading: true, error: null });

    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      set({ user: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // 异步更新用户
  updateUser: async (updates) => {
    const currentUser = get().user;

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      set({ user: data });
    } catch (error) {
      set({ error: error.message });
    }
  },
}));
```

## 四、实战示例

### 示例 1：待办事项应用

```javascript
// stores/useTodoStore.js
import { create } from 'zustand';

const useTodoStore = create((set, get) => ({
  todos: [],
  filter: 'all', // all | active | completed

  // 添加待办
  addTodo: (text) => set((state) => ({
    todos: [
      ...state.todos,
      { id: Date.now(), text, completed: false, createdAt: new Date() }
    ]
  })),

  // 切换完成状态
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  })),

  // 删除待办
  removeTodo: (id) => set((state) => ({
    todos: state.todos.filter((todo) => todo.id !== id)
  })),

  // 编辑待办
  editTodo: (id, text) => set((state) => ({
    todos: state.todos.map((todo) =>
      todo.id === id ? { ...todo, text } : todo
    )
  })),

  // 清除已完成
  clearCompleted: () => set((state) => ({
    todos: state.todos.filter((todo) => !todo.completed)
  })),

  // 切换全部完成
  toggleAll: () => set((state) => {
    const allCompleted = state.todos.every((todo) => todo.completed);
    return {
      todos: state.todos.map((todo) => ({ ...todo, completed: !allCompleted }))
    };
  }),

  // 设置过滤器
  setFilter: (filter) => set({ filter }),

  // 计算属性（使用 selector）
  getFilteredTodos: () => {
    const { todos, filter } = get();
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  },

  getStats: () => {
    const todos = get().todos;
    return {
      total: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    };
  },
}));

export default useTodoStore;
```

```jsx
// components/TodoApp.jsx
import { useState } from 'react';
import useTodoStore from '@/stores/useTodoStore';

function TodoApp() {
  const [inputValue, setInputValue] = useState('');

  // 选择性订阅
  const todos = useTodoStore((state) => state.getFilteredTodos());
  const stats = useTodoStore((state) => state.getStats());
  const filter = useTodoStore((state) => state.filter);

  const { addTodo, toggleTodo, removeTodo, setFilter, clearCompleted } = useTodoStore();

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addTodo(inputValue);
      setInputValue('');
    }
  };

  return (
    <div>
      <h1>Todo List</h1>

      {/* 添加表单 */}
      <form onSubmit={handleAddTodo}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>

      {/* 过滤器 */}
      <div>
        <button onClick={() => setFilter('all')} disabled={filter === 'all'}>
          All ({stats.total})
        </button>
        <button onClick={() => setFilter('active')} disabled={filter === 'active'}>
          Active ({stats.active})
        </button>
        <button onClick={() => setFilter('completed')} disabled={filter === 'completed'}>
          Completed ({stats.completed})
        </button>
      </div>

      {/* 待办列表 */}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* 底部操作 */}
      {stats.completed > 0 && (
        <button onClick={clearCompleted}>Clear completed</button>
      )}
    </div>
  );
}

export default TodoApp;
```

### 示例 2：购物车管理

```javascript
// stores/useCartStore.js
import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  coupon: null,

  // 添加商品
  addItem: (product) => set((state) => {
    const existingItem = state.items.find((item) => item.id === product.id);

    if (existingItem) {
      return {
        items: state.items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }

    return { items: [...state.items, { ...product, quantity: 1 }] };
  }),

  // 移除商品
  removeItem: (productId) => set((state) => ({
    items: state.items.filter((item) => item.id !== productId)
  })),

  // 更新数量
  updateQuantity: (productId, quantity) => set((state) => ({
    items: state.items.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    )
  })),

  // 清空购物车
  clearCart: () => set({ items: [], coupon: null }),

  // 应用优惠券
  applyCoupon: (coupon) => set({ coupon }),

  // 计算总价
  getTotal: () => {
    const { items, coupon } = get();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = coupon ? subtotal * coupon.discount : 0;
    return subtotal - discount;
  },

  // 获取商品数量
  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

export default useCartStore;
```

```jsx
// components/Cart.jsx
import useCartStore from '@/stores/useCartStore';

function Cart() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  const itemCount = useCartStore((state) => state.getItemCount());

  const { updateQuantity, removeItem, clearCart } = useCartStore();

  return (
    <div>
      <h2>Shopping Cart ({itemCount} items)</h2>

      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.id}>
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>¥{item.price}</p>

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
              />

              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}

          <div>
            <h3>Total: ¥{total.toFixed(2)}</h3>
            <button onClick={clearCart}>Clear Cart</button>
            <button>Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
```

### 示例 3：表单状态管理

```javascript
// stores/useFormStore.js
import { create } from 'zustand';

const useFormStore = create((set, get) => ({
  formData: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: 0,
    agreed: false,
  },
  errors: {},
  isSubmitting: false,

  // 更新字段
  setField: (field, value) => set((state) => ({
    formData: { ...state.formData, [field]: value },
    errors: { ...state.errors, [field]: '' }, // 清除错误
  })),

  // 批量更新字段
  setFields: (fields) => set((state) => ({
    formData: { ...state.formData, ...fields }
  })),

  // 设置错误
  setErrors: (errors) => set({ errors }),

  // 验证表单
  validate: () => {
    const { formData } = get();
    const errors = {};

    if (!formData.username) {
      errors.username = 'Username is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreed) {
      errors.agreed = 'You must agree to the terms';
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  // 提交表单
  submit: async () => {
    const { validate, formData } = get();

    if (!validate()) return;

    set({ isSubmitting: true });

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submission failed');

      // 重置表单
      set({
        formData: {
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          age: 0,
          agreed: false,
        },
        errors: {},
        isSubmitting: false,
      });

      return true;
    } catch (error) {
      set({
        errors: { submit: error.message },
        isSubmitting: false,
      });
      return false;
    }
  },

  // 重置表单
  reset: () => set({
    formData: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 0,
      agreed: false,
    },
    errors: {},
    isSubmitting: false,
  }),
}));

export default useFormStore;
```

## 五、高级特性

### 1. 中间件

#### persist 持久化

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'user-storage', // localStorage key
      storage: createJSONStorage(() => localStorage), // 默认 localStorage

      // 可选：自定义序列化
      // storage: createJSONStorage(() => sessionStorage),

      // 可选：只持久化部分状态
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useUserStore;
```

#### devtools 调试工具

```javascript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }), false, 'increment'),
      decrement: () => set((state) => ({ count: state.count - 1 }), false, 'decrement'),
    }),
    {
      name: 'CounterStore', // DevTools 中显示的名称
    }
  )
);
```

#### 组合多个中间件

```javascript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      { name: 'counter-storage' }
    ),
    { name: 'CounterStore' }
  )
);
```

### 2. Immer 中间件（不可变更新）

```javascript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useStore = create(
  immer((set) => ({
    user: {
      name: 'Alice',
      address: {
        city: 'Beijing',
        street: 'Main St',
      },
    },

    // ✅ 使用 Immer，可以"直接修改"状态
    updateCity: (city) => set((state) => {
      state.user.address.city = city; // 直接修改！
    }),

    // 对比：不使用 Immer 的写法
    // updateCity: (city) => set((state) => ({
    //   user: {
    //     ...state.user,
    //     address: {
    //       ...state.user.address,
    //       city,
    //     },
    //   },
    // })),
  }))
);
```

### 3. 切片模式（Slice Pattern）

将大型 store 拆分成多个小模块：

```javascript
// stores/slices/userSlice.js
export const createUserSlice = (set, get) => ({
  user: null,

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
});

// stores/slices/todoSlice.js
export const createTodoSlice = (set, get) => ({
  todos: [],

  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text }]
  })),

  removeTodo: (id) => set((state) => ({
    todos: state.todos.filter((t) => t.id !== id)
  })),
});

// stores/useAppStore.js
import { create } from 'zustand';
import { createUserSlice } from './slices/userSlice';
import { createTodoSlice } from './slices/todoSlice';

const useAppStore = create((...args) => ({
  ...createUserSlice(...args),
  ...createTodoSlice(...args),
}));

export default useAppStore;
```

### 4. TypeScript 支持

```typescript
// stores/useCountStore.ts
import { create } from 'zustand';

// 定义状态类型
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  incrementByAmount: (amount: number) => void;
}

// 创建 store
const useCountStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  incrementByAmount: (amount) => set((state) => ({ count: state.count + amount })),
}));

export default useCountStore;
```

```typescript
// 带中间件的 TypeScript 示例
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface UserState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        login: (user, token) => set({ user, token }),
        logout: () => set({ user: null, token: null }),
      }),
      { name: 'user-storage' }
    )
  )
);
```

## 六、状态管理方案对比

### Zustand vs Redux Toolkit vs Jotai vs MobX

| 特性 | Zustand | Redux Toolkit | Jotai | MobX |
|------|---------|---------------|-------|------|
| **包体积** | 1.2KB | 11KB | 3KB | 16KB |
| **学习曲线** | 低 | 中 | 低 | 中 |
| **样板代码** | 极少 | 少 | 极少 | 少 |
| **TypeScript** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **DevTools** | 需要中间件 | 内置 | 需要扩展 | 内置 |
| **Provider** | 不需要 | 需要 | 需要 | 需要 |
| **状态模式** | 单一 Store | 单一 Store | 原子化 | 可观察对象 |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **中间件** | 丰富 | 丰富 | 较少 | 丰富 |
| **异步处理** | 原生支持 | 内置 Thunk | 原生支持 | 原生支持 |

### 详细对比

#### 1. Zustand

**优点：**
- ✅ 极简 API，无样板代码
- ✅ 不需要 Provider，使用灵活
- ✅ 包体积最小（1.2KB）
- ✅ 性能优异，精确订阅
- ✅ 支持中间件（persist、devtools、immer）
- ✅ TypeScript 支持完善
- ✅ 可以在 React 外使用

**缺点：**
- ❌ 生态相对较小
- ❌ DevTools 需要额外配置
- ❌ 大型应用需要自己组织代码结构

**适用场景：**
- 小型到中型应用
- 不想引入复杂状态管理方案
- 需要灵活的状态共享
- 性能敏感的应用

```javascript
// Zustand 示例
const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));

function App() {
  const count = useStore((s) => s.count);
  return <div>{count}</div>;
}
```

#### 2. Redux Toolkit (RTK)

**优点：**
- ✅ 强大的生态系统
- ✅ 优秀的 DevTools
- ✅ RTK Query 简化数据获取
- ✅ 时间旅行调试
- ✅ 中间件丰富
- ✅ 文档完善，社区成熟

**缺点：**
- ❌ 需要 Provider 包裹
- ❌ 相对复杂的概念（slice、thunk、reducer）
- ❌ 包体积较大（11KB）
- ❌ 学习曲线较陡

**适用场景：**
- 大型复杂应用
- 需要时间旅行调试
- 团队熟悉 Redux 生态
- 需要强大的中间件支持

```javascript
// Redux Toolkit 示例
const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => { state.count += 1; },
  },
});

function App() {
  const count = useSelector((state) => state.counter.count);
  const dispatch = useDispatch();
  return <button onClick={() => dispatch(increment())}>{count}</button>;
}
```

#### 3. Jotai

**优点：**
- ✅ 原子化状态管理
- ✅ API 简洁直观
- ✅ 包体积小（3KB）
- ✅ 性能优异
- ✅ 避免了不必要的重渲染
- ✅ TypeScript 支持完善

**缺点：**
- ❌ 需要 Provider
- ❌ 原子概念需要学习
- ❌ 生态相对较小
- ❌ 大型应用需要管理大量 atom

**适用场景：**
- 需要细粒度状态管理
- 状态依赖关系复杂
- 性能敏感的应用
- 偏好原子化设计

```javascript
// Jotai 示例
const countAtom = atom(0);

function App() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

#### 4. MobX

**优点：**
- ✅ 响应式编程，自动追踪依赖
- ✅ 可以直接修改状态
- ✅ 性能优异
- ✅ 学习曲线平缓
- ✅ 支持类和函数式

**缺点：**
- ❌ 包体积较大（16KB）
- ❌ 需要装饰器（可选）
- ❌ 魔法较多，不够显式
- ❌ TypeScript 支持相对复杂

**适用场景：**
- 复杂的数据关系
- 偏好面向对象编程
- 需要自动依赖追踪
- 大量计算属性

```javascript
// MobX 示例
class CounterStore {
  count = 0;

  increment() {
    this.count++;
  }
}

const store = new CounterStore();
makeAutoObservable(store);

const App = observer(() => {
  return <button onClick={() => store.increment()}>{store.count}</button>;
});
```

### 选择建议

```
项目规模和需求
├─ 小型项目（简单状态共享）
│   ├─ 首选：Zustand
│   └─ 备选：Jotai
│
├─ 中型项目（多模块状态）
│   ├─ 首选：Zustand + 切片模式
│   ├─ 备选：Jotai
│   └─ 备选：Redux Toolkit（如果团队熟悉）
│
└─ 大型项目（复杂业务逻辑）
    ├─ 首选：Redux Toolkit（完整生态）
    ├─ 备选：MobX（OOP 风格）
    └─ 备选：Zustand + 严格架构

特殊需求
├─ 需要时间旅行调试 → Redux Toolkit
├─ 需要细粒度更新 → Jotai
├─ 需要自动依赖追踪 → MobX
├─ 需要最小包体积 → Zustand
└─ 需要最简单的 API → Zustand / Jotai
```

## 七、最佳实践

### 1. 文件组织

```
src/
├── stores/
│   ├── useUserStore.js      # 用户状态
│   ├── useTodoStore.js      # 待办事项状态
│   ├── useCartStore.js      # 购物车状态
│   └── slices/              # 切片模式
│       ├── userSlice.js
│       ├── todoSlice.js
│       └── cartSlice.js
```

### 2. 命名规范

```javascript
// ✅ 推荐
const useUserStore = create(...);
const useTodoStore = create(...);

// ❌ 避免
const store = create(...);
const userState = create(...);
```

### 3. 选择性订阅

```javascript
// ✅ 推荐：只订阅需要的数据
function Component() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  // count 变化时才重新渲染
}

// ❌ 避免：订阅整个 store
function Component() {
  const { count, increment, user, todos } = useStore();
  // 任何状态变化都会重新渲染
}
```

### 4. 使用浅比较优化

```javascript
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

function Component() {
  // 使用 shallow 比较
  const { count, increment } = useStore(
    (state) => ({ count: state.count, increment: state.increment }),
    shallow
  );
}
```

### 5. 分离业务逻辑

```javascript
// ✅ 推荐：将复杂逻辑放在 store 中
const useStore = create((set, get) => ({
  todos: [],

  addTodoWithValidation: (text) => {
    if (!text.trim()) return;
    if (text.length > 100) return;

    const { todos } = get();
    if (todos.some((t) => t.text === text)) return;

    set({ todos: [...todos, { id: Date.now(), text }] });
  },
}));

// ❌ 避免：在组件中处理业务逻辑
function Component() {
  const { todos, addTodo } = useStore();

  const handleAdd = (text) => {
    if (!text.trim()) return;
    if (text.length > 100) return;
    if (todos.some((t) => t.text === text)) return;
    addTodo(text);
  };
}
```

## 八、性能优化

### 1. 避免不必要的重渲染

```javascript
// ✅ 使用选择器
const count = useStore((state) => state.count);

// ✅ 使用 shallow 比较对象
const { x, y } = useStore(
  (state) => ({ x: state.x, y: state.y }),
  shallow
);

// ✅ 使用 useShallow Hook (Zustand 4.0+)
import { useShallow } from 'zustand/react/shallow';

const { x, y } = useStore(useShallow((state) => ({ x: state.x, y: state.y })));
```

### 2. 批量更新

```javascript
const useStore = create((set) => ({
  user: null,
  posts: [],
  loading: false,

  // ❌ 多次调用 set
  fetchUserBad: async (id) => {
    set({ loading: true });
    const user = await fetchUser(id);
    set({ user });
    const posts = await fetchPosts(id);
    set({ posts });
    set({ loading: false });
  },

  // ✅ 一次性更新多个状态
  fetchUserGood: async (id) => {
    set({ loading: true });
    const [user, posts] = await Promise.all([
      fetchUser(id),
      fetchPosts(id),
    ]);
    set({ user, posts, loading: false });
  },
}));
```

### 3. 计算属性缓存

```javascript
import { useMemo } from 'react';

function Component() {
  const todos = useStore((state) => state.todos);

  // 使用 useMemo 缓存计算结果
  const completedTodos = useMemo(
    () => todos.filter((t) => t.completed),
    [todos]
  );

  return <div>{completedTodos.length} completed</div>;
}
```

## 九、React 状态管理的未来趋势

### 1. 原子化状态管理

**趋势：** 从全局单一 Store 向细粒度原子状态转变

- **Jotai**、**Recoil** 引领原子化设计
- 更好的性能和可维护性
- 避免全局状态污染

```javascript
// 原子化示例（Jotai）
const userAtom = atom(null);
const todosAtom = atom([]);
const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom);
  return todos.filter((t) => !t.completed);
});
```

### 2. 零 Boilerplate

**趋势：** 更少的样板代码，更简洁的 API

- Zustand、Jotai 的成功证明了简洁的重要性
- 开发者体验优先
- 减少学习成本

### 3. TypeScript First

**趋势：** 原生 TypeScript 支持成为标配

- 类型推导自动化
- 更好的 IDE 支持
- 类型安全的状态管理

### 4. 服务端状态分离

**趋势：** 客户端状态和服务端状态分离管理

- **React Query**、**SWR**、**RTK Query** 专注服务端状态
- Zustand、Jotai 管理客户端 UI 状态
- 各司其职，职责清晰

```javascript
// 客户端状态（Zustand）
const useUIStore = create((set) => ({
  theme: 'light',
  sidebarOpen: true,
}));

// 服务端状态（React Query）
const { data: users } = useQuery('users', fetchUsers);
```

### 5. 更好的 DevTools

**趋势：** 调试工具越来越强大

- 时间旅行调试
- 状态快照
- 性能分析
- 状态依赖可视化

### 6. React Server Components 集成

**趋势：** 适配 React 18+ 新特性

- 与 Server Components 无缝集成
- Suspense 支持
- Concurrent Rendering 优化

### 未来选择建议

**2026+ 推荐方案：**

```javascript
// 小型项目
Zustand（客户端状态） + React Query（服务端状态）

// 中型项目
Jotai（客户端状态） + React Query（服务端状态）

// 大型项目
Redux Toolkit（全局状态） + RTK Query（服务端状态）
或
Zustand（切片模式）+ React Query
```

## 十、参考资源

### 官方文档

- [Zustand 官方文档](https://zustand-demo.pmnd.rs/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [Jotai 官方文档](https://jotai.org/)
- [MobX 官方文档](https://mobx.js.org/)

### 学习资源

- [Zustand 最佳实践](https://tkdodo.eu/blog/working-with-zustand)
- [状态管理对比分析](https://blog.logrocket.com/zustand-vs-redux/)
- [React Query + Zustand 实战](https://tanstack.com/query/latest)

### 社区资源

- [Awesome Zustand](https://github.com/pmndrs/zustand#readme)
- [React 状态管理指南 2026](https://www.robinwieruch.de/react-state-management/)

---

**总结：** Zustand 以其极简的 API、优秀的性能和灵活的架构，正在成为 React 状态管理的新宠。相比 Redux 的复杂性，Zustand 提供了更轻量级的解决方案；相比 Context 的性能问题，Zustand 有更精确的订阅机制。对于大多数中小型项目，Zustand 是 2026 年的最佳选择。
