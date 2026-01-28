---
title: Vue 底层原理深度解析（Vue 2 & Vue 3）
createTime: 2026-01-28 10:00:00
tags:
  - Vue
  - Vue2
  - Vue3
  - 响应式
  - 虚拟DOM
  - Diff算法
  - 编译器
permalink: /javascript/vue/vue-underlying-principles/
---

# Vue 底层原理深度解析（Vue 2 & Vue 3）

## 📅 文档信息

- **适用版本**：Vue 2.x / Vue 3.x
- **核心主题**：设计理念、响应式系统、虚拟DOM、Diff算法、编译器、性能优化

## 一、Vue 设计理念与核心架构

### 1.1 设计理念：命令式 + 声明式

Vue 采用**命令式与声明式相结合**的设计理念：

```javascript
// ❌ 纯命令式（原生 JS）
const div = document.createElement('div')
div.textContent = 'Hello'
div.className = 'container'
document.body.appendChild(div)

// ✅ 声明式（Vue）
<template>
  <div class="container">Hello</div>
</template>
```

**设计目标**：
- **开发者侧**：使用声明式语法编写代码（更简洁、可维护）
- **框架内部**：用命令式实现（更高效、可控）
- **平衡点**：尽可能减少 DOM 操作，提升性能的同时保持良好的开发体验

### 1.2 组件级粒度更新

```javascript
// Vue 的响应式粒度
const state = reactive({
  user: { name: 'Tom' },
  list: [1, 2, 3]
})

// ⚠️ 更新粒度：组件级别
// 当 state.user.name 改变时，整个组件会重新渲染
// 但不会影响其他组件
```

**为什么是组件级粒度？**

- Vue 和 React 的响应式精细度只能到达**组件级别**
- 不能再细化到元素级别（会导致框架过于复杂，性能反而下降）
- Hooks 与页面渲染无直接关系，只是逻辑复用手段

**这带来的问题**：

- 如果组件内数据结构发生变化，组件会全量更新渲染
- 所以需要虚拟 DOM 和 Diff 算法来优化更新过程

### 1.3 三大核心系统

Vue 的底层架构由三大核心系统组成：

```
┌─────────────────────────────────────────────────────────┐
│                    Vue 核心架构                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   编译器      │  │  响应式系统   │  │  渲染系统     │  │
│  │  Compiler    │  │  Reactivity  │  │  Renderer    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         ▼                  ▼                  ▼          │
│   Template -> AST    数据劫持 + 依赖收集    VNode -> DOM │
└─────────────────────────────────────────────────────────┘
```

**编译器（Compiler）**：
- 将模板字符串编译成渲染函数
- 优化静态节点，提取静态内容
- 生成代码字符串，最终通过 `new Function()` 创建渲染函数

**响应式系统（Reactivity）**：
- Vue 2：基于 `Object.defineProperty` 实现数据劫持
- Vue 3：基于 `Proxy` 实现更强大的响应式
- 依赖收集与派发更新机制

**渲染系统（Renderer）**：
- 虚拟 DOM (VNode) 的创建与更新
- Diff 算法优化 DOM 操作
- 平台无关的渲染抽象层（支持 Web、Weex、小程序等）

### 1.4 Vue 2 vs Vue 3 架构对比

| 维度 | Vue 2 | Vue 3 |
|------|-------|-------|
| **响应式** | Object.defineProperty | Proxy |
| **编译优化** | 标记静态节点 | PatchFlag + Block Tree + 静态提升 |
| **组合式API** | ❌ 无 | ✅ Composition API |
| **TypeScript** | 支持一般 | 完全用 TS 重写 |
| **Tree-shaking** | 不支持 | 支持按需引入 |
| **性能** | 基准 | 快 1.3~2 倍 |
| **包大小** | ~32KB | ~16KB (tree-shaking 后) |

## 二、响应式系统原理

### 2.1 Vue 2 响应式：Object.defineProperty

#### 核心原理

Vue 2 通过 `Object.defineProperty` 递归遍历 data 对象的所有属性，将其转换为 getter/setter，从而实现数据劫持。

```javascript
// Vue 2 响应式核心实现
function defineReactive(obj, key, val) {
  // 每个属性都有一个依赖收集器
  const dep = new Dep();

  // 递归处理嵌套对象
  observe(val);

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 依赖收集：当前 Watcher 订阅这个属性
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;

      val = newVal;
      // 新值也需要响应式处理
      observe(newVal);

      // 派发更新：通知所有订阅者
      dep.notify();
    }
  });
}
```

#### 依赖收集机制

