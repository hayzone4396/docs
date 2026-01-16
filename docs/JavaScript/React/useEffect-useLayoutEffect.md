# React useEffect 与 useLayoutEffect 详解

`useEffect` 和 `useLayoutEffect` 是 React 中用于处理副作用的两个 Hook。它们的 API 完全相同，但执行时机不同。

## 一、基本概念

### useEffect 语法

```javascript
useEffect(() => {
  // 副作用代码

  return () => {
    // 清理函数（可选）
  };
}, [dependencies]); // 依赖数组
```

### useLayoutEffect 语法

```javascript
useLayoutEffect(() => {
  // 副作用代码

  return () => {
    // 清理函数（可选）
  };
}, [dependencies]); // 依赖数组
```

**参数**：
- `effect`：副作用函数，可以返回一个清理函数
- `dependencies`：依赖数组，决定何时重新执行 effect

## 二、核心区别

### 执行时机对比

| 特性 | useEffect | useLayoutEffect |
|------|----------|----------------|
| 执行时机 | 浏览器渲染**之后**（异步） | 浏览器渲染**之前**（同步） |
| 是否阻塞渲染 | ❌ 不阻塞 | ✅ 阻塞 |
| 执行顺序 | 后执行 | 先执行 |
| 性能影响 | 更好 | 可能影响性能 |
| 使用场景 | 大部分副作用 | DOM 测量、同步更新 |

### 关键点

1. **useLayoutEffect 会阻塞浏览器渲染真实 DOM**：
   - 优先执行 Effect 链表中的 callback
   - 同步执行，阻塞渲染

2. **useEffect 不会阻塞浏览器渲染真实 DOM**：
   - 在渲染真实 DOM 的同时，去执行 Effect 链表中的 callback
   - 异步执行，不阻塞渲染

3. **执行顺序**：
   - `useLayoutEffect` 设置的 callback 要**优先于** `useEffect` 去执行

4. **DOM 访问**：
   - 在两者设置的 callback 中，**依然可以获取 DOM 元素**
   - 原因：真实 DOM 对象已经创建了，区别只是浏览器是否渲染

5. **状态更新的差异**：
   如果在 callback 函数中又修改了状态值（视图又要更新）：
   - **useEffect**：浏览器肯定是把第一次的真实 DOM 已经绘制了，再去渲染第二次的真实 DOM
   - **useLayoutEffect**：浏览器是把两次真实 DOM 渲染，合并在一起渲染的

## 三、视图更新步骤

React 视图更新的完整步骤：

```
1. 基于 babel-preset-react-app 把 JSX 编译为 createElement 格式
   ↓
2. 把 createElement 执行，创建出 VirtualDOM
   ↓
3. 基于 root.render 方法把 VirtualDOM 变为真实 DOM 对象（DOM-DIFF）
   ↓
4. 浏览器渲染和绘制真实 DOM 对象
```

**执行时机**：
- **useLayoutEffect**：阻塞第 4 步操作，先去执行 Effect 链表中的方法（**同步操作**）
- **useEffect**：第 4 步操作和 Effect 链表中的方法执行，是**同时进行**的（**异步操作**）

### 执行流程图

```
渲染阶段：
JSX → VirtualDOM → Real DOM 创建

┌─────────────────────────────────────┐
│   useLayoutEffect 执行（同步）       │ ← 阻塞渲染
│   - 可以读取 DOM                     │
│   - 可以修改 DOM                     │
│   - 阻止浏览器绘制                   │
└─────────────────────────────────────┘
                ↓
        浏览器渲染和绘制
                ↓
┌─────────────────────────────────────┐
│   useEffect 执行（异步）             │ ← 不阻塞渲染
│   - 可以读取 DOM                     │
│   - 可以修改 DOM（会触发重绘）       │
└─────────────────────────────────────┘
```

## 四、基础示例

### 示例 1：执行顺序对比

```javascript
import { useEffect, useLayoutEffect, useState } from 'react';

function ExecutionOrderExample() {
  const [count, setCount] = useState(0);

  console.log('1. 组件渲染');

  useLayoutEffect(() => {
    console.log('2. useLayoutEffect 执行');
    return () => {
      console.log('5. useLayoutEffect 清理');
    };
  });

  useEffect(() => {
    console.log('3. useEffect 执行');
    return () => {
      console.log('6. useEffect 清理');
    };
  });

  console.log('4. 组件渲染完成');

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}

// 首次渲染控制台输出：
// 1. 组件渲染
// 4. 组件渲染完成
// 2. useLayoutEffect 执行
// 3. useEffect 执行

// 点击按钮后：
// 1. 组件渲染
// 4. 组件渲染完成
// 5. useLayoutEffect 清理
// 2. useLayoutEffect 执行
// 6. useEffect 清理
// 3. useEffect 执行
```

