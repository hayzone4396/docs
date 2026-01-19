---
title: React 插槽模式完全指南
date: 2026-01-19 10:15:00
tags:
  - React
  - Slots
  - Children
  - 组件模式
categories:
  - React
---

# React 插槽模式完全指南

React 没有像 Vue 那样内置的插槽（Slots）系统，但可以通过 `children`、`props` 和 `React.Children` API 实现类似甚至更灵活的插槽功能。

## 什么是插槽？

插槽是一种组件内容分发机制，允许父组件向子组件传递 JSX 内容，让子组件决定这些内容的渲染位置和方式。

```
父组件传递内容  →  子组件接收  →  子组件决定渲染位置
```

## 默认插槽（children）

### 基本使用

最简单的插槽就是 React 的 `children` prop：

```jsx
// 子组件
function Card({ children }) {
  return (
    <div className="card">
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// 父组件使用
function App() {
  return (
    <Card>
      <h2>卡片标题</h2>
      <p>卡片内容</p>
    </Card>
  );
}
```

### children 的类型

`children` 可以是多种类型：

```jsx
// 字符串
<Card>Hello World</Card>

// 单个元素
<Card>
  <div>Content</div>
</Card>

// 多个元素
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>

// 表达式
<Card>
  {isLoading ? <Spinner /> : <Content />}
</Card>

// 函数（Render Props）
<Card>
  {(data) => <div>{data}</div>}
</Card>
```

## 具名插槽（Named Slots）

React 没有内置的具名插槽，但可以通过多种方式实现。

### 方式一：使用 slot 属性（类 Vue）

这是你提供的实现方式，通过自定义 `slot` 属性来实现具名插槽。

#### 父组件使用

```jsx
import Demo from './Demo';

const App = () => {
  return (
    <Demo>
      <span slot="footer">我是页脚</span>
      <span>默认内容</span>
      <span slot="header">我是页眉</span>
    </Demo>
  );
};

export default App;
```

#### 子组件实现

```jsx
import React from 'react';

const Demo = (props) => {
  let { children } = props;

  // 把插槽信息变为数组
  children = React.Children.toArray(children);

  // 按照插槽名字筛选出不同插槽信息
  let headerSlot = [];
  let footerSlot = [];
  let defaultSlot = [];

  children.forEach((child) => {
    // 获取 slot 属性
    let { slot } = child.props || {};

    if (slot === 'header') {
      headerSlot.push(child);
    } else if (slot === 'footer') {
      footerSlot.push(child);
    } else {
      defaultSlot.push(child);
    }
  });

  return (
    <div className="demo">
      {/* 页眉插槽 */}
      <header className="header">
        {headerSlot}
      </header>

      {/* 默认插槽 */}
      <main className="content">
        {defaultSlot}
      </main>

      {/* 页脚插槽 */}
      <footer className="footer">
        {footerSlot}
      </footer>
    </div>
  );
};

export default Demo;
```

#### 优化版本：抽取工具函数

```jsx
// utils/slots.js
import React from 'react';

/**
 * 从 children 中提取指定 slot 的内容
 * @param {React.ReactNode} children - 子元素
 * @param {string} slotName - 插槽名称
 * @returns {React.ReactNode[]} 匹配的子元素数组
 */
export function getSlot(children, slotName) {
  const childrenArray = React.Children.toArray(children);
  return childrenArray.filter((child) => {
    return React.isValidElement(child) && child.props?.slot === slotName;
  });
}

/**
 * 获取默认插槽内容（没有 slot 属性的子元素）
 * @param {React.ReactNode} children - 子元素
 * @returns {React.ReactNode[]} 默认插槽内容
 */
export function getDefaultSlot(children) {
  const childrenArray = React.Children.toArray(children);
  return childrenArray.filter((child) => {
    return !React.isValidElement(child) || !child.props?.slot;
  });
}

/**
 * 获取所有插槽内容
 * @param {React.ReactNode} children - 子元素
 * @returns {Object} 包含所有插槽的对象
 */
export function getAllSlots(children) {
  const childrenArray = React.Children.toArray(children);
  const slots = {};

  childrenArray.forEach((child) => {
    if (React.isValidElement(child)) {
      const slotName = child.props?.slot || 'default';
      if (!slots[slotName]) {
        slots[slotName] = [];
      }
      slots[slotName].push(child);
    } else {
      // 文本节点等非元素内容放入默认插槽
      if (!slots.default) {
        slots.default = [];
      }
      slots.default.push(child);
    }
  });

  return slots;
}
```

