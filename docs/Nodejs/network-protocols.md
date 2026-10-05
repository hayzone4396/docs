---
title: Node.js 网络层协议与服务开发
date: 2026-10-05 13:07:00
tags:
  - Node.js
  - HTTP
  - WebSocket
  - TCP
  - UDP
categories:
  - Node.js
---

# Node.js 网络层协议与服务开发

## 课程目标

> 💡 **提示**
> - 初中级：
>
>   1. **掌握 Node http 模块**： 深入理解 Node.js 内置 http 模块的核心概念与 API，学习如何创建 HTTP 服务器、处理请求与响应、解析请求头与请求体、设置响应状态码与响应头，能够基于 http 模块独立构建基础的网络服务与接口
>   2. **基于 http 模块封装 WebSocket 服务**：学习 WebSocket 协议的握手机制、帧格式与通信原理，掌握如何基于 http 模块的 upgrade 事件完成协议升级，手动实现 WebSocket 帧的解析与封装、心跳保活与连接管理，能够从零封装一个可用的 WebSocket 服务并深入理解网络通信底层原理
>   3. **了解 express 与 socket.io 框架**：了解 express 框架的中间件机制、路由管理、请求处理与静态资源服务，了解 socket.io 框架的房间 / 命名空间、事件广播与断线重连机制，能够快速搭建基于 express 的 HTTP 服务与基于 socket.io 的实时通信服务
> - 高级：
>
>   1. **深入 Node http 模块**：深入理解 http 模块的底层实现与核心 API，包括 IncomingMessage、ServerResponse、Agent、连接复用与 Keep-Alive 机制，掌握流式请求体处理、分块传输编码、超时控制与错误处理，能够构建高性能、高可用的 HTTP 服务并排查网络层问题
>   2. **基于 http 模块封装类 express MVC 框架**：学习如何基于 http 模块与 Node 核心模块（url、querystring、stream 等），封装路由系统、中间件机制、请求 / 响应扩展、控制器与视图层，实现类似 express 的 MVC 框架，深入理解 Web 框架的设计思想与底层实现原理
>   3. **了解 net 模块与 TCP 服务开发**：了解 net 模块的核心 API 与 TCP 协议基础，学习如何使用 net.createServer 创建 TCP 服务器、处理连接事件、进行数据读写与粘包处理，了解 Socket 对象的属性与事件，能够基于 net 模块开发简单的 TCP 服务与客户端通信
>   4. **了解 dgram 模块与 UDP 通信**：了解 dgram 模块的核心 API 与 UDP 协议特点，学习如何使用 dgram.createSocket 创建 UDP 套接字、发送与接收数据报、处理广播与组播，了解 UDP 与 TCP 的区别及适用场景，能够基于 dgram 模块实现简单的 UDP 通信应用

## 一、HTTP 模块详解

`http`模块是Node.js中的核心模块之一，专门用于构建基于HTTP的网络应用程序。

它允许我们创建 HTTP **服务器**和**客户端**，处理网络请求和响应。


### 核心API详解


#### `http.createServer([options][, requestListener])`

`http.createServer`是用于创建HTTP服务器的核心方法。它返回一个`http.Server`实例，可以监听指定的端口并处理请求。


- **`options`**\*\* (可选)\*\*: 用于提供服务器配置，允许指定HTTP/1.1、HTTP/2等协议。
- **`requestListener`**\*\* (可选)\*\*: 一个回调函数，在每次接收到客户端请求时调用。


```JavaScript
const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, world!\n');
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:3000/');
});
```


- `req`: 包含请求的详细信息，比如URL、HTTP方法、请求头等。
- `res`: 用于响应客户端请求，可以设置状态码、响应头以及响应体。


#### `request` and `response` Objects


##### `http.IncomingMessage`

表示服务器接收到的请求。它是一个可读流，用于获取请求体和元数据。


**常用属性：**

- `req.method`: 请求的方法（`GET`、`POST`等）。
- `req.url`: 请求的路径和查询参数。
- `req.headers`: 请求的头部信息。


##### `http.ServerResponse`

表示服务器对客户端的响应。它是一个可写流，用于发送响应数据。


**常用方法：**

- `res.writeHead(statusCode[, headers])`: 设置状态码和头部信息。
- `res.end([data[, encoding]][, callback])`: 结束响应并可以发送数据。


#### `http.request(options[, callback])`

用于创建HTTP客户端请求。


```JavaScript
const options = {
  hostname: 'www.google.com',
  port: 80,
  path: '/',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
```


- **`options`**: 用于配置请求的目标、方法、头信息等。
- **`callback`**: 处理响应的回调函数。


#### `http.get(options[, callback])`

