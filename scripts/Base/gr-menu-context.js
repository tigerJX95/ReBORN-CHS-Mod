//////////////////////////////////////////////////////////////////////////
// * Georgia-ReBORN: 一个简洁、全动态的颜色重生 foobar2000 主题播放器 * //
// * 类型:           Georgia-ReBORN 上下文菜单控制                    * //
// * 作者:           TT                                               * //
// * 网站:           https://github.com/TT-ReBORN/Georgia-ReBORN      * //
// * 版本:           3.0-x64-DEV                                      * //
// * 开发开始时间:   22-12-2017                                       * //
// * 最后更改:       06-07-2026                                       * //
// * 汉化:           风里闲                                           * //
// * 修改:           风里闲                                           * //
//////////////////////////////////////////////////////////////////////////	

'use strict';


///////////////////////
// * CONTEXT MENUS * //
///////////////////////
/**
 * A class that holds the collection of all available context menus in the theme.
 */
class ContextMenus {
	/**
	 * Creates the `ContextMenus` instance.
	 */
	constructor() {
		/** @public @type {ActiveXObject} The Audio Wizard ActiveX object. */
		this.audioWizard = Component.AudioWizard ? new ActiveXObject('AudioWizard') : null;
	}

	// * PUBLIC METHODS * //
	// #region PUBLIC METHODS
	/**
	 * Contains some basic and SMP related options.
	 * Displayed when shift right clicking in playlist panel or playlist manager.
	 * @param {ContextMenu} cm - The context menu object.
	 */
	contextMenuDefault(cm) {
		if (!cm) {
			return;
		}

		if (!cm.empty()) {
			cm.separator();
		}

		cm.appendItem('控制台', () => {
			fb.ShowConsole();
		});

		cm.appendItem('重启', () => {
			fb.RunMainMenuCommand('文件/重启');
		});

		cm.appendItem('参数选项...', () => {
			fb.RunMainMenuCommand('文件/参数选项');
		});

		cm.separator();

		cm.appendItem('配置面板...', () => {
			window.ShowConfigure();
		});

		cm.appendItem('面板属性...', () => {
			window.ShowProperties();
		});
	}

	/**
	 * Contains top bar related options from top menu "Options" for quick access.
	 * Displayed when right clicking on the top bar.
	 * @param {ContextMenu} cm - The context menu object.
	 */
	contextMenuTopBar(cm) {
		const updateButtons = () => {
			grm.button.createButtons(grm.ui.ww, grm.ui.wh);
			grm.debug.repaintWindow();
		};

		const topMenuDisplayMenu = new ContextMenu('显示');

		// * DISPLAY - SHOW TOP MENU BUTTONS - DEFAULT * //
		const topMenuDisplayMenuDefault = new ContextMenu('默认');
		topMenuDisplayMenuDefault.appendItem('详情', () => {
			grSet.showPanelDetails_default = !grSet.showPanelDetails_default;
			updateButtons();
		}, { is_checked: grSet.showPanelDetails_default });
		topMenuDisplayMenuDefault.appendItem('曲库', () => {
			grSet.showPanelLibrary_default = !grSet.showPanelLibrary_default;
			updateButtons();
		}, { is_checked: grSet.showPanelLibrary_default });
		topMenuDisplayMenuDefault.appendItem('简介', () => {
			grSet.showPanelBiography_default = !grSet.showPanelBiography_default;
			updateButtons();
		}, { is_checked: grSet.showPanelBiography_default });
		topMenuDisplayMenuDefault.appendItem('歌词', () => {
			grSet.showPanelLyrics_default = !grSet.showPanelLyrics_default;
			updateButtons();
		}, { is_checked: grSet.showPanelLyrics_default });
		topMenuDisplayMenuDefault.appendItem('评级', () => {
			grSet.showPanelRating_default = !grSet.showPanelRating_default;
			updateButtons();
		}, { is_checked: grSet.showPanelRating_default });
		topMenuDisplayMenu.append(topMenuDisplayMenuDefault);

		// * DISPLAY - SHOW TOP MENU BUTTONS - ARTWORK * //
		const topMenuDisplayMenuArtwork = new ContextMenu('封面');
		topMenuDisplayMenuArtwork.appendItem('详情', () => {
			grSet.showPanelDetails_artwork = !grSet.showPanelDetails_artwork;
			updateButtons();
		}, { is_checked: grSet.showPanelDetails_artwork });
		topMenuDisplayMenuArtwork.appendItem('曲库', () => {
			grSet.showPanelLibrary_artwork = !grSet.showPanelLibrary_artwork;
			updateButtons();
		}, { is_checked: grSet.showPanelLibrary_artwork });
		topMenuDisplayMenuArtwork.appendItem('简介', () => {
			grSet.showPanelBiography_artwork = !grSet.showPanelBiography_artwork;
			updateButtons();
		}, { is_checked: grSet.showPanelBiography_artwork });
		topMenuDisplayMenuArtwork.appendItem('歌词', () => {
			grSet.showPanelLyrics_artwork = !grSet.showPanelLyrics_artwork;
			updateButtons();
		}, { is_checked: grSet.showPanelLyrics_artwork });
		topMenuDisplayMenuArtwork.appendItem('评级', () => {
			grSet.showPanelRating_artwork = !grSet.showPanelRating_artwork;
			updateButtons();
		}, { is_checked: grSet.showPanelRating_artwork });
		topMenuDisplayMenu.append(topMenuDisplayMenuArtwork);
		topMenuDisplayMenu.separator();

		// * DISPLAY - ALIGN TOP MENU BUTTONS * //
		const topMenuDisplayAlign = [['向左对齐', 'left'], ['居中对齐', 'center']];
		for (const align of topMenuDisplayAlign) {
			topMenuDisplayMenu.appendItem(align[0], ((align) => {
				grSet.topMenuAlignment = align;
				updateButtons();
			}).bind(null, align[1]), { is_radio_checked: align[1] === grSet.topMenuAlignment });
		}
		topMenuDisplayMenu.separator();
		topMenuDisplayMenu.appendItem('简化顶部菜单', () => {
			grSet.topMenuCompact = !grSet.topMenuCompact;
			if (!grSet.topMenuCompact) {
				grm.button.topMenu(false);
			}
		}, { is_checked: grSet.topMenuCompact });
		topMenuDisplayMenu.appendItem('简化顶部菜单（仅符号）', () => {
			grSet.topMenuCompactSymbolOnly = !grSet.topMenuCompactSymbolOnly;
			updateButtons();
		}, { is_checked: grSet.topMenuCompactSymbolOnly, is_grayed_out: !grSet.topMenuCompact });

		cm.append(topMenuDisplayMenu);

		// * STYLE - TOP MENU BUTTONS * //
		const topMenuStyleMenu = new ContextMenu('样式');
		const topMenuButtonStyle = [
			['默认', 'default'],
			['填充', 'filled'],
			['斜面', 'bevel'],
			['内凹', 'inner'],
			['浮雕', 'emboss'],
			['极简', 'minimal']
		];
		for (const style of topMenuButtonStyle) {
			topMenuStyleMenu.appendItem(style[0], ((style) => {
				grSet.styleTopMenuButtons = style;
				if (!grSet.themeSandbox) grSet.savedStyleTopMenuButtons = grSet.styleTopMenuButtons = style; else grSet.styleTopMenuButtons = style;
				grm.ui.updateStyle();
			}).bind(null, style[1]), { is_radio_checked: style[1] === grSet.styleTopMenuButtons });
		}
		cm.append(topMenuStyleMenu);
	}

