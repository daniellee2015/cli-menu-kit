#!/usr/bin/env node

/**
 * Simple test for CLI Menu Kit
 */

const { selectMenu, showSuccess, colors, theme } = require('../dist');

async function test() {
  console.clear();

  const options = [
    '1. 选项一 - 这是第一个选项',
    '2. 选项二 - 这是第二个选项',
    '3. 选项三 - 这是第三个选项',
    '4. 退出 - 退出测试'
  ];

  const selected = await selectMenu(options, {
    lang: 'zh',
    type: 'main',
    title: '=== CLI Menu Kit 测试 ===',
    prompt: '请选择一个选项',
    showHints: true
  });

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
