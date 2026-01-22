---
title: Flex 与 Grid 布局完全指南
date: 2026-01-21 17:45:50
tags:
  - CSS
  - Flex
  - Grid
  - 布局
categories:
  - CSS
description: 全面介绍 Flexbox 和 CSS Grid 两大现代布局方式，包含详细属性说明、实战案例和可视化演示
---

# Flex 与 Grid 布局完全指南

## 概述

**Flexbox（弹性盒子布局）**和 **CSS Grid（网格布局）**是现代 CSS 中最强大的两种布局系统。

**核心区别**：
- **Flexbox**：一维布局系统（按行或列排列）
- **Grid**：二维布局系统（同时按行和列排列）

**使用场景**：
- **Flex**：导航栏、工具栏、卡片列表、对齐单个元素
- **Grid**：整体页面布局、复杂的二维布局、杂志式排版

---

## 第一部分：Flexbox 布局

### 一、基本概念

Flexbox 是一维布局模型，主要用于在一个方向（行或列）上排列元素。

**核心术语**：
- **容器（Flex Container）**：设置 `display: flex` 的父元素
- **项目（Flex Item）**：容器的直接子元素
- **主轴（Main Axis）**：主要排列方向
- **交叉轴（Cross Axis）**：垂直于主轴的方向

```html
<div class="container">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
</div>
```

```css
.container {
  display: flex; /* 启用 Flexbox */
}
```

### 二、容器属性（Flex Container）

#### 2.1 `flex-direction` - 主轴方向

控制项目的排列方向。

```css
.container {
  display: flex;
  flex-direction: row; /* 默认值 */
}
```

**可选值**：
- `row`：水平方向，从左到右（默认）
- `row-reverse`：水平方向，从右到左
- `column`：垂直方向，从上到下
- `column-reverse`：垂直方向，从下到上

<div style="margin: 20px 0;">
  <div style="display: flex; gap: 10px; margin-bottom: 10px;">
    <div style="flex: 1; padding: 20px; background: #f0f0f0; border-radius: 8px;">
      <strong>row</strong>
      <div style="display: flex; gap: 5px; margin-top: 10px;">
        <div style="width: 40px; height: 40px; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">1</div>
        <div style="width: 40px; height: 40px; background: #2196F3; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">2</div>
        <div style="width: 40px; height: 40px; background: #FF9800; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">3</div>
      </div>
    </div>
    <div style="flex: 1; padding: 20px; background: #f0f0f0; border-radius: 8px;">
      <strong>column</strong>
      <div style="display: flex; flex-direction: column; gap: 5px; margin-top: 10px;">
        <div style="width: 40px; height: 40px; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">1</div>
        <div style="width: 40px; height: 40px; background: #2196F3; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">2</div>
        <div style="width: 40px; height: 40px; background: #FF9800; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">3</div>
      </div>
    </div>
  </div>
</div>

#### 2.2 `justify-content` - 主轴对齐

控制项目在主轴上的对齐方式。

```css
.container {
  display: flex;
  justify-content: flex-start; /* 默认值 */
}
```

**可选值**：
- `flex-start`：起点对齐（默认）
- `flex-end`：终点对齐
- `center`：居中对齐
- `space-between`：两端对齐，项目之间间隔相等
- `space-around`：每个项目两侧间隔相等
- `space-evenly`：所有间隔都相等

**可视化演示**：

