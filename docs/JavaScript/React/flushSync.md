# React flushSync 同步更新详解

`flushSync` 是 React 提供的一个强制同步更新的 API，它可以刷新"updater 更新队列"，让修改状态的任务立即批处理。

## 一、基本概念

### 什么是 flushSync？

`flushSync` 可以强制 React 同步刷新提供的回调函数内部的所有更新，确保 DOM 立即更新。

```javascript
import { flushSync } from 'react-dom';

flushSync(() => {
  // 立即执行并更新的内容代码
  // 可以理解为同步操作
  setState(newValue);
});
```

### 语法

```javascript
// 方式 1：回调函数形式
flushSync(() => {
  // 状态更新代码
  setState1(value1);
  setState2(value2);
});

// 方式 2：在更新后调用（不推荐）
setState(newValue);
flushSync(); // 刷新队列
```

**注意**：推荐使用回调函数形式，更加清晰和安全。

## 二、React 的批量更新机制

### 默认的批量更新

React 默认会对状态更新进行**批处理**，以提高性能：

```javascript
function NormalUpdate() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);

  const handleClick = () => {
    console.log('点击开始');

    setCount1(1); // 不会立即更新
    setCount2(2); // 不会立即更新
    setCount3(3); // 不会立即更新

    console.log('点击结束');
    // 三个状态更新会合并成一次重新渲染
  };

  console.log('组件渲染:', count1, count2, count3);

  return (
    <div>
      <p>Count1: {count1}</p>
      <p>Count2: {count2}</p>
      <p>Count3: {count3}</p>
      <button onClick={handleClick}>更新</button>
    </div>
  );
}

// 控制台输出：
// 组件渲染: 0 0 0
// （点击按钮）
// 点击开始
// 点击结束
// 组件渲染: 1 2 3
```

### 使用 flushSync 的同步更新

```javascript
import { flushSync } from 'react-dom';

function FlushSyncUpdate() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);

  const handleClick = () => {
    console.log('点击开始');

    flushSync(() => {
      setCount1(1); // 立即更新
    });
    console.log('Count1 更新完成');

    flushSync(() => {
      setCount2(2); // 立即更新
    });
    console.log('Count2 更新完成');

    setCount3(3); // 正常批处理
    console.log('点击结束');
  };

  console.log('组件渲染:', count1, count2, count3);

  return (
    <div>
      <p>Count1: {count1}</p>
      <p>Count2: {count2}</p>
      <p>Count3: {count3}</p>
      <button onClick={handleClick}>更新</button>
    </div>
  );
}

// 控制台输出：
// 组件渲染: 0 0 0
// （点击按钮）
// 点击开始
// 组件渲染: 1 0 0
// Count1 更新完成
// 组件渲染: 1 2 0
// Count2 更新完成
// 点击结束
// 组件渲染: 1 2 3
```

## 三、使用场景

### 场景 1：更新某些状态后，再更新某些状态

需要确保第一个状态更新完成后，再进行第二个状态更新。

```javascript
import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  const handleAdd = () => {
    flushSync(() => {
      // 先添加待办事项
      setTodos([...todos, { id: Date.now(), text }]);
      setText('');
    });

    // 确保 DOM 已更新，然后滚动到底部
    listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleAdd}>添加</button>

      <div ref={listRef} style={{ height: '200px', overflow: 'auto' }}>
        {todos.map((todo) => (
          <div key={todo.id}>{todo.text}</div>
        ))}
      </div>
    </div>
  );
}
```

### 场景 2：第三方库集成

在与不支持 React 批量更新的第三方库集成时使用。

```javascript
import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

function ChartComponent() {
  const [data, setData] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // 初始化图表库（假设是某个图表库）
    chartInstance.current = new SomeChartLibrary(chartRef.current);
  }, []);

  const updateChart = (newData) => {
    flushSync(() => {
      // 确保状态立即更新
      setData(newData);
    });

    // 状态更新完成后，立即更新图表
    chartInstance.current.update(newData);
  };

  return (
    <div>
      <div ref={chartRef} />
      <button onClick={() => updateChart([1, 2, 3, 4])}>更新数据</button>
    </div>
  );
}
```

### 场景 3：测量 DOM

在更新状态后，需要立即测量 DOM 元素。

