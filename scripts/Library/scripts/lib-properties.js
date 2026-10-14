'use strict';

class LibPanelProperty {
	constructor(name, default_value) {
		this.name = name;
		this.default_value = default_value;
		this.value = libSet.get(this.name, default_value);
	}

	// * METHODS * //

	get() {
		return this.value;
	}

	set(new_value) {
		if (this.value !== new_value) {
			libSet.set(this.name, new_value);
			this.value = new_value;
		}
	}
}

class LibPanelProperties {
	constructor() {
		// this.name_list = {}; debug
	}

	// * METHODS * //

	init(type, properties, thisArg) {
		switch (type) {
			case 'auto':
				properties.forEach(v => {
					// this.validate(v); debug
					this.add(v);
				});
				break;
			case 'manual':
				properties.forEach(v => thisArg[v[2]] = this.get(v[0], v[1]));
				break;
		}
	}

	validate(item) {
		if (!$Lib.isArray(item) || item.length !== 3 || typeof item[2] !== 'string') {
			throw ('invalid property: requires array: [string, any, string]');
		}

		if (item[2] === 'add') {
			throw (`property_id: ${item[2]}\nThis id is reserved`);
		}

		if (this[item[2]] != null || this[`${item[2]}_internal`] != null) {
			throw (`property_id: ${item[2]}\nThis id is already occupied`);
		}

		if (this.name_list[item[0]] != null) {
			throw (`property_name: ${item[0]}\nThis name is already occupied`);
		}
	}

	add(item) {
		// this.name_list[item[0]] = 1; debug
		this[`${item[2]}_internal`] = new LibPanelProperty(item[0], item[1]);

		Object.defineProperty(this, item[2], {
			get() {
				return this[`${item[2]}_internal`].get();
			},
			set(new_value) {
				this[`${item[2]}_internal`].set(new_value);
			}
		});
	}

	get(name, default_value) {
		return window.GetProperty(name, default_value);
	} // initialisation

	set(name, new_value) {
		return window.SetProperty(name, new_value);
	}

	toggle(name) {
		this[name] = !this[name];
	}
}

