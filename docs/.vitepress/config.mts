import { defineConfig } from 'vitepress';
// 导入主题的配置
import { blogTheme } from './blog-theme';
// import { SponsorPlugin } from 'vitepress-plugin-sponsor';

// 如果使用 GitHub/Gitee Pages 等公共平台部署
// 通常需要修改 base 路径，通常为"/仓库名/"
const base = process.env.GITHUB_ACTIONS === 'true'
  ? '/docs/'
  : '/'

// Vitepress 默认配置
// 详见文档：https://vitepress.dev/reference/site-config
export default defineConfig({
  // 设置站点的基础路径
  base,
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
    ['link', { rel: 'icon', href: `${base}img/favicon.png` }],
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
      { text: '杂货铺', link: '/CornerStore/' },
      { text: 'JavaScript', link: '/JavaScript/' },
      { text: 'Css', link: '/Css/' },
      { text: '工具', link: '/Tools/' },
      { text: 'Nodejs', link: '/Nodejs/' },
      { text: '小程序', link: '/MiniProgram/' },
      { text: '架构', link: '/Architecture/' },
      { text: 'AI', link: '/AI/' },
      { text: '流年絮语', link: '/Life/' },
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
        { text: '二十年前的今天，像极了此时此刻 <span class="sidebar-date">2026-01-19</span>', link: '/Life/millennium-memories' },
        { text: '珍惜时光，记忆童年 <span class="sidebar-date">2026-01-19</span>', link: '/Life/childhood-memories' },
        { text: '让高飞的心永不沉沦 <span class="sidebar-date">2026-01-15</span>', link: '/Life/soaring-heart' },
        { text: '归去来兮辞 <span class="sidebar-date">2026-01-15</span>', link: '/Life/returning-home' },
        { text: '山的那边 <span class="sidebar-date">2026-01-14</span>', link: '/Life/beyond-the-mountains' },
        { text: '滴露的康乃馨 <span class="sidebar-date">2026-01-13</span>', link: '/Life/carnation' },
        { text: '破阵子 <span class="sidebar-date">2026-01-13</span>', link: '/Life/song-of-breaking-the-array' },
        { text: '我打江南走过 <span class="sidebar-date">2026-01-13</span>', link: '/Life/jiangnan' },
      ],
      '/JavaScript/': [
        {
          text: 'JavaScript',
          collapsed: true,
          items: [
            { text: 'Promise 完全指南 <span class="sidebar-date">2026-01-23</span>', link: '/JavaScript/promise' },
            { text: 'JavaScript 异步机制深度解析 <span class="sidebar-date">2026-01-23</span>', link: '/JavaScript/async-mechanism-deep-dive' },
            { text: 'WebSocket 完全指南 <span class="sidebar-date">2026-01-23</span>', link: '/JavaScript/websocket' },
            { text: 'WebRTC 完全指南 <span class="sidebar-date">2026-01-23</span>', link: '/JavaScript/webrtc' },
            { text: '大数据精度丢失与前端处理方案 <span class="sidebar-date">2026-01-23</span>', link: '/JavaScript/bignumber-precision' },
            { text: 'JavaScript 字符串代码执行方法详解 <span class="sidebar-date">2026-01-23</span>', link: '/JavaScript/execute-string-code' },
            { text: 'CSS 高度自适应动画实现方案 <span class="sidebar-date">2026-01-23</span>', link: '/JavaScript/height-animation-auto' },
            { text: 'Base64 编码原理与应用 <span class="sidebar-date">2026-01-23</span>', link: '/JavaScript/base64-encoding' },
            { text: '标签切换竞态条件问题与解决方案 <span class="sidebar-date">2026-01-21</span>', link: '/JavaScript/tab-switch-race-condition' },
            { text: '箭头函数 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/arrow-function' },
            { text: '地址栏URL，闭包，NEW关键字 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/core-concepts' },
            { text: '基础 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/basic' },
            { text: 'ES6+ 新特性 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/es6-new-features' },
            { text: '异步编程 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/async-programming' },
            { text: '移动端点击事件 300ms 延迟 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/mobile-click-delay' },
            { text: '对象不可变性规则 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/object-immutability' },
          ],
        },
        {
          text: 'React',
          collapsed: true,
          items: [
            { text: 'Zustand 状态管理完全指南 <span class="sidebar-date">2026-01-20</span>', link: '/JavaScript/React/zustand-guide' },
            { text: '合成事件原理 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/React/synthetic-events' },
            { text: 'React Router 完全指南 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/React/react-router' },
            { text: 'Redux 状态管理完全指南 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/React/redux-guide' },
            { text: 'Context API 完全指南 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/React/context-api' },
            { text: 'React 插槽模式完全指南 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/React/slots-pattern' },
            { text: 'useState 完全指南 <span class="sidebar-date">2026-01-18</span>', link: '/JavaScript/React/useState' },
            { text: 'React 底层原理深度解析 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/react-underlying-principles' },
            { text: 'Hooks <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/Hooks' },
            { text: 'useRef 完全指南 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/useRef' },
            { text: 'useEffect 与 useLayoutEffect <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/useEffect-useLayoutEffect' },
            { text: 'flushSync 同步更新 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/flushSync' },
            { text: 'PureComponent 性能优化 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/PureComponent' },
            { text: '性能优化 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/performance-optimization' },
            { text: 'React 并发模式控制完全指南 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/react-concurrent-mode' },
            { text: 'useTransition 与 useDeferredValue <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/useTransition-useDeferredValue' },
            { text: 'useReducer 复杂状态管理 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/useReducer' },
            { text: '高阶组件（HOC）详解 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/higher-order-component' },
            { text: '自定义 Hooks 详解 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/custom-hooks' },
            { text: 'useCallback 与 useMemo 性能优化 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/React/useCallback-useMemo' },
          ],
        },
        {
          text: 'Vue',
          collapsed: true,
          items: [
            { text: 'Vue 3 性能优化详解 <span class="sidebar-date">2026-05-24</span>', link: '/JavaScript/Vue/optimize' },
            { text: 'Vue 3 组件暴露机制 - expose 详解 <span class="sidebar-date">2026-01-23</span>', link: '/JavaScript/Vue/setup-expose' },
            { text: 'Teleport 传送门完全指南 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/Vue/teleport' },
            { text: '异步组件与 Suspense 完全指南 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/Vue/async-component-suspense' },
            { text: 'SFC 标签属性与底层原理 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/Vue/sfc-attributes-principle' },
            { text: 'Vuex 与 Pinia 状态管理 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/Vue/vuex-pinia-guide' },
            { text: '插槽（Slots）完全指南 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/Vue/slots' },
            { text: '组件通信完全指南 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/Vue/component-communication' },
            { text: '响应式 API（ref、reactive、toRef & toRefs） <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/Vue/reactive-api' },
            { text: 'computed 与 watch <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/Vue/computed-watch' },
            { text: 'Composables（组合式函数） <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/Vue/composables' },
            { text: '生命周期钩子 <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/Vue/lifecycle' },
            { text: 'Vue Router <span class="sidebar-date">2026-01-19</span>', link: '/JavaScript/Vue/vue-router' },
            { text: 'Vue 底层原理深度解析（Vue 2 & Vue 3） <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/Vue/vue-underlying-principles' },
          ],
        },
        {
          text: 'TypeScript',
          collapsed: true,
          items: [
            { text: '基础 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/TypeScript/basic' },
            { text: '进阶 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/TypeScript/advanced' },
            { text: '最佳实践 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/TypeScript/best-practices' },
          ],
        },
        {
          text: 'HTTP',
          collapsed: true,
          items: [
            {
              text: 'HTTP 缓存完全指南 <span class="sidebar-date">2026-01-14</span>',
              link: '/JavaScript/Http/http-cache-guide',
            },
            { text: 'HTTP2 完全指南 <span class="sidebar-date">2026-01-14</span>', link: '/JavaScript/Http/http2-guide' },
          ],
        },
        {
          text: '性能优化',
          collapsed: true,
          items: [
            {
              text: '前端性能优化完全指南 <span class="sidebar-date">2026-01-22</span>',
              link: '/JavaScript/Optimization/performance-optimization-guide',
            },
          ],
        },
      ],
      '/Css/': [
        {
          text: 'CSS 预处理器完全指南 <span class="sidebar-date">2026-01-19</span>',
          link: '/Css/css-preprocessors',
        },
        {
          text: 'Flex 与 Grid 布局完全指南 <span class="sidebar-date">2026-01-21</span>',
          link: '/Css/flex-grid-layout',
        },
        {
          text: 'CSS 渲染原理与视觉特效 <span class="sidebar-date">2026-01-23</span>',
          link: '/Css/css-rendering-and-effects',
        },
        { text: '元素快速居中 <span class="sidebar-date">2026-01-15</span>', link: '/Css/element-center' },
        {
          text: 'padding与margin的区别 <span class="sidebar-date">2026-01-15</span>',
          link: '/Css/padding-margin-difference',
        },
        { text: 'vw与%的区别 <span class="sidebar-date">2026-01-15</span>', link: '/Css/vw-percent-difference' },
        {
          text: '行内元素与块级元素的区别 <span class="sidebar-date">2026-01-15</span>',
          link: '/Css/inline-block-difference',
        },
        { text: '浏览器缩小字体 <span class="sidebar-date">2026-01-15</span>', link: '/Css/browser-font-size' },
        { text: '移动端 1px 问题 <span class="sidebar-date">2026-01-14</span>', link: '/Css/mobile-1px-problem' },
        {
          text: 'Margin 塌陷问题 <span class="sidebar-date">2026-01-14</span>',
          link: '/Css/margin-collapse-problem',
        },
      ],
      '/Tools/': [
        { text: 'Webpack & Vite <span class="sidebar-date">2026-05-24</span>', link: '/Tools/webpack&vite' },
        { text: '构建工具 <span class="sidebar-date">2026-05-16</span>', link: '/Tools/Build' },
        { text: 'Git <span class="sidebar-date">2026-01-19</span>', link: '/Tools/Git' },
        { text: 'Vite <span class="sidebar-date">2026-01-19</span>', link: '/Tools/Vite' },
        { text: 'Webpack <span class="sidebar-date">2026-01-19</span>', link: '/Tools/Webpack' },
      ],
      '/Architecture/': [
        { text: '工程化设计 <span class="sidebar-date">2026-05-17</span>', link: '/Architecture/engineering' },
        { text: '前端框架未来展望与新兴框架深度解析 <span class="sidebar-date">2026-01-28</span>', link: '/Architecture/future-framework-outlook' },
        { text: '微前端完全指南 <span class="sidebar-date">2026-01-28</span>', link: '/Architecture/micro-frontend-guide' },
        { text: '前端加密解密方案 <span class="sidebar-date">2026-01-27</span>', link: '/Architecture/frontend-encryption' },
        { text: '组件封装最佳实践指南 <span class="sidebar-date">2026-01-26</span>', link: '/Architecture/component-encapsulation' },
        { text: 'PNPM 相关问题 <span class="sidebar-date">2026-01-15</span>', link: '/Architecture/PNPM' },
        { text: '设计模式 <span class="sidebar-date">2026-01-14</span>', link: '/Architecture/design-patterns' },
        { text: '微服务架构 <span class="sidebar-date">2026-01-14</span>', link: '/Architecture/microservices-architecture' },
        { text: '系统设计 <span class="sidebar-date">2026-01-14</span>', link: '/Architecture/system-design' },
      ],
      '/AI/': [
        { text: 'AI 相关名词详解 <span class="sidebar-date">2026-06-10</span>', link: '/AI/AI-related terminology' },
        { text: 'AI Agent 技术完全指南 <span class="sidebar-date">2026-06-07</span>', link: '/AI/agent-guide' },
        { text: 'AI 大模型完全指南 <span class="sidebar-date">2026-06-07</span>', link: '/AI/bigModel' },
        { text: '机器学习基础 <span class="sidebar-date">2026-01-14</span>', link: '/AI/machine-learning-basics' },
        { text: '计算机视觉 <span class="sidebar-date">2026-01-14</span>', link: '/AI/computer-vision' },
        { text: '大语言模型 <span class="sidebar-date">2026-01-14</span>', link: '/AI/large-language-model' },
        { text: 'Claude 接入 GLM4.7 <span class="sidebar-date">2026-01-14</span>', link: '/AI/claude-GLM' },
      ],
      '/Nodejs/': [
        {
          text: 'Nodejs',
          collapsed: false,
          items: [
            { text: '基础概述 <span class="sidebar-date">2026-01-14</span>', link: '/Nodejs/basic-overview' },
            { text: '异步编程 <span class="sidebar-date">2026-01-14</span>', link: '/Nodejs/async-programming' },
            { text: '模块解析策略 <span class="sidebar-date">2026-01-23</span>', link: '/Nodejs/module-resolution' },
          ],
        },
        {
          text: 'Koa',
          collapsed: false,
          items: [{ text: 'Koa <span class="sidebar-date">2026-01-14</span>', link: '/Nodejs/Koa' }],
        },
        {
          text: 'Express',
          collapsed: false,
          items: [{ text: 'Express <span class="sidebar-date">2026-01-14</span>', link: '/Nodejs/Express' }],
        },
        {
          text: 'Eggjs',
          collapsed: false,
          items: [{ text: 'Eggjs <span class="sidebar-date">2026-01-14</span>', link: '/Nodejs/Eggjs' }],
        },
        {
          text: 'Nestjs',
          collapsed: false,
          items: [{ text: 'Nestjs <span class="sidebar-date">2026-01-14</span>', link: '/Nodejs/Nestjs' }],
        },
        {
          text: 'Deno',
          collapsed: false,
          items: [{ text: 'Deno <span class="sidebar-date">2026-01-14</span>', link: '/Nodejs/deno' }],
        },
      ],
      '/MiniProgram/': [
        {
          text: '小程序',
          collapsed: false,
          items: [
            { text: '小程序基础 <span class="sidebar-date">2026-01-14</span>', link: '/MiniProgram/Origin/basic-overview' },
            { text: '小程序组件 <span class="sidebar-date">2026-01-14</span>', link: '/MiniProgram/Origin/components' },
            { text: '网络请求 <span class="sidebar-date">2026-01-14</span>', link: '/MiniProgram/Origin/network-request' },
          ],
        },
        {
          text: 'Uniapp',
          collapsed: false,
          items: [
            { text: 'Uniapp 基础 <span class="sidebar-date">2026-01-14</span>', link: '/MiniProgram/Uniapp/basic-overview' },
            { text: 'Uniapp 其他 <span class="sidebar-date">2026-01-14</span>', link: '/MiniProgram/Uniapp/uniapp-other' },
          ],
        },
        {
          text: 'Taro',
          collapsed: false,
          items: [
            { text: 'Taro 基础 <span class="sidebar-date">2026-01-14</span>', link: '/MiniProgram/Taro/basic-overview' },
            { text: 'Taro 其他 <span class="sidebar-date">2026-01-14</span>', link: '/MiniProgram/Taro/taro-other' },
          ],
        },
      ],
      '/CornerStore/': [
        // { text: '超级 Agent', link: '/CornerStore/AI/super-app' },
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
