---
title: Vue Teleport 传送门完全指南
date: 2026-01-19 10:40:00
tags:
  - Vue
  - Vue 3
  - Teleport
  - 组件
categories:
  - Vue
---

# Vue Teleport 传送门完全指南

Teleport（传送门）是 Vue 3 新增的内置组件，它可以将组件的模板内容渲染到 DOM 树中的任意位置，而不受组件层级结构的限制。

## 什么是 Teleport？

简而言之，Teleport 就是**将一段代码传送到特定的 DOM 位置**，比如将模态框传送到 `body` 元素的末尾，而不是嵌套在当前组件的 DOM 结构中。

### 为什么需要 Teleport？

在 Vue 2 中，我们经常遇到这样的问题：

```vue
<!-- 组件嵌套很深 -->
<div class="app">
  <div class="container">
    <div class="content">
      <div class="modal">
        <!-- 模态框被嵌套在深层 DOM 中 -->
        <!-- 可能会受到父元素 CSS 的影响（z-index、overflow 等） -->
      </div>
    </div>
  </div>
</div>
```

**问题：**
- ❌ 模态框可能被父元素的 `overflow: hidden` 裁剪
- ❌ `z-index` 层叠上下文问题
- ❌ `position: fixed` 相对于最近的定位父元素
- ❌ 难以管理全局弹出层

**Teleport 解决方案：**

```vue
<template>
  <div class="content">
    <button @click="showModal = true">打开模态框</button>

    <!-- 将模态框传送到 body 末尾 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal">
        <p>我在 body 的末尾！</p>
        <button @click="showModal = false">关闭</button>
      </div>
    </Teleport>
  </div>
</template>
```

## 版本要求

- **Vue 3.0+**: Teleport 是 Vue 3 的新特性
- **Vue 2.x**: 不支持，需要使用第三方库（如 `portal-vue`）

## 基本语法

### 核心属性：to

`to` 属性指定将内容传送到的目标位置，支持多种选择器：

```vue
<!-- 1. 传送到标签选择器 -->
<Teleport to="body">
  <!-- 传送到 <body> 标签 -->
</Teleport>

<!-- 2. 传送到 ID 选择器 -->
<Teleport to="#modal-container">
  <!-- 传送到 <div id="modal-container"></div> -->
</Teleport>

<!-- 3. 传送到 Class 选择器 -->
<Teleport to=".modal-wrapper">
  <!-- 传送到 <div class="modal-wrapper"></div> -->
</Teleport>

<!-- 4. 传送到属性选择器 -->
<Teleport to="[data-teleport-target]">
  <!-- 传送到 <div data-teleport-target></div> -->
</Teleport>
```

### disabled 属性

动态启用或禁用传送功能：

```vue
<template>
  <Teleport to="body" :disabled="isMobile">
    <div class="modal">
      <!--
        - 桌面端：传送到 body
        - 移动端：保持在原位
      -->
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const isMobile = ref(window.innerWidth < 768);
</script>
```

## 完整示例

### 1. 模态框组件

这是 Teleport 最常见的应用场景。

```vue
<!-- Modal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button class="close-btn" @click="handleClose">×</button>
          </div>

          <div class="modal-body">
            <slot></slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <button @click="handleClose">关闭</button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '提示',
  },
});

const emit = defineEmits(['update:visible']);

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  min-width: 400px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
```

**使用模态框：**

```vue
<template>
  <div class="app">
    <button @click="showModal = true">打开模态框</button>

    <Modal v-model:visible="showModal" title="用户信息">
      <p>这是模态框的内容</p>
      <p>它被传送到了 body 标签下</p>

      <template #footer>
        <button @click="handleConfirm">确认</button>
        <button @click="showModal = false">取消</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Modal from './Modal.vue';

const showModal = ref(false);

const handleConfirm = () => {
  console.log('确认操作');
  showModal.value = false;
};
</script>
```

### 2. 全局通知组件

