---
title: Vue 组件通信完全指南
date: 2026-01-19 11:08:00
tags:
  - Vue
  - Component
  - Communication
  - Props
  - Emit
categories:
  - JavaScript
  - Vue
---

# Vue 组件通信完全指南

## 概述

组件通信是 Vue 开发中最核心的概念之一。随着应用规模的增长，组件之间需要共享数据、触发事件、协调状态。本文将全面介绍 Vue 2 和 Vue 3 中的各种组件通信方式，帮助你在不同场景下选择最合适的方案。

## 组件关系分类

在 Vue 应用中，组件之间的关系主要分为三类：

1. **父子组件**：直接的父子层级关系
2. **兄弟组件**：同一父组件下的平级组件
3. **隔代组件**：跨越多层级的祖先-后代关系

不同的关系需要采用不同的通信方式。

## 一、父子组件通信

父子组件通信是最常见的场景，Vue 提供了多种方式来实现。

### 1.1 Props（父 → 子）

Props 是父组件向子组件传递数据的主要方式。

#### Vue 3 + Composition API

**父组件：**

```vue
<template>
  <div>
    <h1>父组件</h1>
    <!-- 传递静态值 -->
    <ChildComponent title="Hello" />

    <!-- 传递动态值 -->
    <ChildComponent
      :title="pageTitle"
      :count="userCount"
      :user="currentUser"
      :list="items"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ChildComponent from './ChildComponent.vue';

const pageTitle = ref('用户列表');
const userCount = ref(10);
const currentUser = ref({
  name: '张三',
  age: 25
});
const items = ref([1, 2, 3, 4, 5]);
</script>
```

**子组件：**

```vue
<template>
  <div class="child">
    <h2>{{ title }}</h2>
    <p>用户数量：{{ count }}</p>
    <p>当前用户：{{ user.name }}</p>
    <ul>
      <li v-for="item in list" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>

<script setup>
// 基础用法
const props = defineProps({
  title: String,
  count: Number,
  user: Object,
  list: Array
});

// 完整的类型验证
const props = defineProps({
  title: {
    type: String,
    required: true,
    default: '默认标题'
  },
  count: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 // 自定义验证
  },
  user: {
    type: Object,
    default: () => ({}) // 对象/数组必须使用函数返回
  },
  list: {
    type: Array,
    default: () => []
  }
});

// 访问 props
console.log(props.title);
console.log(props.count);
</script>
```

#### Vue 3 (Composition API)

```vue
<script setup>
// 使用运行时声明定义 props
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
  user: { type: Object, required: true },
  list: { type: Array, default: () => [] }
});
</script>
```

#### Vue 2（Options API）

```vue
<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    user: {
      type: Object,
      default: () => ({})
    }
  },
  mounted() {
    console.log(this.title);
    console.log(this.count);
  }
}
</script>
```

#### Props 注意事项

**⚠️ 单向数据流**

Props 是单向向下绑定的，父组件更新会流向子组件，但反过来不行。

```vue
<!-- ❌ 错误：不要直接修改 props -->
<script setup>
const props = defineProps(['count']);

const increment = () => {
  props.count++; // ❌ 运行时警告
};
</script>

<!-- ✅ 正确：使用本地数据 -->
<script setup>
import { ref } from 'vue';

const props = defineProps(['count']);
const localCount = ref(props.count); // 创建本地副本

const increment = () => {
  localCount.value++; // ✅ 修改本地数据
};
</script>

<!-- ✅ 正确：通过事件通知父组件修改 -->
<script setup>
const props = defineProps(['count']);
const emit = defineEmits(['update:count']);

const increment = () => {
  emit('update:count', props.count + 1); // ✅ 通知父组件
};
</script>
```

### 1.2 $emit / defineEmits（子 → 父）

子组件通过触发事件的方式向父组件传递数据。

#### Vue 3

**子组件：**

