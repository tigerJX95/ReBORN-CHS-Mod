const fs = require('fs');
const assert = require('assert');
const s = fs.readFileSync('scripts/Library/scripts/lib-images.js', 'utf8');
assert(s.includes('isFlowRequestCurrent(request)'));
assert(s.includes('currentContext !== request.context || !this.isFlowRequestCurrent(request)'));
assert(s.includes('!this.isFlowRequestCurrent(request) && this.cache[key]?.img'));
assert(s.includes('retained.get(key) === image'));
console.log('flow async safety invariants: PASS');
