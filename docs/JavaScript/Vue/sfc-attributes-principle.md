---
title: Vue SFC 标签属性与底层原理深度解析
date: 2026-01-19 10:53:45
tags:
  - Vue
  - Vue 3
  - SFC
  - 编译原理
  - Scoped CSS
  - TypeScript
categories:
  - Vue
---

# Vue SFC 标签属性与底层原理深度解析

Vue 单文件组件（SFC，Single File Component）中的 `<style lang="scss" scoped>` 和 `<script lang="ts" setup>` 看似简单的属性配置，背后却蕴含着复杂的编译转换机制。本文将深入剖析这些属性的作用、底层原理以及为什么配置就能生效。

## 单文件组件（SFC）编译流程

在深入各个属性之前，先了解 Vue SFC 的编译流程：

```
.vue 文件
    ↓
@vue/compiler-sfc 解析
    ↓
分离三个部分：
├── <template> → 编译成 render 函数
├── <script>   → 编译成 JavaScript 模块
└── <style>    → 编译成 CSS
    ↓
生成最终代码
    ↓
浏览器可执行的 JavaScript + CSS
```

### 编译器架构

```javascript
// Vue SFC 编译器核心
import { parse, compileTemplate, compileScript, compileStyle } from '@vue/compiler-sfc';

// 1. 解析 .vue 文件
const descriptor = parse(source, { filename: 'Component.vue' });

// descriptor 结构：
{
  template: { content, attrs, loc },
  script: { content, attrs, loc },
  scriptSetup: { content, attrs, loc },
  styles: [{ content, attrs, scoped, module }],
  customBlocks: []
}

// 2. 编译各个部分
const compiledTemplate = compileTemplate({
  source: descriptor.template.content,
  id: scopeId,
});

const compiledScript = compileScript(descriptor, {
  id: scopeId,
  inlineTemplate: true,
});

const compiledStyles = descriptor.styles.map(style =>
  compileStyle({
    source: style.content,
    scoped: style.scoped,
    id: scopeId,
  })
);
```

## `<style>` 标签属性详解

### `lang="scss"` - 预处理器支持

#### 作用

指定样式使用的预处理器语言，支持：
- `scss` / `sass`
- `less`
- `stylus`
- `postcss`

#### 底层原理

##### 1. 编译流程

```javascript
// Vite 编译流程示例
import { compileStyle } from '@vue/compiler-sfc';

const result = compileStyle({
  source: styleBlock.content,
  filename: 'Component.vue',
  id: scopeId,

  // 关键：预处理器配置
  preprocessLang: 'scss',  // 从 lang 属性获取

  // 预处理器选项
  preprocessOptions: {
    scss: {
      additionalData: `@import "@/styles/variables.scss";`
    }
  }
});
```

##### 2. 转换链路

```
.vue 文件
  ↓
解析 <style lang="scss">
  ↓
提取 SCSS 代码
  ↓
调用 Sass 编译器 (node-sass / sass)
  ↓
转换为标准 CSS
  ↓
后续处理（scoped、压缩等）
  ↓
注入到页面
```

##### 3. 实际转换示例

```vue
<!-- 源代码 -->
<style lang="scss" scoped>
$primary-color: #3498db;

.container {
  background: $primary-color;

  .title {
    color: darken($primary-color, 10%);
  }
}
</style>
```

**编译后：**

```javascript
// 1. 先通过 Sass 编译器转换
const sassCompiler = require('sass');

const sassResult = sassCompiler.renderSync({
  data: `
    $primary-color: #3498db;
    .container {
      background: $primary-color;
      .title {
        color: darken($primary-color, 10%);
      }
    }
  `
});

// sassResult.css 为：
/*
.container {
  background: #3498db;
}
.container .title {
  color: #2980b9;
}
*/

// 2. 再进行 scoped 处理（下面会详细讲）
```

##### 4. 为什么配置就能生效？

