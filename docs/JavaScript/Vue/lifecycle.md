---
title: Vue 生命周期钩子完全指南
date: 2026-01-19 11:23:50
tags:
  - Vue
  - Lifecycle
  - Hooks
categories:
  - JavaScript
  - Vue
---

# Vue 生命周期钩子完全指南

## 概述

生命周期钩子是 Vue 组件从创建到销毁过程中，在特定时机自动调用的函数。理解生命周期钩子是掌握 Vue 组件行为的关键。

## 一、Vue 3 生命周期钩子

### 1.1 生命周期图示

```
创建阶段
├── setup()              ← Composition API 入口
├── beforeCreate()       ← 实例初始化之后
├── created()            ← 实例创建完成

挂载阶段
├── beforeMount()        ← 挂载开始之前
├── mounted()            ← 挂载完成

更新阶段
├── beforeUpdate()       ← 数据更新，DOM 未更新
├── updated()            ← DOM 已更新

卸载阶段
├── beforeUnmount()      ← 卸载开始之前
└── unmounted()          ← 卸载完成
```

### 1.2 Composition API 生命周期

```vue
<script setup>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue';

// ⚠️ 注意：setup 本身就在 beforeCreate 和 created 之间执行
// 所以不需要 onBeforeCreate 和 onCreated

console.log('setup 执行');

onBeforeMount(() => {
  console.log('组件挂载之前');
});

onMounted(() => {
  console.log('组件挂载完成');
  // ✅ 可以访问 DOM
  // ✅ 可以发起网络请求
});

onBeforeUpdate(() => {
  console.log('数据更新，DOM 更新之前');
});

onUpdated(() => {
  console.log('DOM 已更新');
  // ⚠️ 小心无限循环
});

onBeforeUnmount(() => {
  console.log('组件卸载之前');
  // ✅ 清理定时器
  // ✅ 取消网络请求
  // ✅ 移除事件监听
});

onUnmounted(() => {
  console.log('组件已卸载');
});
</script>
```

### 1.3 Options API 生命周期

```vue
<script>
export default {
  beforeCreate() {
    console.log('beforeCreate');
    // this.$data 不可用
    // this.$el 不可用
  },

  created() {
    console.log('created');
    // ✅ this.$data 可用
    // ❌ this.$el 不可用（DOM 未挂载）
    // ✅ 可以发起网络请求
  },

  beforeMount() {
    console.log('beforeMount');
    // ❌ this.$el 不可用
  },

  mounted() {
    console.log('mounted');
    // ✅ this.$el 可用
    // ✅ 可以访问 DOM
    // ✅ 可以操作第三方库
  },

  beforeUpdate() {
    console.log('beforeUpdate');
    // 数据已更新，DOM 未更新
  },

  updated() {
    console.log('updated');
    // DOM 已更新
  },

  beforeUnmount() {
    console.log('beforeUnmount');
    // ✅ 清理定时器
    // ✅ 移除事件监听
  },

  unmounted() {
    console.log('unmounted');
    // 组件已卸载
  }
};
</script>
```

## 二、Vue 2 vs Vue 3 生命周期对比

### 2.1 命名变化

| Vue 2 | Vue 3 Options API | Vue 3 Composition API |
|-------|-------------------|----------------------|
| beforeCreate | beforeCreate | ❌（使用 setup） |
| created | created | ❌（使用 setup） |
| beforeMount | beforeMount | onBeforeMount |
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| **beforeDestroy** | **beforeUnmount** | **onBeforeUnmount** |
| **destroyed** | **unmounted** | **onUnmounted** |

### 2.2 主要差异

```javascript
// Vue 2
export default {
  beforeDestroy() {
    console.log('Vue 2: beforeDestroy');
  },
  destroyed() {
    console.log('Vue 2: destroyed');
  }
};

// Vue 3 - Options API
export default {
  beforeUnmount() {
    console.log('Vue 3: beforeUnmount');
  },
  unmounted() {
    console.log('Vue 3: unmounted');
  }
};

// Vue 3 - Composition API
import { onBeforeUnmount, onUnmounted } from 'vue';

onBeforeUnmount(() => {
  console.log('Vue 3: beforeUnmount');
});

onUnmounted(() => {
  console.log('Vue 3: unmounted');
});
```

## 三、各生命周期详解

### 3.1 setup（仅 Composition API）

**执行时机**：在 beforeCreate 之前执行

**特点**：
- 没有 `this` 上下文
- 接收 `props` 和 `context` 参数
- 返回值暴露给模板

```vue
<script setup>
import { ref } from 'vue';

// ✅ 相当于 setup() 函数
const count = ref(0);

console.log('setup 执行');
// 此时组件实例还未创建
</script>
```

### 3.2 beforeCreate / created

