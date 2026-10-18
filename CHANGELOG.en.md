# Changelog

## FIX64 — 2026-10-18 (stable release)

- Frozen from the FIX64 RC1 that passed final user-performed Windows regression; all 31 runtime JS files are byte-for-byte unchanged.
- Fixed the frozen album artwork and unresponsive UI after prolonged Windows lock/unlock in immersive turntable mode, which previously required Win+D and restoring the window from the taskbar.
- Restores repaint scheduling after focus resumes or a long callback interruption; does not modify CD rotation, AudioWizard, or SACD ISO playback handling.
- Retains the accepted FIX63 improvements and UTF-8 BOM compatibility; refreshes bilingual release documentation and SHA-256 checksums.

## FIX63 — 2026-10-18 (stable release)

- Frozen from the FIX63 RC1 release candidate that passed final Windows regression; **all 31 runtime JavaScript files remain byte-for-byte identical** to RC1 and pre8.
- Adds guards for stale waveform activation, album-art cycling, lyrics timeout callbacks, and delayed artwork failure notices.
- Protects obsolete disc-image precomputation; provides rate-limited turntable recovery diagnostics; pauses translation blending while hidden and limits the resume time step.
- Retains UTF-8 BOM compatibility and previously accepted FIX62 Details font behavior and AudioWizard handling.
- Excludes unaccepted multi-field SACD font experiments, alternative waveform styling, and About/legal menus.
- Refreshed bilingual documentation and integrity checks; user-performed Windows regression passed for SACD ISO switching, animations, lyrics, and localized UI.

## FIX63 pre8 — 2026-10-18 (test build)

- Based on the Windows-tested FIX63 pre7 UTF-8 BOM baseline.
- Pause translation-line reveal blending when the window is hidden or has zero size; cap elapsed time on restoration to avoid abrupt visual jumps.
- Only `scripts/Base/gr-lyrics.js` changed. Track playback, waveform AudioWizard, and disc rotation are unchanged.
- UTF-8 BOM retained. Static checks passed; Windows testing passed.

## FIX63 pre2 — 2026-10-16 (test build)

- Based on the Windows-tested FIX63 pre1 baseline.
- Added state guards for delayed album-art cycling so stale callbacks cannot advance a newer album or continue after cycling is disabled.
- Only `scripts/Base/gr-main.js` changed in this iteration. AudioWizard, SACD ISO track-switching, and lyrics rendering were not modified.
- Static checks passed; subsequently covered by Windows regression.


## FIX62 — 2026-10-15 (Stable release)

- Rebuilt from the Windows-tested FIX51 stable baseline; only **three runtime JavaScript files** differ from FIX51.
- `gr-main-components.js`: reduced waveform request debounce from 1000ms to 500ms. Kept FIX51 AudioWizard native start/stop operations and serialized processing unchanged.
- `gr-details.js`: exclude the internal playlist configuration placeholder from visible Details metadata while retaining real playlist information; fit Details text to available height without scrolling.
- `gr-menu.js`: offer 26, 28, 30 and 32px Details font sizes for artist, track/album titles and metadata keys/values.
- Did not merge the abandoned FIX52–FIX62 experimental branch, which showed intermittent UI freezes while switching SACD ISO tracks.
- Passed user-performed Windows regression tests for SACD ISO switching, waveform display, Details layouts, and existing animations and lyrics features.

## FIX51 — 2026-10-11

- Fixed multi-line text and translation placement relative to CD-arc lyrics.
- Improved line-height measurement including Korean glyphs, without introducing additional timers.
- Relative to FIX50, changed `scripts/Base/gr-lyrics.js`.

## FIX50 — 2026-10-11

- Repositioned the interlude hint to use space below lyrics, and reduced its opacity where overlaid.
- Preserved existing lyric layout and scrolling positions.

## FIX49 — 2026-10-11

- Corrected custom theme lyrics colors and biography highlight blending artifacts.
- Preserved distinct main-view and biography lyric color settings.

## 2026-10-14 — Repository documentation

- Organized the FIX51 repository with project documentation and third-party notices.


## FIX63 pre7 (test)
- Added rate-limited turntable recovery diagnostics for prolonged overload suspension; no change to animation scheduling.
