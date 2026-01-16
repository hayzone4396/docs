# React useCallback 与 useMemo 性能优化

`useCallback` 和 `useMemo` 是 React 提供的两个性能优化 Hooks，它们可以帮助我们避免不必要的重新渲染和计算。

## 一、useCallback：缓存函数引用

### 基本语法

```javascript
const memoizedCallback = useCallback(callback, [dependencies]);
```

**参数**：
- `callback`：需要缓存的函数
- `dependencies`：依赖项数组

**返回值**：
- 返回缓存的函数引用

### 工作原理

1. **组件第一次渲染**：
   - `useCallback` 执行，创建一个函数 `callback`，赋值给 `memoizedCallback`

2. **组件后续每一次更新**：
   - 判断依赖的状态值是否改变
   - **如果改变**：重新创建新的函数，赋值给 `memoizedCallback`
   - **如果未改变**（或没有设置依赖 `[]`）：`memoizedCallback` 获取的一直是第一次创建的函数，不会创建新的函数

3. **核心作用**：
   - 基于 `useCallback`，可以始终获取第一次创建的函数堆内存地址（函数的引用）
   - 简单来讲：`useCallback` 可以保证，函数组件的每一次更新，不再把里面的小函数重新创建，用的都是第一次的

### 基础示例

```javascript
import { useState, useCallback } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ❌ 没有使用 useCallback：每次渲染都会创建新函数
  const handleClick1 = () => {
    console.log('Clicked');
  };

  // ✅ 使用 useCallback：只在依赖变化时创建新函数
  const handleClick2 = useCallback(() => {
    console.log('Clicked');
  }, []); // 空依赖数组，函数永远不会重新创建

  // 使用带依赖的 useCallback
  const handleIncrement = useCallback(() => {
    setCount(count + 1);
  }, [count]); // count 变化时，函数会重新创建

  return (
    <div>
      <p>Count: {count}</p>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleClick2}>点击</button>
    </div>
  );
}
```

### 为什么需要 useCallback？

在 JavaScript 中，每次函数组件重新渲染时，内部定义的函数都会重新创建：

```javascript
function Component() {
  // 每次渲染，handleClick 都是一个新的函数引用
  const handleClick = () => {
    console.log('clicked');
  };

  // handleClick === 上次渲染的 handleClick ? false
  return <button onClick={handleClick}>点击</button>;
}
```

这在大多数情况下没问题，但当：
- 函数作为 props 传递给子组件
- 子组件使用了 `React.memo` 或 `PureComponent`
- 函数作为 `useEffect` 等 Hook 的依赖

就可能导致不必要的重新渲染。

## 二、useCallback 使用场景

### 场景 1：父子组件优化（最常见）

父组件嵌套子组件，父组件要把一个内部的函数，基于属性传递给子组件，此时传递的这个方法，要用 `useCallback` 处理一下会更好。

#### 完整示例

```javascript
import { useState, useCallback, memo } from 'react';

// 子组件：类组件形式
class ChildClass extends React.PureComponent {
  render() {
    console.log('ChildClass 渲染了');
    const { handle } = this.props;

    return (
      <div>
        <h3>子组件（类组件）</h3>
        <button onClick={handle}>执行父组件的函数</button>
      </div>
    );
  }
}

// 子组件：函数组件形式
const ChildFunction = memo(function Child(props) {
  console.log('ChildFunction 渲染了');
  const { handle } = props;

  return (
    <div>
      <h3>子组件（函数组件）</h3>
      <button onClick={handle}>执行父组件的函数</button>
    </div>
  );
});

// 父组件
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ❌ 没有 useCallback：每次父组件更新，子组件也会更新
  const handleWithoutCallback = () => {
    console.log('执行了');
  };

  // ✅ 使用 useCallback：父组件更新时，子组件不会更新
  const handleWithCallback = useCallback(() => {
    console.log('执行了');
  }, []);

  return (
    <div>
      <h2>父组件</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入文字触发父组件更新"
      />

      {/* 使用 useCallback 优化 */}
      <ChildClass handle={handleWithCallback} />
      <ChildFunction handle={handleWithCallback} />
    </div>
  );
}

export default ParentComponent;
```

**优化要点**：
1. **第一条**：传递给子组件的属性（函数），每一次需要是相同的堆内存地址（是一致的），基于 `useCallback` 处理
2. **第二条**：在子组件内部也要做处理：
   - 类组件：继承 `React.PureComponent`（在 `shouldComponentUpdate` 中对新老属性做了浅比较）
   - 函数组件：使用 `React.memo` 包裹（对新老传递的属性做比较，如果不一致才会执行函数组件）

### 场景 2：配合 useEffect 使用

