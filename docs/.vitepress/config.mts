import { defineConfig } from 'vitepress';
// 导入主题的配置
import { blogTheme } from './blog-theme';
import { SponsorPlugin } from 'vitepress-plugin-sponsor';

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
      { text: '追求更好', link: '/better/' },
      { text: 'Java', link: '/Java/' },
      { text: 'Css', link: '/Css/' },
      { text: 'SSM', link: '/SSM/' },
      { text: '笔记', link: '/Note/' },
      { text: 'MySQL', link: '/MySQL/' },
      { text: 'JavaWeb', link: '/JavaWeb/' },
      { text: 'Linux', link: '/Linux/' },
      { text: '生活随笔', link: '/Life/' },
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
        { text: '破阵子', link: '/Life/破阵子' },
        { text: '滴露的康乃馨', link: '/Life/滴露的康乃馨' },
        { text: '我打江南走过', link: '/Life/我打江南走过' },
        { text: '山的那边', link: '/Life/山的那边' },
      ],
      '/better/': [
        {
          text: 'HTTP',
          collapsed: true, // 默认展开，true 为折叠
          items: [
            { text: 'HTTP 缓存完全指南', link: '/better/HTTP 缓存完全指南' },
            { text: 'HTTP2 完全指南', link: '/better/HTTP2 完全指南' },
            { text: 'HTTP 缓存与 HTTP2 核心要点', link: '/better/HTTP 缓存与 HTTP2 核心要点' },
          ],
        },
        {
          text: 'React',
          collapsed: false,
          items: [
            { text: '203.移除链表元素', link: '/better/203.移除链表元素' },
          ],
        },
      ],
      '/Java/': [{ text: 'Java IO', link: '/Java/Java IO' }],
      '/Css/': [
        { text: '移动端 1px 问题', link: '/Css/移动端 1px 问题' },
        { text: 'Margin 塌陷问题', link: '/Css/Margin 塌陷问题' },
      ],
      '/MySQL/': [{ text: '初识MySQL', link: '/MySQL/初识MySQL' }],
      '/Linux/': [
        { text: 'Linux 概述及环境搭建', link: '/Linux/Linux概述及环境搭建' },
      ],
      '/SSM/': [
        {
          text: 'SSM框架',
          collapsed: false,
          items: [{ text: '初识SSM框架', link: '/SSM/初识SSM框架' }],
        },
        {
          text: 'MyBatis',
          collapsed: false,
          items: [{ text: '初识MyBatis', link: '/SSM/初识MyBatis' }],
        },
        {
          text: 'Spring',
          collapsed: false,
          items: [{ text: '初识Spring', link: '/SSM/初识Spring' }],
        },
        {
          text: 'SpringMVC',
          collapsed: false,
          items: [{ text: '初识SpringMVC', link: '/SSM/初识SpringMVC' }],
        },
      ],
      '/SpringBoot/': [
        {
          text: 'SpringBoot',
          collapsed: false,
          items: [
            {
              text: '迈入前后端分离时代',
              link: '/SpringBoot/迈入前后端分离时代',
            },
          ],
        },
      ],
      '/Note/': [
        {
          text: 'Maven',
          collapsed: false,
          items: [{ text: 'Maven 的基本使用', link: '/Note/Maven的基本使用' }],
        },
        {
          text: '计算机网络',
          collapsed: false,
          items: [{ text: '一文详解Socket', link: '/Note/一文详解Socket' }],
        },
        {
          text: 'Elasticsearch',
          collapsed: false,
          items: [
            { text: 'Elasticsearch 入门', link: '/Note/Elasticsearch入门' },
          ],
        },
        {
          text: 'RabbitMQ',
          collapsed: false,
          items: [{ text: 'RabbitMQ 入门', link: '/Note/RabbitMQ入门' }],
        },
        {
          text: 'Docker',
          collapsed: false,
          items: [{ text: 'Docker 入门', link: '/Note/Docker入门' }],
        },
        {
          text: 'Kubernetes',
          collapsed: false,
          items: [
            { text: 'Kubernetes 基础概念', link: '/Note/Kubernetes基础概念' },
          ],
        },
        {
          text: 'Others',
          collapsed: false,
          items: [
            { text: '分布式中的 CAP 理论', link: '/Note/分布式中的CAP理论' },
          ],
        },
      ],
    },
  },
  vite: {
    plugins: [
      // 打赏插件
      SponsorPlugin({
        /**
         * 打赏模块样式
         */
        type: 'simple',
        aliPayQR: 'https://sloving.top/img/aliPayQR.jpg',
        weChatQR: 'https://sloving.top/img/weChatQR.png',
      }),
    ],
  },
});
