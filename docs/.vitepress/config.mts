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
        { text: '二十年前的今天，像极了此时此刻', link: '/Life/millennium-memories' },
        { text: '珍惜时光，记忆童年', link: '/Life/childhood-memories' },
        { text: '让高飞的心永不沉沦', link: '/Life/soaring-heart' },
        { text: '归去来兮辞', link: '/Life/returning-home' },
        { text: '山的那边', link: '/Life/beyond-the-mountains' },
        { text: '滴露的康乃馨', link: '/Life/carnation' },
        { text: '破阵子', link: '/Life/song-of-breaking-the-array' },
        { text: '我打江南走过', link: '/Life/jiangnan' },
      ],
      '/JavaScript/': [
        {
          text: 'ES6+',
          collapsed: false,
          items: [
            { text: '基础', link: '/JavaScript/basic' },
            { text: 'ES6+ 新特性', link: '/JavaScript/es6-new-features' },
            { text: '异步编程', link: '/JavaScript/async-programming' },
            { text: '移动端点击事件 300ms 延迟', link: '/JavaScript/mobile-click-delay' },
            { text: '对象不可变性规则', link: '/JavaScript/object-immutability' },
          ],
        },
        {
          text: 'React',
          collapsed: true,
          items: [
            { text: '概述', link: '/JavaScript/React/overview' },
            {
              text: '合成事件原理',
              link: '/JavaScript/React/synthetic-events',
            },
            {
              text: 'React Router 完全指南',
              link: '/JavaScript/React/react-router',
            },
            {
              text: 'Redux 状态管理完全指南',
              link: '/JavaScript/React/redux-guide',
            },
            {
              text: 'Zustand 状态管理完全指南',
              link: '/JavaScript/React/zustand-guide',
            },
            {
              text: 'Context API 完全指南',
              link: '/JavaScript/React/context-api',
            },
            {
              text: 'React 插槽模式完全指南',
              link: '/JavaScript/React/slots-pattern',
            },
            { text: 'Hooks', link: '/JavaScript/React/Hooks' },
            {
              text: 'useState 完全指南',
              link: '/JavaScript/React/useState',
            },
            {
              text: 'useRef 完全指南',
              link: '/JavaScript/React/useRef',
            },
            {
              text: 'useEffect 与 useLayoutEffect',
              link: '/JavaScript/React/useEffect-useLayoutEffect',
            },
            {
              text: 'flushSync 同步更新',
              link: '/JavaScript/React/flushSync',
            },
            {
              text: 'PureComponent 性能优化',
              link: '/JavaScript/React/PureComponent',
            },
            {
              text: '性能优化',
              link: '/JavaScript/React/performance-optimization',
            },
            {
              text: 'useTransition 与 useDeferredValue',
              link: '/JavaScript/React/useTransition-useDeferredValue',
            },
            {
              text: 'useReducer 复杂状态管理',
              link: '/JavaScript/React/useReducer',
            },
            {
              text: '高阶组件（HOC）详解',
              link: '/JavaScript/React/higher-order-component',
            },
            {
              text: '自定义 Hooks 详解',
              link: '/JavaScript/React/custom-hooks',
            },
            {
              text: 'useCallback 与 useMemo 性能优化',
              link: '/JavaScript/React/useCallback-useMemo',
            },
          ],
        },
        {
          text: 'Vue',
          collapsed: true,
          items: [
            { text: '概述', link: '/JavaScript/Vue/overview' },
            {
              text: 'Teleport 传送门完全指南',
              link: '/JavaScript/Vue/teleport',
            },
            {
              text: '异步组件与 Suspense 完全指南',
              link: '/JavaScript/Vue/async-component-suspense',
            },
            {
              text: 'SFC 标签属性与底层原理',
              link: '/JavaScript/Vue/sfc-attributes-principle',
            },
            {
              text: 'Vuex 与 Pinia 状态管理',
              link: '/JavaScript/Vue/vuex-pinia-guide',
            },
            {
              text: '插槽（Slots）完全指南',
              link: '/JavaScript/Vue/slots',
            },
            {
              text: '组件通信完全指南',
              link: '/JavaScript/Vue/component-communication',
            },
            {
              text: '响应式 API（ref、reactive、toRef & toRefs）',
              link: '/JavaScript/Vue/reactive-api',
            },
            {
              text: 'computed 与 watch',
              link: '/JavaScript/Vue/computed-watch',
            },
            {
              text: 'Composables（组合式函数）',
              link: '/JavaScript/Vue/composables',
            },
            {
              text: '生命周期钩子',
              link: '/JavaScript/Vue/lifecycle',
            },
            {
              text: 'Vue Router',
              link: '/JavaScript/Vue/vue-router',
            },
            { text: '状态管理', link: '/JavaScript/Vue/state-management' },
            {
              text: 'Composition API',
              link: '/JavaScript/Vue/composition-api',
            },
          ],
        },
        {
          text: 'TypeScript',
          collapsed: true,
          items: [
            { text: '基础', link: '/JavaScript/TypeScript/basic' },
            { text: '进阶', link: '/JavaScript/TypeScript/advanced' },
            { text: '最佳实践', link: '/JavaScript/TypeScript/best-practices' },
          ],
        },
        {
          text: 'HTTP',
          collapsed: true, // 默认展开，true 为折叠
          items: [
            {
              text: 'HTTP 缓存完全指南',
              link: '/JavaScript/Http/http-cache-guide',
            },
            { text: 'HTTP2 完全指南', link: '/JavaScript/Http/http2-guide' },
            {
              text: 'HTTP 缓存与 HTTP2 核心要点',
              link: '/JavaScript/Http/http-cache-http2-core',
            },
          ],
        },
      ],
      '/Css/': [
        {
          text: 'CSS 预处理器完全指南',
          link: '/Css/css-preprocessors',
        },
        { text: '元素快速居中', link: '/Css/element-center' },
        {
          text: 'padding与margin的区别',
          link: '/Css/padding-margin-difference',
        },
        { text: 'vw与%的区别', link: '/Css/vw-percent-difference' },
        {
          text: '行内元素与块级元素的区别',
          link: '/Css/inline-block-difference',
        },
        { text: '浏览器缩小字体', link: '/Css/browser-font-size' },
        { text: '移动端 1px 问题', link: '/Css/mobile-1px-problem' },
        {
          text: 'Margin 塌陷问题',
          link: '/Css/margin-collapse-problem',
        },
      ],
      '/Tools/': [
        { text: 'Git', link: '/Tools/Git' },
        { text: 'Vite', link: '/Tools/Vite' },
        { text: 'Webpack', link: '/Tools/Webpack' },
      ],
      '/Architecture/': [
        { text: 'PNPM 相关问题', link: '/Architecture/PNPM' },
        { text: '设计模式', link: '/Architecture/design-patterns' },
        {
          text: '微服务架构',
          link: '/Architecture/microservices-architecture',
        },
        { text: '系统设计', link: '/Architecture/system-design' },
      ],
      '/AI/': [
        { text: '机器学习基础', link: '/AI/machine-learning-basics' },
        { text: '计算机视觉', link: '/AI/computer-vision' },
        { text: '大语言模型', link: '/AI/large-language-model' },
        { text: 'Claude 接入 GLM4.7', link: '/AI/claude-GLM' },
      ],
      '/Nodejs/': [
        {
          text: 'Nodejs',
          collapsed: false,
          items: [
            { text: '基础概述', link: '/Nodejs/basic-overview' },
            { text: '异步编程', link: '/Nodejs/async-programming' },
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
            { text: '小程序基础', link: '/MiniProgram/Origin/basic-overview' },
            { text: '小程序组件', link: '/MiniProgram/Origin/components' },
            { text: '网络请求', link: '/MiniProgram/Origin/network-request' },
          ],
        },
        {
          text: 'Uniapp',
          collapsed: false,
          items: [
            { text: 'Uniapp 基础', link: '/MiniProgram/Uniapp/basic-overview' },
            { text: 'Uniapp 其他', link: '/MiniProgram/Uniapp/uniapp-other' },
          ],
        },
        {
          text: 'Taro',
          collapsed: false,
          items: [
            { text: 'Taro 基础', link: '/MiniProgram/Taro/basic-overview' },
            { text: 'Taro 其他', link: '/MiniProgram/Taro/taro-other' },
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
