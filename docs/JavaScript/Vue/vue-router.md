---
title: Vue Router 完全指南
date: 2026-01-19 11:26:15
tags:
  - Vue
  - Vue Router
  - Routing
  - Navigation
categories:
  - JavaScript
  - Vue
---

# Vue Router 完全指南

## 概述

Vue Router 是 Vue.js 的官方路由管理器，用于构建单页面应用（SPA）。它与 Vue.js 核心深度集成，让构建 SPA 变得轻而易举。

**核心功能**：
- 嵌套路由映射
- 动态路由
- 模块化、基于组件的路由配置
- 路由参数、查询、通配符
- 细粒度的导航控制
- 自动激活的 CSS 类名
- HTML5 history 模式或 hash 模式

## 一、基本使用

### 1.1 安装

```bash
npm install vue-router@4
```

### 1.2 基础配置

#### 创建路由配置文件

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import News from '@/pages/News.vue';
import About from '@/pages/About.vue';

const router = createRouter({
  // 历史模式
  history: createWebHistory(),

  // 路由规则
  routes: [
    {
      path: '/home',
      component: Home
    },
    {
      path: '/news',
      component: News
    },
    {
      path: '/about',
      component: About
    }
  ]
});

export default router;
```

#### 注册路由

```javascript
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router);
app.mount('#app');
```

#### 使用路由

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <h2 class="title">Vue 路由测试</h2>

    <!-- 导航区 -->
    <div class="navigate">
      <RouterLink to="/home" active-class="active">首页</RouterLink>
      <RouterLink to="/news" active-class="active">新闻</RouterLink>
      <RouterLink to="/about" active-class="active">关于</RouterLink>
    </div>

    <!-- 展示区 -->
    <div class="main-content">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<style scoped>
.navigate a {
  padding: 10px 20px;
  text-decoration: none;
  color: #333;
}

.navigate a.active {
  color: #42b983;
  font-weight: bold;
  border-bottom: 2px solid #42b983;
}
</style>
```

### 1.3 注意事项

**⚠️ 路由组件 vs 一般组件**

- **路由组件**：通常存放在 `pages` 或 `views` 文件夹
- **一般组件**：通常存放在 `components` 文件夹

```
src/
├── components/        ← 一般组件（复用组件）
│   ├── Header.vue
│   └── Footer.vue
├── pages/            ← 路由组件（页面级组件）
│   ├── Home.vue
│   ├── News.vue
│   └── About.vue
```

**⚠️ 路由组件的切换**

通过点击导航，视觉效果上"消失"的路由组件，**默认是被卸载掉的**，需要的时候再去挂载。

```javascript
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  console.log('组件挂载');
});

onUnmounted(() => {
  console.log('组件卸载'); // 切换路由时会触发
});
```

## 二、路由模式

### 2.1 History 模式

**优点**：
- URL 更加美观，不带有 `#`
- 更接近传统的网站 URL
- 对 SEO 更友好

**缺点**：
- 后期项目上线，需要服务端配合处理路径问题
- 刷新页面会有 404 错误（如果服务端未正确配置）

```javascript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [...]
});

// URL 示例：https://example.com/home
```

**服务端配置（Nginx）**：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 2.2 Hash 模式

**优点**：
- 兼容性更好，因为不需要服务器端处理路径
- 无需服务端配置
- 刷新不会有 404 错误

**缺点**：
- URL 带有 `#` 不太美观
- SEO 优化方面相对较差

```javascript
import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...]
});

// URL 示例：https://example.com/#/home
```

## 三、路由跳转

### 3.1 声明式导航

使用 `<RouterLink>` 组件进行导航。

#### to 的字符串写法

```vue
<template>
  <!-- 字符串写法 -->
  <RouterLink to="/home" active-class="active">首页</RouterLink>
  <RouterLink to="/news" active-class="active">新闻</RouterLink>
  <RouterLink to="/about" active-class="active">关于</RouterLink>
</template>
```

#### to 的对象写法

```vue
<template>
  <!-- 对象写法：使用 path -->
  <RouterLink :to="{ path: '/home' }" active-class="active">
    首页
  </RouterLink>

  <!-- 对象写法：使用 name -->
  <RouterLink :to="{ name: 'home' }" active-class="active">
    首页
  </RouterLink>
</template>
```

### 3.2 编程式导航

使用 `useRouter` 进行编程式导航。

