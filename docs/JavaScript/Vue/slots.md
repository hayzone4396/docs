---
title: Vue 插槽（Slots）完全指南
date: 2026-01-19 11:02:00
tags:
  - Vue
  - Slots
  - Component
categories:
  - JavaScript
  - Vue
---

# Vue 插槽（Slots）完全指南

## 概述

插槽（Slots）是 Vue 组件中一个强大的内容分发机制，它允许父组件向子组件传递模板内容，从而实现更加灵活和可复用的组件设计。插槽使得组件可以像 HTML 元素一样嵌套使用，父组件可以自定义子组件的部分内容。

## 为什么需要插槽？

在没有插槽的情况下，子组件的内容是完全固定的。但实际开发中，我们经常需要：

- 在组件的特定位置插入自定义内容
- 复用组件结构，但改变其中的某些部分
- 将复杂的模板逻辑分离到父组件中
- 实现更加灵活的组件 API

**插槽解决的核心问题**：如何让组件既有固定的结构，又能接收动态的内容。

## 1. 匿名插槽（默认插槽）

匿名插槽也称为默认插槽，是最基础的插槽形式。当父组件向子组件传递内容时，如果没有指定插槽名称，这些内容会被插入到默认插槽中。

### 基础用法

**子组件定义（MyButton.vue）：**

```vue
<template>
  <button class="custom-button">
    <!-- 默认插槽位置 -->
    <slot></slot>
  </button>
</template>

<style scoped>
.custom-button {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

**父组件使用：**

```vue
<template>
  <div>
    <!-- 插槽内容会替换 <slot></slot> -->
    <MyButton>点击我</MyButton>

    <!-- 可以传入任何内容 -->
    <MyButton>
      <span>🚀</span>
      <span>提交</span>
    </MyButton>

    <!-- 甚至可以传入组件 -->
    <MyButton>
      <IconComponent />
      <span>保存</span>
    </MyButton>
  </div>
</template>
```

### 默认内容（后备内容）

插槽可以设置默认内容，当父组件没有传递内容时显示：

```vue
<template>
  <button class="custom-button">
    <slot>默认按钮文字</slot>
  </button>
</template>
```

```vue
<!-- 父组件 -->
<template>
  <!-- 显示：默认按钮文字 -->
  <MyButton></MyButton>

  <!-- 显示：自定义内容 -->
  <MyButton>自定义内容</MyButton>
</template>
```

### 实际应用场景

**场景一：卡片组件**

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <slot>暂无内容</slot>
  </div>
</template>

<!-- 使用 -->
<Card>
  <h3>卡片标题</h3>
  <p>这是卡片内容</p>
</Card>
```

**场景二：对话框组件**

```vue
<!-- Dialog.vue -->
<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-content">
      <slot>对话框内容</slot>
      <button @click="close">关闭</button>
    </div>
  </div>
</template>
```

## 2. 具名插槽（Named Slots）

具名插槽允许我们定义多个插槽，每个插槽有不同的名称，从而实现更精细的内容分发控制。

### 基础语法

**子组件定义（Layout.vue）：**

```vue
<template>
  <div class="layout">
    <!-- 头部插槽 -->
    <header>
      <slot name="header"></slot>
    </header>

    <!-- 主内容插槽（默认插槽） -->
    <main>
      <slot></slot>
    </main>

    <!-- 底部插槽 -->
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

**父组件使用（完整语法）：**

```vue
<template>
  <Layout>
    <!-- v-slot:插槽名 -->
    <template v-slot:header>
      <h1>页面标题</h1>
    </template>

    <!-- 默认插槽可以不写 name -->
    <template v-slot:default>
      <p>这是主要内容</p>
    </template>

    <template v-slot:footer>
      <p>版权信息 © 2025</p>
    </template>
  </Layout>
</template>
```

### 缩写语法

`v-slot:` 可以简写为 `#`：

```vue
<template>
  <Layout>
    <!-- 缩写形式 -->
    <template #header>
      <h1>页面标题</h1>
    </template>

    <!-- 默认插槽的缩写 -->
    <template #default>
      <p>主要内容</p>
    </template>

    <template #footer>
      <p>版权信息 © 2025</p>
    </template>
  </Layout>
</template>
```

### 带默认内容的具名插槽

```vue
<!-- Layout.vue -->
<template>
  <div class="layout">
    <header>
      <slot name="header">
        <h1>默认标题</h1>
      </slot>
    </header>

    <main>
      <slot>默认内容</slot>
    </main>

    <footer>
      <slot name="footer">
        <p>默认版权信息</p>
      </slot>
    </footer>
  </div>
</template>
```

