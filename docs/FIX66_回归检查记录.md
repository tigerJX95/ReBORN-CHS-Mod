# FIX66 — 出碟与波形任务技术说明

- `scripts/Base/gr-main-components.js` 的 `waitForAlbumDiscEject()` 恢复 FIX65 的等待机制，撤销单截止时间的实验实现。
- 波形任务在 CD 出碟完成后继续加载或分析，相关旧任务采用过期保护。
- 对出碟、切歌和缓存相关的脚本行为进行回归检查。
