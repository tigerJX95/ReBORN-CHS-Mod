## FIX60 — Hide stale lyrics immediately on track change (test)
- Invalidate/hide previous-track lyrics as soon as the track changes.
- Keep new-track lyric parsing after the disc animation and discard ESLyric notifications during the pending transition.
- Online search stutters may still originate inside ESLyric and require runtime tracing.

## FIX59 — Reduced ESLyric callback workload (test build)
- Queue online lyric notifications rather than parsing, laying out and saving synchronously inside the native callback.
- Coalesce multiple callbacks within 40ms; wait for the FIX58 disc-first stage to finish.
- Cancel pending work when the lyric load resets; register one persistent ESLyric listener.
- ESLyric's own network thread is unchanged. Windows runtime validation required.

## FIX58 — Disc-first lyric scheduling (test build)
- Defer costly scrolling-lyrics initialization until current disc entry finishes; last request wins on rapid skips.
- Preserve existing animation parameters; Windows playback verification pending.

## FIX56 · Coalesced lyrics initialization during rapid track changes (test build)

- Only the latest pending lyrics initialization runs when tracks are skipped in quick succession.
- Cancels pending work on playback stop; lyric animation timing remains unchanged.
- Requires Windows testing before the performance improvement can be confirmed.

## FIX54 · Lightweight flag spacing metrics

- Cache the spacing lookup table and repeated computations for the same font size and flag count.
- Retain FIX53 boundary handling and legacy 10–24 spacing values.
- Disc animation logic is unchanged; smoothness requires an in-player A/B test.

# Changelog

[简体中文](CHANGELOG.md) | **English**

## FIX53 — 2026-10-14

- Fixed a red-screen exception when enlarging Details fonts beyond the 10–24 px country-flag spacing table.
- Preserved the original integer-size spacing within the table, scaled fallback spacing outside its range, and guarded invalid font sizes.
- Only `scripts/Base/gr-main.js` changed from FIX52.
- Windows runtime validation of font scaling and flag layout is still needed.

## FIX52 — 2026-10-14

- Read available waveform caches at the track-change event, removing the fixed one-second wait before cache loading. Native analysis is debounced by 150 ms.
- Added a bounded raw-waveform memory cache to reduce repeated decompression and analysis of recent tracks.
- Cancel this bar's previous analysis request on track changes, playback stop, and unload; previous results cannot update the new track's display.
- Added a timeout for native analysis callbacks. Wait while the analyzer is busy rather than immediately treating it as a failure; retain one failure retry.
- Handle damaged cache formats independently, remove invalid waveform caches, and try another format or rebuild the waveform.
- Extended artist, title, album, tag-name, and tag-value font settings to 48 px, including Ctrl+wheel adjustments.
- Recalculate text fitting when font settings or displayed content change. Measure the actual Details region rather than first shrinking text to artwork height. Preserve fitting and region boundaries when space is limited.
- Changed files:
- `scripts/Base/gr-main-components.js`
- `scripts/Base/gr-details.js`
- `scripts/Base/gr-menu.js`
- `scripts/Base/gr-callbacks.js`
- `scripts/Base/gr-config-defaults.js`

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
