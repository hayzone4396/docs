# React useReducer：复杂状态管理方案

`useReducer` 是 React 提供的一个状态管理 Hook，它是 `useState` 的升级版本，特别适合处理复杂的状态逻辑。

## 一、useState vs useReducer

### useState 适用场景

适合**简单的、独立的**状态管理：

```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

### useReducer 适用场景

适合**复杂的、关联的**状态管理：

- ✅ 组件逻辑很复杂
- ✅ 需要大量的状态
- ✅ 需要大量修改状态的逻辑
- ✅ 状态之间存在关联
- ✅ 下一个状态依赖于之前的状态

```javascript
import { useReducer } from 'react';

// 复杂的表单状态管理
function ComplexForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  // 统一的状态更新方式
  return (
    <form>
      <input
        value={state.username}
        onChange={(e) => dispatch({ type: 'SET_USERNAME', payload: e.target.value })}
      />
      <input
        value={state.email}
        onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: e.target.value })}
      />
      {/* 更多表单字段... */}
    </form>
  );
}
```

## 二、基本用法

### 语法结构

```javascript
const [state, dispatch] = useReducer(reducer, initialState, init);
```

**参数**：
- `reducer`：状态更新的逻辑函数 `(state, action) => newState`
- `initialState`：初始状态值
- `init`：（可选）初始化函数，用于延迟初始化

**返回值**：
- `state`：当前状态
- `dispatch`：派发 action 的函数

### 简单示例

```javascript
import { useReducer } from 'react';

// 1. 定义初始状态
const initialState = { num: 0 };

// 2. 定义 reducer 函数
const reducer = function reducer(state, action) {
  // 创建新的状态对象（不直接修改原状态）
  switch (action.type) {
    case 'plus':
      return { ...state, num: state.num + 1 };
    case 'minus':
      return { ...state, num: state.num - 1 };
    case 'reset':
      return initialState;
    default:
      return state;
  }
};

// 3. 在组件中使用
const Demo = function Demo() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <span>当前值: {state.num}</span>
      <button onClick={() => dispatch({ type: 'plus' })}>增加</button>
      <button onClick={() => dispatch({ type: 'minus' })}>减少</button>
      <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
    </div>
  );
};

export default Demo;
```

### ⚠️ 常见错误

```javascript
// ❌ 错误：直接修改原状态
const reducer = (state, action) => {
  state.num++; // 不要这样做！
  return state; // React 检测不到变化
};

// ✅ 正确：返回新的状态对象
const reducer = (state, action) => {
  return { ...state, num: state.num + 1 };
};
```

## 三、进阶用法

### 1. 带 payload 的 action

```javascript
const initialState = {
  count: 0,
  step: 1
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    case 'reset':
      return initialState;
    default:
      return state;
  }
};

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <p>Step: {state.step}</p>

      <button onClick={() => dispatch({ type: 'increment' })}>
        增加 {state.step}
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        减少 {state.step}
      </button>

      <input
        type="number"
        value={state.step}
        onChange={(e) =>
          dispatch({ type: 'setStep', payload: Number(e.target.value) })
        }
      />

      <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
    </div>
  );
}
```

### 2. 复杂表单管理

```javascript
const initialFormState = {
  username: '',
  email: '',
  password: '',
  age: 0,
  agreed: false,
  errors: {},
  isSubmitting: false
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: '' } // 清除错误
      };

    case 'SET_ERRORS':
      return { ...state, errors: action.payload };

    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };

    case 'RESET_FORM':
      return initialFormState;

    default:
      return state;
  }
};

function RegistrationForm() {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  const handleChange = (field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 验证
    const errors = validateForm(state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: errors });
      return;
    }

    // 提交
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    try {
      await submitForm(state);
      dispatch({ type: 'RESET_FORM' });
    } catch (error) {
      dispatch({ type: 'SET_ERRORS', payload: { submit: error.message } });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={state.username}
        onChange={(e) => handleChange('username', e.target.value)}
        placeholder="用户名"
      />
      {state.errors.username && <span>{state.errors.username}</span>}

      <input
        type="email"
        value={state.email}
        onChange={(e) => handleChange('email', e.target.value)}
        placeholder="邮箱"
      />
      {state.errors.email && <span>{state.errors.email}</span>}

      <input
        type="password"
        value={state.password}
        onChange={(e) => handleChange('password', e.target.value)}
        placeholder="密码"
      />
      {state.errors.password && <span>{state.errors.password}</span>}

      <label>
        <input
          type="checkbox"
          checked={state.agreed}
          onChange={(e) => handleChange('agreed', e.target.checked)}
        />
        同意条款
      </label>

      <button type="submit" disabled={state.isSubmitting}>
        {state.isSubmitting ? '提交中...' : '注册'}
      </button>
    </form>
  );
}
```

### 3. 延迟初始化

使用第三个参数 `init` 进行延迟初始化，可以避免在每次渲染时都执行昂贵的计算：

```javascript
// 初始化函数
const init = (initialCount) => {
  // 从 localStorage 读取或执行复杂计算
  const savedCount = localStorage.getItem('count');
  return {
    count: savedCount ? Number(savedCount) : initialCount,
    history: []
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      const newState = {
        count: state.count + 1,
        history: [...state.history, state.count]
      };
      localStorage.setItem('count', newState.count);
      return newState;
    case 'reset':
      localStorage.removeItem('count');
      return init(action.payload);
    default:
      return state;
  }
};