**beforeCreate**：实例初始化之后，数据观测和事件配置之前

**created**：实例创建完成，数据观测、计算属性、方法、事件已配置

```vue
<script>
export default {
  data() {
    return {
      message: 'Hello'
    };
  },

  beforeCreate() {
    console.log('beforeCreate');
    console.log(this.message); // undefined
    console.log(this.$el); // undefined
  },

  created() {
    console.log('created');
    console.log(this.message); // 'Hello' ✅
    console.log(this.$el); // undefined（DOM 未挂载）

    // ✅ 适合：
    // - 发起网络请求
    // - 初始化非响应式数据
    // - 设置定时器
    this.fetchData();
  },

  methods: {
    async fetchData() {
      const data = await fetch('/api/data');
      this.items = await data.json();
    }
  }
};
</script>
```

**⚠️ Composition API 中不需要这两个钩子，直接在 setup 中编写代码**

### 3.3 beforeMount / mounted

**beforeMount**：挂载开始之前，模板编译完成，虚拟 DOM 已创建

**mounted**：组件挂载完成，DOM 已渲染

```vue
<template>
  <div ref="container">
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onMounted } from 'vue';

const container = ref(null);
const message = ref('Hello');

onBeforeMount(() => {
  console.log('beforeMount');
  console.log(container.value); // null（DOM 未挂载）
});

onMounted(() => {
  console.log('mounted');
  console.log(container.value); // <div>...</div> ✅

  // ✅ 适合：
  // - 访问 DOM 元素
  // - 初始化第三方库（echarts、swiper）
  // - 添加事件监听
  // - 发起网络请求（也可以在 created 中）

  container.value.style.background = 'red';

  // 初始化图表
  const chart = echarts.init(container.value);
  chart.setOption(options);
});
</script>
```

### 3.4 beforeUpdate / updated

**beforeUpdate**：数据更新时调用，DOM 更新之前

**updated**：数据更新导致的 DOM 重新渲染完成后调用

```vue
<template>
  <div>
    <p ref="text">{{ count }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script setup>
import { ref, onBeforeUpdate, onUpdated } from 'vue';

const count = ref(0);
const text = ref(null);

const increment = () => {
  count.value++;
};

onBeforeUpdate(() => {
  console.log('beforeUpdate');
  console.log('数据：', count.value); // 新值
  console.log('DOM：', text.value.textContent); // 旧值
});

onUpdated(() => {
  console.log('updated');
  console.log('数据：', count.value); // 新值
  console.log('DOM：', text.value.textContent); // 新值 ✅

  // ⚠️ 注意：避免在此修改状态，可能导致无限循环
  // count.value++; // ❌ 无限循环
});
</script>
```

**⚠️ 常见陷阱：无限更新循环**

```vue
<script setup>
import { ref, onUpdated } from 'vue';

const count = ref(0);

onUpdated(() => {
  // ❌ 错误：导致无限循环
  count.value++;
});

// ✅ 正确：使用 watch 或 watchEffect
import { watch } from 'vue';

watch(count, (newValue) => {
  console.log('count 变化：', newValue);
});
</script>
```

### 3.5 beforeUnmount / unmounted

**beforeUnmount**：组件卸载之前

**unmounted**：组件卸载完成

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue';

let timer = null;
let chart = null;

onMounted(() => {
  // 创建定时器
  timer = setInterval(() => {
    console.log('tick');
  }, 1000);

  // 初始化图表
  chart = echarts.init(document.getElementById('chart'));
});

onBeforeUnmount(() => {
  console.log('beforeUnmount');

  // ✅ 清理工作：
  // - 清除定时器
  // - 取消网络请求
  // - 移除事件监听
  // - 销毁第三方库实例

  if (timer) {
    clearInterval(timer);
  }

  if (chart) {
    chart.dispose();
  }

  window.removeEventListener('resize', handleResize);
});

onUnmounted(() => {
  console.log('unmounted');
  // 组件已完全卸载
});
</script>
```

## 四、特殊生命周期钩子

### 4.1 activated / deactivated（keep-alive）

用于 `<keep-alive>` 缓存的组件。

```vue
<template>
  <div>
    <button @click="show = !show">切换</button>

    <keep-alive>
      <ChildComponent v-if="show" />
    </keep-alive>
  </div>
</template>

<!-- ChildComponent.vue -->
<script setup>
import { onActivated, onDeactivated } from 'vue';

onActivated(() => {
  console.log('组件被激活（从缓存中恢复）');
  // ✅ 刷新数据
  // ✅ 重新订阅事件
});

onDeactivated(() => {
  console.log('组件被缓存');
  // ✅ 取消订阅
  // ✅ 暂停定时器
});
</script>
```

### 4.2 onErrorCaptured（错误捕获）

捕获来自后代组件的错误。

```vue
<script setup>
import { onErrorCaptured } from 'vue';

