# React 自定义 Hooks 详解

自定义 Hooks 是 React 中复用组件逻辑的强大方式。通过自定义 Hooks，我们可以将组件逻辑提取到可复用的函数中，让代码更加简洁和易于维护。

## 一、什么是自定义 Hooks

### 概念

自定义 Hook 是一个函数，其名称以 `use` 开头，函数内部可以调用其他的 Hook（如 `useState`、`useEffect` 等）。

```javascript
// 自定义 Hook：以 use 开头
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
```

### 特点

- ✅ 可以抽取 `useState`、`useEffect` 等 Hooks 在外部使用
- ✅ 可以在多个组件中复用逻辑
- ✅ 比高阶组件和 render props 更简洁
- ✅ 更好的类型推断支持

## 二、使用规则

### 1. 命名必须以 `use` 开头

```javascript
// ✅ 正确：以 use 开头
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  // ...
  return size;
}

// ❌ 错误：不以 use 开头（虽然功能可以用，但不符合规范）
function getWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  // ...
  return size;
}
```

### 2. 必须在函数组件或其他自定义 Hook 中调用

```javascript
// ✅ 正确：在函数组件中使用
function MyComponent() {
  const { count, increment } = useCounter(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>增加</button>
    </div>
  );
}

// ✅ 正确：在其他自定义 Hook 中使用
function useDoubleCounter() {
  const { count, increment } = useCounter(0);
  const doubleCount = count * 2;

  return { doubleCount, increment };
}

// ❌ 错误：在普通函数中使用
function normalFunction() {
  const { count } = useCounter(0); // 违反 Hooks 规则
  return count;
}

// ❌ 错误：在类组件中使用
class MyClassComponent extends React.Component {
  render() {
    const { count } = useCounter(0); // 违反 Hooks 规则
    return <div>{count}</div>;
  }
}
```

### 3. 必须在组件的最外层调用

```javascript
// ✅ 正确：在组件最外层调用
function MyComponent() {
  const { count, increment } = useCounter(0);
  const [name, setName] = useState('');

  return <div>...</div>;
}

// ❌ 错误：在条件语句中调用
function MyComponent({ shouldUseCounter }) {
  if (shouldUseCounter) {
    const { count, increment } = useCounter(0); // 违反 Hooks 规则
  }

  return <div>...</div>;
}

// ❌ 错误：在循环中调用
function MyComponent() {
  const data = [1, 2, 3];

  data.forEach(() => {
    const { count } = useCounter(0); // 违反 Hooks 规则
  });

  return <div>...</div>;
}

// ❌ 错误：在回调函数中调用
function MyComponent() {
  const handleClick = () => {
    const { count } = useCounter(0); // 违反 Hooks 规则
  };

  return <button onClick={handleClick}>点击</button>;
}
```

### 4. 关于非 `use` 开头的命名

**重要说明**：如果函数不以 `use` 开头，它就是一个普通的工具函数，而不是自定义 Hook。

```javascript
// 普通工具函数：不以 use 开头
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// 可以在任何地方调用，不受 Hooks 规则限制
function MyComponent({ items }) {
  // ✅ 可以在组件中调用
  const total = calculateTotal(items);

  // ✅ 可以在条件语句中调用
  if (items.length > 0) {
    const total = calculateTotal(items);
  }

  // ✅ 可以在事件处理函数中调用
  const handleClick = () => {
    const total = calculateTotal(items);
    console.log(total);
  };

  return <div>Total: {total}</div>;
}
```

**关键区别**：

| 特性 | use 开头的自定义 Hook | 普通工具函数 |
|------|---------------------|------------|
| 可以调用其他 Hooks | ✅ 是 | ❌ 否 |
| 必须在最外层调用 | ✅ 是 | ❌ 否 |
| 可以在条件/循环中调用 | ❌ 否 | ✅ 是 |
| 可以在事件处理中调用 | ❌ 否 | ✅ 是 |
| React 会检查规则 | ✅ 是 | ❌ 否 |

## 三、基础示例

### 示例 1：计数器 Hook

```javascript
import { useState } from 'react';

// 自定义 Hook
function useCounter(initialValue = 0, step = 1) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((prev) => prev + step);
  const decrement = () => setCount((prev) => prev - step);
  const reset = () => setCount(initialValue);
  const setValue = (value) => setCount(value);

  return {
    count,
    increment,
    decrement,
    reset,
    setValue
  };
}

// 使用自定义 Hook
function CounterComponent() {
  const { count, increment, decrement, reset } = useCounter(0, 2);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+2</button>
      <button onClick={decrement}>-2</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}

export default CounterComponent;
```

### 示例 2：表单输入 Hook