**关键是构建工具链：**

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      scss: {
        // 这些配置会被传递给 Sass 编译器
        additionalData: `@import "@/styles/variables.scss";`,
        charset: false,
      }
    }
  }
}
```

**Vite 插件机制：**

```javascript
// @vitejs/plugin-vue 内部实现（简化版）
function vuePlugin() {
  return {
    name: 'vite:vue',

    async transform(code, id) {
      if (!id.endsWith('.vue')) return;

      // 1. 解析 .vue 文件
      const { descriptor } = parse(code, { filename: id });

      // 2. 处理 <style> 块
      const stylesCode = await Promise.all(
        descriptor.styles.map(async (style, index) => {
          // 3. 根据 lang 属性选择预处理器
          if (style.lang === 'scss') {
            // 调用 Sass 编译器
            const sassResult = await compileSass(style.content);
            style.content = sassResult.css;
          }

          // 4. 应用 scoped（如果有）
          if (style.scoped) {
            style.content = applyScopedStyles(style.content, scopeId);
          }

          return style.content;
        })
      );

      return {
        code: generateCode(descriptor),
        map: null
      };
    }
  };
}
```

### `scoped` - 样式作用域隔离

#### 作用

限制样式只作用于当前组件，避免样式污染。

#### 底层原理（重点）

##### 1. 属性选择器方案

Vue 采用**属性选择器**实现样式隔离：

```vue
<!-- 源代码 -->
<template>
  <div class="container">
    <h1 class="title">Hello</h1>
  </div>
</template>

<style scoped>
.container {
  background: #fff;
}

.title {
  color: #333;
}
</style>
```

**编译后的 HTML：**

```html
<!-- 每个元素都被添加了唯一的 data 属性 -->
<div class="container" data-v-7ba5bd90>
  <h1 class="title" data-v-7ba5bd90>Hello</h1>
</div>
```

**编译后的 CSS：**

```css
/* 每个选择器都被添加了属性选择器 */
.container[data-v-7ba5bd90] {
  background: #fff;
}

.title[data-v-7ba5bd90] {
  color: #333;
}
```

##### 2. Scope ID 生成

```javascript
// @vue/compiler-sfc 内部实现
import { createHash } from 'crypto';

function generateScopeId(filename, source) {
  // 基于文件路径和内容生成唯一 ID
  const hash = createHash('sha256')
    .update(filename + source)
    .digest('hex')
    .substring(0, 8);

  return `data-v-${hash}`;
}

// 示例：
// filename: 'src/components/UserCard.vue'
// scopeId: 'data-v-7ba5bd90'
```

##### 3. 完整的编译流程

```javascript
// compileStyle 函数内部实现（简化版）
function compileStyle(options) {
  const { source, scoped, id } = options;

  if (!scoped) {
    return { code: source };
  }

  // 1. 解析 CSS
  const ast = postcss.parse(source);

  // 2. 遍历所有规则，添加属性选择器
  ast.walkRules(rule => {
    rule.selector = scopeSelector(rule.selector, id);
  });

  // 3. 生成最终 CSS
  return { code: ast.toString() };
}

function scopeSelector(selector, scopeId) {
  // 处理各种选择器类型

  // 普通选择器：.class → .class[data-v-xxx]
  if (selector === '.class') {
    return `.class[${scopeId}]`;
  }

  // 后代选择器：.parent .child → .parent[data-v-xxx] .child[data-v-xxx]
  if (selector === '.parent .child') {
    return `.parent[${scopeId}] .child[${scopeId}]`;
  }

  // 伪类：.class:hover → .class[data-v-xxx]:hover
  if (selector === '.class:hover') {
    return `.class[${scopeId}]:hover`;
  }

  // ... 更多情况
}
```

##### 4. PostCSS 插件实现

实际上 Vue 使用 PostCSS 插件来实现 scoped：

```javascript
// @vue/compiler-sfc/src/stylePlugins/scoped.ts
import postcss from 'postcss';

export default postcss.plugin('vue-scoped', (options) => {
  const { id } = options;

  return (root) => {
    root.walkRules((rule) => {
      // 处理每个 CSS 规则
      rule.selector = rule.selector.split(',').map(selector => {
        return processSelector(selector.trim(), id);
      }).join(',');
    });
  };
});

function processSelector(selector, id) {
  const pseudoIndex = selector.search(/::?/);

  if (pseudoIndex !== -1) {
    // 处理伪类/伪元素
    const before = selector.slice(0, pseudoIndex);
    const after = selector.slice(pseudoIndex);
    return `${before}[${id}]${after}`;
  }

  // 普通选择器
  return `${selector}[${id}]`;
}
```

##### 5. 深度选择器

```vue
<style scoped>
/* 方式一：:deep() 伪类 */
.parent :deep(.child) {
  color: red;
}