```vue
<template>
  <button @click="goHome">回到首页</button>
  <button @click="goNews">查看新闻</button>
  <button @click="goBack">后退</button>
  <button @click="goForward">前进</button>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// push 导航（可以后退）
const goHome = () => {
  router.push('/home');

  // 或者
  router.push({ path: '/home' });
  router.push({ name: 'home' });
};

// replace 导航（不可以后退）
const goNews = () => {
  router.replace('/news');

  // 或者
  router.replace({ path: '/news' });
};

// 后退
const goBack = () => {
  router.back();
  // 或者
  router.go(-1);
};

// 前进
const goForward = () => {
  router.forward();
  // 或者
  router.go(1);
};

// 跳转 n 步
const goSteps = (n) => {
  router.go(n);
};
</script>
```

### 3.3 路由组件的重要属性

在路由组件中，可以通过 `useRoute` 和 `useRouter` 访问路由信息和方法。

```javascript
import { useRoute, useRouter } from 'vue-router';

// $route：当前路由信息
const route = useRoute();
console.log(route.path);       // '/news'
console.log(route.params);     // { id: '1' }
console.log(route.query);      // { page: '2' }
console.log(route.name);       // 'news'

// $router：路由器实例
const router = useRouter();
console.log(router.push);      // 导航方法
console.log(router.replace);   // 导航方法
```

## 四、命名路由

### 4.1 作用

可以简化路由跳转及传参，使代码更清晰。

### 4.2 配置

```javascript
// router/index.js
const routes = [
  {
    name: 'zhuye',      // 命名路由
    path: '/home',
    component: Home
  },
  {
    name: 'xinwen',
    path: '/news',
    component: News
  },
  {
    name: 'guanyu',
    path: '/about',
    component: About
  }
];
```

### 4.3 使用

```vue
<template>
  <!-- 简化前：需要写完整的路径 -->
  <RouterLink to="/news/detail">跳转</RouterLink>

  <!-- 简化后：直接通过名字跳转 -->
  <RouterLink :to="{ name: 'guanyu' }">跳转</RouterLink>

  <!-- 带参数 -->
  <RouterLink
    :to="{
      name: 'xinwen',
      params: { id: 1 },
      query: { page: 2 }
    }"
  >
    跳转
  </RouterLink>
</template>
```

## 五、嵌套路由

### 5.1 配置子路由

```javascript
// router/index.js
import Detail from '@/pages/Detail.vue';

const routes = [
  {
    name: 'zhuye',
    path: '/home',
    component: Home
  },
  {
    name: 'xinwen',
    path: '/news',
    component: News,
    children: [                    // 子路由
      {
        name: 'xiang',
        path: 'detail',            // ⚠️ 注意：不要加 /
        component: Detail
      }
    ]
  }
];
```

### 5.2 跳转子路由

```vue
<template>
  <!-- 方式1：完整路径 -->
  <RouterLink to="/news/detail">详情</RouterLink>

  <!-- 方式2：对象写法 -->
  <RouterLink :to="{ path: '/news/detail' }">详情</RouterLink>

  <!-- 方式3：命名路由 -->
  <RouterLink :to="{ name: 'xiang' }">详情</RouterLink>
</template>
```

### 5.3 在父组件中显示子路由

```vue
<!-- News.vue -->
<template>
  <div class="news">
    <nav class="news-list">
      <RouterLink
        v-for="news in newsList"
        :key="news.id"
        :to="{ path: '/news/detail' }"
      >
        {{ news.name }}
      </RouterLink>
    </nav>

    <!-- ⚠️ 预留子路由出口 -->
    <div class="news-detail">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const newsList = ref([
  { id: 1, name: '新闻1' },
  { id: 2, name: '新闻2' }
]);
</script>
```

## 六、路由传参

### 6.1 query 参数

#### 传递参数

```vue
<template>
  <!-- 方式1：字符串写法 -->
  <RouterLink to="/news/detail?id=1&title=新闻1&content=内容1">
    跳转
  </RouterLink>

  <!-- 方式2：对象写法 -->
  <RouterLink
    :to="{
      path: '/news/detail',
      query: {
        id: news.id,
        title: news.title,
        content: news.content
      }
    }"
  >
    {{ news.title }}
  </RouterLink>

  <!-- 方式3：命名路由 -->
  <RouterLink
    :to="{
      name: 'xiang',
      query: {
        id: news.id,
        title: news.title,
        content: news.content
      }
    }"
  >
    {{ news.title }}
  </RouterLink>
</template>
```

#### 接收参数