```javascript
import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';

function MeasureExample() {
  const [items, setItems] = useState(['Item 1', 'Item 2']);
  const [height, setHeight] = useState(0);
  const containerRef = useRef(null);

  const addItem = () => {
    flushSync(() => {
      // 添加新项
      setItems([...items, `Item ${items.length + 1}`]);
    });

    // DOM 已更新，立即测量高度
    const newHeight = containerRef.current.offsetHeight;
    setHeight(newHeight);
  };

  return (
    <div>
      <div ref={containerRef}>
        {items.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>

      <p>容器高度: {height}px</p>
      <button onClick={addItem}>添加项目</button>
    </div>
  );
}
```

### 场景 4：焦点管理

添加元素后，需要立即聚焦到新元素。

```javascript
import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';

function FocusExample() {
  const [inputs, setInputs] = useState([{ id: 1, value: '' }]);
  const lastInputRef = useRef(null);

  const addInput = () => {
    flushSync(() => {
      // 添加新输入框
      setInputs([...inputs, { id: Date.now(), value: '' }]);
    });

    // DOM 已更新，聚焦到新输入框
    lastInputRef.current?.focus();
  };

  return (
    <div>
      {inputs.map((input, index) => (
        <input
          key={input.id}
          ref={index === inputs.length - 1 ? lastInputRef : null}
          value={input.value}
          onChange={(e) => {
            const newInputs = [...inputs];
            newInputs[index].value = e.target.value;
            setInputs(newInputs);
          }}
        />
      ))}
      <button onClick={addInput}>添加输入框</button>
    </div>
  );
}
```

### 场景 5：动画序列

需要按顺序执行多个状态更新，每个更新都触发动画。

```javascript
import { useState } from 'react';
import { flushSync } from 'react-dom';

function AnimationSequence() {
  const [step, setStep] = useState(0);

  const runSequence = async () => {
    // 步骤 1
    flushSync(() => {
      setStep(1);
    });
    await delay(500);

    // 步骤 2
    flushSync(() => {
      setStep(2);
    });
    await delay(500);

    // 步骤 3
    flushSync(() => {
      setStep(3);
    });
    await delay(500);

    // 完成
    setStep(0);
  };

  return (
    <div>
      <div className={`step-${step}`}>
        当前步骤: {step}
      </div>
      <button onClick={runSequence}>开始动画序列</button>
    </div>
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

## 四、对比示例

### 示例 1：滚动到新添加的元素

```javascript
import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';

// ❌ 不使用 flushSync：滚动可能不准确
function WithoutFlushSync() {
  const [messages, setMessages] = useState(['消息 1', '消息 2']);
  const containerRef = useRef(null);

  const addMessage = () => {
    setMessages([...messages, `消息 ${messages.length + 1}`]);

    // DOM 还没更新，滚动位置不正确
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  };

  return (
    <div>
      <div
        ref={containerRef}
        style={{ height: '200px', overflow: 'auto', border: '1px solid #ccc' }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ padding: '10px' }}>
            {msg}
          </div>
        ))}
      </div>
      <button onClick={addMessage}>添加消息</button>
    </div>
  );
}

// ✅ 使用 flushSync：滚动准确
function WithFlushSync() {
  const [messages, setMessages] = useState(['消息 1', '消息 2']);
  const containerRef = useRef(null);

  const addMessage = () => {
    flushSync(() => {
      setMessages([...messages, `消息 ${messages.length + 1}`]);
    });

    // DOM 已更新，滚动位置正确
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  };

  return (
    <div>
      <div
        ref={containerRef}
        style={{ height: '200px', overflow: 'auto', border: '1px solid #ccc' }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ padding: '10px' }}>
            {msg}
          </div>
        ))}
      </div>
      <button onClick={addMessage}>添加消息</button>
    </div>
  );
}
```

### 示例 2：打印状态值

```javascript
import { useState } from 'react';
import { flushSync } from 'react-dom';