/* 方式二：>>> 操作符（某些预处理器不支持） */
.parent >>> .child {
  color: red;
}

/* 方式三：/deep/ 操作符（已废弃） */
.parent /deep/ .child {
  color: red;
}
</style>
```

**编译后：**

```css
/* :deep() 会被处理为只在父元素添加属性选择器 */
.parent[data-v-7ba5bd90] .child {
  color: red;
}
```

**实现原理：**

```javascript
function processDeepSelector(selector, id) {
  // 匹配 :deep() 或 >>>
  const deepRegex = /:deep\((.*?)\)|>>>(.*)/;

  if (deepRegex.test(selector)) {
    // 只在 :deep() 之前的选择器添加属性选择器
    return selector.replace(deepRegex, (match, p1, p2) => {
      return p1 || p2; // 移除 :deep() 或 >>>
    });
  }

  // 在最后一个选择器添加属性选择器
  return addScopeToLastSelector(selector, id);
}
```

##### 6. 为什么能隔离样式？

**CSS 选择器优先级：**

```css
/* 没有 scoped 的样式 */
.title {
  color: blue;
}

/* 有 scoped 的样式（优先级更高） */
.title[data-v-7ba5bd90] {
  color: red;
}

/* 结果：红色 */
/* 因为属性选择器增加了选择器的优先级 */
```

**specificity 计算：**
- `.title` = 0,1,0
- `.title[data-v-7ba5bd90]` = 0,2,0 （更高）

## `<script>` 标签属性详解

### `lang="ts"` - TypeScript 支持

#### 作用

使用 TypeScript 编写组件逻辑，提供类型检查和 IDE 智能提示。

#### 底层原理

##### 1. 编译流程

```javascript
// compileScript 内部实现（简化版）
function compileScript(descriptor, options) {
  const { script, scriptSetup } = descriptor;

  // 获取 lang 属性
  const lang = script?.lang || scriptSetup?.lang || 'js';

  if (lang === 'ts') {
    // 调用 TypeScript 编译器
    const tsResult = compileTSCode(script.content);
    script.content = tsResult.outputText;
  }

  return generateScriptCode(script);
}
```

##### 2. TypeScript 转换链路

```
.vue 文件
  ↓
解析 <script lang="ts">
  ↓
提取 TypeScript 代码
  ↓
TypeScript 编译器 (tsc / esbuild)
  ↓
转换为 JavaScript (ES6+)
  ↓
Babel 转换（如需要）
  ↓
目标环境的 JavaScript
```

##### 3. 实际转换示例

```vue
<!-- 源代码 -->
<script lang="ts">
import { defineComponent, ref } from 'vue';

interface User {
  id: number;
  name: string;
}

export default defineComponent({
  setup() {
    const user = ref({ id: 1, name: 'John' });
    const count = ref(0);

    const increment = () => {
      count.value++;
    };

    return { user, count, increment };
  }
});
</script>
```

**TypeScript 编译后：**

```javascript
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const user = ref({ id: 1, name: 'John' });
    const count = ref(0);

    const increment = () => {
      count.value++;
    };

    return { user, count, increment };
  }
});
```

##### 4. Vite 中的 TypeScript 处理

```javascript
// vite.config.ts
export default {
  plugins: [
    vue({
      script: {
        // 默认使用 esbuild 转换 TS
        // esbuild 只做类型擦除，不做类型检查
        babelParserPlugins: ['typescript'],
      }
    })
  ]
}
```

**esbuild 转换（快速）：**
```javascript
// 只移除类型注解，不检查类型
import { transform } from 'esbuild';

const result = await transform(code, {
  loader: 'ts',
  format: 'esm',
  target: 'es2020'
});
```

**tsc 类型检查（完整）：**
```bash
# 在构建时进行类型检查
vue-tsc --noEmit
```

### `setup` - 组合式 API 语法糖

这是本文的**重点**部分，将深入剖析 `<script setup>` 的底层机制。

#### `<script setup>` vs `setup()` 函数的本质区别

很多人认为只是语法糖，实际上它们在**编译后的代码结构**上有巨大差异。

##### 错误理解

```
❌ 简单认为：
<script setup> = setup() { return { ... } }
```

##### 正确理解

```
✅ 实际上：
<script setup> 是一套完整的编译时转换系统
- 顶层变量自动暴露
- 自动注册组件
- 自动处理 props、emit、slots
- 优化的代码生成
- 更好的类型推导
```

#### 深度剖析：编译转换过程

##### 1. 源代码示例

```vue
<script setup>
import { ref, computed } from 'vue';
import ChildComponent from './Child.vue';

