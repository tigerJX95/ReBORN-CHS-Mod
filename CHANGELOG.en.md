# Changelog

[简体中文](CHANGELOG.md) | **English**

## FIX51 — 2026-10-11

- Fixed CD overlap caused by multiple original and translated rows sharing the same horizontal arc coordinate.
- Horizontal-style rows follow the arc individually according to their height. Tilted-style rows remain parallel within a sentence, with clearance based on text and shadow bounds.
- Added Korean glyphs to font-height measurement for Korean originals with Chinese translations.
- Preserved sentence layers and caching without adding timers.
- Changed from FIX50: `scripts/Base/gr-lyrics.js`.
- 2026-10-14: FIX51 became the development baseline.

## FIX50 — 2026-10-11

- Moved the interlude prompt into empty space below the lyrics where available.
- When lyrics fill the area, retained the overlay position with 55% prompt opacity and a 180 ms opacity transition.
- Preserved lyric layout and scroll coordinates without adding timers.
- Changed from FIX49: `scripts/Base/gr-lyrics.js`.

## FIX49 — 2026-10-11

- Read custom-theme normal, highlighted, and shadow lyric colors from the corresponding theme settings.
- Kept main-interface and Biography lyric-color settings independent.
- Fixed the moving dark line caused by the Biography karaoke feathered edge exposing the background.
- Added the missing Biography gradient-rendering interfaces and bounded the local glyph cache.
- Changed files: `scripts/Base/gr-lyrics.js` and `scripts/Biography/scripts/bio-lyrics.js`.
- FIX51 retains these fixes.

## 2026-10-14 — Repository documentation

- Organized the TT modified FIX51 source and documentation.
- Added the README, installation guide, development notes, GitHub workflow, file list, and third-party notices.
- Kept current source and required resources without the complete player setup, personal configuration, previous source copies, or release artifacts.
- Added Chinese and English documentation with language links on the README and corresponding document pages.