这是一个简化版的`http.request`，专门用于GET请求。它自动调用`req.end()`，不需要显式调用。


```JavaScript
http.get('http://www.google.com', (res) => {
  res.on('data', (chunk) => {
    console.log(`Data chunk: ${chunk}`);
  });

  res.on('end', () => {
    console.log('No more data.');
  });
});
```


### 实战项目：简单的HTTP服务器与客户端


#### 目标

创建一个简单的HTTP服务器，它可以响应客户端的GET和POST请求。同时，通过客户端请求获取服务器上的数据。


#### 创建HTTP服务器

在服务器端，我们将接受GET和POST请求，并返回不同的响应。


```JavaScript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Welcome to the GET request!' }));
  } else if (req.method === 'POST' && req.url === '/submit') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Data received!', data: body }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```


#### 创建HTTP客户端

客户端将发送GET和POST请求来与服务器进行交互。


```JavaScript
const http = require('http');

// Send GET request
http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('GET Response:', data);
  });
});

// Send POST request
const postData = JSON.stringify({ name: 'John', age: 30 });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/submit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length,
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('POST Response:', data);
  });
});

req.write(postData);
req.end();
```


通过 `http` 模块直接实现 WebSocket (WS) 协议是一项深入底层协议的工作。WebSocket 是基于 TCP 的协议，在其通信过程中，依赖于 HTTP 协议的握手机制，但通信方式和 HTTP 不同，它允许建立一个长期的、双向的连接。为了实现 WebSocket 服务器，我们需要结合对 HTTP 和 WebSocket 握手机制、数据帧协议以及 TCP/IP 模型的理解。

## 二、Express 框架

`Express` 是一个极简且灵活的 Node.js Web 应用框架，提供了一组强大而实用的功能，用于构建 Web 应用程序和 API。它简化了 Node.js 原生 HTTP 模块的使用，使开发者能够更轻松地处理路由、请求、响应等任务。


### 为什么使用 Express？


- **简化路由**：通过路由机制，Express 允许开发者轻松地为不同 URL 创建处理程序。
- **中间件支持**：Express 提供了中间件的支持，可以在请求处理的不同阶段执行特定逻辑。
- **扩展性强**：Express 可以通过各种第三方中间件和插件来扩展功能，如身份验证、日志记录、文件上传等。
- **支持模板引擎**：可以使用模板引擎如 EJS、Pug 渲染动态 HTML 页面。


不过我们后续工作中可以选用 nest，他的工程化与设计理念比 express 更先进。


### Express 使用


#### 安装 Express


首先，安装 Express：


```Bash
npm install express
```


#### 创建一个基本的 Express 应用


```JavaScript
const express = require('express');
const app = express();

// 定义一个简单的路由
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// 启动服务器
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
```


#### 路由系统


Express 提供了简单的路由机制，允许根据 HTTP 方法和路径定义请求处理程序。路由可以定义为不同的 HTTP 动作（如 `GET`、`POST` 等），并绑定到特定的路径上。


```JavaScript
app.get('/users', (req, res) => {
  res.send('Get all users');
});

app.post('/users', (req, res) => {
  res.send('Create a new user');
});

app.put('/users/:id', (req, res) => {
  res.send(`Update user with ID ${req.params.id}`);
});

app.delete('/users/:id', (req, res) => {
  res.send(`Delete user with ID ${req.params.id}`);
});
```


在这个例子中，我们定义了多个路由来处理不同的 HTTP 请求类型和路径参数。


#### 使用中间件


中间件是在 Express 中处理请求和响应的核心机制。中间件函数可以拦截请求，执行某些操作，或者将请求传递给下一个中间件或最终的路由处理程序。


##### 内置中间件


- `express.json()`：解析 `application/json` 类型的请求体。
- `express.static()`：用于提供静态资源，如图片、CSS 文件等。


```JavaScript
// 使用内置中间件解析 JSON 请求体
app.use(express.json());

// 使用内置中间件提供静态文件服务
app.use(express.static('public'));
```


##### 自定义中间件


自定义中间件可以拦截请求，进行身份验证、日志记录或其他逻辑。


```JavaScript
// 自定义中间件，记录请求的时间
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();  // 调用 next() 传递请求给下一个中间件
});
```


#### 路由器（Router）


`Router` 是 Express 中的一个子路由器，可以将路由逻辑分组。它使得应用的路由结构更加清晰和模块化。


```JavaScript
const express = require('express');
const app = express();
const userRouter = express.Router();

// 定义用户相关的路由
userRouter.get('/', (req, res) => {
  res.send('List of users');
});

userRouter.get('/:id', (req, res) => {
  res.send(`Get user with ID ${req.params.id}`);
});

// 将 userRouter 注册到 /users 路径
app.use('/users', userRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```