### 示例 2：状态更新的差异

```javascript
import { useEffect, useLayoutEffect, useState } from 'react';

function StateUpdateExample() {
  const [count, setCount] = useState(0);

  // useEffect：会看到闪烁（0 → 1000）
  useEffect(() => {
    if (count === 0) {
      setCount(1000); // 第二次渲染
    }
  }, [count]);

  return <div>Count: {count}</div>;
}

function StateUpdateExample2() {
  const [count, setCount] = useState(0);

  // useLayoutEffect：不会看到闪烁（直接显示 1000）
  useLayoutEffect(() => {
    if (count === 0) {
      setCount(1000); // 合并渲染
    }
  }, [count]);

  return <div>Count: {count}</div>;
}
```

**解释**：
- **useEffect**：浏览器先渲染 `0`，然后 effect 执行设置为 `1000`，再重新渲染，用户会看到闪烁
- **useLayoutEffect**：在浏览器渲染前就把 `count` 设置为 `1000`，浏览器只渲染一次，用户看不到闪烁

## 五、使用场景

### useEffect 适用场景（大多数情况）

```javascript
import { useEffect, useState } from 'react';

// 1. 数据获取
function DataFetchingExample() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    }

    fetchData();
  }, []);

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}

// 2. 订阅事件
function EventSubscriptionExample() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div>窗口宽度: {windowWidth}px</div>;
}

// 3. 定时器
function TimerExample() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div>已过去 {seconds} 秒</div>;
}

// 4. 日志记录
function LoggingExample({ userId }) {
  useEffect(() => {
    console.log('用户访问页面:', userId);

    return () => {
      console.log('用户离开页面:', userId);
    };
  }, [userId]);

  return <div>用户 ID: {userId}</div>;
}
```

### useLayoutEffect 适用场景（特殊情况）

```javascript
import { useLayoutEffect, useRef, useState } from 'react';

// 1. DOM 测量（避免闪烁）
function TooltipExample() {
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const tooltipRef = useRef(null);

  useLayoutEffect(() => {
    // 在浏览器绘制前测量 DOM
    const height = tooltipRef.current.getBoundingClientRect().height;
    setTooltipHeight(height);
  }, []);

  return (
    <div>
      <div ref={tooltipRef} style={{ position: 'absolute', top: -tooltipHeight }}>
        Tooltip 内容
      </div>
    </div>
  );
}

// 2. 动画前的 DOM 操作
function AnimationExample() {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    if (isVisible) {
      // 在浏览器绘制前设置初始状态
      elementRef.current.style.opacity = '0';
      elementRef.current.style.transform = 'translateY(-20px)';

      // 然后触发动画
      requestAnimationFrame(() => {
        elementRef.current.style.transition = 'all 0.3s';
        elementRef.current.style.opacity = '1';
        elementRef.current.style.transform = 'translateY(0)';
      });
    }
  }, [isVisible]);

  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>切换</button>
      {isVisible && <div ref={elementRef}>动画内容</div>}
    </div>
  );
}

// 3. 滚动位置恢复
function ScrollRestorationExample() {
  const containerRef = useRef(null);
  const [items, setItems] = useState([]);

  useLayoutEffect(() => {
    // 在浏览器绘制前恢复滚动位置
    const savedScrollPos = sessionStorage.getItem('scrollPos');
    if (savedScrollPos && containerRef.current) {
      containerRef.current.scrollTop = parseInt(savedScrollPos, 10);
    }
  }, [items]);

  useEffect(() => {
    // 保存滚动位置
    const handleScroll = () => {
      if (containerRef.current) {
        sessionStorage.setItem('scrollPos', containerRef.current.scrollTop);
      }
    };

    containerRef.current?.addEventListener('scroll', handleScroll);
    return () => {
      containerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ height: '400px', overflow: 'auto' }}>
      {items.map((item) => (
        <div key={item.id}>{item.text}</div>
      ))}
    </div>
  );
}

// 4. 避免布局抖动
function LayoutShiftExample() {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    if (show && elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();

      // 计算位置，确保不超出视口
      const newPosition = {
        top: Math.min(rect.top, window.innerHeight - rect.height),
        left: Math.min(rect.left, window.innerWidth - rect.width)
      };

      setPosition(newPosition);
    }
  }, [show]);

  return (
    <div>
      <button onClick={() => setShow(!show)}>切换</button>
      {show && (
        <div
          ref={elementRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left
          }}
        >
          弹出内容
        </div>
      )}
    </div>
  );
}
```

