# FIX62 正式版 — 发布与回归记录

日期：2026-10-15  
基线：已在 Windows 实机通过验收的 FIX62 RC1。

## 正式版约束

- 31 个 JS 文件与 RC1 逐字节一致，不重新修改运行代码。
- 与历史稳定 FIX51 对照，仅三个运行脚本发生修改：`gr-main-components.js`、`gr-details.js`、`gr-menu.js`。
- 不引入历史 FIX52～FIX62 旧实验分支的波形原生取消、动画与歌词调度方案。

## 验收

- 用户确认 RC1 Windows 实机测试通过，包括 SACD ISO 切歌稳定性、波形条、详情页 32px 字体和内部播放列表占位过滤，以及已有功能回归。
- Node.js `--check` 静态语法检查 31/31 通过；不能代替其他计算机上的实机测试。

## 上传 GitHub

将本压缩包源码合并到本地仓库，保留 `.git`，在 GitHub Desktop 检查差异，提交并推送到 `main`；不需要强制推送或重写历史。旧 FIX61 提交仍保留在 Git 历史。

建议 Commit Summary：`FIX62: Restore stability and improve waveform and font scaling`

本包不是完整播放器安装包，不包含个人配置与发布用 EXE。
