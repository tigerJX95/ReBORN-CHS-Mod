**当前发布版本：FIX67（2026-10-31）**

已整合通过测试的 CD 盘面来源、中心小白点、3D 流转模式导航与异步缓存稳定性修复。保留 FIX66 稳定修复。详见 [FIX67 更新日志](CHANGELOG.md) 与 [正式版验收说明](docs/FIX67_正式版发布与回归.md)。

**简体中文** | [English](./README.en.md)

# ReBORN-CHS-Mod

基于 TT / Georgia-ReBORN 的 foobar2000 中文主题脚本修改项目，提供 JavaScript 源码及配套资源。项目不是独立播放器，也不包含 foobar2000 本体。


## 主要功能

- 唱机模式、CD 动画和沉浸显示，以及界面切换与窗口恢复相关优化。
- 详情页滚动歌词、CD 圆弧歌词、逐字高亮和中文竖排歌词。
- 主题歌词颜色、渐隐遮罩、间奏倒计时和 3D 专辑流转。
- 波形进度显示、详情页字体与布局自适应、专辑封面及元数据展示。


## FIX67 更新重点

- 修复下拉菜单首项与关闭时的索引异常。
- 唱机直接读取 CD 盘面原图，保留中心结构与小白点；缺图时不再用普通专辑封面替代。
- 解除唱机 CD 加载与普通详情页碟片显示设置的错误联动，并修复初始化和异步失败恢复。
- 3D 流转模式增强自动归位、键盘/滚轮边界保护以及过期封面请求校验与缓存性能。


各版本详细变更见 [CHANGELOG.md](CHANGELOG.md)。

## 演示
- 碟片过渡动画（出碟和收蝶）
  

https://github.com/user-attachments/assets/8b64b629-7d0c-48e3-8da0-e2b09481cefa



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
| `LICENSE` | 本项目原创贡献的 MIT 许可证 |

## 安装与使用

请在已有兼容的 foobar2000、JSplitter 和 TT / Georgia-ReBORN 环境中使用。项目仅提供修改的脚本及相关资源，不代替完整基台。

关闭 foobar2000 后先备份已有脚本和个人配置，再按压缩包中的相对路径替换对应文件。请保留环境中其他未包含的上游文件。详细步骤见安装与使用说明。

## 来源与鸣谢

感谢 [TT / Georgia-ReBORN](https://github.com/TT-ReBORN/Georgia-ReBORN)、foobar2000 及其组件作者、中文本地化相关贡献者，以及参与代码与文档协作的 Gemini 和 ChatGPT。

本项目为非官方个人修改版本，不代表原作者的官方发行。请保留上游署名和相关许可证要求，具体参见 [第三方说明](THIRD_PARTY_NOTICES.md)。

## 开源许可证

本项目贡献者拥有版权且有权授权的**原创修改、补丁和文档贡献**采用 [MIT License](LICENSE)。这并不将 Georgia-ReBORN、Library Tree、Biography 或第三方图片、字体等既有内容重新授权为 MIT。其版权和适用许可由各自权利人决定，详见 [第三方来源与许可证说明](THIRD_PARTY_NOTICES.md)。使用、修改和再发布时请同时遵守相关上游许可及署名要求。
