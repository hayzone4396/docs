# React useRef 完全指南

`useRef` 是 React Hooks 中用于创建可变引用的 Hook，它主要用于获取 DOM 元素引用和保存任意可变值。

## 一、基本概念

### 语法

```javascript
const refContainer = useRef(initialValue);
```

**参数**：
- `initialValue`：ref 对象的初始值

**返回值**：
- 返回一个可变的 ref 对象，其 `.current` 属性被初始化为传入的参数

### 基础示例

```javascript
import { useRef } from 'react';

function TextInputWithFocusButton() {
  // 创建一个 ref 对象
  const inputRef = useRef(null);

  const handleFocus = () => {
    // 通过 .current 访问 DOM 元素
    inputRef.current.focus();
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleFocus}>聚焦输入框</button>
    </div>
  );
}
```

## 二、获取 DOM 元素的方式对比

### 类组件中的三种方式

```javascript
class ClassComponent extends React.Component {
  // 方式 1：字符串 ref（不推荐，已废弃）
  componentDidMount() {
    console.log(this.refs.box);
  }

  render() {
    return <div ref="box">字符串 ref</div>;
  }
}

// 方式 2：回调函数 ref
class ClassComponent2 extends React.Component {
  box = null;

  render() {
    return <div ref={(el) => (this.box = el)}>回调函数 ref</div>;
  }
}

// 方式 3：React.createRef()
class ClassComponent3 extends React.Component {
  box = React.createRef();

  componentDidMount() {
    console.log(this.box.current);
  }

  render() {
    return <div ref={this.box}>createRef</div>;
  }
}
```

### 函数组件中的方式

```javascript
import { useRef } from 'react';

function FunctionComponent() {
  // 方式 1：回调函数 ref
  let box = null;

  return <div ref={(el) => (box = el)}>回调函数 ref</div>;
}

// 方式 2：useRef（推荐）
function FunctionComponent2() {
  const box = useRef(null);

  const handleClick = () => {
    console.log(box.current); // DOM 元素
  };

  return (
    <div>
      <div ref={box}>useRef</div>
      <button onClick={handleClick}>获取元素</button>
    </div>
  );
}
```

## 三、useRef vs createRef

### 核心区别

**useRef**：
- ✅ 在每一次组件更新时，**不会**创建新的 ref 对象
- ✅ 获取到的还是第一次创建的那个 ref 对象
- ✅ **性能更好**

**createRef**：
- ❌ 在每一次组件更新时，都会创建一个**全新**的 ref 对象
- ❌ 比较浪费性能

### 对比示例

```javascript
import { useState, useRef, createRef } from 'react';

function ComparisonExample() {
  const [count, setCount] = useState(0);

  // useRef：每次更新返回同一个对象
  const useRefBox = useRef(null);

  // createRef：每次更新创建新对象
  const createRefBox = createRef();

  console.log('useRef 对象:', useRefBox);
  console.log('createRef 对象:', createRefBox);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>更新组件</button>

      <div ref={useRefBox}>useRef 元素</div>
      <div ref={createRefBox}>createRef 元素</div>
    </div>
  );
}

// 点击按钮后控制台输出：
// useRef 对象: { current: div } - 同一个对象
// createRef 对象: { current: null } - 新对象（还未关联 DOM）
```

### 总结

- **类组件**：创建 ref 对象，使用 `React.createRef()`
- **函数组件**：为了保证性能，应该使用 `useRef()`

## 四、useRef 的两大用途

### 用途 1：访问 DOM 元素

```javascript
import { useRef } from 'react';

function DOMExample() {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFocus = () => {
    inputRef.current.focus();
  };

  const handlePlay = () => {
    videoRef.current.play();
  };

  const handleDraw = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillRect(0, 0, 100, 100);
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleFocus}>聚焦</button>

      <video ref={videoRef} src="video.mp4" />
      <button onClick={handlePlay}>播放</button>

      <canvas ref={canvasRef} width="200" height="200" />
      <button onClick={handleDraw}>绘制</button>
    </div>
  );
}
```

### 用途 2：保存任意可变值

`useRef` 不仅可以用于 DOM 引用，还可以用来保存任何可变值，且这些值的变化**不会触发组件重新渲染**。

```javascript
import { useState, useRef, useEffect } from 'react';

function TimerExample() {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // 保存定时器 ID
  const timerRef = useRef(null);

  // 保存渲染次数
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    console.log('组件渲染次数:', renderCountRef.current);
  });

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setCount((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div>
      <p>计数: {count}</p>
      <p>渲染次数: {renderCountRef.current}</p>
      <button onClick={startTimer} disabled={isRunning}>
        开始
      </button>
      <button onClick={stopTimer} disabled={!isRunning}>
        停止
      </button>
    </div>
  );
}
```

