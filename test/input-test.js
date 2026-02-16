#!/usr/bin/env node

/**
 * Test input functions
 */

const { askInput, askYesNo, askNumber, showSuccess, colors, theme } = require('../dist');

async function test() {
  console.clear();
  console.log(`\n${theme.active}=== 输入功能测试 ===${colors.reset}\n`);

  // Test text input
  const name = await askInput('请输入你的名字', {
    lang: 'zh',
    defaultValue: 'User'
  });
  console.log();
  showSuccess(`你好，${name}！`);
  console.log();

  // Test number input
  const age = await askNumber('请输入你的年龄', {
    lang: 'zh',
    min: 1,
    max: 150
  });
  console.log();
  showSuccess(`年龄：${age}`);
  console.log();

  // Test yes/no
  const confirm = await askYesNo('确认提交吗？', {
    lang: 'zh',
    defaultYes: true
  });
  console.log();

  if (confirm) {
    showSuccess('已确认！');
  } else {
    console.log(`${theme.muted}  已取消${colors.reset}`);
  }
  console.log();
}

test().catch(console.error);
