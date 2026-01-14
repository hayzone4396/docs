---
title: Claude 集成 GLM-4.7
date: 2026-01-14 17:00:00
tags:
  - Claude
  - GLM
categories:
  - AI
---

# Claude 集成 GLM-4.7


## 简介

GLM-4.7 是智谱 AI 推出的最新大语言模型，现已支持集成到 Claude Code 中使用。通过简单的配置，您可以在 Claude Code 中使用 GLM-4.7 强大的代码生成、分析和理解能力。

**官方文档**: https://bigmodel.cn/glm-coding

## 购买服务

### 访问官网

前往 [智谱 AI GLM Coding](https://bigmodel.cn/glm-coding) 页面

### 选择套餐

1. 选择「连续包月」选项
2. 选择一个月试用期
3. 完成支付流程

![GLM-4.7 Coding](./assets/1.png)

### 获取 API Key

购买完成后，您将获得专属的 API Key，请妥善保管。

![GLM-4.7 Coding](./assets/3.png)

## 配置步骤

### 1. 配置 settings.json

根据您的操作系统，编辑或创建配置文件：

**MacOS & Linux**: `~/.claude/settings.json`

**Windows**: `用户目录/.claude/settings.json`

添加以下配置（请替换 `your_zhipu_api_key` 为您的实际 API Key）：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_zhipu_api_key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": 1
  }
}
```

**配置说明**:
- `ANTHROPIC_AUTH_TOKEN`: 您的智谱 API Key
- `ANTHROPIC_BASE_URL`: 智谱 API 的基础地址
- `API_TIMEOUT_MS`: API 请求超时时间（毫秒）
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`: 禁用非必要流量

### 2. 配置 .claude.json

根据您的操作系统，编辑或创建配置文件：

**MacOS & Linux**: `~/.claude.json`

**Windows**: `用户目录/.claude.json`

添加以下配置：

```json
{
  "hasCompletedOnboarding": true
}
```

此配置用于跳过 Claude Code 的引导流程。

## 验证配置

配置完成后，重启 Claude Code，您现在就可以使用 GLM-4.7 模型了！

可以通过以下方式验证：
1. 打开 Claude Code
2. 尝试提问或生成代码
3. 观察是否正常响应
4. 在控制台或者其他命令行输入 claude 回车，之后就能看到结果了

![GLM-4.7 Coding](./assets/2.png)

## 常见问题

### 配置后无法连接

1. 检查 API Key 是否正确
2. 确认网络连接正常
3. 验证 `ANTHROPIC_BASE_URL` 设置正确

### 响应速度慢

可以适当增加 `API_TIMEOUT_MS` 的值。

### 详细配置文档

更多详细配置和问题排查，请访问官方文档：
https://docs.bigmodel.cn/cn/coding-plan/tool/claude

## 总结

通过简单的配置，您就可以在 Claude Code 中使用 GLM-4.7 的强大能力。智谱 AI 提供的这款模型在代码生成、理解和分析方面表现出色，是提升开发效率的绝佳选择。