```vue
<template>
  <div>
    <button @click="handleClick">点击我</button>
    <button @click="sendData">发送数据</button>
    <button @click="sendMultiple">发送多个参数</button>
  </div>
</template>

<script setup>
// 声明事件
const emit = defineEmits(['click', 'submit', 'change']);

const handleClick = () => {
  // 触发事件，不传参数
  emit('click');
};

const sendData = () => {
  // 触发事件，传递单个参数
  const data = { name: '张三', age: 25 };
  emit('submit', data);
};

const sendMultiple = () => {
  // 触发事件，传递多个参数
  emit('change', 'value1', 'value2', 'value3');
};
</script>
```

**父组件：**

```vue
<template>
  <div>
    <!-- 监听子组件事件 -->
    <ChildComponent
      @click="handleChildClick"
      @submit="handleSubmit"
      @change="handleChange"
    />
  </div>
</template>

<script setup>
const handleChildClick = () => {
  console.log('子组件被点击');
};

const handleSubmit = (data) => {
  console.log('收到数据：', data);
  // { name: '张三', age: 25 }
};

const handleChange = (val1, val2, val3) => {
  console.log(val1, val2, val3);
  // 'value1' 'value2' 'value3'
};
</script>
```

#### 事件验证（Vue 3）

```vue
<script setup>
// 对象语法：可以验证事件参数
const emit = defineEmits({
  // 无验证
  click: null,

  // 有验证
  submit: (data) => {
    if (!data.name) {
      console.warn('name is required');
      return false; // 验证失败
    }
    return true; // 验证成功
  },

  // 复杂验证
  update: (value) => {
    return typeof value === 'number' && value >= 0;
  }
});
</script>
```

#### Vue 2

```vue
<script>
export default {
  methods: {
    handleClick() {
      // 触发事件
      this.$emit('click');

      // 传递数据
      this.$emit('submit', { name: '张三' });

      // 多个参数
      this.$emit('change', 'val1', 'val2');
    }
  }
}
</script>
```

### 1.3 v-model（双向绑定）

v-model 是 props 和 emit 的语法糖，实现父子组件的双向数据绑定。

#### Vue 3 - 单个 v-model

**子组件：**

```vue
<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps(['modelValue']);
defineEmits(['update:modelValue']);
</script>
```

**父组件：**

```vue
<template>
  <div>
    <ChildComponent v-model="inputValue" />
    <p>输入的值：{{ inputValue }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const inputValue = ref('');
</script>
```

#### Vue 3 - 多个 v-model

```vue
<!-- 子组件 -->
<template>
  <div>
    <input
      :value="title"
      @input="$emit('update:title', $event.target.value)"
      placeholder="标题"
    />
    <input
      :value="content"
      @input="$emit('update:content', $event.target.value)"
      placeholder="内容"
    />
  </div>
</template>

<script setup>
defineProps(['title', 'content']);
defineEmits(['update:title', 'update:content']);
</script>

<!-- 父组件 -->
<template>
  <div>
    <ChildComponent
      v-model:title="formTitle"
      v-model:content="formContent"
    />
    <p>标题：{{ formTitle }}</p>
    <p>内容：{{ formContent }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const formTitle = ref('');
const formContent = ref('');
</script>
```

#### Vue 3.4+ - defineModel（简化写法）

Vue 3.4 引入了 `defineModel`，极大简化了 v-model 的实现。

```vue
<template>
  <input v-model="model" />
</template>

<script setup>
// 自动创建 modelValue prop 和 update:modelValue emit
const model = defineModel();

// 多个 v-model
const title = defineModel('title');
const content = defineModel('content');

// 带默认值
const count = defineModel({ default: 0 });

// 带验证
const value = defineModel({
  type: String,
  required: true,
  validator: (val) => val.length > 0
});
</script>
```

#### Vue 2 - v-model

Vue 2 中 v-model 默认使用 `value` prop 和 `input` 事件。

