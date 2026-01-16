# React PureComponent 性能优化

`PureComponent` 是 React 提供的一个优化类组件性能的基类，它通过浅比较（shallow comparison）来决定组件是否需要重新渲染。

## 一、基本概念

### 什么是 PureComponent？

`PureComponent` 会给类组件默认加一个 `shouldComponentUpdate` 生命周期函数：
- 在此周期函数中，它对**新老的属性、状态**做一个**浅比较**
- 如果经过浅比较，发现属性和状态并没有改变，则返回 `false`，不继续更新组件
- 有变化才会去更新

### 基础用法

```javascript
import React from 'react';

// 使用 PureComponent
class Demo extends React.PureComponent {
  state = {
    count: 0
  };

  render() {
    console.log('组件渲染了');
    return <div>Count: {this.state.count}</div>;
  }
}

export default Demo;
```

## 二、Component vs PureComponent

### Component（普通组件）

```javascript
import React from 'react';

class Demo extends React.Component {
  state = {
    count: 0
  };

  // 默认没有 shouldComponentUpdate
  // 每次都会重新渲染

  render() {
    console.log('组件渲染了');
    return <div>Count: {this.state.count}</div>;
  }
}

export default Demo;
```

### PureComponent（纯组件）

```javascript
import React from 'react';

class Demo extends React.PureComponent {
  state = {
    count: 0
  };

  // 自动添加了 shouldComponentUpdate
  // 会进行浅比较，决定是否重新渲染

  render() {
    console.log('组件渲染了');
    return <div>Count: {this.state.count}</div>;
  }
}

export default Demo;
```

### 等价实现

以下两种写法的内部实现是**一致的**：

```javascript
// 方式 1：使用 PureComponent
class Demo extends React.PureComponent {
  // 自动实现了 shouldComponentUpdate
}

// 方式 2：手动实现 shouldComponentUpdate
class Demo extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    const { props, state } = this;
    // props、state：修改之前的属性和状态
    // nextProps、nextState：将要修改的属性和状态

    // 浅比较 props 和 state
    return !shallowEqual(props, nextProps) || !shallowEqual(state, nextState);
  }
}
```

## 三、浅比较（Shallow Comparison）

### 什么是浅比较？

浅比较只比较对象的**第一层属性**，不会递归比较嵌套的对象。

### 浅比较的实现

```javascript
// 检测是否为对象
const isObject = function isObject(obj) {
  return obj !== null && ['object', 'function'].includes(typeof obj);
};

// 对象浅比较的方法
const shallowEqual = function shallowEqual(objA, objB) {
  // 1. 如果任意一个不是对象，则不相同
  if (!isObject(objA) || !isObject(objB)) return false;

  // 2. 如果是同一个对象（引用相同），则相同
  if (objA === objB) return true;

  // 3. 先比较成员的数量
  const keysA = Reflect.ownKeys(objA);
  const keysB = Reflect.ownKeys(objB);
  if (keysA.length !== keysB.length) return false;

  // 4. 数量一致，再逐一比较内部成员【只比较第一级：浅比较】
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];

    // 如果一个对象中有这个成员，一个没有；
    // 或者都有这个成员，但值不一样；则都为不相同
    if (!objB.hasOwnProperty(key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }

  // 5. 以上都处理完，发现没有不相同的成员，则认为两个对象是相等的
  return true;
};

export default shallowEqual;
```

### 浅比较示例

```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, b: 2 };
const obj3 = { a: 1, b: { c: 3 } };
const obj4 = { a: 1, b: { c: 3 } };

console.log(shallowEqual(obj1, obj2)); // true - 第一层属性相同
console.log(shallowEqual(obj3, obj4)); // false - 嵌套对象引用不同

const nested = { c: 3 };
const obj5 = { a: 1, b: nested };
const obj6 = { a: 1, b: nested };
console.log(shallowEqual(obj5, obj6)); // true - 引用相同
```

## 四、对比示例

### 示例 1：相同的 state 不会重新渲染

```javascript
import React from 'react';

class PureDemo extends React.PureComponent {
  state = {
    count: 0
  };

  handleClick = () => {
    // 设置相同的值
    this.setState({ count: 0 });
  };

  render() {
    console.log('PureComponent 渲染了');
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>设置为 0</button>
      </div>
    );
  }
}

class NormalDemo extends React.Component {
  state = {
    count: 0
  };

  handleClick = () => {
    // 设置相同的值
    this.setState({ count: 0 });
  };

  render() {
    console.log('Component 渲染了');
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleClick}>设置为 0</button>
      </div>
    );
  }
}

// 点击按钮：
// PureComponent：不会重新渲染（浅比较发现值相同）
// Component：会重新渲染（默认总是更新）
```

