'use strict';

/** @global @type {number} */
const LIB_MF_GRAYED = 0x00000001;
/** @global @type {number} */
const LIB_MF_STRING = 0x00000000;

class LibMenuManager {
	constructor(name, clearArr, baseMenu) {
		this.baseMenu = baseMenu || 'baseMenu';
		this.clearArr = clearArr;
		this.func = {};
		this.idx = 0;
		this.menu = {};
		this.menuItems = [];
		this.menuNames = [];
		this.name = name;
	}

	// * METHODS * //

	addItem(v) {
		if (v.separator && !v.str) {
			const separator = this.get(v.separator);
			if (separator) this.menu[v.menuName].AppendMenuSeparator();
		} else {
			const hide = this.get(v.hide);
			if (hide || !v.str) return;
			this.idx++;
			if (!this.clearArr) this.executeFunctions(v, ['checkItem', 'checkRadio', 'flags', 'menuName', 'separator', 'str']); // if clearArr, functions redundant & not supported
			const a = this.clearArr ? v : this;
			const menu = this.menu[a.menuName];
			menu.AppendMenuItem(a.flags, this.idx, a.str);
			if (a.checkItem) menu.CheckMenuItem(this.idx, a.checkItem);
			if (a.checkRadio) menu.CheckMenuRadioItem(this.idx, this.idx, this.idx);
			if (a.separator) menu.AppendMenuSeparator();
			this.func[this.idx] = v.func;
		}
	}

addSeparator({ menuName = this.baseMenu, separator = true }) { this.menuItems.push({ menuName: menuName || this.baseMenu, separator }); }

	appendMenu(v) {
		const a = this.clearArr ? v : this;
		if (!this.clearArr) this.executeFunctions(v, ['hide', 'menuName']);
		if (a.menuName == this.baseMenu || a.hide) return;
		if (!this.clearArr) this.executeFunctions(v, ['appendTo', 'flags', 'separator', 'str']);
		const menu = this.menu[a.appendTo || this.baseMenu];
		this.menu[a.menuName].AppendTo(menu, a.flags, a.str || a.menuName)
		if (a.separator) menu.AppendMenuSeparator();
	}

	clear() {
		this.menu = {};
		this.func = {};
		this.idx = 0;
		if (this.clearArr) {
			this.menuItems = [];
			this.menuNames = [];
		}
	}

	createMenu(menuName = this.baseMenu) {
		menuName = this.get(menuName);
		this.menu[menuName] = window.CreatePopupMenu();
	}

	executeFunctions(v, items) {
		let i = 0;
		const ln = items.length;
		while (i < ln) {
			const w = items[i];
			this[w] = this.get(v[w])
			i++;
		}
	}

	get(v) {
		if (v instanceof Function) return v();
		return v;
	}

	load(x, y) {
		if (!this.menuItems.length) lib.men[this.name]();
		let i = 0;
		let ln = this.menuNames.length;
		while (i < ln) {
			this.createMenu(this.menuNames[i])
			i++;
		}

		i = 0;
		ln = this.menuItems.length;
		while (i < ln) {
			const v = this.menuItems[i];
			!v.appendMenu ? this.addItem(v) : this.appendMenu(v)
			i++;
		}

		let Context;
		if (lib.men.show_context) {
			Context = fb.CreateContextMenuManager();
			Context.InitContext(lib.men.items);
			this.menu[this.baseMenu].AppendMenuSeparator();
			Context.BuildMenu(this.menu[this.baseMenu], 5000);
		}

		const idx = this.menu[this.baseMenu].TrackPopupMenu(x, y);
		this.run(idx);

		if (lib.men.show_context) {
			if (idx >= 5000 && idx <= 5800) Context.ExecuteByID(idx - 5000);
			lib.men.show_context = false;
		}

		this.clear();
	}

	newItem({ str = null, func = null, menuName = this.baseMenu, flags = LIB_MF_STRING, checkItem = false, checkRadio = false, separator = false, hide = false }) { this.menuItems.push({ str, func, menuName, flags, checkItem, checkRadio, separator, hide }); }

	newMenu({ menuName = this.baseMenu, str = '', appendTo = this.baseMenu, flags = LIB_MF_STRING, separator = false, hide = false }) {
		this.menuNames.push(menuName);
		if (menuName != this.baseMenu) this.menuItems.push({ menuName, appendMenu: true, str, appendTo, flags, separator, hide });
	}

	run(idx) {
		const v = this.func[idx];
		if (v instanceof Function) v();
	}
}

/** @global @type {boolean} */
const libClearArr = true;

/**
 * The instance of `LibMenuManager` class for library main menu operations.
 * @typedef {LibMenuManager}
 * @global
 */
const libMenu = new LibMenuManager('mainMenu', libClearArr);

/**
 * The instance of `LibMenuManager` class for library filter menu operations.
 * @typedef {LibMenuManager}
 * @global
 */
const libFMenu = new LibMenuManager('filterMenu', libClearArr);

/**
 * The instance of `LibMenuManager` class for library search histry menu operations.
 * @typedef {LibMenuManager}
 * @global
 */
const libSMenu = new LibMenuManager('searchHistoryMenu', libClearArr);

/**
 * The instance of `LibMenuManager` class for library search menu operations.
 * @typedef {LibMenuManager}
 * @global
 */
const libSearchMenu = new LibMenuManager('searchMenu');

class LibMenuItems {
	constructor() {
		this.expandable = false;
		this.ix = -1;
		this.items = new FbMetadbHandleList();
		this.nm = '';
		this.pl = [];
		this.r_up = false;
		this.show_context = false;
		this.treeExpandLimit = $Lib.file('C:\\check_local\\1450343922.txt') ? 6000 : $Lib.clamp(libSet.treeExpandLimit, 10, 6000);
		this.playlists_changed(true);
		this.settingsBtnDn = false;
		this.validItem = false;
	}

