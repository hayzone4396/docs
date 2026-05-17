---
title: 工程化设计
date: 2026-05-17 19:36:40
categories:
  - Architecture
---


# 前端工程化设计

>[!NOTE] 本文档整理自飞书课程，涵盖工程化设计的核心知识点，适合面试前快速复习。

---

## 一、理解

### 1. 请说说你的工程化设计

#### 核心目标

- **模块化、可维护、可扩展、可测试**
- **开发效率最大化**

#### 五大维度

| 维度 | 要点 |
|------|------|
| **目录结构** | 清晰分层：components、views、services、utils、store、tests |
| **工具链** | 构建工具(Webpack/Vite)、代码检查(ESLint/Prettier)、包管理(pnpm)、状态管理、路由 |
| **流程化** | Git 分支策略、代码提交规范、测试流程、CI/CD |
| **规范化** | 代码规范、提交规范、文档规范 |
| **自动化** | 自动化构建、测试、部署、代码检查 |

#### 典型目录结构

```
/project-root
├── /src
│   ├── /components     # 可复用 UI 组件
│   ├── /views          # 页面级组件
│   ├── /services       # API 服务
│   ├── /utils          # 工具函数
│   ├── /store          # 状态管理
│   └── /assets         # 静态资源
├── /tests              # 测试文件（unit/integration/e2e）
├── /scripts            # 辅助脚本
├── /config             # 配置文件
└── package.json
```

---

### 2. 对 CI/CD 的理解及方案

#### 概念

| 术语 | 全称 | 含义 |
|------|------|------|
| **CI** | Continuous Integration | 持续集成：频繁集成代码，自动构建测试 |
| **CD** | Continuous Delivery | 持续交付：自动部署到测试/预生产环境 |
| **CD** | Continuous Deployment | 持续部署：自动发布到生产环境 |

#### 核心流程

```
代码提交 → 构建 → 自动化测试 → 发布准备 → 部署
```

#### CI/CD 工具对比

| 工具 | 特点 | 适用场景 |
|------|------|----------|
| **Jenkins** | 开源、高度可定制、插件丰富 | 大型复杂项目，有运维团队 |
| **GitLab CI/CD** | 与 GitLab 无缝集成 | 使用 GitLab 的项目 |
| **GitHub Actions** | 与 GitHub 深度集成、社区工作流多 | 中小型项目，GitHub 用户 |
| **CircleCI** | 简单易用、支持 Docker | 中小型团队 |
| **Travis CI** | 云端服务、开源免费 | 开源项目 |
| **TeamCity** | JetBrains 出品、UI 友好 | 大型企业项目 |
| **阿里云效/tapd** | 国内云服务 | 国内团队 |

#### 选型考虑因素

- 技术栈支持（Docker/K8s）
- 项目规模
- 云平台集成
- 团队经验

---

## 二、项目分类与工程化设计

### 2.1 前端 vs 全栈

#### Vue 前端项目

```
my-vue-project/
├── public/           # 静态文件
├── src/
│   ├── assets/       # 静态资源
│   ├── components/   # 公共组件
│   ├── views/        # 页面组件
│   ├── router/       # 路由
│   ├── store/        # Vuex/Pinia
│   └── main.js
├── tests/
└── vue.config.js
```

#### Node.js + React 全栈项目

```
my-fullstack-project/
├── client/           # React 前端
│   ├── src/
│   └── package.json
├── server/           # Node.js 后端
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── models/
│   └── package.json
└── docker-compose.yml
```

### 2.2 Vue vs React 工程化差异

| 维度 | Vue | React |
|------|-----|-------|
| **脚手架** | Vue CLI / Vite | CRA / Vite / Next.js |
| **状态管理** | Vuex / Pinia | Redux / MobX / Zustand |
| **路由** | Vue Router | React Router |
| **测试** | Jest + Vue Test Utils | Jest + React Testing Library |
| **构建分析** | webpack-bundle-analyzer | 类似工具 |

### 2.3 Macrorepo vs Monorepo

| 特性 | Macrorepo（多仓库） | Monorepo（单仓库） |
|------|---------------------|---------------------|
| **结构** | 每个项目独立仓库 | 多个包在同一仓库 |
| **构建** | 各仓库独立构建 | 统一构建（Lerna/pnpm workspace） |
| **测试** | 各仓库独立测试 | 根目录统一测试 |
| **发布** | 独立发布 | 统一版本控制（Lerna/Nx） |
| **适用** | 独立项目 | 关联包/组件库 |

**Monorepo 工具**：Lerna、pnpm workspace、Nx

### 2.4 Node.js 项目类型

| 类型 | 特点 | 构建工具 |
|------|------|----------|
| **CLI 工具** | bin 字段指定入口，打包成可执行文件 | Webpack/Rollup |
| **服务端** | JS 无需构建，TS 可用 tsup | tsup / 无需构建 |

---

## 三、规范化设计

### 3.1 ESLint 配置（JS/TS）

```javascript
// eslint.config.js
import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
  { files: ['**/*.{js,mjs,cjs,ts,vue}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
]
```

**执行**：`pnpm lint`

### 3.2 Stylelint 配置（CSS/Styled）

```javascript
// stylelint.config.js
export default {
  extends: ['stylelint-config-standard'],
  customSyntax: 'postcss-styled-syntax',
  rules: {
    'block-no-empty': true,
    'comment-empty-line-before': null,
  },
}
```

**执行**：`pnpm lint:style`

### 3.3 命名检查（CSpell）

