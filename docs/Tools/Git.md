---
title: Git 使用指南
date: 2026-01-19 11:46:00
tags:
  - Git
  - 版本控制
  - 工具
categories:
  - Tools
---

# Git 使用指南

## 概述

Git 是目前最流行的分布式版本控制系统，用于跟踪代码变更、协作开发和管理项目历史。

## 一、基础配置

```bash
# 配置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 查看配置
git config --list
```

## 二、基本操作

### 初始化仓库

```bash
git init                                  # 初始化新仓库
git clone https://github.com/user/repo.git   # 克隆远程仓库
```

### 文件操作

```bash
git status                    # 查看状态
git add .                     # 添加所有文件到暂存区
git commit -m "提交信息"       # 提交更改
git commit -am "提交信息"      # 添加并提交（已跟踪文件）
```

### 撤销操作

```bash
git restore file.txt                    # 撤销工作区修改
git restore --staged file.txt           # 撤销暂存
git reset HEAD~1                        # 回退上一次提交
```

## 三、分支管理

```bash
# 查看分支
git branch                    # 本地分支
git branch -a                 # 所有分支

# 创建和切换分支
git checkout -b feature       # 创建并切换
git switch -c feature         # 新命令

# 合并分支
git merge feature             # 合并到当前分支

# 删除分支
git branch -d feature         # 安全删除
git branch -D feature         # 强制删除
```

## 四、远程操作

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin https://github.com/user/repo.git

# 推送和拉取
git push -u origin main       # 首次推送
git pull origin main          # 拉取更新
git fetch origin              # 拉取所有分支
```

## 五、高级操作

### Stash（贮藏）

```bash
git stash                     # 贮藏当前修改
git stash list                # 查看贮藏列表
git stash pop                 # 应用并删除贮藏
git stash apply               # 应用贮藏（不删除）
```

### Rebase（变基）

```bash
git rebase main               # 变基到main分支
git rebase -i HEAD~3          # 交互式变基
git rebase --abort            # 取消变基
```

### Cherry-pick

```bash
git cherry-pick commit_hash   # 挑选特定提交
```

## 六、查看历史

```bash
git log                       # 查看提交历史
git log --oneline             # 简洁模式
git log --graph --all         # 图形化显示
git diff                      # 查看差异
```

## 七、标签管理

```bash
git tag v1.0.0                # 创建标签
git tag -a v1.0.0 -m "版本1.0.0"  # 带注释的标签
git push origin v1.0.0        # 推送标签
git push origin --tags        # 推送所有标签
```

## 八、最佳实践

### 提交信息规范

```bash
# 格式：<type>: <subject>
feat: 添加用户登录功能      # 新功能
fix: 修复登录按钮无响应      # 修复bug
docs: 更新README文档        # 文档更新
style: 代码格式调整         # 格式
refactor: 重构用户模块      # 重构
test: 添加单元测试         # 测试
chore: 更新依赖包          # 构建/工具
```

### .gitignore

```bash
# 依赖
node_modules/

# 构建产物
dist/
build/

# 环境变量
.env
.env.local

# IDE
.vscode/
.idea/

# 系统文件
.DS_Store
```

## 九、常见问题

### 撤销提交

```bash
git reset --soft HEAD~1       # 撤销提交，保留修改
git commit --amend            # 修改最后一次提交
```

### 解决冲突

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 手动解决冲突文件
# 冲突标记：<<<<<<< HEAD ... =======  ... >>>>>>> branch

# 3. 标记已解决
git add .

# 4. 提交合并
git commit -m "解决合并冲突"
```

### 强制推送

```bash
git push --force-with-lease origin main   # 更安全的强制推送
```

## 十、Git工作流

### Git Flow

```bash
main/master         # 生产环境
develop            # 开发环境
feature/*          # 功能分支
hotfix/*           # 紧急修复
release/*          # 发布分支
```

### 示例

```bash
# 开发新功能
git checkout -b feature/login develop
# 开发完成后合并到develop
git checkout develop
git merge feature/login
git branch -d feature/login
```

## 十一、技巧

### 别名配置

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
```

### SSH密钥

```bash
# 生成SSH密钥
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# 查看公钥
cat ~/.ssh/id_rsa.pub

# 测试连接
ssh -T git@github.com
```

## 参考资源

- [Git 官方文档](https://git-scm.com/doc)
- [Pro Git 书籍](https://git-scm.com/book/zh/v2)
- [GitHub Docs](https://docs.github.com/)
