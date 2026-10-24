const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const text = fs.readFileSync('scripts/Base/gr-main-components.js', 'utf8');
const start = text.indexOf('\tasync waitForAlbumDiscEject(epoch) {');
const end = text.indexOf('\n\tasync drainWaveformTracks()', start);
assert(start >= 0 && end > start, 'wait method missing');
const method = text.slice(start, end);
const make = (transition) => {
  const state = { transition };
  const grSet = { seekbar: 'waveformbar', discArtAnimation: true };
  const grm = { ui: { displayDetails: true }, details: {
    isTurntableActive: () => false,
    isDiscArtTransitionActive: () => state.transition
  }};
  const cls = vm.runInNewContext(`(class Test { ${method} })`, { grSet, grm, Date, setTimeout, Promise });
  const wave = new cls(); wave.active = true; wave.waveformEpoch = 1; wave.waveformClosed = false;
  return { wave, state };
};
(async () => {
  const direct = make(false);
  assert.strictEqual(await direct.wave.waitForAlbumDiscEject(1), true);
  const finished = make(true);
  setTimeout(() => { finished.state.transition = false; }, 55);
  assert.strictEqual(await finished.wave.waitForAlbumDiscEject(1), true);
  const stale = make(true);
  setTimeout(() => { stale.wave.waveformEpoch = 2; }, 55);
  assert.strictEqual(await stale.wave.waitForAlbumDiscEject(1), false);
  const timeout = make(true);
  const startTime = Date.now();
  assert.strictEqual(await timeout.wave.waitForAlbumDiscEject(1), true);
  const elapsed = Date.now() - startTime;
  assert(elapsed >= 3450 && elapsed < 4500, `timeout took ${elapsed}ms`);
  console.log(`FIX66.1 FIX65 animation rollback: PASS (4 scenarios, timeout=${elapsed}ms)`);
})().catch(e => { console.error(e); process.exitCode = 1; });
