# 统一 API 使用指南

## 快速开始

### 导入

```javascript
import { menu, input, wizard } from 'cli-menu-kit';
```

或者使用 CommonJS:

```javascript
const { menu, input, wizard } = require('cli-menu-kit');
```

## Menu API (菜单)

### 1. menu.radio() - 单选菜单

```javascript
const result = await menu.radio({
  title: '选择框架',           // 可选：标题
  options: [                   // 必需：选项数组
    'React',
    'Vue',
    'Angular'
  ],
  defaultIndex: 0,             // 可选：默认选中索引
  allowNumberKeys: true,       // 可选：允许数字键快速选择
  allowLetterKeys: false       // 可选：允许字母键快速选择
});

// 返回: { index: number, value: string }
console.log(result.index);     // 0, 1, 2...
console.log(result.value);     // 'React', 'Vue', 'Angular'
```

### 2. menu.checkbox() - 多选菜单

```javascript
const result = await menu.checkbox({
  options: [                   // 必需：选项数组
    'TypeScript',
    'ESLint',
    'Prettier'
  ],
  defaultSelected: [0, 1],     // 可选：默认选中的索引
  minSelections: 1,            // 可选：最少选择数量
  maxSelections: 3,            // 可选：最多选择数量
  allowSelectAll: true,        // 可选：允许全选 (A键)
  allowInvert: true            // 可选：允许反选 (I键)
});

// 返回: { indices: number[], values: string[] }
console.log(result.indices);   // [0, 2]
console.log(result.values);    // ['TypeScript', 'Prettier']
```

### 3. menu.booleanH() - 横向是/否

```javascript
const result = await menu.booleanH(
  '是否继续?',                 // 必需：问题
  true                         // 可选：默认值
);

// 返回: boolean
console.log(result);           // true 或 false
```

### 4. menu.booleanV() - 竖向是/否

```javascript
const result = await menu.booleanV(
  '是否保存?',                 // 必需：问题
  false                        // 可选：默认值
);

// 返回: boolean
console.log(result);           // true 或 false
```

## Input API (输入)

### 1. input.text() - 文本输入

```javascript
const result = await input.text({
  prompt: '请输入名称',        // 必需：提示文本
  defaultValue: 'default',     // 可选：默认值
  placeholder: '输入...',      // 可选：占位符
  minLength: 2,                // 可选：最小长度
  maxLength: 20,               // 可选：最大长度
  allowEmpty: false,           // 可选：允许空值
  validate: (value) => {       // 可选：验证函数
    if (value.length < 3) {
      return '至少3个字符';
    }
    return true;
  }
});

// 返回: string
console.log(result);           // 用户输入的文本
```

### 2. input.number() - 数字输入

```javascript
const result = await input.number({
  prompt: '请输入年龄',        // 必需：提示文本
  min: 1,                      // 可选：最小值
  max: 120,                    // 可选：最大值
  defaultValue: 25,            // 可选：默认值
  allowDecimals: false,        // 可选：允许小数
  allowNegative: false         // 可选：允许负数
});

// 返回: number
console.log(result);           // 用户输入的数字
```

### 3. input.language() - 语言选择

```javascript
const result = await input.language({
  languages: [                 // 必需：语言列表
    {
      code: 'zh',
      name: 'Chinese',
      nativeName: '简体中文'
    },
    {
      code: 'en',
      name: 'English'
    }
  ],
  defaultLanguage: 'zh'        // 可选：默认语言代码
});

// 返回: string (语言代码)
console.log(result);           // 'zh' 或 'en'
```

### 4. input.modifyField() - 修改字段

```javascript
const result = await input.modifyField({
  fieldName: '用户名',         // 必需：字段名称
  currentValue: 'john',        // 必需：当前值
  validate: (value) => {       // 可选：验证函数
    return value.length >= 3 || '至少3个字符';
  }
});

// 返回: { modified: boolean, value: string }
console.log(result.modified);  // true 或 false
console.log(result.value);     // 新值或原值
```

## Wizard API (向导)

### wizard.run() - 运行向导

```javascript
const result = await wizard.run({
  title: '项目设置向导',       // 可选：向导标题
  showProgress: true,          // 可选：显示进度
  steps: [                     // 必需：步骤数组
    {
      name: 'language',        // 必需：步骤名称（用于结果）
      title: '选择语言',       // 必需：步骤标题
      component: 'language-selector',  // 必需：组件类型
      config: {                // 必需：组件配置
        languages: [/* ... */]
      },
      required: true,          // 可选：是否必需
      validate: (value) => {   // 可选：验证函数
        return true;
      },
      skip: (results) => {     // 可选：跳过条件
        return false;
      }
    },
    {
      name: 'projectName',
      title: '项目名称',
      component: 'text-input',
      config: {
        prompt: '输入项目名称'
      }
    }
  ],
  onComplete: (results) => {   // 可选：完成回调
    console.log('完成!', results);
  },
  onCancel: () => {            // 可选：取消回调
    console.log('已取消');
  }
});

// 返回: { completed: boolean, results: Record<string, any> }
console.log(result.completed); // true 或 false
console.log(result.results);   // { language: 'zh', projectName: 'my-app' }
```

## 组件类型

向导支持的组件类型：

- `'radio-menu'` - 单选菜单
- `'checkbox-menu'` - 多选菜单
- `'boolean-menu'` - 是/否选择
- `'text-input'` - 文本输入
- `'number-input'` - 数字输入
- `'language-selector'` - 语言选择

## 键盘快捷键

### 所有菜单通用
- `Ctrl+C` - 退出程序
- `Enter` - 确认选择

### 单选/多选菜单
- `↑/↓` - 上下移动
- `1-9` - 数字快速选择

### 多选菜单特有
- `Space` - 切换选中状态
- `A` - 全选
- `I` - 反选

### 是/否菜单
- `←/→` - 左右移动（横向）
- `↑/↓` - 上下移动（竖向）
- `Y/N` - 快速选择

### 文本/数字输入
- `Backspace` - 删除字符
- 可打印字符 - 输入

## 完整示例

查看 `examples/` 目录：

- `quick-start.js` - 快速开始示例
- `unified-api-demo.js` - 完整 API 演示

运行示例：

```bash
node examples/quick-start.js
node examples/unified-api-demo.js
```

## 高级功能

### i18n (国际化)

```javascript
import { setLanguage, t } from 'cli-menu-kit';

// 设置语言
setLanguage('en');  // 或 'zh'

// 获取翻译
const text = t('menus.selectPrompt');
```

### 命令处理

```javascript
import { registerCommand, handleCommand } from 'cli-menu-kit';

// 注册自定义命令
registerCommand('test', () => {
  console.log('测试命令');
  return false;  // false = 继续, true = 退出
}, '测试命令');

// 处理命令
handleCommand('/test');
```

内置命令：
- `/quit` - 退出
- `/help` - 帮助
- `/clear` - 清屏
- `/back` - 返回

## TypeScript 支持

完整的类型定义：

```typescript
import type {
  RadioMenuConfig,
  CheckboxMenuConfig,
  BooleanMenuConfig,
  TextInputConfig,
  NumberInputConfig,
  WizardConfig
} from 'cli-menu-kit';
```
