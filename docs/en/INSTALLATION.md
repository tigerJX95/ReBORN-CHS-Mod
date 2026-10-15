# Installation and Usage

[简体中文](../安装与使用.md) | **English**

## Compatible setup

This project is a collection of script modifications for a compatible Chinese-localized foobar2000 and TT / Georgia-ReBORN setup. It cannot run independently and should not be installed as a complete theme into an otherwise empty foobar2000 setup.

Keep the original unmodified scripts, script component, fonts, and other resources. Exact component versions have not yet been documented; use the Chinese-localized setup matching the stable FIX51 baseline.

## Replacing files

1. Close foobar2000.
2. Back up the corresponding `Base`, `Biography`, and `Library` scripts and personal configuration in the existing setup.
3. Find the setup's script root, typically `georgia-reborn/scripts/` under the foobar2000 profile directory. Use the actual directory containing files such as `Base/gr-main.js`. Parent directories may differ between portable and standard installations.
4. Copy files from this repository's `scripts/` directory to the matching relative paths. **Merge and overwrite individual files; do not delete the destination directories first.** They may contain upstream scripts absent from this repository.
5. Restart foobar2000 and check Lyrics, Details, Biography, and the library.

| Repository path | Destination relative to the actual script root |
| --- | --- |
| `scripts/Base/*.js` | Matching files in `Base/` |
| `scripts/Biography/scripts/*.js` | Matching files in `Biography/scripts/` |
| Files inside `scripts/Library/` | Matching relative paths in `Library/` |

To upgrade from FIX51 to FIX52, replace these five files:

- `Base/gr-main-components.js`
- `Base/gr-details.js`
- `Base/gr-menu.js`
- `Base/gr-callbacks.js`
- `Base/gr-config-defaults.js`

Upgrading from FIX50 to FIX51 requires replacing only `Base/gr-lyrics.js`. An existing FIX52 setup does not require repeated replacement.

## Main settings

- Turntable: the existing disc-related menu includes `唱机模式（原型测试）` (Turntable mode, prototype).
- Chinese vertical lyrics: the Details context menu includes `中文竖排` (Chinese vertical lyrics). Enable it in the default layout. It applies to Chinese original lyrics and does not force other languages into vertical Chinese layout.
- Album flow: the library offers `3D CD 流转设置` (3D CD flow settings), including center-album size.
- Custom lyric colors: the main interface and Biography use their own settings. To change Biography lyrics, edit its normal and highlighted lyric colors.
- Star animation: applies to original lyrics only, not translations.

Exact menu paths depend on the Chinese-localized setup and active page. The English documentation does not translate the script interface.

Details font sizes can be set up to 48 px under Font size → Details, or adjusted with Ctrl+wheel over the corresponding text area. The rendered size may differ from the setting when the Details region requires text fitting.

The waveform bar prioritizes cached data. Tracks without a cache still require AudioWizard analysis; processing time depends on the file, analysis resolution, and runtime environment.

## Checking changes and recovering

After updating, check original and translated lyrics, arc lyrics, Chinese vertical layout, custom colors, turntable transitions, and album flow. When reporting a problem, describe the page mode, theme, window proportions, and steps. Screenshots should show the relative positions of the CD and lyrics where relevant.

If a script error occurs, close foobar2000, restore the backed-up files to their original paths, and restart. Keep the error's file name and line number for diagnosis. Do not clear personal configuration to conceal incompatible script versions.