```javascript
import { useState, useCallback, useEffect } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // ❌ 没有 useCallback：每次渲染都会触发 useEffect
  const fetchResults = async () => {
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    setResults(data);
  };

  // ✅ 使用 useCallback：只在 query 变化时重新创建函数
  const fetchResultsMemo = useCallback(async () => {
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    setResults(data);
  }, [query]);

  useEffect(() => {
    if (query) {
      fetchResultsMemo();
    }
  }, [fetchResultsMemo]); // fetchResultsMemo 是依赖

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 场景 3：事件处理函数依赖某些状态

```javascript
import { useState, useCallback } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');

  // 删除待办事项
  const handleDelete = useCallback(
    (id) => {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    },
    [] // 使用函数式更新，不依赖 todos
  );

  // 切换完成状态
  const handleToggle = useCallback(
    (id) => {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    },
    []
  );

  // 过滤待办事项（依赖 filter）
  const getFilteredTodos = useCallback(() => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const filteredTodos = getFilteredTodos();

  return (
    <div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">全部</option>
        <option value="active">未完成</option>
        <option value="completed">已完成</option>
      </select>

      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => handleDelete(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 三、useCallback 注意事项

### 1. 不要滥用 useCallback

`useCallback` 不是银弹，不要在所有函数上都使用。

```javascript
// ❌ 不好：过度使用
function Component() {
  const [count, setCount] = useState(0);

  // 这个函数不需要 useCallback
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  // 这个也不需要
  const handleChange = useCallback((e) => {
    console.log(e.target.value);
  }, []);

  return <div>...</div>;
}

// ✅ 好：只在必要时使用
function Component() {
  const [count, setCount] = useState(0);

  // 普通函数，不传递给子组件，不需要缓存
  const handleClick = () => {
    console.log('clicked');
  };

  return <div>...</div>;
}
```

**何时需要 useCallback？**
- ✅ 函数作为 props 传递给使用了 `React.memo` 的子组件
- ✅ 函数作为 `useEffect`、`useMemo` 等的依赖
- ✅ 函数创建成本高（比如包含复杂计算）
- ❌ 简单的事件处理函数，不传递给子组件
- ❌ 函数内部没有引用任何状态或 props

### 2. useCallback 本身也有成本

虽然 `useCallback` 减少了堆内存的开辟，但它本身也有处理逻辑和缓存机制，也会消耗时间。

```javascript
// useCallback 的成本
const memoized = useCallback(fn, deps);

// 包括：
// 1. 创建依赖数组
// 2. 每次渲染时比较依赖
// 3. 维护缓存
```

**性能权衡**：
- 如果子组件很简单，重新渲染的成本很低，可能不值得使用 `useCallback`
- 如果子组件很复杂，重新渲染成本高，使用 `useCallback` 才有明显收益

### 3. 依赖数组要完整

```javascript
// ❌ 错误：缺少依赖
function Component() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);

  const calculate = useCallback(() => {
    return count * multiplier; // 使用了 count 和 multiplier
  }, []); // 但依赖数组是空的！

  // calculate 永远返回 0 * 2 = 0
}

// ✅ 正确：包含所有依赖
function Component() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);

  const calculate = useCallback(() => {
    return count * multiplier;
  }, [count, multiplier]); // 正确的依赖
}
```

## 四、useMemo：缓存计算结果

### 基本语法

```javascript
const memoizedValue = useMemo(callback, [dependencies]);
```

**参数**：
- `callback`：返回计算结果的函数
- `dependencies`：依赖项数组

**返回值**：
- 返回缓存的计算结果

### 工作原理

1. **第一次渲染组件**：
   - `callback` 会执行

2. **后期更新**：
   - 只有依赖的状态值发生改变，`callback` 才会再执行

3. **计算缓存**：
   - 每一次会把 `callback` 执行的返回结果赋值给 `memoizedValue`
   - 所以 `callback` 一定要有 `return`
   - 在依赖的状态值没有发生改变时，`memoizedValue` 获取的是上一次计算出来的结果
   - 和 Vue 中的计算属性非常类似

### 基础示例

```javascript
import { useState, useMemo } from 'react';

function VoteComponent() {
  const [supNum, setSupNum] = useState(10);
  const [oppNum, setOppNum] = useState(5);
  const [otherState, setOtherState] = useState(0);

  // ❌ 没有 useMemo：每次渲染都会重新计算
  const ratio1 = () => {
    console.log('计算比例...');
    const total = supNum + oppNum;
    let ratio = '--';
    if (total > 0) {
      ratio = ((supNum / total) * 100).toFixed(2) + '%';
    }
    return ratio;
  };

  // ✅ 使用 useMemo：只在 supNum 或 oppNum 变化时计算
  const ratio2 = useMemo(() => {
    console.log('计算比例...');
    const total = supNum + oppNum;
    let ratio = '--';
    if (total > 0) {
      ratio = ((supNum / total) * 100).toFixed(2) + '%';
    }
    return ratio; // 必须有 return
  }, [supNum, oppNum]);

  return (
    <div>
      <h2>投票</h2>
      <p>支持: {supNum}</p>
      <p>反对: {oppNum}</p>
      <p>支持率: {ratio2}</p>

      <button onClick={() => setSupNum(supNum + 1)}>支持 +1</button>
      <button onClick={() => setOppNum(oppNum + 1)}>反对 +1</button>
      <button onClick={() => setOtherState(otherState + 1)}>
        其他状态 +1（不会触发比例重新计算）
      </button>
    </div>
  );
}
```

## 五、useMemo 使用场景

### 场景 1：昂贵的计算

```javascript
import { useState, useMemo } from 'react';

function DataTable({ data }) {
  const [sortColumn, setSortColumn] = useState('name');
  const [filterText, setFilterText] = useState('');

  // 昂贵的计算：过滤和排序大量数据
  const processedData = useMemo(() => {
    console.log('处理数据...');

    // 1. 过滤
    let filtered = data.filter((item) =>
      item.name.toLowerCase().includes(filterText.toLowerCase())
    );

    // 2. 排序
    filtered.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return -1;
      if (a[sortColumn] > b[sortColumn]) return 1;
      return 0;
    });

    return filtered;
  }, [data, sortColumn, filterText]);

  return (
    <div>
      <input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="搜索..."
      />

      <select value={sortColumn} onChange={(e) => setSortColumn(e.target.value)}>
        <option value="name">按名称排序</option>
        <option value="age">按年龄排序</option>
      </select>

      <table>
        <tbody>
          {processedData.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 场景 2：避免子组件不必要的渲染

```javascript
import { useState, useMemo, memo } from 'react';

// 子组件
const ExpensiveList = memo(({ items }) => {
  console.log('ExpensiveList 渲染');

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

// 父组件
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [filterText, setFilterText] = useState('');

  const allItems = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ];

  // ❌ 没有 useMemo：每次父组件更新，都会创建新数组，导致子组件重新渲染
  const filteredItems1 = allItems.filter((item) =>
    item.name.includes(filterText)
  );

  // ✅ 使用 useMemo：只在 filterText 变化时创建新数组
  const filteredItems2 = useMemo(
    () => allItems.filter((item) => item.name.includes(filterText)),
    [filterText]
  );

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加 count</button>

      <input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="过滤..."
      />

      <ExpensiveList items={filteredItems2} />
    </div>
  );
}
```

### 场景 3：复杂的派生状态

```javascript
import { useState, useMemo } from 'react';

function ShoppingCart() {
  const [items, setItems] = useState([
    { id: 1, name: '商品1', price: 100, quantity: 2 },
    { id: 2, name: '商品2', price: 200, quantity: 1 },
    { id: 3, name: '商品3', price: 50, quantity: 3 }
  ]);
  const [coupon, setCoupon] = useState(0);

  // 计算小计
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // 计算折扣
  const discount = useMemo(() => {
    return subtotal * coupon;
  }, [subtotal, coupon]);

  // 计算运费
  const shipping = useMemo(() => {
    return subtotal > 500 ? 0 : 20;
  }, [subtotal]);

  // 计算总计
  const total = useMemo(() => {
    return subtotal - discount + shipping;
  }, [subtotal, discount, shipping]);

  return (
    <div>
      <h2>购物车</h2>
      {items.map((item) => (
        <div key={item.id}>
          {item.name} - ¥{item.price} x {item.quantity}
        </div>
      ))}

      <div>
        <p>小计: ¥{subtotal}</p>
        <p>折扣: -¥{discount}</p>
        <p>运费: ¥{shipping}</p>
        <h3>总计: ¥{total}</h3>
      </div>

      <select value={coupon} onChange={(e) => setCoupon(Number(e.target.value))}>
        <option value={0}>无优惠</option>
        <option value={0.1}>9折</option>
        <option value={0.2}>8折</option>
      </select>
    </div>
  );
}
```

### 场景 4：缓存组件实例

```javascript
import { useState, useMemo } from 'react';

function TabsComponent() {
  const [activeTab, setActiveTab] = useState('tab1');

  // 缓存 Tab 内容组件
  const tab1Content = useMemo(() => <ExpensiveTab1Component />, []);
  const tab2Content = useMemo(() => <ExpensiveTab2Component />, []);
  const tab3Content = useMemo(() => <ExpensiveTab3Component />, []);

  return (
    <div>
      <div>
        <button onClick={() => setActiveTab('tab1')}>Tab 1</button>
        <button onClick={() => setActiveTab('tab2')}>Tab 2</button>
        <button onClick={() => setActiveTab('tab3')}>Tab 3</button>
      </div>

      <div>
        {activeTab === 'tab1' && tab1Content}
        {activeTab === 'tab2' && tab2Content}
        {activeTab === 'tab3' && tab3Content}
      </div>
    </div>
  );
}
```

## 六、useCallback vs useMemo

### 核心区别

```javascript
// useCallback：缓存函数本身
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// useMemo：缓存函数的返回值
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// 实际上，useCallback(fn, deps) 等价于 useMemo(() => fn, deps)
```

### 对比表格

| 特性 | useCallback | useMemo |
|------|-------------|---------|
| 缓存内容 | 函数本身 | 函数的返回值 |
| 返回值 | 函数引用 | 计算结果 |
| 主要用途 | 避免子组件不必要的渲染 | 避免昂贵的重复计算 |
| 使用场景 | 传递给子组件的回调函数 | 复杂计算、派生状态 |
| 必须有 return | ❌ 否 | ✅ 是 |

### 实际对比示例

```javascript
import { useState, useCallback, useMemo, memo } from 'react';

const ChildComponent = memo(({ onClick, data }) => {
  console.log('ChildComponent 渲染');
  return (
    <div>
      <button onClick={onClick}>点击</button>
      <p>{data}</p>
    </div>
  );
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // useCallback：缓存函数
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  // useMemo：缓存计算结果
  const expensiveData = useMemo(() => {
    console.log('计算昂贵的数据...');
    return text.toUpperCase();
  }, [text]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加 count</button>

      <input value={text} onChange={(e) => setText(e.target.value)} />

      <ChildComponent onClick={handleClick} data={expensiveData} />
    </div>
  );
}
```

## 七、最佳实践

### 1. 只在需要时使用

```javascript
// ❌ 过度优化
function Component() {
  const a = useMemo(() => 1 + 1, []); // 简单计算不需要
  const b = useCallback(() => {}, []); // 不传给子组件不需要

  return <div>{a}</div>;
}

// ✅ 合理使用
function Component() {
  const a = 1 + 1; // 简单计算直接执行
  const b = () => {}; // 简单函数直接定义

  return <div>{a}</div>;
}
```

### 2. 配合 React DevTools Profiler

使用 React DevTools 的 Profiler 检测性能瓶颈，再决定是否使用优化。

### 3. 依赖数组要完整

```javascript
// ✅ 使用 ESLint 插件检查
// eslint-plugin-react-hooks

// 配置 .eslintrc.js
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### 4. 优先使用函数式更新

```javascript
// ✅ 好：不依赖外部状态
const handleClick = useCallback(() => {
  setCount((prev) => prev + 1);
}, []); // 空依赖数组

// ❌ 不好：依赖 count
const handleClick = useCallback(() => {
  setCount(count + 1);
}, [count]); // 每次 count 变化都会重新创建
```

## 八、性能对比测试

```javascript
import { useState, useCallback, useMemo } from 'react';

function PerformanceTest() {
  const [count, setCount] = useState(0);

  // 测试 1：普通函数
  console.time('normal function');
  const normalFunc = () => {
    return count * 2;
  };
  console.timeEnd('normal function');

  // 测试 2：useCallback
  console.time('useCallback');
  const memoFunc = useCallback(() => {
    return count * 2;
  }, [count]);
  console.timeEnd('useCallback');

  // 测试 3：useMemo
  console.time('useMemo');
  const memoValue = useMemo(() => {
    return count * 2;
  }, [count]);
  console.timeEnd('useMemo');

  return <div>性能测试</div>;
}
```

## 九、总结

### useCallback 核心要点

- 🎯 **用途**：缓存函数引用，避免子组件不必要的重新渲染
- 📦 **返回**：函数本身
- ✅ **适用**：传递给使用 `React.memo` 的子组件的回调函数
- ⚠️ **注意**：不要滥用，本身也有性能开销

### useMemo 核心要点

- 🎯 **用途**：缓存计算结果，避免昂贵的重复计算
- 📦 **返回**：函数的返回值
- ✅ **适用**：复杂计算、派生状态、避免创建新引用
- ⚠️ **注意**：必须有 return，只在计算成本高时使用

### 快速决策

```
需要性能优化？
├─ 优化函数引用
│   ├─ 传给子组件？
│   │   └─ 使用 useCallback ✅
│   └─ useEffect 依赖？
│       └─ 使用 useCallback ✅
│
└─ 优化计算结果
    ├─ 计算成本高？
    │   └─ 使用 useMemo ✅
    └─ 避免创建新对象/数组？
        └─ 使用 useMemo ✅
```

### 何时不需要优化？

- ❌ 简单的计算（加减乘除）
- ❌ 不传递给子组件的函数
- ❌ 子组件渲染很快
- ❌ 组件很少更新

记住：**过早优化是万恶之源**。先让代码正确运行，再根据实际性能瓶颈进行优化。