<div style="margin: 20px 0;">
  <div style="margin-bottom: 15px;">
    <strong>flex-start</strong>
    <div style="display: flex; justify-content: flex-start; gap: 5px; padding: 10px; background: #f0f0f0; border-radius: 8px; margin-top: 5px;">
      <div style="width: 50px; height: 50px; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">1</div>
      <div style="width: 50px; height: 50px; background: #2196F3; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">2</div>
      <div style="width: 50px; height: 50px; background: #FF9800; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">3</div>
    </div>
  </div>
  <div style="margin-bottom: 15px;">
    <strong>center</strong>
    <div style="display: flex; justify-content: center; gap: 5px; padding: 10px; background: #f0f0f0; border-radius: 8px; margin-top: 5px;">
      <div style="width: 50px; height: 50px; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">1</div>
      <div style="width: 50px; height: 50px; background: #2196F3; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">2</div>
      <div style="width: 50px; height: 50px; background: #FF9800; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">3</div>
    </div>
  </div>
  <div style="margin-bottom: 15px;">
    <strong>space-between</strong>
    <div style="display: flex; justify-content: space-between; padding: 10px; background: #f0f0f0; border-radius: 8px; margin-top: 5px;">
      <div style="width: 50px; height: 50px; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">1</div>
      <div style="width: 50px; height: 50px; background: #2196F3; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">2</div>
      <div style="width: 50px; height: 50px; background: #FF9800; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">3</div>
    </div>
  </div>
  <div>
    <strong>space-evenly</strong>
    <div style="display: flex; justify-content: space-evenly; padding: 10px; background: #f0f0f0; border-radius: 8px; margin-top: 5px;">
      <div style="width: 50px; height: 50px; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">1</div>
      <div style="width: 50px; height: 50px; background: #2196F3; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">2</div>
      <div style="width: 50px; height: 50px; background: #FF9800; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">3</div>
    </div>
  </div>
</div>

#### 2.3 `align-items` - 交叉轴对齐

控制项目在交叉轴上的对齐方式。

```css
.container {
  display: flex;
  align-items: stretch; /* 默认值 */
  height: 200px; /* 需要设置高度才能看到效果 */
}
```

**可选值**：
- `stretch`：拉伸填满容器（默认）
- `flex-start`：起点对齐
- `flex-end`：终点对齐
- `center`：居中对齐
- `baseline`：基线对齐

**示例**：

```html
<div class="container" style="display: flex; align-items: center; height: 150px; background: #f0f0f0;">
  <div style="width: 50px; height: 50px; background: #4CAF50;"></div>
  <div style="width: 50px; height: 80px; background: #2196F3;"></div>
  <div style="width: 50px; height: 60px; background: #FF9800;"></div>
</div>
```

#### 2.4 `flex-wrap` - 换行控制

控制项目是否换行。

```css
.container {
  display: flex;
  flex-wrap: nowrap; /* 默认值 */
}
```

**可选值**：
- `nowrap`：不换行（默认）
- `wrap`：换行，第一行在上
- `wrap-reverse`：换行，第一行在下

**对比演示**：

```html
<!-- 不换行（默认） -->
<div style="display: flex; flex-wrap: nowrap; background: #f0f0f0; padding: 10px;">
  <div style="width: 100px; height: 50px; background: #4CAF50; margin: 5px;"></div>
  <div style="width: 100px; height: 50px; background: #2196F3; margin: 5px;"></div>
  <div style="width: 100px; height: 50px; background: #FF9800; margin: 5px;"></div>
  <div style="width: 100px; height: 50px; background: #E91E63; margin: 5px;"></div>
</div>

<!-- 换行 -->
<div style="display: flex; flex-wrap: wrap; background: #f0f0f0; padding: 10px; margin-top: 10px;">
  <div style="width: 100px; height: 50px; background: #4CAF50; margin: 5px;"></div>
  <div style="width: 100px; height: 50px; background: #2196F3; margin: 5px;"></div>
  <div style="width: 100px; height: 50px; background: #FF9800; margin: 5px;"></div>
  <div style="width: 100px; height: 50px; background: #E91E63; margin: 5px;"></div>
</div>
```

#### 2.5 `align-content` - 多行对齐

当有多行时，控制行之间的对齐方式（需要 `flex-wrap: wrap`）。

```css
.container {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  height: 300px;
}
```

**可选值**：
- `flex-start`：起点对齐
- `flex-end`：终点对齐
- `center`：居中对齐
- `space-between`：两端对齐
- `space-around`：每行两侧间隔相等
- `stretch`：拉伸填满（默认）

#### 2.6 `gap` - 间距

设置项目之间的间距（现代浏览器支持）。

