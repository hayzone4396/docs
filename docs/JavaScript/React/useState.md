# React useState 完全指南

`useState` 是 React Hooks 中最基础、最常用的 Hook，它让函数组件能够拥有自己的状态。

## 一、基本概念

### 语法

```javascript
const [state, setState] = useState(initialValue);
```

**参数**：
- `initialValue`：状态的初始值，可以是任意类型

**返回值**：
- 返回一个数组，包含两个元素：
  - `state`：当前状态值
  - `setState`：更新状态的函数

### 基础示例

```javascript
import { useState } from 'react';

function Counter() {
  // 声明一个名为 count 的状态变量，初始值为 0
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>点击我</button>
    </div>
  );
}
```

## 二、函数组件的渲染机制

### 重要概念

函数组件的**每一次渲染**（或者更新），都是把函数**重新执行**，产生一个全新的"私有上下文"。

```javascript
function MyComponent() {
  console.log('组件渲染了'); // 每次渲染都会打印

  const [count, setCount] = useState(0);

  // 每次渲染都会重新创建这个函数
  const handleClick = () => {
    console.log('点击');
  };

  return <button onClick={handleClick}>点击 {count}</button>;
}
```

**渲染时会发生什么？**

1. **内部代码重新执行**：
   - 所有的变量声明都会重新执行
   - 所有的函数都会重新定义

2. **函数需要重新构建**：
   - 这些函数的作用域（函数执行的上级上下文）是每一次执行产生的闭包
   - 每次渲染时的函数都是新的函数实例

3. **useState 重新执行**：
   - 虽然 `useState` 每次都会执行，但行为不同
   - 只有**第一次**设置初始值才会生效
   - 其后再执行，获取的状态都是**最新的状态**，而不是初始值
   - 返回的修改状态的方法，每一次都是返回一个**新的**

### 示例说明

```javascript
function Example() {
  console.log('Example 函数执行了');

  // 第一次渲染：count = 0
  // 第二次渲染：count = 1（不是 0）
  // 第三次渲染：count = 2（不是 0）
  const [count, setCount] = useState(0);

  console.log('当前 count:', count);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}

// 点击按钮后的控制台输出：
// Example 函数执行了
// 当前 count: 0
// （点击按钮）
// Example 函数执行了
// 当前 count: 1
// （再次点击）
// Example 函数执行了
// 当前 count: 2
```

## 三、useState 的性能优化机制

### 内置优化：Object.is 比较

`useState` **自带了性能优化机制**：

- 每一次修改状态的时候，会拿**最新要修改的值**和**之前的状态值**做比较
- 比较使用的是 `Object.is()` 方法
- 如果发现两次的值是一样的，则**不会修改状态**，也**不会让视图刷新**
- 可以理解为：类似于 `PureComponent`，在 `shouldComponentUpdate` 中做了浅比较和优化

### Object.is 比较规则

```javascript
// Object.is 的比较规则
Object.is(1, 1);           // true
Object.is('a', 'a');       // true
Object.is(true, true);     // true
Object.is(null, null);     // true
Object.is(undefined, undefined); // true

// 特殊情况
Object.is(NaN, NaN);       // true（不同于 === 的结果）
Object.is(+0, -0);         // false（不同于 === 的结果）

// 对象和数组：比较引用
Object.is({}, {});         // false（不同的引用）
Object.is([], []);         // false（不同的引用）

const obj = { a: 1 };
Object.is(obj, obj);       // true（相同的引用）
```

### 性能优化示例

```javascript
function OptimizedComponent() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: 'Alice', age: 25 });

  console.log('组件渲染了');

  return (
    <div>
      <h2>Count: {count}</h2>

      {/* ✅ 不会触发渲染：值相同 */}
      <button onClick={() => setCount(0)}>设置为 0</button>

      {/* ✅ 会触发渲染：值不同 */}
      <button onClick={() => setCount(1)}>设置为 1</button>

      {/* ❌ 会触发渲染：虽然内容相同，但是新对象（引用不同） */}
      <button
        onClick={() => setUser({ name: 'Alice', age: 25 })}
      >
        设置相同的 user
      </button>

      {/* ✅ 不会触发渲染：引用相同 */}
      <button onClick={() => setUser(user)}>
        设置为当前 user
      </button>
    </div>
  );
}
```

