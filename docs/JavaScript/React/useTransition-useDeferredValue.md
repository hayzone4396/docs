# React 并发特性：useTransition 与 useDeferredValue

在 React v18 中，引入了 `useTransition` 和 `useDeferredValue` 两个重要的 Hooks，它们都是用来处理大数据量场景的性能优化，比如搜索框联动、大列表渲染、散点图等。

## 一、传统优化方案的局限性

### 1. 防抖（Debounce）

**原理**：执行多次之后，只取最后一次。

```javascript
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

function SearchComponent() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);

  // 防抖处理：延迟 300ms 更新列表
  const handleSearch = useCallback(
    debounce((value) => {
      // 模拟大数据处理
      const newList = new Array(20000).fill(value);
      setList(newList);
    }, 300),
    []
  );

  return (
    <div>
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          handleSearch(e.target.value);
        }}
      />
      <ul>
        {list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

**问题**：
- ❌ 延迟 React 更新操作，快速长时间输入时，列表依旧等不到响应
- ❌ 列表得到响应后，渲染引擎依旧会出现阻塞，导致页面卡顿
- ❌ 用户体验：有明显的滞后感

### 2. 节流（Throttle）

**原理**：执行多次之后，只取第一次（或固定时间间隔内只执行一次）。

```javascript
import { useState, useCallback } from 'react';
import { throttle } from 'lodash';

