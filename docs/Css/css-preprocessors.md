---
title: CSS 预处理器完全指南
date: 2026-01-19 10:32:00
tags:
  - CSS
  - Scss
  - Less
  - Stylus
  - CSS Modules
categories:
  - CSS
---

# CSS 预处理器完全指南

CSS 预处理器为 CSS 增加了编程特性，如变量、嵌套、混合、函数等，使样式代码更易维护和复用。本文将详细介绍 Scss、Less、Stylus 的使用方法，以及在 Vue 和 React 项目中的应用。

## 主流预处理器对比

| 特性 | Scss/Sass | Less | Stylus |
|------|-----------|------|--------|
| 语法风格 | 类 CSS | 类 CSS | 简洁/灵活 |
| 变量符号 | `$` | `@` | 无需符号 |
| 混合 | `@mixin` | `.` | 函数式 |
| 嵌套 | ✅ | ✅ | ✅ |
| 函数 | ✅ 强大 | ✅ 中等 | ✅ 强大 |
| 条件语句 | ✅ | ✅ | ✅ |
| 循环 | ✅ | ✅ | ✅ |
| 继承 | `@extend` | `:extend()` | `@extend` |
| 模块化 | `@import`/`@use` | `@import` | `@import` |
| 社区生态 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 学习曲线 | 中等 | 简单 | 灵活但需适应 |

## Scss/Sass

Sass（Syntactically Awesome StyleSheets）是最成熟的 CSS 预处理器，Scss 是 Sass 3 引入的新语法。

### 安装

```bash
# npm
npm install sass -D

# yarn
yarn add sass -D

# pnpm
pnpm add sass -D
```

### 变量

```scss
// 定义变量
$primary-color: #3498db;
$font-size-base: 16px;
$border-radius: 4px;

// 使用变量
.button {
  background-color: $primary-color;
  font-size: $font-size-base;
  border-radius: $border-radius;
}

// 变量作用域
$color: red;

.container {
  $color: blue; // 局部变量
  color: $color; // blue
}

.other {
  color: $color; // red
}

// 默认变量（可被覆盖）
$primary-color: #3498db !default;
```

### 嵌套

```scss
// 基本嵌套
.nav {
  background: #333;

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    display: inline-block;
  }

  a {
    color: white;
    text-decoration: none;

    &:hover {
      color: #ddd;
    }
  }
}

// & 父选择器引用
.button {
  background: blue;

  &:hover {
    background: darkblue;
  }

  &--primary {
    background: green;
  }

  &__icon {
    margin-right: 5px;
  }
}

// 编译后
// .button { background: blue; }
// .button:hover { background: darkblue; }
// .button--primary { background: green; }
// .button__icon { margin-right: 5px; }
```

### 混合（Mixin）

```scss
// 定义混合
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// 使用混合
.container {
  @include flex-center;
}

// 带参数的混合
@mixin button-style($bg-color, $text-color: white) {
  background-color: $bg-color;
  color: $text-color;
  padding: 10px 20px;
  border-radius: 4px;
}

.primary-btn {
  @include button-style(#3498db);
}

.danger-btn {
  @include button-style(#e74c3c, #fff);
}

// 可变参数
@mixin box-shadow($shadows...) {
  -webkit-box-shadow: $shadows;
  -moz-box-shadow: $shadows;
  box-shadow: $shadows;
}

.card {
  @include box-shadow(0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1));
}
```

### 继承

```scss
// 定义基础样式
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

// 继承基础样式
.primary-button {
  @extend .button;
  background-color: #3498db;
  color: white;
}

// 占位符选择器（不会被编译）
%flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  @extend %flex-center;
}
```

### 函数

```scss
// 内置函数
$base-color: #3498db;

.element {
  // 颜色函数
  background: lighten($base-color, 10%);
  border: 1px solid darken($base-color, 15%);
  color: complement($base-color);

  // 数学函数
  width: percentage(0.5); // 50%
  height: round(3.6px); // 4px
}

// 自定义函数
@function calculate-rem($px) {
  @return $px / 16px * 1rem;
}

.text {
  font-size: calculate-rem(24px); // 1.5rem
}
```

