import { renderPageV2, createSimpleHeaderComponent, createHintsComponent, generateMenuHints } from './dist/index.js';

const hints = generateMenuHints({
  hasMultipleOptions: true,
  allowNumberKeys: true,
  allowLetterKeys: true
});

console.log('Generated hints:', hints);

await renderPageV2({
  header: {
    components: [
      createSimpleHeaderComponent('Test Header')
    ]
  },
  footer: {
    components: [
      createHintsComponent(hints)
    ]
  }
});

console.log('Done!');
