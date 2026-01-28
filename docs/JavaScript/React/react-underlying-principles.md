---
title: React 底层原理深度解析
createTime: 2026-01-28 10:15:00
tags:
  - React
  - Fiber
  - Hooks
  - 虚拟DOM
  - Diff算法
permalink: /javascript/react/react-underlying-principles/
---

# React 底层原理深度解析

## 📅 文档信息

- **适用版本**：React 16.8+ (Hooks & Fiber)
- **核心主题**：Fiber 架构、Hooks 原理、并发渲染、调度算法

## 一、React 核心架构概览

### 1.1 三层架构

```
┌─────────────────────────────────────────────────────────┐
│                    React 核心架构                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Scheduler  │  │  Reconciler  │  │   Renderer   │  │
│  │    调度器     │  │   协调器      │  │   渲染器      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         ▼                  ▼                  ▼          │
│   任务优先级调度      Fiber树构建/Diff      提交到DOM    │
└─────────────────────────────────────────────────────────┘
```

**Scheduler（调度器）**：
- 调度任务的执行时机
- 根据任务优先级决定执行顺序
- 实现时间切片（Time Slicing），让出主线程

**Reconciler（协调器）**：
- 找出变化的组件（Diff 算法）
- 构建 Fiber 树
- 标记副作用（增删改）
- React 15：递归，不可中断（Stack Reconciler）
- React 16+：循环，可中断（Fiber Reconciler）

**Renderer（渲染器）**：
- 将变化的组件渲染到页面
- 平台相关：React-DOM（Web）、React-Native（移动端）

### 1.2 React 15 vs React 16+ 架构对比

| 维度 | React 15 | React 16+ |
|------|----------|-----------|
| **协调器** | Stack Reconciler（栈调和） | Fiber Reconciler |
| **遍历方式** | 递归 | 循环（链表） |
| **可中断性** | ❌ 不可中断 | ✅ 可中断 |
| **优先级** | ❌ 无 | ✅ 任务优先级 |
| **时间切片** | ❌ 无 | ✅ 支持 |
| **并发渲染** | ❌ 无 | ✅ Concurrent Mode |
| **错误边界** | ❌ 无 | ✅ ErrorBoundary |

## 二、Fiber 架构核心原理

### 2.1 为什么需要 Fiber？

**React 15 的问题**：

```javascript
// React 15 递归更新（伪代码）
function reconcile(element) {
  // 1. 创建/更新当前节点
  updateNode(element);

  // 2. 递归处理子节点
  element.children.forEach(child => {
    reconcile(child); // 递归，无法中断
  });
}

// 问题：
// - 大型组件树递归耗时长（例如 3000+ 节点）
// - JS 执行阻塞主线程，导致页面卡顿
// - 用户交互（点击、输入）无响应
// - 动画掉帧
```

**Fiber 的解决方案**：

- 将递归改为可中断的循环
- 使用链表结构，可以随时暂停和恢复
- 实现时间切片，每 5ms 让出主线程
- 根据任务优先级调度更新

### 2.2 Fiber 数据结构

Fiber 是一个 JavaScript 对象，包含组件的状态、DOM 信息、副作用等。

```javascript
// Fiber 节点结构（简化）
const fiber = {
  // ===== 节点信息 =====
  type: 'div',                  // 组件类型（函数/类/DOM 标签）
  key: null,                    // React 元素的 key
  stateNode: DOMElement,        // 真实 DOM 节点或类组件实例

  // ===== Fiber 链表结构 =====
  return: parentFiber,          // 父 Fiber（指向父节点）
  child: firstChildFiber,       // 第一个子 Fiber
  sibling: nextSiblingFiber,    // 下一个兄弟 Fiber
  index: 0,                     // 在兄弟节点中的索引

  // ===== 双缓存 =====
  alternate: oldFiber,          // 指向上一次渲染的 Fiber（双缓存）

  // ===== 副作用 =====
  flags: Update | Placement,    // 副作用标记（增删改）
  subtreeFlags: 0,              // 子树副作用标记
  deletions: [],                // 需要删除的子 Fiber

  // ===== 状态与 Props =====
  pendingProps: newProps,       // 新的 props
  memoizedProps: oldProps,      // 上次渲染的 props
  memoizedState: state,         // 上次渲染的 state

  // ===== Hooks 链表 =====
  memoizedState: hookList,      // Hooks 链表头（函数组件）

  // ===== 调度相关 =====
  lanes: 0b0001,                // 优先级（位掩码）
  childLanes: 0b0011,           // 子树优先级

  // ===== 其他 =====
  dependencies: null,           // 依赖（Context、订阅）
  mode: ConcurrentMode,         // 渲染模式
};
```