### useRef vs useState 对比

```javascript
function ComparisonExample() {
  // useState：值变化会触发重新渲染
  const [stateValue, setStateValue] = useState(0);

  // useRef：值变化不会触发重新渲染
  const refValue = useRef(0);

  const handleStateUpdate = () => {
    setStateValue(stateValue + 1); // 触发重新渲染
    console.log('state updated');
  };

  const handleRefUpdate = () => {
    refValue.current += 1; // 不会触发重新渲染
    console.log('ref updated:', refValue.current);
  };

  console.log('组件渲染了');

  return (
    <div>
      <p>State: {stateValue}</p>
      <p>Ref: {refValue.current}</p>
      <button onClick={handleStateUpdate}>更新 State（会重新渲染）</button>
      <button onClick={handleRefUpdate}>更新 Ref（不会重新渲染）</button>
    </div>
  );
}
```

## 五、forwardRef：转发 ref 到子组件

### 问题：函数组件不能直接接收 ref

```javascript
// ❌ 错误：函数组件不能直接接收 ref
function Child(props) {
  return <div>Child</div>;
}

function Parent() {
  const childRef = useRef(null);

  return <Child ref={childRef} />; // 警告：函数组件不能给定 ref
}
```

### 解决方案 1：转发到 DOM 元素

使用 `forwardRef` 将 ref 转发到子组件内部的 DOM 元素：

```javascript
import { forwardRef, useRef } from 'react';

// 子组件：使用 forwardRef 包裹
const Child = forwardRef(function Child(props, ref) {
  return (
    <div>
      <input ref={ref} type="text" />
    </div>
  );
});

// 父组件
function Parent() {
  const inputRef = useRef(null);

  const handleFocus = () => {
    inputRef.current.focus(); // 直接访问子组件内的 input
  };

  return (
    <div>
      <Child ref={inputRef} />
      <button onClick={handleFocus}>聚焦子组件的输入框</button>
    </div>
  );
}
```

### 解决方案 2：暴露自定义方法（推荐）

使用 `useImperativeHandle` 自定义暴露给父组件的实例值：

```javascript
import { forwardRef, useRef, useImperativeHandle, useState } from 'react';

// 子组件
const Child = forwardRef(function Child(props, ref) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const submit = () => {
    console.log('提交:', text);
    setText('');
  };

  const focus = () => {
    inputRef.current.focus();
  };

  // 自定义暴露给父组件的内容
  useImperativeHandle(ref, () => {
    // 在这里返回的内容，都可以被父组件的 ref 对象获取到
    return {
      text,      // 暴露状态
      submit,    // 暴露方法
      focus      // 暴露方法
    };
  });

  return (
    <div>
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入内容"
      />
    </div>
  );
});

// 父组件
function Parent() {
  const childRef = useRef(null);

  const handleSubmit = () => {
    // 调用子组件暴露的方法
    childRef.current.submit();
  };

  const handleFocus = () => {
    // 调用子组件暴露的方法
    childRef.current.focus();
  };

  const handleGetText = () => {
    // 获取子组件暴露的状态
    console.log('子组件的文本:', childRef.current.text);
  };

  return (
    <div>
      <h2>父组件</h2>
      <Child ref={childRef} />

      <button onClick={handleSubmit}>提交子组件数据</button>
      <button onClick={handleFocus}>聚焦子组件输入框</button>
      <button onClick={handleGetText}>获取子组件文本</button>
    </div>
  );
}

export default Parent;
```

### 类组件作为子组件（不需要特殊处理）

```javascript
import { useRef, Component } from 'react';

// 子组件：类组件
class Child extends Component {
  state = {
    count: 0
  };

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>增加</button>
      </div>
    );
  }
}

// 父组件：函数组件
function Parent() {
  const childRef = useRef(null);

  const handleIncrement = () => {
    // 直接调用类组件的方法
    childRef.current.increment();
  };

  const handleGetCount = () => {
    // 直接访问类组件的 state
    console.log('子组件的 count:', childRef.current.state.count);
  };

  return (
    <div>
      <Child ref={childRef} />
      <button onClick={handleIncrement}>从父组件增加子组件的 count</button>
      <button onClick={handleGetCount}>获取子组件的 count</button>
    </div>
  );
}
```

## 六、实战场景

### 场景 1：表单聚焦

```javascript
import { useRef } from 'react';

function LoginForm() {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    if (!username) {
      usernameRef.current.focus();
      alert('请输入用户名');
      return;
    }

    if (!password) {
      passwordRef.current.focus();
      alert('请输入密码');
      return;
    }

    console.log('提交:', { username, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={usernameRef} type="text" placeholder="用户名" />
      <input ref={passwordRef} type="password" placeholder="密码" />
      <button type="submit">登录</button>
    </form>
  );
}
```

