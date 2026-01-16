# React 高阶组件（HOC）详解

React 高阶组件（Higher-Order Component，简称 HOC）是 React 中复用组件逻辑的一种高级技巧。HOC 本质上是一个函数，它接收一个组件作为参数，并返回一个新的组件。

## 一、什么是高阶组件

### 概念

高阶组件是利用 JavaScript 中的**闭包**和**柯里化函数**实现的组件代理模式。

```javascript
// HOC 的基本形式
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```

**特点**：
- 📦 HOC 是一个函数，不是组件
- 🔄 接收组件作为参数，返回新组件
- 🎯 用于复用组件逻辑
- 💡 不修改原组件，而是通过组合方式增强功能

### 基本示例

#### 父组件 App.js

```javascript
import React from 'react';
import Demo from './Demo';

const App = function App() {
  return (
    <div>
      <Demo x={10} y={20} enable={true} />
    </div>
  );
};

export default App;
```

#### 子组件 Demo.js

```javascript
import React from 'react';

// 原始组件
const Demo = function Demo(props) {
  console.log('Demo 中的属性：', props);
  return <div>我是 Demo</div>;
};

// 高阶组件：接收一个组件，返回一个新组件
const ProxyTest = function ProxyTest(Component) {
  // Component --> Demo
  return function HOC(props) {
    // props => {x: 10, y: 20, enable: true}
    // 真实要渲染的是 Demo 组件，把获取的 props 传递给 Demo
    return <Component {...props} />;
  };
};

// 导出增强后的组件
export default ProxyTest(Demo);

// 当前案例中，我们导出的是 HOC（Higher-Order Component）
// App 导入的实际是包装后的组件，而不是原始的 Demo
```

## 二、高阶组件的两种实现方式

### 1. 属性代理（Props Proxy）

通过包裹原组件来操作 props。

```javascript
// 基础属性代理
function withPropsProxy(WrappedComponent) {
  return function EnhancedComponent(props) {
    // 可以对 props 进行操作
    const newProps = {
      ...props,
      injectedProp: 'injected value'
    };

    return <WrappedComponent {...newProps} />;
  };
}

// 使用 class 实现
function withPropsProxy(WrappedComponent) {
  return class extends React.Component {
    render() {
      const newProps = {
        ...this.props,
        injectedProp: 'injected value'
      };

      return <WrappedComponent {...newProps} />;
    }
  };
}
```

**属性代理可以做什么？**

- ✅ 操作 props
- ✅ 通过 refs 访问组件实例
- ✅ 提取 state
- ✅ 包装组件（添加样式、布局等）

#### 示例：添加额外的 props

```javascript
function withUser(WrappedComponent) {
  return function EnhancedComponent(props) {
    const user = {
      name: 'zhangsan',
      age: 25,
      role: 'admin'
    };

    return <WrappedComponent {...props} user={user} />;
  };
}

// 使用
const ProfileWithUser = withUser(Profile);

function Profile({ user, ...otherProps }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>年龄: {user.age}</p>
      <p>角色: {user.role}</p>
    </div>
  );
}
```

### 2. 反向继承（Inheritance Inversion）

通过继承原组件来实现。

```javascript
function withInheritance(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      // 可以访问原组件的 state、props、生命周期等
      return super.render();
    }
  };
}
```

**反向继承可以做什么？**

- ✅ 渲染劫持（控制渲染输出）
- ✅ 操作 state
- ✅ 访问生命周期方法

#### 示例：渲染劫持

```javascript
function withConditionalRender(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      if (this.props.isLoading) {
        return <div>加载中...</div>;
      }

      // 调用原组件的 render
      return super.render();
    }
  };
}

// 使用
class UserList extends React.Component {
  render() {
    return (
      <ul>
        {this.props.users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    );
  }
}

const EnhancedUserList = withConditionalRender(UserList);
```

## 三、实战场景

### 场景 1：权限控制

```javascript
// 权限控制 HOC
function withAuth(requiredRole) {
  return function (WrappedComponent) {
    return function AuthComponent(props) {
      const { user } = props;

      // 检查用户权限
      if (!user) {
        return <div>请先登录</div>;
      }

      if (requiredRole && user.role !== requiredRole) {
        return <div>没有权限访问</div>;
      }

      return <WrappedComponent {...props} />;
    };
  };
}

// 使用
const AdminPanel = function AdminPanel(props) {
  return <div>管理员面板</div>;
};

export default withAuth('admin')(AdminPanel);

// 在父组件中
<AdminPanel user={{ name: 'zhangsan', role: 'admin' }} />
```

### 场景 2：数据获取

