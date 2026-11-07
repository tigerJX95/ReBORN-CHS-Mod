/** FIX67 RC: actual gr-details.js timer-cancel implementation exercised in VM. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../scripts/Base/gr-details.js'), 'utf8');
const begin = source.indexOf('\n\tclearTimer(type) {');
assert.ok(begin >= 0, 'clearTimer found');
const end = source.indexOf('\n\t// #endregion', begin);
assert.ok(end > begin, 'clearTimer method bounded');
const snippet = source.slice(begin, end).replace(/^\n\tclearTimer\(type\) \{/, 'function clearTimer(type) {');
const script = snippet.slice(0, snippet.lastIndexOf('\n\t}')) + '\n}';
const logs=[];
const sandbox={grAnimationManager:{now:()=>1234,remove:id=>logs.push(id)},
  fb:{IsPlaying:true,IsPaused:false},grSet:{spinDiscArt:true},
  grm:{debug:{debugLog:()=>{}}},clearTimeout:()=>{}};
vm.createContext(sandbox);
vm.runInContext(script + '\nthis.runClear=clearTimer;',sandbox);
function setup(held,playing=true,paused=false){
 sandbox.fb.IsPlaying=playing; sandbox.fb.IsPaused=paused;
 const obj={discArtSlideTimer:77,discArtEjectAngleHeld:held,discArtRotationAngle:84,
  discArtRotationEpoch:45, discArtRotationTimer:null,discArtFadeTimer:null,
  discArtCommitTimer:null,discArtTrackEntryTimer:null,discArtDeferredStartTimer:null,
  discArtPrecomputeTimer:null};
 sandbox.runClear.call(obj,'discArtSlide');return obj;
}
let obj=setup(true);
assert.equal(obj.discArtSlideTimer,null);
assert.equal(obj.discArtEjectAngleHeld,false);
assert.equal(obj.discArtRotationAngle,0);
assert.equal(obj.discArtRotationEpoch,1234);
obj=setup(true,true,true);
assert.equal(obj.discArtRotationEpoch,0);
obj=setup(false);
assert.equal(obj.discArtRotationAngle,84, 'ordinary slide completion does not reset rotation');
assert.equal(obj.discArtRotationEpoch,45);
assert.ok(logs.includes(77));
// Timing contract: precomputed frames cannot compete with outward slide.
assert.match(source,/if \(this\.discArtEjectAngleHeld \|\| grAnimationManager\.resizing/);
assert.match(source,/const holdAngle = distance > 0 && this\.discArtSlideVisible/);
assert.match(source,/this\.discArtProgressiveEntryDuration = 600/);
console.log('FIX67 eject cancel + timing guards: PASS (3 cancellation cases)');