### 实际应用场景

**场景一：复杂的卡片组件**

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <div class="card-header">
      <slot name="header"></slot>
    </div>

    <div class="card-body">
      <slot></slot>
    </div>

    <div class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  background: #f5f5f5;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
}

.card-body {
  padding: 16px;
}

.card-footer {
  background: #f5f5f5;
  padding: 12px 16px;
  border-top: 1px solid #ddd;
  text-align: right;
}
</style>
```

**使用卡片组件：**

```vue
<template>
  <Card>
    <template #header>
      <h3>用户信息</h3>
    </template>

    <template #default>
      <p>姓名：张三</p>
      <p>年龄：25</p>
    </template>

    <template #footer>
      <button>编辑</button>
      <button>删除</button>
    </template>
  </Card>
</template>
```

**场景二：表格组件**

```vue
<!-- Table.vue -->
<template>
  <table class="custom-table">
    <thead>
      <slot name="header">
        <tr>
          <th>默认表头</th>
        </tr>
      </slot>
    </thead>

    <tbody>
      <slot name="body"></slot>
    </tbody>

    <tfoot>
      <slot name="footer"></slot>
    </tfoot>
  </table>
</template>
```

## 3. 作用域插槽（Scoped Slots）

作用域插槽是 Vue 插槽机制中最强大的特性，它允许子组件向插槽内容传递数据，使得父组件可以访问子组件的数据。

### 核心概念

**数据流向**：
- 普通插槽：父组件 → 子组件（单向传递模板内容）
- 作用域插槽：子组件 → 父组件（子组件暴露数据给父组件使用）

### 基础语法

**子组件定义（UserList.vue）：**

```vue
<template>
  <div class="user-list">
    <div v-for="user in users" :key="user.id" class="user-item">
      <!-- 通过插槽 prop 向父组件传递数据 -->
      <slot :user="user" :index="users.indexOf(user)"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const users = ref([
  { id: 1, name: '张三', age: 25 },
  { id: 2, name: '李四', age: 30 },
  { id: 3, name: '王五', age: 28 }
]);
</script>
```

**父组件使用：**

```vue
<template>
  <UserList>
    <!-- 接收插槽 prop -->
    <template v-slot:default="slotProps">
      <div>
        <strong>{{ slotProps.user.name }}</strong>
        <span>({{ slotProps.user.age }}岁)</span>
        <span>序号: {{ slotProps.index }}</span>
      </div>
    </template>
  </UserList>
</template>
```

### 解构插槽 Prop

使用 ES6 解构语法可以让代码更简洁：

```vue
<template>
  <UserList>
    <!-- 解构语法 -->
    <template v-slot:default="{ user, index }">
      <div>
        <strong>{{ user.name }}</strong>
        <span>({{ user.age }}岁)</span>
        <span>序号: {{ index }}</span>
      </div>
    </template>
  </UserList>
</template>
```

### 重命名插槽 Prop

```vue
<template>
  <UserList>
    <!-- 重命名 -->
    <template v-slot:default="{ user: person, index: idx }">
      <div>{{ person.name }} - 序号{{ idx }}</div>
    </template>
  </UserList>
</template>
```

### 默认插槽的缩写

当只有默认插槽时，可以省略 `template` 标签：

```vue
<template>
  <!-- 只有默认插槽时的缩写 -->
  <UserList v-slot="{ user, index }">
    <div>{{ user.name }} - {{ index }}</div>
  </UserList>
</template>
```

**⚠️ 注意**：这种缩写只能在只有默认插槽时使用，如果有具名插槽，必须使用完整的 `<template>` 语法。

```vue
<!-- ❌ 错误：混用缩写和具名插槽 -->
<MyComponent v-slot="{ data }">
  <template #header>标题</template>
</MyComponent>

<!-- ✅ 正确：使用完整语法 -->
<MyComponent>
  <template #default="{ data }">
    {{ data }}
  </template>
  <template #header>标题</template>
</MyComponent>
```

### 实际应用场景

**场景一：可定制的列表组件**

```vue
<!-- DataList.vue -->
<template>
  <div class="data-list">
    <div v-if="loading" class="loading">
      <slot name="loading">加载中...</slot>
    </div>

    <div v-else-if="items.length === 0" class="empty">
      <slot name="empty">暂无数据</slot>
    </div>

    <div v-else>
      <div v-for="(item, index) in items" :key="item.id" class="item">
        <!-- 作用域插槽：向父组件传递数据 -->
        <slot
          :item="item"
          :index="index"
          :isFirst="index === 0"
          :isLast="index === items.length - 1"
        ></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});
