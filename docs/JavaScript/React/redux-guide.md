---
title: Redux 状态管理完全指南
date: 2026-01-19 09:48:00
tags:
  - React
  - Redux
  - React Redux
  - Redux Toolkit
  - 状态管理
categories:
  - React
---

# Redux 状态管理完全指南

Redux 是 JavaScript 应用的可预测状态容器，常用于 React 应用的全局状态管理。本文将详细介绍传统 Redux、React Redux 和现代化的 Redux Toolkit 的使用方法。

## Redux 核心概念

### 三大原则

1. **单一数据源**：整个应用的状态存储在单一 store 中
2. **状态只读**：唯一改变状态的方式是触发 action
3. **纯函数修改**：使用纯函数 reducer 来描述状态如何改变

### 核心组成

```
┌─────────────────────────────────────────────┐
│                   View (UI)                 │
│                      ↓                      │
│                   Action                    │
│                      ↓                      │
│                  Dispatch                   │
│                      ↓                      │
│                   Reducer                   │
│                      ↓                      │
│                    Store                    │
│                      ↓                      │
│                 State Update                │
│                      ↓                      │
│                View Re-render               │
└─────────────────────────────────────────────┘
```

## React Redux

`react-redux` 是 Redux 官方提供的 React 绑定库，用于在 React 组件中便捷地使用 Redux。

### 安装

```bash
npm install redux react-redux

# 或
yarn add redux react-redux
```

### 基本配置

#### 1. 创建 Store

```javascript
// store/index.js
import { createStore, combineReducers } from 'redux';
import voteReducer from './modules/vote';
import userReducer from './modules/user';

// 合并多个 reducer
const rootReducer = combineReducers({
  vote: voteReducer,
  user: userReducer,
});

// 创建 store
const store = createStore(rootReducer);

export default store;
```

#### 2. 提供 Store (Provider)

在根组件使用 `Provider` 组件包裹应用，使所有子组件都能访问 store：

```jsx
// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from '@/store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

### 函数组件中使用

#### 方式一：connect 高阶组件

```jsx
import React from 'react';
import { connect } from 'react-redux';

const Demo = function Demo(props) {
  const { count, username, increment, decrement } = props;

  return (
    <div>
      <p>计数: {count}</p>
      <p>用户: {username}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
};

/**
 * connect(mapStateToProps, mapDispatchToProps)(Component)
 *
 * @param {Function} mapStateToProps - 将 state 映射为 props
 * @param {Function} mapDispatchToProps - 将 dispatch 映射为 props
 * @returns {Function} 返回一个高阶组件
 */
export default connect(
  // mapStateToProps: 获取 Redux 中的状态，作为属性传递给组件
  (state) => {
    console.log(state);
    // state 包含所有模块的公共状态
    // { vote: {...}, user: {...} }
    return {
      count: state.vote.count,
      username: state.user.username,
    };
  },

  // mapDispatchToProps: 将派发任务的方法作为属性传递给组件
  (dispatch) => {
    // dispatch 是 store.dispatch 方法
    return {
      increment() {
        dispatch({ type: 'INCREMENT' });
      },
      decrement() {
        dispatch({ type: 'DECREMENT' });
      },
    };
  }
)(Demo);
```

#### 方式二：useSelector 和 useDispatch Hooks

```jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

function Counter() {
  // useSelector: 从 Redux store 中提取数据
  const count = useSelector((state) => state.vote.count);
  const username = useSelector((state) => state.user.username);

  // useDispatch: 获取 dispatch 函数
  const dispatch = useDispatch();

  const increment = () => {
    dispatch({ type: 'INCREMENT' });
  };

  const decrement = () => {
    dispatch({ type: 'DECREMENT' });
  };

  return (
    <div>
      <p>计数: {count}</p>
      <p>用户: {username}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
}

export default Counter;
```

:::tip Hooks vs connect
推荐使用 Hooks 方式（useSelector、useDispatch），代码更简洁，更符合 React 现代开发习惯。
:::

### 类组件中使用

```jsx
import React from 'react';
import { connect } from 'react-redux';

class Demo extends React.Component {
  handleIncrement = () => {
    this.props.increment();
  };

  render() {
    const { count, username } = this.props;

    return (
      <div>
        <p>计数: {count}</p>
        <p>用户: {username}</p>
        <button onClick={this.handleIncrement}>+1</button>
      </div>
    );
  }
}

// 简写方式
export default connect(
  (state) => ({
    count: state.vote.count,
    username: state.user.username,
  }),
  (dispatch) => ({
    increment: () => dispatch({ type: 'INCREMENT' }),
  })
)(Demo);
```

### mapDispatchToProps 的多种写法

#### 1. 函数形式

```javascript
const mapDispatchToProps = (dispatch) => ({
  increment: () => dispatch({ type: 'INCREMENT' }),
  decrement: () => dispatch({ type: 'DECREMENT' }),
});
```

#### 2. 对象简写形式

```javascript
import { increment, decrement } from '@/store/actions';

// Redux 会自动将 action creators 包装到 dispatch 中
const mapDispatchToProps = {
  increment,
  decrement,
};
```

#### 3. 使用 bindActionCreators

```javascript
import { bindActionCreators } from 'redux';
import * as voteActions from '@/store/actions';

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(voteActions, dispatch),
});