```vue
<!-- Notification.vue -->
<template>
  <Teleport to="body">
    <TransitionGroup name="notification" tag="div" class="notification-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="`notification--${notification.type}`"
      >
        <div class="notification-content">
          <span class="notification-icon">{{ getIcon(notification.type) }}</span>
          <span class="notification-message">{{ notification.message }}</span>
        </div>
        <button class="notification-close" @click="remove(notification.id)">
          ×
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const notifications = ref([]);

const getIcon = (type) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };
  return icons[type] || 'ℹ';
};

const add = (message, type = 'info', duration = 3000) => {
  const id = Date.now();
  notifications.value.push({ id, message, type });

  if (duration > 0) {
    setTimeout(() => remove(id), duration);
  }
};

const remove = (id) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index > -1) {
    notifications.value.splice(index, 1);
  }
};

// 暴露方法供外部调用
defineExpose({ add, remove });
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 4px;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
}

.notification--success {
  border-left: 4px solid #67c23a;
}

.notification--error {
  border-left: 4px solid #f56c6c;
}

.notification--warning {
  border-left: 4px solid #e6a23c;
}

.notification--info {
  border-left: 4px solid #409eff;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-close {
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
  color: #909399;
}

/* 过渡动画 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
```

**使用通知组件：**

```vue
<template>
  <div>
    <button @click="showSuccess">成功通知</button>
    <button @click="showError">错误通知</button>

    <Notification ref="notificationRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Notification from './Notification.vue';

const notificationRef = ref(null);

const showSuccess = () => {
  notificationRef.value.add('操作成功！', 'success');
};

const showError = () => {
  notificationRef.value.add('操作失败！', 'error');
};
</script>
```

### 3. 工具提示（Tooltip）

```vue
<!-- Tooltip.vue -->
<template>
  <div
    class="tooltip-trigger"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    ref="triggerRef"
  >
    <slot></slot>
  </div>

  <Teleport to="body">
    <Transition name="tooltip">
      <div
        v-if="visible"
        class="tooltip"
        :style="tooltipStyle"
        ref="tooltipRef"
      >
        {{ content }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  placement: {
    type: String,
    default: 'top', // top, bottom, left, right
  },
});

const visible = ref(false);
const triggerRef = ref(null);
const tooltipRef = ref(null);
const position = ref({ top: 0, left: 0 });

const tooltipStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
}));

const calculatePosition = () => {
  if (!triggerRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const gap = 10;

  switch (props.placement) {
    case 'top':
      position.value = {
        top: triggerRect.top - gap,
        left: triggerRect.left + triggerRect.width / 2,
      };
      break;
    case 'bottom':
      position.value = {
        top: triggerRect.bottom + gap,
        left: triggerRect.left + triggerRect.width / 2,
      };
      break;
    case 'left':
      position.value = {
        top: triggerRect.top + triggerRect.height / 2,
        left: triggerRect.left - gap,
      };
      break;
    case 'right':
      position.value = {
        top: triggerRect.top + triggerRect.height / 2,
        left: triggerRect.right + gap,
      };
      break;
  }
};

const showTooltip = () => {
  calculatePosition();
  visible.value = true;
};

const hideTooltip = () => {
  visible.value = false;
};
</script>

<style scoped>
.tooltip-trigger {
  display: inline-block;
}

.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  white-space: nowrap;
  z-index: 9999;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>
```

**使用 Tooltip：**

```vue
<template>
  <div>
    <Tooltip content="这是一个提示">
      <button>悬停查看提示</button>
    </Tooltip>
  </div>
</template>

<script setup>
import Tooltip from './Tooltip.vue';
</script>
```

## 应用场景

### 1. 模态框 / 对话框

**场景**：需要在页面最上层显示，不受父元素样式影响。

```vue
<Teleport to="body">
  <div class="modal">模态框内容</div>
</Teleport>
```

**优势**：
- ✅ 避免 z-index 层叠问题
- ✅ 不受父元素 overflow 影响
- ✅ position: fixed 相对于视口定位

### 2. 全局通知 / Toast

**场景**：全局消息提示，需要固定在屏幕特定位置。

```vue
<Teleport to="body">
  <div class="notification-container">
    <!-- 通知列表 -->
  </div>
</Teleport>
```