```
┌─────────────────────────────────────────────────────┐
│              依赖收集流程（Vue 2）                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. 组件渲染，触发 getter                             │
│     ↓                                                │
│  2. Dep.target 指向当前 Watcher                      │
│     ↓                                                │
│  3. dep.depend() 收集依赖                            │
│     ↓                                                │
│  4. 数据变化，触发 setter                             │
│     ↓                                                │
│  5. dep.notify() 通知所有 Watcher                    │
│     ↓                                                │
│  6. Watcher 执行更新，重新渲染组件                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Dep（依赖收集器）**：

```javascript
class Dep {
  constructor() {
    this.subs = []; // 订阅者数组
  }

  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub);
  }

  // 收集依赖
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  // 通知所有订阅者更新
  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

// 全局唯一的当前 Watcher
Dep.target = null;
```

**Watcher（订阅者）**：

```javascript
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.getter = expOrFn; // 渲染函数或计算属性函数
    this.cb = cb; // 回调函数
    this.deps = []; // 依赖的 Dep 列表
    this.value = this.get();
  }

  get() {
    // 将自己设置为全局 Watcher
    Dep.target = this;
    // 执行渲染函数，触发 getter，完成依赖收集
    const value = this.getter.call(this.vm, this.vm);
    // 清空全局 Watcher
    Dep.target = null;
    return value;
  }

  update() {
    // 数据变化时，重新求值
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }

  addDep(dep) {
    this.deps.push(dep);
    dep.addSub(this);
  }
}
```

#### Vue 2 响应式局限性

```javascript
// ❌ 问题 1：无法检测新增属性
const vm = new Vue({
  data: {
    obj: { a: 1 }
  }
});

vm.obj.b = 2; // 不会触发更新（未被劫持）

// ✅ 解决方案：使用 Vue.set
Vue.set(vm.obj, 'b', 2);

// ❌ 问题 2：无法检测数组索引和长度变化
vm.arr[0] = 'new'; // 不会触发更新
vm.arr.length = 0; // 不会触发更新

// ✅ 解决方案：使用数组变异方法
vm.arr.splice(0, 1, 'new');
```

**为什么有这些限制？**

- `Object.defineProperty` 只能劫持已存在的属性
- 性能考虑：递归劫持所有属性开销大，数组索引劫持更慢
- Vue 2 通过重写数组方法（push、pop、splice 等）来监听数组变化

### 2.2 Vue 3 响应式：Proxy

#### 核心原理

Vue 3 使用 ES6 的 `Proxy` API，可以直接监听整个对象，无需递归遍历属性。

```javascript
// Vue 3 响应式核心实现
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);

      const res = Reflect.get(target, key, receiver);

      // 懒递归：只有访问到嵌套对象时才代理
      if (isObject(res)) {
        return reactive(res);
      }

      return res;
    },

    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);

      // 派发更新
      if (oldValue !== value) {
        trigger(target, key);
      }

      return result;
    },

    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      // 删除属性也要触发更新
      trigger(target, key);
      return result;
    }
  });
}
```

#### 依赖收集与触发更新

```javascript
// 全局依赖映射表
const targetMap = new WeakMap();

// 依赖收集
function track(target, key) {
  if (!activeEffect) return;

  // targetMap: { target -> depsMap }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  // depsMap: { key -> dep }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  // dep: Set<effect>
  dep.add(activeEffect);
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

// 副作用函数
let activeEffect = null;

function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn;
    fn();
    activeEffect = null;
  };

  effectFn();
  return effectFn;
}
```

#### Proxy vs Object.defineProperty

| 特性 | Object.defineProperty | Proxy |
|------|----------------------|-------|
| **监听新增属性** | ❌ 不支持 | ✅ 支持 |
| **监听删除属性** | ❌ 不支持 | ✅ 支持（deleteProperty） |
| **监听数组索引** | ❌ 性能问题 | ✅ 支持 |
| **监听数组长度** | ❌ 不支持 | ✅ 支持 |
| **嵌套对象** | 初始化时递归 | 懒递归（访问时才代理） |
| **性能** | 初始化慢 | 初始化快，运行时稍慢 |
| **兼容性** | IE9+ | 不支持 IE（无法 polyfill） |

### 2.3 ref vs reactive

**reactive**：用于对象的深度响应式转换

```javascript
const state = reactive({
  count: 0,
  nested: { value: 1 }
});

// ✅ 正常工作
state.count++; // 触发更新
state.nested.value++; // 触发更新

