/**
 * Quick Start Example
 * 最简单的使用示例
 */

import { menu, input } from '../src/api.js';

async function main() {
  console.log('欢迎使用 CLI Menu Kit!\n');

  // 简单的单选菜单
  const choice = await menu.radio({
    title: '主菜单',
    options: ['开始新项目', '打开现有项目', '设置', '退出']
  });

  console.log(`\n你选择了: ${choice.value}`);

  // 简单的确认
  const confirmed = await menu.booleanH('确认继续?', true);

  if (confirmed) {
    // 简单的文本输入
    const name = await input.text({
      prompt: '请输入你的名字',
      defaultValue: 'User'
    });

    console.log(`\n你好, ${name}!`);
  }

  console.log('\n完成!');
}

main().catch(console.error);
