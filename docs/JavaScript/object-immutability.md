# JavaScript 对象不可变性规则

在 JavaScript 中，我们可以通过不同的方法来限制对象的可变性，从而提高代码的安全性和可预测性。主要有三种级别：冻结（Freeze）、密封（Seal）和不可扩展（Prevent Extensions）。

## 一、冻结对象（Freeze）

### 基本用法

```javascript
const obj = { name: 'John', age: 30 };

// 冻结对象
Object.freeze(obj);

// 检测是否被冻结
console.log(Object.isFrozen(obj)); // true
```

### 冻结对象的特性

被冻结的对象具有以下限制：

- ❌ **不能修改**成员的值
- ❌ **不能新增**成员
- ❌ **不能删除**现有成员
- ❌ **不能劫持**成员（不能使用 `Object.defineProperty`）

### 代码示例

```javascript
const user = {
  name: 'Alice',
  age: 25,
  address: {
    city: 'Beijing'
  }
};

Object.freeze(user);

// 尝试修改属性（静默失败，严格模式下报错）
user.name = 'Bob';
console.log(user.name); // 'Alice' - 修改失败

// 尝试新增属性
user.email = 'alice@example.com';
console.log(user.email); // undefined - 新增失败

// 尝试删除属性
delete user.age;
console.log(user.age); // 25 - 删除失败

// 尝试劫持属性
Object.defineProperty(user, 'name', {
  get() { return 'Bob'; }
}); // TypeError: Cannot redefine property
```

### 注意：浅冻结

`Object.freeze()` 是**浅冻结**，只冻结对象的第一层属性。

```javascript
const user = {
  name: 'Alice',
  address: {
    city: 'Beijing'
  }
};

Object.freeze(user);

// 第一层属性无法修改
user.name = 'Bob'; // 失败

// 但嵌套对象可以修改
user.address.city = 'Shanghai'; // 成功
console.log(user.address.city); // 'Shanghai'
```

### 深度冻结实现

```javascript
function deepFreeze(obj) {
  // 获取对象的所有属性名
  Object.getOwnPropertyNames(obj).forEach(name => {
    const prop = obj[name];

    // 如果属性值是对象，递归冻结
    if (typeof prop === 'object' && prop !== null) {
      deepFreeze(prop);
    }
  });

  // 冻结当前对象
  return Object.freeze(obj);
}

const user = {
  name: 'Alice',
  address: { city: 'Beijing' }
};

deepFreeze(user);

user.address.city = 'Shanghai'; // 失败
console.log(user.address.city); // 'Beijing'
```

## 二、密封对象（Seal）

### 基本用法

```javascript
const obj = { name: 'John', age: 30 };

// 密封对象
Object.seal(obj);

// 检测是否被密封
console.log(Object.isSealed(obj)); // true
```

### 密封对象的特性

被密封的对象具有以下限制：

- ✅ **可以修改**成员的值
- ❌ **不能新增**成员
- ❌ **不能删除**现有成员
- ❌ **不能劫持**成员

### 代码示例

```javascript
const product = {
  name: 'Laptop',
  price: 5000
};

Object.seal(product);

// 可以修改属性值
product.price = 4500;
console.log(product.price); // 4500 - 修改成功

// 不能新增属性
product.brand = 'Dell';
console.log(product.brand); // undefined - 新增失败

// 不能删除属性
delete product.name;
console.log(product.name); // 'Laptop' - 删除失败

// 不能修改属性特性
Object.defineProperty(product, 'price', {
  writable: false
}); // TypeError: Cannot redefine property
```

## 三、不可扩展对象（Prevent Extensions）

### 基本用法

```javascript
const obj = { name: 'John', age: 30 };

// 设置为不可扩展
Object.preventExtensions(obj);

// 检测是否可扩展
console.log(Object.isExtensible(obj)); // false
```

### 不可扩展对象的特性

被设置为不可扩展的对象具有以下限制：

- ✅ **可以修改**成员的值
- ❌ **不能新增**成员
- ✅ **可以删除**现有成员
- ✅ **可以劫持**成员

### 代码示例

