---
title: React Context API 完全指南
date: 2026-01-19 09:53:00
tags:
  - React
  - Context API
  - 状态管理
  - 组件通信
categories:
  - React
---

# React Context API 完全指南

Context API 是 React 提供的一种跨组件层级传递数据的解决方案，无需通过 props 层层传递，适用于全局共享的数据（如主题、用户信息、语言设置等）。

## 什么是 Context？

在传统的 React 应用中，数据通过 props 从父组件传递到子组件。但当组件树层级较深时，需要将数据通过多个中间组件传递，这就是"prop drilling"（属性钻取）问题。

```
App (theme)
  └── Layout (theme)
      └── Sidebar (theme)
          └── Navigation (theme)
              └── MenuItem (需要 theme)
```

Context 提供了一种在组件树中共享数据的方式，无需手动通过每一层组件传递 props。

## Context API 的组成

- **React.createContext()**: 创建 Context 对象
- **Provider**: 提供数据的组件
- **Consumer**: 消费数据的组件
- **useContext**: 函数组件中消费数据的 Hook

## 基本使用

### 1. 创建 Context 对象

```javascript
// contexts/ThemeContext.js
import React from 'react';

// 创建 Context 对象，可以传入默认值
const ThemeContext = React.createContext();

export default ThemeContext;
```

**带默认值：**

```javascript
// contexts/ThemeContext.js
import React from 'react';

// 提供默认值（当没有匹配的 Provider 时使用）
const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export default ThemeContext;
```

### 2. 父组件提供数据（Provider）

```jsx
// components/Parent.jsx
import React from 'react';
import ThemeContext from '@/contexts/ThemeContext';
import Child from './Child';

class Parent extends React.Component {
  state = {
    supNum: 0,
    oppNum: 0,
    theme: 'light',
  };

  // 修改数据的方法
  change = (type) => {
    if (type === 'sup') {
      this.setState({ supNum: this.state.supNum + 1 });
    } else {
      this.setState({ oppNum: this.state.oppNum + 1 });
    }
  };

  toggleTheme = () => {
    this.setState({
      theme: this.state.theme === 'light' ? 'dark' : 'light',
    });
  };

  render() {
    const { supNum, oppNum, theme } = this.state;

    return (
      <ThemeContext.Provider
        value={{
          supNum,
          oppNum,
          theme,
          change: this.change,
          toggleTheme: this.toggleTheme,
        }}
      >
        <div className={`app ${theme}`}>
          <h1>父组件</h1>
          <Child />
        </div>
      </ThemeContext.Provider>
    );
  }
}

export default Parent;
```

:::tip Provider 的 value 属性
- `value` 属性会传递给所有后代组件
- 当 `value` 改变时，所有消费该 Context 的组件都会重新渲染
- 建议将 `value` 设置为一个对象，包含数据和方法
:::

### 3. 子组件消费数据 - 类组件

#### 方案一：static contextType（推荐）

```jsx
// components/Child.jsx
import React from 'react';
import ThemeContext from '@/contexts/ThemeContext';

class Child extends React.Component {
  // 固定写法：将 Context 赋值给 contextType
  static contextType = ThemeContext;

  handleSupport = () => {
    this.context.change('sup');
  };

  render() {
    const { supNum, oppNum, theme } = this.context;

    return (
      <div className={`child ${theme}`}>
        <h2>子组件</h2>
        <p>支持数: {supNum}</p>
        <p>反对数: {oppNum}</p>
        <button onClick={this.handleSupport}>支持</button>
        <button onClick={() => this.context.change('opp')}>反对</button>
        <button onClick={this.context.toggleTheme}>切换主题</button>
      </div>
    );
  }
}

export default Child;
```

**特点：**
- ✅ 语法简洁
- ✅ 可以在任何生命周期方法中访问 `this.context`
- ❌ 只能订阅单一的 Context

#### 方案二：Context.Consumer

```jsx
// components/Child.jsx
import React from 'react';
import ThemeContext from '@/contexts/ThemeContext';

class Child extends React.Component {
  render() {
    return (
      <ThemeContext.Consumer>
        {(context) => {
          const { supNum, oppNum, theme, change, toggleTheme } = context;

          return (
            <div className={`child ${theme}`}>
              <h2>子组件</h2>
              <p>支持数: {supNum}</p>
              <p>反对数: {oppNum}</p>
              <button onClick={() => change('sup')}>支持</button>
              <button onClick={() => change('opp')}>反对</button>
              <button onClick={toggleTheme}>切换主题</button>
            </div>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

export default Child;
```

