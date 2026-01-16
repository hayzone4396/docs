# 移动端点击事件 300ms 延迟问题

## 问题背景

### 类型区别

- **移动端的 click**：单击事件
- **PC 端的 click**：点击事件

### 单击事件机制

单击事件：第一次点击后，监测 300ms，看是否有第二次点击操作，如果没有就是单击，如果有就是双击。

### 连续点击两下的行为差异

- **PC 端会触发**：
  - 两次 `click` 事件
  - 一次 `dblclick` 事件

- **移动端会触发**：
  - 不会触发 `click` 事件
  - 只会触发 `dblclick` 事件

## 解决移动端 300ms 延迟问题

### 方法 1：使用 FastClick 插件

利用 FastClick 插件来消除延迟。

在入口文件中：

```javascript
import FastClick from 'fastclick';
FastClick.attach(document.body);
```

**优点**：
- 后期就可以使用 `click` 点击事件了
- 无需使用 `touch` 相关事件模拟并处理

### 方法 2：手动实现 Touch 事件处理

通过监听触摸事件来区分点击和移动。

**实现步骤**：

1. 在点击按钮上绑定 `touchStart`、`touchMove`、`touchEnd` 三个事件
2. 在 `touchStart` 中记录点击坐标
3. 在 `touchMove` 中获取当前坐标，并与记录的坐标做差值
   - 如果大于 10，则标记一个状态为 `true`（表示移动）
   - 否则为 `false`（表示点击）
4. 在 `touchEnd` 中获取标记状态
   - `true` 为移动事件
   - `false` 为点击事件

**示例代码**：

```javascript
let startX = 0;
let startY = 0;
let isMove = false;

const button = document.querySelector('#myButton');

button.addEventListener('touchstart', (e) => {
  startX = e.touches[0].pageX;
  startY = e.touches[0].pageY;
  isMove = false;
});

button.addEventListener('touchmove', (e) => {
  const moveX = e.touches[0].pageX;
  const moveY = e.touches[0].pageY;

  const diffX = Math.abs(moveX - startX);
  const diffY = Math.abs(moveY - startY);

  if (diffX > 10 || diffY > 10) {
    isMove = true;
  }
});

button.addEventListener('touchend', (e) => {
  if (!isMove) {
    // 这是点击事件
    console.log('点击了按钮');
    // 执行点击逻辑
  }
});
```

### 方法 3：使用 CSS 禁用延迟（现代浏览器）

```css
* {
  touch-action: manipulation;
}
```

这个 CSS 属性可以禁用双击缩放，从而消除 300ms 延迟。

## 总结

- **推荐方案**：在现代移动端开发中，优先使用 CSS 的 `touch-action: manipulation` 属性
- **兼容性方案**：需要支持老旧设备时，可以使用 FastClick 插件
- **自定义方案**：需要精细控制触摸行为时，可以手动实现 Touch 事件处理
