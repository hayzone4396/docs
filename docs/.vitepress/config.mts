import { defineConfig } from 'vitepress';
// 导入主题的配置
import { blogTheme } from './blog-theme';
// import { SponsorPlugin } from 'vitepress-plugin-sponsor';

// 如果使用 GitHub/Gitee Pages 等公共平台部署
// 通常需要修改 base 路径，通常为“/仓库名/”
// const base = process.env.GITHUB_ACTIONS === 'true'
//   ? '/vitepress-blog-sugar-template/'
//   : '/'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // 忽略死链
  ignoreDeadLinks: true,
  // 继承博客主题(@sugarat/theme)
  extends: blogTheme,
  lang: 'zh-cn',
  title: '| 码间拾光',
  description: '为学应尽毕生力，攀高须贵少年时',
  lastUpdated: false,
  // 详见：https://vitepress.dev/zh/reference/site-config#head
  head: [
    // 配置网站的图标（显示在浏览器的 tab 上）
    // ['link', { rel: 'icon', href: `${base}favicon.ico` }], // 修改了 base 这里也需要同步修改
    ['link', { rel: 'icon', href: 'img/favicon.png' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-web/style.css',
      },
    ],
  ],
  themeConfig: {
    // 展示 2,3 级标题在目录中
    outline: {
      level: [2, 3],
      label: '目录',
    },
    // 默认文案修改
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '相关文章',
    lastUpdated: {
      text: '上次更新于',
    },
    // 设置logo
    logo: '/img/favicon.png',
    // 导航栏
    nav: [
      { text: 'JavaScript', link: '/JavaScript/' },
      { text: 'Css', link: '/Css/' },
      { text: '工具', link: '/Tools/' },
      { text: 'Nodejs', link: '/Nodejs/' },
      { text: '小程序', link: '/MiniProgram/' },
      { text: '架构', link: '/Architecture/' },
      { text: 'AI', link: '/AI/' },
      { text: '美文一览', link: '/Life/' },
    ],
    // 友链
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/hay-zone',
      },
    ],
    // 侧边栏
    sidebar: {
      '/Life/': [
        { text: '山的那边', link: '/Life/山的那边' },
        { text: '滴露的康乃馨', link: '/Life/滴露的康乃馨' },
        { text: '破阵子', link: '/Life/破阵子' },
        { text: '我打江南走过', link: '/Life/我打江南走过' },
      ],
      '/JavaScript/': [
        {
          text: 'ES6+',
          collapsed: false,
          items: [
            { text: '基础', link: '/JavaScript/基础' },
            { text: 'ES6+ 新特性', link: '/JavaScript/ES6+%20新特性' },
            { text: '异步编程', link: '/JavaScript/异步编程' },
          ],
        },
        {
          text: 'React',
          collapsed: true,
          items: [
            { text: '概述', link: '/JavaScript/React/概述' },
            { text: 'Hooks', link: '/JavaScript/React/Hooks' },
            { text: '性能优化', link: '/JavaScript/React/性能优化' },
          ],
        },
        {
          text: 'Vue',
          collapsed: true,
          items: [
            { text: '概述', link: '/JavaScript/Vue/概述' },
            { text: '状态管理', link: '/JavaScript/Vue/状态管理' },
            {
              text: 'Composition API',
              link: '/JavaScript/Vue/Composition API',
            },
          ],
        },
        {
          text: 'TypeScript',
          collapsed: true,
          items: [
            { text: '概述', link: '/JavaScript/TypeScript/概述' },
            { text: '进阶', link: '/JavaScript/TypeScript/进阶' },
            { text: '最佳实践', link: '/JavaScript/TypeScript/最佳实践' },
          ],
        },
        {
          text: 'HTTP',
          collapsed: true, // 默认展开，true 为折叠
          items: [
            {
              text: 'HTTP 缓存完全指南',
              link: '/JavaScript/Http/HTTP 缓存完全指南',
            },
            { text: 'HTTP2 完全指南', link: '/JavaScript/Http/HTTP2 完全指南' },
            {
              text: 'HTTP 缓存与 HTTP2 核心要点',
              link: '/JavaScript/Http/HTTP 缓存与 HTTP2 核心要点',
            },
          ],
        },
      ],
      '/Css/': [
        { text: '移动端 1px 问题', link: '/Css/移动端 1px 问题' },
        { text: 'Margin 塌陷问题', link: '/Css/Margin 塌陷问题' },
      ],
      '/Tools/': [
        { text: 'Git', link: '/Tools/Git' },
        { text: 'Vite', link: '/Tools/Vite' },
        { text: 'Webpack', link: '/Tools/Webpack' },
      ],
      '/Architecture/': [
        { text: '设计模式', link: '/Architecture/设计模式' },
        { text: '微服务架构', link: '/Architecture/微服务架构' },
        { text: '系统设计', link: '/Architecture/系统设计' },
      ],
      '/AI/': [
        { text: '机器学习基础', link: '/AI/机器学习基础' },
        { text: '计算机视觉', link: '/AI/计算机视觉' },
        { text: '大语言模型', link: '/AI/大语言模型' },
        { text: 'Claude 接入 GLM4.7', link: '/AI/claude-GLM' },
      ],
      '/Nodejs/': [
        {
          text: 'Nodejs',
          collapsed: false,
          items: [
            { text: '基础概述', link: '/Nodejs/基础概述' },
            { text: '异步编程', link: '/Nodejs/异步编程' },
          ],
        },
        {
          text: 'Koa',
          collapsed: false,
          items: [{ text: 'Koa', link: '/Nodejs/Koa' }],
        },
        {
          text: 'Express',
          collapsed: false,
          items: [{ text: 'Express', link: '/Nodejs/Express' }],
        },
        {
          text: 'Eggjs',
          collapsed: false,
          items: [{ text: 'Eggjs', link: '/Nodejs/Eggjs' }],
        },
        {
          text: 'Nestjs',
          collapsed: false,
          items: [{ text: 'Nestjs', link: '/Nodejs/Nestjs' }],
        },
        {
          text: 'Deno',
          collapsed: false,
          items: [{ text: 'Deno', link: '/Nodejs/deno' }],
        },
      ],
      '/MiniProgram/': [
        {
          text: '小程序',
          collapsed: false,
          items: [
            { text: '小程序基础', link: '/MiniProgram/Origin/小程序基础' },
            { text: '小程序组件', link: '/MiniProgram/Origin/小程序组件' },
            { text: '网络请求', link: '/MiniProgram/Origin/网络请求' },
          ],
        },
        {
          text: 'Uniapp',
          collapsed: false,
          items: [
            { text: 'Uniapp 基础', link: '/MiniProgram/Uniapp/Uniapp 基础' },
            { text: 'Uniapp 其他', link: '/MiniProgram/Uniapp/Uniapp 其他' },
          ],
        },
        {
          text: 'Taro',
          collapsed: false,
          items: [
            { text: 'Taro 基础', link: '/MiniProgram/Taro/Taro 基础' },
            { text: 'Taro 其他', link: '/MiniProgram/Taro/Taro 其他' },
          ],
        },
      ],
    },
  },
  vite: {
    plugins: [
      // 打赏插件
    //   SponsorPlugin({
    //     /**
    //      * 打赏模块样式
    //      */
    //     type: 'simple',
    //     aliPayQR: 'https://sloving.top/img/aliPayQR.jpg',
    //     weChatQR: 'https://sloving.top/img/weChatQR.png',
    //   }),
    ],
  },
});
