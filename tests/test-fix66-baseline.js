// FIX66 baseline invariants; runs without foobar2000 using Node.js.
'use strict';
const fs = require('fs');
const assert = require('assert');
const crypto = require('crypto');
const vm = require('vm');
const path = require('path');
const base = path.resolve(__dirname, '..');
const menuPath = path.join(base, 'scripts/Base', 'gr-menu-custom.js');
const menuBuffer = fs.readFileSync(menuPath);
assert(menuBuffer.subarray(0, 3).equals(Buffer.from([0xef,0xbb,0xbf])), 'custom script must keep UTF-8 BOM');
const menu = menuBuffer.toString('utf8').replace(/^\uFEFF/, '');
new vm.Script(menu, { filename: 'gr-menu-custom.js' });
const wave = fs.readFileSync(path.join(base, 'scripts/Base/gr-main-components.js'), 'utf8');
const start = wave.indexOf('\tasync waitForAlbumDiscEject(epoch) {');
const end = wave.indexOf('\n\tasync drainWaveformTracks()', start);
assert(start >= 0 && end > start, 'CD eject gate missing');
const hash = crypto.createHash('sha256').update(wave.slice(start, end).replace(/\r\n/g,'\n')).digest('hex');
const expected = fs.readFileSync(path.join(__dirname, 'fix65-eject-method.sha256'), 'utf8').trim();
assert.strictEqual(hash, expected, 'FIX65 CD eject implementation changed unexpectedly');
// Isolate the actual input-field class with a minimal stub, without replacing its constructor.
const classStart = menu.indexOf('class CustomMenuInputField extends CustomMenu {');
const classEnd = menu.indexOf('class CustomMenuInputField2 extends CustomMenu {');
assert(classStart >= 0 && classEnd > classStart);
const section = menu.slice(classStart, classEnd);
const clsSource = section.slice(0, section.lastIndexOf('///////////////////////////////////'));
const ctx = { CustomMenu: class { constructor(x,y,label){this.x=x;this.y=y;this.label=label;this.font={};this.g={CalcTextHeight:()=>12};} calcTextHeight(){return 12;} }, grm:{ui:{displayMetadataGridMenu:false}}, grSet:{popupFontSize_layout:0}, SCALE:x=>x, console };
const Input = vm.runInNewContext(clsSource + '\nCustomMenuInputField', ctx);
for (const [input, expectedValue] of [[undefined,''],[null,''],[42,'42'],['ABCDEF','ABCDEF']]) {
 const obj = new Input('color','Color',input,0,0,50,90);
 assert.strictEqual(obj.value, expectedValue);
 assert.strictEqual(obj.valueOnFocus, expectedValue);
 assert.strictEqual(typeof obj.value.slice, 'function');
}
assert(menu.includes("this.value2 = value2 == null ? '' : String(value2);"), 'second input-field null handling missing');
assert(menu.includes('this.value2.slice(this.offsetChars)'), 'second input rendering changed unexpectedly');
console.log('FIX66 baseline checks passed: BOM, syntax, FIX65 eject hash, input normalization.');

// FIX66 validated turntable and RCA changes.
const details = fs.readFileSync(path.join(base, 'scripts/Base/gr-details.js'), 'utf8');
assert(details.includes('g.DrawImage(source, 0, 0, size, size,'), 'turntable artwork must fill full disc');
assert(details.includes("if (label === 'rca') return { x: 0, y: 0, w: logo.Width, h: logo.Height };"), 'RCA must use full image bounds');
