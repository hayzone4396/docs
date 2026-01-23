---
title: WebRTC 完全指南
description: 深入了解 WebRTC 实时通信技术，包括原理解析、实战应用及点对点连接实现
tags:
  - WebRTC
  - 实时通信
  - 点对点连接
date: 2026-01-23 15:40:00
---

# WebRTC 完全指南

## 什么是 WebRTC？

WebRTC（Web Real-Time Communication）是一个支持网页浏览器进行实时语音对话或视频对话的 API。它允许网络应用或站点在不借助中间媒介的情况下，建立浏览器之间点对点（Peer-to-Peer）的连接，实现视频流、音频流或其他任意数据的传输。

### 核心特性

- **点对点通信**：数据直接在浏览器之间传输，无需服务器中转
- **低延迟**：实时传输，延迟通常在毫秒级
- **无需插件**：浏览器原生支持，无需安装额外插件
- **安全性**：强制使用加密（DTLS 和 SRTP）
- **跨平台**：支持桌面和移动端

## 核心概念

### 1. 三大 API

```javascript
// 1. MediaStream（getUserMedia）- 获取音视频流
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
})
.then(stream => {
  // 处理媒体流
  video.srcObject = stream;
})
.catch(error => {
  console.error('获取媒体失败:', error);
});

// 2. RTCPeerConnection - P2P 连接
const pc = new RTCPeerConnection(configuration);

// 3. RTCDataChannel - 数据通道
const dataChannel = pc.createDataChannel('myChannel');
```

### 2. 信令过程（Signaling）

WebRTC 需要信令服务器来交换连接信息，但数据传输是 P2P 的。

```
客户端 A                信令服务器              客户端 B
   |                        |                      |
   |------ Offer -------->  |                      |
   |                        |------ Offer ------> |
   |                        | <----- Answer ------ |
   | <----- Answer --------  |                     |
   |                        |                      |
   |<====== P2P 连接建立 =====>|
```

## WebRTC 封装类

实现一个功能完善的 WebRTC 管理类，可直接用于项目。