**特点：**
- ✅ 可以订阅多个 Context
- ✅ 灵活性高
- ❌ 语法相对繁琐（需要函数嵌套）

**订阅多个 Context 示例：**

```jsx
render() {
  return (
    <ThemeContext.Consumer>
      {(theme) => (
        <UserContext.Consumer>
          {(user) => (
            <div>
              <p>主题: {theme}</p>
              <p>用户: {user.name}</p>
            </div>
          )}
        </UserContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}
```

### 4. 子组件消费数据 - 函数组件

#### 方案一：Context.Consumer

```jsx
// components/Child.jsx
import React from 'react';
import ThemeContext from '@/contexts/ThemeContext';

const Child = function Child(props) {
  return (
    <ThemeContext.Consumer>
      {(context) => {
        const { supNum, oppNum, theme, change, toggleTheme } = context;

        return (
          <div className={`child ${theme}`}>
            <h2>子组件</h2>
            <p>支持数: {supNum}</p>
            <p>反对数: {oppNum}</p>
            <button onClick={() => change('sup')}>支持</button>
            <button onClick={() => change('opp')}>反对</button>
            <button onClick={toggleTheme}>切换主题</button>
          </div>
        );
      }}
    </ThemeContext.Consumer>
  );
};

export default Child;
```

#### 方案二：useContext Hook（推荐）

```jsx
// components/Child.jsx
import React, { useContext } from 'react';
import ThemeContext from '@/contexts/ThemeContext';

const Child = function Child(props) {
  // 使用 useContext 获取 Context 值
  const context = useContext(ThemeContext);
  const { supNum, oppNum, theme, change, toggleTheme } = context;

  return (
    <div className={`child ${theme}`}>
      <h2>子组件</h2>
      <p>支持数: {supNum}</p>
      <p>反对数: {oppNum}</p>
      <button onClick={() => change('sup')}>支持</button>
      <button onClick={() => change('opp')}>反对</button>
      <button onClick={toggleTheme}>切换主题</button>
    </div>
  );
};

export default Child;
```

**使用多个 Context：**

```jsx
const Child = () => {
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  const language = useContext(LanguageContext);

  return (
    <div>
      <p>主题: {theme}</p>
      <p>用户: {user.name}</p>
      <p>语言: {language}</p>
    </div>
  );
};
```

:::tip useContext 的优势
- ✅ 语法最简洁
- ✅ 可以轻松使用多个 Context
- ✅ 符合 React Hooks 规范
- ✅ 可以在组件的任何位置使用
:::

## 完整示例：主题切换

### 1. 创建 Context

```javascript
// contexts/ThemeContext.js
import React from 'react';

const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export default ThemeContext;
```

### 2. 根组件提供主题

```jsx
// App.jsx
import React, { useState } from 'react';
import ThemeContext from './contexts/ThemeContext';
import Header from './components/Header';
import Content from './components/Content';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app ${theme}`}>
        <Header />
        <Content />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
```

### 3. 子组件使用主题

```jsx
// components/Header.jsx
import React, { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function Header() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className={`header ${theme}`}>
      <h1>我的应用</h1>
      <button onClick={toggleTheme}>
        切换到 {theme === 'light' ? '暗色' : '亮色'} 主题
      </button>
    </header>
  );
}

export default Header;
```

```jsx
// components/Content.jsx
import React, { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

function Content() {
  const { theme } = useContext(ThemeContext);

  return (
    <main className={`content ${theme}`}>
      <h2>内容区域</h2>
      <p>当前主题: {theme}</p>
    </main>
  );
}

export default Content;
```

## 高级用法

### 1. 创建自定义 Context Hook

```javascript
// contexts/ThemeContext.js
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

// 自定义 Provider 组件
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 自定义 Hook
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
```

**使用：**

```jsx
// App.jsx
import { ThemeProvider } from './contexts/ThemeContext';
import Content from './components/Content';

function App() {
  return (
    <ThemeProvider>
      <Content />
    </ThemeProvider>
  );
}
```

```jsx
// components/Content.jsx
import { useTheme } from '../contexts/ThemeContext';

function Content() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={theme}>
      <button onClick={toggleTheme}>切换主题</button>
    </div>
  );
}
```

### 2. 组合多个 Context

```jsx
// App.jsx
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <LanguageProvider>
          <MainContent />
        </LanguageProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
