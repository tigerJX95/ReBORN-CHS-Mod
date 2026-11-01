// FIX67: regression for selection index zero and invalid indices.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const src = fs.readFileSync(path.join(__dirname, '../scripts/Base/gr-menu-custom.js'), 'utf8');
const m = src.match(/this\.activeIndex = (Number\.isInteger\(activeIndex\)[^;]+);/);
assert.ok(m, 'Dropdown constructor must use a bounded integer index');
const calculate = new Function('activeIndex', 'labelArray', `return ${m[1]};`);
for (const [input, expected] of [[0,0],[1,1],[-1,-1],[undefined,-1],[null,-1],[2,-1],[0.5,-1],[NaN,-1]]) {
  assert.equal(calculate(input, ['one','two']), expected, `input=${input}`);
}
console.log('FIX67 dropdown index regression: PASS (8 cases)');