```javascript
class WebRTCClient {
  constructor(signalingServer, options = {}) {
    this.signalingServer = signalingServer;
    this.options = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      ...options
    };

    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;

    this.initSignaling();
  }

  // 初始化信令连接
  initSignaling() {
    this.ws = new WebSocket(this.signalingServer);

    this.ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'offer':
          await this.handleOffer(message.offer);
          break;
        case 'answer':
          await this.handleAnswer(message.answer);
          break;
        case 'ice-candidate':
          await this.handleIceCandidate(message.candidate);
          break;
      }
    };
  }

  // 创建 PeerConnection
  createPeerConnection() {
    this.pc = new RTCPeerConnection({
      iceServers: this.options.iceServers
    });

    // ICE 候选收集
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignaling({
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    // 接收远程流
    this.pc.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      this.options.onRemoteStream?.(this.remoteStream);
    };

    // 连接状态变化
    this.pc.onconnectionstatechange = () => {
      console.log('连接状态:', this.pc.connectionState);
      this.options.onConnectionStateChange?.(this.pc.connectionState);
    };

    return this.pc;
  }

  // 获取本地媒体流
  async getLocalStream(constraints = { video: true, audio: true }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.options.onLocalStream?.(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('获取本地媒体失败:', error);
      throw error;
    }
  }

  // 添加本地流到连接
  addLocalStream() {
    if (!this.localStream || !this.pc) return;

    this.localStream.getTracks().forEach(track => {
      this.pc.addTrack(track, this.localStream);
    });
  }

  // 创建并发送 Offer
  async createOffer() {
    if (!this.pc) this.createPeerConnection();

    this.addLocalStream();

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    this.sendSignaling({
      type: 'offer',
      offer: this.pc.localDescription
    });
  }

  // 处理接收到的 Offer
  async handleOffer(offer) {
    if (!this.pc) this.createPeerConnection();

    this.addLocalStream();

    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    this.sendSignaling({
      type: 'answer',
      answer: this.pc.localDescription
    });
  }

  // 处理接收到的 Answer
  async handleAnswer(answer) {
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  // 处理 ICE 候选
  async handleIceCandidate(candidate) {
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('添加 ICE 候选失败:', error);
    }
  }

  // 创建数据通道
  createDataChannel(label = 'dataChannel') {
    if (!this.pc) this.createPeerConnection();

    this.dataChannel = this.pc.createDataChannel(label);

    this.dataChannel.onopen = () => {
      console.log('数据通道已打开');
      this.options.onDataChannelOpen?.();
    };

    this.dataChannel.onmessage = (event) => {
      this.options.onDataChannelMessage?.(event.data);
    };

    return this.dataChannel;
  }

  // 监听数据通道
  listenDataChannel() {
    if (!this.pc) return;

    this.pc.ondatachannel = (event) => {
      this.dataChannel = event.channel;

      this.dataChannel.onmessage = (e) => {
        this.options.onDataChannelMessage?.(e.data);
      };
    };
  }

  // 发送数据
  sendData(data) {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  // 发送信令消息
  sendSignaling(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // 切换摄像头
  async switchCamera() {
    const videoTrack = this.localStream?.getVideoTracks()[0];
    if (!videoTrack) return;

    const constraints = {
      video: {
        facingMode: videoTrack.getSettings().facingMode === 'user' ? 'environment' : 'user'
      }
    };

    const newStream = await navigator.mediaDevices.getUserMedia(constraints);
    const newVideoTrack = newStream.getVideoTracks()[0];

    const sender = this.pc.getSenders().find(s => s.track?.kind === 'video');
    if (sender) {
      await sender.replaceTrack(newVideoTrack);
      videoTrack.stop();
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);
    }
  }

  // 静音/取消静音
  toggleAudio(enabled) {
    this.localStream?.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  // 开启/关闭视频
  toggleVideo(enabled) {
    this.localStream?.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  // 关闭连接
  close() {
    this.dataChannel?.close();
    this.pc?.close();
    this.localStream?.getTracks().forEach(track => track.stop());
    this.ws?.close();

    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
  }
}
```

## 使用示例

### 1. 视频通话应用

```javascript
// 呼叫方
const caller = new WebRTCClient('ws://localhost:8080/signaling', {
  onLocalStream: (stream) => {
    document.getElementById('localVideo').srcObject = stream;
  },
  onRemoteStream: (stream) => {
    document.getElementById('remoteVideo').srcObject = stream;
  },
  onConnectionStateChange: (state) => {
    console.log('连接状态:', state);
  }
});

// 开始通话
async function startCall() {
  await caller.getLocalStream({
    video: { width: 1280, height: 720 },
    audio: true
  });
  await caller.createOffer();
}

// 接听方
const receiver = new WebRTCClient('ws://localhost:8080/signaling', {
  onLocalStream: (stream) => {
    document.getElementById('localVideo').srcObject = stream;
  },
  onRemoteStream: (stream) => {
    document.getElementById('remoteVideo').srcObject = stream;
  }
});

// 接听会自动处理（handleOffer 会自动触发）
await receiver.getLocalStream();

// 控制按钮
document.getElementById('muteBtn').onclick = () => {
  caller.toggleAudio(false);
};

document.getElementById('videoBtn').onclick = () => {
  caller.toggleVideo(false);
};

document.getElementById('switchCameraBtn').onclick = () => {
  caller.switchCamera();
};
```

### 2. 屏幕共享

```javascript
class ScreenShare extends WebRTCClient {
  async getScreenStream() {
    try {
      this.localStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: false
      });

      // 监听用户停止共享
      this.localStream.getVideoTracks()[0].onended = () => {
        this.options.onScreenShareEnded?.();
      };

      this.options.onLocalStream?.(this.localStream);
      return this.localStream;
    } catch (error) {
      console.error('获取屏幕共享失败:', error);
      throw error;
    }
  }
}

// 使用
const screenShare = new ScreenShare('ws://localhost:8080/signaling', {
  onLocalStream: (stream) => {
    document.getElementById('screenVideo').srcObject = stream;
  },
  onScreenShareEnded: () => {
    console.log('屏幕共享已停止');
  }
});

await screenShare.getScreenStream();
await screenShare.createOffer();
```