function Counter() {
  // 第三个参数是初始化函数
  const [state, dispatch] = useReducer(reducer, 0, init);

  return (
    <div>
      <p>Count: {state.count}</p>
      <p>History: {state.history.join(', ')}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>增加</button>
      <button onClick={() => dispatch({ type: 'reset', payload: 0 })}>
        重置
      </button>
    </div>
  );
}
```

## 四、实战场景

### 场景 1：购物车管理

```javascript
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingIndex >= 0) {
        // 商品已存在，增加数量
        const newItems = [...state.items];
        newItems[existingIndex].quantity += 1;
        return { ...state, items: newItems };
      } else {
        // 新商品
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }]
        };
      }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'APPLY_COUPON':
      return { ...state, coupon: action.payload };

    default:
      return state;
  }
};

function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    coupon: null
  });

  const total = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discount = state.coupon ? total * state.coupon.discount : 0;
  const finalTotal = total - discount;

  return (
    <div>
      <h2>购物车</h2>
      {state.items.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>¥{item.price}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_QUANTITY',
                payload: { id: item.id, quantity: Number(e.target.value) }
              })
            }
          />
          <button
            onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
          >
            删除
          </button>
        </div>
      ))}

      <div>
        <p>小计: ¥{total}</p>
        {state.coupon && <p>优惠: -¥{discount}</p>}
        <p>总计: ¥{finalTotal}</p>
      </div>

      <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>清空购物车</button>
    </div>
  );
}
```

### 场景 2：异步数据获取

```javascript
const dataReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case 'RESET':
      return { loading: false, data: null, error: null };

    default:
      return state;
  }
};