// 使用
this.props.actions.increment();
```

## Redux Toolkit (推荐)

Redux Toolkit (RTK) 是 Redux 官方推荐的现代化工具集，大幅简化了 Redux 的使用。

### 为什么使用 Redux Toolkit？

**传统 Redux 的痛点：**
- ❌ 配置繁琐，需要大量样板代码
- ❌ 需要手动配置中间件（redux-thunk、redux-saga 等）
- ❌ 不支持直接修改 state（需要不可变更新）
- ❌ Action 和 Reducer 需要分开定义

**Redux Toolkit 的优势：**
- ✅ 开箱即用，配置简单
- ✅ 内置 Redux Thunk，支持异步操作
- ✅ 使用 Immer 库，可以"直接修改" state
- ✅ createSlice 统一管理 action 和 reducer
- ✅ 自动生成 action creators

### 安装

```bash
npm install @reduxjs/toolkit react-redux

# 或
yarn add @reduxjs/toolkit react-redux
```

### 基本使用

#### 1. 创建 Slice

Slice 是 Redux Toolkit 的核心概念，包含了 reducer 逻辑和 actions。

```javascript
// store/modules/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  // slice 的名称
  name: 'counter',

  // 初始状态
  initialState: {
    count: 0,
    loading: false,
  },

  // reducers: 定义同步 action 和对应的 reducer
  reducers: {
    // 自动生成 action creator: increment()
    increment(state) {
      // 使用 Immer，可以"直接修改" state
      state.count += 1;
    },

    decrement(state) {
      state.count -= 1;
    },

    // 带 payload 的 action
    incrementByAmount(state, action) {
      state.count += action.payload;
    },

    // 重置
    reset(state) {
      state.count = 0;
    },
  },
});

// 导出 action creators
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// 导出 reducer
export default counterSlice.reducer;
```

#### 2. 配置 Store

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './modules/counterSlice';
import userReducer from './modules/userSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
  },

  // 可选：配置中间件
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware().concat(logger),

  // 可选：开发工具配置
  // devTools: process.env.NODE_ENV !== 'production',
});

export default store;
```

:::tip configureStore 的优势
`configureStore` 自动配置了：
- Redux DevTools Extension
- redux-thunk 中间件
- 开发环境下的 state 不可变性检查
- 序列化检查
:::

#### 3. 在组件中使用

```jsx
// components/Counter.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
} from '@/store/modules/counterSlice';

function Counter() {
  // 获取状态
  const count = useSelector((state) => state.counter.count);
  const dispatch = useDispatch();

  return (
    <div>
      <h2>计数: {count}</h2>

      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(decrement())}>-1</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
      <button onClick={() => dispatch(reset())}>重置</button>
    </div>
  );
}

export default Counter;
```

