---
title: Vue 响应式 API 完全指南：ref、reactive、toRef & toRefs
date: 2026-01-19 11:15:30
tags:
  - Vue
  - Reactive
  - Composition API
  - ref
categories:
  - JavaScript
  - Vue
---

# Vue 响应式 API 完全指南：ref、reactive、toRef & toRefs

## 概述

Vue 3 的响应式系统是基于 Proxy 实现的，提供了多个响应式 API 来创建和管理响应式数据。理解这些 API 的区别和使用场景是掌握 Vue 3 的关键。

**核心 API**：
- `ref`：创建基本类型的响应式引用
- `reactive`：创建对象类型的响应式代理
- `toRef`：将响应式对象的单个属性转换为 ref
- `toRefs`：将响应式对象的所有属性转换为 ref
- `shallowRef` / `shallowReactive`：浅层响应式
- `readonly`：创建只读代理
- `isRef` / `isReactive` / `isReadonly`：类型判断

## 一、ref

### 1.1 基本用法

`ref` 用于创建一个响应式引用，适用于基本数据类型（也可用于对象类型）。

```vue
<template>
  <div>
    <p>计数：{{ count }}</p>
    <p>姓名：{{ name }}</p>
    <button @click="increment">增加</button>
    <button @click="changeName">改名</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 创建基本类型的 ref
const count = ref(0);
const name = ref('张三');
const isActive = ref(true);

// 修改值需要使用 .value
const increment = () => {
  count.value++; // ⚠️ 注意：必须使用 .value
};

const changeName = () => {
  name.value = '李四';
};

console.log(count.value); // 0
console.log(name.value);  // '张三'
</script>
```

### 1.2 ref 包装对象

ref 也可以包装对象类型，内部会自动调用 `reactive`。

```javascript
import { ref } from 'vue';

// ref 包装对象
const user = ref({
  name: '张三',
  age: 25
});

// 修改属性
const updateUser = () => {
  // 方式1：修改整个对象
  user.value = {
    name: '李四',
    age: 30
  };

  // 方式2：修改对象属性（推荐）
  user.value.name = '王五';
  user.value.age = 28;
};

// ref 包装数组
const list = ref([1, 2, 3]);

const addItem = () => {
  list.value.push(4);
};

const replaceList = () => {
  list.value = [5, 6, 7];
};
```

### 1.3 自动解包（unwrap）

在模板中，ref 会自动解包，不需要 `.value`。

```vue
<template>
  <div>
    <!-- ✅ 模板中自动解包 -->
    <p>{{ count }}</p>
    <p>{{ user.name }}</p>

    <!-- ❌ 不需要写 .value，这是错误的 -->
    <p>{{ count.value }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);
const user = ref({ name: '张三' });

// ⚠️ JS 中必须使用 .value
console.log(count.value);
console.log(user.value.name);
</script>
```

**⚠️ 注意：在 reactive 对象中的 ref 也会自动解包**

```javascript
import { ref, reactive } from 'vue';

const count = ref(0);

const state = reactive({
  count // ref 在 reactive 对象中会自动解包
});

console.log(state.count); // 0，不需要 .value
state.count++; // 直接修改，不需要 .value

// 但如果是数组或 Map，不会自动解包
const list = reactive([ref(0)]);
console.log(list[0].value); // ⚠️ 需要 .value

const map = reactive(new Map([['count', ref(0)]]));
console.log(map.get('count').value); // ⚠️ 需要 .value
```

### 1.4 ref 的类型定义（TypeScript）

```javascript
import { ref, Ref } from 'vue';

// 自动推导类型
const count = ref(0); // Ref<number>
const name = ref('张三'); // Ref<string>

// 显式指定类型
const count2 = ref<number>(0);
const user = ref<{ name: string; age: number }>({
  name: '张三',
  age: 25
});

// 泛型类型
interface User {
  name: string;
  age: number;
}

const user2 = ref<User>({
  name: '张三',
  age: 25
});

// 可选类型
const user3 = ref<User | null>(null);

// 使用 Ref 类型注解
const count3: Ref<number> = ref(0);
```

## 二、reactive

### 2.1 基本用法

`reactive` 用于创建对象类型的响应式代理，返回对象的响应式副本。

