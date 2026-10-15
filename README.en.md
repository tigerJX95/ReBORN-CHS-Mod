# TT Modified Scripts — ReBORN-CHS-Mod

A personal modification project based on the Chinese-localized foobar2000 TT / Georgia-ReBORN scripts, preserving tested enhancements, fixes, and development history.

**Current stable development baseline: FIX62**, rebuilt from the proven FIX51 scripts. Only the full-featured edition is maintained.

## Purpose

This repository provides JavaScript scripts and related resources, **not a standalone foobar2000 installation**. A compatible foobar2000, JSplitter and TT / Georgia-ReBORN environment is required.

## Key features

- Turntable and CD animation, immersive display, and related state-recovery fixes.
- Scrolling lyrics, CD-arc lyrics, karaoke word highlighting, vertical Chinese layouts, and configurable masks.
- Custom theme/lyrics colors, interlude countdown, and 3D album CoverFlow.
- **FIX62:** waveform request delay reduced from 1000ms to 500ms, with the stable FIX51 native waveform handling retained.
- **FIX62:** Details font sizing up to 32px; automatic non-scrolling height fitting; hide internal playlist placeholder text without removing legitimate playlist information.

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

FIX62 passed user-performed Windows playback regression testing, including SACD ISO track switching. Static JavaScript syntax checks are not a substitute for testing every system.

## Attribution

Thanks to the TT / Georgia-ReBORN contributors, foobar2000 and its component developers, the Chinese localization contributors, Gemini and ChatGPT for assistance in development and documentation. This is an unofficial personal fork; retain upstream attribution and applicable third-party notices.