#### 处理错误


在 Express 中可以通过错误处理中间件捕获并处理路由或其他中间件中的错误。


```JavaScript
// 定义路由
app.get('/', (req, res) => {
  throw new Error('Something went wrong!');  // 抛出错误
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});
```


#### 使用模板引擎


Express 支持模板引擎，可以生成动态 HTML 页面。常见的模板引擎有 EJS、Pug、Handlebars 等。


##### 使用 EJS 模板引擎【基本上不用，因为我们有 react、vue】


首先安装 EJS：


```Bash
npm install ejs
```


然后设置 Express 使用 EJS：


```JavaScript
app.set('view engine', 'ejs');

// 渲染一个 EJS 模板
app.get('/', (req, res) => {
  res.render('index', { title: 'My Express App', message: 'Hello, EJS!' });
});
```


EJS 模板文件（`views/index.ejs`）的内容示例：


```HTML
<!DOCTYPE html>
<html>
  <head>
    <title><%= title %></title>
  </head>
  <body>
    <h1><%= message %></h1>
  </body>
</html>
```


### 实战项目：用户管理 API


让我们通过一个简单的用户管理 API 来进一步理解 Express 的功能。这是一个处理用户 CRUD（创建、读取、更新、删除）操作的示例。


```JavaScript
const express = require('express');
const app = express();

app.use(express.json()); // 解析 JSON 请求体

// 模拟的用户数据
let users = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
];

// 获取所有用户
app.get('/users', (req, res) => {
  res.json(users);
});

// 获取单个用户
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');
  res.json(user);
});

// 创建新用户
app.post('/users', (req, res) => {
  const user = {
    id: users.length + 1,
    name: req.body.name,
  };
  users.push(user);
  res.status(201).json(user);
});

// 更新用户
app.put('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).send('User not found');

  user.name = req.body.name;
  res.json(user);
});

// 删除用户
app.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) return res.status(404).send('User not found');

  users.splice(userIndex, 1);
  res.status(204).send(); // 204表示无内容
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```


### 更多中间件与 express 开发细节


在 Express 中，中间件是扩展其功能的核心机制之一，它允许我们在请求处理的不同阶段执行逻辑操作。除了前面提到的内置中间件外，Express 社区中还存在许多强大的第三方中间件，用于处理身份验证、会话、跨域、cookie 等任务。下面我们详细讨论一些常用的中间件，比如 `cookie-parser`、`jsonwebtoken`（JWT）、以及其他常见的中间件。


#### `cookie-parser` - 处理 Cookie


`cookie-parser` 是 Express 中用于解析客户端请求中 Cookie 的中间件。它可以从 `HTTP` 请求头中解析出 Cookie，并以对象的形式提供给开发者。


##### 安装


```Bash
npm install cookie-parser
```


##### 使用


```JavaScript
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

// 使用 cookie-parser 中间件
app.use(cookieParser());

// 设置 cookie
app.get('/setcookie', (req, res) => {
  res.cookie('username', 'john_doe');
  res.send('Cookie has been set');
});

// 读取 cookie
app.get('/getcookie', (req, res) => {
  let username = req.cookies['username'];
  if (username) {
    res.send(`Hello, ${username}`);
  } else {
    res.send('No cookie found');
  }
});

// 清除 cookie
app.get('/clearcookie', (req, res) => {
  res.clearCookie('username');
  res.send('Cookie cleared');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```


- **`res.cookie`**：用于设置 Cookie，支持指定过期时间、加密等。
- **`req.cookies`**：通过 `cookie-parser`，可以直接从 `req.cookies` 读取解析后的 Cookie。


##### Cookie 选项


在设置 Cookie 时，可以指定一些选项，如 `maxAge`、`secure` 和 `httpOnly`。


```JavaScript
res.cookie('username', 'john_doe', { maxAge: 900000, httpOnly: true });
```


- `maxAge`: 设置 Cookie 的有效期，单位为毫秒。
- `httpOnly`: 将 Cookie 标记为仅通过 HTTP 传输，不能通过 JavaScript 获取，增加安全性。
- `secure`: 如果设置为 `true`，Cookie 仅通过 HTTPS 传输。


#### `jsonwebtoken` - 使用 JWT 进行身份验证


`jsonwebtoken` 是用于生成和验证 JSON Web Tokens (JWT) 的库，通常用于在 Web 应用中进行身份验证。JWT 是一种紧凑的、URL 安全的令牌格式，它可以安全地传递信息并且可验证来源。


##### 安装


```Bash
npm install jsonwebtoken
```


##### 使用 JWT 进行身份验证


首先，我们需要生成一个 JWT 令牌，并在客户端请求时验证该令牌。