```vue
<!-- 子组件 -->
<template>
  <input
    :value="value"
    @input="$emit('input', $event.target.value)"
  />
</template>

<script>
export default {
  props: ['value']
}
</script>

<!-- 父组件 -->
<template>
  <ChildComponent v-model="inputValue" />
</template>
```

**自定义 v-model（Vue 2）：**

```vue
<script>
export default {
  model: {
    prop: 'checked', // 自定义 prop 名称
    event: 'change'  // 自定义事件名称
  },
  props: {
    checked: Boolean
  }
}
</script>
```

### 1.4 ref / $refs（父 → 子）

父组件可以通过 ref 直接访问子组件实例，调用子组件的方法或访问数据。

#### Vue 3

**子组件：**

```vue
<template>
  <div>
    <p>内部计数：{{ count }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);

// 暴露给父组件的方法和数据
const increment = () => {
  count.value++;
};

const reset = () => {
  count.value = 0;
};

// 必须使用 defineExpose 显式暴露
defineExpose({
  count,
  increment,
  reset
});
</script>
```

**父组件：**

```vue
<template>
  <div>
    <ChildComponent ref="childRef" />
    <button @click="callChildMethod">调用子组件方法</button>
    <button @click="getChildData">获取子组件数据</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ChildComponent from './ChildComponent.vue';

const childRef = ref(null);

const callChildMethod = () => {
  // 调用子组件方法
  childRef.value.increment();
};

const getChildData = () => {
  // 访问子组件数据
  console.log('子组件的 count：', childRef.value.count);
};
</script>
```

#### Vue 2

```vue
<!-- 子组件 -->
<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++;
    }
  }
}
</script>

<!-- 父组件 -->
<template>
  <div>
    <ChildComponent ref="child" />
    <button @click="handleClick">调用</button>
  </div>
</template>

<script>
export default {
  methods: {
    handleClick() {
      // 直接访问，无需 defineExpose
      this.$refs.child.increment();
      console.log(this.$refs.child.count);
    }
  }
}
</script>
```

**⚠️ 注意事项：**

- ref 访问应该作为最后手段，优先使用 props 和 emit
- Vue 3 必须使用 `defineExpose` 显式暴露
- 在 `onMounted` 之后才能访问 ref

### 1.5 $parent / $children（Vue 2）

Vue 2 中可以使用 `$parent` 和 `$children` 访问父子组件实例。

**⚠️ Vue 3 已移除 `$children`，不推荐使用 `$parent`。**

```vue
<!-- Vue 2 -->
<script>
export default {
  mounted() {
    // 访问父组件
    console.log(this.$parent);
    this.$parent.someMethod();

    // 访问子组件
    console.log(this.$children);
    this.$children[0].someMethod();
  }
}
</script>
```

### 1.6 $attrs（属性透传）

`$attrs` 包含父组件传递的、但未被子组件 props 声明的所有属性。

#### Vue 3

```vue
<!-- 父组件 -->
<template>
  <ChildComponent
    id="child-1"
    class="custom-class"
    data-test="test"
    title="标题"
    @click="handleClick"
  />
</template>

<!-- 子组件 -->
<template>
  <div>
    <p>Title: {{ title }}</p>
    <!-- 手动绑定 $attrs -->
    <button v-bind="$attrs">按钮</button>
  </div>
</template>

<script setup>
import { useAttrs } from 'vue';

defineProps(['title']);

const attrs = useAttrs();
console.log(attrs);
// {
//   id: 'child-1',
//   class: 'custom-class',
//   'data-test': 'test',
//   onClick: fn
// }
</script>
```

**禁用自动继承：**

```vue
<script setup>
// 禁用属性自动继承到根元素
defineOptions({
  inheritAttrs: false
});
</script>
```

#### Vue 2 vs Vue 3 差异

**Vue 2：**
- `$attrs`：不包含 class 和 style
- `$listeners`：单独存放事件监听器

**Vue 3：**
- `$attrs`：包含 class、style 和事件监听器
- 移除了 `$listeners`（合并到 `$attrs` 中）

