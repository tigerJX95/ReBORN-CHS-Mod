////////////////////////////////////////////////////////////////////////
// * Georgia-ReBORN: 一个简洁、全动态的颜色重生 - Foobar2000 播放器 * //
// * 类型:           Georgia-ReBORN 菜单                            * //
// * 作者:           TT                                             * //
// * 网站:           https://github.com/TT-ReBORN/Georgia-ReBORN    * //
// * 版本:           3.0-x64-DEV                                    * //
// * 开发开始:       22-12-2017                                     * //
// * 最后更改:       19-07-2026                                     * //
////////////////////////////////////////////////////////////////////////


'use strict';


//////////////////
// * TOP MENU * //
//////////////////
/**
 * A class that creates and handles all top menus in the top navigation bar.
 */
class TopMenu {
	// * PUBLIC METHODS * //
	// #region PUBLIC METHODS
	/**
	 * Opens the main menu and handles different menu options based on the provided name.
	 * @param {number} x - The x-coordinate.
	 * @param {number} y - The y-coordinate.
	 * @param {string} name - The name of the menu.
	 */
	topMenuMain(x, y, name) {
		grm.button.mainMenuOpen = true;
		grm.ui.activeMenu = true;

		if (name) {
			const menu = new Menu(name);

			if (name === 'Help') {
				const themeMenu = new Menu('主题');

				const statusMenu = new Menu('状态');
				statusMenu.addItem('已安装所有字体', grm.ui.initFonts(), undefined, true);
				statusMenu.addItem('找到艺术家标识', IsFile(`${grPath.artistlogos}Metallica.png`), undefined, true);
				statusMenu.addItem('找到唱片行标识', IsFile(`${grPath.labelsBase}Republic.png`), undefined, true);
				statusMenu.addItem('找到国旗图片', IsFile(`${grPath.flagsBase + HD_4K('32\\', '64\\')}United-States.png`), undefined, true);
				statusMenu.addItem('foo_enhanced_playcount 已安装', Component.EnhancedPlaycount, () => { RunCmd('https://www.foobar2000.org/components/view/foo_enhanced_playcount'); });
				statusMenu.appendTo(themeMenu);

				const updatesMenu = new Menu('更新');
				updatesMenu.addToggleItem('自动检查主题更新', grSet, 'checkForUpdates', () => { grCfg.scheduleUpdateCheck(1000); });
				updatesMenu.addItem('检查最新主题更新', false, () => { grCfg.checkForUpdates(true, true); });
				updatesMenu.appendTo(themeMenu);

				themeMenu.addItem('发布', false, () => { RunCmd('https://github.com/TT-ReBORN/Georgia-ReBORN/releases'); });
				themeMenu.addItem('更新日志', false, () => { RunCmd('https://github.com/TT-ReBORN/Georgia-ReBORN/blob/master/profile/georgia-reborn/docs/CHANGELOG.md'); });
				themeMenu.addItem('问题反馈', false, () => { RunCmd('https://github.com/TT-ReBORN/Georgia-ReBORN/issues'); });
				themeMenu.appendTo(menu);
				const hanhuaMenu = new Menu('汉化');
				hanhuaMenu.addItem('风里闲', false, () => { RunCmd('https://user.qzone.qq.com/116330458'); });
				hanhuaMenu.addItem('发布', false, () => { RunCmd('https://tieba.baidu.com/p/7829121202'); });
				hanhuaMenu.addItem('更新版本', false, () => { RunCmd('https://pan.baidu.com/s/1Vp6dmksYdyWLo3IdBtZm7A'); });
				hanhuaMenu.addItem('QQ群：710983911', false, () => { RunCmd('.\\georgia-reborn\\images\\logo\\QQ群.png'); });
	//			hanhuaMenu.addItem('投币支持 🤝', false, () => { RunCmd('.\\georgia-reborn\\images\\logo\\肯定与支持.jpg'); });
	//			hanhuaMenu.addItem('说明', false, () => { RunCmd('.\\georgia-reborn\\docs\\操作说明.txt'); });
	//			hanhuaMenu.addItem('说明', false, () => { grm.msg.showPopupNotice('themeColors', 'playerDescriptio'); });
	//			hanhuaMenu.addItem('操作说明', false, () => { const msg = grm.msg.getMessage('themeColors', 'playerDescriptios');fb.ShowPopupMessage(msg, '👽 Georgia-ReBORN 播放器操作说明'); });
				hanhuaMenu.appendTo(menu);    
			// ✅ 新增：投币支持项 说明项 作为一级菜单
	//		    menu.addItem('说明', false, () => { grm.msg.showPopupNotice('themeColors', 'playerDescriptio'); });
				menu.addItem('说明', false, () => { const msg = grm.msg.getMessage('themeColors', 'playerDescriptios');fb.ShowPopupMessage(msg, '👽 Georgia-ReBORN 操作说明'); });
			    menu.addSeparator();
			    menu.addItem('投币支持 🤝', false, () => { RunCmd('.\\georgia-reborn\\images\\logo\\肯定与支持.jpg'); });
				menu.addSeparator();
			}
			menu.initFoobarMenu(name);

			const ret = menu.trackPopupMenu(x, y);
			menu.doCallback(ret);
		}

		grm.ui.activeMenu = false;
	}