onErrorCaptured((err, instance, info) => {
  console.error('捕获错误：', err);
  console.log('错误组件：', instance);
  console.log('错误信息：', info);

  // 返回 false 阻止错误继续传播
  return false;
});
</script>
```

### 4.3 onRenderTracked / onRenderTriggered（调试）

**仅在开发模式下可用**，用于调试响应式依赖。

```vue
<script setup>
import { ref, onRenderTracked, onRenderTriggered } from 'vue';

const count = ref(0);

onRenderTracked((event) => {
  console.log('依赖被追踪：', event);
  // 显示是哪个属性被追踪了
});

onRenderTriggered((event) => {
  console.log('重新渲染被触发：', event);
  // 显示是哪个属性的变化触发了重新渲染
});
</script>
```

### 4.4 onServerPrefetch（SSR）

服务端渲染时调用。

```vue
<script setup>
import { ref, onServerPrefetch } from 'vue';

const data = ref(null);

onServerPrefetch(async () => {
  // 在服务端预取数据
  data.value = await fetchData();
});
</script>
```

## 五、父子组件生命周期执行顺序

### 5.1 挂载阶段

```vue
<!-- 父组件 -->
<template>
  <div>
    <p>父组件</p>
    <ChildComponent />
  </div>
</template>

<script setup>
import { onBeforeMount, onMounted } from 'vue';

console.log('父 setup');

onBeforeMount(() => {
  console.log('父 beforeMount');
});

onMounted(() => {
  console.log('父 mounted');
});
</script>

<!-- 子组件 -->
<script setup>
import { onBeforeMount, onMounted } from 'vue';

console.log('子 setup');

onBeforeMount(() => {
  console.log('子 beforeMount');
});

onMounted(() => {
  console.log('子 mounted');
});
</script>
```

**执行顺序**：

```
父 setup
父 beforeMount
  子 setup
  子 beforeMount
  子 mounted
父 mounted
```

**规律**：
1. 父组件 setup → 父组件 beforeMount
2. 子组件 setup → 子组件 beforeMount → 子组件 mounted
3. 父组件 mounted

**⚠️ 关键点**：
- 父组件要等所有子组件挂载完成后才会 mounted
- 从外到内，再从内到外

### 5.2 更新阶段

```vue
<!-- 父组件 -->
<script setup>
import { ref, onBeforeUpdate, onUpdated } from 'vue';

const count = ref(0);

onBeforeUpdate(() => {
  console.log('父 beforeUpdate');
});

onUpdated(() => {
  console.log('父 updated');
});
</script>

<!-- 子组件 -->
<script setup>
import { onBeforeUpdate, onUpdated } from 'vue';

onBeforeUpdate(() => {
  console.log('子 beforeUpdate');
});

onUpdated(() => {
  console.log('子 updated');
});
</script>
```

**父组件数据变化影响子组件时**：

```
父 beforeUpdate
  子 beforeUpdate
  子 updated
父 updated
```

### 5.3 卸载阶段

```
父 beforeUnmount
  子 beforeUnmount
  子 unmounted
父 unmounted
```

**规律**：从外到内，再从内到外

### 5.4 完整执行顺序示例

```vue
<!-- App.vue -->
<template>
  <div>
    <button @click="show = !show">切换</button>
    <button @click="count++">更新</button>

    <Parent v-if="show" :count="count" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const show = ref(true);
const count = ref(0);
</script>

<!-- Parent.vue -->
<template>
  <div>
    <p>父组件: {{ count }}</p>
    <Child :count="count" />
  </div>
</template>

<script setup>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue';

console.log('1. 父 setup');

onBeforeMount(() => console.log('2. 父 beforeMount'));
onMounted(() => console.log('5. 父 mounted'));
onBeforeUpdate(() => console.log('父 beforeUpdate'));
onUpdated(() => console.log('父 updated'));
onBeforeUnmount(() => console.log('父 beforeUnmount'));
onUnmounted(() => console.log('父 unmounted'));
</script>

<!-- Child.vue -->
<template>
  <div>
    <p>子组件: {{ count }}</p>
  </div>
</template>

<script setup>
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue';

console.log('3. 子 setup');

onBeforeMount(() => console.log('子 beforeMount'));
onMounted(() => console.log('4. 子 mounted'));
onBeforeUpdate(() => console.log('子 beforeUpdate'));
onUpdated(() => console.log('子 updated'));
onBeforeUnmount(() => console.log('子 beforeUnmount'));
onUnmounted(() => console.log('子 unmounted'));
</script>
```

**初始挂载**：
```
1. 父 setup
2. 父 beforeMount
3. 子 setup
   子 beforeMount
   子 mounted