```vue
<!-- Vue 2 -->
<template>
  <div>
    <component v-bind="$attrs" v-on="$listeners" />
  </div>
</template>

<!-- Vue 3 -->
<template>
  <div>
    <!-- $attrs 已包含事件监听器 -->
    <component v-bind="$attrs" />
  </div>
</template>
```

## 二、兄弟组件通信

兄弟组件之间没有直接的层级关系，需要通过"中介"进行通信。

### 2.1 Event Bus（Vue 2）

Vue 2 中可以使用 Event Bus 模式进行兄弟组件通信。

#### Vue 2 实现

**创建 Event Bus：**

```javascript
// eventBus.js
import Vue from 'vue';
export const EventBus = new Vue();
```

**组件 A（发送数据）：**

```vue
<template>
  <div>
    <button @click="sendMessage">发送消息</button>
  </div>
</template>

<script>
import { EventBus } from '@/utils/eventBus';

export default {
  methods: {
    sendMessage() {
      const data = { text: 'Hello from A', time: Date.now() };
      EventBus.$emit('message', data);
    }
  },

  beforeDestroy() {
    // 组件销毁时清理监听器
    EventBus.$off('message');
  }
}
</script>
```

**组件 B（接收数据）：**

```vue
<template>
  <div>
    <p>收到的消息：{{ receivedMessage }}</p>
  </div>
</template>

<script>
import { EventBus } from '@/utils/eventBus';

export default {
  data() {
    return {
      receivedMessage: ''
    }
  },

  mounted() {
    // 监听事件
    EventBus.$on('message', this.handleMessage);
  },

  methods: {
    handleMessage(data) {
      console.log('收到消息：', data);
      this.receivedMessage = data.text;
    }
  },

  beforeDestroy() {
    // 组件销毁时移除监听器
    EventBus.$off('message', this.handleMessage);
  }
}
</script>
```

**⚠️ Vue 3 移除了 `$on`、`$off`、`$once` 方法，Event Bus 不再可用。**

### 2.2 mitt（Vue 3 推荐）

Vue 3 官方推荐使用 `mitt` 库来实现 Event Bus 功能。

#### 安装

```bash
npm install mitt -S
```

#### 创建 Event Bus

```javascript
// plugins/Bus.js
import mitt from 'mitt';

const emitter = mitt();

export default emitter;
```

#### 组件 A（发送数据）

```vue
<template>
  <div class="component-a">
    <h3>组件 A</h3>
    <input v-model="message" placeholder="输入消息" />
    <button @click="sendMessage">发送给 B</button>
    <button @click="sendObject">发送对象</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import emitter from '@/plugins/Bus';

const message = ref('');

// 发送简单消息
const sendMessage = () => {
  emitter.emit('message', message.value);
  console.log('A 发送消息：', message.value);
};

// 发送对象
const sendObject = () => {
  const data = {
    text: message.value,
    from: 'Component A',
    timestamp: Date.now()
  };
  emitter.emit('dataObject', data);
};
</script>
```

#### 组件 B（接收数据）

```vue
<template>
  <div class="component-b">
    <h3>组件 B</h3>
    <p>收到的消息：{{ receivedMessage }}</p>
    <p>收到的对象：{{ receivedObject }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import emitter from '@/plugins/Bus';

const receivedMessage = ref('');
const receivedObject = ref(null);

// 处理简单消息
const handleMessage = (msg) => {
  console.log('B 收到消息：', msg);
  receivedMessage.value = msg;
};

// 处理对象数据
const handleDataObject = (data) => {
  console.log('B 收到对象：', data);
  receivedObject.value = data;
};

onMounted(() => {
  // 监听事件
  emitter.on('message', handleMessage);
  emitter.on('dataObject', handleDataObject);
});

onBeforeUnmount(() => {
  // 组件卸载时移除监听器（重要！）
  emitter.off('message', handleMessage);
  emitter.off('dataObject', handleDataObject);
});
</script>
```

#### mitt 完整 API

