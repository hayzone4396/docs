---
title: WebSocket 完全指南
description: 深入了解 WebSocket 协议，包括实战封装、心跳检测、断线重连机制及应用场景
tags:
  - WebSocket
  - 实时通信
  - 全双工通信
date: 2026-01-23 15:40:00
---

# WebSocket 完全指南

## 什么是 WebSocket？

WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议。它使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。在 WebSocket API 中，浏览器和服务器只需要完成一次握手，两者之间就可以创建持久性的连接，并进行双向数据传输。

### 与 HTTP 的区别

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信方式 | 请求-响应模式（单向） | 全双工通信（双向） |
| 连接 | 短连接（HTTP/1.1 可保持连接） | 长连接 |
| 实时性 | 需要轮询，实时性差 | 实时推送，延迟低 |
| 开销 | 每次请求都有完整的 HTTP 头 | 握手后数据帧开销小 |
| 协议标识 | `http://` 或 `https://` | `ws://` 或 `wss://` |

## 基础使用

### 简单示例

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:8080');

// 连接成功
ws.onopen = () => {
  console.log('连接成功');
  ws.send('Hello Server!');
};

// 接收消息
ws.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

// 连接错误
ws.onerror = (error) => {
  console.error('连接错误:', error);
};

// 连接关闭
ws.onclose = () => {
  console.log('连接关闭');
};
```

## WebSocket 封装类

实现一个功能完善的 WebSocket 管理类，支持心跳检测、自动重连、消息队列等功能。

```javascript
class WebSocketClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      heartbeatInterval: 30000,    // 心跳间隔（毫秒）
      reconnectInterval: 5000,      // 重连间隔（毫秒）
      reconnectAttempts: 5,         // 最大重连次数
      ...options
    };

    this.ws = null;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
    this.reconnectCount = 0;
    this.messageQueue = [];         // 消息队列
    this.isManualClose = false;     // 是否手动关闭
  }

  // 连接
  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.initEventListeners();
    } catch (error) {
      console.error('WebSocket 连接失败:', error);
      this.reconnect();
    }
  }

  // 初始化事件监听
  initEventListeners() {
    this.ws.onopen = () => {
      console.log('WebSocket 连接成功');
      this.reconnectCount = 0;
      this.startHeartbeat();
      this.flushMessageQueue();
      this.options.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      this.options.onMessage?.(event.data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      this.options.onError?.(error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket 连接关闭');
      this.stopHeartbeat();
      this.options.onClose?.();

      if (!this.isManualClose) {
        this.reconnect();
      }
    };
  }

  // 发送消息
  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      // 连接未就绪，加入消息队列
      this.messageQueue.push(data);
    }
  }

  // 清空消息队列
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  // 心跳检测
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, this.options.heartbeatInterval);
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 重连机制
  reconnect() {
    if (this.reconnectCount >= this.options.reconnectAttempts) {
      console.error('达到最大重连次数，停止重连');
      this.options.onReconnectFailed?.();
      return;
    }

    this.reconnectCount++;
    console.log(`尝试第 ${this.reconnectCount} 次重连...`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval);
  }

  // 关闭连接
  close() {
    this.isManualClose = true;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.ws?.close();
  }
}
```

### 使用示例

```javascript
const wsClient = new WebSocketClient('ws://localhost:8080', {
  heartbeatInterval: 30000,
  reconnectInterval: 3000,
  reconnectAttempts: 5,

  onOpen: () => {
    console.log('连接建立成功');
  },

  onMessage: (data) => {
    console.log('收到消息:', data);
    try {
      const message = JSON.parse(data);
      // 处理不同类型的消息
      switch (message.type) {
        case 'chat':
          handleChatMessage(message);
          break;
        case 'notification':
          handleNotification(message);
          break;
      }
    } catch (error) {
      console.error('消息解析失败:', error);
    }
  },

  onError: (error) => {
    console.error('连接错误:', error);
  },

  onClose: () => {
    console.log('连接已关闭');
  },

  onReconnectFailed: () => {
    console.error('重连失败，请检查网络');
  }
});