function SearchComponent() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);

  // 节流处理：每 300ms 最多执行一次
  const handleSearch = useCallback(
    throttle((value) => {
      const newList = new Array(20000).fill(value);
      setList(newList);
    }, 300),
    []
  );

  return (
    <div>
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          handleSearch(e.target.value);
        }}
      />
      <ul>
        {list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

**问题**：
- ❌ 节流在一段时间内开始处理，渲染引擎也会出现阻塞
- ❌ 页面会卡顿，而节流的时间需要手动配置
- ❌ 难以找到最佳的节流时间

### 3. setTimeout

```javascript
function SearchComponent() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);

    setTimeout(() => {
      const newList = new Array(20000).fill(value);
      setList(newList);
    }, 300);
  };

  return (
    <div>
      <input value={input} onChange={handleChange} />
      <ul>
        {list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

**问题**：
- ❌ 同样会出现阻塞、卡顿
- ❌ 依然会阻止页面交互

### 核心问题分析

防抖和节流的**本质都是定时器**，虽然能在一定程度上改善交互效果，但依旧不能解决卡顿或卡死的情况。

**根本原因**：
- React 的更新不可中断（在 v18 之前）
- JS 引擎长时间占据浏览器的主线程
- 渲染引擎被长时间阻塞

## 二、useTransition：并发模式的解决方案

### 基本用法

```javascript
import { useState, useTransition } from 'react';

function SearchComponent() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;

    // 高优先级更新：立即响应用户输入
    setInput(value);

    // 低优先级更新：标记为过渡更新
    startTransition(() => {
      const newList = new Array(20000).fill(value).map((item, index) => ({
        id: index,
        text: `${item} - ${index}`
      }));
      setList(newList);
    });
  };

  return (
    <div>
      <input value={input} onChange={handleChange} />
      {isPending && <div>加载中...</div>}
      <ul>
        {list.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

### useTransition 的优势

#### 1. 触发 Concurrent 模式

使用 `useTransition` 会触发并发模式（Concurrent Mode），渲染进程不会长时间被阻塞，使得其他操作得到及时响应，用户体验得到极大提升。

```javascript
// 高优先级：输入框立即响应
setInput(value); // ✅ 不会被阻塞

// 低优先级：列表更新可中断
startTransition(() => {
  setList(newList); // ⏸️ 可以被打断
});
```

#### 2. 同步执行，不延迟

定时器的本质是**异步延时执行**，而 `useTransition` 属于**同步执行**，通过标记 transition 来决定是否完成此次更新。

```javascript
// 定时器方案：异步延迟
setTimeout(() => {
  setList(newList); // 300ms 后才开始更新
}, 300);

// useTransition 方案：同步立即开始，但可中断
startTransition(() => {
  setList(newList); // 立即开始，但优先级低
});
```

**结果**：`useTransition` 要比定时器更新得更早，整体效果要好很多。

#### 3. 不减少渲染次数

- **防抖/节流/setTimeout**：合并渲染次数，减少 render 的调用
- **useTransition**：不减少渲染次数，而是改变渲染优先级

```javascript
// 快速输入 5 个字符

// 防抖：只渲染 1 次（最后一个字符）
// 节流：渲染 1-2 次（根据节流时间）
// useTransition：渲染 5 次，但每次可中断
```

### 为什么不减少渲染次数反而更好？

**问题场景**：
- 我们渲染的数据量是动态的，无法预知
- 很难控制防抖和节流的延时时间
- 时间过长 → 滞后感明显
- 时间过短 → 卡顿依旧存在

**useTransition 的解决方案**：
- ✅ 不需要手动配置延时时间
- ✅ 通过中断渲染，让浏览器在空闲时间执行
- ✅ 自动调度，达到更佳效果

## 三、useDeferredValue：延迟状态更新

### 基本用法

```javascript
import { useState, useDeferredValue } from 'react';

function SearchComponent() {
  const [input, setInput] = useState('');

  // 创建一个延迟版本的 input
  const deferredInput = useDeferredValue(input);

  // 基于延迟值生成列表
  const list = new Array(20000).fill(deferredInput).map((item, index) => ({
    id: index,
    text: `${item} - ${index}`
  }));

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <ul>
        {list.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 组件拆分优化

```javascript
import { useState, useDeferredValue, memo } from 'react';

// 将列表拆分为独立组件
const ListComponent = memo(({ query }) => {
  const list = new Array(20000).fill(query).map((item, index) => ({
    id: index,
    text: `${item} - ${index}`
  }));

  return (
    <ul>
      {list.map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
});

function SearchComponent() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {/* 使用延迟值渲染列表 */}
      <ListComponent query={deferredInput} />
    </div>
  );
}
```

## 四、useTransition vs useDeferredValue

### 对比表格

| 特性 | useTransition | useDeferredValue |
|------|---------------|------------------|
| 使用方式 | 包裹更新函数 | 包裹状态值 |
| 返回值 | `[isPending, startTransition]` | 延迟后的值 |
| 适用场景 | 控制更新函数 | 控制状态值 |
| 性能 | 通常更好 | 略低 |
| 灵活性 | 可包裹多个更新 | 只能延迟一个值 |
| 加载状态 | 提供 `isPending` | 需要手动比较 |

### 代码对比

```javascript
// useTransition：控制更新函数
function ComponentA() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setInput(e.target.value);

    startTransition(() => {
      // 可以包裹多个更新
      setList(generateList(e.target.value));
      setOtherState(value);
      callMultipleFunctions();
    });
  };

  return (
    <>
      <input value={input} onChange={handleChange} />
      {isPending && <Spinner />}
      <List data={list} />
    </>
  );
}