### 示例 2：嵌套对象的陷阱

```javascript
import React from 'react';

class PureDemo extends React.PureComponent {
  state = {
    user: {
      name: 'Alice',
      age: 25
    }
  };

  // ❌ 错误：直接修改嵌套对象
  handleBadUpdate = () => {
    const { user } = this.state;
    user.age = 26; // 直接修改

    this.setState({ user }); // 引用没变，不会重新渲染！
  };

  // ✅ 正确：创建新对象
  handleGoodUpdate = () => {
    this.setState({
      user: {
        ...this.state.user,
        age: 26 // 创建新对象
      }
    });
  };

  render() {
    console.log('渲染了');
    const { user } = this.state;

    return (
      <div>
        <p>Name: {user.name}</p>
        <p>Age: {user.age}</p>
        <button onClick={this.handleBadUpdate}>错误更新</button>
        <button onClick={this.handleGoodUpdate}>正确更新</button>
      </div>
    );
  }
}
```

### 示例 3：数组更新

```javascript
import React from 'react';

class TodoList extends React.PureComponent {
  state = {
    todos: ['任务 1', '任务 2']
  };

  // ❌ 错误：直接修改数组
  handleBadAdd = () => {
    const { todos } = this.state;
    todos.push('新任务'); // 直接修改

    this.setState({ todos }); // 引用没变，不会重新渲染！
  };

  // ✅ 正确：创建新数组
  handleGoodAdd = () => {
    this.setState({
      todos: [...this.state.todos, '新任务'] // 创建新数组
    });
  };

  render() {
    console.log('渲染了');

    return (
      <div>
        <ul>
          {this.state.todos.map((todo, index) => (
            <li key={index}>{todo}</li>
          ))}
        </ul>
        <button onClick={this.handleBadAdd}>错误添加</button>
        <button onClick={this.handleGoodAdd}>正确添加</button>
      </div>
    );
  }
}
```

## 五、使用场景

### 适合使用 PureComponent 的场景

```javascript
// 1. 展示型组件（只依赖 props 渲染）
class UserCard extends React.PureComponent {
  render() {
    const { name, avatar, email } = this.props;

    return (
      <div className="user-card">
        <img src={avatar} alt={name} />
        <h3>{name}</h3>
        <p>{email}</p>
      </div>
    );
  }
}

// 2. 列表项组件
class ListItem extends React.PureComponent {
  render() {
    const { item, onDelete } = this.props;

    return (
      <li>
        {item.text}
        <button onClick={() => onDelete(item.id)}>删除</button>
      </li>
    );
  }
}

// 3. 父组件频繁更新，但子组件 props 不常变化
class Parent extends React.Component {
  state = {
    parentCount: 0,
    childData: { name: 'Child' }
  };

  render() {
    return (
      <div>
        <p>父组件计数: {this.state.parentCount}</p>
        <button onClick={() => this.setState({ parentCount: this.state.parentCount + 1 })}>
          更新父组件
        </button>

        {/* 使用 PureComponent，避免不必要的重新渲染 */}
        <ChildComponent data={this.state.childData} />
      </div>
    );
  }
}

class ChildComponent extends React.PureComponent {
  render() {
    console.log('子组件渲染了');
    return <div>Child: {this.props.data.name}</div>;
  }
}
```

### 不适合使用 PureComponent 的场景

```javascript
// 1. props 或 state 频繁变化
class FrequentUpdate extends React.Component {
  state = {
    timestamp: Date.now()
  };

  componentDidMount() {
    // 每秒更新
    setInterval(() => {
      this.setState({ timestamp: Date.now() });
    }, 1000);
  }

  render() {
    return <div>时间戳: {this.state.timestamp}</div>;
  }
}

// 2. 使用了嵌套数据结构且没有正确更新
class NestedDataComponent extends React.Component {
  state = {
    data: {
      level1: {
        level2: {
          level3: 'value'
        }
      }
    }
  };

  // 如果使用 PureComponent，需要每层都创建新对象
  // 否则不如直接使用 Component
}

// 3. 组件本身渲染成本很低
class SimpleComponent extends React.Component {
  render() {
    return <div>{this.props.text}</div>;
  }
  // 渲染非常简单，PureComponent 的浅比较成本反而更高
}
```