```vue
<template>
  <div>
    <p>姓名：{{ user.name }}</p>
    <p>年龄：{{ user.age }}</p>
    <p>爱好：{{ user.hobbies.join(', ') }}</p>
    <button @click="updateUser">更新</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

// 创建响应式对象
const user = reactive({
  name: '张三',
  age: 25,
  hobbies: ['篮球', '游泳']
});

// 直接修改属性（不需要 .value）
const updateUser = () => {
  user.name = '李四';
  user.age = 30;
  user.hobbies.push('跑步');
};

// ⚠️ 注意：直接访问，不需要 .value
console.log(user.name); // '张三'
</script>
```

### 2.2 reactive 的限制

**⚠️ 只能用于对象类型（对象、数组、Map、Set 等）**

```javascript
import { reactive } from 'vue';

// ✅ 正确用法
const obj = reactive({ name: '张三' });
const arr = reactive([1, 2, 3]);
const map = reactive(new Map());
const set = reactive(new Set());

// ❌ 错误用法：不能用于基本类型
const count = reactive(0); // ❌ 警告
const name = reactive('张三'); // ❌ 警告
```

**⚠️ 不能替换整个对象**

```javascript
import { reactive } from 'vue';

let user = reactive({
  name: '张三',
  age: 25
});

// ❌ 错误：会丢失响应式
user = {
  name: '李四',
  age: 30
};

// ❌ 错误：会丢失响应式
user = reactive({
  name: '李四',
  age: 30
});

// ✅ 正确：使用 Object.assign
Object.assign(user, {
  name: '李四',
  age: 30
});

// ✅ 正确：修改单个属性
user.name = '李四';
user.age = 30;
```

**⚠️ 解构会丢失响应式**

```javascript
import { reactive, toRefs } from 'vue';

const user = reactive({
  name: '张三',
  age: 25
});

// ❌ 错误：解构后丢失响应式
const { name, age } = user;

// 修改不会触发更新
name = '李四'; // 无效
age = 30; // 无效

// ✅ 正确：使用 toRefs
const { name: refName, age: refAge } = toRefs(user);

// 修改会触发更新
refName.value = '李四'; // ✅ 有效
refAge.value = 30; // ✅ 有效
```

### 2.3 深层响应式

reactive 默认是深层响应式的，会递归地将所有嵌套对象转换为响应式。

```javascript
import { reactive } from 'vue';

const state = reactive({
  user: {
    profile: {
      name: '张三',
      address: {
        city: '北京',
        street: '长安街'
      }
    }
  },
  list: [
    { id: 1, name: '项目1' }
  ]
});

// 深层对象都是响应式的
state.user.profile.name = '李四'; // ✅ 响应式
state.user.profile.address.city = '上海'; // ✅ 响应式
state.list[0].name = '项目2'; // ✅ 响应式
state.list.push({ id: 2, name: '项目3' }); // ✅ 响应式
```

### 2.4 TypeScript 类型定义

```javascript
import { reactive } from 'vue';

// 接口定义
interface User {
  name: string;
  age: number;
  hobbies?: string[];
}

// 自动推导
const user1 = reactive({
  name: '张三',
  age: 25
});

// 显式类型注解
const user2: User = reactive({
  name: '张三',
  age: 25
});

// 使用泛型（不推荐，直接注解更好）
const user3 = reactive<User>({
  name: '张三',
  age: 25
});
```

## 三、ref vs reactive 对比

### 3.1 核心差异

| 特性 | ref | reactive |
|------|-----|----------|
| **适用类型** | 任何类型（基本类型 + 对象） | 只能是对象类型 |
| **访问方式** | 需要 `.value`（模板除外） | 直接访问属性 |
| **重新赋值** | ✅ 可以整个替换 | ❌ 不能替换，会丢失响应式 |
| **解构** | 可以（仍是 ref） | ❌ 会丢失响应式 |
| **模板使用** | 自动解包 | 直接使用 |
| **类型推导** | 更明确（Ref<T>） | 普通对象 |

### 3.2 使用场景对比

**使用 ref：**

```javascript
import { ref } from 'vue';

// ✅ 基本类型
const count = ref(0);
const name = ref('张三');
const isActive = ref(true);

// ✅ 需要整体替换的对象
const user = ref({ name: '张三', age: 25 });
user.value = { name: '李四', age: 30 }; // ✅ 可以

// ✅ 单一值
const selected = ref<User | null>(null);
```