function UserList() {
  const [state, dispatch] = useReducer(dataReducer, {
    loading: false,
    data: null,
    error: null
  });

  useEffect(() => {
    const fetchUsers = async () => {
      dispatch({ type: 'FETCH_START' });

      try {
        const response = await fetch('https://api.example.com/users');
        const data = await response.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: error.message });
      }
    };

    fetchUsers();
  }, []);

  if (state.loading) return <div>加载中...</div>;
  if (state.error) return <div>错误: {state.error}</div>;
  if (!state.data) return null;

  return (
    <ul>
      {state.data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 场景 3：多步骤表单向导

```javascript
const wizardReducer = (state, action) => {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1 };

    case 'PREV_STEP':
      return { ...state, currentStep: state.currentStep - 1 };

    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };

    case 'UPDATE_STEP_DATA':
      return {
        ...state,
        stepData: {
          ...state.stepData,
          [state.currentStep]: action.payload
        }
      };

    case 'RESET_WIZARD':
      return {
        currentStep: 1,
        stepData: {},
        completed: false
      };

    case 'COMPLETE':
      return { ...state, completed: true };

    default:
      return state;
  }
};

function MultiStepWizard() {
  const [state, dispatch] = useReducer(wizardReducer, {
    currentStep: 1,
    stepData: {},
    completed: false
  });

  const handleNext = (data) => {
    dispatch({ type: 'UPDATE_STEP_DATA', payload: data });
    dispatch({ type: 'NEXT_STEP' });
  };

  const handleSubmit = async (data) => {
    dispatch({ type: 'UPDATE_STEP_DATA', payload: data });

    // 收集所有步骤的数据
    const allData = { ...state.stepData, [state.currentStep]: data };

    try {
      await submitWizard(allData);
      dispatch({ type: 'COMPLETE' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div>步骤 {state.currentStep} / 3</div>

      {state.currentStep === 1 && (
        <Step1 onNext={handleNext} initialData={state.stepData[1]} />
      )}
      {state.currentStep === 2 && (
        <Step2
          onNext={handleNext}
          onPrev={() => dispatch({ type: 'PREV_STEP' })}
          initialData={state.stepData[2]}
        />
      )}
      {state.currentStep === 3 && (
        <Step3
          onSubmit={handleSubmit}
          onPrev={() => dispatch({ type: 'PREV_STEP' })}
          initialData={state.stepData[3]}
        />
      )}

      {state.completed && <div>✅ 提交成功！</div>}
    </div>
  );
}
```

## 五、最佳实践

### 1. 使用 TypeScript 增强类型安全

```typescript
// 定义状态类型
interface CounterState {
  count: number;
  step: number;
}

// 定义 Action 类型
type CounterAction =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; payload: number }
  | { type: 'reset' };

// Reducer 函数
const reducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    case 'reset':
      return { count: 0, step: 1 };
  }
};

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
  // TypeScript 会检查 dispatch 的参数类型
}
```

### 2. 拆分大型 Reducer

```javascript
// 将大型 reducer 拆分成多个小 reducer
const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    case 'CLEAR_USER':
      return null;
    default:
      return state;
  }
};

const settingsReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    default:
      return state;
  }
};

// 组合 reducer
const rootReducer = (state, action) => {
  return {
    user: userReducer(state.user, action),
    settings: settingsReducer(state.settings, action)
  };
};

function App() {
  const [state, dispatch] = useReducer(rootReducer, {
    user: null,
    settings: { theme: 'light', language: 'zh' }
  });
}
```

### 3. 使用常量定义 Action Types

```javascript
// constants.js
export const ACTION_TYPES = {
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET'
};

// reducer.js
import { ACTION_TYPES } from './constants';

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.INCREMENT:
      return { count: state.count + 1 };
    case ACTION_TYPES.DECREMENT:
      return { count: state.count - 1 };
    case ACTION_TYPES.RESET:
      return { count: 0 };
    default:
      return state;
  }
};

// component.js
import { ACTION_TYPES } from './constants';

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <button onClick={() => dispatch({ type: ACTION_TYPES.INCREMENT })}>
      增加
    </button>
  );
}
```

### 4. 封装 Action Creators

```javascript
// 创建 action creators
const actions = {
  increment: () => ({ type: 'INCREMENT' }),
  decrement: () => ({ type: 'DECREMENT' }),
  setStep: (step) => ({ type: 'SET_STEP', payload: step }),
  reset: () => ({ type: 'RESET' })
};

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <button onClick={() => dispatch(actions.increment())}>增加</button>
      <button onClick={() => dispatch(actions.decrement())}>减少</button>
      <button onClick={() => dispatch(actions.reset())}>重置</button>
    </div>
  );
}
```

## 六、useReducer vs Redux

| 特性 | useReducer | Redux |
|------|-----------|-------|
| 适用范围 | 单个组件或小型应用 | 大型应用 |
| 状态共享 | 需要配合 Context | 全局状态管理 |
| 中间件 | 无 | 支持 |
| DevTools | 无 | 强大的调试工具 |
| 学习曲线 | 低 | 高 |
| 包体积 | 内置，无额外依赖 | 需要安装额外包 |

### useReducer + Context 实现简单的全局状态

```javascript
// store.js
import { createContext, useContext, useReducer } from 'react';

const StoreContext = createContext();

const initialState = {
  user: null,
  theme: 'light'
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
    default:
      return state;
  }
};

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}

// App.js
import { StoreProvider } from './store';

function App() {
  return (
    <StoreProvider>
      <Header />
      <Main />
    </StoreProvider>
  );
}

// Header.js
import { useStore } from './store';

function Header() {
  const { state, dispatch } = useStore();

  return (
    <header>
      <span>当前主题: {state.theme}</span>
      <button onClick={() => dispatch({ type: 'TOGGLE_THEME' })}>
        切换主题
      </button>
    </header>
  );
}
```

## 七、性能优化

### 1. 使用 useMemo 优化计算

```javascript
import { useReducer, useMemo } from 'react';

function TodoList() {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // 避免每次渲染都重新计算
  const completedCount = useMemo(() => {
    return state.todos.filter((todo) => todo.completed).length;
  }, [state.todos]);

  const activeCount = useMemo(() => {
    return state.todos.filter((todo) => !todo.completed).length;
  }, [state.todos]);

  return (
    <div>
      <p>已完成: {completedCount}</p>
      <p>未完成: {activeCount}</p>
    </div>
  );
}
```

### 2. 使用 useCallback 缓存 dispatch 函数

```javascript
import { useReducer, useCallback } from 'react';

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // 缓存 dispatch 函数
  const addTodo = useCallback((text) => {
    dispatch({ type: 'ADD_TODO', payload: { text, id: Date.now() } });
  }, []);

  const toggleTodo = useCallback((id) => {
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  }, []);

  return <TodoList todos={state.todos} onAdd={addTodo} onToggle={toggleTodo} />;
}
```

## 八、总结

### 何时使用 useReducer？

**✅ 推荐使用**：
- 状态逻辑复杂，涉及多个子值
- 下一个 state 依赖于之前的 state
- 需要触发深层组件更新
- 想要更好的可测试性
- 状态更新逻辑需要复用

**❌ 不推荐使用**：
- 简单的状态管理（直接用 useState）
- 只有一个简单的状态值
- 状态更新逻辑很简单

### 核心要点

1. **不要直接修改 state**，始终返回新对象
2. **合理组织 action types**，使用常量或 TypeScript
3. **拆分大型 reducer**，保持单一职责
4. **配合 Context 使用**可实现轻量级全局状态管理
5. **注意性能优化**，使用 useMemo 和 useCallback

### 快速决策

```
状态管理需求
├─ 简单状态（1-2 个独立状态）
│   └─ 使用 useState ✅
│
└─ 复杂状态（多个关联状态）
    ├─ 单组件内使用
    │   └─ 使用 useReducer ✅
    │
    └─ 需要全局共享
        ├─ 小型应用
        │   └─ useReducer + Context ✅
        │
        └─ 大型应用
            └─ Redux / Zustand 等状态管理库 ✅
```
