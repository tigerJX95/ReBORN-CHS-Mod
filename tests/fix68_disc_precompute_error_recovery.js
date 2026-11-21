// FIX68 Preview 7: execute the real frame precomputation callback with failures.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const code = fs.readFileSync('scripts/Base/gr-details.js', 'utf8');
const marker = '\tsetDiscArtPrecomputation(combinedImg, currentAlbumId, rotationDegreeIncrement) {';
const start = code.indexOf(marker);
assert(start >= 0, 'method missing');
const end = code.indexOf('\n\t}\n\n\t/**', start);
assert(end >= 0, 'method end missing');
const method = code.slice(start, end + '\n\t}'.length);
let tasks, logs, calls, fail;
const ctx = {
  grSet: { spinDiscArtImageCount: 72 },
  grAnimationManager: { resizing: false },
  fb: { IsPlaying: true, IsPaused: false },
  window: { IsVisible: true },
  grm: { ui: { displayDetails: true }, artCache: { discArtImgMaxRes: 1024 },
         debug: { debugLog() {} } },
  RotateImage() { calls++; if (fail) throw Error('synthetic native bitmap error'); return {Width: 100, Height: 100}; },
  setTimeout(fn) { tasks.push(fn); return tasks.length; },
  console: { log(v) { logs.push(String(v)); } },
  Date
};
vm.createContext(ctx);
const methodFn = vm.runInContext(`({${method}}).setDiscArtPrecomputation`, ctx);
function setup(throwOnRotate) {
  tasks=[]; logs=[]; calls=0; fail=throwOnRotate;
  const owner={discArtLoadToken:1, discArtSize:{w:100,h:100}, discArtRotationIndex:0,
    discArtArray:Array(72).fill(null), discArt:{Path:'album1'}, discArtPrecomputeTimer:null,
    usesTurntableRenderer(){return false;}, clearTimer(){this.discArtPrecomputeTimer=null;} };
  methodFn.call(owner, {Width:100,Height:100}, 'album1', 5);
  assert.equal(tasks.length, 1, 'initial batch not scheduled');
  tasks.shift()();
  return owner;
}
let owner=setup(true);
assert.equal(calls,1,'failed rotation must be attempted once');
assert.equal(tasks.length,0,'failed rotation must not schedule another batch');
assert.equal(owner.discArtPrecomputeTimer,null,'failed job timer must be cleared');
assert.equal(owner.discArtArray.filter(Boolean).length,0,'failure must not cache an invalid image');
assert.equal(logs.length,1,'failure should be reported once');
owner=setup(false);
assert.equal(calls,1,'normal rotation must proceed');
assert.equal(owner.discArtArray.filter(Boolean).length,1,'valid rotation must be cached');
assert.equal(tasks.length,1,'normal rotation should schedule next batch');
console.log('FIX68 disc precompute exception/normal regression: PASS');