```javascript
// 数据获取 HOC
function withDataFetching(url) {
  return function (WrappedComponent) {
    return class extends React.Component {
      state = {
        data: null,
        loading: true,
        error: null
      };

      componentDidMount() {
        this.fetchData();
      }

      fetchData = async () => {
        try {
          const response = await fetch(url);
          const data = await response.json();
          this.setState({ data, loading: false });
        } catch (error) {
          this.setState({ error: error.message, loading: false });
        }
      };

      render() {
        const { data, loading, error } = this.state;

        if (loading) return <div>加载中...</div>;
        if (error) return <div>错误: {error}</div>;

        return <WrappedComponent {...this.props} data={data} />;
      }
    };
  };
}

// 使用
function UserList({ data }) {
  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default withDataFetching('https://api.example.com/users')(UserList);
```

### 场景 3：性能优化（React.memo 的手动实现）

```javascript
// 浅比较 HOC
function withMemo(WrappedComponent) {
  return class extends React.Component {
    shouldComponentUpdate(nextProps) {
      // 浅比较 props
      return !shallowEqual(this.props, nextProps);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

// 浅比较函数
function shallowEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every((key) => obj1[key] === obj2[key]);
}

// 使用
const MemoizedComponent = withMemo(ExpensiveComponent);
```

### 场景 4：日志记录

```javascript
// 日志 HOC
function withLogger(WrappedComponent) {
  return class extends React.Component {
    componentDidMount() {
      console.log(`${WrappedComponent.name} mounted`, this.props);
    }

    componentDidUpdate(prevProps) {
      console.log(`${WrappedComponent.name} updated`, {
        prevProps,
        currentProps: this.props
      });
    }

    componentWillUnmount() {
      console.log(`${WrappedComponent.name} will unmount`);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

// 使用
const LoggedComponent = withLogger(MyComponent);
```

### 场景 5：样式增强

```javascript
// 样式容器 HOC
function withContainer(WrappedComponent) {
  return function ContainerComponent(props) {
    return (
      <div
        style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <WrappedComponent {...props} />
      </div>
    );
  };
}

// 使用
const CardContent = ({ title, content }) => (
  <div>
    <h3>{title}</h3>
    <p>{content}</p>
  </div>
);

export default withContainer(CardContent);
```

## 四、获取被包装组件实例

### 类组件：通过 ref 获取实例

```javascript
const ProxyForm = function ProxyForm(Component) {
  return class HOC extends React.Component {
    componentInstance = null;

    getComponentInstance = (instance) => {
      this.componentInstance = instance;
      return instance;
    };

    render() {
      return (
        <Component
          ref={this.getComponentInstance}
          {...this.props}
          user={{ name: 'zhangsan', age: 25 }}
        />
      );
    }
  };
};

export default ProxyForm(FormEdit);

// FormEdit 类组件
class FormEdit extends React.Component {
  state = {
    value: ''
  };

  getValue = () => {
    return this.state.value;
  };

  render() {
    const { user } = this.props;
    return (
      <div>
        <h3>{user.name}</h3>
        <input
          value={this.state.value}
          onChange={(e) => this.setState({ value: e.target.value })}
        />
      </div>
    );
  }
}

// 父组件中使用
class App extends React.Component {
  formRef = React.createRef();

  handleClick = () => {
    // 访问被包装组件的实例
    console.log(this.formRef.current.componentInstance.getValue());
  };

  render() {
    return (
      <div>
        <FormEdit ref={this.formRef} />
        <button onClick={this.handleClick}>获取值</button>
      </div>
    );
  }
}
```

### 函数组件：使用 forwardRef

```javascript
import { forwardRef, useImperativeHandle, useRef } from 'react';

// HOC 使用 forwardRef
function withProxyRef(Component) {
  const HOC = forwardRef((props, ref) => {
    const innerRef = useRef();

    // 将内部 ref 暴露给外部
    useImperativeHandle(ref, () => innerRef.current);

    return <Component {...props} ref={innerRef} />;
  });

  HOC.displayName = `withProxyRef(${Component.displayName || Component.name})`;

  return HOC;
}

// 函数组件使用 forwardRef
const FormEdit = forwardRef((props, ref) => {
  const [value, setValue] = useState('');

  useImperativeHandle(ref, () => ({
    getValue: () => value,
    setValue: (v) => setValue(v)
  }));

  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  );
});

const EnhancedFormEdit = withProxyRef(FormEdit);

// 使用
function App() {
  const formRef = useRef();

  const handleClick = () => {
    console.log(formRef.current.getValue());
  };

  return (
    <div>
      <EnhancedFormEdit ref={formRef} />
      <button onClick={handleClick}>获取值</button>
    </div>
  );
}
```

**注意**：如果函数组件需要通过 `forwardRef` 和 `useImperativeHandle` 来暴露实例方法，那么使用高阶组件的意义就不大了，建议直接使用自定义 Hooks。