/** @global @type {Array.<Array>} */
let libProperties = [
	['面板曲库 - #显示Html对话框 不支持-0 支持-1 自动检查-2', 2, 'isHtmlDialogSupported'],
	['面板曲库 - 激活模式', 0, 'actionMode'],
	['面板曲库 - Alt-点击激活', 1, 'altClickAction'],

	['面板曲库 - 颜色 线 深色', false, 'colLineDark'],
	['面板曲库 - 颜色交换', false, 'swapCol'],
	['面板曲库 - 封面 自动填充', true, 'autoFill'],
	['面板曲库 - 封面 不透明度 (0-100)', 10, 'covAlpha'],

	['面板曲库 - 自定义颜色 文本', '171,171,190', 'text'],
	['面板曲库 - 自定义颜色 文本 高亮', '121,194,255', 'text_h'],
	['面板曲库 - 自定义颜色 文本 选定', '255,255,255', 'textSel'],
	['面板曲库 - 自定义颜色 文本 正在播放高亮', 'rgb(121-194-255)', 'nowp'],
	['面板曲库 - 自定义颜色 搜索 文本', '171,171,190', 'search'],
	['面板曲库 - 自定义颜色 按钮', '113,125,147', 'txt_box'],
	['面板曲库 - 自定义颜色 背景', '4,39,68', 'bg'],
	['面板曲库 - 自定义颜色 背景 突出', '18,52,85', 'bg_h'],
	['面板曲库 - 自定义颜色 背景 选定', '37,71,108', 'bgSel'],
	['面板曲库 - 自定义颜色 边框 悬停', '35,132,182', 'frame'],
	['面板曲库 - 自定义颜色 边框 选定', '49,145,198', 'bgSelframe'],
	['面板曲库 - 自定义颜色 项目计数', '171,171,190', 'counts'],
	['面板曲库 - 自定义颜色 节点 折叠', '171,171,190', 'icon_c'],
	['面板曲库 - 自定义颜色 节点 展开', '171,171,190', 'icon_e'],
	['面板曲库 - 自定义颜色 节点 悬停', '121,194,255', 'icon_h'],
	['面板曲库 - 自定义颜色 节点 线', '48,70,90', 'line'],
	['面板曲库 - 自定义颜色 分隔符', '48,71,90', 's_line'],
	['面板曲库 - 自定义颜色 侧面标签器', '121,194,255', 'sideMarker'],
	['面板曲库 - 自定义颜色 透明填充', '0,0,0,0.06', 'bgTrans'],

	['面板曲库 - 自定义颜色 文本 使用', false, 'textUse'],
	['面板曲库 - 自定义颜色 文本 高亮 使用', false, 'text_hUse'],
	['面板曲库 - 自定义颜色 文本 选定 使用', false, 'textSelUse'],
	['面板曲库 - 自定义颜色 文本 正在播放高亮 使用', false, 'nowpUse'],
	['面板曲库 - 自定义颜色 搜索 文本 使用', false, 'searchUse'],
	['面板曲库 - 自定义颜色 按钮 使用', false, 'txt_boxUse'],
	['面板曲库 - 自定义颜色 背景 使用', false, 'bgUse'],
	['面板曲库 - 自定义颜色 背景 突出 使用', false, 'bg_hUse'],
	['面板曲库 - 自定义颜色 背景 选定 使用', false, 'bgSelUse'],
	['面板曲库 - 自定义颜色 边框 悬停 使用', false, 'frameUse'],
	['面板曲库 - 自定义颜色 边框 选定 使用', false, 'bgSelframeUse'],
	['面板曲库 - 自定义颜色 项目计数 使用', false, 'countsUse'],
	['面板曲库 - 自定义颜色 节点 折叠 使用', false, 'icon_cUse'],
	['面板曲库 - 自定义颜色 节点 展开 使用', false, 'icon_eUse'],
	['面板曲库 - 自定义颜色 节点 悬停 使用', false, 'icon_hUse'],
	['面板曲库 - 自定义颜色 节点 线 使用', false, 'lineUse'],
	['面板曲库 - 自定义颜色 分隔符 使用', false, 's_lineUse'],
	['面板曲库 - 自定义颜色 侧面标签器 使用', false, 'sideMarkerUse'],
	['面板曲库 - 自定义颜色 透明填充 使用', false, 'bgTransUse'],

	['面板曲库 - 自定义字体', 'Segoe UI,16,0', 'custFont'],
	['面板曲库 - 自定义字体 专辑封面 行 1', 'Segoe UI,1', 'custAlbumArtGrpFont'],
	['面板曲库 - 自定义字体 专辑封面 行 2', 'Segoe UI Semibold,0', 'custAlbumArtLotFont'],
	['面板曲库 - 自定义字体 专辑封面 行 3', 'Segoe UI,0', 'custAlbumArtDurFont'],

	['面板曲库 - 自定义字体 使用', false, 'custFontUse'],
	['面板曲库 - 自定义字体 专辑封面 行 1 使用', false, 'custAlbumArtGrpFontUse'],
	['面板曲库 - 自定义字体 专辑封面 行 2 使用', false, 'custAlbumArtLotFontUse'],
	['面板曲库 - 自定义字体 专辑封面 行 3 使用', false, 'custAlbumArtDurFontUse'],

	['面板曲库 - 自定义字体 节点图标', 'Segoe UI Symbol', 'custIconFont'],
	['面板曲库 - 自定义字体 滚动图标', 'Segoe UI Symbol', 'butCustIconFont'],

	['面板曲库 - 资源浏览器 - 插图 - 专辑图片缩放', 'cropped', 'explorerAlbumImgScaling'],
	['面板曲库 - 资源浏览器 - 插图 - 专辑缩略图缩放', 'cropped', 'explorerAlbumThumbImgScaling'],
	['面板曲库 - 资源浏览器 - 插图 - 艺术家图片缩放', 'cropped', 'explorerArtistImgScaling'],
	['面板曲库 - 资源浏览器 - 插图 - 艺术家缩略图缩放', 'cropped', 'explorerArtistThumbImgScaling'],
	['面板曲库 - 资源浏览器 - 插图 - 全主题颜色跟随插图切换', true, 'explorerFullThemeColorChange'],
	['面板曲库 - 资源浏览器 - 插图 - 插图', true, 'explorerArtworkCycle'],
	['面板曲库 - 资源浏览器 - 插图 - 插图时间', 15000, 'explorerArtworkCycleTime'],

	['面板曲库 - 资源浏览器 - 控制 - 播放时保留播放列表', true, 'explorerPlaybackKeepPlaylist'],
	['面板曲库 - 资源浏览器 - 控制 - 关闭外部鼠标滚轮', true, 'explorerWheelOutsideClose'],

	['面板曲库 - 资源浏览器 - 显示 - 显示浏览器', false, 'explorerTreeView'],
	['面板曲库 - 资源浏览器 - 显示 - 显示关闭按钮始终', false, 'explorerCloseButtonAlways'],
	['面板曲库 - 资源浏览器 - 显示 - 显示标签图标 仅', false, 'explorerTabIconsOnly'],
	['面板曲库 - 资源浏览器 - 显示 - 显示标签图标 现在播放', false, 'explorerTabIconNowPlaying'],
	['面板曲库 - 资源浏览器 - 显示 - 显示链接图标 网格', true, 'explorerExternalLinkIcon'],
	['面板曲库 - 资源浏览器 - 显示 - 专辑年份在网格', 'overlay', 'explorerAlbumYearType'],
	['面板曲库 - 资源浏览器 - 显示 - 显示音轨评级网格', true, 'explorerShowTrackRatingGrid'],
	['面板曲库 - 资源浏览器 - 显示 - 显示不同艺术家', false, 'explorerShowDifferentArtist'],
	['面板曲库 - 资源浏览器 - 显示 - 显示碟版子页眉', true, 'explorerShowDiscHeader'],

	['面板曲库 - 资源浏览器 - 下载 - 专辑图片 自动下载', true, 'explorerAlbumImageDLAuto'],
	['面板曲库 - 资源浏览器 - 下载 - 专辑图片 下载质量', 'original', 'explorerAlbumImageDLQuality'],
	['面板曲库 - 资源浏览器 - 下载 - 专辑图片 名称保存在专辑文件夹', 'folder', 'explorerAlbumImageNameMoveToDir'],
	['面板曲库 - 资源浏览器 - 下载 - 专辑图片 下载后动作', 'move', 'explorerAlbumImageAutoAction'],
	['面板曲库 - 资源浏览器 - 下载 - 艺术家图片 自动下载', true, 'explorerArtistImageDLAuto'],
	['面板曲库 - 资源浏览器 - 下载 - 艺术家图片 下载数量', 10, 'explorerArtistImageDLCount'],
	['面板曲库 - 资源浏览器 - 下载 - 艺术家图片 下载质量', 'original', 'explorerArtistImageDLQuality'],
	['面板曲库 - 资源浏览器 - 下载 - 缺失版本图片 自动下载', true, 'explorerMissingReleasesImageDLAuto'],
	['面板曲库 - 资源浏览器 - 下载 - 相似艺术家图片 自动下载', true, 'explorerSimilarArtistImageDLAuto'],

	['面板曲库 - 资源浏览器 - 缺失版本 - 获取来源', 'discogs', 'explorerMissingReleasesFetchSource'],

	['面板曲库 - 资源浏览器 - 热门 - 获取来源', 'lastfm', 'explorerPopularityFetchSource'],

	['面板曲库 - 资源浏览器 - 相似艺术家 - 查看', 'local', 'explorerSimilarArtistView'],
	['面板曲库 - 资源浏览器 - 相似艺术家 - 获取来源', 'lastfm', 'explorerSimilarArtistFetchSource'],
	['面板曲库 - 资源浏览器 - 相似艺术家 - 获取限制 (外部)', 50, 'explorerSimilarArtistFetchLimitExternal'],

	['面板曲库 - 资源浏览器 - 排序 - 方向 专辑', 'ASC', 'explorerSortDirAlbum'],
	['面板曲库 - 资源浏览器 - 排序 - 方向 艺术家', 'ASC', 'explorerSortDirArtist'],
	['面板曲库 - 资源浏览器 - 排序 - 方向 相似艺术家', 'DSC', 'explorerSortDirSimilar'],
	['面板曲库 - 资源浏览器 - 排序 - 样式 专辑', 'Track number', 'explorerSortAlbum'],
	['面板曲库 - 资源浏览器 - 排序 - 样式 艺术家', 'Year', 'explorerSortArtist'],
	['面板曲库 - 资源浏览器 - 排序 - 样式 相似艺术家', 'Similarity', 'explorerSortSimilar'],

	['面板曲库 - 资源浏览器 - 统计 - 样式 专辑', 'playcount', 'explorerStatsAlbum'],
	['面板曲库 - 资源浏览器 - 统计 - 样式 艺术家', 'rating', 'explorerStatsArtist'],
	['面板曲库 - 资源浏览器 - 统计 - 样式 相似艺术家', 'rating', 'explorerStatsSimilar'],
	
	['面板曲库 - 双击激活', 1, 'dblClickAction'],
	['面板曲库 - 分面查看', false, 'facetView'],
	['面板曲库 - 过滤按', 0, 'filterBy'],
	['面板曲库 - 字体大小 (默认)', 12, 'baseFontSize_default'],
	['面板曲库 - 字体大小 (封面)', 12, 'baseFontSize_artwork'],
	['面板曲库 - 整行可选', true, 'fullLineSelection'],
	['面板曲库 - 高度', 578, 'pn_h'],
	['面板曲库 - 高度 自动 [展开/折叠 根使用]', false, 'pn_h_auto'],
	['面板曲库 - 高度 自动-折叠', 100, 'pn_h_min'],
	['面板曲库 - 高度 自动-展开', 578, 'pn_h_max'],
	['面板曲库 - 高亮 行', 1, 'highLightRow'],
	['面板曲库 - 高亮 边框 图片', false, 'frameImage'],
	['面板曲库 - 高亮 文本', false, 'highLightText'],
	['面板曲库 - 热键 [无需焦点]: 1-10 // 在键盘快捷键中指定蜘蛛猴面板索引', 'CollapseAll,0,PlaylistAdd,0,PlaylistInsert,0,PlaylistNew,0,Search,0,SearchClear,0', 'hotKeys'],

	['面板曲库 - 图片 模糊背景 自动填充', false, 'blurAutofill'],
	['面板曲库 - 图片 模糊背景 级别 (%)', 90, 'blurTemp'],
	['面板曲库 - 图片 模糊背景 不透明度 (%)', 30, 'blurAlpha'],
	['面板曲库 - 图片 当前 根', 3, 'curRootImg'],
	['面板曲库 - 图片 当前无艺术家', 0, 'curNoArtistImg'],
	['面板曲库 - 图片 当前无封面', 0, 'curNoCoverImg'],
	['面板曲库 - 图片 磁盘缓存启用', true, 'albumArtDiskCache'],
	['面板曲库 - 图片 投影', false, 'albumArtDropShadow'],
	['面板曲库 - 图片 分组 级别', 0, 'albumArtGrpLevel'],
	['面板曲库 - 图片 分组 名称', JSON.stringify({}), 'albumArtGrpNames'],
	['面板曲库 - 图片 翻转标签', false, 'albumArtFlipLabels'],
	['面板曲库 - 图片 流动模式', false, 'albumArtFlowMode'],
	['面板曲库 - 3D流转 中央大小 (%)', 100, 'flowCenterSize'],
	['面板曲库 - 3D流转 透视深度 (%)', 100, 'flowDepth'],
	['面板曲库 - 3D流转 排列间距 (%)', 100, 'flowSpacing'],
	['面板曲库 - 3D流转 无操作归位 (秒，0关闭)', 5, 'flowIdleSeconds'],
	['面板曲库 - 图片 跟随所选 流动模式', true, 'flowModeFollowSelection'],
	['面板曲库 - 图片 跟随所选 标准模式', false, 'stndModeFollowSelection'],
	['面板曲库 - 图片 项目叠加', 1, 'itemOverlayType'],
	['面板曲库 - 图片 标签', 1, 'albumArtLabelType'],
	['面板曲库 - 图片 标签文本对齐 左-0 中-1 右-2', 0, 'albumArtTextAlign'],
	['面板曲库 - 图片 内存限制 MB (0 = 默认)', 0, 'memoryLimit'],
	['面板曲库 - 图片 无艺术家图片', JSON.stringify([]), 'noArtistImages'],
	['面板曲库 - 图片 无封面图片', JSON.stringify([]), 'noCoverImages'],
	['面板曲库 - 图片 预加载磁盘缓存图片', true, 'albumArtPreLoad'],
	['面板曲库 - 图片 根 图片', JSON.stringify([]), 'rootImages'],
	['面板曲库 - 图片 显示专辑封面', false, 'albumArtShow'],
	['面板曲库 - 图片 显示索引字母', true, 'albumArtLetter'],
	['面板曲库 - 图片 显示索引编号', 1, 'albumArtLetterNo'],
	['面板曲库 - 图片 显示索引年份自动', true, 'albumArtYearAuto'],
	['面板曲库 - 图片 显示选项', true, 'albumArtOptionsShow'],
	['面板曲库 - 图片 样式 [封面] 常规-0 自动填充-1 圆形-2', 1, 'imgStyleFront'],
	['面板曲库 - 图片 样式 [封底] 常规-0 自动填充-1 圆形-2', 1, 'imgStyleBack'],
	['面板曲库 - 图片 样式 [碟片] 常规-0 自动填充-1 圆形-2', 1, 'imgStyleDisc'],
	['面板曲库 - 图片 样式 [图标] 常规-0 自动填充-1 圆形-2', 1, 'imgStyleIcon'],
	['面板曲库 - 图片 样式 [艺术家] 常规-0 自动填充-1 圆形-2', 1, 'imgStyleArtist'],
	['面板曲库 - 图片 缩略图间距标准', 0, 'thumbNailGapStnd'],
	['面板曲库 - 图片 缩略图间距紧凑', 3, 'thumbNailGapCompact'],
	['面板曲库 - 图片 缩略图大小', 2, 'thumbNailSize'],
	['面板曲库 - 图片 样式', 0, 'artId'],
	['面板曲库 - 图片 查看按: 与树相同', true, 'artTreeSameView'],
	
	['面板曲库 - 初始加载过滤器', true, 'initialLoadFilters'],
	['面板曲库 - 初始加载查看', true, 'initialLoadViews'],
	['面板曲库 - 键: 发送到播放列表', 0, 'keyAction'],
	['面板曲库 - 曲库 自动同步', true, 'libAutoSync'],
	['面板曲库 - 曲库 排序日期在专辑前', true, 'yearBeforeAlbum'],

	['面板曲库 - 曲库 来源', 1, 'libSource'],
	['面板曲库 - 曲库 来源: 激活播放列表跟随焦点', true, 'followPlaylistFocus'],
	['面板曲库 - 曲库 来源: 固定播放列表', false, 'fixedPlaylist'],
	['面板曲库 - 曲库 来源: 固定播放列表名称', '', 'fixedPlaylistName'],
																			 
	['面板曲库 - 限制菜单展开: 10-6000', 500, 'treeExpandLimit'],
	['面板曲库 - 限制树自动展开: 10-1000', 350, 'autoExpandLimit'],
	['面板曲库 - 线条填充', 5, 'verticalPad'],
	['面板曲库 - 线条填充 专辑封面', 2, 'verticalAlbumArtPad'],
	['面板曲库 - 边距', Math.round(SCALE(20) * $Lib.scale), 'margin'],
	['面板曲库 - 边距 覆盖顶部/底部 (无顶部栏)', Math.round(8 * $Lib.scale), 'marginTopBottom'],
	['面板曲库 - 中键-点击激活', 1, 'mbtnClickAction'],
	['面板曲库 - 鼠标: 始终指针 (无手形形状)', true, 'mousePointerOnly'],
	
	['面板曲库 - 节点: 自动折叠', false, 'autoCollapse'],
	['面板曲库 - 节点: 悬停时高亮', true, 'highLightNode'],
	['面板曲库 - 节点: 项目计数右对齐', true, 'countsRight'],
	['面板曲库 - 节点: 项目计数 隐藏-0 音轨-1 子项-2', 1, 'nodeCounts'],
	['面板曲库 - 节点: 根 隐藏-0 全部音乐-1 查看模式-2', 3, 'rootNode'],
	['面板曲库 - 节点: 根 内联样式', true, 'inlineRoot'],
	['面板曲库 - 节点: 根 显示来源', false, 'showSource'],
	['面板曲库 - 节点: 显示线条', true, 'nodeLines'],
	['面板曲库 - 节点: 显示音轨', true, 'showTracks'],
	['面板曲库 - 节点: 样式', 5, 'nodeStyle'],
	['面板曲库 - 节点 [方形]: Windows', false, 'winNode'],
	['面板曲库 - 节点 自定义图标: +|-', `${RebornSymbols.ArrowRight2}|${RebornSymbols.ArrowDown2}`, 'iconCustom'],
	['面板曲库 - 节点 自定义图标: 垂直偏移量 (%)', -2, 'iconVerticalPad'],
																							
	['面板曲库 - 当前播放 高亮', true, 'highLightNowplaying'],
	['面板曲库 - 当前播放 高亮 最近', false, 'highLightNowplayinglast'],
	['面板曲库 - 当前播放 指示', false, 'nowPlayingIndicator'],
	['面板曲库 - 当前播放 指示 最近', false, 'nowPlayingIndicatorLast'],
	['面板曲库 - 当前播放 侧标', false, 'nowPlayingSidemarker'],
	['面板曲库 - 当前播放 侧标 最近', false, 'nowPlayingSidemarkerLast'],

	['面板曲库 - Enter 或从菜单发送时播放', true, 'autoPlay'],
	['面板曲库 - 播放列表: 自定义排序', '', 'customSort'],
	['面板曲库 - 播放列表: 默认', '曲库查看', 'libPlaylist'],
	['面板曲库 - 播放列表: 默认更改时激活', true, 'activateOnChange'],
	['面板曲库 - 播放列表: 面板选择', '库树面板选择', 'panelSelectionPlaylist'],
	['面板曲库 - 播放列表: 上一个面板选择', '库树面板选择', 'lastPanelSelectionPlaylist'],
	['面板曲库 - 播放列表: 发送到当前', false, 'sendToCur'],
	['面板曲库 - 删除或后移的前缀 (| 分隔符)', 'A|The', 'prefix'],
	['面板曲库 - 预设: 加载当前查看', true, 'presetLoadCurView'],
	['面板曲库 - 记住.预搜索', true, 'rememberPreSearch'],
	['面板曲库 - 记住.进程', false, 'process'],
	['面板曲库 - 记住.树', true, 'rememberTree'],
	['面板曲库 - 记住.查看', false, 'rememberView'],
	['面板曲库 - 重置树', false, 'reset'],
	['面板曲库 - 行条纹', false, 'rowStripes'],

	['面板曲库 - 滚动 行数 0-10 (0 = 页面)', 3, 'scrollStep'],
	['面板曲库 - 滚动 平滑持续时间 0-5000 毫秒 (Max)', 500, 'durationScroll'],
	['面板曲库 - 滚动 触摸滑动距离 0-10', 0.8, 'flickDistance'],
	['面板曲库 - 滚动 触摸滑动持续时间 0-5000 毫秒 (Max)', 3000, 'durationTouchFlick'],
	['面板曲库 - 滚动: 平滑滚动', true, 'smooth'],
	['面板曲库 - 滚动条 箭头自定义图标', RebornSymbols.ArrowUp4, 'arrowSymbol'],
	['面板曲库 - 滚动条 箭头自定义图标: 垂直偏移量 (%)', -24, 'sbarButPad'],
	['面板曲库 - 滚动条 箭头宽度', Math.round(11 * $Lib.scale), 'sbarArrowWidth'],
	['面板曲库 - 滚动条 按钮样式', 0, 'sbarButType'],
	['面板曲库 - 滚动条 颜色 灰色-0 融合-1', 1, 'sbarCol'],
	['面板曲库 - 滚动条 滑块最小高度', Math.round(SCALE(20) * $Lib.scale), 'sbarGripHeight'],
	['面板曲库 - 滚动条 首选全高', true, 'sbarFullHeight'],
	['面板曲库 - 滚动条 滑道宽度 (0 = 自动)', 0, 'narrowSbarWidth'],
	['面板曲库 - 滚动条 填充', 0, 'sbarPad'],
	['面板曲库 - 滚动条 显示', 1, 'sbarShow'],
	['面板曲库 - 滚动条 样式 默认-0 样式-1 Windows-2', 1, 'sbarType'],
	['面板曲库 - 滚动条 宽度', Math.round(11 * $Lib.scale), 'sbarWidth'],
	['面板曲库 - 滚动条 滑块宽度', 11, 'sbarBase_w'],
	['面板曲库 - 滚动条 Windows 指标', false, 'sbarWinMetrics'],

	['面板曲库 - 搜索 Enter', false, 'searchEnter'],
	['面板曲库 - 搜索 历史', JSON.stringify([]), 'searchHistory'],
	['面板曲库 - 搜索 发送', 1, 'searchSend'],																		   

	['面板曲库 - 显示过滤器', true, 'filterShow'],
	['面板曲库 - 显示面板来源信息', true, 'panelSourceMsg'],
	['面板曲库 - 显示搜索', true, 'searchShow'],
	['面板曲库 - 显示设置', true, 'settingsShow'],
	['面板曲库 - 侧标宽度', 0, 'sideMarkerWidth'],
	['面板曲库 - 单击操作', 0, 'clickAction'],
	['面板曲库 - 排序', 0, 'sortOrder'],

	['面板曲库 - 统计 显示', 0, 'itemShowStatistics'],
	['面板曲库 - 统计 显示最近', 0, 'itemShowStatisticsLast'],
	['面板曲库 - 统计 标签显示', true, 'labelStatistics'],
	['面板曲库 - 统计 标题格式 添加时间', '[$date(%added%)]', 'tfAdded'],
	['面板曲库 - 统计 标题格式 日期', '[$year(%date%)]', 'tfDate'],
	['面板曲库 - 统计 标题格式 首次播放', '[$date(%first_played%)]', 'tfFirstPlayed'],
	['面板曲库 - 统计 标题格式 最近播放', '[$date(%last_played%)]', 'tfLastPlayed'],
	['面板曲库 - 统计 标题格式 播放计数 数据固定方案|字段', '%path%|%play_count%|%lastfm_play_count%', 'tfPc'],
	['面板曲库 - 统计 标题格式 等级', '[%rating%]', 'tfRating'],
	['面板曲库 - 统计 标题格式 热门', '[$meta(Track Statistics Last.fm,5[score])]', 'tfPopularity'],
	['面板曲库 - 统计 提示框显示', true, 'tooltipStatistics'],

	['面板曲库 - 主题', 0, 'theme'],
	['面板曲库 - 主题 面板来源使用接收的项目图片', false, 'recItemImage'],
	['面板曲库 - 主题 背景图片', false, 'themeBgImage'],
	['面板曲库 - 主题 颜色', 3, 'themeColour'],
	['面板曲库 - 主题 浅色', false, 'themeLight'],
	['面板曲库 - 主题特定', false, 'themed'], // reserved: don't enable
	['面板曲库 - 触摸行数 1-10', 1, 'touchStep'],
	['面板曲库 - 树 自动展开', false, 'treeAutoExpand'],
	['面板曲库 - 树 自动展开单个项目', true, 'treeAutoExpandSingle'],
	['面板曲库 - 树 缩进', Math.round(19 * $Lib.scale), 'treeIndent'],
	['面板曲库 - 触摸控制', false, 'touchControl'],
	['面板曲库 - 查看按', 1, 'viewBy'],
	['面板曲库 - 查看按 文件夹隐藏', '', 'viewByFolderHide'],
	['面板曲库 - 查看按 专辑封面', 0, 'albumArtViewBy'],
	['面板曲库 - 查看按 树', 0, 'treeViewBy'],
	['面板曲库 - 缩放 过滤器大小 (%)', 100, 'zoomFilter'],
	['面板曲库 - 缩放 字体大小 (%)', 100, 'zoomFont'],
	['面板曲库 - 缩放 节点大小 (%)', 100, 'zoomNode'],
	['面板曲库 - 缩放 图片大小 (%)', 100, 'zoomImg'],
	['面板曲库 - 缩放 提示框 [按钮] (%)', 100, 'zoomTooltipBut']
];

/**
 * The instance of `PanelPropertiesLib` class for library panel property settings.
 * @typedef {LibPanelProperties}
 * @global
 */
const libSet = new LibPanelProperties();
libSet.init('auto', libProperties);
if (!$Lib.file('C:\\check_local\\1450343922.txt')) libSet.themed = false;

if (libSet.get('面板曲库 - 树列表查看')) {
	libSet.facetView = libSet.get('面板曲库 - 树列表查看');
	libSet.set('面板曲库 - 树列表查看', null);
}
libSet.set('面板曲库 - 图片 预-加载磁盘缓存图片', null);
libSet.set('面板曲库 - 图片 根 折叠', null);
libSet.set('面板曲库 - 图片 显示索引编号', null);
libSet.set('面板曲库 - 图片 显示索引年份自动', null);
libSet.set('面板曲库 - 节点: 项目显示持续时间', null);
libSet.set('面板曲库 - 节点 [方形]: Windows 0 or 1', null);
libProperties = undefined;