```JavaScript
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

const secretKey = 'your-secret-key';

// 用户登录，生成 JWT 令牌
app.post('/login', (req, res) => {
  const user = { id: 1, username: req.body.username };
  const token = jwt.sign(user, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

// 验证 JWT 中间件
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token.split(' ')[1], secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 受保护的路由
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```


##### 解析和验证 JWT 过程


1. **生成 JWT**：使用 `jwt.sign()` 方法生成一个签名的 JWT，通常包含用户信息和一个加密密钥。生成时可以指定过期时间，如 `1h` 表示一小时。
2. **验证 JWT**：通过 `jwt.verify()` 验证请求中的 JWT 是否有效。该函数会验证令牌是否通过我们指定的 `secretKey` 进行签名。


- JWT 的好处是可以在客户端和服务器之间传递经过签名的用户信息，而无需在服务器上存储会话状态。


#### `cors` - 处理跨域请求


在 Web 应用开发中，跨域资源共享（CORS）是一种允许浏览器从不同的域请求资源的机制。Express 中的 `cors` 中间件使得处理跨域请求变得简单。


##### 安装


```Bash
npm install cors
```


##### 使用


```JavaScript
const cors = require('cors');

// 使用 CORS 中间件
app.use(cors());

// 可以限制允许的源
app.use(cors({ origin: 'http://example.com' }));
```


##### CORS 选项


- **`origin`**: 允许的源，可以是一个特定的域名或者 `*`，表示所有源。
- **`methods`**: 允许的 HTTP 方法，例如 `GET`, `POST`, `PUT`, `DELETE`。
- **`credentials`**: 设置为 `true` 时，允许跨域请求发送 Cookie。


#### `express-session` - 会话管理


`express-session` 是用于在服务器端管理用户会话的中间件，它可以存储会话数据，并通过 `session ID` 识别用户。对于一些需要状态管理的 Web 应用来说，它是非常重要的。


##### 安装


```Bash
npm install express-session
```


##### 使用


```JavaScript
const session = require('express-session');

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // true 时需要 HTTPS
}));

// 设置会话
app.get('/set-session', (req, res) => {
  req.session.username = 'john_doe';
  res.send('Session set');
});

// 获取会话
app.get('/get-session', (req, res) => {
  const username = req.session.username;
  if (username) {
    res.send(`Hello, ${username}`);
  } else {
    res.send('No session found');
  }
});
```


##### 会话选项


- **`secret`**: 必须提供一个加密密钥来签名会话 ID，确保会话数据的安全。
- **`resave`**: 如果 `false`，表示只有在会话变化时才会保存到存储中。
- **`saveUninitialized`**: 如果 `true`，表示即使会话未被修改，也会保存未初始化的会话。


#### `morgan` - 日志记录


`morgan` 是用于记录 HTTP 请求日志的中间件，可以帮助开发者在开发和调试过程中跟踪请求信息。


##### 安装


```Bash
npm install morgan
```


##### 使用


```JavaScript
const morgan = require('morgan');

// 使用 morgan 记录请求日志
app.use(morgan('combined'));  // 使用 'combined' 预设格式

// 自定义格式
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
```


#### `body-parser` - 处理请求体


虽然 Express 4.16.0 之后内置了对 `JSON` 和 `urlencoded` 的解析支持，但 `body-parser` 仍然是处理请求体的常用中间件。


##### 安装


```Bash
npm install body-parser
```


##### 使用


```JavaScript
const bodyParser = require('body-parser');

// 解析 application/json 类型的请求体
app.use(bodyParser.json());

// 解析 application/x-www-form-urlencoded 类型的请求体
app.use(bodyParser.urlencoded({ extended: true }));
```


#### 总结


- `cookie-parser`：用于解析和操作客户端的 `Cookie`。
- `jsonwebtoken (JWT)`：用于生成和验证 JSON Web Tokens，适合身份验证。
- `cors`：用于处理跨域资源共享请求。
- `express-session`：用于在服务器端管理用户会话。
- `morgan`：用于记录 HTTP 请求日志，帮助调试。
- `body-parser`：解析请求体，处理 `JSON` 和表单数据。


这些中间件在 Express 应用中可以解决不同的需求，从身份验证、会话管理、跨域请求到日志记录等，让开发更加高效和模块化。

## 四、TCP 服务（net 模块）

在 Node.js 中，`net` 模块用于创建底层的 TCP 网络服务。它允许我们建立 TCP 服务器和客户端，处理数据传输等任务。TCP（Transmission Control Protocol）是一种面向连接的协议，确保数据的可靠传输，适用于需要可靠性的数据通信场景。


### TCP 与 UDP 区别