	// * METHODS * //

	mainMenu() {
		libMenu.newMenu({ hide: !this.settingsBtnDn && libSet.settingsShow && this.validItem });

		// * Top menu options Library submenu
		libMenu.newItem({
			str: '选项菜单 - 曲库',
			func: () => {
				grm.topMenu.topMenuOptions(grm.ui.state.mouse_x, grm.ui.state.mouse_y, true, 'library');
			},
			separator: () => true
		});

		if (grSet.theme === 'random') {
			libMenu.newItem({
				str: '生成新的颜色',
				func: () => {
					grm.ui.getRandomThemeColorContextMenu = true;
					grm.ui.initTheme();
					setTimeout(() => { grm.ui.getRandomThemeColorContextMenu = false }, 200);
				},
				separator: () => true
			});
		}

		if (grSet.layout === 'default' && grSet.theme.startsWith('custom')) {
			libMenu.newItem({
				str: !grm.ui.displayCustomThemeMenu ? '编辑自定义主题' : '退出自定义主题菜单',
				func: () => {
					grm.ui.initCustomThemeMenuState();
				},
				separator: () => true
			});
		}

		if (libImg.isFlowActive()) {
			libMenu.newMenu({ menuName: '3D CD 流转设置' });
			libMenu.newItem({ menuName: '3D CD 流转设置', str: '回到正在播放的专辑',
				func: () => { libImg.noteFlowActivity(); libImg.returnFlowToNowPlaying(); }, flags: fb.IsPlaying ? LIB_MF_STRING : LIB_MF_GRAYED });
			const sections = [
				['无操作自动归位', 'flowIdleSeconds', [['关闭',0],['3 秒',3],['5 秒（默认）',5],['10 秒',10]]],
				['中央专辑大小', 'flowCenterSize', [['小 · 80%',80],['标准 · 100%',100],['大 · 120%',120],['更大 · 140%',140]]],
				['透视深度', 'flowDepth', [['浅 · 60%',60],['标准 · 100%',100],['深 · 140%',140]]],
				['排列疏密', 'flowSpacing', [['紧凑 · 80%',80],['标准 · 100%',100],['舒展 · 120%',120]]]
			];
			for (const [label, property, choices] of sections) {
				libMenu.newMenu({ menuName: label, appendTo: '3D CD 流转设置' });
				for (const [caption, value] of choices) libMenu.newItem({ menuName: label, str: caption,
					checkRadio: Number(libSet[property]) === value, func: () => libImg.setFlowSetting(property, value) });
			}
			libMenu.newItem({ menuName: '3D CD 流转设置', str: '恢复流转默认设置', separator: true, func: () => {
				for (const [property,value] of [['flowIdleSeconds',5],['flowCenterSize',100],['flowDepth',100],['flowSpacing',100]]) libSet[property] = value;
				libImg.setFlowSetting('flowCenterSize',100);
			} });
		}

		// * Library layout switcher
		libMenu.newItem({
			str: grSet.libraryLayout === 'normal' ? '切换 ⇒ 完整布局' : '切换 ⇒ 常规布局',
			func: () => {
				grSet.libraryLayout = grSet.libraryLayout === 'normal' ? 'full' : 'normal';
				grm.ui.initLibraryLayoutState();
			},
			hide: () => grSet.layout === 'default' && grSet.libraryDesign === 'flowMode' || grSet.layout !== 'default'
		});
		libMenu.newItem({
			str: grSet.libraryLayout === 'split' ? '切换 ⇒ 完整布局' : '切换 ⇒ 拆分布局',
			func: () => {
				grSet.libraryLayout = grSet.libraryLayout === 'split' ? 'full' : 'split';
				grm.ui.initLibraryLayoutState();
			},
			separator: () => true,
			hide: () => grSet.layout === 'default' && grSet.libraryDesign === 'flowMode' || grSet.layout !== 'default'
		});

		// * Browse mode
		libMenu.newItem({
			str: '浏览模式',
			func: () => {
				grSet.panelBrowseMode = !grSet.panelBrowseMode;
				grm.ui.initBrowserModeState();
			},
			checkItem: grSet.panelBrowseMode,
			separator: () => true
		});

		if (this.validItem) {
			['添加到当前播放列表\tShift+enter', '发送到新建播放列表\tCtrl+enter', '显示   正在播放'].forEach((v, i) => libMenu.newItem({
				str: v,
				func: () => this.setPlaylist(i),
				flags: this.getPaylistFlag(i),
				separator: i == 1
			}));
		}

		if (this.validItem && libSet.albumArtOptionsShow) {
			const gridStr = !lib.panel.imgView ? '显示   专辑网格' : (!libSet.facetView ? '显示   树' : '显示   文本');
			libMenu.newItem({
				str: gridStr,
				func: () => {
					libSet.artId = 0;
					this.setPlaylist(3)
				},
				flags: !lib.panel.pn_h_auto || libSet.pn_h != libSet.pn_h_min ? LIB_MF_STRING : LIB_MF_GRAYED
			});

			const gridStr2 = libSet.artId === 4 && gridStr !== '显示   专辑网格' ? '显示   专辑网格' : '显示艺术家网格';
			libMenu.newItem({
				str: gridStr2,
				func: () => {
					libSet.artId = libSet.artId === 0 || gridStr2 === '显示艺术家网格' ? 4 : 0;
					if (lib.panel.imgView) libSet.toggle('albumArtShow');
					this.setPlaylist(3);
				},
				separator: !lib.panel.imgView
			});
		}

		for (let i = 0; i < 2; i++) {
			libMenu.newItem({
				str: [this.items.Count ? '刷新   所选图片...' : '刷新图片: 无选择', '刷新   全部图片...'][i],
				func: () => this.setMode(i),
				flags: () => lib.panel.imgView && !i && this.items.Count || !lib.panel.imgView || i ? LIB_MF_STRING : LIB_MF_GRAYED,
				hide: () => !this.validItem || !libSet.albumArtShow
			});
		}

		if (this.validItem && !lib.panel.imgView) {
			['折叠全部\tNum -', '展开\tNum *'].forEach((v, i) => libMenu.newItem({
				str: v,
				func: () => this.setTreeState(i),
				flags: !i || i == 1 && this.expandable ? LIB_MF_STRING : LIB_MF_GRAYED,
				separator: i == 1 && this.show_context && (!libSet.settingsShow && !libSet.searchShow && !libSet.filterShow || this.shift)
			}));
		}

		libMenu.newMenu({ menuName: '设置', hide: !this.show_context || lib.ui.style.topBarShow && !this.shift });

		const mainMenu = () => this.show_context ? '设置' : 'baseMenu';

		libMenu.newMenu({ menuName: '查看', separator: false });
		lib.panel.menu.forEach((v, i) => libMenu.newItem({
			menuName: '查看',
			str: v,
			func: () => this.setView(i),
			checkRadio: i == libSet.viewBy,
			separator: i > lib.panel.menu.length - 3
		}));

		// * View by Folder Structure Hide menu
		if (libSet.viewBy === 10) {
			libMenu.newMenu({ menuName: '隐藏', separator: false });
			['隐藏专辑年份', '隐藏音轨号', '隐藏文件扩展名'].forEach((v, i) => {
				libMenu.newItem({
					menuName: '隐藏',
					str: v,
					func: () => {
						const key = i.toString();
						if (libSet.viewByFolderHide.includes(key)) {
							libSet.viewByFolderHide = libSet.viewByFolderHide.replace(key, '');
						} else {
							libSet.viewByFolderHide += key;
						}
						lib.pop.buildTree(lib.lib.root, 0);
						lib.panel.imgView = grSet.libraryLayout === 'normal' && grSet.libraryLayoutFullPreset ? libSet.albumArtShow = false : libSet.albumArtShow;
						lib.men.loadView(false, !lib.panel.imgView ? (libSet.artTreeSameView ? libSet.viewBy : libSet.treeViewBy) : (libSet.artTreeSameView ? libSet.viewBy : libSet.albumArtViewBy), lib.pop.sel_items[0]);
					},
					checkItem: libSet.viewByFolderHide.includes(i.toString()),
					separator: i > lib.panel.menu.length - 3
				});
			});
		}

		const d = {};
		this.getSortData(d);
		libMenu.newMenu({ menuName: d.menuName, flags: d.sortType ? LIB_MF_STRING : LIB_MF_GRAYED, separator: this.show_context });
		if (d.sortType) {
			libMenu.newItem({
				menuName: d.menuName,
				str: ['', '按年份', '专辑按年份'][d.sortType],
				flags: LIB_MF_GRAYED,
				separator: true
			});
			const menuSort = [[], ['默认', '升序', '降序'], ['默认', '升序（隐藏年份）', '升序（显示年份）', '降序（隐藏年份）', '降序（显示年份）', '年份显示在专辑之后', '年份显示在专辑之前']][d.sortType];
			menuSort.forEach((v, i) => libMenu.newItem({
				menuName: d.menuName,
				str: v,
				func: () => this.sortByDate(i, d),
				flags: i > 4 && (d.sortIX == 1 || d.sortIX == 3) ? LIB_MF_GRAYED : LIB_MF_STRING,
				checkRadio: d.sortIX == -1 && !i || i == d.sortIX || d.sortType == 2 && i == 5 && !libSet.yearBeforeAlbum || i == 6 && libSet.yearBeforeAlbum,
				separator: i == 0 || d.sortType == 2 && (i == 2 || i == 4)
			}));
		}

		libMenu.newItem({
			str: '写入      主题到标签',
			func: () => grm.fman.writeThemeTags()
		});

		const meta_manager = new PlaylistMetaManager();
		libMenu.newItem({
			str: '写入专辑统计到标签',
			func: () => meta_manager.write_album_stats_to_tags()
		});

		libMenu.newItem({
			menuName: '查看',
			str: '配置查看...',
			func: () => lib.panel.open('views')
		});

		libMenu.newMenu({ menuName: '统计', appendTo: mainMenu(), separator: true });
		[lib.pop.countsRight && !lib.panel.imgView ? ['无', '# 音轨', '# 项'][lib.pop.nodeCounts] : '无', '比特率', '持续时间', '合计大小', '等级', '热门', '日期', '播放队列', '播放次数', '首次播放', '最近播放', '添加时间', '配置统计...'].forEach((v, i) => libMenu.newItem({
			menuName: '统计',
			str: v,
			func: () => this.setStatistics(i),
			checkRadio: i == libSet.itemShowStatistics,
			separator: !i || i == 7 || i == 11
		}));

		libMenu.newMenu({ menuName: '专辑封面', appendTo: mainMenu(), hide: !lib.panel.imgView });
		['封面', '封底', '碟片', '图标', '艺术家', '分组: 自动', '分组: 一级', '分组: 二级', '改变分组名称...', '配置专辑封面...'].forEach((v, i) => libMenu.newItem({
			menuName: '专辑封面',
			str: v,
			func: () => this.setAlbumart(i),
			flags: i == 8 && (lib.panel.folderView || libSet.rootNode != 3) ? LIB_MF_GRAYED : LIB_MF_STRING,
			checkRadio: i == libSet.artId || i - 5 == libSet.albumArtGrpLevel,
			separator: i == 4 || i == 7 || i == 8
		}));

		libMenu.newMenu({ menuName: '快速设置', appendTo: mainMenu() });

		['Georgia-Reborn'].forEach((v, i) => libMenu.newItem({
			menuName: '快速设置',
			str: v,
			func: () => lib.panel.set('quickSetup', 12),
			flags: () => i != 10 || this.items.Count ? LIB_MF_STRING : LIB_MF_GRAYED,
			separator: i == 0
		}));

		['传统', '现代', '超现代', '简洁', '分面'].forEach((v, i) => libMenu.newItem({
			menuName: '快速设置',
			str: v,
			func: () => lib.panel.set('quickSetup', i),
			separator: i == 3 || i == 4
		}));

		if (libSet.albumArtOptionsShow) {
			['封面 [右侧标签]', '封面 [底部标签]', '封面 [叠加标签]', '艺术家照片 [右侧标签]', grSet.libraryThumbnailSize === 'auto' ? '专辑封面大小 + (禁用缩略图自动大小)' : '专辑封面大小 +', grSet.libraryThumbnailSize === 'auto' ? '专辑封面大小 - (禁用缩略图自动大小)' : '专辑封面大小 -', '流动模式', '始终以当前“查看”模式加载预设'].forEach((v, i) => libMenu.newItem({
				menuName: '快速设置',
				str: v,
				func: () => lib.panel.set('quickSetup', i + 5),
				flags: i == 4 && (libSet.thumbNailSize == 7 || !lib.panel.imgView || libSet.albumArtFlowMode || grSet.libraryThumbnailSize === 'auto') || i == 5 && (libSet.thumbNailSize == 0 || !lib.panel.imgView || libSet.albumArtFlowMode || grSet.libraryThumbnailSize === 'auto') ? LIB_MF_GRAYED : LIB_MF_STRING,
				checkItem: i == 7 && libSet.presetLoadCurView,
				separator: i == 2 || i == 3 || i == 5 || i == 6
			}));
		}

		// ! Source panel and playlist feature is not supported in a single panel/one library i.e in Georgia/Georgia-ReBORN
		libMenu.newMenu({ menuName: '来源', appendTo: mainMenu(), separator: true });
		['媒体库'/*, '面板', '播放列表' */].forEach((v, i) => libMenu.newItem({
			menuName: '来源',
			str: v,
			func: () => this.setSource(i),
			checkRadio: i == (libSet.libSource - 1 < 0 || libSet.fixedPlaylist ? 2 : libSet.libSource - 1),
			separator: i == 2
		}));

		// menu.newItem({
		// 	menuName: '来源',
		// 	str: '选择来源面板',
		// 	func: () => this.setSourcePanel(),
		// 	flags: libSet.libSource != 2 ? MF_GRAYED_LIB : MF_STRING_LIB,
		// 	separator: true
		// });

		libMenu.newMenu({ menuName: '播放列表', appendTo: '来源' });
		libMenu.newItem({
			menuName: '播放列表',
			str: '激活播放列表',
			func: () => { this.setActivePlaylist(); this.setSource(2) },
			checkRadio: libSet.libSource == 0,
			separator: true
		});

		const pl_no = Math.ceil(this.pl.length / 30);
		const pl_ix = libSet.fixedPlaylist ? plman.FindPlaylist(libSet.fixedPlaylistName) : -1;
		for (let j = 0; j < pl_no; j++) {
			const n = `# ${j * 30 + 1} - ${Math.min(this.pl.length, 30 + j * 30)}${30 + j * 30 > pl_ix && ((j * 30) - 1) < pl_ix ? '  >>>' : ''}`;
			libMenu.newMenu({ menuName: n, appendTo: '播放列表' });
			for (let i = j * 30; i < Math.min(this.pl.length, 30 + j * 30); i++) {
				libMenu.newItem({
					menuName: n,
					str: this.pl[i].menuName,
					func: () => { this.setFixedPlaylist(i); this.setSource(2) },
					checkRadio: i == pl_ix && libSet.libSource != 0
				});
			}
		}

		libMenu.newMenu({ menuName: '刷新', appendTo: mainMenu(), separator: true });
		for (let i = 0; i < 5; i++) { libMenu.newItem({
			menuName: '刷新',
			str: ['刷新所选图片...', '刷新全部图片...', '重置缩放...', '刷新曲库...', '重载...'][i],
			func: () => this.setMode(i),
			flags: lib.panel.imgView && !i && this.items.Count || !lib.panel.imgView || i ? LIB_MF_STRING : LIB_MF_GRAYED,
			separator: i == 1 && lib.panel.imgView,
			hide: i < 2 && !lib.panel.imgView || i == 3 && libSet.libAutoSync
		}); }

		for (let i = 0; i < 2; i++) { libMenu.newItem({
			menuName: mainMenu(),
			str: [lib.popUpBox.ok ? '选项...' : '选项: 请查看控制台', '配置...'][i],
			func: () => !i ? lib.panel.open() : window.EditScript(),
			separator: !i && this.shift,
			hide: !this.settingsBtnDn && libSet.settingsShow && this.validItem && !this.shift || i && !this.shift
		}); }
	}