</script>
```

**使用列表组件：**

```vue
<template>
  <DataList :items="products" :loading="isLoading">
    <!-- 自定义每一项的渲染 -->
    <template #default="{ item, index, isFirst, isLast }">
      <div class="product" :class="{ first: isFirst, last: isLast }">
        <img :src="item.image" :alt="item.name" />
        <h3>{{ index + 1 }}. {{ item.name }}</h3>
        <p class="price">¥{{ item.price }}</p>
        <button @click="addToCart(item)">加入购物车</button>
      </div>
    </template>

    <!-- 自定义加载状态 -->
    <template #loading>
      <div class="spinner">正在加载商品...</div>
    </template>

    <!-- 自定义空状态 -->
    <template #empty>
      <div class="empty-state">
        <p>暂无商品</p>
        <button @click="refresh">刷新</button>
      </div>
    </template>
  </DataList>
</template>
```

**场景二：表格组件与自定义单元格**

```vue
<!-- Table.vue -->
<template>
  <table class="custom-table">
    <thead>
      <tr>
        <th v-for="column in columns" :key="column.key">
          {{ column.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in data" :key="rowIndex">
        <td v-for="column in columns" :key="column.key">
          <!-- 作用域插槽：允许自定义每个单元格 -->
          <slot
            :name="column.key"
            :row="row"
            :column="column"
            :value="row[column.key]"
            :rowIndex="rowIndex"
          >
            <!-- 默认显示值 -->
            {{ row[column.key] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  columns: Array,
  data: Array
});
</script>
```

**使用表格组件：**

```vue
<template>
  <Table :columns="columns" :data="users">
    <!-- 自定义 name 列 -->
    <template #name="{ value, row }">
      <strong style="color: blue;">{{ value }}</strong>
    </template>

    <!-- 自定义 status 列 -->
    <template #status="{ value }">
      <span :class="['status', value]">
        {{ value === 'active' ? '✅ 活跃' : '❌ 禁用' }}
      </span>
    </template>

    <!-- 自定义 actions 列 -->
    <template #actions="{ row, rowIndex }">
      <button @click="edit(row, rowIndex)">编辑</button>
      <button @click="remove(row, rowIndex)">删除</button>
    </template>
  </Table>
</template>

<script setup>
import { ref } from 'vue';

const columns = [
  { key: 'name', label: '姓名' },
  { key: 'age', label: '年龄' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
];

const users = ref([
  { name: '张三', age: 25, status: 'active' },
  { name: '李四', age: 30, status: 'inactive' }
]);
</script>
```

**场景三：下拉菜单组件**

```vue
<!-- Dropdown.vue -->
<template>
  <div class="dropdown" @click="toggleMenu">
    <!-- 触发器插槽 -->
    <div class="dropdown-trigger">
      <slot name="trigger" :isOpen="isOpen">
        <button>{{ isOpen ? '收起' : '展开' }}</button>
      </slot>
    </div>

    <!-- 菜单内容插槽 -->
    <div v-if="isOpen" class="dropdown-menu">
      <slot :close="closeMenu" :isOpen="isOpen"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};
</script>
```

**使用下拉菜单：**

```vue
<template>
  <Dropdown>
    <!-- 自定义触发器 -->
    <template #trigger="{ isOpen }">
      <button class="custom-trigger">
        {{ isOpen ? '▲' : '▼' }} 更多选项
      </button>
    </template>

    <!-- 自定义菜单内容，使用 close 方法 -->
    <template #default="{ close }">
      <ul class="menu-items">
        <li @click="handleAction('edit'); close()">编辑</li>
        <li @click="handleAction('delete'); close()">删除</li>
        <li @click="handleAction('share'); close()">分享</li>
      </ul>
    </template>
  </Dropdown>
</template>
```

## 4. 动态插槽（Dynamic Slot Names）

动态插槽名允许我们在运行时动态决定使用哪个插槽，这在构建高度可配置的组件时非常有用。

### 基础语法

动态插槽名使用方括号 `[]` 包裹动态表达式：

```vue
<template>
  <MyComponent>
    <!-- 动态插槽名 -->
    <template #[slotName]>
      动态内容
    </template>
  </MyComponent>
</template>

<script setup>
import { ref } from 'vue';

const slotName = ref('header');
</script>
```

### 完整示例

**子组件定义（TabPanel.vue）：**

```vue
<template>
  <div class="tab-panel">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div class="tab-content">
      <!-- 动态插槽 -->
      <slot :name="activeTab"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const tabs = ['home', 'profile', 'settings'];
const activeTab = ref('home');
</script>

<style scoped>
.tabs button.active {
  background: #42b983;
  color: white;
}

.tab-content {
  padding: 20px;
  border: 1px solid #ddd;
  margin-top: 10px;
}
</style>
```

**父组件使用：**

```vue
<template>
  <TabPanel>
    <!-- 为每个 tab 定义插槽内容 -->
    <template #home>
      <h2>首页内容</h2>
      <p>欢迎来到首页</p>
    </template>

    <template #profile>
      <h2>个人资料</h2>
      <p>这是您的个人信息</p>
    </template>

    <template #settings>
      <h2>设置</h2>
      <p>配置您的偏好设置</p>
    </template>
  </TabPanel>
</template>
```

### 动态切换插槽

```vue
<template>
  <div>
    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="currentSlot = 'header'">显示头部</button>
      <button @click="currentSlot = 'body'">显示主体</button>
      <button @click="currentSlot = 'footer'">显示底部</button>
    </div>

    <!-- 动态插槽 -->
    <Layout>
      <template #[currentSlot]>
        <div>当前显示：{{ currentSlot }}</div>
      </template>
    </Layout>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const currentSlot = ref('header');
</script>
```

### 实际应用场景

**场景一：动态表单构建器**

```vue
<!-- FormBuilder.vue -->
<template>
  <form class="form-builder">
    <div v-for="field in fields" :key="field.name" class="form-field">
      <label>{{ field.label }}</label>

      <!-- 动态插槽：根据字段名称使用不同插槽 -->
      <slot
        :name="field.name"
        :field="field"
        :value="formData[field.name]"
        :update="(val) => updateField(field.name, val)"
      >
        <!-- 默认输入框 -->
        <input
          :type="field.type || 'text'"
          v-model="formData[field.name]"
          :placeholder="field.placeholder"
        />
      </slot>
    </div>
  </form>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
  fields: Array
});

