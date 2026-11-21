**Current release: FIX68 (2026-11-21)**

FIX68 improves disc rotation-frame precomputation, pause/resume angle continuity, and GDI+ asynchronous failure handling while retaining FIX67 visual and eject behavior. See the [FIX68 changelog](CHANGELOG.en.md).

[简体中文](./README.md) | **English**

# ReBORN-CHS-Mod

An unofficial modification of Chinese-localized TT / Georgia-ReBORN scripts for foobar2000, including JavaScript source code and associated resources. This project does not include the foobar2000 player.

## Features

- Turntable mode, CD animation, immersive display, and window-state recovery improvements.
- Scrolling Details lyrics, CD-arc lyrics, word-by-word highlighting, and vertical Chinese lyrics.
- Custom lyrics colors, gradient masks, interlude countdown, and 3D album CoverFlow.
- Waveform progress display, adaptive Details typography, album artwork, and metadata display.

## What's new in FIX68

- Reduce repeated scans of cached frames during GDI+ disc-rotation precomputation.
- Freeze the actual disc rotation angle on pause and resume from the same angle without snapping back.
- Remove the ineffective pause-position rewrite and retain a narrow visibility transition guard.
- Safely terminate failed asynchronous precomputation without discarding successful frames.
- Preserve FIX67 eject timing, native CD center, white spindle highlight, silver platter, menus, and 3D CoverFlow.

See [CHANGELOG.en.md](CHANGELOG.en.md) for release history.

## Demo Video
- Disc transition animations (ejecting and inserting a disc)

  https://github.com/user-attachments/assets/76316d03-1e34-4b1a-be36-9f69b7450a86

- Phonograph mode and vertically-oriented Chinese lyrics

  https://github.com/user-attachments/assets/bfcd45c8-4176-4456-95be-82a1e13f295c

- Display of artists from various countries/regions on detail pages and the bottom bar; immersive (scrolling) lyrics; line-by-line, word-for-word lyric translation.

  https://github.com/user-attachments/assets/1951a8d4-71a5-4c5a-9018-23738d2de0c8

- Immersive Mode

  https://github.com/user-attachments/assets/c6531c96-d3a2-49b1-b22c-5a9584a5285e
  

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

## License

Original modifications, patches, and documentation contributions **owned and licensable by this project’s contributors** are offered under the [MIT License](LICENSE). This does **not** relicense Georgia-ReBORN, Library Tree, Biography, or third-party images, fonts, and other pre-existing materials. Their applicable rights and licenses remain with their respective owners. See [third-party notices](THIRD_PARTY_NOTICES.en.md). Redistribution must comply with the relevant upstream license and attribution obligations.