### 条件语句和循环

```scss
// 条件语句
@mixin theme-color($theme) {
  @if $theme == dark {
    background-color: #333;
    color: white;
  } @else if $theme == light {
    background-color: white;
    color: #333;
  } @else {
    background-color: gray;
    color: black;
  }
}

.dark-mode {
  @include theme-color(dark);
}

// for 循环
@for $i from 1 through 3 {
  .col-#{$i} {
    width: 100% / $i;
  }
}

// each 循环
$sizes: small, medium, large;

@each $size in $sizes {
  .btn-#{$size} {
    @if $size == small {
      font-size: 12px;
    } @else if $size == medium {
      font-size: 14px;
    } @else {
      font-size: 16px;
    }
  }
}

// while 循环
$i: 1;
@while $i <= 3 {
  .item-#{$i} {
    width: 100px * $i;
  }
  $i: $i + 1;
}
```

### 模块化

```scss
// _variables.scss
$primary-color: #3498db;
$secondary-color: #2ecc71;

// _mixins.scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// main.scss
// 使用 @use（推荐，Sass 新语法）
@use 'variables';
@use 'mixins';

.container {
  background: variables.$primary-color;
  @include mixins.flex-center;
}

// 或使用 @import（旧语法）
@import 'variables';
@import 'mixins';

.container {
  background: $primary-color;
  @include flex-center;
}
```

## Less

Less 是一个向后兼容的 CSS 扩展语言，语法简洁易学。

### 安装

```bash
npm install less -D
```

### 变量

```less
// 定义变量
@primary-color: #3498db;
@font-size-base: 16px;
@border-radius: 4px;

// 使用变量
.button {
  background-color: @primary-color;
  font-size: @font-size-base;
  border-radius: @border-radius;
}

// 变量插值
@my-selector: banner;

.@{my-selector} {
  font-weight: bold;
}

// 编译后：.banner { font-weight: bold; }

// 变量作为属性名
@property: color;

.widget {
  @{property}: #fff;
  background-@{property}: #000;
}
```

### 嵌套

```less
// 基本嵌套
.nav {
  background: #333;

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    display: inline-block;
  }

  a {
    color: white;

    &:hover {
      color: #ddd;
    }
  }
}
```

### 混合（Mixins）

```less
// 类选择器混合
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  .flex-center(); // 调用混合
}

// 带参数的混合
.button-style(@bg-color; @text-color: white) {
  background-color: @bg-color;
  color: @text-color;
  padding: 10px 20px;
  border-radius: 4px;
}

.primary-btn {
  .button-style(#3498db);
}

.danger-btn {
  .button-style(#e74c3c; #fff);
}

// 带守卫的混合（条件混合）
.mixin(@a) when (@a > 10) {
  font-size: 14px;
}

.mixin(@a) when (@a <= 10) {
  font-size: 12px;
}

.class1 {
  .mixin(15);
}
```

### 继承

```less
// 使用 :extend
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
}

.primary-button:extend(.button) {
  background-color: #3498db;
  color: white;
}

// 或使用混合实现继承
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
}

.primary-button {
  .button();
  background-color: #3498db;
  color: white;
}
```

### 函数

```less
// 内置函数
@base-color: #3498db;

.element {
  // 颜色函数
  background: lighten(@base-color, 10%);
  border: 1px solid darken(@base-color, 15%);

  // 数学函数
  width: percentage(0.5); // 50%
  height: round(3.6px); // 4px
}

// 自定义函数（使用混合实现）
.calculate-rem(@px) {
  @result: (@px / 16px) * 1rem;
}

.text {
  .calculate-rem(24px);
  font-size: @result; // 1.5rem
}
```

### 循环

```less
// 递归混合实现循环
.generate-columns(@n, @i: 1) when (@i <= @n) {
  .col-@{i} {
    width: (@i * 100% / @n);
  }
  .generate-columns(@n, (@i + 1));
}

.generate-columns(12);
```

### 模块化