```css
.container {
  display: flex;
  gap: 20px; /* 所有方向 */
  /* 或者分别设置 */
  row-gap: 20px;
  column-gap: 10px;
}
```

### 三、项目属性（Flex Item）

#### 3.1 `flex-grow` - 放大比例

定义项目的放大比例，默认为 `0`（不放大）。

```css
.item {
  flex-grow: 1; /* 平分剩余空间 */
}
```

**示例**：

```html
<div style="display: flex; gap: 10px; background: #f0f0f0; padding: 10px;">
  <div style="flex-grow: 1; height: 50px; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center;">flex-grow: 1</div>
  <div style="flex-grow: 2; height: 50px; background: #2196F3; color: white; display: flex; align-items: center; justify-content: center;">flex-grow: 2</div>
  <div style="flex-grow: 1; height: 50px; background: #FF9800; color: white; display: flex; align-items: center; justify-content: center;">flex-grow: 1</div>
</div>
```

<div style="margin: 20px 0;">
  <div style="display: flex; gap: 10px; background: #f0f0f0; padding: 10px; border-radius: 8px;">
    <div style="flex-grow: 1; height: 50px; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">grow: 1</div>
    <div style="flex-grow: 2; height: 50px; background: #2196F3; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">grow: 2 (更宽)</div>
    <div style="flex-grow: 1; height: 50px; background: #FF9800; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">grow: 1</div>
  </div>
</div>

#### 3.2 `flex-shrink` - 缩小比例

定义项目的缩小比例，默认为 `1`（空间不足时缩小）。

```css
.item {
  flex-shrink: 1; /* 默认值 */
}

.item-no-shrink {
  flex-shrink: 0; /* 不缩小 */
}
```

#### 3.3 `flex-basis` - 基础大小

定义项目在分配多余空间之前的默认大小。

```css
.item {
  flex-basis: 200px; /* 基础宽度 */
  /* 或者 */
  flex-basis: auto; /* 根据内容（默认） */
}
```

#### 3.4 `flex` - 简写属性

`flex` 是 `flex-grow`、`flex-shrink` 和 `flex-basis` 的简写。

```css
.item {
  flex: 1; /* 等同于 flex: 1 1 0% */
  /* 完整写法 */
  flex: 1 1 auto;
}
```

**常用简写**：
- `flex: 1`：平分剩余空间
- `flex: auto`：`1 1 auto`，根据内容自适应
- `flex: none`：`0 0 auto`，固定大小

#### 3.5 `align-self` - 单独对齐

允许单个项目有与其他项目不同的对齐方式。

```css
.item-special {
  align-self: flex-end; /* 单独对齐到底部 */
}
```

<div style="margin: 20px 0;">
  <div style="display: flex; align-items: flex-start; height: 150px; gap: 10px; background: #f0f0f0; padding: 10px; border-radius: 8px;">
    <div style="width: 80px; height: 50px; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">正常</div>
    <div style="width: 80px; height: 50px; background: #2196F3; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px; align-self: center;">居中</div>
    <div style="width: 80px; height: 50px; background: #FF9800; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px; align-self: flex-end;">底部</div>
  </div>
</div>

#### 3.6 `order` - 排列顺序

定义项目的排列顺序，数值越小越靠前，默认为 `0`。

```css
.item-1 { order: 2; }
.item-2 { order: 1; }
.item-3 { order: 3; }
/* 实际顺序：item-2, item-1, item-3 */
```

### 四、Flexbox 实战案例

#### 案例 1：导航栏

```html
<nav class="navbar">
  <div class="logo">Logo</div>
  <ul class="nav-links">
    <li><a href="#">首页</a></li>
    <li><a href="#">产品</a></li>
    <li><a href="#">关于</a></li>
  </ul>
  <button class="btn-login">登录</button>
</nav>
```

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #333;
  color: white;
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
}
```

#### 案例 2：卡片布局

```html
<div class="card-container">
  <div class="card">卡片 1</div>
  <div class="card">卡片 2</div>
  <div class="card">卡片 3</div>
  <div class="card">卡片 4</div>