在探讨 `net` 模块之前，我们先简单回顾一下 TCP 和 UDP（User Datagram Protocol） 的区别：

1. **TCP** 是一种可靠的、面向连接的协议，它确保所有的数据包能够按顺序抵达目标，并且提供数据包的确认机制。通常用于文件传输、邮件、网页等需要高可靠性的场景。
2. **UDP** 是一种不可靠的、无连接的协议，数据包发送后不会确认接收状态，适用于对速度要求高而对可靠性要求较低的场景，如视频流、在线游戏等。


在 `net` 模块中，我们可以使用 TCP 协议来创建高可靠的网络通信应用。


### 创建 TCP 服务器


使用 `net.createServer()` 可以创建一个 TCP 服务器，监听客户端的连接请求并处理数据。


#### 创建简单的 TCP 服务器


```JavaScript
const net = require('net');

// 创建 TCP 服务器
const server = net.createServer((socket) => {
  console.log('Client connected');

  // 当接收到数据时触发
  socket.on('data', (data) => {
    console.log(`Received: ${data}`);
    socket.write(`Echo: ${data}`); // 回传数据给客户端
  });

  // 当客户端断开连接时触发
  socket.on('end', () => {
    console.log('Client disconnected');
  });
});

// 服务器监听端口
server.listen(8080, () => {
  console.log('TCP server running on port 8080');
});
```


#### 服务器的事件


`net.Server` 继承了 `EventEmitter`，因此它可以监听各种事件：


- **`connection`**：客户端连接时触发。
- **`data`**：接收到客户端的数据时触发。
- **`end`**：客户端断开连接时触发。
- **`error`**：处理任何错误。


```JavaScript
server.on('error', (err) => {
  console.error(`Error: ${err}`);
});
```


#### 处理多个客户端


Node.js 的 `net` 模块是事件驱动的，因此它支持多个客户端同时连接。在一个 TCP 服务器中，每当有一个客户端连接时，都会触发 `connection` 事件并创建一个新的 `socket` 对象，该对象用于与该客户端通信。


```JavaScript
const net = require('net');

const server = net.createServer((socket) => {
  console.log('New client connected');
  
  socket.on('data', (data) => {
    console.log(`Received: ${data}`);
    socket.write(`Hello Client, you said: ${data}`);
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => {
  console.log('TCP server is listening on port 8080');
});
```


### 创建 TCP 客户端


`net.connect()` 或 `net.createConnection()` 方法可以用于创建 TCP 客户端，并连接到 TCP 服务器。


#### 创建简单的 TCP 客户端


```JavaScript
const net = require('net');

// 创建 TCP 客户端并连接到服务器
const client = net.createConnection({ port: 8080 }, () => {
  console.log('Connected to server');
  client.write('Hello, server!');
});

// 监听数据
client.on('data', (data) => {
  console.log(`Received from server: ${data}`);
  client.end(); // 结束连接
});

// 监听连接关闭
client.on('end', () => {
  console.log('Disconnected from server');
});
```


#### 客户端的事件


与服务器类似，`net.Socket` 也继承了 `EventEmitter`，可以监听多个事件：


- **`connect`**：客户端成功连接到服务器时触发。
- **`data`**：从服务器接收到数据时触发。
- **`end`**：服务器关闭连接时触发。
- **`error`**：发生错误时触发。


#### 客户端与服务器的交互


当客户端连接到服务器后，服务器可以读取客户端发送的数据，处理数据，并将结果回传给客户端。


```JavaScript
const client = net.createConnection({ port: 8080 }, () => {
  client.write('Hello from client');
});

client.on('data', (data) => {
  console.log(`Received from server: ${data}`);
});
```


### TCP 数据传输


TCP 是基于流的协议，意味着它将数据以连续字节流的形式传输。因此，数据可能会被分割成多个部分传输，客户端和服务器都需要确保数据处理的正确性。


#### 数据流处理


```JavaScript
socket.on('data', (data) => {
  // 处理数据流
  console.log(`Received data: ${data}`);
});
```


由于 TCP 数据流可能会被分段传输，因此需要注意数据拼接问题，特别是在传输大文件或大块数据时，可能会出现数据片段错乱。


#### 传输二进制数据


TCP 不仅可以传输文本数据，还可以传输二进制数据。通过 `Buffer`，我们可以处理任意类型的二进制数据。


```JavaScript
socket.on('data', (buffer) => {
  console.log('Received binary data:', buffer);
});
```


#### 半关闭连接


在 TCP 中，客户端或服务器可以通过 `end()` 关闭写操作，但保持读操作。这被称为半关闭（half-duplex），即允许一方停止发送数据，但仍然可以接收数据。


```JavaScript
socket.end('Goodbye'); // 关闭写操作，但继续监听数据
```