// 建立连接
wsClient.connect();

// 发送消息
wsClient.send({
  type: 'chat',
  content: 'Hello!',
  timestamp: Date.now()
});

// 关闭连接
// wsClient.close();
```

## Socket.IO

Socket.IO 是一个封装了 WebSocket 的库，提供了更强大的功能和更好的兼容性。

### 安装

```bash
# 客户端
npm install socket.io-client

# 服务端
npm install socket.io
```

### 客户端使用

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  reconnection: true,              // 自动重连
  reconnectionDelay: 1000,         // 重连延迟
  reconnectionAttempts: 5          // 最大重连次数
});

// 连接成功
socket.on('connect', () => {
  console.log('连接成功:', socket.id);
});

// 监听消息
socket.on('message', (data) => {
  console.log('收到消息:', data);
});

// 发送消息
socket.emit('chat', {
  user: 'Alice',
  message: 'Hello!'
});

// 监听特定事件
socket.on('userJoined', (user) => {
  console.log(`${user} 加入了聊天室`);
});

// 断开连接
socket.on('disconnect', (reason) => {
  console.log('连接断开:', reason);
});
```

### 服务端使用（Node.js）

```javascript
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 监听消息
  socket.on('chat', (data) => {
    console.log('收到消息:', data);
    // 广播给所有客户端
    io.emit('message', data);
  });

  // 加入房间
  socket.on('joinRoom', (room) => {
    socket.join(room);
    socket.to(room).emit('userJoined', socket.id);
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户断开:', socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

## SSE（Server-Sent Events）对比

SSE 是一种服务器向客户端推送数据的技术，与 WebSocket 的区别：

| 特性 | WebSocket | SSE |
|------|-----------|-----|
| 通信方向 | 双向 | 单向（服务器到客户端） |
| 协议 | ws:// / wss:// | http:// / https:// |
| 数据格式 | 二进制/文本 | 仅文本 |
| 浏览器支持 | 广泛支持 | 广泛支持（IE 不支持） |
| 自动重连 | 需手动实现 | 自动重连 |

### SSE 示例

```javascript
// 客户端
const eventSource = new EventSource('http://localhost:3000/events');

eventSource.onmessage = (event) => {
  console.log('收到数据:', event.data);
};

eventSource.onerror = (error) => {
  console.error('连接错误:', error);
};

// 服务端（Express）
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const interval = setInterval(() => {
    sendEvent({ message: 'Hello', timestamp: Date.now() });
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
  });
});
```

## 使用场景

### 1. 实时聊天应用

```javascript
class ChatRoom {
  constructor(url) {
    this.ws = new WebSocketClient(url, {
      onMessage: (data) => this.handleMessage(data)
    });
    this.ws.connect();
  }