## 六、闪烁问题对比

### 问题示例：useEffect 导致闪烁

```javascript
import { useEffect, useState, useRef } from 'react';

function FlickerExample() {
  const [value, setValue] = useState(0);
  const divRef = useRef(null);

  // ❌ useEffect：会看到闪烁
  useEffect(() => {
    if (divRef.current) {
      const width = divRef.current.offsetWidth;
      if (width < 100) {
        setValue(100); // 触发第二次渲染
      }
    }
  }, [value]);

  return (
    <div ref={divRef} style={{ width: value }}>
      内容
    </div>
  );
}

// 用户会看到：
// 1. 首次渲染：width = 0
// 2. useEffect 执行
// 3. 第二次渲染：width = 100
// 结果：看到从 0 到 100 的闪烁
```

### 解决方案：useLayoutEffect 避免闪烁

```javascript
import { useLayoutEffect, useState, useRef } from 'react';

function NoFlickerExample() {
  const [value, setValue] = useState(0);
  const divRef = useRef(null);

  // ✅ useLayoutEffect：不会闪烁
  useLayoutEffect(() => {
    if (divRef.current) {
      const width = divRef.current.offsetWidth;
      if (width < 100) {
        setValue(100); // 在浏览器绘制前更新
      }
    }
  }, [value]);

  return (
    <div ref={divRef} style={{ width: value }}>
      内容
    </div>
  );
}

// 用户看到：
// 1. React 创建 DOM
// 2. useLayoutEffect 执行，修改状态
// 3. 浏览器只渲染一次：width = 100
// 结果：没有闪烁
```

## 七、实战案例

### 案例 1：Tooltip 位置计算

```javascript
import { useLayoutEffect, useRef, useState } from 'react';

function Tooltip({ children, content }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [show, setShow] = useState(false);
  const tooltipRef = useRef(null);
  const targetRef = useRef(null);

  useLayoutEffect(() => {
    if (show && tooltipRef.current && targetRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // 计算 tooltip 位置
      let top = targetRect.bottom + 8;
      let left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;

      // 边界检查
      if (left < 0) left = 8;
      if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 8;
      }
      if (top + tooltipRect.height > window.innerHeight) {
        top = targetRect.top - tooltipRect.height - 8;
      }

      setPosition({ top, left });
    }
  }, [show]);

  return (
    <div>
      <div
        ref={targetRef}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>

      {show && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            background: '#333',
            color: '#fff',
            padding: '8px',
            borderRadius: '4px',
            zIndex: 1000
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// 使用
function App() {
  return (
    <div style={{ padding: '100px' }}>
      <Tooltip content="这是一个提示信息">
        <button>鼠标悬停查看提示</button>
      </Tooltip>
    </div>
  );
}
```

### 案例 2：虚拟列表滚动位置

```javascript
import { useLayoutEffect, useRef, useState } from 'react';

function VirtualList({ items, itemHeight = 50 }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const visibleCount = Math.ceil(window.innerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = startIndex + visibleCount;

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  useLayoutEffect(() => {
    // 在浏览器绘制前调整滚动位置，避免抖动
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: '100vh', overflow: 'auto' }}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div
          ref={contentRef}
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            width: '100%'
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 案例 3：Modal 焦点管理

```javascript
import { useLayoutEffect, useRef, useState } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useLayoutEffect(() => {
    if (isOpen) {
      // 保存当前焦点元素
      previousActiveElement.current = document.activeElement;

      // 在浏览器绘制前设置焦点
      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }

      // 阻止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // 恢复焦点
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }

      // 恢复滚动
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}
```

## 八、性能考虑

### useLayoutEffect 的性能影响

```javascript
import { useLayoutEffect, useState } from 'react';

