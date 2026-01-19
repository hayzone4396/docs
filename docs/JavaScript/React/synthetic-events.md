---
title: React 合成事件原理
date: 2026-01-19 09:37:40
tags:
  - React
  - 合成事件
  - 事件委托
categories:
  - React
---

# React 合成事件原理

## 什么是合成事件

React 的合成事件（Synthetic Events）是 React 对原生 DOM 事件的跨浏览器包装器。它并不是直接给 DOM 元素绑定事件，而是通过事件委托的方式统一管理。

## 事件委托机制

### React 17+ 版本的变化

在 React 17 及以后的版本中，事件委托机制发生了重要变化：

- **委托目标**：事件委托到 `#root` 容器，而不是 `document`
- **绑定方式**：不是通过 `addEventListener` 来处理事件，而是通过合成事件属性
- **阶段处理**：同时处理捕获阶段和冒泡阶段

:::tip 为什么委托到 #root？
所有 React 组件最终都会挂载到 `#root` 容器上，在这里做事件绑定可以更好地控制事件流，避免与其他非 React 代码冲突。
:::

### React 16 版本的机制

在 React 16 版本中：
- 事件委托给 `document`
- 只处理冒泡阶段
- 性能相对较低

## 合成事件工作原理

### 1. 事件属性设置

当你在 React 组件中设置 `onClick` 或 `onClickCapture` 等属性时：

```jsx
<button onClick={handleClick}>点击我</button>
```

React 并没有给 `button` 元素本身绑定事件，而是设置了一个合成事件属性。

### 2. 事件传播

当事件触发时，根据原生事件传播机制，事件会传播到 `#root` 容器。React 在 `#root` 上做了两个阶段的事件绑定：

#### 捕获阶段

```javascript
root.addEventListener('click', ev => {
    let path = ev.path; // path: [事件源 -> ... -> window] 所有祖先元素
    [...path].reverse().forEach(ele => {
        let handle = ele.onClickCapture;
        if (handle) handle();
    });
}, true); // 第三个参数为 true 表示捕获阶段
```

#### 冒泡阶段

```javascript
root.addEventListener('click', ev => {
    let path = ev.path; // path: [事件源 -> ... -> window] 所有祖先元素
    path.forEach(ele => {
        let handle = ele.onClick;
        if (handle) handle();
    });
}, false); // 第三个参数为 false 表示冒泡阶段
```

### 3. 执行流程

1. 事件在真实 DOM 上触发
2. 事件沿着 DOM 树传播到 `#root`
3. React 在 `#root` 上的监听器被触发
4. React 根据 `ev.path` 分析事件传播路径
5. 按照路径顺序执行对应阶段的合成事件处理函数

## 合成事件对象

### 基本使用

```jsx
const handleClick = (ev) => {
    console.log(ev); // 合成事件对象 SyntheticEvent
};
```

### 事件缓存

React 对合成事件做了缓存机制优化性能：

```javascript
ev.persist(); // 缓存合成事件的信息
```

## 阻止事件传播

### 1. 阻止合成事件传播

```javascript
ev.stopPropagation();
```

这个方法会同时：
- ✅ 阻止原生事件的传播
- ✅ 阻止合成事件的传播

### 2. 只阻止原生事件传播

```javascript
ev.nativeEvent.stopPropagation();
```

这个方法：
- ✅ 阻止原生事件的传播
- ❌ 不能阻止合成事件的传播

### 3. 完全阻止（推荐）

```javascript
ev.nativeEvent.stopImmediatePropagation();
```

这个方法：
- ✅ 阻止原生事件的传播
- ✅ 阻止 `#root` 上其他方法的执行
- ✅ 最彻底的阻止方式

## 完整示例

```jsx
import React from 'react';

function EventDemo() {
  const handleOuterClick = (ev) => {
    console.log('外层点击');
  };

  const handleOuterClickCapture = (ev) => {
    console.log('外层捕获');
  };

  const handleInnerClick = (ev) => {
    console.log('内层点击');
    // 阻止事件继续传播
    ev.stopPropagation();
  };

  const handleInnerClickCapture = (ev) => {
    console.log('内层捕获');
  };

  return (
    <div
      onClick={handleOuterClick}
      onClickCapture={handleOuterClickCapture}
    >
      <button
        onClick={handleInnerClick}
        onClickCapture={handleInnerClickCapture}
      >
        点击我
      </button>
    </div>
  );
}

// 点击按钮，输出顺序：
// 外层捕获 -> 内层捕获 -> 内层点击
// (由于 stopPropagation，外层点击不会执行)
```

## 优势总结

1. **无需手动管理事件委托**：React 内部已经处理，开发者无需担心
2. **跨浏览器一致性**：合成事件抹平了浏览器差异
3. **性能优化**：通过事件委托减少事件监听器数量
4. **自动清理**：组件卸载时自动清理事件，防止内存泄漏
5. **事件池优化**：通过事件对象复用提升性能

## 注意事项

:::warning 异步访问事件对象
如果需要在异步代码中访问事件对象，必须调用 `ev.persist()` 进行缓存，否则事件对象会被清空。

```javascript
const handleClick = (ev) => {
  ev.persist(); // 缓存事件对象
  setTimeout(() => {
    console.log(ev.type); // 可以正常访问
  }, 1000);
};
```
:::

## 参考资源

- [React 官方文档 - 事件处理](https://react.dev/learn/responding-to-events)
- [React 17 事件委托变化](https://legacy.reactjs.org/blog/2020/08/10/react-v17-rc.html#changes-to-event-delegation)