## 六、性能优化最佳实践

### 1. 避免在 render 中创建新对象

```javascript
// ❌ 错误：每次渲染都创建新对象
class BadExample extends React.Component {
  render() {
    return (
      <ChildComponent
        style={{ color: 'red' }} // 每次都是新对象
        user={{ name: 'Alice' }}  // 每次都是新对象
        onClick={() => {}}         // 每次都是新函数
      />
    );
  }
}

// ✅ 正确：复用对象和函数
class GoodExample extends React.Component {
  style = { color: 'red' };
  user = { name: 'Alice' };

  handleClick = () => {};

  render() {
    return (
      <ChildComponent
        style={this.style}
        user={this.user}
        onClick={this.handleClick}
      />
    );
  }
}
```

### 2. 使用不可变数据

```javascript
import React from 'react';

class ImmutableExample extends React.PureComponent {
  state = {
    items: [1, 2, 3]
  };

  // ✅ 使用不可变操作
  addItem = () => {
    this.setState({
      items: [...this.state.items, 4] // 创建新数组
    });
  };

  removeItem = (index) => {
    this.setState({
      items: this.state.items.filter((_, i) => i !== index) // 创建新数组
    });
  };

  updateItem = (index, value) => {
    this.setState({
      items: this.state.items.map((item, i) =>
        i === index ? value : item
      ) // 创建新数组
    });
  };

  render() {
    return (
      <ul>
        {this.state.items.map((item, index) => (
          <li key={index}>
            {item}
            <button onClick={() => this.removeItem(index)}>删除</button>
          </li>
        ))}
        <button onClick={this.addItem}>添加</button>
      </ul>
    );
  }
}
```

### 3. 使用 Immer 简化不可变更新

```javascript
import React from 'react';
import { produce } from 'immer';

class TodoList extends React.PureComponent {
  state = {
    todos: [
      { id: 1, text: '任务 1', completed: false },
      { id: 2, text: '任务 2', completed: false }
    ]
  };

  toggleTodo = (id) => {
    this.setState(
      produce((draft) => {
        const todo = draft.todos.find((t) => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      })
    );
  };

  addTodo = (text) => {
    this.setState(
      produce((draft) => {
        draft.todos.push({
          id: Date.now(),
          text,
          completed: false
        });
      })
    );
  };

  render() {
    return (
      <ul>
        {this.state.todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => this.toggleTodo(todo.id)}
            />
            {todo.text}
          </li>
        ))}
      </ul>
    );
  }
}
```

## 七、函数组件的对应方案：React.memo

在函数组件中，`React.memo` 等价于 `PureComponent`。

### 基础用法

```javascript
import React, { memo } from 'react';

// 普通函数组件：每次父组件更新都会重新渲染
function NormalComponent({ count }) {
  console.log('普通组件渲染了');
  return <div>Count: {count}</div>;
}

// 使用 memo：只在 props 变化时重新渲染
const MemoComponent = memo(function MemoComponent({ count }) {
  console.log('Memo 组件渲染了');
  return <div>Count: {count}</div>;
});

// 父组件
function Parent() {
  const [parentCount, setParentCount] = React.useState(0);
  const [childCount, setChildCount] = React.useState(0);

  return (
    <div>
      <p>父组件计数: {parentCount}</p>
      <button onClick={() => setParentCount(parentCount + 1)}>
        更新父组件
      </button>

      <NormalComponent count={childCount} />
      <MemoComponent count={childCount} />

      {/* 点击"更新父组件"：
          - NormalComponent 会重新渲染
          - MemoComponent 不会重新渲染（props 没变）
      */}
    </div>
  );
}
```

### 自定义比较函数

```javascript
import React, { memo } from 'react';

// 自定义比较函数
const MemoComponent = memo(
  function MemoComponent({ user }) {
    console.log('渲染了');
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // 返回 true：不重新渲染
    // 返回 false：重新渲染
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### PureComponent vs React.memo 对比

| 特性 | PureComponent | React.memo |
|------|---------------|-----------|
| 适用组件 | 类组件 | 函数组件 |
| 比较方式 | 浅比较 props 和 state | 浅比较 props |
| 自定义比较 | 需要重写 `shouldComponentUpdate` | 传递第二个参数 |
| 性能 | 相同 | 相同 |
| 使用难度 | 简单 | 简单 |

## 八、性能监控

### 使用 React DevTools Profiler

```javascript
import React, { Profiler } from 'react';

