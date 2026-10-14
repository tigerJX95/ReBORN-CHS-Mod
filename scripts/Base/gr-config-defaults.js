//////////////////////////////////////////////////////////////////////
// * Georgia-ReBORN: 一个简洁、全动态的颜色重生 foobar2000 播放器 * //
// * 类型:           Georgia-ReBORN 配置默认值                    * //
// * 作者:           TT                                           * //
// * 网站:           https://github.com/TT-ReBORN/Georgia-ReBORN  * //
// * 版本:           3.0-x64-DEV                                  * //
// * 开发开始:       22-12-2017                                   * //
// * 最后更改:       16-07-2026                                   * //
// * 汉化:           风里闲                                       * //
//////////////////////////////////////////////////////////////////////


'use strict';


///////////////////////////////////
// ! GEORGIA-REBORN-配置默认值 ! //
///////////////////////////////////
// * 此文件包含将写入配置文件的对象的各种定义、默认值和模式。
// * 此处定义的任何值都将写入配置 （尽管其中一些对象将在 gr-settings 中使用未保存的值进行修改）。
// ! 不要编辑：编辑这些值可能不会为您提供预期的结果，因为它们可能不会存储在配置中。
// ! 注意：如果您希望对此进行更改，请在 georgia-reborn-config.jsonc 和 georgia-reborn-custom.jsonc 文件中进行编辑，而不要在此处。


/**
 * 一个读取并存储所有主题默认配置设置的集。
 */