**Fiber 树结构示例**：

```
<App>
  <Header />
  <Content>
    <Sidebar />
    <Main />
  </Content>
</App>

构建的 Fiber 树：
        App
         │
         ▼
      Header ─────→ Content
                       │
                       ▼
                   Sidebar ─────→ Main

链表遍历顺序（深度优先）：
App → Header → Content → Sidebar → Main
```

### 2.3 双缓存机制

React 使用双缓存技术，维护两棵 Fiber 树：

```
┌──────────────┐          ┌──────────────┐
│  current树    │          │  workInProgress树│
│  (当前显示)   │ alternate │  (正在构建)   │
├──────────────┤◄────────►├──────────────┤
│    Fiber1    │          │    Fiber1'   │
│    Fiber2    │          │    Fiber2'   │
│    Fiber3    │          │    Fiber3'   │
└──────────────┘          └──────────────┘

构建完成后，交换指针：
workInProgress 变成 current
```

**为什么要双缓存？**
- 构建新树时，保留旧树用于 Diff
- 渲染过程可中断，不影响当前显示
- commit 阶段一次性提交，避免用户看到中间状态

### 2.4 Fiber 工作流程

```
┌────────────────────────────────────────────────────────┐
│                  Fiber 工作流程                         │
├────────────────────────────────────────────────────────┤
│                                                         │
│  1. Render 阶段（可中断）                                │
│     ├─ beginWork(): 向下遍历，创建/复用 Fiber            │
│     ├─ completeWork(): 向上回溯，创建/更新 DOM           │
│     └─ 时间切片：每 5ms 检查是否需要让出主线程            │
│                                                         │
│  2. Commit 阶段（同步，不可中断）                         │
│     ├─ before mutation: 执行 getSnapshotBeforeUpdate   │
│     ├─ mutation: 提交 DOM 变更                          │
│     └─ layout: 执行 useLayoutEffect、componentDidMount │
│                                                         │
└────────────────────────────────────────────────────────┘
```

**Render 阶段详细流程**：

```javascript
// 开始工作单元
function performUnitOfWork(fiber) {
  // 1. 向下：beginWork
  const next = beginWork(fiber);

  if (next) {
    // 有子节点，继续向下
    workInProgress = next;
  } else {
    // 没有子节点，向上回溯
    completeUnitOfWork(fiber);
  }
}

// beginWork: 创建子 Fiber
function beginWork(fiber) {
  // 根据 fiber.type 处理不同类型组件
  if (fiber.tag === FunctionComponent) {
    // 函数组件：执行函数，获取 children
    return updateFunctionComponent(fiber);
  } else if (fiber.tag === ClassComponent) {
    // 类组件：调用 render()
    return updateClassComponent(fiber);
  } else if (fiber.tag === HostComponent) {
    // DOM 元素：处理 props
    return updateHostComponent(fiber);
  }
}

// completeWork: 创建/更新 DOM
function completeWork(fiber) {
  if (fiber.tag === HostComponent) {
    if (fiber.stateNode === null) {
      // 创建 DOM 节点
      fiber.stateNode = document.createElement(fiber.type);
    }
    // 更新属性
    updateProperties(fiber.stateNode, fiber.memoizedProps, fiber.pendingProps);
  }
}

// 向上回溯
function completeUnitOfWork(fiber) {
  let completedWork = fiber;

  while (completedWork !== null) {
    // 完成当前节点
    completeWork(completedWork);

    // 有兄弟节点，处理兄弟
    if (completedWork.sibling !== null) {
      workInProgress = completedWork.sibling;
      return;
    }

    // 回到父节点
    completedWork = completedWork.return;
  }
}
```

### 2.5 时间切片原理

```javascript
// 时间切片实现（简化）
function workLoopConcurrent() {
  // 在浏览器有空闲时间时工作
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

// 是否应该让出主线程
function shouldYield() {
  const currentTime = performance.now();
  // 每 5ms 检查一次
  return currentTime >= deadline;
}

// 调度下一个工作单元
function scheduleCallback(callback) {
  requestIdleCallback((idleDeadline) => {
    deadline = idleDeadline.timeRemaining();
    callback();
  });
}
```

