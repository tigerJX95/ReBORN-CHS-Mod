// FIX68 Preview 5: pause captures the wall-clock angle even after fb.IsPaused flips.
const fs = require('fs');
const source = fs.readFileSync('scripts/Base/gr-details.js', 'utf8');
const start = source.indexOf('pauseDiscArtRotation() {');
const end = source.indexOf('\n\t}', start);
if (start < 0 || end < 0) throw new Error('pauseDiscArtRotation not found');
const block = source.slice(start, end);
if (!/this\.discArtRotationEpoch\s*&&\s*grSet\.spinDiscArt/.test(block)) throw new Error('Pause does not capture active epoch');
if (!/grAnimationManager\.now\(\)\s*-\s*this\.discArtRotationEpoch/.test(block)) throw new Error('Pause does not include elapsed time');
if (!/this\.discArtRotationAngle\s*=\s*\(this\.discArtRotationAngle\s*\+\s*elapsed\s*\*\s*step\s*\/\s*interval\)\s*%\s*360/.test(block)) throw new Error('Pause angle accumulation missing');
if (!/this\.discArtRotationEpoch\s*=\s*0/.test(block)) throw new Error('Rotation epoch not frozen');
console.log('FIX68 pause angle capture regression: PASS');