const formData = reactive({});

const updateField = (name, value) => {
  formData[name] = value;
};
</script>
```

**使用表单构建器：**

```vue
<template>
  <FormBuilder :fields="formFields">
    <!-- 自定义 email 字段 -->
    <template #email="{ value, update }">
      <input
        type="email"
        :value="value"
        @input="update($event.target.value)"
        placeholder="请输入邮箱"
        class="custom-email-input"
      />
      <small>我们不会分享您的邮箱</small>
    </template>

    <!-- 自定义 gender 字段 -->
    <template #gender="{ value, update }">
      <select :value="value" @change="update($event.target.value)">
        <option value="">请选择</option>
        <option value="male">男</option>
        <option value="female">女</option>
        <option value="other">其他</option>
      </select>
    </template>

    <!-- 自定义 bio 字段 -->
    <template #bio="{ value, update }">
      <textarea
        :value="value"
        @input="update($event.target.value)"
        rows="4"
        placeholder="介绍一下自己..."
      ></textarea>
    </template>
  </FormBuilder>
</template>

<script setup>
const formFields = [
  { name: 'username', label: '用户名', type: 'text' },
  { name: 'email', label: '邮箱', type: 'email' },
  { name: 'gender', label: '性别' },
  { name: 'bio', label: '个人简介' }
];
</script>
```

**场景二：动态布局系统**

```vue
<!-- DynamicLayout.vue -->
<template>
  <div class="dynamic-layout">
    <div
      v-for="section in layout"
      :key="section.name"
      :class="['section', section.class]"
    >
      <!-- 动态插槽名 -->
      <slot
        :name="section.name"
        :section="section"
      >
        <div class="placeholder">
          {{ section.name }} 区域（暂无内容）
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  layout: {
    type: Array,
    default: () => [
      { name: 'header', class: 'layout-header' },
      { name: 'sidebar', class: 'layout-sidebar' },
      { name: 'main', class: 'layout-main' },
      { name: 'footer', class: 'layout-footer' }
    ]
  }
});
</script>
```

**使用动态布局：**

```vue
<template>
  <DynamicLayout :layout="customLayout">
    <!-- 根据布局配置动态填充内容 -->
    <template #header>
      <nav>导航栏</nav>
    </template>

    <template #sidebar>
      <aside>侧边栏</aside>
    </template>

    <template #main>
      <article>主要内容</article>
    </template>

    <template #footer>
      <footer>页脚信息</footer>
    </template>
  </DynamicLayout>