### 进阶：TCP 与心跳机制


在实际的 TCP 应用中，我们可能需要检测连接是否仍然有效。常用的方法是实现心跳机制，通过定期发送心跳消息来确保连接的存活。如果在一段时间内没有收到心跳响应，则可以认为连接已断开。


#### 实现心跳机制


```JavaScript
const net = require('net');

const server = net.createServer((socket) => {
  console.log('Client connected');
  
  // 定期发送心跳消息
  const interval = setInterval(() => {
    if (socket.destroyed) {
      clearInterval(interval);
      return;
    }
    socket.write('ping');
  }, 5000);

  socket.on('data', (data) => {
    console.log(`Received: ${data}`);
    if (data.toString() === 'pong') {
      console.log('Heartbeat received');
    }
  });

  socket.on('end', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

server.listen(8080, () => {
  console.log('TCP server running on port 8080');
});
```


#### 客户端响应心跳


客户端也可以实现一个简单的机制来响应服务器的心跳。


```JavaScript
const client = net.createConnection({ port: 8080 }, () => {
  console.log('Connected to server');
});

client.on('data', (data) => {
  if (data.toString() === 'ping') {
    client.write('pong');
  }
});
```

## 五、UDP 服务（dgram 模块）

`dgram` 模块是 Node.js 中用于提供 UDP 套接字的模块。它支持通过用户数据报协议 (UDP) 进行通信。UDP 是一种无连接的协议，因此不像 TCP 那样需要建立和维护连接，适用于低延迟、不需要确保可靠传输的场景。


### 创建 UDP 套接字


```JavaScript
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');  // 创建一个 UDP4 (IPv4) 的套接字，或者用 'udp6' 来支持 IPv6
```


### 绑定到端口


```JavaScript
socket.bind(41234);  // 绑定到端口号 41234
```


### 发送消息


```JavaScript
const message = Buffer.from('Hello UDP!');
socket.send(message, 0, message.length, 41234, 'localhost', (err) => {
  if (err) console.error(err);
  else console.log('Message sent!');
});
```


### 接收消息


```JavaScript
socket.on('message', (msg, rinfo) => {
  console.log(`Received message: ${msg} from ${rinfo.address}:${rinfo.port}`);
});
```


### 关闭套接字


```JavaScript
socket.close();  // 关闭 UDP 套接字
```


### 错误处理


```JavaScript
socket.on('error', (err) => {
  console.error(`Socket error: ${err}`);
  socket.close();
});
```


### 完整的 UDP 示例


#### UDP 服务器


```JavaScript
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.log(`Server error: ${err}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`Server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`Server listening on ${address.address}:${address.port}`);
});

server.bind(41234);  // 监听 41234 端口
```


#### UDP 客户端


```JavaScript
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const message = Buffer.from('Hello, Server!');
client.send(message, 41234, 'localhost', (err) => {
  client.close();
});
```


### 常用事件


- `message`: 当接收到消息时触发
- `error`: 当套接字发生错误时触发
- `listening`: 当服务器成功绑定并开始监听时触发
- `close`: 当套接字关闭时触发


### 适用场景

- 网络广播
- 轻量级、低延迟通信（如实时游戏或流媒体）
- 对可靠性要求不高的数据传输（如 DNS 查询）

## 六、HTTP / WebSocket / TCP / UDP 对比

### **HTTP (Hypertext Transfer Protocol)**


- **概述**: HTTP 是一种基于请求-响应模型的无状态协议，通常用于浏览器与服务器之间的数据交换。它是互联网的基础协议，用于传输网页内容、图像、视频等。
- **特点**:

  - **无状态**: 每个请求都是独立的，不保留前后连接信息。
  - **可靠性**: 使用 TCP 作为底层协议，保证数据传输的可靠性。
  - **典型应用场景**: 网页浏览、API 通信、文件下载等。
  - **传输层协议**: 基于 TCP 协议。
  - **数据格式**: 主要以文本格式传输（如 JSON、HTML 等）。
  - **连接方式**: 请求-响应模式，通常为短连接。

### **WebSocket**


- **概述**: WebSocket 是一种全双工协议，允许客户端与服务器之间建立持久连接，进行实时双向通信。它是 HTTP 的补充，最初通过 HTTP 握手建立连接，之后转换为 WebSocket 协议。
- **特点**:

  - **双向通信**: 客户端与服务器可以在连接期间随时互发数据。
  - **低延迟**: 保持长连接，避免重复建立连接的开销。
  - **典型应用场景**: 实时聊天、在线游戏、股票交易、数据推送等。
  - **传输层协议**: 基于 TCP 协议。
  - **数据格式**: 可以传输文本或二进制数据。
  - **连接方式**: 持久连接，通过一次 HTTP 握手建立连接后持续使用。