### 异步操作 - createAsyncThunk

Redux Toolkit 提供了 `createAsyncThunk` 来处理异步逻辑。

#### 1. 创建异步 Thunk

```javascript
// store/modules/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserAPI } from '@/api/user';

// 创建异步 thunk
export const fetchUser = createAsyncThunk(
  'user/fetchUser', // action type 前缀
  async (userId, thunkAPI) => {
    try {
      const response = await fetchUserAPI(userId);
      return response.data; // 返回值会作为 fulfilled action 的 payload
    } catch (error) {
      // 返回错误信息
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUser(state) {
      state.userInfo = null;
    },
  },
  // extraReducers: 处理其他 action（如异步 thunk 的 action）
  extraReducers: (builder) => {
    builder
      // 请求开始
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // 请求成功
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      // 请求失败
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
```

#### 2. 在组件中使用异步 Thunk

```jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser, clearUser } from '@/store/modules/userSlice';

function UserProfile() {
  const dispatch = useDispatch();
  const { userInfo, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    // 发起异步请求
    dispatch(fetchUser(123));
  }, [dispatch]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h2>用户信息</h2>
      {userInfo && (
        <div>
          <p>姓名: {userInfo.name}</p>
          <p>邮箱: {userInfo.email}</p>
        </div>
      )}
      <button onClick={() => dispatch(clearUser())}>清除</button>
    </div>
  );
}

export default UserProfile;
```

### createAsyncThunk 生命周期

`createAsyncThunk` 会自动生成三个 action types：

```javascript
fetchUser.pending    // user/fetchUser/pending   - 请求开始
fetchUser.fulfilled  // user/fetchUser/fulfilled - 请求成功
fetchUser.rejected   // user/fetchUser/rejected  - 请求失败
```

### RTK Query（高级）

RTK Query 是 Redux Toolkit 的数据获取和缓存工具，类似于 React Query。

```javascript
// store/api/userApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    // 查询
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
    }),
    // 更新
    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
    }),
  }),
});

// 自动生成 hooks
export const { useGetUserByIdQuery, useUpdateUserMutation } = userApi;
```

```jsx
// 在组件中使用
import { useGetUserByIdQuery } from '@/store/api/userApi';

function UserProfile({ userId }) {
  const { data, error, isLoading } = useGetUserByIdQuery(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return <div>{data.name}</div>;
}
```

## 完整示例：待办事项应用

### 1. 创建 Todo Slice

```javascript
// store/modules/todoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTodosAPI, addTodoAPI } from '@/api/todo';

// 异步获取待办事项
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await fetchTodosAPI();
  return response.data;
});

// 异步添加待办事项
export const addTodo = createAsyncThunk('todos/addTodo', async (text) => {
  const response = await addTodoAPI({ text, completed: false });
  return response.data;
});

const todoSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // 同步操作
    toggleTodo(state, action) {
      const todo = state.items.find((item) => item.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    deleteTodo(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // 获取待办事项
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // 添加待办事项
    builder
      .addCase(addTodo.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const { toggleTodo, deleteTodo } = todoSlice.actions;
export default todoSlice.reducer;
```

### 2. 配置 Store

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import todoReducer from './modules/todoSlice';

const store = configureStore({
  reducer: {
    todos: todoReducer,
  },
});

export default store;
```

### 3. 组件使用

```jsx
// components/TodoList.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
} from '@/store/modules/todoSlice';

