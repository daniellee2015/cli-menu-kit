/**
 * Test file for Phase 4 display components
 * Tests Headers, Progress, Messages, and Summary
 */

import {
  createSimpleHeader,
  createAsciiHeader,
  createProgressIndicator,
  createStageHeader,
  createStageSeparator,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showQuestion,
  createSummaryTable
} from '../src/components/display/index.js';

function testHeaders() {
  console.log('=== Testing Headers ===\n');

  // Simple header
  createSimpleHeader('Simple Header Example', '\x1b[36m');
  console.log();

  // ASCII header
  const asciiArt = `
  ███╗   ███╗███████╗███╗   ██╗██╗   ██╗
  ████╗ ████║██╔════╝████╗  ██║██║   ██║
  ██╔████╔██║█████╗  ██╔██╗ ██║██║   ██║
  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║██║   ██║
  ██║ ╚═╝ ██║███████╗██║ ╚████║╚██████╔╝
  ╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝

  CLI Menu Kit
  `.trim();

  createAsciiHeader(asciiArt, {
    subtitle: 'A comprehensive CLI menu system',
    version: '1.0.0',
    url: 'https://github.com/user/cli-menu-kit'
  });
  console.log();
}

function testProgress() {
  console.log('=== Testing Progress Indicators ===\n');

  // Progress indicator
  createProgressIndicator(
    ['选择语言', '配置路径', '完成设置'],
    1
  );
  console.log();

  // Stage header
  createStageHeader('配置路径', 2);
  console.log();

  // Stage separator
  createStageSeparator();
  console.log();
}

function testMessages() {
  console.log('=== Testing Messages ===\n');

  showSuccess('操作成功完成!');
  showError('发生错误: 文件未找到');
  showWarning('警告: 磁盘空间不足');
  showInfo('提示: 按 Ctrl+C 退出');
  showQuestion('是否继续?');
  console.log();
}

function testSummary() {
  console.log('=== Testing Summary Table ===\n');

  createSummaryTable(
    'Session Summary',
    [
      {
        header: 'Statistics',
        items: [
          { key: 'Session ID', value: '10062c88-c2e5-4bf0-a5f7-e8703937514f' },
          { key: 'Tool Calls', value: '10 ( ✓ 8 ✗ 2 )' },
          { key: 'Success Rate', value: '80%' }
        ]
      },
      {
        header: 'Performance',
        items: [
          { key: 'Wall Time', value: '2h 9m' },
          { key: 'Agent Active', value: '45m (35%)' }
        ]
      }
    ]
  );
  console.log();
}

function main() {
  try {
    // Test Headers
    testHeaders();

    // Test Progress
    testProgress();

    // Test Messages
    testMessages();

    // Test Summary
    testSummary();

    console.log('✓ All tests completed successfully!');
  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

main();