class ConfigDefaults {
	/**
	 * 创建 `ConfigDefaults` 实例。
	 * 实例化所有配置默认设置。
	 */
	constructor() {
		// * 标题格式字符串 * //
		// #区域 标题格式字符串
		/** @public @type {object} 指定标题格式字符串。 */
		this.titleFormatDefaults = {
			album_subtitle: '%albumsubtitle%',
			album_translation: '%albumtranslation%',
			artist_country: '%artistcountry%',
			artist: '$if3($meta(artist),%composer%,%performer%,%album artist%)',
			date: '$if3(%original release date%,%originaldate%,%date%,%fy_upload_date%,)',
			disc_subtitle: '%discsubtitle%',
			disc: '$ifgreater(%totaldiscs%,1,$if($or($if2(%vinylside%,%vinyl side%),$strcmp($lower($if3(%media%,%mediatype%,%media type%)),vinyl)),唱片 %discnumber%/%totaldiscs%,CD %discnumber%/%totaldiscs%),)',
			edition: '[$if2($if(%original release date%,$ifequal($year(%original release date%),$year(%date%),,$year(%date%) ))$if2(%edition%,\'发行\'),$if(%originaldate%,$ifequal($year(%originaldate%),$year(%date%),,$year(%date%) ))$if2(%edition%,\'发行\'))]',
			last_played: '[$if2(%last_played_enhanced%,%last_played%)]',
			lyrics: '[$if3(%synced lyrics%,%syncedlyrics%,%lyrics%,%lyric%,%unsyncedlyrics%,%unsynced lyrics%,)]',
			original_artist: '[ \'(\'%original artist%\' cover)\']',
			composer: '[\' -\' %composer% \' \']',
			releaseCountry: '$replace($if3(%releasecountry%,%discogs_country%,),AF,XW)',
			title: '%title%[ \'[\'%translation%\']\']',
			tracknum: '[%tracknumber%.]',
			vinyl_side: '$if2(%vinylside%,%vinyl side%)',
			vinyl_tracknum: '$if2(%vinyltracknumber%,%vinyl tracknumber%)',
			vinyl_track: '$if2([$if2(%vinylside%,%vinyl side%)][$if2(%vinyltracknumber%,%vinyl tracknumber%)]. ,[%tracknumber%. ])',
			year: '[$year($if3(%original release date%,%originaldate%,%date%,%fy_upload_date%,))]',
			playing_playlist: '请勿更改此值，因为它由主题自行处理'
		};

		/** @public @type {object} 标题格式化配置名称描述。 */
		this.titleFormatComments = {
			artist_country: '仅用于显示艺术家旗帜。',
			date: '为音轨存储完整日期',
			lyrics: '如果没有找到本地歌词文件，gr-lyrics.js 将按顺序检查这些字段。',
			releaseCountry: '从 Musicbrainz 发布的带有 AF（阿富汗）发行国家标签的版本几乎总是全世界的版本，每个国家都单独列出，因此替换为\'XW\'（全球）标签。',
			title: '进度条上方显示音轨标题',
			vinyl_side: '用于确定音轨在黑胶版本中出现在哪一面 - 例如 歌曲 A1 的 %vinylside% 或 %vinyl side% 为 "A"',
			vinyl_tracknum: '用于确定黑胶版本上的音轨编号 - 例如歌曲 A1 的 %vinyltracknumber% 或 %vinyl tracknumber% 设置为 "1"',
			year: '仅任何存储日期的年份部分。'
		};

		/** @public @type {object} 标题格式化配置标题说明。 */
		this.titleFormatSchema = new ConfigurationObjectSchema('title_format_strings', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 标题格式字符串:                                                                                                                                                                                       ' +
			'* 用于各个方面的显示。不要更改键名称或添加新的键名称。                                                                                                                                                  ' +
			'* 注意:如果使用顶部菜单选项 > 设置 > 主题配置 > 保存设置到配置文件，则不会自动设置这些设置                                                                                                              ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * ARTWORK 图像格式 * //
		// #region ARTWORK IMAGE FORMATS
		/** @public @type {object} Allowed artwork image formats. */
		this.artworkImageFormatsDefaults = {
			albumArt: `${Regex.ArtAlbumArtExtensions}`,
			bgImage: `${Regex.ArtAlbumArtExtensions}`
		};

		/** @public @type {object} Artwork file formats config name description. */
		this.artworkImageFormatsComments = {
			albumArt: '定义专辑封面的允许图像格式。例如： "jpg|png|webp" 允许 JPEG, PNG, 和 WEBP 格式.',
			bgImage: '定义背景图像的允许图像格式。例如： "jpg|png|webp" 允许 JPEG, PNG, 和 WEBP 格式.'
		};

		/** @public @type {object} Artwork file formats config header description. */
		this.artworkImageFormatsSchema = new ConfigurationObjectSchema('artworkImageFormats', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* ARTWORK 图像格式:                                                                                                                                                                                     ' +
			'* 您可以根据自己的要求指定要包含或排除的文件类型。                                                                                                                                                      ' +
			'* 这些允许的图像格式将显示在大的封面面板中，并作为背景图像显示。                                                                                                                                        ' +
			'* 注意：如果您使用顶部菜单“选项”>“设置”>“主题配置”>“将设置保存到配置文件”，则不会自动设置此设置。                                                                                                       ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 图片模式 * //
		// #region ARTWORK PATTERNs
		/** @public @type {object} 图片模式用于过滤专辑图片. */
		this.artworkPatternsDefaults = {
			albumArt: `!${Regex.ArtDiscArtFilename}`,
			playlistBgAlbumArt: `!${Regex.ArtDiscArtFilename}`,
			libraryBgAlbumArt: `!${Regex.ArtDiscArtFilename}`,
			biographyBgAlbumArt: `!${Regex.ArtDiscArtFilename}`,
			lyricsBgAlbumArt: `!${Regex.ArtDiscArtFilename}`
		};

		/** @public @type {object} 图片模式配置名称说明. */
		this.artworkPatternsComments = {
			albumArt: '图片 "!/(cd|disc|vinyl)([0-9]*|[a-h])\\.(png|jpg)/i" 或包括 "/(artist)\\.(jpg|png)$/i" 将从专辑图片中排除.',
			playlistBgAlbumArt: '图片 "!/(cd|disc|vinyl)([0-9]*|[a-h])\\.(png|jpg)/i" 或包括 "/(artist)\\.(jpg|png)$/i" 将从播放列表背景专辑图片中排除.',
			libraryBgAlbumArt: '图片 "!/(cd|disc|vinyl)([0-9]*|[a-h])\\.(png|jpg)/i" 或包括 "/(artist|cover)\\.(jpg|png)$/i" 将从曲库背景专辑图片中排除.',
			biographyBgAlbumArt: '图片 "!/(cd|disc|vinyl)([0-9]*|[a-h])\\.(png|jpg)/i" 或包括 "/(artist|cover)\\.(jpg|png)$/i" 将从简介背景专辑图片中排除.',
			lyricsBgAlbumArt: '图片 "!/(cd|disc|vinyl)([0-9]*|[a-h])\\.(png|jpg)/i" 或包括 "/(artist|cover|folder)\\.(jpg|png)$/i" 将从歌词背景专辑图片中排除.'
		};

		/** @public @type {object} 图片模式配置页眉说明. */
		this.artworkPatternsSchema = new ConfigurationObjectSchema('artworkPatterns', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 图片模式:                                                                                                                                                                                             ' +
			'* 您可以使用正则表达式模式排除特定的专辑图像，也可以使用包含模式仅显示特定的专辑图片。                                                                                                                  ' +
			'* 使用“选项”>“播放控制”>“专辑封面”>“过滤专辑图片”时，“专辑封面（albumArt）”模式处理左侧大的专辑封面显示。                                                                                               ' +
			'* “playlistBgAlbumArt”、“libraryBgAlbum art”和“lyricsBgAlbumArt”模式处理背景图像专辑封面。                                                                                                              ' +
			'* 根据需要调整图案，以匹配专辑封面文件的命名约定。                                                                                                                                                      ' +
			'* 注意：如果您使用顶部菜单“选项”>“设置”>“主题配置”>“保存设置到配置文件”，则不会自动设置此设置。                                                                                                         ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 封面图像路径 * //
		// #region ARTWORK IMAGE PATHS
		/** @public @type {array} 封面图像路径加载顺序 - 根据需要添加、更改或重新排序条目。 */
		this.imgPathDefaults = [
			// * 1. 音轨自己的目录（单碟的专辑根目录，盒装的CDn子文件夹）
			'$directory_path(%path%)\\folder*',
			'$directory_path(%path%)\\cover*',
			'$directory_path(%path%)\\front*',
			'$directory_path(%path%)\\*.*',
			
			// * 父目录中的所有文件夹图片
			'$replace(%path%,%directoryname%\\%filename_ext%,)folder*',
			'$replace(%path%,%directoryname%\\%filename_ext%,)cover*',
			'$replace(%path%,%directoryname%\\%filename_ext%,)front*',
			'$replace(%path%,%directoryname%\\%filename_ext%,)*.*',
			// * 2. 音轨自己的目录内包含的 Artwork, Scans 等文件夹 (使用CDn文件夹时为单张光盘或每张光盘子文件夹)
			'$directory_path(%path%)\\Artwork\\folder*',
			'$directory_path(%path%)\\Artwork\\cover*',
			'$directory_path(%path%)\\Artwork\\front*',
			'$directory_path(%path%)\\Artwork\\*.*',
			'$directory_path(%path%)\\Scans\\folder*',
			'$directory_path(%path%)\\Scans\\cover*',
			'$directory_path(%path%)\\Scans\\front*',
			'$directory_path(%path%)\\Scans\\*.*',
			'$directory_path(%path%)\\Covers\\folder*',
			'$directory_path(%path%)\\Covers\\cover*',
			'$directory_path(%path%)\\Covers\\front*',
			'$directory_path(%path%)\\Covers\\*.*',
			'$directory_path(%path%)\\Booklet\\folder*',
			'$directory_path(%path%)\\Booklet\\cover*',
			'$directory_path(%path%)\\Booklet\\front*',
			'$directory_path(%path%)\\Booklet\\*.*',
			'$directory_path(%path%)\\Images\\folder*',
			'$directory_path(%path%)\\Images\\cover*',
			'$directory_path(%path%)\\Images\\front*',
			'$directory_path(%path%)\\Images\\*.*',
			
			// * 其他子文件夹中的 Artwork, Scans，Covers, Booklet，Images ( 多 碟片 )
			'$directory_path(%path%)\\..\\Artwork\\folder*',
			'$directory_path(%path%)\\..\\Artwork\\cover*',
			'$directory_path(%path%)\\..\\Artwork\\front*',
			'$directory_path(%path%)\\..\\Artwork\\*.*',
			'$directory_path(%path%)\\..\\Scans\\folder*',
			'$directory_path(%path%)\\..\\Scans\\cover*',
			'$directory_path(%path%)\\..\\Scans\\front*',
			'$directory_path(%path%)\\..\\Scans\\*.*',
			'$directory_path(%path%)\\..\\Covers\\folder*',
			'$directory_path(%path%)\\..\\Covers\\cover*',
			'$directory_path(%path%)\\..\\Covers\\front*',
			'$directory_path(%path%)\\..\\Covers\\*.*',
			'$directory_path(%path%)\\..\\Booklet\\folder*',
			'$directory_path(%path%)\\..\\Booklet\\cover*',
			'$directory_path(%path%)\\..\\Booklet\\front*',
			'$directory_path(%path%)\\..\\Booklet\\*.*',
			'$directory_path(%path%)\\..\\Images\\folder*',
			'$directory_path(%path%)\\..\\Images\\cover*',
			'$directory_path(%path%)\\..\\Images\\front*',
			'$directory_path(%path%)\\..\\Images\\*.*',
			'.\\cache\\artwork\\local\\artists\\%artist%\\*'	// * 显示简介下载的艺术家图片
		];

		/** @public @type {object} Artwork image paths 配置页眉说明。 */
		this.imgPathSchema = new ConfigurationObjectSchema('imgPaths', ConfigurationObjectType.Array, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 专辑图片图像路径:                                                                                                                                                                                     ' +
			'* 标题格式定义了要显示的图片路径。匹配的第一张图片将首先显示。                                                                                                                                          ' +
			'* 根据需要重新排列、添加或删除。文件夹分隔符必须是双斜杠。                                                                                                                                              ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置> 保存设置到配置文件，则不会自动设置此设置                                                                                                                ' +
			'* 性能说明：添加更多路径会影响性能。如果你的音乐收藏一直使用特定的文件夹来存放专辑图片，可以考虑删除不必要的路径来优化性能。                                                                            ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * DISC ART IMAGE PATHS * //
		// #region DISC ART IMAGE PATHS
		/** @public @type {array} 碟片图像路径加载顺序 - 根据需要添加、更改或重新排序条目。*/
		this.discArtPathDefaults = [
			// * 1. 音轨自己的目录 (使用CDn文件夹时为单个光盘或每个光盘子文件夹)
			'$directory_path(%path%)\\*cd$ifgreater(%totaldiscs%,1,%discnumber%,).png',
			'$directory_path(%path%)\\*cd$ifgreater(%totaldiscs%,1,$num(%discnumber%,2),).png',
			'$directory_path(%path%)\\*cd.png',
			'$directory_path(%path%)\\*vinyl$if2($if2(%vinylside%,%vinyl side%),).png',
			'$directory_path(%path%)\\*vinyl.png',

			// * 2. Artwork, Scans 等文件夹在音轨自己的目录内(使用CDn文件夹时为单张光盘或每张光盘子文件夹)
			'$directory_path(%path%)\\Artwork\\*cd$ifgreater(%totaldiscs%,1,%discnumber%,).png',
			'$directory_path(%path%)\\Artwork\\*cd$ifgreater(%totaldiscs%,1,$num(%discnumber%,2),).png',
			'$directory_path(%path%)\\Artwork\\*cd.png',
			'$directory_path(%path%)\\Artwork\\*vinyl$if2($if2(%vinylside%,%vinyl side%),).png',
			'$directory_path(%path%)\\Artwork\\*vinyl.png',
			'$directory_path(%path%)\\Scans\\*cd$ifgreater(%totaldiscs%,1,%discnumber%,).png',
			'$directory_path(%path%)\\Scans\\*cd$ifgreater(%totaldiscs%,1,$num(%discnumber%,2),).png',
			'$directory_path(%path%)\\Scans\\*cd.png',
			'$directory_path(%path%)\\Scans\\*vinyl$if2($if2(%vinylside%,%vinyl side%),).png',
			'$directory_path(%path%)\\Scans\\*vinyl.png',
			'$directory_path(%path%)\\Covers\\*cd$ifgreater(%totaldiscs%,1,%discnumber%,).png',
			'$directory_path(%path%)\\Covers\\*cd$ifgreater(%totaldiscs%,1,$num(%discnumber%,2),).png',
			'$directory_path(%path%)\\Covers\\*cd.png',
			'$directory_path(%path%)\\Covers\\*vinyl$if2($if2(%vinylside%,%vinyl side%),).png',
			'$directory_path(%path%)\\Covers\\*vinyl.png',
			'$directory_path(%path%)\\Booklet\\*cd$ifgreater(%totaldiscs%,1,%discnumber%,).png',
			'$directory_path(%path%)\\Booklet\\*cd$ifgreater(%totaldiscs%,1,$num(%discnumber%,2),).png',
			'$directory_path(%path%)\\Booklet\\*cd.png',
			'$directory_path(%path%)\\Booklet\\*vinyl$if2($if2(%vinylside%,%vinyl side%),).png',
			'$directory_path(%path%)\\Booklet\\*vinyl.png',
			'$directory_path(%path%)\\Images\\*cd$ifgreater(%totaldiscs%,1,%discnumber%,).png',
			'$directory_path(%path%)\\Images\\*cd$ifgreater(%totaldiscs%,1,$num(%discnumber%,2),).png',
			'$directory_path(%path%)\\Images\\*cd.png',
			'$directory_path(%path%)\\Images\\*vinyl$if2($if2(%vinylside%,%vinyl side%),).png',
			'$directory_path(%path%)\\Images\\*vinyl.png',
			
			// * 其他子文件夹中的 Artwork, Scans ( 多碟 )
			'$directory_path(%path%)\\..\\Artwork\\*cd.png',
			'$directory_path(%path%)\\..\\Artwork\\*cd$ifgreater(%totaldiscs%,1,%discnumber%,).png',
			'$directory_path(%path%)\\..\\Artwork\\*cd$ifgreater(%totaldiscs%,1,$num(%discnumber%,2),).png',
			'$directory_path(%path%)\\..\\Artwork\\*vinyl.png',
			'$directory_path(%path%)\\..\\Artwork\\*vinyl$if2(%vinyl side%,).png',
			'$directory_path(%path%)\\..\\Scans\\*cd.png',
			'$directory_path(%path%)\\..\\Scans\\*cd$ifgreater(%totaldiscs%,1,%discnumber%,).png',
			'$directory_path(%path%)\\..\\Scans\\*cd$ifgreater(%totaldiscs%,1,$num(%discnumber%,2),).png',
			'$directory_path(%path%)\\..\\Scans\\*vinyl.png',
			'$directory_path(%path%)\\..\\Scans\\*vinyl$if2(%vinyl side%,).png',
			'$directory_path(%path%)\\..\\Covers\\*cd.png',
			'$directory_path(%path%)\\..\\Covers\\*cd$ifgreater(%totaldiscs%,1,%discnumber%,).png',
			'$directory_path(%path%)\\..\\Covers\\*cd$ifgreater(%totaldiscs%,1,$num(%discnumber%,2),).png',
			'$directory_path(%path%)\\..\\Covers\\*vinyl.png',
			'$directory_path(%path%)\\..\\Covers\\*vinyl$if2(%vinyl side%,).png',
			'$directory_path(%path%)\\..\\Booklet\\*cd.png',
			'$directory_path(%path%)\\..\\Booklet\\*cd$ifgreater(%totaldiscs%,1,%discnumber%,).png',
			'$directory_path(%path%)\\..\\Booklet\\*cd$ifgreater(%totaldiscs%,1,$num(%discnumber%,2),).png',
			'$directory_path(%path%)\\..\\Booklet\\*vinyl.png',
			'$directory_path(%path%)\\..\\Booklet\\*vinyl$if2(%vinyl side%,).png',
			'$directory_path(%path%)\\..\\Images\\*cd.png',
			'$directory_path(%path%)\\..\\Images\\*cd$ifgreater(%totaldiscs%,1,%discnumber%,).png',
			'$directory_path(%path%)\\..\\Images\\*cd$ifgreater(%totaldiscs%,1,$num(%discnumber%,2),).png',
			'$directory_path(%path%)\\..\\Images\\*vinyl.png',
			'$directory_path(%path%)\\..\\Images\\*vinyl$if2(%vinyl side%,).png'
		];

		/** @public @type {object} Disc art image paths config header description. */
		this.discArtPathSchema = new ConfigurationObjectSchema('discArtPaths', ConfigurationObjectType.Array, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 碟片图像路径:                                                                                                                                                                                         ' +
			'* 标题格式定义了要显示的碟片的路径。匹配的第一张图片将首先显示。                                                                                                                                        ' +
			'* 根据需要重新排列、添加或删除。文件夹分隔符必须是双斜杠。                                                                                                                                              ' +
			'* 注意：如果您使用顶部菜单 选项 > 设置 > 主题配置 > 将设置保存到配置文件，则不会自动设置此设置                                                                                                          ' +
			'* 性能说明：添加更多路径会影响性能。如果你的音乐收藏一直使用特定的文件夹来存放专辑图片，可以考虑删除不必要的路径来优化性能。                                                                            ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * DESIGN * //
		// #region DESIGN
		/** @public @type {object} Options > Design settings with default value. */
		this.designDefaults = {
			design: 'reborn'
		};

		/** @public @type {object} Options > Theme settings config name description. */
		this.designComments = {
			design: 'Values: "default", "clean", "harmonic", "minimal", "modern_black", "modern_white", "modern_day_night", "reborn" - Options > Design'
		};

		/** @public @type {object} Options > Design settings config header description. */
		this.designSchema = new ConfigurationObjectSchema('design', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 方案:                                                                                                                                                                                                 ' +
			'* 顶部菜单 选项 > 方案                                                                                                                                                                                  ' +
			'* 您可以在 7 个可用的预定义方案中进行设置和选择。                                                                                                                                                       ' +
			'* 注意：如果您使用顶部菜单 选项 > 设置 > 主题配置 > 将设置保存到配置文件，则此设置将自动设置                                                                                                            ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 主题 * //
		// #region THEME
		/** @public @type {object} 选项 > 主题 设置使用默认值 */
		this.themeDefaults = {
			theme: 'reborn',
			theme_day: 'white',
			theme_night: 'black'
		};

		/** @public @type {object} 选项 > 主题 设置配置名称说明。 */
		this.themeComments = {
			theme: 'Values: "white", "black", "reborn", "random", "blue", "darkblue", "red", "cream", "nblue", "ngreen", "nred", "ngold", "custom01-custom10" - Options > Theme',
			theme_day: 'Values: "white", "black", "reborn", "random", "blue", "darkblue", "red", "cream", "nblue", "ngreen", "nred", "ngold", "custom01-custom10" - Options > Theme - daytime theme',
			theme_night: 'Values: "white", "black", "reborn", "random", "blue", "darkblue", "red", "cream", "nblue", "ngreen", "nred", "ngold", "custom01-custom10" - Options > Theme - nighttime theme'
		};

		/** @public @type {object} 选项 > 主题 设置配置页眉说明。 */
		this.themeSchema = new ConfigurationObjectSchema('theme', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 主题:                                                                                                                                                                                                 ' +
			'* 顶部菜单选项 > 主题                                                                                                                                                                                   ' +
			'* 您可以在将要使用的12个可用主题之间进行设置和选择.                                                                                                                                                     ' +
			'* 如果您选择启用谐波模式，一旦谐波模式再次停用，您选择的主题将被覆盖.                                                                                                                                   ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，则会自动设置此设置                                                                                                                 ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 样式 * //
		// #region STYLE
		/** @public @type {object} 选项 > 样式 默认值设置 */
		this.themeStyleDefaults = {
			default: true,
			nighttime: false,
			bevel: false,
			blend: false,
			blend2: false,
			gradient: false,
			gradient2: false,
			alternative: false,
			alternative2: false,
			blackAndWhite: false,
			blackAndWhite2: false,
			blackAndWhiteReborn: false,
			blackReborn: false,
			rebornWhite: false,
			rebornBlack: false,
			rebornFusion: false,
			rebornFusion2: false,
			rebornFusionAccent: false,
			randomPastel: false,
			randomDark: false,
			randomAutoColor: 'off',
			topMenuButtons: 'default',
			transportButtons: 'default',
			progressBarDesign: 'default',
			progressBar: 'default',
			progressBarFill: 'default',
			volumeBarDesign: 'default',
			volumeBar: 'default',
			volumeBarFill: 'default',
			nighttime_day: false,
			bevel_day: false,
			blend_day: false,
			blend2_day: false,
			gradient_day: false,
			gradient2_day: false,
			alternative_day: false,
			alternative2_day: false,
			blackAndWhite_day: false,
			blackAndWhite2_day: false,
			blackAndWhiteReborn_day: false,
			blackReborn_day: false,
			rebornWhite_day: false,
			rebornBlack_day: false,
			rebornFusion_day: false,
			rebornFusion2_day: false,
			rebornFusionAccent_day: false,
			randomPastel_day: false,
			randomDark_day: false,
			randomAutoColor_day: 'off',
			topMenuButtons_day: 'default',
			transportButtons_day: 'default',
			progressBarDesign_day: 'default',
			progressBar_day: 'default',
			progressBarFill_day: 'default',
			volumeBarDesign_day: 'default',
			volumeBar_day: 'default',
			volumeBarFill_day: 'default',
			nighttime_night: false,
			bevel_night: false,
			blend_night: false,
			blend2_night: false,
			gradient_night: false,
			gradient2_night: false,
			alternative_night: false,
			alternative2_night: false,
			blackAndWhite_night: false,
			blackAndWhite2_night: false,
			blackAndWhiteReborn_night: false,
			blackReborn_night: false,
			rebornWhite_night: false,
			rebornBlack_night: false,
			rebornFusion_night: false,
			rebornFusion2_night: false,
			rebornFusionAccent_night: false,
			randomPastel_night: false,
			randomDark_night: false,
			randomAutoColor_night: 'off',
			topMenuButtons_night: 'default',
			transportButtons_night: 'default',
			progressBarDesign_night: 'default',
			progressBar_night: 'default',
			progressBarFill_night: 'default',
			volumeBarDesign_night: 'default',
			volumeBar_night: 'default',
			volumeBarFill_night: 'default'
		};

		/** @public @type {object} 选项 > 样式 设置配置名称说明。 */
		this.themeStyleComments = {
			default: 'Values: true, false - 可用于所有主题',
			nighttime: 'Values: true, false - 特殊样式只能与重生、随机、自定义主题一起使用',
			bevel: 'Values: true, false - 可用于所有主题',
			blend: 'Values: true, false - 可用于所有主题',
			blend2: 'Values: true, false - 可用于所有主题',
			gradient: 'Values: true, false - 只能用于重生、随机、蓝色、深蓝、红色主题',
			gradient2: 'Values: true, false - 只能用于重生、随机、蓝色、深蓝、红色主题',
			alternative: 'Values: true, false - 可以用于所有主题，但不能用于特殊主题样式',
			alternative2: 'Values: true, false - 可以用于所有主题，但不能用于特殊主题样式',
			blackAndWhite: 'Values: true, false - 特殊白色主题样式只能与白色主题一起使用',
			blackAndWhite2: 'Values: true, false - 特殊白色主题样式只能与白色主题一起使用',
			blackAndWhiteReborn: 'Values: true, false - 特殊白色主题样式只能与白色主题一起使用',
			blackReborn: 'Values: true, false - 特殊黑色主题样式只能与黑色主题一起使用',
			rebornWhite: 'Values: true, false - 特殊重生主题样式只能与重生主题一起使用',
			rebornBlack: 'Values: true, false - 特殊重生主题样式只能与重生主题一起使用',
			rebornFusion: 'Values: true, false - 特殊重生样式只能与重生主题一起使用',
			rebornFusion2: 'Values: true, false - 特殊重生样式只能与重生主题一起使用',
			rebornFusionAccent: 'Values: true, false - 特殊重生样式只能与重生主题一起使用',
			randomPastel: 'Values: true, false - 特殊随机主题样式只能与随机主题一起使用',
			randomDark: 'Values: true, false - 特殊随机主题样式只能与随机主题一起使用',
			randomAutoColor: 'Values: "off", 5000, 10000, 15000, 30000, 45000, 60000, 120000, 180000, 240000, 300000, "track" - 只能与随机主题一起使用',
			topMenuButtons: 'Values: "default", "filled", "bevel", "inner", "emboss", "minimal"',
			transportButtons: 'Values: "default", "bevel", "inner", "emboss", "minimal"',
			progressBarDesign: 'Values: "default", "rounded", "lines", "blocks", "dots", "thin"',
			progressBar: 'Values: "default", "bevel", "inner"',
			progressBarFill: 'Values: "default", "bevel", "inner", "blend"',
			volumeBarDesign: 'Values: "default", "rounded"',
			volumeBar: 'Values: "default", "bevel", "inner"',
			volumeBarFill: 'Values: "default", "bevel", "inner"',
			nighttime_day: 'Values: true, false - daytime theme - 特殊样式只能与重生、随机、自定义主题一起使用',
			bevel_day: 'Values: true, false - daytime theme - can be used in all themes',
			blend_day: 'Values: true, false - daytime theme - can be used in all themes',
			blend2_day: 'Values: true, false - daytime theme - can be used in all themes',
			gradient_day: 'Values: true, false - daytime theme - can only be used with reborn, random, blue, darkblue, red theme',
			gradient2_day: 'Values: true, false - daytime theme - can only be used with reborn, random, blue, darkblue, red theme',
			alternative_day: 'Values: true, false - daytime theme - can be used in all themes but not with special styles',
			alternative2_day: 'Values: true, false - daytime theme - can be used in all themes but not with special styles',
			blackAndWhite_day: 'Values: true, false - daytime theme - special white style can only be used with white theme',
			blackAndWhite2_day: 'Values: true, false - daytime theme - special white style can only be used with white theme',
			blackAndWhiteReborn_day: 'Values: true, false - daytime theme - special white style can only be used with white theme',
			blackReborn_day: 'Values: true, false - daytime theme - special black style can only be used with black theme',
			rebornWhite_day: 'Values: true, false - daytime theme - special reborn style can only be used with reborn theme',
			rebornBlack_day: 'Values: true, false - daytime theme - special reborn style can only be used with reborn theme',
			rebornFusion_day: 'Values: true, false - daytime theme - special reborn style can only be used with reborn theme',
			rebornFusion2_day: 'Values: true, false - daytime theme - special reborn style can only be used with reborn theme',
			rebornFusionAccent_day: 'Values: true, false - daytime theme - special reborn style can only be used with reborn theme',
			randomPastel_day: 'Values: true, false - daytime theme - special random style can only be used with random theme',
			randomDark_day: 'Values: true, false - daytime theme - special random style can only be used with random theme',
			randomAutoColor_day: 'Values: "off", 5000, 10000, 15000, 30000, 45000, 60000, 120000, 180000, 240000, 300000, "track" - daytime theme - can only be used with random theme',
			topMenuButtons_day: 'Values: "default", "filled", "bevel", "inner", "emboss", "minimal" - daytime theme',
			transportButtons_day: 'Values: "default", "bevel", "inner", "emboss", "minimal" - daytime theme',
			progressBarDesign_day: 'Values: "default", "rounded", "lines", "blocks", "dots", "thin" - daytime theme',
			progressBar_day: 'Values: "default", "bevel", "inner" - daytime theme',
			progressBarFill_day: 'Values: "default", "bevel", "inner", "blend" - daytime theme',
			volumeBarDesign_day: 'Values: "default", "rounded" - daytime theme',
			volumeBar_day: 'Values: "default", "bevel", "inner" - daytime theme',
			volumeBarFill_day: 'Values: "default", "bevel", "inner" - daytime theme',
			nighttime_night: 'Values: true, false - nighttime theme - special style can only be used with reborn, random, custom theme',
			bevel_night: 'Values: true, false - nighttime theme - can be used in all themes',
			blend_night: 'Values: true, false - nighttime theme - can be used in all themes',
			blend2_night: 'Values: true, false - nighttime theme - can be used in all themes',
			gradient_night: 'Values: true, false - nighttime theme - can only be used with reborn, random, blue, darkblue, red theme',
			gradient2_night: 'Values: true, false - nighttime theme - can only be used with reborn, random, blue, darkblue, red theme',
			alternative_night: 'Values: true, false - nighttime theme - can be used in all themes but not with special styles',
			alternative2_night: 'Values: true, false - nighttime theme - can be used in all themes but not with special styles',
			blackAndWhite_night: 'Values: true, false - nighttime theme - special white style can only be used with white theme',
			blackAndWhite2_night: 'Values: true, false - nighttime theme - special white style can only be used with white theme',
			blackAndWhiteReborn_night: 'Values: true, false - nighttime theme - special white style can only be used with white theme',
			blackReborn_night: 'Values: true, false - nighttime theme - special black style can only be used with black theme',
			rebornWhite_night: 'Values: true, false - nighttime theme - special reborn style can only be used with reborn theme',
			rebornBlack_night: 'Values: true, false - nighttime theme - special reborn style can only be used with reborn theme',
			rebornFusion_night: 'Values: true, false - nighttime theme - special reborn style can only be used with reborn theme',
			rebornFusion2_night: 'Values: true, false - nighttime theme - special reborn style can only be used with reborn theme',
			rebornFusionAccent_night: 'Values: true, false - nighttime theme - special reborn style can only be used with reborn theme',
			randomPastel_night: 'Values: true, false - nighttime theme - special random style can only be used with random theme',
			randomDark_night: 'Values: true, false - nighttime theme - special random style can only be used with random theme',
			randomAutoColor_night: 'Values: "off", 5000, 10000, 15000, 30000, 45000, 60000, 120000, 180000, 240000, 300000, "track" - nighttime theme - can only be used with random theme',
			topMenuButtons_night: 'Values: "default", "filled", "bevel", "inner", "emboss", "minimal" - nighttime theme',
			transportButtons_night: 'Values: "default", "bevel", "inner", "emboss", "minimal" - nighttime theme',
			progressBarDesign_night: 'Values: "default", "rounded", "lines", "blocks", "dots", "thin" - nighttime theme',
			progressBar_night: 'Values: "default", "bevel", "inner" - nighttime theme',
			progressBarFill_night: 'Values: "default", "bevel", "inner", "blend" - nighttime theme',
			volumeBarDesign_night: 'Values: "default", "rounded" - nighttime theme',
			volumeBar_night: 'Values: "default", "bevel", "inner" - nighttime theme',
			volumeBarFill_night: 'Values: "default", "bevel", "inner" - nighttime theme'
		};

		/** @public @type {object} 选项 > 样式 设置配置页眉说明。 */
		this.themeStyleSchema = new ConfigurationObjectSchema('style', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 样式:                                                                                                                                                                                                 ' +
			'* 顶部菜单选项 > 样式                                                                                                                                                                                   ' +
			'* 如果设置样式，则需要设置默认值：false，                                                                                                                                                               ' +
			'* 基本样式 “坡度” 和 “坡度2” 仅支持并可用于再生、随机、蓝色、深蓝和红色主题。                                                                                                                           ' +
			'* 基本样式 “备选” 和 “备选2” 不能与特殊主题样式一起使用。                                                                                                                                               ' +
			'* 特殊样式 "夜间" 只能与“重生”、“随机”、“自定义”主题一起使用。                                                                                                                                          ' +
			'* 特殊样式 “黑白”、“黑白2”和“黑白重生”只能与“白色”主题一起使用。                                                                                                                                        ' +
			'* 特殊样式 “黑重生” 只能与“黑色”主题一起使用。                                                                                                                                                          ' +
			'* 特殊样式 “重生白” 和 "重生黑" 只能与“重生”主题一起使用。                                                                                                                                              ' +
			'* 特殊样式 “随机淡色”、“随机深色” 和 “随机自动颜色” 只能与“随机”主题一起使用。                                                                                                                          ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，这些设置将自动设置                                                                                                                 ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 预设 * //
		// #region PRESET
		/** @public @type {object} 选项 > 预设 设置默认值。 */
		this.themePresetDefaults = {
			selectMode: 'default',
			selectWhitePresets: true,
			selectBlackPresets: true,
			selectRebornPresets: true,
			selectRandomPresets: true,
			selectBluePresets: true,
			selectDarkbluePresets: true,
			selectRedPresets: true,
			selectCreamPresets: true,
			selectNbluePresets: true,
			selectNgreenPresets: true,
			selectNredPresets: true,
			selectNgoldPresets: true,
			selectCustomPresets: true,
			autoRandomMode: 'dblclick',
			indicator: true
		};

		/** @public @type {object} 选项 > 预设 设置配置名称说明。 */
		this.themePresetComments = {
			selectMode: 'Values: "default", "harmonic", "theme" - Options > Preset > Select mode',
			selectWhitePresets: 'Values: true, false - Options > Preset > Select presets > White',
			selectBlackPresets: 'Values: true, false - Options > Preset > Select presets > Black',
			selectRebornPresets: 'Values: true, false - Options > Preset > Select presets > Reborn',
			selectRandomPresets: 'Values: true, false - Options > Preset > Select presets > Random',
			selectBluePresets: 'Values: true, false - Options > Preset > Select presets > Blue',
			selectDarkbluePresets: 'Values: true, false - Options > Preset > Select presets > Dark blue',
			selectRedPresets: 'Values: true, false - Options > Preset > Select presets > Red',
			selectCreamPresets: 'Values: true, false - Options > Preset > Select presets > Cream',
			selectNbluePresets: 'Values: true, false - Options > Preset > Select presets > Neon blue',
			selectNgreenPresets: 'Values: true, false - Options > Preset > Select presets > Neon green',
			selectNredPresets: 'Values: true, false - Options > Preset > Select presets > Neon red',
			selectNgoldPresets: 'Values: true, false - Options > Preset > Select presets > Neon gold',
			selectCustomPresets: 'Values: true, false - Options > Preset > Select presets > Custom theme',
			autoRandomMode: 'Values: "off", 5000, 10000, 15000, 30000, 60000, 300000, 600000, 900000, 1800000, 3600000, "track", "album", "dblclick" - Options > Preset > Auto random',
			indicator: 'Values: true, false - Options > Preset > Indicator'
		};

		/** @public @type {object} 选项 > 预设 设置配置页眉说明。 */
		this.themePresetSchema = new ConfigurationObjectSchema('preset', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 预设:                                                                                                                                                                                                 ' +
			'* 顶部菜单 选项 > 预设                                                                                                                                                                                  ' +
			'* 当使用预设选择模式或预设自动随机模式时，您可以设置预设选择模式和预设自动随机方式，并停用要排除在预设选择中的主题预设.                                                                                 ' +
			'* 如果您选择更改预设选择模式，一旦预设选择模式未设置为“默认”，您的活动主题将被覆盖.                                                                                                                     ' +
			'* 当未设置“双击”时，此行为也适用于预设的自动随机模式.                                                                                                                                                   ' +
			'* 注意：如果您使用顶部菜单“选项”>“设置”>“主题配置”>“保存设置到配置文件”，则会自动设置此设置                                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 颜色 * //
		// #region COLOR
		/** @public @type {object} 选项 > 颜色设置 默认值。 */
		this.themeColorDefaults = {
			albumArtColorExtraction: 1,
			albumArtColorPalette: 'auto',
			albumArtColorSaturation: 100,
			albumArtColorSaturationEyeNightCor: true,
			albumArtColorSaturationEyeSchedule: '0-24',
			chameleon: true,
			chameleonMode: 'full',
			chameleonCycleColor: 'all',
			chameleonCycleTime: 30,
			chameleonDuration: 400,
			chameleonEasing: 'smootherStep',
			chameleonRefreshRate: 33,
			chameleonBitmapUpdateRate: 12
		};

		/** @public @type {object} 选项 > 颜色设置配置名称说明。 */
		this.themeColorComments = {
			albumArtColorExtraction: 'Values: 0, 1 - Options > Color > Album art > Extraction',
			albumArtColorPalette: 'Values: "auto", "monochromatic", "analogous", "splitComplementary", "complementary", "triadic", "tetradic", "distinct", "random" - Options > Color > Album art > Palette',
			albumArtColorSaturation: 'Values: "auto", 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0 - Options > Color > Album art > Saturation > Auto (eye protection mode)',
			albumArtColorSaturationEyeNightCor: 'Values: true, false - Options > Color > Album art > Saturation > Extra correction at night',
			albumArtColorSaturationEyeSchedule: 'Values: "0-24" (always active), or a time range like "20-8" (active 8 PM-8 AM) - Options > Color > Album art > Saturation > Set eye protection custom time range',
			chameleon: 'Values: true, false - Options > Color > Chameleon > Enable chameleon',
			chameleonMode: 'Values: "full", "newAlbumOnly", - Options > Color > Chameleon > Mode',
			chameleonCycleColor: 'Values: "all", "monochromatic", "analogous", "splitComplementary", "complementary", "triadic", "tetradic", "distinct", "random" - Options > Color > Chameleon > Cycle color',
			chameleonCycleTime: 'Values: 5, 10, 15, 20, 30, 45, 60, 120 - Options > Color > Chameleon > Cycle time',
			chameleonDuration: 'Values: 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 - Options > Color > Chameleon > Duration',
			chameleonEasing: 'Values: "linear", "smoothStep", "smootherStep", "easeInOutSine", "easeInOutCubic", "easeOutExpo", "easeInOutExpo", "easeOutBack", "easeInOutElastic" - Options > Color > Chameleon > Easing',
			chameleonRefreshRate: 'Values: 50, 40, 33, 22, 20, 17, 13, 11, 8, 7, 6, 4, 3 - Options > Color > Chameleon > Refresh rate',
			chameleonBitmapUpdateRate: 'Values: 60, 30, 20, 15, 12, 10, 8, 4, 2 - Options > Color > Chameleon > Bitmap update rate'
		};

		/** @public @type {object} Options > Color settings config header description. */
		this.themeColorSchema = new ConfigurationObjectSchema('themeColor', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 颜色:                                                                                                                                                                                                 ' +
			'* 顶部菜单 选项 > 颜色                                                                                                                                                                                  ' +
			'* 您可以在将使用的各种颜色系统设置中进行设置和选择。                                                                                                                                                    ' +
			'* 注意：如果您使用顶部菜单选项>设置>主题配置>将设置保存到配置文件，此设置将自动设置”                                                                                                                    ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 显示 * //
		// #region DISPLAY
		/** @public @type {object} 选项 > 显示设置 默认值。 */
		this.themeDisplayDefaults = {
			resolution: 'HD',
			scaling: 100,
			themeBrightness: 'default',
			themeBrightness_day: 'default',
			themeBrightness_night: 'default'
		};

		/** @public @type {object} Options > 显示设置配置名称说明。 */
		this.themeDisplayComments = {
			resolution: 'Values: "4K", "QHD", "HD" - Options > Display',
			scaling: 'Values: 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150 - Options > Display > Scaling',
			themeBrightness: 'Values: -50, -40, -30, -25, -20, -15, -10, -5, "default", 5, 10, 15, 20, 25, 30, 40, 50 - Options > Display > Brightness',
			themeBrightness_day: 'Values: -50, -40, -30, -25, -20, -15, -10, -5, "default", 5, 10, 15, 20, 25, 30, 40, 50 - Options > Display > Brightness - daytime theme',
			themeBrightness_night: 'Values: -50, -40, -30, -25, -20, -15, -10, -5, "default", 5, 10, 15, 20, 25, 30, 40, 50 - Options > Display > Brightness - nighttime theme'
		};

		/** @public @type {object} Options > 显示设置 配置页眉说明。 */
		this.themeDisplaySchema = new ConfigurationObjectSchema('themeDisplay', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 显示:                                                                                                                                                                                                 ' +
			'* 顶部菜单 选项 > 显示                                                                                                                                                                                  ' +
			'* 您可以在3种可用的分辨率、11种可用的缩放比例以及明度设置中进行设置和选择。                                                                                                                             ' +
			'* 注意：如果您使用顶部菜单“选项”>“设置”>“主题配置”>“将设置保存到配置文件”，则此设置将自动设置                                                                                                           ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * LAYOUT * //
		// #region LAYOUT
		/** @public @type {object} 选项 > 布局 设置使用默认值 */
		this.themeLayoutDefaults = {
			layout: 'default'
		};

		/** @public @type {object} 选项 > 布局 设置配置名称说明。 */
		this.themeLayoutComments = {
			layout: 'Values: "default", "artwork", "compact" - 选项 > 布局'
		};

		/** @public @type {object} 选项 > Layout 设置配置页眉说明。 */
		this.themeLayoutSchema = new ConfigurationObjectSchema('themeLayout', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 布局:                                                                                                                                                                                                 ' +
			'* 顶部菜单 选项 > 布局                                                                                                                                                                                  ' +
			'* 您可以在将要使用的3个可用布局之间进行设置和选择。                                                                                                                                                     ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，则会自动设置此设置                                                                                                                 ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 播放器大小 * //
		// #region PLAYER SIZE
		/** @public @type {object} 选项 > 大小 设置默认值. */
		this.themePlayerSizeDefaults = {
			playerSize: 'small',
			savedWidth_default: 1140,
			savedHeight_default: 730,
			savedWidth_artwork: 526,
			savedHeight_artwork: 686,
			savedWidth_compact: 484,
			savedHeight_compact: 730
		};

		/** @public @type {object} 选项 > 大小 设置配置名称说明。 */
		this.themePlayerSizeComments = {
			playerSize: 'Values: "small", "normal", "large" - Options > Player size',
			savedWidth_default: 'The saved player width for the Default layout - Options > Layout > Default',
			savedHeight_default: 'The saved player height for the Default layout - Options > Layout > Default',
			savedWidth_artwork: 'The saved player width for the Artwork layout - Options > Layout > Artwork',
			savedHeight_artwork: 'The saved player height for the Artwork layout - Options > Layout > Artwork',
			savedWidth_compact: 'The saved player width for the Compact layout - Options > Layout > Compact',
			savedHeight_compact: 'The saved player height for the Compact layout - Options > Layout > Compact'
		};

		/** @public @type {object} 选项 > 大小 设置配置页眉说明。 */
		this.themePlayerSizeSchema = new ConfigurationObjectSchema('themePlayerSize', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 播放器大小:                                                                                                                                                                                           ' +
			'* 顶部菜单 选项 > 大小                                                                                                                                                                                  ' +
			'* 你可以设置并选择将使用的三种可用播放器大小。                                                                                                                                                          ' +
			'* 注意：如果您使用顶部菜单“选项”>“设置”>“主题配置”>“将设置保存到配置文件”，则此设置将自动设置                                                                                                           ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * FONT SIZE * //
		// #region FONT SIZE
		/** @public @type {object} Options > Font size settings with default values. */
		this.themeFontSizesDefaults = {
			menuFontSize_default: HD_QHD_4K(12, 14),
			menuFontSize_artwork: HD_QHD_4K(12, 14),
			menuFontSize_compact: HD_QHD_4K(12, 14),
			lowerBarFontSize_default: HD_QHD_4K(18, 20),
			lowerBarFontSize_artwork: HD_QHD_4K(16, 18),
			lowerBarFontSize_compact: HD_QHD_4K(16, 18),
			notificationFontSize_default: HD_QHD_4K(18, 20),
			notificationFontSize_artwork: HD_QHD_4K(16, 18),
			notificationFontSize_compact: HD_QHD_4K(16, 18),
			popupFontSize_default: HD_QHD_4K(16, 18),
			popupFontSize_artwork: HD_QHD_4K(14, 16),
			popupFontSize_compact: HD_QHD_4K(14, 16),
			tooltipFontSize_default: HD_QHD_4K(16, 18),
			tooltipFontSize_artwork: HD_QHD_4K(14, 16),
			tooltipFontSize_compact: HD_QHD_4K(14, 16),
			gridArtistFontSize_default: HD_QHD_4K(18, 20),
			gridArtistFontSize_artwork: HD_QHD_4K(18, 20),
			gridTrackNumFontSize_default: HD_QHD_4K(18, 20),
			gridTrackNumFontSize_artwork: HD_QHD_4K(18, 20),
			gridTitleFontSize_default: HD_QHD_4K(18, 20),
			gridTitleFontSize_artwork: HD_QHD_4K(18, 20),
			gridAlbumFontSize_default: HD_QHD_4K(18, 20),
			gridAlbumFontSize_artwork: HD_QHD_4K(18, 20),
			gridKeyFontSize_default: HD_QHD_4K(17, 19),
			gridKeyFontSize_artwork: HD_QHD_4K(17, 19),
			gridValueFontSize_default: HD_QHD_4K(17, 19),
			gridValueFontSize_artwork: HD_QHD_4K(17, 19),
			playlistHeaderFontSize_default: HD_QHD_4K(15, 17),
			playlistHeaderFontSize_artwork: HD_QHD_4K(15, 17),
			playlistHeaderFontSize_compact: HD_QHD_4K(15, 17),
			playlistFontSize_default: HD_QHD_4K(12, 14),
			playlistFontSize_artwork: HD_QHD_4K(12, 14),
			playlistFontSize_compact: HD_QHD_4K(12, 14),
			libraryFontSize_default: HD_QHD_4K(12, 14, 24),
			libraryFontSize_artwork: HD_QHD_4K(12, 14, 24),
			biographyFontSize_default: HD_QHD_4K(12, 14, 24),
			biographyFontSize_artwork: HD_QHD_4K(12, 14, 24),
			biographyLyricsFontSize_default: HD_QHD_4K(16, 18),
			biographyLyricsFontSize_artwork: HD_QHD_4K(16, 18),
			lyricsFontSize_default: HD_QHD_4K(20, 22),
			lyricsFontSize_artwork: HD_QHD_4K(20, 22),
			lyricsInfoFontSize_default: HD_QHD_4K(20, 22)
		};

		/** @public @type {object} 选项 > 字体大小 设置配置名称说明。 */
		this.themeFontSizesComments = {
			menuFontSize_default: 'Values: 8, 10, 11, 12, 13, 14, 16 - Options > Font size > Main > Top menu - when Default layout is active',
			menuFontSize_artwork: 'Values: 8, 10, 11, 12, 13, 14, 16 - Options > Font size > Main > Top menu - when Artwork layout is active',
			menuFontSize_compact: 'Values: 8, 10, 11, 12, 13, 14, 16 - Options > Font size > Main > Top menu - when Compact layout is active',
			lowerBarFontSize_default: 'Values: 10, 12, 14, 16, 18, 20, 22, 24, 26 - Options > Font size > Main > Lower bar - when Default layout is active',
			lowerBarFontSize_artwork: 'Values: 10, 12, 14, 16, 18, 20, 22, 24, 26 - Options > Font size > Main > Lower bar - when Artwork layout is active',
			lowerBarFontSize_compact: 'Values: 10, 12, 14, 16, 18, 20, 22, 24, 26 - Options > Font size > Main > Lower bar - when Compact layout is active',
			notificationFontSize_default: 'Values: 10, 12, 14, 16, 18, 20, 22, 24 - Options > Font size > Main > Notification - when Default layout is active',
			notificationFontSize_artwork: 'Values: 10, 12, 14, 16, 18, 20, 22, 24 - Options > Font size > Main > Notification - when Artwork layout is active',
			notificationFontSize_compact: 'Values: 10, 12, 14, 16, 18, 20, 22, 24 - Options > Font size > Main > Notification - when Compact layout is active',
			popupFontSize_default: 'Values: 10, 12, 14, 16, 18, 20, 22, 24 - Options > Font size > Main > Popup - when Default layout is active',
			popupFontSize_artwork: 'Values: 10, 12, 14, 16, 18, 20, 22, 24 - Options > Font size > Main > Popup - when Artwork layout is active',
			popupFontSize_compact: 'Values: 10, 12, 14, 16, 18, 20, 22, 24 - Options > Font size > Main > Popup - when Compact layout is active',
			tooltipFontSize_default: 'Values: 10, 12, 14, 16, 18, 20, 22, 24 - Options > Font size > Main > Tooltip - when Default layout is active',
			tooltipFontSize_artwork: 'Values: 10, 12, 14, 16, 18, 20, 22, 24 - Options > Font size > Main > Tooltip - when Artwork layout is active',
			tooltipFontSize_compact: 'Values: 10, 12, 14, 16, 18, 20, 22, 24 - Options > Font size > Main > Tooltip - when Compact layout is active',
			gridArtistFontSize_default: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - Options > Font size > Details > Artist - when Default layout is active',
			gridArtistFontSize_artwork: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - Options > Font size > Details > Artist - when Artwork layout is active',
			gridTrackNumFontSize_default: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - not in Options, track number before song title in grid - when Default layout is active',
			gridTrackNumFontSize_artwork: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - not in Options, track number before song title in grid - when Artwork layout is active',
			gridTitleFontSize_default: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - Options > Font size > Details > Title - when Default layout is active',
			gridTitleFontSize_artwork: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - Options > Font size > Details > Title - when Artwork layout is active',
			gridAlbumFontSize_default: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - Options > Font size > Details > Album - when Default layout is active',
			gridAlbumFontSize_artwork: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - Options > Font size > Details > Album - when Artwork layout is active',
			gridKeyFontSize_default: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - Options > Font size > Details > Tag name - when Default layout is active',
			gridKeyFontSize_artwork: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - Options > Font size > Details > Tag name - when Artwork layout is active',
			gridValueFontSize_default: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - Options > Font size > Details > Tag value - when Default layout is active',
			gridValueFontSize_artwork: 'Values: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24 - Options > Font size > Details > Tag value - when Artwork layout is active',
			playlistHeaderFontSize_default: 'Values: 10, 12, 13, 14, 15, 16, 17, 18, 20, 22 - Options > Font size > Playlist - when Default layout is active',
			playlistHeaderFontSize_artwork: 'Values: 10, 12, 13, 14, 15, 16, 17, 18 - Options > Font size > Playlist - when Artwork layout is active',
			playlistHeaderFontSize_compact: 'Values: 10, 12, 13, 14, 15, 16, 17, 18 - Options > Font size > Playlist - when Compact layout is active',
			playlistFontSize_default: 'Values: 10, 12, 13, 14, 15, 16, 17, 18, 20, 22 - Options > Font size > Playlist - when Default layout is active',
			playlistFontSize_artwork: 'Values: 10, 12, 13, 14, 15, 16, 17, 18 - Options > Font size > Playlist - when Artwork layout is active',
			playlistFontSize_compact: 'Values: 10, 12, 13, 14, 15, 16, 17, 18 - Options > Font size > Playlist - when Compact layout is active',
			libraryFontSize_default: 'Values: 8, 10, 11, 12, 13, 14, 16, 18 - Options > Font size > Library - when Default layout is active',
			libraryFontSize_artwork: 'Values: 8, 10, 11, 12, 13, 14, 16, 18 - Options > Font size > Library - when Artwork layout is active',
			biographyFontSize_default: 'Values: 8, 10, 11, 12, 13, 14, 16, 18 - Options > Font size > Biography > Main - when Default layout is active',
			biographyFontSize_artwork: 'Values: 8, 10, 11, 12, 13, 14, 16, 18 - Options > Font size > Biography > Main - when Artwork layout is active',
			biographyLyricsFontSize_default: 'Values: 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30 - Options > Font size > Biography > Lyrics - when Default layout is active',
			biographyLyricsFontSize_artwork: 'Values: 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30 - Options > Font size > Biography > Lyrics - when Artwork layout is active',
			lyricsFontSize_default: 'Values: 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30 - Options > Font size > Lyrics - when Default layout is active',
			lyricsFontSize_artwork: 'Values: 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30 - Options > Font size > Lyrics - when Artwork layout is active',
			lyricsInfoFontSize_default: 'Values: 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30 - Options > Font size > Lyrics - when Default layout is active'
		};

		/** @public @type {object} 选项 > 字体大小 设置配置页眉说明。 */
		this.themeFontSizesSchema = new ConfigurationObjectSchema('themeFontSize', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 字体大小:                                                                                                                                                                                             ' +
			'* 顶部菜单 选项 > 字体                                                                                                                                                                                  ' +
			'* 默认情况下，“封面”和“简单”布局字体大小可以独立定制，并在布局之间更改时使用。                                                                                                                          ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，这些设置将自动设置                                                                                                                 ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 播放控制 * //
		// #region PLAYER CONTROLS
		/** @public @type {object} 选项 > 播放控制 设置默认值。 */
		this.themePlayerControlsDefaults = {
			showPanelDetails_default: true,
			showPanelDetails_artwork: true,
			showPanelPlaylist_artwork: true,
			showPanelLibrary_default: true,
			showPanelLibrary_artwork: true,
			showPanelBiography_default: true,
			showPanelBiography_artwork: true,
			showPanelLyrics_default: true,
			showPanelLyrics_artwork: true,
			showPanelRating_default: true,
			showPanelRating_artwork: true,
			topMenuAlignment: 'center',
			topMenuCompact: true,
			topMenuCompactSymbolOnly: false,
			albumArtAlign: 'right',
			albumArtBg: 'left',
			albumArtScale: 'cropped',
			albumArtAspectRatioLimit: false,
			albumArtCycle: false,
			albumArtCycleMouseWheel: true,
			albumArtCycleTime: 15,
			filterAlbumArt: true,
			loadEmbeddedAlbumArtFirst: false,
			showHiResAudioBadge: true,
			hiResAudioBadgeRound: false,
			hiResAudioBadgeSize: 'normal',
			hiResAudioBadgePos: 'bottomright',
			showPause: true,
			jumpSearchIncludeLibrary: true,
			jumpSearchIncludePlaylist: true,
			jumpSearchComposerOnly: false,
			jumpSearchDisabled: false,
			playlistWheelScrollSteps: 8,
			playlistWheelScrollDuration: 300,
			playlistAutoScrollNowPlaying: true,
			playlistAutoScrollSelectLibrary: true,
			playlistAutoHideScrollbar: true,
			playlistSmoothScrolling: true,
			scrollStepLib: 8,
			durationScrollLib: 500,
			libraryAutoScrollNowPlaying: true,
			libraryAutoScrollSelectPlaylist: true,
			libraryAutoHideScrollbar: true,
			smoothLib: true,
			scrollStepBio: 8,
			durationScrollBio: 500,
			biographyAutoHideScrollbar: true,
			smoothBio: true,
			showTooltipTruncated: true,
			showTooltipTimeline: true,
			showTooltipVolume: true,
			showTooltipVolumeInPercent: true,
			showTooltipMain: true,
			showTooltipLibrary: true,
			showTooltipBiography: true,
			showStyledTooltips: true,
			panelWidthAuto: false,
			panelBrowseMode: false,
			showPanelOnStartup: 'playlist',
			showPreloaderLogo: true,
			showWeblinks: true,
			returnToHomeOnPlaybackStop: true,
			addTracksPlaylistSwitch: false,
			enableShadows: true,
			hideMiddlePanelShadow: false,
			enableDiscArtShadows: true,
			fullscreenMaximize: true,
			lockPlayerSize: false,
			transportButtonSize_default: 32,
			transportButtonSize_artwork: 32,
			transportButtonSize_compact: 32,
			transportButtonSpacing_default: 5,
			transportButtonSpacing_artwork: 5,
			transportButtonSpacing_compact: 5,
			showTransportControls_default: true,
			showTransportControls_artwork: true,
			showTransportControls_compact: true,
			showPlaybackOrderBtn_default: true,
			showPlaybackOrderBtn_artwork: true,
			showPlaybackOrderBtn_compact: true,
			showReloadBtn_default: true,
			showReloadBtn_artwork: false,
			showReloadBtn_compact: false,
			showAddTracksBtn_default: false,
			showAddTracksBtn_artwork: false,
			showAddTracksBtn_compact: false,
			showVolumeBtn_default: true,
			showVolumeBtn_artwork: true,
			showVolumeBtn_compact: true,
			autoHideVolumeBar: false,
			showPlaybackTime_default: true,
			showPlaybackTime_artwork: true,
			showPlaybackTime_compact: true,
			showLowerBarArtist_default: true,
			showLowerBarArtist_artwork: true,
			showLowerBarArtist_compact: true,
			showLowerBarTrackNum_default: true,
			showLowerBarTrackNum_artwork: true,
			showLowerBarTrackNum_compact: true,
			showLowerBarTitle_default: true,
			showLowerBarTitle_artwork: true,
			showLowerBarTitle_compact: true,
			showLowerBarComposer_default: false,
			showLowerBarComposer_artwork: false,
			showLowerBarComposer_compact: false,
			showLowerBarArtistFlags_default: true,
			showLowerBarArtistFlags_artwork: true,
			showLowerBarArtistFlags_compact: true,
			showLowerBarVersion_default: true,
			showLowerBarVersion_artwork: true,
			showLowerBarVersion_compact: true,
			showProgressBar_default: true,
			showProgressBar_artwork: true,
			showProgressBar_compact: true,
			showPeakmeterBar_default: true,
			showPeakmeterBar_artwork: true,
			showPeakmeterBar_compact: true,
			showWaveformBar_default: true,
			showWaveformBar_artwork: true,
			showWaveformBar_compact: true,
			lowerBarArtistBtnAction: 'website',
			lowerBarArtistBtnWebsite: 'lastfm',
			addTracksPlaylist: '收藏夹',
			addTracksButtonAction: 'selection',
			playbackTimeDisplay: 'default',
			seekbar: 'progressbar',
			progressBarWheelSeekSpeed: 5,
			progressBarRefreshRate: 'variable',
			peakmeterBarDesign: 'horizontal',
			peakmeterBarVertSize: 20,
			peakmeterBarVertDbRange: 220,
			peakmeterBarOverBars: true,
			peakmeterBarOuterBars: true,
			peakmeterBarOuterPeaks: true,
			peakmeterBarMainBars: true,
			peakmeterBarMainPeaks: true,
			peakmeterBarMiddleBars: true,
			peakmeterBarProgBar: true,
			peakmeterBarGaps: false,
			peakmeterBarGrid: false,
			peakmeterBarInfo: false,
			peakmeterBarVertPeaks: true,
			peakmeterBarVertBaseline: true,
			peakmeterBarWheelSeekSpeed: 5,
			peakmeterBarRefreshRate: 'variable',
			waveformBarMode: 'audioWizard',
			waveformBarAnalysis: 'waveform',
			waveformBarSaveMode: 'always',
			waveformBarFallbackAnalysis: true,
			waveformBarFallback: true,
			waveformBarResolution: 20,
			waveformBarDesign: 'halfbars',
			waveformBarSizeWave: 3,
			waveformBarSizeBars: 1,
			waveformBarSizeDots: 2,
			waveformBarSizeHalf: 4,
			waveformBarSizeNormalize: false,
			waveformBarPaint: 'partial',
			waveformBarPrepaint: true,
			waveformBarPrepaintFront: 'Infinity',
			waveformBarAnimate: true,
			waveformBarBPM: true,
			waveformBarInvertHalfbars: true,
			waveformBarIndicator: false,
			waveformBarWheelSeekSpeed: 5,
			waveformBarWheelSeekType: 'seconds',
			waveformBarRefreshRate: 'variable',
			waveformBarAutoDelete: false,
			playbackOrder: 'default'
		};

		/** @public @type {object} 选项 > 播放控制 设置配置名称说明。 */
		this.themePlayerControlsComments = {
			showPanelDetails_default: 'Values: true, false - Options > Player controls > Top menu > Default > Details',
			showPanelDetails_artwork: 'Values: true, false - Options > Player controls > Top menu > Artwork > Details',
			showPanelPlaylist_artwork: 'Values: true, false - Options > Player controls > Top menu > Artwork > Playlist',
			showPanelLibrary_default: 'Values: true, false - Options > Player controls > Top menu > Default > Library',
			showPanelLibrary_artwork: 'Values: true, false - Options > Player controls > Top menu > Artwork > Library',
			showPanelBiography_default: 'Values: true, false - Options > Player controls > Top menu > Default > Biography',
			showPanelBiography_artwork: 'Values: true, false - Options > Player controls > Top menu > Artwork > Biography',
			showPanelLyrics_default: 'Values: true, false - Options > Player controls > Top menu > Default > Lyrics',
			showPanelLyrics_artwork: 'Values: true, false - Options > Player controls > Top menu > Artwork > Lyrics',
			showPanelRating_default: 'Values: true, false - Options > Player controls > Top menu > Default > Rating',
			showPanelRating_artwork: 'Values: true, false - Options > Player controls > Top menu > Artwork > Rating',
			topMenuAlignment: 'Values: left, center - Options > Player controls > Top menu',
			topMenuCompact: 'Values: true, false - Options > Player controls > Top menu > Compact top menu',
			topMenuCompactSymbolOnly: 'Values: true, false - Options > Player controls > Top menu > Compact top menu (symbol only)',
			albumArtAlign: 'Values: "left", "leftMargin", "center", "right" - Options > Player controls > Album art > When player size is not proportional',
			albumArtBg: 'Values: "left", "full", "none" - Options > Player controls > Album art > When player size is not proportional',
			albumArtScale: 'Values: "cropped", "stretched", "proportional" - Options > Player controls > Album art > When player size is maximized/fullscreen',
			albumArtAspectRatioLimit: 'Values: false, 1.25, 1.5, 1.75, 2 - Options > Player controls > Album art > When player size is maximized/fullscreen > Keep wide and tall artworks proportional',
			albumArtCycle: 'Values: true, false - Options > Player controls > Album art > Cycle album artwork > Enabled',
			albumArtCycleMouseWheel: 'Values: true, false - Options > Player controls > Album art > Cycle album artwork > Cycle with mouse wheel',
			albumArtCycleTime: 'Values: 5, 10, 15, 30, 60 - Options > Player controls > Album art > Cycle album artwork > Cycle time',
			filterAlbumArt: 'Values: true, false - Options > Player controls > Album art > Filter album art images',
			loadEmbeddedAlbumArtFirst: 'Values: true, false - Options > Player controls > Album art > Load embedded album art first',
			showHiResAudioBadge: 'Values: true, false - Options > Player controls > Album art > Show hi-res audio badge on album cover > Enabled',
			hiResAudioBadgeRound: 'Values: true, false - Options > Player controls > Album art > Show hi-res audio badge on album cover > Round',
			hiResAudioBadgeSize: 'Values: "small", "normal", "large" - Options > Player controls > Album art > Show hi-res audio badge on album cover',
			hiResAudioBadgePos: 'Values: "topleft", "topright", "bottomleft", "bottomright" - Options > Player controls > Album art > Show hi-res audio badge on album cover',
			showPause: 'Values: true, false - Options > Player controls > Album art > Show pause on album cover',
			jumpSearchIncludeLibrary: 'Values: true, false - Options > Player controls > Jump search > Include library in playlist search query',
			jumpSearchIncludePlaylist: 'Values: true, false - Options > Player controls > Jump search > Include playlist in library search query',
			jumpSearchComposerOnly: 'Values: true, false - Options > Player controls > Jump search > Composer only in jump search query',
			jumpSearchDisabled: 'Values: true, false - Options > Player controls > Jump search > Disable jump search',
			playlistWheelScrollSteps: 'Values: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 - Options > Player controls > Scrollbar > Playlist > Mouse wheel scroll steps',
			playlistWheelScrollDuration: 'Values: 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 - Options > Player controls > Scrollbar > Playlist > Mouse wheel scroll smooth duration',
			playlistAutoScrollNowPlaying: 'Values: true, false - Options > Player controls > Scrollbar > Playlist > Auto-scroll to current playing song',
			playlistAutoScrollSelectLibrary: 'Values: true, false - Options > Player controls > Scrollbar > Playlist > Auto-scroll Playlist on Library select (Library split layout only)',
			playlistAutoHideScrollbar: 'Values: true, false - Options > Player controls > Scrollbar > Playlist > Auto-hide',
			playlistSmoothScrolling: 'Values: true, false - Options > Player controls > Scrollbar > Playlist > Smooth scroll',
			scrollStepLib: 'Values: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 - Options > Player controls > Scrollbar > Library > Mouse wheel scroll steps',
			durationScrollLib: 'Values: 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 - Options > Player controls > Scrollbar > Library > Mouse wheel scroll smooth duration',
			libraryAutoScrollNowPlaying: 'Values: true, false - Options > Player controls > Scrollbar > Library > Auto-scroll to current playing song',
			libraryAutoScrollSelectPlaylist: 'Values: true, false - Options > Player controls > Scrollbar > Library > Auto-scroll Library on Playlist select (Library split layout only)',
			libraryAutoHideScrollbar: 'Values: true, false - Options > Player controls > Scrollbar > Library > Auto-hide',
			smoothLib: 'Values: true, false - Options > Player controls > Scrollbar > Library > Smooth scroll',
			scrollStepBio: 'Values: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 - Options > Player controls > Scrollbar > Biography > Mouse wheel scroll steps',
			durationScrollBio: 'Values: 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 - Options > Player controls > Scrollbar > Biography > Mouse wheel scroll smooth duration',
			biographyAutoHideScrollbar: 'Values: true, false - Options > Player controls > Scrollbar > Biography > Auto-hide',
			smoothBio: 'Values: true, false - Options > Player controls > Scrollbar > Biography > Smooth scroll',
			showTooltipTruncated: 'Values: true, false - Options > Player controls > Tooltip > Show tooltips only on truncated text',
			showTooltipTimeline: 'Values: true, false - Options > Player controls > Tooltip > Show timeline tooltips',
			showTooltipVolume: 'Values: true, false - Options > Player controls > Tooltip > Show volume tooltips',
			showTooltipVolumeInPercent: 'Values: true, false - Options > Player controls > Tooltip > Show volume tooltips in percent',
			showTooltipMain: 'Values: true, false - Options > Player controls > Tooltip > Show main tooltips',
			showTooltipLibrary: 'Values: true, false - Options > Player controls > Tooltip > Show library tooltips',
			showTooltipBiography: 'Values: true, false - Options > Player controls > Tooltip > Show biography tooltips',
			showStyledTooltips: 'Values: true, false - Options > Player controls > Tooltip > Show styled tooltips',
			panelWidthAuto: 'Values: true, false - Options > Player controls > Panel > Mode > Auto panel width',
			panelBrowseMode: 'Values: true, false - Options > Player controls > Panel > Mode > Browse mode',
			showPanelOnStartup: 'Values: "cover", "playlist", "details", "library", "biography", "lyrics" - Options > Player controls > Panel > Show panel on startup',
			showPreloaderLogo: 'Values: true, false - Options > Player controls > Panel > Show logo on preloader',
			showWeblinks: 'Values: true, false - Options > Player controls > Panel > Show weblinks in context menu',
			returnToHomeOnPlaybackStop: 'Values: true, false - Options > Player controls > Panel > Return to home on playback stop',
			addTracksPlaylistSwitch: 'Values: true, false - Options > Player controls > Panel > Switch to playlist when adding songs',
			enableShadows: 'Values: true, false - Options > Player controls > Panel > Show all panel shadow',
			hideMiddlePanelShadow: 'Values: true, false - Options > Player controls > Panel > Hide middle panel shadow',
			enableDiscArtShadows: 'Values: true, false - Options > Player controls > Panel > Show DiscArt shadow',
			fullscreenMaximize: 'Values: true, false - not in Options - enable or disable the maximize to fullscreen function',
			lockPlayerSize: 'Values: true, false - Options > Player controls > Panel > Lock player size',
			transportButtonSize_default: 'Values: 28, 30, 32, 34, 36, 38, 40, 42 - Options > Player controls > Transport button size > Default',
			transportButtonSize_artwork: 'Values: 28, 30, 32, 34, 36 - Options > Player controls > Lower bar > Transport button size > Artwork',
			transportButtonSize_compact: 'Values: 28, 30, 32, 34, 36 - Options > Player controls > Lower bar > Transport button size > Compact',
			transportButtonSpacing_default: 'Values: 3, 5, 7, 10, 15 - Options > Player controls > Lower bar > Transport button spacing > Default',
			transportButtonSpacing_artwork: 'Values: 3, 5, 7, 10, 15 - Options > Player controls > Lower bar > Transport button spacing > Artwork',
			transportButtonSpacing_compact: 'Values: 3, 5, 7, 10, 15 - Options > Player controls > Lower bar > Transport button spacing > Compact',
			showTransportControls_default: 'Values: true, false - Options > Player controls > Lower bar > Show transport controls > Default',
			showTransportControls_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show transport controls > Artwork',
			showTransportControls_compact: 'Values: true, false - Options > Player controls > Lower bar > Show transport controls > Compact',
			showPlaybackOrderBtn_default: 'Values: true, false - Options > Player controls > Lower bar > Show playback order button > Default',
			showPlaybackOrderBtn_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show playback order button > Artwork',
			showPlaybackOrderBtn_compact: 'Values: true, false - Options > Player controls > Lower bar > Show playback order button > Compact',
			showReloadBtn_default: 'Values: true, false - Options > Player controls > Lower bar > Show reload button > Default',
			showReloadBtn_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show reload button > Artwork',
			showReloadBtn_compact: 'Values: true, false - Options > Player controls > Lower bar > Show reload button > Compact',
			showAddTracksBtn_default: 'Values: true, false - Options > Player controls > Lower bar > Show add tracks button > Default',
			showAddTracksBtn_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show add tracks button > Artwork',
			showAddTracksBtn_compact: 'Values: true, false - Options > Player controls > Lower bar > Show add tracks button > Compact',
			showVolumeBtn_default: 'Values: true, false - Options > Player controls > Lower bar > Show volume button > Default',
			showVolumeBtn_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show volume button > Artwork',
			showVolumeBtn_compact: 'Values: true, false - Options > Player controls > Lower bar > Show volume button > Compact',
			autoHideVolumeBar: 'Values: true, false - Options > Player controls > Lower bar > Show volume button > Auto-hide bar',
			showPlaybackTime_default: 'Values: true, false - Options > Player controls > Lower bar > Show playback time > Default',
			showPlaybackTime_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show playback time > Artwork',
			showPlaybackTime_compact: 'Values: true, false - Options > Player controls > Lower bar > Show playback time > Compact',
			showLowerBarArtist_default: 'Values: true, false - Options > Player controls > Lower bar > Show artist > Default',
			showLowerBarArtist_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show artist > Artwork',
			showLowerBarArtist_compact: 'Values: true, false - Options > Player controls > Lower bar > Show artist > Compact',
			showLowerBarTrackNum_default: 'Values: true, false - Options > Player controls > Lower bar > Show track number > Default',
			showLowerBarTrackNum_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show track number > Artwork',
			showLowerBarTrackNum_compact: 'Values: true, false - Options > Player controls > Lower bar > Show track number > Compact',
			showLowerBarTitle_default: 'Values: true, false - Options > Player controls > Lower bar > Show track title > Default',
			showLowerBarTitle_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show track title > Artwork',
			showLowerBarTitle_compact: 'Values: true, false - Options > Player controls > Lower bar > Show track title > Compact',
			showLowerBarComposer_default: 'Values: true, false - Options > Player controls > Lower bar > Show composer > Default',
			showLowerBarComposer_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show composer > Artwork',
			showLowerBarComposer_compact: 'Values: true, false - Options > Player controls > Lower bar > Show composer > Compact',
			showLowerBarArtistFlags_default: 'Values: true, false - Options > Player controls > Lower bar > Show artist country flags > Default',
			showLowerBarArtistFlags_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show artist country flags > Artwork',
			showLowerBarArtistFlags_compact: 'Values: true, false - Options > Player controls > Lower bar > Show artist country flags > Compact',
			showLowerBarVersion_default: 'Values: true, false - Options > Player controls > Lower bar > Show software version > Default',
			showLowerBarVersion_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show software version > Artwork',
			showLowerBarVersion_compact: 'Values: true, false - Options > Player controls > Lower bar > Show software version > Compact',
			showProgressBar_default: 'Values: true, false - Options > Player controls > Lower bar > Show progress bar > Default',
			showProgressBar_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show progress bar > Artwork',
			showProgressBar_compact: 'Values: true, false - Options > Player controls > Lower bar > Show progress bar > Compact',
			showPeakmeterBar_default: 'Values: true, false - Options > Player controls > Lower bar > Show peakmeter bar > Default',
			showPeakmeterBar_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show peakmeter bar > Artwork',
			showPeakmeterBar_compact: 'Values: true, false - Options > Player controls > Lower bar > Show peakmeter bar > Compact',
			showWaveformBar_default: 'Values: true, false - Options > Player controls > Lower bar > Show waveform bar > Default',
			showWaveformBar_artwork: 'Values: true, false - Options > Player controls > Lower bar > Show waveform bar > Artwork',
			showWaveformBar_compact: 'Values: true, false - Options > Player controls > Lower bar > Show waveform bar > Compact',
			lowerBarArtistBtnAction: 'Values: "playlist", "website", - Options > Player controls > Lower bar > Artist button action',
			lowerBarArtistBtnWebsite: 'Values: "google", "googleImages","bingimages", "wikipedia", "youTube", "lastfm", "allMusic", "discogs", "musicBrainz", "bandcamp", "aoty", "rym", "sputnikmusic", "custom", - Options > Player controls > Lower bar > Artist button action',
			addTracksPlaylist: 'Values: "Favorites", "OrAnyOtherName", - Options > Player controls > Lower bar > Add tracks buttion > Add tracks playlist',
			addTracksButtonAction: 'Values: "selection", "nowplaying", - Options > Player controls > Lower bar > Add tracks buttion',
			playbackTimeDisplay: 'Values: "default", "remaining", "percent" - Options > Player controls > Lower bar > Playback time display',
			seekbar: 'Values: "progressbar", "peakmeterBar", "waveformbar", - Options > Player controls > Seekbar > Type',
			progressBarWheelSeekSpeed: 'Values: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 - Options > Player controls > Seekbar > Progress bar > Mouse wheel seek speed',
			progressBarRefreshRate: 'Values: 1000, 500, 333, 250, 200, 166, 142, 125, 111, 100, 83, 67, 50, 40, 33, 22, 17, "variable" - Options > Player controls > Seekbar > Progress bar > Refresh rate',
			peakmeterBarDesign: 'Values: "horizontal", "horizontal_center", "vertical" - Options > Player controls > Seekbar > Peakmeter bar > Style',
			peakmeterBarVertSize: 'Values: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 25, 30, 35, 40, "min" - Options > Player controls > Seekbar > Peakmeter bar > Size',
			peakmeterBarVertDbRange: 'Values: 220, 215, 210, 320, 315, 310, 520, 515, 510 - Options > Player controls > Seekbar > Peakmeter bar > Decibel range',
			peakmeterBarOverBars: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show over bars',
			peakmeterBarOuterBars: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show outer bars',
			peakmeterBarOuterPeaks: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show outer peaks',
			peakmeterBarMainBars: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show main bars',
			peakmeterBarMainPeaks: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show main peaks',
			peakmeterBarMiddleBars: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show middle bars',
			peakmeterBarProgBar: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show progress bar',
			peakmeterBarGaps: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show gaps',
			peakmeterBarGrid: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show grid',
			peakmeterBarInfo: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show info',
			peakmeterBarVertPeaks: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show peaks',
			peakmeterBarVertBaseline: 'Values: true, false - Options > Player controls > Seekbar > Peakmeter bar > Display > Show baseline',
			peakmeterBarWheelSeekSpeed: 'Values: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 - Options > Player controls > Seekbar > Peakmeter bar > Mouse wheel seek speed',
			peakmeterBarRefreshRate: 'Values: 1000, 500, 333, 250, 200, 166, 142, 125, 111, 100, 83, 67, 50, 40, 33, 22, 17, "variable" - Options > Player controls > Seekbar > Peakmeter bar > Refresh rate',
			waveformBarMode: 'Values: "waveform", "visualizer" - Options > Player controls > Seekbar > Waveform bar > Mode',
			waveformBarAnalysis: 'Values: "rms", "rms_peak", "sample_peak", "waveform", - Options > Player controls > Seekbar > Waveform bar > Analysis',
			waveformBarSaveMode: 'Values: "always", "library", "never" - Options > Player controls > Seekbar > Waveform bar > Analysis',
			waveformBarFallbackAnalysis: 'Values: true, false - Options > Player controls > Seekbar > Waveform bar > Analysis > Visualizer during analysis',
			waveformBarFallback: 'Values: true, false - Options > Player controls > Seekbar > Waveform bar > Analysis > Visualizer for incompatible files',
			waveformBarResolution: 'Values: 1, 5, 10, 15, 20, 50, 100 - Options > Player controls > Seekbar > Waveform bar > Resolution',
			waveformBarDesign: 'Values: "waveform", "bars", "dots", "halfbars" - Options > Player controls > Seekbar > Waveform bar > Shape',
			waveformBarSizeWave: 'Values: 1, 2, 3, 4, 5 - Options > Player controls > Seekbar > Waveform bar > Size > Waveform',
			waveformBarSizeBars: 'Values: 1, 2, 3, 4, 5 - Options > Player controls > Seekbar > Waveform bar > Size > Bars',
			waveformBarSizeDots: 'Values: 1, 2, 3, 4, 5 - Options > Player controls > Seekbar > Waveform bar > Size > Dots',
			waveformBarSizeHalf: 'Values: 1, 2, 3, 4, 5 - Options > Player controls > Seekbar > Waveform bar > Size > Halfbars',
			waveformBarSizeNormalize: 'Values: true, false - Options > Player controls > Seekbar > Waveform bar > Size > Normalize width',
			waveformBarPaint: 'Values: "full", "partial" - Options > Player controls > Seekbar > Waveform bar > Display',
			waveformBarPrepaint: 'Values: true, false - Options > Player controls > Seekbar > Waveform bar > Display > Prepaint',
			waveformBarPrepaintFront: 'Values: "Infinity", 2, 5, 10, - Options > Player controls > Seekbar > Waveform bar > Display > Prepaint front',
			waveformBarAnimate: 'Values: true, false - Options > Player controls > Seekbar > Waveform bar > Display > Animate',
			waveformBarBPM: 'Values: true, false - Options > Player controls > Seekbar > Waveform bar > Display > Use BPM',
			waveformBarInvertHalfbars: 'Values: true, false - Options > Player controls > Seekbar > Waveform bar > Display > Invert halfbars',
			waveformBarIndicator: 'Values: true, false - Options > Player controls > Seekbar > Waveform bar > Display > Show indicator',
			waveformBarWheelSeekSpeed: 'Values: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 - Options > Player controls > Seekbar > Waveform bar > Mouse wheel > Seek speed',
			waveformBarWheelSeekType: 'Values: "seconds", "percentage" - Options > Player controls > Seekbar > Waveform bar > Mouse wheel > Seek type',
			waveformBarRefreshRate: 'Values: 1000, 500, 333, 250, 200, 166, 142, 125, 111, 100, 83, 67, 50, 40, 33, 22, 17, "variable" - Options > Player controls > Seekbar > Waveform bar > Refresh rate',
			playbackOrder: 'Values: "default", "repeatPlaylist", "repeatTrack", "shuffle" - not in Options - playback order state button'
		};

		/** @public @type {object} 选项 > 播放控制 设置配置页眉说明。 */
		this.themePlayerControlsSchema = new ConfigurationObjectSchema('themeControls', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 播放控制:                                                                                                                                                                                             ' +
			'* 顶部菜单 选项 > 播放控制                                                                                                                                                                              ' +
			'* 您可以在将要使用的各种播放器控制设置之间进行设置和选择。                                                                                                                                              ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，这些设置将自动设置                                                                                                                 ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 播放列表 * //
		// #region PLAYLIST
		/** @public @type {object} 选项 > 播放列表 设置默认值。 */
		this.themePlaylistDefaults = {
			playlistLayout: 'normal',
			playlistBgImg: false,
			playlistBgImgCycle: true,
			playlistBgImgCycleTime: 15,
			playlistBgImgSource: 'artist',
			playlistBgImgAlbumArtFilter: true,
			playlistBgImgScale: 'filled',
			playlistBgImgOpacity: 51,
			playlistBgRowOpacity: 128,
			playlistBgRowNowPlaying: false,
			showPlaylistManager_default: true,
			showPlaylistManager_artwork: false,
			showPlaylistManager_compact: false,
			showPlaylistHistory: true,
			autoHidePlman: true,
			show_album_art: true,
			auto_album_art: false,
			show_header: true,
			show_rating_header: true,
			show_PLR_header: false,
			use_compact_header: false,
			auto_collapse: false,
			hyperlinksCtrlClick: false,
			headerFlipRows: false,
			show_disc_header: true,
			show_group_info: true,
			showPlaylistFullDate: false,
			show_row_stripes: false,
			show_playcount: true,
			show_queue_position: true,
			show_rating: true,
			use_rating_from_tags: false,
			showPlaylistRatingGrid: false,
			show_PLR: false,
			showPlaylistTrackNumbers: true,
			showPlaylistIndexNumbers: false,
			showDifferentArtist: false,
			showArtistPlaylistRows: false,
			showAlbumPlaylistRows: false,
			showVinylNums: true,
			lastFmScrobblesFallback: true,
			playlistRowHover: true,
			playlistPlaybackTimeDisplay: 'default',
			playlistSortOrderAuto: false,
			playlistSortOrder: '',
			playlistSortOrderDirection: '_asc',
			playlist_stats_include_artist: true,
			playlist_stats_include_album : true,
			playlist_stats_include_track: true,
			playlist_stats_include_year: false,
			playlist_stats_include_genre: false,
			playlist_stats_include_label: false,
			playlist_stats_include_country: false,
			playlist_stats_include_stats: true,
			playlist_stats_sort_by: '',
			playlist_stats_sort_direction: '_dsc'
		};

		/** @public @type {object} 选项 > 播放列表 设置配置名称说明。 */
		this.themePlaylistComments = {
			playlistLayout: 'Values: "normal", "full" - Options > Playlist > Layout',
			playlistBgImg: 'Values: true, false - Options > Playlist > Background > Show image on background',
			playlistBgImgCycle: 'Values: true, false - Options > Playlist > Background > Cycle images',
			playlistBgImgCycleTime: 'Values: 5, 10, 15, 30, 60 - Options > Playlist > Background > Cycle time',
			playlistBgImgSource: 'Values: "artist", "album", "custom" - Options > Playlist > Background > Image source',
			playlistBgImgAlbumArtFilter: 'Values: true, false - Options > Playlist > Background > Image source > Filter album art images',
			playlistBgImgScale: 'Values: "default", "filled", "stretched" - Options > Playlist > Background > Image scaling',
			playlistBgImgOpacity: 'Values: 255, 230, 204, 178, 153, 128, 102, 76, 51, 25 - from 100% - 10% - Options > Playlist > Background > Image opacity',
			playlistBgRowOpacity: 'Values: 255, 230, 204, 178, 153, 128, 102, 76, 51, 25 - from 100% - 10% - Options > Playlist > Background > Row opacity',
			playlistBgRowNowPlaying: 'Values: true, false - Options > Playlist > Background > Show now playing rows only',
			showPlaylistManager_default: 'Values: true, false - Options > Playlist > Playlist manager > Show playlist manager > Default',
			showPlaylistManager_artwork: 'Values: true, false - Options > Playlist > Playlist manager > Show playlist manager > Artwork',
			showPlaylistManager_compact: 'Values: true, false - Options > Playlist > Playlist manager > Show playlist manager > Compact',
			showPlaylistHistory: 'Values: true, false - Options > Playlist > Playlist manager > Show playlist history',
			autoHidePlman: 'Values: true, false - Options > Playlist > Playlist manager > Auto-hide',
			show_album_art: 'Values: true, false - Options > Playlist > Album header > Album art > Show',
			auto_album_art: 'Values: true, false - Options > Playlist > Album header > Album art > Auto-hide when no cover',
			show_header: 'Values: true, false - Options > Playlist > Album header > Album header',
			show_rating_header: 'Values: true, false - Options > Playlist > Album Header > Show rating',
			show_PLR_header: 'Values: true, false - Options > Playlist > Album Header > Show PLR value',
			use_compact_header: 'Values: true, false - Options > Playlist > Album header > Compact header',
			auto_collapse: 'Values: true, false - Options > Playlist > Album header > Auto collapse and expand',
			hyperlinksCtrlClick: 'Values: true, false - Options > Playlist > Album header > Ctrl+click to follow hyperlinks',
			headerFlipRows: 'Values: true, false - Options > Playlist > Album header > Flip header rows',
			show_disc_header: 'Values: true, false - Options > Playlist > Album header > Show disc sub-header',
			show_group_info: 'Values: true, false - Options > Playlist > Album header > Show group info',
			showPlaylistFullDate: 'Values: true, false - Options > Playlist > Album header > Show long release date (YYYY-MM-DD)',
			show_row_stripes: 'Values: true, false - Options > Playlist > Track row > Show row stripes',
			show_playcount: 'Values: true, false - Options > Playlist > Track row > Show play count',
			show_queue_position: 'Values: true, false - Options > Playlist > Track row > Show queue position',
			show_rating: 'Values: true, false - Options > Playlist > Track row > Show rating',
			use_rating_from_tags: 'Values: true, false - Options > Playlist > Track row > Show rating from tags',
			showPlaylistRatingGrid: 'Values: true, false - Options > Playlist > Track row > Show rating grid',
			show_PLR: 'Values: true, false - Options > Playlist > Track row > Show PLR value',
			showPlaylistTrackNumbers: 'Values: true, false - Options > Playlist > Track row > Show track numbers',
			showPlaylistIndexNumbers: 'Values: true, false - Options > Playlist > Track row > Show index numbers',
			showDifferentArtist: 'Values: true, false - Options > Playlist > Track row > Show artist name on difference',
			showArtistPlaylistRows: 'Values: true, false - Options > Playlist > Track row > Show artist name in all rows',
			showAlbumPlaylistRows: 'Values: true, false - Options > Playlist > Track row > Show album title in all rows',
			showVinylNums: 'Values: true, false - Options > Playlist > Track row > Show vinyl style numbering if available',
			lastFmScrobblesFallback: 'Values: true, false - Options > Playlist > Track row > Show last.fm scrobbles on no local plays',
			playlistRowHover: 'Values: true, false - Options > Playlist > Track row > Row mouse hover',
			playlistPlaybackTimeDisplay: 'Values: "default", "remaining", "percent" - Options > Playlist > Track row > Playback time display',
			playlistSortOrderAuto: 'Values: true, false - Options > Playlist > Sort order > Always auto-sort',
			playlistSortOrder: 'Values: "", "default", "artistDate_asc", "artistDate_dsc", "artistRating_asc", "artistRating_dsc", "album", "title", "trackNumber", "year_asc", "year_dsc", "filePath", "custom" - Options > Playlist > Sort order',
			playlistSortOrderDirection: 'Values: "_asc", "_dsc" - Options > Playlist > Sort order',
			playlist_stats_include_artist: 'Values: true, false - Playlist context menu > Write playlist statistics to list > Include artist',
			playlist_stats_include_album: 'Values: true, false - Playlist context menu > Write playlist statistics to list > Include album',
			playlist_stats_include_track: 'Values: true, false - Playlist context menu > Write playlist statistics to list > Include track',
			playlist_stats_include_year: 'Values: true, false - Playlist context menu > Write playlist statistics to list > Include year',
			playlist_stats_include_genre: 'Values: true, false - Playlist context menu > Write playlist statistics to list > Include genre',
			playlist_stats_include_label: 'Values: true, false - Playlist context menu > Write playlist statistics to list > Include label',
			playlist_stats_include_country: 'Values: true, false - Playlist context menu > Write playlist statistics to list > Include country',
			playlist_stats_include_stats: 'Values: true, false - Playlist context menu > Write playlist statistics to list > Include stats',
			playlist_stats_sort_by: 'Values: "", "artist", "albumTitle", "year", "genre" - playlist context menu - Write playlist statistics to text',
			playlist_stats_sort_direction: 'Values: "_asc", "_dsc" - playlist context menu - Write playlist statistics to text'
		};

		/** @public @type {object} 选项 > 播放列表 设置配置页眉说明。 */
		this.themePlaylistSchema = new ConfigurationObjectSchema('themePlaylist', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 播放列表:                                                                                                                                                                                             ' +
			'* 顶部菜单 选项 > 播放列表                                                                                                                                                                              ' +
			'* 您可以在将要使用的各种播放列表设置之间进行设置和选择。                                                                                                                                                ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，这些设置将自动设置                                                                                                                 ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {PlaylistGroupingPresets[]} 播放列表分组预设，默认条目和值 */
		this.themePlaylistGroupingPresets = [
			{
				name: '艺术家',
				description: '按艺术家',
				group_query: '%album artist%',
				title_query: '[%album artist%]',
				sub_title_query: "[%album%[ '('%albumsubtitle%')']][ - '['%edition%']']",
				show_date: false,
				show_disc: false
			},
			{
				name: '艺术家_专辑',
				description: '按艺术家 / 专辑',
				group_query: '%album artist%%album%',
				title_query: '[%album artist%]',
				sub_title_query: "[%album%[ '('%albumsubtitle%')']][ - '['%edition%']']",
				show_date: true,
				show_disc: false
			},
			{
				name: '艺术家_专辑_碟片',
				description: '按艺术家 / 专辑 / 碟片号',
				group_query: '%album artist%%album%%discnumber%',
				title_query: '[%album artist%]',
				sub_title_query: "[%album%[ '('%albumsubtitle%')']][ - '['%edition%']']",
				show_date: true,
				show_disc: true
			},
			{
				name: '艺术家_专辑_碟片_版本',
				description: '按艺术家 / 专辑 / 碟片号 / 版本 / 编码',
				group_query: '%album artist%%album%%discnumber%%edition%%codec%',
				title_query: '[%album artist%]',
				sub_title_query: "[%album%[ '('%albumsubtitle%')']][ - '['%edition%']']",
				show_date: true,
				show_disc: true
			},
			{
				name: '路径',
				description: '按路径',
				group_query: '$directory_path(%path%)',
				title_query: '[%album artist%]',
				sub_title_query: "[%album%[ '('%albumsubtitle%')']][ - '['%edition%']']",
				show_date: true,
				show_disc: false
			},
			{
				name: '日期',
				description: '按日期',
				group_query: '%date%',
				title_query: '[%album artist%]',
				sub_title_query: "[%album%[ '('%albumsubtitle%')']][ - '['%edition%']']",
				show_date: true,
				show_disc: false
			}
		];

		/** @public @type {object} 播放列表分组预设配置页眉说明 */
		this.themePlaylistGroupingPresetsSchema = new ConfigurationObjectSchema('themePlaylistGroupingPresets', ConfigurationObjectType.Array, [
			{ name: 'name' },
			{ name: 'description' },
			{ name: 'group_query' },
			{ name: 'title_query' },
			{ name: 'sub_title_query' },
			{ name: 'show_date' },
			{ name: 'show_disc' }],
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 播放列表分组预设:                                                                                                                                                                                     ' +
			'* 您可以添加具有分组模式的新条目，也可以重新排序将显示在播放列表分组管理器中的条目。                                                                                                                    ' +
			'* 右键单击播放列表>分组>管理预设，即可访问播放列表分组管理器。                                                                                                                                          ' +
			'* 在播放列表分组管理器中创建新的分组预设或修改时，重新加载后更改将保存到配置文件中。                                                                                                                    ' +
			'* 注意：如果使用顶部菜单“选项”>“设置”>“主题配置”>“将设置保存到配置文件”，则不会自动设置这些设置                                                                                                         ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 详情 * //
		// #region DETAILS
		/** @public @type {object} 选项 > 详情 设置默认值。 */
		this.themeDetailsDefaults = {
			showDiscArtStub: true,
			noDiscArtStub: false,
			discArtStub: 'cdAlbumCover',
			displayDiscArt: true,
			discArtAnimation: true,
			discArtEjectStyle: 'progressive',
			discArtOnTop: false,
			discArtEmbedded: false,
			spinDiscArt: false,
			spinDiscArtImageCount: 72,
			spinDiscArtRedrawInterval: 75,
			rotateDiscArt: true,
			rotationAmt: 3,
			artRotateDelay: 30,
			discArtDisplayAmount: 0.5,
			detailsAlbumArtOpacity: 255,
			detailsAlbumArtDiscAreaOpacity: 255,
			showGridArtist_default: false,
			showGridArtist_artwork: false,
			showGridTitle_default: false,
			showGridTrackNum_default: false,
			showGridTrackNum_artwork: false,
			showGridTitle_artwork: false,
			showGridPlayingPlaylist: false,
			showGridTimeline_default: true,
			showGridTimeline_artwork: true,
			showGridArtistFlags_default: true,
			showGridArtistFlags_artwork: true,
			showGridReleaseFlags_default: 'logo',
			showGridReleaseFlags_artwork: 'logo',
			showGridCodecLogo_default: 'logo',
			showGridCodecLogo_artwork: 'logo',
			showGridChannelLogo_default: 'logo',
			showGridChannelLogo_artwork: 'logo',
			autoHideGridMetadata: true,
			noDiscArtBg: true,
			labelArtOnBg: false
		};

		/** @public @type {object} 选项 > 详情 设置配置名称说明。 */
		this.themeDetailsComments = {
			showDiscArtStub: 'Values: true, false - Options > Details > Disc art > Disc art placeholder > Show placeholder if no disc art found',
			noDiscArtStub: 'Values: true, false - Options > Details > Disc art > Disc art placeholder > No placeholder',
			discArtStub: 'Values: "cdAlbumCover", "cdWhite", "cdBlack", "cdBlank", "cdTrans", "vinylAlbumCover", "vinylWhite", "vinylVoid", "vinylColdFusion", "vinylRingOfFire", "vinylMaple", "vinylBlack", "vinylBlackHole", "vinylEbony", "vinylTrans" - Options > Details > Disc art > Disc art placeholder',
			displayDiscArt: 'Values: true, false - Options > Details > Disc art > Display disc art',
			discArtAnimation: 'Values: true, false - Options > Details > Disc art > Enable disc entry and exit animation',
			discArtEjectStyle: 'Values: "progressive", "fast" - Options > Details > Disc art > Disc eject animation style (default: progressive)',
			discArtOnTop: 'Values: true, false - Options > Details > Disc art > Display disc art above cover',
			discArtEmbedded: 'Values: true, false - Options > Details > Disc art > Display embedded disc art if available',
			spinDiscArt: 'Values: true, false - Options > Details > Disc art > Spin disc art while songs play (increases memory and CPU)',
			spinDiscArtImageCount: 'Values: 36, 45, 60, 72, 90, 120, 180, 360 - Options > Details > Disc art > # Rotation images (memory usage/rotational speed)',
			spinDiscArtRedrawInterval: 'Values: 250, 200, 150, 125, 100, 75, 50, 40, 30, 20, 10 - Options > Details > Disc art > Spinning disc art redraw speed',
			rotateDiscArt: 'Values: true, false - Options > Details > Disc art > Rotate disc art as tracks change',
			rotationAmt: 'Values: 2, 3, 4, 5 - Options > Details > Disc art > Disc art rotation amount',
			artRotateDelay: 'Values: free to choose - not in Options - seconds to display each art',
			discArtDisplayAmount: 'Values: 1, 0.6, 0.5, 0.4, 0.3, 0.2, 0 - Options > Details > Disc art > Disc visible ratio (default: 0.5)',
			detailsAlbumArtOpacity: 'Values: 255, 230, 204, 178, 153, 128, 102, 76, 51, 25 - from 100% - 10% - Options > Details > Album art > Full artwork opacity',
			detailsAlbumArtDiscAreaOpacity: 'Values: 255, 230, 204, 178, 153, 128, 102, 76, 51, 25 - from 100% - 10% - Options > Details > Album art > Disc area opacity',
			showGridArtist_default: 'Values: true, false - Options > Details > Metadata grid > Show artist - when Default layout is active',
			showGridArtist_artwork: 'Values: true, false - Options > Details > Metadata grid > Show artist - when Artwork layout is active',
			showGridTrackNum_default: 'Values: true, false - Options > Details > Metadata grid > Show track number - when Default layout is active',
			showGridTrackNum_artwork: 'Values: true, false - Options > Details > Metadata grid > Show track number - when Artwork layout is active',
			showGridTitle_default: 'Values: true, false - Options > Details > Metadata grid > Show track title - when Default layout is active',
			showGridTitle_artwork: 'Values: true, false - Options > Details > Metadata grid > Show track title - when Artwork layout is active',
			showGridPlayingPlaylist: 'Values: true, false - Options > Details > Metadata grid > Show playing playlist',
			showGridTimeline_default: 'Values: true, false - Options > Details > Metadata grid > Show timeline - when Default layout is active',
			showGridTimeline_artwork: 'Values: true, false - Options > Details > Metadata grid > Show timeline - when Artwork layout is active',
			showGridArtistFlags_default: 'Values: true, false - Options > Details > Metadata grid > Show artist country flags - when Default layout is active',
			showGridArtistFlags_artwork: 'Values: true, false - Options > Details > Metadata grid > Show artist country flags - when Artwork layout is active',
			showGridReleaseFlags_default: 'Values: false, logo, textlogo - Options > Details > Metadata grid > Show release country flags - when Default layout is active',
			showGridReleaseFlags_artwork: 'Values: false, logo, textlogo - Options > Details > Metadata grid > Show release country flags - when Artwork layout is active',
			showGridCodecLogo_default: 'Values: false, logo, textlogo - Options > Details > Metadata grid > Show codec logo - when Default layout is active',
			showGridCodecLogo_artwork: 'Values: false, logo, textlogo - Options > Details > Metadata grid > Show codec logo - when Artwork layout is active',
			showGridChannelLogo_default: 'Values: false, logo, textlogo - Options > Details > Metadata grid > Show channel logo - when Default layout is active',
			showGridChannelLogo_artwork: 'Values: false, logo, textlogo - Options > Details > Metadata grid > Show channel logo - when Artwork layout is active',
			autoHideGridMetadata: 'Values: true, false - Options > Details > Metadata grid > Auto-hide full metadata on small player',
			noDiscArtBg: 'Values: true, false - Options > Details > Background > Show full background when no disc art',
			labelArtOnBg: 'Values: true, false - Options > Details > Background > Show label art on background'
		};

		/** @public @type {object} 选项 > 详情 设置配置页眉说明。 */
		this.themeDetailsSchema = new ConfigurationObjectSchema('themeDetails', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 详情:                                                                                                                                                                                                 ' +
			'* 顶部菜单 选项 > 详情                                                                                                                                                                                  ' +
			'* 您可以在将要使用的各种详细信息设置之间进行设置和选择。                                                                                                                                                ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，这些设置将自动设置                                                                                                                 ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/**
		 * @typedef {object} MetadataGridEntry
		 * @property {string} 显示在元数据表格左列中的标签文本
		 * @property {string} val 计算了右列中的文本。如果计算结果为空字符串，则不显示该条目。
		 * @property {boolean} 如果日期为 True，则将“（1y 10m，23d）”样式文本附加到计算值。仅对日期字符串有效
		 * @property {string} 注释.jsonc 文件选项注释。
		 */
		/** @public @type {MetadataGridEntry[]} 元数据表格默认条目和值。 */
		this.metadataGridDefaults = [
			{ label: '碟片',           val: `$if(${this.titleFormatDefaults.disc_subtitle},[碟 %discnumber% ${Unicode.EnDash} ]${this.titleFormatDefaults.disc_subtitle})` },
			{ label: '发行类型',       val: '$if($stricmp(%releasetype%,Album),,[%releasetype%])' },
			{ label: '年份',           val: `$puts(d,${this.titleFormatDefaults.date})$if($strcmp($year($get(d)),$get(d)),$get(d),)`, comment: '时间格式是 YYYY 显示\'年份\'' },
			{ label: '发行日期',       val: `$puts(d,${this.titleFormatDefaults.date})$if($strcmp($year($get(d)),$get(d)),,$get(d))`, age: true, comment: '时间格式是 YYYY-MM-DD 显示\'发行日期\'' },
			{ label: '版本',           val: this.titleFormatDefaults.edition },
			{ label: '唱片公司',       val: `[$if($meta(label),$meta_sep(label, ${Unicode.MiddleDot} ),$if3(%publisher%,%discogs_label%,))]`, comment: '发行专辑的唱片公司或发行商。' },
			{ label: '目录',           val: `$puts(cn,$if3(%catalognumber%,%catalog%,%discogs_catalog%,))[$if($get(cn),$get(cn)[ / ${this.titleFormatDefaults.releaseCountry}],)]` },
			{ label: '发行地区',       val: `$puts(cn,$if3(%catalognumber%,%catalog%,%discogs_catalog%,))[$if($get(cn),,$replace(${this.titleFormatDefaults.releaseCountry},XW,))]`, comment: '仅当 %catalognumber% 或 %discogs_catalog% 不存在时显示。如果发布国家是全世界（\'XW\），则隐藏该值。' },
			{ label: '音轨',           val: '$if(%tracknumber%,$num(%tracknumber%,1)$if(%totaltracks%,/$num(%totaltracks%,1))$ifgreater(%totaldiscs%,1,   CD %discnumber%/$num(%totaldiscs%,1),)' },
			{ label: '流派',           val: `[$meta_sep(genre, ${Unicode.MiddleDot} )]` },
			{ label: '风格',           val: `[$meta_sep(style, ${Unicode.MiddleDot} )]` },
			{ label: '发行',           val: '[%release%]' },
			{ label: '编解码',         val: '[%codec%]' },
			{ label: '声道',           val: '[%channels%]' },
			{ label: '来源',           val: `[%codec_profile%$if(%__bitspersample%, ${Unicode.MiddleDot} )]$if($strcmp(%__encoding%,lossless),%__bitspersample% bit)$ifgreater(%samplerate%,44100,$if($if2(%codec_profile%,%__bitspersample%), ${Unicode.MiddleDot} )$div(%samplerate%,1000)$replace($insert($right($div(%samplerate%,100),1),.,0),.0,) kHz,)[ ${Unicode.MiddleDot} $if3(%media%,%mediatype%,%media type%)]` },
			{ label: '数据',           val: `%__bitrate% kbps ${Unicode.MiddleDot} $if($or($stricmp($ext(%filename_ext%),cue),$strcmp($info(cue_embedded),yes)), CUE,[%filesize_natural%])` },
			{ label: '添加时间',       val: '[$if2(%added_enhanced%,%added%)]', age: true },
			{ label: '最近播放',       val: `[${this.titleFormatDefaults.last_played}]`, age: true },
			{ label: '热门',           val: "$puts(X,5)$puts(Y,$div(%_dynamic_rating%,400))$repeat($repeat(I,$get(X))   ,$div($get(Y),$get(X)))$repeat(I,$mod($get(Y),$get(X)))$ifgreater(%_dynamic_rating%,0,   $replace($div(%_dynamic_rating%,1000)'.'$mod($div(%_dynamic_rating%,100),10),0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9),)" },
			{ label: '浏览量',         val: '[%fy_view_count%]' },
			{ label: '喜欢',           val: `[$if(%fy_like_count%,%fy_like_count% ${Unicode.BlackUpTriangle} / %fy_dislike_count% ${Unicode.BlackDownTriangle},)]` },
			{ label: '播放次数',       val: '$if($or(%play_count%,%lastfm_play_count%),$puts(X,5)$puts(Y,$max(%play_count%,%lastfm_play_count%))$ifgreater($get(Y),30,,$repeat($repeat(I,$get(X)) ,$div($get(Y),$get(X)))$repeat(I,$mod($get(Y),$get(X)))   )$get(Y))' },
			{ label: '评级',           val: `$if(%rating%,$repeat(${Unicode.BlackStar} ,%rating%))` },
			{ label: '喜爱',           val: '$if(%mood%,$puts(X,5)$puts(Y,$mul(5,%mood%))$repeat($repeat(I,$get(X))   ,$div($get(Y),$get(X)))$repeat(I,$mod($get(Y),$get(X)))$replace(%mood%,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9))' },
			{ label: '播放列表',       val: this.titleFormatDefaults.playing_playlist },
			{ label: '空白 01',        val: '' },
			{ label: '空白 02',        val: '' },
			{ label: '空白 03',        val: '' },
			{ label: '空白 04',        val: '' },
			{ label: '空白 05',        val: '' },
			{ label: '空白 06',        val: '' },
			{ label: '空白 07',        val: '' },
			{ label: '空白 08',        val: '' }
		];

		/** @public @type {object} 元数据表格配置页眉说明。 */
		this.metadataGridSchema = new ConfigurationObjectSchema('metadataGrid', ConfigurationObjectType.Array, [
			{ name: 'label' },
			{ name: 'val' },
			{ name: 'age', optional: true }],
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 元数据表格详情:                                                                                                                                                                                       ' +
			'* 您可以添加新标签或重新排序条目，这些条目将显示在顶部菜单“详情”的元数据表格中。                                                                                                                        ' +
			'* 如果“详情”中的条目太多且没有可用空间，则标签将被隐藏。您可以更改为更大的播放器大小。                                                                                                                  ' +
			'* 计算为空字符串的条目将不会显示在表格中。                                                                                                                                                              ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，则不会自动设置这些设置                                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 曲库 * //
		// #region LIBRARY
		/** @public @type {object} 选项 > 曲库 设置默认值。 */
		this.themeLibraryDefaults = {
			libraryLayout: 'normal',
			libraryLayoutFullPreset: false,
			libraryLayoutSplitPreset: false,
			libraryLayoutSplitPreset2: false,
			libraryLayoutSplitPreset3: false,
			libraryLayoutSplitPreset4: false,
			libraryMode: 'albumGrid',
			libraryDesign: 'reborn',
			libraryTheme: 0,
			libraryThumbnailSize: 'auto',
			libraryThumbnailBorder: 'border',
			albumArtShow: true,
			itemOverlayType: 0,
			albumArtLetter: true,
			albumArtLetterNo: 1,
			artId: 0,
			albumArtGrpLevel: 0,
			imgStyleFront: 1,
			imgStyleBack: 1,
			imgStyleDisc: 1,
			imgStyleIcon: 1,
			imgStyleArtist: 1,
			albumArtLabelType: 1,
			albumArtFlipLabels: false,
			albumArtTextAlign: 0,
			libraryBgImg: false,
			libraryBgImgCycle: true,
			libraryBgImgCycleTime: 15,
			libraryBgImgSource: 'artist',
			libraryBgImgAlbumArtFilter: true,
			libraryBgImgScale: 'filled',
			libraryBgImgOpacity: 51,
			libraryBgRowOpacity: 128,
			actionMode: 0,
			clickAction: 0,
			dblClickAction: 1,
			mbtnClickAction: 1,
			altClickAction: 1,
			autoPlay: true,
			keyAction: 0,
			rememberTree: false,
			artTreeSameView: true,
			presetLoadCurView: true,
			rootNode: 3,
			nodeCounts: 1,
			countsRight: true,
			autoCollapse: false,
			treeAutoExpand: false,
			treeAutoExpandSingle: true,
			itemShowStatistics: 0,
			highLightNowplaying: true,
			showTracks: true,
			rowStripes: false,
			fullLineSelection: true,
			libraryRowHover: true,
			filterBy: 0,
			sortOrder: 'default',
			yearBeforeAlbum: true,
			albumArtViewBy: 0,
			treeViewBy: 0,
			explorerAlbumImgScaling: 'cropped',
			explorerAlbumThumbImgScaling: 'cropped',
			explorerArtistImgScaling: 'cropped',
			explorerArtistThumbImgScaling: 'cropped',
			explorerFullThemeColorChange: true,
			explorerArtworkCycle: true,
			explorerArtworkCycleTime: 15000,
			explorerPlaybackKeepPlaylist: true,
			explorerWheelOutsideClose: true,
			explorerTreeView: false,
			explorerCloseButtonAlways: false,
			explorerTabIconsOnly: false,
			explorerTabIconNowPlaying: false,
			explorerExternalLinkIcon: true,
			explorerAlbumYearType: 'overlay',
			explorerShowTrackRatingGrid: true,
			explorerShowDifferentArtist: false,
			explorerShowDiscHeader: true,
			explorerAlbumImageDLAuto: true,
			explorerAlbumImageDLQuality: 'original',
			explorerAlbumImageNameMoveToDir: 'folder',
			explorerAlbumImageAutoAction: 'move',
			explorerArtistImageDLAuto: true,
			explorerArtistImageDLCount: 10,
			explorerArtistImageDLQuality: 'original',
			explorerMissingReleasesImageDLAuto: true,
			explorerSimilarArtistImageDLAuto: true,
			explorerMissingReleasesFetchSource: 'discogs',
			explorerPopularityFetchSource: 'lastfm',
			explorerSimilarArtistView: 'local',
			explorerSimilarArtistFetchSource: 'lastfm',
			explorerSimilarArtistFetchLimitExternal: 50,
			explorerSortDirAlbum: 'ASC',
			explorerSortDirArtist: 'ASC',
			explorerSortDirSimilar: 'DSC',
			explorerSortAlbum: 'Track number',
			explorerSortArtist: 'Year',
			explorerSortSimilar: 'Similarity',
			explorerStatsAlbum: 'playcount',
			explorerStatsArtist: 'rating',
			explorerStatsSimilar: 'rating',
			librarySource: 1,
			librarySourceFixedPlaylist: false,
			librarySourceFixedPlaylistName: '',
			libraryViewBy: 1,
			libraryViews: JSON.stringify([]),
			libraryFilters: JSON.stringify([])
		};

		/** @public @type {object} 选项 > 曲库 设置配置名称说明。*/
		this.themeLibraryComments = {
			libraryLayout: 'Values: "normal", "full", "split" - Options > Library > Layout',
			libraryLayoutFullPreset: 'Values: true, false - Options > Library > Layout > Use full preset',
			libraryLayoutSplitPreset: 'Values: true (only one split preset can be active), false - Options > Library > Layout > Use split preset (collapse)',
			libraryLayoutSplitPreset2: 'Values: true (only one split preset can be active), false - Options > Library > Layout > Use split preset (text)',
			libraryLayoutSplitPreset3: 'Values: true (only one split preset can be active), false - Options > Library > Layout > Use split preset (art grid)',
			libraryLayoutSplitPreset4: 'Values: true (only one split preset can be active), false - Options > Library > Layout > Use split preset (art header)',
			libraryMode: 'Values: "tree", "albumGrid", "artistGrid" - Options > Library > Mode',
			libraryDesign: 'Values: "reborn", "traditional", "modern", "ultraModern", "clean", "facet", "coversLabelsRight", "coversLabelsBottom", "coversLabelsBlend", "flowMode" - Options > Library > Design',
			libraryTheme: 'Values: 0, 1, 2, 3, 4, 5 - Options > Library > Theme',
			libraryThumbnailSize: 'Values: "auto", "playlist", 0, 1, 2, 3, 4, 5, 6, 7 - Options > Library > Album art > Thumbnail size',
			libraryThumbnailBorder: 'Values: "none", "border", "shadow" - Options > Library > Album art > Thumbnail border',
			albumArtShow: 'Values: true, false - Options > Library > Album art > Activate option or change design to album art',
			itemOverlayType: 'Values: 0, 1, 2 - Options > Library > Album art > Overlay',
			albumArtLetter: 'Values: true, false - Options > Library > Album art > Index > Show on scrollbar drag',
			albumArtLetterNo: 'Values: 0, 1 - Options > Library > Album art > Index',
			artId: 'Values: 0, 1, 2, 3, 4 - Options > Library > Album art > View',
			albumArtGrpLevel: 'Values: 0, 1, 2 - Options > Library > Album art > View',
			imgStyleFront: 'Values: 0, 1, 2 - Options > Library > Album art > Image > Front',
			imgStyleBack: 'Values: 0, 1, 2 - Options > Library > Album art > Image > Back',
			imgStyleDisc: 'Values: 0, 1, 2 - Options > Library > Album art > Image > Disc',
			imgStyleIcon: 'Values: 0, 1, 2 - Options > Library > Album art > Image > Icon',
			imgStyleArtist: 'Values: 0, 1, 2 - Options > Library > Album art > Image > Artist',
			albumArtLabelType: 'Values: 1, 2, 3, 4, 0 - Options > Library > Album art > Labels',
			albumArtFlipLabels: 'Values: true, false - Options > Library > Album art > Labels > Flip',
			albumArtTextAlign: 'Values: 0, 1, 2 - Options > Library > Album art > Labels > Text alignment',
			libraryBgImg: 'Values: true, false - Options > Library > Background > Show image on background',
			libraryBgImgCycle: 'Values: true, false - Options > Library > Background > Cycle images',
			libraryBgImgCycleTime: 'Values: 5, 10, 15, 30, 60 - Options > Library > Background > Cycle time',
			libraryBgImgSource: 'Values: "artist", "album", "custom" - Options > Library > Background > Image source',
			libraryBgImgAlbumArtFilter: 'Values: true, false - Options > Library > Background > Image source > Filter album art images',
			libraryBgImgScale: 'Values: "default", "filled", "stretched" - Options > Library > Background > Image scaling',
			libraryBgImgOpacity: 'Values: 255, 230, 204, 178, 153, 128, 102, 76, 51, 25 - from 100% - 10% - Options > Library > Background > Image opacity',
			libraryBgRowOpacity: 'Values: 255, 230, 204, 178, 153, 128, 102, 76, 51, 25 - from 100% - 10% - Options > Library > Background > Row opacity',
			actionMode: 'Values: 0, 1, 2 - Options > Library > Controls > Action mode',
			clickAction: 'Values: 0, 1, 2, 3 - Options > Library > Controls > Single-click action',
			dblClickAction: 'Values: 0, 1, 2, 3 - Options > Library > Controls > Double-click action',
			mbtnClickAction: 'Values: 0, 1, 2 - Options > Library > Controls > Middle-mouse click action',
			altClickAction: 'Values: 0, 1, 2 - Options > Library > Controls > Alt + mouse click action',
			autoPlay: 'Values: true, false - Options > Library > Controls > Keystroke action > Play on Enter or send from menu',
			keyAction: 'Values: 0, 1 - Options > Library > Controls > Keystroke action',
			rememberTree: 'Values: true, false - Options > Library > Controls > Always remember library state',
			artTreeSameView: 'Values: true, false - Options > Library > Controls > Always load View by same as tree',
			presetLoadCurView: 'Values: true, false - Options > Library > Controls > Always load preset with current view pattern',
			rootNode: 'Values: 0, 1, 2, 3 - Options > Library > Track row > Node root type',
			nodeCounts: 'Values: 0, 1, 2 - Options > Library > Track row > Node item counts',
			countsRight: 'Values: true, false - Options > Library > Track row > Node item counts position',
			autoCollapse: 'Values: true, false - Options > Library > Track row > Node auto collapse',
			treeAutoExpand: 'Values: true, false - Options > Library > Track row > Node auto expand',
			treeAutoExpandSingle: 'Values: true, false - Options > Library > Track row > Node auto expand single items',
			itemShowStatistics: 'Values: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 - Options > Library > Track row > Statistics',
			highLightNowplaying: 'Values: true, false - Options > Library > Track row > Show now playing',
			showTracks: 'Values: true, false - Options > Library > Track row > Show tracks when expanding nodes',
			rowStripes: 'Values: true, false - Options > Library > Track row > Show row stripes',
			fullLineSelection: 'Values: true, false - Options > Library > Track row > Row fully clickable',
			libraryRowHover: 'Values: true, false - Options > Library > Track row > Row mouse hover',
			filterBy: 'Values: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 - Options > Library > Filter order',
			sortOrder: 'Values: 0, 1, 2, 3, 4 - Options > Library > Sort order',
			yearBeforeAlbum: 'Values: true, false - Options > Library > Sort order',
			albumArtViewBy: 'Values: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 - Options > Library > View order',
			treeViewBy: 'Values: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 - Options > Library > View order',
			explorerAlbumImgScaling: 'Values: "cropped", "stretched", "proportional" - Options > Library > Explorer > Artwork > Album image scaling',
			explorerAlbumThumbImgScaling: 'Values: "cropped", "stretched", "proportional" - Options > Library > Explorer > Artwork > Album thumb scaling',
			explorerArtistImgScaling: 'Values: "cropped", "stretched", "proportional" - Options > Library > Explorer > Artwork > Artist image scaling',
			explorerArtistThumbImgScaling: 'Values: "cropped", "stretched", "proportional" - Options > Library > Explorer > Artwork > Artist thumb scaling',
			explorerFullThemeColorChange: 'Values: true, false - Options > Library > Explorer > Artwork > Full theme color change on new artwork',
			explorerArtworkCycle: 'Values: true, false - Options > Library > Explorer > Artwork > Artwork cycle',
			explorerArtworkCycleTime: 'Values: 5000, 10000, 15000, 30000, 60000 - Options > Library > Explorer > Artwork > Artwork cycle time',
			explorerPlaybackKeepPlaylist: 'Values: true, false - Options > Library > Explorer > Controls > Keep playlist when playing',
			explorerWheelOutsideClose: 'Values: true, false - Options > Library > Explorer > Controls > Close on outside mouse wheel',
			explorerTreeView: 'Values: true, false - Options > Library > Explorer > Display > Display explorer in tree view',
			explorerCloseButtonAlways: 'Values: true, false - Options > Library > Explorer > Display > Display close button always',
			explorerTabIconsOnly: 'Values: true, false - Options > Library > Explorer > Display > Display tab icons only',
			explorerTabIconNowPlaying: 'Values: true, false - Options > Library > Explorer > Display > Display tab icon NowPlaying',
			explorerExternalLinkIcon: 'Values: true, false - Options > Library > Explorer > Display > Display link icon in grid',
			explorerAlbumYearType: 'Values: "overlay", "text", "disable" - Options > Library > Explorer > Display > Album year in grid',
			explorerShowTrackRatingGrid: 'Values: true, false - Options > Library > Explorer > Display > Show track rating grid',
			explorerShowDifferentArtist: 'Values: true, false - Options > Library > Explorer > Display > Show artist name on difference',
			explorerShowDiscHeader: 'Values: true, false - Options > Library > Explorer > Display > Show disc sub-header',
			explorerAlbumImageDLAuto: 'Values: true, false  - Options > Library > Explorer > Downloads > Album image auto-downloads',
			explorerAlbumImageDLQuality: 'Values: "medium", "original" - Options > Library > Explorer > Downloads > Album image download quality',
			explorerAlbumImageNameMoveToDir: 'Values: "cover", "folder", "front" - Options > Library > Explorer > Downloads > Album image name saved in album folder',
			explorerAlbumImageAutoAction: 'Values: "disabled", "embed", "move" - Options > Library > Explorer > Downloads > Album image post-download action',
			explorerArtistImageDLAuto: 'Values: true, false - Options > Library > Explorer > Downloads > Artist image auto-downloads',
			explorerArtistImageDLCount: 'Values: 1, 5, 10, 15, 20 - Options > Library > Explorer > Downloads > Artist image download count',
			explorerArtistImageDLQuality: 'Values: "medium", "original" - Options > Library > Explorer > Downloads > Artist image download quality',
			explorerMissingReleasesImageDLAuto: 'Values: true, false - Options > Library > Explorer > Downloads > Missing releases image auto-downloads',
			explorerSimilarArtistImageDLAuto: 'Values: true, false - Options > Library > Explorer > Downloads > Similar artist image auto-downloads',
			explorerMissingReleasesFetchSource: 'Values: "discogs", "lastfm", "musicbrainz" - Options > Library > Explorer > Missing Releases > Source',
			explorerPopularityFetchSource: 'Values: "lastfm", "listenbrainz" - Options > Library > Explorer > Popularity > Source',
			explorerSimilarArtistView: 'Values: "local", "external" - Options > Library > Explorer > Similar Artists > View',
			explorerSimilarArtistFetchSource: 'Values: "lastfm", "listenbrainz" - Options > Library > Explorer > Similar Artists > Source',
			explorerSimilarArtistFetchLimitExternal: 'Values: 10, 25, 50, 100, 250 - Options > Library > Explorer > Similar Artists > Fetch limit (external)',
			explorerSortDirAlbum: 'Values: "ASC", "DSC" - Options > Library > Explorer > Sort > Album view',
			explorerSortDirArtist: 'Values: "ASC", "DSC" - Options > Library > Explorer > Sort > Artist view',
			explorerSortDirSimilar: 'Values: "ASC", "DSC" - Options > Library > Explorer > Sort > Similar artist view',
			explorerSortAlbum: 'Values: "Track number", "Track title", "Track rating", "Playcount", "Queue", "Added", "First played", "Last played" - Options > Library > Explorer > Sort > Album view',
			explorerSortArtist: 'Values: "Album title", "Album rating", "Playcount", "Track count", "Year", "Added", "First played", "Last played" - Options > Library > Explorer > Sort > Artist view',
			explorerSortSimilar: 'Values: "Similarity", "Artist name", "Playcount", "Track count", "Added", "First played", "Last played"- Options > Library > Explorer > Sort > Similar artist view',
			explorerStatsAlbum: 'Values: "bitrate", "duration", "size", "rating", "popularity", "date", "queue", "playcount", "trackcount", "firstPlayed", "lastPlayed", "added", "none" - Options > Library > Explorer > Stats > Album view',
			explorerStatsArtist: 'Values: "bitrate", "duration", "size", "rating", "popularity", "date", "queue", "playcount", "trackcount", "firstPlayed", "lastPlayed", "added", "none" - Options > Library > Explorer > Stats > Artist view',
			explorerStatsSimilar: 'Values: "bitrate", "duration", "size", "rating", "popularity", "date", "queue", "playcount", "trackcount", "firstPlayed", "lastPlayed", "added", "none" - Options > Library > Explorer > Stats > Similar artist view',
			librarySource: 'Values: 0, 1 - Options > Library > Source',
			librarySourceFixedPlaylist: 'Values: true, false - not in Options, managed by Library source menu',
			librarySourceFixedPlaylistName: 'Values: "selected playlist name" - not in Options, managed by Library source menu',
			libraryViewBy: 'Currently active library view index (libSet.viewBy) - not in Options, managed by Library views menu',
			libraryViews: 'JSON string of all saved library view entries (Name // Pattern) - not in Options, managed by Library views config menu',
			libraryFilters: 'JSON string of all saved library filter entries (Name // Query)- not in Options, managed by Library filters config menu',
		};

		/** @public @type {object} 选项 > 曲库 设置配置页眉说明。 */
		this.themeLibrarySchema = new ConfigurationObjectSchema('themeLibrary', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 曲库:                                                                                                                                                                                                 ' +
			'* 顶部菜单 选项 > 曲库                                                                                                                                                                                  ' +
			'* 您可以在将要使用的各种曲库设置之间进行设置和选择。                                                                                                                                                    ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，这些设置将自动设置                                                                                                                 ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 简介 * //
		// #region BIOGRAPHY
		/** @public @type {object} 选项 > 简介 设置默认值。 */
		this.themeBiographyDefaults = {
			biographyLayout: 'normal',
			biographyLayoutFullPreset: false,
			style: 0,
			filmStripPos: 3,
			filmStripOverlay: false,
			biographyTheme: 0,
			biographyDisplay: 'Image+text',
			showFilmStrip: false,
			imgSeekerShow: 0,
			heading: 1,
			summaryShow: true,
			summaryCompact: true,
			artistView: true,
			focus: false,
			lockBio: false,
			biographyBgImg: false,
			biographyBgImgCycle: true,
			biographyBgImgCycleTime: 15,
			biographyBgImgSource: 'album',
			biographyBgImgAlbumArtFilter: true,
			biographyBgImgScale: 'filled',
			biographyBgImgOpacity: 51,
			biographyBgRowOpacity: 128,
			lyricsScrollEasing: 'easeOutQuad',
			lyricsDropShadowLevel: 'normal',
			lyricsFadeScroll: true,
			lyricsTransparentMask: 0,
			lyricsLargerCurrentSync: true,
			lyricsLineSpacing: 24,
			lyricsSentenceSpacing: 14,
			lyricsScrollSpeed: 'normal',
			lyricsScrollAdaptive: true,
			lyricsScrollRateAvg: 750,
			lyricsScrollRateMax: 375,
			lyricsTranslation: true,
			lyricsTranslationHighlightMode: 1,
			lyricsTranslationCurrentOnly: false,
			lyricsTranslationScrollReveal: false,
			lyricsTranslationRevealDuration: 500,
			lyricsTranslationRevealCollapse: 0,
			sourceAll: false,
			classicalMusicMode: false,
			cycPhotoLocation: 0,
			covType: 0,
			loadCovAllFb: false,
			loadCovFolder: false,
			artStyleDual: 1,
			artReflDual: false,
			artShadowDual: false,
			covStyleDual: 1,
			covReflDual: false,
			covShadowDual: false,
			artStyleImgOnly: 1,
			artReflImgOnly: false,
			artShadowImgOnly: false,
			covStyleImgOnly: 1,
			covReflImgOnly: false,
			covShadowImgOnly: false,
			filmPhotoStyle: 1,
			filmCoverStyle: 1,
			photoNum: 10,
			cycPic: true,
			imgSmoothTrans: false,
			cycTimePic: 15
		};

		/** @public @type {object} 选项 > 简介 设置配置名称说明。 */
		this.themeBiographyComments = {
			biographyLayout: 'Values: "normal", "full" - Options > Biography > Layout',
			biographyLayoutFullPreset: 'Values: true, false - Options > Biography > Layout > Use full preset',
			style: 'Values: 0, 1, 2, 3, 4, 5 - Options > Biography > Layout',
			filmStripPos: 'Values: 0, 1, 2, 3 - Options > Biography > Layout > Filmstrip',
			filmStripOverlay: 'Values: true, false - Options > Biography > Layout > Filmstrip > Overlay image area',
			biographyTheme: 'Values: 0, 1, 2, 3 - Options > Biography > Theme',
			biographyDisplay: 'Values: "Image+text", "Image", "Text" - Options > Biography > Display',
			showFilmStrip: 'Values: true, false - Options > Biography > Display',
			imgSeekerShow: 'Values: 0, 1 - Options > Biography > Display',
			heading: 'Values: 0, 1 - Options > Biography > Display',
			summaryShow: 'Values: true, false - Options > Biography > Display',
			summaryCompact: 'Values: true, false - Options > Biography > Display',
			artistView: 'Values: true, false - Options > Biography > Display',
			focus: 'Values: true, false - Options > Biography > Display',
			lockBio: 'Values: true, false - Options > Biography > Source > Text',
			biographyBgImg: 'Values: true, false - Options > Biography > Background > Show image on background',
			biographyBgImgCycle: 'Values: true, false - Options > Biography > Background > Cycle images',
			biographyBgImgCycleTime: 'Values: 5, 10, 15, 30, 60 - Options > Biography > Background > Cycle time',
			biographyBgImgSource: 'Values: "artist", "album", "custom" - Options > Biography > Background > Image source',
			biographyBgImgAlbumArtFilter: 'Values: true, false - Options > Biography > Background > Image source > Filter album art images',
			biographyBgImgScale: 'Values: "default", "filled", "stretched" - Options > Biography > Background > Image scaling',
			biographyBgImgOpacity: 'Values: 255, 230, 204, 178, 153, 128, 102, 76, 51, 25 - from 100% - 10% - Options > Biography > Background > Image opacity',
			biographyBgRowOpacity: 'Values: 255, 230, 204, 178, 153, 128, 102, 76, 51, 25 - from 100% - 10% - Options > Biography > Background > Row opacity',
			lyricsScrollEasing: 'Values: "linear", "smoothStep", "smootherStep", "easeOutSine", "easeOutQuad", "easeOutCubic", "easeOutQuart", "easeInOutSine", "easeInOutQuad", "easeInOutCubic" - Options > Biography > Lyrics > Display > Animation',
			lyricsDropShadowLevel: 'Values: "none", "small", "normal", "large" - Options > Biography > Lyrics > Display > Show drop shadow',
			lyricsFadeScroll: 'Values: true, false - Options > Lyrics > Display > Biography > Show fade scroll',
			lyricsTransparentMask: 'Values: 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9 - Options > Biography > Lyrics > Display > Show transparent mask',
			lyricsLargerCurrentSync: 'Values: true, false - Options > Biography > Lyrics > Display > Larger current sync',
			lyricsLineSpacing: 'Values: 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60 - Options > Biography > Lyrics > Spacing > Line',
			lyricsSentenceSpacing: 'Values: 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50 - Options > Biography > Lyrics > Spacing > Sentence',
			lyricsScrollSpeed: 'Values: "fastest", "fast", "normal", "slow", "slowest" - Options > Biography > Lyrics > Scroll speed',
			lyricsScrollAdaptive: 'Values: true, false - Options > Biography > Lyrics > Scroll speed > Adaptive scroll speed',
			lyricsScrollRateAvg: 'Values: false, 300, 500, 750, 1000, 1500 - not in Options, set by lyricsScrollSpeed',
			lyricsScrollRateMax: 'Values: false, 150, 250, 375, 500, 725 - not in Options, set by lyricsScrollSpeed',
			lyricsTranslation: 'Values: true, false - Options > Biography > Lyrics > Translation > Show translation',
			lyricsTranslationHighlightMode: 'Values: 1, 2, 3 - Options > Biography > Lyrics > Translation',
			lyricsTranslationCurrentOnly: 'Values: true, false - Options > Biography > Lyrics > Translation > Show current translation only',
			lyricsTranslationScrollReveal: 'Values: true, false - Options > Biography > Lyrics > Translation > Show all lines while scrolling',
			lyricsTranslationRevealDuration: 'Values: 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 - Options > Biography > Lyrics > Translation > Reveal animation duration',
			lyricsTranslationRevealCollapse: 'Values: 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000 - Options > Biography > Lyrics > Translation > Reveal animation collapse',
			sourceAll: 'Values: true, false - Options > Biography > Source > Text > Amalgamate',
			classicalMusicMode: 'Values: true, false - Options > Biography > Source > Text > Prefer composition (allmusic && wikipedia review)',
			cycPhotoLocation: 'Values: 0, 1, 2 - Options > Biography > Source > Photo',
			covType: 'Values: 0, 1, 2, 3, 4 - Options > Biography > Source > Cover',
			loadCovAllFb: 'Values: true, false - Options > Biography > Source > Cover > Cycle above',
			loadCovFolder: 'Values: true, false - Options > Biography > Source > Cover > Cycle from download folder',
			artStyleDual: 'Values: 0, 1, 2 - Options > Biography > Image > Image + text > Photo',
			artReflDual: 'Values: true, false - Options > Biography > Image > Image + text > Reflection (Photo)',
			artShadowDual: 'Values: true, false - Options > Biography > Image > Image + text > Shadow (Photo)',
			covStyleDual: 'Values: 0, 1, 2 - Options > Biography > Image > Image + text > Cover',
			covReflDual: 'Values: true, false - Options > Biography > Image > Image + text > Reflection (Cover)',
			covShadowDual: 'Values: true, false - Options > Biography > Image > Image + text > Shadow (Cover)',
			artStyleImgOnly: 'Values: 0, 1, 2 - Options > Biography > Image > Image only > Photo',
			artReflImgOnly: 'Values: true, false - Options > Biography > Image > Image only > Reflection (Photo)',
			artShadowImgOnly: 'Values: true, false - Options > Biography > Image > Image only > Shadow (Photo)',
			covStyleImgOnly: 'Values: 0, 1, 2 - Options > Biography > Image > Image only > Cover',
			covReflImgOnly: 'Values: true, false - Options > Biography > Image > Image only > Reflection (Cover)',
			covShadowImgOnly: 'Values: true, false - Options > Biography > Image > Image only > Shadow (Cover)',
			filmPhotoStyle: 'Values: 0, 1, 2 - Options > Biography > Image > Filmstrip > Photo',
			filmCoverStyle: 'Values: 0, 1, 2 - Options > Biography > Image > Filmstrip > Cover',
			photoNum: 'Values: 5, 10, 15, 20 - Options > Biography > Image > Downloads',
			cycPic: 'Values: true, false - Options > Biography > Image > Auto cycle > Auto cycle',
			imgSmoothTrans: 'Values: true, false - Options > Biography > Image > Auto cycle > Smooth transition',
			cycTimePic: 'Values: 5, 10, 15, 30, 60 - Options > Biography > Image > Auto cycle'
		};

		/** @public @type {object} 选项 > 简介 设置配置页眉说明。 */
		this.themeBiographySchema = new ConfigurationObjectSchema('themeBiography', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 简介:                                                                                                                                                                                                 ' +
			'* 顶部菜单 选项 > 简介                                                                                                                                                                                  ' +
			'* 您可以在将要使用的各种简介设置之间进行设置和选择。                                                                                                                                                    ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，这些设置将自动设置                                                                                                                 ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * LYRICS * //
		// #region LYRICS
		/** @public @type {object} 选项 > 歌词 设置默认值。 */
		this.themeLyricsDefaults = {
			lyricsLayout: 'normal',
			lyricsVerticalChineseMode: 'off',
			detailsLyricsDisplayMode: 'cover',
			detailsArcLyricsStyle: 'horizontal',
			detailsArcLyricsSpacing: 100,
			detailsArcLyricsTiltedSpacing: 100,
			immersiveLyricsCoverSoftening: 'soft',
			lyricsVerticalLongLineMode: 'wrap',
			lyricsBgImg: true,
			lyricsBgImgCycle: true,
			lyricsBgImgCycleTime: 15,
			lyricsBgImgSource: 'album',
			lyricsBgImgAlbumArtFilter: true,
			lyricsBgImgScale: 'filled',
			lyricsBgImgOpacity: 51,
			lyricsScrollEasing: 'easeOutQuad',
			lyricsDropShadowLevel: 'normal',
			lyricsFadeScroll: true,
			lyricsTransparentMask: 0,
			lyricsLargerCurrentSync: true,
			lyricsLineAnimationMode: 'standard',
			lyricsKaraokeMode: 'auto',
			lyricsKaraokeStyle: 'duotone',
			lyricsKaraokeBreathMode: 'low',
			lyricsKaraokeSustainMode: 'auto',
			lyricsKaraokeShineMode: 'auto',
			lyricsKaraokeStarMode: 'auto',
			lyricsKaraokeStarStyle: 'hop',
			lyricsKaraokeEmphasisMode: 'off',
			lyricsLongGapPrompt: 'auto',
			lyricsRememberPanelState: false,
			lyricsAutoScrollUnsynced: true,
			lyricsLineSpacing: 40,
			lyricsSentenceSpacing: 30,
			lyricsScrollSpeed: 'normal',
			lyricsScrollAdaptive: true,
			lyricsScrollRateAvg: 750,
			lyricsScrollRateMax: 375,
			lyricsTranslation: true,
			lyricsTranslationHighlightMode: 1,
			lyricsTranslationScale: 1,
			lyricsTranslationOpacity: 1,
			lyricsTranslationSpacing: 1,
			lyricsTranslationCurrentOnly: false,
			lyricsTranslationScrollReveal: false,
			lyricsTranslationRevealDuration: 500,
			lyricsTranslationRevealCollapse: 0
		};

		/** @public @type {object} 选项 > 歌词 设置配置名称说明。*/
		this.themeLyricsComments = {
			lyricsLayout: 'Values: "normal", "full" - 选项 > 歌词 > 布局',
			lyricsVerticalChineseMode: 'Values: "on", "off"; default: "off" - 选项 > 歌词 > 中文传统纵排',
			detailsLyricsDisplayMode: 'Values: "cover", "arc"; default: "cover" - 选项 > 歌词 > 详情页歌词显示方式',
			detailsArcLyricsStyle: 'Values: horizontal, tilted; default: horizontal - 选项 > 歌词 > CD 弧形歌词文字样式',
			detailsArcLyricsSpacing: 'Values: 95, 100, 105; default: 100 - 选项 > 歌词 > CD 水平歌词行间距',
			detailsArcLyricsTiltedSpacing: 'Values: 95, 100, 110; default: 100 - 选项 > 歌词 > CD 倾斜歌词行间距（独立紧凑基准）',
			immersiveLyricsCoverSoftening: 'Values: "soft", "strong"; default: "soft" - 选项 > 歌词 > 背景 > 沉浸模式封面歌词虚化',
		lyricsVerticalLongLineMode: 'Values: "wrap", "auto-shrink"; default: "wrap" - 选项 > 歌词 > 中文传统纵排 > 长句处理',
			lyricsBgImg: 'Values: true, false - Options > Lyrics > Background > Show image on background',
			lyricsBgImgCycle: 'Values: true, false - Options > Lyrics > Background > Cycle images',
			lyricsBgImgCycleTime: 'Values: 5, 10, 15, 30, 60 - Options > Lyrics > Background > Cycle time',
			lyricsBgImgSource: 'Values: "artist", "album", "custom" - Options > Lyrics > Background > Image source',
			lyricsBgImgAlbumArtFilter: 'Values: true, false - Options > Lyrics > Background > Image source > Filter album art images',
			lyricsBgImgScale: 'Values: "default", "filled", "stretched" - Options > Lyrics > Background > Image scaling',
			lyricsBgImgOpacity: 'Values: 255, 230, 204, 178, 153, 128, 102, 76, 51, 25 - from 100% - 10% - Options > Lyrics > Background > Image opacity',
			lyricsScrollEasing: 'Values: "linear", "smoothStep", "smootherStep", "easeOutSine", "easeOutQuad", "easeOutCubic", "easeOutQuart", "easeInOutSine", "easeInOutQuad", "easeInOutCubic" - Options > Lyrics > Display > Animation',
			lyricsDropShadowLevel: 'Values: "none", "small", "normal", "large" - 选项 > 歌词 > 显示 > 显示投影',
			lyricsFadeScroll: 'Values: true, false - 选项 > 歌词 > 显示 > 滚动淡入淡出',
			lyricsTransparentMask: 'Values: 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9 - 选项 > 歌词 > 显示 > 显示透明遮罩；普通歌词与 CD 弧形滚动歌词共用（无遮罩、10%-90%）',
			lyricsLargerCurrentSync: 'Values: true, false - 选项 > 歌词 > 增大高亮字体',
			lyricsLineAnimationMode: 'Values: "off", "soft", "standard", "strong" - 选项 > 歌词 > 显示 > 歌词行动画',
			lyricsKaraokeMode: 'Values: "auto", "off" - 选项 > 歌词 > 显示 > 卡拉 OK 高亮',
			lyricsKaraokeStyle: 'Values: "solid", "gradient", "duotone"; default: "duotone" - 选项 > 歌词 > 显示 > 卡拉 OK 扫亮样式',
			lyricsKaraokeBreathMode: 'Values: "off", "low", "medium"; default: "low" - 选项 > 歌词 > 显示 > 卡拉 OK 当前句呼吸',
			lyricsKaraokeSustainMode: 'Values: "auto", "off"; default: "auto" - 选项 > 歌词 > 显示 > 卡拉 OK 拖音表现',
			lyricsKaraokeShineMode: 'Values: "off", "auto", "strong"; default: "auto" - 选项 > 歌词 > 显示 > 卡拉 OK 流光扫亮',
			lyricsKaraokeStarMode: 'Values: "off", "auto", "strong"; default: "auto" - 选项 > 歌词 > 显示 > 卡拉 OK 星星跳动',
			lyricsKaraokeStarStyle: 'Values: "hop", "pop"; default: "hop" - 选项 > 歌词 > 显示 > 卡拉 OK 星星轨迹',
			lyricsKaraokeEmphasisMode: 'Values: "off", "auto", "strong"; default: "off" - 选项 > 歌词 > 显示 > 卡拉 OK 单字强调',
			lyricsLongGapPrompt: 'Values: "auto", "off"; default: "auto" - 选项 > 歌词 > 显示 > 长间隔／间奏提示',
			lyricsRememberPanelState: 'Values: true, false - 选项 > 歌词 > 记住歌词面板状态',
			lyricsAutoScrollUnsynced: 'Values: true, false - 选项 > 歌词 > 显示 > 自动-滚动未同步歌词',
			lyricsLineSpacing: 'Values: 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60 - Options > Lyrics > Spacing > Line',
			lyricsSentenceSpacing: 'Values: 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50 - Options > Lyrics > Spacing > Sentence',
			lyricsScrollSpeed: 'Values: "fastest", "fast", "normal", "slow", "slowest" - 选项 > 歌词 > 滚动速度',
			lyricsScrollAdaptive: 'Values: true, false - Options > Lyrics > Scroll speed > Adaptive scroll speed',
			lyricsScrollRateAvg: 'Values: false, 300, 500, 750, 1000, 1500 - 不在选项中, 设置由 lyricsScrollSpeed',
			lyricsScrollRateMax: 'Values: false, 150, 250, 375, 500, 725 - 不在选项中, 设置由 lyricsScrollSpeed',
			lyricsTranslation: 'Values: true, false - Options > Lyrics > Translation > Show translation',
			lyricsTranslationHighlightMode: 'Values: 1, 2, 3 - Options > Lyrics > Translation',
			lyricsTranslationScale: 'Values: 0.8, 0.9, 1, 1.1; default: 1 - 选项 > 歌词 > 翻译 > 译文字号',
			lyricsTranslationOpacity: 'Values: 0.6, 0.75, 0.9, 1; default: 1 - 选项 > 歌词 > 翻译 > 译文不透明度',
			lyricsTranslationSpacing: 'Values: 0.9, 1, 1.1, 1.2; default: 1 - 选项 > 歌词 > 翻译 > 原文与译文间距',
			lyricsTranslationCurrentOnly: 'Values: true, false - Options > Lyrics > Translation > Show current translation only',
			lyricsTranslationScrollReveal: 'Values: true, false - Options > Lyrics > Translation > Show all lines while scrolling',
			lyricsTranslationRevealDuration: 'Values: 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 - Options > Lyrics > Translation > Reveal animation duration',
			lyricsTranslationRevealCollapse: 'Values: 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000 - Options > Lyrics > Translation > Reveal animation collapse'
		};

		/** @public @type {object} 选项 > 歌词 设置配置页眉说明。 */
		this.themeLyricsSchema = new ConfigurationObjectSchema('themeLyrics', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 歌词:                                                                                                                                                                                                 ' +
			'* 顶部菜单 选项 > 歌词                                                                                                                                                                                  ' +
			'* 您可以在将要使用的各种歌词设置之间进行设置和选择。                                                                                                                                                    ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，这些设置将自动设置                                                                                                                 ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {array} 歌词文件名默认值。 */
		this.lyricsFilenameDefaults = [
			'%title%',
			'%artist% - %title%',
			'%artist% -%title%',
			'%artist% - %tracknumber%. %title%',
			'%album artist% - %title%',
			'%album artist% -%title%',
			'%tracknumber% - %title%',
			'%tracknumber% - %artist% - %title%',
			'%tracknumber% - %album artist% - %title%'
		];

		/** @public @type {object} 歌词文件名配置页眉说明。 */
		this.lyricsFilenameSchema = new ConfigurationObjectSchema('lyricsFilenamePatterns', ConfigurationObjectType.Array, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 歌词标题格式:                                                                                                                                                                                         ' +
			'* 标题格式定义了歌词文件名的模式。不包括文件扩展名。                                                                                                                                                    ' +
			'* 文件名中不允许的特殊字符（例如/ : "等）将自动从文件名中删除，并替换为下划线。                                                                                                                         ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，则不会自动设置此设置                                                                                                               ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 设置 * //
		// #region SETTINGS
		/** @public @type {object} 选项 > 设置默认值。 */
		this.themeSettingsDefaults = {
			themeDayNightEnabled: false,
			themeDayNightSchedule: '6-18',
			customThemeFonts: false,
			customPreloaderLogo: true,
			customThemeImages: false,
			albumArtDiskCache: true,
			albumArtPreLoad: true,
			customLibraryDir: false,
			libraryAutoDelete: false,
			customBiographyDir: false,
			biographyAutoDelete: false,
			customLyricsDir: false,
			lyricsAutoDelete: false,
			customWaveformBarDir: false,
			waveformBarAutoDelete: false,
			themePerformance: 'balanced',
			rendererMode: 1,
			menuDesign: 'default',
			devTools: false
		};

		/** @public @type {object} 选项 > 设置配置名称说明。 */
		this.themeSettingsComments = {
			themeDayNightEnabled: 'Values: true, false - 选项 > 设置 > 日/夜 > 启用/禁用',
			themeDayNightSchedule: 'Values: 24小时制字符串，例如“6-18” - 选项 > 设置 > 日/夜 > 设置自定义时间范围',
			customThemeFonts: 'Values: true, false - 选项 > 设置 > 主题字体 > 使用自定义主题字体',
			customPreloaderLogo: 'Values: true, false - 选项 > 设置 > 主题图片 > 使用自定义预载图标',
			customThemeImages: 'Values: true, false - 选项 > 设置 > 主题图片 > 使用自定义主题图片',
			albumArtDiskCache: 'Values: true, false - 选项 > 设置 >主题缓存 > 曲库 > 启用磁盘缓存图片',
			albumArtPreLoad: 'Values: true, false - 选项 > 设置 > 主题缓存 > 曲库 > 预加载磁盘缓存图片',
			customLibraryDir: 'Values: true, false - 选项 > 设置 > 主题缓存 > 曲库 > 使用自定义曲库目录',
			libraryAutoDelete: 'Values: true, false - 选项 > 设置 > 主题缓存 > 曲库 > 启动时自动删除曲库缓存',
			customBiographyDir: 'Values: true, false - 选项 > 设置 > 主题缓存 > 简介 > 使用自定义简介目录',
			biographyAutoDelete: 'Values: true, false - 选项 > 设置 > 主题缓存 > 简介 > 启动时自动删除简介缓存',
			customLyricsDir: 'Values: true, false - 选项 > 设置 > 主题缓存 > 歌词 > 使用自定义歌词目录',
			lyricsAutoDelete: 'Values: true, false - 选项 > 设置 > 主题缓存 > 歌词 > 启动时自动删除歌词缓存',
			customWaveformBarDir: 'Values: true, false - 选项 > 设置 > 主题缓存 > 波形条 > 使用自定义波形条目录',
			waveformBarAutoDelete: 'Values: true, false - 选项 > 设置 > 主题缓存 > 波形条 > 启动时自动删除波形条缓存',
			themePerformance: 'Values: "lowestQuality", "lowQuality", "balanced", "highQuality", "highestQuality" - 选项 > 设置 > 主题性能',
			rendererMode: 'Values: 0, 1, - 选项 > 设置 > 渲染器',
			menuDesign: 'Values: "default", "modern" - Options > Settings > Menu',
			devTools: 'Values: true, false - 选项 > 设置 > 开发者工具'
		};

		/** @public @type {object} 选项 > 设置配置页眉说明。 */
		this.themeSettingsSchema = new ConfigurationObjectSchema('themeSettings', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 设置:                                                                                                                                                                                                 ' +
			'* 顶部菜单 选项 > 设置                                                                                                                                                                                  ' +
			'* 您可以在将要使用的各种歌词设置之间进行设置和选择。                                                                                                                                                    ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，这些设置将自动设置                                                                                                                 ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {object} General 设置默认值。 */
		this.settingsDefaults = {
			playlistCustomHeaderInfo: '',
			playlistCustomTitle: '',
			playlistCustomTitleNoHeader: '',
			playlistSortDefault: '$if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortArtistDate_asc: '$if2(%artist sort order%,%album artist%) $if3(%album sort order%,%original release date%,%originaldate%,%date%) %album% %edition% %codec% %discnumber% %tracknumber%',
			playlistSortArtistDate_dsc: '$if2(%artist sort order%,%album artist%) $if3(%album sort order%,$sub(99999,%original release date%),$sub(99999,%originaldate%),$sub(99999,%date%)) %album% %edition% %codec% %discnumber% %tracknumber%',
			playlistSortArtistRating_asc: '%artistrating% $if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortArtistRating_dsc: '$sub(99999,%artistrating%) $if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortArtistPlaycount_asc: '%artistplaycount% $if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortArtistPlaycount_dsc: '$sub(99999,%artistplaycount%) $if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortAlbumTitle: '%album% $if3(%original release date%,%originaldate%,%date%) $if2(%artist sort order%,%album artist%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortAlbumRating_asc: '%albumrating% $if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortAlbumRating_dsc: '$sub(99999,%albumrating%) $if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortAlbumPlaycount_asc: '%albumplaycount% $if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortAlbumPlaycount_dsc: '$sub(99999,%albumplaycount%) $if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortTrackTitle: '%title% $if3(%original release date%,%originaldate%,%date%) $if2(%artist sort order%,%album artist%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortTrackNumber: '%tracknumber% $if3(%original release date%,%originaldate%,%date%) $if2(%artist sort order%,%album artist%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortTrackRating_asc: '%rating% $if3(%original release date%,%originaldate%,%date%) $if2(%artist sort order%,%album artist%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortTrackRating_dsc: '$sub(99999,%rating%) $if3(%original release date%,%originaldate%,%date%) $if2(%artist sort order%,%album artist%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortTrackPlaycount_asc: '%play_count% $if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortTrackPlaycount_dsc: '$sub(99999,%play_count%) $if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortYear_asc: '%year% $if3(%original release date%,%originaldate%,%date%) $if2(%artist sort order%,%album artist%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortYear_dsc: '$sub(99999,%year%) $if3($sub(99999,%original release date%),$sub(99999,%originaldate%),$sub(99999,%date%)) $if2(%artist sort order%,%album artist%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortGenre: '%genre% %artist% %album% %edition% %codec% %discnumber% %tracknumber%',
			playlistSortLabel: '%label% %artist% %album% %edition% %codec% %discnumber% %tracknumber%',
			playlistSortCountry: '%artistcountry% %artist% %album% %edition% %codec% %discnumber% %tracknumber%',
			playlistSortFilePath: '%path_sort% $if3(%original release date%,%originaldate%,%date%) $if2(%artist sort order%,%album artist%) %edition% %codec% %discnumber% %tracknumber%',
			playlistSortCustom: '$if2(%artist sort order%,%album artist%) $if2(%album sort order%,%album%) %date% %codec% %discnumber% %tracknumber%',
			playlistShowBitSampleAlways: false,
			hideCursor: false,
			hidePanelBgWhenCollapsed: false,
			doubleClickRefresh: false,
			showDebugLog: false,
			showDebugThemeLog: false,
			showDebugAPCACalibrationOverlay: false,
			showDebugColorOverlay: false,
			showDebugThemeOverlay: false,
			showDebugPerformanceOverlay: false,
			showPanelContextMenu: false,
			stoppedString1: 'foobar2000',
			stoppedString1acr: 'fb2k',
			stoppedString2: '$replace(%_foobar2000_version%,foobar2000 ,)'
		};

		/** @public @type {object} 一般设置配置名称说明。 */
		this.settingsComments = {
			playlistCustomHeaderInfo: '你可以为播放列表页眉信息使用自己的自定义模式',
			playlistCustomTitle: '你可以为播放列表行使用自己的自定义标题模式',
			playlistCustomTitleNoHeader: '当播放列表页眉未显示时，你可以为播放列表行使用自己的自定义标题模式',
			playlistSortDefault: '选项 > 播放列表 > 排序 > 默认 - 排序模式，对从曲库选择或单击播放列表中的超链接生成的播放列表进行排序',
			playlistSortArtistDate_asc: '选项 > 播放列表 > 排序 > 艺术家 | 日期升序',
			playlistSortArtistDate_dsc: '选项 > 播放列表 > 排序 > 艺术家 | 日期降序',
			playlistSortArtistRating_asc: 'Options > Playlist > Sort order > Artist rating | ascending',
			playlistSortArtistRating_dsc: 'Options > Playlist > Sort order > Artist rating | descending',
			playlistSortArtistPlaycount_asc: 'Options > Playlist > Sort order > Artist playcount | ascending',
			playlistSortArtistPlaycount_dsc: 'Options > Playlist > Sort order > Artist playcount | descending',
			playlistSortAlbumTitle: '选项 > 播放列表 > 排序 > 专辑',
			playlistSortAlbumRating_asc: '选项 > 播放列表 > 排序 > 专辑评级 | 升序',
			playlistSortAlbumRating_dsc: '选项 > 播放列表 > 排序 > 专辑评级 | 降序',
			playlistSortAlbumPlaycount_asc: '选项 > 播放列表 > 排序 > 专辑播放计数 | 升序',
			playlistSortAlbumPlaycount_dsc: '选项 > 播放列表 > 排序 > 专辑播放计数 | 降序',
			playlistSortTrackTitle: '选项 > 播放列表 > 排序 > 标题',
			playlistSortTrackNumber: '选项 > 播放列表 > 排序 > 音轨号',
			playlistSortTrackRating_asc: '选项 > 播放列表 > 排序 > 音轨评级 | 升序',
			playlistSortTrackRating_dsc: '选项 > 播放列表 > 排序 > 音轨评级 | 降序',
			playlistSortTrackPlaycount_asc: '选项 > 播放列表 > 排序 > 音轨播放计数 | 升序',
			playlistSortTrackPlaycount_dsc: '选项 > 播放列表 > 排序 > 音轨播放计数 | 降序',
			playlistSortYear_asc: '选项 > 播放列表 > 排序 > 年份 | 升序',
			playlistSortYear_dsc: '选项 > 播放列表 > 排序 > 年份 | 降序',
			playlistSortGenre: '选项 > 播放列表 > 排序 > 流派',
			playlistSortLabel: '选项 > 播放列表 > 排序 > 唱片公司',
			playlistSortCountry: '选项 > 播放列表 > 排序 > 国家地区',
			playlistSortFilePath: '选项 > 播放列表 > 排序 > 文件路径',
			playlistSortCustom: '选项 > 播放列表 > 排序 > 自定义',
			playlistShowBitSampleAlways: '始终在播放列表上的所有专辑描述中显示编解码器采样率和比特率。',
			hideCursor: '歌曲播放10秒后无鼠标活动时隐藏光标',
			hidePanelBgWhenCollapsed: '播放专辑和播放列表或库视图处于激活状态时隐藏面板背景',
			doubleClickRefresh: '双击例如底栏时将刷新主题',
			showDebugLog: '启用控制台中的额外日志记录。可能不需要，除非您遇到问题或被要求启用它。',
			showDebugThemeLog: '记录确定最初主题颜色算法输出。',
			showDebugAPCACalibrationOverlay: '显示APCA校准调试叠加，用于关键帧颜色微调',
			showDebugColorOverlay: '以叠加方式展示从专辑封面中提取出的颜色的颜色元数据。',
			showDebugThemeOverlay: '在专辑封面上以叠加形式显示各种主题调试日志。',
			showDebugPerformanceOverlay: '在专辑封面上以叠加形式显示各种性能调试日志。',
			showPanelContextMenu: '在面板中单击鼠标右键时显示蜘蛛猴面板上下文菜单',
			stoppedString1: '当没有播放任何内容时，进度条上方显示文本的粗体部分',
			stoppedString1acr: '当没有播放任何内容时，当封面或简单布局处于激活状态时，进度条上方显示的文本的粗体部分',
			stoppedString2: '当没有播放任何内容时，进度条上方显示文本的第二（非粗体）部分'
		};

		/** @public @type {object} 一般设置配置页眉说明。 */
		this.settingsSchema = new ConfigurationObjectSchema('settings', ConfigurationObjectType.Object, /* Will display as key/val pairs with comments attached. */ undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 一般设置:                                                                                                                                                                                             ' +
			'* 这些设置不在顶部菜单选项中。                                                                                                                                                                          ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，则不会自动设置这些设置                                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		/////////////////////////////////////
		// ! GEORGIA-REBORN-自定义默认值 ! //
		/////////////////////////////////////

		// * 自定义曲库目录 * //
		// #region CUSTOM LIBRARY DIRECTORY
		/** @public @type {array} Custom library 缓存目录。 */
		this.customLibraryDirDefaults = [
			'C:\\替换_这个_路径_为_你_新的_曲库\\目录\\'
		];

		/** @public @type {object} Custom library 缓存目录配置页眉说明。 */
		this.customLibraryDirSchema = new ConfigurationObjectSchema('customLibraryDir', ConfigurationObjectType.Array, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 曲库自定义目录:                                                                                                                                                                                       ' +
			'* 您可以设置自己的自定义曲库目录.                                                                                                                                                                       ' +
			'* 替换下面的路径并激活顶部菜单 选项 > 设置 > 主题缓存 > 曲库 > 使用自定义曲库目录。重新启动foobar以生效.                                                                                                ' +
			'* 注意：如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件 ，则不会自动设置此设置                                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 自定义简介目录 * //
		// #region CUSTOM BIOGRAPHY DIRECTORY
		/** @public @type {array} Custom biography 缓存目录。 */
		this.customBiographyDirDefaults = [
			'C:\\替换_这个_路径_为_你_新的_简介\\目录\\'
		];

		/** @public @type {object} Custom biography 缓存目录配置页眉说明。 */
		this.customBiographyDirSchema = new ConfigurationObjectSchema('customBiographyDir', ConfigurationObjectType.Array, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 简介自定义目录:                                                                                                                                                                                       ' +
			'* 您可以设置自己的自定义简介目录.                                                                                                                                                                       ' +
			'* 替换下面的路径并激活顶部菜单 选项 > 设置 > 主题缓存 > 简介 > 使用自定义简介目录。重新启动foobar以生效.                                                                                                ' +
			'* 注意：如果使用顶部菜单“选项”>“设置”>“主题配置”>“保存设置到配置文件”，则不会自动设置此设置                                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 自定义歌词目录 * //
		// #region CUSTOM LYRICS DIRECTORY
		/** @public @type {array} Custom lyrics 缓存目录。 */
		this.customLyricsDirDefaults = [
			'C:\\替换_这个_路径_为_你_新的_歌词\\目录\\'
		];

		/** @public @type {object} Custom lyrics 缓存目录配置页眉说明。 */
		this.customLyricsDirSchema = new ConfigurationObjectSchema('customLyricsDir', ConfigurationObjectType.Array, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 歌词自定义目录:                                                                                                                                                                                       ' +
			'* 您可以设置自己的自定义歌词目录.                                                                                                                                                                       ' +
			'* 在 foobar 的参数选项 > ESLyric > 歌词选项 > 保存位置中更改为自定义的歌词文件夹，并替换下面的路径.                                                                                                     ' +
			'* 激活顶部菜单 选项 > 设置 > 主题缓存 > 歌词 > 使用自定义歌词目录。重新启动foobar以生效。                                                                                                               ' +
			'* 注意：如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，则不会自动设置此设置                                                                                                              ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 自定义波形条目录 * //
		// #region CUSTOM WAVEFORM BAR DIRECTORY
		/** @public @type {array} Custom waveform bar 缓存目录。 */
		this.customWaveformBarDirDefaults = [
			'C:\\替换_这个_路径_为_你_新的_波形\\目录\\'
		];

		/** @public @type {object} Custom waveform bar 缓存目录配置页眉说明。 */
		this.customWaveformBarDirSchema = new ConfigurationObjectSchema('customWaveformBarDir', ConfigurationObjectType.Array, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义波形条目录:                                                                                                                                                                                     ' +
			'* 您可以设置自己的自定义波形条目录.                                                                                                                                                                     ' +
			'* 替换下面的路径并在顶部菜单中激活 选项 > 设置 > 主题缓存 > 波形条 > 使用自定义波形条目录. 重新启动foobar以生效.                                                                                        ' +
			'* 注意：如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，则不会自动设置此设置                                                                                                              ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 自定义网站链接 * //
		// #region CUSTOM WEBSITE LINKS
		/** @public @type {array} Custom website links. */
		this.customWebsiteLinksDefaults = [
			'https://www.website1.com/artist.php?artistname={artist}',
			'https://www.website2.org/title/search&q={title}&album={album}',
			'https://www.website3.net/search?query={artist}+{title}+{album}'
		];

		/** @public @type {object} 自定义网站链接配置页眉说明. */
		this.customWebsiteLinksSchema = new ConfigurationObjectSchema('customWebsiteLinks', ConfigurationObjectType.Array, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义网站链接:                                                                                                                                                                                       ' +
			'* 当行为设置为“打开网站”和“自定义”时，您可以为艺术家底栏按钮设置自己的自定义网站链接。                                                                                                                  ' +
			'* 替换下面的URL，并在顶部菜单“选项”>“播放控制”>“底栏”>“艺术家按钮行为”>“自定义”中激活。重新启动foobar以生效。                                                                                           ' +
			'* 可以使用占位符{artist}、{title}和{album}，在生成URL时，这些占位符将被实际的元数据替换。                                                                                                               ' +
			'* 注意：如果您使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，则不会自动设置此设置                                                                                                            ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * CUSTOM THEME FONTS * //
		// #region CUSTOM THEME FONTS
		/** @public @type {object} 自定义字体默认使用 Open Sans 样式。 */
		this.customFontsDefaults = {
			fontDefault: 'Open Sans',
			fontTopMenu: 'Open Sans SemiBold',
			fontLowerBarArtist: 'Open Sans SemiBold',
			fontLowerBarTitle: 'Open Sans',
			fontLowerBarDisc: 'Open Sans',
			fontLowerBarTime: 'Open Sans SemiBold',
			fontLowerBarLength: 'Open Sans',
			fontLowerBarWave: 'Open Sans SemiBold',
			fontNotification: 'Open Sans',
			fontPopup: 'Open Sans',
			fontTooltip: 'Open Sans',
			fontGridArtist: 'Open Sans',
			fontGridTitle: 'Open Sans',
			fontGridTitleBold: 'Open Sans SemiBold',
			fontGridAlbum: 'Open Sans',
			fontGridKey: 'Open Sans SemiBold',
			fontGridValue: 'Open Sans',
			playlistTitleNormal: 'Open Sans',
			playlistTitleSelected: 'Open Sans',
			playlistTitlePlaying: 'Open Sans SemiBold',
			playlistArtistNormal: 'Open Sans',
			playlistArtistPlaying: 'Open Sans',
			playlistArtistNormalCompact: 'Open Sans SemiBold',
			playlistArtistPlayingCompact: 'Open Sans SemiBold',
			playlistAlbum: 'Open Sans SemiBold',
			playlistDate: 'Open Sans SemiBold',
			playlistDateCompact: 'Open Sans',
			playlistInfo: 'Open Sans',
			playlistCover: 'Open Sans',
			playlistPlaycount: 'Open Sans',
			fontLibrary: 'Open Sans',
			fontBiography: 'Open Sans',
			fontLyrics: 'Open Sans'
		};

		/** @public @type {object} Custom fonts 配置名称说明。 */
		this.customFontsComments = {
			fontDefault: '默认字体: Segoe UI - 在播放列表、库、简介中用作默认和面板相关元素的面板字体',
			fontTopMenu: '默认字体: Segoe UI Semibold - 用于顶部菜单按钮的主题字体',
			fontLowerBarArtist: '默认字体: HARMONYOS SANS SC BLACK - 底栏中使用的主题艺术家字体',
			fontLowerBarTitle: '默认字体: HARMONYOS SANS SC - 底栏中使用的主题标题字体',
			fontLowerBarDisc: '默认字体: HelveticaNeueLT Pro 45 Lt - 底栏中使用的主题碟片字体',
			fontLowerBarTime: '默认字体: HelveticaNeueLT Pro 65 Md - 底栏中使用的主题时间字体',
			fontLowerBarLength: '默认字体: HelveticaNeueLT Pro 45 Lt - 底栏中使用的主题时长字体',
			fontLowerBarWave: '默认字体: HelveticaNeueLT Pro 65 Md - 底栏中使用的主题波形条字体',
			fontNotification: '默认字体: HelveticaNeueLT Pro 65 Md - 跳转搜索和样式指示器中使用的主题提示字体',
			fontPopup: '默认字体: Segoe UI - 自定义主题菜单和主题日志叠加中使用的主题弹窗字体',
			fontTooltip: '默认字体: HelveticaNeueLT Pro 65 Md - 样式化提示框中使用的主题提示框字体',
			fontGridArtist: '默认字体: HelveticaNeueLT Pro 65 Md - 元数据表格中使用的主题艺术家字体（详情）',
			fontGridTitle: '默认字体: HelveticaNeueLT Pro 45 Lt - 元数据表格中使用的主题标题字体（详情）',
			fontGridTitleBold: '默认字体: HelveticaNeueLT Pro 65 Md - 元数据表格中使用的主题标题粗体字体（详情）',
			fontGridAlbum: '默认字体: HelveticaNeueLT Pro 65 Md - 元数据表格中使用的主题专辑字体（详情）',
			fontGridKey: '默认字体: HelveticaNeueLT Pro 55 Roman - 元数据表格中使用的主题键字体（详情）',
			fontGridValue: '默认字体: HelveticaNeueLT Pro 45 Lt - 元数据表格中使用的主题值字体（详情）',
			playlistTitleNormal: '默认字体: Segoe UI - 播放列表行中使用的标题字体，常规状态',
			playlistTitleSelected: '默认字体: Segoe UI - 播放列表行中使用的标题字体，选定状态',
			playlistTitlePlaying: '默认字体: Segoe UI - 播放列表行中使用的标题字体，播放状态',
			playlistArtistNormal: '默认字体: Segoe UI Semibold - 播放列表页眉中使用的艺术家字体，常规状态',
			playlistArtistPlaying: '默认字体: Segoe UI Semibold - 播放列表页眉中使用的艺术家字体，播放状态 - 默认字体',
			playlistArtistNormalCompact: '默认字体: Segoe UI Semibold - 播放列表页眉简单模式中使用的艺术家字体，常规状态',
			playlistArtistPlayingCompact: '默认字体: Segoe UI Semibold - 播放列表页眉简单模式中使用的艺术家字体，播放状态',
			playlistAlbum: '默认字体: Segoe UI Semibold - 播放列表页眉中使用的专辑字体',
			playlistDate: '默认字体: Segoe UI Semibold - 播放列表页眉中使用的日期字体',
			playlistDateCompact: '默认字体: Segoe UI Semibold - 播放列表页眉简单模式中使用的日期字体',
			playlistInfo: '默认字体: Segoe UI - 播放列表页眉中使用的信息字体',
			playlistCover: '默认字体: Segoe UI Semibold - 播放列表缩略图中使用的封面字体',
			playlistPlaycount: '默认字体: Segoe UI - 播放列表行中使用的播放计数字体',
			fontLibrary: '默认字体: Segoe UI - 曲库字体',
			fontBiography: '默认字体: Segoe UI - 简介字体',
			fontLyrics: '默认字体: Segoe UI - 歌词字体'
		};

		/** @public @type {object} Custom fonts 配置页眉说明。 */
		this.customFontsSchema = new ConfigurationObjectSchema('customFont', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义主题字体:                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 设置 > 主题字体 > 使用自定义主题字体                                                                                                                                                  ' +
			'* 如果激活了顶部菜单 选项 > 设置 > 主题字体 > 使用自定义主题字体，您可以在此处设置自己的自定义字体。                                                                                                    ' +
			'* 如果更改 Open Sans 占位符，它必须是字体名称/系列的正确名称。                                                                                                                                          ' +
			'* 注意:如果您将不同的字体混合在一起，则会出现Y对齐问题，因为字体的行高与其他字体不同。                                                                                                                  ' +
			'* 例如，如果要在底栏中使用多个字体，则这些字体需要具有相同的行高。                                                                                                                                      ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，则不会自动设置这些设置                                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 自定义样式预设 * //
		// #region CUSTOM STYLE PRESET
		/** @public @type {object} Custom style preset 使用默认值。*/
		this.customStylePresetDefaults = {
			theme: 'black',
			nighttime: false,
			bevel: false,
			blend: false,
			blend2: false,
			gradient: false,
			gradient2: false,
			alternative: false,
			alternative2: false,
			blackAndWhite: false,
			blackAndWhite2: false,
			blackAndWhiteReborn: false,
			blackReborn: true,
			rebornWhite: false,
			rebornBlack: false,
			rebornFusion: false,
			rebornFusion2: false,
			rebornFusionAccent: false,
			randomPastel: false,
			randomDark: false,
			randomAutoColor: 'off',
			topMenuButtons: 'emboss',
			transportButtons: 'inner',
			progressBarDesign: 'rounded',
			progressBar: 'inner',
			progressBarFill: 'blend',
			volumeBarDesign: 'rounded',
			volumeBar: 'inner',
			volumeBarFill: 'bevel',
			themeBrightness: 'default'
		};

		/** @public @type {object} Custom style preset 配置名称说明。 */
		this.customStylePresetComments = {
			theme: 'Values: "white", "black", "reborn", "random", "blue", "darkblue", "red", "cream", "nblue", "ngreen", "nred", "ngold"',
			nighttime: 'Values: true, false - 特殊样式只能与重生、随机、自定义主题一起使用',
			bevel: 'Values: true, false - 可用于所有主题',
			blend: 'Values: true, false - 可用于所有主题',
			blend2: 'Values: true, false - 可用于所有主题',
			gradient: 'Values: true, false - 只能用于重生、随机、蓝色、深蓝、红色主题',
			gradient2: 'Values: true, false - 只能用于重生、随机、蓝色、深蓝、红色主题',
			alternative: 'Values: true, false - 可以用于所有主题，但不能用于特殊主题样式',
			alternative2: 'Values: true, false - 可以用于所有主题，但不能用于特殊主题样式',
			blackAndWhite: 'Values: true, false - 特殊白色主题样式只能与白色主题一起使用',
			blackAndWhite2: 'Values: true, false - 特殊白色主题样式只能与白色主题一起使用',
			blackAndWhiteReborn: 'Values: true, false - 特殊白色主题样式只能与白色主题一起使用',
			blackReborn: 'Values: true, false - 特殊黑色主题样式只能与黑色主题一起使用',
			rebornWhite: 'Values: true, false - 特殊的重生主题样式只能与重生主题一起使用',
			rebornBlack: 'Values: true, false - 特殊的重生主题样式只能与重生主题一起使用',
			rebornFusion: 'Values: true, false - special reborn style can only be used with reborn theme',
			rebornFusion2: 'Values: true, false - special reborn style can only be used with reborn theme',
			rebornFusionAccent: 'Values: true, false - special reborn style can only be used with reborn theme',
			randomPastel: 'Values: true, false - 特殊随机主题样式只能与随机主题一起使用',
			randomDark: 'Values: true, false - 特殊随机主题样式只能与随机主题一起使用',
			randomAutoColor: 'Values: "off", 5000, 10000, 15000, 30000, 45000, 60000, 120000, 180000, 240000, 300000, "track", - 只能与随机主题一起使用',
			topMenuButtons: 'Values: "default", "filled", "bevel", "inner", "emboss", "minimal"',
			transportButtons: 'Values: "default", "bevel", "inner", "emboss", "minimal"',
			progressBarDesign: 'Values: "default", "rounded", "lines", "blocks", "dots", "thin"',
			progressBar: 'Values: "default", "bevel", "inner"',
			progressBarFill: 'Values: "default", "bevel", "inner", "blend"',
			volumeBarDesign: 'Values: "default", "rounded"',
			volumeBar: 'Values: "default", "bevel", "inner"',
			volumeBarFill: 'Values: "default", "bevel", "inner"',
			themeBrightness: 'Values: -50, -40, -30, -25, -20, -15, -10, -5, "default", 5, 10, 15, 20, 25, 30, 40, 50'
		};

		/** @public @type {object} Custom style preset 配置页眉说明。 */
		this.customStylePresetSchema = new ConfigurationObjectSchema('customStylePreset', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义样式预设:                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 样式 > 预设 > 用户设置                                                                                                                                                                ' +
			'* 如果选择了顶部菜单 选项 > 样式 > 预设 > 用户设置，则可以设置自己的自定义主题样式。                                                                                                                    ' +
			'* 首先，您只需要在主题中设置一个主题：并将主题设置为true，所有其他主题都需要设置为false。                                                                                                               ' +
			'* 其次，每列只能设置一种样式，请参见顶部菜单选项>样式。例如，只能同时激活“融合”或“融合2”                                                                                                                ' +
			'* 备选方案或备选方案2也是一样的，或者如果此特定列有其他特殊主题样式，请参阅主题样式部分中的注释。                                                                                                       ' +
			'* 最佳做法是首先在顶部菜单选项 > 样式中设置每个样式，注意这些样式并在此处的配置中进行修改。                                                                                                             ' +
			'* 如果出现问题，您可以在顶部菜单中重置主题设置 选项 > 设置 > 主题配置 > 全部重置                                                                                                                        ' +
			'* 注意:如果使用顶部菜单 选项 > 设置 > 主题配置 > 保存设置到配置文件，则不会自动设置这些设置                                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 自定义碟片占位符 * //
		// #region CUSTOM DISC ART PLACEHOLDER
		/** @public @type {object} Custom disc art placeholder 使用默认值。*/
		this.customDiscArtStubDefaults = {
			cdName01: 'Custom CD - Name 01',
			cdStub01: 'cd-custom01.png',
			cdName02: 'Custom CD - Name 02',
			cdStub02: '',
			cdName03: 'Custom CD - Name 03',
			cdStub03: '',
			cdName04: 'Custom CD - Name 04',
			cdStub04: '',
			cdName05: 'Custom CD - Name 05',
			cdStub05: '',
			vinylName01: 'Custom Vinyl - Name 01',
			vinylStub01: 'vinyl-custom01.png',
			vinylName02: 'Custom Vinyl - Name 02',
			vinylStub02: '',
			vinylName03: 'Custom Vinyl - Name 03',
			vinylStub03: '',
			vinylName04: 'Custom Vinyl - Name 04',
			vinylStub04: '',
			vinylName05: 'Custom Vinyl - Name 05',
			vinylStub05: ''
		};

		/** @public @type {object} Custom disc art placeholder 配置名称说明。 */
		this.customDiscArtStubComments = {
			cdName01: 'Value: 第一个CD占位符的名称，  例如： Custom CD - Name 01',
			cdStub01: 'Value: 第一个CD占位符的文件名，例如： cd-custom01.png',
			cdName02: 'Value: 第二个CD占位符的名称，  例如： Custom CD - Name 02',
			cdStub02: 'Value: 第二个CD占位符的文件名，例如： cd-custom02.png',
			cdName03: 'Value: 第三个CD占位符的名称，  例如： Custom CD - Name 03',
			cdStub03: 'Value: 第三个CD占位符的文件名，例如： cd-custom03.png',
			cdName04: 'Value: 第四个CD占位符的名称，  例如： Custom CD - Name 04',
			cdStub04: 'Value: 第四个CD占位符的文件名，例如： cd-custom04.png',
			cdName05: 'Value: 第五个CD占位符的名称，  例如： Custom CD - Name 05',
			cdStub05: 'Value: 第五个CD占位符的文件名，例如： cd-custom05.png',
			vinylName01: 'Value: 第一个黑胶占位符的名称，  例如： Custom vinyl - Name 01',
			vinylStub01: 'Value: 第一个黑胶占位符的文件名，例如： vinyl-custom01.png',
			vinylName02: 'Value: 第二个黑胶占位符的名称，  例如： Custom vinyl - Name 02',
			vinylStub02: 'Value: 第二个黑胶占位符的文件名，例如： vinyl-custom02.png',
			vinylName03: 'Value: 第三个黑胶占位符的名称，  例如： Custom vinyl - Name 03',
			vinylStub03: 'Value: 第三个黑胶占位符的文件名，例如： vinyl-custom03.png',
			vinylName04: 'Value: 第四个黑胶占位符的名称，  例如： Custom vinyl - Name 04',
			vinylStub04: 'Value: 第四个黑胶占位符的文件名，例如： vinyl-custom04.png',
			vinylName05: 'Value: 第五个黑胶占位符的名称，  例如： Custom vinyl - Name 05',
			vinylStub05: 'Value: 第五个黑胶占位符的文件名，例如： vinyl-custom05.png'
		};

		/** @public @type {object} Custom disc art placeholder 配置页眉说明。 */
		this.customDiscArtStubSchema = new ConfigurationObjectSchema('customDiscArtStub', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义碟片占位符：                                                                                                                                                                                    ' +
			'* 顶部菜单选项>详情>碟片>碟片占位符                                                                                                                                                                     ' +
			'* 您可以添加自己的自定义 CD 和黑胶占位符，这些占位符将动态附加到碟片占位符菜单中。                                                                                                                      ' +
			'* 建议对 CD 和黑胶占位符使用预定义的前缀命名约定，如“Custom CD-YourName”或“Custom Vinyl-YourName”。                                                                                                     ' +
			'* 文件名必须以.png结尾，例如“cd-custom01.png”或“vinyl-custom1.png”。                                                                                                                                    ' +
			'* 如果占位符cdStub02、cdStub03、cdStub04、cdStub5、vinylStub02，vinylStub03、vinylStub04、vinylStab05等没有任何文件名值，它们将不会添加到菜单中。                                                       ' +
			'* 自定义碟片占位符位于目录“georgia-reborn/images/custom/discart”中。                                                                                                                                    ' +
			'* 注意：如果您使用顶部菜单“选项”>“设置”>“主题配置”>“将设置保存到配置文件”，则不会自动设置这些设置。                                                                                                     ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion

		// * 自定义主题 * //
		// #region CUSTOM THEME
		/** @public @type {object} Custom theme 使用默认 HEX 颜色值 */
		this.customThemeDefaults = {
			name: '',

			// * 预加载程序颜色 * //
			// #region PRELOADER COLORS
			grCol_preloaderBg: '372355',
			grCol_preloaderLogo: 'violet-play-logo.png',
			grCol_preloaderLowerBarTitle: 'ffffff',
			grCol_preloaderProgressBar: '412d64',
			grCol_preloaderProgressBarFill: 'ebc841',
			grCol_preloaderProgressBarFrame: '372355',
			// #endregion

			// * 播放列表颜色 * //
			// #region PLAYLIST COLORS

			// * 主要颜色 * //
			pl_col_bg: '321946',

			// * 播放列表管理器颜色 * //
			pl_col_plman_text_normal: 'd2d2d2',
			pl_col_plman_text_hovered: 'ffffff',
			pl_col_plman_text_pressed: '3cfaa0',

			// * 页眉颜色 * //
			pl_col_header_nowplaying_bg: '372355',
			pl_col_header_sideMarker: '3cfaa0',
			pl_col_header_artist_normal: 'd2d2d2',
			pl_col_header_artist_playing: '3cfaa0',
			pl_col_header_album_normal: 'd2d2d2',
			pl_col_header_album_playing: 'ffffff',
			pl_col_header_info_normal: 'd2d2d2',
			pl_col_header_info_playing: 'ffffff',
			pl_col_header_date_normal: 'd2d2d2',
			pl_col_header_date_playing: '3cfaa0',
			pl_col_header_line_normal: '503782',
			pl_col_header_line_playing: '6450b4',

			// * 行颜色 * //
			pl_col_row_nowplaying_bg: '372355',
			pl_col_row_stripes_bg: '372355',
			pl_col_row_selection_frame: '503782',
			pl_col_row_sideMarker: '3cfaa0',
			pl_col_row_title_normal: 'd2d2d2',
			pl_col_row_title_playing: 'ffffff',
			pl_col_row_title_selected: '3cfaa0',
			pl_col_row_title_hovered: 'ffffff',
			pl_col_row_rating_color: 'ebc841',
			pl_col_row_disc_subheader_line: '503782',
			pl_col_row_drag_line: '6450b4',
			pl_col_row_drag_line_reached: '3cfaa0',

			// * 滚动条颜色 * //
			pl_col_sbar_btn_normal: 'd2d2d2',
			pl_col_sbar_btn_hovered: 'ebc841',
			pl_col_sbar_thumb_normal: '412d64',
			pl_col_sbar_thumb_hovered: 'ebc841',
			pl_col_sbar_thumb_drag: '3cfaa0',
			// #endregion

			// * 曲库颜色 * //
			// #region LIBRARY COLORS

			// * 主要颜色 * //
			lib_ui_col_bg: '321946',
			lib_ui_col_rowStripes: '372355',

			// * 行颜色 * //
			lib_ui_col_nowPlayingBg: '372350',
			lib_ui_col_sideMarker: '3cfaa0',
			lib_ui_col_selectionFrame: '503782',
			lib_ui_col_selectionFrame2: '503782',
			lib_ui_col_hoverFrame: '503782',

			// * 节点颜色 * //
			lib_ui_col_iconPlus: 'ebc841',
			lib_ui_col_iconPlus_h: '3cfaa0',
			lib_ui_col_iconPlus_sel: '3cfaa0',
			lib_ui_col_iconPlusBg: '372355',
			lib_ui_col_iconMinus_e: 'ebc841',
			lib_ui_col_iconMinus_c: 'ebc841',
			lib_ui_col_iconMinus_h: 'ebc841',

			// * 文本颜色 * //
			lib_ui_col_text: 'd2d2d2',
			lib_ui_col_text_h: 'ffffff',
			lib_ui_col_text_nowp: 'ffffff',
			lib_ui_col_textSel: '3cfaa0',
			lib_ui_col_txt: 'd2d2d2',
			lib_ui_col_txt_h: 'ffffff',
			lib_ui_col_txt_box: 'ffffff',
			lib_ui_col_search: 'ffffff',

			// * 按钮颜色 * //
			lib_ui_col_searchBtn: 'ffffff',
			lib_ui_col_crossBtn: 'ffffff',
			lib_ui_col_filterBtn: 'ffffff',
			lib_ui_col_settingsBtn: 'ffffff',
			lib_ui_col_line: '503782',
			lib_ui_col_s_line: '503782',

			// * 滚动条颜色 * //
			lib_ui_col_sbarBtns: 'd2d2d2',
			lib_ui_col_sbarNormal: '504673',
			lib_ui_col_sbarHovered: 'ebc841',
			lib_ui_col_sbarDrag: '3cfaa0',
			// #endregion

			// * 曲库管理颜色 * //
			// #region LIBRARY EXPLORER COLORS

			// * COLUMN * //
			lib_ex_col_column_bg: '321946',
			lib_ex_col_column_line: '503782',
			lib_ex_col_column_text_normal: 'd2d2d2',
			lib_ex_col_column_text_hovered: 'ffffff',
			lib_ex_col_column_text_playing: 'ffffff',
			lib_ex_col_column_text_selected: '3cfaa0',

			// * GRID - ARTIST VIEW * //
			lib_ex_col_grid_playing_bg: '372350',
			lib_ex_col_grid_selection_bg: '372355',
			lib_ex_col_grid_selection_frame: '503782',
			lib_ex_col_grid_sideMarker: '3cfaa0',
			lib_ex_col_grid_title_normal: 'd2d2d2',
			lib_ex_col_grid_title_hovered: 'ffffff',
			lib_ex_col_grid_title_playing: 'ffffff',
			lib_ex_col_grid_title_selected: '3cfaa0',

			// * TRACK ROWS - ALBUM VIEW * //
			lib_ex_col_row_stripes_bg: '372355',
			lib_ex_col_row_playing_bg: '372350',
			lib_ex_col_row_selection_bg: '372355',
			lib_ex_col_row_selection_frame: '503782',
			lib_ex_col_row_sideMarker: '3cfaa0',
			lib_ex_col_row_title_normal: 'd2d2d2',
			lib_ex_col_row_title_hovered: 'ffffff',
			lib_ex_col_row_title_playing: 'ffffff',
			lib_ex_col_row_title_selected: '3cfaa0',

			// * RATING * //
			lib_ex_col_rating_star: 'ebc841',
			lib_ex_col_rating_star_shadow: '000000',

			// * SCROLLBAR * //
			lib_ex_col_sbar_normal: '504673',
			lib_ex_col_sbar_hovered: 'ebc841',
			lib_ex_col_sbar_drag: '3cfaa0',

			// * BUTTONS * //
			lib_ex_col_closeBtn: 'ffffff',
			lib_ex_col_closeBtn_bg: '503782',
			// #endregion

			// * 简介颜色 * //
			// #region BIOGRAPHY COLORS

			// * 主要颜色 * //
			bio_ui_col_bg: '321946',
			bio_ui_col_rowStripes: '372350',

			// * 标题颜色 * //
			bio_ui_col_headingText: 'ffffff',
			bio_ui_col_bottomLine: '503782',
			bio_ui_col_centerLine: '503782',
			bio_ui_col_sectionLine: '503782',

			// * 文本颜色 * //
			bio_ui_col_accent: 'ebc841',
			bio_ui_col_source: 'd2d2d2',
			bio_ui_col_summary: 'd2d2d2',
			bio_ui_col_text: 'd2d2d2',

			// * 杂项颜色 * //
			bio_ui_col_lyricsNormal: 'd2d2d2',
			bio_ui_col_lyricsHighlight: 'ebc841',
			bio_ui_col_lyricsShadow: '000000',
			bio_ui_col_noPhotoStubBg: '372355',
			bio_ui_col_noPhotoStubText: '3cfaa0',

			// * 滚动条颜色 * //
			bio_ui_col_sbarBtns: 'd2d2d2',
			bio_ui_col_sbarNormal: '504673',
			bio_ui_col_sbarHovered: 'ebc841',
			bio_ui_col_sbarDrag: '3cfaa0',
			// #endregion

			// * 主要颜色 * //
			// #region MAIN COLORS

			// * 主要颜色 * //
			grCol_bg: '372355',
			grCol_shadow: '000000',
			grCol_discArtShadow: '000000',
			grCol_noAlbumArtStub: '3cfaa0',
			grCol_lowerBarArtist: '3cfaa0',
			grCol_lowerBarTitle: 'ffffff',
			grCol_lowerBarTime: 'ffffff',
			grCol_lowerBarLength: 'ffffff',
			grCol_lyricsNormal: 'ffffff',
			grCol_lyricsHighlight: 'ebc841',
			grCol_lyricsShadow: '000000',

			// * 详情 * //
			grCol_detailsBg: '321946',
			grCol_detailsText: 'd2d2d2',
			grCol_detailsRating: 'ebc841',
			grCol_timelineAdded: '3cfaa0',
			grCol_timelinePlayed: '32d287',
			grCol_timelineUnplayed: '28aa6e',
			grCol_timelineFrame: '321946',

			// * 弹窗颜色 * //
			grCol_popupBg: '372355',
			grCol_popupText: 'd2d2d2',

			// * 顶部菜单按钮颜色 * //
			grCol_menuBgColor: '503782',
			grCol_menuStyleBg: '372355',
			grCol_menuRectStyleEmbossTop: '6450b4',
			grCol_menuRectStyleEmbossBottom: '151515',
			grCol_menuRectNormal: '6450b4',
			grCol_menuRectHovered: '6450b4',
			grCol_menuRectDown: '6450b4',
			grCol_menuTextNormal: 'ffffff',
			grCol_menuTextHovered: 'ebc841',
			grCol_menuTextDown: '3cfaa0',

			// * 底栏通用按钮颜色 * //
			grCol_transportEllipseBg: '503782',
			grCol_transportEllipseNormal: '503c8c',
			grCol_transportEllipseHovered: '6450b4',
			grCol_transportEllipseDown: '6450b4',
			grCol_transportStyleBg: '372355',
			grCol_transportStyleTop: '503c8c',
			grCol_transportStyleBottom: '151515',
			grCol_transportIconNormal: '3cfaa0',
			grCol_transportIconHovered: 'ebc841',
			grCol_transportIconDown: '3cfaa0',

			// * 进度条颜色 * //
			grCol_progressBar: '412d64',
			grCol_progressBarStreaming: 'cf0005',
			grCol_progressBarFrame: '372355',
			grCol_progressBarFill: 'ebc841',

			// * 峰值条颜色 * //
			grCol_peakmeterBarProg: '412d64',
			grCol_peakmeterBarProgFill: 'ebc841',
			grCol_peakmeterBarFillTop: '3cfaa0',
			grCol_peakmeterBarFillMiddle: '32d287',
			grCol_peakmeterBarFillBack: '28aa6e',
			grCol_peakmeterBarVertProgFill: 'ebc841',
			grCol_peakmeterBarVertFill: 'ebc841',
			grCol_peakmeterBarVertFillPeaks: 'fff0af',

			// * 波形条颜色 * //
			grCol_waveformBarFillFront: 'ebc841',
			grCol_waveformBarFillBack: 'b99b32',
			grCol_waveformBarFillPreFront: '7d55cd',
			grCol_waveformBarFillPreBack: '5f419b',
			grCol_waveformBarIndicator: '3cfaa0',

			// * 音量条颜色 * //
			grCol_volumeBar: '412d64',
			grCol_volumeBarFrame: '372355',
			grCol_volumeBarFill: '3cfaa0',

			// * 样式颜色 * //
			grCol_styleBevel: '1e0f2d',
			grCol_styleGradient: '1e1428',
			grCol_styleGradient2: '5a003c',
			grCol_styleProgressBar: '372355',
			grCol_styleProgressBarLineTop: '321946',
			grCol_styleProgressBarLineBottom: '503782',
			grCol_styleProgressBarFill: '8c6914',
			grCol_styleVolumeBar: '372355',
			grCol_styleVolumeBarFill: '19826e'
			// #endregion
		};

		/** @public @type {object} Custom theme 配置名称说明。 */
		this.customThemeComments = {
			name: '自定义主题名称将显示在选项主题菜单中',

			// * 预加载程序颜色 * //
			// #region PRELOADER COLORS
			grCol_preloaderBg: '预加载程序背景颜色。如果此值为空，则将使用默认颜色',
			grCol_preloaderLogo: '预加载程序徽标必须以.png 结尾，例如：徽标.png。如果此值为空，则将使用默认徽标',
			grCol_preloaderLowerBarTitle: '预加载程序下栏标题颜色。如果此值为空，则将使用默认颜色',
			grCol_preloaderProgressBar: '预加载程序进度条颜色。如果此值为空，则将使用默认颜色',
			grCol_preloaderProgressBarFill: '预加载程序进度条填充颜色。如果此值为空，则将使用默认颜色',
			grCol_preloaderProgressBarFrame: '预加载程序进度条边框颜色。如果此值为空，则将使用默认颜色',
			// #endregion

			// * 播放列表颜色 * //
			// #region PLAYLIST COLORS

			// * 主要颜色 * //
			pl_col_bg: '播放列表主要背景颜色',

			// * 播放列表管理器颜色 * //
			pl_col_plman_text_normal: '播放列表管理器常规状态文本颜色',
			pl_col_plman_text_hovered: '播放列表管理器悬停状态文本颜色',
			pl_col_plman_text_pressed: '播放列表管理器按下状态文本颜色',

			// * 页眉颜色 * //
			pl_col_header_nowplaying_bg: '播放列表页眉正在播放背景颜色',
			pl_col_header_sideMarker: '播放列表页眉侧标颜色',
			pl_col_header_artist_normal: '播放列表页眉常规状态艺术家文本颜色',
			pl_col_header_artist_playing: '播放列表页眉播放状态艺术家文本颜色',
			pl_col_header_album_normal: '播放列表页眉常规状态专辑文本颜色',
			pl_col_header_album_playing: '播放列表页眉播放状态专辑文本颜色',
			pl_col_header_info_normal: '播放列表页眉常规状态信息文本颜色',
			pl_col_header_info_playing: '播放列表页眉播放状态信息文本颜色',
			pl_col_header_date_normal: '播放列表页眉常规状态日期文本颜色',
			pl_col_header_date_playing: '播放列表页眉播放状态日期文本颜色',
			pl_col_header_line_normal: '播放列表页眉常规状态线颜色',
			pl_col_header_line_playing: '播放列表页眉播放状态线颜色',

			// * 行颜色 * //
			pl_col_row_nowplaying_bg: '播放列表行正在播放背景颜色',
			pl_col_row_stripes_bg: '播放列表行交替背景颜色',
			pl_col_row_selection_frame: '播放列表行选择框颜色',
			pl_col_row_sideMarker: '播放列表行侧标颜色',
			pl_col_row_title_normal: '播放列表行常规状态标题文本颜色',
			pl_col_row_title_playing: '播放列表行播放状态标题文本颜色',
			pl_col_row_title_selected: '播放列表行选定状态标题文本颜色',
			pl_col_row_title_hovered: '播放列表行悬停状态标题文本颜色',
			pl_col_row_rating_color: '播放列表行评级颜色',
			pl_col_row_disc_subheader_line: '播放列表行碟片子页眉线颜色',
			pl_col_row_drag_line: '播放列表音轨排序拖动行颜色',
			pl_col_row_drag_line_reached: '播放列表音轨排序已达到拖动行颜色',

			// * 滚动条颜色 * //
			pl_col_sbar_btn_normal: '播放列表常规状态滚动条按钮颜色',
			pl_col_sbar_btn_hovered: '播放列表悬停状态滚动条按钮颜色',
			pl_col_sbar_thumb_normal: '播放列表常规状态滚动滑块颜色',
			pl_col_sbar_thumb_hovered: '播放列表悬停状态滚动滑块颜色',
			pl_col_sbar_thumb_drag: '播放列表拖动状态滚动滑块颜色',
			// #endregion

			// * 曲库颜色 * //
			// #region LIBRARY COLORS

			// * 主要颜色 * //
			lib_ui_col_bg: '曲库主要背景颜色',
			lib_ui_col_rowStripes: '曲库行条纹背景颜色',

			// * 行颜色 * //
			lib_ui_col_nowPlayingBg: '曲库行正在播放背景颜色',
			lib_ui_col_sideMarker: '曲库行侧标颜色',
			lib_ui_col_selectionFrame: '曲库行选择边框颜色',
			lib_ui_col_selectionFrame2: '曲库行选择边框颜色 2',
			lib_ui_col_hoverFrame: '曲库行悬停边框颜色',

			// * NODE COLORS * //
			lib_ui_col_iconPlus: '库树加号节点图标颜色',
			lib_ui_col_iconPlus_h: '库树加号节点图标悬停颜色',
			lib_ui_col_iconPlus_sel: '库树加号节点图标选定颜色',
			lib_ui_col_iconPlusBg: '库树传统树模式加号节点图标背景颜色',
			lib_ui_col_iconMinus_e: '库树传统树模式加号节点图标展开颜色',
			lib_ui_col_iconMinus_c: '库树传统树模式加号节点图标折叠颜色',
			lib_ui_col_iconMinus_h: '库树传统树模式加号节点图标悬停颜色',																			  

			// * 文本颜色 * //
			lib_ui_col_text: '曲库行文本颜色',
			lib_ui_col_text_h: '曲库行悬停文本颜色',
			lib_ui_col_text_nowp: '曲库行正在播放文本颜色',
			lib_ui_col_textSel: '曲库行选定文本颜色',
			lib_ui_col_txt: '曲库用户界面文本颜色',
			lib_ui_col_txt_h: '曲库用户界面文本悬停颜色',
			lib_ui_col_txt_box: '曲库用户界面文本框颜色',
			lib_ui_col_search: '曲库搜索文本颜色',

			// * 按钮颜色 * //
			lib_ui_col_searchBtn: '曲库线搜索按钮颜色',
			lib_ui_col_crossBtn: '曲库交叉按钮颜色',
			lib_ui_col_filterBtn: '曲库过滤按键颜色',
			lib_ui_col_settingsBtn: '曲库设置按钮颜色',
			lib_ui_col_line: '曲库线颜色',
			lib_ui_col_s_line: '曲库线选定颜色',

			// * 滚动条颜色，也与简介滚动条颜色链接 * //
			lib_ui_col_sbarBtns: '曲库滚动条按钮颜色',
			lib_ui_col_sbarNormal: '曲库滚动条常规颜色',
			lib_ui_col_sbarHovered: '曲库滚动条悬停颜色',
			lib_ui_col_sbarDrag: '曲库滚动条拖动颜色',
			// #endregion

			// * 曲库管理颜色 * //
			// #region LIBRARY EXPLORER COLORS

			// * COLUMN * //
			lib_ex_col_column_bg: 'Library Explorer column background color',
			lib_ex_col_column_line: 'Library Explorer separator column line color',
			lib_ex_col_column_text_normal: 'Library Explorer text color for column content',
			lib_ex_col_column_text_hovered: 'Library Explorer text hover color for column content',
			lib_ex_col_column_text_playing: 'Library Explorer now playing text color',
			lib_ex_col_column_text_selected: 'Library Explorer text selection color for column content',

			// * GRID - ARTIST VIEW * //
			lib_ex_col_grid_playing_bg: 'Library Explorer highlight bg color for now-playing grid rows',
			lib_ex_col_grid_selection_bg: 'Library Explorer background color for selected grid rows',
			lib_ex_col_grid_selection_frame: 'Library Explorer frame color for selected grid rows',
			lib_ex_col_grid_sideMarker: 'Library Explorer side marker color for selected grid rows',
			lib_ex_col_grid_title_normal: 'Library Explorer normal grid title color',
			lib_ex_col_grid_title_hovered: 'Library Explorer hovered grid title color',
			lib_ex_col_grid_title_playing: 'Library Explorer now playing grid title color',
			lib_ex_col_grid_title_selected: 'Library Explorer selected grid title color',

			// * TRACK ROWS - ALBUM VIEW * //
			lib_ex_col_row_stripes_bg: 'Library Explorer background color for striped rows',
			lib_ex_col_row_playing_bg: 'Library Explorer highlight bg color for now-playing rows',
			lib_ex_col_row_selection_bg: 'Library Explorer background color for selected rows',
			lib_ex_col_row_selection_frame: 'Library Explorer frame color for selected rows',
			lib_ex_col_row_sideMarker: 'Library Explorer side marker color for selected rows',
			lib_ex_col_row_title_normal: 'Library Explorer normal row title color',
			lib_ex_col_row_title_hovered: 'Library Explorer hovered row title color',
			lib_ex_col_row_title_playing: 'Library Explorer now playing row title color',
			lib_ex_col_row_title_selected: 'Library Explorer selected row title color',

			// * RATING * //
			lib_ex_col_rating_star: 'Library Explorer rating row stars color',
			lib_ex_col_rating_star_shadow: 'Library Explorer shadow color for rating stars',

			// * 滚动条 * //
			lib_ex_col_sbar_normal: 'Library Explorer normal scrollbar color',
			lib_ex_col_sbar_hovered: 'Library Explorer hovered scrollbar color',
			lib_ex_col_sbar_drag: 'Library Explorer dragged scrollbar color',

			// * 按钮 * //
			lib_ex_col_closeBtn: 'Library Explorer close button text color',
			lib_ex_col_closeBtn_bg: 'Library Explorer close button background color',
			// #endregion

			// * 简介颜色 * //
			// #region BIOGRAPHY COLORS
			
			// * 主要颜色 * //
			bio_ui_col_bg: '简介主要背景颜色',
			bio_ui_col_rowStripes: '简介行条纹背景色',

			// * 页眉颜色 * //
			bio_ui_col_headingText: '简介标题文本颜色',
			bio_ui_col_bottomLine: '简介标题底线颜色',
			bio_ui_col_centerLine: '简介标题中线颜色',
			bio_ui_col_sectionLine: '简介标题分割线颜色',
			
			// * 文本颜色 * //
			bio_ui_col_source: '简介来源文本颜色',
			bio_ui_col_accent: '简介强调文本颜色（用于项目属性）',
			bio_ui_col_summary: '简介摘要文本颜色',
			bio_ui_col_text: '简介文本颜色',

			// * 杂项颜色 * //
			bio_ui_col_lyricsNormal: '简介歌词常规颜色',
			bio_ui_col_lyricsHighlight: '简介歌词高亮颜色',
			bio_ui_col_lyricsShadow: '简介歌词阴影颜色',
			bio_ui_col_noPhotoStubBg: '简介无照片存根背景颜色',
			bio_ui_col_noPhotoStubText: '简介无照片存根文本颜色',
			
			// * 滚动条颜色 * //
			bio_ui_col_sbarBtns: '简介滚动条按钮颜色',
			bio_ui_col_sbarNormal: '简介滚动条滑块常规颜色',
			bio_ui_col_sbarHovered: '简介滚动条滑块悬停颜色',
			bio_ui_col_sbarDrag: '简介滚动条滑块拖动颜色',
			// #endregion

			// * 主要颜色 * //
			// #region MAIN COLORS
			
			// * 主要颜色 * //
			grCol_bg: '主要背景颜色',
			grCol_shadow: '面板阴影颜色',
			grCol_discArtShadow: '碟片阴影颜色',
			grCol_noAlbumArtStub: '无专辑封面存根颜色',
			grCol_lowerBarArtist: '底栏艺术家文本颜色',
			grCol_lowerBarTitle: '底栏标题文本颜色',
			grCol_lowerBarTime: '底栏播放时间文本颜色',
			grCol_lowerBarLength: '底栏播放时长文本颜色',
			grCol_lyricsNormal: '歌词常规颜色',
			grCol_lyricsHighlight: '歌词高亮颜色',
			grCol_lyricsShadow: '歌词阴影颜色',																	   

			// * 详情颜色 * //
			grCol_detailsBg: '详情背景颜色',
			grCol_detailsText: '详情文本颜色',
			grCol_detailsRating: '详情评级颜色',
			grCol_timelineAdded: '详情时间线已添加颜色',
			grCol_timelinePlayed: '详情时间线已播放颜色',
			grCol_timelineUnplayed: '详情时间线无播放颜色',
			grCol_timelineFrame: '详情时间线边框颜色',

			// * 弹窗颜色 * //
			grCol_popupBg: '弹窗背景颜色',
			grCol_popupText: '弹窗文本颜色',
			
			// * 顶部菜单按钮颜色 * //
			grCol_menuBgColor: '顶部菜单背景颜色',
			grCol_menuStyleBg: '顶部菜单样式背景颜色',
			grCol_menuRectStyleEmbossTop: '顶部菜单矩形样式浮雕顶部颜色',
			grCol_menuRectStyleEmbossBottom: '顶部菜单矩形样式浮雕底部颜色',
			grCol_menuRectNormal:	'顶部菜单矩形颜色',
			grCol_menuRectHovered: '顶部菜单矩形悬停颜色',
			grCol_menuRectDown: '顶部菜单矩形按下颜色',
			grCol_menuTextNormal: '顶部菜单文本颜色',
			grCol_menuTextHovered: '顶部菜单文本悬停颜色',
			grCol_menuTextDown: '顶部菜单文本按下颜色',

			// * 底栏通用按钮颜色 * //
			grCol_transportEllipseBg: '底栏通用圆形背景颜色',
			grCol_transportEllipseNormal: '底栏通用圆形颜色',
			grCol_transportEllipseHovered: '底栏通用圆形悬停颜色',
			grCol_transportEllipseDown: '底栏通用圆形按下颜色',
			grCol_transportStyleBg: '底栏通用样式背景颜色',
			grCol_transportStyleTop: '底栏通用样式顶部颜色',
			grCol_transportStyleBottom: '底栏通用样式底部颜色',
			grCol_transportIconNormal: '底栏通用图标颜色',
			grCol_transportIconHovered: '底栏通用图标悬停颜色',
			grCol_transportIconDown: '底栏通用图标按下颜色',

			// * 进度条颜色 * //
			grCol_progressBar: '进度条颜色',
			grCol_progressBarStreaming: '串流时进度条颜色',
			grCol_progressBarFrame: '进度条框颜色',
			grCol_progressBarFill: '进度条填充颜色',
			
			// * 峰值条颜色 * //
			grCol_peakmeterBarProg: '峰值条进度背景颜色',
			grCol_peakmeterBarProgFill: '峰值条进度填充颜色',
			grCol_peakmeterBarFillTop: '峰值条顶部填充颜色',
			grCol_peakmeterBarFillMiddle: '峰值条中间填充颜色',
			grCol_peakmeterBarFillBack: '峰值条后填充颜色',
			grCol_peakmeterBarVertProgFill: '峰值条垂直进度填充颜色',
			grCol_peakmeterBarVertFill: '峰值条垂直填充颜色',
			grCol_peakmeterBarVertFillPeaks: '峰值计条垂直峰值填充颜色',
			
			// * 波形条颜色 * //
			grCol_waveformBarFillFront: '波形条前填充颜色',
			grCol_waveformBarFillBack: '波形条后填充颜色',
			grCol_waveformBarFillPreFront: '波形条预绘前填充颜色',
			grCol_waveformBarFillPreBack: '波形条预绘后填充颜色',
			grCol_waveformBarIndicator: '波形条进度指器颜色',
			
			// * 音量条颜色 * //
			grCol_volumeBar: '音量条颜色',
			grCol_volumeBarFrame: '音量条框颜色',
			grCol_volumeBarFill: '音量条填充颜色',

			// * 样式颜色 * //
			grCol_styleBevel: '样式斜面颜色',
			grCol_styleGradient: '样式渐变颜色',
			grCol_styleGradient2: '样式渐变2颜色',
			grCol_styleProgressBar: '样式进度条颜色',
			grCol_styleProgressBarLineTop: '样式进度条顶线颜色',
			grCol_styleProgressBarLineBottom: '样式进度条底线颜色',
			grCol_styleProgressBarFill: '样式进度条填充颜色',
			grCol_styleVolumeBar: '样式音量条颜色',
			grCol_styleVolumeBarFill: '样式音量条填充颜色'
			// #endregion
		};

		/** @public @type {object} Custom theme 01 配置页眉说明。 */
		this.customTheme01Schema = new ConfigurationObjectSchema('customTheme01', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义主题 01：                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 主题 > 自定义 > 主题 01                                                                                                                                                               ' +
			'* 这是第一个包含主要、播放列表、曲库、简介所有颜色的自定义主题。                                                                                                                                        ' +
			'* 注意：如果你使用顶部菜单 选项 > 主题 > 自定义 > 编辑自定义主题 进行实时编辑，则所有颜色都将自动保存在此处                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {object} Custom theme 02 配置页眉说明。 */
		this.customTheme02Schema = new ConfigurationObjectSchema('customTheme02', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义主题 02：                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 主题 > 自定义 > 主题 02                                                                                                                                                               ' +
			'* 这是第二个包含主要、播放列表、曲库、简介所有颜色的自定义主题。                                                                                                                                        ' +
			'* 注意：如果你使用顶部菜单 选项 > 主题 > 自定义 > 编辑自定义主题 进行实时编辑，则所有颜色都将自动保存在此处                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {object} Custom theme 03 配置页眉说明。 */
		this.customTheme03Schema = new ConfigurationObjectSchema('customTheme03', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义主题 03：                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 主题 > 自定义 > 主题 03                                                                                                                                                               ' +
			'* 这是第三个包含主要、播放列表、曲库、简介所有颜色的自定义主题。                                                                                                                                        ' +
			'* 注意：如果你使用顶部菜单 选项 > 主题 > 自定义 > 编辑自定义主题 进行实时编辑，则所有颜色都将自动保存在此处                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {object} Custom theme 04 配置页眉说明。 */
		this.customTheme04Schema = new ConfigurationObjectSchema('customTheme04', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义主题 04：                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 主题 > 自定义 > 主题 04                                                                                                                                                               ' +
			'* 这是第四个包含主要、播放列表、曲库、简介所有颜色的自定义主题。                                                                                                                                        ' +
			'* 注意：如果你使用顶部菜单 选项 > 主题 > 自定义 > 编辑自定义主题 进行实时编辑，则所有颜色都将自动保存在此处                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {object} Custom theme 05 配置页眉说明。 */
		this.customTheme05Schema = new ConfigurationObjectSchema('customTheme05', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义主题 05：                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 主题 > 自定义 > 主题 05                                                                                                                                                               ' +
			'* 这是第五个包含主要、播放列表、曲库、简介所有颜色的自定义主题。                                                                                                                                        ' +
			'* 注意：如果你使用顶部菜单 选项 > 主题 > 自定义 > 编辑自定义主题 进行实时编辑，则所有颜色都将自动保存在此处                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {object} Custom theme 06 配置页眉说明。 */
		this.customTheme06Schema = new ConfigurationObjectSchema('customTheme06', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义主题 06：                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 主题 > 自定义 > 主题 06                                                                                                                                                               ' +
			'* 这是第六个包含主要、播放列表、曲库、简介所有颜色的自定义主题。                                                                                                                                        ' +
			'* 注意：如果你使用顶部菜单 选项 > 主题 > 自定义 > 编辑自定义主题 进行实时编辑，则所有颜色都将自动保存在此处                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {object} Custom theme 07 配置页眉说明。 */
		this.customTheme07Schema = new ConfigurationObjectSchema('customTheme07', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义主题 07：                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 主题 > 自定义 > 主题 07                                                                                                                                                               ' +
			'* 这是第七个包含主要、播放列表、曲库、简介所有颜色的自定义主题。                                                                                                                                        ' +
			'* 注意：如果你使用顶部菜单 选项 > 主题 > 自定义 > 编辑自定义主题 进行实时编辑，则所有颜色都将自动保存在此处                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {object} Custom theme 08 配置页眉说明。 */
		this.customTheme08Schema = new ConfigurationObjectSchema('customTheme08', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义主题 08：                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 主题 > 自定义 > 主题 08                                                                                                                                                               ' +
			'* 这是第八个包含主要、播放列表、曲库、简介所有颜色的自定义主题。                                                                                                                                        ' +
			'* 注意：如果你使用顶部菜单 选项 > 主题 > 自定义 > 编辑自定义主题 进行实时编辑，则所有颜色都将自动保存在此处                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {object} Custom theme 09 配置页眉说明。 */
		this.customTheme09Schema = new ConfigurationObjectSchema('customTheme09', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义主题 09：                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 主题 > 自定义 > 主题 09                                                                                                                                                               ' +
			'* 这是第九个包含主要、播放列表、曲库、简介所有颜色的自定义主题。                                                                                                                                        ' +
			'* 注意：如果你使用顶部菜单 选项 > 主题 > 自定义 > 编辑自定义主题 进行实时编辑，则所有颜色都将自动保存在此处                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');

		/** @public @type {object} Custom theme 10 配置页眉说明。 */
		this.customTheme10Schema = new ConfigurationObjectSchema('customTheme10', ConfigurationObjectType.Object, undefined,
			'/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   ' +
			'* 自定义主题 10：                                                                                                                                                                                       ' +
			'* 顶部菜单 选项 > 主题 > 自定义 > 主题 10                                                                                                                                                              ' +
			'* 这是第十个包含主要、播放列表、曲库、简介所有颜色的自定义主题。                                                                                                                                        ' +
			'* 注意：如果你使用顶部菜单 选项 > 主题 > 自定义 > 编辑自定义主题 进行实时编辑，则所有颜色都将自动保存在此处                                                                                             ' +
			'///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ');
		// #endregion
	}
}