// useDeferredValue：控制状态值
function ComponentB() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);

  // 手动判断是否正在更新
  const isPending = input !== deferredInput;

  return (
    <>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {isPending && <Spinner />}
      <List query={deferredInput} />
    </>
  );
}
```

## 五、使用场景与最佳实践

### 适用场景

#### ✅ 适合使用的场景

1. **搜索框联动大列表**
```javascript
function SearchPage() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  const handleSearch = (value) => {
    setQuery(value);
    startTransition(() => {
      // 搜索并渲染大量结果
      setResults(searchInLargeDataset(value));
    });
  };

  return (
    <>
      <SearchInput value={query} onChange={handleSearch} />
      {isPending ? <Skeleton /> : <ResultList data={results} />}
    </>
  );
}
```

2. **数据可视化（散点图、大数据图表）**
```javascript
function ChartComponent() {
  const [filter, setFilter] = useState('all');
  const deferredFilter = useDeferredValue(filter);

  return (
    <>
      <FilterBar value={filter} onChange={setFilter} />
      <ScatterPlot
        data={largeDataset}
        filter={deferredFilter}
      />
    </>
  );
}
```

3. **大型表格渲染**
```javascript
function DataTable() {
  const [sortConfig, setSortConfig] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleSort = (column) => {
    startTransition(() => {
      setSortConfig({ column, direction: 'asc' });
    });
  };

  return <Table data={largeData} onSort={handleSort} />;
}
```

#### ❌ 不适合使用的场景

1. **小数据量**（< 1000 条）
2. **简单的表单输入**
3. **静态内容渲染**
4. **已经很快的更新操作**

### 选择指南

#### 优先使用 useTransition

**原因**：
- ✅ 可以一次性处理多个更新函数
- ✅ 在大多数场景下性能更好
- ✅ 提供 `isPending` 状态，便于展示加载提示
- ✅ 更灵活，控制粒度更细

**示例**：
```javascript
startTransition(() => {
  setList(newList);
  setTotal(newTotal);
  updateCache(data);
  logAnalytics();
});
```

#### 使用 useDeferredValue 的场景

**适用于**：
- 使用第三方库（如 ahooks），更新函数未暴露
- 只需要延迟单个值
- 组件接收 props，无法控制父组件的更新逻辑

**示例**：
```javascript
// 使用 ahooks 的自定义 Hook
function MyComponent() {
  const { data, loading } = useRequest(fetchData);

  // 只能获取到值，无法控制更新函数
  const deferredData = useDeferredValue(data);

  return <LargeList data={deferredData} />;
}
```

### 不要同时使用

```javascript
// ❌ 错误：重复优化，性能损耗
function BadExample() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();
  const deferredList = useDeferredValue(list); // 多余

  const handleChange = (e) => {
    setInput(e.target.value);
    startTransition(() => {
      setList(generateList(e.target.value));
    });
  };

  return <List data={deferredList} />; // 不需要
}

// ✅ 正确：只使用一个
function GoodExample() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setInput(e.target.value);
    startTransition(() => {
      setList(generateList(e.target.value));
    });
  };

  return <List data={list} />;
}
```

## 六、性能监控与调试

### 使用 React DevTools Profiler

```javascript
import { Profiler } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const onRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration
  ) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  };

  return (
    <Profiler id="SearchComponent" onRender={onRenderCallback}>
      <SearchComponent />
    </Profiler>
  );
}
```

### 添加性能指标

```javascript
function SearchComponent() {
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  const handleChange = (e) => {
    const start = performance.now();

    setInput(e.target.value);

    startTransition(() => {
      const newList = generateLargeList(e.target.value);
      setList(newList);

      const end = performance.now();
      console.log(`Update took ${end - start}ms`);
    });
  };

  return (
    <div>
      <div>Render count: {renderCount}</div>
      <input value={input} onChange={handleChange} />
    </div>
  );
}
```

## 七、总结

### 核心要点

1. **传统方案局限**：防抖、节流、setTimeout 本质是定时器，无法解决渲染阻塞问题

2. **useTransition 优势**：
   - 触发并发模式，渲染可中断
   - 同步执行，不延迟
   - 自动调度，无需手动配置时间

3. **使用原则**：
   - 只在大数据量场景使用（> 1000 条）
   - 优先使用 `useTransition`
   - 无法使用 `useTransition` 时才用 `useDeferredValue`
   - 不要同时使用两者

4. **性能考虑**：
   - 两者都会带来一定的性能损耗
   - 只在必要时使用
   - 通过 Profiler 监控实际效果

### 快速决策树

```
需要优化大数据渲染？
├─ 否 → 不使用这两个 Hooks
└─ 是 → 继续
    ├─ 能控制更新函数？
    │   ├─ 是 → 使用 useTransition ✅
    │   └─ 否 → 使用 useDeferredValue
    └─ 数据量 < 1000？
        └─ 是 → 考虑是否真的需要优化
```