### 3. 点对点文件传输

```javascript
class FileTransfer extends WebRTCClient {
  constructor(signalingServer, options = {}) {
    super(signalingServer, options);
    this.fileReader = new FileReader();
    this.receivedChunks = [];
  }

  async sendFile(file) {
    if (!this.dataChannel) {
      this.createDataChannel('fileTransfer');
    }

    const chunkSize = 16384; // 16KB
    let offset = 0;

    // 发送文件元信息
    this.sendData({
      type: 'file-meta',
      name: file.name,
      size: file.size,
      fileType: file.type
    });

    // 分块发送
    const readSlice = () => {
      const slice = file.slice(offset, offset + chunkSize);
      this.fileReader.readAsArrayBuffer(slice);
    };

    this.fileReader.onload = (e) => {
      this.dataChannel.send(e.target.result);
      offset += e.target.result.byteLength;

      this.options.onProgress?.(offset / file.size);

      if (offset < file.size) {
        readSlice();
      } else {
        this.sendData({ type: 'file-complete' });
      }
    };

    readSlice();
  }

  handleFileData(data) {
    if (typeof data === 'string') {
      const message = JSON.parse(data);

      if (message.type === 'file-meta') {
        this.fileMetadata = message;
        this.receivedChunks = [];
      } else if (message.type === 'file-complete') {
        this.saveFile();
      }
    } else {
      this.receivedChunks.push(data);
    }
  }

  saveFile() {
    const blob = new Blob(this.receivedChunks, {
      type: this.fileMetadata.fileType
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileMetadata.name;
    a.click();

    URL.revokeObjectURL(url);
    this.options.onFileReceived?.(this.fileMetadata.name);
  }
}

// 使用
const fileTransfer = new FileTransfer('ws://localhost:8080/signaling', {
  onDataChannelMessage: (data) => {
    fileTransfer.handleFileData(data);
  },
  onProgress: (progress) => {
    console.log(`传输进度: ${(progress * 100).toFixed(2)}%`);
  },
  onFileReceived: (filename) => {
    console.log(`文件接收完成: ${filename}`);
  }
});

// 发送文件
document.getElementById('fileInput').onchange = (e) => {
  const file = e.target.files[0];
  fileTransfer.sendFile(file);
};
```

## 与其他技术对比

### WebRTC vs HTTP

| 特性 | HTTP | WebRTC |
|------|------|--------|
| 传输方式 | 客户端-服务器 | 点对点 |
| 延迟 | 较高（需服务器中转） | 极低（直连） |
| 带宽消耗 | 服务器带宽压力大 | 服务器仅信令交换 |
| 适用场景 | 文件下载、API 请求 | 实时音视频、游戏 |
| 实现复杂度 | 简单 | 复杂 |

### WebRTC vs WebSocket

| 特性 | WebSocket | WebRTC |
|------|-----------|--------|
| 连接方式 | 客户端-服务器 | 点对点（P2P） |
| 数据类型 | 文本和二进制 | 音视频流、二进制数据 |
| 延迟 | 低 | 更低 |
| NAT 穿透 | 不需要 | 需要（STUN/TURN） |
| 适用场景 | 聊天、通知推送 | 视频会议、实时游戏 |
| 服务器负载 | 高（中转所有数据） | 低（仅信令） |

## 使用场景

### 1. 视频会议系统

