# ReBORN-CHS-Mod

An unofficial modification of Chinese-localized TT / Georgia-ReBORN scripts for foobar2000, including JavaScript source code and associated resources. This project does not include the foobar2000 player.

**Current release: FIX65 (2026-10-21)**

## Features

- Turntable mode, CD animation, immersive display, and window-state recovery improvements.
- Scrolling Details lyrics, CD-arc lyrics, word-by-word highlighting, and vertical Chinese lyrics.
- Custom lyrics colors, gradient masks, interlude countdown, and 3D album CoverFlow.
- Waveform progress display, adaptive Details typography, album artwork, and metadata display.

## What's new in FIX65

- Bound the full-line arc-lyrics bitmap cache to 32 entries and 4 million aggregate pixels, excluding oversized bitmaps from long-term retention.
- Improved blurred artwork cache cleanup when immersive lyrics are changed or hidden.
- Improved clearing of all three ArtCache stores and their LRU indices, with safeguards for invalid bitmap entries and approximate cache diagnostics.
- **In album mode, complete CD disc-eject animation before loading waveform cache data or initiating waveform analysis**, reducing concurrent work during the animation.
- Yield one UI event-loop turn after disc eject; guard against obsolete track requests on rapid switching and use a bounded wait fallback.
- Preserve native AudioWizard handling, 500 ms waveform debounce, SACD ISO behavior, and UTF-8 BOM compatibility.

See [CHANGELOG.en.md](CHANGELOG.en.md) for release history.

## Repository contents

| Path | Description |
| --- | --- |
| `scripts/Base/` | Main UI, Details, lyrics, menus, and settings |
| `scripts/Biography/scripts/` | Biography scripts |
| `scripts/Library/` | Library scripts and resources |
| `docs/安装与使用.md` | Installation and usage instructions (Chinese) |
| `CHANGELOG.md` / `CHANGELOG.en.md` | Release history |
| `SHA256SUMS.txt` | SHA-256 file checksums |
| `THIRD_PARTY_NOTICES.md` | Third-party attribution and license notices |

## Installation

Use with an existing compatible foobar2000, JSplitter, and TT / Georgia-ReBORN environment. This repository is not a complete player or theme-base distribution.

Exit foobar2000, back up existing scripts and personal settings, and replace the matching files at their relative paths. Keep other upstream files already present in your installation.

## Attribution

Thanks to [TT / Georgia-ReBORN](https://github.com/TT-ReBORN/Georgia-ReBORN), the foobar2000 and component developers, Chinese localization contributors, and Gemini and ChatGPT for code and documentation assistance.

This is an unofficial personal modification. Please retain upstream attribution and applicable license notices; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