```jsx
// components/Demo.jsx
import React from 'react';
import { getSlot, getDefaultSlot } from '@/utils/slots';

const Demo = ({ children }) => {
  const headerSlot = getSlot(children, 'header');
  const footerSlot = getSlot(children, 'footer');
  const defaultSlot = getDefaultSlot(children);

  return (
    <div className="demo">
      <header className="header">{headerSlot}</header>
      <main className="content">{defaultSlot}</main>
      <footer className="footer">{footerSlot}</footer>
    </div>
  );
};

export default Demo;
```

### 方式二：使用 Props 传递（推荐）

这是 React 官方推荐的方式，更加直观和类型安全。

```jsx
// 子组件
function Layout({ header, footer, children }) {
  return (
    <div className="layout">
      <header className="header">{header}</header>
      <main className="content">{children}</main>
      <footer className="footer">{footer}</footer>
    </div>
  );
}

// 父组件使用
function App() {
  return (
    <Layout
      header={<h1>我是页眉</h1>}
      footer={<p>我是页脚</p>}
    >
      <div>默认内容</div>
    </Layout>
  );
}
```

**优点：**
- ✅ 类型安全（可以用 TypeScript 定义）
- ✅ 代码直观易懂
- ✅ IDE 自动补全支持
- ✅ 性能更好（无需遍历 children）

### 方式三：使用对象形式的 children

```jsx
// 子组件
function Tabs({ children }) {
  const { header, content, footer } = children;

  return (
    <div className="tabs">
      <div className="tabs-header">{header}</div>
      <div className="tabs-content">{content}</div>
      <div className="tabs-footer">{footer}</div>
    </div>
  );
}

// 父组件使用
function App() {
  return (
    <Tabs>
      {{
        header: <TabList />,
        content: <TabPanels />,
        footer: <TabActions />,
      }}
    </Tabs>
  );
}
```

### 方式四：组件组合模式

```jsx
// 子组件
function Layout({ children }) {
  return <div className="layout">{children}</div>;
}

Layout.Header = function Header({ children }) {
  return <header className="header">{children}</header>;
};

Layout.Content = function Content({ children }) {
  return <main className="content">{children}</main>;
};

Layout.Footer = function Footer({ children }) {
  return <footer className="footer">{children}</footer>;
};

// 父组件使用
function App() {
  return (
    <Layout>
      <Layout.Header>
        <h1>我是页眉</h1>
      </Layout.Header>
      <Layout.Content>
        <p>我是内容</p>
      </Layout.Content>
      <Layout.Footer>
        <p>我是页脚</p>
      </Layout.Footer>
    </Layout>
  );
}
```

**优点：**
- ✅ 语义清晰
- ✅ 灵活性高
- ✅ 易于维护

## 作用域插槽（Scoped Slots）

作用域插槽允许子组件向父组件传递数据，父组件可以使用这些数据来渲染内容。

### Render Props 模式

```jsx
// 子组件
function DataFetcher({ url, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [url]);

  // 调用 children 函数，传递数据
  return children({ data, loading });
}

// 父组件使用
function App() {
  return (
    <DataFetcher url="/api/users">
      {({ data, loading }) => {
        if (loading) return <div>加载中...</div>;
        return (
          <ul>
            {data.map((user) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        );
      }}
    </DataFetcher>
  );
}
```

### Function as Child Component (FACC)

```jsx
// 列表组件
function List({ items, children }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {/* 将 item 和 index 传递给父组件 */}
          {children(item, index)}
        </li>
      ))}
    </ul>
  );
}

// 使用
function App() {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];

  return (
    <List items={users}>
      {(user, index) => (
        <div>
          {index + 1}. {user.name}
        </div>
      )}
    </List>
  );
}
```

## React.Children API

React 提供了一组工具函数来处理 `children`。

### React.Children.toArray()

将 children 转换为扁平数组，并为每个元素分配 key。

```jsx
function Parent({ children }) {
  const childrenArray = React.Children.toArray(children);
  console.log(childrenArray.length); // 获取子元素数量

  return <div>{childrenArray}</div>;
}
```

### React.Children.map()

遍历 children 并返回新数组。