	filterMenu() {
		libFMenu.newMenu({});
		for (let i = 0; i < lib.panel.filter.menu.length + 1; i++) { libFMenu.newItem({
			str: i != lib.panel.filter.menu.length ? (!i ? '无过滤' : lib.panel.filter.menu[i]) : '' /* '自动管理滚动' */,
			func: () => lib.panel.set('Filter', i),
			checkItem: i == lib.panel.filter.menu.length && !libSet.reset,
			checkRadio: i == libSet.filterBy && i < lib.panel.filter.menu.length,
			separator: !i || i == lib.panel.filter.menu.length - 1 || i == lib.panel.filter.menu.length
		}); }
		libFMenu.newItem({
			str: '配置过滤器...',
			func: () => lib.panel.open('filters')
		});
	}

	searchHistoryMenu() {
		libSMenu.newMenu({});
		for (let i = 0; i < lib.search.menu.length + 2; i++) {
			libSMenu.newItem({
				str: !i ? '查询语法帮助' : i < lib.search.menu.length + 1 ? lib.search.menu[i - 1].search : '清除历史记录',
				func: () => this.setSearchHistory(i),
				flags: i != 1 || lib.search.menu.length ? LIB_MF_STRING : LIB_MF_GRAYED,
				separator: !i || lib.search.menu.length && i == lib.search.menu.length
			});
		}
	}