function TodoList() {
  const [inputValue, setInputValue] = useState('');
  const { items, loading, error } = useSelector((state) => state.todos);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  const handleAddTodo = () => {
    if (inputValue.trim()) {
      dispatch(addTodo(inputValue));
      setInputValue('');
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h2>待办事项</h2>

      <div>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入待办事项"
        />
        <button onClick={handleAddTodo}>添加</button>
      </div>

      <ul>
        {items.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch(toggleTodo(todo.id))}
            />
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => dispatch(deleteTodo(todo.id))}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
```

## 性能优化

### 1. 使用 Reselect 创建记忆化选择器

```bash
npm install reselect
```

```javascript
// store/selectors/todoSelectors.js
import { createSelector } from 'reselect';

// 基础 selector
const selectTodos = (state) => state.todos.items;

// 记忆化 selector
export const selectCompletedTodos = createSelector(
  [selectTodos],
  (todos) => todos.filter((todo) => todo.completed)
);

export const selectActiveTodos = createSelector(
  [selectTodos],
  (todos) => todos.filter((todo) => !todo.completed)
);

export const selectTodoStats = createSelector(
  [selectTodos],
  (todos) => ({
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
  })
);
```

```jsx
// 在组件中使用
import { selectCompletedTodos, selectTodoStats } from '@/store/selectors/todoSelectors';

function TodoStats() {
  const completedTodos = useSelector(selectCompletedTodos);
  const stats = useSelector(selectTodoStats);

  return (
    <div>
      <p>总数: {stats.total}</p>
      <p>已完成: {stats.completed}</p>
      <p>进行中: {stats.active}</p>
    </div>
  );
}
```

### 2. 使用 shallowEqual 避免不必要的渲染

```jsx
import { useSelector, shallowEqual } from 'react-redux';

function Component() {
  // 浅比较，避免引用类型导致的重复渲染
  const { count, username } = useSelector(
    (state) => ({
      count: state.counter.count,
      username: state.user.username,
    }),
    shallowEqual
  );
}
```

## 最佳实践

### 1. 文件组织结构

```
src/
├── store/
│   ├── index.js                 # Store 配置
│   ├── modules/                 # 各个 slice
│   │   ├── counterSlice.js
│   │   ├── userSlice.js
│   │   └── todoSlice.js
│   ├── selectors/               # 选择器
│   │   └── todoSelectors.js
│   └── api/                     # RTK Query API
│       └── userApi.js
```

### 2. Slice 命名规范

```javascript
// ✅ 好的命名
const userSlice = createSlice({
  name: 'user',
  // ...
});

// ❌ 避免
const slice1 = createSlice({
  name: 'data',
  // ...
});
```

### 3. Action 命名规范

使用动词 + 名词的形式，语义清晰：

```javascript
// ✅ 推荐
increment()
decrementByAmount()
setUser()
fetchUserSuccess()
resetState()

// ❌ 不推荐
add()
update()
change()
```

### 4. 合理拆分 Slice

按功能模块拆分，不要创建一个巨大的 slice：

```javascript
// ✅ 推荐
userSlice.js      // 用户相关
todoSlice.js      // 待办事项相关
cartSlice.js      // 购物车相关

// ❌ 避免
appSlice.js       // 包含所有状态
```

### 5. TypeScript 支持

```typescript
// store/modules/counterSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  count: number;
  loading: boolean;
}

const initialState: CounterState = {
  count: 0,
  loading: false,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.count += 1;
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.count += action.payload;
    },
  },
});

export const { increment, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```

```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './modules/counterSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
```

```typescript
// hooks/useTypedSelector.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

// 类型化的 hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## Redux DevTools

Redux Toolkit 默认集成了 Redux DevTools，可以在浏览器中安装扩展进行调试。

**功能：**
- 📊 查看 state 树
- 🔍 追踪 action 历史
- ⏮️ 时间旅行调试
- 📈 性能监控

## 工具对比总结

| 特性 | 传统 Redux | React Redux | Redux Toolkit |
|------|-----------|-------------|---------------|
| 配置复杂度 | 高 | 中 | 低 |
| 样板代码 | 多 | 中 | 少 |
| 不可变更新 | 手动 | 手动 | 自动（Immer） |
| 异步处理 | 需要中间件 | 需要中间件 | 内置 Thunk |
| TypeScript 支持 | 需配置 | 需配置 | 内置支持 |
| 学习曲线 | 陡峭 | 中等 | 平缓 |
| 推荐程度 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 参考资源

- [Redux 官方文档](https://redux.js.org/)
- [React Redux 官方文档](https://react-redux.js.org/)
- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
- [Reselect 文档](https://github.com/reduxjs/reselect)