</div>
```

```css
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  flex: 1 1 300px; /* 最小宽度 300px，自动换行 */
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

#### 案例 3：完美居中

```css
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

#### 案例 4：圣杯布局（Header-Content-Footer）

```html
<div class="page">
  <header>头部</header>
  <main>主内容</main>
  <footer>底部</footer>
</div>
```

```css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header, footer {
  flex-shrink: 0; /* 固定高度 */
}

main {
  flex: 1; /* 占据剩余空间 */
}
```

---

## 第二部分：CSS Grid 布局

### 一、基本概念

CSS Grid 是二维布局系统，可以同时在行和列方向上排列元素。

**核心术语**：
- **容器（Grid Container）**：设置 `display: grid` 的父元素
- **项目（Grid Item）**：容器的直接子元素
- **网格线（Grid Line）**：构成网格的分界线
- **网格轨道（Grid Track）**：两条相邻网格线之间的空间（行或列）
- **网格单元（Grid Cell）**：最小单位
- **网格区域（Grid Area）**：由多个单元组成的矩形区域

```html
<div class="grid-container">
  <div class="grid-item">1</div>
  <div class="grid-item">2</div>
  <div class="grid-item">3</div>
  <div class="grid-item">4</div>
</div>
```

```css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* 3列 */
  grid-template-rows: 100px 100px; /* 2行 */
  gap: 10px;
}
```

### 二、容器属性（Grid Container）

#### 2.1 `grid-template-columns` / `grid-template-rows` - 定义列和行

定义网格的列宽和行高。

```css
.container {
  display: grid;

  /* 固定宽度 */
  grid-template-columns: 100px 200px 100px;

  /* 百分比 */
  grid-template-columns: 25% 50% 25%;

  /* fr 单位（fraction，份数） */
  grid-template-columns: 1fr 2fr 1fr;

  /* 混合使用 */
  grid-template-columns: 100px 1fr 2fr;

  /* repeat() 函数 */
  grid-template-columns: repeat(3, 1fr); /* 3个等宽列 */
  grid-template-columns: repeat(auto-fill, 200px); /* 自动填充 */

  /* minmax() 函数 */
  grid-template-columns: repeat(3, minmax(100px, 1fr));
}
```

**`fr` 单位示例**：

<div style="margin: 20px 0;">
  <div style="display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 10px; background: #f0f0f0; padding: 10px; border-radius: 8px;">
    <div style="background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 4px;">1fr</div>
    <div style="background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 4px;">2fr (宽度是旁边的2倍)</div>
    <div style="background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 4px;">1fr</div>
  </div>
</div>

#### 2.2 `gap` - 间距

设置网格之间的间距。

```css
.container {
  display: grid;
  gap: 20px; /* 行列间距都是 20px */
  /* 或者分别设置 */
  row-gap: 20px;
  column-gap: 10px;
}
```

#### 2.3 `grid-template-areas` - 区域命名

通过命名区域来定义布局。

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar content aside"
    "footer footer footer";
  gap: 10px;
  height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

**可视化示意**：

```
┌─────────────────────────────────┐
│           header                │
├────────┬─────────────┬──────────┤
│sidebar │   content   │  aside   │
│        │             │          │
├────────┴─────────────┴──────────┤
│           footer                │
└─────────────────────────────────┘
```

#### 2.4 `justify-items` / `align-items` - 单元格内对齐

控制所有项目在单元格内的对齐方式。

```css
.container {
  display: grid;
  justify-items: center; /* 水平对齐 */
  align-items: center;   /* 垂直对齐 */
}
```

**可选值**：
- `start`：起点对齐
- `end`：终点对齐
- `center`：居中对齐
- `stretch`：拉伸填满（默认）

#### 2.5 `justify-content` / `align-content` - 整体对齐

当网格总大小小于容器时，控制网格的对齐方式。

```css
.container {
  display: grid;
  justify-content: center; /* 水平对齐整个网格 */
  align-content: center;   /* 垂直对齐整个网格 */
}
```

**可选值**：
- `start` / `end` / `center`
- `space-between` / `space-around` / `space-evenly`
- `stretch`（默认）

#### 2.6 `grid-auto-flow` - 自动放置

控制自动放置算法的工作方式。

```css
.container {
  display: grid;
  grid-auto-flow: row; /* 默认，按行填充 */
  /* grid-auto-flow: column; */ /* 按列填充 */
  /* grid-auto-flow: dense; */ /* 紧密填充，尽量填满空白 */
}
```

#### 2.7 `grid-auto-columns` / `grid-auto-rows` - 隐式网格

定义隐式创建的列/行的大小。

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px; /* 显式定义2列 */
  grid-auto-columns: 50px; /* 额外的列宽度为 50px */
  grid-auto-rows: 80px; /* 额外的行高度为 80px */
}
```

