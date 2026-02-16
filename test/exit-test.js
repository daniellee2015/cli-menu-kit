#!/usr/bin/env node

/**
 * Test exit handling and goodbye message
 * Press Ctrl+C to test the goodbye message
 */

const { selectMenu } = require('../dist/index.js');

async function testExit() {
  console.log('=== Testing Exit Handling ===');
  console.log('You can exit in two ways:');
  console.log('1. Select "Exit" option');
  console.log('2. Press Ctrl+C\n');

  const options = [
    '1. Option 1 - First option',
    '2. Option 2 - Second option',
    '3. Option 3 - Third option',
    '4. Exit - Exit the program'
  ];

  try {
    const choice = await selectMenu(options, {
      title: 'Test Menu',
      lang: 'zh'
    });

    if (choice === 3) {
      // User selected Exit option
      console.log('\n👋 感谢使用，再见！\n');
      process.exit(0);
    } else {
      console.log(`You selected: ${choice}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testExit();
