# FIX66 正式整合与回归说明（2026-10-24）

## 本轮实际修改

1. `scripts/Base/gr-details.js`：`getTurntableRecord()` 将源封面目的矩形由 95% 缩放改成 100% 填充；`getLabelVisibleBounds()` 取消 RCA 400×270 资源的固定裁剪。两项均已通过用户实机验证。
2. `scripts/Base/gr-menu-custom.js`：整合 FIX66.3 已验收的最小空值保护补丁，随源码统一维护。
3. 出碟使用 FIX65 的原始调度，早期 FIX66 的循环等待修改已撤回；保留 FIX65 其他优化。

## 手动部署

关闭 foobar2000，备份原脚本和用户配置。将 `scripts/` 中的全部脚本按相同相对路径部署，包括 `scripts/Base/gr-menu-custom.js`。若播放器实际安装路径与仓库布局不同，应以其现有脚本加载路径为准；无需再从额外补丁目录取文件。

## 验收依据与检查

- 用户已确认：自定义主题设置无红屏、CD 出碟流畅、唱机 100% 填充后无边缘缺口、RCA Logo 显示完整。
- 静态检查：运行 `node tests/test-fix66-baseline.js`、`node tests/test-fix66-waveform.js`（模拟检查不能代替实机）。
- 代码对比：`gr-details.js` 相对 FIX65 仅两个目标逻辑调整。

## 范围控制

本版不启用 FIX67；不合并透明旋转边距等未通过实机验收的候选补丁，不重构唱机绘制或改变外部脚本的加载方式。