### 三、项目属性（Grid Item）

#### 3.1 `grid-column` / `grid-row` - 位置和跨度

指定项目的位置和跨越的网格数。

```css
.item {
  /* 完整写法 */
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;

  /* 简写 */
  grid-column: 1 / 3; /* 从第1条线到第3条线（跨2列） */
  grid-row: 1 / 2;

  /* 使用 span */
  grid-column: 1 / span 2; /* 从第1条线开始，跨2列 */
  grid-column: span 2; /* 跨2列（自动定位） */
}
```

**示例**：

<div style="margin: 20px 0;">
  <div style="display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(3, 80px); gap: 10px; background: #f0f0f0; padding: 10px; border-radius: 8px;">
    <div style="grid-column: 1 / 3; grid-row: 1 / 2; background: #4CAF50; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">跨 2 列</div>
    <div style="grid-column: 3 / 5; grid-row: 1 / 3; background: #2196F3; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">跨 2 列 2 行</div>
    <div style="background: #FF9800; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">5</div>
    <div style="background: #E91E63; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">6</div>
    <div style="grid-column: 1 / 4; background: #9C27B0; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">跨 3 列</div>
    <div style="background: #00BCD4; color: white; display: flex; align-items: center; justify-content: center; border-radius: 4px;">8</div>
  </div>
</div>

#### 3.2 `grid-area` - 区域命名或简写

```css
/* 使用命名区域 */
.header {
  grid-area: header;
}

/* 或者作为简写 */
.item {
  grid-area: 1 / 1 / 3 / 3; /* row-start / column-start / row-end / column-end */
}
```

#### 3.3 `justify-self` / `align-self` - 单独对齐

控制单个项目在单元格内的对齐。

```css
.item {
  justify-self: center; /* 水平居中 */
  align-self: end;      /* 垂直底部对齐 */
}
```

### 四、Grid 实战案例

#### 案例 1：响应式网格布局

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

**效果**：自动适应屏幕宽度，每列最小 250px，自动换行。

<div style="margin: 20px 0;">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; background: #f0f0f0; padding: 15px; border-radius: 8px;">
    <div style="background: #4CAF50; color: white; padding: 30px; text-align: center; border-radius: 4px;">卡片 1</div>
    <div style="background: #2196F3; color: white; padding: 30px; text-align: center; border-radius: 4px;">卡片 2</div>
    <div style="background: #FF9800; color: white; padding: 30px; text-align: center; border-radius: 4px;">卡片 3</div>
    <div style="background: #E91E63; color: white; padding: 30px; text-align: center; border-radius: 4px;">卡片 4</div>
  </div>
  <p style="margin-top: 10px; font-size: 14px; color: #666;">调整浏览器窗口大小查看响应式效果</p>
</div>

#### 案例 2：经典 12 列网格系统

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 15px;
}

.col-6 {
  grid-column: span 6; /* 占 6 列 */
}

.col-4 {
  grid-column: span 4; /* 占 4 列 */
}

.col-3 {
  grid-column: span 3; /* 占 3 列 */
}
```

#### 案例 3：完整页面布局

```html
<div class="page-layout">
  <header class="header">Header</header>
  <nav class="sidebar">Sidebar</nav>
  <main class="main">Main Content</main>
  <aside class="widgets">Widgets</aside>
  <footer class="footer">Footer</footer>
