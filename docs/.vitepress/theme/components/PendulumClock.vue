<template>
  <div
    class="pendulum-clock-wrapper"
    :class="{ 'digital-mode': isDigitalMode }"
  >
    <div class="pendulum-clock" :class="{ 'digital-mode': isDigitalMode }">
      <!-- 悬挂点 (仅模拟模式显示) -->
      <div v-if="!isDigitalMode" class="clock-hook"></div>
      <!-- 挂绳 (仅模拟模式显示) -->
      <div v-if="!isDigitalMode" class="clock-chain"></div>
      <!-- 时钟表盘 -->
      <div
        class="clock-face"
        :class="[
          { 'digital-mode-active': isDigitalMode },
          isDigitalMode ? `theme-${timeTheme.name}` : ''
        ]"
        @click="handleClockClick"
        :title="!isDigitalMode ? '点击切换到数字时钟' : '点击切换到模拟时钟'"
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
          <div class="digital-time">
            <span
              class="time-digit"
              :style="{
                background: `linear-gradient(135deg, ${timeTheme.colors[0]}, ${timeTheme.colors[1]})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }"
            >{{ digitalTime.hours }}</span>
            <span class="time-separator">:</span>
            <span
              class="time-digit"
              :style="{
                background: `linear-gradient(135deg, ${timeTheme.colors[0]}, ${timeTheme.colors[1]})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }"
            >{{ digitalTime.minutes }}</span>
            <span class="time-separator">:</span>
            <span
              class="time-digit"
              :style="{
                background: `linear-gradient(135deg, ${timeTheme.colors[0]}, ${timeTheme.colors[1]})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }"
            >{{ digitalTime.seconds }}</span>
          </div>
          <div class="digital-lunar">{{ lunarDate.text }}</div>
          <div class="digital-extra">
            <div class="zodiac-sign">
              <span class="zodiac-icon">{{ zodiacInfo.icon }}</span>
              <span class="zodiac-name">{{ zodiacInfo.name }}</span>
            </div>
            <div
              v-if="lunarDate.festival"
              class="festival-tag"
              :style="{
                background: `linear-gradient(135deg, ${lunarDate.festival.colors[0]}, ${lunarDate.festival.colors[1]})`
              }"
            >
              <template v-if="lunarDate.festival.isCountdown && lunarDate.festival.countdownDays !== undefined">
                <span>{{ lunarDate.festival.countdownPrefix }}</span><span class="countdown-number">{{ lunarDate.festival.countdownDays }}</span><span>{{ lunarDate.festival.countdownSuffix }}</span>
              </template>
              <template v-else>
                {{ lunarDate.festival.text }}
              </template>
            </div>
          </div>
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

// 星座映射
const zodiacSigns = [
  { name: '摩羯座', icon: '♑', start: [12, 22], end: [1, 19] },
  { name: '水瓶座', icon: '♒', start: [1, 20], end: [2, 18] },
  { name: '双鱼座', icon: '♓', start: [2, 19], end: [3, 20] },
  { name: '白羊座', icon: '♈', start: [3, 21], end: [4, 19] },
  { name: '金牛座', icon: '♉', start: [4, 20], end: [5, 20] },
  { name: '双子座', icon: '♊', start: [5, 21], end: [6, 21] },
  { name: '巨蟹座', icon: '♋', start: [6, 22], end: [7, 22] },
  { name: '狮子座', icon: '♌', start: [7, 23], end: [8, 22] },
  { name: '处女座', icon: '♍', start: [8, 23], end: [9, 22] },
  { name: '天秤座', icon: '♎', start: [9, 23], end: [10, 23] },
  { name: '天蝎座', icon: '♏', start: [10, 24], end: [11, 22] },
  { name: '射手座', icon: '♐', start: [11, 23], end: [12, 21] }
];

// 生肖映射
const zodiacEmoji = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷'];

// 计算星座
function getZodiacSign(month, day) {
  for (let sign of zodiacSigns) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;

    if (startMonth === endMonth) {
      if (month === startMonth && day >= startDay && day <= endDay) {
        return sign;
      }
    } else {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign;
      }
    }
  }
  return zodiacSigns[0];
}

// 获取时段主题
function getTimeTheme(hour) {
  if (hour >= 6 && hour < 9) {
    // 早晨：温暖的橙黄色调，象征日出
    return { name: 'morning', colors: ['#fb923c', '#f59e0b'], label: '早晨' };
  } else if (hour >= 9 && hour < 12) {
    // 上午：清新的蓝绿色调，活力充沛
    return { name: 'forenoon', colors: ['#06b6d4', '#14b8a6'], label: '上午' };
  } else if (hour >= 12 && hour < 18) {
    // 下午：明亮的金黄色调，阳光灿烂
    return { name: 'afternoon', colors: ['#fbbf24', '#f59e0b'], label: '下午' };
  } else if (hour >= 18 && hour < 20) {
    // 傍晚：温暖的橙红渐变，象征日落
    return { name: 'evening', colors: ['#f97316', '#ef4444'], label: '傍晚' };
  } else {
    // 夜晚：深邃的蓝紫色调，宁静神秘
    return { name: 'night', colors: ['#6366f1', '#8b5cf6'], label: '夜晚' };
  }
}

// 传统节日（农历）
function getTraditionalFestival(lunar) {
  const month = lunar.getMonth();
  const day = lunar.getDay();

  const festivals = {
    '12-30': { text: '除夕🎆', colors: ['#dc2626', '#b91c1c'] },
    '12-29': { text: '除夕🎆', colors: ['#dc2626', '#b91c1c'] }, // 腊月小月
    '1-1': { text: '春节🧧', colors: ['#dc2626', '#b91c1c'] },
    '1-15': { text: '元宵节🏮', colors: ['#f59e0b', '#d97706'] },
    '2-2': { text: '龙抬头🐉', colors: ['#10b981', '#059669'] },
    '3-3': { text: '上巳节🌸', colors: ['#ec4899', '#db2777'] },
    '5-5': { text: '端午节🥟', colors: ['#10b981', '#059669'] },
    '7-7': { text: '七夕节💝', colors: ['#ec4899', '#db2777'] },
    '7-15': { text: '中元节🕯️', colors: ['#a855f7', '#9333ea'] },
    '8-15': { text: '中秋节🥮', colors: ['#f59e0b', '#ea580c'] },
    '9-9': { text: '重阳节🌼', colors: ['#a855f7', '#9333ea'] },
    '10-1': { text: '寒衣节🧥', colors: ['#6366f1', '#8b5cf6'] },
    '10-15': { text: '下元节🏮', colors: ['#f59e0b', '#d97706'] },
    '12-8': { text: '腊八节🥣', colors: ['#f97316', '#ea580c'] },
    '12-23': { text: '小年🎊', colors: ['#dc2626', '#b91c1c'] }
  };

  return festivals[`${month}-${day}`] || null;
}

// 公历节日（固定日期）
function getSolarFestival(solar) {
  const month = solar.getMonth();
  const day = solar.getDay();

  const festivals = {
    '3-8': { text: '妇女节👩', colors: ['#ec4899', '#db2777'] },
    '3-12': { text: '植树节🌳', colors: ['#10b981', '#059669'] },
    '5-1': { text: '劳动节💪', colors: ['#ef4444', '#dc2626'] },
    '5-4': { text: '青年节🎓', colors: ['#3b82f6', '#2563eb'] },
    '6-1': { text: '儿童节🎈', colors: ['#f59e0b', '#d97706'] },
    '7-1': { text: '建党节🎉', colors: ['#dc2626', '#b91c1c'] },
    '8-1': { text: '建军节🎖️', colors: ['#10b981', '#059669'] },
    '10-1': { text: '国庆节🇨🇳', colors: ['#dc2626', '#b91c1c'] },
    '12-25': { text: '圣诞节🎄', colors: ['#10b981', '#059669'] }
  };

  return festivals[`${month}-${day}`] || null;
}

// 公历节日（浮动日期）
function getFloatingSolarFestival(solar) {
  const year = solar.getYear();
  const month = solar.getMonth();
  const day = solar.getDay();
  const weekDay = solar.getWeek(); // 0=周日, 1=周一, ..., 6=周六

  // 母亲节：5月第二个周日
  if (month === 5) {
    const firstDay = Solar.fromYmd(year, 5, 1);
    const firstWeekDay = firstDay.getWeek();
    // 计算第二个周日
    const secondSunday = firstWeekDay === 0 ? 8 : (7 - firstWeekDay + 1 + 7);
    if (day === secondSunday) {
      return { text: '母亲节💐', colors: ['#ec4899', '#db2777'] };
    }
  }

  // 父亲节：6月第三个周日
  if (month === 6) {
    const firstDay = Solar.fromYmd(year, 6, 1);
    const firstWeekDay = firstDay.getWeek();
    // 计算第三个周日
    const thirdSunday = firstWeekDay === 0 ? 15 : (7 - firstWeekDay + 1 + 14);
    if (day === thirdSunday) {
      return { text: '父亲节👔', colors: ['#3b82f6', '#2563eb'] };
    }
  }

  return null;
}

// 寒食节（清明前一天）
function getHanshiFestival(solar, solarTerm) {
  try {
    // 如果明天是清明，今天就是寒食节
    const tomorrow = solar.next(1);
    const tomorrowLunar = tomorrow.getLunar();
    const tomorrowJieQi = tomorrowLunar.getJieQi();

    if (tomorrowJieQi === '清明') {
      return { text: '寒食节🍃', colors: ['#10b981', '#059669'] };
    }
  } catch (error) {
    console.warn('获取寒食节失败:', error);
  }

  return null;
}

// 二十四节气
function getSolarTerm(solar) {
  try {
    if (!solar) {
      console.warn('Invalid solar object:', solar);
      return null;
    }

    const lunar = solar.getLunar();
    if (!lunar) {
      console.warn('Failed to get lunar from solar');
      return null;
    }

    const jieQi = lunar.getJieQi();

    if (jieQi) {
      const solarTerms = {
        '立春': { text: '立春🌱', colors: ['#10b981', '#059669'] },
        '雨水': { text: '雨水💧', colors: ['#06b6d4', '#0891b2'] },
        '惊蛰': { text: '惊蛰⚡', colors: ['#8b5cf6', '#7c3aed'] },
        '春分': { text: '春分🌸', colors: ['#ec4899', '#db2777'] },
        '清明': { text: '清明🌿', colors: ['#10b981', '#059669'] },
        '谷雨': { text: '谷雨🌾', colors: ['#14b8a6', '#0d9488'] },
        '立夏': { text: '立夏☀️', colors: ['#f59e0b', '#d97706'] },
        '小满': { text: '小满🌾', colors: ['#eab308', '#ca8a04'] },
        '芒种': { text: '芒种🌾', colors: ['#fbbf24', '#f59e0b'] },
        '夏至': { text: '夏至🌞', colors: ['#f97316', '#ea580c'] },
        '小暑': { text: '小暑🔥', colors: ['#ef4444', '#dc2626'] },
        '大暑': { text: '大暑🌡️', colors: ['#dc2626', '#b91c1c'] },
        '立秋': { text: '立秋🍂', colors: ['#f59e0b', '#d97706'] },
        '处暑': { text: '处暑🌾', colors: ['#eab308', '#ca8a04'] },
        '白露': { text: '白露💧', colors: ['#06b6d4', '#0891b2'] },
        '秋分': { text: '秋分🍁', colors: ['#f97316', '#ea580c'] },
        '寒露': { text: '寒露💧', colors: ['#0ea5e9', '#0284c7'] },
        '霜降': { text: '霜降❄️', colors: ['#6366f1', '#4f46e5'] },
        '立冬': { text: '立冬🌬️', colors: ['#3b82f6', '#2563eb'] },
        '小雪': { text: '小雪❄️', colors: ['#60a5fa', '#3b82f6'] },
        '大雪': { text: '大雪⛄', colors: ['#93c5fd', '#60a5fa'] },
        '冬至': { text: '冬至🥟', colors: ['#6366f1', '#4f46e5'] },
        '小寒': { text: '小寒🧊', colors: ['#3b82f6', '#2563eb'] },
        '大寒': { text: '大寒❄️', colors: ['#1d4ed8', '#1e40af'] }
      };

      return solarTerms[jieQi] || null;
    }
  } catch (error) {
    console.warn('获取节气失败:', error);
  }

  return null;
}

// 获取下一个节日或节气
function getNextFestivalOrSolarTerm(currentDate) {
  const currentSolar = Solar.fromDate(currentDate);
  const currentLunar = currentSolar.getLunar();

  // 定义节日列表（农历）
  const festivals = [
    { month: 12, day: 30, name: '除夕🎆', colors: ['#dc2626', '#b91c1c'] },
    { month: 12, day: 29, name: '除夕🎆', colors: ['#dc2626', '#b91c1c'] },
    { month: 1, day: 1, name: '春节🧧', colors: ['#dc2626', '#b91c1c'] },
    { month: 1, day: 15, name: '元宵节🏮', colors: ['#f59e0b', '#d97706'] },
    { month: 2, day: 2, name: '龙抬头🐉', colors: ['#10b981', '#059669'] },
    { month: 3, day: 3, name: '上巳节🌸', colors: ['#ec4899', '#db2777'] },
    { month: 5, day: 5, name: '端午节🥟', colors: ['#10b981', '#059669'] },
    { month: 7, day: 7, name: '七夕节💝', colors: ['#ec4899', '#db2777'] },
    { month: 7, day: 15, name: '中元节🕯️', colors: ['#a855f7', '#9333ea'] },
    { month: 8, day: 15, name: '中秋节🥮', colors: ['#f59e0b', '#ea580c'] },
    { month: 9, day: 9, name: '重阳节🌼', colors: ['#a855f7', '#9333ea'] },
    { month: 10, day: 1, name: '寒衣节🧥', colors: ['#6366f1', '#8b5cf6'] },
    { month: 10, day: 15, name: '下元节🏮', colors: ['#f59e0b', '#d97706'] },
    { month: 12, day: 8, name: '腊八节🥣', colors: ['#f97316', '#ea580c'] },
    { month: 12, day: 23, name: '小年🎊', colors: ['#dc2626', '#b91c1c'] }
  ];

  // 定义节气列表
  const solarTerms = {
    '立春': { text: '立春🌱', colors: ['#10b981', '#059669'] },
    '雨水': { text: '雨水💧', colors: ['#06b6d4', '#0891b2'] },
    '惊蛰': { text: '惊蛰⚡', colors: ['#8b5cf6', '#7c3aed'] },
    '春分': { text: '春分🌸', colors: ['#ec4899', '#db2777'] },
    '清明': { text: '清明🌿', colors: ['#10b981', '#059669'] },
    '谷雨': { text: '谷雨🌾', colors: ['#14b8a6', '#0d9488'] },
    '立夏': { text: '立夏☀️', colors: ['#f59e0b', '#d97706'] },
    '小满': { text: '小满🌾', colors: ['#eab308', '#ca8a04'] },
    '芒种': { text: '芒种🌾', colors: ['#fbbf24', '#f59e0b'] },
    '夏至': { text: '夏至🌞', colors: ['#f97316', '#ea580c'] },
    '小暑': { text: '小暑🔥', colors: ['#ef4444', '#dc2626'] },
    '大暑': { text: '大暑🌡️', colors: ['#dc2626', '#b91c1c'] },
    '立秋': { text: '立秋🍂', colors: ['#f59e0b', '#d97706'] },
    '处暑': { text: '处暑🌾', colors: ['#eab308', '#ca8a04'] },
    '白露': { text: '白露💧', colors: ['#06b6d4', '#0891b2'] },
    '秋分': { text: '秋分🍁', colors: ['#f97316', '#ea580c'] },
    '寒露': { text: '寒露💧', colors: ['#0ea5e9', '#0284c7'] },
    '霜降': { text: '霜降❄️', colors: ['#6366f1', '#4f46e5'] },
    '立冬': { text: '立冬🌬️', colors: ['#3b82f6', '#2563eb'] },
    '小雪': { text: '小雪❄️', colors: ['#60a5fa', '#3b82f6'] },
    '大雪': { text: '大雪⛄', colors: ['#93c5fd', '#60a5fa'] },
    '冬至': { text: '冬至🥟', colors: ['#6366f1', '#4f46e5'] },
    '小寒': { text: '小寒🧊', colors: ['#3b82f6', '#2563eb'] },
    '大寒': { text: '大寒❄️', colors: ['#1d4ed8', '#1e40af'] }
  };

  let nearestEvent = null;
  let minDays = 365;

  // 查找最近的农历节日
  for (const festival of festivals) {
    // 尝试今年的日期
    try {
      const lunarDate = Lunar.fromYmd(currentLunar.getYear(), festival.month, festival.day);
      if (!lunarDate) continue;

      const solarDate = lunarDate.getSolar();
      if (!solarDate) continue;

      // lunar-javascript 的 getDay() 返回的是日期，不是星期
      const targetDate = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());

      let days = Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24));

      // 如果已经过了今年的，查找明年的
      if (days < 0) {
        const nextLunarDate = Lunar.fromYmd(currentLunar.getYear() + 1, festival.month, festival.day);
        if (!nextLunarDate) continue;

        const nextSolarDate = nextLunarDate.getSolar();
        if (!nextSolarDate) continue;

        const nextTargetDate = new Date(nextSolarDate.getYear(), nextSolarDate.getMonth() - 1, nextSolarDate.getDay());
        days = Math.ceil((nextTargetDate - currentDate) / (1000 * 60 * 60 * 24));
      }

      if (days >= 0 && days < minDays) {
        minDays = days;
        nearestEvent = {
          text: festival.name,
          colors: festival.colors,
          days: days
        };
      }
    } catch (error) {
      // 忽略无效日期（如闰月处理）
      console.warn('Festival date error:', festival, error);
    }
  }

  // 定义公历节日列表（固定日期）
  const solarFestivals = [
    { month: 3, day: 8, name: '妇女节👩', colors: ['#ec4899', '#db2777'] },
    { month: 3, day: 12, name: '植树节🌳', colors: ['#10b981', '#059669'] },
    { month: 5, day: 1, name: '劳动节💪', colors: ['#ef4444', '#dc2626'] },
    { month: 5, day: 4, name: '青年节🎓', colors: ['#3b82f6', '#2563eb'] },
    { month: 6, day: 1, name: '儿童节🎈', colors: ['#f59e0b', '#d97706'] },
    { month: 7, day: 1, name: '建党节🎉', colors: ['#dc2626', '#b91c1c'] },
    { month: 8, day: 1, name: '建军节🎖️', colors: ['#10b981', '#059669'] },
    { month: 10, day: 1, name: '国庆节🇨🇳', colors: ['#dc2626', '#b91c1c'] },
    { month: 12, day: 25, name: '圣诞节🎄', colors: ['#10b981', '#059669'] }
  ];

  // 查找最近的公历节日（固定日期）
  for (const festival of solarFestivals) {
    try {
      const year = currentSolar.getYear();

      // 尝试今年的日期
      let targetDate = new Date(year, festival.month - 1, festival.day);
      let days = Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24));

      // 如果已经过了今年的，查找明年的
      if (days < 0) {
        targetDate = new Date(year + 1, festival.month - 1, festival.day);
        days = Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24));
      }

      if (days >= 0 && days < minDays) {
        minDays = days;
        nearestEvent = {
          text: festival.name,
          colors: festival.colors,
          days: days
        };
      }
    } catch (error) {
      console.warn('Solar festival date error:', festival, error);
    }
  }

  // 查找母亲节和父亲节（浮动日期）
  try {
    const year = currentSolar.getYear();

    // 母亲节：5月第二个周日
    const may1 = Solar.fromYmd(year, 5, 1);
    const may1WeekDay = may1.getWeek();
    const mothersDay = may1WeekDay === 0 ? 8 : (7 - may1WeekDay + 1 + 7);
    let mothersDayDate = new Date(year, 4, mothersDay);
    let mothersDays = Math.ceil((mothersDayDate - currentDate) / (1000 * 60 * 60 * 24));

    if (mothersDays < 0) {
      const nextYear = year + 1;
      const nextMay1 = Solar.fromYmd(nextYear, 5, 1);
      const nextMay1WeekDay = nextMay1.getWeek();
      const nextMothersDay = nextMay1WeekDay === 0 ? 8 : (7 - nextMay1WeekDay + 1 + 7);
      mothersDayDate = new Date(nextYear, 4, nextMothersDay);
      mothersDays = Math.ceil((mothersDayDate - currentDate) / (1000 * 60 * 60 * 24));
    }

    if (mothersDays >= 0 && mothersDays < minDays) {
      minDays = mothersDays;
      nearestEvent = {
        text: '母亲节💐',
        colors: ['#ec4899', '#db2777'],
        days: mothersDays
      };
    }

    // 父亲节：6月第三个周日
    const june1 = Solar.fromYmd(year, 6, 1);
    const june1WeekDay = june1.getWeek();
    const fathersDay = june1WeekDay === 0 ? 15 : (7 - june1WeekDay + 1 + 14);
    let fathersDayDate = new Date(year, 5, fathersDay);
    let fathersDays = Math.ceil((fathersDayDate - currentDate) / (1000 * 60 * 60 * 24));

    if (fathersDays < 0) {
      const nextYear = year + 1;
      const nextJune1 = Solar.fromYmd(nextYear, 6, 1);
      const nextJune1WeekDay = nextJune1.getWeek();
      const nextFathersDay = nextJune1WeekDay === 0 ? 15 : (7 - nextJune1WeekDay + 1 + 14);
      fathersDayDate = new Date(nextYear, 5, nextFathersDay);
      fathersDays = Math.ceil((fathersDayDate - currentDate) / (1000 * 60 * 60 * 24));
    }

    if (fathersDays >= 0 && fathersDays < minDays) {
      minDays = fathersDays;
      nearestEvent = {
        text: '父亲节👔',
        colors: ['#3b82f6', '#2563eb'],
        days: fathersDays
      };
    }
  } catch (error) {
    console.warn('Floating festival error:', error);
  }

  // 查找最近的节气 - 使用 Lunar 对象的 getNextJieQi 方法
  try {
    const nextJieQi = currentLunar.getNextJieQi(true); // true 表示只获取节气，不含中气

    if (nextJieQi) {
      const jieQiName = nextJieQi.getName();
      const nextJieQiSolar = nextJieQi.getSolar();

      if (nextJieQiSolar && solarTerms[jieQiName]) {
        const nextJieQiDate = new Date(
          nextJieQiSolar.getYear(),
          nextJieQiSolar.getMonth() - 1,
          nextJieQiSolar.getDay()
        );

        const days = Math.ceil((nextJieQiDate - currentDate) / (1000 * 60 * 60 * 24));

        if (days >= 0 && days < minDays) {
          minDays = days;
          nearestEvent = {
            text: solarTerms[jieQiName].text,
            colors: solarTerms[jieQiName].colors,
            days: days
          };
        }

        // 检查寒食节（清明前一天）
        if (jieQiName === '清明') {
          const hanshiDays = days - 1;
          if (hanshiDays >= 0 && hanshiDays < minDays) {
            minDays = hanshiDays;
            nearestEvent = {
              text: '寒食节🍃',
              colors: ['#10b981', '#059669'],
              days: hanshiDays
            };
          }
        }
      }
    }
  } catch (error) {
    console.error('查找节气时出错:', error);
  }

  return nearestEvent;
}

// 格式化数字时钟显示
const digitalTime = computed(() => {
  const hours = String(currentTime.value.getHours()).padStart(2, '0');
  const minutes = String(currentTime.value.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.value.getSeconds()).padStart(2, '0');
  return { hours, minutes, seconds };
});

const digitalDate = computed(() => {
  const year = currentTime.value.getFullYear();
  const month = String(currentTime.value.getMonth() + 1).padStart(2, '0');
  const date = String(currentTime.value.getDate()).padStart(2, '0');
  const day = weekDays[currentTime.value.getDay()];
  return `${year}-${month}-${date} 周${day}`;
});

const lunarDate = computed(() => {
  try {
    const solar = Solar.fromDate(currentTime.value);
    if (!solar) {
      console.error('Failed to create Solar object from date:', currentTime.value);
      return {
        text: '农历加载中...',
        festival: null,
        lunar: null
      };
    }

    const lunar = solar.getLunar();
    if (!lunar) {
      console.error('Failed to get Lunar from Solar');
      return {
        text: '农历加载中...',
        festival: null,
        lunar: null
      };
    }

    const ganZhiYear = lunar.getYearInGanZhi();

  // 获取生肖
  const zodiacIndex = (lunar.getYear() - 4) % 12;
  const zodiac = zodiacEmoji[zodiacIndex];

  // 优先级：农历节日 > 公历节日 > 寒食节 > 节气
  const lunarFestival = getTraditionalFestival(lunar);
  const solarFestival = getSolarFestival(solar);
  const floatingFestival = getFloatingSolarFestival(solar);
  const hanshiFestival = getHanshiFestival(solar);
  const solarTerm = getSolarTerm(solar);

  let specialDay = lunarFestival || solarFestival || floatingFestival || hanshiFestival || solarTerm;

  // 如果当天没有节日或节气，显示下一个节日/节气的倒计时
  if (!specialDay) {
    const nextEvent = getNextFestivalOrSolarTerm(currentTime.value);
    if (nextEvent) {
      // 去除所有emoji字符，保留文字
      const eventName = nextEvent.text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

      if (nextEvent.days === 0) {
        specialDay = {
          text: nextEvent.text,
          colors: nextEvent.colors,
          isCountdown: false
        };
      } else {
        // 分离倒计时的各个部分
        specialDay = {
          text: `距${eventName}${nextEvent.days}天`,
          colors: nextEvent.colors,
          isCountdown: true,
          countdownPrefix: `距${eventName}`,
          countdownDays: nextEvent.days,
          countdownSuffix: '天'
        };
      }
    }
  }

    return {
      text: `${ganZhiYear}年${zodiac} ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      festival: specialDay,
      lunar
    };
  } catch (error) {
    console.error('Error in lunarDate computed:', error);
    return {
      text: '农历加载失败',
      festival: null,
      lunar: null
    };
  }
});

