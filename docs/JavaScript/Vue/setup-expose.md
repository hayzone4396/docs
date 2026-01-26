---
title: Vue 3 组件暴露机制 - expose 详解
description: 深入理解 Vue 3 Setup 语法糖中的 expose 机制及 defineExpose 的使用
tags:
  - Vue3
  - Setup
  - defineExpose
  - 组件通信
date: 2026-01-23 17:25:30
---

# Vue 3 组件暴露机制 - expose 详解

## 背景：编译器宏

Vue 3 在 `<script setup>` 中提供了几个编译器宏（Compiler Macros），它们在编译时会被特殊处理：

```vue
<script setup>
// 这些都是编译器宏，无需导入
defineProps()
defineEmits()
defineExpose()
defineOptions()
defineSlots()
</script>
```

**编译器宏的特点：**
- 无需 import 导入
- 仅在 `<script setup>` 中可用
- 编译时会被转换为相应的代码
- 不是真正的函数，不能赋值或解构

## 组件暴露的默认行为

### `<script setup>` 的封闭性

使用 `<script setup>` 时，组件默认是**封闭的**，父组件无法访问子组件的内部状态。

```vue
<!-- Child.vue -->
<script setup>
import { ref } from 'vue';

const count = ref(0);
const message = ref('Hello');

function increment() {
  count.value++;
}
</script>
```

```vue
<!-- Parent.vue -->
<template>
  <Child ref="childRef" />
  <button @click="accessChild">访问子组件</button>
</template>

<script setup>
import { ref } from 'vue';
import Child from './Child.vue';

const childRef = ref(null);

function accessChild() {
  // ❌ undefined - 无法访问
  console.log(childRef.value.count);
  console.log(childRef.value.message);
  console.log(childRef.value.increment);
}
</script>
```

**原因：**

在编译之后，`<script setup>` 会调用一个 `expose` 方法，**默认不暴露任何内容**，保护组件内部状态。

### 传统 `setup()` 函数的默认行为

与 `<script setup>` 不同，传统的 `setup()` 函数**默认暴露所有返回的内容**。

```vue
<!-- Child.vue -->
<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const message = ref('Hello');

    function increment() {
      count.value++;
    }

    // 返回的所有内容都会被暴露
    return {
      count,
      message,
      increment
    };
  }
};
</script>
```

```vue
<!-- Parent.vue -->
<template>
  <Child ref="childRef" />
  <button @click="accessChild">访问子组件</button>
</template>

<script setup>
import { ref } from 'vue';
import Child from './Child.vue';

const childRef = ref(null);

function accessChild() {
  // ✅ 可以访问 - 全部暴露
  console.log(childRef.value.count);
  console.log(childRef.value.message);
  childRef.value.increment();
}
</script>
```

## 使用 defineExpose 显式暴露

### 基本用法

通过 `defineExpose()` 可以显式指定要暴露给父组件的属性和方法。

```vue
<!-- Child.vue -->
<script setup>
import { ref } from 'vue';

const count = ref(0);
const message = ref('Hello');
const privateData = ref('私有数据');

function increment() {
  count.value++;
}

function privateMethod() {
  console.log('私有方法');
}

// 只暴露指定的内容
defineExpose({
  count,
  increment
});
</script>
```

```vue
<!-- Parent.vue -->
<template>
  <Child ref="childRef" />
  <button @click="accessChild">访问子组件</button>
</template>

<script setup>
import { ref } from 'vue';
import Child from './Child.vue';

const childRef = ref(null);

function accessChild() {
  // ✅ 可以访问暴露的内容
  console.log(childRef.value.count); // 0
  childRef.value.increment(); // ✅

  // ❌ 无法访问未暴露的内容
  console.log(childRef.value.message); // undefined
  console.log(childRef.value.privateData); // undefined
  childRef.value.privateMethod(); // Error
}
</script>
```

### 暴露响应式数据

```vue
<!-- Counter.vue -->
<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const doubleCount = computed(() => count.value * 2);

function increment() {
  count.value++;
}

function reset() {
  count.value = 0;
}

// 暴露响应式数据和计算属性
defineExpose({
  count,        // ref
  doubleCount,  // computed
  increment,    // 方法
  reset         // 方法
});
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
    <button @click="reset">Reset</button>
  </div>
</template>
```

### 父组件使用

