////////////////////////////////////////////////////////////////////////
// * Georgia-ReBORN: 一个简洁、全动态的颜色重生 - Foobar2000 播放器 * //
// * 类型:           Georgia-ReBORN 歌词                            * //
// * 作者:           TT                                             * //
// * 网站:           https://github.com/TT-ReBORN/Georgia-ReBORN    * //
// * 版本:           3.0-x64-DEV                                    * //
// * 开发开始:       22-12-2017                                     * //
// * 最后更改:       13-07-2026                                     * //
////////////////////////////////////////////////////////////////////////


'use strict';


////////////////
// * LYRICS * //
////////////////
/**
 * 一个类，用于从缓存目录或嵌入文件中加载并在歌词面板的专辑封面上显示歌词。
 */
class Lyrics {
	/**
	 * 创建 `Lyrics` 实例。
     * 初始化变量和设置以加载和显示歌词。
	 */
	constructor() {
		/** @private @type {Array<string>} 存储单独歌词的数组。 */
		this.lyr = [];
		/** @private @type {Array<object>} 以结构化格式存储歌词的数组。 */
		this.lyrics = [];
		this.verticalEligibilityCache = null;
		/** @private @type {Array<string>} 存储歌词来源的数组。 */
		this.lyricSource = [];
		/** @private @type {number} 管理歌词来源加载队列的计数器。 */
		this.lyricsSourceQueue = 0;
		/** @type {boolean} The temporary flag set when lyrics load from a local file. */
		this.lyricsLoadedFromLocal = false;
		/** @type {boolean} The flag indicating if a lyrics search is currently in progress. */
		this.lyricsSearching = false;
		/** @type {boolean} The flag to ensure the ESLyric save command is sent only once per search. */
		this.lyricsSaveCommandSent = false;
		// FIX59: Coalesce ESLyric notifications outside the native callback and disc transition.
		this.esLyricChangedCallback = meta => this.queueESLyricChange(meta);
		this.esLyricChangeTimer = null;
		this.esLyricPendingMeta = null;
		this.esLyricCallbackRegistered = false;
		/** @type {number} The maximum number of polling retries before giving up (60 seconds). */
		this.lyricsSearchMaxRetries = 60;
		/** @type {number} The current polling retry counter. */
		this.lyricsSearchRetries = 0;
		/** Brief Details CD notice after a search ends without lyrics. */
		this.arcNoLyricsNoticeUntil = 0;
		this.arcNoLyricsNoticeTimer = null;
		/** @private @type {string} The type of the lyrics, `.lrc` for synced and `.txt` for unsynced. */
		this.lyricType = '';
		/** @private @type {boolean} The boolean state value for lyric drag scrolling. */
		this.scrollDrag = false;
		/** @private @type {number} 歌词拖拽滚动的y坐标值。 */
		this.scrollDragY = 0;
		/** @private @type {number} 歌词拖拽滚动的偏移值。 */
		this.scrollDragOffset = 0;
		/** @private @type {number} 当前缓漫滚动动画的总持续时间（以毫秒计）。  */
		this.scrollEffectiveDuration = 200;
		// Stage 8F-R8：拖拽滚动停止后延迟回弹到当前播放行的状态。
		// scrollDragReturnDelay 为可配置延迟阈值（毫秒）：拖拽停止后等待该时长再回弹。
		this.scrollDragReturning = false;
		this.scrollDragReturnStart = 0;
		this.scrollDragReturnElapsed = 0;
		this.scrollDragReturnDuration = 220;
		this.scrollDragReturnArmed = false;
		this.scrollDragReturnArmElapsed = 0;
		this.scrollDragReturnDelay = 2000;
		/** @private @type {number} The elapsed time in ms for the current eased scroll animation. */
		this.scrollElapsed = 0;
		/** @private @type {number} The starting scroll distance captured when a new line becomes highlighted. */
		this.scrollStart = 0;
		/** @private @type {Map<string, {bmp: GdiBitmap, pad: number}|null>} The pre-rendered blurred shadow bitmap cache. */
		this.shadowBitmapCache = new Map();
		/** @private @type {string|null} The compound key `level|lineHeight`; detects when cache must be cleared. */
		this.shadowCacheKey = null;
		/** @private @type {number|null} The last lyricsShadow color; triggers full cache rebuild on change. */
		this.shadowLastColor = null;
		/** @private @type {number} The time step value for manual adjusting lyrics synchronization. */
		this.stepTime = 0;
		/** Details CD lyrics keep their own per-track correction. */
		this.detailsArcUserOffset = 0;
		this.offsetWheelIsArc = false;
		/** @private @type {Array<string>} 未找到歌词时显示的消息。 */
		this.stringNoLyrics = ['未找到歌词'];
		/** @private @type {Array<string>} 搜索完成但未找到歌词时显示的消息。 */
		this.stringNotFound = ['搜索已完成\n未找到歌词'];
		/** @private @type {Array<string>} 歌词搜索进行中时显示的消息。 */
		this.stringSearching = ['正在搜索歌词...\n请稍候...'];
		/** @private @type {FbTitleFormat} 使用 titleFormat 对象获取以秒为单位的曲目长度。 */
		this.tfLength = fb.TitleFormat('%length_seconds%');
		/** @private @type {number} 文本显示的填充值。 */
		this.textPad = SCALE(12);
		/** @private @type {boolean} The state when auto-collapse grace period is holding the translation reveal open. */
		this.translationAutoCollapseHold = false;
		/** @private @type {?number} The timeout id for the auto-collapse grace period. */
		this.translationAutoCollapseTimer = null;
		/** @private @type {?number} The interval id for the blend-only ticker used while paused and the main timer is stopped. */
		this.translationBlendTimer = null;
		/** @private @type {boolean} The flag whether the loaded lyrics contain paired original+translation lines sharing a timestamp. */
		this.translationLyrics = false;
		/** @private @type {number} The scroll drag offset value captured at the moment the transition began; layers subsequent drag input on top of the anchor while it is active. */
		this.translationScrollAnchorDragOffset = 0;
		/** @private @type {number} The lyric line index used as a fixed on-screen anchor during a compact/full reveal transition; -1 when no anchor is active. */
		this.translationScrollAnchorIndex = -1;
		/** @private @type {number} The blended offset of the anchor line captured at the moment the transition began. */
		this.translationScrollAnchorOffset = 0;
		/** @private @type {number} The scroll reference ("top") captured at the moment the transition began. */
		this.translationScrollAnchorTop = 0;
		/** @private @type {number|null} The sentence group whose gap-free (compact) offsets are currently cached; null forces a recompute. */
		this.translationSyncAppliedGroup = null;
		/** @private @type {number} The current 0-1 blend between the compact (sync-only) and full lyric layouts; animates on reveal/hide transitions. */
		this.translationSyncBlend = 1;
		/** @private @type {number} The elapsed time in ms for the current compact/full blend transition. */
		this.translationSyncBlendElapsed = 0;
		/** @private @type {number} The blend value captured at the start of the current transition, used as the easing base. */
		this.translationSyncBlendStart = 1;
		/** @private @type {number} The blend value the current transition is animating toward (0 = compact, 1 = full). */
		this.translationSyncBlendTarget = 1;
		/** @private @type {number} Duration in ms of the independent lyric-line state transition. */
		this.lineAnimationDuration = 480;
		/** @private @type {number} Maximum vertical displacement ratio used by the Stage 6B line layer. */
		this.lineAnimationOffsetRatio = 0.12;
		/** @private @type {number} Maximum temporary opacity reduction used by the Stage 6B line layer. */
		this.lineAnimationOpacityDip = 0.28;
		/** @private @type {number} Maximum temporary scale-up applied to the entering line layer. */
		this.lineAnimationEnterScale = 0.14;
		/** @private @type {number} Maximum temporary scale-down applied to the exiting line layer. */
		this.lineAnimationExitScale = 0.10;
		this.applyLineAnimationMode();
		/** @private @type {number} Elapsed time in ms on the lyric-line animation timeline. */
		this.lineAnimationElapsed = this.lineAnimationDuration;
		/** @private @type {number} Linear 0-1 progress on the lyric-line animation timeline. */
		this.lineAnimationProgress = 1;
		/** @private @type {?number} Sentence group leaving the current-line state. */
		this.lineAnimationFromGroup = null;
		/** @private @type {?number} Sentence group entering or holding the current-line state. */
		this.lineAnimationToGroup = null;
		/** @private @type {boolean} Whether a lyric-line state transition is active. */
		this.lineAnimationActive = false;
		/** @private @type {number} Last wall-clock sample for the line animation; zero means not ticking. */
		this.lineAnimationLastTick = 0;
		/** @private @type {?object} Single-entry cache of the current karaoke line's per-character geometry. */
		this.karaokeGlyphCache = null;
		/** @private @type {?object} Single-entry shine glyph-bitmap cache for horizontal lines. */
		this.karaokeShineCache = null;
		/** @private @type {?object} Single-entry shine glyph-bitmap cache for vertical columns. */
		this.karaokeShineColumnCache = null;
		/** @private @type {number} Index of the last character already celebrated by a star; -1 means unarmed. */
		this.karaokeStarLastIndex = -1;
		/** @private @type {?number} Sentence group owning the current star run; a change resyncs without a burst. */
		this.karaokeStarGroup = null;
		/** @private @type {Array<object>} Fixed-capacity pool of karaoke star particles. */
		this.karaokeStarPool = [];
		/** @private @type {Map<string, GdiBitmap>} Pre-rendered star sprites keyed by size and colour. */
		this.karaokeStarSpriteCache = new Map();
		/** @private @type {Map<string, {sharp:GdiBitmap, glow:?GdiBitmap, pad:number}>} Cached emphasised-glyph sprites with their optional ink halo. */
		this.karaokeEmphasisCache = new Map();
		/** @private @type {Map<string, string[]>} 竖排显示字形缓存，按源文本复用，避免每帧重复逐字符解析。 */
		this.verticalGlyphCache = new Map();
		/** @private @type {?Array<object>} 已合并并切分好的竖排句列；歌词/尺寸/换行策略不变时直接复用。 */
		this.verticalColumnsCache = null;
		/** @private @type {?object} 列缓存对应的歌词数组引用。 */
		this.verticalColumnsKey = null;
		/** @private @type {number} 列缓存对应的歌词数组长度（捕捉原地追加）。 */
		this.verticalColumnsKeyLength = -1;
		/** @private @type {number} 列缓存对应的单行最大字数（含 Infinity）。 */
		this.verticalColumnsMaxGlyphs = -1;
		/** @private @type {?string} 列缓存对应的换行策略。 */
		this.verticalColumnsWrap = null;
		/** @private @type {Map<number, GdiFont>} auto-shrink 模式等比缩小字体的字号缓存。 */
		this.verticalFitFontCache = new Map();
		/** @private @type {number} Minimum duration of one per-character emphasis pulse. */
		this.karaokeEmphasisMinDuration = 150;
		/** @private @type {number} Maximum duration of one per-character emphasis pulse. */
		this.karaokeEmphasisMaxDuration = 320;
		/** @private @type {number} Maximum flight time of one parabolic hop; longer holds land early and rest. */
		this.karaokeHopMaximumDuration = 900;
		/** @private @type {number} Rest time on a landed character before the hop star starts fading. */
		this.karaokeHopRestDuration = 380;
		/** @private @type {number} Fade-out duration of the hop star after its final landing. */
		this.karaokeHopFadeDuration = 280;
		/** @private @type {number} Scale-in duration of the hop star at its first launch. */
		this.karaokeHopBirthDuration = 100;
		/** @private @type {?number} Cached index where the metadata/header region ends; null forces a rescan. */
		this.lyricsHeaderEndIndex = null;
		/** @private @type {?Array} The lyrics array the cached header boundary was computed from. */
		this.lyricsHeaderEndSource = null;
		/** @private @type {number} Duration of the one-shot current-line karaoke breath. */
		this.karaokeBreathDuration = 520;
		/** @private @type {number} Peak scale added by the selected breath profile. */
		this.karaokeBreathAmplitude = 0.02;
		this.applyKaraokeBreathMode();
		/** @private @type {number} Elapsed breath time; negative values are the post-line-animation delay. */
		this.karaokeBreathElapsed = this.karaokeBreathDuration;
		/** @private @type {boolean} Whether the independent breath timeline is running. */
		this.karaokeBreathActive = false;
		/** @private @type {?number} Sentence group currently receiving the one-shot breath. */
		this.karaokeBreathSentenceGroup = null;
		/** @private @type {?number} Last sentence group already triggered or deliberately settled by seek/reload. */
		this.karaokeBreathLastTriggeredGroup = null;
		/** @private @type {number} Last wall-clock breath sample; zero freezes the timeline during pause. */
		this.karaokeBreathLastTick = 0;
		/** @private @type {Map<number, number>} Explicit final karaoke end time keyed by sentence group. */
		this.karaokeCompletionEnds = new Map();
		/** @private @type {Map<number, {start:number,end:number}>} Reliable final-fragment sustain windows. */
		this.karaokeSustainWindows = new Map();
		/** @private @type {number} Minimum explicit final-fragment duration eligible for sustain treatment. */
		this.karaokeSustainMinimum = 560;
		/** @private @type {boolean} Whether a real track change is waiting for a settled preset palette. */
		this.trackThemeColorGateActive = false;
		/** @private @type {string} Current now-playing identity used to distinguish reloads from track changes. */
		this.trackThemeColorGateTrackKey = '';
		/** @private @type {number} Wall-clock start of the current track palette gate. */
		this.trackThemeColorGateStartedAt = 0;
		/** @private @type {string} Last fully admitted runtime palette signature. */
		this.trackThemeColorGateSettledSignature = '';
		/** @private @type {string} Previous track palette signature. */
		this.trackThemeColorGatePreviousSignature = '';
		/** @private @type {string} Palette signature currently proving stability. */
		this.trackThemeColorGateCandidateSignature = '';
		/** @private @type {boolean} Whether a dynamic preset has produced a new palette signature. */
		this.trackThemeColorGateObservedChange = false;
		/** @private @type {boolean} Whether this preset must prove a new signature. */
		this.trackThemeColorGateRequiresChange = false;
		/** @private @type {number} Last wall-clock palette-signature change. */
		this.trackThemeColorGateLastChange = 0;
		/** @private @type {number} Minimum track-change suppression interval. */
		this.trackThemeColorGateMinimum = 1200;
		/** @private @type {number} Required uninterrupted quiet interval before any new highlight is admitted. */
		this.trackThemeColorGateStablePeriod = 1200;
		/** @private @type {number} Ceiling for waiving only the dynamic-signature-change requirement. */
		this.trackThemeColorGateMaximum = 3600;
		/** @private @type {?number} Immutable visible highlight snapshot for the current track/theme pair. */
		this.stableLyricsHighlightColor = null;
		/** @private @type {?number} Candidate used only while establishing a new snapshot. */
		this.stableLyricsHighlightCandidate = null;
		/** @private @type {number} Wall-clock time at which the candidate last changed. */
		this.stableLyricsHighlightCandidateSince = 0;
		/** @private @type {number} Distinct runtime source colours observed since the gate opened. */
		this.stableLyricsHighlightCandidateChanges = 0;
		/** @private @type {string} Theme/mode/seekbar identity owning the current snapshot. */
		this.stableLyricsHighlightThemeKey = this.getLyricsHighlightSnapshotContextKey();
		/** @private @type {number} Full-highlight hold after the final timed fragment finishes. */
		this.karaokeEndingHold = 180;
		/** @private @type {number} Duration of the subtle completed-line colour settle. */
		this.karaokeEndingSettleDuration = 360;
		/** @private @type {number} Maximum darkening used by the completed-line stable state. */
		this.karaokeEndingSettleDepth = 0.06;
		/** @private @type {number} Minimum reliable silent interval required before the interlude prompt is shown. */
		this.longGapPromptMinimum = 3000;
		/** @private @type {Array<{start:number,end:number}>} Explicitly timed gaps between adjacent sentence groups. */
		this.longGapRanges = [];
		/** @private @type {string} Last rendered countdown state; prevents continuous repainting during a gap. */
		this.longGapPromptLastKey = '';

		this.clear();
	}

	// * PUBLIC METHODS * //
	// #region PUBLIC METHODS
	/**
	 * 设置歌词的大小和位置。
	 */
	setLyricsPosition() {
		if (grm.details.isTurntableActive()) {
			const bounds = grm.details.getTurntableLyricsBounds();
			if (bounds) this.on_size(bounds.x, bounds.y, bounds.w, bounds.h);
			else this.on_size(grm.ui.ww, grm.ui.topMenuHeight, 0, 0);
			return;
		}
		const lyricsLayout = grm.ui.displayDetails ? 'normal' : grSet.lyricsLayout;
		const fullW = grSet.layout === 'default' && lyricsLayout !== 'normal' && grm.ui.displayLyrics;
		// FIX37：完整歌词页使用窗口可用宽度，横排与竖排共用同一布局边界。
		const fullLyricsWidth = fullW && lyricsLayout === 'full';
		const noAlbumArtSize = grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight;
		const margin = SCALE(40);

		this.w =
			(fullLyricsWidth ? grm.ui.ww : grm.ui.noAlbumArtStub ?
				grSet.layout === 'artwork' ? grm.ui.ww :
				grSet.panelWidthAuto ? noAlbumArtSize :
				grm.ui.ww * 0.5 :
			lyricsLayout === 'full' ? grm.ui.ww * 0.75 :
			grm.ui.albumArtSize.w) - margin * 2;

		this.h = (grm.ui.noAlbumArtStub ? grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight : grm.ui.albumArtSize.h) - margin * 2;

		this.x =
			fullLyricsWidth ? margin :
			!grm.ui.noAlbumArtStub && lyricsLayout === 'full' && grm.ui.displayLyrics ? (grm.ui.ww - this.w) * 0.5 :
			(grm.ui.noAlbumArtStub || grSet.layout === 'default' && lyricsLayout !== 'normal' ?
				fullW ? grSet.panelWidthAuto && lyricsLayout === 'normal' ? noAlbumArtSize * 0.5 :
				lyricsLayout === 'left' ? grm.ui.albumArtSize.x + grm.ui.albumArtSize.w + (grm.ui.ww - grm.ui.albumArtSize.x - grm.ui.albumArtSize.w - this.w) * 0.5 - margin :
				lyricsLayout === 'right' ? (grm.ui.albumArtSize.x - this.w) * 0.5 - margin :
				(grm.ui.ww - this.w) * 0.5 - margin :
				grSet.panelWidthAuto ? grm.ui.albumArtSize.x : 0 :
			grm.ui.albumArtSize.x) + margin;

		this.y = (grm.ui.noAlbumArtStub ? grm.ui.topMenuHeight : grm.ui.albumArtSize.y) + margin;

		this.on_size(this.x, this.y, this.w, this.h);
	}

	/** FIX60: Immediately hide stale lyrics at a track boundary without decoding or laying out new lyrics. */
	invalidateLyricsForTrackTransition() {
		if (this.lyricsClosed) return;
		// Invalidate any pending save/verify/ESLyric work before the CD animation starts.
		this.lyricLoadEpoch = (this.lyricLoadEpoch || 0) + 1;
		this.abortSearch();
		// Unlike clear(), avoid expensive font/layout/bitmap cache reconstruction here.
		if (this.timer) {
			grAnimationManager.remove(this.timer);
			this.timer = null;
		}
		this.lyrics = [];
		this.lyricSource = [];
		this.locus = -1;
		this.lyr = '';
		this.repaintRect();
	}

	/**
	 * 初始化歌词，步骤如下：
     * - 如果在本地缓存或嵌入标签中找到，则从缓存加载。
     * - 否则将触发定时搜索。
     * - 如果未找到任何内容，将显示"未找到歌词"字符串。
	 */
	initLyrics() {
		if (this.lyricsClosed) return;
		this.lyricLoadEpoch = (this.lyricLoadEpoch || 0) + 1;
		this.abortSearch();
		this.clear();
		this.trackThemeColorGateStart();

		if (!fb.IsPlaying && grSet.panelBrowseMode) {
			fb.Play(); fb.Pause();
		}

		let rawLyrics = [];
		const embeddedLyrics = $(grTF.lyrics);
		const foundLyrics = this.findLyrics();

		 // * 当歌词更改时启动ESLyric回调监听器
		if (Component.ESLyric && !this.esLyricCallbackRegistered) {
			esl.SetPlayingLyricChangedCallback(this.esLyricChangedCallback);
			this.esLyricCallbackRegistered = true;
		}

		if (foundLyrics) {
			if (grm.ui.displayLyrics) grm.debug.debugLog('找到歌词:', this.fileName);
			rawLyrics = utils.ReadTextFile(this.fileName, 65001).split(Regex.BreakLine);
		}
		else if (embeddedLyrics.length) {
			rawLyrics = embeddedLyrics === '.' ? [
				'歌词无法显示。',
				'要始终正确显示 %LYRICS% 或 %UNSYNCED LYRICS% ， 你必须编辑 LargeFieldsConfig.txt 并注释掉或删除 "fieldSpam" 下的特定条目。'
			] : embeddedLyrics.split(Regex.BreakLine);
		}

	    // * 找到歌词	   
		if (rawLyrics.length) {
			this.lyricsSearching = false;
			this.lyricsLoadedFromLocal = true;
			this.scheduleLyricTask('localLyricsUnlockTimer', () => { this.lyricsLoadedFromLocal = false; }, 500);
			this.loadLyrics(rawLyrics);
		}
		// * 未在本地找到歌词，正在搜索...									
		else if (Component.ESLyric && !this.lyricsSearching) {
			this.lyricsSearching = true;
			this.searchLyrics();
		}
		// * 搜索完成，未找到歌词
		else {
			this.loadLyrics(this.stringNoLyrics);
		}

		this.on_size(this.x, this.y, this.w, this.h);
	}

	/**
	 * 搜索配置文件中的歌词路径和文件模式列表以查找歌词文件。
	 * @returns {boolean} 真或假。
	 */
	findLyrics() {
		let foundLyrics = false;
		const tpath = [];
		const tfilename = [];
		const stripReservedChars = (filename) => filename.replace(Regex.PathIllegalFilename, '_');
		const lyricPaths = grPath.lyricsPath();

		for (const path of lyricPaths) {
			tpath.push($($Escape(path)));
		}
		for (const filename of grCfg.lyricsFilenamePatterns) {
			tfilename.push(stripReservedChars($(filename)));
		}

		for (let i = 0; i < tpath.length && !foundLyrics; i++) {
			for (const file of tfilename) {
				foundLyrics = this.checkLyrics(tpath[i], file);
				if (foundLyrics) {
					break;
				}
			}
		}

		return foundLyrics;
	}

	/**
	 * 检查歌词文件是否存在于路径+文件名中，如果存在则设置this.fileName。
	 * @param {string} path - 歌词文件路径。
	 * @param {string} filename - 歌词文件名。
	 * @returns {boolean} 如果文件存在且this.fileName已设置，则返回true，否则返回false。
	 */
	checkLyrics(path, filename) {
		this.lyricType = this.lyricSource.some(line => Regex.LyricsTimestamp.test(line)) ? 'lrc' : 'txt';
		const types = [...new Set([this.lyricType, 'lrc', 'txt'])];

		for (const type of types) {
			const currentFile = `${path + filename}.${type}`;
			if (IsFile(currentFile)) {
				this.fileName = currentFile;
				return true;
			}
		}

		return false;
	}

	/**
	 * 开始一分钟的歌词搜索并等待。
	 */
	searchLyrics() {
		this.loadLyrics(this.stringSearching);
		this.lyricsSearchRetries = 0;
		this.lyricsSaveCommandSent = false;
		this.saveLyrics(fb.GetNowPlaying());

		clearTimeout(this.searchTimeout);

		this.searchTimeout = setTimeout(() => {
			this.lyricsSearching = false;
			this.lyricsSaveCommandSent = false;
			clearInterval(this.lyricsSearchTimer);

			if (!this.findLyrics()) {
				const result = this.lyricSource.length ? this.lyricSource : this.stringNotFound;
				this.loadLyrics(result);
				if (result === this.stringNotFound) {
					this.arcNoLyricsNoticeUntil = Date.now() + 3000;
					this.arcNoLyricsNoticeTimer = setTimeout(() => {
						this.arcNoLyricsNoticeTimer = null;
						if (this.lyr === this.stringNotFound && grm.ui.displayDetails &&
							(grSet.detailsLyricsDisplayMode === 'arc' && !grm.details.isTurntableActive())) window.Repaint();
					}, 3000);
				}
				this.on_size(this.x, this.y, this.w, this.h);
			}
		}, 60000);
	}

	/**
     * 更改当前歌词（更改歌词来源时使用），仅用于ESLyric的"歌词搜索"。
     * @param {object} meta - 包含新歌词文本的元数据对象。
	 */
	/** FIX59: Never parse/search/save synchronously inside ESLyric's notification callback. */
	queueESLyricChange(meta) {
		if (this.lyricsClosed || !meta || !meta.lyricText || this.lyricsLoadedFromLocal) return;
		// An ESLyric result received before the new track has initialized may belong to the old song.
		if (grm.ui.pendingNewTrackLyricsTimer) return;
		this.esLyricPendingMeta = meta;
		clearTimeout(this.esLyricChangeTimer);
		const epoch = this.lyricLoadEpoch || 0;
		const flush = () => {
			this.esLyricChangeTimer = null;
			if (this.lyricsClosed || epoch !== (this.lyricLoadEpoch || 0)) return;
			// A new track may be awaiting FIX58's disc-first initialization.
			if (grm.ui.pendingNewTrackLyricsTimer ||
				(grSet.discArtAnimation && grm.ui.displayDetails &&
				!grm.details.usesTurntableRenderer() && grm.details.isDiscArtTransitionActive())) {
				this.esLyricChangeTimer = setTimeout(flush, 40);
				return;
			}
			const current = this.esLyricPendingMeta;
			this.esLyricPendingMeta = null;
			if (current && fb.IsPlaying) this.changeLyrics(current);
		};
		this.esLyricChangeTimer = setTimeout(flush, 40);
	}

	changeLyrics(meta) {
		if (this.lyricsClosed) return;
		// * Case 1: suppress spontaneous post-load callbacks
		if (this.lyricsLoadedFromLocal) return;

		const wasSearching = this.lyricsSearching;
		this.clear();

		if (!meta || !meta.lyricText) return;

		// Preview the found lyrics immediately
		this.lyricSource = meta.lyricText.split(Regex.BreakLine);
		this.loadLyrics(this.lyricSource);

		// * Case 2: user-triggered - save the selected lyrics and keep them displayed.
		if (!wasSearching) {
			try {
				fb.RunMainMenuCommand('视图/ESLyric/面板/保存歌词');
				this.lyricsSaveCommandSent = true;
			} catch (e) {
				console.log('歌词搜索：运行保存命令时出错 -', e);
			}
			return;
		}

		// * Case 3: active programmatic search, send save command once, then verify the file
		if (!this.lyricsSaveCommandSent) {
			try {
				fb.RunMainMenuCommand('视图/ESLyric/面板/保存歌词');
				this.lyricsSaveCommandSent = true;
			} catch (e) {
				console.log('歌词搜索: 运行保存命令时出错 -', e);
			}
		}

		// * Give ESLyric time to write the file, then verify and finalize
		this.scheduleLyricTask('lyricsVerifyTimer', () => {
			if (!this.findLyrics()) return;
			this.abortSearch();
			this.initLyrics();
		}, 1500);
	}

	/**
	 * 循环切换到搜索结果中的下一个歌词来源，仅用于ESLyric的"下一首歌词"功能。
	 */
	nextLyrics() {
		if (this.lyricsClosed) return;
		this.lyricsLoadedFromLocal = false;

		const nextSrc = (meta) => {
			this.lyricsSourceQueue++;

			RepeatFunc(() => {
				fb.RunMainMenuCommand('视图/ESLyric/面板/选择歌词/下一个歌词');
				if (!meta) return;

				this.lyricSource = meta.lyricText.split(Regex.BreakLine);
			}, this.lyricsSourceQueue);

			return this.lyricsSourceQueue;
		};

		nextSrc();
		this.scheduleLyricTask('lyricsNextSaveTimer', () => { fb.RunMainMenuCommand('视图/ESLyric/面板/保存歌词'); }, 1000);
		this.scheduleLyricTask('lyricsNextReloadTimer', () => { this.initLyrics(); }, 1000);
	}

	/**
	* 成功找到歌词后自动将歌词文件保存到缓存中。
	 * @param {FbMetadbHandle} metadb - 曲目的元数据库句柄。
	 */
	saveLyrics(metadb) {
		clearInterval(this.lyricsSearchTimer);
		if (!Component.ESLyric || !metadb) return;

		this.lyricsSearchRetries = 0;

		this.lyricsSearchTimer = setInterval(() => {
			this.lyricsSearchRetries++;

			if (this.lyricsSearchRetries >= this.lyricsSearchMaxRetries) {
				clearInterval(this.lyricsSearchTimer);
				this.lyricsSearching = false;
				this.lyricsSaveCommandSent = false;
				return;
			}

			if (this.findLyrics()) {
				clearInterval(this.lyricsSearchTimer);
			}
		}, 1000);
	}

	/**
	 * 初始化用于显示歌词的各种变量和设置，并将它们发送到解析器。
	 * @param {Array<string>} lyr - 将要加载和显示的歌词。
	 */
	loadLyrics(lyr) {
		if (!Equal(lyr, this.lyr)) {
			this.lyr = lyr;
			this.userOffset = 0;
			this.detailsArcUserOffset = 0;
		}

		this.stop();
		clearTimeout(this.showOffsetTimer);
		
		 // 当foobar以`简单`布局启动，且启动面板设置为`歌词`时，
        // 切换回`正常`布局时，需要先重新创建歌词字体。
		if (!grFont.lyrics || !grFont.lyricsHighlight) grm.ui.createFonts();

		/** @type {GdiFont} */
		this.font = {
			lyrics: grSet.lyricsLargerCurrentSync ? grFont.lyricsHighlight : grFont.lyrics
		};

		/** @type {GdiGraphics} */
		GDI(1, 1, false, g => {
			this.font.lyrics_h = Math.round(g.CalcTextHeight('Ag', this.font.lyrics));
		});

		this.setLyricsPosition();

		 // 根据字体大小计算缩放因子
		const defaultFontSize = HD_QHD_4K(20, 22);
		const scaleFactor = grSet.lyricsFontSize_layout / defaultFontSize;
		this.lineHeight = SCALE(grSet.lyricsLineSpacing * scaleFactor);
		this.sentenceSpacing = SCALE(grSet.lyricsSentenceSpacing * scaleFactor);

		this.alignCenter = StringFormat(1, 1);
		this.alignRight = StringFormat(2, 1);
		this.init = true;
		this.arc = SCALE(6);

		this.locus = -1;
		this.lyrics = [];
		this.arcFocusState = null;
		this.arcSentenceLayout = null;
		if (this.arcWrapCache) this.arcWrapCache.clear();
		if (this.circularArcCache) this.circularArcCache.clear();
		this.verticalEligibilityCache = null;
		this.lyricsOffset = 0;
		this.maxLyrWidth = 0;
		this.newHighlighted = false;
		this.translationSyncAppliedGroup = null;
		this.lineAnimationReset();

		this.durationScroll = grSet.lyricsScrollAdaptive ? Math.round(grSet.lyricsScrollRateMax * 2 / 3) : grSet.lyricsScrollRateAvg * 0.5;
		this.factor = this.durationScroll < 1500 ? 20 : 24;
		this.delta = this.lineHeight * this.factor / this.durationScroll;
		this.minDurationScroll = Math.min(this.durationScroll, 250);
		this.scroll = 0;
		this.scrollStart = 0;
		this.scrollElapsed = 0;
		this.scrollEffectiveDuration = this.durationScroll * 16 / this.factor;

		// Map the string-based menu value to a numeric level.
		const shadowLevelMap = { none: 0, small: 1, normal: 2, large: 3 };
		const rawLevel = grSet.lyricsDropShadowLevel;
		this.dropShadowLevel = typeof rawLevel === 'string' ? shadowLevelMap[rawLevel] : rawLevel;
		this.shadowEffect = this.dropShadowLevel > 0;

		// Invalidate shadow bitmap cache when the level or line height changes
		const newShadowCacheKey = `${this.dropShadowLevel}|${Math.round(this.lineHeight)}|${grSet.lyricsFontSize_layout}`;
		if (this.shadowCacheKey !== newShadowCacheKey) {
			this.shadowBitmapCache.clear();
			this.shadowCacheKey = newShadowCacheKey;
		}

		this.showOffsetTimer = null;
		this.timer = null;
		this.trackLength = parseInt(this.tfLength.Eval(true));
		this.transitionOffset = this.durationScroll / 2;
		this.transBot = {};
		this.transTop = {};
		this.type = {
			none: false,
			synced: false,
			unsynced: false
		};

		this.updateLyricsBounds();
		this.parseLyrics(lyr);
		this.turntableLyricsWrapKey = this.getTurntableLyricsWrapKey();
	}

	/**
	 * Filters parsed (pre-wrap) lyrics based on the translation setting.
	 * When translation is disabled only the line selected by lyricsTranslationHighlightMode is kept per timestamp group.
	 * When translation is shown, tags each line as primary/secondary. The tag is shared by
	 * current-only reveal and Stage 6G translation display controls.
	 * @param {Array<object>} lyrics - The parsed lyrics with `timestamp` and `group` properties.
	 * @returns {Array<object>} The filtered lyrics, or the original array (possibly tagged) when translation is shown.
	 */
	filterAndHighlightLyrics(lyrics) {
		if (grSet.lyricsTranslation) {
			this.translationTagOriginalLines(lyrics);
			return lyrics;
		}

		const filteredLyrics = [];
		const groupedLyrics = {};

		for (const lyric of lyrics) {
			if (!groupedLyrics[lyric.timestamp]) {
				groupedLyrics[lyric.timestamp] = {};
			}

			if (!groupedLyrics[lyric.timestamp][lyric.group]) {
				groupedLyrics[lyric.timestamp][lyric.group] = [];
			}

			groupedLyrics[lyric.timestamp][lyric.group].push(lyric);
		}

		const selectedGroupIndex = grSet.lyricsTranslationHighlightMode === 3 ? 0 : grSet.lyricsTranslationHighlightMode - 1;

		for (const timestamp in groupedLyrics) {
			const timestampGroups = Object.keys(groupedLyrics[timestamp]).sort((a, b) => a - b);
			const selectedGroup = timestampGroups[Math.min(selectedGroupIndex, timestampGroups.length - 1)];

			filteredLyrics.push(...groupedLyrics[timestamp][selectedGroup]);
		}

		filteredLyrics.sort((a, b) => a.timestamp - b.timestamp || a.sentenceGroup - b.sentenceGroup);

		return filteredLyrics;
	}

	/**
	 * 确定歌词是同步还是非同步，并相应地进行格式化和解析。
	 * @param {Array<string>} lyr - 需要解析的歌词。
	 */
	parseLyrics(lyr) {
		if (!lyr.length) {
			this.type.none = true;
			lyr = this.stringNoLyrics;
		}

		if (!this.type.none) {
			this.type.synced = lyr.some(line => Regex.LyricsTimestampLeading.test(line));
			this.type.unsynced = !this.type.synced;
		}

		if (this.type.synced) {
			let lyrOffset = null;

			lyr.some(line => {
				lyrOffset = line.match(Regex.LyricsOffset);
				return lyrOffset;
			});

			this.lyricsOffset = lyrOffset && lyrOffset.length > 0 ? parseInt(lyrOffset[1]) : 0;
			if (isNaN(this.lyricsOffset)) {
				this.lyricsOffset = 0;
			}

			const parsedLyrics = this.parseSyncLyrics(lyr, this.type.none);
			this.longGapRanges = this.buildLongGapRanges(parsedLyrics);
			const filteredLyrics = this.filterAndHighlightLyrics(parsedLyrics);
			this.formatLyrics(filteredLyrics, this.type.synced);
		}
		else if (this.type.unsynced) {
			this.longGapRanges = [];
			const parsedLines = this.parseUnsyncedLyrics(lyr, this.type.none);
			this.formatLyrics(parsedLines);
			const ratio = grm.ui.isStreaming ? 2000 : (this.trackLength / parsedLines.length) * 1000;

			let groupIndex = -1;
			let groupTimestamp = 0;

			for (const line of this.lyrics) {
				if (!line.multiLine) {
					groupIndex++;
					groupTimestamp = ratio * groupIndex;
				}
				line.timestamp = groupTimestamp;
			}
		}

		this.translationSyncBlend = this.isSyncOnlyActive() ? 0 : 1;
		this.translationSyncBlendTarget = this.translationSyncBlend;
		this.translationSyncBlendStart = this.translationSyncBlend;
		this.translationSyncBlendElapsed = 0;

		this.seek();
		this.start();
	}

	/**
	 * 解析包含时间戳和每行内容的同步歌词，按时间戳排序。
     * @param {string} lyr - 歌曲的歌词。数组中的每个字符串代表一行歌词。
	 * @param {boolean} isNone - 表示歌词数组是否以时间戳开头。
	 * @returns {Array} 具有`timestamp`、`content`、`group`和`sentenceGroup`属性的对象数组。
	 */
	parseSyncLyrics(lyr, isNone) {
		const lyrics = [];
		let groupId = 0;
		let sentenceGroup = 0;
		let prevTimestamp = null;

		if (isNone) {
			lyrics.push({
				timestamp: 0,
				content: lyr[0],
				group: 0,
				sentenceGroup: 0
			});
		}

		for (const line of lyr) {
			if (!this.lyricsOffset && Regex.LyricsOffset.test(line)) {
				this.lyricsOffset = parseInt(line.match(Regex.LyricsOffset)[1]) || 0;
				continue;
			}

			const matches = line.match(Regex.LyricsTimestampLeading);

			if (matches) {
				const parsedContent = this.parseEnhancedLyricsContent(line);
				const content = parsedContent.content;
				const karaoke = parsedContent.karaoke;
				const timestamps = matches[0].match(Regex.PunctBracketed);
				const currentTimestamp = this.getMilliseconds(timestamps[0]);

				if (prevTimestamp !== null && currentTimestamp !== prevTimestamp) {
					sentenceGroup++;
				}

				for (const ts of timestamps) {
					lyrics.push({
						timestamp: this.getMilliseconds(ts),
						content,
						group: groupId,
						sentenceGroup,
						karaoke
					});
				}

				groupId++;
				prevTimestamp = currentTimestamp;
			}
		}

		this.applyEstimatedTranslationKaraoke(lyrics);

		return lyrics.sort((a, b) =>
			a.timestamp - b.timestamp || a.sentenceGroup - b.sentenceGroup
		);
	}

	/**
	 * 为同一时间组内缺少结束时间的译文行补充估算式卡拉 OK 区间。
	 * 已经具有 `[开始]译文[结束]` 的行保持原样；只有主原文行存在有效计时、
	 * 次级行没有任何行内计时数据时，才复用主原文的句末时间。
	 * @param {Array<object>} lyrics - 换行前的同步歌词对象。
	 */
	applyEstimatedTranslationKaraoke(lyrics) {
		const timestampGroups = new Map();

		for (const lyric of lyrics) {
			if (!timestampGroups.has(lyric.timestamp)) {
				timestampGroups.set(lyric.timestamp, []);
			}
			timestampGroups.get(lyric.timestamp).push(lyric);
		}

		const orderedTimestamps = Array.from(timestampGroups.keys()).sort((a, b) => a - b);

		for (let timestampIndex = 0; timestampIndex < orderedTimestamps.length; timestampIndex++) {
			const timestamp = orderedTimestamps[timestampIndex];
			const group = timestampGroups.get(timestamp);
			if (group.length < 2) continue;

			const primaryGroup = Math.min(...group.map(lyric => lyric.group));
			const primary = group.find(lyric => lyric.group === primaryGroup);
			if (!primary?.karaoke?.length) continue;

			const explicitStarts = primary.karaoke
				.map(part => part.start)
				.filter(start => typeof start === 'number' && Number.isFinite(start));
			const explicitEnds = primary.karaoke
				.map(part => part.end)
				.filter(end => typeof end === 'number' && Number.isFinite(end));
			const estimatedStart = explicitStarts.length ? Math.min(...explicitStarts) : timestamp;
			const nextTimestamp = orderedTimestamps[timestampIndex + 1];
			const estimatedEnd = explicitEnds.length
				? Math.max(...explicitEnds)
				: nextTimestamp;

			if (!Number.isFinite(estimatedStart) || typeof estimatedEnd !== 'number' ||
				!Number.isFinite(estimatedEnd) || estimatedEnd <= estimatedStart) {
				continue;
			}

			for (const lyric of group) {
				if (lyric.group === primaryGroup || lyric.karaoke?.length || !lyric.content) continue;

				lyric.karaoke = [{
					start: estimatedStart,
					end: estimatedEnd,
					text: lyric.content
				}];
				lyric.karaokeEstimated = true;
			}
		}
	}

	/**
	 * Builds reliable long-gap ranges from adjacent synchronized sentence groups.
	 * A range is accepted only when the primary lyric line has an explicit final
	 * Enhanced-LRC end time. Missing ends deliberately do not fall back to the next
	 * line timestamp because a sustained final syllable cannot be distinguished from silence.
	 * @param {Array<object>} lyrics - Parsed, unwrapped synchronized lyrics.
	 * @returns {Array<{start:number,end:number}>} Reliable interlude ranges.
	 */
	buildLongGapRanges(lyrics) {
		if (!Array.isArray(lyrics) || lyrics.length < 2) return [];

		const sentenceGroups = new Map();

		for (const lyric of lyrics) {
			if (!sentenceGroups.has(lyric.sentenceGroup)) {
				sentenceGroups.set(lyric.sentenceGroup, []);
			}
			sentenceGroups.get(lyric.sentenceGroup).push(lyric);
		}

		const orderedGroups = Array.from(sentenceGroups.values()).sort((a, b) =>
			Math.min(...a.map(lyric => lyric.timestamp)) - Math.min(...b.map(lyric => lyric.timestamp))
		);
		const ranges = [];

		for (let i = 0; i < orderedGroups.length - 1; i++) {
			const currentGroup = orderedGroups[i];
			const nextGroup = orderedGroups[i + 1];
			const primaryGroup = Math.min(...currentGroup.map(lyric => lyric.group));
			const primary = currentGroup.find(lyric => lyric.group === primaryGroup && lyric.karaoke?.length);
			const lastPart = primary?.karaoke?.[primary.karaoke.length - 1];
			const explicitEnd = lastPart?.end;
			const nextStart = Math.min(...nextGroup.map(lyric => lyric.timestamp));

			if (!Number.isFinite(explicitEnd) || !Number.isFinite(nextStart) ||
				explicitEnd <= primary.timestamp || nextStart - explicitEnd < this.longGapPromptMinimum) {
				continue;
			}

			ranges.push({ start: explicitEnd, end: nextStart });
		}

		return ranges;
	}

	/**
	 * 解析不包含时间戳的非同步歌词。
	 * @param {Array<string>} lyr - 歌曲的歌词。
	 * @param {boolean} isNone - 第一行歌词是否应被视为时间戳。
	 * @returns {Array<object>} 为每行歌词提供"timestamp"、"content"和"sentenceGroup"属性的对象数组。
	 */
	parseUnsyncedLyrics(lyr, isNone) {
		const lyrics = [];

		if (isNone) {
			lyrics.push({ timestamp: 0, content: lyr[0], sentenceGroup: 0 });
		}

		for (const [i, line] of lyr.entries()) {
			lyrics.push({ timestamp: 0, content: this.tidy(line), sentenceGroup: i });
		}

		return lyrics;
	}

	/**
	* 使用同步和换行格式化歌词。
	 * @param {Array} lyrics - 具有"content"、"timestamp"、"group"和"sentenceGroup"属性的对象数组。
	 * @param {boolean} isSynced - 歌词是否与音频同步。
	 */
	formatLyrics(lyrics, isSynced) {
		this.translationLyrics = false;

		if (lyrics.length && this.w > 10) {
			if (isSynced && lyrics[0].content && lyrics[0].timestamp > this.durationScroll) {
				lyrics.unshift({ timestamp: 0, content: '', group: -1, sentenceGroup: -1 });
			}

			this.translationLyrics = grSet.lyricsTranslation && lyrics.some((l, i) =>
				i > 0 && l.group !== lyrics[i - 1].group && l.timestamp === lyrics[i - 1].timestamp
			);

			GDI(1, 1, false, g => {
				for (let i = 0; i < lyrics.length; i++) {
					const l = g.EstimateLineWrap(lyrics[i].content, this.font.lyrics, this.w - 10);
					let karaokeSearchStart = 0;

					if (l[1] > this.maxLyrWidth) {
						this.maxLyrWidth = l[1];
					}

					if (l.length > 2) {
						const numLines = l.length / 2;
						let maxScrollTime = this.durationScroll * 2;

						if (lyrics[i + 1]) {
							maxScrollTime = Math.min(maxScrollTime * numLines, (lyrics[i + 1].timestamp - lyrics[i].timestamp) / numLines);
						}

						for (let j = 0; j < l.length; j += 2) {
							const wrappedContent = l[j].trim();
							const wrappedKaraoke = this.mapKaraokeToWrappedLine(
								lyrics[i].content,
								lyrics[i].karaoke,
								wrappedContent,
								karaokeSearchStart
							);

							karaokeSearchStart = wrappedKaraoke.nextSearchStart;

							this.lyrics.push({
								content: wrappedContent,
								timestamp: lyrics[i].timestamp + maxScrollTime * j / 2,
								id: i,
								multiLine: !!j,
								group: lyrics[i].group,
								wrapGroup: i,
								sentenceGroup: lyrics[i].sentenceGroup,
								// Preserve the parsed sentence for the CD rail: this cover-width
								// wrap must not become a third independently painted arc line.
								arcSourceContent: lyrics[i].content,
								arcSourceTimestamp: lyrics[i].timestamp,
								arcSourceKaraoke: lyrics[i].karaoke,
								isOriginalTranslation: lyrics[i].isOriginalTranslation,
								karaoke: wrappedKaraoke.karaoke,
								karaokeEstimated: lyrics[i].karaokeEstimated,
								karaokeSourceContent: wrappedContent
							});
						}
					}
					else {
						this.lyrics.push({
							content: lyrics[i].content.trim(),
							timestamp: lyrics[i].timestamp,
							id: i,
							group: lyrics[i].group,
							wrapGroup: i,
							sentenceGroup: lyrics[i].sentenceGroup,
							isOriginalTranslation: lyrics[i].isOriginalTranslation,
							karaoke: lyrics[i].karaoke,
							karaokeEstimated: lyrics[i].karaokeEstimated,
							karaokeSourceContent: lyrics[i].content
						});
					}
				}
			});

			// Compute cumulative vertical offsets, adding sentence spacing at group boundaries
			let cumulativeY = 0;

			for (let i = 0; i < this.lyrics.length; i++) {
				if (i > 0 && this.lyrics[i].sentenceGroup !== this.lyrics[i - 1].sentenceGroup) {
					const sentenceSpacing = this.translationLyrics ? this.sentenceSpacing : this.sentenceSpacing * 0.5;
					cumulativeY += sentenceSpacing;
				}
				this.lyrics[i].yOffset = cumulativeY;

				// Stage 6H R4 Fix1：原文、译文和自动换行统一使用播放器原生歌词行距。
				cumulativeY += this.lineHeight * this.getTranslationLineAdvanceFactor(this.lyrics[i], this.lyrics[i + 1]);
			}
		}

		this.maxLyrWidth = Math.min(this.maxLyrWidth + 40, this.w);
		const incr = Math.min(500, this.durationScroll);

		for (const [i, v] of this.lyrics.entries()) {
			const t1 = this.getTimestamp(i - 1);
			const t2 = this.getTimestamp(i);
			const t3 = this.getTimestamp(i + 1);
			if (!v.content && t3 && t2 && t1 && t3 - t2 < incr) {
				v.timestamp = Math.max((t2 - t1) / 2 + t1, t2 - incr);
			}
		}

		this.rebuildKaraokeCompletionEnds();

		this.repaintRect();
	}

	/**
	 * 绘制单行歌词。
	 * @param {GdiGraphics} gr - GDI图形对象。
	 * @param {object} lyric - 歌词对象。
	 * @param {number} line_y - 行的y坐标。
	 * @param {number} normalColor - The panel-correct "normal" (non-highlighted) lyric text colour for this render pass.
	 * @param {number} highlightColor - The pre-computed highlight blend colour for this render pass.
	 * @param {number} shadowColor - The panel-correct lyrics shadow colour for this render pass.
	 * @param {number} [revealAlpha] - The extra 0-1 opacity multiplier applied while a hidden secondary translation line is fading in/out during the sync-only reveal transition.
	 * @param {number} [maskLineY=line_y] - Actual on-screen line coordinate used only for edge fade and transparent-mask calculations when drawing to an off-screen animation layer.
	 */
	drawLyric(gr, lyric, line_y, normalColor, highlightColor, shadowColor, revealAlpha = 1, maskLineY = line_y, fontOverride = null) {
		if (revealAlpha <= 0) return;

		const isHighlighted = lyric.highlight;

		const font = fontOverride || (this.type.unsynced ? grFont.lyrics :
			isHighlighted && grSet.lyricsLargerCurrentSync ? grFont.lyricsHighlight : grFont.lyrics);

		const aboveTop = maskLineY < this.top;
		const visibleBounds = !aboveTop && maskLineY <= this.bot;

		// * Build base colour
		let color;
		let shadowAlpha = 255;
		const hasMask = grSet.lyricsTransparentMask !== 0;

		if (!visibleBounds) {
			if (!grSet.lyricsFadeScroll) return;

			const rawFade = aboveTop
				? (this.top - maskLineY) / this.lineHeight
				: (maskLineY - this.bot) / this.lineHeight;

			let fadeAlpha = 1 - Clamp(rawFade, 0, 1);

			if (hasMask) {
				const boundaryY = aboveTop ? this.top : this.bot;
				fadeAlpha *= this.calcTransparentMaskAlpha(boundaryY);
			}

			shadowAlpha = Math.round(fadeAlpha * revealAlpha * 255);
			color = RGBtoRGBA(normalColor, shadowAlpha);
		}
		else {
			color = isHighlighted ? highlightColor : normalColor;

			// * Transparent mask (visible lines)
			if (hasMask) {
				const maskFactor = this.calcTransparentMaskAlpha(maskLineY);
				if (maskFactor <= 0) return;

				const baseAlpha = (color >>> 24) & 0xFF;
				shadowAlpha = Math.round(baseAlpha * maskFactor * revealAlpha);
				color = (shadowAlpha << 24) | (color & 0x00FFFFFF);
			}
			else if (revealAlpha < 1) {
				const baseAlpha = (color >>> 24) & 0xFF;
				shadowAlpha = Math.round(baseAlpha * revealAlpha);
				color = (shadowAlpha << 24) | (color & 0x00FFFFFF);
			}
		}

		// * Shadow (visible lines only)
		if (shadowAlpha > 0) {
			this.drawLyricsShadow(gr, lyric.content, font, line_y, shadowAlpha, shadowColor);
		}

		// * Text
		if (((color >>> 24) & 0xFF) === 0) return; // Skip fully transparent draw calls
		if (this.trackThemeColorGateActive && isHighlighted) {
			gr.DrawString(lyric.content, font, color, this.x, line_y - this.lineHeight * 0.1,
				this.w + 1, this.lineHeight * 1.2, this.alignCenter);
			return;
		}

		const activeTheme = String(grSet.theme).toLowerCase();
		const customTheme = activeTheme.startsWith('custom');
		const creamThemeAccent = activeTheme === 'cream' && Number.isFinite(grCol.progressBarFill);
		const preserveRuntimeHighlight = customTheme || activeTheme === 'reborn' || activeTheme === 'black';
		const runtimeLineHighlightColor = this.getKaraokeThemeHighlightColor(activeTheme, color, color, false);
		// Stage 6G2 Fix2 R3：奶油主题遵循播放器自身配色契约，直接使用进度条填充绿色。
		// 其他固定／随机主题继续使用 R2 的 HSL 色相保护，自定义与重生保持冻结路径。
		const safeLineColor = isHighlighted && !preserveRuntimeHighlight
			? creamThemeAccent
				? runtimeLineHighlightColor
				: this.ensureKaraokeContrast(runtimeLineHighlightColor, this.applyLyricAlpha(normalColor, color), 2.6)
			: color;
		const karaokeActive = isHighlighted && this.canDrawKaraoke(lyric);
		const karaokeModeOff = grSet.lyricsKaraokeMode === 'off';

		// Karaoke Off is a strict two-colour contract: never enter Accent/contrast paths.
		if (!karaokeActive && karaokeModeOff) {
			gr.DrawString(lyric.content, font, color, this.x, line_y - this.lineHeight * 0.1,
				this.w + 1, this.lineHeight * 1.2, this.alignCenter);
			return;
		}

		if (!karaokeActive) {
			gr.DrawString(lyric.content, font, safeLineColor, this.x, line_y - this.lineHeight * 0.1, this.w + 1, this.lineHeight * 1.2, this.alignCenter);
			return;
		}

		// 先以普通颜色绘制整行，再按增强型 LRC 的片段时间从左向右叠加高亮。
		// 这样可完整保留现有的居中、字体、阴影、淡入淡出和透明遮罩行为。
		const karaokeNormalColor = this.applyLyricAlpha(normalColor, color);
		const rawKaraokeHighlightColor = this.getKaraokeThemeHighlightColor(activeTheme, highlightColor, color, true);
		// Stage 6G2 Fix2 R2：内置固定主题和随机主题仅在实际颜色对比不足时校正高亮色。
		// 颜色来自当前运行时主题，不按主题名称硬编码；自定义双色与重生动态色保持冻结路径。
		const karaokeHighlightColor = preserveRuntimeHighlight || creamThemeAccent
			? rawKaraokeHighlightColor
			: this.ensureKaraokeContrast(rawKaraokeHighlightColor, karaokeNormalColor, 2.6);
		const karaokeStyle = this.getKaraokeStyle();
		const customColorPair = customTheme &&
			(normalColor & 0x00FFFFFF) !== (grCol.lyricsHighlight & 0x00FFFFFF);
		const dynamicColorTheme = activeTheme === 'random' || activeTheme === 'reborn';
		// Stage 6J Fix1：渐变档的右端必须是未经对比校正的播放条运行时本色；
		// 旧最低对比校正仅留给纯色档。自定义双色本来就绕过校正，继续保持原路径。
		const gradientBaseHighlightColor = karaokeStyle !== 'solid' && !customColorPair
			? rawKaraokeHighlightColor
			: karaokeHighlightColor;
		// Stage 6H R4：末字完成后先短暂停留，再只向黑色轻微收束。
		// 不与常规歌词色或白色混合，确保奶油绿色、自定义双色和 Reborn 动态色保持原色相。
		const endingSettle = this.getKaraokeEndingSettle(lyric);
		const displayKaraokeHighlightColor = endingSettle > 0
			? this.mixKaraokeColor(
				gradientBaseHighlightColor,
				RGB(0, 0, 0),
				this.karaokeEndingSettleDepth * endingSettle,
				color
			)
			: gradientBaseHighlightColor;
		// Stage 8A R2 Fix3：自定义双色继续使用冻结的移动羽化路径；固定主题保留
		// “同主题浅色端 -> 精确主题本色端”。Random／Reborn 根据实际 Accent 明度
		// 选择本色所在端，但视觉方向始终锁定为左浅右深，避免漂白与方向反转。
		const gradientDepth = activeTheme === 'white' && String(grSet.seekbar).toLowerCase() === 'waveformbar'
			? 0.06 : karaokeStyle === 'duotone' ? 0.22 : 0.14;
		// Stage 8F R10：自定义主题恢复对渐变档的支持。此前只要常规色与高亮色不同就把渐变
		// 两端压成同一个颜色，导致 gradient/duotone 在自定义主题下退化为纯色填充；现在仅
		// solid 档保持纯色，其余档位以用户高亮色为右端生成同色相浅->本色渐变。
		const gradientColors = karaokeStyle === 'solid'
			? { start: displayKaraokeHighlightColor, end: displayKaraokeHighlightColor }
			: dynamicColorTheme
				? this.getKaraokeDynamicGradientColors(displayKaraokeHighlightColor, gradientDepth, color)
				: this.getKaraokeGradientColors(
					displayKaraokeHighlightColor,
					karaokeNormalColor,
					gradientDepth,
					color
				);
		const karaokeStartColor = gradientColors.start;
		const karaokeEndColor = gradientColors.end;
		const textY = line_y - this.lineHeight * 0.1;
		const textH = this.lineHeight * 1.2;

		const progress = this.getKaraokeProgress(gr, lyric, font);
		if (progress.width <= 0) {
			gr.DrawString(lyric.content, font, karaokeNormalColor, this.x, textY, this.w + 1, textH, this.alignCenter);
			return;
		}

		// Fix4：离屏位图与主歌词画布使用同一套绝对 X 坐标，避免非零 this.x
		// 布局下居中文字的卡拉 OK 高亮层与底层文字发生水平漂移。
		const bmpW = Math.max(1, Math.ceil(this.x + this.w + 2));
		const bmpH = Math.max(1, Math.ceil(textH));
		const startBmp = this.getTurntableTextBitmap(bmpW, bmpH, lyric.content, font, karaokeStartColor);

		if (!startBmp) {
			gr.DrawString(lyric.content, font, karaokeNormalColor, this.x, textY, this.w + 1, textH, this.alignCenter);
			return;
		}
		// Stage 6 Final Edge Fix1：窄幅动态前沿在浅背景／高亮色主题下会显露为
		// 快速扫过的竖线，因此正式停用。此位图现在只供已冻结的拖音 Sustain 使用。
		const edgeColor = this.mixKaraokeColor(karaokeHighlightColor, RGB(255, 255, 255), 0.28, color);
		const edgeBmp = progress.sustainActive
			? this.getTurntableTextBitmap(bmpW, bmpH, lyric.content, font, edgeColor) : null;

		// C-Ref R1：先确定真实扫亮边界，再在同一张预着色位图中生成移动羽化区。
		// 这保留 C 方案“按字号决定羽化宽度”的优点，同时避免它的半透明切片露出背景。
		const clipRight = Math.min(
			bmpW,
			Math.max(0, Math.ceil(progress.textX + progress.width))
		);
		if (clipRight <= 0) return;

		// Stage 6J Fix2：非自定义渐变先生成一张完整颜色底图，再用单一灰阶字形遮罩裁切。
		// 最终只绘制一次已着色字形，避免“浅色文字位图 + 本色文字位图”重复透明合成
		// 将绿色、蓝色、金色和浅色主题的右端压暗；变量名保留以维持冻结调用边界。
		// Stage 8F R10：自定义主题同样生成预着色渐变位图，只有 solid 档退回单色叠加路径。
	const endBmp = karaokeStyle === 'solid' ? null : this.createKaraokeGradientBitmap(
			bmpW,
			bmpH,
			lyric.content,
			font,
			karaokeStartColor,
			karaokeEndColor,
			progress,
			color,
			clipRight,
			karaokeNormalColor,
			karaokeStyle
		);

		if (customColorPair) {
			// Stage 6G1 R2：常规色与高亮色均在透明位图中使用同一套默认抗锯齿，
			// 避免主画布 ClearType 底字与透明高亮位图轮廓不一致而露出细边。
			const customNormalBmp = this.getTurntableTextBitmap(bmpW, bmpH, lyric.content, font, karaokeNormalColor);
			const customFullySwept = progress.totalWidth > 0 && progress.width >= progress.totalWidth - 0.5;
			const customClipRight = customFullySwept ? bmpW : clipRight;
			if (customNormalBmp) {
				gr.DrawImage(customNormalBmp, 0, textY, bmpW, bmpH, 0, 0, bmpW, bmpH);
			}
			else {
				gr.DrawString(lyric.content, font, karaokeNormalColor, this.x, textY, this.w + 1, textH, this.alignCenter);
			}
			// Stage 8F R10：存在渐变位图时走一次性合成的渐变路径，否则仍用已冻结的双色羽化路径。
			this.drawKaraokeOverlay(gr, startBmp, endBmp, textY, bmpH, customClipRight, progress, karaokeStyle, !endBmp);
			this.drawKaraokeShine(gr, lyric, font, textY, bmpW, bmpH, clipRight, progress, karaokeHighlightColor, color);
			this.drawKaraokeSustain(gr, edgeBmp, textY, bmpH, progress);
			return;
		}

		// Stage 6G2 Fix1：固定单色和重生动态主题改为互不重叠的左右分区绘制。
		// 未唱字只来自常规色位图，高亮色不再铺在其下方，避免半透明抗锯齿边缘透出主题色描边。
		// 所有主题的透明位图均禁用 ClearType，使高亮／未唱字形遮罩逐像素一致。
		const normalBmp = this.getTurntableTextBitmap(bmpW, bmpH, lyric.content, font, karaokeNormalColor);

		if (!normalBmp) {
			gr.DrawString(lyric.content, font, karaokeNormalColor, this.x, textY, this.w + 1, textH, this.alignCenter);
			this.drawKaraokeOverlay(gr, startBmp, endBmp, textY, bmpH, clipRight, progress, karaokeStyle, false);
			this.drawKaraokeShine(gr, lyric, font, textY, bmpW, bmpH, clipRight, progress, karaokeHighlightColor, color);
			this.drawKaraokeSustain(gr, edgeBmp, textY, bmpH, progress);
			return;
		}

		const fullySwept = progress.totalWidth > 0 && progress.width >= progress.totalWidth - 0.5;
		const highlightRight = fullySwept ? bmpW : clipRight;

		// 重生、奶油、固定与随机主题全部只在已唱区域内部合成自适应渐变；
		// 未唱常规色仍从同一个 highlightRight 开始，左右像素区间严格互斥。
		this.drawKaraokeOverlay(gr, startBmp, endBmp, textY, bmpH, highlightRight, progress, karaokeStyle, false);

		const unsungWidth = bmpW - highlightRight;
		if (unsungWidth > 0) {
			gr.DrawImage(normalBmp, highlightRight, textY, unsungWidth, bmpH, highlightRight, 0, unsungWidth, bmpH);
		}

		// Stage 8E：在已唱区域内部叠加流光。被停用的窄前沿仍不复用，拖音保持继续只覆盖可靠的最后计时片段。
		this.drawKaraokeShine(gr, lyric, font, textY, bmpW, bmpH, clipRight, progress, karaokeHighlightColor, color);
		this.drawKaraokeSustain(gr, edgeBmp, textY, bmpH, progress);
	}

	/**
	 * 检查当前歌词行是否可使用卡拉 OK 高亮渲染器。
	 * @param {object} lyric - 已格式化的歌词行。
	 * @returns {boolean} 存在可用增强时间片段且设置未关闭时返回 true。
	 */
	canDrawKaraoke(lyric) {
		return !!(
			grSet.lyricsKaraokeMode !== 'off' &&
			this.type.synced &&
			lyric &&
			Array.isArray(lyric.karaoke) &&
			lyric.karaoke.length > 0
		);
	}

	/**
	 * 将字符串拆分为用户实际看到的字符簇。
	 * 组合音标、变体选择符、Emoji 肤色修饰符及零宽连接序列均归入前一字符，
	 * 供自动换行后的卡拉 OK 时间片段按可见字符数量精确分配。
	 * @param {string} text - 需要拆分的文字。
	 * @returns {Array<string>} 可见字符簇数组。
	 */
	splitKaraokeCharacters(text) {
		if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
			return Array.from(
				new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text || ''),
				item => item.segment
			);
		}

		const characters = [];

		for (const char of Array.from(text || '')) {
			const codePoint = char.codePointAt(0);
			const combiningMark =
				codePoint >= 0x0300 && codePoint <= 0x036F ||
				codePoint >= 0x1AB0 && codePoint <= 0x1AFF ||
				codePoint >= 0x1DC0 && codePoint <= 0x1DFF ||
				codePoint >= 0x20D0 && codePoint <= 0x20FF ||
				codePoint >= 0xFE20 && codePoint <= 0xFE2F;
			const variationSelector =
				codePoint >= 0xFE00 && codePoint <= 0xFE0F ||
				codePoint >= 0xE0100 && codePoint <= 0xE01EF;
			const emojiModifier = codePoint >= 0x1F3FB && codePoint <= 0x1F3FF;
			const regionalIndicator = codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF;
			const previousRegionalIndicator = characters.length &&
				Array.from(characters[characters.length - 1]).every(previous => {
					const previousCodePoint = previous.codePointAt(0);
					return previousCodePoint >= 0x1F1E6 && previousCodePoint <= 0x1F1FF;
				});
			const joinsPrevious = combiningMark || variationSelector || emojiModifier ||
				char === '\u200D' || characters[characters.length - 1]?.endsWith('\u200D') ||
				regionalIndicator && previousRegionalIndicator && Array.from(characters[characters.length - 1]).length % 2 === 1;

			if (characters.length && joinsPrevious) {
				characters[characters.length - 1] += char;
			}
			else {
				characters.push(char);
			}
		}

		return characters;
	}

	/**
	 * 将完整歌词句的增强型 LRC 片段映射到自动换行后的单行内容。
	 * 如果一个计时片段被换行切开，则按可见字符比例拆分其时间范围。
	 * @param {string} sourceContent - 换行前的完整歌词句。
	 * @param {Array<{start:number,end:number|null,text:string}>} karaoke - 完整歌词句的计时片段。
	 * @param {string} wrappedContent - EstimateLineWrap 返回的一行显示文字。
	 * @param {number} searchStart - 本行在源文字中的搜索起点。
	 * @returns {{karaoke:Array<{start:number,end:number|null,text:string}>,nextSearchStart:number}} 映射后的片段与下一行搜索起点。
	 */
	mapKaraokeToWrappedLine(sourceContent, karaoke, wrappedContent, searchStart = 0) {
		if (!karaoke?.length || !wrappedContent) {
			return { karaoke: [], nextSearchStart: searchStart };
		}

		let lineStart = sourceContent.indexOf(wrappedContent, searchStart);
		if (lineStart < 0) {
			lineStart = sourceContent.indexOf(wrappedContent);
		}
		if (lineStart < 0) {
			return { karaoke: [], nextSearchStart: searchStart };
		}

		const lineEnd = lineStart + wrappedContent.length;
		const mapped = [];
		let sourceCursor = 0;

		for (const part of karaoke) {
			const partStart = sourceCursor;
			const partEnd = partStart + part.text.length;
			sourceCursor = partEnd;

			const overlapStart = Math.max(partStart, lineStart);
			const overlapEnd = Math.min(partEnd, lineEnd);
			if (overlapStart >= overlapEnd) continue;

			const localStart = overlapStart - partStart;
			const localEnd = overlapEnd - partStart;
			const characters = this.splitKaraokeCharacters(part.text);
			const boundaries = [0];
			for (const character of characters) {
				boundaries.push(boundaries[boundaries.length - 1] + character.length);
			}
			const startBoundary = Math.max(0, boundaries.findIndex(boundary => boundary >= localStart));
			const startCharacter = boundaries[startBoundary] === localStart
				? startBoundary
				: Math.max(0, startBoundary - 1);
			const endCharacter = Math.max(startCharacter, boundaries.findIndex(boundary => boundary >= localEnd));
			const safeLocalStart = boundaries[startCharacter] ?? localStart;
			const safeLocalEnd = boundaries[endCharacter] ?? localEnd;
			const text = part.text.slice(safeLocalStart, safeLocalEnd);
			let start = part.start;
			let end = part.end;

			if (part.end !== null && characters.length > 0 && (safeLocalStart > 0 || safeLocalEnd < part.text.length)) {
				const duration = Math.max(1, part.end - part.start);
				start = part.start + duration * startCharacter / characters.length;
				end = part.start + duration * endCharacter / characters.length;
			}

			mapped.push({ start, end, text });
		}

		return {
			karaoke: mapped,
			nextSearchStart: lineEnd
		};
	}

	/**
	 * 将现有淡入淡出/透明遮罩渲染器计算出的透明度应用到另一歌词颜色。
	 * @param {number} targetColor - 保留 RGB 通道的目标颜色。
	 * @param {number} alphaSourceColor - 携带目标透明度的现有颜色。
	 * @returns {number} 已应用渲染透明度的目标颜色。
	 */
	applyLyricAlpha(targetColor, alphaSourceColor) {
		const alpha = (alphaSourceColor >>> 24) & 0xFF;
		return (alpha << 24) | (targetColor & 0x00FFFFFF);
	}

	/**
	 * Returns the runtime highlight source required by the active theme.
	 * Custom themes retain the user's explicit lyric highlight. Karaoke rendering in every other
	 * theme uses the selected theme/seekbar accent; ordinary non-karaoke line rendering
	 * keeps its established colour path.
	 * @param {string} activeTheme - Normalized grSet.theme value.
	 * @param {number} lyricHighlightColor - Current lyric highlight colour.
	 * @param {number} alphaSourceColor - Colour carrying the current fade/mask alpha.
	 * @param {boolean} preferProgressAccent - True only for the timed Karaoke highlight layer.
	 * @returns {number} Theme-correct ARGB highlight colour.
	 */
	getKaraokeThemeHighlightColor(activeTheme, lyricHighlightColor, alphaSourceColor, preferProgressAccent = false) {
		const customTheme = activeTheme.startsWith('custom');
		const playbackAccent = this.getKaraokePlaybackAccentColor(activeTheme);
		const useProgressAccent = !customTheme && (preferProgressAccent || activeTheme === 'cream') &&
			Number.isFinite(playbackAccent);
		const themeColor = useProgressAccent
			? (this.stableLyricsHighlightColor ?? playbackAccent)
			: lyricHighlightColor;
		return this.applyLyricAlpha(themeColor, alphaSourceColor);
	}

	/** Restore explicit custom lyric roles after album/playlist palette adjustments. */
	syncCustomLyricsColors(panel = 'main') {
		const match = /^custom(0[1-9]|10)$/.exec(String(grSet.theme).toLowerCase());
		if (!match || typeof grCfg === 'undefined') return;
		const config = grCfg[`customTheme${match[1]}`] || grCfg.cTheme;
		if (!config) return;
		const prefix = panel === 'biography' ? 'bio_ui_col_' : 'grCol_';
		const target = panel === 'biography' ? bio.ui.col : grCol;
		const roles = ['lyricsNormal', 'lyricsHighlight', 'lyricsShadow'];
		const values = roles.map(role => config[prefix + role]);
		const key = `${match[1]}|${values.join('|')}`;
		const cache = this.customLyricsRoleCache || (this.customLyricsRoleCache = {});
		let entry = cache[panel];
		if (!entry || entry.key !== key) {
			const colors = values.map(value => {
				if (Number.isFinite(value)) return value;
				const hex = typeof value === 'string' ? value.trim().replace(/^#/, '') : '';
				return /^[0-9a-f]{6}$/i.test(hex) ? (0xFF000000 | parseInt(hex, 16)) : null;
			});
			entry = cache[panel] = { key, colors };
		}
		roles.forEach((role, i) => { if (entry.colors[i] !== null) target[role] = entry.colors[i]; });
	}

	/** Returns the sole runtime source from which the visible highlight snapshot is admitted. */
	getLyricsHighlightRuntimeColor(activeTheme = String(grSet.theme).toLowerCase()) {
		this.syncCustomLyricsColors();
		if (activeTheme.startsWith('custom') || grSet.lyricsKaraokeMode === 'off') {
			return grCol.lyricsHighlight;
		}
		const playbackAccent = this.getKaraokePlaybackAccentColor(activeTheme);
		return Number.isFinite(playbackAccent) ? playbackAccent : grCol.lyricsHighlight;
	}

	/** Theme, Karaoke mode and visible seekbar jointly own one immutable colour snapshot. */
	getLyricsHighlightSnapshotContextKey() {
		return [
			String(grSet.theme).toLowerCase(),
			String(grSet.lyricsKaraokeMode || 'auto').toLowerCase(),
			String(grSet.seekbar || 'progressbar').toLowerCase()
		].join('|');
	}

	/**
	 * Reborn lyrics follow the progress-bar accent even when another seekbar is selected.
	 * White uses its visible waveform fill when waveformbar is selected: its progress-bar
	 * fill is much lighter and makes the lyric highlight fade into the white panel.
	 * Black lifts its lyric accent slightly; Random keeps its seekbar-specific colour.
	 * Other combinations use progressBarFill.
	 * @param {string} activeTheme - Normalized grSet.theme value.
	 * @returns {number|undefined} Runtime colour of the visible seekbar's primary progress layer.
	 */
	getKaraokePlaybackAccentColor(activeTheme) {
		const seekbar = String(grSet.seekbar || 'progressbar').toLowerCase();
		if (activeTheme === 'white' && seekbar === 'waveformbar' &&
			Number.isFinite(grCol.waveformBarFillFront)) {
			return this.getReadableLightThemeAccent(grCol.waveformBarFillFront);
		}
		if (activeTheme === 'black') return this.getReadableDarkThemeAccent(grCol.progressBarFill);
		const dynamicTheme = activeTheme === 'random';
		if (!dynamicTheme) return grCol.progressBarFill;

		if (seekbar === 'waveformbar' && Number.isFinite(grCol.waveformBarFillFront)) {
			return grCol.waveformBarFillFront;
		}
		if (seekbar === 'peakmeterbar' && Number.isFinite(grCol.peakmeterBarProgFill)) {
			return grCol.peakmeterBarProgFill;
		}
		return grCol.progressBarFill;
	}

	/** Keeps a dark preset's hue while lifting a coloured lyric accent slightly. */
	getReadableDarkThemeAccent(color) {
		if (!Number.isFinite(color)) return color;
		const red = (color >>> 16) & 255;
		const green = (color >>> 8) & 255;
		const blue = color & 255;
		const max = Math.max(red, green, blue);
		const min = Math.min(red, green, blue);
		// Neutral text and accents already light enough retain the exact runtime colour.
		if (max - min < 18 || (max + min) / 510 >= 0.55) return color;
		return this.getKaraokeGradientColors(color, color, 0.07, color, 0.55).start;
	}

	/** Raises near-black coloured accents to a readable shade on the white theme. */
	getReadableLightThemeAccent(color) {
		const rgb = [((color >>> 16) & 255) / 255, ((color >>> 8) & 255) / 255, (color & 255) / 255];
		const max = Math.max(...rgb);
		const min = Math.min(...rgb);
		const delta = max - min;
		const lightness = (max + min) / 2;
		const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
		// Neutral near-black has no reliable hue; do not invent a theme colour.
		if (lightness >= 0.23 || saturation < 0.28) return color;
		let hue;
		if (max === rgb[0]) hue = ((rgb[1] - rgb[2]) / delta) % 6;
		else if (max === rgb[1]) hue = (rgb[2] - rgb[0]) / delta + 2;
		else hue = (rgb[0] - rgb[1]) / delta + 4;
		hue = (hue + 6) % 6;
		const chroma = 0.6 * Math.min(saturation, 0.75);
		const secondary = chroma * (1 - Math.abs(hue % 2 - 1));
		const channels = [
			[chroma, secondary, 0], [secondary, chroma, 0], [0, chroma, secondary],
			[0, secondary, chroma], [secondary, 0, chroma], [chroma, 0, secondary]
		][Math.floor(hue)];
		const offset = 0.30 - chroma / 2;
		return (color & 0xff000000) |
			(Math.round((channels[0] + offset) * 255) << 16) |
			(Math.round((channels[1] + offset) * 255) << 8) |
			Math.round((channels[2] + offset) * 255);
	}

	/**
	 * Ensures that a fixed or random theme highlight remains distinguishable from the normal lyric colour.
	 * Colours that already meet the threshold are returned byte-for-byte unchanged. Low-contrast colours
	 * are moved by the smallest required HSL lightness change toward the higher-contrast side. Hue and
	 * saturation stay fixed so pale blue, random pastel and cream colours become deeper theme colours
	 * instead of grey-white text. Runtime alpha is preserved.
	 * @param {number} highlightColor - Actual runtime karaoke highlight colour.
	 * @param {number} normalColor - Actual runtime normal lyric colour.
	 * @param {number} minimumRatio - Required WCAG-style luminance contrast ratio.
	 * @returns {number} Original or minimally corrected ARGB highlight colour.
	 */
	ensureKaraokeContrast(highlightColor, normalColor, minimumRatio = 2.6) {
		const channel = (color, shift) => (color >>> shift) & 0xFF;
		const luminance = color => {
			const linear = value => {
				const normalized = value / 255;
				return normalized <= 0.04045
					? normalized / 12.92
					: Math.pow((normalized + 0.055) / 1.055, 2.4);
			};
			return linear(channel(color, 16)) * 0.2126 +
				linear(channel(color, 8)) * 0.7152 +
				linear(channel(color, 0)) * 0.0722;
		};
		const contrast = (first, second) => {
			const firstLum = luminance(first);
			const secondLum = luminance(second);
			return (Math.max(firstLum, secondLum) + 0.05) / (Math.min(firstLum, secondLum) + 0.05);
		};

		if (contrast(highlightColor, normalColor) >= minimumRatio) return highlightColor;

		const alpha = (highlightColor >>> 24) & 0xFF;
		const red = channel(highlightColor, 16) / 255;
		const green = channel(highlightColor, 8) / 255;
		const blue = channel(highlightColor, 0) / 255;
		const max = Math.max(red, green, blue);
		const min = Math.min(red, green, blue);
		const delta = max - min;
		let hue = 0;
		const lightness = (max + min) * 0.5;
		const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

		if (delta !== 0) {
			if (max === red) hue = ((green - blue) / delta) % 6;
			else if (max === green) hue = (blue - red) / delta + 2;
			else hue = (red - green) / delta + 4;
			hue = ((hue * 60) + 360) % 360;
		}

		const fromHsl = value => {
			const chroma = (1 - Math.abs(2 * value - 1)) * saturation;
			const segment = hue / 60;
			const secondary = chroma * (1 - Math.abs(segment % 2 - 1));
			let rgb = [0, 0, 0];
			if (segment < 1) rgb = [chroma, secondary, 0];
			else if (segment < 2) rgb = [secondary, chroma, 0];
			else if (segment < 3) rgb = [0, chroma, secondary];
			else if (segment < 4) rgb = [0, secondary, chroma];
			else if (segment < 5) rgb = [secondary, 0, chroma];
			else rgb = [chroma, 0, secondary];
			const match = value - chroma * 0.5;
			return (alpha << 24) |
				(Math.round((rgb[0] + match) * 255) << 16) |
				(Math.round((rgb[1] + match) * 255) << 8) |
				Math.round((rgb[2] + match) * 255);
		};

		const black = RGB(0, 0, 0);
		const white = RGB(255, 255, 255);
		const targetLightness = contrast(black, normalColor) >= contrast(white, normalColor) ? 0 : 1;
		let insufficient = lightness;
		let sufficient = targetLightness;

		for (let i = 0; i < 14; i++) {
			const candidateLightness = (insufficient + sufficient) * 0.5;
			const candidate = fromHsl(candidateLightness);
			if (contrast(candidate, normalColor) >= minimumRatio) sufficient = candidateLightness;
			else insufficient = candidateLightness;
		}

		return fromHsl(sufficient);
	}

	/**
	 * Mixes two RGB colours while preserving the lyric renderer's current alpha.
	 * This local helper avoids theme-dependent pre-blending and keeps the gradient
	 * endpoints in the same hue family as the active lyrics highlight colour.
	 * @param {number} baseColor - Active theme highlight colour.
	 * @param {number} targetColor - White used to create the lighter line-start colour.
	 * @param {number} ratio - Target colour contribution in the 0-1 range.
	 * @param {number} alphaSourceColor - Colour carrying the current mask/fade alpha.
	 * @param {number} lightnessCeiling - Maximum HSL lightness allowed for the left endpoint.
	 * @returns {number} Mixed ARGB colour.
	 */
	mixKaraokeColor(baseColor, targetColor, ratio, alphaSourceColor) {
		const amount = Clamp(ratio, 0, 1);
		const inverse = 1 - amount;
		const red = Math.round(((baseColor >>> 16) & 0xFF) * inverse + ((targetColor >>> 16) & 0xFF) * amount);
		const green = Math.round(((baseColor >>> 8) & 0xFF) * inverse + ((targetColor >>> 8) & 0xFF) * amount);
		const blue = Math.round((baseColor & 0xFF) * inverse + (targetColor & 0xFF) * amount);
		const alpha = (alphaSourceColor >>> 24) & 0xFF;
		return (alpha << 24) | (red << 16) | (green << 8) | blue;
	}

	/**
	 * Builds a light-to-base gradient from the exact runtime theme accent.
	 * The right endpoint always remains the unmodified accent. The left endpoint only raises HSL
	 * lightness while retaining the runtime hue and saturation, so no independent colour is invented
	 * and the gradient can never fall below the theme base towards black.
	 * @param {number} baseColor - Exact runtime progress-bar/lyrics accent colour.
	 * @param {number} normalColor - Current unsung lyric colour (kept for call compatibility).
	 * @param {number} lightnessDepth - Maximum HSL lightness separation.
	 * @param {number} alphaSourceColor - Colour carrying the current mask/fade alpha.
	 * @returns {{start:number,end:number}} Lighter left endpoint and exact theme-base right endpoint.
	 */
	getKaraokeGradientColors(baseColor, normalColor, lightnessDepth, alphaSourceColor, lightnessCeiling = 0.86) {
		const channel = (color, shift) => (color >>> shift) & 0xFF;
		const red = channel(baseColor, 16) / 255;
		const green = channel(baseColor, 8) / 255;
		const blue = channel(baseColor, 0) / 255;
		const max = Math.max(red, green, blue);
		const min = Math.min(red, green, blue);
		const delta = max - min;
		const lightness = (max + min) * 0.5;
		const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
		let hue = 0;

		if (delta !== 0) {
			if (max === red) hue = ((green - blue) / delta) % 6;
			else if (max === green) hue = (blue - red) / delta + 2;
			else hue = (red - green) / delta + 4;
			hue = ((hue * 60) + 360) % 360;
		}

		const alpha = (alphaSourceColor >>> 24) & 0xFF;
		const fromHsl = value => {
			const clampedLightness = Clamp(value, 0, 1);
			const chroma = (1 - Math.abs(2 * clampedLightness - 1)) * saturation;
			const segment = hue / 60;
			const secondary = chroma * (1 - Math.abs(segment % 2 - 1));
			let rgb = [0, 0, 0];
			if (segment < 1) rgb = [chroma, secondary, 0];
			else if (segment < 2) rgb = [secondary, chroma, 0];
			else if (segment < 3) rgb = [0, chroma, secondary];
			else if (segment < 4) rgb = [0, secondary, chroma];
			else if (segment < 5) rgb = [secondary, 0, chroma];
			else rgb = [chroma, 0, secondary];
			const match = clampedLightness - chroma * 0.5;
			return (alpha << 24) |
				(Math.round((rgb[0] + match) * 255) << 16) |
				(Math.round((rgb[1] + match) * 255) << 8) |
				Math.round((rgb[2] + match) * 255);
		};

		const exactBase = this.applyLyricAlpha(baseColor, alphaSourceColor);
		const depth = Clamp(lightnessDepth, 0, 0.24);
		// 若主题本色已经高于当前上限则退化为本色：不继续漂白，也绝不反向压暗。
		const ceiling = Clamp(lightnessCeiling, lightness, 0.86);
		const lighterLightness = Math.max(lightness, Math.min(ceiling, lightness + depth));
		return { start: fromHsl(lighterLightness), end: exactBase };
	}

	/**
	 * Stage 8A R2 Fix3：为 Random／Reborn 构造方向固定、不漂白且差值稳定的动态渐变。
	 * 视觉方向始终为左浅右深：浅色 Accent 直接作为左端，并生成同色较深右端；
	 * 中暗 Accent 则生成同色较亮左端，并将 Accent 作为右端。当前可见播放条本色
	 * 因此始终精确保留在其中一端；白色／灰色只生成中性灰阶差值，不创造主题色。
	 * @param {number} baseColor - 当前可见播放条的精确运行时 Accent。
	 * @param {number} lightnessDepth - 期望的 HSL 明度差。
	 * @param {number} alphaSourceColor - 携带当前淡入淡出透明度的颜色。
	 * @returns {{start:number,end:number}} 固定左浅右深方向，并包含精确播放条色的两端。
	 */
	getKaraokeDynamicGradientColors(baseColor, lightnessDepth, alphaSourceColor) {
		const channel = (color, shift) => (color >>> shift) & 0xFF;
		const red = channel(baseColor, 16) / 255;
		const green = channel(baseColor, 8) / 255;
		const blue = channel(baseColor, 0) / 255;
		const max = Math.max(red, green, blue);
		const min = Math.min(red, green, blue);
		const delta = max - min;
		const lightness = (max + min) * 0.5;
		const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
		let hue = 0;

		if (delta !== 0) {
			if (max === red) hue = ((green - blue) / delta) % 6;
			else if (max === green) hue = (blue - red) / delta + 2;
			else hue = (red - green) / delta + 4;
			hue = ((hue * 60) + 360) % 360;
		}

		const alpha = (alphaSourceColor >>> 24) & 0xFF;
		const fromHsl = value => {
			const clampedLightness = Clamp(value, 0, 1);
			const chroma = (1 - Math.abs(2 * clampedLightness - 1)) * saturation;
			const segment = hue / 60;
			const secondary = chroma * (1 - Math.abs(segment % 2 - 1));
			let rgb = [0, 0, 0];
			if (segment < 1) rgb = [chroma, secondary, 0];
			else if (segment < 2) rgb = [secondary, chroma, 0];
			else if (segment < 3) rgb = [0, chroma, secondary];
			else if (segment < 4) rgb = [0, secondary, chroma];
			else if (segment < 5) rgb = [secondary, 0, chroma];
			else rgb = [chroma, 0, secondary];
			const match = clampedLightness - chroma * 0.5;
			return (alpha << 24) |
				(Math.round((rgb[0] + match) * 255) << 16) |
				(Math.round((rgb[1] + match) * 255) << 8) |
				Math.round((rgb[2] + match) * 255);
		};

		const exactBase = this.applyLyricAlpha(baseColor, alphaSourceColor);
		const depth = Clamp(lightnessDepth, 0.14, 0.22);
		// 播放条没有“渐变方向”，只有一个运行时本色。高明度 Accent 若继续向上推会漂白，
		// 因此保留本色为左端、向下生成右端；中暗 Accent 则保留原左浅右本色结构。
		// 两条路径都保持色相、饱和度与左浅右深的统一阅读方向。
		if (lightness >= 0.58) {
			return { start: exactBase, end: fromHsl(Math.max(0.28, lightness - depth)) };
		}

		return { start: fromHsl(Math.min(0.78, lightness + depth)), end: exactBase };
	}

	/**
	 * Creates one pre-coloured light-to-base bitmap and applies the lyric glyphs as a single mask.
	 * Unlike cross-fading two transparent text bitmaps, every visible glyph pixel is composited only
	 * once, so the exact theme-base endpoint cannot be darkened by repeated alpha multiplication.
	 * @param {number} bitmapWidth - Absolute off-screen bitmap width.
	 * @param {number} bitmapHeight - Off-screen bitmap height.
	 * @param {string} text - Lyric text.
	 * @param {GdiFont} font - Lyric font.
	 * @param {number} startColor - Theme-derived lighter left colour.
	 * @param {number} endColor - Exact runtime progress-bar colour.
	 * @param {{textX:number,totalWidth:number}} progress - Measured lyric geometry.
	 * @param {number} alphaSourceColor - Colour carrying the current fade/mask alpha.
	 * @param {number|null} clipRight - Current absolute sweep edge used by the optional C-style feather.
	 * @param {number|null} normalColor - Current unsung lyric colour; the feather's exact destination.
	 * @param {'gradient'|'duotone'} style - Active non-solid sweep style.
	 * @returns {?GdiBitmap} Single masked gradient bitmap.
	 */
	createKaraokeGradientBitmap(bitmapWidth, bitmapHeight, text, font, startColor, endColor, progress,
		alphaSourceColor, clipRight = null, normalColor = null, style = 'gradient') {
		const gradientLeft = Math.max(0, progress.textX);
		const gradientWidth = Math.max(1, progress.totalWidth);
		const gradient = this.renderTurntableSurface(bitmapWidth, bitmapHeight,
			`gradient|${text}|${font.Name}|${font.Size}|${font.Style}|${this.x}|${this.w}`, g => {
			g.FillGradRect(
				gradientLeft,
				0,
				gradientWidth,
				bitmapHeight,
				0,
				this.applyLyricAlpha(startColor, alphaSourceColor),
				this.applyLyricAlpha(endColor, alphaSourceColor),
				1
			);

			// C-Ref R1：在同一颜色底图内，以 smoothstep 真颜色插值生成移动扫亮羽化。
			// 只做若干纯色矩形填充，不创建 14/20 张文字位图；随后仍只应用一次字形遮罩。
			const fullySwept = progress.totalWidth > 0 && progress.width >= progress.totalWidth - 0.5;
			if (!fullySwept && progress.width > 0.5 && Number.isFinite(clipRight) && Number.isFinite(normalColor)) {
				const textRight = gradientLeft + gradientWidth;
				const sweepRight = Clamp(clipRight, gradientLeft, textRight);
				// Edge Fix：羽化带收窄到只覆盖前沿几个像素，且向常规白的混合上限 85%，
				// 保证已唱字形始终保留高亮色底色，不再出现整字泛白如同底层白字露出。
				const featherWidth = Math.max(8, Math.round(this.lineHeight * (style === 'duotone' ? 0.32 : 0.22)));
				const featherStart = Math.max(gradientLeft, sweepRight - featherWidth);
				const featherSpan = sweepRight - featherStart;

				if (featherSpan > 0) {
					const baseRatio = Clamp((featherStart - gradientLeft) / gradientWidth, 0, 1);
					const featherBaseColor = this.mixKaraokeColor(startColor, endColor, baseRatio, alphaSourceColor);
					const sliceCount = style === 'duotone' ? 20 : 14;
					let previousRight = Math.floor(featherStart);

					for (let i = 0; i < sliceCount; i++) {
						const right = Math.min(sweepRight, Math.round(featherStart + featherSpan * (i + 1) / sliceCount));
						if (right <= previousRight) continue;
						const t = (i + 0.5) / sliceCount;
						const smooth = t * t * (3 - 2 * t) * 0.85;
						const sliceColor = this.mixKaraokeColor(featherBaseColor, normalColor, smooth, alphaSourceColor);
						g.FillSolidRect(previousRight, 0, right - previousRight, bitmapHeight, sliceColor);
						previousRight = right;
					}
				}
			}
		});
		if (!gradient) return null;

		// ApplyMask uses white as hidden and black as visible. Drawing the glyphs once in black on
		// a white field preserves the same grayscale antialiasing while avoiding ClearType fringes.
		const mask = this.getTurntableTextBitmap(bitmapWidth, bitmapHeight, text, font, RGB(0, 0, 0), true);
		if (!mask) return null;

		gradient.ApplyMask(mask);
		return gradient;
	}

	/**
	 * Returns the configured Stage 6F karaoke sweep style with a safe fallback.
	 * @returns {'solid'|'gradient'|'duotone'} Normalized sweep style.
	 */
	getKaraokeStyle() {
		return ['solid', 'gradient', 'duotone'].includes(grSet.lyricsKaraokeStyle)
			? grSet.lyricsKaraokeStyle
			: 'duotone';
	}

	/**
	 * Draws the timed karaoke bitmap using one of two controlled gradient paths:
	 * built-in themes receive one pre-masked same-hue gradient, while custom themes with distinct normal
	 * and highlight colours receive a feathered boundary using exactly those two user colours.
	 * @param {GdiGraphics} gr - Destination graphics object.
	 * @param {GdiBitmap} startBitmap - Highlight or visibly lightened same-hue bitmap.
	 * @param {?GdiBitmap} endBitmap - Single pre-masked light-to-base bitmap for non-custom themes.
	 * @param {number} textY - Destination Y coordinate.
	 * @param {number} bitmapHeight - Bitmap height.
	 * @param {number} clipRight - Absolute right edge of the current sweep.
	 * @param {{width:number,totalWidth:number,textX:number}} progress - Karaoke sweep geometry.
	 * @param {'solid'|'gradient'|'duotone'} style - Normalized sweep style.
	 * @param {boolean} runtimeColorPair - Whether to use a runtime normal/highlight pair directly (custom or Reborn).
	 */
	drawKaraokeOverlay(gr, startBitmap, endBitmap, textY, bitmapHeight, clipRight, progress, style, runtimeColorPair) {
		if (style === 'solid') {
			gr.DrawImage(startBitmap, 0, textY, clipRight, bitmapHeight, 0, 0, clipRight, bitmapHeight);
			return;
		}

		if (runtimeColorPair) {
			const fullySwept = progress.totalWidth > 0 && progress.width >= progress.totalWidth - 0.5;
			if (fullySwept) {
				gr.DrawImage(startBitmap, 0, textY, clipRight, bitmapHeight, 0, 0, clipRight, bitmapHeight);
				return;
			}

			// Edge Fix：与 createKaraokeGradientBitmap 一致——羽化带收窄，且高亮层最低保留
			// 约 15% 不透明度，避免前沿附近的已唱字几乎全透明而露出底层白色常规文字。
			const featherWidth = Math.max(8, Math.round(this.lineHeight * (style === 'duotone' ? 0.32 : 0.22)));
			const featherStart = Math.min(clipRight, Math.max(progress.textX, clipRight - featherWidth));
			const solidRight = Math.max(0, Math.floor(featherStart));
			if (solidRight > 0) {
				gr.DrawImage(startBitmap, 0, textY, solidRight, bitmapHeight, 0, 0, solidRight, bitmapHeight);
			}

			const featherSpan = clipRight - featherStart;
			const sliceCount = style === 'duotone' ? 20 : 14;
			let previousRight = Math.max(0, Math.floor(featherStart));
			for (let i = 0; i < sliceCount; i++) {
				const right = Math.min(clipRight, Math.round(featherStart + featherSpan * (i + 1) / sliceCount));
				if (right <= previousRight) continue;
				const t = (i + 0.5) / sliceCount;
				const smooth = t * t * (3 - 2 * t) * 0.85;
				const alpha = Math.max(1, Math.round(255 * (1 - smooth)));
				const width = right - previousRight;
				gr.DrawImage(startBitmap, previousRight, textY, width, bitmapHeight, previousRight, 0, width, bitmapHeight, 0, alpha);
				previousRight = right;
			}
			return;
		}

		if (!endBitmap) {
			gr.DrawImage(startBitmap, 0, textY, clipRight, bitmapHeight, 0, 0, clipRight, bitmapHeight);
			return;
		}

		// Stage 6J Fix2：颜色和字形已在同一位图中一次合成；这里只做已唱区域裁剪，
		// 不再叠加第二张半透明文字位图，因此右端保持播放条本色的实际显示亮度。
		gr.DrawImage(endBitmap, 0, textY, clipRight, bitmapHeight, 0, 0, clipRight, bitmapHeight);
	}

	/**
	 * 在当前逐字扫亮位置绘制克制的主题色柔和前沿。
	 * 前沿宽度限制为 2–5 像素，并使用单峰透明度衰减；句首、句尾完成态及无逐字进度时不绘制。
	 * @param {GdiGraphics} gr - Destination graphics object.
	 * @param {?GdiBitmap} edgeBitmap - 使用运行时主题高亮色生成的微亮歌词位图。
	 * @param {number} textY - Destination Y coordinate.
	 * @param {number} bitmapHeight - Bitmap height.
	 * @param {{width:number,totalWidth:number,textX:number}} progress - Karaoke sweep geometry.
	 */
	drawKaraokeHighlightEdge(gr, edgeBitmap, textY, bitmapHeight, progress) {
		if (!edgeBitmap || !progress || progress.totalWidth <= 0 || progress.width <= 0.5 ||
			progress.width >= progress.totalWidth - 0.5) {
			return;
		}

		const edgeWidth = Clamp(Math.round(this.lineHeight * 0.08), 2, 5);
		const edgeCenter = progress.textX + progress.width;
		const textRight = progress.textX + progress.totalWidth;
		const edgeLeft = Math.max(0, Math.floor(Math.max(progress.textX, edgeCenter - edgeWidth * 0.5)));
		const edgeRight = Math.max(edgeLeft, Math.ceil(Math.min(textRight, edgeCenter + edgeWidth * 0.5)));
		const radius = Math.max(1, edgeWidth * 0.5);

		for (let x = edgeLeft; x < edgeRight; x++) {
			const distance = Clamp(Math.abs(x + 0.5 - edgeCenter) / radius, 0, 1);
			const strength = Math.pow(1 - distance, 1.5);
			const alpha = Math.round(150 * strength);
			if (alpha < 8) continue;

			gr.DrawImage(edgeBitmap, x, textY, 1, bitmapHeight, x, 0, 1, bitmapHeight, 0, alpha);
		}
	}

	/**
	 * Draws one restrained theme-derived hold envelope over the explicitly timed final
	 * word/character while its reserved sustain window is active. A short fade-in and fade-out
	 * surround a stable plateau so the hold remains readable without pulsing, moving or scaling glyphs.
	 * @param {GdiGraphics} gr - Destination graphics object.
	 * @param {?GdiBitmap} edgeBitmap - Theme-derived light bitmap shared with Highlight Edge.
	 * @param {number} textY - Destination Y coordinate.
	 * @param {number} bitmapHeight - Bitmap height.
	 * @param {{sustainActive?:boolean,sustainProgress?:number,sustainLeft?:number,sustainWidth?:number}} progress - Karaoke geometry.
	 */
	drawKaraokeSustain(gr, edgeBitmap, textY, bitmapHeight, progress) {
		if (!edgeBitmap || !progress?.sustainActive || progress.sustainWidth <= 0) return;

		const sustainProgress = Clamp(progress.sustainProgress, 0, 1);
		const fadeProgress = sustainProgress < 0.2 ? sustainProgress / 0.2 :
			sustainProgress > 0.8 ? (1 - sustainProgress) / 0.2 : 1;
		const envelope = fadeProgress * fadeProgress * (3 - 2 * fadeProgress);
		const alpha = Math.round(118 * envelope);
		if (alpha < 8) return;

		const left = Math.max(0, Math.floor(progress.sustainLeft));
		const right = Math.max(left, Math.ceil(progress.sustainLeft + progress.sustainWidth));
		const width = right - left;
		if (width <= 0) return;

		gr.DrawImage(edgeBitmap, left, textY, width, bitmapHeight, left, 0, width, bitmapHeight, 0, alpha);
	}

	// #region KARAOKE SCROLL EFFECTS (Stage 8E)
	/**
	 * Stage 8E：规范化卡拉 OK 视觉特效档位。
	 * 只接受 off／auto／strong，其余值一律回落到 auto，避免旧配置或手工改值进入未知绘制路径。
	 * @param {*} value - 当前 grSet 中的档位值。
	 * @returns {'off'|'auto'|'strong'} 已校验的档位。
	 */
	getKaraokeFxMode(value) {
		return ['off', 'auto', 'strong'].includes(value) ? value : 'auto';
	}

	/**
	 * Stage 8E：把当前行的逐字时间轴展开为可见字符单元，并给出每个字符的水平区间。
	 * 时间只在非空白字符之间均分，与纵排 getVerticalKaraokeProgress 的语义保持一致；
	 * 水平区间沿用 Fix5 的整行前缀测宽比例 widthScale，避免英文尾部空格宽度丢失导致锚点漂移。
	 * 结果按行内容、字体引用与布局宽度做单条缓存，同一个字在整句期间只测量一次。
	 * @param {GdiGraphics} gr - GDI 图形对象。
	 * @param {object} lyric - 已格式化的歌词行。
	 * @param {GdiFont} font - 当前歌词行使用的字体。
	 * @returns {object} 逐字几何与时间数据。
	 */
	getKaraokeGlyphTimeline(gr, lyric, font) {
		const turntable = grm.details.isTurntableActive();
		const cache = turntable && (this.turntableGlyphTimelines || (this.turntableGlyphTimelines = new Map()));
		const cached = turntable ? cache.get(lyric) : this.karaokeGlyphCache;
		if (cached &&
			cached.content === lyric.content &&
			cached.font === font &&
			cached.karaoke === lyric.karaoke &&
			cached.x === this.x &&
			cached.w === this.w && cached.circularArcLeftAlign === !!this.circularArcLeftAlign) {
			if (turntable) { cache.delete(lyric); cache.set(lyric, cached); }
			return cached;
		}

		const entry = this.buildKaraokeGlyphTimeline(gr, lyric, font);
		this.karaokeGlyphCache = entry;
		if (turntable) {
			cache.delete(lyric); cache.set(lyric, entry);
			if (cache.size > 16) cache.delete(cache.keys().next().value);
		}
		return entry;
	}

	/**
	 * Stage 8E：构建逐字时间轴（不读取缓存）。
	 * 前缀宽度只测量一次且逐个累加，因此整句的测量次数等于可见字符数，而不是两倍。
	 * @param {GdiGraphics} gr - GDI 图形对象。
	 * @param {object} lyric - 已格式化的歌词行。
	 * @param {GdiFont} font - 当前歌词行使用的字体。
	 * @returns {object} 逐字几何与时间数据。
	 */
	buildKaraokeGlyphTimeline(gr, lyric, font) {
		const parts = (Array.isArray(lyric.karaoke) ? lyric.karaoke : []).filter(part =>
			part &&
			Number.isFinite(part.start) &&
			typeof part.text === 'string' &&
			part.text.length > 0
		);
		const totalWidth = Math.ceil(gr.MeasureString(lyric.content, font, 0, 0, 0, 0).Width);
		const textX = this.x + (this.circularArcLeftAlign ? 0 : Math.max(0, (this.w - totalWidth) * 0.5));
		const entry = {
			units: [],
			hops: [],
			totalWidth,
			textX,
			circularArcLeftAlign: !!this.circularArcLeftAlign,
			content: lyric.content,
			font,
			karaoke: lyric.karaoke,
			x: this.x,
			w: this.w
		};
		if (!parts.length) return entry;

		const measureText = text => {
			if (!text) return 0;
			return typeof gr.CalcTextWidth === 'function'
				? gr.CalcTextWidth(text, font)
				: gr.MeasureString(text, font, 0, 0, 0, 0).Width;
		};
		const karaokeTextWidth = measureText(parts.map(part => part.text).join(''));
		const widthScale = karaokeTextWidth > 0 ? totalWidth / karaokeTextWidth : 1;
		let prefixText = '';
		let prefixWidth = 0;

		for (const part of parts) {
			const characters = this.splitKaraokeCharacters(part.text);
			const visible = [];
			for (let i = 0; i < characters.length; i++) {
				if (!/^\s+$/.test(characters[i])) visible.push(i);
			}

			const starts = new Array(characters.length);
			const ends = new Array(characters.length);
			if (visible.length) {
				const end = Number.isFinite(part.end) ? part.end : this.getKaraokeFallbackEnd(lyric, part.start);
				const duration = Math.max(1, end - part.start);
				for (let k = 0; k < visible.length; k++) {
					const index = visible[k];
					starts[index] = part.start + duration * k / visible.length;
					ends[index] = part.start + duration * (k + 1) / visible.length;
				}
			}

			for (let i = 0; i < characters.length; i++) {
				const left = prefixWidth;
				prefixText += characters[i];
				prefixWidth = measureText(prefixText) * widthScale;
				if (starts[i] === undefined) continue;
				entry.units.push({
					char: characters[i],
					start: starts[i],
					end: ends[i],
					left,
					right: prefixWidth,
					center: (left + prefixWidth) * 0.5
				});
			}
		}

		// Stage 8E-R2：抛跳链行程表。第 k 跳从字符 k 弹向字符 k+1：
		// 起跳时刻严格等于字符 k 唱完的时刻，落地时刻严格等于字符 k+1 唱完的时刻，
		// 于是星星正好在下一个字被唱响的整个过程中飞行，并在该字唱完的瞬间落在它上面。
		//
		// 这里刻意不设最小时长下限。若为了“看起来不过快”而给每一跳加下限，快句下每跳都会超出
		// 自己的字符间隔并逐字累积滞后，几十个字之后星星就会明显落后于演唱进度。
		// 只设最大时长上限：遇长音时星星提前落地并停在字上静置，等待下一次起跳，
		// 因此行程表恒满足 launch(k) === units[k].end 且 land(k) <= units[k+1].end，永不滞后。
		for (let k = 0; k + 1 < entry.units.length; k++) {
			const launch = entry.units[k].end;
			const flight = Math.min(
				Math.max(1, entry.units[k + 1].end - launch),
				this.karaokeHopMaximumDuration
			);
			entry.hops.push({ from: k, to: k + 1, launch, land: launch + flight });
		}

		return entry;
	}

	/**
	 * Stage 8F-R2：计算流光光带沿扫亮轴的几何区间 —— 单束。
	 * 此前是“宽柔光 + 窄亮芯”两条各自成钟形的带，峰值分别落在前沿后方
	 * 0.675×行高 与 0.13×行高 处，相距约 0.55×行高，肉眼会读成两束分开的白光，
	 * 在“双自定义色 + 已唱区为纯色”的主题上尤其刺眼。这里改为单带单峰，全场只有一束。
	 * 光带宽度仍设有下限，不会退化成被停用的窄前沿那种可见竖线；
	 * 整条光带被夹在已唱区域内部，绝不进入未唱字形。
	 * @param {number} clipEdge - 已唱区域的右／下边界。
	 * @param {number} textStart - 歌词文本起点（横排为 textX，纵排为 0）。
	 * @param {'auto'|'strong'} mode - 已校验的档位。
	 * @returns {?object} 单束光带的区间、峰值不透明度与包络参数。
	 */
	getKaraokeShineBand(clipEdge, textStart, mode) {
		const lineHeight = this.lineHeight;
		const strong = mode === 'strong';
		const width = Math.max(lineHeight * (strong ? 1.15 : 0.95), 20);
		const bandStart = Math.max(textStart, clipEdge - width);
		if (clipEdge - bandStart < 8) return null;

		return {
			start: bandStart,
			end: clipEdge,
			// 峰值不透明度：旧设计两条带在同一处叠加后等效约 173，接近纯白；
			// 单束后按“看得见但不刺眼”定标，且增强档只小幅上调。
			peakAlpha: strong ? 100 : 72,
			// sin(π·t^k) 的唯一峰值位于 t = 0.5^(1/k)。k>1 把峰值推向靠近前沿处，
			// 但 t=0 与 t=1 处仍严格为 0，所以带尾与已唱／未唱交界都不会留下硬边。
			peakPower: strong ? 1.75 : 1.6,
			// 幂次越小越平缓；旧设计的亮芯用到 2.6，会形成一条集中的亮条。
			exponent: strong ? 1.35 : 1.5
		};
	}

	/**
	 * Stage 8E：绘制一条沿指定扫描轴分布的钟形光带。
	 * 亮度包络在两端必然归零，因此光带与已唱／未唱分区的交界处不会产生硬边；
	 * 横排按列切片、纵排按行切片，共用同一套包络与透明度计算。
	 * @param {GdiGraphics} gr - 目标画布。
	 * @param {?GdiBitmap} bitmap - 已完成着色的歌词字形位图。
	 * @param {boolean} vertical - true 表示沿 Y 轴切片。
	 * @param {number} bandStart - 光带起点（位图局部坐标）。
	 * @param {number} bandEnd - 光带终点（位图局部坐标）。
	 * @param {number} peakAlpha - 峰值不透明度（0-255）。
	 * @param {number} exponent - 形状幂次，越大越集中。
	 * @param {number} peakPower - 峰值位置参数 k：峰值位于 t = 0.5^(1/k)，k>1 把峰值推向带尾。
	 * @param {{x:number,y:number,w:number,h:number}} dest - 位图目标矩形。
	 * @param {number} globalAlpha - 行／列级透明度（0-255）。
	 * @param {?function(number):number} maskSampler - 纵排透明遮罩采样函数，参数为位图局部 Y。
	 * @returns {void}
	 */
	drawKaraokeShineBand(gr, bitmap, vertical, bandStart, bandEnd, peakAlpha, exponent, peakPower, dest, globalAlpha, maskSampler = null) {
		if (!bitmap || globalAlpha <= 0) return;

		const span = bandEnd - bandStart;
		if (span < 1) return;

		// 切片步长压到 1.5px 量级：旧设计上限 28 片、步长约 3px，
		// 在亮度台阶处会形成肉眼可见的条带，本身也是“看得出是一束光”的成因之一。
		const sliceCount = Math.max(12, Math.min(48, Math.ceil(span / 1.5)));
		let previous = Math.max(0, Math.floor(bandStart));

		for (let i = 0; i < sliceCount; i++) {
			const edge = Math.min(bandEnd, Math.round(bandStart + span * (i + 1) / sliceCount));
			if (edge <= previous) continue;
			const size = edge - previous;
			const t = (i + 0.5) / sliceCount;
			const maskFactor = maskSampler ? Clamp(maskSampler(previous + size * 0.5), 0, 1) : 1;
			const shape = Math.pow(Math.sin(Math.PI * Math.pow(t, peakPower)), exponent);
			const alpha = Math.round(peakAlpha * shape * globalAlpha / 255 * maskFactor);
			if (alpha > 0) {
				if (vertical) {
					gr.DrawImage(bitmap, dest.x, dest.y + previous, dest.w, size,
						0, previous, dest.w, size, 0, Math.min(255, alpha));
				}
				else {
					gr.DrawImage(bitmap, previous, dest.y, size, dest.h,
						previous, 0, size, dest.h, 0, Math.min(255, alpha));
				}
			}
			previous = edge;
		}
	}

	/**
	 * Stage 8E：判断提亮后的流光色与主题本色之间是否存在足够可见的亮度增益。
	 * 浅色主题中本色已接近亮度上限，提亮后差值过小，此时必须直接放弃绘制，
	 * 否则就会重演“浅背景上出现可见竖线”的历史回归。
	 * @param {number} shineColor - 提亮后的流光色。
	 * @param {number} baseColor - 运行时主题高亮色。
	 * @returns {boolean} 增益足够时返回 true。
	 */
	hasKaraokeShineGain(shineColor, baseColor) {
		const gain = Math.abs(((shineColor >>> 16) & 0xFF) - ((baseColor >>> 16) & 0xFF)) +
			Math.abs(((shineColor >>> 8) & 0xFF) - ((baseColor >>> 8) & 0xFF)) +
			Math.abs((shineColor & 0xFF) - (baseColor & 0xFF));
		return gain >= 24;
	}

	/**
	 * Stage 8E：取得横排流光专用字形位图（按行内容、布局与颜色缓存一次）。
	 * 颜色沿用冻结的同色相提亮原语 getKaraokeGradientColors：只抬高 HSL 明度并保留运行时时相与
	 * 饱和度，绝不混入白色。位图以全不透明方式缓存，行级淡入淡出改由绘制时的 globalAlpha 施加，
	 * 因此滚动淡入淡出不会击穿缓存。
	 * @param {number} width - 位图宽度。
	 * @param {number} height - 位图高度。
	 * @param {string} text - 歌词内容。
	 * @param {GdiFont} font - 当前字体。
	 * @param {number} color - 不透明度已归一为 255 的流光色。
	 * @returns {?GdiBitmap} 已缓存的流光字形位图。
	 */
	getKaraokeShineBitmap(width, height, text, font, color) {
		const key = [text, width, height, color, this.x, this.w, this.alignCenter].join('|');
		const cached = this.karaokeShineCache;
		if (cached && cached.key === key && cached.font === font) return cached.bmp;

		const bitmap = GDI(width, height, true, g => {
			g.DrawString(text, font, color, this.x, 0, this.w + 1, height, this.alignCenter);
		});
		this.karaokeShineCache = { key, font, bmp: bitmap };
		return bitmap;
	}

	/**
	 * Stage 8E：取得纵排流光专用句列位图。
	 * 逐字绘制在透明位图上，字形之外的像素天然为空，因此不需要额外的字形遮罩；
	 * 结果按句列内容、字体与格高缓存，同一列在整句期间只生成一次。
	 * @param {number} width - 位图宽度。
	 * @param {number} height - 位图高度。
	 * @param {string[]} glyphs - 当前可见纵排字形。
	 * @param {GdiFont} font - 当前句列字体。
	 * @param {number} columnWidth - 句列宽度。
	 * @param {number} cellHeight - 单字符格高度。
	 * @param {boolean} currentFont - 是否使用当前行放大字体。
	 * @param {number} color - 不透明度已归一为 255 的流光色。
	 * @returns {?GdiBitmap} 已缓存的流光句列位图。
	 */
	getKaraokeShineColumnBitmap(width, height, glyphs, font, columnWidth, cellHeight, currentFont, color) {
		const key = ['v', glyphs.join(''), width, height, columnWidth, cellHeight, currentFont ? 1 : 0, color].join('|');
		const cached = this.karaokeShineColumnCache;
		if (cached && cached.key === key && cached.font === font) return cached.bmp;

		const bitmap = GDI(width, height, true, g => {
			// Fix9：与纵排高亮层保持同一套灰阶抗锯齿，避免书法字形的斜锋产生子像素色边。
			g.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
			for (let i = 0; i < glyphs.length; i++) {
				const offsetX = this.getVerticalGlyphOffsetX(glyphs[i], columnWidth, currentFont);
				g.DrawString(glyphs[i], font, color, offsetX, i * cellHeight, width, cellHeight, this.alignCenter);
			}
		});
		this.karaokeShineColumnCache = { key, font, bmp: bitmap };
		return bitmap;
	}

	/**
	 * Stage 8E：在横排逐字扫亮前沿叠加流光。
	 * 整条光带被夹在已唱区域内部且亮度包络两端归零；门禁期间、拖音窗口、句首句尾一律不绘制，
	 * 因此它不会与 Fix7 冻结的高亮分区或拖音保持争夺同一片字形。
	 * @param {GdiGraphics} gr - 目标画布。
	 * @param {object} lyric - 当前歌词行。
	 * @param {GdiFont} font - 当前字体。
	 * @param {number} textY - 目标 Y 坐标。
	 * @param {number} bitmapWidth - 离屏位图宽度。
	 * @param {number} bitmapHeight - 离屏位图高度。
	 * @param {number} clipRight - 已唱区域右边界。
	 * @param {object} progress - 扫亮几何数据。
	 * @param {number} highlightColor - 运行时主题高亮色。
	 * @param {number} alphaSourceColor - 携带当前淡入淡出透明度的颜色。
	 * @returns {void}
	 */
	drawKaraokeShine(gr, lyric, font, textY, bitmapWidth, bitmapHeight, clipRight, progress, highlightColor, alphaSourceColor) {
		if (this.trackThemeColorGateActive) return;

		const mode = this.getKaraokeFxMode(grSet.lyricsKaraokeShineMode);
		if (mode === 'off' || progress.sustainActive) return;
		if (!(progress.width > 0.5) || progress.width >= progress.totalWidth - 0.5) return;
		if (!Number.isFinite(clipRight) || clipRight <= 0) return;

		const band = this.getKaraokeShineBand(clipRight, progress.textX, mode);
		if (!band) return;

		// Stage 8F-R2：明度抬升幅度与上限一并收紧。默认上限 0.86 对低饱和色已接近白，
		// 在“已唱区为纯色”的自定义主题上尤其刺眼；这里封顶 0.78，
		// 于是本色明度高于该上限时会退化为本色，拿不到增益即整体不绘制。
		const shineColor = this.getKaraokeGradientColors(
			highlightColor,
			alphaSourceColor,
			mode === 'strong' ? 0.18 : 0.14,
			0xFF000000,
			0.78
		).start;
		if (!this.hasKaraokeShineGain(shineColor, highlightColor)) return;

		const bitmap = this.getKaraokeShineBitmap(bitmapWidth, bitmapHeight, lyric.content, font, shineColor);
		if (!bitmap) return;

		const globalAlpha = (alphaSourceColor >>> 24) & 0xFF;
		const dest = { x: 0, y: textY, w: bitmapWidth, h: bitmapHeight };
		this.drawKaraokeShineBand(gr, bitmap, false, band.start, band.end,
			band.peakAlpha, band.exponent, band.peakPower, dest, globalAlpha);
	}

	/**
	 * Stage 8E：在纵排逐字扫亮前沿叠加流光（扫亮轴适配器）。
	 * 纵排字形自上而下扫亮，因此光带沿 Y 轴分布并复用同一套钟形包络；
	 * 只有当前播放句列参与，换列过渡中的旧列与待唱列都不绘制。
	 * @param {GdiGraphics} gr - 目标画布。
	 * @param {string[]} glyphs - 当前可见纵排字形。
	 * @param {GdiFont} font - 当前句列字体。
	 * @param {number} columnX - 句列左坐标。
	 * @param {number} columnWidth - 句列宽度。
	 * @param {number} cellHeight - 单字符格高度。
	 * @param {number} startY - 句列位图的目标起始 Y 坐标。
	 * @param {number} bitmapWidth - 句列位图宽度。
	 * @param {number} bitmapHeight - 句列位图高度。
	 * @param {number} clipHeight - 当前自上而下的扫亮高度。
	 * @param {number} highlightColor - 运行时主题高亮色。
	 * @param {number} normalColor - 常规歌词色。
	 * @param {number} globalAlpha - 列边缘透明度（0-255）。
	 * @param {boolean} isCurrentColumn - 是否为当前播放句列。
	 * @param {boolean} currentFont - 是否使用当前行放大字体。
	 * @returns {void}
	 */
	drawKaraokeShineVertical(gr, glyphs, font, columnX, columnWidth, cellHeight, startY,
		bitmapWidth, bitmapHeight, clipHeight, highlightColor, normalColor, globalAlpha, isCurrentColumn, currentFont) {
		if (!isCurrentColumn || this.trackThemeColorGateActive || globalAlpha <= 0) return;

		const mode = this.getKaraokeFxMode(grSet.lyricsKaraokeShineMode);
		if (mode === 'off') return;
		if (!(clipHeight > 0.5) || clipHeight >= bitmapHeight - 0.5) return;

		const band = this.getKaraokeShineBand(clipHeight, 0, mode);
		if (!band) return;

		// Stage 8F-R2：与横排同一套取色纪律，明度封顶 0.78，拿不到增益即整体不绘制。
		const shineColor = this.getKaraokeGradientColors(
			highlightColor,
			normalColor,
			mode === 'strong' ? 0.18 : 0.14,
			0xFF000000,
			0.78
		).start;
		if (!this.hasKaraokeShineGain(shineColor, highlightColor)) return;

		const bitmap = this.getKaraokeShineColumnBitmap(bitmapWidth, bitmapHeight, glyphs, font,
			columnWidth, cellHeight, currentFont, shineColor);
		if (!bitmap) return;

		const dest = { x: columnX, y: startY, w: bitmapWidth, h: bitmapHeight };
		// FIX35：左右遮罩已包含在 globalAlpha 中；Y 轴只控制扫亮进度。
		this.drawKaraokeShineBand(gr, bitmap, true, band.start, band.end,
			band.peakAlpha, band.exponent, band.peakPower, dest, globalAlpha);
	}

	/**
	 * Stage 8E：从固定容量池中取槽位生成一颗星星。
	 * 池满时直接丢弃新星而不扩容，保证每帧分配恒定，长句与快句都不会拖慢绘制。
	 * @param {number} anchorX - 字形中心的屏幕 X 坐标。
	 * @param {number} lineY - 该行屏幕 Y 坐标。
	 * @param {number} now - 生成时刻（播放时间，毫秒）。
	 * @param {'auto'|'strong'} mode - 已校验的档位。
	 * @param {number} maskAlpha - 行级透明遮罩系数（0-1）。
	 * @param {number} seed - 字符索引，用于生成稳定的横向漂移。
	 * @returns {void}
	 */
	karaokeStarSpawn(anchorX, lineY, now, mode, maskAlpha, seed) {
		for (let i = 0; i < 40; i++) {
			if (!this.karaokeStarPool[i]) this.karaokeStarPool[i] = { active: false };
			const slot = this.karaokeStarPool[i];
			if (slot.active) continue;

			slot.active = true;
			slot.x = anchorX;
			slot.y = lineY - this.lineHeight * 0.06;
			slot.spawn = now;
			slot.life = mode === 'strong' ? 640 : 540;
			slot.lift = this.lineHeight * (mode === 'strong' ? 0.52 : 0.42);
			slot.size = mode === 'strong' ? 1.12 : 1;
			slot.mask = Clamp(maskAlpha, 0, 1);
			slot.drift = ((seed % 5) - 2) * this.lineHeight * 0.05;
			return;
		}
	}

	/**
	 * Stage 8E：清空星星池。
	 * @returns {void}
	 */
	karaokeStarClear() {
		const pool = this.karaokeStarPool;
		if (!pool.length) return;
		for (let i = 0; i < pool.length; i++) {
			if (pool[i]) pool[i].active = false;
		}
	}

	/**
	 * Stage 8E-R2：判断一行文本是否长得像制作信息（歌名／作者／词曲／制作等非演唱部分）。
	 * 关键词必须带上分隔符才算命中：冒号类关键词要求紧跟“:”或“：”，无冒号的窄名单还额外限制行长，
	 * 因此“曲终人散”“词不达意”“时间是让人猝不及防的东西”这类歌词不会被误判。
	 * @param {?string} content - 歌词行文本。
	 * @returns {boolean} 命中制作信息特征时返回 true。
	 */
	isLyricsCreditContent(content) {
		const text = String(content === undefined || content === null ? '' : content).trim();
		if (!text) return true;

		// LRC 元标签行，例如 [ti:歌名]、[ar:歌手]。
		if (/^\[[a-zA-Z]{1,4}\s*:[\s\S]*\]$/.test(text)) return true;

		// 中文制作信息：关键词后必须紧跟分隔符，避免把以这些字开头的歌词误判。
		// 同时收录常见繁体写法（濱崎步等日系／港台歌词常用「詞」「編曲」「製作人」）。
		if (/^(歌名|歌曲|曲名|标题|標題|歌手|演唱者?|主唱|原唱|翻唱|作词人?|作詞人?|作词者|作詞者|填词|填詞|词曲|詞曲|曲词|曲詞|作曲人?|作曲者|词|詞|曲|编曲|編曲|制作人?|製作人?|监制|監製|出品人?|混音|母带|母帶|录音|錄音|和声|和聲|伴唱|吉他|贝斯|貝斯|键盘|鍵盤|弦乐|弦樂|策划|策劃|统筹|統籌|发行|發行|版权|版權|专辑|專輯|收录|收錄|语言|語言|风格|風格|流派|时长|時長|发行时间|發行時間|发行日期|發行日期|特别鸣谢|特別鳴謝|鸣谢|鳴謝|致谢|致謝|声明|聲明|未经许可|未經許可|本歌词|本歌詞|歌词制作|歌詞製作|歌词编辑|歌詞編輯|上传|上傳|提供)\s*[:：]/.test(text)) return true;

		// 在线歌词来源附带的说明行，例如「以下歌词翻译由文曲大模型提供」。
		if (text.length <= 40 && /歌词|歌詞|翻[译譯]/.test(text) && /翻[译譯]|提供|制作|製作|校对|校對|来源|來源|编辑|編輯/.test(text)) return true;

		// 对唱曲目的独立说话人标签行，例如「弦子：」「Shakira：」——整行只有一个词加冒号，
		// 冒号之后必须再无任何字符，因此「我：唱给你听」这类真正有内容的行不会被误伤。
		if (/^[^\s:：]{1,10}\s*[:：]$/.test(text)) return true;

		// 中文制作信息（无冒号）：只接受很短的、以空格分隔的行，避免长句歌词被误判。
		if (text.length <= 24 &&
			/^(歌名|曲名|作词|作詞|填词|填詞|作曲|编曲|編曲|制作人|製作人|演唱|主唱|歌手|专辑|專輯|出品|监制|監製|混音|母带|母帶|录音|錄音)\s+\S/.test(text)) return true;

		// 英文制作信息：同样要求带分隔符，或使用 “Xxx by” 结构。
		// 名词形式（Producer／Engineer）与动词形式（Produced）都要覆盖。
		if (/^(lyrics?|music|composed?|composers?|arranged?|arrangers?|produced?|producers?|written|writers?|vocal|vocals|mixing|mixers?|mastering|mastered|engineers?|remix(er)?|label|album|title|artist|singer|guitar|bass|drums?|keyboard|strings?|op|sp|by)\s*(by)?\s*[:：]/i.test(text)) return true;
		if (/^(lyrics|music|arranged|produced|written|composed|mixed|mastered)\s+by\s+\S/i.test(text)) return true;

		return false;
	}

	/**
	 * Stage 8E-R2：判断一行文本是否具备“头部行”的形态（不含成句标点、长度可控）。
	 * 单看它并不足以判定为元信息——歌词也可能很短。因此它只作为头部区扫描的辅助判据，
	 * 必须与“下一行是制作信息”这个上下文一起使用。
	 * @param {?string} content - 歌词行文本。
	 * @returns {boolean} 形态上像头部行时返回 true。
	 */
	isLyricsHeaderLeadShape(content) {
		const text = String(content === undefined || content === null ? '' : content).trim();
		if (!text || text.length > 100) return false;
		// 成句标点是歌词的特征，标题与制作信息行通常没有。
		return !/[，。？！；、,?!;]/.test(text);
	}

	/**
	 * Stage 8E-R2：判断一行文本是否具备“歌名 - 歌手”这种标题行的形态。
	 * 分隔符要求两侧带空格：那正是标题行的写法，而歌词里的连字符通常不带空格
	 * （whoa-oh、e-mail 之类），因此这个区分度远高于“只要含连字符”。
	 * 实测：本机库中首行命中此形态的 10 行全部是标题行，真实首句歌词一例未命中。
	 * 该判据只作用于头部前缀扫描，不会影响句中任何一行。
	 * @param {?string} content - 歌词行文本。
	 * @returns {boolean} 形态上像标题行时返回 true。
	 */
	isLyricsTitleLineShape(content) {
		const text = String(content === undefined || content === null ? '' : content).trim();
		if (!text || text.length > 60) return false;
		if (/[，。？！；、,?!;]/.test(text)) return false;
		return /\s[-–—]\s/.test(text);
	}

	/**
	 * Stage 8E-R2：返回元信息区结束的行下标，即第一行“演唱正文”的位置。
	 * 从头连续扫描，下列情形计入头部区并继续向后：
	 *   1. 命中制作信息规则的行；
	 *   2. 完全没有逐字时间数据的行；
	 *   3. 有逐字时间，但形态像标题行、且其下一行是制作信息行。
	 * 第 3 条解决的是“歌名／歌名 - 歌手”自身不带关键词的情况：LDDC 等工具会把标题行也标上
	 * 逐字时间，紧跟着才是“词：…／曲：…”。此时“下一行是制作信息”是很强的上下文证据，
	 * 而单纯看这一行并不足以判定（歌词也可能很短）。
	 * 一旦遇到不满足上述任一条件的行，头部区立即结束，其后一律按演唱处理。
	 * 结果按歌词数组引用缓存，换歌或重新加载后自动失效。
	 * @returns {number} 演唱正文起始行下标。
	 */
	getLyricsHeaderEndIndex() {
		const lyrics = Array.isArray(this.lyrics) ? this.lyrics : [];
		if (this.lyricsHeaderEndIndex !== null && this.lyricsHeaderEndSource === lyrics) {
			return this.lyricsHeaderEndIndex;
		}

		let index = 0;
		while (index < lyrics.length) {
			const line = lyrics[index];
			const content = line && line.content;
			const hasTiming = !!(line && Array.isArray(line.karaoke) && line.karaoke.length > 0);

			if (this.isLyricsCreditContent(content) || !hasTiming) {
				index++;
				continue;
			}

			// 「歌名 - 歌手」这类标题行常常直接接歌词，身边没有任何制作信息行可作上下文，
			// 因此形态本身即作为判据。它只对头部前缀生效，不会影响句中的任何一行。
			if (this.isLyricsTitleLineShape(content)) {
				index++;
				continue;
			}

			// 必须确认下一行确实存在：空内容会被 isLyricsCreditContent 判为制作信息，
			// 若不加以区分，头部区末尾会把“没有下一行”误当成“下一行是制作信息”。
			const next = lyrics[index + 1];
			if (next && this.isLyricsHeaderLeadShape(content) &&
				this.isLyricsCreditContent(next.content)) {
				index++;
				continue;
			}

			break;
		}

		this.lyricsHeaderEndIndex = index;
		this.lyricsHeaderEndSource = lyrics;
		return index;
	}

	/**
	 * Stage 8E-R2：判断一行歌词是否属于元信息区，用于把星星特效限制在真正的演唱行上。
	 * 同时覆盖“内容像制作信息”与“位于头部连续区”两种情形，因此单独成行的歌名、版权行同样会被排除。
	 * @param {?object} lyric - 已格式化的歌词行。
	 * @returns {boolean} 属于元信息区时返回 true。
	 */
	isLyricsMetadataLine(lyric) {
		if (!lyric) return true;
		if (this.isLyricsCreditContent(lyric.content)) return true;

		const lyrics = Array.isArray(this.lyrics) ? this.lyrics : null;
		if (!lyrics) return false;

		const index = lyrics.indexOf(lyric);
		return index >= 0 && index < this.getLyricsHeaderEndIndex();
	}

	/**
	 * Stage 8E-R2：取得（或生成）指定尺寸与颜色的五角星精灵。
	 * 形状为 10 个顶点（外半径与内半径交替、外顶点朝正上方）构成的五角星多边形，
	 * 逐行求与所有边的交点后按奇偶规则填充，并做 4 次垂直超采样累计覆盖度以获得平滑边缘。
	 * 不依赖任何字体或星形字符，因此不会受用户字体缺失影响；结果按尺寸与颜色缓存，
	 * 运行时逐帧零位图分配。
	 * @param {number} size - 精灵边长（像素）。
	 * @param {number} color - 运行时主题高亮色。
	 * @returns {?GdiBitmap} 预渲染精灵位图。
	 */
	getKaraokeStarSprite(size, color) {
		const key = size + '|' + (color & 0x00FFFFFF).toString(16);
		const cached = this.karaokeStarSpriteCache.get(key);
		if (cached !== undefined) return cached;

		const sprite = GDI(size, size, true, g => {
			if (size < 3) return;

			// 五角星顶点：外顶点朝正上方，外／内半径按 36° 交替；内半径比 0.42 是经典实心五角星比例。
			const center = size * 0.5;
			const outer = center - 0.5;
			const inner = outer * 0.42;
			// 五角星的外接矩形上宽下窄，重心不在几何中心；整体下移 0.0955R 让它在位图内视觉居中。
			const cy = center + outer * 0.0955;
			const vertices = [];
			for (let i = 0; i < 10; i++) {
				const radius = i % 2 === 0 ? outer : inner;
				const angle = -Math.PI / 2 + i * Math.PI / 5;
				vertices.push([center + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
			}

			const SUB = 4;
			const coverage = new Array(size * size).fill(0);

			for (let y = 0; y < size; y++) {
				for (let s = 0; s < SUB; s++) {
					const sampleY = y + (s + 0.5) / SUB;
					const crossings = [];
					for (let i = 0; i < vertices.length; i++) {
						const from = vertices[i];
						const to = vertices[(i + 1) % vertices.length];
						if ((from[1] <= sampleY && to[1] > sampleY) || (to[1] <= sampleY && from[1] > sampleY)) {
							crossings.push(from[0] + (sampleY - from[1]) / (to[1] - from[1]) * (to[0] - from[0]));
						}
					}
					if (crossings.length < 2) continue;
					crossings.sort((a, b) => a - b);

					for (let k = 0; k + 1 < crossings.length; k += 2) {
						const left = Math.max(0, crossings[k]);
						const right = Math.min(size, crossings[k + 1]);
						if (right <= left) continue;
						for (let px = Math.floor(left); px < Math.ceil(right); px++) {
							const overlap = Math.min(px + 1, right) - Math.max(px, left);
							if (overlap > 0) coverage[y * size + px] += overlap / SUB;
						}
					}
				}
			}

			// 覆盖度先整行累计完再一次性填充，避免同一像素被多次 alpha 合成而变浊。
			const rgb = color & 0x00FFFFFF;
			for (let y = 0; y < size; y++) {
				let runStart = 0;
				let runAlpha = -1;
				for (let x = 0; x <= size; x++) {
					const alpha = x < size ? Math.round(Math.min(1, coverage[y * size + x]) * 255) : -1;
					if (alpha === runAlpha) continue;
					if (runAlpha > 0) {
						g.FillSolidRect(runStart, y, x - runStart, 1, RGBtoRGBA(rgb, runAlpha));
					}
					runStart = x;
					runAlpha = alpha;
				}
			}
		});

		if (this.karaokeStarSpriteCache.size > 24) this.karaokeStarSpriteCache.clear();
		this.karaokeStarSpriteCache.set(key, sprite);
		return sprite;
	}

	/**
	 * Stage 8E：把已放行的歌词高亮色推导为星星色。
	 * 与流光共用同一套同色相提亮原语：只抬高 HSL 明度并保留运行时时相与饱和度，绝不混入白色。
	 * @param {number} highlightColor - 与歌词高亮完全同源的已放行快照颜色。
	 * @returns {number} 星星颜色。
	 */
	karaokeStarColor(highlightColor) {
		return this.getKaraokeGradientColors(highlightColor, highlightColor, 0.18, 0xFF000000).start;
	}

	/**
	 * Stage 8E-R2：返回已校验的星星轨迹样式。
	 * hop 为一颗星沿抛物线在字间连续抛跳；pop 为每个字唱完时独立弹出。
	 * @returns {'hop'|'pop'} 轨迹样式。
	 */
	getKaraokeStarStyle() {
		return grSet.lyricsKaraokeStarStyle === 'pop' ? 'pop' : 'hop';
	}

	/**
	 * Stage 8E-R2：绘制沿抛物线在字与字之间连续抛跳的单颗星星。
	 * 整条轨迹是播放时间的纯函数：逐字时间轴预先给出“第 k 跳从字符 k 弹向字符 k+1”的行程表，
	 * 每帧只按当前时刻查表求值，因此暂停自动悬停、Seek 自动重算，不需要任何复位钩子。
	 * 起跳点严格等于上一个字符的中心，落点严格等于下一个字符的中心，所以相邻两跳首尾重合、连贯无跳变。
	 * @param {GdiGraphics} gr - 目标画布。
	 * @param {object} lyric - 当前歌词行。
	 * @param {GdiFont} font - 当前字体。
	 * @param {number} line_y - 该行在屏幕上的 Y 坐标。
	 * @param {{scale:number,opacity:number}} transform - 当前行图层变换。
	 * @param {number} revealAlpha - 译文淡入透明度。
	 * @param {'auto'|'strong'} mode - 已校验的档位。
	 * @param {number} highlightColor - 与歌词高亮完全同源的已放行快照颜色。
	 * @returns {void}
	 */
	drawKaraokeHopStar(gr, lyric, font, line_y, transform, revealAlpha, mode, highlightColor) {
		const timeline = this.getKaraokeGlyphTimeline(gr, lyric, font);
		const hops = timeline.hops;
		const units = timeline.units;
		if (!hops.length || !units.length) return;

		const now = this.playbackTime();
		const first = hops[0];
		if (now < first.launch) return;

		// 收束：最后一跳落地后先静置再淡出，避免句尾整颗星突然消失。
		const last = hops[hops.length - 1];
		const fadeStart = last.land + this.karaokeHopRestDuration;
		if (now > fadeStart + this.karaokeHopFadeDuration) return;
		const deathFade = now <= fadeStart
			? 1
			: 1 - (now - fadeStart) / this.karaokeHopFadeDuration;

		let hopIndex = -1;
		for (let i = 0; i < hops.length; i++) {
			if (now >= hops[i].launch) hopIndex = i;
			else break;
		}
		if (hopIndex < 0) return;

		const hop = hops[hopIndex];
		const fromUnit = units[hop.from];
		const toUnit = units[hop.to];
		if (!fromUnit || !toUnit) return;

		// raw 超过 1 表示这一跳已经落地：星星停在落点上静置，等待下一跳起跳。
		const raw = (now - hop.launch) / Math.max(1, hop.land - hop.launch);
		const resting = raw > 1;
		const u = Clamp(raw, 0, 1);

		const lineHeight = this.lineHeight;
		const scale = Number.isFinite(transform.scale) && transform.scale > 0 ? transform.scale : 1;
		// 与 drawTransformedLyric 的映射完全一致：求出文本顶边在屏幕上的实际位置，
		// 使星星在行入场／出场缩放期间仍与字形保持同一基线，同时不被冻结图层裁掉。
		const textTop = line_y + lineHeight * (0.5 - 0.6 * scale);
		const centerX = this.x + this.w * 0.5;

		// 恒定尺寸：整个飞行过程既不挤压也不缩放，星星始终保持完整形态。
		// 边长只随行图层的整体缩放变化，与飞行进度 u 完全无关，因此上升段与下落段形状一致。
		const baseSize = Clamp(lineHeight * (mode === 'strong' ? 0.5 : 0.42), 10, 28);
		const drawSize = Math.max(1, Math.round(baseSize * scale));
		const spriteSize = Math.round(baseSize);

		// 限高：星星顶边最多升到“上一行星星所在的位置”之下，保证弹跳范围始终留在当前行内。
		// 该位置取上一行文字顶边再往上 0.1 行高处（与本行同样的基准偏移），于是约束为
		//     0.1·行高 + 弧高 + 半径 <= 1.1·行高
		// 解出本行允许的最大弧高恰好是「行高 - 星星半径」。弧高上限只做一次保守夹取，
		// 抛物线的形状、两端归零特性与落点位置都不受影响。
		const preferredArc = lineHeight * (mode === 'strong' ? 0.85 : 0.62);
		const arcHeight = Math.min(preferredArc, Math.max(0, lineHeight - baseSize * 0.5));

		const localX = timeline.textX + fromUnit.center + (toUnit.center - fromUnit.center) * u;
		const screenX = centerX + (localX - centerX) * scale;

		// 标准抛物线 4u(1-u)：u=0 与 u=1 处严格为 0，保证起跳点与落点精确对齐字符中心。
		const arc = 4 * u * (1 - u);
		const idleBob = resting ? Math.sin(now / 220) * lineHeight * 0.035 : 0;
		const screenY = textTop - lineHeight * 0.1 - arcHeight * arc * scale + idleBob * scale;

		const birthFade = Clamp((now - first.launch) / this.karaokeHopBirthDuration, 0, 1);
		const alpha = Math.round(255 * deathFade * birthFade *
			Clamp(transform.opacity, 0, 1) * Clamp(revealAlpha, 0, 1));
		if (alpha <= 0) return;

		// 精灵按量化尺寸缓存，与飞行进度和行图层缩放都无关，整句期间至多新建两张位图。
		const sprite = this.getKaraokeStarSprite(spriteSize, this.karaokeStarColor(highlightColor));
		if (!sprite) return;

		gr.DrawImage(sprite, Math.round(screenX - drawSize * 0.5), Math.round(screenY - drawSize * 0.5),
			drawSize, drawSize, 0, 0, sprite.Width, sprite.Height, 0, alpha);
	}

	/**
	 * Stage 8E：推进星星生命周期并绘制。
	 * 年龄完全由播放时间推导：暂停时年龄停止增长（星星悬停），Seek 造成的负年龄或超期会自动淘汰，
	 * 因此不需要在 Seek、切歌、换句处新增任何复位钩子。
	 * @param {GdiGraphics} gr - 目标画布。
	 * @param {'auto'|'strong'} mode - 已校验的档位。
	 * @param {number} highlightColor - 与歌词高亮完全同源的已放行快照颜色。
	 * @returns {void}
	 */
	karaokeStarUpdate(gr, mode, highlightColor) {
		const pool = this.karaokeStarPool;
		if (!pool.length) return;

		const now = this.playbackTime();
		// 星星与流光共用同一套同色相提亮原语，保证两个特效永远处于同一色系，且绝不混入白色。
		const color = this.getKaraokeGradientColors(highlightColor, highlightColor, 0.18, 0xFF000000).start;
		const size = Math.round(Clamp(this.lineHeight * (mode === 'strong' ? 0.56 : 0.46), 10, 30));
		let sprite = null;

		for (let i = 0; i < pool.length; i++) {
			const star = pool[i];
			if (!star || !star.active) continue;

			const age = now - star.spawn;
			if (!(age >= 0) || age >= star.life || star.mask <= 0) {
				star.active = false;
				continue;
			}

			if (!sprite) sprite = this.getKaraokeStarSprite(size, color);
			if (!sprite) {
				star.active = false;
				continue;
			}

			const t = age / star.life;
			const rise = Clamp(t / 0.18, 0, 1);
			const fall = Clamp((t - 0.72) / 0.28, 0, 1);
			const easedRise = rise * rise * (3 - 2 * rise);
			const easedFall = fall * fall * (3 - 2 * fall);
			const alpha = Math.round(210 * Math.pow(Math.sin(Math.PI * t), 0.7) * star.mask);
			const drawSize = Math.max(1, Math.round(size * star.size * easedRise * (1 - easedFall)));
			if (alpha <= 0 || drawSize <= 0) continue;

			const lift = star.lift * Math.sin(Math.PI * Math.pow(t, 0.75));
			const x = Math.round(star.x + star.drift * t - drawSize * 0.5);
			const y = Math.round(star.y - lift - drawSize * 0.5);

			gr.DrawImage(sprite, x, y, drawSize, drawSize, 0, 0, sprite.Width, sprite.Height, 0, alpha);
		}
	}

	/**
	 * Stage 8E：判定并推进星星跳动特效（仅横排）。
	 * 触发点来自“已扫亮像素宽度越过某个字符右边界”的那一刻，因此星星与可见扫亮前沿严格同源，
	 * 既不新增定时器也不依赖墙钟。行入场／出场期间整行位于被缩放的离屏图层中，向上弹出的星星会被
	 * 图层边界裁切，所以此时只同步计数而不生成；单帧跨越字符过多则视为 Seek 或极端快句而拒绝补发。
	 * @param {GdiGraphics} gr - 目标画布。
	 * @param {object} lyric - 当前歌词行。
	 * @param {number} line_y - 该行在屏幕上的 Y 坐标。
	 * @param {{scale:number,opacity:number}} transform - 当前行图层变换。
	 * @param {number} revealAlpha - 译文淡入透明度。
	 * @param {number} highlightColor - 与歌词高亮完全同源的已放行快照颜色。
	 * @param {?GdiFont} fontOverride - 弧形歌词的实际显示字号；普通歌词沿用设置字号。
	 * @param {?string} starLineKey - 弧形歌词换行后当前页的逐字计数键。
	 * @returns {void}
	 */
	drawKaraokeStars(gr, lyric, line_y, transform, revealAlpha, highlightColor, fontOverride = null, starLineKey = null) {
		// Translation keeps its normal karaoke sweep; stars belong only to the original row.
		if (!lyric || lyric.isOriginalTranslation === false) return;
		// 非当前行直接返回：本方法在可见行循环中被逐行调用，必须让绝大多数行零开销退出。
		if (!lyric.highlight) return;

		// Stage 8E-R2：歌名、作者、词曲、制作人等元信息行不参与星星特效。
		// 该判定只作用于星星，不影响 Fix7 冻结的扫亮与流光路径。
		if (this.isLyricsMetadataLine(lyric)) return;

		const mode = this.getKaraokeFxMode(grSet.lyricsKaraokeStarMode);
		if (mode === 'off') {
			// 关闭时立刻清空残留粒子，避免设置切换后仍有一批星星继续飞行。
			this.karaokeStarClear();
			return;
		}

		if (this.trackThemeColorGateActive || this.type.unsynced ||
			grSet.lyricsKaraokeMode === 'off' || !this.canDrawKaraoke(lyric)) {
			return;
		}

		const font = fontOverride || (grSet.lyricsLargerCurrentSync ? grFont.lyricsHighlight : grFont.lyrics);

		if (this.getKaraokeStarStyle() === 'hop') {
			// 抛跳链不使用粒子池；这里顺手清空它，避免从“逐字弹出”切换过来时留下残余粒子。
			this.karaokeStarClear();
			this.drawKaraokeHopStar(gr, lyric, font, line_y, transform, revealAlpha, mode, highlightColor);
			return;
		}

		const progress = this.getKaraokeProgress(gr, lyric, font);
		if (!(progress.totalWidth > 0)) return;

		const timeline = this.getKaraokeGlyphTimeline(gr, lyric, font);
		const units = timeline.units;
		if (!units.length) return;

		let swept = 0;
		for (let i = 0; i < units.length; i++) {
			if (units[i].right <= progress.width + 0.5) swept++;
			else break;
		}

		const starGroup = starLineKey || lyric.sentenceGroup;
		if (this.karaokeStarGroup !== starGroup) {
			this.karaokeStarGroup = starGroup;
			this.karaokeStarLastIndex = swept;
		}

		if (transform.scale !== 1 || transform.opacity !== 1 || revealAlpha !== 1) {
			this.karaokeStarLastIndex = swept;
			return;
		}

		if (swept > this.karaokeStarLastIndex) {
			const burst = swept - this.karaokeStarLastIndex;
			if (burst <= 2) {
				const now = this.playbackTime();
				const maskAlpha = this.calcTransparentMaskAlpha(line_y);
				for (let i = this.karaokeStarLastIndex; i < swept; i++) {
					this.karaokeStarSpawn(timeline.textX + units[i].center,
						line_y, now, mode, maskAlpha, i);
				}
			}
			this.karaokeStarLastIndex = swept;
		}

		this.karaokeStarUpdate(gr, mode, highlightColor);
	}
	// #endregion KARAOKE SCROLL EFFECTS (Stage 8E)

	// #region KARAOKE EMPHASIS EFFECT (Stage 8F)
	/**
	 * Stage 8F：规范化单字强调档位。
	 * 与流光／星星不同，本档位的声明默认值是 off，因此未知值一律回落到 off，
	 * 保证旧配置或手工改值不会意外开启特效。
	 * @param {*} value - 当前 grSet 中的档位值。
	 * @returns {'off'|'auto'|'strong'} 已校验的档位。
	 */
	getKaraokeEmphasisMode(value) {
		return ['off', 'auto', 'strong'].includes(value) ? value : 'off';
	}

	/**
	 * Stage 8F-R9-P0：规范化竖排长句处理策略。
	 * @param {*} value - 当前 grSet 中的策略值。
	 * @returns {'wrap'|'auto-shrink'} 已校验的策略；未知值回落到 wrap。
	 */
	getVerticalLongLineMode(value = grSet.lyricsVerticalLongLineMode) {
		return ['wrap', 'auto-shrink'].includes(value) ? value : 'wrap';
	}

	/**
	 * Stage 8F-R9-P0：从当前歌词字体派生一个等比缩小的 GdiFont，供 auto-shrink 模式使用。
	 * 仅在最长句确实超出单列高度时才需要；按目标字号就近缓存，避免每帧重建字体。
	 * @param {number} sizePx - 目标字号（像素）。
	 * @returns {?GdiFont} 缩放后的字体，或 null（不可用时回落到大字号）。
	 */
	_getVerticalFitFont(sizePx) {
		const base = grFont.lyrics;
		if (!base) return null;
		const size = Math.round(Clamp(sizePx, 6, 4096));
		const cached = this.verticalFitFontCache.get(size);
		if (cached) return cached;
		if (typeof gdi === 'undefined' || !gdi.Font) return null;
		const font = gdi.Font(base.Name, size, base.Style);
		if (!font) return null;
		if (this.verticalFitFontCache.size > 24) this.verticalFitFontCache.clear();
		this.verticalFitFontCache.set(size, font);
		return font;
	}

	/**
	 * Stage 8F-R4：单字强调是否处于开启（auto/strong）状态。
	 * 开启时需抑制当前行其余「放大 / 上浮 / 脉冲」，让单字毛笔强调成为唯一视觉焦点。
	 * @returns {boolean} 强调是否开启。
	 */
	isKaraokeEmphasisActive() {
		return this.getKaraokeEmphasisMode(grSet.lyricsKaraokeEmphasisMode) !== 'off';
	}

	/**
	 * Stage 8F-R4：当前行是否应使用放大字体（仅纵排渲染使用）。
	 * 单字强调开启时返回 false，使当前句列回落到常规字号，避免「整行放大 + 单字再放大」
	 * 的双重强调；强调关闭后自动恢复 grSet.lyricsLargerCurrentSync 的原配置。
	 * @returns {boolean} 是否使用放大当前行字体。
	 */
	useLargerCurrentSync() {
		return grSet.lyricsLargerCurrentSync && !this.isKaraokeEmphasisActive();
	}

	/**
	 * Stage 8F：把纵排句列的逐字时间轴摊平为时间单元数组。
	 * 这是 getVerticalKaraokeProgress 内部原有的算法，提取出来供扫亮与单字强调共用。
	 * 共用是刻意的：一旦两处各写一份并发生漂移，强调的字符就会与扫亮前沿错位。
	 * 空白字符不参与，因此下标与 getVerticalDisplayGlyphs 的可见字形严格一一对应。
	 * @param {object} column - 合并后的纵排句列。
	 * @returns {Array<{start:number,end:number}>} 逐字时间单元。
	 */
	getVerticalKaraokeUnits(column) {
		if (column && Array.isArray(column.karaokeUnits)) return column.karaokeUnits;

		const units = [];
		if (!column || !Array.isArray(column.karaoke)) return units;

		for (const part of column.karaoke) {
			if (!part || !Number.isFinite(part.start) || typeof part.text !== 'string') continue;
			const characters = this.splitKaraokeCharacters(part.text).filter(char => !/^\s+$/.test(char));
			if (!characters.length) continue;
			const end = Number.isFinite(part.end) ? part.end : this.getKaraokeFallbackEnd(column, part.start);
			const duration = Math.max(1, end - part.start);
			for (let i = 0; i < characters.length; i++) {
				units.push({
					start: part.start + duration * i / characters.length,
					end: part.start + duration * (i + 1) / characters.length
				});
			}
		}

		return units;
	}

	/**
	 * Stage 8F：标准 smoothstep，钳位到 0–1。
	 * 自行实现而不复用 Easing，是为了让“两端严格等于 0 与 1”这一性质不依赖外部定义。
	 * @param {number} t - 归一化进度。
	 * @returns {number} 0–1 的平滑插值结果。
	 */
	smoothStep01(t) {
		const x = Clamp(t, 0, 1);
		return x * x * (3 - 2 * x);
	}

	/**
	 * Stage 8F：计算某个已唱字符的强调时长。
	 * 时长跟随“本字与上一字的间隔”而不是固定值：快句自动收短，避免同一时刻有多个字
	 * 一起浮动而显得整列在抖；慢句拿到完整时长，强调足够充分。
	 * @param {Array<{start:number,end:number}>} units - 逐字时间单元。
	 * @param {number} index - 字符下标。
	 * @returns {number} 时长（毫秒）。
	 */
	getVerticalEmphasisDuration(units, index) {
		const unit = units[index];
		if (!unit || !Number.isFinite(unit.end)) return this.karaokeEmphasisMinDuration;
		const previousEnd = index > 0 && Number.isFinite(units[index - 1].end) ? units[index - 1].end : unit.start;
		const interval = Math.max(1, unit.end - previousEnd);
		return Clamp(interval * 0.9, this.karaokeEmphasisMinDuration, this.karaokeEmphasisMaxDuration);
	}

	/**
	 * Stage 8F：计算强调包络。两端严格归零，因此强调的起止绝不与冻结渲染器交接时跳变。
	 * 额外乘一个 sin(πt) 过冲项让“提起来”带一点弹性；该项在 t=0 与 t=1 处为 0，
	 * 不会破坏两端归零这一前提。几何量取用时会另行钳到 1，过冲只作用于墨晕。
	 * @param {Array<{start:number,end:number}>} units - 逐字时间单元。
	 * @param {number} index - 字符下标。
	 * @param {number} now - 当前播放时间。
	 * @returns {number} 0–1.1 的包络值。
	 */
	getVerticalEmphasisEnvelope(units, index, now) {
		const unit = units[index];
		if (!unit || !Number.isFinite(unit.end)) return 0;
		const duration = this.getVerticalEmphasisDuration(units, index);
		const t = Clamp((now - unit.end) / duration, 0, 1);
		const rise = this.smoothStep01(t / 0.28);
		const fall = this.smoothStep01((t - 0.62) / 0.38);
		return Clamp(rise * (1 - fall) * (1 + 0.06 * Math.sin(Math.PI * t)), 0, 1.1);
	}

	/**
	 * Stage 8F：取当前应当被强调的字符下标，-1 表示不强调。
	 * 触发时刻严格取“该字唱完的瞬间”，因此强调总是叠加在已经确定的已唱状态之上。
	 * 结果完全由播放时间推导，不保存任何动画状态，所以暂停自动悬停、Seek 自动重算。
	 * @param {object} column - 合并后的纵排句列。
	 * @param {number} visibleCount - 当前可见字形数量。
	 * @param {?Array<object>} [units=null] - 已算好的逐字时间单元，传入可避免重复构建。
	 * @returns {number} 字符下标，或 -1。
	 */
	getVerticalEmphasisIndex(column, visibleCount, units = null) {
		if (!column || visibleCount <= 0) return -1;
		if (this.getKaraokeEmphasisMode(grSet.lyricsKaraokeEmphasisMode) === 'off') return -1;
		// 门禁期连高亮色都未放行，不得进入任何取色与绘制路径。
		if (this.trackThemeColorGateActive) return -1;
		// 这一条同时覆盖“卡拉 OK 关闭”与“无逐字数据”两种情形。
		if (!this.canDrawKaraoke(column)) return -1;

		const list = units && units.length ? units : this.getVerticalKaraokeUnits(column);
		if (!list.length) return -1;

		const now = this.playbackTime();
		let index = -1;
		for (let i = 0; i < list.length && i < visibleCount; i++) {
			if (now >= list[i].end) index = i;
			else break;
		}
		// index < 0 表示这一句还没有任何字唱完，此刻不得强调。
		if (index < 0) return -1;

		const age = now - list[index].end;
		if (!(age >= 0) || age >= this.getVerticalEmphasisDuration(list, index)) return -1;
		return index;
	}

	/**
	 * Stage 8F：返回换列／入场过渡期间的强调衰减系数（0–1）。
	 * 入场时整列已有最多 14% 的缩放，若强调再叠加自己的缩放，整个字会像冲出来一样。
	 * 这里复用入场动画自身的包络：它在过渡两端为 0、峰值为 1，所以强调随过渡平滑
	 * 淡入淡出，而不是在整段过渡里被完全禁用（后者会让每句开头的字丢掉强调）。
	 * @param {object} column - 合并后的纵排句列。
	 * @returns {number} 0–1 的衰减系数。
	 */
	getVerticalEmphasisGain(column) {
		if (!this.lineAnimationActive) return 1;
		const state = this.getLineAnimationState(column);
		if (state.state !== 'enter' && state.state !== 'exit') return 1;
		const eased = Clamp(Easing(grSet.lyricsScrollEasing, state.progress), 0, 1);
		return 1 - Math.sin(Math.PI * eased);
	}

	/**
	 * Stage 8F：取得（或生成）单个强调字形的精灵与其墨晕。
	 * 颜色按通道量化到 5 bit 之后再入键：换列过渡期间 displayStart／displayEnd 每帧都在变，
	 * 若用精确颜色入键，420 ms 的过渡里每一帧都会缓存未命中并重建位图。
	 * 量化后的颜色误差不超过每通道 7/255，肉眼不可分辨，但能让缓存真正命中。
	 * @param {string} glyph - 单个字形。
	 * @param {GdiFont} font - 当前字体。
	 * @param {number} color - 该字形在整列渐变中的颜色。
	 * @param {number} columnWidth - 句列宽度。
	 * @param {number} cellHeight - 单字符格高度。
	 * @param {boolean} currentFont - 是否使用当前行放大字体。
	 * @returns {?{sharp:GdiBitmap, glow:?GdiBitmap, pad:number, width:number, height:number}} 精灵条目。
	 */
	getKaraokeEmphasisSprites(glyph, font, color, columnWidth, cellHeight, currentFont) {
		if (typeof glyph !== 'string' || !glyph.length) return null;

		const r5 = (color >>> 16) & 0xF8;
		const g5 = (color >>> 8) & 0xF8;
		const b5 = color & 0xF8;
		// Stage 8F-R3：不再把档位带进缓存键。飞白移除后精灵的像素内容与档位无关，
		// 于是同一字形在 auto 与 strong 之间共用缓存，切换档位不再触发重建。
		const key = [glyph, currentFont ? 'H' : 'N', r5, g5, b5,
			Math.round(columnWidth), Math.round(cellHeight)].join('|');
		const cached = this.karaokeEmphasisCache.get(key);
		if (cached !== undefined) return cached;

		const blurRadius = Clamp(Math.round(cellHeight * 0.11), 2, 8);
		// 内边距必须容纳模糊半径，否则墨晕会在精灵边界被切平。
		const pad = Math.max(3, blurRadius + 2);
		const width = Math.max(1, Math.ceil(columnWidth) + pad * 2);
		const height = Math.max(1, Math.ceil(cellHeight) + pad * 2);
		const offsetX = this.getVerticalGlyphOffsetX(glyph, columnWidth, currentFont);
		const renderGlyph = g => {
			// Fix9：沿用纵排既有的显式灰阶抗锯齿，避免书法字形斜锋产生子像素色边。
			g.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
			g.DrawString(glyph, font, color, pad + offsetX, pad, columnWidth, cellHeight, this.alignCenter);
		};

		const sharp = GDI(width, height, true, renderGlyph);
		if (!sharp) return null;

		const glow = GDI(width, height, true, renderGlyph);
		if (glow) glow.StackBlur(blurRadius);

		const entry = { sharp, glow, pad, width, height };
		if (this.karaokeEmphasisCache.size > 32) this.karaokeEmphasisCache.clear();
		this.karaokeEmphasisCache.set(key, entry);
		return entry;
	}

	/**
	 * Stage 8F / Stage 8F-R3：绘制单个已唱字符的强调（上浮 + 放大 + 回落）与墨晕。
	 * 顿点与飞白已按需求移除：它们和扫亮羽化同属“面积型柔光”，叠在同一个字上会互相削弱。
	 * 墨晕暂时保留。
	 * 调用方必须已经把该字符从底图中挖除，否则上浮后会露出原字形成重影。
	 * 强调画在句列内部，因此它继承整列变换，不需要第二套坐标，也不受列图层裁剪。
	 * @param {GdiGraphics} gr - 目标画布。
	 * @param {object} column - 合并后的纵排句列。
	 * @param {string[]} glyphs - 当前可见纵排字形。
	 * @param {GdiFont} font - 当前字体。
	 * @param {number} columnX - 句列左坐标。
	 * @param {number} columnWidth - 句列宽度。
	 * @param {number} cellHeight - 单字符格高度。
	 * @param {number} startY - 句列起始 Y 坐标。
	 * @param {number} index - 被强调的字符下标。
	 * @param {?Array<object>} units - 逐字时间单元。
	 * @param {'auto'|'strong'} mode - 已校验的档位。
	 * @param {number} displayStart - 句列渐变顶端色。
	 * @param {number} displayEnd - 句列渐变底端色。
	 * @param {number} normalColor - 未唱歌词色。
	 * @param {number} columnOpacity - 列边缘可见度（0–1）。
	 * @param {boolean} currentFont - 是否使用当前行放大字体。
	 * @returns {void}
	 */
	drawVerticalKaraokeEmphasis(gr, column, glyphs, font, columnX, columnWidth, cellHeight, startY,
		index, units, mode, displayStart, displayEnd, normalColor, columnOpacity, currentFont) {
		if (mode === 'off' || index < 0 || index >= glyphs.length) return;
		if (!units || !units.length) return;

		const now = this.playbackTime();
		const strength = this.getVerticalEmphasisEnvelope(units, index, now) * this.getVerticalEmphasisGain(column);
		if (strength <= 0.002) return;

		// Stage 8F-R7：闪光字与渐变互斥——强调字使用纯色高亮（列渐变右端 displayEnd），
		// 不再沿用列渐变染色。否则同一个字既走闪光动画又带渐变，两种效果互相打架；
		// 纯色让闪光成为唯一视觉焦点，且不再依赖该字在列中的下标位置。
		const color = displayEnd;
		const strong = mode === 'strong';
		const sprite = this.getKaraokeEmphasisSprites(glyphs[index], font, color, columnWidth, cellHeight, currentFont);
		if (!sprite || !sprite.sharp) return;

		// 几何量单独用钳到 1 的包络：包络的过冲项只用于让墨晕多一口气，
		// 不允许它继续放大位移与缩放，否则顶部侵入量将越过既定上界。
		// 由 lift + (scale - 1) × 轴心比例 ≤ 0.15 × cellHeight 反解，本处取值：
		// auto 0.060 + 0.08×0.62 = 0.110；strong 0.070 + 0.12×0.62 = 0.144。
		const geometric = Clamp(strength, 0, 1);
		const scale = 1 + (strong ? 0.12 : 0.08) * geometric;
		const lift = cellHeight * (strong ? 0.070 : 0.060) * geometric;
		// 轴心设在格高 0.62 处（中线之下）：放大主要向上扩张，外扩量落在已经唱完的
		// 上一格一侧，从而避开扫亮前沿所在的下一格。顶部侵入上界即由此而来：
		// lift + (scale − 1) × 0.62 ≤ 0.15 × cellHeight（实测 4.38 / 5.78 px，上界 6.00 px）。
		const pivotX = columnX + columnWidth * 0.5;
		const pivotY = startY + index * cellHeight + cellHeight * 0.62;
		const baseX = columnX - sprite.pad;
		const baseY = startY + index * cellHeight - sprite.pad;

		const alpha = Math.round(255 * Clamp(columnOpacity, 0, 1));
		if (alpha <= 0) return;

		if (sprite.glow) {
			const glowScale = scale * 1.34;
			const glowX = pivotX - (pivotX - baseX) * glowScale;
			const glowY = pivotY - (pivotY - baseY) * glowScale - lift;
			// 墨晕只随包络鼓起；字身本身始终维持与邻字相同的不透明度，避免强调帧整体闪烁。
			gr.DrawImage(sprite.glow, glowX, glowY, sprite.width * glowScale, sprite.height * glowScale,
				0, 0, sprite.width, sprite.height, 0, Math.round(alpha * 0.34 * Clamp(strength, 0, 1)));
		}

		const destX = pivotX - (pivotX - baseX) * scale;
		const destY = pivotY - (pivotY - baseY) * scale - lift;
		gr.DrawImage(sprite.sharp, destX, destY, sprite.width * scale, sprite.height * scale,
			0, 0, sprite.width, sprite.height, 0, alpha);
	}
	// #endregion KARAOKE EMPHASIS EFFECT (Stage 8F)

	/**
	 * 计算当前播放时刻增强型 LRC 高亮的像素宽度。
	 * @param {GdiGraphics} gr - GDI 图形对象。
	 * @param {object} lyric - 已格式化的歌词行。
	 * @param {GdiFont} font - 当前歌词行使用的字体。
	 * @returns {{width:number, totalWidth:number, textX:number, sustainActive:boolean, sustainProgress:number, sustainLeft:number, sustainWidth:number}} 卡拉 OK 高亮几何数据。
	 */
	getKaraokeProgress(gr, lyric, font) {
		const currentTime = this.playbackTime();
		const geometry = grm.details.isTurntableActive() ? this.getTurntableSweepGeometry(gr, lyric, font) : null;
		const parts = geometry ? geometry.parts : lyric.karaoke.filter(part =>
			part &&
			typeof part.start === 'number' &&
			Number.isFinite(part.start) &&
			typeof part.text === 'string' &&
			part.text.length > 0
		);
		if (!parts.length) {
			return { width: 0, totalWidth: 0, textX: this.x, sustainActive: false, sustainProgress: 0, sustainLeft: 0, sustainWidth: 0 };
		}

		const totalWidth = geometry ? geometry.totalWidth : Math.ceil(gr.MeasureString(lyric.content, font, 0, 0, 0, 0).Width);
		const textX = geometry ? geometry.textX : this.x + (this.circularArcLeftAlign ? 0 : Math.max(0, (this.w - totalWidth) * 0.5));

		// Fix5：按整行累计前缀测宽，避免 GDI 单独测量英文片段时忽略末尾空格，
		// 导致多个单词的空格宽度持续丢失，最终在行尾留下数个未扫亮字母。
		const measureText = text => {
			if (!text) return 0;
			return typeof gr.CalcTextWidth === 'function'
				? gr.CalcTextWidth(text, font)
				: gr.MeasureString(text, font, 0, 0, 0, 0).Width;
		};
		const karaokeTextWidth = geometry ? geometry.karaokeTextWidth : measureText(parts.map(part => part.text).join(''));
		const widthScale = karaokeTextWidth > 0 ? totalWidth / karaokeTextWidth : 1;
		let prefixText = '';
		let width = 0;
		let sustainActive = false;
		let sustainProgress = 0;
		let sustainLeft = 0;
		let sustainWidth = 0;
		const sustainWindow = grSet.lyricsKaraokeSustainMode !== 'off' && !lyric.karaokeEstimated &&
			this.karaokeSustainWindows instanceof Map
			? this.karaokeSustainWindows.get(lyric.sentenceGroup)
			: null;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			const partStartWidth = geometry ? geometry.widths[i].start : measureText(prefixText) * widthScale;
			if (!geometry) prefixText += part.text;
			const partEndWidth = geometry ? geometry.widths[i].end : measureText(prefixText) * widthScale;
			const end = part.end ?? this.getKaraokeFallbackEnd(lyric, part.start);
			const isSustainPart = sustainWindow && i === parts.length - 1 &&
				Number.isFinite(part.end) && part.end === sustainWindow.end;
			const sweepEnd = isSustainPart ? sustainWindow.start : end;

			if (currentTime >= sweepEnd) {
				width = partEndWidth;
				if (isSustainPart && currentTime < sustainWindow.end) {
					sustainActive = true;
					sustainProgress = Clamp(
						(currentTime - sustainWindow.start) / Math.max(1, sustainWindow.end - sustainWindow.start),
						0,
						1
					);
					sustainLeft = textX + partStartWidth;
					sustainWidth = Math.max(1, partEndWidth - partStartWidth);
				}
				continue;
			}

			if (currentTime > part.start) {
				const duration = Math.max(1, sweepEnd - part.start);
				width = partStartWidth + (partEndWidth - partStartWidth) * Clamp((currentTime - part.start) / duration, 0, 1);
			}

			break;
		}

		return {
			width: Clamp(width, 0, totalWidth),
			totalWidth,
			textX,
			sustainActive,
			sustainProgress,
			sustainLeft,
			sustainWidth
		};
	}

	/**
	 * Rebuilds reliable sentence completion times after wrapping and bilingual layout are complete.
	 * Only the primary original line's final explicit fragment is accepted. Estimated translations
	 * and fallback ends never create an ending animation, so a sustained or unknown final syllable
	 * cannot be shortened by inference.
	 */
	rebuildKaraokeCompletionEnds() {
		this.karaokeCompletionEnds.clear();
		this.karaokeSustainWindows.clear();
		const groups = new Map();

		for (const lyric of this.lyrics) {
			if (lyric.karaokeEstimated || !Array.isArray(lyric.karaoke) || !lyric.karaoke.length) continue;

			const existing = groups.get(lyric.sentenceGroup);
			if (!existing || lyric.group < existing.primaryGroup) {
				groups.set(lyric.sentenceGroup, { primaryGroup: lyric.group, lines: [lyric] });
			}
			else if (lyric.group === existing.primaryGroup) {
				existing.lines.push(lyric);
			}
		}

		for (const [sentenceGroup, entry] of groups) {
			const lastLine = entry.lines[entry.lines.length - 1];
			const lastPart = lastLine?.karaoke?.[lastLine.karaoke.length - 1];
			if (Number.isFinite(lastPart?.end)) {
				this.karaokeCompletionEnds.set(sentenceGroup, lastPart.end);
				const partDuration = lastPart.end - lastPart.start;
				if (Number.isFinite(lastPart.start) && partDuration >= this.karaokeSustainMinimum) {
					const sustainDuration = Clamp(partDuration * 0.4, 240, Math.min(480, partDuration - 300));
					if (sustainDuration >= 240) {
						this.karaokeSustainWindows.set(sentenceGroup, {
							start: lastPart.end - sustainDuration,
							end: lastPart.end
						});
					}
				}
			}
		}
	}

	/**
	 * Returns the eased Stage 6H R4 completion-settle amount for the current sentence group.
	 * Playback time is the sole clock: pause freezes it and seek/reload immediately reconstruct it.
	 * @param {object} lyric - Current formatted lyric line.
	 * @returns {number} 0 during singing/hold, then a smooth 0–1 settle value.
	 */
	getKaraokeEndingSettle(lyric) {
		if (!this.canDrawKaraoke(lyric) || !lyric?.highlight) return 0;

		const completionEnd = this.karaokeCompletionEnds.get(lyric.sentenceGroup);
		if (!Number.isFinite(completionEnd)) return 0;

		const elapsed = this.playbackTime() - completionEnd - this.karaokeEndingHold;
		if (elapsed <= 0) return 0;

		const progress = Clamp(elapsed / this.karaokeEndingSettleDuration, 0, 1);
		return 0.5 - 0.5 * Math.cos(Math.PI * progress);
	}

	/**
	 * 当最后一个增强型 LRC 片段只有起始时间时，提供回退结束时间。
	 * @param {object} lyric - 当前已格式化的歌词行。
	 * @param {number} start - 最后一个卡拉 OK 片段的起始时间。
	 * @returns {number} 结束时间（毫秒）。
	 */
	getKaraokeFallbackEnd(lyric, start) {
		const nextSentence = this.lyrics.find(item =>
			item.timestamp > lyric.timestamp && item.sentenceGroup !== lyric.sentenceGroup
		);
		return Math.max(start + 1, nextSentence?.timestamp ?? start + 1000);
	}

	/**
	 * Stage 8F-R3：汉字数量的唯一来源。
	 * 提取为独立原语是因为资格判定与成列两个环节都要用它。此前字符范围字面量只内联在
	 * 资格判定里，若各处自行复制一份并在日后漂移，就会出现“资格判定说它是中文歌、
	 * 成列时却把同一行当英文丢掉”这种自相矛盾的行为。
	 * @param {string} text - 任意文本。
	 * @returns {number} 汉字数量。
	 */
	countHanCharacters(text) {
		return (String(text || '').match(/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/g) || []).length;
	}

	/**
	 * Stage 8F-R3：拉丁字母数量（原始计数，不区分重复）。
	 * @param {string} text - 任意文本。
	 * @returns {number} 拉丁字母数量。
	 */
	countLatinCharacters(text) {
		return (String(text || '').match(/[A-Za-z]/g) || []).length;
	}

	/**
	 * Stage 8F-R6：拉丁“去重词”字数——按独立单词去重后累加每个词的长度。
	 * 目的：拟声／语气词副歌（Boom Boom / Doom Doom / Toom Toom）会把原始字母数顶到远超中文，
	 * 导致《OK蹦》这类中文歌被判成英文。按独立词去重后，“Boom Boom Boom Boom”只算一个 Boom（4 个字母），
	 * 重复不再线性放大；真实英文歌词词汇多样，去重后仍保有大量字母，不会被误放行。
	 * @param {string} text - 任意文本。
	 * @returns {number} 独立拉丁词的字母总数。
	 */
	countDistinctLatinLetters(text) {
		const words = String(text || '').match(/[A-Za-z]+/g) || [];
		const seen = new Set();
		let total = 0;
		for (const word of words) {
			const key = word.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			total += word.length;
		}
		return total;
	}

	/**
	 * Stage 8A R2 / Stage 8F-R3 / Stage 8F-R6：判断当前歌词是否适合启用中文传统纵排。
	 * 【演进】R2 旧口径“全书汉字 ≥ 全书字母 × 2”误杀《梦游》（233 汉字 vs 138 字母）。
	 * R3 改为“每行主导语言”数行数，误杀《OK蹦》（英文主导行更多）。
	 * R5 改为“全书汉字 ≥ 全书原始字母数”，仍误杀《OK蹦》——其副歌把 Boom／Doom／Toom
	 * 反复几十遍，原始字母数（≈476）其实超过了汉字（≈371）。
	 * R6 改为“全书汉字 ≥ 全书去重词字母数”：拟声词按独立词只算一次，重复不再线性放大，
	 * 于是《OK蹦》判过；真实英文歌词词汇多样，去重后仍保有大量字母，纯英文与畸形分布仍被拦下。
	 * 翻译行仍被排除。
	 * @returns {boolean} 当前歌词可使用中文纵排时返回 true。
	 */
	canDrawVerticalChineseLyrics() {
		const turntable = grm.details.isTurntableActive();
		// FIX36：唱机拥有独立歌词区域，不依赖普通歌词页的显示开关。
		if (grSet.lyricsVerticalChineseMode !== 'on' || grSet.layout !== 'default' ||
			!(turntable ? grm.details.isLyricsVisible() && grm.details.getTurntableLyricsBounds() : grm.ui.displayLyrics) ||
			this.locus < 0) {
			return false;
		}
		const cache = this.verticalEligibilityCache;
		if (cache && cache.lyrics === this.lyrics && cache.length === this.lyrics.length) return cache.eligible;

		let hanCount = 0;
		let latinCount = 0;
		for (const lyric of this.lyrics) {
			if (!lyric?.content || lyric.isOriginalTranslation === false) continue;
			hanCount += this.countHanCharacters(lyric.content);
			latinCount += this.countDistinctLatinLetters(lyric.content);
		}

		// 两个条件缺一不可：
		//   至少 4 个汉字——少于这个数没有成列的意义；
		//   汉字总数 ≥ 去重词字母总数——挡住纯英文与畸形分布，同时不误杀拟声词副歌型的中文歌。
		const eligible = hanCount >= 4 && hanCount >= latinCount;
		this.verticalEligibilityCache = { lyrics: this.lyrics, length: this.lyrics.length, eligible };
		return eligible;
	}

	/**
	 * Stage 8F-R9：计算纵排单句在不截断前提下最多可容纳的可见字数。
	 * 与 drawVerticalChineseLyrics 使用同一套 cellHeight / availableHeight 约定。
	 * @returns {number} 单句最大可见字数（至少为 1）。
	 */
	getVerticalColumnMaxGlyphs() {
		// Stage 8F-R9-P0：auto-shrink 模式不切分，直接返回“无限”让整句落在一列；
		// 真正的缩小由 drawVerticalChineseLyrics 按最长句等比缩放字号完成。
		if (this.getVerticalLongLineMode() === 'auto-shrink') return Infinity;
		const fontHeight = this.font && Number.isFinite(this.font.lyrics_h) ? this.font.lyrics_h : this.lineHeight;
		const cellHeight = Math.max(fontHeight * 1.08, this.lineHeight * 0.88);
		const availableHeight = Math.max(1, this.h - SCALE(16));
		return Math.max(1, Math.floor(availableHeight / cellHeight));
	}

	/**
	 * Stage 8F-R9：将过长的纵排句列拆分为多个不超出面板高度的“句列段”。
	 * 按可见字形数切分，并同步切分逐字 Karaoke 时间轴（karaokeUnits），保证扫亮、
	 * 流光与单字强调在每一列段上都能正确衔接。被切分的列段仍共用原 sentenceGroup，
	 * 因此换列动画、当前句判定与整句高亮仍可正常按句子聚合。
	 * @param {object} column - 合并后的原始歌词句列。
	 * @param {number} maxGlyphs - 单句列最大可见字数。
	 * @returns {Array<object>} 句列段数组；若无需切分则返回一个元素。
	 */
	splitVerticalChineseColumn(column, maxGlyphs) {
		const glyphs = this.getVerticalDisplayGlyphs(column.content);
		if (glyphs.length <= maxGlyphs) {
			const units = this.getVerticalKaraokeUnits(column);
			return [{
				...column,
				karaokeUnits: units,
				segmentIndex: 0,
				segmentCount: 1
			}];
		}

		const allUnits = this.getVerticalKaraokeUnits(column);
		const segmentCount = Math.ceil(glyphs.length / maxGlyphs);
		const segments = [];

		for (let s = 0; s < segmentCount; s++) {
			const start = s * maxGlyphs;
			const end = Math.min(start + maxGlyphs, glyphs.length);
			const segmentGlyphs = glyphs.slice(start, end);
			const segmentUnits = allUnits.slice(start, end);
			const firstStart = segmentUnits.length ? segmentUnits[0].start : column.timestamp;
			const lastEnd = segmentUnits.length
				? segmentUnits[segmentUnits.length - 1].end
				: allUnits.length ? allUnits[allUnits.length - 1].end : firstStart + 1;

			segments.push({
				content: segmentGlyphs.join(''),
				timestamp: firstStart,
				sentenceGroup: column.sentenceGroup,
				karaoke: segmentUnits.length > 0
					? [{ start: firstStart, end: lastEnd, text: segmentGlyphs.join('') }]
					: [],
				karaokeEstimated: column.karaokeEstimated,
				highlight: column.highlight,
				segmentIndex: s,
				segmentCount,
				karaokeUnits: segmentUnits
			});
		}

		return segments;
	}

	/**
	 * 将播放器横排阶段产生的自动换行重新合并为“每句一列”的纵排数据。
	 * 中英双语的 secondary 行不参与纵排，避免英文翻译被逐字符竖排。
	 * Stage 8F-R3：不含任何汉字的行同样不成列。它们本来就不是中文正文，
	 * 若成列会把 DALA / Sol 这类拟声与唱名拆成一长串竖排字母
	 * （DALALALALA 会变成 11 个字母竖着叠一整列）。这类行的时间段由
	 * drawVerticalChineseLyrics 的回退逻辑沿用上一列，不会造成面板空白。
	 * @returns {Array<object>} 按时间排序的主原文句列。
	 */
	getVerticalChineseColumns() {
		// Stage 8F-R9-P0：整段句列在歌词数组、面板尺寸与换行策略均不变时直接复用，
		// 避免每帧重复合并歌词并按逐字时间轴切分。竖排列的 highlight 字段不参与竖排渲染，
		// 因此即便逐帧 locus 变化也无需失效。
		const maxGlyphs = this.getVerticalColumnMaxGlyphs();
		const wrapMode = this.getVerticalLongLineMode();
		if (this.verticalColumnsCache && this.verticalColumnsKey === this.lyrics &&
			this.verticalColumnsKeyLength === this.lyrics.length &&
			this.verticalColumnsMaxGlyphs === maxGlyphs && this.verticalColumnsWrap === wrapMode) {
			return this.verticalColumnsCache;
		}

		const columns = [];
		const bySentence = new Map();

		for (const lyric of this.lyrics) {
			if (!lyric || lyric.sentenceGroup < 0 || lyric.isOriginalTranslation === false) continue;
			if (this.countHanCharacters(lyric.content) === 0) continue;

			let column = bySentence.get(lyric.sentenceGroup);
			if (!column) {
				column = {
					content: '',
					timestamp: lyric.timestamp,
					sentenceGroup: lyric.sentenceGroup,
					karaoke: [],
					karaokeEstimated: lyric.karaokeEstimated,
					highlight: false
				};
				bySentence.set(lyric.sentenceGroup, column);
				columns.push(column);
			}

			column.content += lyric.content;
			if (Array.isArray(lyric.karaoke)) column.karaoke.push(...lyric.karaoke);
			column.highlight = column.highlight || !!lyric.highlight;
			}

			const result = columns.flatMap(column => this.splitVerticalChineseColumn(column, maxGlyphs));
			this.verticalColumnsCache = result;
			this.verticalColumnsKey = this.lyrics;
			this.verticalColumnsKeyLength = this.lyrics.length;
			this.verticalColumnsMaxGlyphs = maxGlyphs;
			this.verticalColumnsWrap = wrapMode;
			return result;
			}

	/**
	 * 返回纵排专用可见字形。只把两侧带空格的独立横向分隔符转换为中文竖线，
	 * 例如播放器自动生成的“歌名 - 歌手”；歌词正文中的连字符／破折号保持原样。
	 * 此转换只发生在纵排绘制阶段，不修改歌词数据，也不影响横排。
	 * @param {string} text - 纵排句列文本。
	 * @returns {string[]} 去除空白后的纵排显示字形。
	 */
	getVerticalDisplayGlyphs(text) {
		// Stage 8F-R9-P0：字形解析含逐字符正则，且每帧被多个绘制入口重复调用，
		// 按源文本缓存结果（只读复用），消除重复开销。
		const cached = this.verticalGlyphCache.get(text);
		if (cached) return cached;

		const characters = this.splitKaraokeCharacters(text || '');
		const dashPattern = /^[-\u2010\u2011\u2012\u2013\u2014\u2015\uFE58\uFE63\uFF0D]$/;
		const whitespace = character => /^\s+$/.test(character || '');
		const visible = [];

		for (let i = 0; i < characters.length; i++) {
			const character = characters[i];
			if (whitespace(character)) continue;
			const previousIsBoundary = i === 0 || whitespace(characters[i - 1]);
			const nextIsBoundary = i === characters.length - 1 || whitespace(characters[i + 1]);
			visible.push(dashPattern.test(character) && previousIsBoundary && nextIsBoundary ? '丨' : character);
		}

		this.verticalGlyphCache.set(text, visible);
		if (this.verticalGlyphCache.size > 1024) this.verticalGlyphCache.clear();
		return visible;
	}

	/**
	 * 修正部分书法／中文字体中冒号墨迹相对全角字框明显偏左的问题。
	 * 仅改变纵排绘制矩形，不替换字符，不影响横排文本和 Karaoke 字符计数。
	 * @param {string} glyph - 当前纵排字形。
	 * @param {number} columnWidth - 当前句列宽度。
	 * @param {boolean} [currentFont=false] - 是否正在使用放大的当前行字体。
	 * @returns {number} 纵排绘制所需的水平补偿。
	 */
	getVerticalGlyphOffsetX(glyph, columnWidth, currentFont = false) {
		if (glyph !== ':' && glyph !== '：') return 0;

		// 普通字体的 18% 已经实机居中。Fix5 单遮罩完整呈现放大字体补偿后，实机标线
		// 显示 40% 会使当前列冒号越过汉字视觉中线；回调为 25%，普通列保持不变。
		return columnWidth * (currentFont ? 0.25 : 0.18);
	}

	/**
	 * 计算纵排当前句从上到下的连续逐字进度，单位为“可见字符数”。
	 * 一个增强型 LRC 片段包含多个字符时按字符数平均分配片段时长。
	 * @param {object} column - 合并后的纵排句列。
	 * @param {number} glyphCount - 当前可见字符总数。
	 * @returns {number} 0 到 glyphCount 的连续进度。
	 */
	getVerticalKaraokeProgress(column, glyphCount) {
		if (glyphCount <= 0) return 0;
		if (!this.canDrawKaraoke(column)) return glyphCount;

		const units = this.getVerticalKaraokeUnits(column);

		if (!units.length) return glyphCount;

		const currentTime = this.playbackTime();
		let unitProgress = 0;
		for (let i = 0; i < units.length; i++) {
			const unit = units[i];
			if (currentTime >= unit.end) {
				unitProgress = i + 1;
				continue;
			}
			if (currentTime > unit.start) {
				unitProgress = i + Clamp((currentTime - unit.start) / Math.max(1, unit.end - unit.start), 0, 1);
			}
			break;
		}

		return Clamp(unitProgress / units.length * glyphCount, 0, glyphCount);
	}

	/**
	 * Stage 8A R2 Fix5：创建纵排连续渐变高亮层，并在当前扫亮边界加入 C-Ref smoothstep 羽化。
	 * 颜色底图沿中文阅读方向由上到下生成，再通过一张灰阶字形遮罩合成；不会为每个字符
	 * 创建独立位图。纯色档保留硬边界，柔和／主题色渐变分别使用不同羽化宽度和切片数。
	 * @param {string[]} glyphs - 当前可见纵排字形。
	 * @param {GdiFont} font - 当前句列字体。
	 * @param {number} columnWidth - 句列宽度。
	 * @param {number} cellHeight - 单字符格高度。
	 * @param {number} startColor - 顶端较浅高亮色。
	 * @param {number} endColor - 底端较深高亮色。
	 * @param {number} normalColor - 未唱歌词色，也是羽化终点。
	 * @param {'solid'|'gradient'|'duotone'} style - 当前扫亮样式。
	 * @param {number} clipHeight - 当前从上向下扫亮高度。
	 * @param {number} highlightStrength - 换列高亮交接强度（0–1）。
	 * @param {boolean} currentFont - 是否使用当前行放大字体。
	 * @param {number} [skipIndex=-1] - Stage 8F：需要从字形遮罩中挖除的字符下标，-1 表示不挖除。
	 * @returns {?GdiBitmap} 已完成已唱／未唱互斥着色并只应用一次遮罩的最终纵排文字层。
	 */
	createVerticalKaraokeGradientBitmap(glyphs, font, columnWidth, cellHeight,
		startColor, endColor, normalColor, style, clipHeight, highlightStrength, currentFont, skipIndex = -1) {
		const bitmapWidth = Math.max(1, Math.ceil(columnWidth));
		const bitmapHeight = Math.max(1, Math.ceil(glyphs.length * cellHeight));
		const strength = Clamp(highlightStrength, 0, 1);
		const displayStart = this.mixKaraokeColor(normalColor, startColor, strength, normalColor);
		const displayEnd = this.mixKaraokeColor(normalColor, endColor, strength, normalColor);
		const gradient = GDI(bitmapWidth, bitmapHeight, true, g => {
			// Fix8：先在一个颜色底图中完成全部互斥着色，字形遮罩最终只应用一次。
			// 0° 是横向，90° 对应纵排从上到下的固定整列渐变。
			g.FillGradRect(
				0,
				0,
				bitmapWidth,
				bitmapHeight,
				90,
				displayStart,
				displayEnd,
				1
			);

			const fullySwept = clipHeight >= bitmapHeight - 0.5;
			if (style !== 'solid' && !fullySwept && clipHeight > 0.5) {
				const sweepBottom = Clamp(clipHeight, 0, bitmapHeight);
				// Edge Fix：与横排一致——羽化带收窄且混白上限 85%，已唱字不再泛白。
				const featherHeight = Math.max(8, Math.round(cellHeight * (style === 'duotone' ? 0.32 : 0.22)));
				const featherStart = Math.max(0, sweepBottom - featherHeight);
				const featherSpan = sweepBottom - featherStart;

				if (featherSpan > 0) {
					const baseRatio = Clamp(featherStart / bitmapHeight, 0, 1);
					const featherBaseColor = this.mixKaraokeColor(displayStart, displayEnd, baseRatio, normalColor);
					const sliceCount = style === 'duotone' ? 20 : 14;
					let previousBottom = Math.floor(featherStart);

					for (let i = 0; i < sliceCount; i++) {
						const bottom = Math.min(sweepBottom, Math.round(featherStart + featherSpan * (i + 1) / sliceCount));
						if (bottom <= previousBottom) continue;
						const t = (i + 0.5) / sliceCount;
						const smooth = t * t * (3 - 2 * t) * 0.85;
						const sliceColor = this.mixKaraokeColor(featherBaseColor, normalColor, smooth, normalColor);
						g.FillSolidRect(0, previousBottom, bitmapWidth, bottom - previousBottom, sliceColor);
						previousBottom = bottom;
					}
				}
			}

			// 未唱区域直接在同一颜色底图中覆盖为 normalColor，绝不再叠加第二张
			// 半透明文字位图；因此抗锯齿边缘也只会参与一次 Alpha 合成。
			const unsungTop = Math.min(bitmapHeight, Math.max(0, Math.ceil(clipHeight)));
			if (unsungTop < bitmapHeight) {
				g.FillSolidRect(0, unsungTop, bitmapWidth, bitmapHeight - unsungTop,
					this.applyLyricAlpha(normalColor, normalColor));
			}
		});
		if (!gradient) return null;

		const mask = GDI(bitmapWidth, bitmapHeight, true, g => {
			// Fix9：必须显式锁定灰阶抗锯齿。系统默认文字渲染在部分书法字形的
			// 右上斜锋会产生 ClearType 子像素色边，应用为透明遮罩后表现为极细白点。
			g.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
			g.FillSolidRect(0, 0, bitmapWidth, bitmapHeight, RGB(255, 255, 255));
			for (let i = 0; i < glyphs.length; i++) {
				// Stage 8F：被强调的字不进入遮罩，因为稍后会以放大后的精灵单独绘制；
				// 若不挖除，上浮后原位置会残留一道底字，表现为重影。
				if (i === skipIndex) continue;
				const glyphY = i * cellHeight;
				const glyphOffsetX = this.getVerticalGlyphOffsetX(glyphs[i], columnWidth, currentFont);
				// 字形遮罩仅保留抗锯齿，整列左右渐隐由最终绘制透明度应用一次。
				g.DrawString(glyphs[i], font, RGB(0, 0, 0),
					glyphOffsetX, glyphY, bitmapWidth, cellHeight, this.alignCenter);
			}
		});
		if (!mask) return null;

		gradient.ApplyMask(mask);
		return gradient;
	}

	/**
	 * 绘制单个竖排句列。主文字逐字符直接绘制；当前 Karaoke 高亮仅创建一张纵向位图，
	 * 再按播放进度从上向下裁剪，避免逐字符逐帧创建大量位图。
	 * @param {GdiGraphics} gr - 目标画布。
	 * @param {object} column - 合并后的歌词句列。
	 * @param {number} columnX - 句列左坐标。
	 * @param {number} columnWidth - 句列宽度。
	 * @param {number} cellHeight - 单字符格高度。
	 * @param {number} highlightStrength - 当前／换出句高亮强度（0–1）。
	 * @param {number} columnOpacity - 左右面板边缘淡入淡出强度（0–1）。
	 * @param {boolean} isCurrentColumn - 该列是否为播放时间指向的当前句。
	 * @param {number} normalColor - 常规歌词色。
	 * @param {number} highlightColor - 运行时主题高亮色。
	 * @param {number} shadowColor - 投影色。
	 * @param {?number} [renderStartY=null] - 离屏图层内的局部起始 Y；空值使用面板坐标。
	 */
	drawVerticalChineseColumnCore(gr, column, columnX, columnWidth, cellHeight, highlightStrength, columnOpacity,
		isCurrentColumn, normalColor, highlightColor, shadowColor, renderStartY = null, fontOverride = null) {
		const glyphs = this.getVerticalDisplayGlyphs(column.content);
		if (!glyphs.length) return;

		// R2 Fix2：字号角色严格跟随当前播放句，不再跟随延迟结束的颜色交接强度。
		// 这样新句进入时由新列承担当前行表现，旧列不会在变成上一列后才突然缩回。
		// Stage 8F-R4：currentFont 与 font 同源门控。单字强调开启时 currentFont 一并回落，
		// 保证冒号对中与精灵缓存键（'H'/'N'）始终与实际字号一致，不会用到错尺寸的缓存精灵。
		// Stage 8F-R9-P0：auto-shrink 模式传入 fontOverride（按最长句缩好的字体），
		// 此时同一字体用于常规与当前列，故 currentFont 强制为 false，避免又套用大字号。
		const currentFont = fontOverride ? false : (isCurrentColumn && this.useLargerCurrentSync());
		const font = fontOverride || (currentFont ? grFont.lyricsHighlight : grFont.lyrics);
		const screenStartY = this.y + SCALE(8);
		const startY = Number.isFinite(renderStartY) ? renderStartY : screenStartY;
		const availableHeight = Math.max(1, this.h - SCALE(16));
		const visibleCount = Math.min(glyphs.length, Math.max(1, Math.floor(availableHeight / cellHeight)));
		const visibleGlyphs = glyphs.slice(0, visibleCount);
		const shadowOffset = this.shadowEffect ? Math.max(1, this.dropShadowLevel) : 0;
		const useMaskedKaraokeLayers = !this.trackThemeColorGateActive && highlightStrength > 0 && columnOpacity > 0;
		// Stage 8F：单字强调。索引在这里一次性算出，供下文“挖字”与“叠字”两处共用；
		// 档位为 off 时既不算索引也不建时间轴，整条新路径零开销退出。
		const emphasisMode = this.getKaraokeEmphasisMode(grSet.lyricsKaraokeEmphasisMode);
		const emphasisUnits = emphasisMode === 'off' ? null : this.getVerticalKaraokeUnits(column);
		const emphasisIndex = emphasisMode === 'off'
			? -1
			: this.getVerticalEmphasisIndex(column, visibleGlyphs.length, emphasisUnits);

		for (let i = 0; i < visibleGlyphs.length; i++) {
			const glyphY = startY + i * cellHeight;
			const glyphOffsetX = this.getVerticalGlyphOffsetX(visibleGlyphs[i], columnWidth, currentFont);
			const alpha = Math.round(255 * Clamp(columnOpacity, 0, 1));
			if (alpha <= 0) continue;

			// Stage 8F：被强调的字连同其投影一起跳过，改由强调精灵绘制，否则上浮后会留下底字。
			// 仅在遮罩合成路径下跳过：位图创建失败会走兜底循环，那时必须原样保留这个字。
			if (useMaskedKaraokeLayers && i === emphasisIndex) continue;

			if (shadowOffset > 0) {
				gr.DrawString(visibleGlyphs[i], font, RGBtoRGBA(shadowColor, alpha),
					columnX + glyphOffsetX + shadowOffset, glyphY + shadowOffset, columnWidth, cellHeight, this.alignCenter);
			}
			if (!useMaskedKaraokeLayers) {
				gr.DrawString(visibleGlyphs[i], font, RGBtoRGBA(normalColor, alpha),
					columnX + glyphOffsetX, glyphY, columnWidth, cellHeight, this.alignCenter);
			}
		}

		// 旧列仍可按 highlightStrength 淡出，但不会继续冒充当前列使用大字号。
		if (highlightStrength <= 0 || columnOpacity <= 0) return;

		const activeTheme = String(grSet.theme).toLowerCase();
		const customTheme = activeTheme.startsWith('custom');
		const creamThemeAccent = activeTheme === 'cream' && Number.isFinite(grCol.progressBarFill);
		const preserveRuntimeHighlight = customTheme || activeTheme === 'reborn';
		const karaokeModeOff = grSet.lyricsKaraokeMode === 'off';
		const rawHighlight = karaokeModeOff
			? this.applyLyricAlpha(highlightColor, highlightColor)
			: this.getKaraokeThemeHighlightColor(activeTheme, highlightColor, highlightColor, true);
		const safeHighlight = karaokeModeOff || preserveRuntimeHighlight || creamThemeAccent
			? rawHighlight
			: this.ensureKaraokeContrast(rawHighlight, normalColor, 2.6);
		const style = karaokeModeOff ? 'solid' : this.getKaraokeStyle();
		const dynamicColorTheme = !karaokeModeOff && (activeTheme === 'random' || activeTheme === 'reborn');
		const gradientDepth = style === 'duotone' ? 0.22 : 0.14;
		// Stage 8F R10：竖排与横排保持一致，自定义主题不再被强制为纯色，恢复渐变档。
		const gradient = style === 'solid'
			? { start: safeHighlight, end: safeHighlight }
			: dynamicColorTheme
				? this.getKaraokeDynamicGradientColors(rawHighlight, gradientDepth, normalColor)
				: this.getKaraokeGradientColors(rawHighlight, normalColor, gradientDepth, normalColor);
		const progress = this.getVerticalKaraokeProgress(column, glyphs.length);
		const visibleProgress = Clamp(progress, 0, visibleGlyphs.length);
		const bitmapWidth = Math.max(1, Math.ceil(columnWidth));
		const bitmapHeight = Math.max(1, Math.ceil(visibleGlyphs.length * cellHeight));
		const clipHeight = Math.min(bitmapHeight, Math.ceil(visibleProgress * cellHeight));
		const karaokeLayer = this.createVerticalKaraokeGradientBitmap(
			visibleGlyphs,
			font,
			columnWidth,
			cellHeight,
			gradient.start,
			gradient.end,
			normalColor,
			style,
			clipHeight,
			highlightStrength,
			currentFont,
			emphasisIndex
		);
		if (!karaokeLayer) {
			// 极低内存等位图创建失败时，至少保留可读的普通歌词，不留下空列。
			for (let i = 0; i < visibleGlyphs.length; i++) {
				const glyphY = startY + i * cellHeight;
				const glyphOffsetX = this.getVerticalGlyphOffsetX(visibleGlyphs[i], columnWidth, currentFont);
				const alpha = Math.round(255 * Clamp(columnOpacity, 0, 1));
				if (alpha > 0) {
					gr.DrawString(visibleGlyphs[i], font, RGBtoRGBA(normalColor, alpha),
						columnX + glyphOffsetX, glyphY, columnWidth, cellHeight, this.alignCenter);
				}
			}
			return;
		}

		// Fix8：整列最终颜色只作为一张已遮罩位图绘制一次；换列强度已预混入色场，
		// 这里只应用列边缘透明度，不再把高亮抗锯齿边缘叠到普通白字边缘之上。
		const layerAlpha = Math.round(255 * Clamp(columnOpacity, 0, 1));
		gr.DrawImage(karaokeLayer, columnX, startY, columnWidth, bitmapHeight,
			0, 0, bitmapWidth, bitmapHeight, 0, layerAlpha);

		// Stage 8E：纵排流光沿 Y 轴复用同一套钟形包络，只作用于当前播放句列。
		this.drawKaraokeShineVertical(
			gr,
			visibleGlyphs,
			font,
			columnX,
			columnWidth,
			cellHeight,
			startY,
			bitmapWidth,
			bitmapHeight,
			clipHeight,
			safeHighlight,
			normalColor,
			layerAlpha,
			isCurrentColumn,
			currentFont
		);

		// Stage 8F：单字强调绘制在流光之后，使它成为该字符的视觉焦点。
		// 强调画在句列内部，因此自动继承整列变换，也不会被列图层裁剪。
		this.drawVerticalKaraokeEmphasis(
			gr,
			column,
			visibleGlyphs,
			font,
			columnX,
			columnWidth,
			cellHeight,
			startY,
			emphasisIndex,
			emphasisUnits,
			emphasisMode,
			gradient.start,
			gradient.end,
			normalColor,
			columnOpacity,
			currentFont
		);
	}

	/**
	 * Stage 8A R2 Fix9：把 Stage 6 已冻结的整行跳动与一次性呼吸缩放接入纵排列。
	 * 只有 transform 非中性时才创建完整列图层；文字、阴影、普通／高亮互斥色场
	 * 一起接受同一几何变换。稳定列继续直接绘制，不增加常态位图开销。
	 * @param {GdiGraphics} gr - 目标画布。
	 * @param {object} column - 合并后的歌词句列。
	 * @param {number} columnX - 句列左坐标。
	 * @param {number} columnWidth - 句列宽度。
	 * @param {number} cellHeight - 单字符格高度。
	 * @param {number} highlightStrength - 高亮交接强度。
	 * @param {number} columnOpacity - 面板边缘可见度。
	 * @param {boolean} isCurrentColumn - 是否为当前句列。
	 * @param {number} normalColor - 常规歌词色。
	 * @param {number} highlightColor - 主题高亮色。
	 * @param {number} shadowColor - 投影色。
	 */
	drawVerticalChineseColumn(gr, column, columnX, columnWidth, cellHeight, highlightStrength, columnOpacity,
		isCurrentColumn, normalColor, highlightColor, shadowColor, fontOverride = null) {
		// Stage 8F-R4：单字强调开启时抑制本列的「上浮 + 放大 + 呼吸脉冲」，只留单字毛笔强调作为焦点。
		const transform = this.getLineAnimationTransform(column, this.isKaraokeEmphasisActive());
		const scale = Math.max(0.01, transform.scale);
		const opacity = Clamp(transform.opacity, 0, 1);
		const offsetY = transform.offsetY;
		const neutral = Math.abs(scale - 1) < 0.0001 && Math.abs(opacity - 1) < 0.0001 && Math.abs(offsetY) < 0.01;

		if (neutral) {
			this.drawVerticalChineseColumnCore(gr, column, columnX, columnWidth, cellHeight, highlightStrength,
				columnOpacity, isCurrentColumn, normalColor, highlightColor, shadowColor, null, fontOverride);
			return;
		}

		const glyphs = this.getVerticalDisplayGlyphs(column.content);
		if (!glyphs.length) return;
		const screenStartY = this.y + SCALE(8);
		const availableHeight = Math.max(1, this.h - SCALE(16));
		const visibleCount = Math.min(glyphs.length, Math.max(1, Math.floor(availableHeight / cellHeight)));
		const contentHeight = Math.max(1, Math.ceil(visibleCount * cellHeight));
		const pad = Math.max(SCALE(16), Math.ceil(columnWidth * 0.35));
		const layerWidth = Math.max(1, Math.ceil(columnWidth + pad * 2));
		const layerHeight = Math.max(1, Math.ceil(contentHeight + pad * 2));
		const localStartY = pad;
		const columnLayer = GDI(layerWidth, layerHeight, true, g => {
			this.drawVerticalChineseColumnCore(g, column, pad, columnWidth, cellHeight, highlightStrength,
				columnOpacity, isCurrentColumn, normalColor, highlightColor, shadowColor, localStartY, fontOverride);
		});

		if (!columnLayer) {
			this.drawVerticalChineseColumnCore(gr, column, columnX, columnWidth, cellHeight, highlightStrength,
				columnOpacity * opacity, isCurrentColumn, normalColor, highlightColor, shadowColor, null, fontOverride);
			return;
		}

		const pivotX = columnX + columnWidth * 0.5;
		const pivotY = screenStartY + contentHeight * 0.5;
		const sourcePivotX = pad + columnWidth * 0.5;
		const sourcePivotY = pad + contentHeight * 0.5;
		const destX = pivotX - sourcePivotX * scale;
		const destY = pivotY - sourcePivotY * scale + offsetY;
		const alpha = Math.round(opacity * 255);
		gr.DrawImage(columnLayer, destX, destY, layerWidth * scale, layerHeight * scale,
			0, 0, layerWidth, layerHeight, 0, alpha);
	}

	/**
	 * Stage 8A R2：把已有 Stage 6 行动画时间轴转换为克制的“卷轴式换列”。
	 * 正常相邻换句时，所有句列从旧位置连续滑到新位置；Seek／切歌等非相邻跳转
	 * 已由 Stage 6 状态重建直接稳定，不跨越多列播放动画。
	 * @param {Array<object>} columns - 当前纵排句列。
	 * @param {number} currentIndex - 当前句列索引。
	 * @param {number} columnPitch - 一个完整列距。
	 * @returns {{offsetX:number,progress:number,fromIndex:number,toIndex:number}} 横移与新旧列交接状态。
	 */
	getVerticalColumnTransition(columns, currentIndex, columnPitch) {
		const settled = { offsetX: 0, progress: 1, fromIndex: -1, toIndex: currentIndex };
		if (!this.lineAnimationActive) return settled;

		const fromIndex = columns.findIndex(column => column.sentenceGroup === this.lineAnimationFromGroup);
		const toIndex = columns.findIndex(column => column.sentenceGroup === this.lineAnimationToGroup);
		const distance = toIndex - fromIndex;
		if (fromIndex < 0 || toIndex !== currentIndex || Math.abs(distance) !== 1) return settled;

		// 纵排换列固定在最多 420 ms 内完成；仍由原 16 ms 歌词计时器推进，不新增定时器。
		const duration = Math.max(1, Math.min(420, this.lineAnimationDuration));
		const linear = Clamp(this.lineAnimationElapsed / duration, 0, 1);
		const progress = Clamp(Easing('smootherStep', linear), 0, 1);
		return {
			offsetX: -distance * columnPitch * (1 - progress),
			progress,
			fromIndex,
			toIndex
		};
	}

	/**
	 * 按共用遮罩设置对左右两侧句列渐隐，并保留进出面板时的边缘淡入淡出。
	 * 透明度按整列中心计算，与列内字高无关，不额外降低相邻歌词透明度。
	 * @param {number} columnX - 当前句列左坐标。
	 * @param {number} columnWidth - 当前句列宽度。
	 * @param {number} columnPitch - 列距。
	 * @returns {number} 0–1 边缘可见度。
	 */
	getVerticalColumnEdgeOpacity(columnX, columnWidth, columnPitch) {
		const fadeWidth = Math.max(1, columnPitch * 0.75);
		const left = Clamp((columnX + columnWidth - this.x) / fadeWidth, 0, 1);
		const right = Clamp((this.x + this.w - columnX) / fadeWidth, 0, 1);
		// FIX35：在屏幕坐标中采样整列中心，动画离屏图层也复用同一透明度。
		return Math.min(left, right) * this.calcTransparentMaskAlphaAt(
			columnX + columnWidth * 0.5, this.x, this.x + this.w);
	}

	/**
	 * Stage 8F-R3：解析当前应当成为“播放焦点”的句列下标。
	 * 当前句可能不成列（纯拉丁行不成列）。此时沿用当前时刻之前最后一个已成列的句子，
	 * 而不是返回 -1 —— 后者会让整段拟声副歌期间歌词面板完全空白。
	 * 被沿用的那一列此时已经唱完，因此不会有扫亮、流光或单字强调。
	 * 单独提取为方法，是为了让这段回退逻辑可被门禁直接断言，而不是埋在总绘制入口里。
	 * @param {Array<object>} columns - 已成列的句列。
	 * @param {?number} sentenceGroup - 当前播放句的 sentenceGroup。
	 * @returns {number} 句列下标，或 -1（没有任何可用的历史句列）。
	 */
	getVerticalCurrentColumnIndex(columns, sentenceGroup) {
		if (!Array.isArray(columns) || !columns.length) return -1;

		const exact = columns.findIndex(column => column.sentenceGroup === sentenceGroup);
		if (exact >= 0) return exact;

		const now = this.playbackTime();
		for (let i = columns.length - 1; i >= 0; i--) {
			if (columns[i].timestamp <= now) return i;
		}
		return -1;
	}

	/**
	 * Stage 8A R2 中文传统纵排总绘制入口：字从上到下，时间顺序的句列从右向左。
	 * 当前句置于面板水平中心略偏右，已唱句位于右侧、待唱句位于左侧。
	 * 歌词页与详情页共用各自已经计算好的面板边界。
	 * @param {GdiGraphics} gr - 目标画布。
	 */
	drawVerticalChineseLyrics(gr) {
		const columns = this.getVerticalChineseColumns();
		const currentSentenceGroup = this.lyrics[this.locus]?.sentenceGroup;
		const currentIndex = this.getVerticalCurrentColumnIndex(columns, currentSentenceGroup);
		if (!columns.length || currentIndex < 0) return;

		const wrapMode = this.getVerticalLongLineMode();
		const baseSize = Number.isFinite(this.font.lyrics_h) ? this.font.lyrics_h : this.lineHeight;
		let columnPitch = Math.max(SCALE(42), this.lineHeight * 1.18);
		let columnWidth = Math.max(SCALE(32), columnPitch * 0.82);
		let cellHeight = Math.max(baseSize * 1.08, this.lineHeight * 0.88);
		let fontOverride = null;

		// Stage 8F-R9-P0：auto-shrink 模式不换列，而是按最长一句把整版字号等比缩小，
		// 保证任意长句都能在一列内完整显示而不被截断；列距与列宽同步收窄以保持版式比例。
		// 缩放只由静态歌词结构（最长句字数）决定，与播放进度无关，因此不会逐帧抖动。
		if (wrapMode === 'auto-shrink') {
			const availableHeight = Math.max(1, this.h - SCALE(16));
			let maxGlyphsAll = 1;
			for (const column of columns) {
				const glyphCount = this.getVerticalDisplayGlyphs(column.content).length;
				if (glyphCount > maxGlyphsAll) maxGlyphsAll = glyphCount;
			}
			const fitFontPx = Clamp(availableHeight / maxGlyphsAll / 1.08, 6, baseSize);
			const shrink = fitFontPx / baseSize;
			cellHeight = fitFontPx * 1.08;
			columnPitch *= shrink;
			columnWidth *= shrink;
			fontOverride = this._getVerticalFitFont(fitFontPx);
		}

		const currentCenterX = this.x + this.w * 0.58;
		const normalColor = grCol.lyricsNormal;
		const highlightColor = this.stableLyricsHighlightColor ?? grCol.lyricsNormal;
		const transition = this.getVerticalColumnTransition(columns, currentIndex, columnPitch);

		for (let i = 0; i < columns.length; i++) {
			const columnX = currentCenterX - (i - currentIndex) * columnPitch - columnWidth * 0.5 + transition.offsetX;
			// The lyric panel has no GDI clip region; omit partial columns at either edge.
			if (columnX < this.x || columnX + columnWidth > this.x + this.w) continue;
			// Stage 8F-R9：一句可能被拆成多列段；高亮/过渡按句子聚合，而不是按下标。
			const toGroup = transition.toIndex >= 0 ? columns[transition.toIndex].sentenceGroup : -1;
			const fromGroup = transition.fromIndex >= 0 ? columns[transition.fromIndex].sentenceGroup : -1;
			const colGroup = columns[i].sentenceGroup;
			const highlightStrength = colGroup === toGroup
				? transition.progress
				: colGroup === fromGroup ? 1 - transition.progress : 0;
			const columnOpacity = this.getVerticalColumnEdgeOpacity(columnX, columnWidth, columnPitch);
			if (this.longGapPromptRects && columnOpacity > 1 / 255) {
				const count = Math.min(this.getVerticalDisplayGlyphs(columns[i].content).length,
					Math.max(1, Math.floor((this.h - SCALE(16)) / cellHeight)));
				this.longGapPromptRects.push({ x: columnX, y: this.y + SCALE(8), w: columnWidth, h: count * cellHeight });
			}
			this.drawVerticalChineseColumn(
				gr,
				columns[i],
				columnX,
				columnWidth,
				cellHeight,
				highlightStrength,
				columnOpacity,
				colGroup === currentSentenceGroup,
				normalColor,
				highlightColor,
				grCol.lyricsShadow,
				fontOverride
			);
		}

		this.drawLyricsOffset(gr);
		this.drawLongGapPrompt(gr);
	}

	/**
	 * PRE42：详情页 CD 弧形滚动歌词。
	 *
	 * 每一行歌词仍保持水平排版，但其左边缘沿唱片右侧外轮廓形成半圆轨道。
	 * 同一句的原文、折行和译文组成一个平行文字块；句间使用独立的播放时钟缓动。
	 * 普通详情页的歌词可以从唱片公司 Logo 下方穿过；纯沉浸模式不绘制 Logo。
	 * 继续复用现有 Karaoke 扫亮；带逐字时间的当前原文沿用星星跳动设置。
	 * @param {GdiGraphics} gr - GDI图形对象。
	 * @param {number} lyricsNormalColor - 常规歌词颜色。
	 * @param {number} lyricsHighlightColor - 当前句高亮颜色。
	 * @param {number} lyricsShadowColor - 投影颜色。
	 */

	getCircularArcSpacing(style = this.getCircularArcStyle()) {
		const choices = style === 'tilted' ? [95, 100, 110] : [95, 100, 105];
		const value = Number(style === 'tilted' ? grSet.detailsArcLyricsTiltedSpacing : grSet.detailsArcLyricsSpacing);
		return choices.reduce((best, next) => Math.abs(next - value) < Math.abs(best - value) ? next : best, 100);
	}

	/** A source sentence owns one monotonic arc movement, independent of cover scroll. */
	getArcFocusPosition(lines, currentIndex) {
		const now = this.playbackTime();
		const lyric = lines[currentIndex];
		const key = `${lyric.sentenceGroup}|${lyric.timestamp}`;
		let state = this.arcFocusState;
		if (!state || now < state.lastTime - 100 || now - state.lastTime > 1500) {
			this.arcFocusState = { key, from: currentIndex, to: currentIndex, start: now, lastTime: now, duration: 0 };
			return currentIndex;
		}
		const position = () => {
			const t = state.duration > 0 ? Clamp((now - state.start) / state.duration, 0, 1) : 1;
			return state.from + (state.to - state.from) * t * t * (3 - 2 * t);
		};
		if (state.key !== key) {
			const from = position();
			const next = lines.find(line => line.timestamp > lyric.timestamp);
			const span = next ? Math.max(1, next.timestamp - lyric.timestamp) : 2000;
			const duration = Math.min(420, span * 0.45);
			state = this.arcFocusState = { key, from, to: currentIndex, start: now, lastTime: now, duration };
		} else if (state.to !== currentIndex) {
			// Translation visibility may renumber rows without starting a new sentence.
			const shift = currentIndex - state.to;
			state.from += shift;
			state.to = currentIndex;
		}
		state.lastTime = now;
		return position();
	}

	getCircularArcStyle() {
		return window.GetProperty('TT - 圆周歌词 PRE3: 文字样式', 'horizontal') === 'tilted' ? 'tilted' : 'horizontal';
	}

	drawCircularArcText(gr, lyric, lineY, normal, highlight, shadow, opacity, font, maskY = lineY) {
		// Colour the complete line before applying one glyph mask. A second transparent
		// highlight over normal text would leave the base colour in antialiased glyph edges.
		const alpha = Math.round(Clamp(opacity, 0, 1) * 255);
		if (alpha === 0) return;
		const normalTextColor = RGBtoRGBA(normal, alpha);
		const textY = Math.round(lineY - this.lineHeight * 0.1);
		const textH = Math.max(1, Math.ceil(this.lineHeight * 1.2));
		this.drawLyricsShadow(gr, lyric.content, font, lineY, alpha, shadow);
		if (!lyric.highlight || !this.canDrawKaraoke(lyric) || this.trackThemeColorGateActive) {
			// Match TT's ordinary line contract even without timed Karaoke (including Off).
			// A highlighted plain/translation row must use the lyric highlight, not the unsung colour.
			let lineColor = normalTextColor;
			if (lyric.highlight && !this.trackThemeColorGateActive) {
				lineColor = RGBtoRGBA(highlight, alpha);
				const theme = String(grSet.theme).toLowerCase();
				const preserveHighlight = theme.startsWith('custom') || theme === 'reborn' || theme === 'black';
				if (grSet.lyricsKaraokeMode !== 'off' && !preserveHighlight) {
					const runtimeHighlight = this.getKaraokeThemeHighlightColor(theme, lineColor, lineColor, false);
					lineColor = theme === 'cream' && Number.isFinite(grCol.progressBarFill)
						? runtimeHighlight : this.ensureKaraokeContrast(runtimeHighlight, normalTextColor, 2.6);
				}
			}
			gr.DrawString(lyric.content, font, lineColor, this.x, textY, this.w + 1, textH, this.alignCenter);
			return;
		}
		const progress = this.getKaraokeProgress(gr, lyric, font);
		if (progress.width <= 0) {
			gr.DrawString(lyric.content, font, normalTextColor, this.x, textY, this.w + 1, textH, this.alignCenter);
			return;
		}
		const activeTheme = String(grSet.theme).toLowerCase();
		const style = this.getKaraokeStyle();
		// Theme supplies the unsung colour; mask grayscale stays independent of the palette.
		const opaqueNormal = RGBtoRGBA(normal, 255);
		const rawHighlight = this.getKaraokeThemeHighlightColor(activeTheme, highlight, opaqueNormal, true);
		const preserveRuntimeHighlight = activeTheme.startsWith('custom') ||
			activeTheme === 'reborn' || activeTheme === 'black' || activeTheme === 'cream';
		const baseHighlight = style !== 'solid' || preserveRuntimeHighlight
			? rawHighlight : this.ensureKaraokeContrast(rawHighlight, opaqueNormal, 2.6);
		const endingSettle = this.getKaraokeEndingSettle(lyric);
		const displayHighlight = endingSettle > 0
			? this.mixKaraokeColor(baseHighlight, RGB(0, 0, 0), this.karaokeEndingSettleDepth * endingSettle, opaqueNormal)
			: baseHighlight;
		const depth = activeTheme === 'white' && String(grSet.seekbar).toLowerCase() === 'waveformbar'
			? 0.06 : style === 'duotone' ? 0.22 : 0.14;
		const colors = style === 'solid'
			? { start: displayHighlight, end: displayHighlight }
			: activeTheme === 'random' || activeTheme === 'reborn'
				? this.getKaraokeDynamicGradientColors(displayHighlight, depth, opaqueNormal)
				: this.getKaraokeGradientColors(displayHighlight, opaqueNormal, depth, opaqueNormal);
		const width = Math.max(1, Math.ceil(this.x + this.w + 2));
		const fullySwept = progress.totalWidth > 0 && progress.width >= progress.totalWidth - 0.5;
		const right = fullySwept ? width : Clamp(Math.ceil(progress.textX + progress.width), 0, width);
		const gradientLeft = Clamp(Math.floor(progress.textX), 0, width);
		const gradientWidth = Math.max(1, progress.totalWidth);
		// Opaque colour fields overwrite each other; opacity is applied only at the
		// final draw. The unsung theme field never sits beneath the sung glyphs.
		const bitmap = GDI(width, textH, true, g => {
			g.FillSolidRect(0, 0, width, textH, colors.start);
			if (style !== 'solid') {
				g.FillGradRect(gradientLeft, 0, gradientWidth, textH, 0, colors.start, colors.end, 1);
				const gradientRight = Math.min(width, Math.ceil(gradientLeft + gradientWidth));
				if (gradientRight < width) g.FillSolidRect(gradientRight, 0, width - gradientRight, textH, colors.end);
			}
			if (right < width) g.FillSolidRect(right, 0, width - right, textH, opaqueNormal);
		});
		const mask = bitmap && GDI(width, textH, true, g => {
			g.FillSolidRect(0, 0, width, textH, RGB(255, 255, 255));
			g.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
			g.DrawString(lyric.content, font, RGB(0, 0, 0), this.x, 0, this.w + 1, textH, this.alignCenter);
		});
		if (!bitmap || !mask) {
			gr.DrawString(lyric.content, font, normalTextColor, this.x, textY, this.w + 1, textH, this.alignCenter);
			return;
		}
		bitmap.ApplyMask(mask);
		gr.DrawImage(bitmap, 0, textY, width, textH, 0, 0, width, textH, 0, alpha);
	}

	/** Rasterize the complete sentence before rotation: every baseline shares one transform. */
	drawCircularArcSentence(gr, rows, font, lineX, lineY, lineW, angle, normal, highlight, shadow) {
		if (!rows.length) return;
		const old = { x: this.x, w: this.w, alignCenter: this.alignCenter };
		const pad = SCALE(12);
		const minOffset = Math.min(...rows.map(row => row.offset));
		const maxOffset = Math.max(...rows.map(row => row.offset));
		const minShift = Math.min(0, ...rows.map(row => row.shiftX || 0));
		const maxShift = Math.max(0, ...rows.map(row => row.shiftX || 0));
		const width = Math.max(1, Math.ceil(lineW + maxShift - minShift + pad * 2));
		const height = Math.max(1, Math.ceil(maxOffset - minOffset + this.lineHeight * 1.2 + pad * 2));
		const anchorX = pad - minShift;
		const anchorY = pad + this.lineHeight * 0.6 - minOffset;
		const dynamic = rows.some(row => row.lyric.highlight);
		const key = dynamic ? null : `${font.Name}|${font.Size}|${font.Style}|${lineW}|${this.lineHeight}|${normal}|${highlight}|${shadow}|${this.shadowEffect}|${this.dropShadowLevel}|${rows.map(row =>
			`${row.lyric.content}:${row.offset}:${row.shiftX || 0}:${Math.round(row.opacity * 255)}`).join('\n')}`;
		if (!this.circularArcSentenceCache) this.circularArcSentenceCache = new Map();
		let bitmap = key ? this.circularArcSentenceCache.get(key) : null;
		try {
			this.x = pad;
			this.w = lineW;
			this.alignCenter = StringFormat(0, 1);
			if (!bitmap) {
				bitmap = GDI(width, height, true, g => {
					g.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
					for (const row of rows) {
						const localY = anchorY + row.offset - this.lineHeight * 0.5;
						this.x = anchorX + (row.shiftX || 0);
						this.drawCircularArcText(g, row.lyric, localY, normal, highlight, shadow, row.opacity, font);
					}
				});
				if (key && bitmap) {
					if (this.circularArcSentenceCache.size >= 32) this.circularArcSentenceCache.delete(this.circularArcSentenceCache.keys().next().value);
					this.circularArcSentenceCache.set(key, bitmap);
				}
			}
		} finally { Object.assign(this, old); }
		if (!bitmap) return;
		const radians = angle * Math.PI / 180;
		const vx = width * 0.5 - anchorX, vy = height * 0.5 - anchorY;
		const centerX = lineX + vx * Math.cos(radians) - vy * Math.sin(radians);
		const centerY = lineY + this.lineHeight * 0.5 + vx * Math.sin(radians) + vy * Math.cos(radians);
		gr.SetInterpolationMode(7);
		try { gr.DrawImage(bitmap, centerX - width / 2, centerY - height / 2, width, height, 0, 0, width, height, angle, 255); }
		finally { gr.SetInterpolationMode(0); }
	}

	/** Two fixed row slots, with a playback-clock fade at each continuation. */
	getArcContinuation(rows, timestamp, end, now) {
		if (rows.length <= 2) return { start: 0, opacity: 1 };
		const duration = Math.max(1, end - timestamp);
		const timed = rows.some(row => row.karaoke?.length);
		const starts = rows.map((row, index) => {
			const start = row.karaoke?.[0]?.start;
			return timed && Number.isFinite(start) ? start : timestamp + duration * index / rows.length;
		});
		let active = 0;
		for (let index = 1; index < starts.length; index++) {
			if (now >= starts[index]) active = index;
		}
		// First two rows stay together; each later row enters the same two slots.
		const start = Math.min(Math.max(0, active - 1), rows.length - 2);
		const entered = start > 0 ? starts[start + 1] : -Infinity;
		const next = start < rows.length - 2 ? starts[start + 2] : Infinity;
		const prior = start > 0 ? starts[start] : timestamp;
		const after = start + 2 < starts.length ? starts[start + 2] : end;
		const fadeIn = Math.max(1, Math.min(160, (after - entered) * 0.25));
		const fadeOut = Math.max(1, Math.min(160, (next - Math.max(timestamp, prior)) * 0.25));
		const ramp = Math.min(Clamp((now - entered) / fadeIn, 0, 1), Clamp((next - now) / fadeOut, 0, 1));
		return { start, opacity: ramp * ramp * (3 - 2 * ramp) };
	}

	/** Cache source wrapping once at a stable rail width, never at a changing angle. */
	getArcSentenceBlocks(lines, font, width) {
		const key = `${font.Name}|${font.Size}|${font.Style}|${width}|${lines.map(line =>
			`${line.sentenceGroup}:${line.timestamp}:${line.isOriginalTranslation}:${line.content}`).join('\n')}`;
		if (this.arcSentenceLayout?.key === key) {
			// Highlight belongs to the playback clock, not to the wrap cache.
			for (const block of this.arcSentenceLayout.blocks) {
				for (const entry of block.entries) entry.lyric = lines[entry.index];
			}
			return this.arcSentenceLayout.blocks;
		}
		const blocks = [];
		for (let index = 0; index < lines.length; index++) {
			const lyric = lines[index];
			let block = blocks[blocks.length - 1];
			if (!block || block.sentenceGroup !== lyric.sentenceGroup) {
				block = { sentenceGroup: lyric.sentenceGroup, timestamp: lyric.timestamp, entries: [], rowCount: 0 };
				blocks.push(block);
			}
			let wrapped = [];
			GDI(1, 1, false, g => { wrapped = g.EstimateLineWrap(lyric.content, font, width); });
			const rows = [];
			let searchStart = 0;
			for (let j = 0; j < wrapped.length; j += 2) {
				const content = String(wrapped[j] || '').trim();
				if (!content) continue;
				const mapped = this.mapKaraokeToWrappedLine(lyric.content, lyric.karaoke, content, searchStart);
				searchStart = mapped.nextSearchStart;
				rows.push({ ...lyric, content, karaoke: mapped.karaoke, karaokeSourceContent: content });
			}
			if (!rows.length) rows.push({ ...lyric });
			block.entries.push({ index, lyric, rows, rowOffset: block.rowCount });
			block.rowCount += Math.min(2, rows.length);
		}
		this.arcSentenceLayout = { key, blocks };
		return blocks;
	}

	/** Only sentence boundaries receive extra spacing; all rows inside a sentence are contiguous. */
	getArcSentencePositions(blocks, rowPitch, sentenceGap, scales = []) {
		const positions = [0];
		for (let i = 1; i < blocks.length; i++) {
			positions.push(positions[i - 1] +
				(blocks[i - 1].rowCount * (scales[i - 1] ?? 1) + blocks[i].rowCount * (scales[i] ?? 1)) * rowPitch * 0.5 + sentenceGap);
		}
		return positions;
	}

	/** A gentle focus enlargement, shared by the source and all its translations. */
	getArcFocusScale(distance) {
		const t = Clamp(1 - Math.abs(distance), 0, 1);
		return 1 + 0.28 * t * t * (3 - 2 * t);
	}

	getArcFocusFont(base, scale) {
		if (scale <= 1.001) return base;
		const size = Math.round(base.Size * scale * 4) / 4;
		const key = `${base.Name}|${size}|${base.Style}`;
		if (!this.arcFocusFontCache) this.arcFocusFontCache = new Map();
		let font = this.arcFocusFontCache.get(key);
		if (!font) {
			font = gdi.Font(base.Name, size, base.Style);
			if (this.arcFocusFontCache.size >= 32) this.arcFocusFontCache.delete(this.arcFocusFontCache.keys().next().value);
			this.arcFocusFontCache.set(key, font);
		}
		return font;
	}

	/** Parallel baselines use a common angle and displacement along its normal. */
	getArcRowAnchor(x, y, theta, offset) {
		return { x: x - Math.sin(theta) * offset, y: y + Math.cos(theta) * offset };
	}

	/** Keep the complete glyph/shadow rectangle outside the padded disc circle. */
	getArcSafeRowX(cx, cy, radius, x, y, height, width, angle) {
		const bearing = SCALE(3) + (this.shadowEffect ? Math.max(1, this.dropShadowLevel) : 0);
		const half = height * 0.6 + bearing;
		const baseline = y + height * 0.5;
		if (Math.abs(angle) < 0.000001) {
			const nearestY = Math.max(0, Math.abs(baseline - cy) - half);
			return Math.max(x, cx + Math.sqrt(Math.max(0, radius * radius - nearestY * nearestY)) + bearing);
		}
		const cos = Math.cos(angle), sin = Math.sin(angle);
		const clear = left => {
			const dx = cx - left, dy = cy - baseline;
			const u = dx * cos + dy * sin, v = -dx * sin + dy * cos;
			const du = u - Clamp(u, -bearing, width + bearing);
			const dv = v - Clamp(v, -half, half);
			return du * du + dv * dv >= radius * radius;
		};
		if (clear(x)) return x;
		let lo = x, hi = Math.max(x, cx + radius + half + bearing);
		for (let i = 0; i < 20; i++) { const mid = (lo + hi) * 0.5; if (clear(mid)) hi = mid; else lo = mid; }
		return hi;
	}

	drawArcScrollLyrics(gr, lyricsNormalColor, lyricsHighlightColor, lyricsShadowColor) {
		const details = grm.details;
		const turntable = !!details?.isTurntableActive();
		const lyricBounds = turntable ? details.getTurntableLyricsBounds() : null;
		if (turntable && !lyricBounds) return false;
		const geometry = turntable ? details.getTurntableGeometry() : null;
		const disc = turntable ? { x: geometry.x + geometry.dx, y: geometry.y + geometry.dy, w: geometry.d, h: geometry.d } : details?.discArtSize;
		if (!disc || (!turntable && (!grSet.displayDiscArt || !details.discArt)) || disc.w <= 0 || disc.h <= 0) return false;

		const currentLyric = this.lyrics[this.locus];
		if (!currentLyric) return false;
		const currentSentenceGroup = currentLyric.sentenceGroup;

		// The shared parser has already wrapped some songs to the cover's width.
		// Restore each source sentence before the two-slot continuation. Keep the
		// source timestamp and mapped word timing independent of cover-width wrapping.
		const lines = [];
		for (const lyric of this.lyrics) {
			if (!lyric?.content) continue;
			if (lyric.isOriginalTranslation === false && !grSet.lyricsTranslation) continue;
			if (lyric.isOriginalTranslation === false && grSet.lyricsTranslationCurrentOnly &&
				lyric.sentenceGroup !== currentSentenceGroup) continue;
			const previous = lines[lines.length - 1];
			if (previous && lyric.arcSourceContent && previous.wrapGroup === lyric.wrapGroup &&
				previous.sentenceGroup === lyric.sentenceGroup) continue;
			lines.push(lyric.arcSourceContent
				? { ...lyric, timestamp: lyric.arcSourceTimestamp ?? lyric.timestamp, content: lyric.arcSourceContent, karaoke: lyric.arcSourceKaraoke || lyric.karaoke }
				: lyric);
		}
		if (!lines.length) return false;

		const cx = disc.x + disc.w * 0.5;
		const cy = disc.y + disc.h * 0.5;
		const radius = Math.max(SCALE(40), Math.min(disc.w, disc.h) * 0.5 + SCALE(28));
		let topY = Math.max(grm.ui.topMenuHeight + SCALE(16), cy - radius * 0.94);
		let bottomY = Math.min(grm.ui.wh - grm.ui.lowerBarHeight - SCALE(16), cy + radius * 0.94);
		// Keep the full lower rail: lyrics fade through the label area without detouring.
		if (turntable) { topY = Math.max(topY, lyricBounds.y); bottomY = Math.min(bottomY, lyricBounds.y + lyricBounds.h); }
		if (bottomY <= topY + this.lineHeight * 2) return false;

		const tiltedStyle = this.getCircularArcStyle() === 'tilted';
		const spacing = this.getCircularArcSpacing(tiltedStyle ? 'tilted' : 'horizontal');
		const upperAngle = Math.asin(Clamp((cy - topY) / radius, 0, 0.94));
		const lowerAngle = Math.asin(Clamp((bottomY - cy) / radius, 0, 0.94));
		const baseFont = grFont.lyrics;
		if (!baseFont) return false;
		// A constant width prevents changing wrap counts from twisting a two-row sentence.
		const glyphHeight = Math.ceil(gr.CalcTextHeight('Ag国한글', baseFont));
		const rowPitch = Math.max(glyphHeight, baseFont.Size * 1.4) + SCALE(2);
		const rightEdge = grm.ui.ww - SCALE(18);
		const availableLineW = Math.floor(rightEdge - cx - Math.hypot(radius, rowPitch * 2) - SCALE(10));
		// Width allocation sizes artwork; wrapping uses the actual safe rail-to-window space.
		const lineW = availableLineW;
		if (lineW < SCALE(100)) return false;
		// Fit at the largest focus font once; rotation and focus never rewrap a sentence.
		const wrapFont = tiltedStyle ? this.getArcFocusFont(baseFont, 1.28) : baseFont;
		const blocks = this.getArcSentenceBlocks(lines, wrapFont, lineW);
		const currentIndex = blocks.findIndex(block => block.sentenceGroup === currentSentenceGroup);
		if (currentIndex < 0) return false;
		const focusPosition = this.getArcFocusPosition(blocks, currentIndex);
		// Sentence spacing follows glyph height, never the enlarged disc radius.
		// FIX12: keep a small boundary gap without adding air inside bilingual blocks.
		const gapFactor = spacing < 100 ? 0.25 : spacing > 100 ? 0.6 : 0.4;
		// FIX39：倾斜句的横向长度也占据纵向空间，句间留出旋转包络。
		const sentenceGap = Math.max(SCALE(4), rowPitch * gapFactor) +
			(tiltedStyle ? lineW * Math.sin(5 * Math.PI / 180) : 0);
		const focusScales = blocks.map((block, index) => tiltedStyle ? this.getArcFocusScale(index - focusPosition) : 1);
		const positions = this.getArcSentencePositions(blocks, rowPitch, sentenceGap, focusScales);
		const focusIndex = Math.floor(Clamp(focusPosition, 0, blocks.length - 1));
		const focusDistance = positions[focusIndex] +
			((positions[focusIndex + 1] ?? positions[focusIndex]) - positions[focusIndex]) * (focusPosition - focusIndex);
		const oldGeometry = { x: this.x, y: this.y, w: this.w, h: this.h, top: this.top, bot: this.bot, alignCenter: this.alignCenter, circularArcLeftAlign: this.circularArcLeftAlign, lineHeight: this.lineHeight };
		this.circularArcLeftAlign = true;
		this.alignCenter = StringFormat(0, 1);
		this.top = topY - this.lineHeight;
		this.bot = bottomY + this.lineHeight;
		const now = this.playbackTime();
		try {
			for (let i = Math.max(0, currentIndex - 12); i <= Math.min(blocks.length - 1, currentIndex + 12); i++) {
				const block = blocks[i];
				// 句列距离作为实际 Y 距离，反解弧线角度；不可再次经过 sin 压缩行距。
				const offsetY = positions[i] - focusDistance;
				if (offsetY < -radius * Math.sin(upperAngle) || offsetY > radius * Math.sin(lowerAngle)) continue;
				const theta = Math.asin(Clamp(offsetY / radius, -0.94, 0.94));
				// Keep neighboring sentences closer to horizontal, as in the reference.
				const focusScale = focusScales[i];
				// The block center lies between source and translation, so theta is zero
				// at focus even while the original occupies the upper arc rows.
				// Sample the center of the original rows for a single shared sentence angle.
				const originalRows = block.entries.reduce((count, entry) => count +
					(entry.lyric.isOriginalTranslation === false ? 0 : Math.min(2, entry.rows.length)), 0);
				const originalOffset = (originalRows - block.rowCount) * rowPitch * focusScale * 0.5;
				const angleTheta = theta + originalOffset / radius;
				const maxTilt = 5 * Math.PI / 180;
				const rowAngle = tiltedStyle ? maxTilt * Math.tanh(angleTheta * 0.6 / maxTilt) : 0;
				const tilt = rowAngle * 180 / Math.PI;
				const sentenceFont = this.getArcFocusFont(baseFont, focusScale);
				this.lineHeight = Math.max(oldGeometry.lineHeight, glyphHeight / 1.2) * focusScale;
				let centerX = cx + radius * Math.cos(theta);
				const centerY = cy + offsetY - this.lineHeight * 0.5;
				const sentenceRows = [];
				const stars = [];
				for (const entry of block.entries) {
					const lyric = entry.lyric;
					const lastEnd = entry.rows[entry.rows.length - 1].karaoke?.slice(-1)[0]?.end;
					const end = blocks[i + 1]?.timestamp ?? (Number.isFinite(lastEnd) ? lastEnd : lyric.timestamp + 4000);
					const continuation = this.getArcContinuation(entry.rows, lyric.timestamp, end, now);
					const visibleRows = entry.rows.slice(continuation.start, continuation.start + 2);
					const rowOpacity = continuation.opacity;
					let starRow = 0;
					for (let j = 0; j < visibleRows.length; j++) {
						if (Number.isFinite(visibleRows[j].karaoke?.[0]?.start) && now >= visibleRows[j].karaoke[0].start) starRow = j;
					}
					for (let j = 0; j < visibleRows.length; j++) {
						const offset = (entry.rowOffset + j - (block.rowCount - 1) * 0.5) * rowPitch * focusScale;
						const anchor = this.getArcRowAnchor(centerX, centerY, rowAngle, offset);
						// Same angle for the entire sentence, including translation and continuation rows.
						this.x = anchor.x;
						this.w = lineW;
						this.y = topY;
						this.h = bottomY - topY;
						if (anchor.y < topY || anchor.y + this.lineHeight > bottomY) continue;
						const row = { ...visibleRows[j], highlight: lyric.highlight };
						const startY = anchor.y + this.lineHeight * 0.5;
						const endY = startY + Math.sin(rowAngle) * gr.CalcTextWidth(row.content, sentenceFont);
						if (Math.min(startY, endY) < topY || Math.max(startY, endY) > bottomY) continue;
						// Use the same percentage and easing as TT's ordinary lyric mask.
						// Tilted rows sample both ends of their baseline; the mask is applied once.
						const maskAlpha = Math.min(this.calcTransparentMaskAlpha(anchor.y, topY, bottomY),
							this.calcTransparentMaskAlpha(endY - this.lineHeight * 0.5, topY, bottomY));
						const paintOpacity = rowOpacity * maskAlpha;
						if (paintOpacity < 1 / 255) continue;
						const safeX = this.getArcSafeRowX(cx, cy, radius, tiltedStyle ? anchor.x : cx, anchor.y,
							this.lineHeight, lineW, rowAngle);
						const shiftX = tiltedStyle ? 0 : safeX - centerX;
						sentenceRows.push({ lyric: row, offset, opacity: paintOpacity, shiftX });
						if (!tiltedStyle) anchor.x = safeX;
						if (i === currentIndex && j === starRow && Math.abs(tilt) < 0.5 && lyric.isOriginalTranslation !== false) {
							stars.push({ row, anchor, opacity: paintOpacity, key: `${lyric.sentenceGroup}:${continuation.start + j}` });
						}
					}
				}
				if (tiltedStyle) {
					let shift = 0;
					for (const row of sentenceRows) {
						const anchor = this.getArcRowAnchor(centerX, centerY, rowAngle, row.offset);
						shift = Math.max(shift, this.getArcSafeRowX(cx, cy, radius, anchor.x, anchor.y,
							this.lineHeight, lineW, rowAngle) - anchor.x);
					}
					centerX += shift;
					for (const star of stars) star.anchor.x += shift;
				}
				this.drawCircularArcSentence(gr, sentenceRows, sentenceFont, centerX, centerY, lineW, tilt,
					lyricsNormalColor, lyricsHighlightColor, lyricsShadowColor);
				for (const star of stars) {
					this.x = star.anchor.x;
					this.w = lineW;
					this.drawKaraokeStars(gr, star.row, star.anchor.y, { scale: 1, opacity: star.opacity }, 1,
						lyricsHighlightColor, sentenceFont, star.key);
				}
			}
		} finally { Object.assign(this, oldGeometry); }
		return true;
	}

	/**
	 * 在屏幕上绘制歌词，并应用各种视觉效果，如淡入淡出和阴影。
	 * @param {GdiGraphics} gr - GDI图形对象。
	 */
	getTurntableLyricsWrapKey() {
		const font = grSet.lyricsLargerCurrentSync ? grFont.lyricsHighlight : grFont.lyrics;
		return [Math.round(this.w), font?.Name, font?.Size, font?.Style,
			grSet.lyricsFontSize_layout, grSet.lyricsLineSpacing, grSet.lyricsSentenceSpacing].join('|');
	}

	/** Reconcile live geometry even when the ordinary Lyrics panel is switched off. */
	syncTurntableLyricsLayout() {
		if (!grm.details.isTurntableActive()) return null;
		const b = grm.details.getTurntableLyricsBounds();
		if (!b) return null;
		if (this.x !== b.x || this.y !== b.y || this.w !== b.w || this.h !== b.h) {
			this.on_size(b.x, b.y, b.w, b.h);
		}
		const key = this.getTurntableLyricsWrapKey();
		if (key !== this.turntableLyricsWrapKey && !grm.details.immersiveLayoutTimer &&
			Array.isArray(this.lyr) && this.lyr.length && this.lyrics.length) {
			// Reuse local source text. Do not restart lyric discovery or its theme gate.
			this.loadLyrics(this.lyr);
		}
		return b;
	}

	/** Preserve cumulative-prefix kerning and trailing spaces while measuring once per layout. */
	getTurntableSweepGeometry(gr, lyric, font) {
		const cache = this.turntableSweepGeometry || (this.turntableSweepGeometry = new Map());
		const hit = cache.get(lyric);
		if (hit && hit.content === lyric.content && hit.karaoke === lyric.karaoke && hit.font === font &&
			hit.x === this.x && hit.w === this.w && hit.circularArcLeftAlign === !!this.circularArcLeftAlign) {
			cache.delete(lyric); cache.set(lyric, hit); return hit;
		}
		const parts = lyric.karaoke.filter(part => part && Number.isFinite(part.start) && typeof part.text === 'string' && part.text.length);
		const measure = text => !text ? 0 : typeof gr.CalcTextWidth === 'function'
			? gr.CalcTextWidth(text, font) : gr.MeasureString(text, font, 0, 0, 0, 0).Width;
		const totalWidth = parts.length ? Math.ceil(gr.MeasureString(lyric.content, font, 0, 0, 0, 0).Width) : 0;
		const karaokeTextWidth = parts.length ? measure(parts.map(part => part.text).join('')) : 0;
		const scale = karaokeTextWidth > 0 ? totalWidth / karaokeTextWidth : 1;
		let prefix = '';
		const widths = parts.map(part => { const start = measure(prefix) * scale; prefix += part.text; return { start, end: measure(prefix) * scale }; });
		const entry = { content: lyric.content, karaoke: lyric.karaoke, font, x: this.x, w: this.w,
			circularArcLeftAlign: !!this.circularArcLeftAlign, parts, widths, totalWidth, karaokeTextWidth,
			textX: this.x + (this.circularArcLeftAlign ? 0 : Math.max(0, (this.w - totalWidth) * 0.5)) };
		cache.delete(lyric); cache.set(lyric, entry);
		if (cache.size > 16) cache.delete(cache.keys().next().value);
		return entry;
	}

	/** Bounded reusable surfaces; white masks erase alpha before reusing transparent pixels. */
	renderTurntableSurface(width, height, slot, render) {
		if (!grm.details.isTurntableActive() || this.turntableSurfaceReuseDisabled ||
			width * height > (slot === 'column' ? 4000000 : 1000000)) return GDI(width, height, true, render);
		const stats = this.turntableRenderStats || (this.turntableRenderStats = { surfaces: 0, reuses: 0, text: 0 });
		const surfaces = this.turntableScratchSurfaces || (this.turntableScratchSurfaces = new Map());
		const key = `${slot}|${width}|${height}`;
		const cached = slot === 'column' ? this.turntableColumnSurface : surfaces.get(key);
		if (cached && cached.width === width && cached.height === height) {
			let g;
			try {
				// Clear without drawing transparent SourceOver rectangles over old pixels.
				cached.image.ApplyMask(cached.clearMask);
				g = cached.image.GetGraphics();
			} catch (e) {
				this.turntableSurfaceReuseDisabled = true;
				this.clearTurntableRenderingCaches();
				console.log(`TT FIX18 位图复用不可用，沿用原绘制路径：${e.message || e}`);
				return GDI(width, height, true, render);
			}
			try { render(g); } finally { cached.image.ReleaseGraphics(g); }
			stats.reuses++;
			if (slot !== 'column') { surfaces.delete(key); surfaces.set(key, cached); }
			return cached.image;
		}
		const image = GDI(width, height, true, render);
		if (!image || typeof image.ApplyMask !== 'function' || typeof image.GetGraphics !== 'function' ||
			typeof image.ReleaseGraphics !== 'function') return image;
		const clearMask = GDI(width, height, true, g => g.FillSolidRect(0, 0, width, height, RGB(255, 255, 255)));
		if (!clearMask) return image;
		const entry = { image, clearMask, width, height };
		stats.surfaces++;
		if (slot === 'column') this.turntableColumnSurface = entry;
		else {
			surfaces.set(key, entry);
			let pixels = Array.from(surfaces.values()).reduce((n, s) => n + s.width * s.height * 2, 0);
			while (surfaces.size > 8 || pixels > 4000000) {
				const first = surfaces.keys().next().value, s = surfaces.get(first);
				pixels -= s.width * s.height * 2; surfaces.delete(first);
			}
		}
		return image;
	}

	/** Cache fixed glyphs separately from the moving karaoke boundary and gradient. */
	getTurntableTextBitmap(width, height, text, font, color, mask = false) {
		const render = g => {
			if (mask) g.FillSolidRect(0, 0, width, height, RGB(255, 255, 255));
			g.DrawString(text, font, color, this.x, 0, this.w + 1, height, this.alignCenter);
		};
		if (!grm.details.isTurntableActive() || width * height > 1000000) return GDI(width, height, true, render);
		const cache = this.turntableTextCache || (this.turntableTextCache = new Map());
		const key = [mask, text, width, height, color, this.x, this.w, this.alignCenter].join('|');
		const hit = cache.get(key);
		if (hit && hit.font === font) { cache.delete(key); cache.set(key, hit); return hit.image; }
		const image = GDI(width, height, true, render);
		if (!image) return image;
		cache.set(key, { image, font });
		const stats = this.turntableRenderStats || (this.turntableRenderStats = { surfaces: 0, reuses: 0, text: 0 });
		stats.text++;
		let pixels = Array.from(cache.values()).reduce((n, s) => n + s.image.Width * s.image.Height, 0);
		while (cache.size > 32 || pixels > 4000000) {
			const first = cache.keys().next().value, s = cache.get(first);
			pixels -= s.image.Width * s.image.Height; cache.delete(first);
		}
		return image;
	}

	clearTurntableRenderingCaches() {
		this.turntableLyricLayer = this.turntableColumnSurface = null;
		this.turntableScratchSurfaces?.clear();
		this.turntableTextCache?.clear();
		this.turntableSweepGeometry?.clear();
		this.turntableGlyphTimelines?.clear();
	}

	drawLyrics(gr) {
		const started = grAnimationManager.now();
		try { this.drawLyricsWithLayer(gr); }
		finally {
			if (grm.details.isTurntableActive()) this.turntablePaintCost = Math.max(0, grAnimationManager.now() - started);
		}
	}

	drawLyricsWithLayer(gr) {
		this.syncCustomLyricsColors();
		const b = this.syncTurntableLyricsLayout();
		if (!grm.details.isTurntableActive()) { this.clearTurntableRenderingCaches(); this.drawLyricsContent(gr); return; }
		if (!b || !grm.details.isLyricsVisible() || !this.lyrics.length || this.locus < 0) return;
		// A regional layer clips enlarged text, shadows and star effects together.
		// Only the right column is allocated, independent of full window dimensions.
		const saved = { x: this.x, y: this.y, top: this.top, bot: this.bot,
			alignCenter: this.alignCenter, circularArcLeftAlign: this.circularArcLeftAlign };
		// FIX14: record/seekbar redraws do not change static lyric content. Keep
		// one clipped layer instead of allocating this column on every disc frame.
		const style = [grSet.theme, grSet.lyricsDropShadowLevel, grSet.lyricsTransparentMask,
			grSet.lyricsTranslation, grSet.lyricsTranslationScale, grSet.lyricsTranslationOpacity,
			grSet.lyricsTranslationSpacing, grSet.lyricsTranslationHighlightMode, grSet.lyricsKaraokeMode,
			grSet.lyricsVerticalChineseMode, grSet.lyricsVerticalLongLineMode,
			grSet.lyricsKaraokeShineMode, grSet.lyricsKaraokeEmphasisMode];
		const key = `${b.x}|${b.y}|${b.w}|${b.h}|${this.x}|${this.y}|${this.w}|${this.h}|${this.top}|${this.bot}|${this.locus}|${this.scroll}|${this.scrollDragOffset}|${this.lineHeight}|${this.translationSyncBlend}|${this.stableLyricsHighlightColor}|${this.lyricPaintRevision || 0}|${grCol.lyricsNormal}|${grCol.lyricsHighlight}|${grCol.lyricsShadow}|${style.join('|')}`;
		const cached = this.turntableLyricLayer;
		if (!this.trackThemeColorGateActive && cached && cached.key === key && cached.lyrics === this.lyrics &&
			cached.font === grFont.lyrics && cached.highlightFont === grFont.lyricsHighlight) {
			gr.DrawImage(cached.image, b.x, b.y, b.w, b.h, 0, 0, cached.image.Width, cached.image.Height);
			return;
		}
		if (cached) cached.key = null;
		const layer = this.renderTurntableSurface(Math.ceil(b.w), Math.ceil(b.h), 'column', g => {
			try {
				this.x = saved.x - b.x;
				this.y = saved.y - b.y;
				this.top = saved.top - b.y;
				this.bot = saved.bot - b.y;
				this.alignCenter = StringFormat(1, 1);
				this.circularArcLeftAlign = false;
				this.drawLyricsContent(g);
			} finally {
				Object.assign(this, saved);
			}
		});
		if (layer) {
			this.turntableLyricLayer = { key, lyrics: this.lyrics, font: grFont.lyrics, highlightFont: grFont.lyricsHighlight, image: layer };
			gr.DrawImage(layer, b.x, b.y, b.w, b.h, 0, 0, Math.ceil(b.w), Math.ceil(b.h));
		}
	}

	drawLyricsContent(gr) {
		if (!grm.details.isLyricsVisible() || grm.details.isTurntableActive() && !grm.details.getTurntableLyricsBounds() || this.lyrics.length === 0 || this.locus < 0) {
			return;
		}

		this.longGapPromptRects = this.getLongGapPrompt() ? [] : null;
		grm.debug.setDebugProfile(grm.debug.showDrawExtendedTiming, 'create', '绘图 -> 歌词');

		gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
		// Fix7: arm on the first paint that can expose a new track, before any highlight is read.
		this.trackThemeColorGateStart();
		const activeTheme = String(grSet.theme).toLowerCase();
		const runtimeLyricsHighlightColor = this.getLyricsHighlightRuntimeColor(activeTheme);
		// Observe the actual visible source before deciding whether the full palette may be released.
		this.updateStableLyricsHighlightColor(runtimeLyricsHighlightColor, false);
		const trackThemeColorGateActive = this.trackThemeColorGateUpdate();
		const stableLyricsHighlightColor = this.updateStableLyricsHighlightColor(
			runtimeLyricsHighlightColor,
			!trackThemeColorGateActive
		);
		// Auto and Off share the same admitted snapshot; neither may paint a live transition colour.
		const visibleLyricsHighlightColor = stableLyricsHighlightColor ?? grCol.lyricsNormal;

		// PRE42: Details-only experimental arc rail. It intentionally precedes the Chinese vertical
		// renderer because the selected Details display mode owns the geometry for this scene.
		if (grm.ui.displayDetails && (grSet.detailsLyricsDisplayMode === 'arc' && !grm.details.isTurntableActive())) {
			// Keep the CD rail clear during searches; a failed search gets only a
			// short notice. Actual lyrics keep the existing renderer unchanged.
			if (this.lyr === this.stringSearching || this.lyr === this.stringNoLyrics ||
				this.lyr === this.stringNotFound && Date.now() >= this.arcNoLyricsNoticeUntil) {
				grm.debug.setDebugProfile(false, 'print', '绘图 -> 歌词');
				return;
			}
			const transitionFactor = Clamp((this.lineHeight - this.scroll) / this.lineHeight, 0, 1);
			const transitionFactorIn = this.lyrics[this.locus].multiLine ? 1 : transitionFactor;
			const arcNormalColor = grCol.lyricsNormal;
			const arcHighlightColor = this.type.synced && !trackThemeColorGateActive
				? BlendColors(arcNormalColor, visibleLyricsHighlightColor, transitionFactorIn)
				: arcNormalColor;
			// The selected Details mode owns the whole paint path. Disc geometry may be
			// temporarily unavailable during a track change; never fall through to
			// the legacy cover/vertical renderer and flash lyrics on the artwork.
			this.drawArcScrollLyrics(gr, arcNormalColor, arcHighlightColor, grCol.lyricsShadow);
			this.drawLyricsOffset(gr);
			grm.debug.setDebugProfile(false, 'print', '绘图 -> 歌词');
			return;
		}

		if (typeof this.canDrawVerticalChineseLyrics === 'function' && this.canDrawVerticalChineseLyrics()) {
			this.drawVerticalChineseLyrics(gr);
			grm.debug.setDebugProfile(false, 'print', '绘图 -> 歌词');
			return;
		}

		const currentSentenceGroup = this.lyrics[this.locus].sentenceGroup;
		
		const top = this.getScrollTop();
		const y = this.y + this.scroll;

		const transitionFactor = Clamp((this.lineHeight - this.scroll) / this.lineHeight, 0, 1);
		const transitionFactorIn = this.lyrics[this.locus].multiLine ? 1 : transitionFactor;

		// Stage 6H R1 Fix2：详情页与独立歌词页必须遵循同一套歌词主题色。
		// detailsText 属于详情元数据文本，不能覆盖自定义及内置主题的歌词常规色。
		const lyricsNormalColor = grCol.lyricsNormal;
		const lyricsHighlightColor = this.type.synced && !trackThemeColorGateActive
			? BlendColors(lyricsNormalColor, visibleLyricsHighlightColor, transitionFactorIn)
			: lyricsNormalColor;
		const lyricsShadowColor = grCol.lyricsShadow;

		// DEBUG gr.DrawRect(this.x, this.top, this.w, this.bot, 3, RGBA(255, 0, 0, 255));

		for (const lyric of this.lyrics) {
			const isHiddenSecondary = lyric.isOriginalTranslation === false && lyric.sentenceGroup !== currentSentenceGroup;

			if (isHiddenSecondary && this.translationSyncBlend <= 0) continue;

			const lineYOffset = this.getBlendedOffset(lyric);
			const lineTransform = this.getLineAnimationTransform(lyric);
			const translationScale = this.getTranslationDisplayScale(lyric);
			const translationOpacity = this.getTranslationDisplayOpacity(lyric);
			const displayTransform = {
				offsetY: lineTransform.offsetY,
				scale: (grSet.lyricsKaraokeMode === 'off' ? 1 : lineTransform.scale) * translationScale,
				opacity: (grSet.lyricsKaraokeMode === 'off' ? 1 : lineTransform.opacity) * translationOpacity
			};
			const line_y = Math.round(y - top + lineYOffset + lineTransform.offsetY);

			if (line_y > this.bot + this.lineHeight) break;
			if (line_y < this.top - this.lineHeight * 0.5) continue;

			// DEBUG gr.DrawRect(this.x, line_y, this.w, this.lineHeight, 1, RGBA(0, 255, 255, 100));
			const revealAlpha = isHiddenSecondary ? this.translationSyncBlend : 1;

			if (this.longGapPromptRects && lyric.content.trim() && revealAlpha * displayTransform.opacity > 1 / 255) {
				const height = this.lineHeight * Math.max(1, displayTransform.scale);
				this.longGapPromptRects.push({ x: this.x, y: line_y - (height - this.lineHeight) * 0.5, w: this.w, h: height });
			}
			if (displayTransform.scale !== 1 || displayTransform.opacity !== 1) {
				this.drawTransformedLyric(gr, lyric, line_y, lyricsNormalColor, lyricsHighlightColor,
					lyricsShadowColor, revealAlpha, displayTransform);
			}
			else {
				this.drawLyric(gr, lyric, line_y, lyricsNormalColor, lyricsHighlightColor, lyricsShadowColor, revealAlpha);
			}

			// Stage 8E：星星必须绘制在行图层之外。图层高度属于冻结几何，向上弹出的星星会顶穿它的
			// 裁剪边界；这里使用最终屏幕坐标，并且只在图层变换为中性时生成与绘制。
			this.drawKaraokeStars(gr, lyric, line_y, displayTransform, revealAlpha, visibleLyricsHighlightColor);
		}

		this.drawLyricsOffset(gr);
		this.drawLongGapPrompt(gr);

		grm.debug.setDebugProfile(false, 'print', '绘图 -> 歌词');
	}

	/**
	 * Draws one lyric line, its shadow and its karaoke overlay into a transparent layer,
	 * then applies real geometric scaling to that complete layer. Because the base text
	 * and karaoke highlight are transformed together, their frozen coordinates stay aligned.
	 * @param {GdiGraphics} gr - Destination GDI graphics object.
	 * @param {object} lyric - Formatted lyric line.
	 * @param {number} line_y - Actual on-screen line coordinate.
	 * @param {number} normalColor - Normal lyric colour.
	 * @param {number} highlightColor - Highlight lyric colour.
	 * @param {number} shadowColor - Lyric shadow colour.
	 * @param {number} revealAlpha - Existing translation reveal opacity.
	 * @param {{scale:number,opacity:number}} transform - Stage 6B layer transform.
	 */
	drawTransformedLyric(gr, lyric, line_y, normalColor, highlightColor, shadowColor, revealAlpha, transform) {
		const pad = Math.max(SCALE(16), Math.ceil(this.lineHeight * 0.25));
		const layerW = Math.max(1, Math.ceil(this.x + this.w + pad));
		const layerH = Math.max(1, Math.ceil(this.lineHeight * 1.2 + pad * 2));
		const localLineY = pad + this.lineHeight * 0.1;
		const sourceX = Math.max(0, Math.floor(this.x - pad));
		const sourceW = Math.max(1, layerW - sourceX);

		const lyricLayer = this.renderTurntableSurface(layerW, layerH,
			`line|${lyric.content}|${this.x}|${this.w}`, g => {
			g.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
			this.drawLyric(g, lyric, localLineY, normalColor, highlightColor, shadowColor, revealAlpha, line_y);
		});

		if (!lyricLayer) {
			this.drawLyric(gr, lyric, line_y, normalColor, highlightColor, shadowColor,
				revealAlpha * transform.opacity);
			return;
		}

		const scale = Math.max(0.01, transform.scale);
		const centerX = this.x + this.w * 0.5;
		const centerY = line_y + this.lineHeight * 0.5;
		const sourceCenterY = localLineY + this.lineHeight * 0.5;
		const destX = centerX - (centerX - sourceX) * scale;
		const destY = centerY - sourceCenterY * scale;
		const destW = sourceW * scale;
		const destH = layerH * scale;
		const alpha = Math.round(Clamp(transform.opacity, 0, 1) * 255);

		gr.DrawImage(lyricLayer, destX, destY, destW, destH, sourceX, 0, sourceW, layerH, 0, alpha);
	}

	/**
	 * Draws the shadow effect for a lyric line using a pre-rendered blurred bitmap.
	 * The bitmap text rect mirrors the DrawString rect in drawLyric, so alignment is a simple (offset - pad) shift.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 * @param {string} text - The lyric text to draw.
	 * @param {GdiFont} font - The font to use for the text.
	 * @param {number} line_y - The vertical position of the text rect top edge.
	 * @param {number} [alpha] - The global opacity for this draw call (0-255).
	 * @param {number} [shadowColor] - The panel-correct lyrics shadow colour for this render pass.
	 */
	drawLyricsShadow(gr, text, font, line_y, alpha = 255, shadowColor = grCol.lyricsShadow) {
		if (!this.shadowEffect || alpha === 0) return;

		const shadow = this.getShadowBitmap(text, font, shadowColor);

		if (!shadow || !shadow.bmp) return;

		// Slight directional offset: larger levels get 2 px, smaller get 1 px
		const offset = this.dropShadowLevel >= 3 ? 2 : 1;
		const x = Math.round(this.x + offset - shadow.pad);
		const y = Math.round(line_y - this.lineHeight * 0.1 + offset - shadow.pad);

		gr.DrawImage(shadow.bmp, x, y, shadow.bmp.Width, shadow.bmp.Height, 0, 0, shadow.bmp.Width, shadow.bmp.Height, 0, alpha);
	}

	/**
	 * Draws the offset information on the screen.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawLyricsOffset(gr) {
		const isArc = grm.ui.displayDetails && (grSet.detailsLyricsDisplayMode === 'arc' && !grm.details.isTurntableActive());
		if (!this.showOffset || this.offsetWheelIsArc !== isArc ||
			isArc && !grm.details.isTurntableActive() && (!grm.details?.discArt || !grm.details.discArtSize)) return;

		const offset = isArc ? this.detailsArcUserOffset : this.userOffset;
		const label = `偏移: ${offset / 1000}秒`;
		this.offsetW = gr.CalcTextWidth(label, grFont.notification) + this.lineHeight;
		const offsetH = this.lineHeight + 1;
		// The CD rail is outside the legacy lyric rectangle; place its status inside Details.
		const offsetX = isArc ? grm.ui.ww - this.offsetW - SCALE(18) : this.x + this.w - this.offsetW - SCALE(8);
		const offsetY = grm.details.isTurntableActive() ? grm.ui.topMenuHeight + SCALE(8) : isArc ? Math.max(grm.ui.topMenuHeight + SCALE(8), grm.details.discArtSize.y - SCALE(8)) : this.y - SCALE(8);

		gr.FillRoundRect(offsetX, offsetY, this.offsetW, offsetH, this.arc, this.arc, grCol.popupBg);
		gr.DrawRoundRect(offsetX, offsetY, this.offsetW, offsetH, this.arc, this.arc, 1, 0x64000000);
		gr.DrawString(label, grFont.notification, grCol.popupText, offsetX, offsetY, this.offsetW, offsetH, this.alignCenter);
	}

	/**
	 * Returns the active reliable long-gap countdown, if any.
	 * @param {number} [currentTime=this.playbackTime()] - Current lyric timeline position in milliseconds.
	 * @returns {{start:number,end:number,seconds:number}|null} Active countdown state.
	 */
	getLongGapPrompt(currentTime = this.playbackTime()) {
		if (grSet.lyricsLongGapPrompt === 'off' || !this.type.synced ||
			!this.longGapRanges.length || this.scrollDrag || this.showOffset) {
			return null;
		}

		const range = this.longGapRanges.find(item => currentTime >= item.start && currentTime < item.end);
		if (!range) return null;

		return {
			start: range.start,
			end: range.end,
			seconds: Math.max(1, Math.ceil((range.end - currentTime) / 1000))
		};
	}

	/** Finds a lower free strip without changing lyric layout or scroll coordinates. */
	getLongGapPromptLayout(promptW, promptH) {
		const pad = SCALE(8);
		const x = this.x + (this.w - promptW) * 0.5;
		const originalY = this.y + this.h - promptH - pad;
		// Only the independent lyric page may use its outer margin. Details and
		// the clipped turntable column must keep their own coordinate system.
		const bottom = grm.ui.displayLyrics && !grm.ui.displayDetails
			? Math.max(this.y + this.h, grm.ui.wh - grm.ui.lowerBarHeight - pad)
			: this.y + this.h;
		const rects = this.longGapPromptRects || [];
		const lowest = rects.reduce((edge, r) => Math.max(edge, r.y + r.h), this.y);
		const freeTop = Math.max(originalY, lowest + pad);
		const freeBottom = bottom - pad;
		const fits = freeTop + promptH <= freeBottom;
		const y = fits ? freeTop + (freeBottom - freeTop - promptH) * 0.5 : originalY;
		const overlaps = rects.some(r => r.x < x + promptW && r.x + r.w > x &&
			r.y < y + promptH && r.y + r.h > y);
		return { x, y, overlaps };
	}

	/** Paint the prompt normally in free space, translucently over lyrics. */
	drawLongGapPrompt(gr) {
		const prompt = this.getLongGapPrompt();
		if (!prompt) { this.longGapPromptFade = null; return; }
		const text = `♫  间奏 · ${prompt.seconds} 秒后继续`;
		const promptW = Math.min(this.w, Math.ceil(gr.CalcTextWidth(text, grFont.notification)) + SCALE(28));
		const promptH = Math.ceil(gr.CalcTextHeight('Ag', grFont.notification)) + SCALE(12);
		const layout = this.getLongGapPromptLayout(promptW, promptH);
		const target = layout.overlaps ? 0.55 : 1;
		const now = Date.now();
		let fade = this.longGapPromptFade;
		if (!fade || fade.start !== prompt.start) fade = { start: prompt.start, from: target, target, time: now, value: target };
		if (fade.target !== target) { fade.from = fade.value; fade.target = target; fade.time = now; }
		const progress = Clamp((now - fade.time) / 180, 0, 1);
		fade.value = fade.from + (fade.target - fade.from) * progress;
		this.longGapPromptFade = fade;
		const color = c => RGBtoRGBA(c, Math.round((c >>> 24) * fade.value));
		const radius = Math.min(this.arc, promptH * 0.5);
		gr.FillRoundRect(layout.x, layout.y, promptW, promptH, radius, radius, color(grCol.popupBg));
		gr.DrawRoundRect(layout.x, layout.y, promptW, promptH, radius, radius, 1, color(0x64000000));
		// ClearType is unsuitable for translucent glyphs; restore the lyric hint afterwards.
		gr.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
		gr.DrawString(text, grFont.notification, color(grCol.popupText),
			layout.x, layout.y, promptW, promptH, this.alignCenter);
		gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
	}

	/**
	 * Tracks only countdown-second changes so Stage 6H does not introduce a continuous repaint path.
	 * @returns {boolean} True when the prompt must be redrawn or cleared.
	 */
	updateLongGapPrompt() {
		const prompt = this.getLongGapPrompt();
		const key = prompt ? `${prompt.start}:${prompt.seconds}` : '';

		if (key === this.longGapPromptLastKey) {
			const fade = this.longGapPromptFade;
			return !!prompt && !!fade && Math.abs(fade.from - fade.target) > 0.001 && Date.now() < fade.time + 180;
		}
		this.longGapPromptLastKey = key;
		return true;
	}

	/**
	 * 将高亮歌词推进到下一个时间戳组。
	 */
	abortSearch() {
		clearTimeout(this.esLyricChangeTimer);
		this.esLyricChangeTimer = null;
		this.esLyricPendingMeta = null;
		for (const property of ['localLyricsUnlockTimer', 'lyricsVerifyTimer', 'lyricsNextSaveTimer', 'lyricsNextReloadTimer']) {
			clearTimeout(this[property]); this[property] = null;
		}
		clearTimeout(this.arcNoLyricsNoticeTimer);
		this.arcNoLyricsNoticeTimer = null;
		this.arcNoLyricsNoticeUntil = 0;
		this.lyricsSearching = false;
		this.lyricsSaveCommandSent = false;
		clearInterval(this.lyricsSearchTimer);
		clearTimeout(this.searchTimeout);
		this.lyricsSearchTimer = this.searchTimeout = null;
	}

	/** Delayed save/verify work belongs to the current lyric load, never the next track. */
	scheduleLyricTask(property, callback, delay) {
		if (this.lyricsClosed) return;
		clearTimeout(this[property]);
		const epoch = this.lyricLoadEpoch || 0;
		this[property] = setTimeout(() => {
			this[property] = null;
			if (!this.lyricsClosed && epoch === (this.lyricLoadEpoch || 0)) callback();
		}, delay);
	}

	/**
	 * Advances the highlighted lyric to the next timestamp group.
	 */
	advanceHighLighted() {
		this.newHighlighted = true;
		this.scroll = 0;
		const previousSentenceGroup = this.locus >= 0 ? this.lyrics[this.locus].sentenceGroup : null;

		if (this.locus >= 0) {
			this.clearHighlight();

			const currentSentenceGroup = this.lyrics[this.locus].sentenceGroup;
			let currentEnd = this.locus;

			while (currentEnd < this.lyrics.length - 1 && this.lyrics[currentEnd + 1].sentenceGroup === currentSentenceGroup) {
				currentEnd++;
			}

			const nextStart = currentEnd + 1;

			if (nextStart < this.lyrics.length) {
				const prevOffset = this.getBlendedOffset(this.lyrics[this.locus]);

				this.translationUpdateSyncOffsets(this.lyrics[nextStart].sentenceGroup);

				const nextOffset = this.getBlendedOffset(this.lyrics[nextStart]);
				this.scroll = nextOffset - prevOffset;
				this.locus = nextStart;
			}
		}

		this.scrollStart = this.scroll;
		this.scrollElapsed = 0;

		this.getScrollSpeed();
		this.setHighlight();
		const currentSentenceGroup = this.locus >= 0 ? this.lyrics[this.locus].sentenceGroup : null;
		this.lineAnimationStart(previousSentenceGroup, currentSentenceGroup);
		this.karaokeBreathStart(currentSentenceGroup);
		this.repaintRect();
	}

	/**
	 * Calculates the transparent mask alpha for a lyric line based on its vertical position.
	 * Uses the shared TT sine easing from both visible edges inward.
	 * @param {number} line_y - The y-coordinate of the lyric line's top edge.
	 * @param {number} [top=this.top] - Visible mask top, including the arc layout's actual rail bounds.
	 * @param {number} [bottom=this.bot] - Visible mask bottom.
	 * @returns {number} The alpha factor in [0.0, 1.0].
	 */
	calcTransparentMaskAlpha(line_y, top = this.top, bottom = this.bot) {
		if (!grSet.lyricsTransparentMask || !this.h) return 1.0;

		return this.calcTransparentMaskAlphaAt(line_y + this.lineHeight * 0.5, top, bottom);
	}

	/**
	 * 共用 TT 遮罩档位与正弦曲线：横排传入 Y 轴边界，竖排传入 X 轴边界。
	 * @param {number} position - 歌词行／列的中心坐标。
	 * @param {number} start - 可见区域起点。
	 * @param {number} end - 可见区域终点。
	 * @returns {number} 0–1 透明度。
	 */
	calcTransparentMaskAlphaAt(position, start, end) {
		if (!grSet.lyricsTransparentMask) return 1.0;
		const span = end - start;
		if (span <= 0) return 1.0;

		// Normalise the line/column centre to the visible range [0, 1]
		const relative = (position - start) / span;
		if (relative <= 0 || relative >= 1) return 0.0;

		const mask = grSet.lyricsTransparentMask;
		const startFade = relative < mask ? Easing('easeInOutSine', relative / mask) : 1.0;
		const endFade = (1 - relative) < mask ? Easing('easeInOutSine', (1 - relative) / mask) : 1.0;

		return Math.min(startFade, endFade);
	}

	/**
	 * Advances the scroll position using a time-based easing curve toward zero.
	 */
	checkScroll(delta = 16) {
		this.scrollElapsed += delta;
		const t = Math.min(this.scrollElapsed / this.scrollEffectiveDuration, 1);
		this.scroll = Math.max(0, this.scrollStart * (1 - Easing(grSet.lyricsScrollEasing, t)));

		if (this.scroll <= 0) {
			this.newHighlighted = false;
		}

		this.repaintRect();
	}

	/**
	 * Stage 8F-R8：拖拽滚动停止后，先进入延迟等待（scrollDragReturnDelay 毫秒）。
	 * 延迟期间若再次按下拖拽则取消（见 on_mouse_lbtn_down）。延迟结束后由
	 * tickScrollDragReturn() 触发 beginScrollDragReturn() 平滑回位到当前播放行。
	 * 仅当存在非零偏移时才进入延迟，避免无谓重绘。
	 */
	startScrollDragReturn() {
		if (this.scrollDragOffset === 0) {
			this.scrollDragReturnArmed = false;
			this.scrollDragReturning = false;
			return;
		}
		this.scrollDragReturnArmed = true;
		this.scrollDragReturnArmElapsed = 0;
		this.scrollDragReturning = false;
		this.repaintRect();
	}

	/**
	 * Stage 8F-R8：真正启动回位缓动（由延迟计时达到阈值时触发）。
	 */
	beginScrollDragReturn() {
		if (this.scrollDragOffset === 0) {
			this.scrollDragReturning = false;
			return;
		}
		this.scrollDragReturnStart = this.scrollDragOffset;
		this.scrollDragReturnElapsed = 0;
		this.scrollDragReturning = true;
		this.repaintRect();
	}

	/**
	 * Stage 8F-R8：每帧推进拖拽回位相关逻辑——先等待延迟阈值，再缓动归零。
	 * 由 smoothScroll() 每帧调用。归零后歌词即回到当前播放行（locus）。
	 */
	tickScrollDragReturn(delta = 16) {
		if (this.scrollDragReturnArmed && !this.scrollDragReturning) {
			this.scrollDragReturnArmElapsed += delta;
			if (this.scrollDragReturnArmElapsed >= this.scrollDragReturnDelay) {
				this.scrollDragReturnArmed = false;
				this.beginScrollDragReturn();
			}
			// 延迟期间持续重绘以维持动画循环，直到触发回弹。
			this.repaintRect();
			return;
		}
		if (this.scrollDragReturning) {
			this.updateScrollDragReturn(delta);
		}
	}

	/**
	 * Stage 8F-R7：每帧推进拖拽回位缓动，将 scrollDragOffset 自起始值缓动回 0。
	 * 归零后歌词即回到当前播放行（locus）。返回途中再次按下拖拽时由 on_mouse_lbtn_down 取消。
	 */
	updateScrollDragReturn(delta = 16) {
		if (!this.scrollDragReturning) return;
		this.scrollDragReturnElapsed += delta;
		const t = Math.min(this.scrollDragReturnElapsed / this.scrollDragReturnDuration, 1);
		this.scrollDragOffset = this.scrollDragReturnStart * (1 - Easing(grSet.lyricsScrollEasing, t));
		if (t >= 1 || Math.abs(this.scrollDragOffset) < 0.5) {
			this.scrollDragOffset = 0;
			this.scrollDragReturning = false;
		}
		this.repaintRect();
	}

	/** Starts palette suppression only for a real now-playing identity change. */
	trackThemeColorGateStart() {
		const metadb = fb.GetNowPlaying();
		const rawPath = metadb ? String(metadb.RawPath || metadb.Path || '') : '';
		const subSong = metadb && Number.isFinite(metadb.SubSong) ? metadb.SubSong : 0;
		const contextKey = this.getLyricsHighlightSnapshotContextKey();
		const trackKey = rawPath ? `${rawPath}|${subSong}|${contextKey}` : '';
		if (!trackKey || trackKey === this.trackThemeColorGateTrackKey) return;

		this.trackThemeColorGateTrackKey = trackKey;
		const activeTheme = String(grSet.theme).toLowerCase();
		if (activeTheme.startsWith('custom')) {
			this.trackThemeColorGateActive = false;
			return;
		}

		const now = Date.now();
		this.stableLyricsHighlightColor = null;
		this.stableLyricsHighlightCandidate = null;
		this.stableLyricsHighlightCandidateSince = now;
		this.stableLyricsHighlightCandidateChanges = 0;
		this.stableLyricsHighlightThemeKey = contextKey;
		this.trackThemeColorGateActive = true;
		this.trackThemeColorGateStartedAt = now;
		this.trackThemeColorGatePreviousSignature = this.trackThemeColorGateSettledSignature || this.getTrackThemeColorSignature();
		this.trackThemeColorGateCandidateSignature = '';
		this.trackThemeColorGateObservedChange = false;
		this.trackThemeColorGateRequiresChange = activeTheme === 'random' || activeTheme === 'reborn';
		this.trackThemeColorGateLastChange = now;
	}

	/** Returns every runtime palette role capable of leaking into lyric highlighting. */
	getTrackThemeColorSignature() {
		return [
			grCol.lyricsNormal,
			grCol.lyricsHighlight,
			grCol.progressBarFill,
			grCol.waveformBarFillFront,
			grCol.peakmeterBarProgFill
		]
			.map(color => Number.isFinite(color) ? (color & 0x00FFFFFF).toString(16).padStart(6, '0') : '------')
			.join(':');
	}

	/**
	 * Returns one immutable Off-mode highlight snapshot for the current track/theme pair.
	 * Runtime colour changes after admission are deliberately ignored until a real track or
	 * theme change, preventing same-song line changes from ever accepting an intermediate blue.
	 * @param {number} runtimeColor Current player-provided highlight.
	 * @param {boolean} allowCommit False while the complete track palette is gated.
	 * @returns {?number} Admitted highlight, or null while normal colour must remain visible.
	 */
	updateStableLyricsHighlightColor(runtimeColor, allowCommit = true) {
		const now = Date.now();
		const activeTheme = String(grSet.theme).toLowerCase();
		const contextKey = this.getLyricsHighlightSnapshotContextKey();
		if (activeTheme.startsWith('custom')) {
			this.stableLyricsHighlightThemeKey = contextKey;
			this.stableLyricsHighlightColor = runtimeColor;
			this.stableLyricsHighlightCandidate = runtimeColor;
			this.stableLyricsHighlightCandidateSince = now;
			this.stableLyricsHighlightCandidateChanges = 1;
			return runtimeColor;
		}

		if (contextKey !== this.stableLyricsHighlightThemeKey) {
			this.stableLyricsHighlightThemeKey = contextKey;
			this.stableLyricsHighlightColor = null;
			this.stableLyricsHighlightCandidate = null;
			this.stableLyricsHighlightCandidateSince = now;
			this.stableLyricsHighlightCandidateChanges = 0;
		}

		// Fix6: once confirmed, the colour is immutable within this track/theme pair.
		if (this.stableLyricsHighlightColor !== null) return this.stableLyricsHighlightColor;

		const runtimeRgb = runtimeColor & 0x00FFFFFF;
		const candidateRgb = this.stableLyricsHighlightCandidate === null
			? null
			: this.stableLyricsHighlightCandidate & 0x00FFFFFF;
		if (candidateRgb === null || runtimeRgb !== candidateRgb) {
			this.stableLyricsHighlightCandidate = runtimeColor;
			this.stableLyricsHighlightCandidateSince = now;
			this.stableLyricsHighlightCandidateChanges++;
		}
		if (allowCommit && now - this.stableLyricsHighlightCandidateSince >= this.trackThemeColorGateStablePeriod) {
			this.stableLyricsHighlightColor = this.stableLyricsHighlightCandidate;
		}
		return this.stableLyricsHighlightColor;
	}

	/** Releases a new-track palette only after both minimum and uninterrupted quiet periods. */
	trackThemeColorGateUpdate() {
		const signature = this.getTrackThemeColorSignature();
		if (!this.trackThemeColorGateActive) {
			this.trackThemeColorGateSettledSignature = signature;
			return false;
		}

		const now = Date.now();
		if (!this.trackThemeColorGateCandidateSignature || signature !== this.trackThemeColorGateCandidateSignature) {
			this.trackThemeColorGateCandidateSignature = signature;
			this.trackThemeColorGateLastChange = now;
		}
		if (this.trackThemeColorGatePreviousSignature && signature !== this.trackThemeColorGatePreviousSignature) {
			this.trackThemeColorGateObservedChange = true;
		}

		const elapsed = now - this.trackThemeColorGateStartedAt;
		const stableFor = now - this.trackThemeColorGateLastChange;
		const sourceStableFor = now - this.stableLyricsHighlightCandidateSince;
		// The first dynamic colour is treated as provisional. A second distinct source colour proves
		// that the album/theme pipeline has advanced beyond the intermediate value seen by Fix6.
		const newThemeConfirmed = !this.trackThemeColorGateRequiresChange ||
			this.stableLyricsHighlightCandidateChanges >= 2;
		const stable = newThemeConfirmed && elapsed >= this.trackThemeColorGateMinimum &&
			stableFor >= this.trackThemeColorGateStablePeriod &&
			sourceStableFor >= this.trackThemeColorGateStablePeriod;
		// The ceiling can waive signature inequality, never the final quiet period.
		const timedOut = elapsed >= this.trackThemeColorGateMaximum &&
			stableFor >= this.trackThemeColorGateStablePeriod &&
			sourceStableFor >= this.trackThemeColorGateStablePeriod;
		if (stable || timedOut) {
			this.trackThemeColorGateActive = false;
			this.trackThemeColorGateSettledSignature = signature;
			return false;
		}
		return true;
	}

	/**
	 * 清除歌词并停止动画。
	 */
	clear() {
		this.stop();

		if (this.translationBlendTimer) {
			grAnimationManager.remove(this.translationBlendTimer);
			this.translationBlendTimer = null;
		}

		clearTimeout(this.translationAutoCollapseTimer);
		this.translationAutoCollapseHold = false;
		this.translationScrollAnchorIndex = -1;

		this.lyrics = [];
		this.verticalEligibilityCache = null;
		this.karaokeCompletionEnds.clear();
		this.karaokeSustainWindows.clear();
		this.longGapRanges = [];
		this.longGapPromptLastKey = '';
		this.scrollDragOffset = 0;
		this.translationSyncAppliedGroup = null;
		this.translationSyncBlend = 1;
		this.translationSyncBlendTarget = 1;
		this.translationSyncBlendStart = 1;
		this.translationSyncBlendElapsed = 0;
		this.lineAnimationReset();
		this.karaokeBreathReset();
		this.shadowBitmapCache.clear();
		this.clearTurntableRenderingCaches();
	}

	/**
	 * Applies the user-selected Stage 6D line-animation intensity profile.
	 * Standard preserves the Windows-tested Stage 6B Fix2 values exactly.
	 */
	applyLineAnimationMode() {
		const mode = grSet.lyricsLineAnimationMode || 'standard';
		const profiles = {
			off:      [0,   0,    0,    0,    0],
			soft:     [420, 0.07, 0.16, 0.08, 0.06],
			standard: [480, 0.12, 0.28, 0.14, 0.10],
			strong:   [560, 0.18, 0.38, 0.20, 0.14]
		};
		const profile = profiles[mode] || profiles.standard;

		[this.lineAnimationDuration, this.lineAnimationOffsetRatio, this.lineAnimationOpacityDip,
			this.lineAnimationEnterScale, this.lineAnimationExitScale] = profile;
	}

	/**
	 * Returns the Stage 6 line-animation state for one formatted lyric line.
	 * The state model is intentionally independent from the existing scroll offset;
	 * Stage 6B can consume it without changing the frozen lyric timing or karaoke geometry.
	 * @param {object} lyric - The formatted lyric line.
	 * @returns {{state:string,progress:number}} `enter`, `hold`, `exit`, or `idle` plus linear 0-1 progress.
	 */
	getLineAnimationState(lyric) {
		const sentenceGroup = lyric?.sentenceGroup;

		if (this.lineAnimationActive) {
			if (sentenceGroup === this.lineAnimationFromGroup) {
				return { state: 'exit', progress: this.lineAnimationProgress };
			}
			if (sentenceGroup === this.lineAnimationToGroup) {
				return { state: 'enter', progress: this.lineAnimationProgress };
			}
		}

		return sentenceGroup === this.lineAnimationToGroup
			? { state: 'hold', progress: 1 }
			: { state: 'idle', progress: 1 };
	}

	/**
	 * Converts Stage 6A enter/exit states into a visible whole-line layer transform.
	 * Every curve returns to neutral at both boundaries, preventing jumps when the
	 * animation starts or hands control back to the frozen Stage 5 renderer.
	 * @param {object} lyric - The formatted lyric line.
	 * @param {boolean} [suppressRise=false] - Stage 8F-R4：单字强调开启时，纵排调用方传 true，
	 * 抑制本行的「上浮 + 放大 + 呼吸脉冲」（scale/offsetY 归零、breathScale 取 1），只保留透明度交叉淡化，
	 * 让这些整行动效不与单字毛笔强调争夺视觉焦点；横排与强调关闭时维持原行为。
	 * @returns {{offsetY:number,opacity:number,scale:number}}
	 */
	getLineAnimationTransform(lyric, suppressRise = false) {
		const lineState = this.getLineAnimationState(lyric);
		const breathScale = suppressRise ? 1 : this.getKaraokeBreathScale(lyric);

		if (!this.lineAnimationActive || lineState.state === 'hold' || lineState.state === 'idle') {
			return { offsetY: 0, opacity: 1, scale: breathScale };
		}

		const eased = Clamp(Easing(grSet.lyricsScrollEasing, lineState.progress), 0, 1);
		const pulse = Math.sin(Math.PI * eased);
		const entering = lineState.state === 'enter';

		return {
			offsetY: suppressRise ? 0 : this.lineHeight * this.lineAnimationOffsetRatio * pulse * (entering ? 1 : -1),
			opacity: 1 - this.lineAnimationOpacityDip * pulse,
			scale: (suppressRise
				? 1
				: (entering
					? 1 + this.lineAnimationEnterScale * pulse
					: 1 - this.lineAnimationExitScale * pulse)) * breathScale
		};
	}

	/**
	 * Returns the optional Stage 6G scale for secondary translation lines.
	 * A value of 1 preserves the frozen Stage 6F layout exactly.
	 * @param {object} lyric - Formatted lyric line.
	 * @returns {number} Translation layer scale.
	 */
	getTranslationDisplayScale(lyric) {
		if (lyric.isOriginalTranslation !== false) return 1;

		const scale = Number(grSet.lyricsTranslationScale);
		return [0.8, 0.9, 1, 1.1].includes(scale) ? scale : 1;
	}

	getTranslationSpacingFactor() {
		const spacing = Number(grSet.lyricsTranslationSpacing);
		return [0.9, 1, 1.1, 1.2].includes(spacing) ? spacing : 1;
	}

	getTranslationLineAdvanceFactor(lyric, nextLyric) {
		return nextLyric && nextLyric.sentenceGroup === lyric.sentenceGroup &&
			lyric.isOriginalTranslation !== false && nextLyric.isOriginalTranslation === false
			? this.getTranslationSpacingFactor() : 1;
	}

	/**
	 * Returns the optional Stage 6G opacity for secondary translation lines.
	 * @param {object} lyric - Formatted lyric line.
	 * @returns {number} Translation layer opacity.
	 */
	getTranslationDisplayOpacity(lyric) {
		if (lyric.isOriginalTranslation !== false) return 1;

		const opacity = Number(grSet.lyricsTranslationOpacity);
		return [0.6, 0.75, 0.9, 1].includes(opacity) ? opacity : 1;
	}

	/**
	 * Snaps the line-animation timeline to a stable state.
	 * Used on load, seek, clear, and other discontinuous operations so stale transitions cannot survive.
	 * @param {?number} [sentenceGroup=null] - Sentence group that should hold the current state.
	 */
	lineAnimationReset(sentenceGroup = null) {
		this.lineAnimationElapsed = this.lineAnimationDuration;
		this.lineAnimationProgress = 1;
		this.lineAnimationFromGroup = null;
		this.lineAnimationToGroup = sentenceGroup;
		this.lineAnimationActive = false;
		this.lineAnimationLastTick = 0;
	}

	/**
	 * Starts an independent current-line state transition.
	 * @param {?number} fromGroup - Sentence group that is leaving.
	 * @param {?number} toGroup - Sentence group that is entering.
	 * @param {number} [now=Date.now()] - Wall-clock timestamp used by deterministic tests and the live timer.
	 */
	lineAnimationStart(fromGroup, toGroup, now = Date.now()) {
		this.applyLineAnimationMode();
		if (fromGroup === null || toGroup === null || fromGroup === toGroup || this.lineAnimationDuration <= 0) {
			this.lineAnimationReset(toGroup);
			return;
		}

		this.lineAnimationElapsed = 0;
		this.lineAnimationProgress = 0;
		this.lineAnimationFromGroup = fromGroup;
		this.lineAnimationToGroup = toGroup;
		this.lineAnimationActive = true;
		this.lineAnimationLastTick = now;
	}

	/**
	 * Advances the line-animation timeline without reading or modifying lyric scroll position.
	 * @param {number} [now=Date.now()] - Current wall-clock timestamp.
	 * @returns {boolean} True while a transition needs another frame.
	 */
	lineAnimationUpdate(now = Date.now()) {
		if (!this.lineAnimationActive) return false;

		if (!this.lineAnimationLastTick) {
			this.lineAnimationLastTick = now;
			return true;
		}

		const delta = Clamp(now - this.lineAnimationLastTick, 0, 64);
		this.lineAnimationLastTick = now;
		this.lineAnimationElapsed = Math.min(this.lineAnimationDuration, this.lineAnimationElapsed + delta);
		this.lineAnimationProgress = this.lineAnimationDuration > 0
			? this.lineAnimationElapsed / this.lineAnimationDuration
			: 1;

		if (this.lineAnimationProgress >= 1) {
			this.lineAnimationReset(this.lineAnimationToGroup);
			return false;
		}

		return true;
	}

	/**
	 * Applies the Stage 6H R3 one-shot karaoke breath profile.
	 * Low and medium deliberately stay within 102–103% and never alter opacity or position.
	 */
	applyKaraokeBreathMode() {
		const mode = ['off', 'low', 'medium'].includes(grSet.lyricsKaraokeBreathMode)
			? grSet.lyricsKaraokeBreathMode
			: 'low';
		const profiles = {
			off:    [0,   0],
			low:    [520, 0.02],
			medium: [620, 0.03]
		};
		[this.karaokeBreathDuration, this.karaokeBreathAmplitude] = profiles[mode];
	}

	/**
	 * Snaps the karaoke breath to a stable state. A supplied group is marked as already settled,
	 * so seek, reload and setting changes cannot replay an entry animation in the middle of a line.
	 * @param {?number} [sentenceGroup=null] - Current settled sentence group, or null before the first line.
	 */
	karaokeBreathReset(sentenceGroup = null) {
		this.applyKaraokeBreathMode();
		this.karaokeBreathElapsed = this.karaokeBreathDuration;
		this.karaokeBreathActive = false;
		this.karaokeBreathSentenceGroup = sentenceGroup;
		this.karaokeBreathLastTriggeredGroup = sentenceGroup;
		this.karaokeBreathLastTick = 0;
	}

	/**
	 * Starts one breath for a newly entered enhanced-karaoke sentence group.
	 * The breath waits for the existing line transition to finish, preventing stacked scale peaks.
	 * @param {?number} sentenceGroup - Newly entered sentence group.
	 * @param {number} [now=Date.now()] - Wall-clock timestamp for deterministic tests.
	 */
	karaokeBreathStart(sentenceGroup, now = Date.now()) {
		this.applyKaraokeBreathMode();
		const lyric = this.locus >= 0 ? this.lyrics[this.locus] : null;
		this.karaokeBreathLastTriggeredGroup = sentenceGroup;

		if (sentenceGroup === null || this.karaokeBreathDuration <= 0 || !this.canDrawKaraoke(lyric)) {
			this.karaokeBreathReset(sentenceGroup);
			return;
		}

		const lineAnimationRemaining = this.lineAnimationActive
			? Math.max(0, this.lineAnimationDuration - this.lineAnimationElapsed)
			: 0;
		this.karaokeBreathElapsed = -lineAnimationRemaining;
		this.karaokeBreathActive = true;
		this.karaokeBreathSentenceGroup = sentenceGroup;
		this.karaokeBreathLastTick = now;
	}

	/**
	 * Arms the first lyric line when playback naturally reaches its timestamp.
	 * A seek into an already active line is marked settled by seek() and therefore does not replay.
	 * @param {number} [now=Date.now()] - Wall-clock timestamp for deterministic tests.
	 * @returns {boolean} True when a new breath was started.
	 */
	karaokeBreathMaybeStart(now = Date.now()) {
		if (this.karaokeBreathActive || this.locus < 0 || !this.lyrics[this.locus]) return false;

		const lyric = this.lyrics[this.locus];
		if (lyric.sentenceGroup === this.karaokeBreathLastTriggeredGroup || this.playbackTime() < lyric.timestamp) {
			return false;
		}

		this.karaokeBreathStart(lyric.sentenceGroup, now);
		return this.karaokeBreathActive;
	}

	/**
	 * Advances the breath timeline only while the playback timer is running.
	 * @param {number} [now=Date.now()] - Current wall-clock timestamp.
	 * @returns {boolean} True while another animation frame is needed.
	 */
	karaokeBreathUpdate(now = Date.now()) {
		if (!this.karaokeBreathActive) return false;

		if (!this.karaokeBreathLastTick) {
			this.karaokeBreathLastTick = now;
			return true;
		}

		const delta = Clamp(now - this.karaokeBreathLastTick, 0, 64);
		this.karaokeBreathLastTick = now;
		this.karaokeBreathElapsed = Math.min(this.karaokeBreathDuration, this.karaokeBreathElapsed + delta);

		if (this.karaokeBreathElapsed >= this.karaokeBreathDuration) {
			this.karaokeBreathReset(this.karaokeBreathSentenceGroup);
			return false;
		}

		return true;
	}

	/**
	 * Returns the one-shot scale for every visible line in the current original/translation group.
	 * @param {object} lyric - Formatted lyric line.
	 * @returns {number} Neutral 1 or a restrained 1.00–1.03 scale.
	 */
	getKaraokeBreathScale(lyric) {
		if (grSet.lyricsKaraokeMode === 'off' || !this.karaokeBreathActive || this.karaokeBreathElapsed <= 0 ||
			lyric?.sentenceGroup !== this.karaokeBreathSentenceGroup || this.karaokeBreathDuration <= 0) {
			return 1;
		}

		const progress = Clamp(this.karaokeBreathElapsed / this.karaokeBreathDuration, 0, 1);
		return 1 + this.karaokeBreathAmplitude * Math.sin(Math.PI * progress);
	}

	/**
	 * Clears the edge leave timer when lyrics layout is full.
	 */
	clearFullLayoutEdgeLeaveTimer() {
		if (!grm.ui.lyricsFullLayoutEdgeLeaveTimer) return;

		clearTimeout(grm.ui.lyricsFullLayoutEdgeLeaveTimer);
		grm.ui.lyricsFullLayoutEdgeLeaveTimer = null;
	}

	/**
	 * 从歌词数组中的所有行中移除高亮。
	 */
	clearHighlight() {
		for (const v of this.lyrics) {
			v.highlight = false;
		}
	}

	/**
	 * Blends a lyric's compact (sync-only) and full vertical offsets according to the current reveal transition.
	 * @param {object} lyric - The lyric line whose offset should be computed.
	 * @returns {number} The interpolated vertical offset for this frame.
	 */
	getBlendedOffset(lyric) {
		if (this.translationSyncBlend >= 1) {
			return lyric.yOffset;
		}

		if (this.translationSyncBlend <= 0) {
			return lyric.compactYOffset;
		}

		return Lerp(lyric.compactYOffset, lyric.yOffset, this.translationSyncBlend);
	}

	/**
	 * Gets the index of the current lyric line.
	 * @returns {number} The index of the current lyric line based on the playback time.
	 */
	getCurPos() {
		return this.lyrics.findIndex(v => v.timestamp >= this.playbackTime());
	}

	/**
	 * 将带时间戳的歌词转换为毫秒。
	 * @param {string} t - 带时间戳的字符串。
	 * @returns {number} 以毫秒为单位的时间。
	 */
	getMilliseconds(t) {
		t = t.trim().replace(Regex.PunctBracket, '');

		const [minutes = '0', secondsPart = '0'] = t.split(':');
		const [seconds = '0', frac = '0'] = secondsPart.split('.');
		const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds) + parseFloat(`0.${frac}`) || 0;

	//	return Math.max(totalSeconds * 1000, 0);
		return Math.max((totalSeconds * 1000).toFixed(0), 0); // 群友 ASM 修正替换上行
	}

	/**
	 * 获取滚动动画的持续时间。
	 */
	getScrollSpeed() {
		let { durationScroll } = this;

		const t1 = this.getTimestamp(this.locus - 1);
		const t2 = this.getTimestamp(this.locus);
		const t3 = this.getTimestamp(this.locus + 1);

		const variSpeed = grSet.lyricsScrollAdaptive ? 10 * 500 : 0;

		if (t1 && t2 && t2 - t1 > 0) {
			const backward = t2 - t1;
			const forward  = (t3 && t3 - t2 > 0) ? t3 - t2 : backward;
			durationScroll = Clamp(Math.min(backward, forward), this.minDurationScroll, this.durationScroll);
		}

		if (variSpeed) {
			let diff1 = 0;
			let diff2 = 0;

			if (t1 && t2) {
				diff1 = t2 - t1;
				diff1 = diff1 > this.durationScroll ? diff1 * this.durationScroll / variSpeed : 0;
			}
			if (t2 && t3) {
				diff2 = t3 - t2;
				diff2 = diff2 > this.durationScroll ? diff2 * this.durationScroll / variSpeed : 0;
			}

			const maxExtension = this.durationScroll * 2;
			durationScroll += Math.min(Math.min(diff1, diff2), maxExtension);
		}

		this.delta = this.scroll * this.factor / durationScroll;
		this.scrollEffectiveDuration = durationScroll * 16 / this.factor;
		this.transitionOffset = durationScroll / 2;
	}

	/**
	 * Gets the current vertical scroll reference subtracted from every lyric line's blended offset to compute its on-screen position.
	 * @returns {number} The scroll reference ("top").
	 */
	getScrollTop() {
		if (this.translationScrollAnchorIndex >= 0) {
			const anchorNow = this.getBlendedOffset(this.lyrics[this.translationScrollAnchorIndex]);

			return this.translationScrollAnchorTop
				+ (anchorNow - this.translationScrollAnchorOffset)
				+ (this.scrollDragOffset - this.translationScrollAnchorDragOffset);
		}

		return this.getBlendedOffset(this.lyrics[this.locus]) - this.locusOffset + this.scrollDragOffset;
	}

	/**
	 * Gets or creates a cached pre-rendered blurred shadow bitmap for a lyric line.
	 * The text rect inside the bitmap mirrors the DrawString rect used in drawLyric
	 * exactly, so DrawImage alignment is a trivial (pad, pad) to (x, y) mapping.
	 * @param {string} text - The lyric text content.
	 * @param {GdiFont} font - The font used to render the text.
	 * @param {number} [shadowColor] - The panel-correct lyrics shadow colour for this render pass.
	 * @returns {{bmp: GdiBitmap, pad: number}|null} Cached entry, or null on failure.
	 */
	getShadowBitmap(text, font, shadowColor = grCol.lyricsShadow) {
		// Rebuild entire cache when the shadow colour changes (theme switch, Details toggle, etc.)
		if (this.shadowLastColor !== shadowColor) {
			this.shadowBitmapCache.clear();
			this.shadowLastColor = shadowColor;
		}

		// Separate cache slots for the highlighted (larger) font and normal font
		const fontKey = `${font.Name}|${font.Size}|${font.Style}`;
		const cacheKey = `${text}|${this.shadowCacheKey}|${fontKey}|${Math.round(this.w)}`;

		if (this.shadowBitmapCache.has(cacheKey)) {
			const hit = this.shadowBitmapCache.get(cacheKey);
			this.shadowBitmapCache.delete(cacheKey); this.shadowBitmapCache.set(cacheKey, hit);
			return hit;
		}

		// Bounded FIFO eviction
		if (this.shadowBitmapCache.size >= 48) {
			this.shadowBitmapCache.delete(this.shadowBitmapCache.keys().next().value);
		}

		// Larger blur radius = softer, more spread shadow; values tuned for each level
		const blurRadius = this.dropShadowLevel === 1 ? 3 : this.dropShadowLevel === 2 ? 5 : 8;

		// Mirror the DrawString rect used in drawLyric: (this.x, line_y - 0.1·lh, this.w + 1, 1.2·lh)
		// Place the text at (blurRadius, blurRadius) inside the bitmap so blur has room on all sides
		const textW = this.w + 1;
		const textH = Math.round(this.lineHeight * 1.2);
		const bmpW  = Math.round(textW + blurRadius * 2 + 2);
		const bmpH  = Math.round(textH + blurRadius * 2 + 2);
		if (bmpW * bmpH > 2000000) return null;

		if (bmpW < 2 || bmpH < 2) {
			this.shadowBitmapCache.set(cacheKey, null);
			return null;
		}

		const shadowBmp = GDI(bmpW, bmpH, true, (g) => {
			g.DrawString(text, font, shadowColor, blurRadius, blurRadius, textW, textH, this.alignCenter);
		});

		if (shadowBmp) shadowBmp.StackBlur(blurRadius);

		const entry = shadowBmp ? { bmp: shadowBmp, pad: blurRadius } : null;
		this.shadowBitmapCache.set(cacheKey, entry);
		let pixels = 0;
		for (const value of this.shadowBitmapCache.values()) if (value?.bmp) pixels += value.bmp.Width * value.bmp.Height;
		while (this.shadowBitmapCache.size > 1 && pixels > 4000000) {
			const oldest = this.shadowBitmapCache.keys().next().value;
			const value = this.shadowBitmapCache.get(oldest);
			if (value?.bmp) pixels -= value.bmp.Width * value.bmp.Height;
			this.shadowBitmapCache.delete(oldest);
		}
		return entry;
	}

	/**
	 * Gets the timestamp for a given index.
	 * @param {number} v - The lyrics array index.
	 * @returns {number} The timestamp in milliseconds, or undefined if out of range.
	 */
	getTimestamp(v) {
		return this.lyrics[v] && this.lyrics[v].timestamp;
	}

	/**
	 * Determines whether secondary (non-primary) translation lines should be hidden right now,
	 * i.e. whether the gap-free `compactYOffset` scheme should be used instead of the full `yOffset`.
	 * @returns {boolean} True when sync-only hiding is currently in effect.
	 */
	isSyncOnlyActive() {
		return (
				this.type.synced && grSet.lyricsTranslation && grSet.lyricsTranslationCurrentOnly
				&&
				(!grSet.lyricsTranslationScrollReveal || !this.scrollDrag && !this.showOffset && !this.translationAutoCollapseHold)
				);
	}

	/**
	 * Gets the current playback time.
	 * @returns {number} The current playback time in milliseconds.
	 */
	playbackTime() {
		if (!grSet.lyricsAutoScrollUnsynced && this.type.unsynced) {
			return 0;
		}

		const time = grm.ui.isStreaming ? fb.PlaybackTime - bio.txt.reader.trackStartTime : fb.PlaybackTime;

		return Math.round(time * 1000) + this.lyricsOffset + this.transitionOffset +
			(grm.ui.displayDetails && (grSet.detailsLyricsDisplayMode === 'arc' && !grm.details.isTurntableActive()) ? this.detailsArcUserOffset : this.userOffset);
	}

	/**
	 * 在滚动动画发生时重新绘制歌词。
	 */
	repaintRect() {
		this.lyricPaintRevision = (this.lyricPaintRevision || 0) + 1;
		if (window.IsVisible === false || !grm.details.isLyricsVisible() ||
			!(grm.ui.displayLyrics || grm.details.isTurntableActive())) return;
		// PRE42 arc lyrics live outside the ordinary cover lyric rectangle. Repainting only the
		// legacy panel leaves stale text along the CD rail, so use the full Details surface here.
		if (grm.ui.displayDetails && (grSet.detailsLyricsDisplayMode === 'arc' && !grm.details.isTurntableActive())) {
			grAnimationManager.requestRepaint();
			return;
		}
		const repaintH = grm.ui.displayLyrics && !grm.ui.displayDetails
			? Math.max(this.h + this.lineHeight, grm.ui.wh - grm.ui.lowerBarHeight - this.y + this.lineHeight * 0.5)
			: this.h + this.lineHeight;
		grAnimationManager.requestRepaint(this.x - SCALE(2), this.y - this.lineHeight * 0.5, this.w + SCALE(4), repaintH);
	}

	/**
	 * 检查歌词数组是否具有多个元素，以及播放时间是否超过下一个组的时间戳。
	 * @returns {boolean} 如果需要更新滚动，则返回true。
	 */
	scrollUpdateNeeded() {
		if (this.locus >= this.lyrics.length - 1) return false;

		let nextIndex = this.locus + 1;
		const currentSentenceGroup = this.lyrics[this.locus].sentenceGroup;

		while (nextIndex < this.lyrics.length && this.lyrics[nextIndex].sentenceGroup === currentSentenceGroup) {
			nextIndex++;
		}

		if (nextIndex < this.lyrics.length) {
			return this.playbackTime() >= this.lyrics[nextIndex].timestamp;
		}

		return false;
	}

	/**
	 * 定位到当前播放位置并高亮相应的行。
	 */
	seek() {
		this.arcFocusState = null;
		this.clearHighlight();
		const curTime = this.playbackTime();

		// Stage 6J：Seek 是不连续状态切换。立即丢弃上一句尚未完成的滚动残量和
		// 间奏倒计时缓存，避免定位已经正确后下一帧又被旧 scroll 动画拉走。
		this.newHighlighted = false;
		this.scroll = 0;
		this.scrollStart = 0;
		this.scrollElapsed = this.scrollEffectiveDuration || 0;
		this.longGapPromptLastKey = '';

		let low = 0;
		let high = this.lyrics.length - 1;
		let currentIndex = -1;

		while (low <= high) {
			const mid = Math.floor((low + high) / 2);

			if (this.lyrics[mid].timestamp <= curTime) {
				currentIndex = mid;
				low = mid + 1;
			} else {
				high = mid - 1;
			}
		}

		if (currentIndex >= 0) {
			const sg = this.lyrics[currentIndex].sentenceGroup;
			let startIndex = currentIndex;

			while (startIndex > 0 && this.lyrics[startIndex - 1].sentenceGroup === sg) {
				startIndex--;
			}

			this.locus = startIndex;
			this.translationUpdateSyncOffsets(sg);
			this.setHighlight();
		}
		else {
			this.locus = 0;
			if (this.lyrics.length) {
				this.translationUpdateSyncOffsets(this.lyrics[0].sentenceGroup);
			}
		}

		const settledSentenceGroup = currentIndex >= 0 && this.locus >= 0
			? this.lyrics[this.locus]?.sentenceGroup ?? null
			: null;
		this.lineAnimationReset(this.locus >= 0 ? this.lyrics[this.locus]?.sentenceGroup ?? null : null);
		this.karaokeBreathReset(settledSentenceGroup);

		this.repaintRect();
	}

	/**
	 * Highlights the translation line(s) within the current sentence group.
	 * When lyricsTranslationHighlightMode === 3 is enabled and both original and translation lines
	 * are visible for this group, every line in the group is highlighted together.
	 */
	setHighlight() {
		if (!this.type.synced || this.locus < 0) return;

		const wrapGroupsInGroup = [];
		const currentSentenceGroup = this.lyrics[this.locus].sentenceGroup;
		const idxStart = this.locus;
		let idxEnd = this.locus;

		while (idxEnd < this.lyrics.length - 1 && this.lyrics[idxEnd + 1].sentenceGroup === currentSentenceGroup) {
			idxEnd++;
		}

		for (let i = idxStart; i <= idxEnd; i++) {
			if (wrapGroupsInGroup[wrapGroupsInGroup.length - 1] !== this.lyrics[i].wrapGroup) {
				wrapGroupsInGroup.push(this.lyrics[i].wrapGroup);
			}
		}

		const targetWrapGroup = wrapGroupsInGroup[Math.min(grSet.lyricsTranslationHighlightMode - 1, wrapGroupsInGroup.length - 1)];
		if (targetWrapGroup === undefined) return;

		if (grSet.lyricsTranslationHighlightMode === 3 && grSet.lyricsTranslation && wrapGroupsInGroup.length > 1) {
			for (let i = idxStart; i <= idxEnd; i++) {
				this.lyrics[i].highlight = true;
			}
		} else {
			for (const lyric of this.lyrics) {
				if (lyric.wrapGroup === targetWrapGroup) {
					lyric.highlight = true;
				}
			}
		}
	}

	/**
	 * Smoothly scrolls the lyrics to the next lyric on scroll animation.
	 */
	smoothScroll(delta = 16) {
		if (!grm.details.isLyricsVisible()) return;
		// A delayed UI frame must catch up to audio time, not replay old lines.
		if (delta > 250 && this.type.synced && this.lyrics.length && this.scrollUpdateNeeded()) {
			this.seek();
			this.tickScrollDragReturn(delta);
			return;
		}

		this.translationUpdateSyncBlend(delta);
		this.karaokeBreathMaybeStart();
		if (this.lineAnimationUpdate()) {
			this.repaintRect();
		}
		if (this.karaokeBreathUpdate()) {
			this.repaintRect();
		}

		if (this.scrollUpdateNeeded()) {
			this.advanceHighLighted();
		}
		else if (this.newHighlighted) {
			this.checkScroll(delta);
		}
		// Stage 8F-R8：拖拽停止后，每帧推进延迟回弹（先等延迟阈值，再缓动归零）。
		this.tickScrollDragReturn(delta);
	}

	/**
	 * 使用计时器启动歌词滚动动画。
	 */
	start() {
		if (this.timer || !fb.IsPlaying || fb.IsPaused) return;

		if (this.translationBlendTimer) {
			grAnimationManager.remove(this.translationBlendTimer);
			this.translationBlendTimer = null;
		}

		if (this.lineAnimationActive) {
			this.lineAnimationLastTick = Date.now();
		}
		if (this.karaokeBreathActive) {
			this.karaokeBreathLastTick = Date.now();
		}

		let lastTick = grAnimationManager.now();
		this.timer = grAnimationManager.add(now => {
			const delta = Math.max(0, now - lastTick);
			lastTick = now;
			if (window.IsVisible === false || !grm.details.isLyricsVisible() ||
				!(grm.ui.displayLyrics || grm.details.isTurntableActive())) return 250;
			if (!this.init) this.smoothScroll(delta);
			else this.init = false;

			// 即使歌词滚动位置保持不变，增强型 LRC 高亮也需要持续刷新。
			const arcMoving = grm.ui.displayDetails && grSet.detailsLyricsDisplayMode === 'arc' &&
				!grm.details.isTurntableActive() && this.arcFocusState &&
				this.playbackTime() < this.arcFocusState.start + this.arcFocusState.duration;
			if (arcMoving || grSet.lyricsKaraokeMode !== 'off' && this.lyrics[this.locus]?.karaoke?.length) {
				this.repaintRect();
			}
			else if (this.updateLongGapPrompt()) {
				this.repaintRect();
			}
			return 16;
		}, 16, 'lyrics');
	}

	/**
	 * 如果计时器正在运行，则停止它。
	 */
	stop() {
		this.clearTurntableRenderingCaches();
		if (this.timer) {
			grAnimationManager.remove(this.timer);
			this.timer = null;
		}
		this.lineAnimationLastTick = 0;
		this.karaokeBreathLastTick = 0;
	}

	/**
	 * 解析增强型 LRC 的字词/字符时间戳，同时保留纯歌词文字。
	 * 支持 `<mm:ss.xx>` 增强时间戳及 ESLyric 等来源使用的行内方括号时间戳。
	 * @param {string} line - 可能包含增强时间标签的同步歌词行。
	 * @returns {{content: string, karaoke: Array<{start: number, end: number|null, text: string}>}}
	 */
	parseEnhancedLyricsContent(line) {
		const leadingMatch = line.match(Regex.LyricsTimestampLeading);
		const lyricBody = leadingMatch ? line.slice(leadingMatch[0].length) : line;
		const karaoke = [];

		// 增强型 LRC：[行时间戳]<字词时间戳>文字<字词时间戳>文字……
		const enhancedTimestamp = /<(?:\d{1,2}:)?\d{1,2}:\d{2}(?:\.\d{1,3})?>/g;
		const enhancedMatches = [...lyricBody.matchAll(enhancedTimestamp)];

		if (enhancedMatches.length) {
			for (let i = 0; i < enhancedMatches.length; i++) {
				const match = enhancedMatches[i];
				const textStart = match.index + match[0].length;
				const textEnd = i + 1 < enhancedMatches.length ? enhancedMatches[i + 1].index : lyricBody.length;
				const text = lyricBody.slice(textStart, textEnd);
				const timestampText = match[0].slice(1, -1);
				const start = this.getMilliseconds(`[${timestampText}]`);
				const end = i + 1 < enhancedMatches.length
					? this.getMilliseconds(`[${enhancedMatches[i + 1][0].slice(1, -1)}]`)
					: null;

				if (text) {
					karaoke.push({ start, end, text });
				}
			}

			return {
				content: this.tidy(line),
				karaoke
			};
		}

		// ESLyric 等来源的方括号格式：[行起点]文字[下一字词起点]文字……
		const inlineTimestamp = /\[(?:\d{1,2}:)?\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g;
		const inlineMatches = [...lyricBody.matchAll(inlineTimestamp)];

		if (inlineMatches.length && leadingMatch) {
			const leadingTimestamps = leadingMatch[0].match(Regex.PunctBracketed);
			const firstStart = leadingTimestamps?.length
				? this.getMilliseconds(leadingTimestamps[leadingTimestamps.length - 1])
				: null;

			if (firstStart !== null) {
				const firstText = lyricBody.slice(0, inlineMatches[0].index);
				if (firstText) {
					karaoke.push({
						start: firstStart,
						end: this.getMilliseconds(inlineMatches[0][0]),
						text: firstText
					});
				}
			}

			for (let i = 0; i < inlineMatches.length; i++) {
				const match = inlineMatches[i];
				const textStart = match.index + match[0].length;
				const textEnd = i + 1 < inlineMatches.length ? inlineMatches[i + 1].index : lyricBody.length;
				const text = lyricBody.slice(textStart, textEnd);
				const start = this.getMilliseconds(match[0]);
				const end = i + 1 < inlineMatches.length
					? this.getMilliseconds(inlineMatches[i + 1][0])
					: null;

				if (text) {
					karaoke.push({ start, end, text });
				}
			}

			if (karaoke.length) {
				return {
					content: this.tidy(line),
					karaoke
				};
			}
		}

		return { content: this.tidy(line), karaoke: [] };
	}

	/**
	 * 通过移除所有时间戳和增强时间戳来整理字符串。
     * @param {!string|number} n - 需要清理的包含时间戳数据的字符串。
     * @returns {!string} 清理后的原始字符串版本，没有任何时间戳。
	 */
	tidy(n) {
		return n.replace(Regex.LyricsTimestamp, '$1$4').replace(Regex.LyricsTimestampEnhanced, '$1$4').trim();
	}

	/**
	 * Keeps the compact/full reveal blend animating so dragging or wheel-scrolling the lyrics smoothly reveals translation lines.
	 */
	translationBlendAnimationReveal() {
		if (this.timer || this.translationBlendTimer ||
			!grSet.lyricsTranslation || !grSet.lyricsTranslationCurrentOnly || !grSet.lyricsTranslationScrollReveal) {
			return;
		}

		let lastTick = grAnimationManager.now();
		this.translationBlendTimer = grAnimationManager.add(now => {
			const delta = Math.max(0, now - lastTick);
			lastTick = now;
			this.translationUpdateSyncBlend(delta);

			if (this.translationSyncBlend === this.translationSyncBlendTarget) {
				grAnimationManager.remove(this.translationBlendTimer);
				this.translationBlendTimer = null;
			}
		}, 16, 'lyrics');
	}

	/**
	 * Captures the lyric line currently nearest the vertical center of the viewport, together with its current blended offset
	 * and the current scroll reference, so a compact/full reveal transition can hold that on-screen position fixed instead of
	 * drifting with the (possibly off-screen) locus line.
	 */
	translationScrollAnchorCapture() {
		if (this.locus < 0 || !this.lyrics.length) return;

		const currentTop = this.getScrollTop();
		const y = this.y + this.scroll;
		const viewCenter = (this.top + this.bot) / 2;

		let closestIndex = this.locus;
		let closestDist = Infinity;

		for (let i = 0; i < this.lyrics.length; i++) {
			const lineY = y - currentTop + this.getBlendedOffset(this.lyrics[i]);
			const dist = Math.abs(lineY - viewCenter);

			if (dist < closestDist) {
				closestDist = dist;
				closestIndex = i;
			}
		}

		this.translationScrollAnchorDragOffset = this.scrollDragOffset;
		this.translationScrollAnchorIndex = closestIndex;
		this.translationScrollAnchorOffset = this.getBlendedOffset(this.lyrics[closestIndex]);
		this.translationScrollAnchorTop = currentTop;
	}

	/**
	 * Releases the fixed scroll anchor, compensating `scrollDragOffset` so control hands back to the locus line without a visual jump.
	 * @param {boolean} [force] - When true, releases immediately regardless of the transition or `showOffset` state.
	 */
	translationScrollAnchorRelease(force = false) {
		if (this.translationScrollAnchorIndex < 0 || this.scrollDrag ||
			!force && (this.translationSyncBlend !== this.translationSyncBlendTarget || this.showOffset)) {
			return;
		}

		const anchoredTop = this.getScrollTop();
		this.translationScrollAnchorIndex = -1;
		this.scrollDragOffset += anchoredTop - this.getScrollTop();
	}

	/**
	 * Starts the auto-collapse grace period after a scroll drag ends, keeping secondary translation lines revealed
	 * for `lyricsTranslationRevealCollapse` ms so the user doesn't have to hold the mouse down to keep reading.
	 */
	translationStartAutoCollapseTimer() {
		if (!grSet.lyricsTranslation || !grSet.lyricsTranslationCurrentOnly ||
			!grSet.lyricsTranslationScrollReveal || !grSet.lyricsTranslationRevealCollapse) {
			return;
		}

		this.translationAutoCollapseHold = true;
		clearTimeout(this.translationAutoCollapseTimer);

		this.translationAutoCollapseTimer = setTimeout(() => {
			this.translationAutoCollapseHold = false;
			this.translationBlendAnimationReveal();
			this.repaintRect();
		}, grSet.lyricsTranslationRevealCollapse);
	}

	/**
	 * Tags each lyric line with `isOriginalTranslation`: true for the original line (the lowest `group` id,
	 * whichever line appeared first in the file) within its timestamp group, false for every other line sharing that timestamp.
	 * @param {Array<object>} lyrics - The parsed (pre-wrap) lyrics with `timestamp` and `group` properties.
	 */
	translationTagOriginalLines(lyrics) {
		const originalGroupByTimestamp = new Map();

		for (const lyric of lyrics) {
			const currentOriginal = originalGroupByTimestamp.get(lyric.timestamp);
			if (currentOriginal === undefined || lyric.group < currentOriginal) {
				originalGroupByTimestamp.set(lyric.timestamp, lyric.group);
			}
		}

		for (const lyric of lyrics) {
			lyric.isOriginalTranslation = lyric.group === originalGroupByTimestamp.get(lyric.timestamp);
		}
	}

	/**
	 * Updates `compactYOffset` for every line so that, when lyricsTranslationCurrentOnly is hiding secondary translation lines,
	 * no vertical gap is left where they would have been. Only the given sentence group keeps full (all-lines) height;
	 * every other group collapses to the height of its primary line.
	 * @param {number} currentSentenceGroup - The sentenceGroup that should stay fully expanded.
	 */
	translationUpdateSyncOffsets(currentSentenceGroup) {
		if (!this.type.synced || !grSet.lyricsTranslation || !grSet.lyricsTranslationCurrentOnly ||
			this.translationSyncAppliedGroup === currentSentenceGroup) {
			return;
		}

		this.translationSyncAppliedGroup = currentSentenceGroup;

		let cumulativeY = 0;
		let prevSentenceGroup = null;

		for (let i = 0; i < this.lyrics.length; i++) {
			const lyric = this.lyrics[i];
			const isVisible = lyric.sentenceGroup === currentSentenceGroup || lyric.isOriginalTranslation !== false;

			if (prevSentenceGroup !== null && lyric.sentenceGroup !== prevSentenceGroup) {
				cumulativeY += this.translationLyrics ? this.sentenceSpacing : this.sentenceSpacing * 0.5;
			}

			lyric.compactYOffset = cumulativeY;
			if (isVisible) {
				// Hidden translations consume no height; every visible line uses the native line spacing.
				const nextLyric = this.lyrics[i + 1];
				const nextVisible = nextLyric && (nextLyric.sentenceGroup === currentSentenceGroup || nextLyric.isOriginalTranslation !== false);
				cumulativeY += this.lineHeight * (nextVisible ? this.getTranslationLineAdvanceFactor(lyric, nextLyric) : 1);
			}

			prevSentenceGroup = lyric.sentenceGroup;
		}
	}

	/**
	 * Advances the compact/full layout blend used to smoothly reveal or hide secondary translation lines when the
	 * effective sync-only state changes (e.g. a scroll drag starts/stops while lyricsTranslationScrollReveal is on).
	 * Runs on the same per-tick timer as the scroll-easing animation, so it only advances while playback is active.
	 */
	translationUpdateSyncBlend(delta = 16) {
		if (!grSet.lyricsTranslation || !grSet.lyricsTranslationCurrentOnly) {
			return;
		}

		const target = this.isSyncOnlyActive() ? 0 : 1;

		if (target !== this.translationSyncBlendTarget) {
			this.translationScrollAnchorCapture();
			this.translationSyncBlendTarget = target;
			this.translationSyncBlendStart = this.translationSyncBlend;
			this.translationSyncBlendElapsed = 0;
		}

		if (this.translationSyncBlend !== this.translationSyncBlendTarget) {
			this.translationSyncBlendElapsed += delta;
			const t = Math.min(this.translationSyncBlendElapsed / grSet.lyricsTranslationRevealDuration, 1);
			const easing = Easing(grSet.lyricsScrollEasing, t);

			this.translationSyncBlend = t >= 1
				? this.translationSyncBlendTarget
				: Lerp(this.translationSyncBlendStart, this.translationSyncBlendTarget, easing);

			this.repaintRect();
		}

		this.translationScrollAnchorRelease();
	}

	/**
	 * Updates the visible bounds whenever size or position changed.
	 */
	updateLyricsBounds() {
		if (!this.lineHeight) return;

		const linesDrawn = Math.floor(this.h / this.lineHeight);
		const oddNumLines = linesDrawn % 2;

		this.locusOffset = this.h / 2 - (oddNumLines ? this.lineHeight / 2 : this.lineHeight);
		this.top = this.locusOffset - this.lineHeight * (Math.floor(linesDrawn / 2) - (oddNumLines ? 1 : 2)) + this.y - this.lineHeight;
		this.bot = this.top + this.lineHeight * (linesDrawn - 2);
	}
	// #endregion

	// * 回调 * //
	// #region 回调
	/**
     * 当左鼠标按钮按下时，启动滚动拖拽操作。
	 * @param {number} x - x坐标。
	 * @param {number} y - y坐标。
	 * @param {number} m - 鼠标掩码。
	 */
	on_mouse_lbtn_down(x, y, m) {
		this.scrollDrag = true;
		// Stage 8F-R8：再次按下拖拽时，取消可能仍在进行的自动回位与延迟回弹计时。
		this.scrollDragReturning = false;
		this.scrollDragReturnArmed = false;
		this.scrollDragY = y;
		this.translationAutoCollapseHold = false;
		clearTimeout(this.translationAutoCollapseTimer);
		this.translationBlendAnimationReveal();
	}

	/**
	 * 当左鼠标按钮释放时，释放滚动拖拽操作。
	 * @param {number} x - x坐标。
	 * @param {number} y - y坐标。
	 * @param {number} m - 鼠标掩码。
	 */
	on_mouse_lbtn_up(x, y, m) {
		this.scrollDrag = false;
		// Stage 8F-R8：松手后延迟回弹到当前播放行（默认 2s，可由 scrollDragReturnDelay 配置）。
		this.startScrollDragReturn();
		this.translationStartAutoCollapseTimer();
		this.translationBlendAnimationReveal();
	}

	/**
	* 当鼠标离开时，结束滚动拖拽操作。
	 */
	on_mouse_leave() {
		if (this.scrollDrag) {
			this.scrollDrag = false;
			// Stage 8F-R8：鼠标离开后延迟回弹到当前播放行（默认 2s，可由 scrollDragReturnDelay 配置）。
			this.startScrollDragReturn();
			this.translationStartAutoCollapseTimer();
			this.translationBlendAnimationReveal();
		}

		this.clearFullLayoutEdgeLeaveTimer();

		if (grSet.lyricsLayout !== 'full' || !grm.ui.mouseInLyricsFullLayoutEdge) {
			return;
		}

		grm.ui.lyricsFullLayoutEdgeLeaveTimer = setTimeout(() => {
			grm.ui.lyricsFullLayoutEdgeLeaveTimer = null;
			if (grSet.lyricsLayout === 'full' && grm.ui.displayLyrics) {
				grm.ui.mouseInLyricsFullLayoutEdge = false;
				grm.debug.repaintWindow();
			}
		}, 0); // 歌词完整布局边缘离开计时器清除，原值2000
	}

	/**
	 * 在拖拽操作期间，当鼠标移动时更新滚动位置。
	 * @param {number} x - x坐标。
	 * @param {number} y - y坐标。
	 * @param {number} m - 鼠标掩码。
	 */
	on_mouse_move(x, y, m) {
		this.clearFullLayoutEdgeLeaveTimer();

		if (!this.scrollDrag) return;

		if (utils.IsKeyPressed(VKey.MENU)) {
			this.scrollDragOffset = 0;
			this.userOffset = 0;
		} else {
			this.scrollDragOffset += (y - this.scrollDragY);
			this.scrollDragY = y;
		}

		this.repaintRect();
	}

	/**
	 * 调整用户偏移量，更新显示，并定位到新位置。
	 * @param {number} step - 应执行的滚动偏移量。
	 */
	on_mouse_wheel(step, detailsArc = false) {
		// Only the CD arc owns a separate clock offset; the turntable uses userOffset.
		detailsArc = detailsArc && grm.ui.displayDetails && grSet.detailsLyricsDisplayMode === 'arc' && !grm.details.isTurntableActive();
		const scrollStepOffset = utils.IsKeyPressed(VKey.SHIFT) ? 5000 : this.type.synced ? 500 : 1000;
		step *= Clamp(Math.round(scrollStepOffset / ((Date.now() - this.stepTime) * 5)), 1, 5);
		this.stepTime = Date.now();
		this.offsetWheelIsArc = detailsArc;
		if (detailsArc) this.detailsArcUserOffset += scrollStepOffset * -step;
		else this.userOffset += scrollStepOffset * -step;

		const offset = detailsArc ? this.detailsArcUserOffset : this.userOffset;
		if (!offset) this.repaintRect();
		this.showOffset = this.type.synced && offset !== 0;

		this.translationBlendAnimationReveal();

		clearTimeout(this.showOffsetTimer);
		this.showOffsetTimer = setTimeout(() => {
			this.showOffset = false;
			this.translationBlendAnimationReveal();
			this.repaintRect();
		}, 5000);

        this.translationScrollAnchorRelease(true);
		this.seek();
	}

	/**
	 * 检查播放是否暂停，并相应停止或启动。
	 * @param {boolean} isPaused - 播放当前是否暂停。
	 */
	on_playback_pause(isPaused) {
		if (isPaused) {
			this.stop();
			this.translationBlendAnimationReveal();
		}
		else {
			this.start();
		}
	}

	/**
	 * 停止播放。
	 * @param {number} reason - 播放停止的类型。
	 */
	on_playback_stop(reason) {
		this.stop();
		this.trackThemeColorGateActive = false;
		this.trackThemeColorGateTrackKey = '';
		this.stableLyricsHighlightColor = null;
		this.stableLyricsHighlightCandidate = null;
		this.stableLyricsHighlightCandidateSince = 0;
		this.stableLyricsHighlightCandidateChanges = 0;
		this.stableLyricsHighlightThemeKey = this.getLyricsHighlightSnapshotContextKey();
		this.newHighlighted = false;
		this.scroll = 0;
		this.scrollStart = 0;
		this.scrollElapsed = this.scrollEffectiveDuration || 0;
		this.longGapPromptLastKey = '';
		this.lineAnimationReset();
		this.karaokeBreathReset();
	}

	/**
	 * 调整歌词对象的大小和位置并重新绘制。
	 * @param {number} x - x坐标。
	 * @param {number} y - y坐标。
	 * @param {number} w - 宽度。
	 * @param {number} h - 高度。
	 */
	on_size(x, y, w, h) {
		const oldLocusOffset = this.locusOffset;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.updateLyricsBounds();
		// Bilingual reveal may hold a scroll anchor from the smaller window.
		// Move that anchor with the new focus position, preserving its timeline.
		if (this.translationScrollAnchorIndex >= 0 && Number.isFinite(oldLocusOffset) &&
			Number.isFinite(this.locusOffset) && Number.isFinite(this.translationScrollAnchorTop)) {
			this.translationScrollAnchorTop -= this.locusOffset - oldLocusOffset;
		}
	}	// #endregion
}