// ❌ 失去响应式
let { count } = state; // 解构后失去响应式
count++; // 不会触发更新
```

**ref**：用于基本类型的响应式包装

```javascript
const count = ref(0);

// 访问需要 .value
console.log(count.value); // 0
count.value++; // 触发更新

// 在模板中自动解包
<template>
  <div>{{ count }}</div> <!-- 无需 .value -->
</template>
```

**ref 的底层实现**：

```javascript
function ref(value) {
  return {
    _isRef: true,
    get value() {
      track(this, 'value');
      return value;
    },
    set value(newVal) {
      value = newVal;
      trigger(this, 'value');
    }
  };
}
```

## 三、虚拟 DOM 与 Diff 算法

### 3.1 为什么需要虚拟 DOM？

#### 原因1：跨平台能力

```javascript
// ✅ JS 对象属于 ES 范畴
const vnode = { type: 'div', props: { class: 'container' } }

// ❌ DOM 属于 WebAPI 范畴
const div = document.createElement('div')
```

**优势**：
- 如果使用真实 DOM，只能绑定在浏览器平台
- 使用 JS 对象，只要支持 JS 的环境就能运行
- 可以渲染到不同平台：Web、Weex（移动端）、小程序、Electron（桌面端）

#### 原因2：性能优化

**直接操作 DOM 的问题**：
- DOM 操作非常昂贵（浏览器重排/重绘）
- 频繁操作 DOM 导致性能问题
- 难以追踪状态变化

**虚拟 DOM 的优势**：

```javascript
// 场景：更新列表
const oldList = [1, 2, 3, 4, 5]
const newList = [1, 3, 4, 5, 6]

// ❌ 直接操作 DOM（性能差）
container.innerHTML = ''
newList.forEach(item => {
  const li = document.createElement('li')
  li.textContent = item
  container.appendChild(li)
})

// ✅ 虚拟 DOM + Diff 算法（性能好）
// 1. 对比新旧虚拟 DOM
// 2. 找出最小差异
// 3. 只更新变化的部分
// 结果：删除元素2，添加元素6
```

#### 原因3：文档碎片优化

```javascript
// Vue 的渲染过程
// 1. 创建虚拟 DOM（JS 对象）
// 2. 在文档碎片中操作（内存中）
// 3. 一次性挂载到真实 DOM

const fragment = document.createDocumentFragment()
// 在 fragment 中进行大量 DOM 操作
// 最后一次性 appendChild
```

**好处**：
- 减少回流（reflow）和重绘（repaint）
- 批量更新，减少 DOM 操作次数

### 3.2 VNode 结构

```javascript
// Vue 3 VNode 简化结构
const vnode = {
  type: 'div',           // 元素类型
  props: {               // 属性
    id: 'app',
    class: 'container'
  },
  children: [            // 子节点
    {
      type: 'p',
      children: 'Hello Vue'
    }
  ],
  key: null,             // 列表渲染的唯一标识
  patchFlag: 0,          // Vue 3 优化标记
  el: null,              // 真实 DOM 引用
  component: null,       // 组件实例
  shapeFlag: 1           // VNode 类型标记
};
```

### 3.3 Diff 算法核心思想

Vue 的 Diff 算法采用**同层比较**策略，时间复杂度为 O(n)。

```
旧 VNode:  A  B  C  D
新 VNode:  A  C  D  E

Diff 过程：
1. 比较 A - A (相同，复用)
2. 比较 B - C (不同)
3. 继续比较 C - D (不同)
4. ...

优化策略：
- 双端比较（Vue 2）
- 最长递增子序列（Vue 3）
```

**设计目标：尽可能对 DOM 元素进行最少的操作**

```javascript
// 示例：列表更新
// 旧列表：[1, 2, 3, 4, 5]
// 新列表：[1, 3, 4, 5, 6]