```javascript
const config = {
  theme: 'dark',
  language: 'zh-CN'
};

Object.preventExtensions(config);

// 可以修改属性值
config.theme = 'light';
console.log(config.theme); // 'light' - 修改成功

// 不能新增属性
config.fontSize = 14;
console.log(config.fontSize); // undefined - 新增失败

// 可以删除属性
delete config.language;
console.log(config.language); // undefined - 删除成功

// 可以修改属性特性
Object.defineProperty(config, 'theme', {
  writable: false
});
config.theme = 'dark';
console.log(config.theme); // 'light' - 被保护，修改失败
```

## 四、三种方式对比

| 特性 | Freeze（冻结） | Seal（密封） | Prevent Extensions（不可扩展） |
|------|----------------|--------------|-------------------------------|
| 修改属性值 | ❌ | ✅ | ✅ |
| 新增属性 | ❌ | ❌ | ❌ |
| 删除属性 | ❌ | ❌ | ✅ |
| 修改属性特性 | ❌ | ❌ | ✅ |
| 严格程度 | 最严格 | 中等 | 最宽松 |

### 关系说明

```javascript
// 被冻结的对象，一定是密封的，也是不可扩展的
const obj1 = { a: 1 };
Object.freeze(obj1);

console.log(Object.isFrozen(obj1));      // true
console.log(Object.isSealed(obj1));       // true
console.log(Object.isExtensible(obj1));   // false

// 被密封的对象，一定是不可扩展的，但不一定是冻结的
const obj2 = { a: 1 };
Object.seal(obj2);

console.log(Object.isFrozen(obj2));      // false
console.log(Object.isSealed(obj2));       // true
console.log(Object.isExtensible(obj2));   // false

// 不可扩展的对象，不一定是密封的，也不一定是冻结的
const obj3 = { a: 1 };
Object.preventExtensions(obj3);

console.log(Object.isFrozen(obj3));      // false
console.log(Object.isSealed(obj3));       // false
console.log(Object.isExtensible(obj3));   // false
```

## 五、使用场景

### 1. 冻结对象（Object.freeze）

适用于需要完全不可变的常量对象：

```javascript
// 配置常量
const CONFIG = Object.freeze({
  API_URL: 'https://api.example.com',
  TIMEOUT: 5000,
  MAX_RETRY: 3
});

// 枚举值
const STATUS = Object.freeze({
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed'
});
```

### 2. 密封对象（Object.seal）

适用于需要固定属性结构，但允许修改值的场景：

```javascript
// 用户表单数据
const formData = Object.seal({
  username: '',
  email: '',
  password: ''
});

// 可以修改值
formData.username = 'john';
formData.email = 'john@example.com';

// 但不能添加新字段
formData.age = 25; // 无效
```

### 3. 不可扩展（Object.preventExtensions）

适用于防止意外添加属性，但允许其他操作：

```javascript
// 防止原型污染
const options = {
  theme: 'dark',
  language: 'zh'
};

Object.preventExtensions(options);

// 防止意外添加新属性
options.__proto__ = null; // 无效
options.newProp = 'value'; // 无效
```

## 六、严格模式下的行为

在严格模式下，违反不可变规则的操作会抛出错误：

```javascript
'use strict';

const obj = Object.freeze({ a: 1 });

obj.a = 2; // TypeError: Cannot assign to read only property 'a'
obj.b = 3; // TypeError: Cannot add property b, object is not extensible
delete obj.a; // TypeError: Cannot delete property 'a'
```

## 七、性能考虑

- 冻结、密封和不可扩展操作是**不可逆**的
- 这些操作对性能影响较小
- 适合在开发阶段使用，帮助发现潜在的错误
- 在生产环境中，可以根据实际需求选择性使用

## 总结

- **Object.freeze()**：完全冻结对象，不可修改、不可新增、不可删除
- **Object.seal()**：密封对象，可修改值，但不可新增或删除属性
- **Object.preventExtensions()**：防止扩展，只禁止新增属性，其他操作均可
- 冻结 ⊂ 密封 ⊂ 不可扩展（严格程度递减）
- 这些方法都是浅层操作，需要深度不可变需要递归处理