</template>

<script setup>
import { ref } from 'vue';

const customLayout = ref([
  { name: 'header', class: 'custom-header' },
  { name: 'main', class: 'custom-main' },
  { name: 'sidebar', class: 'custom-sidebar' },
  { name: 'footer', class: 'custom-footer' }
]);
</script>
```

**场景三：条件渲染插槽**

```vue
<template>
  <div>
    <!-- 根据用户权限动态切换插槽 -->
    <Dashboard>
      <template #[userRole]="{ data }">
        <div>{{ userRole }} 专属内容：{{ data }}</div>
      </template>
    </Dashboard>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const user = ref({ role: 'admin' });

// 动态计算插槽名
const userRole = computed(() => user.value.role);
</script>
```

## 插槽的高级技巧

### 1. 插槽的条件渲染

```vue
<template>
  <div class="container">
    <!-- 仅在有内容时渲染包装器 -->
    <div v-if="$slots.header" class="header-wrapper">
      <slot name="header"></slot>
    </div>

    <div class="main">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="footer-wrapper">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
```

### 2. 检查插槽是否有内容

在 `<script setup>` 中使用 `useSlots()`：

```vue
<script setup>
import { useSlots, computed } from 'vue';

const slots = useSlots();

// 检查插槽是否有内容
const hasHeader = computed(() => !!slots.header);
const hasFooter = computed(() => !!slots.footer);
const hasDefaultSlot = computed(() => !!slots.default);
</script>

<template>
  <div>
    <div v-if="hasHeader" class="header">
      <slot name="header"></slot>
    </div>

    <div class="main">
      <slot v-if="hasDefaultSlot"></slot>
      <p v-else>暂无内容</p>
    </div>

    <div v-if="hasFooter" class="footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
```

### 3. 插槽与 v-for 结合

```vue
<!-- ListGroup.vue -->
<template>
  <div class="list-group">
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="list-item"
    >
      <slot
        :item="item"
        :index="index"
        :remove="() => removeItem(index)"
      ></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['items']);

const removeItem = (index) => {
  props.items.splice(index, 1);
};
</script>
```

### 4. 多层插槽传递

当需要在嵌套组件间传递插槽时：

```vue
<!-- Wrapper.vue -->
<template>
  <div class="wrapper">
    <Inner>
      <!-- 将插槽向下传递 -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData"></slot>
      </template>
    </Inner>
  </div>
</template>
```

## 最佳实践

### 1. 命名规范

```vue
<!-- ✅ 推荐：使用 kebab-case -->
<template #user-info="{ user }">
  {{ user.name }}
</template>

<!-- ❌ 不推荐：使用 camelCase -->
<template #userInfo="{ user }">
  {{ user.name }}
</template>
```

### 2. 提供默认内容

始终为插槽提供合理的默认内容，提升组件的健壮性：

```vue
<template>
  <div class="card">
    <div class="card-header">
      <slot name="header">
        <h3>默认标题</h3>
      </slot>
    </div>

    <div class="card-body">
      <slot>暂无内容</slot>
    </div>
  </div>
</template>
```

### 3. 作用域插槽的数据命名

使用清晰、语义化的命名：

```vue
<!-- ✅ 推荐：清晰的命名 -->
<slot
  :user="currentUser"
  :isActive="userIsActive"
  :updateUser="handleUpdate"
></slot>

<!-- ❌ 不推荐：模糊的命名 -->
<slot
  :data="currentUser"
  :flag="userIsActive"
  :fn="handleUpdate"
></slot>
```

### 4. 避免过度使用插槽

不是所有的组件都需要插槽。如果组件的结构是固定的，使用 props 传递数据即可：

```vue
<!-- ❌ 不必要的插槽 -->
<Button>
  <slot>{{ text }}</slot>
</Button>

<!-- ✅ 直接使用 prop -->
<Button :text="buttonText" />
```

### 5. 文档化插槽 API

在组件中明确说明插槽的用途和可用的 prop：

```vue
<!--
Card 组件

插槽：
- header: 卡片头部内容
- default: 卡片主体内容
- footer: 卡片底部内容
  Props: { actions: Array, onAction: Function }
