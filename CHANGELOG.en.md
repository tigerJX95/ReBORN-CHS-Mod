# Changelog

## FIX65 — 2026-10-21

- Bound the full-line arc-lyrics bitmap cache to 32 entries and 4 million total pixels, without retaining oversized bitmaps.
- Improved blurred artwork cache and pending-task cleanup when immersive lyrics are switched or hidden.
- Added approximate bitmap cache diagnostics and complete clearing of three ArtCache stores and their LRU indices, with invalid-bitmap safeguards.
- **Defer waveform cache loading or analysis until album-mode CD disc-eject animation finishes**, reducing animation stutter caused by competing work.
- Yield one UI event-loop turn after disc eject, recheck track generations and transition state, and retain a 3.5-second bounded-wait fallback.
- Preserve native AudioWizard operations, 500 ms waveform debounce, SACD ISO handling, and UTF-8 BOM compatibility.

## FIX64 — 2026-10-18

- Fixed frozen album artwork and delayed UI responsiveness after prolonged Windows lock/unlock in immersive turntable mode.
- Improved repaint scheduling after focus recovery or an extended callback gap without altering playback handling.

## FIX63 — 2026-10-18

- Added stale-callback guards for deferred waveform activation, artwork cycling, and asynchronous lyric work.
- Protected against obsolete artwork failure notices and stale disc-image precomputation.
- Improved turntable state diagnostics and translation-lyric animation behavior across window hide/restore.
- Preserved UTF-8 BOM compatibility.

## FIX62 — 2026-10-15

- Reduced waveform request debounce from 1000 ms to 500 ms while retaining native AudioWizard behavior.
- Hid internal playlist configuration placeholders in Details without suppressing real playlist metadata.
- Improved adaptive Details typography and added 26, 28, 30, and 32 px font-size options for titles and metadata.

## FIX51 — 2026-10-11

- Improved CD-arc lyrics placement for multiline originals and translations, avoiding overlap with the disc.
- Improved Korean glyph height measurement while preserving existing layers and caches.

## FIX50 — 2026-10-11

- Improved interlude hint positioning and reduced overlay opacity when lyrics occupy the available space.

## FIX49 — 2026-10-11

- Corrected custom-theme lyric color lookup and biography word-highlight edge blending.
- Preserved independent lyric color settings for the main and biography views.