// 星座信息
const zodiacInfo = computed(() => {
  const month = currentTime.value.getMonth() + 1;
  const day = currentTime.value.getDate();
  return getZodiacSign(month, day);
});

// 时段主题
const timeTheme = computed(() => {
  const hour = currentTime.value.getHours();
  return getTimeTheme(hour);
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

function handleClockClick(event) {
  event.preventDefault();
  event.stopPropagation();
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
  cursor: pointer;
  user-select: none;
}


.pendulum-clock {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: top center;
  animation: pendulum-swing 2s ease-in-out infinite;
  pointer-events: none; /* 让点击穿透到子元素 */
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
  pointer-events: none; /* 让点击穿透到wrapper */
}

.clock-chain {
  width: 2.5px;
  height: 108px;
  background: currentColor;
  margin-bottom: 2px;
  pointer-events: none; /* 让点击穿透到wrapper */
}

.clock-face {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--vp-c-bg, #ffffff);
  /* border: 2.5px solid currentColor; */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  pointer-events: auto; /* 确保可以接收点击事件 */
  position: relative;
  z-index: 10;
}

/* 数字时钟模式下的长方形样式 */
.digital-mode .clock-face,
.clock-face.digital-mode-active {
  width: 210px;
  height: 135px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  position: fixed !important;
  left: 25px !important;
  bottom: 25px !important;
  z-index: 9999 !important;
  cursor: pointer;
  pointer-events: auto !important; /* 确保数字模式下可以点击 */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 使用outline创建双虚线效果 */
.digital-mode .clock-face::before,
.clock-face.digital-mode-active::before {
  content: '';
  position: absolute;
  top: -6px;
  left: -6px;
  width: calc(100% + 12px);
  height: calc(100% + 12px);
  border-radius: 26px;
  border: 2.5px dashed;
  pointer-events: none;
  opacity: 0.6;
}

.digital-mode .clock-face::after,
.clock-face.digital-mode-active::after {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  width: calc(100% + 6px);
  height: calc(100% + 6px);
  border-radius: 23px;
  border: 1.5px dashed;
  pointer-events: none;
  opacity: 0.8;
}

/* 时段主题边框颜色 */
.theme-morning::before,
.theme-morning::after {
  border-color: #fb923c;
}

.theme-forenoon::before,
.theme-forenoon::after {
  border-color: #06b6d4;
}

.theme-afternoon::before,
.theme-afternoon::after {
  border-color: #fbbf24;
}

.theme-evening::before,
.theme-evening::after {
  border-color: #f97316;
}

.theme-night::before,
.theme-night::after {
  border-color: #6366f1;
}

.clock-face:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.clock-face:active {
  transform: scale(0.98);
}

/* 数字模式下的交互效果 */
.digital-mode .clock-face:hover,
.clock-face.digital-mode-active:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.digital-mode .clock-face:active,
.clock-face.digital-mode-active:active {
  transform: translateY(0) scale(0.98);
}

/* 时段主题特定效果 */
.theme-morning:hover {
  box-shadow: 0 12px 40px rgba(251, 146, 60, 0.3);
}

.theme-forenoon:hover {
  box-shadow: 0 12px 40px rgba(6, 182, 212, 0.3);
}

.theme-afternoon:hover {
  box-shadow: 0 12px 40px rgba(251, 191, 36, 0.3);
}

.theme-evening:hover {
  box-shadow: 0 12px 40px rgba(249, 115, 22, 0.3);
}

.theme-night:hover {
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.3);
}

.clock-svg {
  width: 60px;
  height: 60px;
  color: var(--vp-c-text-1, #213547);
  pointer-events: none;
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
  padding: 16px 12px;
  gap: 6px;
  pointer-events: none;
}

.digital-date {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1.3;
  color: #64748b;
  opacity: 0.9;
}

.digital-time {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  gap: 2px;
}

.time-digit {
  display: inline-block;
  min-width: 1.2em;
  text-align: center;
  transition: all 0.3s ease;
}

.time-separator {
  color: #94a3b8;
  animation: blink 1.5s ease-in-out infinite;
}

@keyframes digit-flip {
  0% {
    transform: rotateX(0deg);
    opacity: 1;
  }
  50% {
    transform: rotateX(90deg);
    opacity: 0.5;
  }
  100% {
    transform: rotateX(0deg);
    opacity: 1;
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.digital-lunar {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5px;
  line-height: 1.3;
  color: #ef4444;
  opacity: 0.85;
}

.digital-extra {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 2px;
}

.zodiac-sign {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(139, 92, 246, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.08);
  transition: all 0.3s ease;
}

.zodiac-sign:hover {
  background: rgba(139, 92, 246, 0.06);
  border-color: rgba(139, 92, 246, 0.12);
  transform: translateY(-1px);
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.08);
}

.zodiac-icon {
  font-size: 18px;
  line-height: 1;
  filter: none;
  opacity: 0.75;
}

.zodiac-name {
  color: #8b5cf6;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.3px;
  opacity: 0.7;
}

.festival-tag {
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  opacity: 0.85;
}

/* 倒计时数字样式 */
.countdown-number {
  font-weight: 800;
  font-size: 12px;
  margin: 0 2px;
  letter-spacing: 0.5px;
  opacity: 1;
  display: inline-block;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
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
  background: rgba(15, 23, 42, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

html.dark .digital-mode .clock-face::before {
  opacity: 0.5;
}

html.dark .digital-mode .clock-face::after {
  opacity: 0.7;
}

html.dark .digital-date {
  color: #94a3b8;
}

html.dark .time-separator {
  color: #64748b;
}

html.dark .digital-lunar {
  color: #fca5a5;
}

html.dark .zodiac-sign {
  background: rgba(196, 181, 253, 0.04);
  border-color: rgba(196, 181, 253, 0.08);
}

html.dark .zodiac-sign:hover {
  background: rgba(196, 181, 253, 0.06);
  border-color: rgba(196, 181, 253, 0.12);
  box-shadow: 0 1px 3px rgba(196, 181, 253, 0.1);
}

html.dark .zodiac-icon {
  filter: none;
  opacity: 0.7;
}

html.dark .zodiac-name {
  color: #c4b5fd;
  opacity: 0.65;
}

html.dark .festival-tag {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  opacity: 0.8;
}

html.dark .countdown-number {
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
</style>