### 3. 下拉菜单 / Dropdown

**场景**：避免被父容器裁剪。

```vue
<Teleport to="body">
  <div class="dropdown-menu" :style="menuPosition">
    <!-- 菜单项 -->
  </div>
</Teleport>
```

### 4. 右键菜单 / Context Menu

**场景**：跟随鼠标位置显示。

```vue
<Teleport to="body">
  <div class="context-menu" :style="{ top: y + 'px', left: x + 'px' }">
    <!-- 菜单项 -->
  </div>
</Teleport>
```

### 5. 全屏模式

**场景**：需要覆盖整个视口。

```vue
<Teleport to="body">
  <div class="fullscreen-container">
    <!-- 全屏内容 -->
  </div>
</Teleport>
```

### 6. 抽屉组件 / Drawer

**场景**：从屏幕边缘滑出的面板。

```vue
<Teleport to="body">
  <div class="drawer" :class="{ 'drawer--open': isOpen }">
    <!-- 抽屉内容 -->
  </div>
</Teleport>
```

## 多个目标容器

可以准备多个不同的目标容器，用于不同类型的组件：

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Vue App</title>
</head>
<body>
  <div id="app"></div>

  <!-- Teleport 目标容器 -->
  <div id="modal-container"></div>
  <div id="notification-container"></div>
  <div id="tooltip-container"></div>
</body>
</html>
```

```vue
<!-- 使用不同的目标容器 -->
<Teleport to="#modal-container">
  <Modal />
</Teleport>

<Teleport to="#notification-container">
  <Notification />
</Teleport>

<Teleport to="#tooltip-container">
  <Tooltip />
</Teleport>
```

## 多个 Teleport 到同一目标

多个 Teleport 可以将内容挂载到同一个目标元素，按照顺序追加：

```vue
<!-- ComponentA.vue -->
<Teleport to="#modals">
  <div>Modal A</div>
</Teleport>

<!-- ComponentB.vue -->
<Teleport to="#modals">
  <div>Modal B</div>
</Teleport>

<!-- 渲染结果 -->
<div id="modals">
  <div>Modal A</div>
  <div>Modal B</div>
</div>
```

## 注意事项

### 1. 目标元素必须存在 ⚠️

```vue
<!-- ❌ 错误：目标元素不存在 -->
<Teleport to="#non-existent">
  <div>内容</div>
</Teleport>
```

**解决方案：**

```vue
<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // 确保在组件挂载后，目标元素已经存在
  const target = document.querySelector('#modal-container');
  if (!target) {
    console.error('Teleport target not found');
  }
});
</script>

<template>
  <Teleport to="#modal-container">
    <div>内容</div>
  </Teleport>
</template>
```

### 2. SSR（服务端渲染）支持

在 SSR 环境中，Teleport 会被禁用（因为服务端没有真实 DOM）：

```vue
<Teleport to="body" :disabled="isSSR">
  <div>内容</div>
</Teleport>

<script setup>
const isSSR = typeof window === 'undefined';
</script>
```

### 3. 组件状态保持

Teleport 只是移动 DOM 位置，组件的逻辑关系和状态不变：

```vue
<template>
  <div>
    <p>父组件计数: {{ count }}</p>

    <Teleport to="body">
      <!-- 子组件仍然可以访问父组件的数据 -->
      <ChildComponent :count="count" @update="count++" />
    </Teleport>
  </div>
</template>
```

### 4. 样式作用域

使用 `scoped` 样式时，Teleport 内容仍然会应用这些样式：

```vue
<template>
  <Teleport to="body">
    <div class="modal">
      <!-- 仍然会应用 scoped 样式 -->
    </div>
  </Teleport>
</template>

<style scoped>
.modal {
  /* 这些样式会被应用 */
}
</style>
```

### 5. 性能考虑

避免频繁切换 Teleport 的 `disabled` 状态，因为这会导致 DOM 移动：

```vue
<!-- ❌ 不推荐：频繁切换 -->
<Teleport to="body" :disabled="someCondition">
  <ExpensiveComponent />