	/**
	 * Contains some options not find in top menu "Options" and append panel related top menu "Options" for quick access.
	 * Displayed when right clicking on the big album art on the left side.
	 * @param {ContextMenu} cm - The context menu object.
	 */
	contextMenuAlbumCover(cm) {
		if (!grSet.showTransportControls_default) {
			cm.appendItem('⏹️ 停止', () => {
				fb.Stop();
			});
			cm.appendItem('⏮️ 上一首', () => {
				fb.Prev();
			});
			cm.appendItem(fb.IsPlaying ? '⏯️ 播放 | 暂停' : '▶️ 播放', () => {
				fb.PlayOrPause();
			});
			cm.appendItem('⏭️ 下一首', () => {
				fb.Next();
			});
			cm.separator();

			const playbackOrderMenu = new ContextMenu('播放次序 🔂');
			const playbackOrderModes = [
				{ id: '默认', value: PlaybackOrder.Default },
				{ id: '重复(播放列表)', value: PlaybackOrder.RepeatPlaylist },
				{ id: '重复(音轨)', value: PlaybackOrder.RepeatTrack },
				{ id: '乱序(音轨)', value: PlaybackOrder.ShuffleTracks }
			];
			for (const playbackOrder of playbackOrderModes) {
				playbackOrderMenu.appendItem(playbackOrder.id, () => {
					plman.PlaybackOrder = playbackOrder.value;
					grSet.playbackOrder = playbackOrder.id;
				}, { is_radio_checked: playbackOrder.value === plman.PlaybackOrder });
			}
			cm.append(playbackOrderMenu);
			cm.separator();
		}

		// * Top menu options - Playlist, Details, Library, Lyrics - context menu
		const showPlaylist = grSet.layout === 'artwork' ? grm.ui.displayPlaylistArtwork && !grm.ui.displayLyrics : grm.ui.displayPlaylist && !grm.ui.displayLyrics;
		const showDetails = grm.ui.displayDetails;
		const showArtworkLayoutAlbumArt = grSet.layout === 'artwork' && !grm.ui.displayPlaylist && !grm.ui.displayPlaylistArtwork && !grm.ui.displayLibrary && !grm.ui.displayBiography && !grm.ui.displayLyrics;

		if (!showArtworkLayoutAlbumArt) {
			cm.appendItem(showPlaylist ? '选项菜单 - 播放列表' : showDetails ? '选项菜单 - 详情' : grm.ui.displayLibrary ? '选项菜单 - 曲库' : '选项菜单 - 歌词', () => {
				if (showPlaylist) {
					grm.topMenu.topMenuOptions(grm.ui.displayBiography ? grm.ui.state.mouse_x * 2 : grm.ui.state.mouse_x, grm.ui.state.mouse_y, true, 'playlist');
				}
				else if (showDetails) {
					grm.topMenu.topMenuOptions(grm.ui.state.mouse_x, grm.ui.state.mouse_y, true, 'details');
				}
				else if (grm.ui.displayLibrary) {
					grm.topMenu.topMenuOptions(grm.ui.state.mouse_x, grm.ui.state.mouse_y, true, 'library');
				}
				else if (grm.ui.displayLyrics) {
					grm.topMenu.topMenuOptions(grm.ui.state.mouse_x, grm.ui.state.mouse_y, true, 'lyrics');
				}
			});
			cm.separator();
		}

		if (grSet.theme === 'random') {
			cm.appendItem('生成新的颜色', () => {
				grm.ui.getRandomThemeColorContextMenu = true;
				grm.ui.initTheme();
				setTimeout(() => { grm.ui.getRandomThemeColorContextMenu = false }, 200);
			});
			cm.separator();
		}

		if (grSet.layout === 'default' && grSet.theme.startsWith('custom')) {
			cm.appendItem(!grm.ui.displayCustomThemeMenu ? '编辑自定义主题' : '退出自定义主题菜单', () => {
				grm.ui.initCustomThemeMenuState();
			});
			cm.separator();
		}

		if (showDetails) {
			cm.appendItem(!grm.ui.displayMetadataGridMenu ? '编辑元数据表格' : '退出元数据表格菜单', () => {
				grm.details.initGridMenuState();
			});
			cm.separator();
		}

		if (grSet.layout === 'default') {
			if (grm.ui.displayPlaylist && !grm.ui.displayBiography && !grm.ui.displayLyrics) {
				cm.appendItem(grm.ui.displayPlaylist && grSet.playlistLayout === 'normal' ? '切换 ⇒ 完整布局' : '切换 ⇒ 常规布局', () => {
					grSet.playlistLayout = grSet.playlistLayout === 'normal' ? 'full' : 'normal';
					grm.ui.initPlaylistLayoutState();
				});
				cm.separator();
			}
			else if (grm.ui.displayLibrary) {
				cm.appendItem(grm.ui.displayLibrary && grSet.libraryLayout === 'normal' ? '切换 ⇒ 完整布局' : '切换 ⇒ 常规布局', () => {
					grSet.libraryLayout = grSet.libraryLayout === 'normal' ? 'full' : 'normal';
					grm.ui.initLibraryLayoutState();
				});
				if (grSet.libraryLayout === 'normal') {
					cm.appendItem(grm.ui.displayLibrary && grSet.libraryLayout === 'normal' ? '切换 ⇒ 拆分布局' : '切换 ⇒ 常规布局', () => {
						grSet.libraryLayout = grSet.libraryLayout === 'normal' ? 'split' : 'normal';
						grm.ui.initLibraryLayoutState();
					});
				}
				cm.separator();
			}
			else if (grm.ui.displayLyrics) {
				cm.appendItem(grm.ui.displayLyrics && grSet.lyricsLayout === 'normal' ? '切换 ⇒ 完整布局' : '切换 ⇒ 常规布局', () => {
					grSet.savedLyricsLayout = grSet.lyricsLayout = grSet.lyricsLayout === 'normal' ? 'full' : 'normal';
					grm.ui.initLyricsLayoutState();
				});
				cm.separator();
			}
		}

		cm.appendItem('浏览模式', () => {
			grSet.panelBrowseMode = !grSet.panelBrowseMode;
			grm.ui.initBrowserModeState();
		}, { is_checked: grSet.panelBrowseMode });
		cm.separator();

		cm.appendItem(grSet.layout !== 'artwork' && (grm.ui.displayPlaylist || grm.ui.displayLyrics && grSet.lyricsLayout === 'full') ? '详情' : '播放列表', () => {
			if (grSet.layout !== 'artwork') {
				grm.button.btn.details.onClick();
			}
			else if (grSet.layout === 'artwork') {
				grm.button.btn.playlist.onClick();
			}
		});
		cm.separator();

		if (grm.ui.displayLyrics) {
			const verticalMenu = new ContextMenu('中文竖排');
			verticalMenu.appendItem('开启', () => {
				if (grSet.layout !== 'default') {
					fb.ShowPopupMessage('请先切换到默认布局后再开启中文竖排。', '中文竖排');
					return;
				}
				grSet.lyricsVerticalChineseMode = 'on';
				grm.lyrics.initLyrics();
				window.Repaint();
			}, { is_radio_checked: grSet.lyricsVerticalChineseMode === 'on' });
			verticalMenu.appendItem('关闭', () => {
				grSet.lyricsVerticalChineseMode = 'off';
				grm.lyrics.initLyrics();
				window.Repaint();
			}, { is_radio_checked: grSet.lyricsVerticalChineseMode !== 'on' });
			verticalMenu.separator();
			verticalMenu.appendItem('长句自动换列', () => {
				grSet.lyricsVerticalLongLineMode = 'wrap';
				window.Repaint();
			}, { is_radio_checked: grSet.lyricsVerticalLongLineMode !== 'auto-shrink' });
			verticalMenu.appendItem('长句自动缩小字号', () => {
				grSet.lyricsVerticalLongLineMode = 'auto-shrink';
				window.Repaint();
			}, { is_radio_checked: grSet.lyricsVerticalLongLineMode === 'auto-shrink' });
			cm.append(verticalMenu);
			cm.separator();
		}

		if (grm.ui.displayDetails) {
			cm.appendItem('圆周歌词：水平文字', () => {
				window.SetProperty('TT - 圆周歌词 PRE3: 文字样式', 'horizontal');
				grSet.detailsArcLyricsStyle = 'horizontal';
				window.Repaint();
			}, { is_radio_checked: grm.lyrics.getCircularArcStyle() === 'horizontal' });
			cm.appendItem('圆周歌词：随圆弧倾斜', () => {
				window.SetProperty('TT - 圆周歌词 PRE3: 文字样式', 'tilted');
				grSet.detailsArcLyricsStyle = 'tilted';
				window.Repaint();
			}, { is_radio_checked: grm.lyrics.getCircularArcStyle() === 'tilted' });
			cm.separator();
		}

		cm.appendItem(grm.ui.displayLyrics ? '隐藏   歌词' : '显示   歌词', () => {
			grm.ui.initLyricsDisplayState('contextMenu');
		});
		cm.appendItem('下一个歌词', () => { 
		    grm.lyrics.nextLyrics(); 
		});
        cm.appendItem('搜索   歌词 🔍', () => {
            fb.RunMainMenuCommand('视图/ESLyric/搜索歌词...');
        });
        cm.appendItem('复制   歌词', () => {
            fb.RunMainMenuCommand('视图/ESLyric/面板/复制歌词/复制...');
        });
        cm.appendItem('ESLyric 弹窗', () => {
            fb.RunMainMenuCommand('视图/ESLyric');
        });
        cm.appendItem(grm.ui.playLyrics ? '隐藏（桌面歌词）' : '显示（桌面歌词）', () => {
            fb.RunMainMenuCommand('视图/ESLyric/显示桌面歌词');
			if (grSet.layout === 'artwork' && grm.ui.playPlaylist) {
				grm.ui.playPlaylist = false;
			}
			grm.ui.playLyrics = !grm.ui.playLyrics;
			if (!grm.ui.playLyrics && grSet.lyricsLayout === 'full' || grm.ui.noAlbumArtStub) {
				grm.ui.playPlaylist = true;
			}
			if (grm.ui.playLyrics && grSet.lyricsLayout === 'full') {
				grm.ui.playPlaylist = false;
				grm.ui.playDetails = false;
			}
        });
        cm.appendItem('打开歌词所在目录', () => {
            fb.RunMainMenuCommand('视图/ESLyric/面板/打开歌词所在目录');
        });
        cm.separator();
		if (grm.ui.albumArtList.length > 1) {
			if (grm.ui.albumArtIndex !== grm.ui.albumArtList.length - 1) {
				cm.appendItem(fb.IsPlaying ? '显示下一张图片' : '', () => {
					grm.ui.displayAlbumArtImage('next', false);
				});
			}
			if (grm.ui.albumArtIndex !== 0) {
				cm.appendItem(fb.IsPlaying ? '显示上一张图片' : '', () => {
					grm.ui.displayAlbumArtImage('prev', false);
				});
			}
		}

		cm.separator();

		const query = $('$if3(%album artist%, %artist%, %composer%)', fb.GetNowPlaying()).replace(Regex.SpaceSingle, '%20');
		cm.appendItem('💿 获取碟片', () => {
			RunCmd(`https://fanart.tv/?s=${query}&sect=2`);
		});

		const discArtMenu = new ContextMenu('💿 碟片占位符');
		const setDiscArtStub = (discArt) => {
			grSet.discArtStub = discArt;
			grSet.noDiscArtStub = false;
			grm.ui.newTrackFetchingArtwork = true;
			grm.details.discArtCover = grm.details.disposeDiscArt(grm.details.discArtCover);
			grm.ui.fetchNewArtwork(fb.GetNowPlaying());
			grm.debug.repaintWindow();
		};
		discArtMenu.appendItem('未找到碟片则显示占位符', () => {
			grSet.showDiscArtStub = !grSet.showDiscArtStub;
			grSet.noDiscArtStub = false;
			grm.ui.fetchNewArtwork(fb.GetNowPlaying());
			window.Repaint();
		}, { is_checked: grSet.showDiscArtStub });
		discArtMenu.separator();
		discArtMenu.appendItem('无占位符', () => {
			grSet.noDiscArtStub = !grSet.noDiscArtStub;
			grSet.showDiscArtStub = false;
			grm.details.discArt = grm.details.disposeDiscArt(grm.details.discArt);
			grm.details.discArtCover = grm.details.disposeDiscArt(grm.details.discArtCover);
			grm.details.discArtArray = [];
			if (!grSet.noDiscArtStub) grm.ui.fetchNewArtwork(fb.GetNowPlaying());
			window.Repaint();
		}, { is_checked: grSet.noDiscArtStub });
		discArtMenu.separator();

		const discArtCommonMenu = new ContextMenu('通用');
		const displayCommonCdArtMenu = [
			['通用 - CD - 专辑封面', 'cdAlbumCover'],
			['通用 - CD - 白色', 'cdWhite'],
			['通用 - CD - 黑色', 'cdBlack'],
			['通用 - CD - 空白', 'cdBlank'],
			['通用 - CD - 透明', 'cdTrans']
		];
		for (const cdArt of displayCommonCdArtMenu) {
			discArtCommonMenu.appendItem(cdArt[0], ((cdArt) => {
				setDiscArtStub(cdArt);
			}).bind(null, cdArt[1]), { is_radio_checked: cdArt[1] === grSet.discArtStub });
		}
		discArtCommonMenu.separator(); // 增加分隔线
		const displayCommonVinylArtMenu = [
			['通用 - 黑胶 - 专辑封面', 'vinylAlbumCover'],
			['通用 - 黑胶 - 白色', 'vinylWhite'],
			['通用 - 黑胶 - 空洞', 'vinylVoid'],
			['通用 - 黑胶 - 冷聚', 'vinylColdFusion'],
			['通用 - 黑胶 - 火环', 'vinylRingOfFire'],
			['通用 - 黑胶 - 淡棕', 'vinylMaple'],
			['通用 - 黑胶 - 黑色', 'vinylBlack'],
			['通用 - 黑胶 - 黑洞', 'vinylBlackHole'],
			['通用 - 黑胶 - 乌木', 'vinylEbony'],
			['通用 - 黑胶 - 透明', 'vinylTrans']
		];
		for (const vinylArt of displayCommonVinylArtMenu) {
			discArtCommonMenu.appendItem(vinylArt[0], ((vinylArt) => {
				setDiscArtStub(vinylArt);
			}).bind(null, vinylArt[1]), { is_radio_checked: vinylArt[1] === grSet.discArtStub });
		}
		//以下18行为旋转碟片自定义项目
		discArtCommonMenu.separator(); // 增加分隔线
		const displayCommonDiyArtMenu = [
			['通用 - 自定义 - 红色', 'diyRed'],
			['通用 - 自定义 - 黄色', 'diyYellow'],
			['通用 - 自定义 - 绿色', 'diyGreen'],
			['通用 - 自定义 - 轮胎', 'diyTyre'],
			['通用 - 自定义 - 电锯', 'diySaw'],
			['通用 - 自定义 - 罗盘', 'diyCompass'],
			['通用 - 自定义 - 漩涡', 'diyVortex'],
			['通用 - 自定义 - 双鱼', 'diyPisces'],
			['通用 - 自定义 - 风扇', 'diyA'],
			['通用 - 自定义 - 次元', 'diyB']
		];
		for (const diyArt of displayCommonDiyArtMenu) {
			discArtCommonMenu.appendItem(diyArt[0], ((diyArt) => {
				setDiscArtStub(diyArt);
			}).bind(null, diyArt[1]), { is_radio_checked: diyArt[1] === grSet.discArtStub });
		}
		discArtMenu.append(discArtCommonMenu);

		const discArtThemeMenu = new ContextMenu('主题');
		const displayThemeCdArtMenu = [
			['主题 - CD - 蓝色', 'themeCdBlue'],
			['主题 - CD - 深蓝', 'themeCdDarkBlue'],
			['主题 - CD - 红色', 'themeCdRed'],
			['主题 - CD - 奶油', 'themeCdCream'],
			['主题 - CD - 荧光蓝', 'themeCdNblue'],
			['主题 - CD - 荧光绿', 'themeCdNgreen'],
			['主题 - CD - 荧光红', 'themeCdNred'],
			['主题 - CD - 荧光金', 'themeCdNgold']
		];
		for (const cdArt of displayThemeCdArtMenu) {
			discArtThemeMenu.appendItem(cdArt[0], ((cdArt) => {
				setDiscArtStub(cdArt);
			}).bind(null, cdArt[1]), { is_radio_checked: cdArt[1] === grSet.discArtStub });
		}
		discArtThemeMenu.separator(); // 增加分隔线
		const displayThemeVinylArtMenu = [
			['主题 - 黑胶 - 蓝色', 'themeVinylBlue'],
			['主题 - 黑胶 - 深蓝', 'themeVinylDarkBlue'],
			['主题 - 黑胶 - 红色', 'themeVinylRed'],
			['主题 - 黑胶 - 奶油', 'themeVinylCream'],
			['主题 - 黑胶 - 荧光蓝', 'themeVinylNblue'],
			['主题 - 黑胶 - 荧光绿', 'themeVinylNgreen'],
			['主题 - 黑胶 - 荧光红', 'themeVinylNred'],
			['主题 - 黑胶 - 荧光金', 'themeVinylNgold']
		];
		for (const vinylArt of displayThemeVinylArtMenu) {
			discArtThemeMenu.appendItem(vinylArt[0], ((vinylArt) => {
				setDiscArtStub(vinylArt);
			}).bind(null, vinylArt[1]), { is_radio_checked: vinylArt[1] === grSet.discArtStub });
		}
		discArtMenu.append(discArtThemeMenu);

		// * DISC ART CUSTOM PLACEHOLDERS * //
		const discArtCustomMenu = new ContextMenu('自定义');
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
		for (const [index, customDiscArtLabel] of customDiscArtLabels.entries()) {
			discArtCustomMenu.appendItem(customDiscArtLabel, ((discArt) => {
				grSet.discArtStub = discArt;
				grSet.noDiscArtStub = false;
				grPath.discArtCustomStub = `${fb.ProfilePath}georgia-reborn\\images\\custom\\discart\\${grSet.discArtStub}.png`;
				grm.details.discArtCover = grm.details.disposeDiscArt(grm.details.discArtCover);
				grm.ui.fetchNewArtwork(fb.GetNowPlaying());
				window.Repaint();
				if (!IsFile(grPath.discArtCustomStub)) {
					grm.msg.showPopupNotice('contextMenu', 'discArtCustomStub');
				}
			}).bind(null, customDiscArtValues[index]), { is_radio_checked: customDiscArtValues[index] === grSet.discArtStub });
		}
		discArtMenu.append(discArtCustomMenu);
		cm.append(discArtMenu);
		cm.separator();

		cm.appendItem('打开所在文件夹', () => {
			fb.RunContextCommand('打开所在文件夹');
		});

		cm.appendItem('属性', () => {
			fb.RunContextCommand('属性');
		});

		cm.separator();

		cm.appendItem('🔄️ 重载主题', () => {
			window.Reload();
		});
	}