**时间切片优势**：
- 长任务分割成多个小任务
- 每个小任务执行 5ms 后让出主线程
- 浏览器可以响应用户交互、渲染动画
- 避免页面卡顿

## 三、Diff 算法原理

### 3.1 Diff 策略

React 的 Diff 算法基于三个假设：

1. **不同类型的元素会产生不同的树**
   - 如果父节点类型变了（div → span），直接删除旧树，创建新树
   - 不会尝试复用子节点

2. **开发者可以通过 key 暗示哪些子元素可以复用**
   - 使用 key 标识元素身份
   - 相同 key 的元素会被复用

3. **只做同层比较**
   - 不跨层级比较节点
   - 时间复杂度从 O(n³) 降到 O(n)

### 3.2 单节点 Diff

```javascript
// 单节点 Diff 流程
function reconcileSingleElement(returnFiber, currentFiber, element) {
  const key = element.key;
  let child = currentFiber;

  // 1. 上次渲染有节点
  while (child !== null) {
    // 1.1 key 相同
    if (child.key === key) {
      // 1.1.1 type 也相同，可以复用
      if (child.type === element.type) {
        deleteRemainingChildren(returnFiber, child.sibling); // 删除其他兄弟节点
        const existing = useFiber(child, element.props);     // 复用
        return existing;
      }
      // 1.1.2 type 不同，删除所有旧节点
      deleteRemainingChildren(returnFiber, child);
      break;
    }
    // 1.2 key 不同，删除该节点，继续比较兄弟节点
    deleteChild(returnFiber, child);
    child = child.sibling;
  }

  // 2. 创建新 Fiber
  const created = createFiberFromElement(element);
  return created;
}
```

**示例**：

```javascript
// 更新前
<div key="a">A</div>

// 更新后
<p key="a">A</p>

// 结果：key 相同但 type 不同，删除旧节点，创建新节点
```

### 3.3 多节点 Diff

多节点 Diff 分为三轮遍历：

**第一轮：处理更新节点**

```javascript
// 从头开始比较
let i = 0;
for (; i < newChildren.length && i < oldFiber.length; i++) {
  if (newChildren[i].key !== oldFiber.key) {
    break; // key 不同，跳出
  }
  if (newChildren[i].type === oldFiber.type) {
    // 可以复用
    updateFiber(oldFiber, newChildren[i]);
  } else {
    // 不能复用
    break;
  }
  oldFiber = oldFiber.sibling;
}
```

**第二轮：处理剩余新节点（新增）**

```javascript
if (oldFiber === null) {
  // 旧节点已经遍历完，剩下的都是新增
  for (; i < newChildren.length; i++) {
    createFiber(newChildren[i]);
  }
  return;
}
```

**第三轮：处理剩余旧节点（删除或移动）**

```javascript
// 1. 将剩余旧节点放入 Map（key -> fiber）
const existingChildren = new Map();
let oldFiberTemp = oldFiber;
while (oldFiberTemp) {
  existingChildren.set(oldFiberTemp.key || oldFiberTemp.index, oldFiberTemp);
  oldFiberTemp = oldFiberTemp.sibling;
}

// 2. 遍历剩余新节点
for (; i < newChildren.length; i++) {
  const newChild = newChildren[i];
  const matchedFiber = existingChildren.get(newChild.key || i);

  if (matchedFiber) {
    // 找到了，复用并移动
    if (matchedFiber.type === newChild.type) {
      updateFiber(matchedFiber, newChild);
      existingChildren.delete(newChild.key || i);
    }
  } else {
    // 没找到，创建新节点
    createFiber(newChild);
  }
}

// 3. 删除 Map 中剩余的旧节点
existingChildren.forEach(child => {
  deleteChild(child);
});
```

**完整示例**：

```javascript
// 更新前
[A, B, C, D]

// 更新后
[A, C, E, B]

// 第一轮：A-A 匹配，复用
// 第二轮：B-C 不匹配，跳出
// 第三轮：
//   - 旧节点 Map: { B, C, D }
//   - 遍历 [C, E, B]
//     - C: 在 Map 中找到，复用并移动
//     - E: 不在 Map 中，创建
//     - B: 在 Map 中找到，复用并移动
//   - Map 剩余 D，删除

// 结果：A 不动，C 移动，E 新增，B 移动，D 删除
```

