# Development Notes

[简体中文](../开发记录.md) | **English**

## Current version

- Current version: FIX68 (2026-11-21).
- This repository maintains modified scripts and accompanying resources based on the Chinese-localized TT / Georgia-ReBORN theme; it does not include foobar2000.

## Design decisions

| Area | Decision |
| --- | --- |
| Layout | Treat album and turntable proportions separately; prioritize a square turntable while retaining space for Details information |
| Label logo | Arc lyrics may still use and fade through the lower-right logo area; do not reserve a mandatory blank area around it |
| Chinese vertical lyrics | Share the setting entry; apply fading at the left and right edges |
| Bilingual lyrics | Group original, wrapped, and translated rows within a sentence; star animations apply only to original lyrics |
| Custom colors | Keep main-interface and Biography configuration separate |
| Interlude prompt | Prefer lower empty space; reduce prompt opacity over lyrics without compressing lyric layout |
| CD arc | Position horizontal-style rows individually; keep tilted rows parallel within a sentence and clear of the CD |
| Album flow | Size the center album independently; the moving glow effect has been discontinued |
| Details fonts | Settings and Ctrl+wheel support up to 48 px; fit to the actual Details region and recalculate after size changes |
| Waveform loading | Prioritize caches, keep only the latest waiting track, cancel previous requests, and bound callback waits and retries |
| Performance | Retain caches and regional rendering; reuse existing animation timing where possible |

## Repository scope

The repository contains 32 runtime JavaScript files, Library resources, license notices, and documentation.

The repository includes regression scripts in `tests/`. Review affected pages and functionality after code changes.

## Environment information to document

- Exact foobar2000 version, architecture, and installation type.
- Script-component name and version, and the Chinese-localized TT setup identifier.
- Main-project and Biography-component license files from the complete setup.

This information describes compatibility and sources; it does not require bundling the complete player setup.

## Future notes

Record the requirement, final design, changed files, checks, and outstanding questions for each change. Keep agreed conclusions rather than complete chat transcripts. Document version changes in the changelog.
