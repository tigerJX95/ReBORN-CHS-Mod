# TT Modified Scripts

[简体中文](README.md) | **English**

A script modification project based on the Chinese-localized TT / Georgia-ReBORN setup for foobar2000, preserving personal enhancements, fixes, and development notes.

Current baseline: **FIX51**. Only the latest edition with the full feature set is maintained; the simplified community edition is not maintained here.

## Purpose

Keep script changes available for comparison, rollback, and continued development. The repository contains JavaScript source and related resources for an existing compatible Chinese-localized foobar2000 and TT / Georgia-ReBORN setup.

## Main enhancements

- Turntable mode, CD rotation, and immersive display, including fixes for view changes and restoring the minimized player.
- Scrolling lyrics in Details and lyrics arranged along the CD arc, with original lines, wrapped lines, and translations.
- Word-by-word karaoke highlighting, highlighting styles, and star animations on original lyrics. Translations do not use the star animation.
- Traditional Chinese vertical lyrics, with shared settings for the Lyrics page, Details, and the turntable lyric area, plus a Details context-menu entry.
- Fade-mask settings; vertical Chinese lyrics fade at the left and right edges.
- Custom-theme lyric colors, with separate settings for the main interface and Biography.
- An interlude countdown that uses empty space below the lyrics where available and becomes more transparent when it overlaps lyrics.
- 3D album flow in the library, independent center-album sizing, perspective and spacing settings, and automatic return after inactivity. The moving glow effect has been discontinued.

## Directory layout

| Path | Purpose |
| --- | --- |
| `scripts/Base/` | Main interface, Details, lyrics, menus, and settings |
| `scripts/Biography/scripts/` | Modified Biography scripts |
| `scripts/Library/` | Library scripts, entry point, and existing resources |
| `CHANGELOG.en.md` | Version history |
| `docs/en/INSTALLATION.md` | Replacement, backup, settings, and recovery |
| `docs/en/DEVELOPMENT.md` | Design decisions and outstanding information |
| `docs/en/GITHUB_WORKFLOW.md` | Initial upload and ongoing maintenance |
| `docs/en/FILE_LIST.md` | Script inventory and FIX51 checksums |
| `THIRD_PARTY_NOTICES.en.md` | Sources, attribution, and license information |

## Requirements

A working TT / Georgia-ReBORN setup with its script component, fonts, and resources is required. The repository includes **31 JavaScript files** and existing library resources. It is not a complete player setup and does not include every unmodified upstream script.

The original main-script header identifies its version as `3.0-x64-DEV`; the library package metadata identifies Library Tree `2.4.0`. These are source identifiers, rather than verified versions of the entire runtime setup. Exact foobar2000, script-component, and setup versions remain to be documented.

Close foobar2000 and back up the corresponding scripts and personal configuration before replacing files. Merge files using their relative paths and preserve other setup files. See [Installation and usage](docs/en/INSTALLATION.md).

## Maintenance

FIX51 is the current stable baseline. Only the latest scripts and documentation are committed; previous versions remain in Git history. Old ZIP files and duplicate source copies are not stored in the repository. No build or release-artifact workflow is configured.

## Sources and acknowledgments

Thanks to [TT / Georgia-ReBORN](https://github.com/TT-ReBORN/Georgia-ReBORN), the authors of foobar2000 and its components, 风里尘 for the Chinese-localized modification of TT / Georgia-ReBORN, and Gemini and ChatGPT for assistance with code changes and documentation.

This is a personal modification project, not an official release from the original authors. See [Third-party notices](THIRD_PARTY_NOTICES.en.md) for sources and licensing information.