```javascript
import emitter from '@/plugins/Bus';

// 1. 触发事件
emitter.emit('eventName', data);

// 2. 监听事件
emitter.on('eventName', callback);

// 3. 监听一次（触发后自动移除）
emitter.on('eventName', callback);
const off = emitter.on('eventName', callback);
off(); // 手动移除

// 4. 移除监听器
emitter.off('eventName', callback); // 移除特定监听器
emitter.off('eventName');           // 移除该事件的所有监听器

// 5. 监听所有事件
emitter.on('*', (type, data) => {
  console.log('事件类型：', type);
  console.log('事件数据：', data);
});

// 6. 清空所有监听器
emitter.all.clear();
```

#### 完整使用示例

**父组件（包含兄弟组件）：**

```vue
<template>
  <div class="parent">
    <h2>父组件</h2>
    <div class="siblings">
      <ComponentA />
      <ComponentB />
    </div>
  </div>
</template>

<script setup>
import ComponentA from './ComponentA.vue';
import ComponentB from './ComponentB.vue';
</script>

<style scoped>
.siblings {
  display: flex;
  gap: 20px;
}
</style>
```

#### mitt 最佳实践

**1. 封装 composable：**

```javascript
// composables/useEventBus.js
import { onBeforeUnmount } from 'vue';
import emitter from '@/plugins/Bus';

export function useEventBus() {
  const listeners = [];

  const on = (event, callback) => {
    emitter.on(event, callback);
    listeners.push({ event, callback });
  };

  const emit = (event, data) => {
    emitter.emit(event, data);
  };

  // 自动清理
  onBeforeUnmount(() => {
    listeners.forEach(({ event, callback }) => {
      emitter.off(event, callback);
    });
  });

  return { on, emit };
}
```

**使用封装后的 composable：**

```vue
<script setup>
import { ref } from 'vue';
import { useEventBus } from '@/composables/useEventBus';

const { on, emit } = useEventBus();
const message = ref('');

// 自动清理，无需手动 off
on('message', (msg) => {
  message.value = msg;
});

const send = () => {
  emit('message', 'Hello');
};
</script>
```

**2. TypeScript 类型支持：**

```typescript
// plugins/Bus.ts
import mitt, { Emitter } from 'mitt';

// 定义事件类型
type Events = {
  message: string;
  userUpdate: { id: number; name: string };
  dataChange: number;
};

const emitter: Emitter<Events> = mitt<Events>();

export default emitter;
```

### 2.3 通过共同的父组件

兄弟组件可以通过共同的父组件作为中介进行通信。

```vue
<!-- 父组件 -->
<template>
  <div>
    <ComponentA @send="handleData" />
    <ComponentB :data="sharedData" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const sharedData = ref('');

const handleData = (data) => {
  sharedData.value = data;
};
</script>

<!-- 组件 A -->
<template>
  <button @click="$emit('send', 'Hello')">发送</button>
</template>

<!-- 组件 B -->
<template>
  <p>{{ data }}</p>
</template>

<script setup>
defineProps(['data']);
</script>
```

### 2.4 Vuex / Pinia（状态管理）

对于复杂的兄弟组件通信，推荐使用状态管理库。

#### Pinia 示例

```javascript
// stores/message.js
import { defineStore } from 'pinia';

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: []
  }),

  actions: {
    addMessage(msg) {
      this.messages.push({
        text: msg,
        timestamp: Date.now()
      });
    }
  }
});
```

```vue
<!-- 组件 A -->
<script setup>
import { useMessageStore } from '@/stores/message';

const store = useMessageStore();

const send = () => {
  store.addMessage('Hello from A');
};
</script>

<!-- 组件 B -->
<script setup>
import { useMessageStore } from '@/stores/message';

const store = useMessageStore();
// 自动响应式
console.log(store.messages);
</script>
```

## 三、隔代组件通信（祖先-后代）

隔代组件指跨越多层级的祖先和后代组件。

### 3.1 provide / inject

