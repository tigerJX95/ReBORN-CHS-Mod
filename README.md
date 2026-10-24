**当前发布版本：FIX66（2026-10-24）**

已整合通过实机验证的唱机封面、RCA Logo、自定义主题与 CD 出碟修复。自定义主题修复已纳入 `scripts/Base/gr-menu-custom.js`，与其他已验收脚本一同维护和发布。参见 [FIX66 整合与回归说明](docs/FIX66_整合与回归说明.md)。

**简体中文** | [English](./README.en.md)

# ReBORN-CHS-Mod

基于 TT / Georgia-ReBORN 的 foobar2000 中文主题脚本修改项目，提供 JavaScript 源码及配套资源。项目不是独立播放器，也不包含 foobar2000 本体。


## 主要功能

- 唱机模式、CD 动画和沉浸显示，以及界面切换与窗口恢复相关优化。
- 详情页滚动歌词、CD 圆弧歌词、逐字高亮和中文竖排歌词。
- 主题歌词颜色、渐隐遮罩、间奏倒计时和 3D 专辑流转。
- 波形进度显示、详情页字体与布局自适应、专辑封面及元数据展示。

## FIX66 更新重点

- 唱机模式将封面填充范围由 95% 调整为 100%，消除圆周黑色缺口。
- 取消 RCA Logo 400×270 图片的固定裁剪，使标志完整显示。
- 纳入实机确认的自定义主题输入框空值防护补丁。
- 恢复 FIX65 已验证流畅的 CD 出碟等待行为，撤销旧 FIX66 持续循环检测改动。
- 保留 FIX65 的图片缓存、波形防抖和 AudioWizard 机制。

## FIX65 更新重点

- 圆弧歌词位图缓存保留最多 32 项，并限制总像素预算为 400 万；超大位图不长期缓存。
- 改善沉浸模式歌词切换及隐藏时的模糊封面缓存清理。
- 完善三组 ArtCache 缓存和 LRU 索引释放；无效位图不再阻碍缓存清理，并提供位图占用诊断信息。
- **专辑模式下优先完成 CD 出碟动画，再加载当前曲目的波形缓存或启动波形分析**，减少两者竞争导致的动画卡顿。
- 出碟动画结束后让出一次界面事件循环；快速切歌时检查曲目任务是否过期，并设置异常等待兜底。
- 保持原生 AudioWizard 处理方式、500ms 波形防抖、SACD ISO 路径和 UTF-8 BOM 兼容性。

各版本详细变更见 [CHANGELOG.md](CHANGELOG.md)。

## 演示
- 碟片过渡动画（出碟和收蝶）
  

https://github.com/user-attachments/assets/76316d03-1e34-4b1a-be36-9f69b7450a86


- 唱机模式和中文竖排歌词


https://github.com/user-attachments/assets/bfcd45c8-4176-4456-95be-82a1e13f295c


- 详情页和底栏多国籍/地区艺术家显示、环绕歌词、逐字歌词翻译行逐字


https://github.com/user-attachments/assets/1951a8d4-71a5-4c5a-9018-23738d2de0c8


- 沉浸模式
  

https://github.com/user-attachments/assets/c6531c96-d3a2-49b1-b22c-5a9584a5285e








## 目录

| 路径 | 内容 |
| --- | --- |
| `scripts/Base/` | 主界面、详情页、歌词、菜单和设置脚本 |
| `scripts/Biography/scripts/` | 简介相关脚本 |
| `scripts/Library/` | 曲库脚本及配套资源 |
| `docs/安装与使用.md` | 安装、备份与设置说明 |
| `CHANGELOG.md` / `CHANGELOG.en.md` | 中英文版本更新记录 |
| `SHA256SUMS.txt` | 文件 SHA-256 校验清单 |
| `THIRD_PARTY_NOTICES.md` | 第三方来源、署名和许可证说明 |

## 安装与使用

请在已有兼容的 foobar2000、JSplitter 和 TT / Georgia-ReBORN 环境中使用。项目仅提供修改的脚本及相关资源，不代替完整基台。

关闭 foobar2000 后先备份已有脚本和个人配置，再按压缩包中的相对路径替换对应文件。请保留环境中其他未包含的上游文件。详细步骤见安装与使用说明。

## 来源与鸣谢

感谢 [TT / Georgia-ReBORN](https://github.com/TT-ReBORN/Georgia-ReBORN)、foobar2000 及其组件作者、中文本地化相关贡献者，以及参与代码与文档协作的 Gemini 和 ChatGPT。

本项目为非官方个人修改版本，不代表原作者的官方发行。请保留上游署名和相关许可证要求，具体参见 [第三方说明](THIRD_PARTY_NOTICES.md)。