</Teleport>

<!-- ✅ 推荐：使用 v-if 控制渲染 -->
<Teleport to="body">
  <ExpensiveComponent v-if="shouldRender" />
</Teleport>
```

## 与 Vue 2 的对比

### Vue 2 解决方案

在 Vue 2 中，需要使用第三方库 `portal-vue`：

```bash
npm install portal-vue
```

```vue
<!-- Vue 2 -->
<template>
  <div>
    <portal to="destination">
      <p>这段内容会被传送</p>
    </portal>

    <portal-target name="destination"></portal-target>
  </div>
</template>

<script>
import { Portal, PortalTarget } from 'portal-vue';

export default {
  components: {
    Portal,
    PortalTarget,
  },
};
</script>
```

### Vue 3 Teleport

```vue
<!-- Vue 3 -->
<template>
  <div>
    <Teleport to="#destination">
      <p>这段内容会被传送</p>
    </Teleport>

    <div id="destination"></div>
  </div>
</template>

<!-- 无需导入，Teleport 是内置组件 -->
```

**优势：**
- ✅ 内置支持，无需安装第三方库
- ✅ 性能更好
- ✅ API 更简洁

## 实战：构建完整的模态框管理器

```javascript
// composables/useModal.js
import { ref, shallowRef } from 'vue';

const modals = ref([]);
let id = 0;

export function useModal() {
  const open = (component, props = {}) => {
    const modalId = id++;

    const close = () => {
      const index = modals.value.findIndex(m => m.id === modalId);
      if (index > -1) {
        modals.value.splice(index, 1);
      }
    };

    modals.value.push({
      id: modalId,
      component: shallowRef(component),
      props: {
        ...props,
        onClose: close,
      },
    });

    return { close };
  };

  return {
    modals,
    open,
  };
}
```

```vue
<!-- ModalContainer.vue -->
<template>
  <Teleport to="body">
    <TransitionGroup name="modal-list">
      <component
        v-for="modal in modals"
        :key="modal.id"
        :is="modal.component"
        v-bind="modal.props"
      />
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { useModal } from '@/composables/useModal';

const { modals } = useModal();
</script>

<style>
.modal-list-enter-active,
.modal-list-leave-active {
  transition: opacity 0.3s;
}

.modal-list-enter-from,
.modal-list-leave-to {
  opacity: 0;
}
</style>
```

```vue
<!-- App.vue -->
<template>
  <div>
    <button @click="openUserModal">打开用户模态框</button>
    <button @click="openConfirmModal">打开确认框</button>

    <ModalContainer />
  </div>
</template>

<script setup>
import { useModal } from '@/composables/useModal';
import ModalContainer from '@/components/ModalContainer.vue';
import UserModal from '@/components/UserModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

const { open } = useModal();

const openUserModal = () => {
  open(UserModal, {
    userId: 123,
    title: '用户信息',
  });
};

const openConfirmModal = () => {
  open(ConfirmModal, {
    message: '确定要删除吗？',
    onConfirm: () => {
      console.log('已确认');
    },
  });
};
</script>
```

## 最佳实践

### 1. 统一目标容器

```javascript
// constants.js
export const TELEPORT_TARGETS = {
  MODAL: '#modal-container',
  NOTIFICATION: '#notification-container',
  TOOLTIP: '#tooltip-container',
};
```

```vue
<Teleport :to="TELEPORT_TARGETS.MODAL">
  <Modal />
</Teleport>
```

### 2. 封装通用组件

```vue
<!-- TeleportWrapper.vue -->
<template>
  <Teleport :to="to" :disabled="disabled">
    <slot></slot>
  </Teleport>
</template>