```

**优化写法（组合 Provider）：**

```jsx
// contexts/AppProviders.jsx
import { ThemeProvider } from './ThemeContext';
import { UserProvider } from './UserContext';
import { LanguageProvider } from './LanguageContext';

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
```

```jsx
// App.jsx
import { AppProviders } from './contexts/AppProviders';

function App() {
  return (
    <AppProviders>
      <MainContent />
    </AppProviders>
  );
}
```

### 3. Context 值的优化

#### 问题：不必要的重渲染

当 Provider 的 value 是对象字面量时，每次渲染都会创建新对象，导致所有消费者重新渲染：

```jsx
// ❌ 不推荐：每次都创建新对象
function App() {
  const [count, setCount] = useState(0);

  return (
    <CountContext.Provider value={{ count, setCount }}>
      <Child />
    </CountContext.Provider>
  );
}
```

#### 解决方案一：useMemo

```jsx
// ✅ 推荐：使用 useMemo 缓存对象
function App() {
  const [count, setCount] = useState(0);

  const value = useMemo(
    () => ({ count, setCount }),
    [count]
  );

  return (
    <CountContext.Provider value={value}>
      <Child />
    </CountContext.Provider>
  );
}
```

#### 解决方案二：拆分 Context

```jsx
// ✅ 推荐：拆分为状态和方法两个 Context
const CountStateContext = createContext();
const CountDispatchContext = createContext();

function CountProvider({ children }) {
  const [count, setCount] = useState(0);

  return (
    <CountStateContext.Provider value={count}>
      <CountDispatchContext.Provider value={setCount}>
        {children}
      </CountDispatchContext.Provider>
    </CountStateContext.Provider>
  );
}

// 只需要状态的组件，只会在状态变化时重渲染
function DisplayCount() {
  const count = useContext(CountStateContext);
  return <div>{count}</div>;
}

// 只需要方法的组件，永远不会重渲染
function IncrementButton() {
  const setCount = useContext(CountDispatchContext);
  return <button onClick={() => setCount(c => c + 1)}>+1</button>;
}
```

### 4. Context 与 Reducer 结合

```jsx
// contexts/TodoContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const TodoStateContext = createContext();
const TodoDispatchContext = createContext();

function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, { id: Date.now(), text: action.text, completed: false }];
    case 'TOGGLE_TODO':
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    case 'DELETE_TODO':
      return state.filter((todo) => todo.id !== action.id);
    default:
      return state;
  }
}

export function TodoProvider({ children }) {
  const [todos, dispatch] = useReducer(todoReducer, []);

  return (
    <TodoStateContext.Provider value={todos}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoStateContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
}

export function useTodoDispatch() {
  const context = useContext(TodoDispatchContext);
  if (context === undefined) {
    throw new Error('useTodoDispatch must be used within a TodoProvider');
  }
  return context;
}
```

**使用：**

```jsx
// components/TodoList.jsx
import { useTodos, useTodoDispatch } from '../contexts/TodoContext';

function TodoList() {
  const todos = useTodos();
  const dispatch = useTodoDispatch();

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => dispatch({ type: 'TOGGLE_TODO', id: todo.id })}
          />
          <span>{todo.text}</span>
          <button onClick={() => dispatch({ type: 'DELETE_TODO', id: todo.id })}>
            删除
          </button>
        </li>
      ))}
    </ul>
  );
}
```

## 性能优化

### 1. React.memo 防止不必要的渲染

```jsx
// components/ExpensiveComponent.jsx
import React, { useContext, memo } from 'react';
import ThemeContext from '../contexts/ThemeContext';

const ExpensiveComponent = memo(function ExpensiveComponent() {
  const { theme } = useContext(ThemeContext);

  // 复杂的计算...
  console.log('ExpensiveComponent 渲染');

  return <div className={theme}>昂贵的组件</div>;
});

export default ExpensiveComponent;
```

### 2. 拆分 Context 避免过度渲染

```jsx
// ❌ 不好：所有数据在一个 Context
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('zh');

  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme, language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

