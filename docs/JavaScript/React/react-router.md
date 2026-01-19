---
title: React Router 完全指南
date: 2026-01-19 09:40:00
tags:
  - React
  - React Router
  - 路由
categories:
  - React
---

# React Router 完全指南

React Router 是 React 应用中最常用的路由解决方案。本文主要介绍 React Router v5 和 v6 版本的使用方法及其差异。

## 版本对比概览

| 特性 | v5 | v6 |
|------|----|----|
| 路由容器 | `<Switch>` | `<Routes>` |
| 匹配模式 | 需要 `exact` 精准匹配 | 默认精准匹配 |
| 组件渲染 | `component` 属性 | `element` 属性 |
| 路由独占 | `<Switch>` 组件 | 默认独占匹配 |
| 重定向 | `<Redirect>` | `<Navigate>` |
| 路由信息获取 | props 传递 | Hooks 获取 |
| 子路由渲染 | 嵌套 Route | `<Outlet>` |

## React Router v5

### 基本配置

```jsx
import { HashRouter, Route, Link, Switch, Redirect } from 'react-router-dom';
import A from './components/A';
import B from './components/B';
import C from './components/C';
import NotFound from './components/NotFound';

function App() {
  return (
    <HashRouter>
      {/* 导航链接 */}
      <div>
        <Link to="/">A</Link>
        <Link to="/b">B</Link>
        <Link to="/c">C</Link>
      </div>

      {/* 路由容器 */}
      <div>
        <Switch>
          {/* exact: 开启精准匹配 */}
          <Route exact path="/" component={A} />
          <Route path="/b" component={B} />
          <Route path="/c" component={C} />

          {/* 404 处理 - 方式一：渲染 404 组件 */}
          <Route path="*" component={NotFound} />

          {/* 404 处理 - 方式二：重定向到首页 */}
          {/* <Redirect from="*" to="/" exact /> */}
        </Switch>
      </div>
    </HashRouter>
  );
}
```

### 路由规则说明

#### Switch 组件

确保路由中只要有一项匹配成功，就不再继续向下匹配：

```jsx
<Switch>
  <Route exact path="/" component={Home} />
  <Route path="/about" component={About} />
  <Route path="/user" component={User} />
  {/* 放在最后，匹配所有未定义的路由 */}
  <Route path="*" component={NotFound} />
</Switch>
```

#### Redirect 重定向

```jsx
{/* 基本重定向 */}
<Redirect to="/home" />

{/* 条件重定向 */}
<Redirect from="/old-path" to="/new-path" exact />
```

**参数说明：**
- `from`：从哪个地址来
- `to`：重定向的目标地址
- `exact`：对 from 地址开启精准匹配

### 路由信息获取（v5）

在 v5 中，路由组件可以通过 props 获取路由信息：

```jsx
function UserDetail(props) {
  // props.history - 路由历史对象
  // props.location - 当前位置信息
  // props.match - 路由匹配信息

  const { id } = props.match.params;

  return <div>User ID: {id}</div>;
}
```

## React Router v6

### 基本配置

```jsx
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import A from './components/A';
import B from './components/B';
import C from './components/C';

function App() {
  return (
    <HashRouter>
      {/* 导航链接 */}
      <div>
        <Link to="/a">A</Link>
        <Link to="/b">B</Link>
        <Link to="/c">C</Link>
      </div>

      {/* 路由容器 */}
      <div>
        <Routes>
          {/* 重定向：访问根路径时跳转到 /a */}
          <Route path="/" element={<Navigate to="/a" replace />} />

          {/* 使用 element 属性渲染组件 */}
          <Route path="/a" element={<A />} />
          <Route path="/b" element={<B />} />
          <Route path="/c" element={<C />} />

          {/* 404 处理 */}
          <Route
            path="*"
            element={
              <Navigate
                to={{
                  pathname: "/a",
                  search: "?from=404"
                }}
              />
            }
          />
        </Routes>
      </div>
    </HashRouter>
  );
}
```

### v6 版本的重要变化

#### 1. Routes 替代 Switch

```jsx
// ❌ v5 写法
<Switch>
  <Route path="/" component={Home} />
</Switch>

// ✅ v6 写法
<Routes>
  <Route path="/" element={<Home />} />
</Routes>
```