// ❌ 不好：useLayoutEffect 中执行耗时操作
function BadExample() {
  const [data, setData] = useState(null);

  useLayoutEffect(() => {
    // 耗时操作会阻塞渲染
    for (let i = 0; i < 1000000; i++) {
      // 复杂计算
    }

    fetch('/api/data')
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{data ? 'Loaded' : 'Loading...'}</div>;
}

// ✅ 好：耗时操作使用 useEffect
function GoodExample() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 不会阻塞渲染
    for (let i = 0; i < 1000000; i++) {
      // 复杂计算
    }

    fetch('/api/data')
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{data ? 'Loaded' : 'Loading...'}</div>;
}
```

### 何时使用哪个？

```javascript
// 使用 useEffect（99% 的情况）
useEffect(() => {
  // ✅ 数据获取
  // ✅ 事件订阅
  // ✅ 日志记录
  // ✅ 定时器
  // ✅ 不影响布局的 DOM 操作
}, []);

// 使用 useLayoutEffect（1% 的情况）
useLayoutEffect(() => {
  // ✅ DOM 测量（获取尺寸、位置）
  // ✅ 同步 DOM 更新（避免闪烁）
  // ✅ 动画初始化
  // ✅ 滚动位置恢复
  // ⚠️ 必须在浏览器绘制前完成的操作
}, []);
```

## 九、常见错误

### 错误 1：过度使用 useLayoutEffect

```javascript
// ❌ 错误：不需要同步的操作使用 useLayoutEffect
function BadExample() {
  const [data, setData] = useState(null);

  useLayoutEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{data}</div>;
}

// ✅ 正确：使用 useEffect
function GoodExample() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then(setData);
  }, []);

  return <div>{data}</div>;
}
```

### 错误 2：在 useLayoutEffect 中执行异步操作

```javascript
// ❌ 错误：异步操作不应该用 useLayoutEffect
function BadExample() {
  useLayoutEffect(async () => {
    const data = await fetch('/api/data');
    // ...
  }, []);
}

// ✅ 正确：异步操作使用 useEffect
function GoodExample() {
  useEffect(() => {
    async function fetchData() {
      const data = await fetch('/api/data');
      // ...
    }
    fetchData();
  }, []);
}
```

### 错误 3：忘记清理副作用

```javascript
// ❌ 错误：没有清理事件监听
function BadExample() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // 忘记清理！
  }, []);
}

// ✅ 正确：返回清理函数
function GoodExample() {
  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
}
```

## 十、总结

### 核心要点

1. **执行时机**：
   - `useLayoutEffect`：浏览器渲染**前**执行（同步）
   - `useEffect`：浏览器渲染**后**执行（异步）

2. **渲染阻塞**：
   - `useLayoutEffect`：阻塞渲染，可能影响性能
   - `useEffect`：不阻塞渲染，性能更好

3. **状态更新**：
   - `useLayoutEffect`：多次更新合并渲染，无闪烁
   - `useEffect`：每次更新都渲染，可能闪烁

4. **DOM 访问**：
   - 两者都可以访问 DOM
   - 区别在于浏览器是否已经绘制

### 使用建议

**默认使用 useEffect**：
- ✅ 数据获取
- ✅ 事件订阅
- ✅ 定时器
- ✅ 日志记录
- ✅ 大部分副作用

**特殊情况使用 useLayoutEffect**：
- ✅ DOM 测量（尺寸、位置）
- ✅ 避免视觉闪烁
- ✅ 同步 DOM 更新
- ✅ 滚动位置恢复
- ⚠️ 性能敏感的场景要慎用

### 快速决策

```
需要副作用？
├─ 会导致视觉闪烁？
│   ├─ 是 → useLayoutEffect ⚡
│   └─ 否 → useEffect ✅
│
├─ 需要测量 DOM？
│   ├─ 测量后立即更新 → useLayoutEffect ⚡
│   └─ 测量后异步更新 → useEffect ✅
│
└─ 其他情况
    └─ 使用 useEffect ✅（99% 的情况）
```

### 性能警告

- ⚠️ `useLayoutEffect` 会阻塞渲染，影响性能
- ⚠️ 不要在 `useLayoutEffect` 中执行耗时操作
- ⚠️ 服务端渲染时，`useLayoutEffect` 会有警告
- ✅ 默认使用 `useEffect`，只在必要时使用 `useLayoutEffect`

记住：**useEffect 是默认选择，useLayoutEffect 是特殊情况的优化手段**。
