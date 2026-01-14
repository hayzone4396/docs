import BlogTheme from '@sugarat/theme'
import type { Theme } from 'vitepress'
import { createApp, h } from 'vue'
import PendulumClock from './components/PendulumClock.vue'

// 自定义样式重载
import './style.css'

// 自定义主题色
// import './user-theme.css'

export default {
  ...BlogTheme,
  enhanceApp({ app }) {
    // 注册时钟组件
    app.component('PendulumClock', PendulumClock)
    
    // 在导航栏中插入时钟
    if (typeof window !== 'undefined') {
      const insertClock = () => {
        if (document.querySelector('.pendulum-clock-container')) {
          return
        }
        
        // 查找社交链接区域（GitHub 图标附近）
        const selectors = [
          '.VPNavBarSocialLinks',
          'nav .social-links',
          '.nav-social',
          '.VPNavBar .social'
        ]
        
        let socialLinks: Element | null = null
        for (const selector of selectors) {
          const el = document.querySelector(selector)
          if (el) {
            socialLinks = el
            break
          }
        }
        
        if (socialLinks && socialLinks.parentNode) {
          const container = document.createElement('div')
          container.className = 'pendulum-clock-container'
          const clockApp = createApp({
            render: () => h(PendulumClock)
          })
          clockApp.mount(container)
          socialLinks.parentNode.insertBefore(container, socialLinks)
        }
      }
      
      // 延迟执行，等待 DOM 渲染
      setTimeout(insertClock, 300)
      window.addEventListener('load', insertClock)
      
      // 使用 MutationObserver 监听 DOM 变化
      const observer = new MutationObserver(() => {
        if (!document.querySelector('.pendulum-clock-container')) {
          setTimeout(insertClock, 200)
        }
      })
      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    }
  }
} as Theme