**使用 reactive：**

```javascript
import { reactive } from 'vue';

// ✅ 复杂对象，多个相关属性
const form = reactive({
  username: '',
  password: '',
  email: '',
  age: 0
});

// ✅ 数组
const list = reactive([1, 2, 3]);

// ✅ 集合类型
const userMap = reactive(new Map());
const tagSet = reactive(new Set());
```

### 3.3 实际开发建议

**推荐使用 ref 的场景：**

```javascript
import { ref } from 'vue';

// 1. 基本类型
const count = ref(0);
const loading = ref(false);
const message = ref('');

// 2. 需要频繁整体替换的数据
const currentUser = ref<User | null>(null);

// 3. 需要明确的类型标注
const data = ref<ApiResponse>({});

// 4. 组合式函数的返回值
function useCounter() {
  const count = ref(0);
  return { count }; // 解构后仍保持响应式
}
```

**推荐使用 reactive 的场景：**

```javascript
import { reactive } from 'vue';

// 1. 表单数据
const form = reactive({
  username: '',
  password: '',
  remember: false
});

// 2. 状态对象（多个相关状态）
const state = reactive({
  loading: false,
  error: null,
  data: []
});

// 3. 配置对象
const config = reactive({
  theme: 'light',
  language: 'zh-CN',
  pageSize: 10
});
```

## 四、toRef

### 4.1 基本用法

`toRef` 将响应式对象的单个属性转换为 ref，保持响应式连接。

```vue
<template>
  <div>
    <p>姓名：{{ nameRef }}</p>
    <p>年龄：{{ ageRef }}</p>
    <button @click="updateName">修改姓名</button>
    <button @click="updateAge">修改年龄</button>
  </div>
</template>

<script setup>
import { reactive, toRef } from 'vue';

const user = reactive({
  name: '张三',
  age: 25
});

// 创建单个属性的 ref
const nameRef = toRef(user, 'name');
const ageRef = toRef(user, 'age');

const updateName = () => {
  // 修改 ref，原对象也会更新
  nameRef.value = '李四';
  console.log(user.name); // '李四'
};

const updateAge = () => {
  // 修改原对象，ref 也会更新
  user.age = 30;
  console.log(ageRef.value); // 30
};
</script>
```

### 4.2 toRef 的应用场景

**场景 1：从 props 中提取属性**

```javascript
<!-- 子组件 -->
import { toRef } from 'vue';

const props = defineProps({
  user: Object
});

// ❌ 直接解构会丢失响应式
// const { user } = props;

// ✅ 使用 toRef 保持响应式
const userRef = toRef(props, 'user');

// 可以在 computed 或 watch 中使用
watch(userRef, (newUser) => {
  console.log('用户更新：', newUser);
});
```

**场景 2：从 reactive 对象中提取单个值传递给子组件**

```vue
<template>
  <ChildComponent :count="countRef" />
</template>

<script setup>
import { reactive, toRef } from 'vue';

const state = reactive({
  count: 0,
  name: '张三'
});

// 提取单个属性作为 ref 传递
const countRef = toRef(state, 'count');
</script>
```

### 4.3 toRef vs 普通 ref

```javascript
import { reactive, toRef, ref } from 'vue';

const user = reactive({
  name: '张三',
  age: 25
});

// 使用 toRef（保持响应式连接）
const nameByToRef = toRef(user, 'name');
nameByToRef.value = '李四';
console.log(user.name); // '李四' ✅ 原对象也更新

// 使用普通 ref（创建新的独立 ref）
const nameByRef = ref(user.name);
nameByRef.value = '王五';
console.log(user.name); // '李四' ⚠️ 原对象不变
```

### 4.4 toRef 处理不存在的属性

```javascript
import { reactive, toRef } from 'vue';

const user = reactive({
  name: '张三'
});

// 即使属性不存在，也可以创建 ref
const ageRef = toRef(user, 'age');

console.log(ageRef.value); // undefined

// 设置值后，会添加到原对象
ageRef.value = 25;
console.log(user.age); // 25
```

## 五、toRefs

### 5.1 基本用法