```javascript
import { useState } from 'react';

function useInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const reset = () => {
    setValue(initialValue);
  };

  return {
    value,
    onChange: handleChange,
    reset
  };
}

// 使用
function LoginForm() {
  const username = useInput('');
  const password = useInput('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Username:', username.value);
    console.log('Password:', password.value);
    username.reset();
    password.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="用户名" {...username} />
      <input type="password" placeholder="密码" {...password} />
      <button type="submit">登录</button>
    </form>
  );
}
```

### 示例 3：Toggle Hook

```javascript
import { useState } from 'react';

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue((prev) => !prev);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return {
    value,
    toggle,
    setTrue,
    setFalse
  };
}

// 使用
function ModalComponent() {
  const modal = useToggle(false);
  const sidebar = useToggle(true);

  return (
    <div>
      <button onClick={modal.toggle}>
        {modal.value ? '关闭' : '打开'}模态框
      </button>

      {modal.value && (
        <div className="modal">
          <h2>模态框内容</h2>
          <button onClick={modal.setFalse}>关闭</button>
        </div>
      )}

      <button onClick={sidebar.toggle}>
        {sidebar.value ? '隐藏' : '显示'}侧边栏
      </button>
    </div>
  );
}
```

## 四、实战场景

### 场景 1：数据获取 Hook

```javascript
import { useState, useEffect } from 'react';

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]); // 当 url 变化时重新获取

  const refetch = async () => {
    setLoading(true);
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// 使用
function UserList() {
  const { data, loading, error, refetch } = useFetch(
    'https://api.example.com/users'
  );

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>刷新</button>
      <ul>
        {data?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 场景 2：本地存储 Hook

```javascript
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // 从 localStorage 读取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // 更新 localStorage
  const setValue = (value) => {
    try {
      // 支持函数式更新
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  // 删除 localStorage 项
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue, removeValue];
}

// 使用
function ThemeSelector() {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');

  return (
    <div>
      <p>当前主题: {theme}</p>
      <button onClick={() => setTheme('light')}>浅色</button>
      <button onClick={() => setTheme('dark')}>深色</button>
      <button onClick={removeTheme}>重置</button>
    </div>
  );
}
```

### 场景 3：防抖 Hook

```javascript
import { useState, useEffect } from 'react';

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 使用
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // 执行搜索
      console.log('搜索:', debouncedSearchTerm);
      // fetchSearchResults(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="输入搜索内容..."
    />
  );
}
```

### 场景 4：窗口尺寸 Hook

```javascript
import { useState, useEffect } from 'react';

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
}

// 使用
function ResponsiveComponent() {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>窗口宽度: {width}px</p>
      <p>窗口高度: {height}px</p>
      {width < 768 ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}
```

### 场景 5：鼠标位置 Hook

```javascript
import { useState, useEffect } from 'react';

function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return position;
}

// 使用
function MouseTracker() {
  const { x, y } = useMousePosition();

  return (
    <div>
      <h2>鼠标追踪器</h2>
      <p>X: {x}, Y: {y}</p>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: 'red',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
```

### 场景 6：定时器 Hook

```javascript
import { useEffect, useRef } from 'react';

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // 记住最新的 callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 设置定时器
  useEffect(() => {
    if (delay === null) return;

    const tick = () => {
      savedCallback.current();
    };

    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]);
}

// 使用
function Timer() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useInterval(
    () => {
      setCount(count + 1);
    },
    isRunning ? 1000 : null // 传 null 停止定时器
  );

  return (
    <div>
      <h2>计时器: {count}s</h2>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? '暂停' : '开始'}
      </button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}
```

### 场景 7：前一个值 Hook

```javascript
import { useRef, useEffect } from 'react';

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// 使用
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>当前值: {count}</p>
      <p>前一个值: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

## 五、组合多个自定义 Hooks

