# TT Modified Scripts — ReBORN-CHS-Mod

A personal modification project based on the Chinese-localized foobar2000 TT / Georgia-ReBORN scripts, preserving tested enhancements, fixes, and development history.

**Current stable release: FIX64 (2026-10-18).** Final user-performed Windows regression passed; all 31 runtime JavaScript files are byte-for-byte identical to the accepted FIX64 RC1.

## Purpose

This repository provides JavaScript scripts and related resources, **not a standalone foobar2000 installation**. A compatible foobar2000, JSplitter and TT / Georgia-ReBORN environment is required.

## Key features

- Turntable and CD animation, immersive display, and related state-recovery fixes.
- Scrolling lyrics, CD-arc lyrics, karaoke word highlighting, vertical Chinese layouts, and configurable masks.
- Custom theme/lyrics colors, interlude countdown, and 3D album CoverFlow.
- **FIX62:** waveform request delay reduced from 1000ms to 500ms, with the stable FIX51 native waveform handling retained.
- **FIX62:** Details font sizing up to 32px; automatic non-scrolling height fitting; hide internal playlist placeholder text without removing legitimate playlist information.

## FIX64 (stable release)

- Frozen from the user-accepted FIX64 RC1, with no changes to the 31 runtime JavaScript files.
- Fixed the frozen album artwork and unresponsive UI after prolonged Windows lock/unlock in immersive turntable mode, which previously required Win+D and restoring from the taskbar.
- Retains FIX63 stability improvements and UTF-8 BOM compatibility.

## FIX63 stability improvements

- Guards against stale deferred callbacks for waveform activation, album-art cycling, and lyrics loading.
- Protects delayed artwork failure notices and obsolete disc-image precomputation.
- Adds rate-limited turntable recovery diagnostics and pauses translation animation while the UI is hidden.
- Preserves the compatible UTF-8 BOM markings and the previously tested FIX62 Details controls and AudioWizard behavior.

## Repository layout

- `scripts/Base/` — main UI, Details, lyrics, menus and settings
- `scripts/Biography/scripts/` — related biography script changes
- `scripts/Library/` — library script and resources
- `CHANGELOG.md` / `CHANGELOG.en.md` — version history
- `THIRD_PARTY_NOTICES.md` — third-party attribution and licenses
- `SHA256SUMS` — file integrity checksums

## Installation

Exit foobar2000 and back up your scripts and settings. Copy the matching scripts to your existing profile, retaining any other upstream files. Do not replace the entire player configuration blindly.

## Development and version policy

FIX62 is based on FIX51, **not** the previously abandoned FIX52–FIX62 experimental branch that exhibited intermittent UI freezes on SACD ISO track changes. Those historical commits can remain in Git history. Only the current scripts and formal documentation belong in this source package.

FIX64 passed user-performed Windows regression testing, including SACD ISO track switching, window restoration, lyrics, album-art handling, and Chinese UI display. Static JavaScript syntax checks are not a substitute for testing every system.

## Attribution

Thanks to the TT / Georgia-ReBORN contributors, foobar2000 and its component developers, the Chinese localization contributors, Gemini and ChatGPT for assistance in development and documentation. This is an unofficial personal fork; retain upstream attribution and applicable third-party notices.