**主要差异：**
- 不再需要 `<Switch>` 组件，使用 `<Routes>`
- 默认只匹配一个路由（独占匹配）
- 默认开启精准匹配，不需要 `exact`

#### 2. element 替代 component

```jsx
// ❌ v5 写法
<Route path="/user" component={User} />

// ✅ v6 写法
<Route path="/user" element={<User />} />
```

#### 3. Navigate 替代 Redirect

```jsx
// ❌ v5 写法
<Redirect to="/home" />
<Redirect from="/old" to="/new" />

// ✅ v6 写法
<Navigate to="/home" replace />
<Navigate to="/home" />
```

**Navigate 组件属性：**
- `to`：目标路径（字符串或对象）
- `replace`：是否替换历史记录（默认 false）

```jsx
{/* 简单跳转 */}
<Navigate to="/home" />

{/* 携带查询参数 */}
<Navigate to={{ pathname: "/home", search: "?id=100" }} />

{/* 替换当前历史记录 */}
<Navigate to="/home" replace={true} />
```

## 子路由配置

### v6 子路由 - Outlet

在 v6 中，子路由通过 `<Outlet />` 组件渲染：

```jsx
// App.jsx
import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './Home';
import About from './About';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
}
```

```jsx
// Layout.jsx
import { Outlet, Link } from 'react-router-dom';

function Layout() {
  return (
    <div>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>

      {/* 子路由渲染位置 */}
      <Outlet />
    </div>
  );
}

export default Layout;
```

## 路由跳转方式

### 1. 声明式导航 - Link

```jsx
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      {/* 基本跳转 */}
      <Link to="/home">首页</Link>

      {/* 携带查询参数 */}
      <Link to="/user?id=100">用户</Link>

      {/* 对象形式 */}
      <Link to={{ pathname: "/user", search: "?id=100" }}>
        用户详情
      </Link>
    </nav>
  );
}
```

### 2. 声明式导航 - NavLink

`NavLink` 是 `Link` 的特殊版本，可以为激活的链接添加样式：

```jsx
import { NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <NavLink
        to="/home"
        className={({ isActive }) => isActive ? 'active' : ''}
        style={({ isActive }) => ({
          color: isActive ? 'red' : 'black'
        })}
      >
        首页
      </NavLink>
    </nav>
  );
}
```

### 3. 自动跳转 - Navigate

```jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ isAuth, children }) {
  // 未登录时自动跳转到登录页
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

### 4. 编程式导航 - useNavigate

v6 中使用 `useNavigate` Hook 进行编程式导航：

```jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 登录逻辑...

    // 方式一：简单跳转
    navigate('/home');

    // 方式二：替换当前历史记录
    navigate('/home', { replace: true });

    // 方式三：对象形式跳转
    navigate({ pathname: '/home' });

    // 方式四：携带查询参数
    navigate({
      pathname: '/user',
      search: '?id=100&name=zhangsan'
    });

    // 方式五：返回上一页
    navigate(-1);

    // 方式六：前进下一页
    navigate(1);
  };

  return <button onClick={handleLogin}>登录</button>;
}
```

## 路由参数获取（v6）

:::warning 重要变化
在 v6 版本中，即便组件是基于 `<Route>` 匹配渲染的，也**不会**通过 props 传递 `history`、`location`、`match` 等对象。

必须使用路由 Hooks 来获取这些信息！
:::

### 前提条件

使用路由 Hooks 的组件必须在 `<Router>` 内部，否则会报错：

```jsx
// ✅ 正确
<HashRouter>
  <App />  {/* 可以使用路由 Hooks */}
</HashRouter>

// ❌ 错误
<App />  {/* 无法使用路由 Hooks */}
```

### 1. useSearchParams - 查询参数

```jsx
import { useSearchParams } from 'react-router-dom';

function UserDetail() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 获取查询参数
  const id = searchParams.get('id');
  const name = searchParams.get('name');

  // 设置查询参数
  const handleUpdate = () => {
    setSearchParams({ id: '200', name: 'lisi' });
  };

  return (
    <div>
      <p>用户ID: {id}</p>
      <p>用户名: {name}</p>
      <button onClick={handleUpdate}>更新参数</button>
    </div>
  );
}