```vue
<!-- Detail.vue -->
<template>
  <div>
    <p>ID: {{ route.query.id }}</p>
    <p>标题: {{ route.query.title }}</p>
    <p>内容: {{ route.query.content }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

// 打印 query 参数
console.log(route.query);
// { id: '1', title: '新闻1', content: '内容1' }
</script>
```

### 6.2 params 参数

#### 配置动态路由

```javascript
// router/index.js
const routes = [
  {
    name: 'xinwen',
    path: '/news',
    component: News,
    children: [
      {
        name: 'xiang',
        path: 'detail/:id/:title/:content',  // 动态参数
        component: Detail
      }
    ]
  }
];
```

#### 传递参数

```vue
<template>
  <!-- 方式1：字符串写法 -->
  <RouterLink :to="`/news/detail/${news.id}/${news.title}/${news.content}`">
    {{ news.title }}
  </RouterLink>

  <!-- 方式2：对象写法（⚠️ 必须使用 name） -->
  <RouterLink
    :to="{
      name: 'xiang',              // ⚠️ params 只能用 name，不能用 path
      params: {
        id: news.id,
        title: news.title,
        content: news.content
      }
    }"
  >
    {{ news.title }}
  </RouterLink>
</template>
```

**⚠️ 注意**：
- params 参数必须配合**命名路由**（name）使用
- 不能使用 `path` + `params` 的组合

```javascript
<!-- ❌ 错误：params 不能和 path 一起使用 -->
<RouterLink
  :to="{
    path: '/news/detail',
    params: { id: 1 }
  }"
>
  跳转
</RouterLink>

<!-- ✅ 正确：params 必须使用 name -->
<RouterLink
  :to="{
    name: 'xiang',
    params: { id: 1 }
  }"
>
  跳转
</RouterLink>
```

#### 接收参数

```vue
<!-- Detail.vue -->
<template>
  <div>
    <p>ID: {{ route.params.id }}</p>
    <p>标题: {{ route.params.title }}</p>
    <p>内容: {{ route.params.content }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

// 打印 params 参数
console.log(route.params);
// { id: '1', title: '新闻1', content: '内容1' }
</script>
```

### 6.3 query vs params

| 特性 | query | params |
|------|-------|--------|
| **传参方式** | `?id=1&name=张三` | `/user/1/张三` |
| **路由配置** | 无需特殊配置 | 需要配置 `:id/:name` |
| **使用 path** | ✅ 可以 | ❌ 不可以 |
| **使用 name** | ✅ 可以 | ✅ 必须 |
| **刷新保留** | ✅ 保留 | ✅ 保留（配置了路径） |
| **URL 显示** | 显示在 `?` 后 | 显示在路径中 |

## 七、路由的 props 配置

### 7.1 作用

让路由组件更方便地接收参数，避免频繁使用 `route.params` 或 `route.query`。

### 7.2 三种写法

#### 方式1：对象写法

将对象中的 key-value 作为 props 传递。

```javascript
{
  name: 'xiang',
  path: 'detail/:id/:title/:content',
  component: Detail,

  // props 对象：所有键值对都作为 props 传递
  props: { a: 1, b: 2, c: 3 }
}
```

```javascript
<!-- Detail.vue -->
defineProps(['a', 'b', 'c']);

// 接收：a=1, b=2, c=3
```

#### 方式2：布尔值写法

将所有 params 参数作为 props 传递。

```javascript
{
  name: 'xiang',
  path: 'detail/:id/:title/:content',
  component: Detail,

  // props: true，把所有 params 参数作为 props 传递
  props: true
}
```

```vue
<!-- Detail.vue -->
<template>
  <div>
    <p>ID: {{ id }}</p>
    <p>标题: {{ title }}</p>
    <p>内容: {{ content }}</p>
  </div>
</template>

<script setup>
// 接收 params 参数作为 props
defineProps(['id', 'title', 'content']);
</script>
```

**⚠️ 注意**：布尔值写法只能传递 params，不能传递 query。

#### 方式3：函数写法（推荐）

最灵活，可以传递 params 和 query。

```javascript
{
  name: 'xiang',
  path: 'detail/:id/:title/:content',
  component: Detail,

  // 函数写法：返回的对象作为 props 传递
  props(route) {
    return route.query;    // 传递 query
    // return route.params; // 传递 params
    // 或者同时传递
    return {
      ...route.query,
      ...route.params
    };
  }
}
```

```vue
<!-- Detail.vue -->
<template>
  <div>
    <p>ID: {{ id }}</p>
    <p>标题: {{ title }}</p>
    <p>页码: {{ page }}</p>
  </div>
</template>

<script setup>
defineProps(['id', 'title', 'page']);
</script>
```