-->
<template>
  <div class="card">
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer" :actions="actions" :onAction="handleAction"></slot>
  </div>
</template>
```

## 性能优化

### 1. 避免在插槽中进行重复计算

```vue
<!-- ❌ 不推荐：每次渲染都会重新计算 -->
<template>
  <List>
    <template #item="{ item }">
      <div>{{ expensiveComputation(item) }}</div>
    </template>
  </List>
</template>

<!-- ✅ 推荐：使用计算属性 -->
<template>
  <List>
    <template #item="{ item }">
      <div>{{ computedItems[item.id] }}</div>
    </template>
  </List>
</template>

<script setup>
import { computed } from 'vue';

const computedItems = computed(() => {
  // 预先计算所有项
  return items.value.reduce((acc, item) => {
    acc[item.id] = expensiveComputation(item);
    return acc;
  }, {});
});
</script>
```

### 2. 使用 v-once 优化静态插槽内容

```vue
<template>
  <Card>
    <template #header>
      <!-- 静态内容只渲染一次 -->
      <h1 v-once>这是永远不变的标题</h1>
    </template>
  </Card>
</template>
```

## 常见问题

### Q1: 插槽内容的作用域是什么？

**A**: 插槽内容的作用域是父组件，不是子组件。

```vue
<!-- 父组件 -->
<template>
  <Child>
    <!-- 这里访问的是父组件的 parentData，不是 Child 组件的数据 -->
    <div>{{ parentData }}</div>
  </Child>
</template>
```

如果需要访问子组件的数据，必须使用作用域插槽：

```vue
<!-- 子组件 -->
<template>
  <slot :childData="childData"></slot>
</template>

<!-- 父组件 -->
<template>
  <Child v-slot="{ childData }">
    <div>{{ childData }}</div>
  </Child>
</template>
```

### Q2: 默认插槽和具名插槽可以同时使用吗？

**A**: 可以。一个组件可以同时拥有默认插槽和多个具名插槽：

```vue
<template>
  <Layout>
    <!-- 默认插槽 -->
    <p>这是主要内容</p>

    <!-- 具名插槽 -->
    <template #header>
      <h1>标题</h1>
    </template>
  </Layout>
</template>
```

### Q3: 如何在插槽中使用 v-if？

**A**: 直接在插槽内容上使用 v-if：

```vue
<template>
  <Card>
    <template #header>
      <h1 v-if="showTitle">标题</h1>
    </template>
  </Card>
</template>
```

### Q4: 插槽可以传递事件吗？

**A**: 可以通过作用域插槽传递方法：

```vue
<!-- 子组件 -->
<template>
  <slot :onClick="handleClick"></slot>
</template>

<script setup>
const handleClick = () => {
  console.log('子组件的方法被调用');
};
</script>

<!-- 父组件 -->
<template>
  <Child v-slot="{ onClick }">
    <button @click="onClick">点击我</button>
  </Child>
</template>
```

### Q5: 如何在 TypeScript 中为插槽定义类型？

**A**: 使用 `Slots` 类型：

```typescript
<script setup lang="ts">
import { useSlots } from 'vue';

interface SlotProps {
  user: {
    name: string;
    age: number;
  };
  index: number;
}

const slots = useSlots();

// 检查插槽
if (slots.default) {
  // 使用插槽
}
</script>
```

## 总结

插槽是 Vue 组件化开发中的核心特性，理解并熟练运用插槽能够帮助你构建更加灵活和可复用的组件：

1. **匿名插槽**：最基础的内容分发机制，适用于单一内容区域
2. **具名插槽**：允许多个插槽位置，实现更精细的布局控制
3. **作用域插槽**：让父组件可以访问子组件数据，实现高度可定制的组件
4. **动态插槽**：运行时动态决定插槽名称，构建灵活的动态系统

**选择建议**：
- 简单的内容传递 → 使用匿名插槽
- 多个内容区域 → 使用具名插槽
- 需要访问子组件数据 → 使用作用域插槽
- 运行时决定插槽 → 使用动态插槽

## 参考资源

- [Vue 官方文档 - 插槽](https://cn.vuejs.org/guide/components/slots.html)
- [Vue 3 Composition API - useSlots](https://cn.vuejs.org/api/sfc-script-setup.html#useslots-useattrs)
- [Vue 插槽深入理解](https://v3.cn.vuejs.org/guide/component-slots.html)
