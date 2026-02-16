/**
 * Test file for Phase 3 input components
 * Tests TextInput, NumberInput, LanguageSelector, and ModifyField
 */

import { showTextInput } from '../src/components/inputs/text-input.js';
import { showNumberInput } from '../src/components/inputs/number-input.js';
import { showLanguageSelector } from '../src/components/inputs/language-input.js';
import { showModifyField } from '../src/components/inputs/modify-field.js';

async function testTextInput() {
  console.log('=== Testing TextInput ===\n');

  const result = await showTextInput({
    prompt: '请输入您的名字',
    defaultValue: 'User',
    minLength: 2,
    maxLength: 20
  });

  console.log(`\nYou entered: ${result}\n`);
}

async function testNumberInput() {
  console.log('=== Testing NumberInput ===\n');

  const result = await showNumberInput({
    prompt: '请输入您的年龄',
    min: 1,
    max: 120,
    defaultValue: 25
  });

  console.log(`\nYou entered: ${result}\n`);
}

async function testLanguageSelector() {
  console.log('=== Testing LanguageSelector ===\n');

  const result = await showLanguageSelector({
    languages: [
      { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
      { code: 'en', name: 'English' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' }
    ],
    defaultLanguage: 'zh'
  });

  console.log(`\nYou selected: ${result}\n`);
}

async function testModifyField() {
  console.log('=== Testing ModifyField ===\n');

  const result = await showModifyField({
    fieldName: '用户名',
    currentValue: 'john_doe',
    validate: (value) => {
      if (value.length < 3) {
        return '用户名至少需要3个字符';
      }
      return true;
    }
  });

  console.log(`\nModified: ${result.modified}`);
  console.log(`Value: ${result.value}\n`);
}

async function main() {
  try {
    // Test TextInput
    await testTextInput();

    // Test NumberInput
    await testNumberInput();

    // Test LanguageSelector
    await testLanguageSelector();

    // Test ModifyField
    await testModifyField();

    console.log('✓ All tests completed successfully!');
  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

main();