const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 }
});

const emit = defineEmits(['update', 'delete']);

const count = ref(0);
const doubleCount = computed(() => count.value * 2);

function increment() {
  count.value++;
  emit('update', count.value);
}
</script>

<template>
  <div>
    <h1>{{ props.title }}</h1>
    <p>{{ count }} - {{ doubleCount }}</p>
    <button @click="increment">+1</button>
    <ChildComponent />
  </div>
</template>
```

##### 2. 编译后的完整代码

```javascript
import {
  ref,
  computed,
  defineComponent,
  // 编译器自动添加的导入
} from 'vue';
import ChildComponent from './Child.vue';

// 编译器生成的代码
export default defineComponent({
  // 自动注册组件
  components: {
    ChildComponent
  },

  // props 定义（从 defineProps 提取）
  props: {
    title: { type: String, required: true },
    count: { type: Number, required: false }
  },

  // emits 定义（从 defineEmits 提取）
  emits: ['update', 'delete'],

  // setup 函数
  setup(__props, { emit: __emit }) {
    // 原始代码中的所有顶层绑定
    const count = ref(0);
    const doubleCount = computed(() => count.value * 2);

    function increment() {
      count.value++;
      __emit('update', count.value);
    }

    // 自动返回所有顶层绑定
    return {
      props: __props,
      emit: __emit,
      count,
      doubleCount,
      increment,
      ChildComponent
    };
  }
});
```

##### 3. 关键转换规则

**规则 1：顶层绑定自动暴露**

```javascript
// 源代码
const count = ref(0);
const name = 'John';
function greet() {}

// 编译后
setup() {
  const count = ref(0);
  const name = 'John';
  function greet() {}

  // 自动返回
  return { count, name, greet };
}
```

**规则 2：导入的组件自动注册**

```javascript
// 源代码
import UserCard from './UserCard.vue';

// 编译后
import UserCard from './UserCard.vue';

export default {
  components: { UserCard },
  setup() {
    return { UserCard };
  }
}
```

**规则 3：宏函数编译时处理**

```javascript
// defineProps 编译
defineProps({ msg: { type: String, required: true } })
  ↓
props: {
  msg: { type: String, required: true }
}

// defineEmits 编译
const emit = defineEmits(['click'])
  ↓
emits: ['click']
setup(__props, { emit }) {
  return { emit };
}

// defineExpose 编译
defineExpose({ count })
  ↓
setup() {
  return {
    // 暴露给父组件的属性
    __expose: { count }
  };
}
```

##### 4. 编译器实现细节

```javascript
// @vue/compiler-sfc 内部实现（简化版）
function compileScriptSetup(sfc, options) {
  const { script, scriptSetup } = sfc;

  if (!scriptSetup) {
    return compileScript(script);
  }

  // 1. 解析 AST
  const ast = babelParse(scriptSetup.content, {
    plugins: ['typescript'],
  });

  // 2. 分析绑定
  const bindings = new Set();
  const imports = new Map();
  const components = new Map();

  traverse(ast, {
    // 收集所有顶层变量声明
    VariableDeclaration(path) {
      if (path.parent.type === 'Program') {
        path.node.declarations.forEach(decl => {
          bindings.add(decl.id.name);
        });
      }
    },

    // 收集函数声明
    FunctionDeclaration(path) {
      if (path.parent.type === 'Program') {
        bindings.add(path.node.id.name);
      }
    },

    // 收集导入
    ImportDeclaration(path) {
      path.node.specifiers.forEach(spec => {
        imports.set(spec.local.name, path.node.source.value);

        // Vue 组件导入
        if (path.node.source.value.endsWith('.vue')) {
          components.set(spec.local.name, true);
        }
      });
    },

    // 处理宏函数
    CallExpression(path) {
      if (path.node.callee.name === 'defineProps') {
        // 提取 props 定义
        extractPropsDefinition(path);
      }
      if (path.node.callee.name === 'defineEmits') {
        // 提取 emits 定义
        extractEmitsDefinition(path);
      }
    },
  });

  // 3. 生成代码
  return generateSetupCode({
    bindings,
    imports,
    components,
    props: extractedProps,
    emits: extractedEmits,
  });
}