```json
// cspell.json
{
  "dictionaries": ["custom-words"],
  "dictionaryDefinitions": [{
    "name": "custom-words",
    "path": "./.cspell/custom-words.txt"
  }],
  "ignorePaths": ["**/node_modules/**", "**/dist/**"]
}
```

**执行**：`pnpm spellcheck`

### 3.4 提交规范（Commitlint + Husky）

**依赖**：`@commitlint/cli`、`@commitlint/config-conventional`、`commitizen`、`husky`、`cz-git`

```javascript
// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
  prompt: {
    types: [
      { value: 'feat', name: 'feat:     ✨  新功能' },
      { value: 'fix', name: 'fix:      🐛  修复' },
      { value: 'docs', name: 'docs:     📝  文档' },
      { value: 'style', name: 'style:    💄  格式' },
      { value: 'refactor', name: 'refactor: 📦️  重构' },
      { value: 'perf', name: 'perf:     🚀  性能' },
      { value: 'test', name: 'test:     🚨  测试' },
      { value: 'build', name: 'build:    🛠   构建' },
      { value: 'ci', name: 'ci:       🎡  CI配置' },
      { value: 'chore', name: 'chore:    🔨  其他' },
      { value: 'revert', name: 'revert:   ⏪️  回退' },
    ],
    useEmoji: true,
  }
}
```

**Husky 配置**：
```bash
# .husky/commit-msg
npx commitlint --edit "${1}"

# .husky/pre-commit
pnpm spellcheck && npx lint-staged
```

**执行**：`pnpm commit`（交互式提交）

---

## 四、流程化设计

### 完整开发流程

```
需求分析 → 项目规划 → 项目初始化 → UI/UX设计 → 开发 → 测试 → 代码审核 → CI/CD → 性能优化 → 部署运维 → 迭代回顾
```

### 各阶段要点

| 阶段 | 核心工作 |
|------|----------|
| **需求分析** | 需求收集、技术可行性分析 |
| **项目规划** | 架构设计、技术栈选择、任务分解 |
| **项目初始化** | 脚手架、Git 分支策略、代码规范、CI 配置 |
| **UI/UX 设计** | 设计稿输出、审核、切图标注 |
| **开发** | 组件开发、样式管理、状态管理、API 集成、联调 |
| **测试** | 单元测试(Jest)、集成测试(Cypress)、E2E(Playwright) |
| **代码审核** | Code Review、PR/MR 合并 |
| **CI/CD** | 自动化测试构建、自动部署 |
| **性能优化** | 代码拆分、懒加载、Tree Shaking、图片优化、CDN |
| **部署运维** | 生产部署、监控日志(Sentry)、持续更新 |
| **迭代回顾** | 版本迭代、项目复盘 |

### Git 分支策略

- **Git Flow**：main、develop、feature/*、release/*、hotfix/*
- **GitHub Flow**：main + feature 分支 + PR

---

## 五、自动化设计

### 5.1 自动化脚本清单

| 场景 | 工具/方案 |
|------|-----------|
| **项目初始化** | 自定义脚手架脚本、Cookiecutter |
| **代码规范** | ESLint + Prettier + Husky + lint-staged |
| **CI/CD** | GitHub Actions / GitLab CI / Jenkins |
| **自动部署** | Docker + K8s / Vercel / Netlify |
| **性能分析** | Lighthouse CI、webpack-bundle-analyzer |

### 5.2 典型 CI/CD 配置（GitHub Actions）

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install
        run: pnpm install
      - name: Lint
        run: pnpm lint
      - name: Test
        run: pnpm test
      - name: Build
        run: pnpm build
```

---

## 六、快速记忆卡片

### 工程化设计五维模型

```
目录结构 + 工具链 + 流程化 + 规范化 + 自动化
```

### CI/CD 工具选择口诀

```
大型项目用 Jenkins，GitLab 用户选 GitLab CI
GitHub 项目 Actions，快速上手 CircleCI
开源免费 Travis CI，企业可视 TeamCity
国内团队云效/tapd，Azure 生态 DevOps
```

### 规范化工具链

```
JS/TS  → ESLint + Prettier
CSS    → Stylelint
命名   → CSpell
提交   → Commitlint + Husky + cz-git
```

### 测试金字塔

```
    /\
   /  \     E2E (Cypress/Playwright)
  /____\
 /      \   集成测试
/________\
            单元测试 (Jest)
```

---

## 七、知识点

### 模板：工程化设计

> "在我的项目中，工程化设计主要从五个维度展开：
> 
> 1. **目录结构**：采用分层设计，components/views/services/utils/store 各司其职
> 2. **工具链**：构建用 Vite，代码规范用 ESLint+Prettier，包管理用 pnpm
> 3. **流程化**：Git Flow 分支管理，PR Code Review，Jest+Cypress 测试
> 4. **规范化**：ESLint 代码检查、Stylelint 样式检查、Commitlint 提交规范
> 5. **自动化**：Husky 预提交检查、GitHub Actions CI/CD、自动部署到服务器"

### 模板：CI/CD 理解

> "CI/CD 是持续集成和持续交付/部署的缩写。
> 
> **CI** 指频繁集成代码并自动构建测试，**CD** 分两种：持续交付是自动部署到测试环境，持续部署是自动发布到生产。
> 
> 我常用的方案是 GitHub Actions，配置 YAML 文件实现：代码提交 → 安装依赖 → 代码检查 → 运行测试 → 构建 → 部署。
> 
> 对于复杂项目也会用 Jenkins，它有丰富的插件生态，适合高度自定义的流水线。"

---

*文档生成时间：2025-05-17*