```less
// variables.less
@primary-color: #3498db;
@secondary-color: #2ecc71;

// mixins.less
.flex-center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

// main.less
@import 'variables';
@import 'mixins';

.container {
  background: @primary-color;
  .flex-center();
}
```

## Stylus

Stylus 提供了更加灵活和简洁的语法，可以省略大括号、分号和冒号。

### 安装

```bash
npm install stylus -D
```

### 变量

```stylus
// 定义变量（无需符号）
primary-color = #3498db
font-size-base = 16px
border-radius = 4px

// 使用变量
.button
  background-color primary-color
  font-size font-size-base
  border-radius border-radius

// 也可以使用 $ 符号
$primary-color = #3498db

.button
  background-color $primary-color
```

### 嵌套

```stylus
// 简洁语法（无大括号、分号）
.nav
  background #333

  ul
    margin 0
    padding 0

  li
    display inline-block

  a
    color white

    &:hover
      color #ddd

// 传统语法（兼容 CSS）
.nav {
  background: #333;

  a {
    color: white;
  }
}
```

### 混合

```stylus
// 函数式混合
flex-center()
  display flex
  justify-content center
  align-items center

.container
  flex-center()

// 带参数的混合
button-style(bg-color, text-color = white)
  background-color bg-color
  color text-color
  padding 10px 20px
  border-radius 4px

.primary-btn
  button-style(#3498db)

.danger-btn
  button-style(#e74c3c, #fff)
```

### 继承

```stylus
// 使用 @extend
.button
  padding 10px 20px
  border none
  border-radius 4px

.primary-button
  @extend .button
  background-color #3498db
  color white
```

### 函数

```stylus
// 内置函数
base-color = #3498db

.element
  background lighten(base-color, 10%)
  border 1px solid darken(base-color, 15%)

// 自定义函数
calculate-rem(px)
  (px / 16px) * 1rem

.text
  font-size calculate-rem(24px) // 1.5rem
```

### 条件和循环

```stylus
// 条件语句
theme-color(theme)
  if theme == 'dark'
    background-color #333
    color white
  else if theme == 'light'
    background-color white
    color #333
  else
    background-color gray
    color black

.dark-mode
  theme-color('dark')

// for 循环
for num in 1..3
  .col-{num}
    width (100% / num)
```

### 模块化

```stylus
// variables.styl
primary-color = #3498db
secondary-color = #2ecc71

// mixins.styl
flex-center()
  display flex
  justify-content center
  align-items center

// main.styl
@import 'variables'
@import 'mixins'

.container
  background primary-color
  flex-center()
```

## CSS Modules

CSS Modules 是一种 CSS 模块化方案，通过自动生成唯一的类名来避免样式冲突。

### 基本使用

```css
/* index.module.css */
.container {
  background: #fff;
  padding: 20px;
}

.title {
  font-size: 24px;
  color: #333;
}
```

```jsx
// React 中使用
import styles from './index.module.css';

function Component() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>标题</h1>
    </div>
  );
}

// 编译后的类名：index_container__2Fj3L
```

### 组合样式（composes）

这是你提供的重点内容，CSS Modules 的强大功能。

#### 同文件内组合

```less
/* index.module.less */
.container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

/* 组合 container 的样式 */
.component {
  composes: container;
  color: #000;
}

/* 等价于 */
// .component 会同时拥有 .container 和 .component 的样式
```

#### 跨文件组合

```less
/* base.module.less */
.container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

```less
/* component.module.less */
/* 从其他文件导入样式 */
.component {
  /* ⚠️ 注意：composes 必须在最外层，不能嵌套在其他选择器内 */
  composes: container from './base.module.less';
  color: #000;
}

.card {
  composes: container flex-center from './base.module.less';
  width: 300px;
}
```

#### 使用示例

```jsx
// React
import styles from './component.module.less';

function Component() {
  return (
    // className 会自动包含 container 和 component 的样式
    <div className={styles.component}>
      <p>内容</p>
    </div>
  );
}

// 渲染后的 HTML
// <div class="base_container__xJ2K component_component__9Lm2">
//   <p>内容</p>
// </div>
```

#### composes 注意事项

1. **必须在最外层**

```less
/* ❌ 错误：不能在嵌套选择器内使用 */
.wrapper {
  .component {
    composes: container from './base.module.less';
  }
}