class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.data}</div>;
  }
}

function App() {
  const onRenderCallback = (
    id, // 发生提交的 Profiler 树的 "id"
    phase, // "mount" 或 "update"
    actualDuration, // 本次更新在渲染 Profiler 和它的子代上花费的时间
    baseDuration, // 不使用优化的情况下渲染整个子树需要的时间
    startTime, // 本次更新中 React 开始渲染的时间
    commitTime, // 本次更新中 React committed 的时间
    interactions // 属于本次更新的 interactions 的集合
  ) => {
    console.log(`${id} (${phase}) 渲染时间: ${actualDuration}ms`);
  };

  return (
    <Profiler id="MyComponent" onRender={onRenderCallback}>
      <MyComponent data="test" />
    </Profiler>
  );
}
```

## 九、常见错误

### 错误 1：直接修改 state

```javascript
// ❌ 错误
class BadExample extends React.PureComponent {
  state = {
    user: { name: 'Alice' }
  };

  handleClick = () => {
    this.state.user.name = 'Bob'; // 直接修改
    this.setState({ user: this.state.user }); // 不会更新
  };
}

// ✅ 正确
class GoodExample extends React.PureComponent {
  state = {
    user: { name: 'Alice' }
  };

  handleClick = () => {
    this.setState({
      user: { ...this.state.user, name: 'Bob' } // 创建新对象
    });
  };
}
```

### 错误 2：在 render 中绑定函数

```javascript
// ❌ 错误
class BadExample extends React.PureComponent {
  render() {
    return (
      <ChildComponent
        onClick={() => this.handleClick()} // 每次都是新函数
      />
    );
  }
}

// ✅ 正确
class GoodExample extends React.PureComponent {
  handleClick = () => {
    // ...
  };

  render() {
    return <ChildComponent onClick={this.handleClick} />;
  }
}
```

### 错误 3：传递内联对象

```javascript
// ❌ 错误
class BadExample extends React.PureComponent {
  render() {
    return (
      <ChildComponent
        style={{ margin: 10 }} // 每次都是新对象
        config={{ theme: 'dark' }} // 每次都是新对象
      />
    );
  }
}

// ✅ 正确
class GoodExample extends React.PureComponent {
  style = { margin: 10 };
  config = { theme: 'dark' };

  render() {
    return <ChildComponent style={this.style} config={this.config} />;
  }
}
```

## 十、总结

### 核心要点

1. **自动优化**：
   - `PureComponent` 自动实现 `shouldComponentUpdate`
   - 通过浅比较决定是否重新渲染

2. **浅比较**：
   - 只比较对象的第一层属性
   - 嵌套对象需要创建新引用

3. **不可变数据**：
   - 使用扩展运算符创建新对象/数组
   - 避免直接修改 state

4. **函数组件**：
   - 使用 `React.memo` 实现相同效果

### 使用建议

**✅ 适合使用 PureComponent**：
- 展示型组件
- props 和 state 不频繁变化
- 父组件频繁更新，但子组件 props 稳定
- 列表项组件

**❌ 不适合使用 PureComponent**：
- props 或 state 频繁变化
- 使用复杂嵌套数据且没有正确更新
- 组件渲染成本很低
- 需要每次都重新渲染的组件

### 快速决策

```
需要性能优化？
├─ 类组件
│   ├─ props/state 简单且不常变 → PureComponent ✅
│   └─ props/state 复杂或频繁变 → Component + 手动优化
│
├─ 函数组件
│   ├─ props 简单且不常变 → React.memo ✅
│   └─ props 复杂或频繁变 → 普通组件 + useMemo/useCallback
│
└─ 使用不可变数据
    ├─ 手动创建新对象/数组 ✅
    └─ 使用 Immer 简化更新 ✅
```

### 最佳实践

1. **优先使用 PureComponent**：除非有明确理由不用
2. **保持数据不可变**：始终创建新对象/数组
3. **避免内联对象**：复用对象和函数
4. **配合 React DevTools**：监控性能
5. **函数组件使用 memo**：配合 useCallback、useMemo

`PureComponent` 是 React 性能优化的重要工具，正确使用可以显著提升应用性能，但也要注意避免常见陷阱，特别是数据不可变性的问题。