	searchMenu() {
		libSearchMenu.newMenu({});
		['复制', '剪切', '粘贴'].forEach((v, i) => libSearchMenu.newItem({
			str: v,
			func: () => this.setEdit(i),
			flags: () => lib.search.start == lib.search.end && i < 2 || i == 2 && !lib.search.paste ? LIB_MF_GRAYED : LIB_MF_STRING,
			separator: i == 1
		}));
	}

	getPaylistFlag(i) {
		const pln = plman.ActivePlaylist;
		const plnIsValid = pln != -1 && pln < plman.PlaylistCount;
		const plLockAdd = plnIsValid ? plman.GetPlaylistLockedActions(pln).includes('AddItems') : false;
		const plLockRemoveOrAdd = plnIsValid ? plman.GetPlaylistLockedActions(pln).includes('RemoveItems') || plman.GetPlaylistLockedActions(pln).includes('ReplaceItems') || plLockAdd : false;
		return !i && !plLockRemoveOrAdd || i == 1 && !plLockAdd || i == 2 || i == 3 && lib.pop.nowp != -1 ? LIB_MF_STRING : LIB_MF_GRAYED
	}

	getSortData(d) {
		d.name = lib.panel.propNames[libSet.viewBy];
		d.sortAlbumsByYearAfter = ['', `[$nodisplay{$sub(${grTF.date},0#)}]%album%`, `[$nodisplay{$sub(${grTF.date},0)}]%album%[ '['$sub(${grTF.date},0)']']`, `[$nodisplay{$sub(4001,${grTF.date})}]%album%`, `[$nodisplay{$sub(4002,${grTF.date})}]%album%[ '['$sub(${grTF.date},0)']']`];
		d.sortAlbumsByYearBefore = ['', `[$nodisplay{$sub(${grTF.date},0)}]%album%`, `$sub(${grTF.date},0) - %album%`, `[$nodisplay{$sub(4003,${grTF.date})}]%album%`, `[$nodisplay{$sub(4004,${grTF.date})}]$sub(${grTF.date},0) - %album%`];
		d.sortAlbumByYear = libSet.yearBeforeAlbum ? d.sortAlbumsByYearBefore : d.sortAlbumsByYearAfter;
		d.sortIX = -1;
		d.sortType = 0;
		d.sortYear = ['', '$if2($nodisplay{$sub(%date%,0)},$nodisplay{-4000})', '$nodisplay{$sub(4000,%date%)}'];
		d.value = libSet.get(d.name) || '';
		d.valueLength = d.value.length;
		let l = d.sortYear.length;
		while (l-- && l) {
			d.value = d.value.replace(RegExp($Lib.regexEscape(d.sortYear[l]), 'g'), '');
			if (d.valueLength != d.value.length) {
				d.sortIX = l;
				d.valueLength = d.value.length;
			}
		}
		if (d.sortIX == -1) {
			l = d.sortAlbumsByYearAfter.length;
			while (l-- && l) {
				d.value = d.value.replace(RegExp($Lib.regexEscape(d.sortAlbumsByYearAfter[l]), 'g'), '%album%');
				if (d.valueLength != d.value.length) {
					d.sortIX = l;
					d.valueLength = d.value.length;
				}
			}
		}
		if (d.sortIX == -1) {
			l = d.sortAlbumsByYearBefore.length;
			while (l-- && l) {
				d.value = d.value.replace(RegExp($Lib.regexEscape(d.sortAlbumsByYearBefore[l]), 'g'), '%album%');
				if (d.valueLength != d.value.length) {
					d.sortIX = l;
					d.valueLength = d.value.length;
				}
			}
		}
		if (d.value.includes('//') && Regex.TFLibYearOrDate.test(d.value)) d.sortType = 1;
		else if (d.value.includes('%album%')) d.sortType = 2;

		d.menuName = d.sortType ? '排序' : '所选查看模式的排序不可用';
	}