## 八、replace 属性

### 8.1 作用

控制路由跳转时操作浏览器历史记录的模式。

### 8.2 浏览器的历史记录

浏览器的历史记录有两种写入方式：
- **push**：追加历史记录（默认值）
- **replace**：替换当前记录

```vue
<template>
  <!-- push 模式（默认）：可以后退 -->
  <RouterLink to="/news">新闻</RouterLink>

  <!-- replace 模式：不可以后退 -->
  <RouterLink to="/news" replace>新闻</RouterLink>
</template>
```

**编程式导航**：

```javascript
import { useRouter } from 'vue-router';

const router = useRouter();

// push：可以后退
router.push('/news');

// replace：不可以后退
router.replace('/news');
```

## 九、重定向

### 9.1 作用

将特定的路径重新定向到已有路由。

### 9.2 配置

```javascript
const routes = [
  {
    path: '/',
    redirect: '/home'  // 重定向到 /home
  },
  {
    path: '/home',
    component: Home
  },
  {
    path: '/news',
    component: News
  }
];
```

**使用对象形式**：

```javascript
const routes = [
  {
    path: '/',
    redirect: { name: 'home' }  // 重定向到命名路由
  },
  {
    name: 'home',
    path: '/home',
    component: Home
  }
];
```

## 十、路由守卫

### 10.1 全局前置守卫

```javascript
// router/index.js
const router = createRouter({...});

router.beforeEach((to, from, next) => {
  console.log('导航前置守卫');
  console.log('去哪：', to.path);
  console.log('从哪来：', from.path);

  // 判断是否需要登录
  if (to.meta.requiresAuth && !isLoggedIn()) {
    // 重定向到登录页
    next('/login');
  } else {
    // 放行
    next();
  }
});
```

### 10.2 全局后置守卫

```javascript
router.afterEach((to, from) => {
  console.log('导航后置守卫');

  // 修改页面标题
  document.title = to.meta.title || '默认标题';
});
```

### 10.3 路由独享守卫

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      // 只对 /admin 路由生效
      if (isAdmin()) {
        next();
      } else {
        next('/');
      }
    }
  }
];
```

### 10.4 组件内守卫

```javascript
import { onBeforeRouteEnter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router';

// 进入路由前
onBeforeRouteEnter((to, from) => {
  console.log('进入路由前');
});

// 路由更新时
onBeforeRouteUpdate((to, from) => {
  console.log('路由更新');
});

// 离开路由前
onBeforeRouteLeave((to, from) => {
  console.log('离开路由前');

  // 表单未保存提示
  const answer = window.confirm('确定要离开吗？数据未保存。');
  if (!answer) return false; // 取消导航
});
```

## 十一、路由元信息

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,    // 需要登录
      title: '管理后台',
      roles: ['admin']
    }
  }
];
```

**使用**：

```javascript
import { useRoute } from 'vue-router';

const route = useRoute();

console.log(route.meta.requiresAuth);
console.log(route.meta.title);
```

## 十二、常见问题

### Q1: params 和 query 的区别？

**A**:
- **query**: 显示在 URL 的 `?` 后面，刷新不丢失
- **params**: 需要配置路由路径，显示在路径中

### Q2: 为什么 params 必须使用 name 而不能用 path？

**A**: 因为 params 参数是路径的一部分，使用 name 可以让 Vue Router 自动拼接路径。

### Q3: 如何在路由切换时保留滚动位置？

**A**: 使用 `scrollBehavior`。

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes: [...],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});
```

## 十三、总结

### 核心要点

1. **路由模式**：history 美观但需服务端配置，hash 兼容性好
2. **导航方式**：声明式（RouterLink）和编程式（router.push）
3. **传参方式**：query（通用）和 params（需配置动态路由）
4. **props 配置**：让组件更方便接收参数
5. **路由守卫**：全局、路由独享、组件内三种守卫

### 最佳实践

- 使用命名路由简化跳转
- 路由组件放在 pages/views 文件夹
- 使用 props 配置简化参数接收
- 合理使用路由守卫控制权限
- 设置 meta 信息方便管理

## 参考资源

- [Vue Router 官方文档](https://router.vuejs.org/zh/)
- [Vue Router 4 迁移指南](https://router.vuejs.org/zh/guide/migration/)
- [Vue Router 最佳实践](https://router.vuejs.org/zh/guide/advanced/)