`toRefs` 将响应式对象的所有属性转换为 ref，常用于解构。

```vue
<template>
  <div>
    <p>姓名：{{ name }}</p>
    <p>年龄：{{ age }}</p>
    <p>城市：{{ city }}</p>
    <button @click="updateUser">更新</button>
  </div>
</template>

<script setup>
import { reactive, toRefs } from 'vue';

const user = reactive({
  name: '张三',
  age: 25,
  city: '北京'
});

// ❌ 直接解构会丢失响应式
// const { name, age, city } = user;

// ✅ 使用 toRefs 后解构，保持响应式
const { name, age, city } = toRefs(user);

const updateUser = () => {
  // 修改 ref
  name.value = '李四';
  age.value = 30;

  // 原对象也更新
  console.log(user.name); // '李四'
  console.log(user.age); // 30
};
</script>
```

### 5.2 toRefs 的应用场景

**场景 1：组合式函数返回值**

```javascript
import { reactive, toRefs } from 'vue';

// 组合式函数
function useUser() {
  const state = reactive({
    name: '张三',
    age: 25,
    loading: false
  });

  const updateUser = (newName: string) => {
    state.name = newName;
  };

  // ✅ 返回时使用 toRefs，方便解构
  return {
    ...toRefs(state),
    updateUser
  };
}

// 使用
const { name, age, loading, updateUser } = useUser();

// 可以直接使用，保持响应式
console.log(name.value); // '张三'
updateUser('李四');
console.log(name.value); // '李四'
```

**场景 2：从 reactive 对象中批量提取属性**

```vue
<template>
  <div>
    <input v-model="username" />
    <input v-model="password" />
    <input v-model="email" />
  </div>
</template>

<script setup>
import { reactive, toRefs } from 'vue';

const form = reactive({
  username: '',
  password: '',
  email: ''
});

// 批量转换为 ref，方便在模板中使用
const { username, password, email } = toRefs(form);
</script>
```

**场景 3：Props 解构**

```javascript
<!-- 子组件 -->
import { toRefs } from 'vue';

const props = defineProps({
  name: String,
  age: Number,
  city: String
});

// ✅ 保持 props 的响应式
const { name, age, city } = toRefs(props);

// 可以在 watch 中使用
watch(name, (newName) => {
  console.log('姓名变化：', newName);
});
```

### 5.3 toRefs 结合扩展运算符

```javascript
import { reactive, toRefs, ref } from 'vue';

const state = reactive({
  count: 0,
  name: '张三'
});

const message = ref('Hello');

// 组合多个响应式数据
const data = {
  ...toRefs(state),
  message
};

// 使用
console.log(data.count.value); // 0
console.log(data.name.value); // '张三'
console.log(data.message.value); // 'Hello'
```

## 六、其他响应式 API

### 6.1 shallowRef / shallowReactive

创建浅层响应式，只有根级别的属性是响应式的。

**shallowRef：**

```javascript
import { shallowRef } from 'vue';

const state = shallowRef({
  count: 0,
  nested: {
    value: 1
  }
});

// ✅ 整体替换会触发更新
state.value = {
  count: 1,
  nested: { value: 2 }
};

// ❌ 修改嵌套属性不会触发更新
state.value.count = 10; // 不会触发更新
state.value.nested.value = 20; // 不会触发更新

// ✅ 强制触发更新
import { triggerRef } from 'vue';
state.value.count = 10;
triggerRef(state); // 手动触发
```

**shallowReactive：**

```javascript
import { shallowReactive } from 'vue';

const state = shallowReactive({
  count: 0,
  nested: {
    value: 1
  }
});

// ✅ 根级别属性是响应式的
state.count = 10; // 触发更新

// ❌ 嵌套对象不是响应式的
state.nested.value = 20; // 不会触发更新
state.nested = { value: 30 }; // ✅ 替换对象会触发更新
```

**使用场景：**
- 性能优化：处理大型数据结构
- 集成外部状态管理：只需要根级别响应式

### 6.2 readonly

创建只读的响应式代理，防止修改。

