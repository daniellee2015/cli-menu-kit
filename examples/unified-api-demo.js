/**
 * Unified API Example
 * Demonstrates the new unified API for CLI Menu Kit
 */

import { menu, input, wizard } from '../src/api.js';

async function main() {
  console.log('=== CLI Menu Kit - Unified API Demo ===\n');

  // 1. Radio Menu (单选菜单)
  console.log('1. Radio Menu Example:');
  const framework = await menu.radio({
    title: '选择你喜欢的前端框架',
    options: [
      'React - 由 Facebook 开发',
      'Vue - 渐进式框架',
      'Angular - 完整的解决方案',
      'Svelte - 编译时框架'
    ]
  });
  console.log(`你选择了: ${framework.value}\n`);

  // 2. Checkbox Menu (多选菜单)
  console.log('2. Checkbox Menu Example:');
  const features = await menu.checkbox({
    options: [
      'TypeScript',
      'ESLint',
      'Prettier',
      'Jest',
      'Vitest'
    ],
    minSelections: 1
  });
  console.log(`你选择了 ${features.indices.length} 个功能:`);
  features.values.forEach(v => console.log(`  - ${v}`));
  console.log();

  // 3. Boolean Menu - Horizontal (是/否 - 横向)
  console.log('3. Boolean Menu (Horizontal) Example:');
  const useTypeScript = await menu.booleanH('是否使用 TypeScript?', true);
  console.log(`使用 TypeScript: ${useTypeScript ? '是' : '否'}\n`);

  // 4. Boolean Menu - Vertical (是/否 - 竖向)
  console.log('4. Boolean Menu (Vertical) Example:');
  const installDeps = await menu.booleanV('是否立即安装依赖?', false);
  console.log(`立即安装: ${installDeps ? '是' : '否'}\n`);

  // 5. Text Input (文本输入)
  console.log('5. Text Input Example:');
  const projectName = await input.text({
    prompt: '请输入项目名称',
    defaultValue: 'my-project',
    minLength: 3,
    maxLength: 30,
    validate: (value) => {
      if (!/^[a-z0-9-]+$/.test(value)) {
        return '项目名称只能包含小写字母、数字和连字符';
      }
      return true;
    }
  });
  console.log(`项目名称: ${projectName}\n`);

  // 6. Number Input (数字输入)
  console.log('6. Number Input Example:');
  const port = await input.number({
    prompt: '请输入端口号',
    min: 1024,
    max: 65535,
    defaultValue: 3000
  });
  console.log(`端口号: ${port}\n`);

  // 7. Language Selector (语言选择器)
  console.log('7. Language Selector Example:');
  const language = await input.language({
    languages: [
      { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
      { code: 'en', name: 'English' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' }
    ],
    defaultLanguage: 'zh'
  });
  console.log(`选择的语言: ${language}\n`);

  // 8. Modify Field (修改字段)
  console.log('8. Modify Field Example:');
  const result = await input.modifyField({
    fieldName: '作者名称',
    currentValue: 'John Doe'
  });
  console.log(`修改: ${result.modified ? '是' : '否'}`);
  console.log(`值: ${result.value}\n`);

  // 9. Wizard (向导流程)
  console.log('9. Wizard Example:');
  const wizardResult = await wizard.run({
    title: '项目初始化向导',
    showProgress: true,
    steps: [
      {
        name: 'projectType',
        title: '选择项目类型',
        component: 'radio-menu',
        config: {
          options: ['Web 应用', '命令行工具', '库/包']
        },
        required: true
      },
      {
        name: 'projectName',
        title: '输入项目名称',
        component: 'text-input',
        config: {
          prompt: '项目名称',
          minLength: 3
        },
        required: true
      },
      {
        name: 'features',
        title: '选择功能',
        component: 'checkbox-menu',
        config: {
          options: ['Git', 'README', 'License', '.gitignore']
        },
        required: false
      }
    ],
    onComplete: (results) => {
      console.log('\n向导完成！结果:');
      console.log(JSON.stringify(results, null, 2));
    }
  });

  console.log(`\n向导状态: ${wizardResult.completed ? '完成' : '取消'}`);

  console.log('\n=== Demo Complete! ===');
}

main().catch(console.error);