### 3.4 Diff 优化：lastPlacedIndex

React 使用 `lastPlacedIndex` 减少移动次数：

```javascript
// 记录最后一个可复用节点在旧列表中的位置
let lastPlacedIndex = 0;

for (let i = 0; i < newChildren.length; i++) {
  const newChild = newChildren[i];
  const matchedFiber = existingChildren.get(newChild.key);

  if (matchedFiber) {
    const oldIndex = matchedFiber.index;

    if (oldIndex < lastPlacedIndex) {
      // 旧位置 < 最后复用位置，需要移动
      placeChild(matchedFiber, i);
    } else {
      // 不需要移动
      lastPlacedIndex = oldIndex;
    }
  }
}
```

**示例**：

```javascript
// 旧: A(0) B(1) C(2) D(3)
// 新: A C D B

// A: oldIndex=0, lastPlacedIndex=0, 不移动, lastPlacedIndex=0
// C: oldIndex=2, lastPlacedIndex=0, 不移动, lastPlacedIndex=2
// D: oldIndex=3, lastPlacedIndex=2, 不移动, lastPlacedIndex=3
// B: oldIndex=1, lastPlacedIndex=3, oldIndex < lastPlacedIndex, 移动

// 只需移动 B
```

## 四、Hooks 原理

### 4.1 Hooks 数据结构

每个 Hook 是一个对象，通过链表连接：

```javascript
// Hook 结构
const hook = {
  memoizedState: null,   // Hook 的状态值
  baseState: null,       // 基础状态
  baseQueue: null,       // 基础更新队列
  queue: null,           // 更新队列
  next: null,            // 下一个 Hook
};

// Fiber 的 memoizedState 指向 Hooks 链表
fiber.memoizedState = hook1 → hook2 → hook3 → null
```

**不同 Hook 的 memoizedState**：

```javascript
useState: state 值
useReducer: state 值
useEffect: effect 对象 { create, destroy, deps, ... }
useRef: { current: value }
useMemo: [value, deps]
useCallback: [callback, deps]
```

### 4.2 useState 原理

```javascript
// 简化的 useState 实现
function useState(initialState) {
  // 获取当前 Hook
  const hook = mountWorkInProgressHook();

  // 初始化状态
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  hook.memoizedState = initialState;

  // 创建更新队列
  const queue = {
    pending: null,           // 待处理的更新
    dispatch: null,          // dispatch 函数
    lastRenderedState: initialState,
  };
  hook.queue = queue;

  // 创建 dispatch 函数
  const dispatch = (action) => {
    // 创建 update 对象
    const update = {
      action,
      next: null,
    };

    // 加入更新队列（环形链表）
    if (queue.pending === null) {
      update.next = update;
    } else {
      update.next = queue.pending.next;
      queue.pending.next = update;
    }
    queue.pending = update;

    // 调度更新
    scheduleUpdateOnFiber(fiber);
  };
  queue.dispatch = dispatch;

  return [hook.memoizedState, dispatch];
}

// 更新时的 useState
function updateState() {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  // 执行所有更新
  let baseState = hook.baseState;
  let update = queue.pending;

  if (update !== null) {
    // 遍历环形链表
    const first = update.next;
    do {
      const action = update.action;
      baseState = typeof action === 'function' ? action(baseState) : action;
      update = update.next;
    } while (update !== first);

    queue.pending = null;
  }

  hook.memoizedState = baseState;
  return [baseState, queue.dispatch];
}
```

### 4.3 useEffect 原理

```javascript
// 简化的 useEffect 实现
function useEffect(create, deps) {
  const hook = mountWorkInProgressHook();

  // 保存 effect 对象
  const effect = {
    tag: HookHasEffect,     // 标记需要执行
    create,                 // 副作用函数
    destroy: undefined,     // 清理函数
    deps,                   // 依赖数组
    next: null,             // 下一个 effect
  };

  // 加入 effect 链表
  fiber.updateQueue = pushEffect(effect);

  hook.memoizedState = effect;
}

// 更新时的 useEffect
function updateEffect(create, deps) {
  const hook = updateWorkInProgressHook();
  const prevEffect = hook.memoizedState;

  // 比较依赖
  if (deps !== null) {
    const prevDeps = prevEffect.deps;

    if (areHookInputsEqual(deps, prevDeps)) {
      // 依赖未变化，不执行
      const effect = {
        tag: HookPassive,  // 标记不执行
        create,
        destroy: prevEffect.destroy,
        deps,
        next: null,
      };
      hook.memoizedState = effect;
      return;
    }
  }

  // 依赖变化，需要执行
  const effect = {
    tag: HookHasEffect | HookPassive,
    create,
    destroy: undefined,
    deps,
    next: null,
  };
  hook.memoizedState = effect;
}

// commit 阶段执行 effect
function commitEffects() {
  // 1. 执行上一次的清理函数
  effect.destroy && effect.destroy();

  // 2. 执行新的副作用
  const destroy = effect.create();
  effect.destroy = destroy;
}
```

