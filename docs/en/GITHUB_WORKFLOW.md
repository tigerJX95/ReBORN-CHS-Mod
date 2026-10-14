# GitHub Workflow

[简体中文](../GitHub上传流程.md) | **English**

## Initial upload

1. Use `ReBORN-CHS-Mod` as the local repository directory; the current Windows path is `D:\JS\ReBORN-CHS-Mod`. Keep the script names and resource paths unchanged.
2. Read the README and installation guide, and check the environment and third-party information.
3. Create the repository through GitHub Desktop using **File → New repository**. Do not generate a duplicate README or assign a new license to the entire repository without checking its existing licenses. Use **None** for the ignore template; the repository already includes `.gitignore`.
4. In Changes, confirm that only scripts, resources, documentation, and Git configuration are included, with no player executables, music, caches, or personal configuration.
5. Suggested first commit: `Establish the TT modified FIX51 source baseline`.
6. Select **Publish repository**. A private repository can be used initially; decide whether to make it public after documenting environment versions and the applicable upstream licenses.

The repository manages source and documentation only, without a Release or executable-generation workflow.

## Ongoing changes

1. Update changed scripts in the same directory rather than creating another version folder.
2. Update both `CHANGELOG.md` and `CHANGELOG.en.md`. Keep corresponding Chinese and English documents in sync, including development notes for important design decisions.
3. Review per-file diffs in GitHub Desktop for accidental deletions or unrelated changes.
4. Check and try the changes, then commit and select **Push origin**.
5. Tags such as `FIX51` or `FIX52` may mark stable baselines. A tag does not require creating a Release.

Git stores historical versions. Do not repeatedly add old ZIP archives, duplicate JavaScript files, or separate copies of the three editions.
