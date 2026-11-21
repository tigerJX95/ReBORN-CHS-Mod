// FIX68 Preview 2/6: paused playback must keep the disc exposed, with optional transient callback hold.
const fs = require('fs');
const source = fs.readFileSync('scripts/Base/gr-details.js', 'utf8');
const start = source.indexOf('syncDiscArtSlideAnimation() {');
const end = source.indexOf('\n\t}', start);
if (start < 0 || end < 0) throw new Error('Slide sync method not found');
const block = source.slice(start, end);
const match = block.match(/const shouldShow\s*=\s*(.*?);/);
if (!match) throw new Error('Disc visibility condition not found');
const expression = match[1];
if (!/fb\.IsPlaying\s*\|\|\s*fb\.IsPaused/.test(expression)) {
  throw new Error(`Pause state is not included: ${expression}`);
}
if (!/positions\.ratio\s*>\s*0/.test(expression)) throw new Error('Responsive visibility guard removed');
const visible = (playing, paused, ratio) => (playing || paused) && ratio > 0;
if (!visible(true, false, 0.5)) throw new Error('Playing should remain visible');
if (!visible(true, true, 0.5)) throw new Error('Paused should remain visible');
if (visible(false, false, 0.5)) throw new Error('Stopped should retract');
if (visible(true, true, 0)) throw new Error('Zero ratio should remain hidden');
console.log('FIX68 pause/disc visibility regression: PASS');