// ❌ 暴力做法：删除所有，重新创建（5次删除 + 5次创建）
// ✅ Vue 做法：找到不变的 [1, 3, 4, 5]，删除 2，添加 6（1次删除 + 1次创建）
```

**核心原则**：
- 遍历的是 VNODE 虚拟 DOM
- 在文档碎片中操作
- JS 层面计算最小差异
- 批量更新到真实 DOM

#### Vue 2 双端比较算法

```javascript
function updateChildren(oldCh, newCh) {
  let oldStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newCh.length - 1;

  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 1. 旧头 vs 新头
    if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 2. 旧尾 vs 新尾
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 3. 旧头 vs 新尾（节点右移）
    else if (sameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      nodeOps.insertBefore(parentElm, oldStartVnode.elm, oldEndVnode.elm.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 4. 旧尾 vs 新头（节点左移）
    else if (sameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 5. 以上都不匹配，通过 key 查找
    else {
      const idxInOld = findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
      if (idxInOld) {
        // 找到了，移动节点
        const vnodeToMove = oldCh[idxInOld];
        patchVnode(vnodeToMove, newStartVnode);
        oldCh[idxInOld] = undefined;
        nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
      } else {
        // 没找到，创建新节点
        createElm(newStartVnode, parentElm, oldStartVnode.elm);
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }

  // 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 新节点有剩余，添加
    addVnodes(newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    // 旧节点有剩余，删除
    removeVnodes(oldCh, oldStartIdx, oldEndIdx);
  }
}
```

**双端比较优势**：
- 4 次比较覆盖常见场景（头头、尾尾、头尾、尾头）
- 减少节点移动次数
- 时间复杂度 O(n)

#### Vue 3 最长递增子序列（LIS）

Vue 3 使用更高效的算法：先处理特殊情况，再使用 LIS 算法找出最长不需要移动的节点序列。

```javascript
// 场景：对比两个列表
const oldChildren = [A, B, C, D, E]
const newChildren = [A, C, D, B, F]

// 传统 diff：可能需要多次移动
// Vue3 diff：找到最长不变序列 [A, C, D]
// 结果：只需要移动 B 和新增 F

// 最长递增子序列算法
function getSequence(arr) {
  // 时间复杂度：O(n log n)
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length

  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
```

```javascript
function patchKeyedChildren(c1, c2, container) {
  let i = 0;
  const l2 = c2.length;
  let e1 = c1.length - 1;
  let e2 = l2 - 1;

  // 1. 从头开始比较（sync from start）
  while (i <= e1 && i <= e2) {
    if (isSameVNodeType(c1[i], c2[i])) {
      patch(c1[i], c2[i]);
      i++;
    } else {
      break;
    }
  }

  // 2. 从尾开始比较（sync from end）
  while (i <= e1 && i <= e2) {
    if (isSameVNodeType(c1[e1], c2[e2])) {
      patch(c1[e1], c2[e2]);
      e1--;
      e2--;
    } else {
      break;
    }
  }

  // 3. 新节点有剩余（common sequence + mount）
  if (i > e1) {
    if (i <= e2) {
      while (i <= e2) {
        patch(null, c2[i], container);
        i++;
      }
    }
  }
  // 4. 旧节点有剩余（common sequence + unmount）
  else if (i > e2) {
    while (i <= e1) {
      unmount(c1[i]);
      i++;
    }
  }
  // 5. 乱序情况（unknown sequence）
  else {
    // 构建新节点的 key -> index 映射
    const keyToNewIndexMap = new Map();
    for (let i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i);
    }

    // 记录新节点在旧节点中的位置
    const newIndexToOldIndexMap = new Array(e2 - s2 + 1).fill(0);

    // 遍历旧节点
    for (let i = s1; i <= e1; i++) {
      const prevChild = c1[i];
      const newIndex = keyToNewIndexMap.get(prevChild.key);

      if (newIndex === undefined) {
        // 旧节点在新节点中不存在，删除
        unmount(prevChild);
      } else {
        // 记录位置映射
        newIndexToOldIndexMap[newIndex - s2] = i + 1;
        patch(prevChild, c2[newIndex]);
      }
    }

    // 计算最长递增子序列
    const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);

    // 倒序遍历，移动/挂载节点
    let j = increasingNewIndexSequence.length - 1;
    for (let i = e2 - s2; i >= 0; i--) {
      const nextIndex = s2 + i;
      const nextChild = c2[nextIndex];

      if (newIndexToOldIndexMap[i] === 0) {
        // 新增节点
        patch(null, nextChild, container);
      } else if (i !== increasingNewIndexSequence[j]) {
        // 需要移动
        move(nextChild, container);
      } else {
        // 在最长递增子序列中，不需要移动
        j--;
      }
    }
  }
}
```

**LIS 算法示例**：

```javascript
// 旧节点: A B C D E
// 新节点: A C D B F

// newIndexToOldIndexMap: [1, 3, 4, 2, 0]
// (表示新节点在旧节点中的位置，0 表示新增)

// LIS: [1, 3, 4] (对应节点 A, C, D)
// 结论：A、C、D 不需要移动，只需移动 B 和新增 F
```

**为什么 LIS 更优？**
- 找出最长不需要移动的节点序列
- 最小化 DOM 移动操作
- Vue 3 实现的 LIS 算法时间复杂度为 O(n log n)

### 3.4 key 的作用

```html
<!-- ❌ 不使用 key -->
<div v-for="item in list">{{ item.name }}</div>

<!-- ✅ 使用 key -->
<div v-for="item in list" :key="item.id">{{ item.name }}</div>
```

**key 的作用**：
- 帮助 Vue 识别节点的身份
- Diff 时通过 key 快速判断是否为同一节点
- 避免"就地复用"导致的状态错乱

**不使用 key 的问题**：

```javascript
// 旧列表: [A, B, C]
// 新列表: [A, C, D]

// 不使用 key：
// Vue 会认为位置 1 的节点从 B 变成了 C，复用 DOM 并更新内容
// 位置 2 的节点从 C 变成了 D，复用 DOM 并更新内容
// 如果 B、C、D 有内部状态（input 输入框），会导致状态错乱

// 使用 key：
// Vue 知道 B 被删除，C 保持不变，D 是新增
// 删除 B 的 DOM，保留 C 的 DOM（包括状态），新增 D 的 DOM
```

## 四、编译器与优化

### 4.1 编译流程

```
Template 模板
     ↓
┌─────────────┐
│  1. Parse   │  解析：模板字符串 → AST（抽象语法树）
└─────────────┘
     ↓
┌─────────────┐
│ 2. Transform│  转换：优化 AST，标记静态节点
└─────────────┘
     ↓
┌─────────────┐
│ 3. Generate │  生成：AST → 渲染函数代码字符串
└─────────────┘
     ↓
render function 渲染函数
```

### 4.2 AST 结构

```javascript
// 模板
<div id="app">
  <p>{{ message }}</p>
</div>

// 生成的 AST（简化）
{
  type: 1,              // 元素节点
  tag: 'div',
  attrsList: [
    { name: 'id', value: 'app' }
  ],
  children: [
    {
      type: 1,
      tag: 'p',
      children: [
        {
          type: 2,      // 插值表达式
          expression: '_s(message)',
          text: '{{ message }}'
        }
      ]
    }
  ]
}
```

### 4.3 静态节点优化

Vue 会标记静态节点，跳过 Diff 过程：

```javascript
<div>
  <h1>标题</h1>              <!-- 静态节点 -->
  <p>{{ message }}</p>       <!-- 动态节点 -->
  <span>固定文本</span>      <!-- 静态节点 -->
</div>

// 优化后的 AST
{
  static: false,        // div 有动态子节点
  children: [
    { static: true },   // h1 是静态的
    { static: false },  // p 是动态的
    { static: true }    // span 是静态的
  ]
}
```

### 4.4 Vue 3 编译优化

Vue 3 在编译阶段做了大量优化，让运行时性能更好。

#### PatchFlags（补丁标记）

对**动态绑定的属性**做标记，告诉 diff 算法哪些地方会变化：

```vue
<!-- 源代码 -->
<template>
  <div class="container">
    <p>{{ msg }}</p>
    <span :id="dynamicId">Hello</span>
  </div>
</template>
```

```javascript
// 编译后（简化版）
const _hoisted_1 = { class: "container" }

function render() {
  return createVNode("div", _hoisted_1, [
    createVNode("p", null, msg, 1 /* TEXT */),
    createVNode("span", { id: dynamicId }, "Hello", 8 /* PROPS */, ["id"])
  ])
}
```

**PatchFlags 类型**：

| Flag | 值 | 含义 |
|------|---|------|
| TEXT | 1 | 动态文本 |
| CLASS | 2 | 动态 class |
| STYLE | 4 | 动态 style |
| PROPS | 8 | 动态属性 |
| FULL_PROPS | 16 | 动态所有属性 |
| HYDRATE_EVENTS | 32 | 事件监听器 |
| STABLE_FRAGMENT | 64 | 稳定片段 |
| KEYED_FRAGMENT | 128 | 带 key 的片段 |
| UNKEYED_FRAGMENT | 256 | 不带 key 的片段 |
| DYNAMIC_SLOTS | 1024 | 动态插槽 |
| HOISTED | -1 | 静态节点 |

**优化效果**：

```javascript
// ❌ 没有 PatchFlags：需要对比所有属性
if (oldVNode.props !== newVNode.props) {
  // 对比所有属性...
}

// ✅ 有 PatchFlags：只对比标记的属性
if (patchFlag & PatchFlags.PROPS) {
  // 只对比 dynamicProps 中的属性
  patchProps(el, dynamicProps)
}
```

#### 静态提升（Static Hoisting）

将**静态节点提升到 render 函数外部**，避免重复创建：

```vue
<!-- 源代码 -->
<template>
  <div>
    <p>Static Text</p>  <!-- 静态 -->
    <p>{{ msg }}</p>    <!-- 动态 -->
  </div>
</template>
```

```javascript
// ❌ 未优化：每次渲染都创建静态节点
function render() {
  return createVNode("div", null, [
    createVNode("p", null, "Static Text"),  // 重复创建
    createVNode("p", null, msg, 1)
  ])
}

// ✅ 优化后：静态节点只创建一次
const _hoisted_1 = createVNode("p", null, "Static Text")

function render() {
  return createVNode("div", null, [
    _hoisted_1,  // 复用
    createVNode("p", null, msg, 1)
  ])
}
```

**好处**：
- 减少内存占用（静态节点只创建一次）
- 减少 GC 压力（不会重复创建和销毁）
- 提升渲染性能

#### 预字符串化（Pre-String Conversion）

大量**连续的静态内容会被转换为字符串**：

```vue
<!-- 源代码：大量静态内容 -->
<template>
  <div>
    <p>Line 1</p>
    <p>Line 2</p>
    <p>Line 3</p>
    <!-- ...更多静态内容 -->
    <p>Line 100</p>
  </div>
</template>
```

```javascript
// ❌ 未优化：创建 100 个 VNode
function render() {
  return createVNode("div", null, [
    createVNode("p", null, "Line 1"),
    createVNode("p", null, "Line 2"),
    // ... 98 more
  ])
}

// ✅ 优化后：直接使用 innerHTML
const _hoisted_1 = createStaticVNode(
  "<p>Line 1</p><p>Line 2</p>...<p>Line 100</p>",
  100  // 节点数量
)

function render() {
  return createVNode("div", null, [_hoisted_1])
}
```

**触发条件**：
- 连续的静态节点 ≥ 20 个
- 使用 `innerHTML` 直接插入

#### 事件缓存（Event Caching）

缓存事件处理函数，避免子组件不必要的更新：

```vue
<!-- 源代码 -->
<template>
  <button @click="handleClick">Click</button>
  <Child @custom-event="handleCustom" />
</template>
```

```javascript
// ❌ 未优化：每次都创建新函数
function render() {
  return [
    createVNode("button", {
      onClick: () => handleClick()  // 每次都是新函数
    }),
    createVNode(Child, {
      onCustomEvent: () => handleCustom()  // 每次都是新函数
    })
  ]
}

// ✅ 优化后：缓存函数引用
let _cache = []

function render() {
  return [
    createVNode("button", {
      onClick: _cache[0] || (_cache[0] = (...args) => handleClick(...args))
    }),
    createVNode(Child, {
      onCustomEvent: _cache[1] || (_cache[1] = (...args) => handleCustom(...args))
    })
  ]
}
```

**好处**：
- 稳定了传给子组件的函数 props 引用
- 避免了子组件的不必要更新
- 类似于 React 的 `useCallback`

#### v-once 指令

标记只渲染一次的内容：

```vue
<template>
  <div v-once>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>
```

```javascript
// 编译后
let _cached

function render() {
  return _cached || (_cached = createVNode("div", null, [
    createVNode("h1", null, title),
    createVNode("p", null, description)
  ]))
}
```

## 五、组件化原理

### 5.1 组件注册与解析

**全局注册**：

```javascript
// Vue 3
app.component('MyButton', {
  template: '<button>Click me</button>'
});

// 内部实现
function component(name, definition) {
  // 存储到全局组件映射表
  this._context.components[name] = definition;
}
```

**局部注册**：

```javascript
export default {
  components: {
    MyButton
  }
}

// 编译时，Vue 会将组件名解析为组件选项对象
```

### 5.2 组件实例化流程

```
┌──────────────────────────────────────────────────────┐
│              组件实例化流程                            │
├──────────────────────────────────────────────────────┤
│                                                       │
│  1. createComponentInstance()                        │
│     ↓                                                 │
│     创建组件实例对象 { data, props, emit, ... }        │
│                                                       │
│  2. setupComponent()                                 │
│     ↓                                                 │
│     初始化 props、slots、setup()、data()              │
│                                                       │
│  3. setupRenderEffect()                              │
│     ↓                                                 │
│     创建响应式副作用，绑定 render 函数                  │
│                                                       │
│  4. render() 执行                                     │
│     ↓                                                 │
│     生成 VNode 树                                      │
│                                                       │
│  5. patch()                                          │
│     ↓                                                 │
│     将 VNode 渲染为真实 DOM                            │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### 5.3 组件更新流程

```javascript
// 当响应式数据变化时
state.count++;

// 触发流程：
// 1. setter 被调用
// 2. trigger() 通知依赖更新
// 3. 组件的 effect 重新执行
// 4. 调用 render() 生成新 VNode
// 5. 调用 patch(oldVNode, newVNode)
// 6. Diff 算法对比，最小化 DOM 更新
```

### 5.4 异步更新队列

Vue 不会在数据变化后立即更新 DOM，而是将更新推入队列，在下一个 tick 统一执行。

```javascript
// 同步修改多次
this.count = 1;
this.count = 2;
this.count = 3;

// Vue 只会执行一次 DOM 更新（count = 3）
```

**实现原理**：

```javascript
const queue = [];
let pending = false;

function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job);
  }

  if (!pending) {
    pending = true;
    // 下一个微任务执行
    Promise.resolve().then(flushJobs);
  }
}

function flushJobs() {
  pending = false;
  queue.sort((a, b) => a.id - b.id); // 按组件层级排序

  for (let job of queue) {
    job(); // 执行组件更新
  }

  queue.length = 0;
}
```

**为什么要异步更新？**
- 避免频繁的 DOM 操作
- 合并多次数据修改，只渲染最终结果
- 利用浏览器的事件循环机制

## 六、框架对比：Vue vs Svelte

### 6.1 Vue 的设计

```javascript
// Vue：组件级响应式
export default {
  setup() {
    const count = ref(0)

    function increment() {
      count.value++  // 触发组件重新渲染
    }

    return { count, increment }
  }
}
```

**特点**：
- 响应式粒度：**组件级别**
- 需要虚拟 DOM 进行 diff
- 当数据变化时，整个组件重新渲染（但会通过 diff 优化）

### 6.2 Svelte 的设计

```svelte
<script>
  let count = 0

  function increment() {
    count++  // 只更新受影响的 DOM 节点
  }
</script>

<button on:click={increment}>
  Count: {count}
</button>
```

**特点**：
- 响应式粒度：**元素级别**（甚至到属性级别）
- **不需要虚拟 DOM**
- 编译时生成精确的更新代码
- 只更新真正变化的 DOM 节点

### 6.3 对比总结

| 特性 | Vue | Svelte |
|------|------|--------|
| 响应式粒度 | 组件级 | 元素/属性级 |
| 虚拟 DOM | ✅ 需要 | ❌ 不需要 |
| Diff 算法 | ✅ 运行时 | ❌ 编译时优化 |
| 性能 | 优秀 | 更优秀 |
| 包体积 | 较大（包含运行时） | 较小（编译时优化） |
| 灵活性 | 高（动态性强） | 低（静态性强） |
| 生态 | 成熟 | 较小 |

**Svelte 能精确到元素内部属性的原因**：

```javascript
// Svelte 编译后的代码（简化版）
function update(changed) {
  if (changed.count) {
    // 精确更新：只更新 button 的文本节点
    button_text.data = `Count: ${count}`
  }
}
```

## 七、核心算法总结

### 7.1 响应式算法对比

| 算法 | Vue 2 | Vue 3 |
|------|-------|-------|
| **数据劫持** | Object.defineProperty 递归劫持 | Proxy 懒代理 |
| **依赖收集** | Dep + Watcher | WeakMap + Set + effect |
| **时间复杂度** | 初始化 O(n²)，访问 O(1) | 初始化 O(1)，访问 O(log n) |
| **空间复杂度** | O(n)（每个属性一个 Dep） | O(n)（全局 targetMap） |

### 7.2 Diff 算法对比

| 算法 | Vue 2 | Vue 3 |
|------|-------|-------|
| **策略** | 双端比较 | 双端 + 最长递增子序列 |
| **时间复杂度** | O(n) | O(n log n) |
| **优势** | 实现简单 | 移动次数最少 |

### 7.3 编译优化对比

| 优化 | Vue 2 | Vue 3 |
|------|-------|-------|
| **静态提升** | ✅ 标记静态节点 | ✅ 提升到 render 外部 |
| **PatchFlag** | ❌ 无 | ✅ 精确标记动态类型 |
| **Block Tree** | ❌ 无 | ✅ 收集动态节点，跳过静态节点 |
| **事件缓存** | ❌ 无 | ✅ 缓存事件处理函数 |
| **预字符串化** | ❌ 无 | ✅ 大量静态节点转字符串 |

## 八、性能优化

### 8.1 Vue 3 性能提升手段

**1. 编译时优化**：
- 静态提升：静态节点只创建一次
- PatchFlag：精确标记动态内容
- Block Tree：扁平化动态节点树
- 预字符串化：大量静态内容直接生成 HTML 字符串
- 事件缓存：稳定函数引用

**2. 运行时优化**：
- Proxy 懒代理：只代理访问到的对象
- Fragment：支持多根节点，减少无意义的包裹元素
- Teleport：跨 DOM 层级渲染

**3. Tree-shaking**：
- 模块化设计，按需引入
- 未使用的 API 不会打包进最终代码

### 8.2 开发者优化建议

**计算属性 vs 方法**：

```javascript
// ✅ 推荐：计算属性有缓存
computed: {
  fullName() {
    return this.firstName + ' ' + this.lastName;
  }
}

// ❌ 不推荐：方法每次都重新计算
methods: {
  getFullName() {
    return this.firstName + ' ' + this.lastName;
  }
}
```

**v-for 使用 key**：

```html
<!-- ✅ 使用唯一 key -->
<div v-for="item in list" :key="item.id">

<!-- ❌ 使用 index 作为 key（列表顺序会变时） -->
<div v-for="(item, index) in list" :key="index">
```

**v-if vs v-show**：

```html
<!-- 频繁切换用 v-show（切换 display） -->
<div v-show="isVisible">

<!-- 条件很少改变用 v-if（条件渲染） -->
<div v-if="isLoggedIn">
```

**合理使用 v-once**：

```vue
<template>
  <!-- ✅ 合理使用 v-once -->
  <header v-once>
    <h1>{{ staticTitle }}</h1>
  </header>

  <!-- ✅ 大列表使用 key -->
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>

  <!-- ✅ 计算属性缓存 -->
  <p>{{ expensiveComputed }}</p>

  <!-- ❌ 避免在模板中使用复杂表达式 -->
  <p>{{ items.filter(i => i.active).map(i => i.name).join(', ') }}</p>
</template>

<script setup>
// ✅ 使用计算属性
const activeNames = computed(() =>
  items.value.filter(i => i.active).map(i => i.name).join(', ')
)
</script>
```

## 九、总结

### 9.1 Vue 2 核心原理

- **响应式**：Object.defineProperty + Dep + Watcher
- **虚拟DOM**：VNode + 双端比较 Diff
- **编译器**：模板解析 + 静态节点标记
- **限制**：无法监听新增/删除属性、数组索引变化

### 9.2 Vue 3 核心原理

- **响应式**：Proxy + WeakMap + effect
- **虚拟DOM**：VNode + 最长递增子序列 Diff
- **编译器**：PatchFlag + Block Tree + 静态提升 + 预字符串化 + 事件缓存
- **优势**：性能提升、TypeScript 支持、Composition API、Tree-shaking

### 9.3 关键设计思想

1. **数据驱动**：数据变化自动更新视图
2. **组件化**：高内聚、低耦合、可复用
3. **渐进式**：核心库轻量，按需扩展
4. **性能优化**：编译时优化 + 运行时优化
5. **开发体验**：模板语法简洁、响应式系统易用

### 9.4 Vue 的核心优势

1. **设计理念**：命令式 + 声明式，平衡性能和开发体验
2. **虚拟 DOM**：跨平台能力 + 性能优化
3. **Diff 算法**：最长递增子序列，最少 DOM 操作
4. **编译优化**：多种优化手段，运行时性能卓越
5. **响应式系统**：Proxy 代替 Object.defineProperty，性能更好、功能更强

### 9.5 与其他框架对比

| 框架 | 优势 | 劣势 |
|------|------|------|
| **Vue** | 平衡性好，生态完善，渐进式 | 运行时包体积较大 |
| **Svelte** | 性能极致，包体积小，编译优化 | 生态较小，动态性弱 |
| **React** | 生态最强，灵活性高，社区庞大 | 需手动优化，学习曲线陡 |

### 9.6 学习建议

1. **理解响应式系统原理**：知道何时数据不会响应，如何解决
2. **掌握虚拟 DOM 和 Diff 算法**：理解 key 的重要性，知道优化原理
3. **学习编译优化机制**：写出高性能的模板，利用编译时优化
4. **深入组件化思想**：设计可复用、易维护的组件
5. **阅读源码**：了解实现细节，提升技术深度

## 🔗 参考资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue 3 源码](https://github.com/vuejs/core)
- [Vue 2 源码](https://github.com/vuejs/vue)
- [Vue 3 Deep Dive with Evan You](https://www.vuemastery.com/courses/vue-3-deep-dive-with-evan-you/)
- [Vue 3 设计思想](https://vue3js.cn/vue-composition/)