	loadView(clearCache, view, sel) {
		lib.ui.getColours();
		grm.colorThemes.initThemeColors('library');
		lib.sbar.setCol();
		lib.but.createImages();
		if (clearCache) libImg.clearCache();
		if (sel !== undefined) {
			const handle = sel >= lib.panel.list.Count ? null : lib.panel.list[sel];
			lib.panel.set('view', view, true);
			if (handle) {
				const item = lib.panel.list.Find(handle);
				let idx = -1;
				lib.pop.tree.forEach((v, i) => {
					if (lib.pop.inRange(item, v.item)) idx = i;
				});
				if (idx != -1) {
					if (!lib.panel.imgView) lib.pop.focusShow(idx);
					else lib.pop.showItem(idx, 'focus');
				}
			}
		} else lib.panel.set('view', view, true);
		lib.but.refresh(true);
	}

	playlists_changed() {
		this.pl = [];
		for (let i = 0; i < plman.PlaylistCount; i++) { this.pl.push({
			menuName: plman.GetPlaylistName(i).replace(/&/g, '&&'),
			name: plman.GetPlaylistName(i),
			ix: i
		}); }
	}

	rbtn_up(x, y, settingsBtnDn) {
		this.r_up = true;
		this.expandable = false;
		this.items = new FbMetadbHandleList();
		this.ix = lib.pop.get_ix(x, y, true, false);
		this.nm = '';
		this.settingsBtnDn = settingsBtnDn;
		this.shift = lib.vk.k('shift');
		this.show_context = false;

		let item = lib.pop.tree[this.ix];
		let row = -1;
		const level = lib.pop.tree.length > this.ix && this.ix != -1 ? !lib.pop.inlineRoot ? item.level : Math.max(item.level - 1, 0) : -1;

		this.validItem = this.settingsBtnDn ? false : !lib.panel.imgView ? y < lib.panel.tree.y + lib.pop.rows * lib.sbar.row.h + lib.ui.y && lib.pop.tree.length > this.ix && this.ix != -1 && (x < Math.round(libSet.treeIndent * level) + lib.ui.icon.w + libSet.margin + lib.ui.x && (!item.track || item.root) || lib.pop.check_ix(item, x, y, true)) : lib.pop.tree.length > this.ix && this.ix != -1;

		if (!this.validItem && !this.settingsBtnDn && libSet.settingsShow && y > lib.ui.y + lib.panel.search.sp) {
			this.ix = lib.pop.row.i != -1 ? lib.pop.row.i : !lib.panel.imgView ? lib.pop.tree.length - 1 : -1;
			if (this.ix < lib.pop.tree.length && this.ix != -1) {
				item = lib.pop.tree[this.ix];
				this.validItem = true;
			}
		}

		if (this.validItem) {
			if (!item.sel) {
				lib.pop.clearSelected();
				item.sel = true;
			}
			lib.pop.getTreeSel();
			this.expandable = !(lib.pop.trackCount(lib.pop.tree[this.ix].item) > this.treeExpandLimit || lib.pop.tree[this.ix].track || lib.panel.imgView);
			if (this.expandable && lib.pop.tree.length) {
				let count = 0;
				lib.pop.tree.forEach((v, m, arr) => {
					if (m == this.ix || v.sel) {
						if (row == -1 || m < row) {
							row = m;
							this.nm = (v.level ? arr[v.par].srt[0] : '') + v.srt[0];
							this.nm = this.nm.toUpperCase();
						}
						count += lib.pop.trackCount(v.item);
						this.expandable = count <= this.treeExpandLimit;
					}
				});
			}
			this.items = lib.pop.getHandleList();
			this.show_context = true;
		} else this.items = lib.pop.getHandleList('newItems');

		libMenu.load(x, y);
		this.r_up = false;
	}

