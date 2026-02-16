/**
 * Example usage of CLI Menu Kit
 */

import { selectMenu, selectMultiMenu, printHeader, showSuccess } from '../src';

async function main() {
  // Print header
  printHeader({
    asciiArt: [
      '███╗   ███╗███████╗███╗   ██╗██╗   ██╗',
      '████╗ ████║██╔════╝████╗  ██║██║   ██║',
      '██╔████╔██║█████╗  ██╔██╗ ██║██║   ██║',
      '██║╚██╔╝██║██╔══╝  ██║╚██╗██║██║   ██║',
      '██║ ╚═╝ ██║███████╗██║ ╚████║╚██████╔╝',
      '╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝ '
    ],
    title: 'CLI Menu Kit Example',
    subtitle: 'Demo Application',
    version: '0.1.0'
  });

  // Single select menu
  const options = [
    '1. Initialize - Set up your project',
    '2. Build - Compile your code',
    '3. Deploy - Push to production',
    '4. Test - Run tests'
  ];

  console.log('  Select an option:\n');
  const selected = await selectMenu(options, { lang: 'en', type: 'main' });

  showSuccess(`You selected: ${options[selected]}`);
  console.log();

  // Multi-select menu
  const languages = [
    'TypeScript',
    'JavaScript',
    'Python',
    'Go',
    'Rust'
  ];

  console.log('  Select languages (Space to toggle, A for all, I to invert):\n');
  const selectedLangs = await selectMultiMenu(languages, { lang: 'en' });

  showSuccess(`Selected languages: ${selectedLangs.map(i => languages[i]).join(', ')}`);
  console.log();
}

main().catch(console.error);