  handleMessage(data) {
    const message = JSON.parse(data);
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${message.user}: ${message.text}`;
    chatBox.appendChild(messageElement);
  }

  sendMessage(user, text) {
    this.ws.send({
      type: 'chat',
      user,
      text,
      timestamp: Date.now()
    });
  }
}

// 使用
const chat = new ChatRoom('ws://localhost:8080/chat');
chat.sendMessage('Alice', 'Hello everyone!');
```

### 2. 实时数据推送（股票行情、监控数据）

```javascript
class StockMonitor {
  constructor(url) {
    this.ws = new WebSocketClient(url, {
      onMessage: (data) => this.updateStock(data)
    });
    this.ws.connect();
  }

  updateStock(data) {
    const stock = JSON.parse(data);
    document.getElementById(`stock-${stock.symbol}`).textContent =
      `${stock.symbol}: $${stock.price}`;
  }

  subscribe(symbols) {
    this.ws.send({
      type: 'subscribe',
      symbols
    });
  }
}

// 使用
const monitor = new StockMonitor('ws://localhost:8080/stock');
monitor.subscribe(['AAPL', 'GOOGL', 'MSFT']);
```

### 3. 多人在线游戏

```javascript
class GameClient {
  constructor(url) {
    this.ws = new WebSocketClient(url, {
      onMessage: (data) => this.handleGameEvent(data)
    });
    this.ws.connect();
  }

  handleGameEvent(data) {
    const event = JSON.parse(data);
    switch (event.type) {
      case 'playerMove':
        this.updatePlayerPosition(event.playerId, event.position);
        break;
      case 'playerJoin':
        this.addPlayer(event.player);
        break;
      case 'gameStart':
        this.startGame(event.config);
        break;
    }
  }

  sendPlayerAction(action) {
    this.ws.send({
      type: 'playerAction',
      action,
      timestamp: Date.now()
    });
  }
}
```

### 4. AI 对话应用

```javascript
class AIChat {
  constructor(url) {
    this.ws = new WebSocketClient(url, {
      onMessage: (data) => this.handleAIResponse(data)
    });
    this.ws.connect();
  }

  handleAIResponse(data) {
    const response = JSON.parse(data);
    if (response.type === 'stream') {
      // 流式输出
      this.appendToChat(response.content);
    } else if (response.type === 'complete') {
      // 完整响应
      this.displayMessage(response.content);
    }
  }

  appendToChat(content) {
    const chatElement = document.getElementById('ai-response');
    chatElement.textContent += content;
  }

  sendPrompt(message) {
    this.ws.send({
      type: 'prompt',
      message,
      stream: true
    });
  }
}

// 使用
const aiChat = new AIChat('ws://localhost:8080/ai');
aiChat.sendPrompt('请解释一下 WebSocket 的工作原理');
```

## 最佳实践

### 1. 错误处理和日志

```javascript
class RobustWebSocket extends WebSocketClient {
  constructor(url, options = {}) {
    super(url, {
      ...options,
      onError: (error) => {
        this.logError('WebSocket Error', error);
        options.onError?.(error);
      }
    });
  }

  logError(message, error) {
    console.error(`[${new Date().toISOString()}] ${message}:`, error);
    // 可以发送到日志服务
  }

  send(data) {
    try {
      super.send(data);
    } catch (error) {
      this.logError('Send Error', error);
    }
  }
}
```

### 2. 消息确认机制

```javascript
class ReliableWebSocket extends WebSocketClient {
  constructor(url, options = {}) {
    super(url, options);
    this.pendingMessages = new Map();
    this.messageId = 0;
  }

  send(data) {
    const id = this.messageId++;
    const message = {
      id,
      data,
      timestamp: Date.now()
    };

    this.pendingMessages.set(id, message);
    super.send(message);

    // 超时重发
    setTimeout(() => {
      if (this.pendingMessages.has(id)) {
        console.warn('消息未确认，重发:', id);
        this.send(data);
      }
    }, 5000);
  }

  handleAck(messageId) {
    this.pendingMessages.delete(messageId);
  }
}
```

### 3. 连接状态管理

```javascript
const ConnectionState = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting'
};

class StatefulWebSocket extends WebSocketClient {
  constructor(url, options = {}) {
    super(url, options);
    this.state = ConnectionState.DISCONNECTED;
    this.listeners = [];
  }

  setState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.notifyStateChange(oldState, newState);
  }

  onStateChange(callback) {
    this.listeners.push(callback);
  }

  notifyStateChange(oldState, newState) {
    this.listeners.forEach(cb => cb(oldState, newState));
  }
}
```

## 总结

WebSocket 提供了高效的实时双向通信能力，适用于需要低延迟、高频率数据交换的场景。通过合理的封装和优化，可以构建稳定可靠的实时应用。选择技术时需要根据实际需求：

- **WebSocket**：需要双向实时通信
- **SSE**：仅需服务器推送，实现简单
- **Socket.IO**：需要更好的兼容性和自动降级
- **轮询**：兼容性要求高，实时性要求不高

合理运用这些技术，能够为用户提供流畅的实时体验。
