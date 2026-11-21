# Changelog

## FIX68 — 2026-11-21

- Count cached GDI+ disc rotation frames once per precomputation batch, incrementing the local count after successful frame generation.
- Correct pause/resume rotation discontinuity: settle the elapsed angle and freeze it on pause; continue from that angle on resume.
- Correct disc visibility synchronization across pause and stop states, retaining the transient-state guard.
- Remove the unused pause-position snapshot and X-coordinate rewrite.
- Catch errors during asynchronous GDI+ rotation-frame generation, stop the failed job, and retain valid cached frames.
- Retain 600 ms progressive eject, face-forward 0° eject, rotation after slide completion, original CD center and white dot, silver platter, and 3D CoverFlow.

## FIX67 — 2026-11-07

- Reduce progressive disc eject time from 700 ms to 600 ms; decouple slide redraw cadence from disc rotation redraw settings.
- Eject CD art at 0° and begin rotation only after the slide completes; defer GDI+ rotation precomputation during eject.
- Clear angle-hold state when eject is interrupted by track changes, page changes, or disabling animation.
- Prefer actual CD artwork and avoid substituting ordinary album covers; retain the native center and small white highlight.
- Decouple CD-art loading from the Details disc-display setting; improve initial load and asynchronous error cleanup.
- Fix custom dropdown item-zero selection and expanded-menu closing behavior.
- Improve 3D CoverFlow idle-return timing, 15/30-second options, keyboard/wheel boundaries, stale asynchronous artwork handling, and cache access.

## FIX66 — 2026-10-24

- Use full-size turntable artwork to remove black edge gaps.
- Remove fixed cropping of RCA label artwork.
- Protect custom-theme input fields against missing values.
- Restore the FIX65 CD-eject waiting approach to reduce interference from waveform loading.
- Retain SACD ISO, AudioWizard, and waveform compatibility handling.

## FIX65 — 2026-10-21

- Bound full-line arc-lyrics bitmap cache to 32 entries and four million pixels.
- Improve cleanup of immersive blurred backgrounds, lyrics tasks, and three ArtCache pools.
- Schedule waveform loading or analysis after CD eject, with stale-request protection.
- Retain 500 ms waveform debounce and SACD ISO / AudioWizard compatibility.

## FIX64 — 2026-10-18

- Improve redraw scheduling after long Windows lock-screen intervals in turntable and immersive modes.

## FIX63 — 2026-10-18

- Guard stale callbacks for waveform initialization, artwork cycling, and lyric tasks.
- Improve state cleanup for disc-frame preparation, translated lyrics, and window visibility.
- Retain UTF-8 BOM compatibility.

## FIX62 — 2026-10-15

- Reduce waveform request debounce from 1000 ms to 500 ms.
- Filter internal playlist placeholder records from Details.
- Improve adaptive Details typography, including 26/28/30/32 px options.

## FIX51 — 2026-10-11

- Improve multiline original/translated CD-arc lyrics layout and Korean glyph-height measurement.

## FIX50 — 2026-10-11

- Refine interlude prompt placement and opacity over lyrics.

## FIX49 — 2026-10-11

- Correct custom-theme lyrics colors and Biography word-highlight edge blending.