</div>
```

```css
.page-layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 60px 1fr 60px;
  grid-template-areas:
    "header header header"
    "sidebar main widgets"
    "footer footer footer";
  gap: 10px;
  height: 100vh;
}

.header  { grid-area: header; background: #333; color: white; }
.sidebar { grid-area: sidebar; background: #f4f4f4; }
.main    { grid-area: main; background: white; }
.widgets { grid-area: widgets; background: #f4f4f4; }
.footer  { grid-area: footer; background: #333; color: white; }
```

#### 案例 4：图片画廊（瀑布流效果）

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: 100px;
  gap: 10px;
}

.gallery-item {
  /* 使用 grid-row 控制高度 */
}

.gallery-item:nth-child(1) { grid-row: span 2; }
.gallery-item:nth-child(3) { grid-row: span 3; }
.gallery-item:nth-child(5) { grid-row: span 2; }
```

#### 案例 5：杂志式布局

```css
.magazine {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 100px;
  gap: 10px;
}

.featured {
  grid-column: 1 / 5;
  grid-row: 1 / 3;
}

.article-1 {
  grid-column: 5 / 7;
  grid-row: 1 / 2;
}

.article-2 {
  grid-column: 5 / 7;
  grid-row: 2 / 3;
}
```

---

## 第三部分：Flex vs Grid 对比

### 对比表格

| 特性 | Flexbox | Grid |
|------|---------|------|
| **维度** | 一维（行或列） | 二维（行和列） |
| **主要用途** | 组件内部布局、导航栏 | 页面整体布局 |
| **对齐能力** | 强大的对齐选项 | 更强大的对齐控制 |
| **内容优先** | 是（基于内容大小） | 否（基于网格定义） |
| **浏览器支持** | 更好 | 现代浏览器 |
| **学习曲线** | 较简单 | 较复杂 |

### 使用场景选择

**使用 Flexbox 当**：
- ✅ 需要在一个方向上排列元素（导航栏、工具栏）
- ✅ 需要灵活的对齐和分布
- ✅ 项目大小由内容决定
- ✅ 简单的响应式布局

**使用 Grid 当**：
- ✅ 需要二维布局（行和列同时控制）
- ✅ 整体页面布局
- ✅ 复杂的对齐需求
- ✅ 需要精确控制项目位置

**组合使用**：
```css
/* Grid 用于整体布局 */
.page {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

/* Flex 用于导航栏内部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

---

## 第四部分：响应式设计

### Flexbox 响应式

```css
.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.flex-item {
  flex: 1 1 300px; /* 最小 300px，自动换行 */
}

/* 媒体查询 */
@media (max-width: 768px) {
  .flex-container {
    flex-direction: column;
  }
}
```

### Grid 响应式

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* 媒体查询 */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr; /* 单列 */
  }
}
```

### 响应式函数

#### `auto-fit` vs `auto-fill`

```css
/* auto-fit: 拉伸项目填满容器 */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

/* auto-fill: 保持项目大小，留空白 */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
```

---

## 第五部分：最佳实践

### Flexbox 最佳实践

1. **使用 `gap` 而不是 `margin`**：
```css
/* ✅ 推荐 */
.container {
  display: flex;
  gap: 20px;
}

/* ❌ 不推荐 */
.item {
  margin-right: 20px;
}
.item:last-child {
  margin-right: 0;
}
```

2. **使用 `flex` 简写**：
```css
/* ✅ 推荐 */
.item {
  flex: 1;
}

/* ❌ 避免 */
.item {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
}
```

3. **使用 `min-width: 0` 防止溢出**：
```css
.flex-item {
  flex: 1;
  min-width: 0; /* 允许缩小到小于内容宽度 */
}
```

### Grid 最佳实践

1. **使用命名区域提高可读性**：
```css
/* ✅ 清晰 */
.container {
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

/* ❌ 不直观 */
.header {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}
```

2. **使用 `fr` 而不是百分比**：
```css
/* ✅ 推荐 */
grid-template-columns: 1fr 2fr 1fr;

/* ❌ 不推荐 */
grid-template-columns: 25% 50% 25%; /* 不考虑 gap */
```

3. **使用 `minmax()` 实现响应式**：
```css
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
```

---

## 第六部分：常见问题

### Q1: 何时使用 Flex，何时使用 Grid？

**A**:
- **简单一维布局 → Flex**（导航栏、按钮组）
- **复杂二维布局 → Grid**（页面布局、仪表板）
- **可以组合使用**

### Q2: `1fr` 和 `auto` 的区别？

**A**:
- `1fr`：按比例分配剩余空间
- `auto`：根据内容大小

```css
grid-template-columns: auto 1fr auto;
/* 两侧根据内容，中间占满剩余空间 */
```

### Q3: 如何实现完美居中？

**Flex 方式**：
```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**Grid 方式**：
```css
.container {
  display: grid;
  place-items: center; /* justify-items + align-items 的简写 */
}
```

### Q4: Grid 的隐式网格是什么？

**A**: 当项目超出显式定义的网格时，浏览器自动创建的额外行/列。

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px; /* 显式：2列 */
  grid-auto-columns: 50px; /* 隐式：额外列的宽度 */
}
```

---

## 第七部分：浏览器兼容性

### Flexbox 兼容性

- ✅ Chrome 29+
- ✅ Firefox 28+
- ✅ Safari 9+
- ✅ Edge 12+
- ⚠️ IE 11（部分支持，有 bug）

**IE 11 兼容**：
```css
.container {
  display: -ms-flexbox; /* IE 10 */
  display: flex;
}
```

### Grid 兼容性

- ✅ Chrome 57+
- ✅ Firefox 52+
- ✅ Safari 10.1+
- ✅ Edge 16+
- ⚠️ IE 11（旧语法，不推荐）

**降级方案**：
```css
.container {
  display: flex; /* 降级 */
  flex-wrap: wrap;
}

@supports (display: grid) {
  .container {
    display: grid; /* 支持 Grid 时使用 */
  }
}
```

---

## 第八部分：实用工具与资源

### 在线工具

1. **Flexbox Playground**
   - [Flexbox Froggy](https://flexboxfroggy.com/) - 游戏学习
   - [Flexbox Defense](http://www.flexboxdefense.com/) - 塔防游戏

2. **Grid Playground**
   - [Grid Garden](https://cssgridgarden.com/) - 游戏学习
   - [Grid by Example](https://gridbyexample.com/) - 示例集合

3. **可视化工具**
   - [CSS Grid Generator](https://cssgrid-generator.netlify.app/)
   - [Flexbox Generator](https://flexbox.help/)

### 调试技巧

**Chrome DevTools**：
```css
/* Grid 调试 */
.container {
  display: grid;
}
/* 在 DevTools 中点击 grid 标签查看网格线 */

/* Flex 调试 */
.container {
  display: flex;
}
/* 在 DevTools 中查看 Flexbox 图标 */
```

---

## 总结

### 核心要点

**Flexbox**：
- ✅ 一维布局，适合组件内部
- ✅ 内容驱动，灵活对齐
- ✅ 学习曲线平缓

**Grid**：
- ✅ 二维布局，适合整体页面
- ✅ 网格驱动，精确控制
- ✅ 功能强大，但较复杂

### 快速参考

**Flex 常用属性**：
```css
/* 容器 */
display: flex;
flex-direction: row | column;
justify-content: center | space-between;
align-items: center | stretch;
gap: 20px;

/* 项目 */
flex: 1;
align-self: center;
```

**Grid 常用属性**：
```css
/* 容器 */
display: grid;
grid-template-columns: repeat(3, 1fr);
grid-template-areas: "header header" "sidebar main";
gap: 20px;

/* 项目 */
grid-column: span 2;
grid-area: header;
```

---

## 参考资源

- [CSS Tricks - A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS Tricks - A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [MDN - Flexbox](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [MDN - Grid Layout](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout)
- [Grid by Example](https://gridbyexample.com/)