### 场景 2：滚动到指定元素

```javascript
import { useRef } from 'react';

function ScrollExample() {
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <nav style={{ position: 'fixed', top: 0 }}>
        <button onClick={() => scrollToSection(section1Ref)}>
          跳转到第一部分
        </button>
        <button onClick={() => scrollToSection(section2Ref)}>
          跳转到第二部分
        </button>
        <button onClick={() => scrollToSection(section3Ref)}>
          跳转到第三部分
        </button>
      </nav>

      <div ref={section1Ref} style={{ height: '100vh', background: '#f00' }}>
        第一部分
      </div>
      <div ref={section2Ref} style={{ height: '100vh', background: '#0f0' }}>
        第二部分
      </div>
      <div ref={section3Ref} style={{ height: '100vh', background: '#00f' }}>
        第三部分
      </div>
    </div>
  );
}
```

### 场景 3：Canvas 绘图

```javascript
import { useRef, useEffect } from 'react';

function CanvasExample() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 绘制矩形
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 10, 100, 100);

    // 绘制圆形
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(200, 60, 50, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制文字
    ctx.fillStyle = '#0000ff';
    ctx.font = '20px Arial';
    ctx.fillText('Hello Canvas', 300, 60);
  }, []);

  return <canvas ref={canvasRef} width="600" height="400" />;
}
```

### 场景 4：视频播放控制

```javascript
import { useRef, useState } from 'react';

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleSeek = (seconds) => {
    videoRef.current.currentTime += seconds;
  };

  return (
    <div>
      <video ref={videoRef} src={src} width="600" />

      <div>
        <button onClick={togglePlay}>
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button onClick={handleRestart}>重新开始</button>
        <button onClick={() => handleSeek(-10)}>后退 10s</button>
        <button onClick={() => handleSeek(10)}>前进 10s</button>
      </div>
    </div>
  );
}
```

### 场景 5：保存上一次的值

```javascript
import { useState, useRef, useEffect } from 'react';

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>当前值: {count}</p>
      <p>上一次的值: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

### 场景 6：避免闭包陷阱

```javascript
import { useState, useRef, useEffect } from 'react';

function IntervalExample() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  // 保持 ref 和 state 同步
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    const timer = setInterval(() => {
      // ❌ 使用 count 会形成闭包，永远是 0
      // setCount(count + 1);

      // ✅ 使用 ref 获取最新值
      setCount(countRef.current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []); // 空依赖数组

  return <div>Count: {count}</div>;
}
```

### 场景 7：测量元素尺寸

```javascript
import { useRef, useState, useEffect } from 'react';

function MeasureElement() {
  const elementRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (elementRef.current) {
        const { offsetWidth, offsetHeight } = elementRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();

    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div>
      <div
        ref={elementRef}
        style={{
          width: '50%',
          height: '200px',
          background: '#f0f0f0',
          padding: '20px'
        }}
      >
        调整窗口大小查看尺寸变化
      </div>

      <p>宽度: {dimensions.width}px</p>
      <p>高度: {dimensions.height}px</p>
    </div>
  );
}
```

## 七、常见错误

### 错误 1：在渲染期间读取 ref.current

```javascript
// ❌ 错误：在渲染期间读取 ref
function BadExample() {
  const ref = useRef(0);

  // 渲染期间修改 ref 可能导致不可预测的行为
  ref.current = ref.current + 1;

  return <div>{ref.current}</div>;
}

// ✅ 正确：在事件处理或 effect 中使用 ref
function GoodExample() {
  const ref = useRef(0);

  useEffect(() => {
    ref.current = ref.current + 1;
  });

  const handleClick = () => {
    ref.current = ref.current + 1;
    console.log(ref.current);
  };

  return <button onClick={handleClick}>点击</button>;
}
```

### 错误 2：ref 值变化时期望组件重新渲染

```javascript
// ❌ 错误：修改 ref 不会触发重新渲染
function BadExample() {
  const countRef = useRef(0);

  const handleClick = () => {
    countRef.current += 1;
    // 组件不会重新渲染，看不到更新
  };

  return (
    <div>
      <p>Count: {countRef.current}</p>
      <button onClick={handleClick}>增加</button>
    </div>
  );
}

// ✅ 正确：需要重新渲染时使用 useState
function GoodExample() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1); // 触发重新渲染
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>增加</button>
    </div>
  );
}
```

### 错误 3：给函数组件直接传 ref

```javascript
// ❌ 错误：函数组件不能直接接收 ref
function Child(props) {
  return <div>Child</div>;
}