/* ✅ 正确：必须在最外层 */
.component {
  composes: container from './base.module.less';

  .inner {
    color: red;
  }
}
```

2. **必须在第一行**

```less
/* ❌ 错误：composes 必须在第一行 */
.component {
  color: #000;
  composes: container from './base.module.less';
}

/* ✅ 正确 */
.component {
  composes: container from './base.module.less';
  color: #000;
}
```

3. **可以组合多个样式**

```less
.component {
  composes: container flex-center from './base.module.less';
  composes: button from './button.module.less';
  color: #000;
}
```

### 全局样式

```css
/* styles.module.css */
/* 局部样式（默认） */
.container {
  background: #fff;
}

/* 全局样式 */
:global(.global-class) {
  color: red;
}

/* 或 */
:global {
  .global-class {
    color: red;
  }
}
```

## 在 Vue 项目中使用

### Vue 3 + Vite

#### 1. 安装预处理器

```bash
# Scss
npm install sass -D

# Less
npm install less -D

# Stylus
npm install stylus -D
```

#### 2. 在 SFC 中使用

```vue
<template>
  <div class="container">
    <h1 class="title">{{ title }}</h1>
  </div>
</template>

<script setup>
const title = 'Hello Vue';
</script>

<!-- Scss -->
<style lang="scss" scoped>
$primary-color: #3498db;

.container {
  background: lighten($primary-color, 40%);

  .title {
    color: $primary-color;
  }
}
</style>

<!-- Less -->
<style lang="less" scoped>
@primary-color: #3498db;

.container {
  background: lighten(@primary-color, 40%);

  .title {
    color: @primary-color;
  }
}
</style>

<!-- Stylus -->
<style lang="stylus" scoped>
primary-color = #3498db

.container
  background lighten(primary-color, 40%)

  .title
    color primary-color
</style>
```

#### 3. 全局变量配置

**vite.config.js**

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      // Scss
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
      // Less
      less: {
        additionalData: `@import "@/styles/variables.less";`,
        javascriptEnabled: true,
      },
      // Stylus
      stylus: {
        additionalData: `@import "@/styles/variables.styl"`,
      },
    },
  },
});
```

**styles/variables.scss**

```scss
// 全局变量
$primary-color: #3498db;
$secondary-color: #2ecc71;
$font-size-base: 16px;

// 全局混合
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**组件中使用（无需导入）**

```vue
<template>
  <div class="container">
    <h1>Title</h1>
  </div>
</template>

<style lang="scss" scoped>
.container {
  // 直接使用全局变量和混合，无需 @import
  background: $primary-color;
  @include flex-center;
}
</style>
```

#### 4. CSS Modules in Vue

```vue
<template>
  <div :class="$style.container">
    <h1 :class="$style.title">{{ title }}</h1>
  </div>
</template>

<script setup>
const title = 'Hello';
</script>

<!-- CSS Modules -->
<style module lang="scss">
.container {
  background: #fff;
}

.title {
  composes: container;
  color: #333;
}
</style>

<!-- 自定义模块名 -->
<style module="classes" lang="scss">
.wrapper {
  padding: 20px;
}
</style>

<template>
  <div :class="classes.wrapper">
    <!-- 使用 classes.wrapper -->
  </div>
</template>
```

## 在 React 项目中使用

### Create React App / Vite

#### 1. 安装预处理器

```bash
# Create React App 默认支持 Sass
# Vite 需要安装
npm install sass -D
npm install less -D
npm install stylus -D
```

#### 2. 基本使用

```jsx
// styles.scss
$primary-color: #3498db;

.container {
  background: $primary-color;
  padding: 20px;
}
```

```jsx
// Component.jsx
import './styles.scss';

function Component() {
  return (
    <div className="container">
      <h1>Title</h1>
    </div>
  );
}
```

#### 3. CSS Modules

**命名规范：`*.module.scss`、`*.module.less`、`*.module.css`**

```scss
/* Button.module.scss */
$primary-color: #3498db;

