## FIX67 — 2026-11-07 (stable release)

Consolidated FIX67 release: includes the previously accepted CD artwork, menu, CoverFlow and asynchronous loading improvements, plus the final disc-eject animation refinements. No separate point release.

- **Disc eject:** Progressive motion now takes 600 ms (previously 700 ms); update cadence decoupled from disc rotation redraw.
- **Correct initial orientation:** Keep CD art at 0° while sliding out; begin rotation after eject completes.
- **GDI+ performance:** Defer rotation frame precomputation until eject completes.
- **Interrupted eject:** Clear angle-hold state on view changes, track switches and animation interruption.
- **CD art:** Preserve native disc image and center area, tiny white spindle highlight and original silver platter.
- **CoverFlow and menus:** Retain timer, keyboard/mouse navigation, async image cache, dropdown and disc load reliability improvements.

**Validation:** Automated syntax and regression tests pass. The disc eject Preview 3 was user-tested; the final RC interruption cleanup still requires a targeted player check before release. See [release checks](docs/FIX67_出碟优化与发布回归.md).

## FIX67 — 2026-10-31 (earlier integration record)

Integrated from the user-tested `FIX67_flow_async_cache_candidate` baseline; excludes abandoned lower-bar lyrics and the Preview 3–10 turntable visual experiments.

- **Custom dropdowns:** Correct handling of selected index `0` and closing an expanded menu by clicking its header.
- **Turntable CD art:** Prefer actual CD artwork; do not substitute an album cover when disc art is missing. Preserve the disc image's original center, tiny white spindle point, silver platter, rotation and eject behavior.
- **CD loading:** Decouple turntable disc-art loading from the regular Details disc-art display setting; fix re-entry initialization and pending-state cleanup after failed asynchronous loads.
- **3D CoverFlow:** Correct idle return-to-playing timer rearming, add 15 s / 30 s options, and guard empty search results, invalid wheel deltas and navigation boundaries.
- **Asynchronous CoverFlow cache:** Reject stale requests after library tree changes and reduce repeated cache-budget work.
- **Compatibility:** Retain validated FIX66 RCA logo, disc fill, custom-theme and CD eject fixes.
- **Distribution:** Update bilingual documentation, third-party notices and SHA-256 checksums.

**Validation:** Navigation and async-cache candidates were user-tested; the packaged release should still receive a complete cross-feature regression check.

### FIX67 candidate: 3D cover flow async image safety and cache
- Validate album identity before committing async image results after filtering or library rebuilds.
- Do not mark stale requests as failed; clear their pending cache markers.
- Avoid repeated LRU image budget scans for the same cached frame.
- No changes to 3D layout, turntable visuals, or menu interaction.

## FIX67 · 3D Flow stability candidate
- Make the idle return fire only once per interaction-free interval; a new interaction starts a fresh timer.
- Add 15- and 30-second auto-return options; retain existing choices and the five-second default.
- Preserve 3D geometry, cover interaction, and all previously accepted CD visuals.
- Syntax and state checks passed; in-player verification is pending.

## FIX67 · Functional compatibility candidate (based on Preview 2)
- Fix turntable disc-art initialization when regular details disc-art display is disabled.
- Release pending track-entry/label state and invalidate disc-art identity after an async image-load failure.
- Preserve the verified original CD center, tiny white spindle highlight, metallic platter and Preview 2 menu behavior.


### FIX67 Preview 2 (CD source center + white dot)
- Restores only the tiny white spindle-tip highlight while preserving the original CD artwork center.
- Does not restore the gray ring, black hub or other synthetic center overlays.
### FIX67 Preview 2 (pending in-player verification)
- Closing an expanded custom dropdown via its header preserves the previous selection and avoids dispatching an invalid index.

## FIX67 Preview 1 — Custom dropdown selection stability

- Fix index 0 incorrectly becoming the unselected state in `CustomMenuDropDown`.
- Accept only in-range integer indices; invalid values remain unselected.
- Add eight regression cases; retain the FIX66 turntable, RCA, custom-theme input and CD eject behavior.
- Exclude the abandoned idle lower-bar lyric previews.
- Status: preview candidate, pending player-level validation.

## FIX66 · Licensing and documentation update (no runtime changes)

- Add root `LICENSE` (MIT) for licensable original contributions of this project.
- Align both READMEs, third-party notices and file lists; pre-existing third-party content is not relicensed.
- Leave all runtime files in `scripts/` unchanged.

# Changelog

## FIX66 — 2026-10-24 (integrated validated fixes)

- Expand turntable artwork coverage from 95% to 100%, eliminating dark edge gaps (validated isolation-test variant B).
- Remove the fixed crop for the RCA label logo; preserve the full image bounds.
- Include the validated custom-theme input null guard to prevent red-screen crashes.
- Restore FIX65 CD eject scheduling; withdraw the older continuous-loop change.
- Preserve FIX65 image cache, 500 ms waveform debounce, AudioWizard and SACD ISO behavior.
- Keep the custom-theme script separately deployable at its actual loading path.

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

### FIX67 Preview 2 · CD art loading compatibility
- Turntable CD art remains loadable when ordinary disc-art display is disabled.
- Preserves approved original CD center, white spindle highlight and silver platter.