function generateSetupCode(analyzed) {
  const { bindings, components, props, emits } = analyzed;

  return `
export default {
  ${components.size > 0 ? `components: { ${Array.from(components.keys()).join(', ')} },` : ''}
  ${props ? `props: ${generatePropsObject(props)},` : ''}
  ${emits ? `emits: ${JSON.stringify(Array.from(emits))},` : ''}

  setup(__props, { emit: __emit }) {
    ${generateOriginalCode()}

    return {
      ${Array.from(bindings).join(',\n      ')}
    };
  }
}
  `;
}
```

##### 5. 宏函数的实现原理

宏函数（Macro）在**编译时**被处理，运行时不存在。

```javascript
// 源代码
const props = defineProps({
  msg: { type: String, required: true }
});

// defineProps 的定义
function defineProps(options) {
  // 运行时处理 props 定义
  return options;
}

// 编译器识别到 defineProps 调用
// 1. 提取 props 定义对象
// 2. 转换为组件的 props 选项
// 3. 生成 props 访问代码
```

**编译器处理：**

```javascript
function processDefineProps(callExpression, typeParameters) {
  // 1. 提取 TypeScript 类型
  const propsType = typeParameters[0]; // { msg: string }

  // 2. 转换为运行时定义
  const runtimeProps = convertTypeToRuntimeProps(propsType);
  // { msg: { type: String, required: true } }

  // 3. 移除调用，用 __props 替换
  replaceNode(callExpression, createIdentifier('__props'));

  return runtimeProps;
}
```

#### `<script setup>` 的性能优化

##### 1. 更少的开销

```javascript
// ❌ 传统 setup()
export default {
  setup() {
    const count = ref(0);

    // 需要手动返回
    return {
      count
    };
  }
}

// ✅ <script setup>
// 编译器自动处理，运行时无额外开销
const count = ref(0);
```

##### 2. 更好的 Tree-shaking

```javascript
// ❌ 传统方式：即使未使用，也会被包含
import { someHelper } from './utils';

export default {
  setup() {
    // someHelper 未使用，但仍被打包
    return {};
  }
}

// ✅ <script setup>：未使用的导入会被移除
import { someHelper } from './utils'; // 打包时会被移除
```

##### 3. 内联优化

编译器可以进行更激进的优化：

```javascript
// 源代码
<script setup>
const count = ref(0);
const message = computed(() => `Count: ${count.value}`);
</script>

<template>
  <div>{{ message }}</div>
</template>

// 编译器可以内联 computed
// 生成更优化的 render 函数
function render() {
  return h('div', `Count: ${count.value}`);
}
```

#### 完整对比表格

| 特性 | `<script setup>` | `setup()` 函数 |
|------|------------------|----------------|
| **语法复杂度** | 简洁 | 需要返回 |
| **编译时优化** | ✅ 更多优化 | ❌ 有限 |
| **组件自动注册** | ✅ 自动 | ❌ 需手动 |
| **props 类型推导** | ✅ 完整 | ⚠️ 需手动标注 |
| **性能** | 更好 | 稍差 |
| **Tree-shaking** | ✅ 更好 | ⚠️ 一般 |
| **编译后代码** | 优化的 | 直接转换 |
| **TypeScript 支持** | ✅ 原生支持 | ⚠️ 需要配置 |
| **顶层 await** | ✅ 支持 | ❌ 不支持 |
| **宏函数** | ✅ 支持 | ❌ 需手动处理 |

#### 实质做了什么？

##### `<script setup>` 实际上是一个**编译时转换系统**：

1. **AST 分析**：解析代码结构
2. **绑定收集**：收集所有顶层声明
3. **导入处理**：识别组件导入
4. **宏展开**：处理 defineProps、defineEmits 等
5. **代码生成**：生成优化的 setup 函数
6. **类型提取**：提取 TypeScript 类型信息
7. **优化应用**：Tree-shaking、内联等

##### 不仅仅是 return 的区别：

```javascript
// 这只是表面
<script setup>     vs    setup() { return { ... } }

