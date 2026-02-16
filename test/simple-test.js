#!/usr/bin/env node

/**
 * Simple test for CLI Menu Kit
 */

const { selectMenu, showSuccess, colors, theme } = require('../dist');

async function test() {
  console.clear();
  console.log(`\n${theme.active}=== CLI Menu Kit 测试 ===${colors.reset}\n`);

  const options = [
    '1. 选项一 - 这是第一个选项',
    '2. 选项二 - 这是第二个选项',
    '3. 选项三 - 这是第三个选项',
    '4. 退出 - 退出测试'
  ];

  console.log('  请选择一个选项（用↑↓或数字1-4）:\n');

  const selected = await selectMenu(options, { lang: 'zh', type: 'main' });

  console.log();
  showSuccess(`你选择了: ${options[selected]}`);
  console.log();

  if (selected === 3) {
    console.log(`${theme.muted}  测试结束${colors.reset}\n`);
  } else {
    console.log(`${theme.muted}  按 Ctrl+C 退出${colors.reset}\n`);
  }
}

test().catch(console.error);
