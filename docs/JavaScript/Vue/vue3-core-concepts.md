---
title: Vue3 核心原理与优化
createTime: 2026-01-27 18:08:56
tags:
  - Vue3
  - 虚拟DOM
  - 性能优化
  - 编译优化
permalink: /vue/vue3-core-concepts/
---

# Vue3 核心原理与优化

## 📅 文档信息

- **创建时间**：2026-01-27 18:08:56
- **适用版本**：Vue 3.x
- **核心主题**：设计理念、虚拟 DOM、diff 算法、编译优化

## 一、Vue3 设计理念

### 1.1 命令式 + 声明式

Vue3 采用**命令式与声明式相结合**的设计理念：

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
- 让开发者用声明式的方式编写代码（更简洁、可维护）
- 框架内部用命令式实现（更高效、可控）
- 尽可能减少 DOM 操作，提升性能

### 1.2 组件级粒度更新

```javascript
// Vue3 的响应式粒度
const state = reactive({
  user: { name: 'Tom' },
  list: [1, 2, 3]
})

// ⚠️ 更新粒度：组件级别
// 当 state.user.name 改变时，整个组件会重新渲染
// 但不会影响其他组件
```

**为什么是组件级？**
- 精细度只能到达组件（Vue3 的 Hooks 跟页面渲染无关）
- 不能再细化到元素级别（那样会导致框架过于复杂）
- Vue3 和 React 都是以组件为单位进行渲染的

**性能问题**：
- 如果数据结构发生变化，组件内部会全量更新渲染
- 所以需要虚拟 DOM 和 diff 算法来优化

## 二、虚拟 DOM 的意义

### 2.1 什么是虚拟 DOM？

虚拟 DOM（VNODE）是**描述真实 DOM 的一种数据结构**（DSL - Domain Specific Language）：

```javascript
// 真实 DOM
<div class="container">
  <span>Hello</span>
</div>

// 虚拟 DOM（JavaScript 对象）
const vnode = {
  type: 'div',
  props: { class: 'container' },
  children: [
    {
      type: 'span',
      props: null,
      children: 'Hello'
    }
  ]
}
```

### 2.2 为什么需要虚拟 DOM？

#### 原因1：跨平台能力

```javascript
// ✅ JS 对象属于 ES 范畴
const vnode = { type: 'div', ... }

// ❌ DOM 属于 WebAPI 范畴
const div = document.createElement('div')
```

**优势**：
- 如果使用真实 DOM，就只能绑定在浏览器平台
- 使用 JS 对象的话，只要支持 JS 的环境就能运行
- 可以渲染到不同平台：浏览器、移动端（Weex）、小程序、桌面端（Electron）

#### 原因2：性能优化

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
// Vue3 的渲染过程
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

## 三、Diff 算法核心

### 3.1 最长递增子序列（LIS）

Vue3 使用**最长递增子序列算法**来优化 diff 过程：

```javascript
// 场景：对比两个列表
const oldChildren = [A, B, C, D, E]
const newChildren = [A, C, D, B, F]

// 传统 diff：可能需要多次移动
// Vue3 diff：找到最长不变序列 [A, C, D]
// 结果：只需要移动 B 和新增 F

function getSequence(arr) {
  // 最长递增子序列算法
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

### 3.2 设计目标

**尽可能对 DOM 元素进行最少的操作**：

```javascript
// 示例：列表更新
// 旧列表：[1, 2, 3, 4, 5]
// 新列表：[1, 3, 4, 5, 6]

// ❌ 暴力做法：删除所有，重新创建（5次删除 + 5次创建）
// ✅ Vue3 做法：找到不变的 [1, 3, 4, 5]，删除 2，添加 6（1次删除 + 1次创建）
```

**核心原则**：
- 遍历的是 VNODE 虚拟 DOM
- 在文档碎片中操作
- JS 层面计算最小差异
- 批量更新到真实 DOM

## 四、框架对比：Vue vs Svelte

### 4.1 Vue3 的设计

```javascript
// Vue3：组件级响应式
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

### 4.2 Svelte 的设计

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

### 4.3 对比总结

| 特性 | Vue3 | Svelte |
|------|------|--------|
| 响应式粒度 | 组件级 | 元素/属性级 |
| 虚拟 DOM | ✅ 需要 | ❌ 不需要 |
| Diff 算法 | ✅ 运行时 | ❌ 编译时优化 |
| 性能 | 优秀 | 更优秀 |
| 包体积 | 较大（包含运行时） | 较小（编译时优化） |
| 灵活性 | 高（动态性强） | 低（静态性强） |

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

## 五、Vue3 模板编译优化

Vue3 在编译阶段做了大量优化，让运行时性能更好。

### 5.1 PatchFlags（补丁标记）

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

### 5.2 静态提升（Static Hoisting）

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

### 5.3 预字符串化（Pre-String Conversion）

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

### 5.4 事件缓存（Event Caching）

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

### 5.5 v-once 指令

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

## 六、性能优化总结

### 6.1 编译时优化（Compile-time）

| 优化技术 | 作用 | 效果 |
|---------|------|------|
| PatchFlags | 标记动态内容 | 精确 diff |
| 静态提升 | 提升静态节点 | 减少创建 |
| 预字符串化 | 大量静态节点转字符串 | 极致优化 |
| 事件缓存 | 缓存事件处理函数 | 避免子组件更新 |

### 6.2 运行时优化（Runtime）

| 优化技术 | 作用 | 效果 |
|---------|------|------|
| 最长递增子序列 | 优化列表 diff | 最少 DOM 操作 |
| 组件级更新 | 限定更新范围 | 不影响其他组件 |
| 文档碎片 | 批量 DOM 操作 | 减少回流重绘 |

### 6.3 开发建议

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

  <!-- ✅ 条件渲染用 v-if（销毁），频繁切换用 v-show（隐藏） -->
  <div v-if="showContent">Content</div>
  <div v-show="isVisible">Toggle</div>

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

## 七、总结

### Vue3 的核心优势

1. **设计理念**：命令式 + 声明式，平衡性能和开发体验
2. **虚拟 DOM**：跨平台能力 + 性能优化
3. **Diff 算法**：最长递增子序列，最少 DOM 操作
4. **编译优化**：PatchFlags、静态提升、预字符串化、事件缓存
5. **响应式系统**：Proxy 代替 Object.defineProperty，性能更好

### 与其他框架对比

| 框架 | 优势 | 劣势 |
|------|------|------|
| **Vue3** | 平衡性好，生态完善 | 运行时包体积较大 |
| **Svelte** | 性能极致，包体积小 | 生态较小，动态性弱 |
| **React** | 生态最强，灵活性高 | 需手动优化，学习曲线陡 |

### 参考资源

- [Vue3 官方文档](https://cn.vuejs.org/)
- [Vue3 源码](https://github.com/vuejs/core)
- [Vue3 设计思想](https://vue3js.cn/vue-composition/)