// 实际区别
编译时分析和优化   vs    运行时动态处理
自动绑定收集       vs    手动返回
宏函数支持         vs    普通函数调用
更好的类型推导     vs    需要手动标注
组件自动注册       vs    手动注册
性能优化           vs    标准处理
```

## 配置生效的完整链路

### Vite 项目完整流程

```javascript
// 1. vite.config.ts 配置
export default {
  plugins: [
    vue({
      // Vue 插件配置
      script: {
        babelParserPlugins: ['typescript'],
        propsDestructure: true,
      },
      style: {
        // 样式配置
      }
    })
  ],

  css: {
    preprocessorOptions: {
      scss: {
        // Sass 编译器配置
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
}

// 2. @vitejs/plugin-vue 处理
export function vuePlugin(options) {
  return {
    name: 'vite:vue',

    async transform(code, id) {
      if (!id.endsWith('.vue')) return;

      // a. 解析 SFC
      const { descriptor, errors } = parse(code, {
        filename: id,
        sourceMap: true,
      });

      // b. 编译 <script setup>
      if (descriptor.scriptSetup) {
        const compiledScript = await compileScript(descriptor, {
          id: scopeId,
          isProd: isProduction,
          inlineTemplate: true,

          // 关键：传递 lang 属性
          lang: descriptor.scriptSetup.attrs.lang,
        });
      }

      // c. 编译 <style scoped>
      const stylesCode = await Promise.all(
        descriptor.styles.map(async style => {
          // 关键：读取 lang 和 scoped 属性
          const lang = style.attrs.lang || 'css';
          const scoped = style.attrs.scoped != null;

          // 预处理器编译
          if (lang !== 'css') {
            style.content = await compilePreprocessor(
              style.content,
              lang,
              options.preprocessorOptions?.[lang]
            );
          }

          // scoped 处理
          if (scoped) {
            style.content = await compileScopedStyle(
              style.content,
              scopeId
            );
          }

          return style.content;
        })
      );

      return {
        code: generateComponentCode(descriptor),
        map: generateSourceMap(descriptor)
      };
    }
  };
}

// 3. 浏览器接收
// - JavaScript 代码（已编译）
// - CSS 代码（已编译 + scoped）
// - 直接执行，无需额外处理
```

### 为什么配置就能生效？

**核心答案：编译时转换 + 构建工具链**

```
配置属性
  ↓
构建工具读取（Vite/Webpack）
  ↓
调用对应编译器
  ├─ lang="scss"  → Sass 编译器
  ├─ scoped       → PostCSS 插件
  ├─ lang="ts"    → TypeScript 编译器
  └─ setup        → Vue 编译器（特殊处理）
  ↓
转换为浏览器可执行代码
  ↓
注入到页面
```

## 完整示例：从源码到运行时

### 源代码

```vue
<!-- UserCard.vue -->
<template>
  <div class="user-card">
    <h2 class="title">{{ props.name }}</h2>
    <p class="age">Age: {{ age }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  initialAge: { type: Number, default: 0 }
});

const emit = defineEmits(['update']);

const age = ref(props.initialAge || 0);
const doubleAge = computed(() => age.value * 2);

function increment() {
  age.value++;
  emit('update', age.value);
}
</script>

<style lang="scss" scoped>
$primary-color: #3498db;

.user-card {
  background: lighten($primary-color, 40%);
  padding: 20px;

  .title {
    color: $primary-color;
    font-size: 24px;
  }

  .age {
    color: darken($primary-color, 10%);
  }
}
</style>
```

### 编译步骤详解

#### 步骤 1：解析 SFC

```javascript
const descriptor = parse(source);

// descriptor 结构：
{
  template: {
    content: '<div class="user-card">...</div>',
    attrs: {},
  },
  scriptSetup: {
    content: 'import { ref, computed } from "vue"; ...',
    attrs: { lang: 'ts', setup: true },
  },
  styles: [{
    content: '$primary-color: #3498db; .user-card { ... }',
    attrs: { lang: 'scss', scoped: true },
  }],
}
```

#### 步骤 2：编译 `<script setup lang="ts">`

```javascript
// 2.1 TypeScript 转换（移除类型）
const jsCode = `
import { ref, computed } from 'vue';

const props = defineProps();
const emit = defineEmits();

const age = ref(props.initialAge || 0);
const doubleAge = computed(() => age.value * 2);

function increment() {
  age.value++;
  emit('update', age.value);
}
`;

// 2.2 宏函数处理
const propsDefinition = {
  name: { type: String, required: true },
  initialAge: { type: Number, required: false }
};

const emitsDefinition = ['update'];

// 2.3 生成最终代码
const compiledScript = `
import { ref, computed, defineComponent } from 'vue';

export default defineComponent({
  props: {
    name: { type: String, required: true },
    initialAge: { type: Number, required: false }
  },
  emits: ['update'],

  setup(__props, { emit: __emit }) {
    const age = ref(__props.initialAge || 0);
    const doubleAge = computed(() => age.value * 2);

    function increment() {
      age.value++;
      __emit('update', age.value);
    }

    return {
      props: __props,
      age,
      doubleAge,
      increment
    };
  }
});
`;
```

#### 步骤 3：编译 `<style lang="scss" scoped>`

```javascript
// 3.1 SCSS 编译
const sassResult = sass.renderSync({
  data: `
    $primary-color: #3498db;

    .user-card {
      background: lighten($primary-color, 40%);
      padding: 20px;

      .title {
        color: $primary-color;
        font-size: 24px;
      }

      .age {
        color: darken($primary-color, 10%);
      }
    }
  `
});

// SCSS → CSS
const css = `
.user-card {
  background: #e3f2fd;
  padding: 20px;
}

.user-card .title {
  color: #3498db;
  font-size: 24px;
}

.user-card .age {
  color: #2980b9;
}
`;

// 3.2 Scoped 处理
const scopeId = 'data-v-7ba5bd90';

const scopedCss = `
.user-card[data-v-7ba5bd90] {
  background: #e3f2fd;
  padding: 20px;
}

.user-card .title[data-v-7ba5bd90] {
  color: #3498db;
  font-size: 24px;
}

.user-card .age[data-v-7ba5bd90] {
  color: #2980b9;
}
`;
```

#### 步骤 4：编译 Template

```javascript
const compiledTemplate = `
function render(_ctx, _cache) {
  return h('div', {
    class: 'user-card',
    'data-v-7ba5bd90': ''
  }, [
    h('h2', {
      class: 'title',
      'data-v-7ba5bd90': ''
    }, _ctx.props.name),
    h('p', {
      class: 'age',
      'data-v-7ba5bd90': ''
    }, 'Age: ' + _ctx.age),
    h('button', {
      onClick: _ctx.increment,
      'data-v-7ba5bd90': ''
    }, '+1')
  ]);
}
`;
```

#### 步骤 5：生成最终代码

```javascript
// UserCard.vue 最终编译结果
import { ref, computed, defineComponent, h } from 'vue';

// 样式注入（Vite 自动处理）
const css = `
.user-card[data-v-7ba5bd90] {
  background: #e3f2fd;
  padding: 20px;
}
.user-card .title[data-v-7ba5bd90] {
  color: #3498db;
  font-size: 24px;
}
.user-card .age[data-v-7ba5bd90] {
  color: #2980b9;
}
`;
__injectStyle(css);

// 组件定义
export default defineComponent({
  __scopeId: 'data-v-7ba5bd90',

  props: {
    name: { type: String, required: true },
    initialAge: { type: Number, required: false }
  },

  emits: ['update'],

  setup(__props, { emit: __emit }) {
    const age = ref(__props.initialAge || 0);
    const doubleAge = computed(() => age.value * 2);

    function increment() {
      age.value++;
      __emit('update', age.value);
    }

    return {
      props: __props,
      age,
      doubleAge,
      increment
    };
  },

  render(_ctx, _cache) {
    return h('div', {
      class: 'user-card',
      'data-v-7ba5bd90': ''
    }, [
      h('h2', {
        class: 'title',
        'data-v-7ba5bd90': ''
      }, _ctx.props.name),
      h('p', {
        class: 'age',
        'data-v-7ba5bd90': ''
      }, 'Age: ' + _ctx.age),
      h('button', {
        onClick: _ctx.increment,
        'data-v-7ba5bd90': ''
      }, '+1')
    ]);
  }
});
```

## 常见问题深度解答

### Q1: 为什么 scoped 样式还会影响子组件的根元素？

**原因**：子组件的根元素会同时拥有父组件和子组件的 scope ID。

```vue
<!-- Parent.vue -->
<style scoped>
.child {
  color: red; /* 会影响 Child 的根元素 */
}
</style>

<template>
  <Child class="child" />
</template>
```

**编译后**：

```html
<!-- 父组件渲染 -->
<div data-v-parent>
  <!-- 子组件根元素同时有两个属性 -->
  <div class="child" data-v-parent data-v-child>
    ...
  </div>
</div>
```

```css
/* 父组件样式 */
.child[data-v-parent] {
  color: red; /* 匹配！ */
}
```

### Q2: <script setup> 中如何访问组件实例？

**答案**：使用 `getCurrentInstance()`

```vue
<script setup>
import { getCurrentInstance } from 'vue';

const instance = getCurrentInstance();
const { proxy, ctx } = instance;

// 访问 $refs
console.log(proxy.$refs);

// 访问 $el
console.log(proxy.$el);
</script>
```

### Q3: 为什么不能在 <script setup> 中使用 this？

**原因**：`<script setup>` 在 setup 函数中执行，此时组件实例还未创建。

```javascript
// 编译后
setup(__props, { emit }) {
  // 此时 this 是 undefined
  console.log(this); // undefined

  // 组件实例在 setup 返回后才创建
  return { ... };
}
```

### Q4: CSS Modules 和 scoped 有什么区别？

**CSS Modules**：基于唯一类名
```vue
<style module>
.title {
  color: red;
}
</style>

<!-- 编译后 -->
<template>
  <h1 :class="$style.title">Title</h1>
</template>

<!-- 生成 -->
<h1 class="UserCard_title_1a2b3c">Title</h1>
```

**Scoped**：基于属性选择器
```vue
<style scoped>
.title {
  color: red;
}
</style>

<!-- 编译后 -->
<h1 class="title" data-v-123abc>Title</h1>
.title[data-v-123abc] { color: red; }
```

### Q5: defineProps 为什么不需要导入？

**答案**：它是编译器宏，不是真实的函数。

```javascript
// defineProps 的运行时版本
const props = defineProps({
  msg: { type: String, required: true }
});
  ↓
// 编译后生成
props: { msg: { type: String, required: true } }
setup(__props) {
  const props = __props;
  return { props };
}
```

## 参考资源

### 官方文档
- [Vue SFC 规范](https://cn.vuejs.org/api/sfc-spec.html)
- [<script setup> 文档](https://cn.vuejs.org/api/sfc-script-setup.html)
- [CSS 功能](https://cn.vuejs.org/api/sfc-css-features.html)
- [SFC 工具](https://github.com/vuejs/core/tree/main/packages/compiler-sfc)

### 编译器源码
- [@vue/compiler-sfc](https://github.com/vuejs/core/tree/main/packages/compiler-sfc)
- [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue)
- [vue-loader (Webpack)](https://github.com/vuejs/vue-loader)

### 深入文章
- [Vue 3 Compiler 原理](https://juejin.cn/post/7031654258783723534)
- [Scoped CSS 实现原理](https://vue-loader.vuejs.org/guide/scoped-css.html)
- [<script setup> RFC](https://github.com/vuejs/rfcs/blob/master/active-rfcs/0040-script-setup.html)

### 工具
- [Vue SFC Playground](https://sfc.vuejs.org/) - 在线编译查看
- [AST Explorer](https://astexplorer.net/) - 查看 AST
- [Vue DevTools](https://devtools.vuejs.org/) - 调试工具

## 总结

### 核心要点

1. **`lang="scss"`**：通过构建工具调用 Sass 编译器进行预处理
2. **`scoped`**：通过 PostCSS 插件添加唯一属性选择器实现样式隔离
3. **`lang="ts"`**：通过 TypeScript 编译器进行类型擦除和转换
4. **`setup`**：编译时转换系统，不仅仅是语法糖

### 底层原理

- **编译时处理**：所有属性都在构建时被编译器处理
- **工具链集成**：Vite/Webpack 插件系统串联各个编译器
- **代码生成**：生成优化的、浏览器可执行的代码
- **运行时无感**：编译后的代码直接执行，无需额外处理

### 为什么配置就能生效？

```
配置 → 构建工具识别 → 调用对应编译器 → 代码转换 → 注入页面
```

**关键是构建时的编译转换，而不是运行时的动态处理。**

通过理解这些底层原理，我们可以：
- 更好地使用 Vue SFC 特性
- 优化构建配置
- 排查编译问题
- 编写更高效的代码