```javascript
class VideoConference {
  constructor() {
    this.participants = new Map();
    this.localClient = null;
  }

  async joinConference(roomId) {
    this.localClient = new WebRTCClient(`ws://localhost:8080/room/${roomId}`, {
      onRemoteStream: (stream, peerId) => {
        this.addParticipant(peerId, stream);
      }
    });

    await this.localClient.getLocalStream();
    await this.localClient.createOffer();
  }

  addParticipant(peerId, stream) {
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.id = `participant-${peerId}`;

    document.getElementById('participants').appendChild(videoElement);
    this.participants.set(peerId, stream);
  }

  removeParticipant(peerId) {
    const videoElement = document.getElementById(`participant-${peerId}`);
    videoElement?.remove();
    this.participants.delete(peerId);
  }
}
```

### 2. 实时游戏

```javascript
class GameP2P extends WebRTCClient {
  constructor(signalingServer) {
    super(signalingServer, {
      onDataChannelMessage: (data) => this.handleGameData(data)
    });

    this.createDataChannel('game');
  }

  handleGameData(data) {
    const gameData = JSON.parse(data);

    switch (gameData.type) {
      case 'playerMove':
        this.updatePlayerPosition(gameData.position);
        break;
      case 'gameState':
        this.syncGameState(gameData.state);
        break;
    }
  }

  sendPlayerAction(action) {
    this.sendData({
      type: 'playerMove',
      position: action.position,
      timestamp: Date.now()
    });
  }

  syncGameState(state) {
    // 同步游戏状态
    console.log('同步游戏状态:', state);
  }
}
```

### 3. 在线教育白板

```javascript
class Whiteboard extends WebRTCClient {
  constructor(signalingServer) {
    super(signalingServer, {
      onDataChannelMessage: (data) => this.handleDrawing(data)
    });

    this.createDataChannel('whiteboard');
    this.canvas = document.getElementById('whiteboard');
    this.ctx = this.canvas.getContext('2d');

    this.initDrawingEvents();
  }

  initDrawingEvents() {
    let isDrawing = false;

    this.canvas.onmousedown = () => isDrawing = true;
    this.canvas.onmouseup = () => isDrawing = false;

    this.canvas.onmousemove = (e) => {
      if (!isDrawing) return;

      const point = { x: e.offsetX, y: e.offsetY };
      this.draw(point);
      this.sendData({ type: 'draw', point });
    };
  }

  draw(point) {
    this.ctx.lineTo(point.x, point.y);
    this.ctx.stroke();
  }

  handleDrawing(data) {
    const message = JSON.parse(data);
    if (message.type === 'draw') {
      this.draw(message.point);
    }
  }
}
```

## 信令服务器实现（Node.js）

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const rooms = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join':
        handleJoin(ws, data.roomId);
        break;
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        broadcast(ws, data.roomId, message);
        break;
    }
  });
});

function handleJoin(ws, roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(ws);
  ws.roomId = roomId;
}

function broadcast(sender, roomId, message) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
```

## 最佳实践

### 1. TURN 服务器配置（处理 NAT 穿透失败）

```javascript
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'password'
    }
  ]
};
```

### 2. 带宽自适应

```javascript
async function setBitrate(pc, bitrate) {
  const sender = pc.getSenders().find(s => s.track?.kind === 'video');
  if (!sender) return;

  const parameters = sender.getParameters();
  if (!parameters.encodings) {
    parameters.encodings = [{}];
  }

  parameters.encodings[0].maxBitrate = bitrate;
  await sender.setParameters(parameters);
}

// 根据网络状况调整
setBitrate(pc, 500000); // 500kbps
```

### 3. 错误处理

```javascript
pc.oniceconnectionstatechange = () => {
  if (pc.iceConnectionState === 'failed') {
    console.error('ICE 连接失败，尝试重启');
    pc.restartIce();
  }
};
```

## 总结

WebRTC 是实现实时音视频通信的最佳选择，具有以下优势：

- **低延迟**：点对点连接，延迟极低
- **高质量**：支持高清音视频传输
- **节省成本**：服务器仅处理信令，不中转数据
- **安全性**：内置加密机制

适用于视频会议、在线教育、远程医疗、实时游戏等场景。配合合适的信令服务器和 TURN 服务器，可以构建稳定可靠的实时通信系统。
