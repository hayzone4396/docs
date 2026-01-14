<template>
  <div class="pendulum-clock-wrapper">
    <div class="pendulum-clock">
      <!-- 悬挂点 -->
      <div class="clock-hook"></div>
      <!-- 挂绳 -->
      <div class="clock-chain"></div>
      <!-- 时钟表盘 -->
      <div class="clock-face">
        <svg viewBox="0 0 100 100" class="clock-svg">
          <!-- 表盘外圈 -->
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="2.5"/>
          <!-- 刻度 -->
          <line v-for="n in 12" :key="n"
            :x1="50" :y1="5"
            :x2="50" :y2="n % 3 === 0 ? 8 : 6"
            :transform="`rotate(${(n-1) * 30} 50 50)`"
            stroke="currentColor"
            stroke-width="1"/>
          <!-- 时针 -->
          <line x1="50" y1="50" x2="50" y2="35"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            :transform="`rotate(${hourAngle} 50 50)`"/>
          <!-- 分针 -->
          <line x1="50" y1="50" x2="50" y2="25"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            :transform="`rotate(${minuteAngle} 50 50)`"/>
          <!-- 中心点 -->
          <circle cx="50" cy="50" r="2" fill="currentColor"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const hourAngle = ref(0)
const minuteAngle = ref(0)
let intervalId = null

function updateTime() {
  const now = new Date()
  const hours = now.getHours() % 12
  const minutes = now.getMinutes()
  
  hourAngle.value = (hours * 30) + (minutes * 0.5)
  minuteAngle.value = minutes * 6
}

onMounted(() => {
  updateTime()
  intervalId = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.pendulum-clock-wrapper {
  position: relative;
  display: inline-block;
  margin: 0 8px;
  vertical-align: middle;
}

.pendulum-clock {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: top center;
  animation: pendulum-swing 2s ease-in-out infinite;
}

.clock-hook {
  width: 10px;
  height: 10px;
  background: currentColor;
  border-radius: 50%;
  margin-bottom: 2px;
}

.clock-chain {
  width: 2.5px;
  height: 108px;
  background: currentColor;
  margin-bottom: 2px;
}

.clock-face {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--vp-c-bg, #ffffff);
  border: 2.5px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.clock-svg {
  width: 60px;
  height: 60px;
  color: var(--vp-c-text-1, #213547);
}

@keyframes pendulum-swing {
  0%, 100% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(15deg);
  }
}

/* 深色模式适配 */
html.dark .clock-face {
  background: var(--vp-c-bg, #1a1a1a);
}

html.dark .clock-svg {
  color: var(--vp-c-text-1, #ffffff);
}
</style>
