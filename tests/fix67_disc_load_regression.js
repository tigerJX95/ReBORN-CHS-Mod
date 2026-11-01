// FIX67 static invariants; run: node tests/fix67_disc_load_regression.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.join(__dirname, '../scripts/Base/gr-details.js'), 'utf8');
assert(code.includes('(grSet.displayDiscArt || this.needsTurntableDisc()) && !grm.ui.isStreaming'));
assert(code.includes('loadToken !== this.discArtLoadToken'), 'Reject obsolete image loads');
const loadMethod = code.slice(code.indexOf('\n\tloadDiscArt(discArtPath) {'), code.indexOf('\n\tloadDiscArtEmbedded('));
assert(loadMethod.includes("this.discArtImageKey = '';"), 'Clear identity on load failure');
assert(loadMethod.includes('this.notifyDiscArtTrackEntryReady();'), 'Release deferred entry on failed load');
assert(code.includes('const dot = Math.max(1.2, 2.0 * u);'), 'Preserve tiny white center highlight');
assert(code.includes("this.turntableArtwork === 'disc'"), 'Preserve disc source selection');
console.log('FIX67 disc-load regression invariants passed');
