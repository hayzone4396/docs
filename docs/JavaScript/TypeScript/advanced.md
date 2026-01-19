---
title: TypeScript 进阶
date: 2026-01-14
categories:
  - TypeScript
---

# TypeScript 进阶

## 1. 泛型

编写可重用的组件。

```typescript
function identity<T>(arg: T): T {
  return arg;
}

// 使用
let output = identity<string>('myString');
```

## 2. 高级类型

### 联合类型

```typescript
type StringOrNumber = string | number;
```

### 交叉类型

```typescript
type Combined = TypeA & TypeB;
```

### 映射类型

```typescript
type ReadonlyType<T> = {
  readonly [P in keyof T]: T[P];
};
```

## 3. 工具类型

### Partial&lt;T&gt;

将所有属性变为可选。

### Required&lt;T&gt;

将所有属性变为必选。

### Pick&lt;T, K&gt;

挑选指定属性。

### Omit&lt;T, K&gt;

排除指定属性。

## 4. 装饰器

用于类、方法、属性的元编程。

```typescript
function log(target: any, propertyKey: string) {
  // 装饰器逻辑
}
```