```javascript
// 自定义 Hook 1：表单验证
function useFormValidation(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues({ ...values, [name]: value });
  };

  const handleBlur = (name) => {
    setTouched({ ...touched, [name]: true });
    const validationErrors = validate(values);
    setErrors(validationErrors);
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur
  };
}

// 自定义 Hook 2：API 提交
function useFormSubmit(url) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('提交失败');

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, success, error };
}

// 组合使用多个 Hooks
function RegistrationForm() {
  // 使用表单验证 Hook
  const { values, errors, touched, handleChange, handleBlur } =
    useFormValidation(
      { username: '', email: '', password: '' },
      (values) => {
        const errors = {};
        if (!values.username) errors.username = '用户名不能为空';
        if (!values.email) errors.email = '邮箱不能为空';
        if (values.password.length < 6)
          errors.password = '密码至少6个字符';
        return errors;
      }
    );

  // 使用提交 Hook
  const { submit, loading, success, error } = useFormSubmit(
    '/api/register'
  );

  // 使用本地存储 Hook
  const [savedData, setSavedData] = useLocalStorage('draft', {});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(errors).length === 0) {
      submit(values);
      setSavedData({}); // 清空草稿
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={values.username}
        onChange={(e) => handleChange('username', e.target.value)}
        onBlur={() => handleBlur('username')}
      />
      {touched.username && errors.username && <span>{errors.username}</span>}

      <input
        name="email"
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
      />
      {touched.email && errors.email && <span>{errors.email}</span>}

      <input
        type="password"
        name="password"
        value={values.password}
        onChange={(e) => handleChange('password', e.target.value)}
        onBlur={() => handleBlur('password')}
      />
      {touched.password && errors.password && <span>{errors.password}</span>}

      <button type="submit" disabled={loading}>
        {loading ? '提交中...' : '注册'}
      </button>

      {success && <div>注册成功！</div>}
      {error && <div>错误: {error}</div>}
    </form>
  );
}
```

## 六、普通工具函数 vs 自定义 Hook

### 普通工具函数（不以 use 开头）

```javascript
// 普通工具函数：格式化日期
function formatDate(date) {
  return new Date(date).toLocaleDateString('zh-CN');
}

// 普通工具函数：计算总价
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// 普通工具函数：验证邮箱
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// 在组件中使用普通工具函数
function ShoppingCart({ items }) {
  // ✅ 可以在任何地方调用
  const total = calculateTotal(items);

  const handleCheckout = () => {
    // ✅ 可以在事件处理中调用
    const formattedTotal = formatTotal(total);
    console.log(formattedTotal);
  };

  return (
    <div>
      <h2>购物车</h2>
      {items.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          {/* ✅ 可以在 JSX 中调用 */}
          <span>{formatDate(item.addedAt)}</span>
        </div>
      ))}
      <p>总计: ¥{total}</p>
      <button onClick={handleCheckout}>结账</button>
    </div>
  );
}
```

### 自定义 Hook（以 use 开头）

```javascript
// 自定义 Hook：管理购物车状态
function useShoppingCart() {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    setItems((prev) => [...prev, { ...item, id: Date.now() }]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return { items, addItem, removeItem, total };
}

// 在组件中使用自定义 Hook
function ShoppingCartComponent() {
  // ❌ 必须在最外层调用
  const { items, addItem, removeItem, total } = useShoppingCart();

  // ❌ 不能在条件中调用
  // if (someCondition) {
  //   const cart = useShoppingCart(); // 错误！
  // }

  const handleAdd = () => {
    // ❌ 不能在事件处理中调用
    // const cart = useShoppingCart(); // 错误！

    // ✅ 应该调用 Hook 返回的函数
    addItem({ name: '商品', price: 100, quantity: 1 });
  };

  return (
    <div>
      <button onClick={handleAdd}>添加商品</button>
      <p>总计: ¥{total}</p>
    </div>
  );
}
```

### 对比总结

```javascript
// ========== 普通工具函数 ==========
// 特点：纯计算逻辑，无状态
function formatPrice(price) {
  return `¥${price.toFixed(2)}`;
}

// 使用：不受限制
function Component() {
  const price1 = formatPrice(100); // ✅ 组件顶层

  if (condition) {
    const price2 = formatPrice(200); // ✅ 条件语句中
  }

  const handleClick = () => {
    const price3 = formatPrice(300); // ✅ 事件处理中
  };

  return <div>{price1}</div>;
}

// ========== 自定义 Hook ==========
// 特点：包含状态逻辑，调用其他 Hooks
function usePrice(initialPrice) {
  const [price, setPrice] = useState(initialPrice);
  const formatted = `¥${price.toFixed(2)}`;

  return { price, setPrice, formatted };
}

// 使用：严格遵守 Hooks 规则
function Component() {
  const { price, setPrice, formatted } = usePrice(100); // ✅ 组件顶层

  // ❌ 以下都是错误的
  // if (condition) {
  //   const priceHook = usePrice(200); // 错误！
  // }

  // const handleClick = () => {
  //   const priceHook = usePrice(300); // 错误！
  // };

  return <div>{formatted}</div>;
}
```

## 七、TypeScript 中的自定义 Hooks

```typescript
import { useState, useEffect } from 'react';

// 定义返回类型
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 泛型自定义 Hook
function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: T = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}

// 使用
interface User {
  id: number;
  name: string;
  email: string;
}

function UserList() {
  const { data, loading, error, refetch } = useFetch<User[]>(
    'https://api.example.com/users'
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>刷新</button>
      <ul>
        {data?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 八、最佳实践

### 1. 单一职责原则

```javascript
// ❌ 不好：一个 Hook 做太多事
function useEverything() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  // 太复杂...
}