`provide` 和 `inject` 是专门用于祖先组件向后代组件传递数据的机制。

#### Vue 3

**祖先组件：**

```vue
<template>
  <div>
    <h2>祖先组件</h2>
    <p>主题：{{ theme }}</p>
    <button @click="toggleTheme">切换主题</button>
    <ParentComponent />
  </div>
</template>

<script setup>
import { ref, provide, readonly } from 'vue';
import ParentComponent from './ParentComponent.vue';

const theme = ref('light');
const userInfo = ref({
  name: '张三',
  role: 'admin'
});

// 提供响应式数据
provide('theme', theme);

// 提供只读数据（防止后代修改）
provide('userInfo', readonly(userInfo));

// 提供方法
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};
provide('toggleTheme', toggleTheme);

// 提供普通值
provide('appName', 'My App');
</script>
```

**后代组件（任意层级）：**

```vue
<template>
  <div :class="`theme-${theme}`">
    <h3>后代组件</h3>
    <p>当前主题：{{ theme }}</p>
    <p>应用名称：{{ appName }}</p>
    <p>用户：{{ userInfo.name }}</p>
    <button @click="handleToggle">切换主题</button>
  </div>
</template>

<script setup>
import { inject } from 'vue';

// 注入数据
const theme = inject('theme');
const appName = inject('appName');
const userInfo = inject('userInfo');
const toggleTheme = inject('toggleTheme');

// 提供默认值
const config = inject('config', { timeout: 3000 });

// 使用函数作为默认值（避免创建开销）
const data = inject('data', () => ({ items: [] }));

const handleToggle = () => {
  toggleTheme();
};
</script>

<style scoped>
.theme-light {
  background: white;
  color: black;
}

.theme-dark {
  background: #333;
  color: white;
}
</style>
```

#### 使用 Symbol 作为 key（避免冲突）

```javascript
// keys.js
export const ThemeKey = Symbol('theme');
export const UserKey = Symbol('user');
```

```vue
<!-- 祖先组件 -->
<script setup>
import { provide } from 'vue';
import { ThemeKey, UserKey } from './keys';

provide(ThemeKey, 'light');
provide(UserKey, { name: '张三' });
</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue';
import { ThemeKey, UserKey } from './keys';

const theme = inject(ThemeKey);
const user = inject(UserKey);
</script>
```

#### Vue 2

```vue
<!-- 祖先组件 -->
<script>
export default {
  provide() {
    return {
      theme: 'light',
      userInfo: this.userInfo // ⚠️ 非响应式
    }
  },
  data() {
    return {
      userInfo: { name: '张三' }
    }
  }
}
</script>

<!-- 后代组件 -->
<script>
export default {
  inject: ['theme', 'userInfo'],
  mounted() {
    console.log(this.theme);
    console.log(this.userInfo);
  }
}
</script>
```

**Vue 2 响应式 provide：**

```javascript
export default {
  provide() {
    return {
      theme: () => this.theme // 使用函数
    }
  },
  data() {
    return {
      theme: 'light'
    }
  }
}

// 后代组件
export default {
  inject: ['theme'],
  computed: {
    currentTheme() {
      return this.theme(); // 调用函数获取最新值
    }
  }
}
```

### 3.2 $attrs 透传

通过 `v-bind="$attrs"` 可以将属性向下透传多层。

```vue
<!-- 祖先组件 -->
<template>
  <Parent title="标题" :count="10" @click="handleClick" />
</template>

<!-- 中间组件 -->
<template>
  <!-- 透传所有属性 -->
  <Child v-bind="$attrs" />
</template>

<script setup>
defineOptions({
  inheritAttrs: false // 禁用自动继承
});
</script>

<!-- 后代组件 -->
<template>
  <div>
    <p>{{ title }}</p>
    <p>{{ count }}</p>
  </div>
</template>

<script setup>
defineProps(['title', 'count']);
</script>
```

### 3.3 Vuex / Pinia

状态管理是最常用的跨层级通信方式，详见兄弟组件通信部分。

