# CLI Menu Kit - 使用指南

## 📦 包已创建完成

位置：`/Users/danlio/Repositories/cli-menu-kit`

## 🚀 如何使用

### 1. 在 Product Builder 中使用

```bash
cd /Users/danlio/Repositories/product-builder
npm install /Users/danlio/Repositories/cli-menu-kit
```

### 2. 在其他项目中使用

```bash
# 本地安装
npm install /Users/danlio/Repositories/cli-menu-kit

# 或发布到 npm 后
npm install cli-menu-kit
```

### 3. 发布到 npm

```bash
cd /Users/danlio/Repositories/cli-menu-kit

# 登录 npm (如果还没登录)
npm login

# 发布
npm publish
```

## 📝 代码示例

### 基础菜单

```typescript
import { selectMenu } from 'cli-menu-kit';

const options = [
  '1. 初始化配置 - 设置 Product Builder',
  '2. 检查状态 - 查看系统依赖',
  '3. 重置配置 - 清除并重新配置'
];

const selected = await selectMenu(options, {
  lang: 'zh',
  type: 'main'
});
```

### 带字母快捷键的菜单

```typescript
const options = [
  { label: 'L. 登录 - 登录账号' },
  { label: 'R. 注册 - 创建新账号' },
  { label: 'Q. 退出 - 退出应用' }
];

const selected = await selectMenu(options, { type: 'main' });
```

### 多选菜单

```typescript
import { selectMultiMenu } from 'cli-menu-kit';

const options = ['TypeScript', 'JavaScript', 'Python'];
const selected = await selectMultiMenu(options, {
  lang: 'zh',
  defaultSelected: [0]
});
```

## 🎨 主题和颜色

```typescript
import { colors, theme, showSuccess, showError } from 'cli-menu-kit';

// 使用预定义颜色
console.log(`${colors.cyan}青色文字${colors.reset}`);
console.log(`${theme.active}高亮文字${colors.reset}`);

// 使用消息函数
showSuccess('操作成功！');
showError('操作失败！');
```

## 📋 完整功能列表

- ✅ 单选菜单 (`selectMenu`)
- ✅ 多选菜单 (`selectMultiMenu`)
- ✅ 箭头键导航
- ✅ 数字快捷键 (1-9)
- ✅ 字母快捷键 (A-Z)
- ✅ 实时高亮
- ✅ 中英文支持
- ✅ 自定义主题
- ✅ ASCII 艺术字头部
- ✅ 消息提示函数
- ✅ TypeScript 类型定义

## 🔄 下一步

1. 在 Product Builder 中替换 inquirer.js
2. 测试所有菜单功能
3. 根据需要调整样式和行为
4. 发布到 npm 供其他项目使用

## 📚 参考

- README: `/Users/danlio/Repositories/cli-menu-kit/README.md`
- 示例: `/Users/danlio/Repositories/cli-menu-kit/example/demo.ts`
- 源码: `/Users/danlio/Repositories/cli-menu-kit/src/`