<script setup>
defineProps({
  to: {
    type: String,
    default: 'body',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>
```

### 3. 提供降级方案

```vue
<template>
  <Teleport :to="to" :disabled="!isTeleportSupported">
    <slot></slot>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  to: String,
});

const isTeleportSupported = ref(false);

onMounted(() => {
  const target = document.querySelector(props.to);
  isTeleportSupported.value = !!target;
});
</script>
```

### 4. 清理副作用

```vue
<script setup>
import { onBeforeUnmount } from 'vue';

onBeforeUnmount(() => {
  // 清理可能残留的 DOM 元素
  // 移除事件监听器
});
</script>
```

## 常见问题

### Q1: Teleport 会影响组件通信吗？

**答案**：不会。Teleport 只改变 DOM 位置，组件的父子关系、props、emits、provide/inject 都正常工作。

### Q2: 可以 Teleport 到同级元素吗？

**答案**：可以，只要目标元素在 DOM 中存在即可。

```vue
<div id="app">
  <div id="source">
    <Teleport to="#target">
      <div>传送的内容</div>
    </Teleport>
  </div>

  <div id="target"></div>
</div>
```

### Q3: 如何在 TypeScript 中使用 Teleport？

**答案**：

```vue
<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  visible: { type: Boolean, required: true }
});
</script>

<template>
  <Teleport to="body">
    <div v-if="visible">{{ title }}</div>
  </Teleport>
</template>
```

### Q4: Teleport 内容的样式优先级？

**答案**：Teleport 内容的样式优先级与普通元素相同，遵循 CSS 的优先级规则。建议使用更高的 z-index 确保显示在最上层。

## 浏览器兼容性

Teleport 依赖于现代浏览器的 DOM API：

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14.1+
- ✅ Edge 90+

对于旧浏览器，Vue 3 会自动降级处理。

## 参考资源

### 官方文档
- [Vue 3 官方文档 - Teleport](https://cn.vuejs.org/guide/built-ins/teleport.html)
- [Vue 3 API 参考 - Teleport](https://cn.vuejs.org/api/built-in-components.html#teleport)
- [Vue 3 RFC - Teleport](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0025-teleport.md)

### 相关库
- [portal-vue](https://github.com/LinusBorg/portal-vue) - Vue 2 的传送门解决方案
- [Vue 3 迁移指南 - Teleport](https://v3-migration.vuejs.org/breaking-changes/teleport.html)

### 示例项目
- [Vue 3 Examples - Teleport](https://github.com/vuejs/vue-next/tree/master/packages/vue/examples/teleport)
- [Element Plus - Modal 组件源码](https://github.com/element-plus/element-plus/blob/dev/packages/components/dialog/src/dialog.vue)
- [Ant Design Vue - Modal 组件源码](https://github.com/vueComponent/ant-design-vue/blob/next/components/modal/Modal.tsx)

### 相关文章
- [Vue 3 深入浅出 - Teleport 原理](https://juejin.cn/post/6900957010808963079)
- [构建可复用的 Vue 3 模态框](https://dev.to/posva/building-reusable-modals-with-vue-3-teleport-4j4j)
- [Vue 3 Composition API 最佳实践](https://blog.logrocket.com/definitive-guide-vue-3-components/)

### 工具和插件
- [Vite Plugin Vue DevTools](https://github.com/webfansplz/vite-plugin-vue-devtools) - 可视化调试 Teleport
- [Vue Devtools](https://devtools.vuejs.org/) - 官方开发者工具

### 视频教程
- [Vue Mastery - Teleport](https://www.vuemastery.com/courses/vue-3-essentials/teleport)
- [Vue School - Teleport Component](https://vueschool.io/lessons/vue-3-teleport-component)

## 总结

Teleport 是 Vue 3 中一个强大而优雅的功能，它解决了长期以来的 DOM 层级和样式问题。通过将组件内容传送到 DOM 的任意位置，我们可以轻松实现模态框、通知、工具提示等常见 UI 组件，而不必担心 z-index、overflow 等 CSS 问题。

**核心要点：**
- ✅ 使用 `to` 属性指定目标位置（支持 ID、Class、标签选择器）
- ✅ 目标 DOM 元素必须在使用前存在
- ✅ 不影响组件逻辑关系和状态管理
- ✅ 适用于模态框、通知、下拉菜单等场景
- ✅ Vue 3 独有功能，Vue 2 需使用 portal-vue