```javascript
import { reactive, readonly } from 'vue';

const user = reactive({
  name: '张三',
  age: 25
});

// 创建只读代理
const readonlyUser = readonly(user);

// ❌ 无法修改（开发环境会警告）
readonlyUser.name = '李四'; // 警告
readonlyUser.age = 30; // 警告

// ✅ 原始对象仍可修改
user.name = '李四'; // 可以

// readonly 的变化会跟随原对象
console.log(readonlyUser.name); // '李四'
```

**应用场景：**

```javascript
import { reactive, readonly } from 'vue';

// 组合式函数
function useStore() {
  const state = reactive({
    count: 0,
    users: []
  });

  const increment = () => {
    state.count++;
  };

  // ✅ 对外暴露只读版本，防止外部直接修改
  return {
    state: readonly(state),
    increment
  };
}

const { state, increment } = useStore();

// ❌ 无法直接修改
state.count = 10; // 警告

// ✅ 只能通过方法修改
increment(); // 正确
```

### 6.3 类型判断 API

```javascript
import {
  ref,
  reactive,
  readonly,
  isRef,
  isReactive,
  isReadonly,
  isProxy
} from 'vue';

const count = ref(0);
const user = reactive({ name: '张三' });
const readonlyUser = readonly(user);

// isRef：判断是否是 ref
console.log(isRef(count)); // true
console.log(isRef(user)); // false

// isReactive：判断是否是 reactive
console.log(isReactive(user)); // true
console.log(isReactive(count)); // false
console.log(isReactive(readonlyUser)); // false

// isReadonly：判断是否是只读
console.log(isReadonly(readonlyUser)); // true
console.log(isReadonly(user)); // false

// isProxy：判断是否是 reactive 或 readonly 创建的代理
console.log(isProxy(user)); // true
console.log(isProxy(readonlyUser)); // true
console.log(isProxy(count)); // false
```

### 6.4 unref

获取 ref 的值，如果不是 ref 则返回原值。

```javascript
import { ref, unref } from 'vue';

const count = ref(10);
const num = 20;

console.log(unref(count)); // 10（自动 .value）
console.log(unref(num)); // 20（原值）

// 等价于
const val = isRef(count) ? count.value : count;
```

## 七、实战示例

### 示例 1：用户信息管理

```vue
<template>
  <div class="user-profile">
    <h2>用户信息</h2>

    <!-- 使用 reactive 管理表单 -->
    <form @submit.prevent="handleSubmit">
      <div>
        <label>姓名：</label>
        <input v-model="form.name" />
      </div>
      <div>
        <label>年龄：</label>
        <input v-model.number="form.age" type="number" />
      </div>
      <div>
        <label>邮箱：</label>
        <input v-model="form.email" type="email" />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '提交中...' : '提交' }}
      </button>
    </form>

    <!-- 显示当前用户 -->
    <div v-if="currentUser">
      <h3>当前用户</h3>
      <p>姓名：{{ currentUser.name }}</p>
      <p>年龄：{{ currentUser.age }}</p>
      <p>邮箱：{{ currentUser.email }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

// 表单数据使用 reactive
const form = reactive({
  name: '',
  age: 0,
  email: ''
});

// 单一值使用 ref
const loading = ref(false);
const currentUser = ref(null);

const handleSubmit = async () => {
  loading.value = true;

  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 整体替换用户（ref 的优势）
    currentUser.value = { ...form };

    // 重置表单
    Object.assign(form, {
      name: '',
      age: 0,
      email: ''
    });
  } finally {
    loading.value = false;
  }
};
</script>
```

### 示例 2：使用 toRefs 的组合式函数

```vue
<template>
  <div>
    <h2>计数器</h2>
    <p>当前值：{{ count }}</p>
    <p>双倍值：{{ doubleCount }}</p>
    <button @click="increment">增加</button>
    <button @click="decrement">减少</button>
    <button @click="reset">重置</button>
  </div>
</template>

<script setup>
import { reactive, toRefs, computed } from 'vue';

// 组合式函数
function useCounter(initialValue = 0) {
  const state = reactive({
    count: initialValue
  });

  const doubleCount = computed(() => state.count * 2);

  const increment = () => {
    state.count++;
  };

  const decrement = () => {
    state.count--;
  };

  const reset = () => {
    state.count = initialValue;
  };

  // 使用 toRefs 方便解构
  return {
    ...toRefs(state),
    doubleCount,
    increment,
    decrement,
    reset
  };
}

// 使用（可以直接解构）
const { count, doubleCount, increment, decrement, reset } = useCounter(0);
</script>
```