	/**
	 * Contains all seekbar ( progress bar, peakmeter bar and waveform bar ) top menu "Options" for quick access.
	 * Displayed when right clicking on the lower bar.
	 * @param {ContextMenu} cm - The context menu object.
	 */
	contextMenuLowerBar(cm) {
		const updateButtons = () => {
			grm.button.createButtons(grm.ui.ww, grm.ui.wh);
			grm.debug.repaintWindow();
		};

		const updateSeekbar = () => {
			grm.ui.setMainMetrics();
			grm.debug.repaintWindow();
		};

		// * TRANSPORT BUTTON SIZE * //
		const transportSizeMenu = new ContextMenu('通用按钮大小');
		const transportSizeMenuDefault = new ContextMenu('默认');
		const transportSizeDefault = [['28 像素', 28], ['30 像素', 30], ['32 像素（默认）', 32], ['34 像素', 34], ['36 像素', 36], ['38 像素', 38], ['40 像素', 40], ['42 像素', 42]];
		for (const size of transportSizeDefault) {
			transportSizeMenuDefault.appendItem(size[0], ((size) => {
				grSet.transportButtonSize_default = size;
				if (size === -1) {
					grSet.transportButtonSize_default -= 2;
				} else if (size === 999) {
					grSet.transportButtonSize_default += 2;
				} else {
					grSet.transportButtonSize_default = size;
				}
				grm.ui.createFonts();
				updateButtons();
			}).bind(null, size[1]), { is_radio_checked: size[1] === grSet.transportButtonSize_default });
		}
		transportSizeMenu.append(transportSizeMenuDefault);

		const transportSizeMenuArtwork = new ContextMenu('封面');
		const transportSizeArtwork = [['28 像素', 28], ['30 像素', 30], ['32 像素（默认）', 32], ['34 像素', 34], ['36 像素', 36], ['38 像素', 38], ['40 像素', 40], ['42 像素', 42]];
		for (const size of transportSizeArtwork) {
			transportSizeMenuArtwork.appendItem(size[0], ((size) => {
				grSet.transportButtonSize_artwork = size;
				if (size === -1) {
					grSet.transportButtonSize_artwork -= 2;
				} else if (size === 999) {
					grSet.transportButtonSize_artwork += 2;
				} else {
					grSet.transportButtonSize_artwork = size;
				}
				grm.ui.createFonts();
				updateButtons();
			}).bind(null, size[1]), { is_radio_checked: size[1] === grSet.transportButtonSize_artwork });
		}
		transportSizeMenu.append(transportSizeMenuArtwork);

		const transportSizeMenuCompact = new ContextMenu('简单');
		const transportSizeCompact = [['28 像素', 28], ['30 像素', 30], ['32 像素（默认）', 32], ['34 像素', 34], ['36 像素', 36], ['38 像素', 38], ['40 像素', 40], ['42 像素', 42]];
		for (const size of transportSizeCompact) {
			transportSizeMenuCompact.appendItem(size[0], ((size) => {
				grSet.transportButtonSize_compact = size;
				if (size === -1) {
					grSet.transportButtonSize_compact -= 2;
				} else if (size === 999) {
					grSet.transportButtonSize_compact += 2;
				} else {
					grSet.transportButtonSize_compact = size;
				}
				grm.ui.createFonts();
				updateButtons();
			}).bind(null, size[1]), { is_radio_checked: size[1] === grSet.transportButtonSize_compact });
		}
		transportSizeMenu.append(transportSizeMenuCompact);
		cm.append(transportSizeMenu);

		// * TRANSPORT BUTTON SPACING * //
		const transportSpacingMenu = new ContextMenu('通用按钮间距');
		const transportSpacingMenuDefault = new ContextMenu('默认');
		const transportSpacingDefault = [['-2', -1], [' 3 像素', 3], [' 5 像素（默认）', 5], [' 7 像素', 7], ['10 像素', 10], ['15 像素', 15], ['+2', 999]];
		for (const spacing of transportSpacingDefault) {
			transportSpacingMenuDefault.appendItem(spacing[0], ((spacing) => {
				grSet.transportButtonSpacing_default = spacing;
				if (spacing === -1) {
					grSet.transportButtonSpacing_default -= 2;
				} else if (spacing === 999) {
					grSet.transportButtonSpacing_default += 2;
				} else {
					grSet.transportButtonSpacing_default = spacing;
				}
				grm.ui.updateStyle();
			}).bind(null, spacing[1]), { is_radio_checked: spacing[1] === grSet.transportButtonSpacing_default });
		}
		transportSpacingMenu.append(transportSpacingMenuDefault);

		const transportSpacingMenuArtwork = new ContextMenu('封面');
		const transportSpacingArtwork = [['-2', -1], [' 3 像素', 3], [' 5 像素（默认）', 5], [' 7 像素', 7], ['10 像素', 10], ['15 像素', 15], ['+2', 999]];
		for (const spacing of transportSpacingArtwork) {
			transportSpacingMenuArtwork.appendItem(spacing[0], ((spacing) => {
				grSet.transportButtonSpacing_artwork = spacing;
				if (spacing === -1) {
					grSet.transportButtonSpacing_artwork -= 2;
				} else if (spacing === 999) {
					grSet.transportButtonSpacing_artwork += 2;
				} else {
					grSet.transportButtonSpacing_artwork = spacing;
				}
				grm.ui.updateStyle();
			}).bind(null, spacing[1]), { is_radio_checked: spacing[1] === grSet.transportButtonSpacing_artwork });
		}
		transportSpacingMenu.append(transportSpacingMenuArtwork);

		const transportSpacingMenuCompact = new ContextMenu('简单');
		const transportSpacingCompact = [['-2', -1], [' 3 像素', 3], [' 5 像素（默认）', 5], [' 7 像素', 7], ['10 像素', 10], ['15 像素', 15], ['+2', 999]];
		for (const spacing of transportSpacingCompact) {
			transportSpacingMenuCompact.appendItem(spacing[0], ((spacing) => {
				grSet.transportButtonSpacing_compact = spacing;
				if (spacing === -1) {
					grSet.transportButtonSpacing_compact -= 2;
				} else if (spacing === 999) {
					grSet.transportButtonSpacing_compact += 2;
				} else {
					grSet.transportButtonSpacing_compact = spacing;
				}
				grm.ui.updateStyle();
			}).bind(null, spacing[1]), { is_radio_checked: spacing[1] === grSet.transportButtonSpacing_compact });
		}
		transportSpacingMenu.append(transportSpacingMenuCompact);
		cm.append(transportSpacingMenu);

		cm.separator();
		const transportButtonDisplayMenu = new ContextMenu('显示');

		// * SHOW TRANSPORT CONTROLS * //
		const transportControlsMenu = new ContextMenu('显示通用控制');
		transportControlsMenu.appendItem('默认', () => {
			grSet.showTransportControls_default = !grSet.showTransportControls_default;
			updateButtons();
		}, { is_checked: grSet.showTransportControls_default });
		transportControlsMenu.appendItem('封面', () => {
			grSet.showTransportControls_artwork = !grSet.showTransportControls_artwork;
			updateButtons();
		}, { is_checked: grSet.showTransportControls_artwork });
		transportControlsMenu.appendItem('简单', () => {
			grSet.showTransportControls_compact = !grSet.showTransportControls_compact;
			updateButtons();
		}, { is_checked: grSet.showTransportControls_compact });
		transportButtonDisplayMenu.append(transportControlsMenu);

		// * SHOW PLAYBACK ORDER BUTTON * //
		const playbackOrderBtnMenu = new ContextMenu('显示播放次序按钮');
		playbackOrderBtnMenu.appendItem('默认', () => {
			grSet.showPlaybackOrderBtn_default = !grSet.showPlaybackOrderBtn_default;
			updateButtons();
		}, { is_checked: grSet.showPlaybackOrderBtn_default });
		playbackOrderBtnMenu.appendItem('封面', () => {
			grSet.showPlaybackOrderBtn_artwork = !grSet.showPlaybackOrderBtn_artwork;
			updateButtons();
		}, { is_checked: grSet.showPlaybackOrderBtn_artwork });
		playbackOrderBtnMenu.appendItem('简单', () => {
			grSet.showPlaybackOrderBtn_compact = !grSet.showPlaybackOrderBtn_compact;
			updateButtons();
		}, { is_checked: grSet.showPlaybackOrderBtn_compact });
		transportButtonDisplayMenu.append(playbackOrderBtnMenu);

		// * SHOW RELOAD BUTTON * //
		const reloadBtnMenu = new ContextMenu('显示重载按钮');
		reloadBtnMenu.appendItem('默认', () => {
			grSet.showReloadBtn_default = !grSet.showReloadBtn_default;
			updateButtons();
		}, { is_checked: grSet.showReloadBtn_default });
		reloadBtnMenu.appendItem('封面', () => {
			grSet.showReloadBtn_artwork = !grSet.showReloadBtn_artwork;
			updateButtons();
		}, { is_checked: grSet.showReloadBtn_artwork });
		reloadBtnMenu.appendItem('简单', () => {
			grSet.showReloadBtn_compact = !grSet.showReloadBtn_compact;
			updateButtons();
		}, { is_checked: grSet.showReloadBtn_compact });
		transportButtonDisplayMenu.append(reloadBtnMenu);

		// * SHOW ADD TRACKS BUTTON * //
		const addTrackBtnMenu = new ContextMenu('显示收藏音轨按钮');
		addTrackBtnMenu.appendItem('默认', () => {
			grSet.showAddTracksBtn_default = !grSet.showAddTracksBtn_default;
			updateButtons();
		}, { is_checked: grSet.showAddTracksBtn_default });
		addTrackBtnMenu.appendItem('封面', () => {
			grSet.showAddTracksBtn_artwork = !grSet.showAddTracksBtn_artwork;
			updateButtons();
		}, { is_checked: grSet.showAddTracksBtn_artwork });
		addTrackBtnMenu.appendItem('简单', () => {
			grSet.showAddTracksBtn_compact = !grSet.showAddTracksBtn_compact;
			updateButtons();
		}, { is_checked: grSet.showAddTracksBtn_compact });
		transportButtonDisplayMenu.append(addTrackBtnMenu);

		// * SHOW VOLUME BUTTON * //
		const volumeBtnMenu = new ContextMenu('显示音量按钮');
		volumeBtnMenu.appendItem('默认', () => {
			grSet.showVolumeBtn_default = !grSet.showVolumeBtn_default;
			updateButtons();
		}, { is_checked: grSet.showVolumeBtn_default });
		volumeBtnMenu.appendItem('封面', () => {
			grSet.showVolumeBtn_artwork = !grSet.showVolumeBtn_artwork;
			updateButtons();
		}, { is_checked: grSet.showVolumeBtn_artwork });
		volumeBtnMenu.appendItem('简单', () => {
			grSet.showVolumeBtn_compact = !grSet.showVolumeBtn_compact;
			updateButtons();
		}, { is_checked: grSet.showVolumeBtn_compact });
		volumeBtnMenu.separator();
		volumeBtnMenu.appendItem('自动-隐藏音量条', () => {
			grSet.autoHideVolumeBar = !grSet.autoHideVolumeBar;
			grm.volBtn.toggleVolumeBar();
			updateButtons();
		}, { is_checked: grSet.autoHideVolumeBar });
		transportButtonDisplayMenu.append(volumeBtnMenu);
		transportButtonDisplayMenu.separator();

		// * SHOW PLAYBACK TIME IN LOWER BAR * //
		const playbackTimeMenu = new ContextMenu('显示播放时间');
		playbackTimeMenu.appendItem('默认', () => {
			grSet.showPlaybackTime_default = !grSet.showPlaybackTime_default;
			updateButtons();
		}, { is_checked: grSet.showPlaybackTime_default });
		playbackTimeMenu.appendItem('封面', () => {
			grSet.showPlaybackTime_artwork = !grSet.showPlaybackTime_artwork;
			updateButtons();
		}, { is_checked: grSet.showPlaybackTime_artwork });
		playbackTimeMenu.appendItem('简单', () => {
			grSet.showPlaybackTime_compact = !grSet.showPlaybackTime_compact;
			updateButtons();
		}, { is_checked: grSet.showPlaybackTime_compact });
		transportButtonDisplayMenu.append(playbackTimeMenu);

		// * SHOW ARTIST IN LOWER BAR * //
		const showArtistMenu = new ContextMenu('显示艺术家');
		showArtistMenu.appendItem('默认', () => {
			grSet.showLowerBarArtist_default = !grSet.showLowerBarArtist_default;
			window.Repaint();
		}, { is_checked: grSet.showLowerBarArtist_default });
		showArtistMenu.appendItem('封面', () => {
			grSet.showLowerBarArtist_artwork = !grSet.showLowerBarArtist_artwork;
			window.Repaint();
		}, { is_checked: grSet.showLowerBarArtist_artwork });
		showArtistMenu.appendItem('简单', () => {
			grSet.showLowerBarArtist_compact = !grSet.showLowerBarArtist_compact;
			window.Repaint();
		}, { is_checked: grSet.showLowerBarArtist_compact });
		transportButtonDisplayMenu.append(showArtistMenu);

		// * SHOW TRACK NUMBER IN LOWER BAR * //
		const showTrackNumberMenu = new ContextMenu('显示音轨号');
		showTrackNumberMenu.appendItem('默认', () => {
			grSet.showLowerBarTrackNum_default = !grSet.showLowerBarTrackNum_default;
			on_metadb_changed();
			window.Repaint();
		}, { is_checked: grSet.showLowerBarTrackNum_default });
		showTrackNumberMenu.appendItem('封面', () => {
			grSet.showLowerBarTrackNum_artwork = !grSet.showLowerBarTrackNum_artwork;
			on_metadb_changed();
			window.Repaint();
		}, { is_checked: grSet.showLowerBarTrackNum_artwork });
		showTrackNumberMenu.appendItem('简单', () => {
			grSet.showLowerBarTrackNum_compact = !grSet.showLowerBarTrackNum_compact;
			on_metadb_changed();
			window.Repaint();
		}, { is_checked: grSet.showLowerBarTrackNum_compact });
		transportButtonDisplayMenu.append(showTrackNumberMenu);

		// * SHOW TRACK TITLE IN LOWER BAR * //
		const showTitleMenu = new ContextMenu('显示歌曲标题');
		showTitleMenu.appendItem('默认', () => {
			grSet.showLowerBarTitle_default = !grSet.showLowerBarTitle_default;
			window.Repaint();
		}, { is_checked: grSet.showLowerBarTitle_default });
		showTitleMenu.appendItem('封面', () => {
			grSet.showLowerBarTitle_artwork = !grSet.showLowerBarTitle_artwork;
			window.Repaint();
		}, { is_checked: grSet.showLowerBarTitle_artwork });
		showTitleMenu.appendItem('简单', () => {
			grSet.showLowerBarTitle_compact = !grSet.showLowerBarTitle_compact;
			window.Repaint();
		}, { is_checked: grSet.showLowerBarTitle_compact });
		transportButtonDisplayMenu.append(showTitleMenu);

		// * SHOW COMPOSER IN LOWER BAR * //
		const showComposerMenu = new ContextMenu('显示作曲者');
		showComposerMenu.appendItem('默认', () => {
			grSet.showLowerBarComposer_default = !grSet.showLowerBarComposer_default;
			window.Repaint();
		}, { is_checked: grSet.showLowerBarComposer_default });
		showComposerMenu.appendItem('封面', () => {
			grSet.showLowerBarComposer_artwork = !grSet.showLowerBarComposer_artwork;
			window.Repaint();
		}, { is_checked: grSet.showLowerBarComposer_artwork });
		showComposerMenu.appendItem('简单', () => {
			grSet.showLowerBarComposer_compact = !grSet.showLowerBarComposer_compact;
			window.Repaint();
		}, { is_checked: grSet.showLowerBarComposer_compact });
		transportButtonDisplayMenu.append(showComposerMenu);

		// * SHOW ARTIST COUNTRY FLAGS IN LOWER BAR * //
		const showArtistFlagsMenu = new ContextMenu('显示艺术家国家 / 地区旗帜');
		showArtistFlagsMenu.appendItem('默认', () => {
			grSet.showLowerBarArtistFlags_default = !grSet.showLowerBarArtistFlags_default;
			grm.ui.loadCountryFlags();
			window.Repaint();
		}, { is_checked: grSet.showLowerBarArtistFlags_default });
		showArtistFlagsMenu.appendItem('封面', () => {
			grSet.showLowerBarArtistFlags_artwork = !grSet.showLowerBarArtistFlags_artwork;
			grm.ui.loadCountryFlags();
			window.Repaint();
		}, { is_checked: grSet.showLowerBarArtistFlags_artwork });
		showArtistFlagsMenu.appendItem('简单', () => {
			grSet.showLowerBarArtistFlags_compact = !grSet.showLowerBarArtistFlags_compact;
			grm.ui.loadCountryFlags();
			window.Repaint();
		}, { is_checked: grSet.showLowerBarArtistFlags_compact });
		transportButtonDisplayMenu.append(showArtistFlagsMenu);

		// * SHOW SOFTWARE VERSION IN LOWER BAR * //
		const showSoftwareVersionMenu = new ContextMenu('显示软件版本');
		showSoftwareVersionMenu.appendItem('默认', () => {
			grSet.showLowerBarVersion_default = !grSet.showLowerBarVersion_default;
			grm.ui.clearLowerBarVersion();
		}, { is_checked: grSet.showLowerBarVersion_default });
		showSoftwareVersionMenu.appendItem('封面', () => {
			grSet.showLowerBarVersion_artwork = !grSet.showLowerBarVersion_artwork;
			grm.ui.clearLowerBarVersion();
		}, { is_checked: grSet.showLowerBarVersion_artwork });
		showSoftwareVersionMenu.appendItem('简单', () => {
			grSet.showLowerBarVersion_compact = !grSet.showLowerBarVersion_compact;
			grm.ui.clearLowerBarVersion();
		}, { is_checked: grSet.showLowerBarVersion_compact });
		transportButtonDisplayMenu.append(showSoftwareVersionMenu);
		transportButtonDisplayMenu.separator();

		// * SHOW PROGRESS BAR * //
		const progressBarMenu = new ContextMenu('显示进度条');
		progressBarMenu.appendItem('默认', () => {
			grSet.showProgressBar_default = !grSet.showProgressBar_default;
			updateSeekbar();
		}, { is_checked: grSet.showProgressBar_default });
		progressBarMenu.appendItem('封面', () => {
			grSet.showProgressBar_artwork = !grSet.showProgressBar_artwork;
			updateSeekbar();
		}, { is_checked: grSet.showProgressBar_artwork });
		progressBarMenu.appendItem('简单', () => {
			grSet.showProgressBar_compact = !grSet.showProgressBar_compact;
			updateSeekbar();
		}, { is_checked: grSet.showProgressBar_compact });
		transportButtonDisplayMenu.append(progressBarMenu);

		// * SHOW PEAKMETER BAR * //
		const peakmeterBarMenu = new ContextMenu('显示峰值条');
		peakmeterBarMenu.appendItem('默认', () => {
			grSet.showPeakmeterBar_default = !grSet.showPeakmeterBar_default;
			updateSeekbar();
		}, { is_checked: grSet.showPeakmeterBar_default });
		peakmeterBarMenu.appendItem('封面', () => {
			grSet.showPeakmeterBar_artwork = !grSet.showPeakmeterBar_artwork;
			updateSeekbar();
		}, { is_checked: grSet.showPeakmeterBar_artwork });
		peakmeterBarMenu.appendItem('简单', () => {
			grSet.showPeakmeterBar_compact = !grSet.showPeakmeterBar_compact;
			updateSeekbar();
		}, { is_checked: grSet.showPeakmeterBar_compact });
		transportButtonDisplayMenu.append(peakmeterBarMenu);

		// * SHOW WAVEFORM BAR * //
		const waveformBarMenu = new ContextMenu('显示波形条');
		waveformBarMenu.appendItem('默认', () => {
			grSet.showWaveformBar_default = !grSet.showWaveformBar_default;
			updateSeekbar();
		}, { is_checked: grSet.showWaveformBar_default });
		waveformBarMenu.appendItem('封面', () => {
			grSet.showWaveformBar_artwork = !grSet.showWaveformBar_artwork;
			updateSeekbar();
		}, { is_checked: grSet.showWaveformBar_artwork });
		waveformBarMenu.appendItem('简单', () => {
			grSet.showWaveformBar_compact = !grSet.showWaveformBar_compact;
			updateSeekbar();
		}, { is_checked: grSet.showWaveformBar_compact });
		transportButtonDisplayMenu.append(waveformBarMenu);

		cm.append(transportButtonDisplayMenu);
		cm.separator();

		// * BUTTON CONTROLS * //
		const buttonControlsMenu = new ContextMenu('控制');
		const lowerBarArtistBtnControlsMenu = new ContextMenu('艺术家按钮行为');
		const lowerBarArtistBtnAction = [['艺术家播放列表', 'playlist'], ['打开网站', 'website']];
		for (const type of lowerBarArtistBtnAction) {
			lowerBarArtistBtnControlsMenu.appendItem(type[0], ((type) => {
				grSet.lowerBarArtistBtnAction = type;
			}).bind(null, type[1]), { is_radio_checked: type[1] === grSet.lowerBarArtistBtnAction });
		}
		lowerBarArtistBtnControlsMenu.separator();

		const { websiteLabels, websiteValues } = WebsiteGenerateLinks(grCfg.customWebsiteLinks);
		const websites = websiteLabels.map((label, index) => [label, websiteValues[index]]);
		for (const website of websites) {
			lowerBarArtistBtnControlsMenu.appendItem(website[0], ((website) => {
				grSet.lowerBarArtistBtnWebsite = website;
			}).bind(null, website[1]), { is_radio_checked: website[1] === grSet.lowerBarArtistBtnWebsite });
		}
		buttonControlsMenu.append(lowerBarArtistBtnControlsMenu);
		const lowerBarAddTrackBtnControlsMenu = new ContextMenu('收藏音轨按钮');
		const lowerBarAddTrackBtnControls = [['选择', 'selection'], ['当前播放', 'nowplaying']];
		lowerBarAddTrackBtnControlsMenu.appendItem('收藏音轨播放列表', () => { grm.inputBox.addTracksPlaylist(); });
		lowerBarAddTrackBtnControlsMenu.separator();
		for (const action of lowerBarAddTrackBtnControls) {
			lowerBarAddTrackBtnControlsMenu.appendItem(action[0], ((action) => {
				grSet.addTracksButtonAction = action;
			}).bind(null, action[1]), { is_radio_checked: action[1] === grSet.addTracksButtonAction });
		}
		buttonControlsMenu.append(lowerBarAddTrackBtnControlsMenu);
		buttonControlsMenu.appendItem('收藏歌曲同时切换到播放列表', () => {
			grSet.addTracksPlaylistSwitch = !grSet.addTracksPlaylistSwitch;
		}, { is_checked: grSet.addTracksPlaylistSwitch });
		cm.append(buttonControlsMenu);
		cm.separator();

		// * STYLES - TRANSPORT BUTTONS * //
		const transportButtonStyleMenu = new ContextMenu('按钮样式');
		const transportButtonStyles = [
			['默认', 'default'],
			['斜面', 'bevel'],
			['内凹', 'inner'],
			['浮雕', 'emboss'],
			['极简', 'minimal']
		];
		for (const style of transportButtonStyles) {
			transportButtonStyleMenu.appendItem(style[0], ((style) => {
				grSet.styleTransportButtons = style;
				grm.ui.setStyle('styleTransportButtons', style);
				grm.ui.updateStyle();
			}).bind(null, style[1]), { is_radio_checked: style[1] === grSet.styleTransportButtons });
		}
		cm.append(transportButtonStyleMenu);

		// * STYLES - VOLUME BAR * //
		const transportVolumeBarStyleMenu = new ContextMenu('音量条样式');
		const transportVolumeBarStylesDesignMenu = new ContextMenu('方案');
		const transportVolumeBarStylesDesign = [['默认', 'default'], ['圆化', 'rounded']];
		for (const design of transportVolumeBarStylesDesign) {
			transportVolumeBarStylesDesignMenu.appendItem(design[0], ((design) => {
				grSet.styleVolumeBarDesign = design;
				grm.ui.setStyle('styleVolumeBarDesign', design);
				grm.ui.updateStyle();
			}).bind(null, design[1]), { is_radio_checked: design[1] === grSet.styleVolumeBarDesign });
		}
		transportVolumeBarStyleMenu.append(transportVolumeBarStylesDesignMenu);

		const transportVolumeBarStylesBgMenu = new ContextMenu('背景');
		const transportVolumeBarStylesBg = [['默认', 'default'], ['斜面', 'bevel'], ['内凹', 'inner']];
		for (const style of transportVolumeBarStylesBg) {
			transportVolumeBarStylesBgMenu.appendItem(style[0], ((style) => {
				grSet.styleVolumeBar = style;
				grm.ui.setStyle('styleVolumeBar', style);
				grm.ui.updateStyle();
			}).bind(null, style[1]), { is_radio_checked: style[1] === grSet.styleVolumeBar });
		}
		transportVolumeBarStyleMenu.append(transportVolumeBarStylesBgMenu);

		const transportVolumeBarStylesFillMenu = new ContextMenu('填充');
		const transportVolumeBarStylesFill = [['默认', 'default'], ['斜面', 'bevel'], ['内凹', 'inner']];
		for (const style of transportVolumeBarStylesFill) {
			transportVolumeBarStylesFillMenu.appendItem(style[0], ((style) => {
				grSet.styleVolumeBarFill = style;
				grm.ui.setStyle('styleVolumeBarFill', style);
				grm.ui.updateStyle();
			}).bind(null, style[1]), { is_radio_checked: style[1] === grSet.styleVolumeBarFill });
		}
		transportVolumeBarStyleMenu.append(transportVolumeBarStylesFillMenu);
		cm.append(transportVolumeBarStyleMenu);
	}

