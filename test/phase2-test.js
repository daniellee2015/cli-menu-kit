/**
 * Test file for Phase 2 menu components
 * Tests RadioMenu, CheckboxMenu, and BooleanMenu
 */

import { showRadioMenu } from '../src/components/menus/radio-menu.js';
import { showCheckboxMenu } from '../src/components/menus/checkbox-menu.js';
import { showBooleanMenu } from '../src/components/menus/boolean-menu.js';

async function testRadioMenu() {
  console.log('=== Testing RadioMenu ===\n');

  const result = await showRadioMenu({
    title: 'Select Your Favorite Color',
    options: [
      '红色 - Red',
      '蓝色 - Blue',
      '绿色 - Green',
      '黄色 - Yellow'
    ],
    defaultIndex: 0
  });

  console.log(`\nYou selected: ${result.value} (index: ${result.index})\n`);
}

async function testCheckboxMenu() {
  console.log('=== Testing CheckboxMenu ===\n');

  const result = await showCheckboxMenu({
    options: [
      'JavaScript',
      'TypeScript',
      'Python',
      'Go',
      'Rust'
    ],
    minSelections: 1
  });

  console.log(`\nYou selected ${result.indices.length} items:`);
  result.values.forEach((value, i) => {
    console.log(`  ${i + 1}. ${value}`);
  });
  console.log();
}

async function testBooleanMenuHorizontal() {
  console.log('=== Testing BooleanMenu (Horizontal) ===\n');

  const result = await showBooleanMenu({
    question: '是否继续?',
    orientation: 'horizontal',
    defaultValue: true
  });

  console.log(`\nYou selected: ${result ? 'Yes' : 'No'}\n`);
}

async function testBooleanMenuVertical() {
  console.log('=== Testing BooleanMenu (Vertical) ===\n');

  const result = await showBooleanMenu({
    question: '是否保存更改?',
    orientation: 'vertical',
    defaultValue: false
  });

  console.log(`\nYou selected: ${result ? 'Yes' : 'No'}\n`);
}

async function main() {
  try {
    // Test RadioMenu
    await testRadioMenu();

    // Test CheckboxMenu
    await testCheckboxMenu();

    // Test BooleanMenu Horizontal
    await testBooleanMenuHorizontal();

    // Test BooleanMenu Vertical
    await testBooleanMenuVertical();

    console.log('✓ All tests completed successfully!');
  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

main();