```jsx
function AddClassName({ className, children }) {
  return (
    <div>
      {React.Children.map(children, (child) => {
        // 为每个子元素添加 className
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${className}`,
        });
      })}
    </div>
  );
}

// 使用
<AddClassName className="highlight">
  <div>Item 1</div>
  <div>Item 2</div>
</AddClassName>
```

### React.Children.forEach()

遍历 children，但不返回数组。

```jsx
function ChildrenLogger({ children }) {
  React.Children.forEach(children, (child, index) => {
    console.log(`Child ${index}:`, child);
  });

  return <div>{children}</div>;
}
```

### React.Children.count()

返回 children 中的组件总数。

```jsx
function TabPanel({ children }) {
  const count = React.Children.count(children);

  return (
    <div>
      <p>共有 {count} 个标签页</p>
      <div>{children}</div>
    </div>
  );
}
```

### React.Children.only()

验证 children 只有一个子节点，否则抛出错误。

```jsx
function OnlyOneChild({ children }) {
  // 确保只有一个子元素
  const child = React.Children.only(children);
  return <div>{child}</div>;
}

// ✅ 正确
<OnlyOneChild>
  <div>Only one child</div>
</OnlyOneChild>

// ❌ 错误：会抛出异常
<OnlyOneChild>
  <div>Child 1</div>
  <div>Child 2</div>
</OnlyOneChild>
```

## Children 类型处理与标准化

### Children 的类型问题

在 React 中，`children` prop 的类型是不确定的，这会导致在处理时需要特别注意：

| 传递的 children | 类型 | 示例 |
|----------------|------|------|
| 没有传递 | `undefined` | `<Component />` |
| 单个元素 | `Object (ReactElement)` | `<Component><div /></Component>` |
| 多个元素 | `Array` | `<Component><div /><div /></Component>` |
| 字符串 | `String` | `<Component>Hello</Component>` |
| 数字 | `Number` | `<Component>{123}</Component>` |

这种不确定性会导致以下问题：

```jsx
// ❌ 可能出错的代码
function Demo({ children }) {
  // 如果 children 是单个元素，这里会报错（对象没有 map 方法）
  return (
    <div>
      {children.map((child, index) => (
        <div key={index}>{child}</div>
      ))}
    </div>
  );
}
```

### 解决方案：统一转换为数组

#### 方式一：使用 React.Children.toArray()（推荐）

这是你提供的解决方案，也是最推荐的方式：

```jsx
import React from 'react';

const Demo = function Demo(props) {
  let { children } = props;

  // 统一处理成数组形式
  // toArray 会：
  // 1. 将 undefined 转换为 []
  // 2. 将单个元素转换为 [element]
  // 3. 将多个元素保持为数组
  // 4. 自动添加 key
  // 5. 扁平化嵌套的 Fragment
  children = React.Children.toArray(children);

  return (
    <div>
      {children.map((child, index) => (
        <div key={index} className="item">
          {child}
        </div>
      ))}
    </div>
  );
};

export default Demo;
```

#### 方式二：手动处理

```jsx
function normalizeChildren(children) {
  // 处理 undefined 或 null
  if (children == null) {
    return [];
  }

  // 处理数组
  if (Array.isArray(children)) {
    return children;
  }

  // 处理单个元素
  return [children];
}

const Demo = ({ children }) => {
  const childrenArray = normalizeChildren(children);

  return (
    <div>
      {childrenArray.map((child, index) => (
        <div key={index}>{child}</div>
      ))}
    </div>
  );
};
```

:::tip React.Children.toArray() 的优势
相比手动处理，`React.Children.toArray()` 有以下优势：
- ✅ 自动为每个子元素分配唯一的 key
- ✅ 扁平化 Fragment（`<>...</>`）
- ✅ 处理所有边界情况
- ✅ 官方推荐，性能优化
:::

### 实际应用场景

#### 1. 列表包装组件

```jsx
import React from 'react';

const List = ({ children, spacing = 'medium' }) => {
  // 统一转换为数组
  const items = React.Children.toArray(children);

  return (
    <ul className={`list list--spacing-${spacing}`}>
      {items.map((child, index) => (
        <li key={index} className="list-item">
          {child}
        </li>
      ))}
    </ul>
  );
};