**useEffect 执行时机**：

```
┌─────────────────────────────────────────────────────┐
│              useEffect 执行时机                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. Render 阶段（可中断）                             │
│     - 调用 useEffect，保存 effect 对象                │
│     - 不执行副作用函数                                │
│                                                      │
│  2. Commit 阶段 - layout 之后（同步）                 │
│     - 执行清理函数（上次的 destroy）                   │
│     - 执行副作用函数（本次的 create）                  │
│     - 保存清理函数                                    │
│                                                      │
│  3. 异步调度                                         │
│     - useEffect 的执行被放入宏任务                    │
│     - 不阻塞浏览器绘制                                │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 4.4 为什么 Hooks 必须在顶层调用？

```javascript
// ❌ 错误：条件调用
function Component() {
  if (condition) {
    const [state, setState] = useState(0); // 违反规则
  }
}

// Hooks 链表：
// 首次渲染（condition = true）：  hook1 (useState)
// 第二次渲染（condition = false）：链表为空
// 第三次渲染（condition = true）：期望 hook1，但链表不匹配 ❌
```

**React 如何定位 Hook**：

```javascript
let currentHook = null;  // 当前正在处理的 Hook
let workInProgressHook = null;  // 正在构建的 Hook

function mountWorkInProgressHook() {
  const hook = { memoizedState: null, queue: null, next: null };

  if (workInProgressHook === null) {
    // 第一个 Hook
    fiber.memoizedState = workInProgressHook = hook;
  } else {
    // 后续 Hook，加入链表
    workInProgressHook = workInProgressHook.next = hook;
  }

  return hook;
}

function updateWorkInProgressHook() {
  // 从旧 Fiber 的链表中取 Hook
  if (currentHook === null) {
    currentHook = fiber.alternate.memoizedState;
  } else {
    currentHook = currentHook.next;
  }

  // 复制到新 Fiber
  const newHook = { ...currentHook };
  if (workInProgressHook === null) {
    workInProgressHook = newHook;
  } else {
    workInProgressHook.next = newHook;
  }

  return newHook;
}
```

**核心原因**：

- Hooks 通过链表存储，依赖调用顺序
- 条件调用会打乱链表顺序
- React 无法正确匹配新旧 Hook

## 五、调度与优先级

### 5.1 优先级分类

React 使用 Lanes 模型管理优先级（31 位二进制）：

```javascript
const SyncLane = 0b0000000000000000000000000000001;           // 同步（最高优先级）
const InputContinuousLane = 0b0000000000000000000000000000100; // 连续输入（拖拽、滚动）
const DefaultLane = 0b0000000000000000000000000010000;        // 默认（点击事件）
const TransitionLane = 0b0000000000000000000001000000000;     // 过渡（startTransition）
const IdleLane = 0b0100000000000000000000000000000;           // 空闲（最低优先级）
```

**为什么用位掩码？**
- 快速判断优先级（位运算）
- 支持多个优先级同时存在
- 批量处理相同优先级的更新

### 5.2 任务调度流程

```javascript
// 简化的调度流程
function ensureRootIsScheduled(root) {
  // 1. 获取最高优先级
  const nextLanes = getNextLanes(root);

  if (nextLanes === NoLanes) {
    return; // 没有任务
  }

  // 2. 获取对应的优先级
  const newCallbackPriority = getHighestPriorityLane(nextLanes);

  // 3. 调度任务
  if (newCallbackPriority === SyncLane) {
    // 同步任务，立即执行
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
  } else {
    // 异步任务，根据优先级调度
    const schedulerPriority = lanesToSchedulerPriority(newCallbackPriority);
    scheduleCallback(schedulerPriority, performConcurrentWorkOnRoot.bind(null, root));
  }
}
```

### 5.3 饥饿问题

**问题**：高优先级任务不断插入，低优先级任务永远得不到执行。

**解决方案**：优先级提升

```javascript
// 检查任务是否过期
function markStarvedLanesAsExpired(root, currentTime) {
  const pendingLanes = root.pendingLanes;

  for (let lane of pendingLanes) {
    const expirationTime = getExpirationTime(lane);

    if (expirationTime <= currentTime) {
      // 任务过期，提升为同步优先级
      lane = SyncLane;
    }
  }
}
```

## 六、并发渲染

### 6.1 Concurrent Mode

并发模式允许 React 同时准备多个版本的 UI：

```javascript
// 启用并发模式（React 18）
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