**关键点**：
- 基本类型（number、string、boolean）：比较值
- 引用类型（object、array）：比较引用地址

## 四、更新状态的两种方式

### 1. 直接传值

```javascript
function DirectUpdate() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1); // 直接传递新值
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>增加</button>
    </div>
  );
}
```

### 2. 函数式更新（推荐）

```javascript
function FunctionalUpdate() {
  const [count, setCount] = useState(0);

  const increment = () => {
    // 传递一个函数，参数是上一次的状态
    setCount((prevCount) => prevCount + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>增加</button>
    </div>
  );
}
```

### 两种方式的区别

```javascript
function Comparison() {
  const [count, setCount] = useState(0);

  // 方式 1：直接传值（可能有问题）
  const incrementMultipleTimes1 = () => {
    setCount(count + 1); // count = 0, 设置为 1
    setCount(count + 1); // count 仍然是 0, 设置为 1
    setCount(count + 1); // count 仍然是 0, 设置为 1
    // 最终 count = 1，而不是 3
  };

  // 方式 2：函数式更新（正确）
  const incrementMultipleTimes2 = () => {
    setCount((prev) => prev + 1); // prev = 0, 返回 1
    setCount((prev) => prev + 1); // prev = 1, 返回 2
    setCount((prev) => prev + 1); // prev = 2, 返回 3
    // 最终 count = 3
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={incrementMultipleTimes1}>方式1：+3?</button>
      <button onClick={incrementMultipleTimes2}>方式2：+3</button>
    </div>
  );
}
```

**建议**：
- ✅ 当新状态依赖于旧状态时，使用函数式更新
- ✅ 在 `useCallback` 中使用函数式更新，可以避免依赖项
- ⚠️ 直接传值适合新状态与旧状态无关的情况

## 五、初始值的设置

### 1. 直接传值

```javascript
function DirectValue() {
  // 简单值
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Alice');
  const [isActive, setIsActive] = useState(true);

  // 对象
  const [user, setUser] = useState({
    name: 'Alice',
    age: 25
  });

  // 数组
  const [items, setItems] = useState([1, 2, 3]);

  return <div>...</div>;
}
```

### 2. 惰性初始化（推荐用于昂贵的计算）

如果初始值需要复杂计算，可以传递一个函数：

```javascript
function LazyInitialization() {
  // ❌ 不好：每次渲染都会执行昂贵的计算
  const [data, setData] = useState(expensiveComputation());

  // ✅ 好：只在初始渲染时执行一次
  const [data2, setData2] = useState(() => {
    console.log('只执行一次');
    return expensiveComputation();
  });

  return <div>...</div>;
}

function expensiveComputation() {
  console.log('昂贵的计算...');
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += i;
  }
  return result;
}
```

### 3. 从 localStorage 读取初始值

```javascript
function LocalStorageExample() {
  // 使用惰性初始化从 localStorage 读取
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  // 更新时同步到 localStorage
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div>
      <p>当前主题: {theme}</p>
      <button onClick={() => updateTheme('light')}>浅色</button>
      <button onClick={() => updateTheme('dark')}>深色</button>
    </div>
  );
}
```

## 六、常见使用场景

### 场景 1：表单处理

```javascript
function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 清除该字段的错误
    setErrors((prev) => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 验证
    const newErrors = {};
    if (!formData.username) newErrors.username = '用户名不能为空';
    if (!formData.password) newErrors.password = '密码不能为空';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 提交表单
    console.log('提交:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="用户名"
        />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>

      <div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="密码"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
          />
          记住我
        </label>
      </div>

      <button type="submit">登录</button>
    </form>
  );
}
```