	/**
	 * Creates a context menu for playlists allowing users to perform various actions such as
	 * creating new playlists, saving and loading playlists, locking and unlocking playlists,
	 * and creating auto playlists based on different criteria.
	 * @param {number} x - The x-coordinate.
	 * @param {number} y - The y-coordinate.
	 * @returns {boolean} True or false.
	 */
	topMenuPlaylists(x, y) {
		grm.button.mainMenuOpen = true;
		grm.ui.activeMenu = true;

		const playlistId = 21;
		const playlistCount = plman.PlaylistCount;
		const cpm = window.CreatePopupMenu();
		const plTools = window.CreatePopupMenu();
		const autoPl = window.CreatePopupMenu();
		const isAutoPl = !playlistCount ? '' : plman.IsAutoPlaylist(plman.ActivePlaylist);
		const isLocked = !playlistCount ? '' : plman.IsPlaylistLocked(plman.ActivePlaylist);

		plTools.AppendTo(cpm, MenuFlag.String, '播放列表工具 🔧');
		plTools.AppendMenuItem(MenuFlag.String, 1, '播放列表管理器 \tCtrl+M');
		plTools.AppendMenuItem(MenuFlag.String, 2, '播放列表搜索 \tCtrl+F');
		plTools.AppendMenuSeparator();
		plTools.AppendMenuItem(MenuFlag.String, 3, '新建播放列表 \tCtrl+N');
		autoPl.AppendTo(plTools, MenuFlag.String, '新建自动播放列表');
		autoPl.AppendMenuItem(MenuFlag.String, 4, '自定义自动播放列表');
		autoPl.AppendMenuSeparator();
		autoPl.AppendMenuItem(MenuFlag.String, 5, '来自媒体库曲目');
		autoPl.AppendMenuSeparator();
		autoPl.AppendMenuItem(MenuFlag.String, 6, '最常播放曲目');
		autoPl.AppendMenuItem(MenuFlag.String, 7, '从未播放曲目');
		autoPl.AppendMenuItem(MenuFlag.String, 8, '上周播放曲目');
		autoPl.AppendMenuItem(MenuFlag.String, 9, '上月播放曲目');
		autoPl.AppendMenuItem(MenuFlag.String, 10, '去年播放曲目');
		autoPl.AppendMenuSeparator();
		autoPl.AppendMenuItem(MenuFlag.String, 11, '未分级曲目');
		autoPl.AppendMenuItem(MenuFlag.String, 12, '曲目评级 1 ★');
		autoPl.AppendMenuItem(MenuFlag.String, 13, '曲目评级 2 ★');
		autoPl.AppendMenuItem(MenuFlag.String, 14, '曲目评级 3 ★');
		autoPl.AppendMenuItem(MenuFlag.String, 15, '曲目评级 4 ★');
		autoPl.AppendMenuItem(MenuFlag.String, 16, '曲目评级 5 ★');
		autoPl.AppendMenuSeparator();
		autoPl.AppendMenuItem(MenuFlag.String, 17, '喜爱曲目 ❤');
		plTools.AppendMenuSeparator();
		plTools.AppendMenuItem(MenuFlag.String, 18, '保存播放列表 \tCtrl+S');
		plTools.AppendMenuItem(MenuFlag.String, 19, '载入播放列表');
		plTools.AppendMenuItem(isAutoPl ? MenuFlag.Disabled : MenuFlag.String, 20, isLocked ? isAutoPl ? '解锁播放列表 （自动播放列表不可用）' : '解锁播放列表' : '锁定播放列表');
		cpm.AppendMenuSeparator();
		for (let i = 0; i < playlistCount; i++) {
			cpm.AppendMenuItem(MenuFlag.String, playlistId + i, `${plman.GetPlaylistName(i).replace(/&/g, '&&')} [${plman.PlaylistItemCount(i)}]${plman.IsAutoPlaylist(i) ? ' （自动）' : ''}${i === plman.PlayingPlaylist ? ' （正在播放）' : ''}`);
		}

		const id = cpm.TrackPopupMenu(x, y);
		const playlistIdx = id - playlistId;

		switch (id) {
			case 1:
				fb.RunMainMenuCommand('视图/播放列表管理器');
				break;
			case 2:
				fb.RunMainMenuCommand('视图/播放列表搜索');
				break;
			case 3:
				fb.RunMainMenuCommand('文件/新建播放列表');	
													  
				break;
			case 4:
				plman.CreateAutoPlaylist(playlistCount, '（自动）新建自定义自动播放列表', '', '', 0);
				plman.ActivePlaylist = playlistCount;
				plman.ShowAutoPlaylistUI(playlistCount);
				break;
			case 5:
				plman.CreateAutoPlaylist(playlistCount, '媒体库', 'ALL', "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 6:
				plman.CreateAutoPlaylist(playlistCount, '（自动）最常播放曲目', '%play_count% GREATER 9', "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 7:
				plman.CreateAutoPlaylist(playlistCount, '（自动）从未播放曲目', '%play_count% MISSING', "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 8:
				plman.CreateAutoPlaylist(playlistCount, '（自动）上周播放曲目', '%last_played% DURING LAST 1 WEEK', '%last_played%', 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 9:
				plman.CreateAutoPlaylist(playlistCount, '（自动）上个月播放曲目', '%last_played% DURING LAST 4 WEEKS', '%last_played%', 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 10:
				plman.CreateAutoPlaylist(playlistCount, '（自动）去年播放曲目', '%last_played% DURING LAST 52 WEEKS', '%last_played%', 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 11:
				plman.CreateAutoPlaylist(playlistCount, '（自动）未分级曲目', '%rating% MISSING', "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 12:
				plman.CreateAutoPlaylist(playlistCount, '（自动）曲目评级 1 ★', '%rating% IS 1', "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 13:
				plman.CreateAutoPlaylist(playlistCount, '（自动）曲目评级 2 ★', '%rating% IS 2', "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 14:
				plman.CreateAutoPlaylist(playlistCount, '（自动）曲目评级 3 ★', '%rating% IS 3', "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 15:
				plman.CreateAutoPlaylist(playlistCount, '（自动）曲目评级 4 ★', '%rating% IS 4', "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 16:
				plman.CreateAutoPlaylist(playlistCount, '（自动）曲目评级 5 ★', '%rating% IS 5', "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 17:
				plman.CreateAutoPlaylist(playlistCount, '（自动）喜爱曲目 ❤', '%mood% GREATER 0', "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
				plman.ActivePlaylist = playlistCount;
				break;
			case 18:
				fb.RunMainMenuCommand('文件/保存播放列表...');
				break;
			case 19:
				fb.RunMainMenuCommand('文件/载入播放列表...');
				break;
			case 20:
				if (plman.GetPlaylistLockName(plman.ActivePlaylist) && !isAutoPl) {
					plman.SetPlaylistLockedActions(plman.ActivePlaylist, null);
				} else if (!isAutoPl) {
					plman.SetPlaylistLockedActions(plman.ActivePlaylist, ['ExecuteDefaultAction']);
				}
				break;
		}

		if (playlistIdx < playlistCount && playlistIdx >= 0) {
			plman.ActivePlaylist = playlistIdx;
		}

		for (let i = 0; i < playlistCount; i++) {
			if (id === (playlistId + i)) plman.ActivePlaylist = i; // Playlist switch
		}

		grm.ui.activeMenu = false;
		return true;
	}

	/**
	 * Handles all top menus, also used to append panel-related menus to the context menu.
	 * @param {number} x - The x-coordinate.
	 * @param {number} y - The y-coordinate.
	 * @param {boolean} contextMenu - If true, appends panel-related menus to the context menu.
	 * @param {string} panel - The name of the panel to be appended. Can be 'playlist', 'details', 'library', 'biography', or 'lyrics'.
	 */
	topMenuOptions(x, y, contextMenu, panel) {
		grm.ui.activeMenu = true;
		grm.ui.state.mouse_x = x;
		grm.ui.state.mouse_y = y;

		const menu = new Menu();

		const panelOptionsMenu = {
			playlist: grm.options.playlistOptions,
			details: grm.options.detailsOptions,
			library: grm.options.libraryOptions,
			biography: grm.options.biographyOptions,
			lyrics: grm.options.lyricsOptions
		};

		const themeDayNightSandbox = grSet.themeSetupDay || grSet.themeSetupNight || grSet.themeSandbox;

		if (!contextMenu) {
			grm.options.designOptions(menu);
			grm.options.themeOptions(menu);
			grm.options.styleOptions(menu);
			grm.options.presetOptions(menu);

			if (!themeDayNightSandbox) {
				menu.addSeparator();
				grm.options.colorOptions(menu);
				grm.options.displayOptions(menu);
				grm.options.layoutOptions(menu);
				grm.options.playerSizeOptions(menu);
				grm.options.fontSizeOptions(menu);
			}

			if (!themeDayNightSandbox) {
				menu.addSeparator();
				grm.options.playerControlsOptions(menu);
				menu.addSeparator();
				grm.options.playlistOptions(menu);

				if (grSet.layout !== 'compact') {
					grm.options.detailsOptions(menu);
					grm.options.libraryOptions(menu);
					grm.options.biographyOptions(menu);
					grm.options.lyricsOptions(menu);
				}
			}

			menu.addSeparator();
			grm.options.settingsOptions(menu);

			if (grSet.devTools) {
				menu.addSeparator();
				grm.options.developerToolsOptions(menu);
			}
		}
		else if (panelOptionsMenu[panel]) {
			panelOptionsMenu[panel](menu, contextMenu);
		}

		const idx = menu.trackPopupMenu(x, y);
		menu.doCallback(idx);
		grm.ui.activeMenu = false;
	}
	// #endregion
}


////////////////////////////
// * TOP MENU - OPTIONS * //
////////////////////////////
/**
 * A class that provides the full collection of all menus in the `Options` top navigation menu.
 */
class TopMenuOptions {
	/**
	 * Creates the `TopMenuOptions` instance.
	 */
	constructor() {
		/**
		 * Applies a given theme setting with or without theme sandbox mode.
		 * If theme sandbox mode is off, the setting is saved and then applied.
		 * If theme sandbox mode is on, the setting is applied without saving.
		 * Triggers additional actions like showing a popup if theme day/night mode is active and sets the theme day/night style.
		 * @param {string} setting - The name of the setting to be applied.
		 * @param {boolean} value - The value to be set for the setting.
		 * @private
		 */
		this.applyThemeSetting = (setting, value) => {
			grm.day.showStyleChangeWarning((shouldContinue) => {
				if (!shouldContinue) return;

				if (setting) {
					const savedSettingName = `saved${setting.charAt(0).toUpperCase()}${setting.slice(1)}`;

					if (grSet.themeSandbox) {
						grSet[setting] = value;
					} else {
						grm.ui.restoreThemeStylePreset(true, true);
						grSet[savedSettingName] = grSet[setting] = value;
					}
				}

				if (grSet.themeSetupDay || grSet.themeSetupNight) {
					grm.day.setThemeDayNightStyle();
				}
			});
		}

		/** @public @type {ActiveXObject} The Audio Wizard ActiveX object. */
		this.audioWizard = Component.AudioWizard ? new ActiveXObject('AudioWizard') : null;
	}

	// * DESIGN * //
	// #region DESIGN
	/**
	 * Top menu > Options > Design.
	 * @param {Menu} menu - Creates the Design menu via a new Menu instance.
	 * @protected
	 */
	designOptions(menu) {
		const designMenu = new Menu('方案');
		const currentDesign = grm.ui.getDesignPresetState();

		designMenu.addRadioItems(['默认', '简洁', '谐波', '极简', '现代 黑', '现代 白', '现代 日/夜', '重生'], currentDesign,
			['default', 'clean', 'harmonic', 'minimal', 'modern_black', 'modern_white', 'modern_day_night', 'reborn'], (design) => {

			if (design === currentDesign) {
				grm.ui.setDesign(design);
				return;
			}

			const msgKey = design === 'modern_day_night' ? 'modernDayNight' : 'designChange';
			const msg = grm.msg.getMessage('menu', msgKey);
			const msgFb = grm.msg.getMessage('menu', msgKey, true);

			grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', async (confirmed) => {
				if (!confirmed) return;

				if (design === 'modern_day_night') {
					grSet.themeDayNightEnabled = false;
					grm.day.stopTimer();
				}

				grm.ui.setDesign(design);

				if (design === 'modern_day_night') {
					grm.day.setDayNightCustomTimeRange(true);
				}
			});
		}, false, false, [0]);
		designMenu.appendTo(menu);
	}
	// #endregion

	// * THEME * //
	// #region THEME
	/**
	 * Top menu > Options > Theme.
	 * @param {Menu} menu - Creates the Theme menu via a new Menu instance.
	 * @protected
	 */
	themeOptions(menu) {
		const themeMenu = new Menu('主题');
		themeMenu.addRadioItems(['白色', '黑色', '重生', '随机', '蓝色', '深蓝', '红色', '奶油', '荧光蓝', '荧光绿', '荧光红', '荧光金'], grSet.theme,
			['white', 'black', 'reborn', 'random', 'blue', 'darkblue', 'red', 'cream', 'nblue', 'ngreen', 'nred', 'ngold'], theme => {
			this.applyThemeSetting('theme', theme);
			grm.ui.resetTheme(grSet.theme === 'reborn');
			grm.ui.initTheme();
			grm.day.applyFoobarTheme();
			grm.details.setDiscArtShadow();
			grm.preset.initThemePresetState();
		}, false, false, [3, 7]);
		themeMenu.addSeparator();

		// * CUSTOM THEME * //
		const customThemeMenu = new Menu('自定义');
		const customThemeName = [
			grCfg.customTheme01.name || '主题 01',
			grCfg.customTheme02.name || '主题 02',
			grCfg.customTheme03.name || '主题 03',
			grCfg.customTheme04.name || '主题 04',
			grCfg.customTheme05.name || '主题 05',
			grCfg.customTheme06.name || '主题 06',
			grCfg.customTheme07.name || '主题 07',
			grCfg.customTheme08.name || '主题 08',
			grCfg.customTheme09.name || '主题 09',
			grCfg.customTheme10.name || '主题 10'
		];

		customThemeMenu.addRadioItems(customThemeName, grSet.theme, ['custom01', 'custom02', 'custom03', 'custom04', 'custom05', 'custom06', 'custom07', 'custom08', 'custom09', 'custom10'], (theme) => {
			this.applyThemeSetting('theme', theme);
			grm.ui.resetTheme();
			grm.ui.initCustomTheme();
			grm.ui.initTheme();
			grm.details.setDiscArtShadow();
			grm.cthMenu.initCustomThemeMenu('playlist', 'pl_bg');
			grm.preset.initThemePresetState();
		});
		customThemeMenu.addSeparator();

		customThemeMenu.addItem(!grm.ui.displayCustomThemeMenu ? '编辑   自定义主题' : '退出自定义主题菜单', false, () => {
			grm.ui.initCustomThemeMenuState();
		});

		customThemeMenu.addItem('重命名自定义主题', false, () => {
			if (!grSet.theme.startsWith('custom')) {
				grm.msg.showPopupNotice('menu', 'renameCustomTheme');
				return;
			}
			grm.inputBox.renameCustomTheme();
		});

		customThemeMenu.createRadioSubMenu('保存当前颜色到', customThemeName, '', ['custom01', 'custom02', 'custom03', 'custom04', 'custom05', 'custom06', 'custom07', 'custom08', 'custom09', 'custom10'], (theme) => {
			const msg = grm.msg.getMessage('menu', 'saveCurrentColors');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (confirmed) grm.colorPalette.setCurrentColorsToCustomTheme(theme);
			});
		});
		customThemeMenu.appendTo(themeMenu);
		themeMenu.appendTo(menu, grSet.presetSelectMode === 'harmonic');
	}
	// #endregion

	// * STYLE * //
	// #region STYLE
	/**
	 * Top menu > Options > Style.
	 * @param {Menu} menu - Creates the Style menu via a new Menu instance.
	 * @protected
	 */
	styleOptions(menu) {
		const styleMenu = new Menu('样式');
		grm.ui.themePresetIndicator = true;
		grm.ui.themePresetMatchMode = true;

		// * STYLES * //
		styleMenu.addToggleItem('默认', grSet, 'styleDefault', () => {
			if (grSet.themeSandbox) {
				grm.msg.showPopupNotice('menu', 'styleDefault');
				grSet.styleDefault = false;
				return;
			}

			grSet.preset = false;
			grm.ui.resetStyle('all');
			grm.ui.resetStyle('all_theme_day_night');
			grm.ui.restoreThemeStylePreset(true);
			grm.ui.resetTheme();
			grm.ui.initTheme();
			grm.day.applyFoobarTheme();
		});
		styleMenu.addSeparator();
		if (['reborn', 'random'].includes(grSet.theme) || grSet.theme.startsWith('custom')) {
			styleMenu.addToggleItem('夜间', grSet, 'styleNighttime', () => {
				grm.ui.setStyle('styleNighttime', grSet.styleNighttime);
				grm.ui.updateStyle();
			});
			styleMenu.addSeparator();
		}
		styleMenu.addToggleItem('斜面', grSet, 'styleBevel', () => {
			grm.ui.setStyle('styleBevel', grSet.styleBevel);
			grm.ui.updateStyle();
		});
		styleMenu.addSeparator();

		// * STYLES - GROUP ONE * //
		styleMenu.addToggleItem('融合', grSet, 'styleBlend', () => {
			grm.ui.setStyle('styleBlend', grSet.styleBlend);
			grm.ui.updateStyle();
		});
		styleMenu.addToggleItem('融合 2', grSet, 'styleBlend2', () => {
			grm.ui.setStyle('styleBlend2', grSet.styleBlend2);
			grm.ui.updateStyle();
		});
		if (['reborn', 'random', 'blue', 'darkblue', 'red', 'custom01', 'custom02', 'custom03', 'custom04', 'custom05', 'custom06', 'custom07', 'custom08', 'custom09', 'custom10'].includes(grSet.theme)) {
			styleMenu.addToggleItem('渐变', grSet, 'styleGradient', () => {
				grm.ui.setStyle('styleGradient', grSet.styleGradient);
				grm.ui.updateStyle();
			}, grSet.styleRebornWhite);
		}
		if (['reborn', 'random', 'blue', 'darkblue', 'red', 'custom01', 'custom02', 'custom03', 'custom04', 'custom05', 'custom06', 'custom07', 'custom08', 'custom09', 'custom10'].includes(grSet.theme)) {
			styleMenu.addToggleItem('渐变 2', grSet, 'styleGradient2', () => {
				grm.ui.setStyle('styleGradient2', grSet.styleGradient2);
				grm.ui.updateStyle();
			}, grSet.styleRebornWhite);
		}
		styleMenu.addSeparator();

		// * STYLES - GROUP TWO * //
		styleMenu.addToggleItem('备选', grSet, 'styleAlternative', () => {
			grm.ui.setStyle('styleAlternative', grSet.styleAlternative);
			grm.ui.updateStyle();
		});
		styleMenu.addToggleItem('备选 2', grSet, 'styleAlternative2', () => {
			grm.ui.setStyle('styleAlternative2', grSet.styleAlternative2);
			grm.ui.updateStyle();
		});
		if (grSet.theme === 'white') {
			styleMenu.addToggleItem('黑与白', grSet, 'styleBlackAndWhite', () => {
				grm.ui.setStyle('styleBlackAndWhite', grSet.styleBlackAndWhite);
				grm.ui.updateStyle();
			}, grSet.styleBlackAndWhiteReborn);
			styleMenu.addToggleItem('黑与白 2', grSet, 'styleBlackAndWhite2', () => {
				grm.ui.setStyle('styleBlackAndWhite2', grSet.styleBlackAndWhite2);
				grm.ui.updateStyle();
			}, grSet.styleBlackAndWhiteReborn);
			styleMenu.addToggleItem('黑与白 重生', grSet, 'styleBlackAndWhiteReborn', () => {
				grm.ui.setStyle('styleBlackAndWhiteReborn', grSet.styleBlackAndWhiteReborn);
				grm.ui.updateStyle();
			});
		}
		if (grSet.theme === 'black') {
			styleMenu.addToggleItem('黑重生', grSet, 'styleBlackReborn', () => {
				grm.ui.setStyle('styleBlackReborn', grSet.styleBlackReborn);
				grm.ui.updateStyle();
			});
		}
		if (grSet.theme === 'reborn') {
			styleMenu.addToggleItem('重生白', grSet, 'styleRebornWhite', () => {
				grm.ui.setStyle('styleRebornWhite', grSet.styleRebornWhite);
				grm.ui.updateStyle();
			});
			styleMenu.addToggleItem('重生黑', grSet, 'styleRebornBlack', () => {
				grm.ui.setStyle('styleRebornBlack', grSet.styleRebornBlack);
				grm.ui.updateStyle();
			});
			styleMenu.addToggleItem('重生混合', grSet, 'styleRebornFusion', () => {
				grm.ui.setStyle('styleRebornFusion', grSet.styleRebornFusion);
				grm.ui.updateStyle();
			});
			styleMenu.addToggleItem('重生混合 2', grSet, 'styleRebornFusion2', () => {
				grm.ui.setStyle('styleRebornFusion2', grSet.styleRebornFusion2);
				grm.ui.updateStyle();
			});
			styleMenu.addToggleItem('重生混合突出', grSet, 'styleRebornFusionAccent', () => {
				grm.ui.setStyle('styleRebornFusionAccent', grSet.styleRebornFusionAccent);
				grm.ui.updateStyle();
			});
		}
		if (grSet.theme === 'random') {
			const handleRandomStyleActivation = (styleKey) => {
				if (grSet[styleKey]) {
					grm.ui.setStyle(styleKey, grSet[styleKey]);
					grm.ui.updateStyle();

					if (grSet.albumArtColorSaturation === 'auto' || grSet.albumArtColorSaturation < 100) {
						grSet.albumArtColorSaturation = 100;
						grm.day.stopTimer();
						grm.ui.updateAlbumArtSaturation();
						grm.msg.showPopupNotice('themeColors', 'styleRandomColorNoticeEnabled');
					}
				} else {
					grm.ui.setStyle(styleKey, grSet[styleKey]);
					grm.ui.updateStyle();
				}
			};

			styleMenu.addToggleItem('随机荧光', grSet, 'styleRandomNeon', () => {
				handleRandomStyleActivation('styleRandomNeon');
			});

			styleMenu.addToggleItem('随机浅色', grSet, 'styleRandomPastel', () => {
				handleRandomStyleActivation('styleRandomPastel');
			});

			styleMenu.addToggleItem('随机深色', grSet, 'styleRandomDark', () => {
				handleRandomStyleActivation('styleRandomDark');
			});
		}
		styleMenu.addSeparator();

		// * STYLES - RANDOM AUTO COLOR * //
		if (grSet.theme === 'random') {
			const styleAutoColorMenu = new Menu('自动颜色');
			styleAutoColorMenu.addRadioItems([' 停用', '  5 秒', '10 秒', '15 秒', '30 秒', '45 秒', '  1 分', '  2 分', '  3 分', '  4 分', '  5 分', '新音轨'], grSet.styleRandomAutoColor,
				['off', 5000, 10000, 15000, 30000, 45000, 60000, 120000, 180000, 240000, 300000, 'track'], (timer) => {
				grm.ui.setStyle('styleRandomAutoColor', timer);
				grm.colorManager.getRandomThemeAutoColor();
			});
			styleAutoColorMenu.appendTo(styleMenu);
			styleMenu.addSeparator();
		}

		// * STYLES - BUTTONS * //
		const styleButtonsMenu = new Menu('按钮');
		const styleTopButtonsMenu = new Menu('顶部菜单');
		styleTopButtonsMenu.addRadioItems(['默认', '填充', '斜面', '内凹', '浮雕', '极简'], grSet.styleTopMenuButtons, ['default', 'filled', 'bevel', 'inner', 'emboss', 'minimal'], (style) => {
			grm.ui.setStyle('styleTopMenuButtons', style);
			grm.ui.updateStyle();
		});
		styleTopButtonsMenu.appendTo(styleButtonsMenu);
		const styleTransportButtonsMenu = new Menu('通用控制');
		styleTransportButtonsMenu.addRadioItems(['默认', '斜面', '内凹', '浮雕', '极简'], grSet.styleTransportButtons, ['default', 'bevel', 'inner', 'emboss', 'minimal'], (style) => {
			grm.ui.setStyle('styleTransportButtons', style);
			grm.ui.updateStyle();
		});
		styleTransportButtonsMenu.appendTo(styleButtonsMenu);
		styleButtonsMenu.appendTo(styleMenu);

		// * STYLES - PROGRESS BAR * //
		const styleProgressBarMenu = new Menu('进度条');
		styleProgressBarMenu.createRadioSubMenu('方案', ['默认', '圆化', '线', '块', '点', '细'], grSet.styleProgressBarDesign, ['default', 'rounded', 'lines', 'blocks', 'dots', 'thin'], (design) => {
			grm.ui.setStyle('styleProgressBarDesign', design);
			grm.ui.updateStyle();
		});
		styleProgressBarMenu.createRadioSubMenu('背景', ['默认', '斜面', '内凹'], grSet.styleProgressBar, ['default', 'bevel', 'inner'], (style) => {
			grm.ui.setStyle('styleProgressBar', style);
			grm.ui.updateStyle();
		});
		styleProgressBarMenu.createRadioSubMenu('进度填充', ['默认', '斜面', '内凹', '融合'], grSet.styleProgressBarFill, ['default', 'bevel', 'inner', 'blend'], (style) => {
			grm.ui.setStyle('styleProgressBarFill', style);
			grm.ui.updateStyle();
		});
		styleProgressBarMenu.appendTo(styleMenu);

		// * STYLES - VOLUME BAR * //
		const styleVolumeBarMenu = new Menu('音量条');
		styleVolumeBarMenu.createRadioSubMenu('方案', ['默认', '圆化'], grSet.styleVolumeBarDesign, ['default', 'rounded'], (design) => {
			grm.ui.setStyle('styleVolumeBarDesign', design);
			grm.ui.updateStyle();
		});
		styleVolumeBarMenu.createRadioSubMenu('背景', ['默认', '斜面', '内凹'], grSet.styleVolumeBar, ['default', 'bevel', 'inner'], (style) => {
			grm.ui.setStyle('styleVolumeBar', style);
			grm.ui.updateStyle();
		});
		styleVolumeBarMenu.createRadioSubMenu('音量填充', ['默认', '斜面', '内凹'], grSet.styleVolumeBarFill, ['default', 'bevel', 'inner'], (style) => {
			grm.ui.setStyle('styleVolumeBarFill', style);
			grm.ui.updateStyle();
		});
		styleVolumeBarMenu.appendTo(styleMenu);

		styleMenu.appendTo(menu, grSet.presetSelectMode === 'harmonic');
	}
	// #endregion

	// * PRESET * //
	// #region PRESET
	/**
	 * Top menu > Options > Preset.
	 * @param {Menu} menu - Creates the Preset menu via a new Menu instance.
	 * @protected
	 */
	presetOptions(menu) {
		const themePresetsMenu = new Menu('预设');
		const themePresetSelectModeMenu = new Menu('选择模式');

		const presetSelectMode = () => {
			themePresetSelectModeMenu.addRadioItems(['默认', '谐波', '主题'], grSet.presetSelectMode, ['default', 'harmonic', 'theme'], (mode) => {
				grSet.presetSelectMode = mode;
				if (mode === 'default') {
					const msg = grm.msg.getMessage('menu', 'presetSelectModeDefault');
					const msgFb = grm.msg.getMessage('menu', 'presetSelectModeDefault', true);
					grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
						if (!confirmed) {
							grSet.presetSelectMode = 'default';
							return;
						}
						grSet.presetAutoRandomMode = 'dblclick';
						grm.ui.setThemePresetSelection(true); // * Reactivate all
						grm.ui.resetStyle('all');
						grm.ui.resetTheme();
						grm.ui.restoreThemeStylePreset();
						if (grSet.savedPreset !== false) grm.preset.setThemePreset(grSet.savedPreset);
						grm.ui.updateStyle();
					});
				}
				else if (mode === 'harmonic') {
					const msg = grm.msg.getMessage('menu', 'presetSelectModeHarmonic');
					const msgFb = grm.msg.getMessage('menu', 'presetSelectModeHarmonic', true);
					grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
						if (!confirmed) {
							grSet.presetSelectMode = 'default';
							return;
						}
						grSet.presetAutoRandomMode = 'dblclick';
						grm.ui.setThemePresetSelection(true); // * Reactivate all
						grm.preset.generateRandomThemePreset();
					});
				}
				else if (mode === 'theme') {
					const msg = grm.msg.getMessage('menu', 'presetSelectModeTheme');
					const msgFb = grm.msg.getMessage('menu', 'presetSelectModeTheme', true);
					grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
						if (!confirmed) {
							grSet.presetSelectMode = 'default';
							return;
						}
						grSet.presetAutoRandomMode = 'dblclick';
						grm.ui.setThemePresetSelection(false, true);
						grm.preset.generateRandomThemePreset();
					});
				}
			});
		};

		// * HARMONIC MODE EXCLUSIVE MENU * // only show these options when harmonic mode is active
		if (grSet.presetSelectMode === 'harmonic') {
			presetSelectMode();
			themePresetSelectModeMenu.appendTo(themePresetsMenu);
			const themePresetSelectMenu = new Menu('选择预设');
			themePresetSelectMenu.addToggleItem('荧光蓝', grSet, 'presetSelectNblue');
			themePresetSelectMenu.addToggleItem('荧光绿', grSet, 'presetSelectNgreen');
			themePresetSelectMenu.addToggleItem('荧光红', grSet, 'presetSelectNred');
			themePresetSelectMenu.addToggleItem('荧光金', grSet, 'presetSelectNgold');
			themePresetSelectMenu.appendTo(themePresetsMenu);
			themePresetsMenu.addToggleItem('指示器', grSet, 'presetIndicator');
			themePresetsMenu.appendTo(menu);
			return;
		}

		// * THEME PRESETS MENUS * //
		const applyThemePreset = (preset) => {
			this.applyThemeSetting('preset', preset);
			grm.preset.setThemePreset(preset);
			this.applyThemeSetting(); // After applying the preset, synchronize the daytime/nighttime theme preset if necessary
			grm.details.setDiscArtShadow();
		};

		// * WHITE THEME PRESETS * //
		const themePresetsWhiteMenu = new Menu('白色');
		themePresetsWhiteMenu.addRadioItems(['斜面', '黑与白', '黑与白融合', '黑与白 2', '黑与白 2 融合', '黑与白重生', '黑与白重生融合', '极简'], grSet.preset,
			['whiteP01', 'whiteP02', 'whiteP03', 'whiteP04', 'whiteP05', 'whiteP06', 'whiteP07', 'whiteP08'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsWhiteMenu.appendTo(themePresetsMenu);

		// * BLACK THEME PRESETS * //
		const themePresetsBlackMenu = new Menu('黑色');
		themePresetsBlackMenu.addRadioItems(['斜面', '融合', '融合备选', '融合备选 2', '黑重生', '黑重生融合', '深灰', '深灰融合', '深灰 2 融合', '极简'], grSet.preset,
			['blackP01', 'blackP02', 'blackP03', 'blackP04', 'blackP05', 'blackP06', 'blackP07', 'blackP08', 'blackP09', 'blackP10'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsBlackMenu.appendTo(themePresetsMenu);

		// * REBORN THEME PRESETS * //
		const themePresetsRebornMenu = new Menu('重生');
		themePresetsRebornMenu.addRadioItems(['斜面', '融合', '融合 2', '渐变', '渐变 2', '极简', '极简融合'], grSet.preset,
			['rebornP01', 'rebornP02', 'rebornP03', 'rebornP04', 'rebornP05', 'rebornP06', 'rebornP07'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsRebornMenu.addSeparator();
		themePresetsRebornMenu.addRadioItems(['重生白斜面', '重生白融合', '重生白融合 2'], grSet.preset,
			['rebornP08', 'rebornP09', 'rebornP10'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsRebornMenu.addSeparator();
		themePresetsRebornMenu.addRadioItems(['重生黑斜面', '重生黑融合', '重生黑融合 2', '重生黑渐变', '重生黑渐变 2'], grSet.preset,
			['rebornP11', 'rebornP12', 'rebornP13', 'rebornP14', 'rebornP15'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsRebornMenu.addSeparator();
		themePresetsRebornMenu.addRadioItems(['重生混合斜面', '重生混合融合', '重生混合融合 2', '重生混合渐变', '重生混合渐变 2'], grSet.preset,
			['rebornP16', 'rebornP17', 'rebornP18', 'rebornP19', 'rebornP20'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsRebornMenu.addSeparator();
		themePresetsRebornMenu.addRadioItems(['重生混合 2 斜面', '重生混合 2 融合', '重生混合 2 融合 2', '重生混合 2 渐变', '重生混合 2 渐变 2'], grSet.preset,
			['rebornP21', 'rebornP22', 'rebornP23', 'rebornP24', 'rebornP25'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsRebornMenu.addSeparator();
		themePresetsRebornMenu.addRadioItems(['重生混合突出斜面', '重生混合突出融合', '重生混合突出融合 2', '重生混合突出渐变', '重生混合突出渐变 2'], grSet.preset,
			['rebornP26', 'rebornP27', 'rebornP28', 'rebornP29', 'rebornP30'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsRebornMenu.appendTo(themePresetsMenu);

		// * RANDOM THEME PRESETS * //
		const themePresetsRandomMenu = new Menu('随机');
		themePresetsRandomMenu.addRadioItems(['斜面融合备选', '斜面融合浅色', '斜面融合深色', '斜面融合自动深色', '斜面自动深色', '斜面深色', '渐变', '渐变 2', '极简', '极简融合'], grSet.preset,
			['randomP01', 'randomP02', 'randomP03', 'randomP04', 'randomP05', 'randomP06', 'randomP07', 'randomP08', 'randomP09', 'randomP10'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsRandomMenu.appendTo(themePresetsMenu);
		themePresetsMenu.addSeparator();

		// * BLUE THEME PRESETS * //
		const themePresetsBlueMenu = new Menu('蓝色');
		themePresetsBlueMenu.addRadioItems(['斜面', '斜面 2', '渐变', '渐变 2', '极简'], grSet.preset,
			['blueP01', 'blueP02', 'blueP03', 'blueP04', 'blueP05'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsBlueMenu.appendTo(themePresetsMenu);

		// * DARK BLUE THEME PRESETS * //
		const themePresetsDarkblueMenu = new Menu('深蓝');
		themePresetsDarkblueMenu.addRadioItems(['斜面', '斜面 2', '渐变', '渐变 2', '极简'], grSet.preset,
			['darkblueP01', 'darkblueP02', 'darkblueP03', 'darkblueP04', 'darkblueP05'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsDarkblueMenu.appendTo(themePresetsMenu);

		// * RED THEME PRESETS * //
		const themePresetsRedMenu = new Menu('红色');
		themePresetsRedMenu.addRadioItems(['斜面', '斜面 2', '渐变', '渐变 2', '极简'], grSet.preset,
			['redP01', 'redP02', 'redP03', 'redP04', 'redP05'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsRedMenu.appendTo(themePresetsMenu);

		// * CREAM THEME PRESETS * //
		const themePresetsCreamMenu = new Menu('奶油');
		themePresetsCreamMenu.addRadioItems(['斜面', '斜面 2', '备选', '备选 2', '极简'], grSet.preset,
			['creamP01', 'creamP02', 'creamP03', 'creamP04', 'creamP05'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsCreamMenu.appendTo(themePresetsMenu);
		themePresetsMenu.addSeparator();

		// * NEON BLUE THEME PRESETS * //
		const themePresetsNblueMenu = new Menu('荧光蓝');
		themePresetsNblueMenu.addRadioItems(['斜面', '斜面 2', '融合', '融合 2', '备选', '备选 2', '深灰', '深灰融合', '深灰 2 融合', '极简'], grSet.preset,
			['nblueP01', 'nblueP02', 'nblueP03', 'nblueP04', 'nblueP05', 'nblueP06', 'nblueP07', 'nblueP08', 'nblueP09', 'nblueP10'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsNblueMenu.appendTo(themePresetsMenu);

		// * NEON GREEN THEME PRESETS * //
		const themePresetsNgreenMenu = new Menu('荧光绿');
		themePresetsNgreenMenu.addRadioItems(['斜面', '斜面 2', '融合', '融合 2', '备选', '备选 2', '深灰', '深灰融合', '深灰 2 融合', '极简'], grSet.preset,
			['ngreenP01', 'ngreenP02', 'ngreenP03', 'ngreenP04', 'ngreenP05', 'ngreenP06', 'ngreenP07', 'ngreenP08', 'ngreenP09', 'ngreenP10'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsNgreenMenu.appendTo(themePresetsMenu);

		// * NEON RED THEME PRESETS * //
		const themePresetsNredMenu = new Menu('荧光红');
		themePresetsNredMenu.addRadioItems(['斜面', '斜面 2', '融合', '融合 2', '备选', '备选 2', '深灰', '深灰融合', '深灰 2 融合', '极简'], grSet.preset,
			['nredP01', 'nredP02', 'nredP03', 'nredP04', 'nredP05', 'nredP06', 'nredP07', 'nredP08', 'nredP09', 'nredP10'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsNredMenu.appendTo(themePresetsMenu);

		// * NEON GOLD THEME PRESETS * //
		const themePresetsNgoldMenu = new Menu('荧光金');
		themePresetsNgoldMenu.addRadioItems(['斜面', '斜面 2', '融合', '融合 2', '备选', '备选 2', '深灰', '深灰融合', '深灰 2 融合', '极简'], grSet.preset,
			['ngoldP01', 'ngoldP02', 'ngoldP03', 'ngoldP04', 'ngoldP05', 'ngoldP06', 'ngoldP07', 'ngoldP08', 'ngoldP09', 'ngoldP10'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsNgoldMenu.appendTo(themePresetsMenu);
		themePresetsMenu.addSeparator();

		// * CUSTOM THEME PRESETS * //
		const themePresetsCustomMenu = new Menu('自定义');
		themePresetsCustomMenu.addRadioItems(['斜面', '斜面 2', '融合', '融合 2', '渐变', '渐变 2', '备选', '备选 2', '极简', '极简融合'], grSet.preset,
			['customP01', 'customP02', 'customP03', 'customP04', 'customP05', 'customP06', 'customP07', 'customP08', 'customP09', 'customP10'], (preset) => {
			applyThemePreset(preset);
		});
		themePresetsCustomMenu.appendTo(themePresetsMenu);
		themePresetsMenu.addSeparator();

		// * CUSTOM USER THEME PRESET * //
		const themePresetUserMenu = new Menu('用户预设');
		themePresetUserMenu.addRadioItems(['用户设置'], grSet.preset, ['user'], (preset) => {
			applyThemePreset(preset);
			grm.ui.validateStyle(true);
		});
		themePresetUserMenu.appendTo(themePresetsMenu);
		themePresetsMenu.addSeparator();

		// * THEME PRESET SELECT MODE * //
		presetSelectMode();
		themePresetSelectModeMenu.appendTo(themePresetsMenu);

		// * THEME PRESET SELECTION * //
		const themePresetSelectMenu = new Menu('选择预设');
		themePresetSelectMenu.addItem('全部激活', false, () => {
			grm.ui.setThemePresetSelection(true);
		});
		themePresetSelectMenu.addSeparator();
		themePresetSelectMenu.addItem('全部停用', false, () => {
			grm.ui.setThemePresetSelection(false);
		});
		themePresetSelectMenu.addSeparator();
		themePresetSelectMenu.addToggleItem('白色',  grSet, 'presetSelectWhite');
		themePresetSelectMenu.addToggleItem('黑色',  grSet, 'presetSelectBlack');
		themePresetSelectMenu.addToggleItem('重生', grSet, 'presetSelectReborn');
		themePresetSelectMenu.addToggleItem('随机', grSet, 'presetSelectRandom');
		themePresetSelectMenu.addSeparator();
		themePresetSelectMenu.addToggleItem('蓝色', grSet, 'presetSelectBlue');
		themePresetSelectMenu.addToggleItem('深蓝', grSet, 'presetSelectDarkblue');
		themePresetSelectMenu.addToggleItem('红色', grSet, 'presetSelectRed');
		themePresetSelectMenu.addToggleItem('奶油', grSet, 'presetSelectCream');
		themePresetSelectMenu.addSeparator();
		themePresetSelectMenu.addToggleItem('荧光蓝', grSet, 'presetSelectNblue');
		themePresetSelectMenu.addToggleItem('荧光绿', grSet, 'presetSelectNgreen');
		themePresetSelectMenu.addToggleItem('荧光红', grSet, 'presetSelectNred');
		themePresetSelectMenu.addToggleItem('荧光金', grSet, 'presetSelectNgold');
		themePresetSelectMenu.addSeparator();
		themePresetSelectMenu.addToggleItem('自定义', grSet, 'presetSelectCustom');
		themePresetSelectMenu.appendTo(themePresetsMenu, grSet.presetSelectMode === 'theme');

		const themePresetAutoRandomModeMenu = new Menu('自动随机');
		themePresetAutoRandomModeMenu.addRadioItems([' 停用', '  5 秒', '10 秒', '15 秒', '30 秒', '  1 分', '  5 分', '10 分', '15 分', '30 分', '60 分', '新音轨', '新专辑', '双击'],
			grSet.presetAutoRandomMode, ['off', 5000, 10000, 15000, 30000, 60000, 300000, 600000, 900000, 1800000, 3600000, 'track', 'album', 'dblclick'], (timer) => {
			grSet.presetAutoRandomMode = timer;
			if (!['off', 'track', 'album', 'dblclick'].includes(timer)) {
				grm.preset.generateRandomThemePreset();
			} else {
				grm.ui.clearTimer('presetAutoRandomMode');
			}
		}, grSet.presetSelectMode === 'harmonic');
		themePresetAutoRandomModeMenu.appendTo(themePresetsMenu);
		themePresetsMenu.addSeparator();
		themePresetsMenu.addToggleItem('指示器', grSet, 'presetIndicator');
		themePresetsMenu.addItem('信息', false, () => { grm.preset.initThemePresetState(true); });

		themePresetsMenu.appendTo(menu);
	}
	// #endregion

	// * COLOR * //
	// #region COLOR
	/**
	 * Top menu > Options > Color.
	 * @param {Menu} menu - Creates the Color menu via a new Menu instance.
	 * @protected
	 */
	colorOptions(menu) {
		const colorMenu = new Menu('颜色');
		const albumArtMenu = new Menu('专辑封面');

		albumArtMenu.createRadioSubMenu('提取', ['V1 旧 (K-means/RGB)', 'V2 新 (K-means++/Oklab)'], grSet.albumArtColorExtraction, [0, 1], (mode) => {
			grSet.albumArtColorExtraction = mode;
			window.Reload();
		});
		albumArtMenu.createRadioSubMenu('调色板', [
			'自动（算法选择颜色）',
			'单色   （同色系）',
			'邻近色（平滑色调漂移）',
			'分裂互补色（正对邻近色调）',
			'互补色      （正对色调）',
			'三色系      （均匀间隔色调）',
			'四色系      （正交色调）',
			'鲜明（高感知对比）',
			'随机（无固定顺序）'
		], grSet.albumArtColorPalette, [
			'auto', 'monochromatic', 'analogous', 'splitComplementary', 'complementary', 'triadic', 'tetradic', 'distinct', 'random'
		], (mode) => {
			grSet.albumArtColorPalette = mode;
			grm.ui.updateAlbumArtThemeColors();
		}, false, false, [0, 2, 6]);

		const albumArtSaturationMenu = new Menu('饱和度');
		albumArtSaturationMenu.addRadioItems([' 自动（护眼模式）'], grSet.albumArtColorSaturation, ['auto'], (value) => {
			const wasAuto = grSet.albumArtColorSaturation === 'auto';
			grSet.albumArtColorSaturation = value;
			if (grSet.styleRandomNeon || grSet.styleRandomPastel || grSet.styleRandomDark) {
				grSet.styleRandomNeon = false;
				grSet.styleRandomPastel = false;
				grSet.styleRandomDark = false;
				grm.ui.updateStyle();
				grm.msg.showPopupNotice('themeColors', 'styleRandomColorNoticeDisabled');
			}
			if (!wasAuto) {
				grm.msg.showPopupNotice('themeColors', 'albumArtColorSaturationEyeAutoEnabled');
			}
			grm.day.handleEyeProtectionMode(grSet.albumArtColorSaturationEyeSchedule);
		});
		albumArtSaturationMenu.addSeparator();

		const eyeTimeDefaults = ['0-24', '8-20', '18-8', '20-8', '22-8'];
		const eyeTimeLabels = eyeTimeDefaults.map(t => grm.day.formatEyeProtectionTimeRangeString(t));
		const eyeTimeCurrentVal = grSet.albumArtColorSaturationEyeSchedule || '0-24';
		const eyeTimeIsCustom = !eyeTimeDefaults.includes(eyeTimeCurrentVal);
		const eyeTimeValues = [...eyeTimeDefaults];

		if (eyeTimeIsCustom) {
			eyeTimeLabels.push(`自定义: ${grm.day.formatEyeProtectionTimeRangeString(eyeTimeCurrentVal)}`);
			eyeTimeValues.push(eyeTimeCurrentVal);
		}
		albumArtSaturationMenu.addToggleItem('夜间额外校正', grSet, 'albumArtColorSaturationEyeNightCor', () => {
			grm.msg.showPopupNotice('themeColors', grSet.albumArtColorSaturationEyeNightCor
				? 'albumArtColorSaturationEyeNightCorEnabled'
				: 'albumArtColorSaturationEyeNightCorDisabled'
			);
			grm.ui.updateAlbumArtSaturation();
		}, grSet.albumArtColorSaturation !== 'auto');
		albumArtSaturationMenu.addItem('设置护眼自定义时间范围', false, () => {
			grm.day.setEyeProtectionCustomTimeRange();
		}, grSet.albumArtColorSaturation !== 'auto');
		albumArtSaturationMenu.addSeparator();
		albumArtSaturationMenu.addRadioItems(eyeTimeLabels, eyeTimeCurrentVal, eyeTimeValues, (timeValue) => {
			grm.day.handleEyeProtectionMode(timeValue);
		}, grSet.albumArtColorSaturation !== 'auto');
		albumArtSaturationMenu.addSeparator();

		albumArtSaturationMenu.addRadioItems([
			'100% (完全饱和)',
			'  90% (非常微妙)',
			'  80% (微妙)',
			'  70% (少量)',
			'  60% (适度)',
			'  50% (中等)',
			'  40% (明显)',
			'  30% (强烈)',
			'  20% (非常强烈)',
			'  10% (接近静音)',
			'    0% (完全静音)'
		], grSet.albumArtColorSaturation, [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0], (value) => {
			grSet.albumArtColorSaturation = value;
			if (value < 100 && (grSet.styleRandomNeon || grSet.styleRandomPastel || grSet.styleRandomDark)) {
				grSet.styleRandomNeon = false;
				grSet.styleRandomPastel = false;
				grSet.styleRandomDark = false;
				grm.ui.updateStyle();
				grm.msg.showPopupNotice('themeColors', 'styleRandomColorNoticeDisabled');
			}
			if (!grSet.themeDayNightEnabled && grSet.design !== 'modern_day_night') {
				grm.day.stopTimer();
			}
			grm.ui.updateAlbumArtSaturation();
		});
		albumArtSaturationMenu.appendTo(albumArtMenu);
		albumArtMenu.appendTo(colorMenu);

		const chameleonMenu = new Menu('变色龙');
		chameleonMenu.addToggleItem('启用变色龙', grSet, 'chameleon', () => {
			if (grSet.chameleon) {
				const msg = grm.msg.getMessage('themeColors', 'chameleon');
				const msgFb = grm.msg.getMessage('themeColors', 'chameleon', true);
				grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
					if (confirmed) {
						grm.colorChameleon.initChameleonCycle();
					} else {
						grSet.chameleon = false;
						grm.colorChameleon.stopAll();
					}
				});
			}
			else {
				grm.colorChameleon.stopAll();
			}
		});
		chameleonMenu.addSeparator();
		chameleonMenu.createRadioSubMenu('模式', ['全部', '仅新专辑'], grSet.chameleonMode, ['full', 'newAlbumOnly'], (mode) => {
			grSet.chameleonMode = mode;
			grm.colorChameleon.initChameleonCycle();
			grm.msg.showPopupNotice('themeColors', `chameleonMode${CapitalizeString(mode)}`);
		}, !grSet.chameleon);
		chameleonMenu.addSeparator();
		chameleonMenu.createRadioSubMenu('循环颜色', [
			'所有颜色（逐步执行每个色调）',
			'单色   （逐步执行同色调）',
			'邻近色（顺时针漂移）',
			'分裂互补色（交替正对邻近）',
			'互补色      （交替正对色调）',
			'三色系      （逐步执行三色之一）',
			'四色系      （逐步执行四色之一）',
			'鲜明（跳到感知上的不同）',
			'随机（无固定顺序）'
		], grSet.chameleonCycleColor, [
			'all', 'monochromatic', 'analogous', 'splitComplementary', 'complementary', 'triadic', 'tetradic', 'distinct', 'random'
		], (color) => {
			grSet.chameleonCycleColor = color;
		}, !grSet.chameleon || grSet.chameleonMode !== 'full', false, [0, 2, 6]);
		chameleonMenu.createRadioSubMenu('循环时间', ['    5 秒', '  10 秒', '  15 秒', '  20 秒', '  30 秒', '  45 秒', '  60 秒', '  90 秒', '120 秒'], grSet.chameleonCycleTime, [5, 10, 15, 20, 30, 45, 60, 90, 120], (time) => {
			grSet.chameleonCycleTime = time;
			grm.colorChameleon.initChameleonCycle();
		}, !grSet.chameleon || grSet.chameleonMode !== 'full');
		chameleonMenu.addSeparator();
		chameleonMenu.createRadioSubMenu('持续时间', ['  100 毫秒', '  200 毫秒', '  300 毫秒', '  400 毫秒', '  500 毫秒', '  600 毫秒', '  700 毫秒', '  800 毫秒', '  900 毫秒', '1000 毫秒'],
			grSet.chameleonDuration, [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], (duration) => {
			grSet.chameleonDuration = duration;
		}, !grSet.chameleon);
		chameleonMenu.createRadioSubMenu('缓动', [
				'线性', '平滑步进', '平滑步进+', '正弦   淡入淡出', '三次方淡入淡出', '指数   淡出', '指数   淡入淡出', '回弹   淡出', '弹性   淡入淡出'
			], grSet.chameleonEasing, [
				'linear', 'smoothStep', 'smootherStep', 'easeInOutSine', 'easeInOutCubic', 'easeOutExpo', 'easeInOutExpo', 'easeOutBack', 'easeInOutElastic'
			], (easing) => {
			grSet.chameleonEasing = easing;
		}, !grSet.chameleon);
		chameleonMenu.addSeparator();
		chameleonMenu.createRadioSubMenu('刷新率', ['20 fps ~ 50 毫秒 (非常慢 CPU)', '25 fps ~ 40 毫秒', '30 fps ~ 33 毫秒', '45 fps ~ 22 毫秒', '60 fps ~ 17 毫秒 (默认)', '75 fps ~ 13 毫秒', '90 fps ~ 11 毫秒', '120 fps ~ 8 毫秒', '144 fps ~ 7 毫秒', '165 fps ~ 6 毫秒', '240 fps ~ 4 毫秒', '360 fps ~ 3 毫秒 (非常快 CPU)'],
			grSet.chameleonRefreshRate, [FPS._20, FPS._25, FPS._30, FPS._45, FPS._60, FPS._75, FPS._90, FPS._120, FPS._144, FPS._165, FPS._240, FPS._360], (rate) => {		
			grSet.chameleonRefreshRate = rate;
		}, !grSet.chameleon);
		chameleonMenu.createRadioSubMenu('位图更新率', ['60 fps (非常快 CPU)', '30 fps', '20 fps', '15 fps', '12 fps (默认)', '10 fps', ' 8 fps', ' 4 fps', ' 2 fps (非常慢 CPU)'], grSet.chameleonBitmapUpdateRate, [60, 30, 20, 15, 12, 10, 8, 4, 2], (rate) => {
			if (rate > 15) grm.msg.showPopupNotice('themeColors', 'chameleonBitmapHighRate');
			grSet.chameleonBitmapUpdateRate = rate;
		}, !grSet.chameleon);
		chameleonMenu.appendTo(colorMenu);

		colorMenu.appendTo(menu);
	}
	// #endregion

	// * DISPLAY * //
	// #region DISPLAY
	/**
	 * Top menu > Options > Display.
	 * @param {Menu} menu - Creates the Display menu via a new Menu instance.
	 * @protected
	 */
	displayOptions(menu) {
		const displayMenu = new Menu('显示');
		const resolutionMenu = new Menu('分辩率');
		resolutionMenu.addItem('自动-检测', false, () => { grm.display.autoDetectRes(); });
		resolutionMenu.addSeparator();
		resolutionMenu.addRadioItems(['4K', 'QHD', 'HD'], grSet.displayRes, ['4K', 'QHD', 'HD'], (res) => {
			grSet.displayRes = res;
			grm.display.checkResolutionMode();
			grm.display.updatePlayerSize('small', true);
		});
		resolutionMenu.appendTo(displayMenu);
		displayMenu.createRadioSubMenu('缩放', ['  50%', '  60%', '  70%', '  80%', '  90%', '100%', '110%', '120%', '130%', '140%', '150%'],
			grSet.displayScale, [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150], (scale) => {
			grSet.displayScale = scale;
			const size = grm.display.checkPlayerSize(grm.ui.ww, grm.ui.wh, grSet.layout, grSet.displayRes);
			grm.display.updatePlayerSize(size, true);
		});
		displayMenu.createRadioSubMenu('明度', ['   -50%', '   -40%', '   -30%', '   -25%', '   -20%', '   -15%', '   -10%', '     -5%', '默认', '     +5%', '   +10%', '   +15%', '   +20%', '   +25%', '   +30%', '   +40%', '   +50%'],
			grSet.themeBrightness, [-50, -40, -30, -25, -20, -15, -10, -5, 'default', 5, 10, 15, 20, 25, 30, 40, 50], (percent) => {
			this.applyThemeSetting('themeBrightness', percent);
			grm.ui.initThemeFull = true;
			grm.ui.initTheme();
		}, grSet.presetSelectMode === 'harmonic');

		displayMenu.appendTo(menu);
	}
	// #endregion

	// * LAYOUT * //
	// #region LAYOUT
	/**
	 * Top menu > Options > Layout.
	 * @param {Menu} menu - Creates the Layout menu via a new Menu instance.
	 * @protected
	 */
	layoutOptions(menu) {
		menu.createRadioSubMenu('布局', ['默认', '封面', '简单'], grSet.layout, ['default', 'artwork', 'compact'], (layout) => {
			grSet.layout = layout;
			if (grSet.layout === 'artwork') {
				grSet.showPanelOnStartup = 'cover';
			}
			if (!fb.IsPlaying) { // Update lower bar version string
				grm.ui.clearPlaybackState(true);
			}
			grm.ui.displayPanel(false, true);
			grm.display.updatePlayerSize('small');
		}, grSet.lockPlayerSize);
	}
	// #endregion

	// * PLAYER SIZE * //
	// #region PLAYER SIZE
	/**
	 * Top menu > Options > Player size.
	 * @param {Menu} menu - Creates the Player size menu via a new Menu instance.
	 * @protected
	 */
	playerSizeOptions(menu) {
		menu.createRadioSubMenu('大小', ['小', '常规', '大'], grSet.playerSize, ['small', 'normal', 'large'], (size) => {
			grSet.playerSize = size;
			grSet.displayScale = 100;
			grm.display.updatePlayerSize(grSet.playerSize);
		}, grSet.lockPlayerSize);
	}
	// #endregion

	// * FONT SIZE * //
	// #region FONT SIZE
	/**
	 * Top menu > Options > Font size.
	 * @param {Menu} menu - Creates the Font size menu via a new Menu instance.
	 * @protected
	 */
	fontSizeOptions(menu) {
		const changeFontSizeMenu = new Menu('字体大小');
		const mainFontSizeMenu = new Menu('主要');

		// * MAIN - TOP MENU * //
		mainFontSizeMenu.createRadioSubMenu('顶部菜单', ['  8 像素', '10 像素', '11 像素', HD_QHD_4K('12 像素（默认）', '12 像素'), '13 像素', HD_QHD_4K('14 像素', '14 像素（默认）'), '16 像素'], grSet.menuFontSize_layout, [8, 10, 11, 12, 13, 14, 16], (size) => {
			grm.display.setMenuFontSize(size);
		});

		// * MAIN - LOWER BAR * //
		mainFontSizeMenu.createRadioSubMenu('底栏', grSet.layout !== 'default' ? ['10 像素', '12 像素', '14 像素', HD_QHD_4K('16 像素（默认）', '16 像素'), HD_QHD_4K('18 像素', '18 像素（默认）'), '20 像素', '22 像素', '24 像素', '26 像素'] :
			['10 像素', '12 像素', '14 像素', '16 像素', HD_QHD_4K('18 像素（默认）', '18 像素'), HD_QHD_4K('20 像素', '20 像素（默认）'), '22 像素', '24 像素', '26 像素'], grSet.lowerBarFontSize_layout, [10, 12, 14, 16, 18, 20, 22, 24, 26], (size) => {
			grm.display.setLowerBarFontSize(size);
		});
		mainFontSizeMenu.appendTo(changeFontSizeMenu);

		// * MAIN - NOTIFICATION * //
		mainFontSizeMenu.createRadioSubMenu('提示', ['12 像素', '14 像素', '16 像素', HD_QHD_4K('18 像素（默认）', '18 像素'), HD_QHD_4K('20 像素', '20 像素（默认）'), '22 像素', '24 像素'], grSet.notificationFontSize_layout,
			[12, 14, 16, 18, 20, 22, 24], (size) => {
			grm.display.setNotificationFontSize(size);
		});

		// * MAIN - POPUP * //
		mainFontSizeMenu.createRadioSubMenu('弹窗', ['12 像素', '14 像素', HD_QHD_4K('16 像素（默认）', '16 像素'), HD_QHD_4K('18 像素', '18 像素（默认）'), '20 像素', '22 像素', '24 像素'], grSet.popupFontSize_layout,
			[12, 14, 16, 18, 20, 22, 24], (size) => {
			grm.display.setPopupFontSize(size);
		});

		// * MAIN - TOOLTIP * //
		mainFontSizeMenu.createRadioSubMenu('提示框', ['12 像素', '14 像素', HD_QHD_4K('16 像素（默认）', '16 像素'), HD_QHD_4K('18 像素', '18 像素（默认）'), '20 像素', '22 像素', '24 像素'], grSet.tooltipFontSize_layout,
			[12, 14, 16, 18, 20, 22, 24], (size) => {
			grm.display.setTooltipFontSize(size);
		});

		// * DETAILS - ARTIST * //
		const detailsFontSizeMenu = new Menu('详情');
		detailsFontSizeMenu.createRadioSubMenu('艺术家', ['10 像素', '11 像素', '12 像素', '13 像素', '14 像素', '15 像素', '16 像素', '17 像素', HD_QHD_4K('18 像素（默认）', '18 像素'), '19 像素', HD_QHD_4K('20 像素', '20 像素（默认）'), '22 像素', '24 像素', '26 像素', '28 像素', '30 像素', '32 像素'], grSet.gridArtistFontSize_layout,
			[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32], (size) => {
			grm.display.setGridArtistFontSize(size);
		});

		// * DETAILS - TITLE * //
		detailsFontSizeMenu.createRadioSubMenu('标题', ['10 像素', '11 像素', '12 像素', '13 像素', '14 像素', '15 像素', '16 像素', '17 像素', HD_QHD_4K('18 像素（默认）', '18 像素'), '19 像素', HD_QHD_4K('20 像素', '20 像素（默认）'), '22 像素', '24 像素', '26 像素', '28 像素', '30 像素', '32 像素'], grSet.gridTrackNumFontSize_layout && grSet.gridTitleFontSize_layout,
			[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32], (size) => {
			grm.display.setGridTitleFontSize(size);
		});

		// * DETAILS - ALBUM * //
		detailsFontSizeMenu.createRadioSubMenu('专辑', ['10 像素', '11 像素', '12 像素', '13 像素', '14 像素', '15 像素', '16 像素', '17 像素', HD_QHD_4K('18 像素（默认）', '18 像素'), '19 像素', HD_QHD_4K('20 像素', '20 像素（默认）'), '22 像素', '24 像素', '26 像素', '28 像素', '30 像素', '32 像素'], grSet.gridAlbumFontSize_layout,
			[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32], (size) => {
			grm.display.setGridAlbumFontSize(size);
		});

		// * DETAILS - TAG NAME * //
		detailsFontSizeMenu.createRadioSubMenu('标签名', ['10 像素', '11 像素', '12 像素', '13 像素', '14 像素', '15 像素', '16 像素', HD_QHD_4K('17 像素（默认）', '17 像素'), '18 像素', HD_QHD_4K('19 像素', '19 像素（默认）'), '20 像素', '22 像素', '24 像素', '26 像素', '28 像素', '30 像素', '32 像素'], grSet.gridKeyFontSize_layout,
			[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32], (size) => {
			grm.display.setGridTagKeyFontSize(size);
		});

		// * DETAILS - TAG VALUE * //
		detailsFontSizeMenu.createRadioSubMenu('标签值', ['10 像素', '11 像素', '12 像素', '13 像素', '14 像素', '15 像素', '16 像素', HD_QHD_4K('17 像素（默认）', '17 像素'), '18 像素', HD_QHD_4K('19 像素', '19 像素（默认）'), '20 像素', '22 像素', '24 像素', '26 像素', '28 像素', '30 像素', '32 像素'], grSet.gridValueFontSize_layout,
			[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32], (size) => {
			grm.display.setGridTagValueFontSize(size);
		});
		detailsFontSizeMenu.appendTo(changeFontSizeMenu);

		// * PLAYLIST * //
		changeFontSizeMenu.createRadioSubMenu('播放列表', grSet.layout === 'default' ?
			HD_QHD_4K(['-1', '10 像素', '12 像素', '13 像素', '14 像素', '15 像素（默认）', '16 像素', '18 像素', '20 像素', '22 像素', '+1'], ['-1', '10 像素', '12 像素', '13 像素', '14 像素', '15 像素', '16 像素', '17 像素（默认）', '18 像素', '20 像素', '22 像素', '+1']) :
			HD_QHD_4K(['10 像素', '12 像素', '13 像素', '14 像素', '15 像素（默认）', '16 像素', '18 像素'], ['10 像素', '12 像素', '13 像素', '14 像素', '15 像素', '16 像素', '17 像素（默认）', '18 像素']),
			grSet.playlistHeaderFontSize_layout, grSet.layout === 'default' ?
			HD_QHD_4K([-1, 10, 12, 13, 14, 15, 16, 18, 20, 22, 1], [-1, 10, 12, 13, 14, 15, 16, 17, 18, 20, 22, 1]) :
			HD_QHD_4K([10, 12, 13, 14, 15, 16, 18], [10, 12, 13, 14, 15, 16, 17, 18]), (size) => {
			grm.display.setPlaylistFontSize(size);
		});

		// * LIBRARY * //
		changeFontSizeMenu.createRadioSubMenu('曲库', ['-1', '  8 像素', '10 像素', '11 像素', HD_QHD_4K('12 像素（默认）', '12 像素'), '13 像素', HD_QHD_4K('14 像素', '14 像素（默认）'), '16 像素', '18 像素', '+1'], grSet.libraryFontSize_layout,
			[-1, 8, 10, 11, 12, 13, 14, 16, 18, 1], (size) => {
			grm.display.setLibraryFontSize(size);
		});

		// * BIOGRAPHY * //
		const biographyFontSizeMenu = new Menu('简介');
		biographyFontSizeMenu.createRadioSubMenu('主要', ['-1', '  8 像素', '10 像素', '11 像素', HD_QHD_4K('12 像素（默认）', '12 像素'), '13 像素', HD_QHD_4K('14 像素', '14 像素（默认）'), '16 像素', '18 像素', '+1'], grSet.biographyFontSize_layout,
			[-1, 8, 10, 11, 12, 13, 14, 16, 18, 1], (size) => {
			grm.display.setBiographyFontSize(size);
		});
		biographyFontSizeMenu.createRadioSubMenu('歌词', ['-1', '10 像素', '12 像素', '14 像素', HD_QHD_4K('16 像素 (默认)', '16 像素'), HD_QHD_4K('18 像素', '18 像素 (默认)'), '20 像素', '22 像素', '24 像素', '26 像素', '28 像素', '30 像素', '+1'], grSet.biographyLyricsFontSize_layout,
			[-1, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 1], (size) => {
			grm.display.setBioLyricsFontSize(size);
		});
		biographyFontSizeMenu.appendTo(changeFontSizeMenu);

		// * LYRICS * //
		changeFontSizeMenu.createRadioSubMenu('歌词', ['-1', '10 像素', '12 像素', '14 像素', '16 像素', '18 像素', HD_QHD_4K('20 像素（默认）', '20 像素'), HD_QHD_4K('22 像素', '22 像素（默认）'), '24 像素', '26 像素', '28 像素', '30 像素', '+1'], grSet.lyricsFontSize_layout,
			[-1, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 1], (size) => {
			grm.display.setLyricsFontSize(size);
		});

		changeFontSizeMenu.appendTo(menu);
	}
	// #endregion

	// * PLAYER CONTROLS * //
	// #region PLAYER CONTROLS
	/**
	 * Top menu > Options > Player controls.
	 * @param {Menu} menu - Creates the Player controls menu via a new Menu instance.
	 * @protected
	 */
	playerControlsOptions(menu) {
		const playerControlsMenu = new Menu('播放控制');

		const playlistCallback = () => {
			grm.ui.setPlaylistSize();
			window.Repaint();
		};

		const updateButtons = () => {
			grm.ui.clearCache('metrics');
			grm.details.clearCache('metrics');
			grm.button.createButtons(grm.ui.ww, grm.ui.wh);
			window.Repaint();
		};

		const updateSeekbar = () => {
			grm.ui.setMainMetrics();
			window.Repaint();
		};

		// * TOP MENU * //
		const playerControlsTopMenu = new Menu('顶部菜单');
		const playerControlsTopMenuDefault = new Menu('默认');
		playerControlsTopMenuDefault.addToggleItem('详情', grSet, 'showPanelDetails_default', () => { updateButtons(); });
		playerControlsTopMenuDefault.addToggleItem('曲库', grSet, 'showPanelLibrary_default', () => { updateButtons(); });
		playerControlsTopMenuDefault.addToggleItem('简介', grSet, 'showPanelBiography_default', () => { updateButtons(); });
		playerControlsTopMenuDefault.addToggleItem('歌词', grSet, 'showPanelLyrics_default', () => { updateButtons(); });
		playerControlsTopMenuDefault.addToggleItem('评级', grSet, 'showPanelRating_default', () => { updateButtons(); });
		playerControlsTopMenuDefault.appendTo(playerControlsTopMenu);

		const playerControlsTopMenuArtwork = new Menu('封面');
		playerControlsTopMenuArtwork.addToggleItem('详情', grSet, 'showPanelDetails_artwork', () => { updateButtons(); });
		playerControlsTopMenuArtwork.addToggleItem('播放列表', grSet, 'showPanelPlaylist_artwork', () => { updateButtons(); });
		playerControlsTopMenuArtwork.addToggleItem('曲库', grSet, 'showPanelLibrary_artwork', () => { updateButtons(); });
		playerControlsTopMenuArtwork.addToggleItem('简介', grSet, 'showPanelBiography_artwork', () => { updateButtons(); });
		playerControlsTopMenuArtwork.addToggleItem('歌词', grSet, 'showPanelLyrics_artwork', () => { updateButtons(); });
		playerControlsTopMenuArtwork.addToggleItem('评级', grSet, 'showPanelRating_artwork', () => { updateButtons(); });
		playerControlsTopMenuArtwork.appendTo(playerControlsTopMenu);
		playerControlsTopMenu.addSeparator();

		playerControlsTopMenu.addRadioItems(['向左对齐', '居中对齐'], grSet.topMenuAlignment, ['left', 'center'], (align) => {
			grSet.topMenuAlignment = align;
			updateButtons();
		});
		playerControlsTopMenu.addSeparator();
		playerControlsTopMenu.addToggleItem('简化顶部菜单', grSet, 'topMenuCompact', () => {
			grSet.showTopMenuCompact = grSet.topMenuCompact;
			updateButtons();
		});
		playerControlsTopMenu.addToggleItem('简化顶部菜单（仅符号）', grSet, 'topMenuCompactSymbolOnly', () => {
			updateButtons();
		}, !grSet.topMenuCompact);
		playerControlsTopMenu.appendTo(playerControlsMenu);

		// * ALBUM ART * //
		if (grSet.layout !== 'compact') {
			const playerControlsAlbumArtMenu = new Menu('专辑封面');
			const playerControlsAlbumArtNotPropMenu = new Menu('播放器大小不按比例时');
			if (grSet.layout === 'default') {
				playerControlsAlbumArtNotPropMenu.addRadioItems(['封面靠左', '封面靠左 （边距）', '封面居中', '封面靠右'], grSet.albumArtAlign, ['left', 'leftMargin', 'center', 'right'], (pos) => {
					grSet.albumArtAlign = pos;
					grm.ui.loadAlbumArtFromList(grm.ui.albumArtIndex);
					grm.ui.resizeArtwork(true);
					grm.ui.setPlaylistSize();
					grm.ui.setLibrarySize();
					grm.ui.setBiographySize();
					window.Repaint();
				});
				playerControlsAlbumArtNotPropMenu.addSeparator();
			}
			playerControlsAlbumArtNotPropMenu.addRadioItems(['封面左侧背景', '封面完整背景', '封面无背景'], grSet.albumArtBg, ['left', 'full', 'none'], (type) => {
				grSet.albumArtBg = type;
				window.Repaint();
			});
			playerControlsAlbumArtNotPropMenu.appendTo(playerControlsAlbumArtMenu);
			const playerControlsAlbumArtScaleMenu = new Menu('播放器最大化 / 全屏时');
			if (grSet.layout === 'default') {
				playerControlsAlbumArtScaleMenu.addRadioItems(['缩放封面 裁剪', '缩放封面 拉伸', '缩放封面 比例'], grSet.albumArtScale, ['cropped', 'stretched', 'proportional'], (scale) => {
					grSet.albumArtScale = scale;
					grm.ui.fetchNewArtwork(grm.ui.initMetadb());
					window.Repaint();
				});
				playerControlsAlbumArtScaleMenu.addSeparator();
				playerControlsAlbumArtScaleMenu.addRadioItems([
				    '裁剪和拉伸 - 始终',
				    '裁剪和拉伸 - 限制高宽比 1.25x',
				    '裁剪和拉伸 - 限制高宽比 1.50x',
				    '裁剪和拉伸 - 限制高宽比 1.75x',
				    '裁剪和拉伸 - 限制高宽比 2.00x'
				], grSet.albumArtAspectRatioLimit, [false, 1.25, 1.5, 1.75, 2], (factor) => {
					grSet.albumArtAspectRatioLimit = factor;
					grm.ui.fetchNewArtwork(grm.ui.initMetadb());
					window.Repaint();
				});
				playerControlsAlbumArtScaleMenu.appendTo(playerControlsAlbumArtMenu);
			}
			playerControlsAlbumArtMenu.addSeparator();
			const cycleAlbumArtMenu = new Menu('循环专辑图片');
			cycleAlbumArtMenu.addToggleItem('启用', grSet, 'albumArtCycle', () => {
				if (!grSet.albumArtCycle) {
					grm.ui.clearTimer('albumArt');
				} else {
					grm.ui.displayAlbumArtImage('next', true);
				}
			});
			cycleAlbumArtMenu.addToggleItem('使用滚轮循环', grSet, 'albumArtCycleMouseWheel');
			cycleAlbumArtMenu.addSeparator();
			cycleAlbumArtMenu.createRadioSubMenu('循环时间', ['  5 秒', '10 秒', '15 秒（默认）', '30 秒', '60 秒'], grSet.albumArtCycleTime, [5, 10, 15, 30, 60], (time) => {
				grSet.albumArtCycleTime = time;
				window.Repaint();
			});
			cycleAlbumArtMenu.appendTo(playerControlsAlbumArtMenu);
			playerControlsAlbumArtMenu.addSeparator();
			playerControlsAlbumArtMenu.addToggleItem('过滤专辑图片', grSet, 'filterAlbumArt', () => {
				window.Reload();
			});
			playerControlsAlbumArtMenu.addToggleItem('优先加载内嵌专辑封面', grSet, 'loadEmbeddedAlbumArtFirst', () => {
				const msg = grm.msg.getMessage('menu', 'loadEmbeddedAlbumArtFirst');
				const msgFb = grm.msg.getMessage('menu', 'loadEmbeddedAlbumArtFirst', true);
				grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
					if (!confirmed) grSet.loadEmbeddedAlbumArtFirst = false;
				});
				window.Reload();
			});
			playerControlsAlbumArtMenu.addSeparator();

			const showHiResAudioLogoMenu = new Menu('封面显示 hi-res 徽章');
			showHiResAudioLogoMenu.addToggleItem('启用', grSet, 'showHiResAudioBadge', () => { window.Repaint(); });
			showHiResAudioLogoMenu.addSeparator();
			showHiResAudioLogoMenu.addToggleItem('圆形', grSet, 'hiResAudioBadgeRound', () => { window.Repaint(); }, !grSet.showHiResAudioBadge);
			showHiResAudioLogoMenu.addSeparator();
			showHiResAudioLogoMenu.addRadioItems(['小', '常规', '大'], grSet.hiResAudioBadgeSize, ['small', 'normal', 'large'], (size) => {
				grSet.hiResAudioBadgeSize = size;
				window.Repaint();
			}, !grSet.showHiResAudioBadge);
			showHiResAudioLogoMenu.addSeparator();
			showHiResAudioLogoMenu.addRadioItems(['左上', '右上', '左下', '右下'], grSet.hiResAudioBadgePos, ['topleft', 'topright', 'bottomleft', 'bottomright'], (pos) => {
				grSet.hiResAudioBadgePos = pos;
				window.Repaint();
			}, !grSet.showHiResAudioBadge);
			showHiResAudioLogoMenu.appendTo(playerControlsAlbumArtMenu);
			playerControlsAlbumArtMenu.addToggleItem('封面显示暂停', grSet, 'showPause', () => { window.Repaint(); });
			playerControlsAlbumArtMenu.appendTo(playerControlsMenu);
		}

		// * JUMP SEARCH * //
		const playerControlsJumpSearchMenu = new Menu('跳转搜索');
		playerControlsJumpSearchMenu.addToggleItem('搜索查询播放列表包括曲库', grSet, 'jumpSearchIncludeLibrary');
		playerControlsJumpSearchMenu.addToggleItem('搜索查询曲库包括播放列表', grSet, 'jumpSearchIncludePlaylist');
		playerControlsJumpSearchMenu.addSeparator();
		playerControlsJumpSearchMenu.addToggleItem('搜索查询仅作曲家', grSet, 'jumpSearchComposerOnly');
		playerControlsJumpSearchMenu.addSeparator();
		playerControlsJumpSearchMenu.addToggleItem('禁用跳转搜索', grSet, 'jumpSearchDisabled');
		playerControlsJumpSearchMenu.appendTo(playerControlsMenu);

		// * SCROLLBAR * //
		const playerControlsScrollbarMenu = new Menu('滚动条');
		const playerControlsScrollbarPlaylistMenu = new Menu('播放列表');
		const playerControlsScrollbarPlaylistStepsMenu = new Menu('鼠标滚轮滚动');
		playerControlsScrollbarPlaylistStepsMenu.addRadioItems(['  1 行', '  2 行', '  3 行 （默认）', '  4 行', '  5 行', '  6 行', '  7 行', '  8 行', '  9 行', '10 行'], grSet.playlistWheelScrollSteps, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (steps) => {
			grSet.playlistWheelScrollSteps = steps;
			playlistCallback();
		});
		playerControlsScrollbarPlaylistStepsMenu.appendTo(playerControlsScrollbarPlaylistMenu);
		const playerControlsScrollbarPlaylistDurationMenu = new Menu('鼠标滚轮滚动平滑持续时间');
		playerControlsScrollbarPlaylistDurationMenu.addRadioItems(['  100 毫秒', '  200 毫秒', '  300 毫秒 （默认）', '  400 毫秒', '  500 毫秒', '  600 毫秒', '  700 毫秒', '  800 毫秒', '  900 毫秒', '1000 毫秒'], grSet.playlistWheelScrollDuration, [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], (duration) => {
			grSet.playlistWheelScrollDuration = duration;
			playlistCallback();
		});
		playerControlsScrollbarPlaylistDurationMenu.appendTo(playerControlsScrollbarPlaylistMenu);
		playerControlsScrollbarPlaylistMenu.addSeparator();
		playerControlsScrollbarPlaylistMenu.addToggleItem('自动-滚动到当前播放歌曲', grSet, 'playlistAutoScrollNowPlaying');
		playerControlsScrollbarPlaylistMenu.addToggleItem('自动-滚动播放列表曲库选择时（仅限曲库拆分布局）', grSet, 'playlistAutoScrollSelectLibrary', () => {
			if (!grSet.playlistAutoScrollSelectLibrary) {
				window.Repaint();
				return;
			}
			const msg = grm.msg.getMessage('menu', 'playlistAutoScrollSelectLibrary');
			const msgFb = grm.msg.getMessage('menu', 'playlistAutoScrollSelectLibrary', true);
			grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
				grSet.playlistAutoScrollSelectLibrary = confirmed;
				window.Repaint();
			});
		});
		playerControlsScrollbarPlaylistMenu.addToggleItem('自动-隐藏', grSet, 'playlistAutoHideScrollbar',  () => {
			plSet.show_scrollbar = !grSet.playlistAutoHideScrollbar;
			grm.ui.updatePlaylist();
		});
		playerControlsScrollbarPlaylistMenu.addToggleItem('平滑滚动', grSet, 'playlistSmoothScrolling');
		playerControlsScrollbarPlaylistMenu.appendTo(playerControlsScrollbarMenu);

		const playerControlsScrollbarLibraryMenu = new Menu('曲库');
		const playerControlsScrollbarLibraryStepsMenu = new Menu('鼠标滚轮滚动');
		playerControlsScrollbarLibraryStepsMenu.addRadioItems(['  1 行', '  2 行', '  3 行 （默认）', '  4 行', '  5 行', '  6 行', '  7 行', '  8 行', '  9 行', '10 行'], libSet.scrollStep, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (steps) => {
			libSet.scrollStep = steps;
			lib.panel.updateProp(1);
		});
		playerControlsScrollbarLibraryStepsMenu.appendTo(playerControlsScrollbarLibraryMenu);
		const playerControlsScrollbarLibraryDurationMenu = new Menu('鼠标滚轮滚动平滑持续时间');
		playerControlsScrollbarLibraryDurationMenu.addRadioItems(['  100 毫秒', '  200 毫秒', '  300 毫秒', '  400 毫秒', '  500 毫秒 （默认）', '  600 毫秒', '  700 毫秒', '  800 毫秒', '  900 毫秒', '1000 毫秒'], libSet.durationScroll, [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], (duration) => {
			libSet.durationScroll = duration;
			lib.panel.updateProp(1);
		});
		playerControlsScrollbarLibraryDurationMenu.appendTo(playerControlsScrollbarLibraryMenu);
		playerControlsScrollbarLibraryMenu.addSeparator();
		playerControlsScrollbarLibraryMenu.addToggleItem('自动-滚动到当前播放歌曲', grSet, 'libraryAutoScrollNowPlaying');
		playerControlsScrollbarLibraryMenu.addToggleItem('自动-滚动曲库播放列表选择时（仅限曲库拆分布局）', grSet, 'libraryAutoScrollSelectPlaylist', () => {
			if (!grSet.libraryAutoScrollSelectPlaylist) {
				window.Repaint();
				return;
			}
			const msg = grm.msg.getMessage('menu', 'libraryAutoScrollSelectPlaylist');
			const msgFb = grm.msg.getMessage('menu', 'libraryAutoScrollSelectPlaylist', true);
			grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
				grSet.libraryAutoScrollSelectPlaylist = confirmed;
				window.Repaint();
			});
		});
		playerControlsScrollbarLibraryMenu.addToggleItem('自动-隐藏', grSet, 'libraryAutoHideScrollbar', () => {
			libSet.sbarShow = grSet.libraryAutoHideScrollbar ? 1 : 2;
			grm.ui.setLibrarySize();
		});
		playerControlsScrollbarLibraryMenu.addToggleItem('平滑滚动', libSet, 'smooth');
		playerControlsScrollbarLibraryMenu.appendTo(playerControlsScrollbarMenu);

		const playerControlsBiographyMenu = new Menu('简介');
		const playerControlsScrollbarBiographyStepsMenu = new Menu('鼠标滚轮滚动');
		playerControlsScrollbarBiographyStepsMenu.addRadioItems(['  1 行', '  2 行', '  3 行 （默认）', '  4 行', '  5 行', '  6 行', '  7 行', '  8 行', '  9 行', '10 行'], bioSet.scrollStep, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (steps) => {
			bioSet.scrollStep = steps;
			bio.ui.updateProp(1);
		});
		playerControlsScrollbarBiographyStepsMenu.appendTo(playerControlsBiographyMenu);
		const playerControlsScrollbarBiographyDurationMenu = new Menu('鼠标滚轮滚动平滑持续时间');
		playerControlsScrollbarBiographyDurationMenu.addRadioItems(['  100 毫秒', '  200 毫秒', '  300 毫秒', '  400 毫秒', '  500 毫秒 （默认）', '  600 毫秒', '  700 毫秒', '  800 毫秒', '  900 毫秒', '1000 毫秒'], bioSet.durationScroll, [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], (duration) => {
			bioSet.durationScroll = duration;
			bio.ui.updateProp(1);
		});
		playerControlsScrollbarBiographyDurationMenu.appendTo(playerControlsBiographyMenu);
		playerControlsBiographyMenu.addSeparator();
		playerControlsBiographyMenu.addToggleItem('自动-隐藏', grSet, 'biographyAutoHideScrollbar', () => {
			if (grSet.biographyAutoHideScrollbar) {
				bioSet.sbarShow = 1;
				bio.but.setScrollBtnsHide();
			} else {
				bioSet.sbarShow = 2;
				bio.but.setScrollBtnsHide(false, 'both');
			}
			bio.ui.updateProp(1);
		});
		playerControlsBiographyMenu.addToggleItem('平滑滚动', bioSet, 'smooth');
		playerControlsBiographyMenu.appendTo(playerControlsScrollbarMenu);
		playerControlsScrollbarMenu.appendTo(playerControlsMenu);

		// * TOOLTIP * //
		const playerControlsToolTipMenu = new Menu('提示框');
		playerControlsToolTipMenu.addToggleItem('显示缩略文本提示', grSet, 'showTooltipTruncated');
		playerControlsToolTipMenu.addSeparator();
		playerControlsToolTipMenu.addToggleItem('显示时间线提示', grSet, 'showTooltipTimeline');
		playerControlsToolTipMenu.addSeparator();
		const playerControlsVolumeToolTipMenu = new Menu('显示音量提示');
		playerControlsVolumeToolTipMenu.addToggleItem('启用', grSet, 'showTooltipVolume');
		playerControlsVolumeToolTipMenu.addSeparator();
		playerControlsVolumeToolTipMenu.addToggleItem('以百分比显示音量提示', grSet, 'showTooltipVolumeInPercent');
		playerControlsVolumeToolTipMenu.appendTo(playerControlsToolTipMenu);
		playerControlsToolTipMenu.addSeparator();
		playerControlsToolTipMenu.addToggleItem('显示主要提示', grSet, 'showTooltipMain');
		playerControlsToolTipMenu.addToggleItem('显示曲库提示', grSet, 'showTooltipLibrary', () => {
			lib.but.tooltipLib.show = grSet.showTooltipLibrary || grSet.showTooltipTruncated;
			grm.ui.setLibrarySize();
		});
		playerControlsToolTipMenu.addToggleItem('显示简介提示', grSet, 'showTooltipBiography', () => {
			bio.but.tooltipBio.show = grSet.showTooltipBiography || grSet.showTooltipTruncated;
			grm.ui.setBiographySize();
		});
		playerControlsToolTipMenu.addSeparator();
		playerControlsToolTipMenu.addToggleItem('显示提示框样式', grSet, 'showStyledTooltips');
		playerControlsToolTipMenu.appendTo(playerControlsMenu);

		// * PANEL MENU * //
		const playerControlsPanelMenu = new Menu('面板');
		const playerControlsPanelModeMenu = new Menu('模式');
		playerControlsPanelModeMenu.addToggleItem('自动面板宽度', grSet, 'panelWidthAuto', () => {
			grSet.albumArtAlign = grSet.panelWidthAuto ? 'left' : 'right';
			grm.ui.resizeArtwork(true);
			grm.ui.setPlaylistSize();
			grm.ui.setLibrarySize();
			grm.ui.setBiographySize();
			if (grm.ui.displayCustomThemeMenu) grm.cthMenu.reinitCustomThemeMenu();
			window.Repaint();
		});
		playerControlsPanelModeMenu.addToggleItem('浏览模式', grSet, 'panelBrowseMode', () => {
			grm.ui.initBrowserModeState();
		});
		playerControlsPanelModeMenu.appendTo(playerControlsPanelMenu);
		playerControlsPanelMenu.addSeparator();
		if (grSet.layout !== 'compact') {
			const showPanelOnStartupMenu = new Menu('启动时显示面板');
			showPanelOnStartupMenu.addRadioItems(grSet.layout === 'artwork' ? ['封面', '播放列表', '详情', '曲库', '简介', '歌词'] : ['播放列表', '详情', '曲库', '简介', '歌词'],
			grSet.showPanelOnStartup, grSet.layout === 'artwork' ? ['cover', 'playlist', 'details', 'library', 'biography', 'lyrics'] : ['playlist', 'details', 'library', 'biography', 'lyrics'], (panel) => {
				grSet.showPanelOnStartup = panel;
				window.Reload();
			});
			showPanelOnStartupMenu.appendTo(playerControlsPanelMenu);
		}
		playerControlsPanelMenu.addToggleItem('启动时显示标识', grSet, 'showPreloaderLogo', () => { window.Repaint(); });
		playerControlsPanelMenu.addToggleItem('显示网页链接（上下文菜单）', grSet, 'showWeblinks');
		playerControlsPanelMenu.addSeparator();
		playerControlsPanelMenu.addToggleItem('播放停止时返回主页', grSet, 'returnToHomeOnPlaybackStop');
		playerControlsPanelMenu.addToggleItem('添加歌曲时切换到播放列表', grSet, 'addTracksPlaylistSwitch');
		playerControlsPanelMenu.addSeparator();
		playerControlsPanelMenu.addToggleItem('显示面板所有阴影', grSet, 'enableShadows', () => { window.Repaint(); });
		playerControlsPanelMenu.addToggleItem('隐藏面板中间阴影', grSet, 'hideMiddlePanelShadow', () => { window.Repaint(); });
		playerControlsPanelMenu.addToggleItem('显示旋转碟片阴影', grSet, 'enableDiscArtShadows', () => { window.Reload(); });
		playerControlsPanelMenu.addSeparator();
		playerControlsPanelMenu.addToggleItem('锁定播放器大小', grSet, 'lockPlayerSize', () => { UIWizard.DisableWindowSizing = true; });
		playerControlsPanelMenu.appendTo(playerControlsMenu);

		// * LOWER BAR MENU * //
		const playerControlsLowerBarMenu = new Menu('底栏');
		// * TRANSPORT BUTTON SIZE * //
		const transportSizeMenu = new Menu('通用按钮大小');
		const transportSizeMenuDefault = new Menu('默认');
		transportSizeMenuDefault.addRadioItems(['28 像素', '30 像素', HD_QHD_4K('32 像素（默认）', '32 像素'), HD_QHD_4K('34 像素', '34 像素（默认）'), '36 像素', '38 像素', '40 像素', '42 像素'], grSet.transportButtonSize_default, [28, 30, 32, 34, 36, 38, 40, 42], (size) => {
			grm.display.setTransportBtnSize(size);
		});
		transportSizeMenuDefault.appendTo(transportSizeMenu);

		const transportSizeMenuArtwork = new Menu('封面');
		transportSizeMenuArtwork.addRadioItems(['28 像素', '30 像素', HD_QHD_4K('32 像素（默认）', '32 像素'), HD_QHD_4K('34 像素', '34 像素（默认）'), '36 像素'], grSet.transportButtonSize_artwork, [28, 30, 32, 34, 36], (size) => {
			grm.display.setTransportBtnSize(size);
		});
		transportSizeMenuArtwork.appendTo(transportSizeMenu);

		const transportSizeMenuCompact = new Menu('简单');
		transportSizeMenuCompact.addRadioItems(['28 像素', '30 像素', HD_QHD_4K('32 像素（默认）', '32 像素'), HD_QHD_4K('34 像素', '34 像素（默认）'), '36 像素'], grSet.transportButtonSize_compact, [28, 30, 32, 34, 36], (size) => {
			grm.display.setTransportBtnSize(size);
		});
		transportSizeMenuCompact.appendTo(transportSizeMenu);
		transportSizeMenu.appendTo(playerControlsLowerBarMenu);

		// * TRANSPORT BUTTON SPACING * //
		const transportSpacingMenu = new Menu('通用按钮间距');
		const transportSpacingMenuDefault = new Menu('默认');
		transportSpacingMenuDefault.addRadioItems(['-1', '3 像素', '5 像素（默认）', '7 像素', '10 像素', '15 像素', '+1'], grSet.transportButtonSpacing_default, [-1, 3, 5, 7, 10, 15, 1], (size) => {
			grm.display.setTransportBtnSpacing(size);
		});
		transportSpacingMenuDefault.appendTo(transportSpacingMenu);

		const transportSpacingMenuArtwork = new Menu('封面');
		transportSpacingMenuArtwork.addRadioItems(['-1', '3 像素', '5 像素（默认）', '7 像素', '10 像素', '15 像素', '+1'], grSet.transportButtonSpacing_artwork, [-1, 3, 5, 7, 10, 15, 1], (size) => {
			grm.display.setTransportBtnSpacing(size);
		});
		transportSpacingMenuArtwork.appendTo(transportSpacingMenu);

		const transportSpacingMenuCompact = new Menu('简单');
		transportSpacingMenuCompact.addRadioItems(['-1', '3 像素', '5 像素（默认）', '7 像素', '10 像素', '15 像素', '+1'], grSet.transportButtonSpacing_compact, [-1, 3, 5, 7, 10, 15, 1], (size) => {
			grm.display.setTransportBtnSpacing(size);
		});
		transportSpacingMenuCompact.appendTo(transportSpacingMenu);
		transportSpacingMenu.appendTo(playerControlsLowerBarMenu);
		playerControlsLowerBarMenu.addSeparator();

		// * SHOW TRANSPORT CONTROLS * //
		const transportControlsMenu = new Menu('显示通用控制');
		transportControlsMenu.addToggleItem('默认', grSet, 'showTransportControls_default', () => {
			updateButtons();
		});
		transportControlsMenu.addToggleItem('封面', grSet, 'showTransportControls_artwork', () => {
			updateButtons();
		});
		transportControlsMenu.addToggleItem('简单', grSet, 'showTransportControls_compact', () => {
			updateButtons();
		});
		transportControlsMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW PLAYBACK ORDER BUTTON * //
		const playbackOrderBtnMenu = new Menu('显示播放次序按钮');
		playbackOrderBtnMenu.addToggleItem('默认', grSet, 'showPlaybackOrderBtn_default', () => {
			updateButtons();
		}, !grSet.showTransportControls_default);
		playbackOrderBtnMenu.addToggleItem('封面', grSet, 'showPlaybackOrderBtn_artwork', () => {
			updateButtons();
		}, !grSet.showTransportControls_artwork);
		playbackOrderBtnMenu.addToggleItem('简单', grSet, 'showPlaybackOrderBtn_compact', () => {
			updateButtons();
		}, !grSet.showTransportControls_compact);
		playbackOrderBtnMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW RELOAD BUTTON * //
		const reloadBtnMenu = new Menu('显示重载按钮');
		reloadBtnMenu.addToggleItem('默认', grSet, 'showReloadBtn_default', () => {
			updateButtons();
		}, !grSet.showTransportControls_default);
		reloadBtnMenu.addToggleItem('封面', grSet, 'showReloadBtn_artwork', () => {
			updateButtons();
		}, !grSet.showTransportControls_artwork);
		reloadBtnMenu.addToggleItem('简单', grSet, 'showReloadBtn_compact', () => {
			updateButtons();
		}, !grSet.showTransportControls_compact);
		reloadBtnMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW ADD TRACKS BUTTON * //
		const addTrackBtnMenu = new Menu('显示收藏音轨按钮');
		addTrackBtnMenu.addToggleItem('默认', grSet, 'showAddTracksBtn_default', () => {
			updateButtons();
		}, !grSet.showTransportControls_default);
		addTrackBtnMenu.addToggleItem('封面', grSet, 'showAddTracksBtn_artwork', () => {
			updateButtons();
		}, !grSet.showTransportControls_artwork);
		addTrackBtnMenu.addToggleItem('简单', grSet, 'showAddTracksBtn_compact', () => {
			updateButtons();
		}, !grSet.showTransportControls_compact);
		addTrackBtnMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW VOLUME BUTTON * //
		const volumeBtnMenu = new Menu('显示音量按钮');
		volumeBtnMenu.addToggleItem('默认', grSet, 'showVolumeBtn_default', () => {
			updateButtons();
		}, !grSet.showTransportControls_default);
		volumeBtnMenu.addToggleItem('封面', grSet, 'showVolumeBtn_artwork', () => {
			updateButtons();
		}, !grSet.showTransportControls_artwork);
		volumeBtnMenu.addToggleItem('简单', grSet, 'showVolumeBtn_compact', () => {
			updateButtons();
		}, !grSet.showTransportControls_compact);
		volumeBtnMenu.addSeparator();
		volumeBtnMenu.addToggleItem('自动-隐藏音量条', grSet, 'autoHideVolumeBar', () => {
			grm.volBtn.toggleVolumeBar();
			updateButtons();
		});
		volumeBtnMenu.appendTo(playerControlsLowerBarMenu);
		playerControlsLowerBarMenu.addSeparator();

		// * SHOW PLAYBACK TIME IN LOWER BAR * //
		const playbackTimeMenu = new Menu('显示播放时间');
		playbackTimeMenu.addToggleItem('默认', grSet, 'showPlaybackTime_default', () => {
			updateButtons();
		});
		playbackTimeMenu.addToggleItem('封面', grSet, 'showPlaybackTime_artwork', () => {
			updateButtons();
		});
		playbackTimeMenu.addToggleItem('简单', grSet, 'showPlaybackTime_compact', () => {
			updateButtons();
		});
		playbackTimeMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW ARTIST IN LOWER BAR * //
		const showArtistMenu = new Menu('显示艺术家');
		showArtistMenu.addToggleItem('默认', grSet, 'showLowerBarArtist_default', () => { on_metadb_changed(); });
		showArtistMenu.addToggleItem('封面', grSet, 'showLowerBarArtist_artwork', () => { on_metadb_changed(); });
		showArtistMenu.addToggleItem('简单', grSet, 'showLowerBarArtist_compact', () => { on_metadb_changed(); });
		showArtistMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW TRACK NUMBER IN LOWER BAR * //
		const showTrackNumberMenu = new Menu('显示音轨号');
		showTrackNumberMenu.addToggleItem('默认', grSet, 'showLowerBarTrackNum_default', () => { on_metadb_changed(); });
		showTrackNumberMenu.addToggleItem('封面', grSet, 'showLowerBarTrackNum_artwork', () => { on_metadb_changed(); });
		showTrackNumberMenu.addToggleItem('简单', grSet, 'showLowerBarTrackNum_compact', () => { on_metadb_changed(); });
		showTrackNumberMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW TRACK TITLE IN LOWER BAR * //
		const showTitleMenu = new Menu('显示歌曲标题');
		showTitleMenu.addToggleItem('默认', grSet, 'showLowerBarTitle_default', () => { on_metadb_changed(); });
		showTitleMenu.addToggleItem('封面', grSet, 'showLowerBarTitle_artwork', () => { on_metadb_changed(); });
		showTitleMenu.addToggleItem('简单', grSet, 'showLowerBarTitle_compact', () => { on_metadb_changed(); });
		showTitleMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW COMPOSER IN LOWER BAR * //
		const showComposerMenu = new Menu('显示作曲者');
		showComposerMenu.addToggleItem('默认', grSet, 'showLowerBarComposer_default', () => { on_metadb_changed(); });
		showComposerMenu.addToggleItem('封面', grSet, 'showLowerBarComposer_artwork', () => { on_metadb_changed(); });
		showComposerMenu.addToggleItem('简单', grSet, 'showLowerBarComposer_compact', () => { on_metadb_changed(); });
		showComposerMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW ARTIST COUNTRY FLAGS IN LOWER BAR * //
		const showArtistFlagsMenu = new Menu('显示艺术家国家 / 地区旗帜');
		showArtistFlagsMenu.addToggleItem('默认', grSet, 'showLowerBarArtistFlags_default', () => { grm.ui.loadCountryFlags(); window.Repaint(); });
		showArtistFlagsMenu.addToggleItem('封面', grSet, 'showLowerBarArtistFlags_artwork', () => { grm.ui.loadCountryFlags(); window.Repaint(); });
		showArtistFlagsMenu.addToggleItem('简单', grSet, 'showLowerBarArtistFlags_compact', () => { grm.ui.loadCountryFlags(); window.Repaint(); });
		showArtistFlagsMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW SOFTWARE VERSION IN LOWER BAR * //
		const showSoftwareVersionMenu = new Menu('显示软件版本');
		showSoftwareVersionMenu.addToggleItem('默认', grSet, 'showLowerBarVersion_default', () => { grm.ui.clearLowerBarVersion(); });
		showSoftwareVersionMenu.addToggleItem('封面', grSet, 'showLowerBarVersion_artwork', () => { grm.ui.clearLowerBarVersion(); });
		showSoftwareVersionMenu.addToggleItem('简单', grSet, 'showLowerBarVersion_compact', () => { grm.ui.clearLowerBarVersion(); });
		showSoftwareVersionMenu.appendTo(playerControlsLowerBarMenu);
		playerControlsLowerBarMenu.addSeparator();

		// * SHOW PROGRESS BAR * //
		const progressBarMenu = new Menu('显示进度条');
		progressBarMenu.addToggleItem('默认', grSet, 'showProgressBar_default', () => { updateSeekbar(); });
		progressBarMenu.addToggleItem('封面', grSet, 'showProgressBar_artwork', () => { updateSeekbar(); });
		progressBarMenu.addToggleItem('简单', grSet, 'showProgressBar_compact', () => { updateSeekbar(); });
		progressBarMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW PEAKMETER BAR * //
		const peakmeterBarMenu = new Menu('显示峰值条');
		peakmeterBarMenu.addToggleItem('默认', grSet, 'showPeakmeterBar_default', () => { updateSeekbar(); });
		peakmeterBarMenu.addToggleItem('封面', grSet, 'showPeakmeterBar_artwork', () => { updateSeekbar(); });
		peakmeterBarMenu.addToggleItem('简单', grSet, 'showPeakmeterBar_compact', () => { updateSeekbar(); });
		peakmeterBarMenu.appendTo(playerControlsLowerBarMenu);

		// * SHOW WAVEFORM BAR * //
		const waveformBarMenu = new Menu('显示波形条');
		waveformBarMenu.addToggleItem('默认', grSet, 'showWaveformBar_default', () => { updateSeekbar(); });
		waveformBarMenu.addToggleItem('封面', grSet, 'showWaveformBar_artwork', () => { updateSeekbar(); });
		waveformBarMenu.addToggleItem('简单', grSet, 'showWaveformBar_compact', () => { updateSeekbar(); });
		waveformBarMenu.appendTo(playerControlsLowerBarMenu);
		playerControlsLowerBarMenu.addSeparator();

		// * ARTIST BUTTON CONTROLS * //
		const lowerBarArtistBtnControlsMenu = new Menu('艺术家按钮行为');
		lowerBarArtistBtnControlsMenu.addRadioItems(['艺术家播放列表', '打开网站'], grSet.lowerBarArtistBtnAction, ['playlist', 'website'], (type) => {
			grSet.lowerBarArtistBtnAction = type;
		});
		lowerBarArtistBtnControlsMenu.addSeparator();

		const { websiteLabels, websiteValues } = WebsiteGenerateLinks(grCfg.customWebsiteLinks); // Get labels and values for predefined and custom website links
		lowerBarArtistBtnControlsMenu.addRadioItems(websiteLabels, grSet.lowerBarArtistBtnWebsite, websiteValues, (website) => {
			grSet.lowerBarArtistBtnWebsite = website;
		});
		lowerBarArtistBtnControlsMenu.appendTo(playerControlsLowerBarMenu);

		// * ADD TRACKS BUTTON CONTROLS * //
		const addTracksBtnControlsMenu = new Menu('收藏音轨按钮');
		addTracksBtnControlsMenu.addItem('收藏音轨播放列表', false, () => { grm.inputBox.addTracksPlaylist(); });
		addTracksBtnControlsMenu.addSeparator();
		addTracksBtnControlsMenu.addRadioItems(['选择', '当前播放'], grSet.addTracksButtonAction, ['selection', 'nowplaying'], (action) => {
			grSet.addTracksButtonAction = action;
		});
		addTracksBtnControlsMenu.appendTo(playerControlsLowerBarMenu);

		// * TIME BUTTON CONTROLS * //
		playerControlsLowerBarMenu.createRadioSubMenu('播放时间显示', ['默认', '剩余', '百分比'],
			grSet.playbackTimeDisplay, ['default', 'remaining', 'percent'], (type) => {
			grSet.playbackTimeDisplay = type;
			window.Repaint();
		});
		playerControlsLowerBarMenu.appendTo(playerControlsMenu);

		// * SEEKBAR - PROGRESS BAR * //
		const playerControlsSeekBarMenu = new Menu('拖动控件');
		playerControlsSeekBarMenu.createRadioSubMenu('类型', ['进度条', '峰值条', '波形条'], grSet.seekbar, ['progressbar', 'peakmeterbar', 'waveformbar'], (type) => {
			grSet.seekbar = type;
			grm.ui.clearCache('metrics');
			grm.ui.setMainMetrics();
			grm.ui.setMainComponents('seekbar');
			grm.ui.setSeekbarRefresh();
			grm.button.createButtons(grm.ui.ww, grm.ui.wh);

			if (grSet.seekbar === 'peakmeterbar' && fb.IsPlaying) {
				grm.peakBar.startPeakmeter();
			} else {
				grm.peakBar.stopPeakmeter();
			}
			if (grSet.seekbar === 'waveformbar') grm.waveBar.updateBar();

			window.Repaint();
		});
		const playerControlsProgressBarMenu = new Menu('进度条');
		playerControlsProgressBarMenu.createRadioSubMenu('样式', ['默认', '圆化', '线', '块', '点', '细'], grSet.styleProgressBarDesign, ['default', 'rounded', 'lines', 'blocks', 'dots', 'thin'], (style) => {
			grSet.styleProgressBarDesign = style;
			grm.ui.setMainMetrics();
			window.Repaint();
		});
		playerControlsProgressBarMenu.createRadioSubMenu('鼠标滚轮寻道速度', ['  1 秒', '  2 秒', '  3 秒', '  4 秒', '  5 秒 （默认）', '  6 秒', '  7 秒', '  8 秒', '  9 秒', '10 秒'], grSet.progressBarWheelSeekSpeed, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (speed) => {
			grSet.progressBarWheelSeekSpeed = speed;
		});
		const playerControlsProgressBarRefreshMenu = new Menu('刷新率');
		playerControlsProgressBarRefreshMenu.addRadioItems(['  1 fps ~ 1000 毫秒 （非常慢 CPU）', '  2 fps ~ 500 毫秒', '  3 fps ~ 333 毫秒', '  4 fps ~ 250 毫秒', '  5 fps ~ 200 毫秒', '  6 fps ~ 166 毫秒', '  7 fps ~ 142 毫秒', '  8 fps ~ 125 毫秒', '  9 fps ~ 111 毫秒', '10 fps ~ 100 毫秒', '12 fps ~ 83 毫秒', '15 fps ~ 67 毫秒', '20 fps ~ 50 毫秒', '25 fps ~ 40 毫秒', '30 fps ~ 33 毫秒', '45 fps ~ 22 毫秒', '60 fps ~ 17 毫秒 （非常快 CPU）'], grSet.progressBarRefreshRate, [FPS._1, FPS._2, FPS._3, FPS._4, FPS._5, FPS._6, FPS._7, FPS._8, FPS._9, FPS._10, FPS._12, FPS._15, FPS._20, FPS._25, FPS._30, FPS._45, FPS._60], (rate) => {
			grSet.progressBarRefreshRate = rate;
			grm.ui.setSeekbarRefresh(rate);
		}, !grSet.showProgressBar_default || !grSet.showProgressBar_artwork || !grSet.showProgressBar_compact);
		playerControlsProgressBarRefreshMenu.addSeparator();
		playerControlsProgressBarRefreshMenu.addRadioItems(['可变刷新率（默认）'], grSet.progressBarRefreshRate, ['variable'], (rate) => {
			grSet.progressBarRefreshRate = rate;
			grm.ui.setSeekbarRefresh();
		}, !grSet.showProgressBar_default || !grSet.showProgressBar_artwork || !grSet.showProgressBar_compact);
		playerControlsProgressBarRefreshMenu.appendTo(playerControlsProgressBarMenu);
		playerControlsProgressBarMenu.appendTo(playerControlsSeekBarMenu);

		// * SEEKBAR - PEAKMETER BAR * //
		const playerControlsPeakmeterBarMenu = new Menu('峰值条');
		playerControlsPeakmeterBarMenu.createRadioSubMenu('样式', ['水平', '水平居中', '垂直'], grSet.peakmeterBarDesign, ['horizontal', 'horizontal_center', 'vertical'], (design) => {
			grSet.peakmeterBarDesign = design;
			window.Repaint();
		});
		if (grSet.peakmeterBarDesign === 'vertical') {
			playerControlsPeakmeterBarMenu.createRadioSubMenu('大小', ['  0 像素', '  2 像素', '  4 像素', '  6 像素', '  8 像素', '10 像素', grSet.layout !== 'default' ? '12 像素 （默认）' : '12 像素', '14 像素', '16 像素', '18 像素', grSet.layout !== 'default' ? '20 像素' : '20 像素 （默认）', '25 像素', '30 像素', '35 像素', '40 像素', '最小值'], grSet.peakmeterBarVertSize, [0, 2, 4, 6, 8, 10, 20, 25, 30, 35, 40, 'min'], (size) => {
				grSet.peakmeterBarVertSize = size;
				window.Repaint();
			});
			playerControlsPeakmeterBarMenu.createRadioSubMenu('分贝范围', ['2 到 -20 db （默认）', '2 到 -15 db', '2 到 -10 db', '3 到 -20 db', '3 到 -15 db', '3 到 -10 db', '5 到 -20 db', '5 到 -15 db', '5 到 -10 db'], grSet.peakmeterBarVertDbRange, [220, 215, 210, 320, 315, 310, 520, 515, 510], (range) => {
				grSet.peakmeterBarVertDbRange = range;
				window.Repaint();
			});
		}
		const playerControlsPeakmeterBarDisplayMenu = new Menu('显示');
		if (grSet.peakmeterBarDesign === 'horizontal' || grSet.peakmeterBarDesign === 'horizontal_center') {
			playerControlsPeakmeterBarDisplayMenu.addToggleItem('显示条', grSet, 'peakmeterBarOverBars', () => { window.Repaint(); });
			playerControlsPeakmeterBarDisplayMenu.addSeparator();
			playerControlsPeakmeterBarDisplayMenu.addToggleItem('显示外部条', grSet, 'peakmeterBarOuterBars', () => { window.Repaint(); });
			playerControlsPeakmeterBarDisplayMenu.addToggleItem('显示外部峰值', grSet, 'peakmeterBarOuterPeaks', () => { window.Repaint(); });
			playerControlsPeakmeterBarDisplayMenu.addSeparator();
			playerControlsPeakmeterBarDisplayMenu.addToggleItem('显示主条', grSet, 'peakmeterBarMainBars', () => { window.Repaint(); });
			playerControlsPeakmeterBarDisplayMenu.addToggleItem('显示主峰值', grSet, 'peakmeterBarMainPeaks', () => { window.Repaint(); });
			playerControlsPeakmeterBarDisplayMenu.addSeparator();
			playerControlsPeakmeterBarDisplayMenu.addToggleItem('显示中间条', grSet, 'peakmeterBarMiddleBars', () => { window.Repaint(); });
		}
		playerControlsPeakmeterBarDisplayMenu.addToggleItem('显示进度条', grSet, 'peakmeterBarProgBar', () => { window.Repaint(); });
		if (grSet.peakmeterBarDesign === 'horizontal' || grSet.peakmeterBarDesign === 'horizontal_center') {
			playerControlsPeakmeterBarDisplayMenu.addSeparator();
			playerControlsPeakmeterBarDisplayMenu.addToggleItem('显示间隙', grSet, 'peakmeterBarGaps', () => { window.Repaint(); });
			playerControlsPeakmeterBarDisplayMenu.addToggleItem('显示网格', grSet, 'peakmeterBarGrid', () => { grm.peakBar.on_size(grm.ui.ww, grm.ui.wh); window.Repaint(); });
		}
		if (grSet.peakmeterBarDesign === 'vertical') {
			playerControlsPeakmeterBarDisplayMenu.addToggleItem('显示峰值', grSet, 'peakmeterBarVertPeaks', () => { window.Repaint(); });
			playerControlsPeakmeterBarDisplayMenu.addToggleItem('显示基线', grSet, 'peakmeterBarVertBaseline', () => { window.Repaint(); });
		}
		playerControlsPeakmeterBarDisplayMenu.addToggleItem(grSet.layout !== 'default' ? '显示信息（仅在默认布局中可用）' : '显示信息', grSet, 'peakmeterBarInfo', () => { window.Repaint(); });
		playerControlsPeakmeterBarDisplayMenu.appendTo(playerControlsPeakmeterBarMenu);
		playerControlsPeakmeterBarMenu.createRadioSubMenu('鼠标滚轮寻道速度', ['  1 秒', '  2 秒', '  3 秒', '  4 秒', '  5 秒（默认） ', '  6 秒', '  7 秒', '  8 秒', '  9 秒', '10 秒'], grSet.peakmeterBarWheelSeekSpeed, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (speed) => {
			grSet.peakmeterBarWheelSeekSpeed = speed;
		});
		const playerControlsPeakmeterBarRefreshMenu = new Menu('刷新率');
		playerControlsPeakmeterBarRefreshMenu.addRadioItems(['  1 fps ~ 1000 毫秒 （非常慢 CPU）', '  2 fps ~ 500 毫秒', '  3 fps ~ 333 毫秒', '  4 fps ~ 250 毫秒', '  5 fps ~ 200 毫秒', '  6 fps ~ 166 毫秒', '  7 fps ~ 142 毫秒', '  8 fps ~ 125 毫秒', '  9 fps ~ 111 毫秒', '10 fps ~ 100 毫秒', '12 fps ~ 83 毫秒', '15 fps ~ 67 毫秒', '20 fps ~ 50 毫秒', '25 fps ~ 40 毫秒', '30 fps ~ 33 毫秒', '45 fps ~ 22 毫秒', '60 fps ~ 17 毫秒（非常快 CPU）'], grSet.peakmeterBarRefreshRate, [FPS._1, FPS._2, FPS._3, FPS._4, FPS._5, FPS._6, FPS._7, FPS._8, FPS._9, FPS._10, FPS._12, FPS._15, FPS._20, FPS._25, FPS._30, FPS._45, FPS._60], (rate) => {
			grSet.peakmeterBarRefreshRate = rate;
			this.audioWizard.SetMonitoringRefreshRate(rate);
			grm.ui.setSeekbarRefresh(rate);
		}, !grSet.showPeakmeterBar_default || !grSet.showPeakmeterBar_artwork || !grSet.showPeakmeterBar_compact);
		playerControlsPeakmeterBarRefreshMenu.addSeparator();
		playerControlsPeakmeterBarRefreshMenu.addRadioItems(['可变刷新率（默认）'], grSet.peakmeterBarRefreshRate, ['variable'], (rate) => {
			grSet.peakmeterBarRefreshRate = rate;
			grm.ui.setSeekbarRefresh();
		}, !grSet.showPeakmeterBar_default || !grSet.showPeakmeterBar_artwork || !grSet.showPeakmeterBar_compact);
		playerControlsPeakmeterBarRefreshMenu.appendTo(playerControlsPeakmeterBarMenu);
		playerControlsPeakmeterBarMenu.appendTo(playerControlsSeekBarMenu);

		// * SEEKBAR - WAVEFORM BAR * //
		const playerControlsWaveformBarMenu = new Menu('波形条');
		const playerControlsWaveformBarAnalysisMenu = new Menu('分析');
		playerControlsWaveformBarAnalysisMenu.addRadioItems(['RMS', 'RMS 峰值', '采样  峰值', '波形'], grSet.waveformBarAnalysis, ['rms', 'rms_peak', 'sample_peak', 'waveform'], (type) => {
				grSet.waveformBarAnalysis = type;
				grm.waveBar.updateConfig({ preset: { analysisMode: type } });
				grm.waveBar.updateBar();
				window.Repaint();
		});
		playerControlsWaveformBarAnalysisMenu.addSeparator();
		playerControlsWaveformBarAnalysisMenu.addRadioItems(
			['保存模式 - 始终', '保存模式 - 曲库', '保存模式 - 从不'], grSet.waveformBarSaveMode, ['always', 'library', 'never'], (mode) => {
			grSet.waveformBarSaveMode = mode;
			grm.waveBar.updateConfig({ analysis: { saveMode: mode } });
			grm.waveBar.updateBar();
			if (mode === 'always') return;
			const key = mode === 'library' ? 'waveformBarSaveModeLibrary' : 'waveformBarSaveModeNever';
			grm.msg.showPopupNotice('menu', key);
		}, grSet.waveformBarMode === 'visualizer');
		playerControlsWaveformBarAnalysisMenu.addSeparator();
		playerControlsWaveformBarAnalysisMenu.addItem('显示兼容扩展名', false, () => {
			fb.ShowPopupMessage(grm.waveBar.checkCompatibleFileExtensionReport().join(', '), `模式: ${grm.waveBar.analysis.binaryMode}`);
		}, grSet.waveformBarMode === 'visualizer');
		playerControlsWaveformBarAnalysisMenu.addSeparator();
		playerControlsWaveformBarAnalysisMenu.addToggleItem('分析过程可视化', grSet, 'waveformBarFallbackAnalysis', () => {
			grm.waveBar.updateConfig({ analysis: { visualizerFallbackAnalysis: grSet.waveformBarFallbackAnalysis } });
		});
		playerControlsWaveformBarAnalysisMenu.addToggleItem('不兼容文件可视化', grSet, 'waveformBarFallback', () => {
			grm.waveBar.updateConfig({ analysis: { visualizerFallback: grSet.waveformBarFallback } });
		});
		playerControlsWaveformBarAnalysisMenu.appendTo(playerControlsWaveformBarMenu);

		playerControlsWaveformBarMenu.createRadioSubMenu('模式', ['音频向导', '可视化'], grSet.waveformBarMode, ['audioWizard', 'visualizer'], (mode) => {
			grSet.waveformBarMode = mode;
			grm.waveBar.updateConfig({ analysis: { binaryMode: mode } });
			grm.waveBar.updateBar();
			window.Repaint();
		});

		playerControlsWaveformBarMenu.createRadioSubMenu('分辩率', ['最小', '非常低', '低', '平衡', '标准（默认）', '高', '非常高'], grSet.waveformBarResolution, [1, 5, 10, 15, 20, 50, 100], (res) => {
			grSet.waveformBarResolution = res;

			const handle = fb.GetNowPlaying();
			if (handle) {
				grm.waveBar.deleteWaveformFile(handle);
			}

			grm.waveBar.updateConfig({ analysis: { resolution: res } });
			grm.waveBar.updateBar(true);
		});

		playerControlsWaveformBarMenu.createRadioSubMenu('样式', ['波形', '条', '点', '半条'], grSet.waveformBarDesign, ['waveform', 'bars', 'dots', 'halfbars'], (design) => {
			grSet.waveformBarDesign = design;
			grm.waveBar.updateConfig({ preset: { barDesign: design } });
		});

		const playerControlsWaveformBarSizeMenu = new Menu('大小');
		playerControlsWaveformBarSizeMenu.createRadioSubMenu('波形', ['1', '2', '3', '4', '5'], grSet.waveformBarSizeWave, [1, 2, 3, 4, 5], (size) => {
			grSet.waveformBarSizeWave = size;
			grm.waveBar.updateConfig({ ui: { sizeWave: size } });
		});
		playerControlsWaveformBarSizeMenu.createRadioSubMenu('条', ['1', '2', '3', '4', '5'], grSet.waveformBarSizeBars, [1, 2, 3, 4, 5], (size) => {
			grSet.waveformBarSizeBars = size;
			grm.waveBar.updateConfig({ ui: { sizeBars: size } });
		});
		playerControlsWaveformBarSizeMenu.createRadioSubMenu('点', ['1', '2', '3', '4', '5'], grSet.waveformBarSizeDots, [1, 2, 3, 4, 5], (size) => {
			grSet.waveformBarSizeDots = size;
			grm.waveBar.updateConfig({ ui: { sizeDots: size } });
		});
		playerControlsWaveformBarSizeMenu.createRadioSubMenu('半条', ['1', '2', '3', '4', '5'], grSet.waveformBarSizeHalf, [1, 2, 3, 4, 5], (size) => {
			grSet.waveformBarSizeHalf = size;
			grm.waveBar.updateConfig({ ui: { sizeHalf: size } });
		});
		playerControlsWaveformBarSizeMenu.addSeparator();
		playerControlsWaveformBarSizeMenu.addToggleItem('常规宽度', grSet, 'waveformBarSizeNormalize', () => {
			grm.waveBar.updateConfig({ ui: { sizeNormalizeWidth: grSet.waveformBarSizeNormalize } });
		});
		playerControlsWaveformBarSizeMenu.appendTo(playerControlsWaveformBarMenu);

		const playerControlsWaveformBarDisplayMenu = new Menu(`显示${grSet.waveformBarPaint === 'full' && grSet.waveformBarMode !== 'visualizer' ? '\t(仅部分)' : ''}`);
		playerControlsWaveformBarDisplayMenu.addRadioItems(['完整', '部份'], grSet.waveformBarPaint, ['full', 'partial'], (paint) => {
			grSet.waveformBarPaint = paint;
			grm.waveBar.updateConfig({ preset: { paintMode: paint } });
		});
		playerControlsWaveformBarDisplayMenu.addSeparator();

		playerControlsWaveformBarDisplayMenu.addToggleItem(`预绘${grSet.waveformBarPaint === 'full' ? '\t(仅部分)' : ''}`, grSet, 'waveformBarPrepaint', () => {
			grm.waveBar.updateConfig({ preset: { prepaint: grSet.waveformBarPrepaint } });
		}, grSet.waveformBarPaint === 'full');

		const waveformBarPrepaintMenuDisabled = grSet.waveformBarPaint === 'full' || grSet.waveformBarMode === 'visualizer' || !grSet.waveformBarPrepaint;
		playerControlsWaveformBarDisplayMenu.createRadioSubMenu('前绘图', ['  2 秒', '  5 秒', '10 秒', ' 完整'], grSet.waveformBarPrepaintFront, [2, 5, 10, Infinity], (time) => {
			grSet.waveformBarPrepaintFront = time;
			grm.waveBar.updateConfig({ preset: { prepaintFront: time } });
		}, waveformBarPrepaintMenuDisabled);
		playerControlsWaveformBarDisplayMenu.addSeparator();

		playerControlsWaveformBarDisplayMenu.addToggleItem('动态', grSet, 'waveformBarAnimate', () => {
			grm.waveBar.updateConfig({ preset: { animate: grSet.waveformBarAnimate } });
		});

		playerControlsWaveformBarDisplayMenu.addToggleItem(`使用 BPM${grSet.waveformBarPaint === 'full' && grSet.waveformBarMode !== 'visualizer' ? '\t(仅部分)' : ''}`, grSet, 'waveformBarBPM', () => {
			grm.waveBar.updateConfig({ preset: { useBPM: grSet.waveformBarBPM } });
		}, !(grSet.waveformBarPaint === 'partial' && grSet.waveformBarPrepaint || grSet.waveformBarMode === 'visualizer'));

		playerControlsWaveformBarDisplayMenu.addToggleItem('翻转半条', grSet, 'waveformBarInvertHalfbars', () => {
			grm.waveBar.updateConfig({ preset: { invertHalfbars: grSet.waveformBarInvertHalfbars } });
		});
		playerControlsWaveformBarDisplayMenu.addSeparator();

		playerControlsWaveformBarDisplayMenu.addToggleItem('显示指示', grSet, 'waveformBarIndicator', () => {
			grm.waveBar.updateConfig({ preset: { indicator: grSet.waveformBarIndicator } });
		});
		playerControlsWaveformBarDisplayMenu.appendTo(playerControlsWaveformBarMenu);

		const playerControlsWaveformBarWheelMenu = new Menu('鼠标滚轮');
		playerControlsWaveformBarWheelMenu.createRadioSubMenu('寻道速度', grSet.waveformBarWheelSeekType === 'percentage' ?
			['  1%', '  2%', '  3%', '  4%', '  5%（默认）', '  6%', '  7%', '  8%', '  9%', '10%'] :
			['  1 秒', '  2 秒', '  3 秒', '  4 秒', '  5 秒（默认）', '  6 秒', '  7 秒', '  8 秒', '  9 秒', '10 秒'],
			grSet.waveformBarWheelSeekSpeed, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (speed) => {
			grSet.waveformBarWheelSeekSpeed = speed;
			grm.waveBar.updateConfig({ wheel: { seekSpeed: speed } });
		});
		playerControlsWaveformBarWheelMenu.createRadioSubMenu('寻道样式', ['秒', '百分比'], grSet.waveformBarWheelSeekType, ['seconds', 'percentage'], (type) => {
			grSet.waveformBarWheelSeekType = type;
			grm.waveBar.updateConfig({ wheel: { seekType: type } });
		});
		playerControlsWaveformBarWheelMenu.appendTo(playerControlsWaveformBarMenu);

		const playerControlsWaveformBarRefreshMenu = new Menu(`刷新率${grSet.waveformBarPaint === 'full' && grSet.waveformBarMode !== 'visualizer' ? '\t(仅部分)' : ''}`);
		const waveformBarRefreshMenuDisabled = grSet.waveformBarPaint === 'full' || grSet.waveformBarMode === 'visualizer' || !grSet.waveformBarPrepaint;
		playerControlsWaveformBarRefreshMenu.addRadioItems(['  1 fps ~ 1000 毫秒 （非常慢 CPU）', '  2 fps ~ 500 毫秒', '  3 fps ~ 333 毫秒', '  4 fps ~ 250 毫秒', '  5 fps ~ 200 毫秒', '  6 fps ~ 166 毫秒', '  7 fps ~ 142 毫秒', '  8 fps ~ 125 毫秒', '  9 fps ~ 111 毫秒', '10 fps ~ 100 毫秒', '12 fps ~ 83 毫秒', '15 fps ~ 67 毫秒', '20 fps ~ 50 毫秒', '25 fps ~ 40 毫秒', '30 fps ~ 33 毫秒', '45 fps ~ 22 毫秒', '60 fps ~ 17 毫秒 （非常快 CPU）'], grSet.waveformBarRefreshRate, [FPS._1, FPS._2, FPS._3, FPS._4, FPS._5, FPS._6, FPS._7, FPS._8, FPS._9, FPS._10, FPS._12, FPS._15, FPS._20, FPS._25, FPS._30, FPS._45, FPS._60], (rate) => {
			grSet.waveformBarRefreshRate = rate;
			grm.waveBar.updateConfig({ ui: { refreshRate: rate } });
			grm.ui.setSeekbarRefresh(rate);
		}, waveformBarRefreshMenuDisabled);
		playerControlsWaveformBarRefreshMenu.addSeparator();
		playerControlsWaveformBarRefreshMenu.addRadioItems(['可变刷新率（默认）'], grSet.waveformBarRefreshRate, ['variable'], (rate) => {
			grSet.waveformBarRefreshRate = rate;
			grm.waveBar.updateConfig({ ui: { refreshRate: FPS._5 } });
		}, waveformBarRefreshMenuDisabled);
		playerControlsWaveformBarRefreshMenu.appendTo(playerControlsWaveformBarMenu);
		playerControlsWaveformBarMenu.appendTo(playerControlsSeekBarMenu);
		playerControlsSeekBarMenu.appendTo(playerControlsMenu);

		playerControlsMenu.appendTo(menu);
	}
	// #endregion

	// * PLAYLIST * //
	// #region PLAYLIST
	/**
	 * Top menu > Options > Playlist.
	 * @param {Menu} menu - Creates the Playlist panel menu via a new Menu instance.
	 * @param {boolean} context_menu - Appends Playlist panel options to context menu.
	 * @protected
	 */
	playlistOptions(menu, context_menu) {
		const playlistMenu = context_menu ? menu : new Menu('播放列表');

		const playlistCallback = () => {
			grm.ui.setPlaylistSize();
			window.Repaint();
		};

		// * LAYOUT * //
		if (grSet.layout === 'default') {
			playlistMenu.createRadioSubMenu('布局', ['常规', '完整'], grSet.playlistLayout, ['normal', 'full'], (width) => {
				grSet.playlistLayout = width;
				grm.ui.initPlaylistLayoutState();
			});
		}

		// * BACKGROUND * //
		const playlistBackgroundMenu = new Menu('背景');
		playlistBackgroundMenu.addToggleItem('显示图片在背景', grSet, 'playlistBgImg', () => {
			if (grSet.playlistBgImg) {
				grm.bgImg.initBgImage('playlist');
			} else {
				grm.bgImg.clearBgImageCache('playlist');
			}
			grm.bgImg.initBgImageCycle();
			grm.ui.updatePlaylist();
			window.Repaint();
		});
		playlistBackgroundMenu.addToggleItem('仅显示当前播放行', grSet, 'playlistBgRowNowPlaying', () => {
			if (grSet.playlistBgRowNowPlaying) {
				plSet.show_row_stripes = false;
			}
			grm.ui.updatePlaylist();
			window.Repaint();
		});
		playlistBackgroundMenu.addSeparator();
		playlistBackgroundMenu.addToggleItem('循环图片', grSet, 'playlistBgImgCycle', () => {
			grm.bgImg.initBgImageCycle();
			window.Repaint();
		});
		playlistBackgroundMenu.createRadioSubMenu('循环时间', ['  5 秒', '10 秒', '15 秒（默认）', '30 秒', '60 秒'], grSet.playlistBgImgCycleTime, [5, 10, 15, 30, 60], (time) => {
			grSet.playlistBgImgCycleTime = time;
			grm.bgImg.initBgImageCycle();
			window.Repaint();
		});
		playlistBackgroundMenu.addSeparator();
		const playlistBackgroundImageSourceMenu = new Menu('图片来源');
		playlistBackgroundImageSourceMenu.addRadioItems(['艺术家', '专辑', '自定义'], grSet.playlistBgImgSource, ['artist', 'album', 'custom'], (source) => {
			grSet.playlistBgImgSource = source;
			grm.bgImg.initBgImage('playlist', true);
			window.Repaint();
		});
		playlistBackgroundImageSourceMenu.addSeparator();
		playlistBackgroundImageSourceMenu.addToggleItem('过滤专辑图片', grSet, 'playlistBgImgAlbumArtFilter', () => {
			window.Reload();
		});
		playlistBackgroundImageSourceMenu.appendTo(playlistBackgroundMenu);
		playlistBackgroundMenu.createRadioSubMenu('图片缩放', ['比例', '填充', '拉伸'], grSet.playlistBgImgScale, ['default', 'filled', 'stretched'], (scale) => {
			grSet.playlistBgImgScale = scale;
			grm.bgImg.initBgImage('playlist', true);
			window.Repaint();
		});
		playlistBackgroundMenu.createRadioSubMenu('图片不透明度', ['100%', '90%', '80%', '70%', '60%', '50%', '40%', '30%', '20%', '10%'], grSet.playlistBgImgOpacity, [255, 230, 204, 178, 153, 128, 102, 76, 51, 25], value => {
			grSet.playlistBgImgOpacity = value;
			window.Repaint();
		});
		playlistBackgroundMenu.addSeparator();
		playlistBackgroundMenu.createRadioSubMenu('行不透明度', ['100%', '90%', '80%', '70%', '60%', '50%', '40%', '30%', '20%', '10%'], grSet.playlistBgRowOpacity, [255, 230, 204, 178, 153, 128, 102, 76, 51, 25], value => {
			grSet.playlistBgRowOpacity = value;
			grm.ui.updatePlaylist();
		});
		playlistBackgroundMenu.appendTo(playlistMenu);

		// * PLAYLIST MANAGER * //
		const playlistManagerMenu = new Menu('播放列表管理器');
		const playlistManagerShowMenu = new Menu('显示播放列表管理器');
		playlistManagerShowMenu.addToggleItem('默认', grSet, 'showPlaylistManager_default', playlistCallback);
		playlistManagerShowMenu.addToggleItem('封面', grSet, 'showPlaylistManager_artwork', playlistCallback);
		playlistManagerShowMenu.addToggleItem('简单', grSet, 'showPlaylistManager_compact', playlistCallback);
		playlistManagerShowMenu.appendTo(playlistManagerMenu);
		playlistManagerMenu.addToggleItem('显示播放列表历史', grSet, 'showPlaylistHistory',  () => { window.Repaint(); });
		playlistManagerMenu.addToggleItem('自动-隐藏', grSet, 'autoHidePlman',  () => { grm.ui.initTheme(); });
		playlistManagerMenu.appendTo(playlistMenu);

		// * ALBUM HEADER * //
		const playlistAlbumMenu = new Menu('分组页眉');
		const playlistAlbumArtMenu = new Menu('专辑封面');
		playlistAlbumArtMenu.addToggleItem('显示', plSet, 'show_album_art', () => { grm.ui.updatePlaylist(); });
		playlistAlbumArtMenu.addToggleItem('无封面自动-隐藏', plSet, 'auto_album_art', () => { grm.ui.updatePlaylist(); });
		playlistAlbumArtMenu.appendTo(playlistAlbumMenu);
		playlistAlbumMenu.addSeparator();

		playlistAlbumMenu.addToggleItem('显示分组页眉', plSet, 'show_header', () => {
			grm.ui.updatePlaylist();
		});
		playlistAlbumMenu.addToggleItem('使用简单页眉', plSet, 'use_compact_header', () => {
			PlaylistRescale(true);
			grm.ui.initPlaylist();
			grm.ui.setPlaylistSize();
			window.Repaint();
		}, !plSet.show_header);
		playlistAlbumMenu.addToggleItem('自动折叠和展开', plSet, 'auto_collapse', () => {
			grm.ui.initPlaylist();
			grm.ui.setPlaylistSize();
		});
		playlistAlbumMenu.addSeparator();
		playlistAlbumMenu.addToggleItem('Ctrl+点击 跟随超链接', grSet, 'hyperlinksCtrlClick');
		playlistAlbumMenu.addSeparator();
		playlistAlbumMenu.addToggleItem('翻转页眉行', grSet, 'headerFlipRows', () => {
			grm.ui.initPlaylist();
			grm.ui.setPlaylistSize();
		});
		playlistAlbumMenu.addSeparator();
		playlistAlbumMenu.addToggleItem('显示碟片子页眉', plSet, 'show_disc_header', () => { grm.ui.updatePlaylist(); });
		playlistAlbumMenu.addToggleItem('显示组信息', plSet, 'show_group_info', () => { pl.playlist.clear_cache(); grm.ui.updatePlaylist(); });
		playlistAlbumMenu.addToggleItem('显示比特深度和采样率（始终）', grCfg.settings, 'playlistShowBitSampleAlways', () => { pl.playlist.clear_cache(); grm.ui.updatePlaylist(); });
		playlistAlbumMenu.addToggleItem('显示完整发行日期 (YYYY-MM-DD)', grSet, 'showPlaylistFullDate', () => { grm.ui.updatePlaylist(); });
		playlistAlbumMenu.addSeparator();
		playlistAlbumMenu.addToggleItem('显示评级', plSet, 'show_rating_header', () => { pl.playlist.clear_cache(); grm.ui.updatePlaylist(); });
		playlistAlbumMenu.addToggleItem('显示 PLR 值', plSet, 'show_PLR_header', () => { pl.playlist.clear_cache(); grm.ui.updatePlaylist(); });
		playlistAlbumMenu.addSeparator();
		playlistAlbumMenu.addItem('自定义页眉信息', false, () => { grm.inputBox.playlistCustomHeaderInfo(); pl.playlist.clear_cache(); grm.ui.updatePlaylist(); });
		playlistAlbumMenu.appendTo(playlistMenu);

		// * TRACK ROW * //
		const rowsMenu = new Menu('音轨行');
		rowsMenu.addToggleItem('交替行颜色', plSet, 'show_row_stripes', () => {
			if (plSet.show_row_stripes) {
				grSet.playlistBgRowNowPlaying = false;
			}
			playlistCallback();
		});
		rowsMenu.addSeparator();
		rowsMenu.addToggleItem('显示播放次数', plSet, 'show_playcount', playlistCallback);
		rowsMenu.addToggleItem('显示队列位置', plSet, 'show_queue_position', playlistCallback);
		rowsMenu.addSeparator();
		rowsMenu.addToggleItem('显示评级', plSet, 'show_rating', playlistCallback);
		rowsMenu.addToggleItem('显示评级（来自标签）', plSet, 'use_rating_from_tags', () => {
			pl.playlist.clear_cache();
			grm.ui.updatePlaylist();
		});
		rowsMenu.addToggleItem('显示评级网格', grSet, 'showPlaylistRatingGrid', playlistCallback);
		rowsMenu.addSeparator();
		rowsMenu.addToggleItem('显示 PLR 值', plSet, 'show_PLR', playlistCallback);
		rowsMenu.addSeparator();
		rowsMenu.addToggleItem('显示音轨号', grSet, 'showPlaylistTrackNumbers', () => { grSet.showPlaylistIndexNumbers = false; grm.ui.updatePlaylist(); });
		rowsMenu.addToggleItem('显示索引编号', grSet, 'showPlaylistIndexNumbers', () => { grSet.showPlaylistTrackNumbers = false; grm.ui.updatePlaylist(); });
		rowsMenu.addSeparator();
		rowsMenu.addToggleItem('显示不同艺术家（行）', grSet, 'showDifferentArtist', () => { grm.ui.updatePlaylist(); });
		rowsMenu.addToggleItem('显示艺术家（行）', grSet, 'showArtistPlaylistRows', () => { grm.ui.updatePlaylist(); });
		rowsMenu.addToggleItem('显示专辑名（行）', grSet, 'showAlbumPlaylistRows', () => { grm.ui.updatePlaylist(); });
		rowsMenu.addToggleItem('显示唱片样式编号（如果可用）', grSet, 'showVinylNums', () => { grm.ui.updatePlaylist(); });
		rowsMenu.addToggleItem('显示 last.fm 播放记录（无本地播放时）', grSet, 'lastFmScrobblesFallback', () => { grm.ui.updatePlaylist(); });
		rowsMenu.addSeparator();
		rowsMenu.addToggleItem('鼠标悬停', grSet, 'playlistRowHover', () => { window.Repaint(); });
		rowsMenu.addSeparator();
		rowsMenu.createRadioSubMenu('播放时间显示', ['默认', '剩余', '百分比'],
			grSet.playlistPlaybackTimeDisplay, ['default', 'remaining', 'percent'], (type) => {
			grSet.playlistPlaybackTimeDisplay = type;
			window.Repaint();
		});
		rowsMenu.addSeparator();
		rowsMenu.addItem('自定义音轨行', false, () => { grm.inputBox.playlistCustomTrackRow(); grm.ui.updatePlaylist(); });
		rowsMenu.appendTo(playlistMenu);

		// * SORT ORDER * //
		const playlistSortOrderMenu = new Menu('排序');
		playlistSortOrderMenu.addToggleItem('始终自动-排序', grSet, 'playlistSortOrderAuto');
		playlistSortOrderMenu.addSeparator();
		playlistSortOrderMenu.addItem('排序按...', false, () => { fb.RunMainMenuCommand('编辑/排序/排序按...'); grm.ui.updatePlaylist(); });
		playlistSortOrderMenu.addSeparator();

		const setSorting = () => {
			grm.ui.setPlaylistSortOrder();
			grm.ui.setPlaylistSize();
			window.Repaint();
		};

		const sortOrderWithDirection = ['artistDate', 'artistRating', 'artistPlaycount', 'albumRating', 'albumPlaycount', 'trackRating', 'trackPlaycount', 'year', 'genre', 'label', 'country'];

		/** @type {string} Holds the current sort order preference without any direction suffix ('_asc' or '_dsc'). */
		let savedOrder = grSet.playlistSortOrder;
		/** @type {boolean} Indicaties if the current sort order (`savedOrder`) requires a direction. */
		let savedOrderWithDirection = sortOrderWithDirection.includes(savedOrder.slice(0, -4));
		// Remove direction from saved order for radio item checking
		if (savedOrderWithDirection) savedOrder = savedOrder.slice(0, -4);

		playlistSortOrderMenu.addRadioItems(['按升序排列', '按降序排列'], grSet.playlistSortOrderDirection, ['_asc', '_dsc'], (direction) => {
			grSet.playlistSortOrder = `${savedOrder}${savedOrderWithDirection ? direction : ''}`;
			setSorting();
		}, !savedOrderWithDirection);

		playlistSortOrderMenu.addSeparator();

	    playlistSortOrderMenu.addRadioItems(['默认', '艺术家 | 日期', '艺术家评级', '艺术家播放计数', '专辑', '专辑评级', '专辑播放计数', '标题', '音轨号', '音轨评级', '音轨播放计数', '年份', '流派', '唱片公司', '国家地区', '文件路径', '自定义'], savedOrder,
			['default', 'artistDate', 'artistRating', 'artistPlaycount', 'albumTitle', 'albumRating', 'albumPlaycount', 'trackTitle', 'trackNumber', 'trackRating', 'trackPlaycount', 'year', 'genre', 'label', 'country', 'filePath', 'custom'], (order) => {
			savedOrderWithDirection = sortOrderWithDirection.includes(order);
			savedOrder = order;
			grSet.playlistSortOrder = `${order}${savedOrderWithDirection ? grSet.playlistSortOrderDirection : ''}`;
			if (order === 'custom') grm.inputBox.playlistSortCustom();
			setSorting();
		}, false, !grSet.playlistSortOrderAuto);
		playlistSortOrderMenu.addSeparator();

		playlistSortOrderMenu.addItem('随机', false, () => { fb.RunMainMenuCommand('编辑/排序/随机'); grm.ui.updatePlaylist(); });
		playlistSortOrderMenu.addItem('反向', false, () => { fb.RunMainMenuCommand('编辑/排序/反向'); grm.ui.updatePlaylist(); });
		playlistSortOrderMenu.addSeparator();
		playlistSortOrderMenu.addItem('保存', false, () => { fb.RunMainMenuCommand('文件/保存播放列表...'); grm.ui.updatePlaylist(); });
		playlistSortOrderMenu.addItem('载入', false, () => { fb.RunMainMenuCommand('文件/载入播放列表...'); grm.ui.updatePlaylist(); });
		playlistSortOrderMenu.addItem('撤消', false, () => { fb.RunMainMenuCommand('编辑/撤消'); grm.ui.updatePlaylist(); });

		playlistSortOrderMenu.appendTo(playlistMenu);

		if (!context_menu) playlistMenu.appendTo(menu);
	}
	// #endregion

	// * DETAILS * //
	// #region DETAILS
	/**
	 * Top menu > Options > Details.
	 * @param {Menu} menu - Creates the Details panel menu via a new Menu instance.
	 * @param {boolean} context_menu - Appends Details panel options to context menu.
	 * @protected
	 */
	detailsOptions(menu, context_menu) {
		const detailsMenu = context_menu ? menu : new Menu('详情');

		if (grSet.layout === 'default') {
			const discArtMenu = new Menu('💿 碟片');
			const displayDiscArtMenu = new Menu('碟片占位符');

			discArtMenu.addItem('唱机模式（原型测试）', grm.details.turntableMode, () => {
				grm.details.setTurntableMode(!grm.details.turntableMode);
			});
			discArtMenu.addItem('输出性能检查信息到控制台', false, () => grm.details.printTurntableDiagnostics());
			if (grm.details.turntableMode && grm.details.turntableSuspended) {
				discArtMenu.addItem('恢复唱机动画', false, () => grm.details.resumeTurntableAnimation());
			}
			if (grm.details.turntableMode) {
				discArtMenu.addItem('输出唱机运行信息到控制台', false, () => grm.details.printTurntableDiagnostics());
			}
			discArtMenu.addItem('显示唱机右侧歌词', grm.details.turntableLyricsEnabled !== false, () => {
				grm.details.setTurntableLyricsEnabled(grm.details.turntableLyricsEnabled === false);
			});
			discArtMenu.createRadioSubMenu('唱机唱片图像', ['圆形封面（参考图）', '原始碟片图（无图时用封面）'],
				grm.details.turntableArtwork, ['cover', 'disc'], value => {
					grm.details.turntableArtwork = value;
					window.SetProperty('TT 唱机原型 PRE1：图像', value);
					grm.details.turntableRecord = null;
					if (grm.details.needsTurntableDisc() && (fb.IsPlaying || grSet.panelBrowseMode)) grm.details.fetchDiscArt();
					window.Repaint();
				});
			discArtMenu.addSeparator();


			const setDiscArtStub = (discArt) => {
				grSet.discArtStub = discArt;
				grSet.noDiscArtStub = false;
				grm.ui.newTrackFetchingArtwork = true;
				grm.details.discArtCover = grm.details.disposeDiscArt(grm.details.discArtCover);
				grm.ui.fetchNewArtwork(fb.GetNowPlaying());
				grm.debug.repaintWindow();
			};

			// * DISC ART PLACEHOLDER * //
			displayDiscArtMenu.addToggleItem('未找到碟片则显示占位符', grSet, 'showDiscArtStub', () => {
				grSet.noDiscArtStub = false;
				grm.ui.fetchNewArtwork(fb.GetNowPlaying());
				window.Repaint();
			}, !grSet.displayDiscArt);
			displayDiscArtMenu.addSeparator();
			displayDiscArtMenu.addToggleItem('无占位符', grSet, 'noDiscArtStub', () => {
				grSet.showDiscArtStub = false;
				grm.details.discArt = grm.details.disposeDiscArt(grm.details.discArt);
				grm.details.discArtCover = grm.details.disposeDiscArt(grm.details.discArtCover);
				grm.details.discArtArray = [];
				grm.ui.fetchNewArtwork(fb.GetNowPlaying());
				window.Repaint();
			}, !grSet.displayDiscArt);
			displayDiscArtMenu.addSeparator();

			const discArtCommonMenu = new Menu('通用');
			discArtCommonMenu.addRadioItems(['通用 - CD - 专辑封面', '通用 - CD - 白色', '通用 - CD - 黑色', '通用 - CD - 空白', '通用 - CD - 透明'],
				grSet.discArtStub, ['cdAlbumCover', 'cdWhite', 'cdBlack', 'cdBlank', 'cdTrans'], (discArt) => {
				setDiscArtStub(discArt);
			}, !grSet.displayDiscArt);
			discArtCommonMenu.addSeparator(); // 增加分隔线
		    discArtCommonMenu.addRadioItems(['通用 - 黑胶 - 专辑封面', '通用 - 黑胶 - 白色', '通用 - 黑胶 - 空洞', '通用 - 黑胶 - 冷聚', '通用 - 黑胶 - 火环', '通用 - 黑胶 - 淡棕', '通用 - 黑胶 - 黑色', '通用 - 黑胶 - 黑洞', '通用 - 黑胶 - 乌木', '通用 - 黑胶 - 透明'],
				grSet.discArtStub, ['vinylAlbumCover', 'vinylWhite', 'vinylVoid', 'vinylColdFusion', 'vinylRingOfFire', 'vinylMaple', 'vinylBlack', 'vinylBlackHole', 'vinylEbony', 'vinylTrans'], (discArt) => {
				setDiscArtStub(discArt);
			}, !grSet.displayDiscArt);
			//以下5行为旋转碟片自定义项目DIY
			discArtCommonMenu.addSeparator(); // 增加分隔线
			discArtCommonMenu.addRadioItems(['通用 - 自定义 - 红色', '通用 - 自定义 - 黄色', '通用 - 自定义 - 绿色', '通用 - 自定义 - 轮胎', '通用 - 自定义 - 电锯', '通用 - 自定义 - 罗盘', '通用 - 自定义 - 漩涡', '通用 - 自定义 - 双鱼', '通用 - 自定义 - 风扇', '通用 - 自定义 - 次元'],
				grSet.discArtStub, ['diyRed', 'diyYellow', 'diyGreen', 'diyTyre', 'diySaw', 'diyCompass', 'diyVortex', 'diyPisces', 'diyA', 'diyB'], (discArt) => {
				setDiscArtStub(discArt);
			}, !grSet.displayDiscArt);
			discArtCommonMenu.appendTo(displayDiscArtMenu);

			const discArtThemeMenu = new Menu('主题');
			discArtThemeMenu.addRadioItems(['主题 - CD - 蓝色', '主题 - CD - 深蓝', '主题 - CD - 红色', '主题 - CD - 奶油', '主题 - CD - 荧光蓝', '主题 - CD - 荧光绿', '主题 - CD - 荧光红', '主题 - CD - 荧光金'],
				grSet.discArtStub, ['themeCdBlue', 'themeCdDarkBlue', 'themeCdRed', 'themeCdCream', 'themeCdNblue', 'themeCdNgreen', 'themeCdNred', 'themeCdNgold'], (discArt) => {
				setDiscArtStub(discArt);
			}, !grSet.displayDiscArt);
			discArtThemeMenu.addSeparator(); // 增加分隔线
			discArtThemeMenu.addRadioItems(['主题 - 黑胶 - 蓝色', '主题 - 黑胶 - 深蓝', '主题 - 黑胶 - 红色', '主题 - 黑胶 - 奶油', '主题 - 黑胶 - 荧光蓝', '主题 - 黑胶 - 荧光绿', '主题 - 黑胶 - 荧光红', '主题 - 黑胶 - 荧光金'],
				grSet.discArtStub, ['themeVinylBlue', 'themeVinylDarkBlue', 'themeVinylRed', 'themeVinylCream', 'themeVinylNblue', 'themeVinylNgreen', 'themeVinylNred', 'themeVinylNgold'], (discArt) => {
				setDiscArtStub(discArt);
			}, !grSet.displayDiscArt);
			discArtThemeMenu.appendTo(displayDiscArtMenu);

			// * 碟片自定义占位符 * //
			const discArtCustomMenu = new Menu('自定义');
			const customDiscArtLabels = [];
			const customDiscArtValues = [];
			for (const key in grCfg.customDiscArtStub) {
				if (Object.prototype.hasOwnProperty.call(grCfg.customDiscArtStub, key) && key.includes('Name')) {
					const num = key.match(Regex.NumTrailing)[0]; // Extract the number from the key (e.g., "01" from "cdName01")
					const cdStubKey = `cdStub${num}`;
					const vinylStubKey = `vinylStub${num}`;
					if (key.startsWith('cdName') && grCfg.customDiscArtStub[cdStubKey]) {
						customDiscArtLabels.push(grCfg.customDiscArtStub[key]);
						customDiscArtValues.push(grCfg.customDiscArtStub[cdStubKey].replace('.png', ''));
					}
					else if (key.startsWith('vinylName') && grCfg.customDiscArtStub[vinylStubKey]) {
						customDiscArtLabels.push(grCfg.customDiscArtStub[key]);
						customDiscArtValues.push(grCfg.customDiscArtStub[vinylStubKey].replace('.png', ''));
					}
				}
			}
			discArtCustomMenu.addRadioItems(customDiscArtLabels, grSet.discArtStub, customDiscArtValues, (discArt) => {
				grSet.discArtStub = discArt;
				grSet.noDiscArtStub = false;
				grPath.discArtCustomStub = `${fb.ProfilePath}georgia-reborn\\images\\custom\\discart\\${grSet.discArtStub}.png`;
				grm.details.discArtCover = grm.details.disposeDiscArt(grm.details.discArtCover);
				grm.ui.fetchNewArtwork(fb.GetNowPlaying());
				window.Repaint();
				if (!IsFile(grPath.discArtCustomStub)) {
					grm.msg.showPopupNotice('menu', 'discArtStub');
				}
			}, !grSet.displayDiscArt);
			discArtCustomMenu.appendTo(displayDiscArtMenu);
			displayDiscArtMenu.appendTo(discArtMenu);

			// * DISC ART OPTIONS * //
			discArtMenu.addToggleItem('显示碟片', grSet, 'displayDiscArt', () => {
				grm.details.clearCache('discArt');
				grm.details.clearCache('metrics', 'cachedLabelLastLeftEdge'); // resize labels
				grm.details.clearTimer();
				if (fb.IsPlaying) grm.ui.fetchNewArtwork(fb.GetNowPlaying());
				grm.ui.resizeArtwork(true);
				window.Repaint();
			});

			discArtMenu.addToggleItem('启用碟片过渡动画', grSet, 'discArtAnimation', () => {
				grm.details.setDiscArtAnimationEnabled(grSet.discArtAnimation);
				window.Repaint();
			}, !grSet.displayDiscArt);
			discArtMenu.createRadioSubMenu('碟片过渡动画方式', ['渐进滑出（默认）', '快速滑出'], grSet.discArtEjectStyle, ['progressive', 'fast'], style => {
				grSet.discArtEjectStyle = style;
			}, !grSet.displayDiscArt || !grSet.discArtAnimation);
			discArtMenu.createRadioSubMenu('碟片露出比例', ['100%', '60%', '50%（默认）', '40%', '30%', '20%', '0%'], grSet.discArtDisplayAmount, [1, 0.6, 0.5, 0.4, 0.3, 0.2, 0], amount => {
				grSet.discArtDisplayAmount = amount;
				grm.ui.resizeArtwork(true);
				window.Repaint();
			}, !grSet.displayDiscArt);
			discArtMenu.addSeparator();
			discArtMenu.addToggleItem('前置碟片', grSet, 'discArtOnTop', () => {
				grSet.detailsAlbumArtDiscAreaOpacity = 255;
				grm.details.setDiscArtAnimationEnabled(grSet.discArtAnimation);
				window.Repaint();
			}, !grSet.displayDiscArt);
			discArtMenu.addToggleItem('显示内嵌碟片图（如果可用）', grSet, 'discArtEmbedded', () => {
				if (!grSet.discArtEmbedded) {
					grm.ui.fetchNewArtwork(fb.GetNowPlaying());
					window.Repaint();
					return;
				}
				if (grSet.discArtEmbedded) {
					grm.msg.showPopupNotice('menu', 'discArtEmbedded');
				}
				grm.details.clearCache('discArt');
				grm.details.fetchDiscArt();
				window.Repaint();
			});
			discArtMenu.addSeparator();
			discArtMenu.addToggleItem('旋转碟片 （增加内存和 CPU）', grSet, 'spinDiscArt', () => {
				if (grSet.spinDiscArt) {
					grm.details.setDiscArtRotationTimer();
				} else {
					grm.details.clearTimer('discArt');
					grm.details.discArtArray = [];
				}
			});
			discArtMenu.createRadioSubMenu('# 旋转速度 （内存占用）', ['  36（10 度）', '  45（  8 度）', '  60（  6 度）', '  72（  5 度）（默认）', '  90（  4 度）', '120（  3 度）', '180（  2 度）', '360（  1 度）'], grSet.spinDiscArtImageCount, [36, 45, 60, 72, 90, 120, 180, 360], (count) => {
				grSet.spinDiscArtImageCount = count;
				grm.artCache.discArtImgMaxRes = grm.artCache.setDiscArtMaxResolution(grSet.spinDiscArtImageCount);
				grm.details.initDiscArt();
				window.Repaint();
			}, !grSet.spinDiscArt);
			discArtMenu.createRadioSubMenu('旋转重绘速度', ['250 毫秒 （低 CPU）', '200 毫秒', '150 毫秒', '125 毫秒', '100 毫秒', '  75 毫秒 （默认）', '  50 毫秒', '  40 毫秒', '  30 毫秒', '  20 毫秒', '  10 毫秒 （高 CPU）'], grSet.spinDiscArtRedrawInterval, [250, 200, 150, 125, 100, 75, 50, 40, 30, 20, 10], interval => {
				grSet.spinDiscArtRedrawInterval = interval;
				grm.details.setDiscArtRotationTimer();
			}, !grSet.spinDiscArt);
			discArtMenu.addSeparator();
			discArtMenu.addToggleItem('跟随音轨切换旋转碟片', grSet, 'rotateDiscArt', () => { window.Repaint(); }, !grSet.displayDiscArt || grSet.spinDiscArt);
			discArtMenu.createRadioSubMenu('碟片旋转度', ['2 度', '3 度', '4 度', '5 度'], parseInt(grSet.rotationAmt), [2, 3, 4, 5], (rot) => {
				grSet.rotationAmt = rot;
				grm.details.setDiscArtRotation();
				window.Repaint();
			}, !grSet.rotateDiscArt || grSet.spinDiscArt);
			discArtMenu.appendTo(detailsMenu);
			// * DISC ART ALBUM ART * //
			const albumArtOpacityMenu = new Menu('专辑封面不透明度');
			albumArtOpacityMenu.createRadioSubMenu('完整封面 （碟片旋转时需要   快速 CPU）', ['100%', '  90%', '  80%', '  70%', '  60%', '  50%', '  40%', '  30%', '  20%', '  10%', '    0%'], grSet.detailsAlbumArtOpacity, [255, 230, 204, 178, 153, 128, 102, 76, 51, 25, 0], value => {
				grSet.detailsAlbumArtOpacity = value;
				grSet.detailsAlbumArtDiscAreaOpacity = 255;
				grSet.discArtOnTop = false;
				window.Repaint();
			});
			albumArtOpacityMenu.createRadioSubMenu('碟片区域 （碟片旋转时需要非常快 CPU）', ['100%', '  90%', '  80%', '  70%', '  60%', '  50%', '  40%', '  30%', '  20%', '  10%', '    0%'], grSet.detailsAlbumArtDiscAreaOpacity, [255, 230, 204, 178, 153, 128, 102, 76, 51, 25, 0], value => {
				grSet.detailsAlbumArtDiscAreaOpacity = value;
				grSet.detailsAlbumArtOpacity = 255;
				grSet.discArtOnTop = false;
				window.Repaint();
			});
			albumArtOpacityMenu.appendTo(detailsMenu);
		}

		// * METADATA GRID MENU * //
		const detailsMetadataGridMenu = new Menu('元数据表格');
		const detailsShowArtistMenu = new Menu('显示艺术家');
		detailsShowArtistMenu.addToggleItem('默认', grSet, 'showGridArtist_default', () => {
			grm.details.clearCache('metrics');
			grm.ui.createFonts();
			grm.details.updateGridPos();
			window.Repaint();
		});
		detailsShowArtistMenu.addToggleItem('封面', grSet, 'showGridArtist_artwork', () => {
			grm.details.clearCache('metrics');
			grm.ui.createFonts();
			grm.details.updateGridPos();
			window.Repaint();
		});
		detailsShowArtistMenu.appendTo(detailsMetadataGridMenu);

		// * SHOW TRACK NUMBER IN DETAILS * //
		const detailsShowTrackNumberMenu = new Menu('显示音轨号');
		detailsShowTrackNumberMenu.addToggleItem('默认', grSet, 'showGridTrackNum_default', () => {
			grm.details.clearCache('metrics');
			grm.ui.createFonts();
			grm.details.updateGridPos();
			window.Repaint();
		});
		detailsShowTrackNumberMenu.addToggleItem('封面', grSet, 'showGridTrackNum_artwork', () => {
			grm.details.clearCache('metrics');
			grm.ui.createFonts();
			grm.details.updateGridPos();
			window.Repaint();
		});
		detailsShowTrackNumberMenu.appendTo(detailsMetadataGridMenu);

		// * SHOW TRACK TITLE IN DETAILS * //
		const detailsShowTitleMenu = new Menu('显示歌曲标题');
		detailsShowTitleMenu.addToggleItem('默认', grSet, 'showGridTitle_default', () => {
			grSet.showGridTrackNum_default = true;
			grm.details.clearCache('metrics');
			grm.ui.createFonts();
			grm.details.updateGridPos();
			window.Repaint();
		});
		detailsShowTitleMenu.addToggleItem('封面', grSet, 'showGridTitle_artwork', () => {
			grSet.showGridTrackNum_artwork = true;
			grm.details.clearCache('metrics');
			grm.ui.createFonts();
			grm.details.updateGridPos();
			window.Repaint();
		});
		detailsShowTitleMenu.appendTo(detailsMetadataGridMenu);

		// * SHOW PLAYING PLAYLIST IN DETAILS * //
		const detailsShowPlaylingPlaylistMenu = new Menu('显示当前播放列表');
		detailsShowPlaylingPlaylistMenu.addToggleItem('启用', grSet, 'showGridPlayingPlaylist', () => {
			on_playback_new_track(fb.GetNowPlaying());
			grm.details.clearCache('metrics');
			grm.ui.createFonts();
			window.Repaint();
		});
		detailsShowPlaylingPlaylistMenu.appendTo(detailsMetadataGridMenu);

		// * SHOW TIMELINE IN DETAILS * //
		const detailsShowTimelineMenu = new Menu('显示时间线');
		detailsShowTimelineMenu.addToggleItem('默认', grSet, 'showGridTimeline_default', () => {
			grm.details.clearCache('metrics');
			window.Repaint();
		});
		detailsShowTimelineMenu.addToggleItem('封面', grSet, 'showGridTimeline_artwork', () => {
			grm.details.clearCache('metrics');
			window.Repaint();
		});
		detailsShowTimelineMenu.appendTo(detailsMetadataGridMenu);

		// * SHOW ARTIST COUNTRY FLAG IN DETAILS * //
		const detailsShowArtistFlagsMenu = new Menu('显示艺术家国家 / 地区旗帜');
		detailsShowArtistFlagsMenu.addToggleItem('默认', grSet, 'showGridArtistFlags_default', () => {
			grm.details.clearCache('metrics');
			grm.ui.loadCountryFlags();
			window.Repaint();
		});
		detailsShowArtistFlagsMenu.addToggleItem('封面', grSet, 'showGridArtistFlags_artwork', () => {
			grm.details.clearCache('metrics');
			grm.ui.loadCountryFlags();
			window.Repaint();
		});
		detailsShowArtistFlagsMenu.appendTo(detailsMetadataGridMenu);

		// * SHOW RELEASE COUNTRY FLAG IN DETAILS * //
		const detailsShowReleaseFlagsMenu = new Menu('显示发行国家 / 地区旗帜');
		detailsShowReleaseFlagsMenu.createRadioSubMenu('默认', ['不显示', '图标', '文本 + 图标'], grSet.showGridReleaseFlags_default, [false, 'logo', 'textlogo'], type => {
			grSet.showGridReleaseFlags_default = type;
			grm.details.clearCache('metrics');
			grm.details.loadGridReleaseCountryFlag();
			window.Repaint();
		});
		detailsShowReleaseFlagsMenu.createRadioSubMenu('封面', ['不显示', '图标', '文本 + 图标'], grSet.showGridReleaseFlags_artwork, [false, 'logo', 'textlogo'], type => {
			grSet.showGridReleaseFlags_artwork = type;
			grm.details.clearCache('metrics');
			grm.details.loadGridReleaseCountryFlag();
			window.Repaint();
		});
		detailsShowReleaseFlagsMenu.appendTo(detailsMetadataGridMenu);

		// * SHOW CODEC LOGO IN DETAILS * //
		const detailsShowCodecLogoMenu = new Menu('显示编解码图标');
		detailsShowCodecLogoMenu.createRadioSubMenu('默认', ['不显示', '图标', '文本 + 图标'], grSet.showGridCodecLogo_default, [false, 'logo', 'textlogo'], type => {
			grSet.showGridCodecLogo_default = type;
			grm.details.clearCache('metrics');
			grm.details.clearCache('codecLogo');
			window.Repaint();
		});
		detailsShowCodecLogoMenu.createRadioSubMenu('封面', ['不显示', '图标', '文本 + 图标'], grSet.showGridCodecLogo_artwork, [false, 'logo', 'textlogo'], type => {
			grSet.showGridCodecLogo_artwork = type;
			grm.details.clearCache('metrics');
			grm.details.clearCache('codecLogo');
			window.Repaint();
		});
		detailsShowCodecLogoMenu.appendTo(detailsMetadataGridMenu);

		// * SHOW CHANNEL LOGO IN DETAILS * //
		const detailsShowChannelLogoMenu = new Menu('显示声道图标');
		detailsShowChannelLogoMenu.createRadioSubMenu('默认', ['不显示', '图标', '文本 + 图标'], grSet.showGridChannelLogo_default, [false, 'logo', 'textlogo'], type => {
			grSet.showGridChannelLogo_default = type;
			grm.details.clearCache('metrics');
			grm.details.clearCache('channelLogo');
			window.Repaint();
		});
		detailsShowChannelLogoMenu.createRadioSubMenu('封面', ['不显示', '图标', '文本 + 图标'], grSet.showGridChannelLogo_artwork, [false, 'logo', 'textlogo'], type => {
			grSet.showGridChannelLogo_artwork = type;
			grm.details.clearCache('metrics');
			grm.details.clearCache('channelLogo');
			window.Repaint();
		});
		detailsShowChannelLogoMenu.appendTo(detailsMetadataGridMenu);

		detailsMetadataGridMenu.addSeparator();
		detailsMetadataGridMenu.addToggleItem('自动-隐藏部分元数据（空间不足时）', grSet, 'autoHideGridMetadata', () => window.Repaint());

		// * EDIT METADATA GRID IN DETAILS * //
		if (fb.IsPlaying) {
			detailsMetadataGridMenu.addSeparator();
			detailsMetadataGridMenu.addItem(!grm.ui.displayMetadataGridMenu ? '编辑元数据表格' : '退出元数据表格菜单', false, () => {
				grm.details.initGridMenuState();
			});
		}
		detailsMetadataGridMenu.appendTo(detailsMenu);

		if (grSet.layout === 'default') {
			const detailsBackgroundMenu = new Menu('背景');
			// * SHOW FULL BACKGROUND WHEN NO DISC ART IN DETAILS * //
			detailsBackgroundMenu.addToggleItem('显示完整背景（无碟片时）', grSet, 'noDiscArtBg', () => {
				if (grSet.labelArtOnBg) {
					grSet.labelArtOnBg = false;
				}
				window.Repaint();
			});
			// * SHOW LABEL ART ON BACKGROUND IN DETAILS * //
			detailsBackgroundMenu.addToggleItem('显示唱片公司标识在背景', grSet, 'labelArtOnBg', () => window.Repaint(), grSet.noDiscArtBg);
			detailsBackgroundMenu.appendTo(detailsMenu);
		}

		if (!context_menu) detailsMenu.appendTo(menu);
	}
	// #endregion

	// * LIBRARY * //
	// #region LIBRARY
	/**
	 * Top menu > Options > Library.
	 * @param {Menu} menu - Creates the Library panel menu via a new Menu instance.
	 * @param {boolean} context_menu - Appends Library options to context menu.
	 * @protected
	 */
	libraryOptions(menu, context_menu) {
		const libraryMenu = context_menu ? menu : new Menu('曲库');

		// * LAYOUT * //
		if (grSet.layout === 'default') {
			const libraryLayoutMenu = new Menu('布局');
			libraryLayoutMenu.addRadioItems(['常规', '完整', '拆分'], grSet.libraryLayout, ['normal', 'full', 'split'], (width) => {
				grSet.libraryLayout = width;
				grm.ui.initLibraryLayoutState();
			});
			libraryLayoutMenu.addSeparator();
			libraryLayoutMenu.addToggleItem('使用完整预设', grSet, 'libraryLayoutFullPreset', () => { window.Repaint(); });
			libraryLayoutMenu.addSeparator();
			libraryLayoutMenu.addToggleItem('使用拆分预设（折叠）', grSet, 'libraryLayoutSplitPreset', () => {
				grm.ui.setLibrarySplitPreset(grSet.libraryLayoutSplitPreset ? 'libraryLayoutSplitPreset' : false);
			});
			libraryLayoutMenu.addToggleItem('使用拆分预设（文本）', grSet, 'libraryLayoutSplitPreset2', () => {
				grm.ui.setLibrarySplitPreset(grSet.libraryLayoutSplitPreset2 ? 'libraryLayoutSplitPreset2' : false);
			});
			libraryLayoutMenu.addToggleItem('使用拆分预设（封面网格）', grSet, 'libraryLayoutSplitPreset3', () => {
				grm.ui.setLibrarySplitPreset(grSet.libraryLayoutSplitPreset3 ? 'libraryLayoutSplitPreset3' : false);
			});
			libraryLayoutMenu.addToggleItem('使用拆分预设（封面标题）', grSet, 'libraryLayoutSplitPreset4', () => {
				grm.ui.setLibrarySplitPreset(grSet.libraryLayoutSplitPreset4 ? 'libraryLayoutSplitPreset4' : false);
			});
			libraryLayoutMenu.appendTo(libraryMenu);
		}

		// * MODE * //
		const libraryModeMenu = new Menu('模式');
		grSet.libraryMode = lib.panel.imgView && libSet.artId === 4 ? 'artistGrid' : lib.panel.imgView && libSet.artId === 0 ? 'albumGrid' : 'tree';
		libraryModeMenu.addRadioItems(['树', '专辑网格', '艺术家网格'], grSet.libraryMode, ['tree', 'albumGrid', 'artistGrid'], (mode) => {
			if (grSet.libraryDesign === 'flowMode') grSet.libraryLayout = 'full';
			if (lib.panel.imgView) libSet.toggle('albumArtShow');
			if (mode === 'tree') libSet.toggle('albumArtShow');
			libSet.artId = mode === 'artistGrid' ? 4 : 0;
			lib.men.setPlaylist(3);
		});
		libraryModeMenu.appendTo(libraryMenu);

		// * DESIGN * //
	    libraryMenu.createRadioSubMenu('快速设置', ['Georgia-ReBORN', '传统', '现代', '超现代', '简洁', '列表视图', '封面 (右侧标签)', '封面 (底部标签)', '封面 (叠加标签)', '流动模式'], grSet.libraryDesign,
			['reborn', 'traditional', 'modern', 'ultraModern', 'clean', 'facet', 'coversLabelsRight', 'coversLabelsBottom', 'coversLabelsBlend', 'flowMode'], (design) => {
			grSet.libraryDesign = design;
			grm.ui.setLibraryDesign();
		});

		// * THEME * //
		libraryMenu.createRadioSubMenu('主题', ['Georgia-ReBORN', '深色', '融合', '浅色', '随机', '封面'], grSet.libraryTheme, [0, 1, 2, 3, 4, 5], (theme) => {
			libSet.theme = grSet.libraryTheme = theme;
			grm.ui.initTheme();
			lib.call.on_colours_changed();
			lib.panel.updateProp(1);
		});

		// * ALBUM ART * //
		const libraryAlbumArtMenu = new Menu('专辑封面');
		const libraryThumbnailSizeMenu = new Menu('缩略图大小');
		libraryThumbnailSizeMenu.addRadioItems(['自动 （默认）', '播放列表', '迷你', '小', '常规', '中', '大', 'XL', 'XXL', '最大'], grSet.libraryThumbnailSize, ['auto', 'playlist', 0, 1, 2, 3, 4, 5, 6, 7], (thumbnailSize) => {
			grSet.savedLibraryThumbnailSize = libSet.thumbNailSize = grSet.libraryThumbnailSize = thumbnailSize;
			grm.ui.setLibrarySize();
			window.Repaint();
		});
		libraryThumbnailSizeMenu.appendTo(libraryAlbumArtMenu);

		const libraryThumbnailBorderMenu = new Menu('缩略图边框');
		libraryThumbnailBorderMenu.addRadioItems(['无', '边框', '阴影'], grSet.libraryThumbnailBorder, ['none', 'border', 'shadow'], (type) => {
			grSet.libraryThumbnailBorder = type;
			libSet.albumArtDropShadow = grSet.libraryThumbnailBorder === 'shadow';
			lib.panel.updateProp(1);
		});
		libraryThumbnailBorderMenu.appendTo(libraryAlbumArtMenu);

		const libraryAlbumArtOverlay = new Menu('叠加');
		libraryAlbumArtOverlay.addRadioItems(['无', '音轨计数', '年份'], libSet.itemOverlayType, [0, 1, 2], (type) => {
			libSet.itemOverlayType = type;
			lib.panel.updateProp(1);
		});
		libraryAlbumArtOverlay.appendTo(libraryAlbumArtMenu);

		const libraryAlbumArtIndex = new Menu('索引');
		libraryAlbumArtIndex.addToggleItem('滚动条拖动时显示', libSet, 'albumArtLetter', () => { lib.panel.updateProp(1); });
		libraryAlbumArtIndex.addSeparator();
		libraryAlbumArtIndex.addRadioItems(['艺术家', '字母表'], libSet.albumArtLetterNo, [0, 1], (type) => {
			libSet.albumArtLetterNo = type;
			lib.panel.updateProp(1);
		});
		libraryAlbumArtIndex.appendTo(libraryAlbumArtMenu);
		libraryAlbumArtMenu.appendTo(libraryMenu);

		const libraryViewMenu = new Menu('查看');
		libraryViewMenu.addRadioItems(['封面 （默认）', '封底', '碟片', '图标', '艺术家'], libSet.artId, [0, 1, 2, 3, 4], (view) => {
			libSet.artId = view;
			lib.men.setAlbumart(view);
			lib.panel.updateProp(1);
		});
		libraryViewMenu.addSeparator();
		libraryViewMenu.addRadioItems(['分组：自动', '分组：一级', '分组：二级'], libSet.albumArtGrpLevel, [0, 1, 2], (view) => {
			libSet.albumArtGrpLevel = view;
			lib.men.setAlbumart(view - 5);
			lib.panel.updateProp(1);
		});
		libraryViewMenu.appendTo(libraryAlbumArtMenu);

		const libraryImageMenu = new Menu('图片');
		libraryImageMenu.createRadioSubMenu('封面', ['常规', '自动填充 （默认）', '圆形'], libSet.imgStyleFront, [0, 1, 2], (style) => {
			libSet.imgStyleFront = style;
			lib.panel.updateProp(1);
		});
		libraryImageMenu.createRadioSubMenu('封底', ['常规', '自动填充 （默认）', '圆形'], libSet.imgStyleBack, [0, 1, 2], (style) => {
			libSet.imgStyleBack = style;
			lib.panel.updateProp(1);
		});
		libraryImageMenu.createRadioSubMenu('碟片', ['常规', '自动填充 （默认）', '圆形'], libSet.imgStyleDisc, [0, 1, 2], (style) => {
			libSet.imgStyleDisc = style;
			lib.panel.updateProp(1);
		});
		libraryImageMenu.createRadioSubMenu('图标', ['常规', '自动填充 （默认）', '圆形'], libSet.imgStyleIcon, [0, 1, 2], (style) => {
			libSet.imgStyleIcon = style;
			lib.panel.updateProp(1);
		});
		libraryImageMenu.createRadioSubMenu('艺术家', ['常规', '自动填充 （默认）', '圆形'], libSet.imgStyleArtist, [0, 1, 2], (style) => {
			libSet.imgStyleArtist = style;
			lib.panel.updateProp(1);
		});
		libraryImageMenu.appendTo(libraryAlbumArtMenu);

		const libraryLabelsMenu = new Menu('标签');
		libraryLabelsMenu.addRadioItems(['底部 （默认）', '右侧', '叠加', '深色', '无'], libSet.albumArtLabelType, [1, 2, 3, 4, 0], (style) => {
			grSet.savedLibraryAlbumArtLabelType = libSet.albumArtLabelType = style;
			lib.panel.updateProp(1);
		});
		libraryLabelsMenu.addSeparator();
		libraryLabelsMenu.addToggleItem('翻转', libSet, 'albumArtFlipLabels', () => {  lib.panel.updateProp(1); });
		libraryLabelsMenu.addSeparator();
		libraryLabelsMenu.createRadioSubMenu('文本对齐', ['左 (默认)', '中', '右'], libSet.albumArtTextAlign, [0, 1, 2], (align) => {
			libSet.albumArtTextAlign = align;
			lib.panel.updateProp(1);
		});
		libraryLabelsMenu.appendTo(libraryAlbumArtMenu);

		// * BACKGROUND * //
		const libraryBackgroundMenu = new Menu('背景');
		libraryBackgroundMenu.addToggleItem('显示图片在背景', grSet, 'libraryBgImg', () => {
			if (grSet.libraryBgImg) {
				grm.bgImg.initBgImage('library');
			} else {
				grm.bgImg.clearBgImageCache('library');
			}
			grm.bgImg.initBgImageCycle();
			window.Repaint();
		});
		libraryBackgroundMenu.addSeparator();
		libraryBackgroundMenu.addToggleItem('循环图片', grSet, 'libraryBgImgCycle', () => {
			grm.bgImg.initBgImageCycle();
			window.Repaint();
		});
		libraryBackgroundMenu.createRadioSubMenu('循环时间', ['  5 秒', '10 秒', '15 秒（默认）', '30 秒', '60 秒'], grSet.libraryBgImgCycleTime, [5, 10, 15, 30, 60], (time) => {
			grSet.libraryBgImgCycleTime = time;
			grm.bgImg.initBgImageCycle();
			window.Repaint();
		});
		libraryBackgroundMenu.addSeparator();
		const libraryBackgroundImageSourceMenu = new Menu('图片来源');
		libraryBackgroundImageSourceMenu.addRadioItems(['艺术家', '专辑', '自定义'], grSet.libraryBgImgSource, ['artist', 'album', 'custom'], (source) => {
			grSet.libraryBgImgSource = source;
			grm.bgImg.initBgImage('library', true);
			window.Repaint();
		});
		libraryBackgroundImageSourceMenu.addSeparator();
		libraryBackgroundImageSourceMenu.addToggleItem('过滤专辑图片', grSet, 'libraryBgImgAlbumArtFilter', () => {
			window.Reload();
		});
		libraryBackgroundImageSourceMenu.appendTo(libraryBackgroundMenu);
		libraryBackgroundMenu.createRadioSubMenu('图片缩放', ['比例', '填充', '拉伸'], grSet.libraryBgImgScale, ['default', 'filled', 'stretched'], (scale) => {
			grSet.libraryBgImgScale = scale;
			grm.bgImg.initBgImage('library', true);
			window.Repaint();
		});
		libraryBackgroundMenu.createRadioSubMenu('图片不透明度', ['100%', '90%', '80%', '70%', '60%', '50%', '40%', '30%', '20%', '10%'], grSet.libraryBgImgOpacity, [255, 230, 204, 178, 153, 128, 102, 76, 51, 25], value => {
			grSet.libraryBgImgOpacity = value;
			window.Repaint();
		});
		libraryBackgroundMenu.addSeparator();
		libraryBackgroundMenu.createRadioSubMenu('行不透明度', ['100%', '90%', '80%', '70%', '60%', '50%', '40%', '30%', '20%', '10%'], grSet.libraryBgRowOpacity, [255, 230, 204, 178, 153, 128, 102, 76, 51, 25], value => {
			grSet.libraryBgRowOpacity = value;
			window.Repaint();
		});
		libraryBackgroundMenu.appendTo(libraryMenu);

		// * CONTROLS * //
		const libraryControlsMenu = new Menu('控制');
		libraryControlsMenu.createRadioSubMenu('激活模式', ['默认', '浏览', '播放'], libSet.actionMode, [0, 1, 2], (mode) => {
			libSet.actionMode = mode;

			const setModeSettings = (mode) => {
				grSet.libraryLayoutSplitPreset  = mode !== 1;
				grSet.libraryLayoutSplitPreset2 = false;
				grSet.libraryLayoutSplitPreset3 = false;
				grSet.libraryLayoutSplitPreset4 = false;
				grSet.libraryLayout = mode === 0 ? 'normal' : 'split';
				plSet.show_header = true;
				libSet.itemShowStatistics = mode === 2 ? 7 : 0;
				lib.panel.imgView = libSet.albumArtShow = mode === 1;
				lib.lib.logTree();
				lib.pop.clearTree();
				lib.men.loadView(false, !lib.panel.imgView ? (libSet.artTreeSameView ? libSet.viewBy : libSet.treeViewBy) : (libSet.artTreeSameView ? libSet.viewBy : libSet.albumArtViewBy), lib.pop.sel_items[0]);
				grm.ui.setLibrarySize();
				grm.ui.initTheme();
				grm.ui.displayPlaylist = mode !== 0;
				grm.ui.displayLibrary = true;
				grm.ui.updatePlaylist();
			};

			if (mode === 0) {
				const msg = grm.msg.getMessage('menu', 'actionModeDefault');
				const msgFb = grm.msg.getMessage('menu', 'actionModeDefault', true);
				grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
					setModeSettings(0);
				});
			}
			else if (mode === 1) {
				const msg = grm.msg.getMessage('menu', 'actionModeBrowser');
				const msgFb = grm.msg.getMessage('menu', 'actionModeBrowser', true);
				grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
					if (!confirmed) {
						libSet.actionMode = 0;
						return;
					}
					setModeSettings(1);
				});
			}
			else if (mode === 2) {
				const msg = grm.msg.getMessage('menu', 'actionModePlayer');
				const msgFb = grm.msg.getMessage('menu', 'actionModePlayer', true);
				grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
					if (!confirmed) {
						libSet.actionMode = 0;
						return;
					}
					setModeSettings(2);
				});
			}

			lib.panel.updateProp(1);
			window.Repaint();
		});
		libraryControlsMenu.addSeparator();
		libraryControlsMenu.createRadioSubMenu('单击操作', ['选择', '发送到播放列表', '发送到播放列表并播放', '发送到播放列表并播放 （播放时只添加）'], libSet.clickAction, [0, 1, 2, 3], (action) => {
			libSet.clickAction = action;
			lib.panel.updateProp(1);
		});
		libraryControlsMenu.createRadioSubMenu('双击操作', ['发送到播放列表', '发送到播放列表并播放', '扩展 / 折叠“树”', '仅播放'], libSet.dblClickAction, [0, 1, 2, 3], (action) => {
			libSet.dblClickAction = action;
			lib.panel.updateProp(1);
		});
		libraryControlsMenu.createRadioSubMenu('中键点击 操作', ['添加到默认播放列表', '添加到当前播放列表', '添加到播放队列 (alt+双击 移除)'], libSet.mbtnClickAction, [0, 1, 2], (action) => {
			libSet.mbtnClickAction = action;
			lib.panel.updateProp(1);
		});
		libraryControlsMenu.createRadioSubMenu('Alt+点击 操作', ['添加到默认播放列表', '添加到当前播放列表', '添加到播放队列 (alt+双击 移除)'], libSet.altClickAction, [0, 1, 2], (action) => {
			libSet.altClickAction = action;
			lib.panel.updateProp(1);
		});
		const libraryKeystrokeMenu = new Menu('键盘操作');
		libraryKeystrokeMenu.addToggleItem('Enter 或从菜单发送时播放', libSet, 'autoPlay', () => { lib.panel.updateProp(1); });
		libraryKeystrokeMenu.addSeparator();
		libraryKeystrokeMenu.addRadioItems(['选择', '发送到播放列表'], libSet.keyAction, [0, 1], (action) => {
			libSet.keyAction = action;
			lib.panel.updateProp(1);
		});
		libraryKeystrokeMenu.appendTo(libraryControlsMenu);
		libraryControlsMenu.addSeparator();
		libraryControlsMenu.addToggleItem('始终记住曲库状态', libSet, 'rememberTree', () => { lib.panel.updateProp(1); });
		libraryControlsMenu.addToggleItem('始终以“树”相同模式加载查看', libSet, 'artTreeSameView', () => { lib.panel.updateProp(1); });
		libraryControlsMenu.addToggleItem('始终以当前查看模式加载预设', libSet, 'presetLoadCurView', () => { lib.panel.updateProp(1); });
		libraryControlsMenu.addSeparator();
		libraryControlsMenu.addItem('重置曲库缩放', false, () => { lib.panel.zoomReset();	});
		libraryControlsMenu.appendTo(libraryMenu);

		// * TRACK ROW * //
		const libraryTrackRowMenu = new Menu('音轨行');
		libraryTrackRowMenu.createRadioSubMenu('根节点样式', ['隐藏', '全部音乐', '查看模式', '项目摘要'], libSet.rootNode, [0, 1, 2, 3], (nodeIndex) => {
			libSet.rootNode = nodeIndex;
			lib.panel.updateProp(1);
		});
		libraryTrackRowMenu.createRadioSubMenu('节点项目计数', ['隐藏', '# 音轨', '# 子项'], libSet.nodeCounts, [0, 1, 2], (nodeIndex) => {
			libSet.nodeCounts = nodeIndex;
			lib.panel.updateProp(1);
		});
		libraryTrackRowMenu.createRadioSubMenu('节点项目计数位置', ['右侧', '左侧'], libSet.countsRight, [true, false], (nodeCounts) => {
			libSet.countsRight = nodeCounts;
			lib.panel.updateProp(1);
		});
		libraryTrackRowMenu.createRadioSubMenu('节点自动折叠', ['开启', '关闭'], libSet.autoCollapse, [true, false], (nodeCollapse) => {
			libSet.autoCollapse = nodeCollapse;
			if (libSet.autoCollapse) {
				libSet.treeAutoExpand = false;
				lib.pop.collapseAll();
			}
			lib.panel.updateProp(1);
		});
		libraryTrackRowMenu.createRadioSubMenu('节点自动展开', ['开启', '关闭'], libSet.treeAutoExpand, [true, false], (nodeAutoExpand) => {
			libSet.treeAutoExpand = nodeAutoExpand;
			if (libSet.treeAutoExpand) {
				libSet.autoCollapse = false;
			} else {
				lib.pop.collapseAll();
			}
			lib.panel.updateProp(1);
		});
		libraryTrackRowMenu.createRadioSubMenu('节点自动展开单个项目', ['开启', '关闭'], libSet.treeAutoExpandSingle, [true, false], (nodeAutoExpandSingle) => {
			libSet.treeAutoExpandSingle = nodeAutoExpandSingle;
			lib.panel.updateProp(1);
		});
		libraryTrackRowMenu.addSeparator();
		libraryTrackRowMenu.createRadioSubMenu('统计', ['音轨', '比特率', '持续时间', '合计大小', '等级', '热门', '日期', '播放队列', '播放次数', '首次播放', '最近播放', '添加时间'], libSet.itemShowStatistics, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], (stats) => {
			libSet.itemShowStatistics = stats;
			lib.panel.updateProp(1);
		});
		libraryTrackRowMenu.addSeparator();
		libraryTrackRowMenu.addToggleItem('显示正在播放', libSet, 'highLightNowplaying', () => { lib.panel.updateProp(1); });
		libraryTrackRowMenu.addToggleItem('显示音轨（展开节点）', libSet, 'showTracks', () => { lib.pop.collapseAll(); lib.panel.updateProp(1); });
		libraryTrackRowMenu.addToggleItem('交替行颜色', libSet, 'rowStripes', () => { lib.panel.updateProp(1); });
		libraryTrackRowMenu.addSeparator();
		libraryTrackRowMenu.addToggleItem('整行可点击', libSet, 'fullLineSelection', () => { lib.panel.updateProp(1); });
		libraryTrackRowMenu.addToggleItem('行鼠标悬停', grSet, 'libraryRowHover', () => { window.Repaint(); });
		libraryTrackRowMenu.appendTo(libraryMenu);

		// * FILTER ORDER * //
		const libraryFilterOrderMenu = new Menu('过滤规则');
		libraryFilterOrderMenu.addRadioItems(['无过滤', '无损', '有损', '无增益', '从未播放', '经常播放', '最近添加', '最近播放', '最高评级', '当前播放艺术家'], libSet.filterBy, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], (order) => {
			libSet.filterBy = order;
			lib.panel.set('Filter', order);
		});
		if (!DetectWine()) {
			libraryFilterOrderMenu.addSeparator();
			libraryFilterOrderMenu.addItem('配置过滤', false, () => { lib.panel.open('filters'); });
		}
		libraryFilterOrderMenu.appendTo(libraryMenu);

		// * SORT ORDER * //
		const librarySortOrderMenu = new Menu('排序规则');
		librarySortOrderMenu.addRadioItems(['默认', '升序（隐藏年份）', '升序（显示年份）', '降序（隐藏年份）', '降序（显示年份）'], libSet.sortOrder, [0, 1, 2, 3, 4], (order) => {
			libSet.sortOrder = order;
			const d = {};
			lib.men.getSortData(d);
			lib.men.sortByDate(libSet.sortOrder, d);
		});
		librarySortOrderMenu.addSeparator();
		librarySortOrderMenu.addRadioItems(['年份显示在专辑之后', '年份显示在专辑之前'], libSet.yearBeforeAlbum, [false, true], (year) => {
			libSet.yearBeforeAlbum = year;
		});
		librarySortOrderMenu.appendTo(libraryMenu);

		// * VIEW ORDER * //
		const libraryViewOrderMenu = new Menu('查看规则');
		libraryViewOrderMenu.addRadioItems(['艺术家', '专辑艺术家', '专辑艺术家 | 专辑', '专辑', '作曲家', '国家 / 地区', '国家 / 地区 | 流派', '流派', '唱片公司', '年份', '文件夹'], lib.panel.imgView ? libSet.albumArtViewBy : libSet.treeViewBy, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], (order) => {
			if (libSet.albumArtShow) {
				libSet.albumArtViewBy = order;
			} else {
				libSet.viewBy = order;
				libSet.treeViewBy = order;
			}
			lib.lib.logTree();
			lib.pop.clearTree();
			lib.men.loadView(false, !lib.panel.imgView ? (libSet.artTreeSameView ? libSet.viewBy : libSet.treeViewBy) : (libSet.artTreeSameView ? libSet.viewBy : libSet.albumArtViewBy), lib.pop.sel_items[0]);
		});
		if (!DetectWine()) {
			libraryViewOrderMenu.addSeparator();
			libraryViewOrderMenu.addItem('配置查看', false, () => { lib.panel.open('views'); });
		}
		libraryViewOrderMenu.appendTo(libraryMenu);

		// * SOURCE * //
		const librarySourceMenu = new Menu('来源');
		librarySourceMenu.addRadioItems(['媒体库'], libSet.fixedPlaylist ? '' : libSet.libSource, [1], (src) => {
			lib.men.setSource(0);
		});
		const libraryPlaylistSourceMenu = new Menu('播放列表');
		libraryPlaylistSourceMenu.addRadioItems(['激活播放列表'], libSet.fixedPlaylist ? '' : libSet.libSource, [0], (src) => {
			lib.men.setSource(2);
			lib.men.setActivePlaylist();
		});
		libraryPlaylistSourceMenu.addSeparator();
		const pl_no = Math.ceil(lib.men.pl.length / 30);
		const pl_ix = libSet.fixedPlaylist ? plman.FindPlaylist(libSet.fixedPlaylistName) : -1;
		for (let j = 0; j < pl_no; j++) {
			const n = `# ${j * 30 + 1} - ${Math.min(lib.men.pl.length, 30 + j * 30)}${30 + j * 30 > pl_ix && ((j * 30) - 1) < pl_ix ? '  >>>' : ''}`;
			const libraryPlaylistSourceItems = new Menu(n);

				for (let i = j * 30; i < Math.min(lib.men.pl.length, 30 + j * 30); i++) {
					libraryPlaylistSourceItems.addRadioItems([lib.men.pl[i].menuName], libSet.fixedPlaylist ? lib.men.pl[pl_ix].menuName : '', [lib.men.pl[i].menuName], () => {
						lib.men.setSource(2);
						lib.men.setFixedPlaylist(i);
					});
				}
				libraryPlaylistSourceItems.appendTo(libraryPlaylistSourceMenu);
		}
		libraryPlaylistSourceMenu.appendTo(librarySourceMenu);
		librarySourceMenu.appendTo(libraryMenu);

		// * LIBRARY EXPLORER * //
		const libraryExplorerMenu = new Menu('资源浏览器');
		const updateLibraryExplorerSettings = () => {
			lib.panel.updateProp(1);
			lib.ex.main.setSettings();
			lib.ex.main.setMetrics();
			lib.ex.color.updateFullThemeColorChange();
			lib.ex.utils.repaintExplorer();
		};
		
		// * DISPLAY * //
		const libraryExplorerDisplayMenu = new Menu('显示');
		libraryExplorerDisplayMenu.addToggleItem('启用浏览器', libSet, 'explorerTreeView', () => {
			updateLibraryExplorerSettings();
		});
		libraryExplorerDisplayMenu.addToggleItem('始终显示关闭按钮', libSet, 'explorerCloseButtonAlways', () => {
			updateLibraryExplorerSettings();
		});
		libraryExplorerDisplayMenu.addToggleItem('仅显示图标标签', libSet, 'explorerTabIconsOnly', () => {
			updateLibraryExplorerSettings();
		});
		libraryExplorerDisplayMenu.addToggleItem('显示“现在播放”标签图标', libSet, 'explorerTabIconNowPlaying', () => {
			updateLibraryExplorerSettings();
		});
		libraryExplorerDisplayMenu.addToggleItem('网格显示链接图标', libSet, 'explorerExternalLinkIcon', () => {
			updateLibraryExplorerSettings();
			lib.ex.cache.clearCache('thumbnail');
		});
		libraryExplorerDisplayMenu.createRadioSubMenu('网格中专辑年份', ['叠加', '文本', '禁用'], libSet.explorerAlbumYearType, ['overlay', 'text', 'disable'], (type) => {
			libSet.explorerAlbumYearType = type;
			updateLibraryExplorerSettings();
		});
		libraryExplorerDisplayMenu.addToggleItem('显示曲目评级网格', libSet, 'explorerShowTrackRatingGrid', () => {
			updateLibraryExplorerSettings();
		});
		libraryExplorerDisplayMenu.addToggleItem('显示不同艺术家', libSet, 'explorerShowDifferentArtist', () => {
			updateLibraryExplorerSettings();
		});
		libraryExplorerDisplayMenu.addToggleItem('显示碟片子页眉', libSet, 'explorerShowDiscHeader', () => {
			updateLibraryExplorerSettings();
		});
		libraryExplorerDisplayMenu.appendTo(libraryExplorerMenu);
		// * ARTWORK * //
		const libraryExplorerArtworkMenu = new Menu('插图');
		libraryExplorerArtworkMenu.createRadioSubMenu('专辑图片缩放', ['裁剪', '拉伸', '比例'], libSet.explorerAlbumImgScaling, ['cropped', 'stretched', 'proportional'], (mode) => {
			libSet.explorerAlbumImgScaling = mode;
			updateLibraryExplorerSettings();
		});
		libraryExplorerArtworkMenu.createRadioSubMenu('专辑缩略图缩放' , ['裁剪', '拉伸', '比例'], libSet.explorerAlbumThumbImgScaling, ['cropped', 'stretched', 'proportional'], (mode) => {
			libSet.explorerAlbumThumbImgScaling = mode;
			updateLibraryExplorerSettings();
		});
		libraryExplorerArtworkMenu.createRadioSubMenu('艺术家图片缩放', ['裁剪', '拉伸', '比例'], libSet.explorerArtistImgScaling, ['cropped', 'stretched', 'proportional'], (mode) => {
			libSet.explorerArtistImgScaling = mode;
			updateLibraryExplorerSettings();
		});
		libraryExplorerArtworkMenu.createRadioSubMenu('艺术家缩略图缩放', ['裁剪', '拉伸', '比例'], libSet.explorerArtistThumbImgScaling, ['cropped', 'stretched', 'proportional'], (mode) => {
			libSet.explorerArtistThumbImgScaling = mode;
			updateLibraryExplorerSettings();
		});
		libraryExplorerArtworkMenu.addSeparator();
		libraryExplorerArtworkMenu.addToggleItem('全主题颜色跟随插图切换', libSet, 'explorerFullThemeColorChange', () => {
			if (!libSet.explorerFullThemeColorChange) {
				updateLibraryExplorerSettings();
				return;
			}

			const msg = grm.msg.getMessage('menu', 'explorerFullThemeColorChange');
			const msgFb = grm.msg.getMessage('menu', 'explorerFullThemeColorChange', true);

			grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
				libSet.explorerFullThemeColorChange = confirmed;
				updateLibraryExplorerSettings();
			});
		});
		libraryExplorerArtworkMenu.addSeparator();
		libraryExplorerArtworkMenu.addToggleItem('插图循环', libSet, 'explorerArtworkCycle', () => {
			updateLibraryExplorerSettings();
			if (libSet.explorerArtworkCycle) {
				lib.ex.main.artworkCycleStop();
				lib.ex.main.artworkCycleStart();
			} else {
				lib.ex.main.artworkCycleStop();
			}
		});
		libraryExplorerArtworkMenu.createRadioSubMenu('插图循环时间', ['  5 秒', '10 秒', '15 秒 (默认)', '30 秒', '60 秒'], libSet.explorerArtworkCycleTime, [5000, 10000, 15000, 30000, 60000], (time) => {
			libSet.explorerArtworkCycleTime = time;
			updateLibraryExplorerSettings();
			if (libSet.explorerArtworkCycle) {
				lib.ex.main.artworkCycleStop();
				lib.ex.main.artworkCycleStart();
			}
		});
		libraryExplorerArtworkMenu.appendTo(libraryExplorerMenu);

		// * CONTROLS * //
		const libraryExplorerControlsMenu = new Menu('控制');
		libraryExplorerControlsMenu.addToggleItem('播放时保留播放列表', libSet, 'explorerPlaybackKeepPlaylist', () => {
			updateLibraryExplorerSettings();
		});
		libraryExplorerControlsMenu.addToggleItem('关闭外部鼠标滚轮', libSet, 'explorerWheelOutsideClose', () => {
			updateLibraryExplorerSettings();
		});
		libraryExplorerControlsMenu.appendTo(libraryExplorerMenu);

		// * DOWNLOADS * //
		const libraryExplorerDownloadsMenu = new Menu('下载');
		libraryExplorerDownloadsMenu.createRadioSubMenu('专辑图片自动下载', ['启用', '禁用'], libSet.explorerAlbumImageDLAuto, [true, false], (state) => {
			libSet.explorerAlbumImageDLAuto = state;

			if (!libSet.explorerAlbumImageDLAuto) {
				updateLibraryExplorerSettings();
				return;
			}

			const msg = grm.msg.getMessage('menu', 'explorerAlbumImageDLAutoEnable');
			const msgFb = grm.msg.getMessage('menu', 'explorerAlbumImageDLAutoEnable', true);

			grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
				libSet.explorerAlbumImageDLAuto = confirmed;
				updateLibraryExplorerSettings();
			});
		});
		libraryExplorerDownloadsMenu.createRadioSubMenu('专辑图片下载质量', ['中等质量（缓存较小）', '原始质量（缓存较大）'], libSet.explorerAlbumImageDLQuality, ['medium', 'original'], (quality) => {
			libSet.explorerAlbumImageDLQuality = quality;
			updateLibraryExplorerSettings();
		});
		libraryExplorerDownloadsMenu.createRadioSubMenu('专辑图片在专辑文件夹保存名称', ['Cover', 'Folder', 'Front'], libSet.explorerAlbumImageNameMoveToDir, ['cover', 'folder', 'front'], (name) => {
			libSet.explorerAlbumImageNameMoveToDir = name;
			updateLibraryExplorerSettings();
		});
		libraryExplorerDownloadsMenu.createRadioSubMenu('专辑图片下载后动作', ['禁用（来自缓存）', '嵌入到音轨中', '移动到专辑文件夹'], libSet.explorerAlbumImageAutoAction, ['disabled', 'embed', 'move'], (action) => {
			libSet.explorerAlbumImageAutoAction = action;

			if (libSet.explorerAlbumImageAutoAction === 'disabled') {
				updateLibraryExplorerSettings();
				return;
			}

			const key = action === 'embed' ? 'explorerAlbumImageAutoEmbed' : 'explorerAlbumImageAutoMove';
			const msg = grm.msg.getMessage('menu', key);
			const msgFb = grm.msg.getMessage('menu', key, true);

			grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
				libSet.explorerAlbumImageAutoAction = confirmed ? action : 'disabled';
				updateLibraryExplorerSettings();
			});
		});
		libraryExplorerDownloadsMenu.addSeparator();
		libraryExplorerDownloadsMenu.createRadioSubMenu('艺术家图片自动下载', ['启用', '禁用'], libSet.explorerArtistImageDLAuto, [true, false], (state) => {
			libSet.explorerArtistImageDLAuto = state;

			if (!libSet.explorerArtistImageDLAuto) {
				updateLibraryExplorerSettings();
				return;
			}

			const msg = grm.msg.getMessage('menu', 'explorerArtistImageDLAutoEnable');
			const msgFb = grm.msg.getMessage('menu', 'explorerArtistImageDLAutoEnable', true);

			grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
				libSet.explorerArtistImageDLAuto = confirmed;
				updateLibraryExplorerSettings();
			});
		});
		libraryExplorerDownloadsMenu.createRadioSubMenu('艺术家图片下载量', [' 1 图片 （缓存较小）', ' 5 图片', '10 图片', '15 图片', '20 图片 （缓存较大）'], libSet.explorerArtistImageDLCount, [1, 5, 10, 15, 20], (count) => {
			libSet.explorerArtistImageDLCount = count;
			updateLibraryExplorerSettings();
		});
		libraryExplorerDownloadsMenu.createRadioSubMenu('艺术家图片下载质量', ['中等质量（缓存较小）', '原始质量（缓存较大）'], libSet.explorerArtistImageDLQuality, ['medium', 'original'], (quality) => {
			libSet.explorerArtistImageDLQuality = quality;
			updateLibraryExplorerSettings();
		});
		libraryExplorerDownloadsMenu.addSeparator();
		libraryExplorerDownloadsMenu.createRadioSubMenu('缺失版本图片自动下载', ['启用', '禁用'], libSet.explorerMissingReleasesImageDLAuto, [true, false], (state) => {
			libSet.explorerMissingReleasesImageDLAuto = state;

			if (!libSet.explorerMissingReleasesImageDLAuto) {
				updateLibraryExplorerSettings();
				return;
			}

			const msg = grm.msg.getMessage('menu', 'explorerMissingSimilarImageDLAutoEnable');
			const msgFb = grm.msg.getMessage('menu', 'explorerMissingSimilarImageDLAutoEnable', true);

			grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
				libSet.explorerMissingReleasesImageDLAuto = confirmed;
				updateLibraryExplorerSettings();
			});
		});
		libraryExplorerDownloadsMenu.createRadioSubMenu('相似艺术家图片自动下载', ['启用', '禁用'], libSet.explorerSimilarArtistImageDLAuto, [true, false], (state) => {
			libSet.explorerSimilarArtistImageDLAuto = state;

			if (!libSet.explorerSimilarArtistImageDLAuto) {
				updateLibraryExplorerSettings();
				return;
			}

			const msg = grm.msg.getMessage('menu', 'explorerMissingSimilarImageDLAutoEnable');
			const msgFb = grm.msg.getMessage('menu', 'explorerMissingSimilarImageDLAutoEnable', true);

			grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
				libSet.explorerSimilarArtistImageDLAuto = confirmed;
				updateLibraryExplorerSettings();
			});
		});
		libraryExplorerDownloadsMenu.appendTo(libraryExplorerMenu);

		// * MISSING RELEASES * //
		const libraryExplorerMissingReleasesMenu = new Menu('缺失版本');
		libraryExplorerMissingReleasesMenu.createRadioSubMenu('来源', ['Discogs', 'Last.fm', 'MusicBrainz'], libSet.explorerMissingReleasesFetchSource, ['discogs', 'lastfm', 'musicbrainz'], (source) => {
			libSet.explorerMissingReleasesFetchSource = source;
			updateLibraryExplorerSettings();
		});
		libraryExplorerMissingReleasesMenu.appendTo(libraryExplorerMenu);

		// * POPULARITY * //
		const libraryExplorerPopularityMenu = new Menu('热门');
		libraryExplorerPopularityMenu.createRadioSubMenu('来源', ['Last.fm', 'ListenBrainz'], libSet.explorerPopularityFetchSource, ['lastfm', 'listenbrainz'], (source) => {
			libSet.explorerPopularityFetchSource = source;
			updateLibraryExplorerSettings();
		});
		libraryExplorerPopularityMenu.appendTo(libraryExplorerMenu);

		// * SIMILAR ARTISTS * //
		const libraryExplorerSimilarArtistMenu = new Menu('相似艺术家');
		libraryExplorerSimilarArtistMenu.createRadioSubMenu('查看', ['本地', '外部'], libSet.explorerSimilarArtistView, ['local', 'external'], (view) => {
			libSet.explorerSimilarArtistView = view;
			updateLibraryExplorerSettings();
			lib.ex.similar.loadSimilarArtistView(lib.ex.data.artistOrigName, lib.ex.main.state.artistIndex);
		});
		libraryExplorerSimilarArtistMenu.createRadioSubMenu('来源', ['Last.fm', 'ListenBrainz'], libSet.explorerSimilarArtistFetchSource, ['lastfm', 'listenbrainz'], (source) => {
			libSet.explorerSimilarArtistFetchSource = source;
			updateLibraryExplorerSettings();
			lib.ex.similar.loadSimilarArtistView(lib.ex.data.artistOrigName, lib.ex.main.state.artistIndex);
		});
		libraryExplorerSimilarArtistMenu.createRadioSubMenu('获取限制（外部）', ['10', '25', '50', '100', '250'], libSet.explorerSimilarArtistFetchLimitExternal, [10, 25, 50, 100, 250], (limit) => {
			libSet.explorerSimilarArtistFetchLimitExternal = limit;
			updateLibraryExplorerSettings();
			lib.ex.similar.loadSimilarArtistView(lib.ex.data.artistOrigName, lib.ex.main.state.artistIndex);
		});
		libraryExplorerSimilarArtistMenu.appendTo(libraryExplorerMenu);

		// * SORT * //
		const libraryExplorerSortMenu = new Menu('排序');
		const libraryExplorerSortAlbumViewMenu = new Menu('查看专辑');
		libraryExplorerSortAlbumViewMenu.addRadioItems(['升序', '降序'], libSet.explorerSortDirAlbum, ['ASC', 'DSC'], (sort) => {
			libSet.explorerSortDirAlbum = sort;
			updateLibraryExplorerSettings();
		});
		libraryExplorerSortAlbumViewMenu.addSeparator();
		libraryExplorerSortAlbumViewMenu.addRadioItems(['音轨号', '音轨标题', '音轨评级', '播放计数', '队列', '添加时间', '首次播放', '最近播放'], libSet.explorerSortArtist, ['Track number', 'Track title', 'Track rating', 'Playcount', 'Queue', 'Added', 'First played', 'Last played'], (sort) => {
			libSet.explorerSortArtist = sort;
			updateLibraryExplorerSettings();
		});
		libraryExplorerSortAlbumViewMenu.appendTo(libraryExplorerSortMenu);

		const libraryExplorerSortArtistViewMenu = new Menu('查看艺术家');
		libraryExplorerSortArtistViewMenu.addRadioItems(['升序', '降序'], libSet.explorerSortDirArtist, ['ASC', 'DSC'], (sort) => {
			libSet.explorerSortDirArtist = sort;
			updateLibraryExplorerSettings();
		});
		libraryExplorerSortArtistViewMenu.addSeparator();
		libraryExplorerSortArtistViewMenu.addRadioItems(['专辑标题', '专辑评级', '播放计数', '音轨计数', '年份', '添加时间', '首次播放', '最近播放'], libSet.explorerSortArtist, ['Album title', 'Album rating', 'Playcount', 'Track count', 'Year', 'Added', 'First played', 'Last played'], (sort) => {
			libSet.explorerSortArtist = sort;
			updateLibraryExplorerSettings();
		});
		libraryExplorerSortArtistViewMenu.appendTo(libraryExplorerSortMenu);

		const libraryExplorerSortSimilarArtistViewMenu = new Menu('查看相似艺术家');
		libraryExplorerSortSimilarArtistViewMenu.addRadioItems(['升序', '降序'], libSet.explorerSortDirSimilar, ['ASC', 'DSC'], (sort) => {
			libSet.explorerSortDirSimilar = sort;
			updateLibraryExplorerSettings();
		});
		libraryExplorerSortSimilarArtistViewMenu.addSeparator();
		libraryExplorerSortSimilarArtistViewMenu.addRadioItems(['相似度', '艺术家名', '播放计数', '音轨计数', '添加时间', '首次播放', '首次播放'], libSet.explorerSortArtist, ['Similarity', 'Artist name', 'Playcount', 'Track count', 'Added', 'First played', 'Last played'], (sort) => {
			libSet.explorerSortArtist = sort;
			updateLibraryExplorerSettings();
		});
		libraryExplorerSortSimilarArtistViewMenu.appendTo(libraryExplorerSortMenu);
		libraryExplorerSortMenu.appendTo(libraryExplorerMenu);

		// * STATS* //
		const libraryExplorerStatsMenu = new Menu('统计');
		const libraryExplorerStatsAlbumViewMenu = new Menu('查看专辑');
		libraryExplorerStatsAlbumViewMenu.addRadioItems(['比特率', '时长', '总大小', '评级', '日期', '队列', '播放计数', '音轨计数', '首次播放', '首次播放', '添加时间'], libSet.explorerStatsAlbum, ['bitrate', 'duration', 'size', 'rating', 'popularity', 'date', 'queue', 'playcount', 'trackcount', 'firstPlayed', 'lastPlayed', 'added'], (stats) => {
			libSet.explorerStatsAlbum = stats;
			updateLibraryExplorerSettings();
		});
		libraryExplorerStatsAlbumViewMenu.appendTo(libraryExplorerStatsMenu);

		const libraryExplorerStatsArtistViewMenu = new Menu('查看艺术家');
		libraryExplorerStatsArtistViewMenu.addRadioItems(['比特率', '时长', '总大小', '评级', '日期', '队列', '播放计数', '音轨计数', '首次播放', '首次播放', '添加时间'], libSet.explorerStatsArtist, ['bitrate', 'duration', 'size', 'rating', 'popularity', 'date', 'queue', 'playcount', 'trackcount', 'firstPlayed', 'lastPlayed', 'added'], (stats) => {
			libSet.explorerStatsArtist = stats;
			updateLibraryExplorerSettings();
		});
		libraryExplorerStatsArtistViewMenu.appendTo(libraryExplorerStatsMenu);

		const libraryExplorerStatsSimilarArtistViewMenu = new Menu('查看相似艺术家');
		libraryExplorerStatsSimilarArtistViewMenu.addRadioItems(['比特率', '时长', '总大小', '评级', '日期', '队列', '播放计数', '音轨计数', '首次播放', '首次播放', '添加时间'], libSet.explorerStatsSimilar, ['bitrate', 'duration', 'size', 'rating', 'popularity', 'date', 'queue', 'playcount', 'trackcount', 'firstPlayed', 'lastPlayed', 'added'], (stats) => {
			libSet.explorerStatsSimilar = stats;
			updateLibraryExplorerSettings();
		});
		libraryExplorerStatsSimilarArtistViewMenu.appendTo(libraryExplorerStatsMenu);
		libraryExplorerStatsMenu.appendTo(libraryExplorerMenu);

		libraryExplorerMenu.appendTo(libraryMenu);

		if (!context_menu) libraryMenu.appendTo(menu);
	}
	// #endregion

	// * BIOGRAPHY * //
	// #region BIOGRAPHY
	/**
	 * Top menu > Options > Biography.
	 * @param {Menu} menu - Creates the Biography panel menu via a new Menu instance.
	 * @param {boolean} context_menu - Appends Biography panel options to context menu.
	 * @protected
	 */
	biographyOptions(menu, context_menu) {
		const biographyMenu = context_menu ? menu : new Menu('简介');
		const biographyLayoutMenu = new Menu('布局');

		// * LAYOUT * //
		if (grSet.layout === 'default') {
			biographyLayoutMenu.addRadioItems(['常规', '完整'], grSet.biographyLayout, ['normal', 'full'], (width) => {
				grSet.biographyLayout = width;
				grm.ui.initBiographyLayoutState();
			});
			biographyLayoutMenu.addSeparator();
			biographyLayoutMenu.addToggleItem('使用完整预设', grSet, 'biographyLayoutFullPreset', () => { window.Repaint(); });
			biographyLayoutMenu.addSeparator();
		}
		biographyLayoutMenu.addRadioItems(['顶部 （默认）', '右侧', '底部', '左侧', '全部叠加', '部分叠加'], bioSet.style, [0, 1, 2, 3, 4, 5], (layout) => {
			bioSet.style = layout;
			bio.ui.updateProp(1);
		});
		biographyLayoutMenu.addSeparator();
		const biographyFilmstripMenu = new Menu('幻灯片');
		biographyFilmstripMenu.addRadioItems(['顶部', '右侧', '底部', '左侧 （默认）'], bioSet.filmStripPos, [0, 1, 2, 3], (pos) => {
			bioSet.filmStripPos = pos;
			bio.ui.updateProp(1);
		});
		biographyFilmstripMenu.addSeparator();
		biographyFilmstripMenu.addToggleItem('叠加图片区域', bioSet, 'filmStripOverlay', () => { bio.ui.updateProp(1); });
		biographyFilmstripMenu.appendTo(biographyLayoutMenu);
		biographyLayoutMenu.appendTo(biographyMenu);

		// * THEME * //
		const biographyThemeMenu = new Menu('主题');
		biographyThemeMenu.addRadioItems(['Georgia-ReBORN', '深色', '融合', '浅色'], grSet.biographyTheme, [0, 1, 2, 3], (theme) => {
			grSet.biographyTheme = theme;
			bioSet.theme = grSet.biographyTheme;
			grm.ui.initTheme();
			bio.call.on_colours_changed();
			bio.ui.updateProp(1);
		});
		biographyThemeMenu.appendTo(biographyMenu);

		// * DISPLAY * //
		const biographyDisplayMenu = new Menu('显示');
		biographyDisplayMenu.addRadioItems(['图片 + 文本', '图片', '文本'], grSet.biographyDisplay, ['Image+text', 'Image', 'Text'], (display) => {
			grSet.biographyDisplay = display;
			grm.ui.setBiographyDisplay();
			bio.ui.updateProp(1);
		});
		biographyDisplayMenu.addSeparator();
		biographyDisplayMenu.addToggleItem('幻灯片', bioSet, 'showFilmStrip', () => { bio.ui.updateProp(1); });
		biographyDisplayMenu.addToggleItem('图片导航器', bioSet, 'imgSeekerShow', () => { bio.ui.updateProp(1); });
		biographyDisplayMenu.addToggleItem('标题', bioSet, 'heading', () => { bio.ui.updateProp(1); });
		biographyDisplayMenu.addToggleItem('摘要', bioSet, 'summaryShow', () => { bio.ui.updateProp(1); });
		biographyDisplayMenu.addSeparator();
		biographyDisplayMenu.addToggleItem(bioSet.summaryCompact ? '展开摘要' : '紧凑摘要', bioSet, 'summaryCompact', () => { bio.ui.updateProp(1); });
		biographyDisplayMenu.addSeparator();
		biographyDisplayMenu.addRadioItems(['艺术家视图', '专辑视图'], bioSet.artistView, [true, false], (view) => {
			bioSet.artistView = view;
			bio.ui.updateProp(1);
		});
		biographyDisplayMenu.addSeparator();
		biographyDisplayMenu.addRadioItems(['更喜欢正在播放', '跟随选中的音轨 （播放列表）'], bioSet.focus, [false, true], (view) => {
			bioSet.focus = view;
			bio.ui.updateProp(1);
		});
		biographyDisplayMenu.appendTo(biographyMenu);

		// * BACKGROUND * //
		const biographyBackgroundMenu = new Menu('背景');
		biographyBackgroundMenu.addToggleItem('背景上显示图片', grSet, 'biographyBgImg', () => {
			if (grSet.biographyBgImg) {
				grm.bgImg.initBgImage('biography');
			} else {
				grm.bgImg.clearBgImageCache('biography');
			}
			grm.bgImg.initBgImageCycle();
			window.Repaint();
		});
		biographyBackgroundMenu.addSeparator();
		biographyBackgroundMenu.addToggleItem('图片', grSet, 'biographyBgImgCycle', () => {
			grm.bgImg.initBgImageCycle();
			window.Repaint();
		});
		biographyBackgroundMenu.createRadioSubMenu('循环时间', ['  5 秒', '10 秒', '15 秒 (默认)', '30 秒', '60 秒'], grSet.biographyBgImgCycleTime, [5, 10, 15, 30, 60], (time) => {
			grSet.biographyBgImgCycleTime = time;
			grm.bgImg.initBgImageCycle();
			window.Repaint();
		});
		biographyBackgroundMenu.addSeparator();
		const biographyBackgroundImageSourceMenu = new Menu('图片来源');
		biographyBackgroundImageSourceMenu.addRadioItems(['艺术家', '专辑', '自定义'], grSet.biographyBgImgSource, ['artist', 'album', 'custom'], (source) => {
			grSet.biographyBgImgSource = source;
			grm.bgImg.initBgImage('biography', true);
			window.Repaint();
		});
		biographyBackgroundImageSourceMenu.addSeparator();
		biographyBackgroundImageSourceMenu.addToggleItem('过滤专辑封面图片', grSet, 'biographyBgImgAlbumArtFilter', () => {
			window.Reload();
		});
		biographyBackgroundImageSourceMenu.appendTo(biographyBackgroundMenu);
		biographyBackgroundMenu.createRadioSubMenu('图片缩放', ['比例', '填充', '拉伸'], grSet.biographyBgImgScale, ['default', 'filled', 'stretched'], (scale) => {
			grSet.biographyBgImgScale = scale;
			grm.bgImg.initBgImage('biography', true);
			window.Repaint();
		});
		biographyBackgroundMenu.createRadioSubMenu('图片不透明度', ['100%', '90%', '80%', '70%', '60%', '50%', '40%', '30%', '20%', '10%'], grSet.biographyBgImgOpacity, [255, 230, 204, 178, 153, 128, 102, 76, 51, 25], value => {
			grSet.biographyBgImgOpacity = value;
			window.Repaint();
		});
		biographyBackgroundMenu.addSeparator();
		biographyBackgroundMenu.createRadioSubMenu('行不透明度', ['100%', '90%', '80%', '70%', '60%', '50%', '40%', '30%', '20%', '10%'], grSet.biographyBgRowOpacity, [255, 230, 204, 178, 153, 128, 102, 76, 51, 25], value => {
			grSet.biographyBgRowOpacity = value;
			window.Repaint();
		});
		biographyBackgroundMenu.appendTo(biographyMenu);

		// * LYRICS * //
		const biographyLyricsMenu = new Menu('歌词');
		const biographyLyricsDisplayMenu = new Menu('显示');
		const biographyLyricsAnimationMenu = new Menu('动画');
		biographyLyricsAnimationMenu.addRadioItems([
			'线性', '平滑步进', '平滑步进+',
			'正弦   淡出', '二次方淡出 (默认)', '三次方淡出', '四次方淡出',
			'正弦   淡入淡出', '二次方淡入淡出', '三次方淡入淡出'
		], grSet.lyricsScrollEasing, [
			'linear', 'smoothStep', 'smootherStep',
			'easeOutSine', 'easeOutQuad', 'easeOutCubic', 'easeOutQuart',
			'easeInOutSine', 'easeInOutQuad', 'easeInOutCubic'
		], (easing) => {
			grSet.lyricsScrollEasing = easing;
			window.Repaint();
		}, false, false, [2, 6]);
		biographyLyricsAnimationMenu.appendTo(biographyLyricsDisplayMenu);

		biographyLyricsDisplayMenu.createRadioSubMenu('显示投影', ['无', '小', '常规', '大'], bioSet.lyricsDropShadowLevel, ['none', 'small', 'normal', 'large'], (size) => {
			bioSet.lyricsDropShadowLevel = size;
			window.Repaint();
		});
		biographyLyricsDisplayMenu.addSeparator();
		biographyLyricsDisplayMenu.addToggleItem('滚动淡入淡出', bioSet, 'lyricsFadeScroll', () => {
			window.Repaint();
		});
		biographyLyricsDisplayMenu.addSeparator();
		biographyLyricsDisplayMenu.createRadioSubMenu('显示透明遮罩', ['无', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%'], bioSet.lyricsTransparentMask, [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], (percent) => {
			bioSet.lyricsTransparentMask = percent;
			window.Repaint();
		});
		biographyLyricsDisplayMenu.addSeparator();
		biographyLyricsDisplayMenu.addToggleItem('增大高亮字体', bioSet, 'lyricsLargerCurrentSync', () => {
			bio.lyrics.loadLyrics(bio.lyrics.lyr);
			window.Repaint();
		});
		biographyLyricsDisplayMenu.addSeparator();
		const biographyLyricsKaraokeMenu = new Menu('卡拉 OK 高亮');
		biographyLyricsKaraokeMenu.addItem('自动（默认）', grSet.lyricsKaraokeMode !== 'off', () => {
			grSet.lyricsKaraokeMode = 'auto';
			window.Repaint();
		});
		biographyLyricsKaraokeMenu.addItem('关闭', grSet.lyricsKaraokeMode === 'off', () => {
			grSet.lyricsKaraokeMode = 'off';
			window.Repaint();
		});
		biographyLyricsKaraokeMenu.appendTo(biographyLyricsDisplayMenu);
		const biographyLyricsKaraokeStyleMenu = new Menu('卡拉 OK 扫亮样式');
		biographyLyricsKaraokeStyleMenu.addItem('纯色', grSet.lyricsKaraokeStyle === 'solid', () => {
			grSet.lyricsKaraokeStyle = 'solid';
			window.Repaint();
		});
		biographyLyricsKaraokeStyleMenu.addItem('柔和渐变', grSet.lyricsKaraokeStyle === 'gradient', () => {
			grSet.lyricsKaraokeStyle = 'gradient';
			window.Repaint();
		});
		biographyLyricsKaraokeStyleMenu.addItem('主题色渐变（默认）', !['solid', 'gradient'].includes(grSet.lyricsKaraokeStyle), () => {
			grSet.lyricsKaraokeStyle = 'duotone';
			window.Repaint();
		});
		biographyLyricsKaraokeStyleMenu.appendTo(biographyLyricsDisplayMenu);
		biographyLyricsDisplayMenu.appendTo(biographyLyricsMenu);

		const biographyLricsSpacingMenu = new Menu('间距');
		biographyLricsSpacingMenu.createRadioSubMenu('行', ['20 像素', '24 像素', '28 像素', '32 像素', '36 像素', '40 像素 (默认)', '44 像素', '48 像素', '52 像素', '56 像素', '60 像素'], bioSet.lyricsLineSpacing,
			[20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60], (size) => {
			bioSet.lyricsLineSpacing = size;
			bio.lyrics.loadLyrics(bio.lyrics.lyr);
		});
		biographyLricsSpacingMenu.createRadioSubMenu('句子', ['10 像素', '14 像素', '18 像素', '22 像素', '26 像素', '30 像素 (默认)', '34 像素', '38 像素', '42 像素', '46 像素', '50 像素'], bioSet.lyricsSentenceSpacing,
			[10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50], (size) => {
			bioSet.lyricsSentenceSpacing = size;
			bio.lyrics.loadLyrics(bio.lyrics.lyr);
		});
		biographyLricsSpacingMenu.appendTo(biographyLyricsMenu);

		const biographyLyricsScrollSpeedMenu = new Menu('滚动速度');
		biographyLyricsScrollSpeedMenu.addToggleItem('自适应滚动速度', bioSet, 'lyricsScrollAdaptive', () => {
			bio.lyrics.loadLyrics(bio.lyrics.lyr);
			window.Repaint();
		});
		biographyLyricsScrollSpeedMenu.addSeparator(); //增加分隔线
		biographyLyricsScrollSpeedMenu.addRadioItems(['最快 (非常慢 CPU)', '快速', '常规', '慢速', '最慢 (非常快 CPU)'], bioSet.lyricsScrollSpeed, ['fastest', 'fast', 'normal', 'slow', 'slowest'], (speed) => {
			bioSet.lyricsScrollSpeed = speed;
			switch (speed) {
				case 'fastest':
					bioSet.lyricsScrollRateAvg = 300;
					bioSet.lyricsScrollRateMax = 150;
					break;
				case 'fast':
					bioSet.lyricsScrollRateAvg = 500;
					bioSet.lyricsScrollRateMax = 250;
					break;
				case 'normal':
					bioSet.lyricsScrollRateAvg = 750;
					bioSet.lyricsScrollRateMax = 375;
					break;
				case 'slow':
					bioSet.lyricsScrollRateAvg = 1000;
					bioSet.lyricsScrollRateMax = 500;
					break;
				case 'slowest':
					bioSet.lyricsScrollRateAvg = 1500;
					bioSet.lyricsScrollRateMax = 725;
					break;
			}
			bio.lyrics.loadLyrics(bio.lyrics.lyr);
			window.Repaint();
		});
		biographyLyricsScrollSpeedMenu.appendTo(biographyLyricsMenu);

		const biographyLyricsTranslationMenu = new Menu('翻译');
		biographyLyricsTranslationMenu.addToggleItem('显示翻译', bioSet, 'lyricsTranslation', () => {
			bio.lyrics.loadLyrics(bio.lyrics.lyr);
			window.Repaint();
		});
		biographyLyricsTranslationMenu.addSeparator();
		biographyLyricsTranslationMenu.addRadioItems(['原文行高亮显示', '译文行高亮显示', '双   行高亮显示'], bioSet.lyricsTranslationHighlightMode, [1, 2, 3], (mode) => {
			bioSet.lyricsTranslationHighlightMode = mode;
			bio.lyrics.loadLyrics(bio.lyrics.lyr);
			window.Repaint();
		});
		biographyLyricsTranslationMenu.addToggleItem('仅显示当前翻译', bioSet, 'lyricsTranslationCurrentOnly', () => {
			bio.lyrics.loadLyrics(bio.lyrics.lyr);
			window.Repaint();
		}, !bioSet.lyricsTranslation);
		biographyLyricsTranslationMenu.addToggleItem('拖动时显示所有行', bioSet, 'lyricsTranslationScrollReveal', () => {
			window.Repaint();
		}, !bioSet.lyricsTranslation || !bioSet.lyricsTranslationCurrentOnly);
		biographyLyricsTranslationMenu.addSeparator();
		biographyLyricsTranslationMenu.createRadioSubMenu('显出动画持续时间', ['  禁用', '  100 毫秒', '  200 毫秒', '  300 毫秒', '  400 毫秒', '  500 毫秒 (默认)', '  600 毫秒', '  700 毫秒', '  800 毫秒', '  900 毫秒', '1000 毫秒'], bioSet.lyricsTranslationRevealDuration, [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], (duration) => {
			bioSet.lyricsTranslationRevealDuration = duration;
			window.Repaint();
		}, !bioSet.lyricsTranslation || !bioSet.lyricsTranslationCurrentOnly || !bioSet.lyricsTranslationScrollReveal, false, [0]);
		biographyLyricsTranslationMenu.createRadioSubMenu('显出动画折叠时间', ['禁用', '  1 秒', '  2 秒', '  3 秒 (默认)', '  4 秒', '  5 秒', '  6 秒', '  7 秒', '  8 秒', '  9 秒', '10 秒'], bioSet.lyricsTranslationRevealCollapse, [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000], (delay) => {
			bioSet.lyricsTranslationRevealCollapse = delay;
			window.Repaint();
		}, !bioSet.lyricsTranslation || !bioSet.lyricsTranslationCurrentOnly || !bioSet.lyricsTranslationScrollReveal, false, [0]);
		biographyLyricsTranslationMenu.appendTo(biographyLyricsMenu);
		biographyLyricsMenu.appendTo(biographyMenu);

		// * SOURCES * //
		const biographySourcesMenu = new Menu('来源');
		const biographySourcesTextMenu = new Menu('文本');
		if (!bioSet.sourceAll) {
			biographySourcesTextMenu.addRadioItems(['自动回退', '静态'], bioSet.lockBio, [false, true], (source) => {
				bioSet.lockBio = source;
				if (bioSet.sourceAll) {
					bioSet.lockBio = false;
				} else {
					bioSet.lockRev = bioSet.lockBio;
				}
				bio.ui.updateProp(1);
			}, !bioSet.sourceAll);
			biographySourcesTextMenu.addSeparator();
		}
		biographySourcesTextMenu.addToggleItem('合并', bioSet, 'sourceAll', () => {
			bioSet.lockBio = false;
			bioSet.lockRev = false;
			bio.ui.updateProp(1);
		});
		biographySourcesTextMenu.addSeparator();
		biographySourcesTextMenu.addToggleItem('更喜欢 （allmusic 和维基百科评论） 组合方式', bioSet, 'classicalMusicMode', () => {
			bioCfg.classicalModeEnable = !bioCfg.classicalModeEnable;
			bioSet.classicalAlbFallback = bioSet.classicalMusicMode;
			bio.ui.updateProp(1);
		});
		biographySourcesTextMenu.appendTo(biographySourcesMenu);

		biographySourcesMenu.createRadioSubMenu('照片', ['从下载文件夹循环', '从自定义文件夹循环 [回退到上面]', '艺术家 （单张图片 [fb2k：参数选项>显示]）'], bioSet.cycPhotoLocation, [0, 1, 2], (location) => {
			bioSet.cycPhotoLocation = location;
			if (location === 0) {
				bioSet.cycPhoto = true;
			}
			else if (location === 1 && !bioSet.get('面板简介 - 系统: 照片文件夹检查', false)) {
				const msg = grm.msg.getMessage('menu', 'cycPhotoLocation');
				fb.ShowPopupMessage(msg, '简介: 循环照片的自定义文件夹');
				bioSet.set('面板简介 - 系统: 照片文件夹检查', true);
				bioSet.cycPhoto = true;
				bio.img.artistReset();
			}
			else if (location === 2) {
				bioSet.cycPhoto = false;
			}
			bio.img.updImages();
		});

		const biographySourcesCoverMenu = new Menu('封面');
		if (!bioSet.loadCovAllFb && !bioSet.loadCovFolder) {
			biographySourcesCoverMenu.addRadioItems(['封面', '封底', '碟片', '图标', '艺术家'], bioSet.covType, [0, 1, 2, 3, 4], (type) => {
				bioSet.covType = type;
				bio.img.cov.selection = [0, -1, -1, -1, -1];
				bio.img.cov.selFiltered = [0];
				bio.img.getImages();
			}, bioSet.loadCovFolder);
		} else {
			biographySourcesCoverMenu.addToggleItems(['封面', '封底', '碟片', '图标', '艺术家'], bio.img.cov.selection, [0, 1, 2, 3, 4], (type) => {
				!bioSet.loadCovAllFb ? bioSet.covType = type : bio.img.cov.selection[type] = bio.img.cov.selection[type] === -1 ? type : -1;
				bio.img.cov.selFiltered = bio.img.cov.selection.filter(v => v !== -1);
				if (!bio.img.cov.selFiltered.length) {
					bio.img.cov.selection = [0, -1, -1, -1, -1];
					bio.img.cov.selFiltered = [0];
				}
				bioSet.loadCovSelFb = JSON.stringify(bio.img.cov.selection);
				!bioSet.loadCovAllFb ? bio.img.getImages() : bio.img.check();
			}, !bioSet.loadCovAllFb && bioSet.loadCovFolder);
		}
		biographySourcesCoverMenu.addSeparator();
		biographySourcesCoverMenu.addToggleItem('以上循环', bioSet, 'loadCovAllFb', () => {
			bioSet.loadCovAllFb = !bioSet.loadCovAllFb;
			bio.img.toggle('loadCovAllFb');
		});
		biographySourcesCoverMenu.addToggleItem('从下载文件夹循环', bioSet, 'loadCovFolder', () => {
			bioSet.loadCovFolder = !bioSet.loadCovFolder;
			bio.img.toggle('loadCovFolder');
			if (bioSet.loadCovFolder) {
				const msg = grm.msg.getMessage('menu', 'loadCovFolder');
				fb.ShowPopupMessage(msg, '简介: 加载文件夹以循环封面');
			}
		});
		biographySourcesCoverMenu.appendTo(biographySourcesMenu);

		const biographySourcesOpenFileLocationMenu = new Menu('打开文件位置');
		biographySourcesOpenFileLocationMenu.addItem('图片', false, () => {
			const imgInfo = bio.img.pth();
			bio.men.path.img = imgInfo.imgPth;
			OpenExplorer(`explorer /select, "${bio.men.path.img}"`, false);
		});
		biographySourcesOpenFileLocationMenu.addSeparator();
		if (bio.txt.bio.am.length || bio.txt.rev.am.length) {
			biographySourcesOpenFileLocationMenu.addItem(bioSet.artistView ? '简介 [allmusic]' : '评论 [allmusic]', false, () => {
				bio.men.path.am = bioSet.artistView ? bio.txt.bioPth('Am') : bio.txt.revPth('Am');
				OpenExplorer(`explorer /select, "${bio.men.path.am[1]}"`, false);
			});
		}
		if (bio.txt.bio.lfm.length || bio.txt.rev.lfm.length) {
			biographySourcesOpenFileLocationMenu.addItem(bioSet.artistView ? '简介 [last.fm]' : '评论 [last.fm]', false, () => {
				bio.men.path.lfm = bioSet.artistView ? bio.txt.bioPth('Lfm') : bio.txt.revPth('Lfm');
				OpenExplorer(`explorer /select, "${bio.men.path.lfm[1]}"`, false);
			});
		}
		if (bio.txt.bio.wiki.length || bio.txt.rev.wiki.length) {
			biographySourcesOpenFileLocationMenu.addItem(bioSet.artistView ? '简介 [维基百科]' : '评论 [维基百科]', false, () => {
				bio.men.path.wiki = bioSet.artistView ? bio.txt.bioPth('Wiki') : bio.txt.revPth('Wiki');
				OpenExplorer(`explorer /select, "${bio.men.path.wiki[1]}"`, false);
			});
		}
		if (bio.lyrics.lyrics.length) {
			biographySourcesOpenFileLocationMenu.addItem('歌词', false, () => {
				bio.men.path.txt = bioSet.artistView ? bio.txt.txtReaderPth() : bio.txt.txtRevPth();
				OpenExplorer(`explorer /select, "${bio.men.path.txt[1]}"`, false);
			});
		}
		biographySourcesMenu.addSeparator();
		biographySourcesOpenFileLocationMenu.appendTo(biographySourcesMenu);

		biographySourcesMenu.addItem('强制更新', false, () => {
			bio.panel.callServer(1, bio.panel.id.focus, 'bio_forceUpdate', 0);
			bio.ui.updateProp(1);
		});
		biographySourcesMenu.appendTo(biographyMenu);

		// * IMAGES * //
		const biographyImageMenu = new Menu('图片');
		const biographyImageDefaultMenu = new Menu('图片 + 文本');
		biographyImageDefaultMenu.createRadioSubMenu('照片', ['常规', '自动填充 （默认）', '圆形'], bioSet.artStyleDual, [0, 1, 2], (style) => {
			bioSet.artStyleDual = style;
			bio.ui.updateProp(1);
		});
		biographyImageDefaultMenu.addToggleItem('倒影', bioSet, 'artReflDual', () => { bioSet.artShadowDual = false; bio.ui.updateProp(1); });
		biographyImageDefaultMenu.addToggleItem('阴影', bioSet, 'artShadowDual', () => { bioSet.artReflDual = false; bio.ui.updateProp(1); });
		biographyImageDefaultMenu.addSeparator();
		biographyImageDefaultMenu.createRadioSubMenu('封面', ['常规', '自动填充 （默认）', '圆形'], bioSet.covStyleDual, [0, 1, 2], (style) => {
			bioSet.covStyleDual = style;
			bio.ui.updateProp(1);
		});
		biographyImageDefaultMenu.addToggleItem('倒影', bioSet, 'covReflDual', () => { bioSet.covShadowDual = false; bio.ui.updateProp(1); });
		biographyImageDefaultMenu.addToggleItem('阴影', bioSet, 'covShadowDual', () => { bioSet.covReflDual = false; bio.ui.updateProp(1); });

		biographyImageDefaultMenu.appendTo(biographyImageMenu);
		const biographyImageOnlyMenu = new Menu('仅图片');
		biographyImageOnlyMenu.createRadioSubMenu('照片', ['常规', '自动填充 （默认）', '圆形'], bioSet.artStyleImgOnly, [0, 1, 2], (style) => {
			bioSet.artStyleImgOnly = style;
			bio.ui.updateProp(1);
		});
		biographyImageOnlyMenu.addToggleItem('倒影', bioSet, 'artReflImgOnly', () => { bioSet.artShadowImgOnly = false; bio.ui.updateProp(1); });
		biographyImageOnlyMenu.addToggleItem('阴影', bioSet, 'artShadowImgOnly', () => { bioSet.artReflImgOnly = false; bio.ui.updateProp(1); });
		biographyImageOnlyMenu.addSeparator();
		biographyImageOnlyMenu.createRadioSubMenu('封面', ['常规', '自动填充 （默认）', '圆形'], bioSet.covStyleImgOnly, [0, 1, 2], (style) => {
			bioSet.covStyleImgOnly = style;
			bio.ui.updateProp(1);
		});
		biographyImageOnlyMenu.addToggleItem('倒影', bioSet, 'covReflImgOnly', () => { bioSet.covShadowImgOnly = false; bio.ui.updateProp(1); });
		biographyImageOnlyMenu.addToggleItem('阴影', bioSet, 'covShadowImgOnly', () => { bioSet.covReflImgOnly = false; bio.ui.updateProp(1); });
		biographyImageOnlyMenu.appendTo(biographyImageMenu);

		const biographyImageFilmstripMenu = new Menu('幻灯片');
		biographyImageFilmstripMenu.createRadioSubMenu('照片', ['常规', '自动填充 （默认）', '圆形'], bioSet.filmPhotoStyle, [0, 1, 2], (style) => {
			bioSet.filmPhotoStyle = style;
			bio.ui.updateProp(1);
		});
		biographyImageFilmstripMenu.createRadioSubMenu('封面', ['常规', '自动填充 （默认）', '圆形'], bioSet.filmCoverStyle, [0, 1, 2], (style) => {
			bioSet.filmCoverStyle = style;
			bio.ui.updateProp(1);
		});
		biographyImageFilmstripMenu.appendTo(biographyImageMenu);
		biographyImageMenu.addSeparator();

		const biographyImageDownloadMenu = new Menu('下载');
		biographyImageDownloadMenu.addRadioItems(['  禁用', '  5 图片', '10 图片 （默认）', '15 图片', '20 图片'], bioCfg.photoNum, [0, 5, 10, 15, 20], (num) => {
			bioCfg.photoNum = num;
			bio.ui.updateProp(1);
		}, false, false, [0]);
		biographyImageDownloadMenu.appendTo(biographyImageMenu);
		biographyImageMenu.addSeparator();

		const biographyImageAutoCycleMenu = new Menu('自动循环');
		biographyImageAutoCycleMenu.addToggleItem('自动循环', bioSet, 'cycPic', () => { bio.ui.updateProp(1); });
		biographyImageAutoCycleMenu.addSeparator();
		biographyImageAutoCycleMenu.addToggleItem('平滑过渡', bioSet, 'imgSmoothTrans', () => { bio.ui.updateProp(1); });
		biographyImageAutoCycleMenu.addSeparator();
		biographyImageAutoCycleMenu.addRadioItems(['  5 秒', '10 秒', '15 秒 （默认）', '30 秒', '60 秒'], bioSet.cycTimePic, [5, 10, 15, 30, 60], (dur) => {
			bioSet.cycTimePic = dur;
			bio.ui.updateProp(1);
		});
		biographyImageAutoCycleMenu.appendTo(biographyImageMenu);

		biographyImageMenu.appendTo(biographyMenu);

		// * NETWORK * //
		const biographyNetworkMenu = new Menu('网络');
		if (utils.HTTPRequestAsync) {
			biographyNetworkMenu.addToggleItem(`AllMusic   ${bioSet.useUtilsAllmusic ? '(新下载方法)' : '(旧下载方法)'}`, bioSet, 'useUtilsAllmusic', () => {
				window.NotifyOthers('bio_property', [['useUtilsAllmusic', bioSet.useUtilsAllmusic]]);
			});
			biographyNetworkMenu.addToggleItem(`last.fm      ${bioSet.useUtilsLastfm ? '(新下载方法)' : '(旧下载方法)'}`, bioSet, 'useUtilsLastfm', () => {
				window.NotifyOthers('bio_property', [['useUtilsLastfm', bioSet.useUtilsLastfm]]);
			});
			biographyNetworkMenu.addToggleItem(`维基百科   ${bioSet.useUtilsWiki ? '(新下载方法)' : '(旧下载方法)'}`, bioSet, 'useUtilsWiki', () => {
				window.NotifyOthers('bio_property', [['useUtilsWiki', bioSet.useUtilsWiki]]);
			});
		}
		else {
			const parent = fb.ComponentPath.includes('foo_uie_jsplitter') ? 'foo_uie_jsplitter' : 'foo_spider_monkey_panel';
			biographyNetworkMenu.addItem(`- 不支持的 ${parent} 版本 -`, false, () => {}, true);
		}
		biographyNetworkMenu.appendTo(biographyMenu);

		if (!context_menu) biographyMenu.appendTo(menu);
	}
	// #endregion

	// * LYRICS * //
	// #region LYRICS
	/**
	 * Top menu > Options > Lyrics.
	 * @param {Menu} menu - Creates the Lyrics panel menu via a new Menu instance.
	 * @param {boolean} context_menu - Appends Lyrics panel options to context menu.
	 * @protected
	 */
	lyricsOptions(menu, context_menu) {
		const lyricsMenu = context_menu ? menu : new Menu('歌词');

		if (grSet.layout === 'default') {
			const lyricsLayoutMenu = new Menu('布局');
			lyricsLayoutMenu.addRadioItems(['常规', '完整', '居左', '居右'], grSet.lyricsLayout, ['normal', 'full', 'left', 'right'], (layout) => {
				grSet.savedLyricsLayout = grSet.lyricsLayout = layout;
				grm.ui.displayLyrics = true;
				grm.ui.initLyricsLayoutState();
			});
			lyricsLayoutMenu.appendTo(lyricsMenu);
		}

		if (grSet.layout === 'default') {
			const detailsLyricsModeMenu = new Menu('详情页歌词显示方式');
			detailsLyricsModeMenu.addRadioItems(['专辑封面歌词（默认）', 'CD 弧形滚动歌词'], grSet.detailsLyricsDisplayMode, ['cover', 'arc'], (mode) => {
				grSet.detailsLyricsDisplayMode = mode;
				// Selecting a lyric mode on Details also enables its independent visibility switch.
				if (mode === 'arc' && grm.ui.displayDetails && !grm.ui.displayLyrics) {
					grm.ui.displayLyrics = true;
					grm.lyrics.initLyrics();
				}
				grm.ui.resizeArtwork(true);
				grm.details.clearCache('metrics');
				grm.details.updateGridPos();
				if (grm.details.immersiveMode && mode === 'cover') grm.ui.prepareImmersiveLyricsBlur();
				window.Repaint();
			});
			detailsLyricsModeMenu.appendTo(lyricsMenu);
			lyricsMenu.createRadioSubMenu('CD 弧形歌词文字样式', ['水平文字（默认）', '随圆弧倾斜'],
				grm.lyrics.getCircularArcStyle(), ['horizontal', 'tilted'], (style) => {
					grSet.detailsArcLyricsStyle = style;
					window.SetProperty('TT - 圆周歌词 PRE3: 文字样式', style);
					window.Repaint();
				});
			lyricsMenu.createRadioSubMenu('CD 水平歌词行间距', ['紧凑', '标准（默认）', '舒展'],
				grm.lyrics.getCircularArcSpacing('horizontal'), [95, 100, 105], (spacing) => {
					grSet.detailsArcLyricsSpacing = spacing;
					window.Repaint();
				});
			lyricsMenu.createRadioSubMenu('CD 倾斜歌词行间距', ['紧凑', '标准（默认）', '舒展'],
				grm.lyrics.getCircularArcSpacing('tilted'), [95, 100, 110], (spacing) => {
					grSet.detailsArcLyricsTiltedSpacing = spacing;
					window.Repaint();
				});

		}

		const verticalChineseMenu = new Menu('中文传统纵排');
		verticalChineseMenu.addRadioItems(['开启', '关闭（默认）'], grSet.lyricsVerticalChineseMode, ['on', 'off'], (mode) => {
			if (mode === 'on' && grSet.layout !== 'default') {
				grSet.lyricsVerticalChineseMode = 'off';
				fb.ShowPopupMessage(
					'中文传统纵排目前用于默认界面的歌词页、详情页和唱机右侧歌词区域。\n\n请先切换到默认界面后再开启。',
					'Stage 8A 中文传统纵排'
				);
				return;
			}

			grSet.lyricsVerticalChineseMode = mode;
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		verticalChineseMenu.addSeparator();
		verticalChineseMenu.addItem('使用说明', false, () => {
			fb.ShowPopupMessage(
				'开启后，歌词页、详情页及唱机右侧区域中的中文主原文均按“每句一列、字从上到下、列从右向左”显示，并沿纵向逐字扫亮；换句使用克制的卷轴式横移。\n\n英文歌曲自动保持原横排；中英双语纵横混排将在后续版本单独设计。此模式只使用当前页面已有的歌词区域，不会覆盖播放列表、详情信息或唱片。唱机模式需同时开启“显示唱机右侧歌词”，不依赖普通歌词页开关；遮罩沿左右两侧渐隐。',
				'Stage 8A 中文传统纵排'
			);
		});
		const verticalLongLineMenu = new Menu('长句处理');
		verticalLongLineMenu.addRadioItems(['自动换列（默认）', '自动缩小字号'], grSet.lyricsVerticalLongLineMode,
			['wrap', 'auto-shrink'], (mode) => {
				grSet.lyricsVerticalLongLineMode = mode;
				window.Repaint();
			});
		verticalLongLineMenu.appendTo(verticalChineseMenu);

		verticalChineseMenu.appendTo(lyricsMenu);

		const lyricsBackgroundMenu = new Menu('背景');
		lyricsBackgroundMenu.createRadioSubMenu('沉浸模式封面歌词虚化', ['柔和（默认）', '明显'], grSet.immersiveLyricsCoverSoftening,
			['soft', 'strong'], (strength) => {
				grSet.immersiveLyricsCoverSoftening = strength;
				if (grm.details.immersiveMode) grm.ui.prepareImmersiveLyricsBlur();
				window.Repaint();
			});
		lyricsBackgroundMenu.addSeparator();
		lyricsBackgroundMenu.addToggleItem('显示图片在背景', grSet, 'lyricsBgImg', () => {
			if (grSet.lyricsBgImg) {
				grm.bgImg.initBgImage('lyrics');
			} else {
				grm.bgImg.clearBgImageCache('lyrics');
			}
			grm.bgImg.initBgImageCycle();
			window.Repaint();
		});
		lyricsBackgroundMenu.addSeparator();
		lyricsBackgroundMenu.addToggleItem('循环图片', grSet, 'lyricsBgImgCycle', () => {
			grm.bgImg.initBgImageCycle();
			window.Repaint();
		});
		lyricsBackgroundMenu.createRadioSubMenu('循环时间', ['  5 秒', '10 秒', '15 秒（默认）', '30 秒', '60 秒'], grSet.lyricsBgImgCycleTime, [5, 10, 15, 30, 60], (time) => {
			grSet.lyricsBgImgCycleTime = time;
			grm.bgImg.initBgImageCycle();
			window.Repaint();
		});
		lyricsBackgroundMenu.addSeparator();
		const lyricsBackgroundImageSourceMenu = new Menu('图片来源');
		lyricsBackgroundImageSourceMenu.addRadioItems(['艺术家', '专辑', '自定义'], grSet.lyricsBgImgSource, ['artist', 'album', 'custom'], (source) => {
			grSet.lyricsBgImgSource = source;
			grm.bgImg.initBgImage('lyrics', true);
			window.Repaint();
		});
		lyricsBackgroundImageSourceMenu.addSeparator();
		lyricsBackgroundImageSourceMenu.addToggleItem('过滤专辑图片', grSet, 'lyricsBgImgAlbumArtFilter', () => {
			window.Reload();
		});
		lyricsBackgroundImageSourceMenu.appendTo(lyricsBackgroundMenu);
		lyricsBackgroundMenu.createRadioSubMenu('图片缩放', ['比例', '填充', '拉伸'], grSet.lyricsBgImgScale, ['default', 'filled', 'stretched'], (scale) => {
			grSet.lyricsBgImgScale = scale;
			grm.bgImg.initBgImage('lyrics', true);
			window.Repaint();
		});
		lyricsBackgroundMenu.createRadioSubMenu('图片不透明度', ['100%', '90%', '80%', '70%', '60%', '50%', '40%', '30%', '20%', '10%'], grSet.lyricsBgImgOpacity, [255, 230, 204, 178, 153, 128, 102, 76, 51, 25], value => {
			grSet.lyricsBgImgOpacity = value;
			window.Repaint();
		});
		lyricsBackgroundMenu.appendTo(lyricsMenu);

		const lyricsDisplayMenu = new Menu('显示');
		const lyricsAnimationMenu = new Menu('动画');
		lyricsAnimationMenu.addRadioItems([
			'线性', '平滑步进', '平滑步进+',
			'正弦   淡出', '二次方淡出 (默认)', '三次方淡出', '四次方淡出',
			'正弦   淡入淡出', '二次方淡入淡出', '三次方淡入淡出'
		], grSet.lyricsScrollEasing, [
			'linear', 'smoothStep', 'smootherStep',
			'easeOutSine', 'easeOutQuad', 'easeOutCubic', 'easeOutQuart',
			'easeInOutSine', 'easeInOutQuad', 'easeInOutCubic'
		], (easing) => {
			grSet.lyricsScrollEasing = easing;
			window.Repaint();
		}, false, false, [2, 6]);
		lyricsAnimationMenu.appendTo(lyricsDisplayMenu);

		lyricsDisplayMenu.createRadioSubMenu('显示投影', ['无', '小', '常规', '大'], grSet.lyricsDropShadowLevel, ['none', 'small', 'normal', 'large'], (size) => {
			grSet.lyricsDropShadowLevel = size;
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		lyricsDisplayMenu.addSeparator();
		lyricsDisplayMenu.addToggleItem('滚动淡入淡出', grSet, 'lyricsFadeScroll', () => {
			window.Repaint();
		});
		lyricsDisplayMenu.addSeparator();
		lyricsDisplayMenu.createRadioSubMenu('显示透明遮罩', ['无遮罩', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%'], grSet.lyricsTransparentMask, [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], (percent) => {
			grSet.lyricsTransparentMask = percent;
			window.Repaint();
		});
		lyricsDisplayMenu.addSeparator();
		lyricsDisplayMenu.addToggleItem('增大高亮字体', grSet, 'lyricsLargerCurrentSync', () => {
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		lyricsDisplayMenu.addSeparator();
		lyricsDisplayMenu.createRadioSubMenu('歌词行动画', ['关闭', '柔和', '标准（默认）', '明显'], grSet.lyricsLineAnimationMode, ['off', 'soft', 'standard', 'strong'], (mode) => {
			grSet.lyricsLineAnimationMode = mode;
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		lyricsDisplayMenu.addSeparator();
		const lyricsKaraokeMenu = new Menu('卡拉 OK 高亮');
		lyricsKaraokeMenu.addItem('自动（默认）', grSet.lyricsKaraokeMode !== 'off', () => {
			grSet.lyricsKaraokeMode = 'auto';
			window.Repaint();
		});
		lyricsKaraokeMenu.addItem('关闭', grSet.lyricsKaraokeMode === 'off', () => {
			grSet.lyricsKaraokeMode = 'off';
			window.Repaint();
		});
		lyricsKaraokeMenu.appendTo(lyricsDisplayMenu);
		const lyricsKaraokeStyleMenu = new Menu('卡拉 OK 扫亮样式');
		lyricsKaraokeStyleMenu.addItem('纯色', grSet.lyricsKaraokeStyle === 'solid', () => {
			grSet.lyricsKaraokeStyle = 'solid';
			window.Repaint();
		});
		lyricsKaraokeStyleMenu.addItem('柔和渐变', grSet.lyricsKaraokeStyle === 'gradient', () => {
			grSet.lyricsKaraokeStyle = 'gradient';
			window.Repaint();
		});
		lyricsKaraokeStyleMenu.addItem('主题色渐变（默认）', !['solid', 'gradient'].includes(grSet.lyricsKaraokeStyle), () => {
			grSet.lyricsKaraokeStyle = 'duotone';
			window.Repaint();
		});
		lyricsKaraokeStyleMenu.appendTo(lyricsDisplayMenu);
		const lyricsKaraokeBreathMenu = new Menu('卡拉 OK 当前句呼吸');
		lyricsKaraokeBreathMenu.addItem('关闭', grSet.lyricsKaraokeBreathMode === 'off', () => {
			grSet.lyricsKaraokeBreathMode = 'off';
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		lyricsKaraokeBreathMenu.addItem('低（默认）', !['off', 'medium'].includes(grSet.lyricsKaraokeBreathMode), () => {
			grSet.lyricsKaraokeBreathMode = 'low';
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		lyricsKaraokeBreathMenu.addItem('中', grSet.lyricsKaraokeBreathMode === 'medium', () => {
			grSet.lyricsKaraokeBreathMode = 'medium';
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		lyricsKaraokeBreathMenu.appendTo(lyricsDisplayMenu);
		const lyricsKaraokeSustainMenu = new Menu('卡拉 OK 拖音表现');
		lyricsKaraokeSustainMenu.addItem('自动（默认）', grSet.lyricsKaraokeSustainMode !== 'off', () => {
			grSet.lyricsKaraokeSustainMode = 'auto';
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		lyricsKaraokeSustainMenu.addItem('关闭', grSet.lyricsKaraokeSustainMode === 'off', () => {
			grSet.lyricsKaraokeSustainMode = 'off';
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		lyricsKaraokeSustainMenu.appendTo(lyricsDisplayMenu);
		const lyricsKaraokeShineMenu = new Menu('卡拉 OK 流光扫亮');
		lyricsKaraokeShineMenu.addItem('自动（默认）', !['off', 'strong'].includes(grSet.lyricsKaraokeShineMode), () => {
			grSet.lyricsKaraokeShineMode = 'auto';
			window.Repaint();
		});
		lyricsKaraokeShineMenu.addItem('增强', grSet.lyricsKaraokeShineMode === 'strong', () => {
			grSet.lyricsKaraokeShineMode = 'strong';
			window.Repaint();
		});
		lyricsKaraokeShineMenu.addItem('关闭', grSet.lyricsKaraokeShineMode === 'off', () => {
			grSet.lyricsKaraokeShineMode = 'off';
			window.Repaint();
		});
		lyricsKaraokeShineMenu.appendTo(lyricsDisplayMenu);
		const lyricsKaraokeStarMenu = new Menu('卡拉 OK 星星跳动');
		lyricsKaraokeStarMenu.addItem('自动（默认）', !['off', 'strong'].includes(grSet.lyricsKaraokeStarMode), () => {
			grSet.lyricsKaraokeStarMode = 'auto';
			window.Repaint();
		});
		lyricsKaraokeStarMenu.addItem('增强', grSet.lyricsKaraokeStarMode === 'strong', () => {
			grSet.lyricsKaraokeStarMode = 'strong';
			window.Repaint();
		});
		lyricsKaraokeStarMenu.addItem('关闭', grSet.lyricsKaraokeStarMode === 'off', () => {
			grSet.lyricsKaraokeStarMode = 'off';
			window.Repaint();
		});
		lyricsKaraokeStarMenu.appendTo(lyricsDisplayMenu);
		const lyricsKaraokeStarStyleMenu = new Menu('卡拉 OK 星星轨迹');
		lyricsKaraokeStarStyleMenu.addItem('抛跳（默认）', grSet.lyricsKaraokeStarStyle !== 'pop', () => {
			grSet.lyricsKaraokeStarStyle = 'hop';
			window.Repaint();
		});
		lyricsKaraokeStarStyleMenu.addItem('逐字弹出', grSet.lyricsKaraokeStarStyle === 'pop', () => {
			grSet.lyricsKaraokeStarStyle = 'pop';
			window.Repaint();
		});
		lyricsKaraokeStarStyleMenu.appendTo(lyricsDisplayMenu);
		const lyricsKaraokeEmphasisMenu = new Menu('卡拉 OK 单字强调');
		lyricsKaraokeEmphasisMenu.addItem('关闭（默认）', !['auto', 'strong'].includes(grSet.lyricsKaraokeEmphasisMode), () => {
			grSet.lyricsKaraokeEmphasisMode = 'off';
			window.Repaint();
		});
		lyricsKaraokeEmphasisMenu.addItem('自动（含毛笔质感）', grSet.lyricsKaraokeEmphasisMode === 'auto', () => {
			grSet.lyricsKaraokeEmphasisMode = 'auto';
			window.Repaint();
		});
		lyricsKaraokeEmphasisMenu.addItem('增强（更明显的上弹）', grSet.lyricsKaraokeEmphasisMode === 'strong', () => {
			grSet.lyricsKaraokeEmphasisMode = 'strong';
			window.Repaint();
		});
		lyricsKaraokeEmphasisMenu.appendTo(lyricsDisplayMenu);
		lyricsDisplayMenu.addSeparator();
		const lyricsLongGapPromptMenu = new Menu('长间隔／间奏提示');
		lyricsLongGapPromptMenu.addItem('自动（默认）', grSet.lyricsLongGapPrompt !== 'off', () => {
			grSet.lyricsLongGapPrompt = 'auto';
			window.Repaint();
		});
		lyricsLongGapPromptMenu.addItem('关闭', grSet.lyricsLongGapPrompt === 'off', () => {
			grSet.lyricsLongGapPrompt = 'off';
			window.Repaint();
		});
		lyricsLongGapPromptMenu.appendTo(lyricsDisplayMenu);
		lyricsDisplayMenu.appendTo(lyricsMenu);

		const lyricsControlsMenu = new Menu('控制');
		lyricsControlsMenu.addToggleItem('记住歌词面板状态', grSet, 'lyricsRememberPanelState', () => {
			grm.ui.displayLyrics = grSet.lyricsRememberPanelState;
			grSet.savedLyricsDisplayed = grm.ui.displayLyrics && grSet.lyricsRememberPanelState;
			if (grSet.displayLyrics) {
				grm.lyrics.initLyrics();
			} else if (!grSet.lyricsRememberPanelState) {
				grm.ui.displayPlaylist = grSet.layout === 'default';
				grm.ui.resizeArtwork(true);
			}
			grm.ui.handlePanelLayout('all', 'initLayout');
			grm.ui.resizeArtwork(grSet.layout !== 'default');
			grm.button.initButtonState();
			window.Repaint();
		});
		lyricsControlsMenu.addToggleItem('未同步歌词（自动-滚动）', grSet, 'lyricsAutoScrollUnsynced', () => {
			if (grSet.displayLyrics) grm.lyrics.initLyrics();
			grm.button.initButtonState();
			window.Repaint();
		});
		lyricsControlsMenu.appendTo(lyricsMenu);

		const lyricsSpacingMenu = new Menu('间距');
		lyricsSpacingMenu.createRadioSubMenu('行', ['20 像素', '24 像素', '28 像素', '32 像素', '36 像素', '40 像素（默认）', '44 像素', '48 像素', '52 像素', '56 像素', '60 像素'], grSet.lyricsLineSpacing,
			[20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60], (size) => {
			grSet.lyricsLineSpacing = size;
			grm.display.setLyricsLineSpacingSize(size);
		});
		lyricsSpacingMenu.createRadioSubMenu('句子', ['10 像素', '14 像素', '18 像素', '22 像素', '26 像素', '30 像素（默认）', '34 像素', '38 像素', '42 像素', '46 像素', '50 像素'], grSet.lyricsSentenceSpacing,
			[10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50], (size) => {
			grSet.lyricsSentenceSpacing = size;
			grm.display.setLyricsSentenceSpacingSize(size);
		});
		lyricsSpacingMenu.appendTo(lyricsMenu);

		const lyricsScrollSpeedMenu = new Menu('滚动速度');
		lyricsScrollSpeedMenu.addToggleItem('自适应滚动速度', grSet, 'lyricsScrollAdaptive', () => {
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		lyricsScrollSpeedMenu.addSeparator();
		lyricsScrollSpeedMenu.addRadioItems(['最快 （非常慢 CPU）', '快', '常规', '慢', '最慢 （非常快 CPU）'], grSet.lyricsScrollSpeed, ['fastest', 'fast', 'normal', 'slow', 'slowest'], (speed) => {
			grSet.lyricsScrollSpeed = speed;
			switch (speed) {
				case 'fastest':
					grSet.lyricsScrollRateAvg = 300;
					grSet.lyricsScrollRateMax = 150;
					break;
				case 'fast':
					grSet.lyricsScrollRateAvg = 500;
					grSet.lyricsScrollRateMax = 250;
					break;
				case 'normal':
					grSet.lyricsScrollRateAvg = 750;
					grSet.lyricsScrollRateMax = 375;
					break;
				case 'slow':
					grSet.lyricsScrollRateAvg = 1000;
					grSet.lyricsScrollRateMax = 500;
					break;
				case 'slowest':
					grSet.lyricsScrollRateAvg = 1500;
					grSet.lyricsScrollRateMax = 725;
					break;
			}
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		lyricsScrollSpeedMenu.appendTo(lyricsMenu);

		const lyricsTranslationMenu = new Menu('翻译');
		lyricsTranslationMenu.addToggleItem('显示翻译', grSet, 'lyricsTranslation', () => {
			grm.lyrics.initLyrics();
			window.Repaint();
		});
		lyricsTranslationMenu.addSeparator();
		lyricsTranslationMenu.addRadioItems(['原文行高亮显示', '译文行高亮显示', '双   行高亮显示'], grSet.lyricsTranslationHighlightMode, [1, 2, 3], (mode) => {
			grSet.lyricsTranslationHighlightMode = mode;
			grm.lyrics.initLyrics();
			window.Repaint();
		}, !grSet.lyricsTranslation);
		lyricsTranslationMenu.addSeparator();
		lyricsTranslationMenu.createRadioSubMenu('译文字号', ['80%', '90%', '100%（默认）', '110%'], grSet.lyricsTranslationScale, [0.8, 0.9, 1, 1.1], (scale) => {
			grSet.lyricsTranslationScale = scale;
			grm.lyrics.initLyrics();
			window.Repaint();
		}, !grSet.lyricsTranslation);
		lyricsTranslationMenu.createRadioSubMenu('译文不透明度', ['60%', '75%', '90%', '100%（默认）'], grSet.lyricsTranslationOpacity, [0.6, 0.75, 0.9, 1], (opacity) => {
			grSet.lyricsTranslationOpacity = opacity;
			window.Repaint();
		}, !grSet.lyricsTranslation);
		lyricsTranslationMenu.createRadioSubMenu('原文与译文间距', ['90%', '100%（默认）', '110%', '120%'], grSet.lyricsTranslationSpacing, [0.9, 1, 1.1, 1.2], (spacing) => {
			grSet.lyricsTranslationSpacing = spacing;
			grm.lyrics.initLyrics();
			window.Repaint();
		}, !grSet.lyricsTranslation);
		lyricsTranslationMenu.addSeparator();
		lyricsTranslationMenu.addToggleItem('仅显示当前翻译', grSet, 'lyricsTranslationCurrentOnly', () => {
			grm.lyrics.initLyrics();
			window.Repaint();
		}, !grSet.lyricsTranslation);
		lyricsTranslationMenu.addToggleItem('拖动时显示所有行', grSet, 'lyricsTranslationScrollReveal', () => {
			window.Repaint();
		}, !grSet.lyricsTranslation || !grSet.lyricsTranslationCurrentOnly);
		lyricsTranslationMenu.addSeparator();
		lyricsTranslationMenu.createRadioSubMenu('显出动画持续时间', ['  禁用', '  100 毫秒', '  200 毫秒', '  300 毫秒', '  400 毫秒', '  500 毫秒 (默认)', '  600 毫秒', '  700 毫秒', '  800 毫秒', '  900 毫秒', '1000 毫秒'], grSet.lyricsTranslationRevealDuration, [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], (duration) => {
			grSet.lyricsTranslationRevealDuration = duration;
			window.Repaint();
		}, !grSet.lyricsTranslation || !grSet.lyricsTranslationCurrentOnly || !grSet.lyricsTranslationScrollReveal, false, [0]);
        lyricsTranslationMenu.createRadioSubMenu('显出动画折叠时间', ['禁用', '  1 秒', '  2 秒', '  3 秒 (默认)', '  4 秒', '  5 秒', '  6 秒', '  7 秒', '  8 秒', '  9 秒', '10 秒'], grSet.lyricsTranslationRevealCollapse, [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000], (delay) => {
			grSet.lyricsTranslationRevealCollapse = delay;
			window.Repaint();
		}, !grSet.lyricsTranslation || !grSet.lyricsTranslationCurrentOnly || !grSet.lyricsTranslationScrollReveal, false, [0]);
		lyricsTranslationMenu.appendTo(lyricsMenu);
		lyricsMenu.addSeparator();

		lyricsMenu.addItem('歌词信息', false, () => { fb.RunMainMenuCommand('视图/ESLyric/面板/歌词信息'); });
	//	lyricsMenu.addItem('歌词搜索', false, () => { fb.RunMainMenuCommand('视图/ESLyric/搜索歌词...'); });
		lyricsMenu.addSeparator();
	//	lyricsMenu.addItem('下一个歌词', false, () => { grm.lyrics.nextLyrics(); });
		lyricsMenu.addItem('编辑歌词', false, () => { fb.RunMainMenuCommand('视图/ESLyric/面板/编辑歌词'); });
		lyricsMenu.addItem('删除歌词', false, () => { fb.RunMainMenuCommand('视图/ESLyric/面板/删除歌词'); });
		lyricsMenu.addSeparator();
		lyricsMenu.addItem('歌词保存到标签', false, () => { fb.RunMainMenuCommand('视图/ESLyric/面板/歌词保存至/标签'); });
		lyricsMenu.addSeparator();
		lyricsMenu.addItem('打开歌词所在目录', false, () => { fb.RunMainMenuCommand('视图/ESLyric/面板/打开歌词所在目录'); });

		if (!context_menu) lyricsMenu.appendTo(menu);
	}
	// #endregion

	// * SETTINGS * //
	// #region SETTINGS
	/**
	 * Top menu > Options > Settings.
	 * @param {Menu} menu - Creates the Settings menu via a new Menu instance.
	 * @protected
	 */
	settingsOptions(menu) {
		const settingsMenu = new Menu('设置');

		// * THEME DAY/NIGHT MODE * //
		if (!grSet.themeSandbox) {
			const themeDayNightModeMenu = new Menu('日/夜');

			const dayNightTimeRangeDefaults = ['6-18', '7-19', '8-20', '9-21', '10-22'];
			const dayNightTimeRangeLabels = dayNightTimeRangeDefaults.map(t => grm.day.formatTimeRangeString(t));
			dayNightTimeRangeLabels.unshift('已停用（默认）');

			const dayNightTimeRangeCustom = grSet.themeDayNightSchedule && !dayNightTimeRangeDefaults.includes(grSet.themeDayNightSchedule);
			const dayNightTimeRangeCustomLabel = dayNightTimeRangeCustom ? `Custom: ${grm.day.formatTimeRangeString(grSet.themeDayNightSchedule)}` : '';

			const dayNightTimeRangeVal = grSet.themeDayNightEnabled && grSet.design !== 'modern_day_night' ? grSet.themeDayNightSchedule : false;
			const dayNightTimeRangeValues = [false, ...dayNightTimeRangeDefaults];

			if (dayNightTimeRangeCustom) {
				dayNightTimeRangeLabels.push(dayNightTimeRangeCustomLabel);
				dayNightTimeRangeValues.push(grSet.themeDayNightSchedule);
			}

			themeDayNightModeMenu.addItem('设置自定义时间范围', false, () => {
				grm.day.setDayNightCustomTimeRange();
			});
			themeDayNightModeMenu.addSeparator();

			themeDayNightModeMenu.addRadioItems(dayNightTimeRangeLabels, dayNightTimeRangeVal, dayNightTimeRangeValues, (time) => {
				grm.day.handleDayNightMode(time || '6-18', time !== false);
			});
			themeDayNightModeMenu.addSeparator();

			themeDayNightModeMenu.addItem(grSet.themeSetupDay ? '保存并退出日间主题设置' : '日间主题设置', false, () => {
				grm.day.startDayNightSetup('day');
			});
			themeDayNightModeMenu.addItem(grSet.themeSetupNight ? '保存并退出夜间主题设置' : '夜间主题设置', false, () => {
				grm.day.startDayNightSetup('night')
			});
			themeDayNightModeMenu.appendTo(settingsMenu);
		}

		// * HIDE OTHER MENUS WHEN THEME DAY/NIGHT SETUP IS ACTIVE
		if (grSet.themeSetupDay || grSet.themeSetupNight) {
			settingsMenu.appendTo(menu);
			return;
		}

		// * THEME FONTS * //
		if (!grSet.themeSandbox) {
			const themeFontMenu = new Menu('字体');
			themeFontMenu.addToggleItem('使用自定义主题字体', grSet, 'customThemeFonts', () => {
				const msg = grm.msg.getMessage('menu', 'customThemeFonts');
				grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
					grSet.customThemeFonts = confirmed;
				});
				window.Reload();
			});
			themeFontMenu.appendTo(settingsMenu);
		}

		// * THEME IMAGES * //
		if (!grSet.themeSandbox) {
			const themeImagesMenu = new Menu('图标');
			themeImagesMenu.addToggleItem('使用自定义预载图标', grSet, 'customPreloaderLogo', () => {
				if (!grSet.customPreloaderLogo) return window.Reload();
				grm.msg.showPopupNotice('menu', 'customPreloaderLogo');
				window.Reload();
			});
			themeImagesMenu.addToggleItem('使用自定义主题图标', grSet, 'customThemeImages', () => {
				if (!grSet.customThemeImages) return window.Reload();
				grm.msg.showPopupNotice('menu', 'customThemeImages');
				window.Reload();
			});
			themeImagesMenu.appendTo(settingsMenu);
		}

		// * THEME SANDBOX * //
		const themeSandboxMenu = new Menu('沙盒');
		const restoreThemeStylePresetSettings = (restoreStyles) => {
			grSet.presetAutoRandomMode = 'dblclick';
			grm.ui.setThemePresetSelection(true); // * Reactivate all
			grm.ui.resetTheme();
			if (restoreStyles) {
				grm.ui.restoreThemeStylePreset();
			} else { // Restore theme preset
				grm.preset.setThemePreset(grSet.savedPreset);
			}
			grm.ui.updateStyle();
		};
		themeSandboxMenu.addToggleItem('启用', grSet, 'themeSandbox', () => {
			if (!grSet.themeSandbox) {
				const msg = grm.msg.getMessage('menu', 'themeSandboxRestore');
				grm.msg.showPopup(false, false, msg, '还原', '保留', (restore) => {
					if (!restore) return;
					const msg = grm.msg.getMessage('menu', 'themeSandboxRestore2');
					const msgFb = grm.msg.getMessage('menu', 'themeSandboxRestore2', true);
					if (grSet.savedPreset) { // If grSet.savedPreset is available, choose between theme styles or theme preset
						setTimeout(() => {
							grm.msg.showPopup(true, msgFb, msg, '样式', '预设', (restoreStyles) => {
								restoreThemeStylePresetSettings(restoreStyles); // Restore theme styles or theme preset
							});
						}, 0);
						return;
					}
					restoreThemeStylePresetSettings(true); // Restore theme styles
				});
				return;
			}
			const msg = grm.msg.getMessage('menu', 'themeSandbox');
			const msgFb = grm.msg.getMessage('menu', 'themeSandbox', true);
			grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
				if (!confirmed) grSet.themeSandbox = false;
			});
		});
		themeSandboxMenu.appendTo(settingsMenu);

		// * HIDE OTHER MENUS WHEN THEME SANDBOX IS ACTIVE
		if (grSet.themeSandbox) {
			settingsMenu.appendTo(menu);
			return;
		}

		settingsMenu.addSeparator();

		// * THEME BACKUP * //
		const themeBackupMenu = new Menu('备份');
		themeBackupMenu.addItem('制作备份', false, () => {
			const msg = grm.msg.getMessage('menu', 'makeBackup');
			const msgFb = grm.msg.getMessage('menu', 'makeBackup', true);
			grm.msg.showPopup(true, msgFb, msg, 'Yes', 'No', (confirmed) => {
				if (confirmed) grm.fman.makeBackup();
			});
		});

		themeBackupMenu.addItem('还原备份', false, () => {
			const msg = grm.msg.getMessage('menu', 'restoreBackup');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (confirmed) grm.fman.restoreBackup();
			});
		});
		themeBackupMenu.appendTo(settingsMenu);

		// * THEME CACHE * //
		const themeCacheMenu = new Menu('缓存');
		const themeCacheLibraryMenu = new Menu('曲库');
		themeCacheLibraryMenu.addToggleItem('启用   磁盘缓存图片', libSet, 'albumArtDiskCache');
		themeCacheLibraryMenu.addToggleItem('预加载磁盘缓存图片', libSet, 'albumArtPreLoad');
		themeCacheLibraryMenu.addToggleItem('使用自定义曲库目录', grSet, 'customLibraryDir', () => {
			if (grSet.customLibraryDir) grm.inputBox.customCacheDir('library');
			setTimeout(()=> { window.Reload(); }, 500);
		});
		themeCacheLibraryMenu.addSeparator();
		themeCacheLibraryMenu.addItem('打开曲库缓存目录', false, () => {
			const cacheDir = grSet.customLibraryDir ? $(grCfg.customLibraryDir, undefined, true) : `${fb.ProfilePath}cache\\library\\library-tree-cache`;
			const absoluteCacheDir = fso.GetAbsolutePathName(cacheDir);
			if (absoluteCacheDir && !IsFolder(absoluteCacheDir)) CreateFolder(absoluteCacheDir);
			OpenExplorer(`explorer /open, "${absoluteCacheDir}"`, false);
		});
		themeCacheLibraryMenu.addItem('删除曲库缓存', false, () => {
			const msg = grm.msg.getMessage('menu', 'deleteLibraryCache');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (confirmed) grm.fman.deleteLibraryCache();
			});
		});
		themeCacheLibraryMenu.addSeparator();
		themeCacheLibraryMenu.addToggleItem('启动时自动删除曲库缓存', grSet, 'libraryAutoDelete', () => {
			const msg = grm.msg.getMessage('menu', 'libraryAutoDelete');
			if (grSet.libraryAutoDelete) {
				grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
					grSet.libraryAutoDelete = confirmed;
				});
			}
		});
		themeCacheLibraryMenu.appendTo(themeCacheMenu);

		const themeCacheBiographyMenu = new Menu('简介');
		themeCacheBiographyMenu.addToggleItem('使用自定义简介目录', grSet, 'customBiographyDir', () => {
			if (grSet.customBiographyDir) {
				grm.inputBox.customCacheDir('biography');
				const bioCfg = new BioSettings();
				bioCfg.resetCfg();
			}
			setTimeout(()=> { window.Reload(); }, 500);
		});
		themeCacheBiographyMenu.addSeparator();
		themeCacheBiographyMenu.addItem('打开简介缓存目录', false, () => {
			const cacheDir = grSet.customBiographyDir ? $(grCfg.customBiographyDir, undefined, true) : `${fb.ProfilePath}cache\\biography\\biography-cache`;
			const absoluteCacheDir = fso.GetAbsolutePathName(cacheDir);
			if (absoluteCacheDir && !IsFolder(absoluteCacheDir)) CreateFolder(absoluteCacheDir);
			OpenExplorer(`explorer /open, "${absoluteCacheDir}"`, false);
		});
		themeCacheBiographyMenu.addItem('删除简介缓存', false, () => {
			const msg = grm.msg.getMessage('menu', 'deleteBiographyCache');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (confirmed) grm.fman.deleteBiographyCache();
			});
		});
		themeCacheBiographyMenu.addSeparator();
		themeCacheBiographyMenu.addToggleItem('启动时自动删除简介缓存', grSet, 'biographyAutoDelete', () => {
			const msg = grm.msg.getMessage('menu', 'biographyAutoDelete');
			if (grSet.biographyAutoDelete) {
				grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
					grSet.biographyAutoDelete = confirmed;
				});
			}
		});
		themeCacheBiographyMenu.appendTo(themeCacheMenu);

		const themeCacheLyricsMenu = new Menu('歌词');
		themeCacheLyricsMenu.addToggleItem('使用自定义歌词目录', grSet, 'customLyricsDir', () => {
			if (grSet.customLyricsDir) grm.inputBox.customCacheDir('lyrics');
			setTimeout(()=> { window.Reload(); }, 500);
		});
		themeCacheLyricsMenu.addSeparator();
		themeCacheLyricsMenu.addItem('打开歌词目录', false, () => {
			const cacheDir = grSet.customLyricsDir ? $(grCfg.customLyricsDir, undefined, true) : `${fb.ProfilePath}cache\\lyrics`;
			const absoluteCacheDir = fso.GetAbsolutePathName(cacheDir);
			if (absoluteCacheDir && !IsFolder(absoluteCacheDir)) CreateFolder(absoluteCacheDir);
			OpenExplorer(`explorer /open, "${absoluteCacheDir}"`, false);
		});
		themeCacheLyricsMenu.addItem('删除歌词', false, () => {
			const msg = grm.msg.getMessage('menu', 'deleteLyricsCache');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (confirmed) grm.fman.deleteLyrics();
			});
		});
		themeCacheLyricsMenu.addSeparator();
		themeCacheLyricsMenu.addToggleItem('启动时自动删除歌词', grSet, 'lyricsAutoDelete', () => {
			const msg = grm.msg.getMessage('menu', 'lyricsAutoDelete');
			if (grSet.lyricsAutoDelete) {
				grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
					grSet.lyricsAutoDelete = confirmed;
				});
			}
		});
		themeCacheLyricsMenu.appendTo(themeCacheMenu);

		const themeCacheWaveformBarMenu = new Menu('波形条');
		themeCacheWaveformBarMenu.addToggleItem('使用自定义波形条目录', grSet, 'customWaveformBarDir', () => {
			if (grSet.customWaveformBarDir) grm.inputBox.customCacheDir('waveformBar');
			setTimeout(()=> { window.Reload(); }, 500);
		});
		themeCacheWaveformBarMenu.addSeparator();
		themeCacheWaveformBarMenu.addItem('打开波形条缓存目录', false, () => {
			const cacheDir = grSet.customWaveformBarDir ? $(grCfg.customWaveformBarDir, undefined, true)  : `${fb.ProfilePath}cache\\waveform`;
			const absoluteCacheDir = fso.GetAbsolutePathName(cacheDir);
			if (absoluteCacheDir && !IsFolder(absoluteCacheDir)) CreateFolder(absoluteCacheDir);
			OpenExplorer(`explorer /open, "${absoluteCacheDir}"`, false);
		});
		themeCacheWaveformBarMenu.addItem('删除波形条缓存', false, () => {
			const msg = grm.msg.getMessage('menu', 'deleteWaveformBarCache');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (confirmed) grm.fman.deleteWaveformBarCache();
			});
		});

		themeCacheWaveformBarMenu.addSeparator();//增加分隔线
		themeCacheWaveformBarMenu.addToggleItem('启动时自动删除波形条缓存', grSet, 'waveformBarAutoDelete', () => {
			const msg = grm.msg.getMessage('menu', 'waveformBarAutoDelete');
			if (grSet.waveformBarAutoDelete) {
				grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
					grSet.waveformBarAutoDelete = confirmed;
				});
			}
		});
		themeCacheWaveformBarMenu.appendTo(themeCacheMenu);
		themeCacheMenu.appendTo(settingsMenu);

		// * THEME CONFIGURATION * //
		const themeConfigMenu = new Menu('配置');
		themeConfigMenu.addItem('保存设置到配置文件', false, () => {
			const msg = grm.msg.getMessage('menu', 'saveSettingsConfig');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (!confirmed) return;
				const start = async () => {
					await grm.settings.setThemeSettings(true);
					window.Reload();
				};
				start();
				console.log(`\n>>> Georgia-ReBORN 主题设置已成功保存在 ${fb.ProfilePath}georgia-reborn\\configs\\georgia-reborn-config.jsonc <<<\n\n`);
			});
		});
		themeConfigMenu.addItem('从配置文件加载设置', false, () => {
			const msg = grm.msg.getMessage('menu', 'loadSettingsConfig');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (!confirmed) return;
				const start = async () => {
					await grm.settings.setThemeSettings(false, true);
					window.Reload();
				};
				start();
				console.log(`\n>>> Georgia-ReBORN 主题设置已从 ${fb.ProfilePath}georgia-reborn\\configs\\georgia-reborn-config.jsonc 成功加载 <<<\n\n`);
			});
		});
		themeConfigMenu.addSeparator();
		themeConfigMenu.addItem('加载默认设置', false, () => {
			const msg = grm.msg.getMessage('menu', 'loadDefaultSettingsConfig');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (!confirmed) return;
				const start = async () => {
					await grm.settings.setThemeSettings(false, false, true);
					await grm.display.autoDetectRes();
					window.Reload();
				};
				start();
				console.log('\n>>> 已成功加载默认的 Georgia-ReBORN 主题设置 <<<\n\n');
			});
		});
		themeConfigMenu.addSeparator();
		themeConfigMenu.addItem('编辑   主要配置文件', false, () => {
			try {
				OpenFile(`${grCfg.config.getPath()}`);
			} catch (e) {
				OpenExplorer(`explorer /select, "${grCfg.config.getPath()}"`, false);
			}
		});
		themeConfigMenu.addItem('编辑自定义配置文件', false, () => {
			try {
				OpenFile(`${grCfg.configCustom.getPath()}`);
			} catch (e) {
				OpenExplorer(`explorer /select, "${grCfg.configCustom.getPath()}"`, false);
			}
		});
		themeConfigMenu.addSeparator();
		themeConfigMenu.addItem('重置   主要配置文件', false, () => {
			const msg = grm.msg.getMessage('menu', 'resetSettingsMainConfig');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (!confirmed) return;
				try { // Needed to prevent crash when there is no config file
					grCfg.config.resetConfiguration();
					grm.settings.setThemeSettings(false, false, true);
					grm.display.setPlayerSize('small');
					console.log(`\n>>> Georgia-ReBORN 的 ${fb.ProfilePath}georgia-reborn\\configs\\georgia-reborn-config.jsonc 文件已成功重置为默认值 <<<\n\n`);
				} catch (e) { window.Reload(); }
			});
		});
		themeConfigMenu.addItem('重置自定义配置文件', false, () => {
			const msg = grm.msg.getMessage('menu', 'resetSettingsCustomConfig');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (!confirmed) return;
				try { // Needed to prevent crash when there is no config file
					grCfg.configCustom.resetConfiguration();
					console.log(`\n>>> Georgia-ReBORN 的 ${fb.ProfilePath}georgia-reborn\\configs\\georgia-reborn-custom.jsonc 文件已成功重置为默认值. <<<\n\n`);
				} catch (e) { window.Reload(); }
			});
		});
		themeConfigMenu.addSeparator();
		themeConfigMenu.addItem('重置全部', false, () => {
			const msg = grm.msg.getMessage('menu', 'resetSettingsAll');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (!confirmed) return;
				grSet.systemFirstLaunch = true; // Reset Georgia-ReBORN theme settings
				try { // Needed to prevent crash when there is no config file
					DeleteFile(`${fb.ProfilePath}configuration\\foo_ui_columns.dll.cfg`);
					grCfg.config.resetConfiguration(); // Reset Georgia-ReBORN config file
					lib.panel.updateProp(libSet, 'default_value'); // Reset Library settings
					bio.ui.updateProp(bioSet, 'default_value'); // Reset Biography settings
					const server = new BioSettings();
					server.resetCfg(); // Reset Biography server settings
					console.log('\n>>> Georgia-ReBORN 已成功重置 <<<\n\n');
				} catch (e) {
					const msg = grm.msg.getMessage('menu', 'resetSettingsAllError');
					fb.ShowPopupMessage(msg, '重置 Georgia-ReBORN');
				}
			});
		});
		themeConfigMenu.appendTo(settingsMenu);

		// * THEME PERFORMANCE * //
		settingsMenu.createRadioSubMenu('性能', ['最低标准 （最快速度 - 非常慢 CPU）', '低标准', '平衡（默认）', '高标准', '最高标准 （最慢速度 - 非常快 CPU）'], grSet.themePerformance,
			['lowestQuality', 'lowQuality', 'balanced', 'highQuality', 'highestQuality'], (perf) => {
			const msg = grm.msg.getMessage('menu', 'themePerformance');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (!confirmed) return;
				grSet.themePerformance = perf;
				grm.settings.setThemePerformance('balanced'); // First reset
				grm.settings.setThemePerformance(grSet.themePerformance); // Then set
				window.Reload();
			});
		});
		settingsMenu.addSeparator();

		// * THEME RENDERER * //
		if (Component.JSplitter) {
			settingsMenu.createRadioSubMenu('渲染器', ['GDI+ (默认)', 'Direct2D'], grSet.rendererMode, [0, 1], (mode) => {
				grSet.rendererMode = mode;
				if (DetectWine()) { // * Wine needs foobar restart, otherwise on pure reload it will crash
					fb.RunMainMenuCommand('文件/重启');
				} else {
					window.Reload();
				}
			});
			settingsMenu.addSeparator();
		}

		// * OTHER SETTINGS * //
		settingsMenu.addItem('输出设备', false, () => {
			const outputDeviceMenu = (x, y) => {
				const menu = window.CreatePopupMenu();
				const output = fb.GetOutputDevices();
				const deviceList = JSON.parse(output);
				const last = deviceList.length + 1
				let active = -1;
				for (const [i, array] of deviceList.entries()) {
					menu.AppendMenuItem(MenuFlag.String, i + 1, array.name);
					if (array.active) active = i;
				}
				menu.AppendMenuSeparator();
				menu.AppendMenuItem(MenuFlag.String, last, '参数选项...');

				if (active > -1) menu.CheckMenuRadioItem(1, last, active + 1);
				const idx = menu.TrackPopupMenu(x, y);
				if (idx > 0 && idx < last) fb.RunMainMenuCommand(`播放/设备/${deviceList[idx - 1].name}`);
				else if (idx === last) fb.RunMainMenuCommand('播放/设备/参数选项...');
			};
			outputDeviceMenu(grm.ui.state.mouse_x, grm.ui.state.mouse_y);
		});

		settingsMenu.addSeparator();
		settingsMenu.addToggleItem('开发者工具', grSet, 'devTools');
		settingsMenu.appendTo(menu);
	}
	// #endregion

	// * DEVELOPER TOOLS * //
	// #region DEVELOPER TOOLS
	/**
	 * Top menu > Options > Developer tools.
	 * @param {Menu} menu - Creates Developer tools menu via a new Menu instance.
	 * @protected
	 */
	developerToolsOptions(menu) {
		if (!grSet.devTools) return;
		const debugMenu = new Menu('开发者工具');

		const clearAutoDownloadBio = () => {
			grm.debug.autoDownloadBio = false;
			grm.button.setPlaybackOrder(grm.button.btnImg.PlaybackDefault, 'default', PlaybackOrder.Default);
			grm.ui.displayBiography = false;
			grm.ui.clearTimer('autoDownloadBio');
		};

		const clearAutoDownloadLyrics = () => {
			grm.debug.autoDownloadLyrics = false;
			grm.button.setPlaybackOrder(grm.button.btnImg.PlaybackDefault, 'default', PlaybackOrder.Default);
			grm.ui.displayLyrics = false;
			grm.ui.clearTimer('autoDownloadLyrics');
		};

		debugMenu.addItem('控制台', false, () => { fb.RunMainMenuCommand('视图/控制台'); }); // Top menu 'View' does not exist in Artwork/Compact layout
		debugMenu.addSeparator();
		debugMenu.addToggleItem('启用简介自动下载', grm.debug, 'autoDownloadBio', () => {
			if (!grm.debug.autoDownloadBio) {
				clearAutoDownloadBio();
			} else {
				const msg = grm.msg.getMessage('menu', 'autoDownloadBio');
				grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
					if (!confirmed) {
						grm.debug.autoDownloadBio = false;
						return;
					}
					clearAutoDownloadLyrics();
					fb.Play();
					grm.button.setPlaybackOrder(grm.button.btnImg.PlaybackShuffle, 'shuffle', PlaybackOrder.ShuffleTracks);
					grm.ui.displayBiography = true;
					grm.ui.autoDownloadBioTimer = setInterval(() => { fb.Next(); }, 10000);
				});
			}
			grm.button.btn.playbackOrder.repaint();
			grm.button.initButtonState();
			window.Repaint();
		});
		debugMenu.addToggleItem('启用歌词自动下载', grm.debug, 'autoDownloadLyrics', () => {
			if (!grm.debug.autoDownloadLyrics) {
				clearAutoDownloadLyrics();
			} else {
				const msg = grm.msg.getMessage('menu', 'autoDownloadLyrics');
				grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
					if (!confirmed) {
						grm.debug.autoDownloadLyrics = false;
						return;
					}
					clearAutoDownloadBio();
					fb.Play();
					grm.button.setPlaybackOrder(grm.button.btnImg.PlaybackRepeatPlaylist, 'repeatPlaylist', PlaybackOrder.RepeatPlaylist);
					grm.ui.displayLyrics = true;
					grm.lyrics.initLyrics();
					grm.ui.autoDownloadLyricsTimer = setInterval(() => { fb.Next(); }, 15000);
				});
			}
			grm.button.btn.playbackOrder.repaint();
			grm.button.initButtonState();
			window.Repaint();
		});
		debugMenu.addSeparator();
		debugMenu.addToggleItem('启用双击刷新', grCfg.settings, 'doubleClickRefresh');
		debugMenu.addSeparator();
		debugMenu.addToggleItem('启用调试日志', grCfg.settings, 'showDebugLog', () => {
			if (grCfg.settings.showDebugLog) fb.RunMainMenuCommand('视图/控制台');
		});
		debugMenu.addItem('启用主题调试日志', grCfg.settings.showDebugThemeLog, () => {
			grCfg.settings.showDebugThemeLog = !grCfg.settings.showDebugThemeLog;
			if (!grCfg.settings.showDebugThemeLog) return;
			if (grCfg.settings.showDebugThemeLog) fb.RunMainMenuCommand('视图/控制台');
			grm.ui.albumArt = null;
			on_playback_new_track(fb.GetNowPlaying());
		});
		debugMenu.addSeparator();
		debugMenu.addItem('启用APCA调试校准叠加', grCfg.settings.showDebugAPCACalibrationOverlay, () => {
			grCfg.settings.showDebugAPCACalibrationOverlay = !grCfg.settings.showDebugAPCACalibrationOverlay;
			grm.ui.albumArt = null;
			if (grCfg.settings.showDebugAPCACalibrationOverlay) {
				grCfg.settings.showDebugColorOverlay = false
				grCfg.settings.showDebugThemeOverlay = false
				grCfg.settings.showDebugPerformanceOverlay = false;
			}
			if (grCfg.settings.showDebugAPCACalibrationOverlay || !fb.IsPlaying) {
				grm.ui.initTheme();
			}
			on_playback_new_track(fb.GetNowPlaying());
			grm.debug.repaintWindow();
		});
		debugMenu.addItem('启用颜色调试叠加', grCfg.settings.showDebugColorOverlay, () => {
			grCfg.settings.showDebugColorOverlay = !grCfg.settings.showDebugColorOverlay;
			if (grCfg.settings.showDebugColorOverlay) {
				grCfg.settings.showDebugAPCACalibrationOverlay = false;
				grCfg.settings.showDebugThemeOverlay = false;
				grCfg.settings.showDebugPerformanceOverlay = false;
				grm.ui.albumArt = null;
				on_playback_new_track(fb.GetNowPlaying());
			}
			grm.debug.repaintWindow();
		});
		debugMenu.addItem('启用主题调试叠加', grCfg.settings.showDebugThemeOverlay, () => {
			grCfg.settings.showDebugThemeOverlay = !grCfg.settings.showDebugThemeOverlay;
			if (grCfg.settings.showDebugThemeOverlay) {
				grCfg.settings.showDebugAPCACalibrationOverlay = false;
				grCfg.settings.showDebugColorOverlay = false;
				grCfg.settings.showDebugPerformanceOverlay = false;
				grm.ui.albumArt = null;
				on_playback_new_track(fb.GetNowPlaying());
			}
			grm.debug.repaintWindow();
		});
		debugMenu.addItem('启用性能调试叠加', grCfg.settings.showDebugPerformanceOverlay, () => {
			grCfg.settings.showDebugPerformanceOverlay = !grCfg.settings.showDebugPerformanceOverlay;
			grm.ui.clearCache('debug');
			if (grCfg.settings.showDebugPerformanceOverlay) {
				grCfg.settings.showDebugAPCACalibrationOverlay = false;
				grCfg.settings.showDebugColorOverlay = false;
				grCfg.settings.showDebugThemeOverlay = false;
				grm.cpuTrack.start();
				grm.ui.albumArt = null;
				on_playback_new_track(fb.GetNowPlaying());
				return;
			}
			grm.cpuTrack.stop();
			grm.debug.repaintWindow();
		});
		debugMenu.addSeparator();
		debugMenu.addToggleItem('显示绘图区域', grm.debug, 'drawRepaintRects', () => {
			if (grm.debug.drawRepaintRects) {
				grm.debug.repaintRectAreas();
			} else {
				grm.debug.repaintWindow();
			}
		});
		debugMenu.addSeparator();
		debugMenu.addToggleItem('显示绘图时间', grm.debug, 'showDrawTiming', () => {
			if (grm.debug.showDrawTiming) fb.RunMainMenuCommand('视图/控制台');
			grm.ui.clearCache('debug');
		});
		debugMenu.addToggleItem('显示额外绘图时间', grm.debug, 'showDrawExtendedTiming', () => {
			if (grm.debug.showDrawExtendedTiming) fb.RunMainMenuCommand('视图/控制台');
			grm.ui.clearCache('debug');
		});
		debugMenu.addToggleItem('显示调试时间', grm.debug, 'showDebugTiming', () => {
			if (grm.debug.showDebugTiming) fb.RunMainMenuCommand('视图/控制台');
			grm.ui.clearCache('debug');
		});
		debugMenu.addSeparator();
		debugMenu.addToggleItem('显示面板调用', grm.debug, 'showPanelTraceCall', () => {
			if (grm.debug.showPanelTraceCall) {
				fb.RunMainMenuCommand('视图/控制台');
				grm.debug.traceCall = true;
			} else {
				grm.debug.traceCall = false;
				if (grm.debug.showPanelTraceOnMove) {
					grm.debug.traceOnMove = false;
					grm.debug.showPanelTraceOnMove = false;
				}
			}
		});
		debugMenu.addToggleItem('显示面板移动', grm.debug, 'showPanelTraceOnMove', () => {
			if (grm.debug.showPanelTraceOnMove) {
				fb.RunMainMenuCommand('视图/控制台');
				grm.debug.traceOnMove = true;
				grm.debug.traceCall = true;
				grm.debug.showPanelTraceCall = true;
				return;
			}
			grm.debug.traceOnMove = false;
			grm.debug.traceCall = false;
			grm.debug.showPanelTraceCall = false;
		});
		debugMenu.addToggleItem('显示播放列表性能', grm.debug, 'showPlaylistTraceListPerf', () => {
			grm.debug.traceListPerformance = !grm.debug.traceListPerformance;
			if (grm.debug.showPlaylistTraceListPerf) fb.RunMainMenuCommand('视图/控制台');
		});
		debugMenu.addSeparator();
		debugMenu.addToggleItem('显示面板上下文菜单', grCfg.settings, 'showPanelContextMenu');
		debugMenu.addItem('显示面板属性', false, () => { window.ShowProperties(); });
		debugMenu.addSeparator();
		debugMenu.addItem(`脚本预加载程序设为 ${grSet.asyncThemePreloader ? '同步' : '异步'}`, false, () => {
			const msg = grm.msg.getMessage('menu', 'asyncThemePreloader');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (!confirmed) return;
				grSet.asyncThemePreloader = !grSet.asyncThemePreloader;
				window.Reload();
			});
		});
		debugMenu.addItem('将默认值设置到分栏用户界面配置文件', false, () => {
			const msg = grm.msg.getMessage('menu', 'defaultsUIColumnsConfig');
			grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
				if (!confirmed) return;

				// * 为100%窗口比例参考设置十进制值=96
				WshShell.RegWrite('HKCU\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI', 96, 'REG_DWORD');

				// * 重置属性
				grm.settings.setThemeSettings(false, false, true);
				grm.ui.setDesign('reborn');
				grm.ui.restoreThemeStylePreset(true);

				// * 设置出厂重置状态的基本属性
				grm.ui.displayPlaylist = true;
				plSet.show_scrollbar = false;
				grSet.showTopMenuCompact = true;
				grSet.devTools = false;
				grSet.systemFirstLaunch = true;

				// * 设置窗口和中心
				grm.display.updatePlayerSize('small');
				setTimeout(() => {
					UIWizard.SetWindowPositionInGrid('center');

					// * 保存配置文件
					OpenExplorer(`explorer /open, "${GetShortPath(fb.ProfilePath)}\\configuration"`, false);
					fb.RunMainMenuCommand('文件/保存配置');
				}, 1);
			});
		});
		debugMenu.appendTo(menu);
	}
	// #endregion
}