// 使用
function App() {
  return (
    <List>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </List>
  );
}
```

#### 2. 添加分隔符

```jsx
const SeparatedList = ({ children, separator = '|' }) => {
  const items = React.Children.toArray(children);

  return (
    <div className="separated-list">
      {items.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {/* 不是最后一个元素时添加分隔符 */}
          {index < items.length - 1 && (
            <span className="separator">{separator}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// 使用
<SeparatedList separator=" • ">
  <span>首页</span>
  <span>关于</span>
  <span>联系</span>
</SeparatedList>
// 渲染结果: 首页 • 关于 • 联系
```

#### 3. 网格布局组件

```jsx
const Grid = ({ children, columns = 3 }) => {
  const items = React.Children.toArray(children);

  return (
    <div
      className="grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '1rem',
      }}
    >
      {items.map((child, index) => (
        <div key={index} className="grid-item">
          {child}
        </div>
      ))}
    </div>
  );
};

// 使用
<Grid columns={4}>
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
  <Card>4</Card>
  <Card>5</Card>
</Grid>
```

#### 4. 条件渲染包装器

```jsx
const ConditionalWrapper = ({ children, condition, wrapper }) => {
  const items = React.Children.toArray(children);

  if (condition) {
    return wrapper(items);
  }

  return <>{items}</>;
};

// 使用
<ConditionalWrapper
  condition={isLoggedIn}
  wrapper={(children) => (
    <div className="authenticated">
      <ProfileHeader />
      {children}
    </div>
  )}
>
  <Dashboard />
  <Settings />
</ConditionalWrapper>
```

#### 5. 索引包装组件

```jsx
const IndexedList = ({ children }) => {
  const items = React.Children.toArray(children);

  return (
    <ol className="indexed-list">
      {items.map((child, index) => (
        <li key={index}>
          <span className="index">{index + 1}.</span>
          <div className="content">{child}</div>
        </li>
      ))}
    </ol>
  );
};

// 使用
<IndexedList>
  <div>第一步：准备材料</div>
  <div>第二步：开始制作</div>
  <div>第三步：完成</div>
</IndexedList>
```

### 高级用法：Children 过滤与转换

#### 过滤特定类型的子元素

```jsx
const FilteredChildren = ({ children, allowedTypes }) => {
  const items = React.Children.toArray(children);

  // 过滤出允许的类型
  const filtered = items.filter((child) => {
    if (!React.isValidElement(child)) return false;
    return allowedTypes.includes(child.type);
  });

  return <div>{filtered}</div>;
};

// 使用
const Button = ({ children }) => <button>{children}</button>;
const Link = ({ children }) => <a>{children}</a>;
const Text = ({ children }) => <span>{children}</span>;

<FilteredChildren allowedTypes={[Button, Link]}>
  <Button>按钮 1</Button>
  <Link>链接</Link>
  <Text>文本</Text>  {/* 会被过滤掉 */}
  <Button>按钮 2</Button>
</FilteredChildren>
// 只渲染 Button 和 Link 组件
```

#### 为子元素注入 Props

```jsx
const PropsInjector = ({ children, injectedProps }) => {
  const items = React.Children.toArray(children);

  return (
    <>
      {items.map((child, index) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        // 克隆元素并注入新的 props
        return React.cloneElement(child, {
          key: index,
          ...injectedProps,
          // 如果需要，可以基于索引注入不同的 props
          index,
        });
      })}
    </>
  );
};

// 使用
<PropsInjector injectedProps={{ theme: 'dark', size: 'large' }}>
  <Button>按钮 1</Button>
  <Button>按钮 2</Button>
  <Button>按钮 3</Button>
</PropsInjector>
// 每个 Button 都会接收到 theme、size 和 index props
```

#### 限制子元素数量

```jsx
const LimitedChildren = ({ children, maxItems = 3, showMore = false }) => {
  const items = React.Children.toArray(children);
  const hasMore = items.length > maxItems;

  return (
    <div>
      {items.slice(0, maxItems)}

      {hasMore && showMore && (
        <div className="show-more">
          还有 {items.length - maxItems} 项...
        </div>
      )}
    </div>
  );
};

// 使用
<LimitedChildren maxItems={5} showMore={true}>
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</LimitedChildren>
```

### Children 类型检查（TypeScript）

```typescript
import React, { ReactNode } from 'react';

interface DemoProps {
  children?: ReactNode; // ReactNode 包含所有可能的 children 类型
}

const Demo: React.FC<DemoProps> = ({ children }) => {
  // 统一转换为数组
  const items = React.Children.toArray(children);

  return (
    <div>
      {items.map((child, index) => (
        <div key={index}>{child}</div>
      ))}
    </div>
  );
};
```

**常用的 Children 类型：**

```typescript
// 1. 最宽泛的类型
children?: ReactNode

// 2. 只接受单个 React 元素
children: ReactElement

// 3. 只接受单个或多个 React 元素
children: ReactElement | ReactElement[]

// 4. 只接受字符串
children: string

// 5. Render Props
children: (data: any) => ReactNode

// 6. 特定组件类型
children: ReactElement<ButtonProps>
```

### 最佳实践

#### 1. 始终使用 React.Children.toArray()

```jsx
// ✅ 推荐：统一转换为数组
const Demo = ({ children }) => {
  const items = React.Children.toArray(children);
  return <div>{items.map(...)}</div>;
};

// ❌ 不推荐：直接使用 children
const Demo = ({ children }) => {
  return <div>{children.map(...)}</div>; // 可能报错
};
```

#### 2. 检查数组长度

```jsx
const Demo = ({ children }) => {
  const items = React.Children.toArray(children);

  // 检查是否有子元素
  if (items.length === 0) {
    return <div>暂无内容</div>;
  }

  return <div>{items}</div>;
};
```

#### 3. 使用 React.isValidElement 验证

```jsx
const Demo = ({ children }) => {
  const items = React.Children.toArray(children);

  return (
    <div>
      {items.map((child, index) => {
        // 验证是否为有效的 React 元素
        if (!React.isValidElement(child)) {
          console.warn('Invalid child:', child);
          return null;
        }

        return <div key={index}>{child}</div>;
      })}
    </div>
  );
};
```

#### 4. 避免直接修改 children

```jsx
// ❌ 不推荐：直接修改
const Demo = ({ children }) => {
  children.push(<div>新元素</div>); // 可能报错
  return <div>{children}</div>;
};

// ✅ 推荐：转换为数组后操作
const Demo = ({ children }) => {
  const items = React.Children.toArray(children);
  items.push(<div key="new">新元素</div>);
  return <div>{items}</div>;
};
```

### 性能优化

#### 使用 useMemo 缓存处理结果

```jsx
import { useMemo } from 'react';

const Demo = ({ children, filter }) => {
  // 缓存处理后的 children
  const processedChildren = useMemo(() => {
    const items = React.Children.toArray(children);

    // 进行复杂的处理
    return items
      .filter(child => /* 过滤逻辑 */ true)
      .map((child, index) => (
        React.cloneElement(child, { key: index, /* props */ })
      ));
  }, [children, filter]);

  return <div>{processedChildren}</div>;
};
```

### 常见问题

#### Q1: React.Children.toArray() 会修改原始 children 吗？

**答案**：不会。它会返回一个新数组，不会修改原始的 children。

#### Q2: 为什么要用 React.Children.toArray() 而不是手动转换？

**答案**：
1. 自动处理 Fragment
2. 自动分配唯一 key
3. 处理所有边界情况
4. 性能优化

#### Q3: toArray() 后还需要手动添加 key 吗？

**答案**：虽然 `toArray()` 会添加 key，但如果你要进一步处理（如 map），最好还是显式添加 key：

```jsx
const items = React.Children.toArray(children);
return items.map((child, index) => (
  <div key={index}>{child}</div>  // 显式添加 key
));
```

## 完整示例：卡片组件

### 使用 slot 属性实现

```jsx
// components/Card.jsx
import React from 'react';
import { getSlot, getDefaultSlot } from '@/utils/slots';
import './Card.css';

const Card = ({ children, style }) => {
  const headerSlot = getSlot(children, 'header');
  const footerSlot = getSlot(children, 'footer');
  const actionsSlot = getSlot(children, 'actions');
  const defaultSlot = getDefaultSlot(children);

  return (
    <div className="card" style={style}>
      {headerSlot.length > 0 && (
        <div className="card-header">{headerSlot}</div>
      )}

      <div className="card-body">{defaultSlot}</div>

      {actionsSlot.length > 0 && (
        <div className="card-actions">{actionsSlot}</div>
      )}

      {footerSlot.length > 0 && (
        <div className="card-footer">{footerSlot}</div>
      )}
    </div>
  );
};

export default Card;
```

```jsx
// App.jsx
import Card from './components/Card';

function App() {
  return (
    <div className="app">
      <Card>
        <h2 slot="header">用户信息</h2>

        <div>
          <p>姓名: 张三</p>
          <p>年龄: 25</p>
          <p>职业: 前端开发工程师</p>
        </div>

        <div slot="actions">
          <button>编辑</button>
          <button>删除</button>
        </div>

        <small slot="footer">最后更新: 2026-01-19</small>
      </Card>
    </div>
  );
}

export default App;
```

### 使用 Props 实现（推荐）

```jsx
// components/Card.jsx
import React from 'react';
import './Card.css';

const Card = ({ header, footer, actions, children, style }) => {
  return (
    <div className="card" style={style}>
      {header && <div className="card-header">{header}</div>}

      <div className="card-body">{children}</div>

      {actions && <div className="card-actions">{actions}</div>}

      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
```

```jsx
// App.jsx
import Card from './components/Card';

function App() {
  return (
    <div className="app">
      <Card
        header={<h2>用户信息</h2>}
        actions={
          <>
            <button>编辑</button>
            <button>删除</button>
          </>
        }
        footer={<small>最后更新: 2026-01-19</small>}
      >
        <p>姓名: 张三</p>
        <p>年龄: 25</p>
        <p>职业: 前端开发工程师</p>
      </Card>
    </div>
  );
}

export default App;
```

## 实际应用场景

### 1. 模态框组件

```jsx
// components/Modal.jsx
function Modal({ title, footer, children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}>×</button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// 使用
<Modal
  title="确认删除"
  footer={
    <>
      <button onClick={handleCancel}>取消</button>
      <button onClick={handleConfirm}>确认</button>
    </>
  }
>
  <p>确定要删除这条记录吗？</p>
</Modal>
```

### 2. 表格组件

```jsx
// components/Table.jsx
function Table({ columns, data, children }) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {/* 使用作用域插槽传递数据 */}
            {typeof children === 'function'
              ? children(row, index)
              : columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// 使用
<Table columns={columns} data={users}>
  {(user, index) => (
    <>
      <td>{index + 1}</td>
      <td>{user.name}</td>
      <td>
        <button onClick={() => handleEdit(user)}>编辑</button>
      </td>
    </>
  )}
</Table>
```

### 3. 标签页组件

```jsx
// components/Tabs.jsx
function Tabs({ children }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = React.Children.toArray(children);

  return (
    <div className="tabs">
      <div className="tabs-header">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={activeIndex === index ? 'active' : ''}
            onClick={() => setActiveIndex(index)}
          >
            {tab.props.title}
          </button>
        ))}
      </div>

      <div className="tabs-content">{tabs[activeIndex]}</div>
    </div>
  );
}

Tabs.Panel = function TabPanel({ children, title }) {
  return <div className="tab-panel">{children}</div>;
};

// 使用
<Tabs>
  <Tabs.Panel title="首页">
    <h2>首页内容</h2>
  </Tabs.Panel>
  <Tabs.Panel title="关于">
    <h2>关于内容</h2>
  </Tabs.Panel>
  <Tabs.Panel title="联系">
    <h2>联系内容</h2>
  </Tabs.Panel>
</Tabs>
```

## 性能优化

### 1. 使用 React.memo 避免重渲染

```jsx
// 子组件
const SlotContent = React.memo(({ children }) => {
  console.log('SlotContent 渲染');
  return <div>{children}</div>;
});

// 父组件
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      {/* 当 count 变化时，SlotContent 不会重新渲染 */}
      <SlotContent>
        <ExpensiveComponent />
      </SlotContent>
    </div>
  );
}
```

### 2. 缓存插槽内容

```jsx
function Layout({ header, footer, children }) {
  // 使用 useMemo 缓存插槽内容
  const memoizedHeader = useMemo(() => header, [header]);
  const memoizedFooter = useMemo(() => footer, [footer]);

  return (
    <div className="layout">
      <header>{memoizedHeader}</header>
      <main>{children}</main>
      <footer>{memoizedFooter}</footer>
    </div>
  );
}
```

### 3. 避免在 render 中创建新函数

```jsx
// ❌ 不好：每次渲染都创建新函数
<List items={users}>
  {(user) => <div>{user.name}</div>}
</List>

// ✅ 好：使用 useCallback 缓存函数
const renderUser = useCallback((user) => <div>{user.name}</div>, []);

<List items={users}>
  {renderUser}
</List>
```

## TypeScript 支持

### 定义插槽类型

```typescript
// components/Card.tsx
interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  header,
  footer,
  actions,
  children,
  style,
}) => {
  return (
    <div className="card" style={style}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {actions && <div className="card-actions">{actions}</div>}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
```

### 作用域插槽的类型

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

interface ListProps<T> {
  items: T[];
  children: (item: T, index: number) => React.ReactNode;
}

function List<T>({ items, children }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{children(item, index)}</li>
      ))}
    </ul>
  );
}

// 使用时有类型提示
<List<User> items={users}>
  {(user, index) => (
    <div>
      {/* user 和 index 都有类型 */}
      {index}. {user.name} - {user.email}
    </div>
  )}
</List>
```

## 最佳实践

### 1. 优先使用 Props 而不是 slot 属性

```jsx
// ✅ 推荐：使用 props
<Card header={<h2>标题</h2>} footer={<p>页脚</p>}>
  内容
</Card>

// ❌ 不推荐：使用 slot 属性
<Card>
  <h2 slot="header">标题</h2>
  内容
  <p slot="footer">页脚</p>
</Card>
```

**理由：**
- 类型安全
- IDE 支持更好
- 性能更优
- 代码更清晰

### 2. 提供默认插槽内容

```jsx
function Card({ header = <h3>默认标题</h3>, children }) {
  return (
    <div className="card">
      <div className="card-header">{header}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}
```

### 3. 使用组合模式提升灵活性

```jsx
// ✅ 推荐：组合模式
<Layout>
  <Layout.Header>头部</Layout.Header>
  <Layout.Sidebar>侧边栏</Layout.Sidebar>
  <Layout.Content>内容</Layout.Content>
</Layout>

// ❌ 不够灵活：固定插槽
<Layout header="头部" sidebar="侧边栏">
  内容
</Layout>
```

### 4. 条件渲染插槽

```jsx
function Modal({ title, footer, children }) {
  return (
    <div className="modal">
      {/* 只在有内容时渲染 */}
      {title && <div className="modal-title">{title}</div>}

      <div className="modal-body">{children}</div>

      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  );
}
```

### 5. 插槽内容的验证

```jsx
function Tabs({ children }) {
  // 验证所有子元素都是 Tab 组件
  const validChildren = React.Children.toArray(children).every(
    (child) => React.isValidElement(child) && child.type === Tab
  );

  if (!validChildren) {
    console.warn('Tabs 组件的子元素必须是 Tab 组件');
  }

  return <div className="tabs">{children}</div>;
}
```

## 插槽模式对比

| 模式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| Props 传递 | 类型安全、IDE 支持好 | 大量插槽时 props 多 | 少量插槽 |
| slot 属性 | 类似 Vue、易理解 | 性能略差、无类型 | 需要 Vue 风格 |
| 组合模式 | 灵活、语义清晰 | 代码量稍多 | 复杂布局 |
| Render Props | 可传递数据、灵活 | 嵌套深时难读 | 作用域插槽 |
| children 函数 | 简洁、强大 | 只能单一插槽 | 简单作用域插槽 |

## 总结

**React 插槽的实现方式：**

1. **默认插槽**：使用 `children` prop
2. **具名插槽**：
   - Props 传递（推荐）
   - slot 属性
   - 组合模式
3. **作用域插槽**：
   - Render Props
   - Function as Child Component

**推荐方案：**
- 简单场景：使用 `children`
- 多个插槽：使用 Props 传递
- 复杂布局：使用组合模式
- 需要传递数据：使用 Render Props

**最佳实践：**
- ✅ 优先使用 Props 而不是 slot 属性
- ✅ 提供默认内容
- ✅ 使用 TypeScript 提供类型安全
- ✅ 条件渲染插槽
- ✅ 注意性能优化（React.memo、useMemo）

## 参考资源

- [React 官方文档 - Children](https://react.dev/reference/react/Children)
- [React 官方文档 - Render Props](https://react.dev/reference/react/cloneElement#passing-data-with-a-render-prop)
- [Composition vs Inheritance](https://react.dev/learn/thinking-in-react#step-2-build-a-static-version-in-react)