## 四、Vue 2 vs Vue 3 对比总结

| 通信方式 | Vue 2 | Vue 3 | 说明 |
|---------|-------|-------|------|
| **Props** | ✅ | ✅ | 完全一致 |
| **$emit** | `this.$emit()` | `defineEmits()` | Vue 3 需要声明 |
| **v-model** | 单个，使用 `value` prop | 多个，使用 `modelValue` | Vue 3 更灵活 |
| **$refs** | 直接访问所有属性 | 需要 `defineExpose` | Vue 3 更安全 |
| **$parent** | ✅ | ⚠️ 保留但不推荐 | - |
| **$children** | ✅ | ❌ 已移除 | - |
| **$attrs** | 不含 class/style | 包含 class/style/事件 | Vue 3 统一 |
| **$listeners** | ✅ 单独属性 | ❌ 合并到 $attrs | - |
| **Event Bus** | `new Vue()` | ❌ 需要 mitt | $on/$off 已移除 |
| **provide/inject** | ⚠️ 非响应式 | ✅ 响应式 | Vue 3 改进 |

## 五、选择建议

### 父子组件通信

| 场景 | 推荐方案 |
|------|---------|
| 父 → 子传递数据 | Props |
| 子 → 父传递数据 | emit |
| 双向绑定 | v-model + defineModel |
| 父组件调用子组件方法 | ref + defineExpose |
| 透传属性到内部元素 | $attrs |

### 兄弟组件通信

| 场景 | 推荐方案 |
|------|---------|
| 简单临时通信 | mitt |
| 共享状态 | Pinia |
| 通过父组件 | emit + props |

### 隔代组件通信

| 场景 | 推荐方案 |
|------|---------|
| 传递配置/主题 | provide/inject |
| 全局状态 | Pinia |
| 属性透传 | $attrs |

## 六、最佳实践

### 1. 优先使用 Props 和 Emit

```vue
<!-- ✅ 推荐 -->
<ChildComponent :data="data" @update="handleUpdate" />

<!-- ❌ 避免 -->
<ChildComponent ref="child" />
// this.$refs.child.updateData(data)
```

### 2. 避免修改 Props

```vue
<!-- ❌ 错误 -->
<script setup>
const props = defineProps(['count']);
props.count++; // 警告
</script>

<!-- ✅ 正确 -->
<script setup>
const props = defineProps(['count']);
const emit = defineEmits(['update:count']);

const increment = () => {
  emit('update:count', props.count + 1);
};
</script>
```

### 3. 及时清理事件监听

```vue
<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import emitter from '@/plugins/Bus';

const handleMessage = (msg) => {
  console.log(msg);
};

onMounted(() => {
  emitter.on('message', handleMessage);
});

onBeforeUnmount(() => {
  // ⚠️ 必须清理
  emitter.off('message', handleMessage);
});
</script>
```

### 4. provide/inject 提供只读数据

```vue
<script setup>
import { ref, provide, readonly } from 'vue';

const config = ref({ theme: 'light' });

// ✅ 提供只读版本
provide('config', readonly(config));

// ❌ 直接提供（后代可以修改）
provide('config', config);
</script>
```

### 5. Props 和 Emit 的完整示例

```vue
<script setup>
// Props 定义
const props = defineProps({
  user: { type: Object, required: true },
  count: { type: Number, required: true }
});

// Emit 定义
const emit = defineEmits(['update', 'delete']);

// Provide/Inject 示例
import { provide, inject } from 'vue';

export const UserKey = Symbol('user');

provide(UserKey, { name: '张三', age: 25 });

const user = inject(UserKey);
</script>
```

## 七、常见问题

### Q1: 何时使用 mitt，何时使用 Pinia？

**A**:
- **mitt**：适用于简单、临时的事件通信，组件间偶尔需要传递消息
- **Pinia**：适用于需要共享状态、多个组件访问同一数据的场景

### Q2: provide/inject 和 Pinia 有什么区别？

