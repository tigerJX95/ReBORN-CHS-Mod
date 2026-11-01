const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const pop = fs.readFileSync(path.join(root, 'scripts/Library/scripts/lib-populate.js'), 'utf8');
const bar = fs.readFileSync(path.join(root, 'scripts/Library/scripts/lib-scrollbar.js'), 'utf8');
if (!pop.includes('libImg.isFlowActive() && !this.tree.length')) throw Error('Empty flow tree guard missing');
if (!bar.includes('!Number.isFinite(step) || !step')) throw Error('Invalid wheel delta guard missing');
if (!bar.includes('this.flowWheelQueue = 0')) throw Error('Existing wheel flow handling missing');
console.log('FIX67 flow navigation source guards OK');