	setActivePlaylist() {
		libSet.libSource = 0;
		libSet.fixedPlaylist = false;
		libSet.fixedPlaylistName = 'ActivePlaylist';
		if (lib.panel.imgView) libImg.clearCache();
		lib.lib.searchCache = {};
		if (libSet.showSource) lib.panel.setRootName();
		lib.lib.treeState(false, 2);
	}

	setAlbumart(i) {
		const clearCache = false;
		switch (i) {
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
				libSet.artId = i;
				break;
			case 5:
			case 6:
			case 7:
				libSet.albumArtGrpLevel = i - 5;
				break;
			case 8: {
				const key = `${lib.panel.grp[libSet.viewBy].type.trim()}${lib.panel.lines}`;
				const ok_callback = (status, input) => {
					if (status != 'cancel') {
						const albumArtGrpNames = $Lib.jsonParse(libSet.albumArtGrpNames, {});
						albumArtGrpNames[key] = input;
						libSet.albumArtGrpNames = JSON.stringify(albumArtGrpNames);
					}
				}
				const caption = '更改分组名称';
				const def = libImg.groupField;
				const prompt = '英文时，输入单数名称，即非复数\n\n名称将固定到查看模版和分组级别';
				const fallback = lib.popUpBox.isHtmlDialogSupported() ? lib.popUpBox.input(caption, prompt, ok_callback, '', def) : true;
				if (fallback) {
					let ns = '';
					let status = 'ok';
					try {
						ns = utils.InputBox(0, prompt, caption, def, true);
					} catch (e) {
						status = 'cancel';
					}
					ok_callback(status, ns);
				}
				break;
			}
			case 9:
				lib.panel.open('albumArt');
				break;
		}
		this.loadView(clearCache, libSet.albumArtViewBy);
	}

	setEdit(i) {
		switch (i) {
			case 0:
				lib.search.on_char(lib.vk.copy);
				break;
			case 1:
				lib.search.on_char(lib.vk.cut);
				break;
			case 2:
				lib.search.on_char(lib.vk.paste, true);
				break;
		}
	}

	setFixedPlaylist(i) {
		libSet.fixedPlaylistName = this.pl[i].name;
		libSet.fixedPlaylist = true;
		libSet.libSource = 1;
		if (lib.panel.imgView) libImg.clearCache();
		if (libSet.showSource) lib.panel.setRootName();
		lib.lib.searchCache = {};
		lib.lib.treeState(false, 2);
	}

	setMode(i) {
		switch (i) {
			case 0:
				libImg.refresh(this.items);
				break;
			case 1:
				libImg.refresh('all');
				break;
			case 2:
				lib.panel.zoomReset();
				break;
			case 3:
				lib.lib.treeState(false, 2);
				break;
			case 4:
				window.Reload();
				break;
		}
	}