**A**:
- **provide/inject**：适合传递配置、主题等相对固定的数据，作用域限于组件树
- **Pinia**：全局状态管理，提供 devtools、插件系统、更强的类型支持

### Q3: Vue 3 为什么移除了 $children？

**A**: `$children` 依赖子组件的顺序，容易出错且难以维护。Vue 3 推荐使用 provide/inject 或 ref 来访问子组件。

### Q4: defineExpose 暴露的数据是响应式的吗？

**A**: 是的。如果暴露的是 ref 或 reactive 对象，父组件访问时仍然是响应式的。

```vue
<script setup>
import { ref } from 'vue';

const count = ref(0);

defineExpose({ count }); // 父组件访问 childRef.value.count 仍然是响应式
</script>
```

### Q5: mitt 的性能如何？

**A**: mitt 非常轻量（<200 bytes），性能优异。但要注意：
- 及时移除监听器，避免内存泄漏
- 不要滥用，过多的事件会使应用难以维护

## 八、完整示例

### 示例：购物车系统

```vue
<!-- App.vue - 根组件 -->
<template>
  <div>
    <Header />
    <div class="main">
      <ProductList />
      <Cart />
    </div>
  </div>
</template>

<script setup>
import { provide, ref } from 'vue';
import Header from './Header.vue';
import ProductList from './ProductList.vue';
import Cart from './Cart.vue';

const cart = ref([]);

const addToCart = (product) => {
  const existing = cart.value.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.value.push({ ...product, quantity: 1 });
  }
};

const removeFromCart = (productId) => {
  const index = cart.value.findIndex(item => item.id === productId);
  if (index > -1) {
    cart.value.splice(index, 1);
  }
};

// 向后代组件提供购物车功能
provide('cart', cart);
provide('addToCart', addToCart);
provide('removeFromCart', removeFromCart);
</script>

<!-- ProductList.vue -->
<template>
  <div class="product-list">
    <ProductItem
      v-for="product in products"
      :key="product.id"
      :product="product"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProductItem from './ProductItem.vue';

const products = ref([
  { id: 1, name: '商品1', price: 99 },
  { id: 2, name: '商品2', price: 199 }
]);
</script>

<!-- ProductItem.vue -->
<template>
  <div class="product">
    <h3>{{ product.name }}</h3>
    <p>¥{{ product.price }}</p>
    <button @click="handleAdd">加入购物车</button>
  </div>
</template>

<script setup>
import { inject } from 'vue';

const props = defineProps(['product']);
const addToCart = inject('addToCart');

const handleAdd = () => {
  addToCart(props.product);
};
</script>

<!-- Cart.vue -->
<template>
  <div class="cart">
    <h2>购物车 ({{ cart.length }})</h2>
    <div v-for="item in cart" :key="item.id">
      <span>{{ item.name }} x{{ item.quantity }}</span>
      <button @click="remove(item.id)">删除</button>
    </div>
    <p>总计：¥{{ total }}</p>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue';

const cart = inject('cart');
const removeFromCart = inject('removeFromCart');

const total = computed(() => {
  return cart.value.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
});

const remove = (id) => {
  removeFromCart(id);
};
</script>
```

## 总结

Vue 提供了丰富的组件通信方式，选择合适的方案是关键：

1. **父子通信**：优先使用 Props 和 Emit，必要时使用 v-model 和 ref
2. **兄弟通信**：简单场景用 mitt，复杂状态用 Pinia
3. **隔代通信**：配置用 provide/inject，全局状态用 Pinia

记住核心原则：
- 保持数据流清晰
- 避免过度耦合
- 及时清理副作用
- 优先使用显式通信（Props/Emit）

## 参考资源

- [Vue 3 官方文档 - 组件通信](https://cn.vuejs.org/guide/components/events.html)
- [mitt 官方文档](https://github.com/developit/mitt)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 provide/inject](https://cn.vuejs.org/guide/components/provide-inject.html)
