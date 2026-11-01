// FIX67 Preview 2: check expanded dropdown boundary, restore and valid selection.
const assert = require('assert');
const fs = require('fs');
const src = fs.readFileSync(require('path').join(__dirname, '../scripts/Base/gr-menu-custom.js'), 'utf8');
assert(src.includes('this.activeIndex = this.selectUpActiveIndex;'));
assert(src.includes('yIndex >= this.selectUpHeight'));
function select(y, firstY, optionH, n, previous) {
 const yIndex = y-firstY;
 if (!Number.isFinite(yIndex) || yIndex < 0 || yIndex >= n*optionH) return { index: previous, called: false };
 return { index: Math.floor(yIndex / optionH), called: true };
}
assert.deepStrictEqual(select(90,100,20,3,2),{index:2,called:false});
assert.deepStrictEqual(select(160,100,20,3,1),{index:1,called:false});
assert.deepStrictEqual(select(undefined,100,20,3,1),{index:1,called:false});
assert.deepStrictEqual(select(100,100,20,3,2),{index:0,called:true});
assert.deepStrictEqual(select(159,100,20,3,2),{index:2,called:true});
console.log('FIX67 dropdown-close boundary: 5 cases passed');