// ✅ 好：按功能拆分 Context
const UserContext = createContext();
const ThemeContext = createContext();
const LanguageContext = createContext();
```

### 3. 使用选择器模式

```jsx
// contexts/AppContext.jsx
import { createContext, useContext, useRef, useSyncExternalStore } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const state = useRef({
    user: null,
    theme: 'light',
    language: 'zh',
  });

  const listeners = useRef(new Set());

  const subscribe = (listener) => {
    listeners.current.add(listener);
    return () => listeners.current.delete(listener);
  };

  const getSnapshot = () => state.current;

  const setState = (updates) => {
    state.current = { ...state.current, ...updates };
    listeners.current.forEach((listener) => listener());
  };

  const value = { subscribe, getSnapshot, setState };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// 自定义选择器 Hook
export function useAppSelector(selector) {
  const { subscribe, getSnapshot } = useContext(AppContext);
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot())
  );
}

// 使用
function UserDisplay() {
  const user = useAppSelector((state) => state.user);
  // 只有 user 变化时才重渲染
  return <div>{user?.name}</div>;
}
```

## Context vs Redux

| 特性 | Context API | Redux |
|------|------------|-------|
| 学习曲线 | 低 | 中高 |
| 样板代码 | 少 | 多 |
| DevTools | 无 | 有 |
| 中间件支持 | 无 | 有 |
| 时间旅行调试 | 无 | 有 |
| 适用场景 | 简单的状态共享 | 复杂的状态管理 |
| 性能优化 | 需要手动优化 | 内置优化 |
| 异步处理 | 需要自己处理 | 有中间件支持 |

**选择建议：**

- ✅ **使用 Context**：主题、语言、用户信息等简单全局状态
- ✅ **使用 Redux**：复杂的应用状态、需要时间旅行调试、大型应用

## 最佳实践

### 1. 为 Context 创建独立的文件

```
src/
├── contexts/
│   ├── ThemeContext.js
│   ├── UserContext.js
│   └── LanguageContext.js
```

### 2. 提供默认值

```javascript
// ✅ 推荐
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => console.warn('toggleTheme not implemented'),
});

// ❌ 不推荐
const ThemeContext = createContext();
```

### 3. 自定义 Hook 封装

```javascript
// ✅ 推荐
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// 使用
const { theme, toggleTheme } = useTheme();
```

### 4. 按功能拆分 Context

```javascript
// ✅ 推荐：每个 Context 负责单一功能
<ThemeProvider>
  <UserProvider>
    <App />
  </UserProvider>
</ThemeProvider>

// ❌ 不推荐：一个 Context 管理所有状态
<AppProvider>  {/* 包含 theme, user, language 等所有状态 */}
  <App />
</AppProvider>
```

### 5. 避免在渲染时创建新对象

```jsx
// ❌ 不推荐
<Context.Provider value={{ data, setData }}>

// ✅ 推荐
const value = useMemo(() => ({ data, setData }), [data]);
<Context.Provider value={value}>
```

## 常见问题

### Q1: Context 的性能问题？

**问题**：Context 值改变时，所有消费该 Context 的组件都会重新渲染。

**解决方案**：
1. 拆分 Context（状态和方法分离）
2. 使用 `React.memo` 优化组件
3. 使用 `useMemo` 缓存 Context 值

### Q2: 如何在类组件中使用多个 Context？

**答案**：使用 `Context.Consumer` 嵌套。

```jsx
<ThemeContext.Consumer>
  {theme => (
    <UserContext.Consumer>
      {user => (
        <div>
          <p>主题: {theme}</p>
          <p>用户: {user.name}</p>
        </div>
      )}
    </UserContext.Consumer>
  )}
</ThemeContext.Consumer>
```

### Q3: Context 可以替代 Redux 吗？

**答案**：对于简单的应用可以，但对于复杂应用，Redux 提供了更多功能：
- 更好的 DevTools 支持
- 中间件生态
- 时间旅行调试
- 更好的性能优化

## 总结

**Context API 的使用场景：**
- ✅ 主题切换
- ✅ 多语言国际化
- ✅ 用户认证信息
- ✅ 简单的全局状态
- ✅ 组件库的配置

**不适合 Context 的场景：**
- ❌ 频繁变化的数据
- ❌ 复杂的状态逻辑
- ❌ 需要时间旅行调试
- ❌ 大型应用的全局状态

**推荐组合：**
```
Context API (主题、语言、用户信息)
    +
Redux Toolkit (应用状态)
    +
React Query (服务端状态)
```

## 参考资源

- [React 官方文档 - Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React Context API 性能优化](https://github.com/facebook/react/issues/15156)
- [When to use Context vs Redux](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/)