### 场景 2：列表管理

```javascript
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  // 添加待办事项
  const addTodo = () => {
    if (!input.trim()) return;

    setTodos((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: input,
        completed: false
      }
    ]);

    setInput('');
  };

  // 切换完成状态
  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 删除待办事项
  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // 编辑待办事项
  const editTodo = (id, newText) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo))
    );
  };

  return (
    <div>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加待办事项"
        />
        <button onClick={addTodo}>添加</button>
      </div>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none'
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 场景 3：计数器（带步长）

```javascript
function StepCounter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const increment = () => {
    setCount((prev) => prev + step);
  };

  const decrement = () => {
    setCount((prev) => prev - step);
  };

  const reset = () => {
    setCount(0);
  };

  return (
    <div>
      <h2>计数器</h2>
      <p>当前值: {count}</p>
      <p>步长: {step}</p>

      <div>
        <button onClick={decrement}>-{step}</button>
        <button onClick={increment}>+{step}</button>
        <button onClick={reset}>重置</button>
      </div>

      <div>
        <label>
          步长:
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            min="1"
          />
        </label>
      </div>
    </div>
  );
}
```

### 场景 4：模态框控制

```javascript
function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const openModal = (data) => {
    setModalData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalData(null);
  };

  return (
    <div>
      <button onClick={() => openModal({ title: '提示', content: '这是一个模态框' })}>
        打开模态框
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{modalData?.title}</h2>
            <p>{modalData?.content}</p>
            <button onClick={closeModal}>关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 场景 5：分页

```javascript
function Pagination({ data, itemsPerPage = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);

  // 计算总页数
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // 获取当前页的数据
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div>
      <ul>
        {getCurrentPageData().map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>

      <div className="pagination">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        >
          首页
        </button>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          上一页
        </button>

        <span>
          第 {currentPage} / {totalPages} 页
        </span>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          下一页
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          末页
        </button>
      </div>
    </div>
  );
}
```

## 七、常见错误

### 错误 1：直接修改状态

```javascript
// ❌ 错误：直接修改状态
function BadExample() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });

  const updateAge = () => {
    user.age = 26; // 直接修改！
    setUser(user); // 引用没变，不会触发更新
  };

  return <button onClick={updateAge}>增加年龄</button>;
}

// ✅ 正确：创建新对象
function GoodExample() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });

  const updateAge = () => {
    setUser({ ...user, age: 26 }); // 创建新对象
  };

  return <button onClick={updateAge}>增加年龄</button>;
}
```

### 错误 2：在事件处理中多次更新

```javascript
// ❌ 可能有问题：依赖闭包中的旧值
function BadExample() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    console.log(count); // 仍然是旧值！

    // 异步操作中
    setTimeout(() => {
      console.log(count); // 仍然是旧值！
      setCount(count + 1); // 基于旧值更新
    }, 1000);
  };

  return <button onClick={handleClick}>点击</button>;
}

// ✅ 正确：使用函数式更新
function GoodExample() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => {
      console.log('更新前:', prev);
      return prev + 1;
    });

    setTimeout(() => {
      setCount((prev) => prev + 1); // 基于最新值更新
    }, 1000);
  };

  return <button onClick={handleClick}>点击</button>;
}
```

### 错误 3：在循环或条件中使用 useState

```javascript
// ❌ 错误：在条件中使用
function BadExample({ shouldShowCount }) {
  if (shouldShowCount) {
    const [count, setCount] = useState(0); // 违反 Hooks 规则
  }

  return <div>...</div>;
}

// ✅ 正确：始终调用 useState
function GoodExample({ shouldShowCount }) {
  const [count, setCount] = useState(0);

  return <div>{shouldShowCount && <p>Count: {count}</p>}</div>;
}
```

### 错误 4：忘记状态更新是异步的

```javascript
function AsyncUpdateExample() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    console.log(count); // 仍然是旧值 0，而不是 1

    // 如果需要在更新后执行操作，使用 useEffect
  };

  // 使用 useEffect 监听状态变化
  useEffect(() => {
    console.log('count 更新了:', count);
  }, [count]);

  return <button onClick={handleClick}>点击</button>;
}
```

## 八、TypeScript 中的 useState

### 基本类型推断

```typescript
import { useState } from 'react';

function TypeScriptExample() {
  // TypeScript 会自动推断类型
  const [count, setCount] = useState(0); // number
  const [name, setName] = useState('Alice'); // string
  const [isActive, setIsActive] = useState(true); // boolean
}
```

### 显式类型注解

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function UserComponent() {
  // 显式指定类型
  const [user, setUser] = useState<User | null>(null);

  // 或者使用类型断言
  const [users, setUsers] = useState<User[]>([]);

  const loadUser = async () => {
    const response = await fetch('/api/user/1');
    const data: User = await response.json();
    setUser(data);
  };

  return (
    <div>
      {user ? (
        <div>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <button onClick={loadUser}>加载用户</button>
      )}
    </div>
  );
}
```

### 联合类型

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';

function FetchComponent() {
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setStatus('loading');

    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
      setStatus('success');
    } catch (err) {
      setError(err as Error);
      setStatus('error');
    }
  };

  return (
    <div>
      {status === 'loading' && <div>加载中...</div>}
      {status === 'error' && <div>错误: {error?.message}</div>}
      {status === 'success' && <div>数据: {JSON.stringify(data)}</div>}
      <button onClick={fetchData}>获取数据</button>
    </div>
  );
}
```

## 九、性能优化建议

### 1. 合并状态更新

```javascript
// ❌ 不好：多个独立的状态
function BadExample() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  // ...更多状态
}

// ✅ 好：合并相关的状态
function GoodExample() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: 0
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
}
```

### 2. 避免不必要的对象/数组创建

```javascript
// ❌ 不好：每次都创建新数组
function BadExample() {
  const [selected, setSelected] = useState([]);

  const handleClick = (id) => {
    setSelected([...selected, id]); // 创建新数组
  };
}

// ✅ 好：使用函数式更新
function GoodExample() {
  const [selected, setSelected] = useState([]);

  const handleClick = (id) => {
    setSelected((prev) => [...prev, id]);
  };
}
```

### 3. 使用 useReducer 管理复杂状态

当状态逻辑复杂时，考虑使用 `useReducer`：

```javascript
// 复杂的状态管理，考虑使用 useReducer
function ComplexStateExample() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <div>...</div>;
}
```

## 十、总结

### 核心要点

1. **渲染机制**：
   - 每次渲染都是函数重新执行
   - 产生新的闭包和上下文
   - `useState` 只在首次渲染时设置初始值

2. **性能优化**：
   - 内置 `Object.is` 比较
   - 值相同时不触发更新
   - 引用类型比较引用地址

3. **更新方式**：
   - 直接传值：适合新值不依赖旧值
   - 函数式更新：新值依赖旧值时使用（推荐）

4. **初始化**：
   - 直接传值：简单场景
   - 惰性初始化：昂贵计算时使用

### 最佳实践

- ✅ 使用函数式更新避免闭包陷阱
- ✅ 使用惰性初始化优化性能
- ✅ 合并相关的状态
- ✅ 不要直接修改状态对象
- ✅ 在 TypeScript 中明确指定类型

### 常见陷阱

- ❌ 直接修改状态对象/数组
- ❌ 在条件/循环中使用 useState
- ❌ 依赖闭包中的旧状态值
- ❌ 忘记状态更新是异步的

### 快速决策

```
需要状态管理？
├─ 简单状态（1-3个）
│   └─ 使用 useState ✅
│
├─ 复杂关联状态（5个以上）
│   └─ 考虑 useReducer
│
└─ 全局状态
    └─ 使用 Context 或状态管理库
```

`useState` 是 React 函数组件中最基础的状态管理工具，掌握它的工作原理和最佳实践，是写好 React 代码的基础。