### **TCP (Transmission Control Protocol)**


- **概述**: TCP 是一种面向连接的传输层协议，提供可靠的数据传输。它通过序列号、确认机制、超时重传等机制保证数据的完整性和顺序。
- **特点**:

  - **面向连接**: 数据传输前需要建立连接，数据传输后需要关闭连接。
  - **可靠传输**: 通过确认和重传机制确保数据完整、无丢失和无重复。
  - **流量控制和拥塞控制**: 调整传输速度以避免网络拥堵。
  - **典型应用场景**: 文件传输、电子邮件、网页浏览等需要数据完整性的场景。
  - **传输层协议**: 直接运行在 IP 之上。
  - **数据格式**: 任意格式，但有严格的包序和重发机制。
  - **连接方式**: 可靠的双向连接。


### **UDP (User Datagram Protocol)**


- **概述**: UDP 是一种无连接、面向消息的传输层协议。与 TCP 相比，它不提供可靠的数据传输服务，但具有低延迟的优势。
- **特点**:

  - **无连接**: 无需建立连接即可传输数据，发送方直接发送数据，接收方直接接收数据。
  - **不可靠传输**: 不保证数据的顺序和完整性，数据可能丢失或乱序。
  - **低开销**: 由于没有确认和重传机制，UDP 传输效率更高，适用于对数据可靠性要求不高但对实时性要求高的场景。
  - **典型应用场景**: 视频流、音频流、在线游戏、实时语音通话等。
  - **传输层协议**: 直接运行在 IP 之上。
  - **数据格式**: 任意格式，但没有确认机制。
  - **连接方式**: 无连接，不保证可靠性。


### 总结对比


| **协议** | **传输模式** | **连接类型** | **可靠性** | **延迟** | **典型应用** | **传输层协议** |
|-|-|-|-|-|-|-|
| **HTTP** | 请求-响应 | 无状态 | 高 | 中 | 网页浏览、API 通信 | TCP |
| **WebSocket** | 全双工 | 长连接 | 高 | 低 | 实时聊天、股票交易、在线游戏 | TCP |
| **TCP** | 流式传输 | 面向连接 | 高 | 中 | 文件传输、邮件、网页 | TCP |
| **UDP** | 数据报 | 无连接 | 低 | 低 | 视频、语音流、在线游戏 | UDP |

## 七、补充：SSE

当下很多 AI 型产品，流式输出大都选择 SSE 方案，实现也比较简单，核心实现如下：

server

```TypeScript
import http from "node:http";
let count = 0;

// 服务
const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "access-control-allow-origin": "*",
    "content-type": "text/event-stream",
  });

  if (req.url === "/sse") {
    // res.write("data: hello\n\n");

    setInterval(() => {
      console.log("发送数据", count);
      res.end(`data: hello --- ${count++}\n\n`);
    }, 1000);
  }

  // res.end("hello");
});

server.listen(8080, () => {
  console.log("服务启动成功", "http://localhost:8080");
});

```

client

```TypeScript
const sse = new EventSource("http://localhost:8080/sse")

sse.onmessage = (event) => console.log(event.data)
```


Sse 数据格式仅支持文本数据

## 面试真题

### 什么是负载均衡？在 Node.js 中如何实现一个简单的负载均衡机制？


**答案：**  

负载均衡是一种将流量分配到多台服务器上，以优化资源使用、最大化吞吐量、减少响应时间的技术。在 Node.js 中，可以通过集群模块 (`cluster`) 来实现负载均衡，将多个工作进程分布在不同的 CPU 核心上。其实现原理是创建一个主进程和多个工作进程，主进程负责接收请求并将其分发给空闲的工作进程来处理。


```JavaScript
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // 创建工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  // 在每个工作进程中启动服务器
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Hello World\n');
  }).listen(8000);
}
```


### 如何在 Node.js 中进行流量限制和防止 DDOS 攻击？


**答案：**  

在 Node.js 中，可以通过中间件或第三方库如 `express-rate-limit` 实现流量限制。其实现原理是限制单位时间内同一 IP 地址或用户的请求数量，从而防止大量请求压垮服务器。可以结合 Redis 或内存存储来跟踪每个用户的请求次数，当超过预设的限额时，返回一个 `429 Too Many Requests` 的错误响应。


```JavaScript
const rateLimit = require('express-rate-limit');

// 创建流量限制中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 次请求
  message: 'Too many requests, please try again later.'
});

app.use(limiter);
```


### 怎样手写实现一个 ws 服务？


**答案：**


