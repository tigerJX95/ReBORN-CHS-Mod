# GitHub 上传流程

**简体中文** | [English](en/GITHUB_WORKFLOW.md)
## 首次上传

1. 本地仓库为 `ReBORN-CHS-Mod`，当前路径为 `D:\JS\ReBORN-CHS-Mod`。保留脚本内部名称和资源路径。
2. 先阅读 README 和安装说明，核对适用环境及第三方说明。
3. 在 GitHub Desktop 中选择「File → New repository」，在该目录建立仓库；不要自动生成与现有文件重复的 README，也不要随意为整个仓库指定新的许可证。Git ignore 选择 None，使用仓库已有的 `.gitignore`。
4. 在 Changes 中确认提交内容只有脚本、资源、文档和 Git 配置，没有基台程序、音乐、缓存和个人配置。
5. 首次提交建议写：`以 TT 修改最新版 FIX51 建立源码基线`。
6. 选择 Publish repository。可以先设为私有，补齐环境版本与原项目许可证后再决定是否公开。

仓库只管理源码和文档，不配置 Release 或可执行程序生成流程。

## 后续修改

1. 在同一个目录中更新改动的脚本，避免新建一套版本文件夹。
2. 同步更新 `CHANGELOG.md` 和 `CHANGELOG.en.md`，相关中英文文档保持一致；重要设计结论同步写入开发记录。
3. 查看 GitHub Desktop 的逐文件差异，确认没有意外删除或无关改动。
4. 检查并试用后 Commit，再 Push origin。
5. 若要标记稳定基线，可添加 `FIX51`、`FIX52` 等标签；标签不要求创建 Release。

历史代码由 Git 保存；不在目录中反复加入旧版 ZIP、旧 JS 副本或三个版本的重复源码。