```vue
<template>
  <Counter ref="counterRef" />
  <div>
    <p>父组件读取: {{ externalCount }}</p>
    <button @click="handleIncrement">父组件控制 +1</button>
    <button @click="handleReset">父组件重置</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Counter from './Counter.vue';

const counterRef = ref(null);
const externalCount = ref(0);

// 监听子组件的变化
watch(
  () => counterRef.value?.count,
  (newVal) => {
    externalCount.value = newVal;
  }
);

function handleIncrement() {
  counterRef.value?.increment();
}

function handleReset() {
  counterRef.value?.reset();
}
</script>
```

## 传统 setup() 函数中的 expose

在传统的 `setup()` 函数中，可以通过第二个参数的 `expose` 方法来控制暴露内容。

```vue
<script>
import { ref } from 'vue';

export default {
  setup(props, { expose }) {
    const count = ref(0);
    const message = ref('Hello');
    const privateData = ref('私有');

    function increment() {
      count.value++;
    }

    function privateMethod() {
      console.log('私有方法');
    }

    // 显式控制暴露内容
    expose({
      count,
      increment
    });

    // 注意：return 的内容用于模板
    // expose 的内容用于父组件访问
    return {
      count,
      message,
      increment
    };
  }
};
</script>
```

**注意区别：**
- `return`：暴露给模板使用
- `expose`：暴露给父组件访问

**如果不调用 expose：**

```vue
<script>
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const message = ref('Hello');

    // 未调用 expose，全部返回的内容都会暴露给父组件
    return {
      count,
      message
    };
  }
};
</script>
```

## 实战应用场景

### 场景 1：表单组件验证

```vue
<!-- CustomForm.vue -->
<script setup>
import { ref } from 'vue';

const formData = ref({
  username: '',
  email: ''
});

const errors = ref({});

function validate() {
  errors.value = {};

  if (!formData.value.username) {
    errors.value.username = '用户名不能为空';
  }

  if (!formData.value.email) {
    errors.value.email = '邮箱不能为空';
  }

  return Object.keys(errors.value).length === 0;
}

function reset() {
  formData.value = {
    username: '',
    email: ''
  };
  errors.value = {};
}

function getFormData() {
  return { ...formData.value };
}

// 暴露表单控制方法
defineExpose({
  validate,
  reset,
  getFormData
});
</script>

<template>
  <form>
    <div>
      <input v-model="formData.username" placeholder="用户名" />
      <span v-if="errors.username">{{ errors.username }}</span>
    </div>
    <div>
      <input v-model="formData.email" placeholder="邮箱" />
      <span v-if="errors.email">{{ errors.email }}</span>
    </div>
  </form>
</template>
```

**父组件使用：**

```vue
<template>
  <CustomForm ref="formRef" />
  <button @click="handleSubmit">提交</button>
  <button @click="handleReset">重置</button>
</template>

<script setup>
import { ref } from 'vue';
import CustomForm from './CustomForm.vue';

const formRef = ref(null);

async function handleSubmit() {
  // 调用子组件的验证方法
  const isValid = formRef.value.validate();

  if (isValid) {
    const data = formRef.value.getFormData();
    console.log('提交数据:', data);
    // 提交逻辑...
  }
}

function handleReset() {
  formRef.value.reset();
}
</script>
```

### 场景 2：轮播图组件

```vue
<!-- Carousel.vue -->
<script setup>
import { ref } from 'vue';

const currentIndex = ref(0);
const items = ref(['图片1', '图片2', '图片3']);

function next() {
  currentIndex.value = (currentIndex.value + 1) % items.value.length;
}

function prev() {
  currentIndex.value =
    (currentIndex.value - 1 + items.value.length) % items.value.length;
}

function goTo(index) {
  if (index >= 0 && index < items.value.length) {
    currentIndex.value = index;
  }
}

// 暴露控制方法
defineExpose({
  next,
  prev,
  goTo,
  currentIndex
});
</script>

<template>
  <div class="carousel">
    <div class="item">{{ items[currentIndex] }}</div>
    <button @click="prev">上一张</button>
    <button @click="next">下一张</button>
  </div>
</template>
```

**父组件控制：**

```vue
<template>
  <Carousel ref="carouselRef" />
  <button @click="autoPlay">自动播放</button>
  <button @click="stopPlay">停止</button>
</template>

<script setup>
import { ref } from 'vue';
import Carousel from './Carousel.vue';

const carouselRef = ref(null);
let timer = null;

function autoPlay() {
  timer = setInterval(() => {
    carouselRef.value?.next();
  }, 2000);
}

function stopPlay() {
  clearInterval(timer);
}
</script>
```

