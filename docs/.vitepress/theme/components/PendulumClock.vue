<template>
  <div class="pendulum-clock-wrapper">
    <div class="pendulum-clock" :class="{ 'digital-mode': isDigitalMode }">
      <!-- 悬挂点 (仅模拟模式显示) -->
      <div v-if="!isDigitalMode" class="clock-hook"></div>
      <!-- 挂绳 (仅模拟模式显示) -->
      <div v-if="!isDigitalMode" class="clock-chain"></div>
      <!-- 时钟表盘 -->
      <div
        class="clock-face"
        @click="toggleMode"
        :title="!isDigitalMode ? '切换到数字时钟' : '切换到模拟时钟'"
      >
        <!-- 模拟时钟 -->
        <svg v-if="!isDigitalMode" viewBox="0 0 100 100" class="clock-svg">
          <!-- 表盘外圈 -->
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          />
          <!-- 刻度 -->
          <line
            v-for="n in 12"
            :key="n"
            :x1="50"
            :y1="5"
            :x2="50"
            :y2="n % 3 === 0 ? 8 : 6"
            :transform="`rotate(${(n - 1) * 30} 50 50)`"
            stroke="currentColor"
            stroke-width="1"
          />
          <!-- 时针 -->
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="35"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            :transform="`rotate(${hourAngle} 50 50)`"
          />
          <!-- 分针 -->
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="25"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            :transform="`rotate(${minuteAngle} 50 50)`"
          />
          <!-- 中心点 -->
          <circle cx="50" cy="50" r="2" fill="currentColor" />
        </svg>

        <!-- 数字时钟 -->
        <div v-else class="digital-clock">
          <div class="digital-date">{{ digitalDate }}</div>
          <div class="digital-time">{{ digitalTime }}</div>
          <div class="digital-lunar">{{ lunarDate }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Lunar, Solar } from 'lunar-javascript';

// 模式切换状态
const isDigitalMode = ref(false);

// 模拟时钟相关
const hourAngle = ref(0);
const minuteAngle = ref(0);

// 数字时钟相关
const currentTime = ref(new Date());

// 星期映射
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

// 格式化数字时钟显示
const digitalTime = computed(() => {
  const hours = String(currentTime.value.getHours()).padStart(2, '0');
  const minutes = String(currentTime.value.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.value.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
});

const digitalDate = computed(() => {
  const year = currentTime.value.getFullYear();
  const month = String(currentTime.value.getMonth() + 1).padStart(2, '0');
  const date = String(currentTime.value.getDate()).padStart(2, '0');
  const day = weekDays[currentTime.value.getDay()];
  return `${year}-${month}-${date} 周${day}`;
});

const lunarDate = computed(() => {
  const solar = Solar.fromDate(currentTime.value);
  const lunar = solar.getLunar();
  const ganZhiYear = lunar.getYearInGanZhi();
  return `${ganZhiYear}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
});

let intervalId = null;

function updateTime() {
  const now = new Date();
  currentTime.value = now;

  // 更新模拟时钟
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  hourAngle.value = hours * 30 + minutes * 0.5;
  minuteAngle.value = minutes * 6;
}

function toggleMode() {
  isDigitalMode.value = !isDigitalMode.value;
}

onMounted(() => {
  updateTime();
  intervalId = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
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

/* 数字模式时停止摆动 */
.pendulum-clock.digital-mode {
  animation: none;
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
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

/* 数字时钟模式下的长方形样式 */
.digital-mode .clock-face {
  width: 150px;
  height: 80px;
  border-radius: 12px;
  border: 2.5px solid rgba(59, 130, 246, 0.3);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 999;
  cursor: pointer;
}

.clock-face:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.clock-face:active {
  transform: scale(0.98);
}

/* 数字模式下的交互效果 */
.digital-mode .clock-face:hover {
  box-shadow: 0 6px 25px rgba(59, 130, 246, 0.3);
  transform: none;
  border-color: rgba(59, 130, 246, 0.5);
}

.digital-mode .clock-face:active {
  transform: scale(0.98);
}

.clock-svg {
  width: 60px;
  height: 60px;
  color: var(--vp-c-text-1, #213547);
}

/* 数字时钟样式 */
.digital-clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
  padding: 8px 6px;
  gap: 3px;
}

.digital-date {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
  line-height: 1.4;
  color: #2563eb;
}

.digital-time {
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1.5px;
  line-height: 1.4;
  font-variant-numeric: tabular-nums;
  color: #16a34a;
}

.digital-lunar {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;
  line-height: 1.4;
  color: #dc2626;
}

@keyframes pendulum-swing {
  0%,
  100% {
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

html.dark .digital-mode .clock-face {
  background: rgba(30, 30, 30, 0.95);
  border-color: rgba(96, 165, 250, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

html.dark .digital-date {
  color: #60a5fa;
}

html.dark .digital-time {
  color: #4ade80;
}

html.dark .digital-lunar {
  color: #f87171;
}
</style>