## 五、组合多个 HOC

### 基础组合

```javascript
// 多个 HOC 的组合
const EnhancedComponent = withAuth('admin')(
  withDataFetching('/api/users')(
    withLogger(
      MyComponent
    )
  )
);

// 使用 compose 函数简化
function compose(...funcs) {
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

const enhance = compose(
  withAuth('admin'),
  withDataFetching('/api/users'),
  withLogger
);

const EnhancedComponent = enhance(MyComponent);
```

### 使用 Redux 的 compose

```javascript
import { compose } from 'redux';

const enhance = compose(
  withAuth('admin'),
  withDataFetching('/api/users'),
  withLogger,
  withContainer
);

export default enhance(MyComponent);
```

### 自定义 pipe 函数（从左到右）

```javascript
function pipe(...funcs) {
  return funcs.reduceRight((a, b) => (...args) => b(a(...args)));
}

// 从左到右执行
const enhance = pipe(
  withLogger,
  withDataFetching('/api/users'),
  withAuth('admin')
);

const EnhancedComponent = enhance(MyComponent);
```

## 六、最佳实践

### 1. 不要在 render 中使用 HOC

```javascript
// ❌ 错误：在 render 中使用 HOC
class App extends React.Component {
  render() {
    // 每次渲染都会创建新组件，导致性能问题
    const EnhancedComponent = withAuth(MyComponent);
    return <EnhancedComponent />;
  }
}

// ✅ 正确：在组件外部使用 HOC
const EnhancedComponent = withAuth(MyComponent);

class App extends React.Component {
  render() {
    return <EnhancedComponent />;
  }
}
```

### 2. 复制静态方法

```javascript
import hoistNonReactStatics from 'hoist-non-react-statics';

function withEnhancement(WrappedComponent) {
  class HOC extends React.Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  // 复制静态方法
  hoistNonReactStatics(HOC, WrappedComponent);

  return HOC;
}

// 或者手动复制
function withEnhancement(WrappedComponent) {
  class HOC extends React.Component {
    static staticMethod = WrappedComponent.staticMethod;

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  return HOC;
}
```

### 3. 传递 refs

```javascript
import { forwardRef } from 'react';

function withEnhancement(Component) {
  const HOC = forwardRef((props, ref) => {
    return <Component {...props} forwardedRef={ref} />;
  });

  HOC.displayName = `withEnhancement(${Component.displayName || Component.name})`;

  return HOC;
}
```

### 4. 设置 displayName

```javascript
function withEnhancement(WrappedComponent) {
  class HOC extends React.Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  // 设置 displayName，方便调试
  HOC.displayName = `withEnhancement(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return HOC;
}
```

### 5. 不要修改原组件

```javascript
// ❌ 错误：修改原组件
function withEnhancement(WrappedComponent) {
  WrappedComponent.prototype.componentDidUpdate = function () {
    // 修改了原组件
  };
  return WrappedComponent;
}

// ✅ 正确：返回新组件
function withEnhancement(WrappedComponent) {
  return class extends React.Component {
    componentDidUpdate() {
      // 在新组件中添加逻辑
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}
```

## 七、TypeScript 中的 HOC

### 基础类型定义

```typescript
import React, { ComponentType } from 'react';

// HOC 的类型定义
type HOC<InjectedProps, OriginalProps = {}> = (
  Component: ComponentType<OriginalProps & InjectedProps>
) => ComponentType<OriginalProps>;

// 示例：注入 user 属性
interface InjectedUserProps {
  user: {
    name: string;
    age: number;
  };
}

const withUser: HOC<InjectedUserProps> = (WrappedComponent) => {
  return function EnhancedComponent(props) {
    const user = { name: 'zhangsan', age: 25 };
    return <WrappedComponent {...props} user={user} />;
  };
};

// 使用
interface ProfileProps extends InjectedUserProps {
  title: string;
}

const Profile: React.FC<ProfileProps> = ({ user, title }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{user.name}</p>
    </div>
  );
};

const EnhancedProfile = withUser(Profile);
```

### 完整的 TypeScript 示例

```typescript
import React, { ComponentType } from 'react';

// 注入的 props 类型
interface WithLoadingProps {
  loading: boolean;
}

// HOC 函数类型
function withLoading<P extends object>(
  Component: ComponentType<P>
): ComponentType<P & WithLoadingProps> {
  return function WithLoadingComponent({ loading, ...props }: WithLoadingProps) {
    if (loading) {
      return <div>Loading...</div>;
    }

    return <Component {...(props as P)} />;
  };
}

// 使用
interface UserListProps {
  users: Array<{ id: number; name: string }>;
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};

const UserListWithLoading = withLoading(UserList);

// 在父组件中使用
<UserListWithLoading
  loading={false}
  users={[{ id: 1, name: 'Alice' }]}
/>
```

## 八、HOC vs Hooks

### 对比

| 特性 | HOC | Hooks |
|------|-----|-------|
| 复用逻辑 | ✅ 通过组件包装 | ✅ 通过自定义 Hook |
| 嵌套层级 | ❌ 多个 HOC 会增加嵌套 | ✅ 扁平化 |
| 调试 | ❌ 较难，组件树复杂 | ✅ 简单 |
| props 来源 | ❌ 不明确 | ✅ 明确 |
| 命名冲突 | ❌ 可能冲突 | ✅ 不会冲突 |
| TypeScript | ❌ 类型定义复杂 | ✅ 类型友好 |
| 学习曲线 | 高 | 中 |

### HOC 示例

```javascript
const EnhancedComponent = withAuth(
  withDataFetching(
    withLogger(
      MyComponent
    )
  )
);

// 组件树变得复杂
<WithAuth>
  <WithDataFetching>
    <WithLogger>
      <MyComponent />
    </WithLogger>
  </WithDataFetching>
</WithAuth>
```

### Hooks 替代方案

```javascript
import { useAuth } from './hooks/useAuth';
import { useDataFetching } from './hooks/useDataFetching';
import { useLogger } from './hooks/useLogger';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  const { data, loading, error } = useDataFetching('/api/users');
  useLogger('MyComponent');

  if (!isAuthenticated) return <div>请登录</div>;
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <UserList data={data} />
    </div>
  );
}