// ✅ 好：每个 Hook 职责单一
function useUser() {
  const [user, setUser] = useState(null);
  // 只处理用户相关逻辑
  return { user, setUser };
}

function useProducts() {
  const [products, setProducts] = useState([]);
  // 只处理产品相关逻辑
  return { products, setProducts };
}

function useCart() {
  const [cart, setCart] = useState([]);
  // 只处理购物车相关逻辑
  return { cart, setCart };
}
```

### 2. 返回对象而非数组（当返回值较多时）

```javascript
// ❌ 不好：返回数组，使用时需要记住顺序
function useUser() {
  return [user, loading, error, refetch];
}
const [user, loading, error, refetch] = useUser();

// ✅ 好：返回对象，更清晰
function useUser() {
  return { user, loading, error, refetch };
}
const { user, loading, error, refetch } = useUser();
```

### 3. 使用 useCallback 优化函数

```javascript
import { useState, useCallback } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  // 使用 useCallback 缓存函数
  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((prev) => prev - 1);
  }, []);

  return { count, increment, decrement };
}
```

### 4. 使用 useMemo 优化计算

```javascript
import { useState, useMemo } from 'react';

function useFilteredList(items, filter) {
  // 使用 useMemo 缓存计算结果
  const filteredItems = useMemo(() => {
    return items.filter((item) => item.includes(filter));
  }, [items, filter]);

  return filteredItems;
}
```

### 5. 处理清理逻辑

```javascript
import { useEffect } from 'react';

function useEventListener(eventName, handler, element = window) {
  useEffect(() => {
    // 确保元素支持 addEventListener
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    element.addEventListener(eventName, handler);

    // 清理函数
    return () => {
      element.removeEventListener(eventName, handler);
    };
  }, [eventName, handler, element]);
}
```

## 九、常见错误

### 错误 1：在条件语句中调用 Hook

```javascript
// ❌ 错误
function Component({ shouldFetch }) {
  if (shouldFetch) {
    const { data } = useFetch('/api/data'); // 违反 Hooks 规则
  }
}

// ✅ 正确
function Component({ shouldFetch }) {
  const { data } = useFetch(shouldFetch ? '/api/data' : null);
}
```

### 错误 2：在循环中调用 Hook

```javascript
// ❌ 错误
function Component({ items }) {
  return items.map((item) => {
    const [selected, setSelected] = useState(false); // 违反 Hooks 规则
    return <div>{item}</div>;
  });
}

// ✅ 正确：提取为单独的组件
function Item({ item }) {
  const [selected, setSelected] = useState(false);
  return <div>{item}</div>;
}

function Component({ items }) {
  return items.map((item) => <Item key={item.id} item={item} />);
}
```

### 错误 3：在普通函数中调用 Hook

```javascript
// ❌ 错误
function fetchUser() {
  const [user, setUser] = useState(null); // 违反 Hooks 规则
  return user;
}

// ✅ 正确：改为自定义 Hook
function useUser() {
  const [user, setUser] = useState(null);
  return user;
}
```

## 十、总结

### 核心要点

1. **命名规范**：自定义 Hook 必须以 `use` 开头
2. **调用位置**：只能在函数组件或其他自定义 Hook 的顶层调用
3. **调用顺序**：每次渲染时 Hooks 的调用顺序必须相同
4. **逻辑复用**：自定义 Hooks 是复用状态逻辑的最佳方式
5. **工具函数 vs Hook**：不包含状态的纯函数不需要 `use` 前缀

### 何时使用自定义 Hook？

**✅ 适合使用**：
- 需要在多个组件中复用状态逻辑
- 组件逻辑过于复杂，需要拆分
- 需要封装副作用（如订阅、定时器）
- 需要组合多个内置 Hooks

**❌ 不适合使用**：
- 纯计算逻辑（使用普通函数即可）
- 只在一个组件中使用的逻辑
- 简单的状态管理（直接用 useState）

### 快速决策

```
需要复用逻辑？
├─ 包含状态或副作用
│   └─ 使用自定义 Hook（use 开头）✅
│       ├─ 可调用其他 Hooks
│       ├─ 必须在组件顶层调用
│       └─ 不能在条件/循环中调用
│
└─ 纯计算逻辑
    └─ 使用普通工具函数 ✅
        ├─ 不能调用 Hooks
        ├─ 可在任何地方调用
        └─ 可在条件/循环/事件中调用
```

自定义 Hooks 是 React 中最强大的逻辑复用方式，掌握它能让你的代码更加简洁、可维护和易于测试。
