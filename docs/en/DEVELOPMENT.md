# Development Notes

[简体中文](../开发记录.md) | **English**

## Current baseline

- Confirmed on 2026-10-14: FIX51, the edition with the full feature set based on Chinese-localized TT / Georgia-ReBORN.
- GitHub maintains only the latest full-featured edition, not the simplified community edition. No installers or release artifacts are produced.
- The repository stores FIX51 scripts and resources without additional changes to their runtime behavior.

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
| Performance | Retain caches and regional rendering; reuse existing animation timing where possible |

## Repository scope

The repository contains 31 JavaScript files, library resources, existing license information, and documentation. It excludes previous source copies, the complete runtime setup, and personal configuration.

No automated test suite is included and CI is not configured. Check affected pages and features after code changes.

## Environment information to document

- Exact foobar2000 version, architecture, and installation type.
- Script-component name and version, and the Chinese-localized TT setup identifier.
- Main-project and Biography-component license files from the complete setup.

This information describes compatibility and sources; it does not require uploading the full player setup to GitHub.

## Future notes

Record the requirement, final design, changed files, checks, and outstanding questions for each change. Keep agreed conclusions rather than complete chat transcripts. Mark a stable version as the new baseline after verification.
