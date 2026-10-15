# Changelog

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