	setPlaylist(i) {
		switch (i) {
			// case 0: // The infamous 'Send to current playlist' func, deleting your entire playlist... >_<
			// 	lib.pop.load(lib.pop.sel_items, true, false, lib.pop.autoPlay.send, false, false);
			// 	lib.panel.treePaint();
			// 	lib.lib.treeState(false, libSet.rememberTree);
			// 	break;
			case 0:
				lib.pop.load(lib.pop.sel_items, true, true, false, false, false);
				lib.lib.treeState(false, libSet.rememberTree);
				if (grSet.addTracksPlaylistSwitch) {
					grm.button.btn.library.enabled = false;
					grm.button.btn.library.changeButtonState(ButtonState.Default);
					grm.ui.displayLibrary = false;
					grm.ui.displayPlaylist = true;
					if (!grSet.playlistAutoScrollNowPlaying) grm.ui.setPlaylistSize();
					setTimeout(() => { pl.playlist.scrollbar.scroll_to_end(); }, 500);
					window.Repaint();
				}
				break;
			case 1:
				lib.pop.sendToNewPlaylist();
				lib.panel.treePaint();
				lib.lib.treeState(false, libSet.rememberTree);
				if (grSet.addTracksPlaylistSwitch) {
					grm.button.btn.library.enabled = false;
					grm.button.btn.library.changeButtonState(ButtonState.Default);
					grm.ui.displayLibrary = false;
					grm.ui.displayPlaylist = true;
					setTimeout(() => { pl.playlist.scrollbar.scroll_to_end(); }, 100);
					window.Repaint();
				}
				break;
			case 2:
				lib.pop.nowPlayingShow();
				break;
			case 3: {
				lib.lib.logTree();
				lib.pop.clearTree();
				libSet.toggle('albumArtShow');
				lib.panel.imgView = grSet.savedLibraryAlbumArtShow = libSet.albumArtShow;
				this.loadView(false, !lib.panel.imgView ? (libSet.artTreeSameView ? libSet.viewBy : libSet.treeViewBy) : (libSet.artTreeSameView ? libSet.viewBy : libSet.albumArtViewBy), lib.pop.sel_items[0]);

				// Need continuous repaint when using style "Blend" and switching from normal to full width
				if (grSet.styleBlend) {
					RepaintWindowRectAreas();
				}

				grm.ui.setLibrarySize();
				grm.colorThemes.initThemeColors('library');
				grm.colorStyles.initStyleColors();
				if (grSet.libraryDesign === 'traditional') lib.pop.createImages();
				window.Repaint();
				break;
			}
			case 4:
				lib.lib.logTree();
				lib.pop.clearTree();
				this.loadView(false, !lib.panel.imgView ? (libSet.artTreeSameView ? libSet.viewBy : libSet.treeViewBy) : (libSet.artTreeSameView ? libSet.viewBy : libSet.albumArtViewBy), lib.pop.sel_items[0]);
				break;
		}
	}

	setSearchHistory(i) {
		switch (true) {
			case !i: {
				let fn = `${fb.FoobarPath}doc\\Query Syntax Help.html`;
				if (!$Lib.file(fn)) fn = `${fb.FoobarPath}Query Syntax Help.html`;
				$Lib.browser(`"${fn}`);
				break;
			}
			case i < lib.search.menu.length + 1:
				lib.panel.search.txt = lib.search.menu[i - 1].search;
				lib.search.menu[i - 1].accessed = Date.now();
				lib.search.focus();
				lib.but.setSearchBtnsHide();
				lib.lib.search();
				break;
			case i == lib.search.menu.length + 1:
				lib.search.menu = [];
				libSet.searchHistory = JSON.stringify([]);
				break;
		}
	}

	setSource(i) {
		switch (i) {
			case 0:
				libSet.libSource = 1;
				libSet.fixedPlaylist = false;
				break;
			case 1:
				libSet.libSource = 2;
				libSet.fixedPlaylist = false;
				// if (libSet.panelSourceMsg && lib.popUpBox.isHtmlDialogSupported()) lib.popUpBox.message(); // Deactivated popup, let's not confuse the user since panel source is deactivated
				break;
			case 2: {
				const fixedPlaylistIndex = plman.FindPlaylist(libSet.fixedPlaylistName);
				if (fixedPlaylistIndex != -1) libSet.fixedPlaylist = true;
				libSet.libSource = libSet.fixedPlaylist ? 1 : 0;
				// if (libSet.panelSourceMsg && lib.popUpBox.isHtmlDialogSupported()) lib.popUpBox.message(); // Deactivated popup, let's not confuse the user since panel source is deactivated
				break;
			}
		}
		if (lib.panel.imgView) libImg.clearCache();
		lib.lib.searchCache = {};
		if (libSet.showSource) lib.panel.setRootName();
		lib.lib.treeState(false, 2);

		grSet.librarySource = libSet.libSource;
		grSet.libraryFixedPlaylist = libSet.fixedPlaylist;
		grSet.libraryFixedPlaylistName = libSet.fixedPlaylistName;
	}

	setSourcePanel() {
		const ok_callback = (status, input) => {
			if (status != 'cancel') {
				libSet.panelSelectionPlaylist = input;
			}
		}
		const caption = '来源面板名称';
		const def = libSet.panelSelectionPlaylist;
		const prompt = '输入来源面板名称\n\n• 要获取名称，请转到要用作来源的库树面板\n• 按 shift + windows 键跟选择配置\n• 将顶部的面板名称或id粘贴到此处\n• 名称也用于记得上次打开状态的缓存播放列表\n• 如有需要，编辑来源面板名称\n• 对于多个源面板，请使用竖线分隔符，例如流派|艺术家'
		const fallback = lib.popUpBox.isHtmlDialogSupported() ? lib.popUpBox.input(caption, prompt, ok_callback, '', def) : true;
		if (fallback) {
			let ns = '';
			let status = 'ok';
			try {
				ns = utils.InputBox(0, prompt, caption, def, true);
			} catch (e) {
				status = 'cancel';
			}
			ok_callback(status, ns);
		}
	}