function PrintStateExample() {
  const [count, setCount] = useState(0);

  // ❌ 不使用 flushSync：打印旧值
  const handleClick1 = () => {
    setCount(count + 1);
    console.log('Count:', count); // 打印旧值 0
  };

  // ✅ 使用 flushSync：打印新值
  const handleClick2 = () => {
    flushSync(() => {
      setCount(count + 1);
    });
    // 注意：这里仍然是闭包中的旧值
    // 需要通过 ref 或在下次渲染中获取
    console.log('Count:', count); // 仍然是旧值

    // 正确的方式：使用 ref
    // 或者在需要的地方使用回调
  };

  // ✅ 更好的方式：使用函数式更新
  const handleClick3 = () => {
    let newCount;
    flushSync(() => {
      setCount((prev) => {
        newCount = prev + 1;
        return newCount;
      });
    });
    console.log('Count:', newCount); // 打印新值
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick1}>普通更新</button>
      <button onClick={handleClick2}>flushSync（闭包问题）</button>
      <button onClick={handleClick3}>flushSync（正确方式）</button>
    </div>
  );
}
```

## 五、注意事项

### 1. 性能影响

`flushSync` 会强制同步更新，**失去批量更新的性能优势**，应谨慎使用。

```javascript
// ❌ 过度使用：每次更新都触发重新渲染
function BadExample() {
  const [items, setItems] = useState([]);

  const addMultipleItems = () => {
    for (let i = 0; i < 100; i++) {
      flushSync(() => {
        setItems((prev) => [...prev, i]);
      }); // 100 次重新渲染！
    }
  };

  return <button onClick={addMultipleItems}>添加 100 项</button>;
}

// ✅ 好的做法：批量更新
function GoodExample() {
  const [items, setItems] = useState([]);

  const addMultipleItems = () => {
    const newItems = [];
    for (let i = 0; i < 100; i++) {
      newItems.push(i);
    }
    setItems((prev) => [...prev, ...newItems]); // 1 次重新渲染
  };

  return <button onClick={addMultipleItems}>添加 100 项</button>;
}
```

### 2. 只在必要时使用

大多数情况下，React 的默认批量更新机制已经足够好。

```javascript
// ❌ 不必要的使用
function UnnecessaryExample() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    flushSync(() => {
      setCount(count + 1);
    });
    // 没有需要立即访问 DOM 的操作
  };
}

// ✅ 正常使用
function NormalExample() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1); // 让 React 自己优化
  };
}
```

### 3. 避免嵌套使用

```javascript
// ❌ 不好：嵌套 flushSync
function BadNesting() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  const handleClick = () => {
    flushSync(() => {
      setCount1(1);
      flushSync(() => {
        setCount2(2); // 嵌套使用
      });
    });
  };
}

// ✅ 好：平铺使用
function GoodNesting() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  const handleClick = () => {
    flushSync(() => {
      setCount1(1);
    });
    flushSync(() => {
      setCount2(2);
    });
  };
}
```

### 4. 在 useEffect 中使用要小心

```javascript
// ❌ 可能导致无限循环
function DangerousEffect() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    flushSync(() => {
      setCount((prev) => prev + 1); // 无限循环！
    });
  }, [count]);
}

// ✅ 正确使用
function SafeEffect() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count < 10) {
      flushSync(() => {
        setCount((prev) => prev + 1);
      });
    }
  }, [count]);
}
```

## 六、实战案例

### 案例 1：聊天应用自动滚动

```javascript
import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';

function ChatApp() {
  const [messages, setMessages] = useState([
    { id: 1, text: '你好', sender: 'user' },
    { id: 2, text: '你好！有什么可以帮你的吗？', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    // 添加用户消息
    flushSync(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: input, sender: 'user' }
      ]);
      setInput('');
    });

    // DOM 已更新，滚动到底部
    scrollToBottom();

    // 模拟机器人回复
    setTimeout(() => {
      flushSync(() => {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), text: '收到！', sender: 'bot' }
        ]);
      });
      scrollToBottom();
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid #ccc',
          padding: '10px'
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: '10px',
              textAlign: msg.sender === 'user' ? 'right' : 'left'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '8px',
                background: msg.sender === 'user' ? '#007bff' : '#f0f0f0',
                color: msg.sender === 'user' ? '#fff' : '#000'
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', padding: '10px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1, marginRight: '10px' }}
          placeholder="输入消息..."
        />
        <button onClick={sendMessage}>发送</button>
      </div>
    </div>
  );
}
```

### 案例 2：表单字段动态添加

```javascript
import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';

