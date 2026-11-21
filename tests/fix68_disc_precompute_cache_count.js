// FIX68 Preview 1: disc-frame precomputation should count the cache once per batch.
const fs = require('fs');
const source = fs.readFileSync('scripts/Base/gr-details.js', 'utf8');
const start = source.indexOf('const precomputeBatch = () => {');
const end = source.indexOf('this.discArtPrecomputeTimer = setTimeout(precomputeBatch', start);
if (start < 0 || end < 0) throw new Error('precomputeBatch block not found');
const block = source.slice(start, end);
const reduceCount = (block.match(/this\.discArtArray\.reduce\(/g) || []).length;
const filterCount = (block.match(/this\.discArtArray\.filter\(/g) || []).length;
if (reduceCount !== 1) throw new Error(`Expected one cache count per batch, found ${reduceCount}`);
if (filterCount !== 0) throw new Error('Repeated filter(Boolean) cache scan remains');
if (!/readyFrames\+\+/.test(block)) throw new Error('Cache count is not updated after successful frame creation');
console.log('FIX68 disc precompute cache-count regression: PASS');
