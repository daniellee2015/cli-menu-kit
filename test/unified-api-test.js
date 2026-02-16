#!/usr/bin/env node

/**
 * Test the unified menu API
 */

const { menu, selectWithChildren } = require('../dist/index.js');

async function testUnifiedAPI() {
  console.log('=== Testing Unified Menu API ===\n');

  // Test 1: Simple single select using menu.select
  console.log('Test 1: Single Select Menu');
  const choice1 = await menu.select(
    ['选项一 - 第一个选项', '选项二 - 第二个选项', '选项三 - 第三个选项'],
    { title: '请选择一个选项', lang: 'zh' }
  );
  console.log(`You selected: ${choice1}\n`);

  // Test 2: Multi-select using menu.multiSelect
  console.log('Test 2: Multi-Select Menu');
  const choices2 = await menu.multiSelect(
    ['功能A', '功能B', '功能C', '功能D'],
    { lang: 'zh' }
  );
  console.log(`You selected: ${choices2.join(', ')}\n`);

  // Test 3: Yes/No confirmation using menu.confirm
  console.log('Test 3: Yes/No Confirmation');
  const confirmed = await menu.confirm('是否继续？', { lang: 'zh' });
  console.log(`Confirmed: ${confirmed}\n`);

  // Test 4: Text input using menu.input
  console.log('Test 4: Text Input');
  const name = await menu.input('请输入您的名字', {
    lang: 'zh',
    defaultValue: 'User'
  });
  console.log(`Name: ${name}\n`);

  // Test 5: Number input using menu.number
  console.log('Test 5: Number Input');
  const age = await menu.number('请输入您的年龄', {
    lang: 'zh',
    min: 1,
    max: 120
  });
  console.log(`Age: ${age}\n`);

  // Test 6: Parent-child menu
  console.log('Test 6: Parent-Child Menu');
  const result = await selectWithChildren(
    ['分类A - 第一个分类', '分类B - 第二个分类', '分类C - 第三个分类'],
    (parentIndex) => {
      // Return different child options based on parent selection
      if (parentIndex === 0) {
        return ['A1 - 子选项1', 'A2 - 子选项2', 'A3 - 子选项3'];
      } else if (parentIndex === 1) {
        return ['B1 - 子选项1', 'B2 - 子选项2'];
      } else {
        return ['C1 - 子选项1', 'C2 - 子选项2', 'C3 - 子选项3', 'C4 - 子选项4'];
      }
    },
    {
      parentConfig: { title: '选择分类', lang: 'zh' },
      childConfig: { lang: 'zh' }
    }
  );
  console.log(`Parent: ${result.parentIndex}, Children: ${result.childIndices.join(', ')}\n`);

  console.log('=== All tests completed! ===');
  process.exit(0);
}

testUnifiedAPI().catch(console.error);
