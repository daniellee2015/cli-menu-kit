/**
 * Test file for Phase 5 advanced features
 * Tests Wizard, i18n, Commands, and Unified API
 */

import { menu, input, wizard } from '../src/api.js';
import { setLanguage, t } from '../src/i18n/registry.js';
import { registerCommand, showCommandHelp } from '../src/features/commands.js';

async function testUnifiedAPI() {
  console.log('=== Testing Unified API ===\n');

  // Test menu.radio
  const radioResult = await menu.radio({
    title: 'Select Framework',
    options: ['React', 'Vue', 'Angular', 'Svelte']
  });
  console.log(`Selected: ${radioResult.value}\n`);

  // Test menu.booleanH
  const confirmResult = await menu.booleanH('Continue with setup?', true);
  console.log(`Confirmed: ${confirmResult}\n`);

  // Test input.text
  const textResult = await input.text({
    prompt: 'Enter project name',
    defaultValue: 'my-project'
  });
  console.log(`Project name: ${textResult}\n`);
}

async function testI18n() {
  console.log('=== Testing i18n System ===\n');

  // Test Chinese (default)
  console.log('Chinese translations:');
  console.log(`  Select prompt: ${t('menus.selectPrompt')}`);
  console.log(`  Success: ${t('messages.success')}`);
  console.log(`  Goodbye: ${t('messages.goodbye')}\n`);

  // Switch to English
  setLanguage('en');
  console.log('English translations:');
  console.log(`  Select prompt: ${t('menus.selectPrompt')}`);
  console.log(`  Success: ${t('messages.success')}`);
  console.log(`  Goodbye: ${t('messages.goodbye')}\n`);

  // Switch back to Chinese
  setLanguage('zh');
}

async function testCommands() {
  console.log('=== Testing Command System ===\n');

  // Register custom command
  registerCommand('test', () => {
    console.log('Custom test command executed!');
    return false;
  }, 'Test command');

  // Show help
  showCommandHelp();
}

async function testWizard() {
  console.log('=== Testing Wizard System ===\n');

  const result = await wizard.run({
    title: 'Project Setup Wizard',
    steps: [
      {
        name: 'language',
        title: '选择语言',
        component: 'language-selector',
        config: {
          languages: [
            { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
            { code: 'en', name: 'English' }
          ]
        },
        required: true
      },
      {
        name: 'projectName',
        title: '项目名称',
        component: 'text-input',
        config: {
          prompt: '请输入项目名称',
          minLength: 3
        },
        required: true
      },
      {
        name: 'features',
        title: '选择功能',
        component: 'checkbox-menu',
        config: {
          options: ['TypeScript', 'ESLint', 'Prettier', 'Testing']
        },
        required: false
      }
    ],
    onComplete: (results) => {
      console.log('\nWizard completed with results:');
      console.log(JSON.stringify(results, null, 2));
    }
  });

  console.log(`\nWizard completed: ${result.completed}`);
}

async function main() {
  try {
    // Test Unified API
    await testUnifiedAPI();

    // Test i18n
    await testI18n();

    // Test Commands
    await testCommands();

    // Test Wizard
    await testWizard();

    console.log('✓ All tests completed successfully!');
  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

main();