.button {
  background: $primary-color;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: darken($primary-color, 10%);
  }
}

.primary {
  composes: button;
  background: #3498db;
}

.secondary {
  composes: button;
  background: #95a5a6;
}
```

```jsx
// Button.jsx
import React from 'react';
import styles from './Button.module.scss';

function Button({ type = 'primary', children }) {
  return (
    <button className={styles[type]}>
      {children}
    </button>
  );
}

export default Button;
```

#### 4. 组合多个类名

```jsx
import styles from './styles.module.scss';
import classNames from 'classnames'; // 推荐使用

function Component({ isActive }) {
  return (
    <div
      className={classNames(
        styles.container,
        styles.card,
        { [styles.active]: isActive }
      )}
    >
      Content
    </div>
  );
}

// 或使用模板字符串
<div className={`${styles.container} ${styles.card} ${isActive ? styles.active : ''}`}>
```

#### 5. Vite React 全局变量配置

**vite.config.js**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
      less: {
        additionalData: `@import "@/styles/variables.less";`,
        javascriptEnabled: true,
      },
    },
    modules: {
      // CSS Modules 配置
      localsConvention: 'camelCase', // 支持驼峰命名
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

#### 6. Next.js 配置

**next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // CSS Modules 默认支持
  sassOptions: {
    includePaths: ['./src/styles'],
    additionalData: `@import "variables.scss";`,
  },
};

module.exports = nextConfig;
```

## 完整项目示例

### 目录结构

```
src/
├── styles/
│   ├── variables.scss       # 全局变量
│   ├── mixins.scss          # 全局混合
│   ├── global.scss          # 全局样式
│   └── base.module.scss     # 基础样式（可组合）
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   └── Button.module.scss
│   └── Card/
│       ├── Card.jsx
│       └── Card.module.scss
└── App.jsx
```

### styles/variables.scss

```scss
// 颜色
$primary-color: #3498db;
$secondary-color: #2ecc71;
$danger-color: #e74c3c;
$warning-color: #f39c12;
$info-color: #3498db;

// 字体
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
$font-size-base: 16px;
$font-size-sm: 14px;
$font-size-lg: 18px;

// 间距
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// 圆角
$border-radius-sm: 2px;
$border-radius-md: 4px;
$border-radius-lg: 8px;

// 断点
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
```

### styles/mixins.scss

```scss
// 弹性布局
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 响应式
@mixin respond-to($breakpoint) {
  @if $breakpoint == 'sm' {
    @media (min-width: $breakpoint-sm) {
      @content;
    }
  } @else if $breakpoint == 'md' {
    @media (min-width: $breakpoint-md) {
      @content;
    }
  } @else if $breakpoint == 'lg' {
    @media (min-width: $breakpoint-lg) {
      @content;
    }
  }
}

// 文本省略
@mixin text-ellipsis($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

### styles/base.module.scss

```scss
/* 基础容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-md;
}

/* 卡片样式 */
.card {
  background: white;
  border-radius: $border-radius-md;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: $spacing-lg;
}

/* 弹性布局 */
.flex-center {
  @include flex-center;
}