**核心特性**：
- 可中断渲染
- 时间切片
- 优先级调度
- startTransition API

### 6.2 startTransition

```javascript
import { startTransition } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;

    // 高优先级：立即更新输入框
    setQuery(value);

    // 低优先级：延迟更新搜索结果
    startTransition(() => {
      setResults(search(value));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      <Results data={results} />
    </div>
  );
}
```

**原理**：

```javascript
function startTransition(callback) {
  // 1. 降低优先级
  const previousPriority = currentUpdatePriority;
  currentUpdatePriority = TransitionLane;

  try {
    // 2. 执行回调（setState 会使用低优先级）
    callback();
  } finally {
    // 3. 恢复优先级
    currentUpdatePriority = previousPriority;
  }
}
```

### 6.3 useDeferredValue

```javascript
function Component({ query }) {
  // 延迟更新的值（低优先级）
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <p>当前输入：{query}</p>
      <ExpensiveList query={deferredQuery} />
    </div>
  );
}
```

**原理**：

```javascript
function useDeferredValue(value) {
  const [deferredValue, setDeferredValue] = useState(value);

  useEffect(() => {
    // 使用 startTransition 更新
    startTransition(() => {
      setDeferredValue(value);
    });
  }, [value]);

  return deferredValue;
}
```

## 七、性能优化原理

### 7.1 React.memo

```javascript
const MemoizedComponent = React.memo(Component, arePropsEqual);

// 原理：浅比较 props
function arePropsEqual(prevProps, nextProps) {
  return shallowEqual(prevProps, nextProps);
}
```

### 7.2 useMemo / useCallback

```javascript
// useMemo: 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// useCallback: 缓存函数
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// 原理：
function useMemo(create, deps) {
  const hook = updateWorkInProgressHook();
  const prevDeps = hook.memoizedState?.[1];

  if (areHookInputsEqual(deps, prevDeps)) {
    // 依赖未变，返回缓存值
    return hook.memoizedState[0];
  }

  // 依赖变化，重新计算
  const value = create();
  hook.memoizedState = [value, deps];
  return value;
}
```

### 7.3 虚拟列表

长列表只渲染可见部分：

```javascript
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);

  // 计算可见范围
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

  // 只渲染可见项
  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
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

## 八、总结

### 8.1 核心原理总结

| 模块 | 核心技术 | 解决的问题 |
|------|---------|-----------|
| **Fiber** | 链表 + 双缓存 | 可中断渲染、时间切片 |
| **Diff** | 同层比较 + key | 最小化 DOM 操作 |
| **Hooks** | 链表 + 闭包 | 函数组件状态管理 |
| **调度** | Lanes + 优先级 | 任务优先级调度 |
| **并发** | Concurrent Mode | 提升用户体验 |

### 8.2 设计思想

1. **可中断**：Fiber 架构支持暂停和恢复
2. **优先级**：高优先级任务优先执行
3. **批量更新**：合并多次 setState
4. **声明式**：描述 UI 应该是什么样子
5. **组件化**：高内聚、低耦合

### 8.3 学习建议

1. 理解 Fiber 架构，知道为什么 React 16 是革命性的
2. 掌握 Hooks 原理，理解为什么有使用规则
3. 学习调度和优先级，写出高性能应用
4. 阅读源码，了解实现细节
5. 实践并发特性，提升用户体验

## 🔗 参考资源

- [React 官方文档](https://react.dev/)
- [React 源码](https://github.com/facebook/react)
- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
- [Inside Fiber: in-depth overview of the new reconciliation algorithm in React](https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react)