5. 父 mounted
```

**数据更新**：
```
父 beforeUpdate
  子 beforeUpdate
  子 updated
父 updated
```

**组件卸载**：
```
父 beforeUnmount
  子 beforeUnmount
  子 unmounted
父 unmounted
```

## 六、生命周期最佳实践

### 6.1 数据获取

```vue
<script setup>
import { ref, onMounted } from 'vue';

const data = ref(null);
const loading = ref(false);
const error = ref(null);

// ✅ 推荐：在 mounted 中获取数据
onMounted(async () => {
  loading.value = true;

  try {
    const response = await fetch('/api/data');
    data.value = await response.json();
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
});

// ✅ 也可以：直接在 setup 中（不需要等 DOM）
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/data');
    data.value = await response.json();
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
};

fetchData(); // 立即执行
</script>
```

### 6.2 事件监听清理

```vue
<script setup>
import { onMounted, onBeforeUnmount } from 'vue';

const handleResize = () => {
  console.log('窗口大小变化');
};

onMounted(() => {
  // ✅ 添加监听
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // ✅ 移除监听（重要！）
  window.removeEventListener('resize', handleResize);
});
</script>
```

### 6.3 定时器清理

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const count = ref(0);
let timer = null;

onMounted(() => {
  // ✅ 创建定时器
  timer = setInterval(() => {
    count.value++;
  }, 1000);
});

onBeforeUnmount(() => {
  // ✅ 清除定时器（重要！）
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>
```

### 6.4 第三方库初始化

```vue
<template>
  <div ref="chartRef" style="width: 600px; height: 400px;"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref(null);
let chart = null;

onMounted(() => {
  // ✅ 初始化图表
  chart = echarts.init(chartRef.value);

  chart.setOption({
    title: { text: '示例图表' },
    xAxis: { data: ['A', 'B', 'C'] },
    yAxis: {},
    series: [{ type: 'bar', data: [1, 2, 3] }]
  });
});

onBeforeUnmount(() => {
  // ✅ 销毁图表实例
  if (chart) {
    chart.dispose();
    chart = null;
  }
});
</script>
```

### 6.5 避免在 updated 中修改状态

```vue
<script setup>
import { ref, onUpdated, watch } from 'vue';

const count = ref(0);

// ❌ 错误：导致无限循环
onUpdated(() => {
  count.value++; // 无限循环
});

// ✅ 正确：使用 watch
watch(count, (newValue) => {
  console.log('count 变化：', newValue);
});

// ✅ 正确：使用条件判断
onUpdated(() => {
  if (count.value < 10) {
    count.value++;
  }
});
</script>
```

## 七、常见问题

### Q1: setup 和 created 有什么区别？

**A**:
- `setup` 在 beforeCreate 之前执行，没有 `this`
- `created` 在实例创建后执行，可以访问 `this`
- Composition API 中直接用 setup，不需要 created

### Q2: 为什么推荐在 mounted 而不是 created 中访问 DOM？

**A**: 因为 created 时 DOM 还未挂载，`$el` 和 `$refs` 都是 `undefined`。必须等到 mounted 才能安全访问 DOM。

### Q3: 父子组件的 mounted 谁先执行？

**A**: 子组件先 mounted，然后父组件 mounted。规律是"从外到内，再从内到外"。

### Q4: 如何确保组件卸载时清理副作用？

**A**: 在 `onBeforeUnmount` 中清理：
- 定时器
- 事件监听
- 网络请求
- 第三方库实例

### Q5: keep-alive 组件什么时候用 activated/deactivated？

**A**: 当组件被 `<keep-alive>` 包裹时：
- 激活时触发 `activated`
- 缓存时触发 `deactivated`
- 用于在缓存切换时刷新数据或管理资源

## 八、总结

### 核心要点

1. **创建阶段**：setup → beforeCreate → created
2. **挂载阶段**：beforeMount → mounted（可访问 DOM）
3. **更新阶段**：beforeUpdate → updated
4. **卸载阶段**：beforeUnmount → unmounted（清理副作用）
5. **父子顺序**：从外到内，再从内到外

### 使用建议

| 场景 | 推荐钩子 |
|------|---------|
| 数据初始化 | setup / created |
| 网络请求 | setup / created / mounted |
| DOM 操作 | mounted |
| 第三方库初始化 | mounted |
| 事件监听 | mounted（添加）+ beforeUnmount（移除） |
| 定时器 | mounted（创建）+ beforeUnmount（清除） |
| 缓存组件刷新 | activated |

## 参考资源

- [Vue 3 官方文档 - 生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle.html)
- [Vue 3 生命周期图示](https://cn.vuejs.org/guide/essentials/lifecycle.html)
- [Options API 生命周期](https://cn.vuejs.org/api/options-lifecycle.html)
