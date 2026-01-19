---
title: 箭头函数与普通函数的区别
date: 2026-01-19 17:44:00
tags:
  - 函数
  - 箭头函数
  - Function
categories:
  - JavaScript
---

# 箭头函数与普通函数的区别

## 一、语法差异

### 普通函数
```javascript
function add(a, b) {
  return a + b;
}

const multiply = function(a, b) {
  return a * b;
};
```

### 箭头函数
```javascript
const add = (a, b) => a + b;

const multiply = (a, b) => {
  return a * b;
};
```

## 二、核心区别

### 1. this 指向

**普通函数**：`this` 指向调用该函数的对象，运行时动态确定。

```javascript
const obj = {
  name: '张三',
  sayName: function() {
    console.log(this.name); // '张三'
  }
};
obj.sayName();
```

**箭头函数**：没有自己的 `this`，继承外层作用域的 `this`，定义时确定。

```javascript
const obj = {
  name: '张三',
  sayName: () => {
    console.log(this.name); // undefined（继承全局作用域）
  }
};
obj.sayName();
```

### 2. arguments 对象

**普通函数**：拥有 `arguments` 对象，可以访问所有传入的参数。

```javascript
function sum() {
  console.log(arguments); // [1, 2, 3, 4]
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10
```

**箭头函数**：没有 `arguments` 对象，但可以使用剩余参数（rest parameters）。

```javascript
const sum = (...args) => {
  console.log(args); // [1, 2, 3, 4]
  return args.reduce((a, b) => a + b, 0);
};
sum(1, 2, 3, 4); // 10
```

### 3. 构造函数

**普通函数**：可以作为构造函数使用 `new` 关键字调用。

```javascript
function Person(name) {
  this.name = name;
}
const person = new Person('李四'); // 正常工作
```

**箭头函数**：不能作为构造函数，使用 `new` 会报错。

```javascript
const Person = (name) => {
  this.name = name;
};
const person = new Person('李四'); // TypeError: Person is not a constructor
```

### 4. prototype 属性

**普通函数**：拥有 `prototype` 属性。

```javascript
function foo() {}
console.log(foo.prototype); // {constructor: ƒ}
```

**箭头函数**：没有 `prototype` 属性。

```javascript
const foo = () => {};
console.log(foo.prototype); // undefined
```

### 5. 使用 call/apply/bind

**普通函数**：可以通过 `call`、`apply`、`bind` 改变 `this` 指向。

```javascript
function greet() {
  console.log(this.name);
}
const obj = { name: '王五' };
greet.call(obj); // '王五'
```

**箭头函数**：无法通过 `call`、`apply`、`bind` 改变 `this` 指向（始终继承外层）。

```javascript
const greet = () => {
  console.log(this.name);
};
const obj = { name: '王五' };
greet.call(obj); // undefined（this 依然指向外层作用域）
```

### 6. yield 关键字

**普通函数**：可以用作 Generator 函数。

```javascript
function* generator() {
  yield 1;
  yield 2;
}
```

**箭头函数**：不能用作 Generator 函数。

## 三、使用场景

### 适合使用箭头函数的场景

1. **数组方法回调**
```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
```

2. **需要保持外层 this 的场景**
```javascript
class Counter {
  constructor() {
    this.count = 0;
  }

  start() {
    setInterval(() => {
      this.count++; // 箭头函数继承 start 方法的 this
      console.log(this.count);
    }, 1000);
  }
}
```

3. **简洁的单行函数**
```javascript
const square = x => x * x;
const greet = name => `Hello, ${name}!`;
```

### 适合使用普通函数的场景

1. **对象方法**
```javascript
const person = {
  name: '赵六',
  sayHi: function() {
    console.log(`Hi, I'm ${this.name}`);
  }
};
```

2. **需要使用 arguments 的函数**
```javascript
function sum() {
  return Array.from(arguments).reduce((a, b) => a + b, 0);
}
```

3. **构造函数**
```javascript
function Animal(name) {
  this.name = name;
}
```

4. **需要动态 this 的场景**
```javascript
const button = document.querySelector('button');
button.addEventListener('click', function() {
  this.classList.toggle('active'); // this 指向 button 元素
});
```

## 四、总结对比表

| 特性 | 普通函数 | 箭头函数 |
|------|---------|---------|
| this 指向 | 动态，指向调用者 | 静态，继承外层作用域 |
| arguments | 有 | 无（可用 rest 参数） |
| 构造函数 | 可以 | 不可以 |
| prototype | 有 | 无 |
| call/apply/bind | 可改变 this | 无法改变 this |
| Generator | 可以 | 不可以 |
| 语法 | 较繁琐 | 简洁 |
| 使用场景 | 对象方法、构造函数 | 回调函数、简短函数 |