// 更清晰，没有额外的组件嵌套
```

### 何时使用 HOC？

**✅ 适合使用 HOC**：
- 需要包装多个组件使用相同的逻辑
- 需要修改组件树结构（添加包装元素）
- 在类组件中复用逻辑
- 第三方库提供的 HOC（如 React Router 的 `withRouter`）

**✅ 适合使用 Hooks**：
- 函数组件中复用状态逻辑
- 需要在组件内部灵活组合逻辑
- 需要更好的 TypeScript 支持
- 新项目，推荐优先使用 Hooks

## 九、常见问题

### 1. Props 命名冲突

```javascript
// ❌ 问题：两个 HOC 都注入 data 属性
const EnhancedComponent = withUserData(
  withProductData(MyComponent)
);

// ✅ 解决：使用不同的属性名
function withUserData(Component) {
  return (props) => <Component {...props} userData={userData} />;
}

function withProductData(Component) {
  return (props) => <Component {...props} productData={productData} />;
}
```

### 2. Refs 丢失

```javascript
// ❌ 问题：ref 指向 HOC，而不是原组件
const EnhancedComponent = withEnhancement(MyComponent);
<EnhancedComponent ref={myRef} /> // ref 是 HOC 的实例

// ✅ 解决：使用 forwardRef
function withEnhancement(Component) {
  const HOC = forwardRef((props, ref) => {
    return <Component {...props} ref={ref} />;
  });
  return HOC;
}
```

### 3. 静态方法丢失

```javascript
// 原组件有静态方法
MyComponent.staticMethod = function () {
  console.log('static method');
};

// ❌ 问题：HOC 后静态方法丢失
const Enhanced = withEnhancement(MyComponent);
Enhanced.staticMethod(); // undefined

// ✅ 解决：手动复制或使用 hoist-non-react-statics
import hoistNonReactStatics from 'hoist-non-react-statics';

function withEnhancement(Component) {
  class HOC extends React.Component {
    render() {
      return <Component {...this.props} />;
    }
  }

  hoistNonReactStatics(HOC, Component);
  return HOC;
}
```

## 十、总结

### 核心要点

1. **HOC 是函数**：接收组件，返回新组件
2. **不修改原组件**：通过组合而不是修改来增强功能
3. **透传 props**：不相关的 props 应该传递给被包装组件
4. **设置 displayName**：方便调试和开发
5. **注意性能**：不要在 render 中创建 HOC

### 使用建议

- 🎯 **新项目**：优先使用 Hooks
- 🔄 **类组件**：HOC 是好选择
- 📦 **第三方库**：可能需要使用 HOC
- 🚀 **复杂场景**：考虑组合 Hooks 和 HOC

### 快速决策

```
需要复用组件逻辑？
├─ 函数组件
│   ├─ 优先使用自定义 Hooks ✅
│   └─ 需要包装组件树 → HOC
│
└─ 类组件
    └─ 使用 HOC ✅
```

高阶组件是 React 中强大的模式，但在 React Hooks 出现后，大部分场景都可以用自定义 Hooks 替代。选择合适的工具取决于具体的使用场景和项目需求。
