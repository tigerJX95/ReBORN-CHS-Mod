// FIX68 Preview 6: real pause and angle methods, no unconditional X-position overwrite.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../scripts/Base/gr-details.js'), 'utf8');
const callbacks = fs.readFileSync(path.join(__dirname, '../scripts/Base/gr-callbacks.js'), 'utf8');
const extract = name => {
  const start = source.indexOf(`\n\t${name}(`);
  assert(start >= 0, `${name} missing`);
  const body = source.indexOf('{', start);
  let level = 1;
  let i = body + 1;
  // These selected method bodies do not contain braces within strings or comments.
  for (; i < source.length && level > 0; ++i) {
    if (source[i] === '{') level++;
    else if (source[i] === '}') level--;
  }
  assert.equal(level, 0, `${name} unterminated`);
  return source.slice(start + 2, i);
};
const pausePosition = extract('setDiscArtPauseVisibilityHold');
const stopHold = extract('clearDiscArtPauseVisibilityHold');
const captureAngle = extract('pauseDiscArtRotation');
assert(!/discArtSize\.x\s*=/.test(pausePosition), 'Pause/resume must never mutate disc X directly');
assert(!/discArtPausePositionX/.test(source), 'Remove abandoned Preview 4 position latch');
assert(callbacks.includes('grm.details.setDiscArtPauseVisibilityHold(state);'), 'Pause callback still wired');
assert(callbacks.includes('grm.details.clearDiscArtPauseVisibilityHold();'), 'Stop callback still wired');
let now = 1800;
const fb = { IsPlaying: true, IsPaused: false };
const grSet = { spinDiscArt: true, spinDiscArtImageCount: 360, spinDiscArtRedrawInterval: 50 };
const grAnimationManager = { now: () => now };
const sandbox = { fb, grSet, grAnimationManager };
vm.createContext(sandbox);
const Test = vm.runInContext(`(class Test { ${pausePosition}\n${stopHold}\n${captureAngle}\n })`,sandbox);
const disc = new Test();
disc.discArtPauseVisibilityHold = false;
disc.discArtSize = { x: 400 };
disc.discArtRotationAngle = 20;
disc.discArtRotationEpoch = 1700;
disc.discArtRotationInterval = 50;
disc.discArtEjectAngleHeld = false;
disc.setDiscArtPauseVisibilityHold(true);
fb.IsPaused = true; fb.IsPlaying = false;
disc.pauseDiscArtRotation();
assert.equal(disc.discArtRotationAngle,22,'Paused angle must capture elapsed 2 degrees');
assert.equal(disc.discArtRotationEpoch,0,'Paused clock must be frozen');
assert.equal(disc.discArtSize.x,400,'Pause must not reposition disc');
disc.setDiscArtPauseVisibilityHold(false); // resume callback before flags catch up
assert.equal(disc.discArtPauseVisibilityHold,true,'Visibility hold persists during callback transition');
fb.IsPlaying = true; fb.IsPaused = false;
disc.setDiscArtPauseVisibilityHold(false);
assert.equal(disc.discArtPauseVisibilityHold,false,'Visibility hold clears on confirmed resume');
assert.equal(disc.discArtSize.x,400,'Resume must not reposition disc');
assert.equal(disc.discArtRotationAngle,22,'Resume must not reset angle');
disc.setDiscArtPauseVisibilityHold(true);
disc.clearDiscArtPauseVisibilityHold();
assert.equal(disc.discArtPauseVisibilityHold,false,'Explicit stop clears hold');
console.log('FIX68 pause/angle/position convergence: PASS');
