---
title: Webpack 构建工具
date: 2026-01-19 11:42:00
tags:
  - Webpack
  - 构建工具
categories:
  - Tools
---

# Webpack 构建工具

## 概述

Webpack 是现代 JavaScript 应用的静态模块打包工具，将项目中的各种资源视为模块，并打包成浏览器可识别的文件。

## 核心概念

- **Entry**：入口起点，指示 webpack 从哪个模块开始构建
- **Output**：输出，指示 webpack 在哪里输出打包文件
- **Loader**：转换器，处理非 JS 文件
- **Plugin**：插件，执行更广泛的任务
- **Mode**：模式（development/production）

## 基础配置

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 入口
  entry: './src/index.js',

  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true  // 清理输出目录
  },

  // 模块规则
  module: {
    rules: [
      // 处理 JS
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      // 处理 CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      // 处理图片
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource'
      }
    ]
  },

  // 插件
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],

  // 开发服务器
  devServer: {
    static: './dist',
    port: 3000,
    open: true,
    hot: true
  },

  // 模式
  mode: 'development'
};
```

## 常用 Loader

```bash
# Babel（转换 ES6+）
npm install -D babel-loader @babel/core @babel/preset-env

# CSS
npm install -D style-loader css-loader

# Sass/Less
npm install -D sass-loader sass
npm install -D less-loader less

# 图片和字体（Webpack 5 内置）
# 无需安装，使用 asset modules

# TypeScript
npm install -D ts-loader typescript

# Vue
npm install -D vue-loader vue-template-compiler
```

## 常用 Plugin

```bash
# HTML 模板
npm install -D html-webpack-plugin

# 提取 CSS
npm install -D mini-css-extract-plugin

# 压缩 CSS
npm install -D css-minimizer-webpack-plugin

# 复制静态文件
npm install -D copy-webpack-plugin

# 环境变量
# 使用内置的 DefinePlugin
```

## 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

## 性能优化

### 1. 缓存

```javascript
output: {
  filename: '[name].[contenthash].js',  // 内容哈希
  chunkFilename: '[name].[contenthash].js'
}
```

### 2. Tree Shaking

```javascript
// package.json
{
  "sideEffects": false  // 标记无副作用
}

// webpack.config.js
mode: 'production'  // 生产模式自动启用
```

### 3. 压缩

```javascript
const TerserPlugin = require('terser-webpack-plugin');

optimization: {
  minimize: true,
  minimizer: [new TerserPlugin()]
}
```

### 4. 多进程构建

```bash
npm install -D thread-loader
```

```javascript
module: {
  rules: [
    {
      test: /\.js$/,
      use: [
        'thread-loader',  // 放在其他 loader 之前
        'babel-loader'
      ]
    }
  ]
}
```

## 环境变量

```javascript
const webpack = require('webpack');

plugins: [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
    'API_URL': JSON.stringify('https://api.example.com')
  })
]
```

## Source Map

```javascript
// 开发环境
devtool: 'eval-source-map'

// 生产环境
devtool: 'source-map'  // 或 false
```

## 完整示例

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource'
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    isProd && new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ].filter(Boolean),

  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },

  devServer: {
    static: './dist',
    port: 3000,
    hot: true
  },

  devtool: isProd ? 'source-map' : 'eval-source-map'
};
```

## 常见问题

### 构建速度慢？
- 使用 `cache: { type: 'filesystem' }`
- 减少 loader 处理范围（exclude: /node_modules/）
- 使用 thread-loader 多进程构建

### 打包体积大？
- 代码分割
- Tree Shaking
- 压缩代码
- 使用 webpack-bundle-analyzer 分析

## 参考资源

- [Webpack 官方文档](https://webpack.js.org/)
- [Webpack 中文文档](https://webpack.docschina.org/)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