### 示例 3：Props 与 toRefs

```vue
<!-- 父组件 -->
<template>
  <UserCard
    :name="user.name"
    :age="user.age"
    :email="user.email"
  />
</template>

<script setup>
import { reactive } from 'vue';
import UserCard from './UserCard.vue';

const user = reactive({
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com'
});
</script>

<!-- 子组件 UserCard.vue -->
<template>
  <div class="user-card">
    <h3>{{ name }}</h3>
    <p>年龄：{{ age }}</p>
    <p>邮箱：{{ email }}</p>
    <p>是否成年：{{ isAdult }}</p>
  </div>
</template>

<script setup>
import { toRefs, computed } from 'vue';

const props = defineProps({
  name: String,
  age: Number,
  email: String
});

// 使用 toRefs 解构，保持响应式
const { name, age, email } = toRefs(props);

// 基于 props 的计算属性
const isAdult = computed(() => age.value >= 18);

// 或者直接使用 props（不解构）
// const isAdult = computed(() => props.age >= 18);
</script>
```

## 八、性能优化

### 8.1 选择合适的响应式 API

```javascript
import { ref, shallowRef } from 'vue';

// ❌ 不好：大型对象使用深层响应式
const largeData = ref({
  // 10000+ 个嵌套对象
  items: []
});

// ✅ 好：大型对象使用浅层响应式
const largeData = shallowRef({
  items: []
});

// 需要更新时整体替换
largeData.value = {
  items: newItems
};
```

### 8.2 避免不必要的响应式

```javascript
import { ref } from 'vue';

// ❌ 不好：不需要响应式的常量
const CONFIG = ref({
  API_URL: 'https://api.example.com',
  TIMEOUT: 3000
});

// ✅ 好：使用普通常量
const CONFIG = {
  API_URL: 'https://api.example.com',
  TIMEOUT: 3000
};
```

## 九、常见问题

### Q1: 什么时候用 ref，什么时候用 reactive？

**A**:
- **ref**：基本类型、需要整体替换的对象、单一值
- **reactive**：表单数据、多个相关属性的对象、不需要整体替换的对象

### Q2: 为什么 ref 需要 .value？

**A**: ref 返回的是一个包装对象，内部有一个 `value` 属性存储实际值。这样设计是为了：
1. 保持引用不变（响应式追踪）
2. 统一基本类型和对象类型的处理方式
3. 在 TypeScript 中提供更好的类型推导

### Q3: toRef 和 toRefs 有什么区别？

**A**:
- **toRef**：转换单个属性
- **toRefs**：转换所有属性

### Q4: reactive 的对象可以赋值为 null 吗？

**A**: 不建议。reactive 不能用于基本类型，也不应该赋值为 null。如果需要可空的对象，使用 ref。

```javascript
// ❌ 不好
const user = reactive({ name: '张三' });
user = null; // 错误

// ✅ 好
const user = ref<User | null>({ name: '张三' });
user.value = null; // 正确
```

### Q5: 如何判断一个值是否是响应式的？

**A**: 使用 `isReactive` 或 `isRef`。

```javascript
import { isRef, isReactive } from 'vue';

console.log(isRef(count)); // true
console.log(isReactive(user)); // true
```

## 十、总结

### 核心要点

1. **ref**：适用于基本类型和需要整体替换的对象，需要 `.value` 访问
2. **reactive**：适用于对象类型，直接访问属性，不能整体替换
3. **toRef**：将响应式对象的单个属性转为 ref，保持响应式连接
4. **toRefs**：批量转换，常用于解构和组合式函数返回值
5. **选择原则**：基本类型用 ref，复杂对象用 reactive，需要解构用 toRefs

### 最佳实践

- 优先使用 ref，更灵活
- 表单数据使用 reactive
- 组合式函数返回值使用 toRefs
- 大型数据考虑使用 shallow 版本
- Props 解构使用 toRefs
- 只读数据使用 readonly

## 参考资源

- [Vue 3 官方文档 - 响应式 API](https://cn.vuejs.org/api/reactivity-core.html)
- [Vue 3 响应式原理](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)
- [Composition API FAQ](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