// 访问 /user?id=100&name=zhangsan
// 输出: 用户ID: 100, 用户名: zhangsan
```

### 2. useParams - 路径参数

```jsx
import { useParams } from 'react-router-dom';

// 路由配置
<Route path="/user/:id" element={<UserDetail />} />

// 组件中使用
function UserDetail() {
  const params = useParams();

  return <div>用户ID: {params.id}</div>;
}

// 访问 /user/100
// 输出: 用户ID: 100
```

### 3. useLocation - 位置信息

```jsx
import { useLocation } from 'react-router-dom';

function CurrentPath() {
  const location = useLocation();

  console.log(location.pathname);  // 当前路径
  console.log(location.search);    // 查询字符串
  console.log(location.hash);      // hash 值
  console.log(location.state);     // 传递的状态

  return <div>当前路径: {location.pathname}</div>;
}
```

### 4. useNavigate - 导航函数

前面已介绍，参见"编程式导航"部分。

### 5. 完整示例

```jsx
import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation
} from 'react-router-dom';

function ProductDetail() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // 路径参数
  const productId = params.id;

  // 查询参数
  const category = searchParams.get('category');
  const page = searchParams.get('page');

  // 位置信息
  const currentPath = location.pathname;

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <h2>商品详情</h2>
      <p>商品ID: {productId}</p>
      <p>分类: {category}</p>
      <p>页码: {page}</p>
      <p>当前路径: {currentPath}</p>
      <button onClick={handleBack}>返回</button>
    </div>
  );
}

// 路由配置
<Route path="/product/:id" element={<ProductDetail />} />

// 访问 /product/100?category=phone&page=1
```

## 查询参数处理

### 构建查询字符串

```jsx
import qs from 'qs';

// 方式一：手动拼接
const query = '?id=100&name=zhangsan';

// 方式二：使用 qs 库
const query = qs.stringify({ id: 100, name: 'zhangsan' });
// 结果: 'id=100&name=zhangsan'

navigate({
  pathname: '/user',
  search: `?${query}`
});
```

### 解析查询字符串

```jsx
import qs from 'qs';
import { useSearchParams } from 'react-router-dom';

function Component() {
  const [searchParams] = useSearchParams();

  // 方式一：使用 searchParams API
  const id = searchParams.get('id');
  const name = searchParams.get('name');

  // 方式二：使用 qs 解析
  const query = qs.parse(searchParams.toString());
  console.log(query.id, query.name);
}
```

## 路由模式对比

### HashRouter

```jsx
import { HashRouter } from 'react-router-dom';

// URL 示例: http://localhost:3000/#/home
<HashRouter>
  <App />
</HashRouter>
```

**特点：**
- ✅ 兼容性好，支持低版本浏览器
- ✅ 无需服务器配置
- ❌ URL 中有 # 号，不够美观
- ❌ SEO 不友好

### BrowserRouter

```jsx
import { BrowserRouter } from 'react-router-dom';

// URL 示例: http://localhost:3000/home
<BrowserRouter>
  <App />
</BrowserRouter>
```

**特点：**
- ✅ URL 美观，无 # 号
- ✅ SEO 友好
- ❌ 需要服务器配置（所有路径都返回 index.html）
- ❌ 低版本浏览器不支持

## 最佳实践

### 1. 路由配置集中管理

```jsx
// routes.jsx
import Home from './pages/Home';
import About from './pages/About';
import User from './pages/User';

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/user/:id', element: <User /> },
];

// App.jsx
import { Routes, Route } from 'react-router-dom';
import { routes } from './routes';

function App() {
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} {...route} />
      ))}
    </Routes>
  );
}
```

### 2. 路由守卫（权限控制）

```jsx
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token');

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// 使用
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>
```

### 3. 懒加载

```jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}
```

## 参考资源

- [React Router 官方文档](https://reactrouter.com/)
- [从 v5 迁移到 v6](https://reactrouter.com/en/main/upgrading/v5)
- [React Router v6 完整教程](https://github.com/remix-run/react-router/blob/main/docs/getting-started/tutorial.md)