### 场景 3：对话框组件

```vue
<!-- Dialog.vue -->
<script setup>
import { ref } from 'vue';

const visible = ref(false);

function open() {
  visible.value = true;
}

function close() {
  visible.value = false;
}

// 暴露打开/关闭方法
defineExpose({
  open,
  close
});
</script>

<template>
  <div v-if="visible" class="dialog">
    <div class="dialog-content">
      <slot></slot>
      <button @click="close">关闭</button>
    </div>
  </div>
</template>
```

**父组件使用：**

```vue
<template>
  <button @click="openDialog">打开对话框</button>

  <Dialog ref="dialogRef">
    <h2>对话框内容</h2>
    <p>这是一个对话框</p>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue';
import Dialog from './Dialog.vue';

const dialogRef = ref(null);

function openDialog() {
  dialogRef.value?.open();
}
</script>
```

## TypeScript 支持

### 定义暴露接口

```vue
<!-- Child.vue -->
<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}

// 定义暴露的接口类型
export interface ChildExpose {
  count: typeof count;
  increment: typeof increment;
}

defineExpose<ChildExpose>({
  count,
  increment
});
</script>
```

### 父组件类型推断

```vue
<script setup lang="ts">
import { ref } from 'vue';
import Child, { type ChildExpose } from './Child.vue';

// 指定 ref 的类型
const childRef = ref<InstanceType<typeof Child> | null>(null);

// 或者使用暴露的接口类型
const childRef2 = ref<ChildExpose | null>(null);

function accessChild() {
  // ✅ 类型安全
  childRef.value?.increment();

  // ❌ 类型错误
  // childRef.value?.nonExistent();
}
</script>
```

## 最佳实践

### 1. 明确暴露范围

```vue
<script setup>
// ❌ 不推荐：暴露所有内容
const a = ref(1);
const b = ref(2);
const c = ref(3);

defineExpose({
  a, b, c,
  method1, method2, method3, method4
});

// ✅ 推荐：只暴露必要的内容
defineExpose({
  // 只暴露外部需要的公共API
  publicMethod,
  publicData
});
</script>
```

### 2. 提供文档注释

```vue
<script setup>
const count = ref(0);

/**
 * 增加计数器
 * @public
 */
function increment() {
  count.value++;
}

/**
 * 重置计数器
 * @public
 */
function reset() {
  count.value = 0;
}

defineExpose({
  /** 当前计数值 */
  count,
  /** 增加计数 */
  increment,
  /** 重置计数 */
  reset
});
</script>
```

### 3. 考虑封装性

```vue
<script setup>
import { ref, readonly } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}

// 暴露只读的 count，防止外部直接修改
defineExpose({
  count: readonly(count),
  increment
});
</script>
```

### 4. 避免过度暴露

```vue
<script setup>
// ❌ 不好的做法
defineExpose({
  // 暴露内部实现细节
  _internalState,
  _privateMethod,

  // 暴露过多内容
  allTheThings
});

// ✅ 好的做法
defineExpose({
  // 只暴露稳定的公共 API
  getData,
  updateData,
  reset
});
</script>
```

## 总结

### 关键要点

1. **`<script setup>`默认封闭**：不暴露任何内容
2. **传统 `setup()` 默认开放**：暴露所有返回的内容
3. **`defineExpose` 显式控制**：精确控制暴露内容
4. **`setup(_, { expose })` 函数式控制**：传统语法的暴露方式

### 使用建议

| 场景 | 推荐方案 |
|------|---------|
| 新组件开发 | `<script setup>` + `defineExpose` |
| 需要类型推断 | TypeScript + 定义接口类型 |
| 表单组件 | 暴露 validate、reset 等方法 |
| 弹窗组件 | 暴露 open、close 方法 |
| 播放器组件 | 暴露 play、pause、seek 等方法 |

### 编译器宏对比

| 宏 | 作用 | 返回值 |
|-----|------|-------|
| `defineProps` | 定义 props | props 对象 |
| `defineEmits` | 定义 emits | emit 函数 |
| `defineExpose` | 暴露内容 | 无 |
| `defineOptions` | 定义组件选项 | 无 |
| `defineSlots` | 定义插槽类型 | slots 对象 |

合理使用 `defineExpose`，可以在保持组件封装性的同时，提供必要的外部接口，实现更好的组件设计。