如果不使用任何第三方依赖，可以使用 Node.js 内置的 `http` 模块和 WebSocket 协议的基础规范来实现一个简单的 WebSocket 服务器。WebSocket 是一种基于 HTTP 协议升级的协议，首先客户端会发起一个 HTTP 请求，要求从 HTTP 升级到 WebSocket。如果服务器接受，则会进行协议升级并开始双向通信。


**实现 WebSocket 服务步骤：**


1. **创建 HTTP 服务器**：使用 Node.js 内置的 `http` 模块创建一个 HTTP 服务器。
2. **处理 WebSocket 握手**：处理 WebSocket 协议中的握手请求。
3. **管理 WebSocket 数据帧**：根据 WebSocket 协议处理客户端和服务器之间的通信帧。


**WebSocket 握手示例：**

WebSocket 握手要求服务器根据客户端发送的 `Sec-WebSocket-Key` 生成一个 `Sec-WebSocket-Accept`，并响应客户端。


```JavaScript
const http = require('http');
const crypto = require('crypto');

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  res.writeHead(400);
  res.end('Not a WebSocket request');
});

// 监听升级事件进行 WebSocket 握手
server.on('upgrade', (req, socket, head) => {
  // 检查请求头中的 WebSocket 协议升级字段
  if (req.headers['upgrade'] !== 'websocket') {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
  }

  // 获取 WebSocket 握手所需的 key
  const websocketKey = req.headers['sec-websocket-key'];
  const acceptKey = generateAcceptValue(websocketKey);

  // 发送 WebSocket 握手响应头
  const responseHeaders = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    '\r\n'
  ];

  socket.write(responseHeaders.join('\r\n'));

  // 监听 WebSocket 数据帧
  socket.on('data', (buffer) => {
    const message = parseWebSocketMessage(buffer);
    console.log('Received from client:', message);
    
    // 回送数据给客户端
    socket.write(constructReply(message));
  });

  socket.on('close', () => {
    console.log('Connection closed');
  });
});

// 生成 WebSocket 握手响应的 Sec-WebSocket-Accept 值
function generateAcceptValue(websocketKey) {
  return crypto
    .createHash('sha1')
    .update(websocketKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');
}

// 解析 WebSocket 数据帧
function parseWebSocketMessage(buffer) {
  const secondByte = buffer[1];
  const length = secondByte & 127;
  let maskStart = 2;
  
  if (length === 126) maskStart = 4;
  else if (length === 127) maskStart = 10;

  const mask = buffer.slice(maskStart, maskStart + 4);
  const data = buffer.slice(maskStart + 4, maskStart + 4 + length);
  
  const unmaskedData = Buffer.alloc(length);
  for (let i = 0; i < length; i++) {
    unmaskedData[i] = data[i] ^ mask[i % 4];
  }

  return unmaskedData.toString('utf8');
}

// 构造回送 WebSocket 数据帧
function constructReply(message) {
  const reply = Buffer.from(message);
  const frame = Buffer.alloc(reply.length + 2);
  
  // 设置 FIN 位和文本帧操作码
  frame[0] = 0x81;
  frame[1] = reply.length;
  reply.copy(frame, 2);

  return frame;
}

// 启动服务器监听端口 8080
server.listen(8080, () => {
  console.log('WebSocket server is running on ws://localhost:8080');
});
```


**代码解释**：

1. **HTTP 升级**：

   - 服务器监听 `upgrade` 事件以处理 WebSocket 握手请求。
   - 根据客户端提供的 `Sec-WebSocket-Key`，服务器生成 `Sec-WebSocket-Accept` 头部，返回 101 状态码以进行协议升级。
2. **解析 WebSocket 数据帧**：

   - WebSocket 使用自定义的帧格式，服务器接收客户端消息后需要解码帧，使用 XOR 掩码解码数据内容。


1. **发送 WebSocket 响应帧**：

   - 服务器通过构建符合 WebSocket 协议的数据帧，返回消息给客户端。


**测试客户端：**


可以用浏览器或者 Node.js 客户端进行测试。以下是在浏览器控制台中测试的代码：


```JavaScript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Connected to WebSocket server');
  ws.send('Hello from client');
};

ws.onmessage = (event) => {
  console.log('Received from server:', event.data);
};

ws.onclose = () => {
  console.log('Disconnected from server');
};
```

## 补充资料

- 官方 http 文档：https://nodejs.org/docs/latest/api/http.html
- 官方 net 文档：https://nodejs.org/docs/latest/api/net.html
- 官方 dgram 文档：https://nodejs.org/docs/latest/api/dgram.html
- express：https://expressjs.com/
- socket.io：https://socket.io/
- Websocket 协议：https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#%E4%BA%A4%E6%8D%A2%E6%95%B0%E6%8D%AE%E5%B8%A7
