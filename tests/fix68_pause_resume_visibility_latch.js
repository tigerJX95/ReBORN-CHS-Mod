// FIX68 Preview 3: pause visibility survives transient resume callback ordering.
const fs = require('fs');
const details = fs.readFileSync('scripts/Base/gr-details.js', 'utf8');
const callbacks = fs.readFileSync('scripts/Base/gr-callbacks.js', 'utf8');
if (!details.includes('setDiscArtPauseVisibilityHold(paused)')) throw new Error('Pause hold setter missing');
if (!details.includes('clearDiscArtPauseVisibilityHold()')) throw new Error('Stop hold clear missing');
if (!/fb\.IsPlaying\s*\|\|\s*fb\.IsPaused\s*\|\|\s*this\.discArtPauseVisibilityHold/.test(details)) {
  throw new Error('Slide visibility does not include pause hold');
}
if (!/grm\.details\.setDiscArtPauseVisibilityHold\(state\)/.test(callbacks)) throw new Error('Pause callback not wired');
if (!/grm\.details\.clearDiscArtPauseVisibilityHold\(\)/.test(callbacks)) throw new Error('Stop callback not wired');
let hold = false;
const pause = state => { if (state) hold = true; else if (playing && !paused) hold = false; };
const stop = () => { hold = false; };
let playing = true, paused = false;
pause(true); paused = true; playing = false;
if (!hold) throw new Error('Pause should hold visibility');
pause(false); // callback arrives before player flags are updated
if (!hold) throw new Error('Resume callback transient state cleared hold too early');
playing = true; paused = false;
if (hold && playing && !paused) hold = false;
if (hold) throw new Error('Hold should clear once playback resumes');
pause(true); paused = true; playing = false;
stop();
if (hold) throw new Error('Explicit stop must clear hold');
console.log('FIX68 pause/resume visibility latch regression: PASS');