function Parent() {
  const ref = useRef(null);
  return <Child ref={ref} />; // 警告
}

// ✅ 正确：使用 forwardRef
const Child = forwardRef((props, ref) => {
  return <div ref={ref}>Child</div>;
});

function Parent() {
  const ref = useRef(null);
  return <Child ref={ref} />;
}
```

### 错误 4：在 useEffect 依赖中使用 ref

```javascript
// ❌ 不必要：ref 变化不会触发 effect
function BadExample() {
  const ref = useRef(0);

  useEffect(() => {
    console.log(ref.current);
  }, [ref.current]); // ref.current 变化不会触发 effect

  return <div>...</div>;
}

// ✅ 正确：ref 不需要作为依赖
function GoodExample() {
  const ref = useRef(0);

  useEffect(() => {
    // 直接使用 ref，不需要作为依赖
    console.log(ref.current);
  }, []);

  return <div>...</div>;
}
```

## 八、JavaScript 中的 useRef

### 基本类型

```javascript
import { useRef } from 'react';

function Example() {
  // DOM 元素引用
  const inputRef = useRef(null);
  const divRef = useRef(null);
  const videoRef = useRef(null);

  // 可变值引用
  const countRef = useRef(0);
  const timerRef = useRef(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div ref={divRef}>
      <input ref={inputRef} type="text" />
      <video ref={videoRef} />
    </div>
  );
}
```

### forwardRef 类型

```javascript
import { forwardRef, useImperativeHandle, useRef } from 'react';

// 子组件
const Child = forwardRef((props, ref) => {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    getValue: () => {
      return inputRef.current?.value || '';
    }
  }));

  return <input ref={inputRef} defaultValue={props.defaultValue} />;
});

// 父组件
function Parent() {
  const childRef = useRef(null);

  const handleClick = () => {
    childRef.current?.focus();
    const value = childRef.current?.getValue();
    console.log(value);
  };

  return (
    <div>
      <Child ref={childRef} defaultValue="Hello" />
      <button onClick={handleClick}>操作子组件</button>
    </div>
  );
}
```

## 九、最佳实践

### 1. 选择合适的工具

```javascript
// 需要触发重新渲染？使用 useState
const [count, setCount] = useState(0);

// 不需要触发重新渲染？使用 useRef
const countRef = useRef(0);

// 需要访问 DOM？使用 useRef
const inputRef = useRef(null);
```

### 2. 命名规范

```javascript
// 好的命名
const inputRef = useRef(null);
const videoRef = useRef(null);
const containerRef = useRef(null);
const previousValueRef = useRef(0);
const timerIdRef = useRef(null);
```

### 3. 初始化时机

```javascript
function Example() {
  // ✅ 组件内部创建
  const ref = useRef(null);

  // ❌ 不要在条件中创建
  if (someCondition) {
    const badRef = useRef(null); // 错误
  }

  return <div ref={ref}>...</div>;
}
```

### 4. 清理资源

```javascript
function TimerExample() {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      console.log('tick');
    }, 1000);

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return <div>Timer</div>;
}
```

## 十、总结

### 核心要点

1. **性能优化**：
   - 函数组件中使用 `useRef` 而不是 `createRef`
   - `useRef` 在组件更新时不会创建新对象

2. **两大用途**：
   - 访问 DOM 元素
   - 保存任意可变值（不触发重新渲染）

3. **ref 转发**：
   - 函数组件：使用 `forwardRef`
   - 类组件：直接使用 ref
   - 自定义方法：使用 `useImperativeHandle`

4. **与 useState 的区别**：
   - `useState`：值变化触发重新渲染
   - `useRef`：值变化不触发重新渲染

### 使用场景

**✅ 适合使用 useRef**：
- 访问和操作 DOM 元素
- 保存定时器 ID
- 保存上一次的值
- 保存任何不需要触发渲染的值
- 避免闭包陷阱

**❌ 不适合使用 useRef**：
- 需要触发组件重新渲染的数据
- 需要在渲染期间使用的值
- 作为 useEffect 的依赖项

### 快速决策

```
需要引用？
├─ 引用 DOM 元素
│   ├─ 类组件 → React.createRef()
│   └─ 函数组件 → useRef() ✅
│
├─ 保存可变值
│   ├─ 需要触发渲染 → useState
│   └─ 不需要触发渲染 → useRef ✅
│
└─ 子组件引用
    ├─ 类组件 → 直接使用 ref
    └─ 函数组件 → forwardRef + useImperativeHandle ✅
```

`useRef` 是 React Hooks 中非常实用的工具，掌握它的正确使用方式能够让你更好地控制组件行为和优化性能。