	/**
	 * Contains all seekbar ( progress bar, peakmeter bar and waveform bar ) top menu "Options" for quick access.
	 * Displayed when right clicking on the lower bar.
	 * @param {ContextMenu} cm - The context menu object.
	 */
	contextMenuSeekbar(cm) {
		const seekbar = [['进度条', 'progressbar'], ['峰值条', 'peakmeterbar'], ['波形条', 'waveformbar']];
		for (const type of seekbar) {
			cm.appendItem(type[0], () => {
				grSet.seekbar = type[1];
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
			}, { is_radio_checked: type[1] === grSet.seekbar });
		}

		// * PROGRESS BAR * //
		if (grSet.seekbar === 'progressbar') {
			cm.separator();
			const progressBarStyleMenu = new ContextMenu('样式');
			const progressBarStyleDesignMenu = new ContextMenu('方案'); 
			const progressBarStyleDesign = [['默认', 'default'], ['圆化', 'rounded'], ['线', 'lines'], ['块', 'blocks'], ['点', 'dots'], ['细', 'thin']];
			for (const design of progressBarStyleDesign) {
				progressBarStyleDesignMenu.appendItem(design[0], (() => {
					grSet.styleProgressBarDesign = design[1];
					grm.ui.setStyle('styleProgressBarDesign', design[1]);
					grm.ui.updateStyle();
				}).bind(null, design[1]), { is_radio_checked: design[1] === grSet.styleProgressBarDesign });
			}
			progressBarStyleMenu.append(progressBarStyleDesignMenu);

			const progressBarStyleBgMenu = new ContextMenu('背景');
			const progressBarStylesBg = [['默认', 'default'], ['斜面', 'bevel'], ['内凹', 'inner']];
			for (const bg of progressBarStylesBg) {
				progressBarStyleBgMenu.appendItem(bg[0], (() => {
					grSet.styleProgressBar = bg[1];
					grm.ui.setStyle('styleProgressBar', bg[1]);
					grm.ui.updateStyle();
				}).bind(null, bg[1]), { is_radio_checked: bg[1] === grSet.styleProgressBar });
			}
			progressBarStyleMenu.append(progressBarStyleBgMenu);

			const progressBarStyleFillMenu = new ContextMenu('填充');
			const progressBarStyleFill = [['默认', 'default'], ['斜面', 'bevel'], ['内凹', 'inner'], ['融合', 'blend']];
			for (const fill of progressBarStyleFill) {
				progressBarStyleFillMenu.appendItem(fill[0], (() => {
					grSet.styleProgressBarFill = fill[1];
					grm.ui.setStyle('styleProgressBarFill', fill[1]);
					grm.ui.updateStyle();
				}).bind(null, fill[1]), { is_radio_checked: fill[1] === grSet.styleProgressBarFill });
			}
			progressBarStyleMenu.append(progressBarStyleFillMenu);
			cm.append(progressBarStyleMenu);

			const progressBarSeekSpeedMenu = new ContextMenu('鼠标滚轮寻道速度');
			const progressBarSeekSpeed = [['  1 秒', 1], ['  2 秒', 2], ['  3 秒', 3], ['  4 秒', 4], ['  5 秒 （默认）', 5], ['  6 秒', 6], ['  7 秒', 7], ['  8 秒', 8], ['  9 秒', 9], ['10 秒', 10]];
			for (const sec of progressBarSeekSpeed) {
				progressBarSeekSpeedMenu.appendItem(sec[0], () => {
					grSet.progressBarWheelSeekSpeed = sec[1];
				}, { is_radio_checked: sec[1] === grSet.progressBarWheelSeekSpeed });
			}
			cm.append(progressBarSeekSpeedMenu);

			const progressBarRefreshMenu = new ContextMenu('刷新率');
			const progressBarRefresh = [['  1 fps ~ 1000 毫秒 （非常慢 CPU）', FPS._1], ['  2 fps ~ 500 毫秒', FPS._2], ['  3 fps ~ 333 毫秒', FPS._3], ['  4 fps ~ 250 毫秒', FPS._4], ['  5 fps ~ 200 毫秒', FPS._5], ['  6 fps ~ 166 毫秒', FPS._6], ['  7 fps ~ 142 毫秒', FPS._7], ['  8 fps ~ 125 毫秒', FPS._8], ['  9 fps ~ 111 毫秒', FPS._9], ['10 fps ~ 100 毫秒', FPS._10], ['12 fps ~ 83 毫秒', FPS._12], ['15 fps ~ 67 毫秒', FPS._15], ['20 fps ~ 50 毫秒', FPS._20], ['25 fps ~ 40 毫秒', FPS._25], ['30 fps ~ 33 毫秒', FPS._30], ['45 fps ~ 22 毫秒', FPS._45], ['60 fps ~ 17 毫秒 （非常快 CPU）', FPS._60], ['可变刷新率（默认）', 'variable']];
			for (const rate of progressBarRefresh) {
				progressBarRefreshMenu.appendItem(rate[0], () => {
					grSet.progressBarRefreshRate = rate[1];
					grm.ui.setSeekbarRefresh(rate[1]);
				}, { is_radio_checked: rate[1] === grSet.progressBarRefreshRate });
				if (rate[1] === FPS._60) progressBarRefreshMenu.separator();
			}
			cm.append(progressBarRefreshMenu);
		}
		// * PEAKMETER BAR * //
		else if (grSet.seekbar === 'peakmeterbar') {
			cm.separator();
			const peakmeterBarDesignMenu = new ContextMenu('样式');
			const peakmeterBarDesign = [['水平', 'horizontal'], ['水平居中', 'horizontal_center'], ['垂直', 'vertical']];
			for (const design of peakmeterBarDesign) {
				peakmeterBarDesignMenu.appendItem(design[0], () => {
					grSet.peakmeterBarDesign = design[1];
					grm.peakBar.on_size(grm.ui.ww, grm.ui.wh);
					window.Repaint();
				}, { is_radio_checked: design[1] === grSet.peakmeterBarDesign });
			}
			cm.append(peakmeterBarDesignMenu);

			if (grSet.peakmeterBarDesign === 'vertical') {
				const peakmeterBarVertSizeMenu = new ContextMenu('大小');
				const peakmeterBarVertSize = [['  0 像素', 0], ['  2 像素', 2], ['  4 像素', 4], ['  6 像素', 6], ['  8 像素', 8], ['10 像素', 10], [grSet.layout !== 'default' ? '12 像素 （默认）' : '12 像素', 12], ['14 像素', 14], ['16 像素', 16], ['18 像素', 18], [grSet.layout !== 'default' ? '20 像素' : '20 像素 （默认）', 20], ['25 像素', 25], ['30 像素', 30], ['35 像素', 35], ['40 像素', 40], ['最小值', 'min']];
				for (const size of peakmeterBarVertSize) {
					peakmeterBarVertSizeMenu.appendItem(size[0], () => {
						grSet.peakmeterBarVertSize = size[1];
						grm.ui.setMainComponents('seekbar');
						window.Repaint();
					}, { is_radio_checked: size[1] === grSet.peakmeterBarVertSize });
				}
				cm.append(peakmeterBarVertSizeMenu);

				const peakmeterBarVertDbRangeMenu = new ContextMenu('分贝范围');
				const peakmeterBarVertDbRange = [['2 到 -20 db （默认）', 220], ['2 到 -15 db', 215], ['2 到 -10 db', 210], ['3 到 -20 db', 320], ['3 到 -15 db', 315], ['3 到 -10 db', 310], ['5 到 -20 db', 520], ['5 到 -15 db', 515], ['5 到 -10 db', 510]];
				for (const range of peakmeterBarVertDbRange) {
					peakmeterBarVertDbRangeMenu.appendItem(range[0], () => {
						grSet.peakmeterBarVertDbRange = range[1];
						grm.ui.setMainComponents('seekbar');
						window.Repaint();
					}, { is_radio_checked: range[1] === grSet.peakmeterBarVertDbRange });
				}
				cm.append(peakmeterBarVertDbRangeMenu);
			}

			const peakmeterBarDisplayMenu = new ContextMenu('显示');
			if (grSet.peakmeterBarDesign === 'horizontal' || grSet.peakmeterBarDesign === 'horizontal_center') {
				peakmeterBarDisplayMenu.appendItem('显示条', () => {
					grSet.peakmeterBarOverBars = !grSet.peakmeterBarOverBars;
					window.Repaint();
				}, { is_checked: grSet.peakmeterBarOverBars });
				peakmeterBarDisplayMenu.separator();
				peakmeterBarDisplayMenu.appendItem('显示外部条', () => {
					grSet.peakmeterBarOuterBars = !grSet.peakmeterBarOuterBars;
					window.Repaint();
				}, { is_checked: grSet.peakmeterBarOuterBars });
				peakmeterBarDisplayMenu.appendItem('显示外部峰值', () => {
					grSet.peakmeterBarOuterPeaks = !grSet.peakmeterBarOuterPeaks;
					window.Repaint();
				}, { is_checked: grSet.peakmeterBarOuterPeaks });
				peakmeterBarDisplayMenu.separator();
				peakmeterBarDisplayMenu.appendItem('显示主条', () => {
					grSet.peakmeterBarMainBars = !grSet.peakmeterBarMainBars;
					window.Repaint();
				}, { is_checked: grSet.peakmeterBarMainBars });
				peakmeterBarDisplayMenu.appendItem('显示主峰值', () => {
					grSet.peakmeterBarMainPeaks = !grSet.peakmeterBarMainPeaks;
					window.Repaint();
				}, { is_checked: grSet.peakmeterBarMainPeaks });
				peakmeterBarDisplayMenu.separator();
				peakmeterBarDisplayMenu.appendItem('显示中间条', () => {
					grSet.peakmeterBarMiddleBars = !grSet.peakmeterBarMiddleBars;
					window.Repaint();
				}, { is_checked: grSet.peakmeterBarMiddleBars });
			}

			peakmeterBarDisplayMenu.appendItem('显示进度条', () => {
				grSet.peakmeterBarProgBar = !grSet.peakmeterBarProgBar;
				window.Repaint();
			}, { is_checked: grSet.peakmeterBarProgBar });

			if (grSet.peakmeterBarDesign === 'horizontal' || grSet.peakmeterBarDesign === 'horizontal_center') {
				peakmeterBarDisplayMenu.separator();
				peakmeterBarDisplayMenu.appendItem('显示间隙', () => {
					grSet.peakmeterBarGaps = !grSet.peakmeterBarGaps;
					grm.peakBar.on_size(grm.ui.ww, grm.ui.wh);
					window.Repaint();
				}, { is_checked: grSet.peakmeterBarGaps });
				peakmeterBarDisplayMenu.appendItem('显示网格', () => {
					grSet.peakmeterBarGrid = !grSet.peakmeterBarGrid;
					window.Repaint();
				}, { is_checked: grSet.peakmeterBarGrid });
			}

			if (grSet.peakmeterBarDesign === 'vertical') {
				peakmeterBarDisplayMenu.appendItem('显示峰值', () => {
					grSet.peakmeterBarVertPeaks = !grSet.peakmeterBarVertPeaks;
					window.Repaint();
				}, { is_checked: grSet.peakmeterBarVertPeaks });
				peakmeterBarDisplayMenu.appendItem('显示基线', () => {
					grSet.peakmeterBarVertBaseline = !grSet.peakmeterBarVertBaseline;
					window.Repaint();
				}, { is_checked: grSet.peakmeterBarVertBaseline });
			}

			peakmeterBarDisplayMenu.appendItem(grSet.layout !== 'default' ? '显示信息 (仅在默认布局中可用)' : '显示信息', () => {
				grSet.peakmeterBarInfo = !grSet.peakmeterBarInfo;
				window.Repaint();
			}, { is_checked: grSet.peakmeterBarInfo });

			cm.append(peakmeterBarDisplayMenu);

			const peakmeterBarSeekSpeedMenu = new ContextMenu('鼠标滚轮寻道速度');
			const peakmeterBarSeekSpeed = [['  1 秒', 1], ['  2 秒', 2], ['  3 秒', 3], ['  4 秒', 4], ['  5 秒（默认）', 5], ['  6 秒', 6], ['  7 秒', 7], ['  8 秒', 8], ['  9 秒', 9], ['10 秒', 10]];
			for (const sec of peakmeterBarSeekSpeed) {
				peakmeterBarSeekSpeedMenu.appendItem(sec[0], () => {
					grSet.peakmeterBarWheelSeekSpeed = sec[1];
				}, { is_radio_checked: sec[1] === grSet.peakmeterBarWheelSeekSpeed });
			}
			cm.append(peakmeterBarSeekSpeedMenu);

			const peakmeterBarRefreshMenu = new ContextMenu('刷新率');
			const peakmeterBarRefresh = [['  1 fps ~ 1000 毫秒 （非常慢 CPU）', FPS._1], ['  2 fps ~ 500 毫秒', FPS._2], ['  3 fps ~ 333 毫秒', FPS._3], ['  4 fps ~ 250 毫秒', FPS._4], ['  5 fps ~ 200 毫秒', FPS._5], ['  6 fps ~ 166 毫秒', FPS._6], ['  7 fps ~ 142 毫秒', FPS._7], ['  8 fps ~ 125 毫秒', FPS._8], ['  9 fps ~ 111 毫秒', FPS._9], ['10 fps ~ 100 毫秒', FPS._10], ['12 fps ~ 83 毫秒', FPS._12], ['15 fps ~ 67 毫秒', FPS._15], ['20 fps ~ 50 毫秒', FPS._20], ['25 fps ~ 40 毫秒', FPS._25], ['30 fps ~ 33 毫秒', FPS._30], ['45 fps ~ 22 毫秒', FPS._45], ['60 fps ~ 17 毫秒 （非常快 CPU）', FPS._60], ['可变刷新率（默认）', 'variable']];
			for (const rate of peakmeterBarRefresh) {
				peakmeterBarRefreshMenu.appendItem(rate[0], () => {
					grSet.peakmeterBarRefreshRate = rate[1];
					if (rate[1] != 'variable') {
						this.audioWizard.SetMonitoringRefreshRate(rate[1]);
					}
					grm.ui.setSeekbarRefresh(rate[1]);
				}, { is_radio_checked: rate[1] === grSet.peakmeterBarRefreshRate });
				if (rate[1] === FPS._60) peakmeterBarRefreshMenu.separator();
			}
			cm.append(peakmeterBarRefreshMenu);
		}
		// * WAVEFORM BAR * //
		else if (grSet.seekbar === 'waveformbar') {
			cm.separator();
			const waveformBarAnalysisMenu = new ContextMenu('分析');
			const waveformBarAnalysis = [['RMS', 'rms'], ['RMS 峰值', 'rms_peak'], ['采样  峰值', 'sample_peak'], ['波形', 'waveform']];
			for (const type of waveformBarAnalysis) {
				waveformBarAnalysisMenu.appendItem(type[0], () => {
					grSet.waveformBarAnalysis = type[1];
					grm.waveBar.updateConfig({ preset: { analysisMode: type[1] } });
					grm.waveBar.updateBar();
					window.Repaint();
				}, {
					is_grayed_out: grSet.waveformBarMode === 'visualizer',
					is_radio_checked: type[1] === grSet.waveformBarAnalysis
					}
				);
			}
			waveformBarAnalysisMenu.separator();
			const waveformBarSaveModes = [['保存模式 - 始终', 'always'], ['保存模式 - 曲库', 'library'], ['保存模式 - 从不', 'never']];
			for (const mode of waveformBarSaveModes) {
				waveformBarAnalysisMenu.appendItem(mode[0], () => {
					grSet.waveformBarSaveMode = mode[1];
					grm.waveBar.updateConfig({ analysis: { saveMode: mode[1] } });
					grm.waveBar.updateBar();
					if (mode[1] === 'always') return;
					const key = mode[1] === 'library' ? 'waveformBarSaveModeLibrary' : 'waveformBarSaveModeNever';
					grm.msg.showPopupNotice('menu', key);
				}, { is_radio_checked: mode[1] === grSet.waveformBarSaveMode });
			}
			waveformBarAnalysisMenu.separator();
			waveformBarAnalysisMenu.appendItem('删除分析文件', () => {
				const msg = grm.msg.getMessage('contextMenu', 'deleteWaveformBarCache');
				grm.msg.showPopup(false, false, msg, 'Yes', 'No', (confirmed) => {
					if (confirmed) grm.fman.deleteWaveformBarCache();
				});
			});
			waveformBarAnalysisMenu.separator();
			waveformBarAnalysisMenu.appendItem('自动-删除分析文件', () => {
				grSet.waveformBarAutoDelete = !grSet.waveformBarAutoDelete;
				grm.waveBar.updateConfig({ analysis: { autoDelete: grSet.waveformBarAutoDelete } });
			}, { is_grayed_out: grSet.waveformBarMode === 'visualizer' });
			cm.append(waveformBarAnalysisMenu);
			waveformBarAnalysisMenu.separator();
			waveformBarAnalysisMenu.appendItem('显示兼容的扩展名', () => {
				fb.ShowPopupMessage(grm.waveBar.checkCompatibleFileExtensionReport().join(', '), `模式: ${grm.waveBar.analysis.binaryMode}`);
			}, {
				is_grayed_out: grSet.waveformBarMode === 'visualizer'
			});
			waveformBarAnalysisMenu.separator();
			waveformBarAnalysisMenu.appendItem('分析过程可视化', () => {
				grSet.waveformBarFallbackAnalysis = !grSet.waveformBarFallbackAnalysis;
				grm.waveBar.updateConfig({ analysis: { visualizerFallbackAnalysis: grSet.waveformBarFallbackAnalysis } });
			}, {
				is_grayed_out: grSet.waveformBarMode === 'visualizer',
				is_checked: grSet.waveformBarFallbackAnalysis
			});
			waveformBarAnalysisMenu.appendItem('不兼容文件可视化', () => {
				grSet.waveformBarFallback = !grSet.waveformBarFallback;
				grm.waveBar.updateConfig({ analysis: { visualizerFallback: grSet.waveformBarFallback } });
			}, {
				is_grayed_out: grSet.waveformBarMode === 'visualizer',
				is_checked: grSet.waveformBarFallback
			});

			const waveformBarModeMenu = new ContextMenu('模式');
			const waveformBarMode = [['音频向导', 'audioWizard'], ['可视化', 'visualizer']];
			for (const mode of waveformBarMode) {
				const found = grm.waveBar.binaries[mode[1]];
				waveformBarModeMenu.appendItem(mode[0] + (found ? '' : '\t(未找到)'), () => {
					grSet.waveformBarMode = mode[1];
					grm.waveBar.updateConfig({ analysis: { binaryMode: grSet.waveformBarMode } });
					grm.waveBar.updateBar(true);
					window.Repaint();
				}, {
					is_grayed_out: !found,
					is_radio_checked: mode[1] === grSet.waveformBarMode
					}
				);
			}
			cm.append(waveformBarModeMenu);

			const waveformBarResolutionMenu = new ContextMenu('分辩率');
			const waveformBarResolution = [['最小', 1], ['非常低', 5], ['低', 10], ['平衡', 15], ['标准 (默认)', 20], ['高', 50], ['非常高', 100]];
			for (const res of waveformBarResolution) {
				waveformBarResolutionMenu.appendItem(res[0], () => {
					grSet.waveformBarResolution = res[1];

					const handle = fb.GetNowPlaying();
					if (handle) {
						grm.waveBar.deleteWaveformFile(handle);
					}

					grm.waveBar.updateConfig({ analysis: { resolution: res[1] } });
					grm.waveBar.updateBar(true);
					window.Repaint();
				}, {
					is_radio_checked: res[1] === grSet.waveformBarResolution
					}
				);
			}
			cm.append(waveformBarResolutionMenu);

			const waveformBarDesignMenu = new ContextMenu('样式');
			const waveformBarDesign = [['波形', 'waveform'], ['条', 'bars'], ['点', 'dots'], ['半条', 'halfbars']];
			for (const design of waveformBarDesign) {
				waveformBarDesignMenu.appendItem(design[0], () => {
					grSet.waveformBarDesign = design[1];
					grm.waveBar.updateConfig({ preset: { barDesign: design[1] } });
				}, { is_radio_checked: design[1] === grSet.waveformBarDesign });
			}
			cm.append(waveformBarDesignMenu);

			const waveformBarSizeMenu = new ContextMenu('大小');
			const waveformBarSizeWaveMenu = new ContextMenu('波形');
			const waveformBarSizeWave = [['1', 1], ['2', 2], ['3 （默认）', 3], ['4', 4], ['5', 5]];
			for (const size of waveformBarSizeWave) {
				waveformBarSizeWaveMenu.appendItem(size[0], () => {
					grSet.waveformBarSizeWave = size[1];
					grm.waveBar.updateConfig({ ui: { sizeWave: size[1] } });
					grm.waveBar.updateBar();
					window.Repaint();
				}, { is_radio_checked: size[1] === grSet.waveformBarSizeWave });
			}
			waveformBarSizeMenu.append(waveformBarSizeWaveMenu);
			const waveformBarSizeBarsMenu = new ContextMenu('条');
			const waveformBarSizeBars = [['1 （默认）', 1], ['2', 2], ['3', 3], ['4', 4], ['5', 5]];
			for (const size of waveformBarSizeBars) {
				waveformBarSizeBarsMenu.appendItem(size[0], () => {
					grSet.waveformBarSizeBars = size[1];
					grm.waveBar.updateConfig({ ui: { sizeBars: size[1] } });
					grm.waveBar.updateBar();
					window.Repaint();
				}, { is_radio_checked: size[1] === grSet.waveformBarSizeBars });
			}
			waveformBarSizeMenu.append(waveformBarSizeBarsMenu);
			const waveformBarSizeDotsMenu = new ContextMenu('点');
			const waveformBarSizeDots = [['1', 1], ['2 （默认）', 2], ['3', 3], ['4', 4], ['5', 5]];
			for (const size of waveformBarSizeDots) {
				waveformBarSizeDotsMenu.appendItem(size[0], () => {
					grSet.waveformBarSizeDots = size[1];
					grm.waveBar.updateConfig({ ui: { sizeDots: size[1] } });
					grm.waveBar.updateBar();
					window.Repaint();
				}, { is_radio_checked: size[1] === grSet.waveformBarSizeDots });
			}
			waveformBarSizeMenu.append(waveformBarSizeDotsMenu);
			const waveformBarSizeHalfMenu = new ContextMenu('半条');
			const waveformBarSizeHalf = [['1', 1], ['2', 2], ['3', 3], ['4 （默认）', 4], ['5', 5]];
			for (const size of waveformBarSizeHalf) {
				waveformBarSizeHalfMenu.appendItem(size[0], () => {
					grSet.waveformBarSizeHalf = size[1];
					grm.waveBar.updateConfig({ ui: { sizeHalf: size[1] } });
					grm.waveBar.updateBar();
					window.Repaint();
				}, { is_radio_checked: size[1] === grSet.waveformBarSizeHalf });
			}
			waveformBarSizeMenu.append(waveformBarSizeHalfMenu);
			waveformBarSizeMenu.separator();
			waveformBarSizeMenu.appendItem('常规宽度', () => {
				grSet.waveformBarSizeNormalize = !grSet.waveformBarSizeNormalize;
				grm.waveBar.updateConfig({ ui: { sizeNormalizeWidth: grSet.waveformBarSizeNormalize } });
				grm.waveBar.updateBar();
				window.Repaint();
			}, { is_checked: grSet.waveformBarSizeNormalize });
			cm.append(waveformBarSizeMenu);

			const waveformBarDisplayMenu = new ContextMenu('显示');
			const waveformBarDisplay = [['完整', 'full'], ['部分', 'partial']];
			for (const paint of waveformBarDisplay) {
				waveformBarDisplayMenu.appendItem(paint[0], () => {
					grSet.waveformBarPaint = paint[1];
					grm.waveBar.updateConfig({ preset: { paintMode: paint[1] } });
				}, { is_radio_checked: paint[1] === grSet.waveformBarPaint });
			}
			waveformBarDisplayMenu.separator();

			waveformBarDisplayMenu.appendItem(`预绘${grSet.waveformBarPaint === 'full' ? '\t(仅部分)' : ''}`, () => {
				grSet.waveformBarPrepaint = !grSet.waveformBarPrepaint;
				grm.waveBar.updateConfig({ preset: { prepaint: grSet.waveformBarPrepaint } });
			}, {
				is_grayed_out: grSet.waveformBarPaint === 'full',
				is_checked: grSet.waveformBarPrepaint
				}
			);

			const waveformBarPrepaintMenuDisabled = grSet.waveformBarPaint === 'full' || grSet.waveformBarMode === 'visualizer' || !grSet.waveformBarPrepaint;
			const waveformBarPrepaintMenu = new ContextMenu('前预绘', { is_grayed_out: waveformBarPrepaintMenuDisabled });
			const waveformBarPrepaint = [['  2 秒', 2], ['  5 秒', 5], ['10 秒', 10], [' 完整', Infinity]];
			for (const time of waveformBarPrepaint) {
				waveformBarPrepaintMenu.appendItem(time[0], () => {
					grSet.waveformBarPrepaintFront = time[1];
					grm.waveBar.updateConfig({ preset: { prepaintFront: time[1] } });
				}, {
					is_grayed_out: waveformBarPrepaintMenuDisabled,
					is_radio_checked: time[1] === grSet.waveformBarPrepaintFront
					}
				);
			}
			waveformBarDisplayMenu.append(waveformBarPrepaintMenu);
			waveformBarDisplayMenu.separator();

			waveformBarDisplayMenu.appendItem('动态', () => {
				grSet.waveformBarAnimate = !grSet.waveformBarAnimate;
				grm.waveBar.updateConfig({ preset: { animate: grSet.waveformBarAnimate } });
			}, { is_checked: grSet.waveformBarAnimate });

			waveformBarDisplayMenu.appendItem(`使用 BPM${grSet.waveformBarPaint === 'full' && grSet.waveformBarMode !== 'visualizer' ? '\t(仅部分)' : ''}`, () => {
				grSet.waveformBarBPM = !grSet.waveformBarBPM;
				grm.waveBar.updateConfig({ preset: { useBPM: grSet.waveformBarBPM } });
				}, {
					is_grayed_out: !(grSet.waveformBarPaint === 'partial' && grSet.waveformBarPrepaint || grSet.waveformBarMode === 'visualizer'),
					is_checked: grSet.waveformBarBPM
				}
			);

			waveformBarDisplayMenu.appendItem('翻转半条', () => {
				grSet.waveformBarInvertHalfbars = !grSet.waveformBarInvertHalfbars;
				grm.waveBar.updateConfig({ preset: { invertHalfbars: grSet.waveformBarInvertHalfbars } });
			}, { is_checked: grSet.waveformBarInvertHalfbars });
			waveformBarDisplayMenu.separator();

			waveformBarDisplayMenu.appendItem('显示指示', () => {
				grSet.waveformBarIndicator = !grSet.waveformBarIndicator;
				grm.waveBar.updateConfig({ preset: { indicator: grSet.waveformBarIndicator } });
			}, { is_checked: grSet.waveformBarIndicator });
			cm.append(waveformBarDisplayMenu);

			const waveformBarWheelMenu = new ContextMenu('鼠标滚轮');
			const waveformBarWheelSeekSpeedMenu = new ContextMenu('寻道速度');
			const waveformBarSeekSpeed = grSet.waveformBarWheelSeekType === 'percentage' ?
				[['  1%', 1], ['  2%', 2], ['  3%', 3], ['  4%', 4], ['  5%（默认）', 5], ['  6%', 6], ['  7%', 7], ['  8%', 8], ['  9%', 9], ['10%', 10]] :
				[['  1 秒', 1], ['  2 秒', 2], ['  3 秒', 3], ['  4 秒', 4], ['  5 秒（默认）', 5], ['  6 秒', 6], ['  7 秒', 7], ['  8 秒', 8], ['  9 秒', 9], ['10 秒', 10]];
			for (const sec of waveformBarSeekSpeed) {
				waveformBarWheelSeekSpeedMenu.appendItem(sec[0], () => {
					grSet.waveformBarWheelSeekSpeed = sec[1];
					grm.waveBar.updateConfig({ wheel: { seekSpeed: grSet.waveformBarWheelSeekSpeed } });
				}, { is_radio_checked: sec[1] === grSet.waveformBarWheelSeekSpeed });
			}
			waveformBarWheelMenu.append(waveformBarWheelSeekSpeedMenu);
			const waveformBarWheelSeekTypeMenu = new ContextMenu('寻道样式');
			const waveformBarSeekType = [['秒', 'seconds'], ['百分比', 'percentage']];
			for (const type of waveformBarSeekType) {
				waveformBarWheelSeekTypeMenu.appendItem(type[0], () => {
					grSet.waveformBarWheelSeekType = type[1];
					grm.waveBar.updateConfig({ wheel: { seekType: grSet.waveformBarWheelSeekType } });
				}, { is_radio_checked: type[1] === grSet.waveformBarWheelSeekType });
			}
			waveformBarWheelMenu.append(waveformBarWheelSeekTypeMenu);
			cm.append(waveformBarWheelMenu);

			const waveformBarRefreshMenuDisabled = !(grSet.waveformBarPaint === 'partial' && grSet.waveformBarPrepaint || grSet.waveformBarMode === 'visualizer');
			const waveformBarRefreshMenu = new ContextMenu(`刷新率${grSet.waveformBarPaint === 'full' && grSet.waveformBarMode !== 'visualizer' ? '\t(仅部分)' : ''}`, { is_grayed_out: waveformBarRefreshMenuDisabled });
			const waveformBarRefresh = [['  1 fps ~ 1000 毫秒 （非常慢 CPU）', FPS._1], ['  2 fps ~ 500 毫秒', FPS._2], ['  3 fps ~ 333 毫秒', FPS._3], ['  4 fps ~ 250 毫秒', FPS._4], ['  5 fps ~ 200 毫秒', FPS._5], ['  6 fps ~ 166 毫秒', FPS._6], ['  7 fps ~ 142 毫秒', FPS._7], ['  8 fps ~ 125 毫秒', FPS._8], ['  9 fps ~ 111 毫秒', FPS._9], ['10 fps ~ 100 毫秒', FPS._10], ['12 fps ~ 83 毫秒', FPS._12], ['15 fps ~ 67 毫秒', FPS._15], ['20 fps ~ 50 毫秒', FPS._20], ['25 fps ~ 40 毫秒', FPS._25], ['30 fps ~ 33 毫秒', FPS._30], ['45 fps ~ 22 毫秒', FPS._45], ['60 fps ~ 17 毫秒 （非常快 CPU）', FPS._60], ['可变刷新率（默认）', 'variable']];
			for (const rate of waveformBarRefresh) {
				waveformBarRefreshMenu.appendItem(rate[0], () => {
					grSet.waveformBarRefreshRate = rate[1];
					grm.waveBar.updateConfig({ ui: { refreshRate: rate[1] === 'variable' ? FPS._5 : rate[1] } });
					grm.ui.setSeekbarRefresh(rate[1]);
				}, {
					is_grayed_out: waveformBarRefreshMenuDisabled,
					is_radio_checked: rate[1] === grSet.waveformBarRefreshRate
					}
				);
				if (rate[1] === FPS._60) waveformBarRefreshMenu.separator();
			}
			cm.append(waveformBarRefreshMenu);
		}
	}
	// #endregion
}