.flex-between {
  @include flex-between;
}
```

### components/Button/Button.module.scss

```scss
/* 基础按钮样式 */
.button {
  padding: 10px 20px;
  border: none;
  border-radius: $border-radius-md;
  font-size: $font-size-base;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* 组合基础样式 */
.primary {
  composes: button;
  background: $primary-color;
  color: white;

  &:hover {
    background: darken($primary-color, 10%);
  }
}

.secondary {
  composes: button;
  background: $secondary-color;
  color: white;

  &:hover {
    background: darken($secondary-color, 10%);
  }
}

.danger {
  composes: button;
  background: $danger-color;
  color: white;
}

/* 尺寸变体 */
.small {
  padding: 6px 12px;
  font-size: $font-size-sm;
}

.large {
  padding: 14px 28px;
  font-size: $font-size-lg;
}
```

### components/Card/Card.module.scss

```scss
/* 从 base 导入基础样式 */
.card {
  composes: card from '@/styles/base.module.scss';
  margin-bottom: $spacing-lg;
}

.header {
  composes: flex-between from '@/styles/base.module.scss';
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: $font-size-lg;
  font-weight: bold;
  color: #333;
}

.content {
  color: #666;
  line-height: 1.6;
}

.footer {
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1px solid #eee;
}
```

### 组件使用

```jsx
// Button.jsx
import React from 'react';
import styles from './Button.module.scss';
import classNames from 'classnames';

function Button({
  type = 'primary',
  size = 'medium',
  children,
  ...props
}) {
  const className = classNames(
    styles[type],
    size !== 'medium' && styles[size]
  );

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}

export default Button;
```

```jsx
// Card.jsx
import React from 'react';
import styles from './Card.module.scss';

function Card({ title, children, footer }) {
  return (
    <div className={styles.card}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
      )}
      <div className={styles.content}>
        {children}
      </div>
      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
```

## 最佳实践

### 1. 变量命名规范

```scss
// ✅ 推荐：语义化命名
$primary-color: #3498db;
$text-color-primary: #333;
$spacing-md: 16px;

// ❌ 避免：无意义命名
$color1: #3498db;
$size2: 16px;
```

### 2. 模块化组织

```scss
// variables.scss - 只存放变量
$primary-color: #3498db;

// mixins.scss - 只存放混合
@mixin flex-center { }

// base.scss - 基础样式
* { box-sizing: border-box; }

// components/*.scss - 组件样式
```

### 3. 避免深层嵌套

```scss
// ❌ 不推荐：嵌套过深
.nav {
  .menu {
    .item {
      .link {
        .icon { }
      }
    }
  }
}

// ✅ 推荐：扁平化
.nav { }
.nav-menu { }
.nav-item { }
.nav-link { }
.nav-icon { }
```

### 4. 使用 CSS Modules 避免全局污染

```scss
// ✅ 推荐：CSS Modules
// Button.module.scss
.button {
  background: blue;
}

// ❌ 避免：全局样式
// Button.scss
.button { // 可能与其他组件的 .button 冲突
  background: blue;
}
```

### 5. 合理使用 composes

```scss
// ✅ 推荐：组合基础样式
.base-button {
  padding: 10px;
  border: none;
}

.primary-button {
  composes: base-button;
  background: blue;
}

// ❌ 避免：过度组合导致样式混乱
.button {
  composes: a b c d e f from './base.module.scss';
}
```

## 常见问题

### Q1: Scss 和 Sass 有什么区别？

**答案**：
- Sass 是最初的语法，使用缩进代替大括号，省略分号
- Scss 是 Sass 3 引入的新语法，兼容 CSS 语法
- 推荐使用 Scss，学习曲线更平缓

### Q2: CSS Modules 的 composes 为什么必须在最外层？

**答案**：
这是 CSS Modules 的设计限制，因为 `composes` 需要在编译时处理，而嵌套选择器会使这个过程变得复杂。

### Q3: 全局变量配置后为什么还是报错？

**答案**：
检查配置文件：
- Vite: `vite.config.js` 中的 `css.preprocessorOptions`
- Vue CLI: `vue.config.js` 中的 `css.loaderOptions`
- 确保路径正确，使用绝对路径或别名

### Q4: 如何在 CSS Modules 中使用全局样式？

**答案**：
```scss
/* styles.module.scss */
.container {
  /* 局部样式 */
}

:global(.global-class) {
  /* 全局样式 */
}
```

## 工具推荐

- **classnames**: 优雅地组合多个类名
- **postcss**: CSS 后处理器
- **autoprefixer**: 自动添加浏览器前缀
- **stylelint**: CSS 代码检查工具
- **prettier**: 代码格式化工具

## 参考资源

- [Sass 官方文档](https://sass-lang.com/)
- [Less 官方文档](https://lesscss.org/)
- [Stylus 官方文档](https://stylus-lang.com/)
- [CSS Modules 规范](https://github.com/css-modules/css-modules)
- [Vite CSS 配置](https://vitejs.dev/config/shared-options.html#css-preprocessoroptions)