	setStatistics(i) {
		if (i < 12) {
			const curStatisticsShown = libSet.itemShowStatistics > 0;
			libSet.itemShowStatistics = i;
			libSet.itemShowStatisticsLast = libSet.itemShowStatistics;
			lib.pop.tree.forEach(v => {
				v.id = '';
				v.count = ''; // has to reset parentheses if stats change off/on
				delete v.statistics;
				delete v._statistics;
			});
			lib.pop.cache = {
				standard: {},
				search: {},
				filter: {}
			}
			lib.pop.statisticsShow = libSet.itemShowStatistics;
			lib.pop.label = !libSet.labelStatistics || !lib.pop.statisticsShow ? '' : lib.pop.statistics[lib.pop.statisticsShow];
			const statisticsShown = libSet.itemShowStatistics > 0;
			if (lib.panel.imgView && curStatisticsShown != statisticsShown) {
				libImg.labels = { statistics: libSet.itemShowStatistics ? 1 : 0 }
				libImg.clearCache();
				lib.panel.set('view', libSet.viewBy);
			}
			lib.panel.treePaint();
		} else lib.panel.open('display');
	}

	setTreeState(i) {
		switch (i) {
			case 0:
				lib.pop.collapseAll();
				break;
			case 1:
				lib.pop.expand(this.ix, this.nm);
				lib.panel.setHeight(true);
				break;
		}
		lib.pop.checkAutoHeight();
	}

	setView(i) {
		if (i < lib.panel.menu.length) {
			if (libSet.artTreeSameView) {
				libSet.treeViewBy = i;
				libSet.albumArtViewBy = i;
			} else {
				if (!lib.panel.imgView) libSet.treeViewBy = i;
				else libSet.albumArtViewBy = i;
				if (libSet.treeViewBy != libSet.albumArtViewBy) {
					libSet.set(lib.panel.imgView ? '面板曲库 - 树' : '面板曲库 - 树 图片', null);
					libSet.set(lib.panel.imgView ? '面板曲库 - 树 搜索' : '面板曲库 - 树 图片 搜索', null);
				}
			}
			lib.panel.set('view', i);
		}
	}

	setViewByFolderHide(tree, indicesStr) {
		const hideAlbumYear = (name) =>
			name.replace(Regex.DateYearLeading, '');

		const hideTrackNumber = (name) =>
			Regex.TrackHasNumber.test(name) && !Regex.TrackHasSeparator.test(name) ? name :
			name.replace(Regex.TrackNumberLeading, '');

		const hideFileExtension = (name) =>
			name.replace(Regex.PathFileExtension, '');

		const hideFuncs = [
			hideAlbumYear,
			hideTrackNumber,
			hideFileExtension
		];

		const selectedHideFuncs = indicesStr
			.split('')
			.map(index => hideFuncs[parseInt(index, 10)])
			.filter(Boolean);

		if (selectedHideFuncs.length === 0) return;

		const applyHideFuncs = (name) =>
			selectedHideFuncs.reduce((acc, hideFunction) => hideFunction(acc), name);

		const traverseAndHide = (node) => {
			if (node.nm) {
				node.nm = applyHideFuncs(node.nm);
			}
			if (node.child && node.child.length > 0) {
				node.child.forEach(traverseAndHide);
			}
		};

		tree.forEach(traverseAndHide);
	}

	sortByDate(i, d) {
		let sortByIX = -1;
		if (i > 4) {
			libSet.toggle('yearBeforeAlbum');
			d.sortAlbumByYear = libSet.yearBeforeAlbum ? d.sortAlbumsByYearBefore : d.sortAlbumsByYearAfter;
			sortByIX = d.sortIX;
		} else sortByIX = i;
		if (d.sortType == 1) {
			if (i) {
				const str = d.value.split('//');
				if (str[1]) {
					str[1] = str[1].trim().replace(Regex.DatePipeCapture,  `$1${d.sortYear[i]}$2`)
					if (!Regex.DatePipeCheck.test(str[1])) str[1] = d.sortYear[i] + str[1];
					d.value = `${str[0].trim()} // ${str[1]}`;
				} else d.value = str[0];
			}
		} else if (d.sortType == 2 && i && sortByIX != -1) {
			d.value = d.value.replace(Regex.TFAlbum, d.sortAlbumByYear[sortByIX]);
		}
		if (d.sortType == 1 || sortByIX != -1) {
			const expanded = [];
			const ix = lib.pop.get_ix(!lib.panel.imgView ? 0 : libImg.panel.x + 1, (!lib.panel.imgView || libImg.style.vertical ? lib.panel.tree.y : lib.panel.tree.x) + lib.sbar.row.h / 2, true, false);
			const curName = ix != -1 ? lib.pop.tree[ix].name : '';
			const scrollPos = lib.sbar.scroll;
			const selected = [];
			lib.pop.tree.forEach((v, i) => {
				const level = !libSet.rootNode ? v.level : v.level - 1; // 1 level memory: more is less reliable
				if (!level) {
					if (v.child.length) expanded.push(i);
					if (v.sel) selected.push(i);
				}
			});
			libSet.set(d.name, d.value);
			lib.pop.clearTree();
			lib.panel.getViews();
			this.setView(libSet.viewBy);
			if (ix < lib.pop.tree.length) {
				const name = ix != -1 ? lib.pop.tree[ix].name : '';
				if (name && name == curName) {
					expanded.forEach(v => {
						if (v < lib.pop.tree.length) {
							const item = lib.pop.tree[v];
							lib.pop.branch(item, !!item.root, true);
						}
					});
					selected.forEach(v => {
						if (v < lib.pop.tree.length) {
							lib.pop.tree[v].sel = true;
						}
					});
				}
			}
			lib.sbar.checkScroll(scrollPos, 'full', true);
		}
	}
}