function DynamicForm() {
  const [fields, setFields] = useState([
    { id: 1, name: '', value: '' }
  ]);
  const inputRefs = useRef({});

  const addField = () => {
    const newField = { id: Date.now(), name: '', value: '' };

    flushSync(() => {
      setFields((prev) => [...prev, newField]);
    });

    // DOM 已更新，聚焦到新字段
    inputRefs.current[newField.id]?.focus();
  };

  const removeField = (id) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const updateField = (id, key, value) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  return (
    <div>
      <h2>动态表单</h2>
      {fields.map((field) => (
        <div key={field.id} style={{ marginBottom: '10px' }}>
          <input
            ref={(el) => (inputRefs.current[field.id] = el)}
            value={field.name}
            onChange={(e) => updateField(field.id, 'name', e.target.value)}
            placeholder="字段名"
            style={{ marginRight: '10px' }}
          />
          <input
            value={field.value}
            onChange={(e) => updateField(field.id, 'value', e.target.value)}
            placeholder="字段值"
            style={{ marginRight: '10px' }}
          />
          {fields.length > 1 && (
            <button onClick={() => removeField(field.id)}>删除</button>
          )}
        </div>
      ))}

      <button onClick={addField}>添加字段</button>

      <div style={{ marginTop: '20px' }}>
        <h3>表单数据：</h3>
        <pre>{JSON.stringify(fields, null, 2)}</pre>
      </div>
    </div>
  );
}
```

### 案例 3：拖拽排序后立即保存位置

```javascript
import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';

function DragDropList() {
  const [items, setItems] = useState([
    { id: 1, text: '项目 1' },
    { id: 2, text: '项目 2' },
    { id: 3, text: '项目 3' }
  ]);
  const [draggedItem, setDraggedItem] = useState(null);
  const positionsRef = useRef({});

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const newItems = [...items];
    const draggedIndex = newItems.findIndex((i) => i.id === draggedItem.id);
    const targetIndex = newItems.findIndex((i) => i.id === targetItem.id);

    newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    flushSync(() => {
      setItems(newItems);
    });

    // DOM 已更新，保存新位置到 localStorage
    localStorage.setItem('itemsOrder', JSON.stringify(newItems));
    console.log('位置已保存');

    setDraggedItem(null);
  };

  return (
    <div>
      <h2>拖拽排序列表</h2>
      <div>
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, item)}
            style={{
              padding: '15px',
              margin: '5px 0',
              background: draggedItem?.id === item.id ? '#e0e0e0' : '#f5f5f5',
              border: '1px solid #ddd',
              cursor: 'move',
              userSelect: 'none'
            }}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 七、总结

### 核心要点

1. **作用**：
   - 刷新 updater 更新队列
   - 强制同步更新状态
   - 确保 DOM 立即更新

2. **使用场景**：
   - 更新某些状态后，再更新某些状态
   - 需要立即访问更新后的 DOM
   - 与第三方库集成
   - 焦点管理、滚动控制

3. **性能影响**：
   - 失去批量更新的优势
   - 可能导致多次重新渲染
   - 应谨慎使用

4. **替代方案**：
   - 大多数情况下使用默认的批量更新
   - 使用 useLayoutEffect 处理同步 DOM 操作
   - 使用 useEffect 处理副作用

### 使用建议

**✅ 适合使用 flushSync**：
- 添加元素后需要立即滚动
- 添加元素后需要立即聚焦
- 更新状态后需要立即测量 DOM
- 与第三方库同步状态

**❌ 不适合使用 flushSync**：
- 普通的状态更新
- 批量数据更新
- 不需要立即访问 DOM 的场景
- 性能敏感的操作

### 快速决策

```
需要更新状态？
├─ 更新后需要立即访问 DOM？
│   ├─ 是 → 考虑使用 flushSync ⚡
│   │   ├─ 滚动控制 → flushSync ✅
│   │   ├─ 焦点管理 → flushSync ✅
│   │   └─ DOM 测量 → flushSync ✅
│   └─ 否 → 使用普通更新 ✅
│
├─ 批量更新大量数据？
│   └─ 否 → 不要使用 flushSync ❌
│
└─ 性能敏感？
    └─ 是 → 不要使用 flushSync ❌
```

### 最佳实践

1. **默认使用普通更新**：让 React 自动优化
2. **只在必要时使用 flushSync**：确实需要同步更新时
3. **避免在循环中使用**：会导致大量重新渲染
4. **配合 useRef 使用**：避免闭包问题
5. **注意性能影响**：在性能敏感的场景谨慎使用

`flushSync` 是一个强大但需要谨慎使用的工具，它打破了 React 的批量更新优化，只在确实需要同步更新的场景下使用。
