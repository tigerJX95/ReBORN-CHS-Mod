/////////////////////////////////////////////////////////////////////////////////
// * Georgia-ReBORN: A Clean - Full Dynamic Color Reborn - Foobar2000 Player * //
// * Description:    Georgia-ReBORN Details                                  * //
// * Author:         TT                                                      * //
// * Website:        https://github.com/TT-ReBORN/Georgia-ReBORN             * //
// * Version:        3.0-x64-DEV                                             * //
// * Dev. started:   22-12-2017                                              * //
// * Last change:    17-07-2026                                              * //
/////////////////////////////////////////////////////////////////////////////////


'use strict';

/** Shared clock for the Details, disc and lyric visual animations. */
const grAnimationManager = new class {
	constructor() {
		this.jobs = new Map();
		this.timer = null;
		this.nextId = 1;
		this.resizing = false;
		this.resizeTimer = null;
		this.paintAverage = 0;
		this.paintWorst = 0;
		this.paintCount = 0;
		this.paintModes = {};
		this.paintPressure = 0;
		this.paintSlowFrames = 0;
		this.paintRecoveryFrames = 0;
		this.paintPending = false;
		this.repaintTimer = null;
		this.dirtyRect = null;
		this.closed = false;
		this.windowHidden = false;
		this.lastPlaybackPulseAt = 0;
	}

	now() {
		return typeof performance !== 'undefined' && typeof performance.now === 'function' ?
			performance.now() : Date.now();
	}

	/** Window hiding is a lifecycle pause, never a slow queued animation frame. */
	syncWindowVisibility(visible = window.IsVisible !== false && window.Width > 0 && window.Height > 0) {
		if (this.closed) return false;
		const hidden = !visible;
		if (hidden === this.windowHidden) return false;
		this.windowHidden = hidden;
		const now = this.now();
		// Native invalidations may be discarded while minimized. Drop their stale ownership.
		this.paintPending = false;
		this.paintRequestedAt = 0;
		if (this.repaintTimer !== null) clearTimeout(this.repaintTimer);
		this.repaintTimer = null;
		this.dirtyRect = null;
		const details = grm.details;
		if (details) {
			details.turntablePaintPending = false;
			details.turntablePaintRequestedAt = 0;
			details.turntableLastTick = now;
			details.turntableLastPaintAt = now;
			details.turntableHealthySince = 0;
			details.turntableHealthyPaints = 0;
		}
		if (hidden) return false;
		// Restore the visible cadence, without replaying hidden frames or clearing real overload.
		if (!details?.turntableSuspended) {
			this.paintPressure = 0;
			this.paintSlowFrames = this.paintRecoveryFrames = 0;
		}
		for (const job of this.jobs.values()) {
			if (job.role === 'turntable' && details) job.interval = details.getTurntableRefreshDelay();
			job.due = now + Math.max(16, job.interval);
		}
		if (details?.isTurntableActive()) details.updateTurntableState();
		this.schedule();
		return true;
	}


	/** Recover the paint scheduler after Windows lock/unlock without rebuilding artwork. */
	wakeAfterDesktopResume(reason = 'focus') {
		if (this.closed || window.IsVisible === false || window.Width <= 0 || window.Height <= 0) return;
		const now = this.now();
		// A lock screen need not produce an IsVisible transition. Discard the
		// native paint request which may have been lost while the screen was locked.
		this.paintPending = false;
		this.paintRequestedAt = 0;
		if (this.repaintTimer !== null) clearTimeout(this.repaintTimer);
		this.repaintTimer = null;
		this.dirtyRect = null;
		const details = grm.details;
		if (details) {
			details.turntablePaintPending = false;
			details.turntablePaintRequestedAt = 0;
			details.turntableLastTick = now;
			details.turntableLastPaintAt = now;
		}
		for (const job of this.jobs.values()) {
			if (job.role === 'turntable' && details) job.interval = details.getTurntableRefreshDelay();
			job.due = now + Math.max(16, job.interval);
		}
		if (details?.isTurntableActive()) details.updateTurntableState();
		this.schedule();
		this.requestRepaint();
	}

	/** A long playback callback gap is a conservative lock/suspend indicator. */
	observePlaybackPulse() {
		const now = this.now();
		const gap = this.lastPlaybackPulseAt ? now - this.lastPlaybackPulseAt : 0;
		this.lastPlaybackPulseAt = now;
		if (gap > 8000) this.wakeAfterDesktopResume('playback-gap');
	}

	add(callback, period, role = 'visual') {
		if (this.closed) return null;
		const id = this.nextId++;
		const interval = Math.max(16, Number.isFinite(period) ? period : 30);
		this.jobs.set(id, { callback, interval, role, due: this.now() + interval });
		this.schedule();
		return id;
	}

	remove(id) {
		this.jobs.delete(id);
		this.schedule();
	}

	beginResize() {
		if (!this.resizing && grm.details) grm.details.prepareForResize();
		this.resizing = true;
		if (this.resizeTimer !== null) clearTimeout(this.resizeTimer);
		this.schedule();
		this.resizeTimer = setTimeout(() => {
			this.resizeTimer = null;
			this.resizing = false;
			if (grm.details) grm.details.finishResize();
			this.schedule();
			this.flushRepaint();
		}, 150);
	}

	schedule() {
		if (this.timer !== null) clearTimeout(this.timer);
		this.timer = null;
		if (this.closed || this.resizing || !this.jobs.size) return;
		let next = Infinity;
		for (const job of this.jobs.values()) if (job.due < next) next = job.due;
		this.timer = setTimeout(() => this.tick(), Math.max(1, next - this.now()));
	}

	tick() {
		this.timer = null;
		this.syncWindowVisibility();
		if (this.resizing) return;
		const now = this.now();
		for (const [id, job] of Array.from(this.jobs)) {
			if (!this.jobs.has(id) || job.due > now) continue;
			// Advance by elapsed time. Late frames are dropped rather than replayed.
			job.due = now + job.interval;
			let nextInterval;
			try { nextInterval = job.callback(now); }
			catch (e) {
				this.jobs.delete(id);
				console.log(`TT FIX17 动画任务已停止：${e.message || e}`);
				if (job.role === 'turntable' && grm.details) grm.details.suspendTurntableAnimation(`动画任务异常：${e.message || e}`);
				continue;
			}
			if (this.jobs.get(id) === job) {
				if (Number.isFinite(nextInterval)) job.interval = Math.max(16, nextInterval);
				// Disc overload must not throttle lyrics or its own recovery observer.
				const turntable = grm.details && grm.details.isTurntableActive();
				const pressure = turntable && job.role === 'turntable' ? grm.details.getTurntableRefreshDelay()
					: turntable && job.role !== 'recovery' ? 30 : 16;
				const delay = Math.max(job.interval, pressure, this.paintPressure, window.IsVisible === false ? 250 : 0);
				const finished = this.now();
				// Preserve the requested cadence while leaving an idle gap after
				// an overrun. Never replay missed frames or schedule a 1 ms burst.
				job.due = grm.details && grm.details.isTurntableActive()
					? Math.max(now + delay, finished + Math.min(16, delay * 0.25))
					: finished + delay;
			}
		}
		this.schedule();
	}

	/** Coalesce disc and lyric invalidations; retain at most one pending paint. */
	requestRepaint(x, y, w, h) {
		if (this.closed || window.IsVisible === false) return;
		const full = ![x, y, w, h].every(Number.isFinite);
		if (!full && (w <= 0 || h <= 0)) return;
		const r = full ? { full: true } : { x, y, w, h };
		const d = this.dirtyRect;
		if (!d || full) this.dirtyRect = r;
		else if (!d.full) {
			const right = Math.max(d.x + d.w, x + w), bottom = Math.max(d.y + d.h, y + h);
			d.x = Math.min(d.x, x); d.y = Math.min(d.y, y);
			d.w = right - d.x; d.h = bottom - d.y;
		}
		if (this.paintPending && this.now() - this.paintRequestedAt > 2000) this.paintPending = false;
		this.flushRepaint();
	}

	flushRepaint() {
		if (this.closed || this.resizing || this.paintPending || this.repaintTimer !== null || !this.dirtyRect) return;
		this.repaintTimer = setTimeout(() => {
			this.repaintTimer = null;
			if (this.closed || window.IsVisible === false || this.resizing) return;
			const r = this.dirtyRect;
			this.dirtyRect = null;
			if (!r) return;
			this.paintPending = true; this.paintRequestedAt = this.now();
			this.lastRepaintAt = this.paintRequestedAt;
			if (r.full) window.Repaint();
			else window.RepaintRect(Math.floor(r.x), Math.floor(r.y), Math.ceil(r.x + r.w) - Math.floor(r.x), Math.ceil(r.y + r.h) - Math.floor(r.y));
		}, Math.max(0, Math.max(grm.details && grm.details.isTurntableActive() ? 30 : 16, this.paintPressure) -
			(this.now() - (this.lastRepaintAt ?? -Infinity))));
	}

	reportPaint(started) {
		const cost = Math.max(0, this.now() - started);
		this.paintCount++;
		const mode = grm.ui?.displayLibrary ? '曲库' : grm.ui?.displayDetails ? '详情' : '其他';
		const stats = this.paintModes[mode] || (this.paintModes[mode] = { count: 0, average: 0, worst: 0 });
		stats.count++; stats.average = stats.average ? stats.average * 0.9 + cost * 0.1 : cost; stats.worst = Math.max(stats.worst, cost);
		this.paintWorst = Math.max(this.paintWorst, cost);
		this.paintAverage = this.paintAverage ? this.paintAverage * 0.9 + cost * 0.1 : cost;
		this.paintPending = false;
		if (!this.resizing) {
			const base = grm.details && grm.details.isTurntableActive() ? Math.max(30, Number(grSet.spinDiscArtRedrawInterval) || 30) : 16;
			this.paintSlowFrames = cost > base * 0.75 ? this.paintSlowFrames + 1 : 0;
			if (cost >= 250 || this.paintSlowFrames >= 6) {
				this.paintPressure = Math.min(250, Math.max(base, Math.ceil(this.paintAverage * 2)));
				this.paintRecoveryFrames = 0;
			} else if (cost < base * 0.75 && ++this.paintRecoveryFrames >= 30) {
				this.paintPressure = this.paintPressure > base ? Math.round(this.paintPressure * 0.75) : 0;
				this.paintRecoveryFrames = 0;
			}
		}
		this.flushRepaint();
	}

	shutdown() {
		this.closed = true;
		for (const timer of [this.timer, this.resizeTimer, this.repaintTimer]) if (timer !== null) clearTimeout(timer);
		this.timer = this.resizeTimer = this.repaintTimer = null;
		this.jobs.clear(); this.dirtyRect = null; this.paintPending = false;
	}
}();


////////////////////////////////
// * DETAILS USER INTERFACE * //
////////////////////////////////
/**
 * A class that is responsible for the Details panel.
 */
class Details {
	/**
	 * Creates the `Details` instance.
	 */
	constructor() {
		// Turntable PRE1: panel properties persist separately from existing TT settings.
		this.turntableMode = window.GetProperty('TT 唱机原型 PRE1：启用', false);
		this.turntableArtwork = window.GetProperty('TT 唱机原型 PRE1：图像', 'cover');
		this.turntableLyricsEnabled = window.GetProperty('TT 唱机：滚动歌词', true);
		this.turntableLyricsInitTimer = null;
		this.turntableAngle = 0;
		this.turntableArm = 0;
		this.turntableJob = null;
		this.turntableLastTick = 0;
		this.turntableWasRunning = false;
		this.turntableBounds = null;
		this.turntableLastDrawGeometry = null;
		this.turntableResizeFrame = null;
		this.turntableControlPressed = null;
		this.turntableShadow = null;
		this.turntableShadowKey = '';
		this.turntableRecord = null;
		this.turntableSource = null;
		this.turntableCacheKey = '';
		this.turntableMatrix = new Float32Array(6);
		this.turntablePaintPending = false;
		this.turntablePaintRequestedAt = 0;
		this.turntablePaintAverage = 0;
		this.turntablePaintWorst = 0;
		this.turntableSlowFrames = 0;
		this.turntableRecoveryFrames = 0;
		this.turntableRedrawDelay = 30;
		this.turntableSuspended = false;
		this.turntableSuspendReason = '';
		this.turntableRecoveryJob = null;
		this.turntableRecoveryBackoff = 3000;
		this.turntableRecoveryDiagnosticsAt = 0;
		this.turntableResumedAt = 0;
		this.turntableBuildCounts = { record: 0, chassis: 0, arm: 0, shadow: 0 };
		// * GEOMETRY * //
		// #region GEOMETRY
		/** @public @type {number} The size of the disc art shadow. */
		this.discArtShadow = SCALE(6);
		/** @public @type {number} The margin width from the edge of the player to start of the metadata grid strings. */
		this.gridMarginLeft = grm.ui.edgeMargin;
		/** @public @type {number} The margin width from the edge of the metadata grid to the end of the metadata grid strings. */
		this.gridMarginRight = SCALE(20);
		/** @public @type {number} The spacing between grid lines in the metadata grid. */
		this.gridLineSpacing = SCALE(30);
		/** @public @type {number} The horizontal spacing between the track number and the artist in the metadata grid. */
		this.gridTrackNumSpacing = SCALE(8);
		/** @public @type {number} The height of the metadata grid tooltip area. */
		this.gridTooltipHeight = SCALE(100);
		/** @public @type {number} The responsive scale used by artist, title and album text. */
		this.detailsHeroScale = 1;
		/** @public @type {number} The restrained responsive scale used by metadata and spacing. */
		this.detailsInfoScale = 1;
		/** @public @type {number} The restrained responsive scale used by the band logo. */
		this.detailsLogoScale = 1;
		/** @private @type {string} The last responsive font signature. */
		this.detailsResponsiveFontKey = '';
		/** @private @type {object} References used to detect an external font refresh. */
		this.detailsResponsiveFontRefs = {};
		/** @private @type {string} Theme signature used to invalidate D2D-only disc composites. */
		this.discArtThemeVisualKey = '';
		/** @private @type {number} The vertical gap between metadata rows. */
		this.gridRowGap = 5;
		/** @public @type {number} The top starting fixed position of the metadata grid. */
		this.gridTopStart = 0;
		/** @public @type {number} The top dynamic position of the metadata grid. */
		this.gridTop = 0;
		/** @public @type {number} The width of the metadata grid content. */
		this.gridContentWidth = 0;
		/** @public @type {number} The width of the country flag size in the metadata grid. */
		this.gridFlagSizeW = 0;
		/** @public @type {number} The white space size for the country flag in the metadata grid. */
		this.gridFlagSizeWhiteSpace = 0;
		/** @public @type {number} The text rectangle for string calculation in the metadata grid. */
		this.gridTxtRec = 0;
		/** @public @type {number} The top position of the artist in the metadata grid. */
		this.gridArtistTop = 0;
		/** @public @type {number} The bottom position of the artist in the metadata grid. */
		this.gridArtistBottom = 0;
		/** @public @type {object} The calculated artist wrap info for the metadata grid. */
		this.gridArtistWrapInfo = {};
		/** @public @type {boolean} The state when the artist string exceeds the available lines in the metadata grid. */
		this.gridArtistWrapLinesExceed = false;
		/** @public @type {number} The width of the wrap space within the artist string in the metadata grid. */
		this.gridArtistWrapWidth = 0;
		/** @public @type {number} The width of the artist in the metadata grid. */
		this.gridArtistWidth = 0;
		/** @public @type {number} The height of the artist in the metadata grid. */
		this.gridArtistHeight = 0;
		/** @public @type {number} The text rectangle for artist string calculation in the metadata grid. */
		this.gridArtistTxtRec = 0;
		/** @public @type {number} The number of lines for the artist text in the metadata grid. */
		this.gridArtistNumLines = 0;
		/** @public @type {number} The height of the artist number of lines in the metadata grid. */
		this.gridArtistNumLinesHeight = 0;
		/** @public @type {number} The top position of the track title in the metadata grid. */
		this.gridTitleTop = 0;
		/** @public @type {number} The bottom position of the track title in the metadata grid. */
		this.gridTitleBottom = 0;
		/** @public @type {number} The width of the track number in the metadata grid. */
		this.gridTrackNumWidth = 0;
		/** @public @type {object} The calculated track title wrap info for the metadata grid. */
		this.gridTitleWrapInfo = {};
		/** @public @type {boolean} The state when the track title string exceeds the available lines in the metadata grid. */
		this.gridTitleWrapLinesExceed = false;
		/** @public @type {number} The width of the wrap space within the track title string in the metadata grid. */
		this.gridTitleWrapWidth = 0;
		/** @public @type {number} The width of the track title in the metadata grid. */
		this.gridTitleWidth = 0;
		/** @public @type {number} The height of the track title in the metadata grid. */
		this.gridTitleHeight = 0;
		/** @public @type {number} The text rectangle for track title string calculation in the metadata grid. */
		this.gridTitleTxtRec = 0;
		/** @public @type {number} The number of lines for the track title text in the metadata grid. */
		this.gridTitleNumLines = 0;
		/** @public @type {number} The height of the track title number of lines in the metadata grid. */
		this.gridTitleNumLinesHeight = 0;
		/** @public @type {number} The top position of the album in the metadata grid. */
		this.gridAlbumTop = 0;
		/** @public @type {number} The bottom position of the album in the metadata grid. */
		this.gridAlbumBottom = 0;
		/** @public @type {object} The calculated album wrap info for the metadata grid. */
		this.gridAlbumWrapInfo = {};
		/** @public @type {boolean} The state when the album string exceeds the available lines in the metadata grid. */
		this.gridAlbumWrapLinesExceed = false;
		/** @public @type {number} The width of the wrap space within the album string in the metadata grid. */
		this.gridAlbumWrapWidth = 0;
		/** @public @type {number} The width of the album in the metadata grid. */
		this.gridAlbumWidth = 0;
		/** @public @type {number} The height of the album in the metadata grid. */
		this.gridAlbumHeight = 0;
		/** @public @type {number} The text rectangle for album string calculation in the metadata grid. */
		this.gridAlbumTxtRec = 0;
		/** @public @type {number} The number of lines for the album text in the metadata grid. */
		this.gridAlbumNumLines = 0;
		/** @public @type {number} The height of the album number of lines in the metadata grid. */
		this.gridAlbumNumLinesHeight = 0;
		/** @public @type {number} The margin between grid columns in the metadata grid. */
		this.gridColumnMargin = SCALE(10);
		/** @public @type {number} The top position of the grid columns in the metadata grid. */
		this.gridColumnTop = 0;
		/** @public @type {number} The height of the grid column cell in the metadata grid. */
		this.gridColumnCellHeight = 0;
		/** @public @type {number} The width of the key strings column in the metadata grid. */
		this.gridColumnKeyWidth = 0;
		/** @public @type {number} The height of the key strings in the metadata grid. */
		this.gridColumnKeyHeight = 0;
		/** @public @type {number} The bottom position of the key strings in the metadata grid. */
		this.gridColumnKeyBottom = 0;
		/** @public @type {number} The width of the value strings column in the metadata grid. */
		this.gridColumnValueWidth = 0;
		/** @public @type {number} The height of the value strings in the metadata grid. */
		this.gridColumnValueHeight = 0;
		/** @public @type {number} The left position of the value strings column in the metadata grid. */
		this.gridColumnValueLeft = 0;
		/** @public @type {number} The bottom position of the value strings in the metadata grid. */
		this.gridColumnValueBottom = 0;

		// * TIMELINE * //
		// #region TIMELINE
		/** @public @type {number} The x-coordinate of the timeline. */
		this.timelineX = 0;
		/** @public @type {number} The y-coordinate of the timeline. */
		this.timelineY = 0;
		/** @public @type {number} The width of the timeline. */
		this.timelineW = 0;
		/** @public @type {number} The height of the timeline. */
		this.timelineH = SCALE(8);
		/** @public @type {number} The color of the played portion of the timeline. */
		this.timelinePlayCol = RGBA(255, 255, 255, 150);
		/** @public @type {number} The ratio of the first played segment in the timeline. */
		this.timelineFirstPlayedRatio = 0;
		/** @public @type {number} The ratio of the last played segment in the timeline. */
		this.timelineLastPlayedRatio = 0;
		/** @public @type {number} The percentage of the first played segment in the timeline. */
		this.timelineFirstPlayedPercent = 0.33;
		/** @public @type {number} The percentage of the last played segment in the timeline. */
		this.timelineLastPlayedPercent = 0.66;
		/** @public @type {number[]} The percentages of the played times on the timeline. */
		this.timelinePlayedTimesPercents = [];
		/** @public @type {number[]} The actual played times on the timeline. */
		this.timelinePlayedTimes = [];
		/** @public @type {number} The width of the timeline line. */
		this.timelineLineWidth = HD_4K(2, 3);
		/** @public @type {number} The extra left space on the timeline. */
		this.timelineExtraLeftSpace = SCALE(3);
		/** @public @type {number} The draw width of the timeline. */
		this.timelineDrawWidth = 0;
		/** @public @type {number} The leeway of the timeline. */
		this.timelineLeeway = 0;
		// #endregion

		// * CACHE * //
		// #region CACHE
		/** @public @type {object} The caching object of the calculated text wrap space for the metadata grid. */
		this.cachedGridWrapSpace = {};
		/** @public @type {boolean} The calculated metadata grid metrics saved so we don't have to recalculate every on every on_paint unless size or metadata changed. */
		this.cachedGridMetrics = false;
		/** @public @type {number} The left edge of the record labels in Details. Saved so we don't have to recalculate every on every on_paint unless size has changed. */
		this.cachedLabelLastLeftEdge = 0;
		/** @public @type {number} The last label height of the record labels in Details. Saved so we don't have to recalculate every on every on_paint unless size has changed. */
		this.cachedLabelLastHeight = 0;
		/** @private @type {{x:number,y:number,w:number,h:number}|null} Painted record-label footprint. */
		this.labelLogoPaintBounds = null;
		/** @private @type {number|null} Rate-limited full logo repair while the disc moves. */
		this.labelLogoRepairTimer = null;
		this.labelLogoRepairLastAt = 0;
		this.gridLogoImageCache = new Map();
		this.discArtAlbumArtMaskCache = null;
		// #endregion

		// * IMAGES * //
		// #region IMAGES
		/** @public @type {GdiBitmap} The disc art image used in Details. */
		this.discArt = null;
		/** @public @type {GdiBitmap} The disc art album cover image used in Details. */
		this.discArtCover = null;
		/** @public @type {GdiBitmap[]} The array of disc art images used in Details. */
		this.discArtArray = [];
		/** @public @type {number} The scale factor of the disc art used in Details. */
		this.discArtScaleFactor = 0;
		/** @private @type {{image: GdiBitmap|null, size: number}} The shadow behind the disc art used in Details. */
		this.discArtShadowImg = { image: null, size: 0 }
		/** @public @type {object} The disc art position used in Details (offset from albumArtSize). */
		this.discArtSize = new ImageSize(0, 0, 0, 0);
		/** @public @type {GdiBitmap} The rotated disc art from the RotateImg helper used in Details. */
		this.discArtRotation = null;
		/** @public @type {number} The global index of current discArtArray img to draw used in Details. */
		this.discArtRotationIndex = 0;
		/** @public @type {GdiBitmap|null} The unrotated, resized disc art D2D source image for the transform rotation. */
		this.discArtD2DImage = null;
		/** @public @type {number} The current rotation angle in degrees for the D2D disc art transform rotation. */
		this.discArtD2DRotationAngle = 0;
		/** @private @type {number} Continuous, renderer-independent disc rotation angle. */
		this.discArtRotationAngle = 0;
		/** @private @type {number} Timestamp from which the continuous rotation angle is measured. */
		this.discArtRotationEpoch = 0;
		/** @public @type {number} The pre-allocated matrix buffer for the D2D disc art transform rotation. */
		this.discArtD2DRotationMatrix = new Float32Array(6);
		/** @private @type {GdiBitmap} The release country flag image shown in the metadata grid in Details. */
		this.gridReleaseFlagImg = null;
		/** @private @type {GdiBitmap} The codec logo image shown in the metadata grid in Details. */
		this.gridCodecLogo = null;
		/** @private @type {GdiBitmap} The channel logo image shown in the metadata grid in Details. */
		this.gridChannelLogo = null;
		/** @public @type {GdiBitmap} The band logo image used in Details. */
		this.bandLogo = null;
		/** @public @type {GdiBitmap} The inverted band logo image shown in Details. */
		this.bandLogoInverted = null;
		/** @private @type {{black:boolean, white:boolean}} Cached monochrome tones. */
		this.bandLogoTones = { black: false, white: false };
		this.bandLogoInvertedTones = { black: false, white: false };
		/** @public @type {GdiBitmap[]} The array of record label images used in Details. */
		this.labelLogo = [];
		/** @public @type {GdiBitmap[]} The array of inverted record label images used in Details. */
		this.labelLogoInverted = [];
		/** @private @type {Array<{black:boolean, white:boolean}>} Cached monochrome tones. */
		this.labelLogoTones = [];
		this.labelLogoInvertedTones = [];
		/** @private @type {GdiBitmap[]|null} Incoming record label images held until a track-change disc entry settles. */
		this.pendingLabelLogo = null;
		/** @private @type {GdiBitmap[]|null} Inverted incoming record label images held for the same atomic commit. */
		this.pendingLabelLogoInverted = null;
		/** @private @type {GdiBitmap} The shadow behind labels used in Details. */
		this.labelShadowImg = null;
		/** @private @type {boolean|null} Last record-label layout mode; used to invalidate incompatible shadows. */
		this.labelLogoCompactMode = null;
		/** @private @type {Object<number, {width:number, budget:number, spacing:number, widths:number[], sourceKey:string}>} TT logo sizes and layout budget last drawn in a normal window, grouped by logo count. */
		this.labelLogoWindowedMetrics = {};
		this.labelLogoVisibleBounds = [];
		/** @private @type {string} Compact label panel dimensions/color used by its cached shadow. */
		this.labelLogoCompactShadowKey = '';
		/** @private @type {number|null} Coalesced full repaint after a label-layout state change. */
		this.labelLogoLayoutRepaintTimer = null;
		/** @private @type {number|null} Delayed repaint after asynchronous Details geometry settles. */
		this.labelLogoSettleRepaintTimer = null;
		// #endregion

		// * STATE * //
		// #region STATE
		/** @private @type {boolean} The state when disc art was found on hard drive used in Details. */
		this.discArtFound = false;
		/** @private @type {string} The cache key (album folder|disc number|vinyl side) for which the on-disk disc art search was last resolved; lets findDiscArtPath() skip re-globbing for tracks that share all three - e.g. every track on the same disc when discArtEmbedded triggers a per-track re-check. */
		this.discArtDiskCacheKey = '';
		/** @private @type {string} The last resolved on-disk disc art path for discArtDiskCacheKey, meaningful only when discArtDiskCachedFound is true. */
		this.discArtDiskCachedPath = '';
		/** @private @type {boolean} The state when an on-disk disc art file was actually found for discArtDiskCacheKey. */
		this.discArtDiskCachedFound = false;
		/** @public @type {boolean} The last.fm logo image displayed when we %lastfm_play_count% > 0, shown in the metadata grid in Details. */
		this.playCountVerifiedByLastFm = false;
		/** @public @type {object} The boundary section object contains check functions for different sections of the metadata grid. */
		this.gridSectionBounds = {
			artist:   (x, y) => x >= this.gridMarginLeft && x <= (this.gridMarginLeft + this.gridContentWidth)   && y >= this.gridArtistTop   && y <= this.gridArtistBottom,
			title:    (x, y) => x >= this.gridMarginLeft && x <= (this.gridMarginLeft + this.gridContentWidth)   && y >= this.gridTitleTop    && y <= this.gridTitleBottom,
			album:    (x, y) => x >= this.gridMarginLeft && x <= (this.gridMarginLeft + this.gridContentWidth)   && y >= this.gridAlbumTop    && y <= this.gridAlbumBottom,
			tagKey:   (x, y) => x >= this.gridMarginLeft && x <= (this.gridMarginLeft + this.gridColumnKeyWidth) && y >= this.gridAlbumBottom && y <= this.gridColumnKeyBottom,
			tagValue: (x, y) => x >= this.gridMarginLeft && x <= (this.gridMarginLeft + this.gridColumnKeyWidth + this.gridColumnValueWidth)  && y >= this.gridAlbumBottom && y <= this.gridColumnValueBottom,
			timeline: (x, y) => x >= this.gridMarginLeft && x <= (this.gridMarginLeft + this.gridContentWidth)   && y >= this.timelineY - SCALE(10) && y < this.timelineY + this.timelineH + SCALE(10),
			grid:     (x, y) => x >= this.gridMarginLeft && x <= (this.gridMarginLeft + this.gridContentWidth)   && y >= this.gridArtistTop   && y <= this.gridColumnValueBottom
		};
		/** @private @type {string} The text content of the grid tooltip. */
		this.gridTooltipText = '';
		/** @private @type {string} The text content of the grid timeline tooltip. */
		this.gridTimelineTooltipText = '';
		/** @private @type {boolean} True while the stopped Details page is retained for the retract animation. */
		this.discArtExitActive = false;
		/** @private @type {Function|null} Completion callback that restores TT's original stopped state. */
		this.discArtExitComplete = null;
		/** @private @type {GdiBitmap|null} Previous rendered disc used by the artwork crossfade. */
		this.discArtFadePrevious = null;
		/** @private @type {boolean} Whether the previous fade image needs the D2D rotation transform. */
		this.discArtFadePreviousD2D = false;
		/** @private @type {number} Current incoming image alpha ratio, from 0 to 1. */
		this.discArtFadeProgress = 1;
		/** @private @type {string} Stable identity of the currently displayed disc image. */
		this.discArtImageKey = '';
		/** @private @type {number} Token used to discard stale asynchronous disc image loads. */
		this.discArtLoadToken = 0;
		/** @private @type {number} Rotation index retained across a disc artwork change. */
		this.discArtFadeRotationIndex = 0;
		/** @private @type {number} D2D angle retained across a disc artwork change. */
		this.discArtFadeRotationAngle = 0;
		/** @private @type {string} Identity of the last item that actually entered playback. */
		this.discArtPlayingTrackKey = '';
		/** @private @type {boolean} Whether the next Details opening should animate disc entry. */
		this.discArtEntryPending = false;
		/** @private @type {boolean} Whether a pending entry belongs to the currently visible Details opening. */
		this.discArtEntryOnOpen = false;
		/** @private @type {boolean} Whether the latest in-Details track change is waiting to eject its new disc. */
		this.discArtTrackEntryPending = false;
		/** @private @type {boolean} Whether that track-change entry must wait for the incoming disc image. */
		this.discArtTrackEntryAwaitingArtwork = false;
		/** @private @type {number} Latest-wins serial for rapid track-change entry requests. */
		this.discArtTrackEntrySerial = 0;
		/** @private @type {boolean} Last observed Details visibility. */
		this.discArtDetailsVisible = false;
		// #endregion

		// * TIMERS * //
		// #region TIMERS
		/** @public @type {number} The disc art rotation timer when disc art spins while song is playing. */
		this.discArtRotationTimer = null;
		/** @private @type {number|null} The timer used by the play/stop disc art slide animation. */
		this.discArtSlideTimer = null;
		/** @private @type {boolean|null} The last requested disc art visibility state. */
		this.discArtSlideVisible = null;
		/** @private @type {number|null} The last responsive slide target. */
		this.discArtSlideTargetX = null;
		/** @private @type {number|null} Previous x-position used to invalidate the complete moving region. */
		this.discArtSlidePreviousX = null;
		/** @private @type {boolean} Stops drawing a fully retracted front-layer disc. */
		this.discArtFrontHidden = false;
		/** @private @type {number} The minimum useful exposed disc ratio. */
		this.discArtSlideMinRatio = 0.18;
		/** @private @type {number} The play/stop animation duration in milliseconds. */
		this.discArtSlideDuration = 650;
		/** @private @type {number} Shorter one-way eject duration used by track changes. */
		this.discArtTrackEntryDuration = 420;
		/** @private @type {number} Smooth progressive eject duration used by both entry paths. */
		this.discArtProgressiveEntryDuration = 700;
		/** @private @type {number|null} Settles the latest ready disc before starting its track-change entry. */
		this.discArtTrackEntryTimer = null;
		/** @private @type {number} Small settle delay that coalesces artwork updates for the same track. */
		this.discArtTrackEntryDelay = 40;
		/** @private @type {number|null} The disc artwork crossfade timer. */
		this.discArtFadeTimer = null;
		/** @private @type {number} Disc artwork crossfade duration in milliseconds. */
		this.discArtFadeDuration = 140;
		/** @private @type {number|null} Debounces disc installation during rapid track changes. */
		this.discArtCommitTimer = null;
		/** @private @type {number} Delay before installing a newly selected disc image. */
		this.discArtCommitDelay = 90;
		/** @private @type {number|null} Defers GDI+ rotation work until waveform startup has settled. */
		this.discArtDeferredStartTimer = null;
		/** @private @type {number} Delay before starting GDI+ rotation/precomputation. */
		this.discArtDeferredStartDelay = 400;
		/** @private @type {number|null} Incremental GDI+ rotation-frame precomputation timer. */
		this.discArtPrecomputeTimer = null;
		/** @public @type {boolean} Whether Details is currently in immersive playback mode. */
		this.immersiveMode = false;
		/** @public @type {boolean} Whether the temporary Details controls are currently visible in immersive mode. */
		this.immersiveUiVisible = true;
		/** @private @type {?number} Idle timer used to hide the Details metadata and lower bar. */
		this.immersiveUiTimer = null;
		/** @private @type {number} Idle time before immersive controls fade away. */
		this.immersiveUiDelay = 3000;
		/** @private @type {boolean} Whether immersive mode changed the window into fullscreen itself. */
		this.immersiveWindowChanged = false;
		/** @private @type {number|null} Host window state preserved while entering immersion. */
		this.immersiveKeepWindowState = null;
		/** @private @type {boolean} Whether the compact immersive glyph owns the current mouse click. */
		this.immersiveButtonPressed = false;
		this.immersiveButtonClickPending = false;
		/** @private @type {boolean} Tracks the separate glyph's tooltip hover state. */
		this.immersiveButtonHovered = false;
		/** @private @type {boolean} Whether a click was consumed solely to wake the immersive interface. */
		this.immersiveWakeClickPending = false;
		this.immersiveWindowConfirmedFullscreen = false;
		this.immersiveWindowSyncTimer = null;
		/** @private @type {boolean} Whether immersive mode began from a maximized window. */
		this.immersiveReturnToMaximized = false;
		this.immersiveFullscreenEntryTimer = null;
		this.immersiveRestoreMaximizeTimer = null;
		/** @private @type {boolean} Ignores host-generated pointer movement while fullscreen settles. */
		this.immersiveEntryMouseGuard = false;
		this.immersiveEntryMouseGuardTimer = null;
		/** @private @type {boolean} Prevents duplicate close requests while fullscreen is restoring. */
		this.immersiveExitPending = false;
		this.immersiveExitPollTimer = null;
		/** @private @type {?number} Timer for the interruptible cover/disc layout transition. */
		this.immersiveLayoutTimer = null;
		/** @private @type {number} Duration of the cover/disc layout transition in milliseconds. */
		this.immersiveLayoutDuration = 420;
		/** @private @type {number} Opacity of the left Details backdrop while immersive controls are visible. */
		this.immersivePanelOpacity = 255;
		/** @private @type {?number} Timer used for the left Details backdrop fade. */
		this.immersivePanelFadeTimer = null;
		// #endregion
	}

	// * PLUBLIC METHODS - DRAW * //
	// #region PUBLIC METHODS - DRAW
	/**
	 * Draws the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawDetails(gr) {
		this.updateDiscArtDetailsVisibility();
		this.drawBackground(gr);
		this.drawDiscArt(gr);
		if (!this.immersiveMode || this.immersiveUiVisible) {
			this.drawGrid(gr);
			this.drawBandLogo(gr);
			// On the Details arc, the label is painted after lyrics so its transparent
			// artwork (including multiple logos) stays in front of passing text.
			if (!(grm.ui.displayDetails && (grm.ui.displayLyrics && grSet.detailsLyricsDisplayMode === 'arc' ||
				this.isTurntableActive() && this.isLyricsVisible()))) {
				this.drawLabelLogo(gr);
			}
		}
	}

	/**
	 * Tracks Details visibility so disc entry starts when the page is actually opened.
	 */
	updateDiscArtDetailsVisibility(visible = !!grm.ui.displayDetails) {
		if (!visible) {
			this.stopTurntableTimer(); this.stopTurntableRecovery();
			grm.lyrics?.clearTurntableRenderingCaches?.();
		}
		visible = !!visible;
		if (!visible) {
			if (this.labelLogoLayoutRepaintTimer) {
				clearTimeout(this.labelLogoLayoutRepaintTimer);
				this.labelLogoLayoutRepaintTimer = null;
			}
			if (this.labelLogoSettleRepaintTimer) {
				clearTimeout(this.labelLogoSettleRepaintTimer);
				this.labelLogoSettleRepaintTimer = null;
			}
			if (this.discArtTrackEntryPending) {
				this.discArtEntryPending = true;
				this.discArtTrackEntryPending = false;
				this.discArtTrackEntryAwaitingArtwork = false;
				this.clearTimer('discArtTrackEntry');
			}
			if (this.discArtEntryOnOpen) this.discArtEntryPending = true;
			this.discArtEntryOnOpen = false;
			this.discArtDetailsVisible = false;
			if (this.discArtSlideTimer && !this.discArtExitActive) this.clearTimer('discArtSlide');
			return;
		}

		if (this.discArtDetailsVisible) return;
		this.discArtDetailsVisible = true;
		this.queueTurntableLyricsInitialization();
		this.discArtEntryOnOpen = this.discArtEntryPending;
		this.discArtEntryPending = false;
		this.discArtSlideVisible = null;
		this.discArtSlideTargetX = null;
		// Playlist/library navigation may open Details before the incoming disc bitmap has
		// installed its final metrics. Never reuse the hidden page's label layout, and perform
		// one coalesced full repaint after the page geometry has settled.
		this.invalidateLabelLogoLayout(true, 50);
	}

	/**
	 * Invalidates every cache shared by normal and compact record-label layouts.
	 * @param {boolean} repaint - Whether to schedule a complete Details repaint.
	 * @param {number} delay - Coalescing delay in milliseconds.
	 */
	invalidateLabelLogoLayout(repaint = false, delay = 0) {
		this.cachedLabelLastLeftEdge = 0;
		this.cachedLabelLastHeight = 0;
		this.shadowImgLabel = null;
		this.labelLogoCompactMode = null;
		this.labelLogoCompactShadowKey = '';
		if (!repaint) return;

		if (this.labelLogoSettleRepaintTimer) clearTimeout(this.labelLogoSettleRepaintTimer);
		this.labelLogoSettleRepaintTimer = setTimeout(() => {
			this.labelLogoSettleRepaintTimer = null;
			if (grm.ui.displayDetails) window.Repaint();
		}, Math.max(0, delay));
	}

	/**
	 * Draws the Details background.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	/** Shared screen-space bounds for backdrop, metadata and artist signature. */
	getDetailsPanelBounds() {
		const a = grm.ui.albumArtSize;
		const fullHeight = this.isTurntableActive() || !grm.ui.albumArt;
		const top = fullHeight ? grm.ui.topMenuHeight : Math.max(grm.ui.topMenuHeight, a.y);
		const bottom = Math.min(grm.ui.wh - grm.ui.lowerBarHeight, fullHeight ? grm.ui.wh : a.y + a.h);
		return { x: 0, y: top, w: Math.max(0, a.x), h: Math.max(0, bottom - top), bottom };
	}

	getSignatureReserve() {
		const b = this.getDetailsPanelBounds();
		return this.bandLogo && grSet.layout === 'default' ? Math.min(b.h * 0.18, Math.max(SCALE(48), b.h * 0.14)) : 0;
	}

	drawBackground(gr) {
		if (!this.isPlaybackVisualActive() || !grm.ui.displayDetails) {
			return;
		}

		gr.SetTextRenderingHint(TextRenderingHint.AntiAliasGridFit);
		gr.SetSmoothingMode(SmoothingMode.None);

		if (grm.ui.isStreaming && grm.ui.noArtwork || !grm.ui.albumArt && grm.ui.noArtwork) {
			gr.FillSolidRect(0, grm.ui.topMenuHeight, grm.ui.ww, grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight, grCol.detailsBg);
		} else {
			let panelWidth = grSet.noDiscArtBg && !this.discArt ? grm.ui.ww : grm.ui.albumArtSize.x;
			const panelColor = this.immersiveMode ? RGBtoRGBA(grCol.detailsBg, this.immersivePanelOpacity) : grCol.detailsBg;
			const bounds = this.getDetailsPanelBounds();
			gr.FillSolidRect(0, bounds.y, panelWidth, bounds.h, panelColor);
		}

		if (grm.ui.albumArt && grSet.styleBlend && grCol.imgBlended && grm.ui.ww > 0 && grm.ui.wh > 0) {
			const b = this.getDetailsPanelBounds();
			const alpha = this.immersiveMode ? this.immersivePanelOpacity : 255;
			if (b.w > 0 && b.h > 0 && alpha > 0) {
				gr.DrawImage(grCol.imgBlended, 0, b.y, b.w, b.h, 0,
					b.y * grCol.imgBlended.Height / grm.ui.wh,
					b.w * grCol.imgBlended.Width / grm.ui.ww,
					b.h * grCol.imgBlended.Height / grm.ui.wh, 0, alpha);
			}
		}

		gr.SetSmoothingMode(SmoothingMode.HighQuality);
	}

	/**
	 * Draws the disc art in Details.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */

	// Turntable PRE1. Immutable bitmap, shared animation clock, no per-frame image generation.
	isTurntableActive() {
		return this.usesTurntableRenderer() && grm.ui.displayDetails;
	}

	usesTurntableRenderer() {
		return this.turntableMode && grSet.layout === 'default';
	}

	isLyricsVisible() {
		return this.isTurntableActive() ? this.turntableLyricsEnabled !== false : !!grm.ui.displayLyrics;
	}

	queueTurntableLyricsInitialization() {
		if (!this.isTurntableActive() || !this.isLyricsVisible() || !fb.IsPlaying || !grm.lyrics) return;
		if (this.turntableLyricsInitTimer != null) return;
		this.turntableLyricsInitTimer = setTimeout(() => {
			this.turntableLyricsInitTimer = null;
			if (!this.isTurntableActive() || !this.isLyricsVisible() || !fb.IsPlaying) return;
			grm.lyrics.initLyrics();
			window.Repaint();
		}, 0);
	}

	setTurntableLyricsEnabled(enabled) {
		this.turntableLyricsEnabled = !!enabled;
		window.SetProperty('TT 唱机：滚动歌词', this.turntableLyricsEnabled);
		if (!enabled && this.turntableLyricsInitTimer != null) {
			clearTimeout(this.turntableLyricsInitTimer);
			this.turntableLyricsInitTimer = null;
		}
		if (enabled) this.queueTurntableLyricsInitialization();
		window.Repaint();
	}

	needsTurntableDisc() {
		return this.turntableMode && grSet.layout === 'default' && this.turntableArtwork === 'disc';
	}

	setTurntableMode(enabled) {
		this.turntableMode = !!enabled;
		this.turntableControlPressed = null;
		this.resetTurntableLoadState();
		if (!enabled) { this.clearTurntableImages(); grm.lyrics?.clearTurntableRenderingCaches?.(); }
		window.SetProperty('TT 唱机原型 PRE1：启用', this.turntableMode);
		this.stopTurntableTimer();
		this.turntableBounds = null;
		if (this.turntableMode) {
			for (const timer of ['discArt', 'discArtSlide', 'discArtFade', 'discArtPrecompute', 'discArtDeferredStart']) this.clearTimer(timer);
			this.discArtArray = [];
			this.discArtRotation = null;
			this.discArtD2DImage = null;
			this.discArtShadowImg = { image: null, size: 0 };
		} else if (this.discArt && grm.ui.displayDetails) this.updateDiscArt();
		if (this.needsTurntableDisc() && (fb.IsPlaying || grSet.panelBrowseMode)) this.fetchDiscArt();
		if (enabled) this.queueTurntableLyricsInitialization();
		window.Repaint();
	}

	stopTurntableTimer() {
		if (this.turntableJob !== null) grAnimationManager.remove(this.turntableJob);
		this.turntableJob = null;
		this.turntableLastTick = 0;
		this.turntablePaintPending = false;
		this.turntablePaintRequestedAt = 0;
	}

	clearTurntableImages() {
		this.turntableBadgeSource = null;
		this.turntableResizeFrame = null;
		this.turntableLastDrawGeometry = null;
		// These are owned derived images. Shared album/disc artwork is never disposed.
		this.turntableRecord = this.turntableSource = this.turntableChassis = this.turntableArmImage = null;
		this.turntableShadow = null;
		this.turntableCacheKey = this.turntableChassisKey = this.turntableShadowKey = '';
		this.turntableArmImageSize = 0;
		this.turntableArmBounds = null;
		this.turntableSettledArm = null;
		this.turntableDynamicGeometry = null;
		this.turntableDynamicBounds = null;
	}

	resetTurntableLoadState() {
		this.stopTurntableRecovery();
		this.turntableSuspended = false;
		this.turntableSuspendReason = '';
		this.turntablePaintAverage = this.turntableSlowFrames = this.turntableRecoveryFrames = this.turntableModerateFrames = 0;
		this.turntableRedrawDelay = Math.max(30, Number(grSet.spinDiscArtRedrawInterval) || 30);
		this.turntablePaintPending = false;
		this.turntablePaintRequestedAt = 0;
	}

	getTurntableRefreshDelay() {
		if (this.turntableSuspended) return 1000;
		if (window.IsVisible === false) return 250;
		return Math.max(30, Number(grSet.spinDiscArtRedrawInterval) || 30, this.turntableRedrawDelay || 0);
	}

	/** Recovery reserves idle time for the measured load, not just the user's 30ms setting. */
	getTurntableRecoveryDelay() {
		return Math.min(250, Math.max(120, Number(grSet.spinDiscArtRedrawInterval) || 30,
			Math.ceil(Math.max(this.turntablePaintAverage || 0, grAnimationManager.paintAverage || 0) * 2),
			grAnimationManager.paintPressure || 0));
	}

	suspendTurntableAnimation(reason) {
		if (this.turntableSuspended) return;
		this.turntableSuspended = true;
		this.turntableSuspendReason = reason;
		this.stopTurntableTimer();
		const now = grAnimationManager.now();
		this.turntableRecoveryBackoff = this.turntableResumedAt && now - this.turntableResumedAt < 15000
			? Math.min(60000, (this.turntableRecoveryBackoff || 3000) * 2) : 3000;
		this.turntableRecoverAfter = now + this.turntableRecoveryBackoff;
		this.turntableRecoveryDiagnosticsAt = now;
		this.turntableHealthySince = 0;
		this.turntableHealthyPaints = 0;
		this.startTurntableRecovery();
		console.log(`唱机动画进入过载保护：${reason}。负载稳定后自动恢复；也可在详情 > 碟片中恢复。`);
	}

	stopTurntableRecovery() {
		if (this.turntableRecoveryJob != null) grAnimationManager.remove(this.turntableRecoveryJob);
		this.turntableRecoveryJob = null;
	}

	startTurntableRecovery() {
		if (this.turntableRecoveryJob != null && !grAnimationManager.jobs.has(this.turntableRecoveryJob)) this.turntableRecoveryJob = null;
		if (this.turntableRecoveryJob != null || !this.turntableSuspended || !this.isTurntableActive()) return;
		// One low-frequency observer, no missed-frame replay or bitmap rebuilding.
		this.turntableRecoveryJob = grAnimationManager.add(now => {
			if (!this.turntableSuspended || !this.isTurntableActive()) { this.stopTurntableRecovery(); return; }
			if (window.IsVisible === false || grAnimationManager.resizing || !fb.IsPlaying || fb.IsPaused) {
				this.turntableHealthySince = 0; this.turntableHealthyPaints = 0;
				return 1000;
			}
			// Diagnostic only: a prolonged suspended state needs evidence before changing
			// the rotation/recovery algorithm. Log at most once every 15 seconds.
			if (now >= this.turntableRecoverAfter + 10000 &&
				now - this.turntableRecoveryDiagnosticsAt >= 15000) {
				this.turntableRecoveryDiagnosticsAt = now;
				console.log(`FIX63 pre7 唱机恢复观察 | 原因 ${this.turntableSuspendReason || '未知'} | 健康帧 ${this.turntableHealthyPaints || 0} | 冷却剩余 ${Math.max(0, Math.round(this.turntableRecoverAfter - now))}ms | 最近绘制 ${Math.round(now - (this.turntableLastPaintAt || now))}ms | 绘制平均 ${Math.round(grAnimationManager.paintAverage || 0)}ms | 压力 ${grAnimationManager.paintPressure || 0}ms | 转盘任务 ${this.turntableJob != null && grAnimationManager.jobs.has(this.turntableJob)} | 恢复任务 ${this.turntableRecoveryJob != null && grAnimationManager.jobs.has(this.turntableRecoveryJob)}`);
			}
			const recoveryDelay = this.getTurntableRecoveryDelay();
			const healthyCost = Math.min(100, recoveryDelay * 0.75);
			if (now >= this.turntableRecoverAfter && this.turntableHealthyPaints >= 8 &&
				this.turntableHealthySince && now - this.turntableHealthySince >= 3000 &&
				now - this.turntableLastPaintAt < 1500 && grAnimationManager.paintAverage < healthyCost &&
				// A fresh coalesced lyric paint is normal. Requiring an entirely idle
				// queue can indefinitely miss recovery when the observer shares its phase.
				(!grAnimationManager.paintPending || now - grAnimationManager.paintRequestedAt < 250)) {
				this.resetTurntableLoadState();
				this.turntableResumedAt = now;
				this.turntableRedrawDelay = recoveryDelay;
				this.updateTurntableState();
				console.log(`TT FIX19 唱机负载已稳定，以 ${recoveryDelay} ms 间隔恢复转动。`);
			} else if (now >= this.turntableRecoverAfter && now - (this.turntableLastPaintAt || 0) >= 900 &&
				(!grAnimationManager.paintPending || now - grAnimationManager.paintRequestedAt > 2000)) {
				// Without visible lyrics, sample at most one paint per second.
				grAnimationManager.requestRepaint();
			}
			return 1000;
		}, 1000, 'recovery');
	}

	resumeTurntableAnimation() {
		this.resetTurntableLoadState();
		this.turntableLastTick = grAnimationManager.now();
		this.updateTurntableState();
		window.Repaint();
	}

	getTurntableBuildCount() {
		const c = this.turntableBuildCounts;
		return c ? c.record + c.chassis + c.arm + c.shadow : 0;
	}

	reportTurntablePaint(started, buildsBefore) {
		if (!this.isTurntableActive()) return;
		const now = grAnimationManager.now();
		const cost = Math.max(0, now - started);
		const wait = this.turntablePaintPending ? Math.max(0, started - this.turntablePaintRequestedAt) : 0;
		this.turntableLastQueueWait = wait;
		const paintGap = now - (this.turntableLastPaintAt || 0);
		this.turntablePaintPending = false;
		this.turntablePaintRequestedAt = 0;
		this.turntableLastPaintAt = now;
		this.turntablePaintWorst = Math.max(this.turntablePaintWorst || 0, cost);
		// One-time artwork construction is not the cost of a steady animation frame.
		if (Number.isFinite(buildsBefore) && this.getTurntableBuildCount() !== buildsBefore && cost < 1500) return;
		this.turntablePaintAverage = this.turntablePaintAverage ? this.turntablePaintAverage * 0.9 + cost * 0.1 : cost;
		const base = Math.max(30, Number(grSet.spinDiscArtRedrawInterval) || 30);
		if (grAnimationManager.resizing || window.IsVisible === false) {
			this.turntableHealthySince = 0; this.turntableHealthyPaints = 0;
			return;
		}
		if (this.turntableSuspended) {
			if (paintGap >= 1500) { this.turntableHealthySince = 0; this.turntableHealthyPaints = 0; }
			if (cost < Math.min(100, this.getTurntableRecoveryDelay() * 0.75) && wait < 80) {
				if (!this.turntableHealthySince) this.turntableHealthySince = now;
				this.turntableHealthyPaints = (this.turntableHealthyPaints || 0) + 1;
			} else {
				this.turntableHealthySince = 0; this.turntableHealthyPaints = 0;
			}
			return;
		}
		if (cost > 100 || wait > 250) {
			this.turntableSlowFrames = (this.turntableSlowFrames || 0) + 1;
			this.turntableRecoveryFrames = 0;
		} else {
			this.turntableSlowFrames = Math.max(0, (this.turntableSlowFrames || 0) - 1);
			this.turntableRecoveryFrames = (this.turntableRecoveryFrames || 0) + 1;
		}
		if (cost >= 1500 || wait >= 2000 || this.turntableSlowFrames >= 8) {
			this.suspendTurntableAnimation(`整页绘制 ${Math.round(cost)} ms，转盘 ${Math.round(this.turntableRenderCost || 0)} ms，歌词 ${Math.round(grm.lyrics?.turntablePaintCost || 0)} ms，等待 ${Math.round(wait)} ms`);
			return;
		}
		// A steady frame under 75% of the configured budget needs no slowdown.
		// Brief peaks don't lower cadence; sustained work retains an idle margin.
		const pressure = this.turntablePaintAverage > base * 0.75 || wait > 80;
		this.turntableModerateFrames = pressure ? (this.turntableModerateFrames || 0) + 1 : 0;
		const wanted = this.turntableModerateFrames >= 6
			? Math.min(250, Math.max(base, Math.ceil(this.turntablePaintAverage * 1.65), wait > 100 ? 100 : base))
			: base;
		if (wanted > this.turntableRedrawDelay) {
			this.turntableRedrawDelay = wanted;
			this.turntableRecoveryFrames = 0;
		} else if (this.turntableRecoveryFrames >= 15 && (!pressure || this.turntableModerateFrames >= 6)) {
			this.turntableRedrawDelay = Math.max(wanted, Math.round(this.turntableRedrawDelay * 0.75));
			this.turntableRecoveryFrames = 0;
		}
	}

	printTurntableDiagnostics() {
		const now = grAnimationManager.now();
		const sizes = [this.turntableRecord, this.turntableChassis, this.turntableArmImage, this.turntableShadow && this.turntableShadow.image]
			.map(img => img ? `${img.Width}x${img.Height}` : '无');
		console.log(`TT 性能 FIX19 | ${D2D ? 'D2D' : 'GDI'} | 各界面绘制 ${JSON.stringify(grAnimationManager.paintModes)} | 自适应间隔 ${grAnimationManager.paintPressure} ms | 唱机 ${this.getTurntableRefreshDelay()} ms | 转盘绘制 ${Math.round(this.turntableRenderCost || 0)} ms / 歌词 ${Math.round(grm.lyrics?.turntablePaintCost || 0)} ms / 等待 ${Math.round(this.turntableLastQueueWait || 0)} ms | 歌词图层 ${JSON.stringify(grm.lyrics?.turntableRenderStats || {})} | 暂停 ${!!this.turntableSuspended} | 原因 ${this.turntableSuspendReason || '无'} | 恢复观察 ${this.turntableRecoveryJob != null} / 健康帧 ${this.turntableHealthyPaints || 0} / 冷却 ${this.turntableRecoveryBackoff} ms | 位图 ${sizes.join(', ')} | 构建 ${JSON.stringify(this.turntableBuildCounts)} | 动画任务 ${grAnimationManager.jobs.size} | 碟片缓存帧 ${this.discArtArray.filter(Boolean).length}`);
		console.log(`FIX19 恢复状态 | 动画任务有效 ${this.turntableJob != null && grAnimationManager.jobs.has(this.turntableJob)} | 最近整页绘制 ${Math.round(grAnimationManager.paintAverage)} ms / 恢复间隔 ${this.getTurntableRecoveryDelay()} ms | 距上次绘制 ${Math.round(now - (this.turntableLastPaintAt || now))} ms | 待绘制 ${grAnimationManager.paintPending ? Math.round(now - grAnimationManager.paintRequestedAt) : 0} ms | 距允许恢复 ${Math.max(0, Math.round((this.turntableRecoverAfter || 0) - now))} ms`);
		if (typeof libImg !== 'undefined') {
			const pixels = Object.values(libImg.cache).reduce((sum, o) => sum + (o.img?.Width ? o.img.Width * o.img.Height : 0), 0);
			console.log(`曲库 | 工作缓存 ${Object.keys(libImg.cache).length} 项 / ${(pixels * 4 / 1048576).toFixed(1)} MiB像素数据 | 原生读取 ${libImg.nativeImageActive || 0} / 峰值 ${libImg.nativeImagePeak || 0} | 等待 ${libImg.imageWaiters?.length || 0} | 盒体 ${libImg.jewelCaseCache?.length || 0} | 透视 ${libImg.flowPerspectiveCache?.length || 0} | 待写 ${libImg.toSave.length}`);
		}
	}

	updateTurntableState() {
		if (!this.isTurntableActive()) { this.stopTurntableTimer(); this.stopTurntableRecovery(); return; }
		if (this.turntableSuspended) { this.stopTurntableTimer(); this.startTurntableRecovery(); return; }
		if (grAnimationManager.resizing) { this.stopTurntableTimer(); return; }
		// Reconcile the owner handle with the scheduler before deciding a job exists.
		if (this.turntableJob != null && !grAnimationManager.jobs.has(this.turntableJob)) this.stopTurntableTimer();
		const running = fb.IsPlaying && !fb.IsPaused;
		const targetArm = fb.IsPlaying ? 1 : 0;
		// A paused/stopped record must not advance by the time spent idle.
		if (running !== this.turntableWasRunning) this.turntableLastTick = grAnimationManager.now();
		this.turntableWasRunning = running;
		if (this.turntableJob !== null || (!running && Math.abs(this.turntableArm - targetArm) < 0.001)) return;
		this.turntableLastTick = grAnimationManager.now();
		this.turntableJob = grAnimationManager.add(now => {
			if (!this.isTurntableActive()) { this.stopTurntableTimer(); return; }
			if (this.turntableSuspended) { this.stopTurntableTimer(); return; }
			if (window.IsVisible === false) {
				this.turntablePaintPending = false;
				this.turntablePaintRequestedAt = 0;
				this.turntableLastTick = now;
				return 250;
			}
			if (this.turntablePaintPending) {
				if (now - this.turntablePaintRequestedAt > 2000) this.suspendTurntableAnimation('上一帧超过 2 秒未完成');
				return Math.max(100, this.getTurntableRefreshDelay());
			}
			const dt = Math.max(0, Math.min(1000, now - this.turntableLastTick));
			this.turntableLastTick = now;
			const playing = fb.IsPlaying && !fb.IsPaused;
			if (playing) {
				const step = 360 / Math.max(1, Number(grSet.spinDiscArtImageCount) || 360);
				this.turntableAngle = (this.turntableAngle + dt * step / Math.max(16, Number(grSet.spinDiscArtRedrawInterval) || 30)) % 360;
			}
			const target = fb.IsPlaying ? 1 : 0;
			const movement = dt / 650;
			this.turntableArm += Math.sign(target - this.turntableArm) * Math.min(movement, Math.abs(target - this.turntableArm));
			const b = this.turntableBounds;
			if (b) {
				this.turntablePaintPending = true;
				this.turntablePaintRequestedAt = now;
				// Only the record and moving arm change, not the entire chassis.
				const area = this.turntableDynamicBounds || b;
				grAnimationManager.requestRepaint(area.x - 3, area.y - 3, area.w + 6, area.h + 6);
			}
			if (!playing && Math.abs(this.turntableArm - target) < 0.001) this.stopTurntableTimer();
			return this.getTurntableRefreshDelay();
		}, this.getTurntableRefreshDelay(), 'turntable');
	}

	getTurntablePaintAngle(now = grAnimationManager.now()) {
		if (!fb.IsPlaying || fb.IsPaused || this.turntableSuspended || this.turntableJob == null || window.IsVisible === false) return this.turntableAngle;
		const elapsed = Math.max(0, Math.min(1000, now - this.turntableLastTick));
		const step = 360 / Math.max(1, Number(grSet.spinDiscArtImageCount) || 360);
		return (this.turntableAngle + elapsed * step / Math.max(16, Number(grSet.spinDiscArtRedrawInterval) || 30)) % 360;
	}

	getTurntableRecord(size) {
		size = Math.max(16, Math.min(1024, Math.round(size)));
		// Only fall back to cover after the disc lookup completes, never during its decode.
		const source = this.turntableArtwork === 'disc'
			? (this.turntableDiscPending ? null : this.discArt || grm.ui.albumArt)
			: grm.ui.albumArt;
		const badgeVisible = !!(grSet.showHiResAudioBadge && grm.ui.isTrackHiRes && fb.IsPlaying);
		// Bake only when the artwork, size or visible badge configuration actually changes.
		const badgeKey = badgeVisible ? [grSet.hiResAudioBadgePos || 'bottomright',
			grSet.hiResAudioBadgeSize, grSet.hiResAudioBadgeRound, grSet.customThemeImages,
			typeof RES !== 'undefined' && RES._4K].join(':') : 'none';
		const key = `${size}:${this.turntableArtwork}:${badgeKey}`;
		if (this.turntableRecord && this.turntableSource === source && this.turntableCacheKey === key &&
			(!badgeVisible || this.turntableBadgeSource === grm.ui.hiResAudioLogo && grm.ui.hiResAudioLogo)) return this.turntableRecord;
		// Keep the last record visible for the stop/return-arm animation when TT releases artwork.
		if (!source && !fb.IsPlaying && this.turntableRecord) return this.turntableRecord;
		const img = gdi.CreateImage(size, size);
		this.turntableBuildCounts.record++;
		const g = img.GetGraphics();
		try {
			g.SetSmoothingMode(SmoothingMode.AntiAlias);
			g.FillEllipse(1, 1, size - 2, size - 2, RGB(18, 19, 21));
			if (source) {
				const crop = Math.min(source.Width, source.Height);
				g.DrawImage(source, size * 0.025, size * 0.025, size * 0.95, size * 0.95,
					(source.Width - crop) / 2, (source.Height - crop) / 2, crop, crop);
			} else {
				for (let r = 0.1; r < 0.46; r += 0.014) g.DrawEllipse(size * r, size * r, size * (1 - 2 * r), size * (1 - 2 * r), 1, RGB(38, 39, 42));
			}
			if (badgeVisible) this.drawTurntableHiResBadge(g,
				{ x: 0, y: 0, dx: 0, dy: 0, d: size, unit: Math.max(0.6, size / 400) });
		} finally { img.ReleaseGraphics(g); }
		const mask = gdi.CreateImage(size, size);
		const mg = mask.GetGraphics();
		try {
			mg.SetSmoothingMode(SmoothingMode.AntiAlias);
			mg.FillSolidRect(0, 0, size, size, RGB(255, 255, 255));
			mg.FillEllipse(2, 2, size - 4, size - 4, RGB(0, 0, 0));
		} finally { mask.ReleaseGraphics(mg); }
		img.ApplyMask(mask);
		this.turntableSource = source;
		this.turntableCacheKey = key;
		this.turntableBadgeSource = badgeVisible ? grm.ui.hiResAudioLogo : null;
		this.turntableRecord = img;
		return img;
	}

	getTurntableGeometry() {
		const a = grm.ui.albumArtSize;
		const x = Math.round(Math.max(0, Math.min(grm.ui.ww, a.x || 0)));
		const top = Math.round(grm.ui.topMenuHeight);
		const availableH = Math.max(1, Math.floor(grm.ui.wh - grm.ui.lowerBarHeight - top));
		const layout = grm.ui.isBalancedDetailsLayout?.() ? grm.ui.getDetailsArtworkBudget() : null;
		const panelX = layout ? layout.artworkX : x;
		const availableW = Math.max(1, Math.floor(layout ? layout.artworkW : Math.min(a.w || grm.ui.ww - x, grm.ui.ww - x)));
		// Keep the plinth square in normal, narrow and immersive views.
		const w = Math.max(1, Math.floor(Math.min(availableW, availableH)));
		const h = w;
		const y = top + Math.floor((availableH - h) * 0.5);
		const d = Math.floor(Math.min(w * 0.75, h * 0.86));
		return { x: panelX, y, w, h, d, dx: w * 0.063, dy: (h - d) * 0.43,
			unit: Math.max(0.6, d / 400) };
	}

	getTurntableLyricsBounds() {
		if (!this.isTurntableActive()) return null;
		const b = this.getTurntableGeometry();
		const layout = grm.ui.isBalancedDetailsLayout?.() ? grm.ui.getDetailsArtworkBudget() : null;
		const regionX = b.x + b.w + (layout ? layout.gap : SCALE(24));
		const regionW = Math.max(0, grm.ui.ww - regionX - SCALE(24));
		const w = regionW;
		// Use the actual right-hand viewport for wrapping and centering.
		const x = regionX + (regionW - w) * 0.5;
		if (w < SCALE(160)) return null;
		const y = Math.round(grm.ui.topMenuHeight) + SCALE(30);
		let bottom = grm.ui.wh - grm.ui.lowerBarHeight - SCALE(32);
		// The label owns only its visible mark, not the entire lower lyric column.
		// It is composited after lyrics; its previous window coordinates must not
		// shorten the maximized viewport before the label layout has caught up.
		if (bottom - y < SCALE(180)) return null;
		return { x, y, w, h: bottom - y };
	}

	getTurntableShadow(b) {
		const bg = grCol.bg;
		const brightness = ((bg >>> 16) & 255) * 0.2126 + ((bg >>> 8) & 255) * 0.7152 + (bg & 255) * 0.0722;
		if (brightness <= 48) return null;
		const { w, h, unit: u } = b;
		const pad = Math.ceil(13 * u);
		const alpha = Math.round(104 * Math.min(1, (brightness - 48) / 48));
		if (!alpha) return null;
		const key = `${w}:${h}:${u}:gaussian-contact-v3`;
		if (this.turntableShadow && this.turntableShadowKey === key) {
			this.turntableShadow.alpha = alpha;
			return this.turntableShadow;
		}
		// Bake the alpha falloff explicitly: a black RGB-only blur may leave a
		// transparent exterior untouched in the native renderer. No live blur.
		const width = w + 2 * pad, height = h + 2 * pad;
		const sample = Math.min(2, 1536 / width, 1536 / height, Math.sqrt(2097152 / (width * height)));
		const img = gdi.CreateImage(Math.ceil(width * sample), Math.ceil(height * sample));
		const g = img.GetGraphics();
		this.turntableBuildCounts.shadow++;
		try {
			g.SetSmoothingMode(SmoothingMode.None);
			const margin = Math.min(7 * u, w * 0.025, h * 0.025);
			const left = pad + margin + 0.6 * u, top = pad + margin + 3.2 * u;
			const bodyW = w - 2 * margin, bodyH = h - 2 * margin;
			const sigma = 2.8 * u, spread = 8 * u, layers = 16;
			let previous = 0;
			for (let layer = 0; layer <= layers; layer++) {
				const extent = spread * (1 - layer / layers);
				const target = Math.round(230 * Math.exp(-extent * extent / (2 * sigma * sigma)));
				if (target <= previous) continue;
				const opacity = Math.round(255 * (target - previous) / (255 - previous));
				previous += (255 - previous) * opacity / 255;
				const color = RGBA(0, 0, 0, opacity);
				const x = Math.round((left - extent) * sample), y = Math.round((top - extent) * sample);
				const rw = Math.round((bodyW + 2 * extent) * sample), rh = Math.round((bodyH + 2 * extent) * sample);
				const radius = Math.min((12 * u + extent) * sample, rw / 2, rh / 2);
				// Disjoint integer scanlines avoid doubled alpha at primitive joins.
				const cornerRows = Math.ceil(radius);
				for (let row = 0; row < cornerRows; row++) {
					const dy = Math.max(0, radius - row - 0.5);
					const inset = Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - dy * dy)));
					const lineW = rw - 2 * inset;
					if (lineW <= 0) continue;
					g.FillSolidRect(x + inset, y + row, lineW, 1, color);
					g.FillSolidRect(x + inset, y + rh - row - 1, lineW, 1, color);
				}
				if (rh > 2 * cornerRows) g.FillSolidRect(x, y + cornerRows, rw, rh - 2 * cornerRows, color);
			}
		} finally { img.ReleaseGraphics(g); }
		this.turntableShadowKey = key;
		this.turntableShadow = { image: img, pad, alpha, width, height };
		return this.turntableShadow;
	}

	getTurntableChassis(b) {
		// The physical metal finish is independent of the changing theme backdrop.
		// Keep the complete geometry in the key; only a real layout change rebuilds it.
		const key = `${b.w}:${b.h}:${b.d}:${b.dx}:${b.dy}:${b.unit}:satin-v3-rest`;
		if (this.turntableChassis && this.turntableChassisKey === key) return this.turntableChassis;
		// Supersample only when rebuilding the static chassis; unchanged animation cost.
		const sample = Math.min(2, 1536 / b.w, 1536 / b.h, Math.sqrt(2097152 / (b.w * b.h)));
		const img = gdi.CreateImage(Math.ceil(b.w * sample), Math.ceil(b.h * sample));
		this.turntableBuildCounts.chassis++;
		const native = img.GetGraphics();
		const g = {};
		try {
			for (const name of ['FillSolidRect', 'FillEllipse', 'DrawEllipse', 'DrawLine']) {
				g[name] = (...args) => native[name](...args.map((v, i) => i === args.length - 1 ? v : v * sample));
			}
			g.FillGradRect = (x, y, width, height, angle, from, to) =>
				native.FillGradRect(x * sample, y * sample, width * sample, height * sample, angle, from, to);
			g.SetSmoothingMode = value => native.SetSmoothingMode(value);
			const { w, h, d, dx, dy, unit: u } = b;
			const tint = (color, target, amount) => RGB(
				Math.round(((color >>> 16) & 255) * (1 - amount) + target * amount),
				Math.round(((color >>> 8) & 255) * (1 - amount) + target * amount),
				Math.round((color & 255) * (1 - amount) + target * amount));
			g.SetSmoothingMode(SmoothingMode.AntiAlias);
			// Leave everything outside the rounded plinth transparent in every display mode.
			const face = RGB(143, 147, 152);
			const metal = value => {
				const v = Math.max(0, Math.min(249, Math.round(value)));
				return RGB(v, v + 3, v + 6);
			};
			const round = (rx, ry, rw, rh, radius, color) => {
				g.FillSolidRect(rx + radius, ry, rw - 2 * radius, rh, color);
				g.FillSolidRect(rx, ry + radius, rw, rh - 2 * radius, color);
				for (const xx of [rx, rx + rw - 2 * radius]) for (const yy of [ry, ry + rh - 2 * radius])
					g.FillEllipse(xx, yy, 2 * radius, 2 * radius, color);
			};
			const margin = Math.min(7 * u, w * 0.025, h * 0.025);
			const bw = w - 2 * margin, bh = h - 2 * margin, radius = 12 * u;
			// A thin silver lip keeps all four edges consistent, without a dark apron below.
			const apron = Math.min(1.5 * u, bh * 0.01);
			round(margin, margin, bw, bh, radius, RGB(194, 202, 212));
			round(margin + 0.7 * u, margin + 0.3 * u, bw - 1.4 * u, bh - 1.1 * u,
				radius - 0.7 * u, RGB(157, 165, 177));
			round(margin, margin, bw, bh - apron, radius, RGB(194, 202, 212));
			round(margin + 0.9 * u, margin + 1.2 * u, bw - 1.8 * u, bh - apron - 2.4 * u,
				radius - 0.9 * u, RGB(137, 145, 157));
			const fx = margin + 2.1 * u, fy = margin + 2.3 * u;
			const fw = bw - 4.2 * u, fh = bh - apron - 4.6 * u, fr = radius - 2.1 * u;
			// Soft two-axis reflections follow the rounded top. No rectangular overlay or black backing.
			// Scan bands are generated once at 2x resolution, then reused by both renderers.
			const band = Math.max(0.75, u);
			for (let yy = 0; yy < fh; yy += band) {
				const height = Math.min(band, fh - yy);
				const centerY = yy + height * 0.5;
				const edgeY = Math.min(centerY, fh - centerY);
				const inset = edgeY < fr ? fr - Math.sqrt(Math.max(0, fr * fr - (fr - edgeY) * (fr - edgeY))) : 0;
				const left = fx + inset, right = fx + fw - inset, split = fx + fw * 0.38;
				const t = centerY / fh;
				const tone = 136 - 18 * t + 17 * Math.exp(-Math.pow((t - 0.16) / 0.21, 2));
				g.FillGradRect(left, fy + yy, split - left, height, 0, metal(tone + 7), metal(tone + 19));
				g.FillGradRect(split, fy + yy, right - split, height, 0, metal(tone + 19), metal(tone - 12));
			}
			// Deterministic, broken hairlines read as brushed metal rather than a repeated grid.
			let grain = 731;
			const random = () => { grain = (Math.imul(grain, 1664525) + 1013904223) >>> 0; return grain / 4294967296; };
			for (let yy = fy + fr; yy < fy + fh - fr; yy += 1.35 * u) {
				const start = fx + 3 * u + random() * fw * 0.20;
				const end = Math.min(fx + fw - 3 * u, start + fw * (0.52 + random() * 0.40));
				const value = random() > 0.44 ? 255 : 0;
				const alpha = Math.round(3 + random() * 5);
				g.DrawLine(start, yy, end, yy, (0.22 + random() * 0.16) * u, RGBA(value, value, value, alpha));
			}
			// Fine corner-safe silver bevels: the right edge has the same finish as the left.
			g.DrawLine(margin + radius, margin + 0.65 * u, w - margin - radius, margin + 0.65 * u, 0.6 * u, RGB(231, 237, 244));
			g.DrawLine(margin + 0.6 * u, margin + radius, margin + 0.6 * u, h - margin - apron - radius, 0.7 * u, RGB(208, 218, 230));
			g.DrawLine(w - margin - 0.65 * u, margin + radius, w - margin - 0.65 * u, h - margin - apron - radius, 0.7 * u, RGB(208, 218, 230));
			const frontY = h - margin - apron;
			g.DrawLine(margin + radius, frontY, w - margin - radius, frontY, 0.7 * u, RGB(208, 218, 230));
			// Recessed fasteners give the plate a visible manufactured surface.
			for (const sx of [margin + 13 * u, w - margin - 13 * u]) {
				for (const sy of [margin + 13 * u, h - margin - 25 * u]) {
					g.FillEllipse(sx - 2.6 * u, sy - 2.6 * u, 5.2 * u, 5.2 * u, tint(face, 0, 0.3));
					g.FillEllipse(sx - 1.8 * u, sy - 2 * u, 3.6 * u, 3.6 * u, tint(face, 255, 0.36));
					g.DrawLine(sx - u, sy, sx + u, sy, 0.5 * u, tint(face, 0, 0.5));
				}
			}
			// Continuous polished platter shoulder; remove the high-contrast dotted rim.
			g.FillEllipse(dx - 9 * u, dy - 4 * u, d + 20 * u, d + 20 * u, tint(face, 0, 0.27));
			g.FillEllipse(dx - 8 * u, dy - 8 * u, d + 16 * u, d + 16 * u, RGB(48, 53, 61));
			for (let r = 7.5; r >= 0; r -= 0.3) {
				const t = r / 7.5;
				const shine = 95 + 125 * Math.sin(Math.PI * t);
				g.FillEllipse(dx - r * u, dy - r * u, d + r * u * 2, d + r * u * 2,
					RGB(Math.round(shine), Math.round(shine + 4), Math.min(255, Math.round(shine + 11))));
			}
			g.DrawEllipse(dx - 7.5 * u, dy - 7.5 * u, d + 15 * u, d + 15 * u, 0.6 * u, RGB(189, 197, 207));
			g.DrawEllipse(dx - 0.8 * u, dy - 0.8 * u, d + 1.6 * u, d + 1.6 * u, 0.8 * u, RGB(67, 75, 86));
			const px = w * 0.89, py = dy + d * 0.15;
			// Tonearm pedestal and bearing assembly.
			g.FillEllipse(px - 23 * u, py - 20 * u, 46 * u, 46 * u, tint(face, 0, 0.3));
			g.FillEllipse(px - 21 * u, py - 21 * u, 42 * u, 42 * u, RGB(47, 51, 57));
			g.DrawEllipse(px - 20 * u, py - 20 * u, 40 * u, 40 * u, 1.2 * u, RGB(200, 205, 211));
			g.FillEllipse(px - 14 * u, py - 14 * u, 28 * u, 28 * u, RGB(135, 141, 151));
			g.DrawEllipse(px - 11 * u, py - 11 * u, 22 * u, 22 * u, u, RGB(72, 78, 86));
			// Chrome arm rest: keep the cradle aligned with the parked S-tube.
			const restX = px - d * 0.0803, restY = py + d * 0.5906;
			const baseY = restY + 13 * u;
			// A short turned mounting flange: curved top, shaded sidewall, and a lower bevel.
			g.FillEllipse(restX - 10.8 * u, baseY + 4.5 * u, 23 * u, 8 * u, RGBA(0, 0, 0, 22));
			g.FillEllipse(restX - 11 * u, baseY + 3.5 * u, 22 * u, 8 * u, RGB(70, 79, 92));
			for (let row = 4; row < 11.5; row += 0.5) {
				const t = Math.max(0, (row + 0.5 - 7.5) / 4);
				const half = 11 * Math.sqrt(Math.max(0, 1 - t * t)) * u;
				if (!half) continue;
				g.FillGradRect(restX - half, baseY + row * u, half * 0.82, 0.5 * u, 0, RGB(76, 88, 104), RGB(210, 221, 234));
				g.FillGradRect(restX - half * 0.18, baseY + row * u, half * 1.18, 0.5 * u, 0, RGB(210, 221, 234), RGB(74, 85, 101));
			}
			g.FillEllipse(restX - 11 * u, baseY, 22 * u, 8 * u, RGB(212, 222, 235));
			g.FillEllipse(restX - 9.9 * u, baseY + 0.7 * u, 19.8 * u, 6.4 * u, RGB(117, 132, 153));
			g.FillEllipse(restX - 7.5 * u, baseY + 1.05 * u, 15 * u, 4.7 * u, RGB(158, 174, 195));
			g.DrawEllipse(restX - 10.4 * u, baseY + 0.35 * u, 20.8 * u, 7.3 * u, 0.6 * u, RGB(237, 243, 252));
			g.DrawLine(restX - 5.5 * u, baseY + 8.5 * u, restX + 5.5 * u, baseY + 8.5 * u, 0.55 * u, RGB(169, 184, 205));
			// Cylindrical post with the same directional chrome sheen as the tonearm tube.
			g.FillSolidRect(restX - 2.6 * u, restY + 1.5 * u, 5.2 * u, 16 * u, RGB(67, 77, 93));
			g.FillGradRect(restX - 2.6 * u, restY + 1.5 * u, 2.1 * u, 16 * u, 0, RGB(103, 119, 140), RGB(241, 247, 255));
			g.FillGradRect(restX - 0.5 * u, restY + 1.5 * u, 3.1 * u, 16 * u, 0, RGB(241, 247, 255), RGB(67, 77, 93));
			g.DrawLine(restX - 1.0 * u, restY + 3 * u, restX - 1.0 * u, restY + 15.7 * u, 0.55 * u, RGB(252, 253, 255));
			g.FillEllipse(restX - 3.9 * u, restY + 15.3 * u, 7.8 * u, 3.0 * u, RGB(77, 88, 106));
			g.DrawEllipse(restX - 3.6 * u, restY + 14.8 * u, 7.2 * u, 2.7 * u, 0.65 * u, RGB(206, 220, 239));
			// Rounded crossbar with a visible underside; dark pads leave the U opening clear.
			g.DrawLine(restX - 7 * u, restY + 3.6 * u, restX + 7 * u, restY + 3.6 * u, 4.3 * u, RGB(69, 79, 94));
			g.DrawLine(restX - 7 * u, restY + 2.7 * u, restX + 7 * u, restY + 2.7 * u, 3.0 * u, RGB(173, 190, 212));
			g.DrawLine(restX - 6.8 * u, restY + 1.7 * u, restX + 6.8 * u, restY + 1.7 * u, 0.65 * u, RGB(238, 245, 255));
			for (const side of [-1, 1]) {
				const jawX = restX + side * 7 * u;
				g.FillSolidRect(jawX - 0.9 * u, restY - 6.2 * u, 3.5 * u, 10.5 * u, RGB(70, 80, 97));
				g.FillGradRect(jawX - 1.8 * u, restY - 7 * u, 1.4 * u, 10.5 * u, 0, RGB(117, 134, 157), RGB(237, 245, 255));
				g.FillGradRect(jawX - 0.4 * u, restY - 7 * u, 2.2 * u, 10.5 * u, 0, RGB(237, 245, 255), RGB(82, 96, 117));
				g.DrawLine(jawX - side * 1.4 * u, restY + 0.3 * u, jawX - side * 1.4 * u, restY - 5.2 * u, 1.3 * u, RGB(32, 40, 52));
				g.FillEllipse(jawX - 1.8 * u, restY - 8.0 * u, 3.6 * u, 2.4 * u, RGB(220, 233, 250));
				g.FillEllipse(jawX - 1.1 * u, restY - 7.8 * u, 1.8 * u, 1.2 * u, RGB(253, 254, 255));
			}
			// Compact anti-skating dial by the bearing, inspired by physical turntable assemblies.
			const ax = px + 15 * u, ay = py + 43 * u;
			g.FillEllipse(ax - 10 * u, ay - 8 * u, 20 * u, 20 * u, tint(face, 0, 0.28));
			g.FillEllipse(ax - 9 * u, ay - 9 * u, 18 * u, 18 * u, RGB(117, 130, 148));
			g.DrawEllipse(ax - 8.5 * u, ay - 8.5 * u, 17 * u, 17 * u, u, RGB(218, 227, 240));
			for (let i = 0; i < 12; i++) {
				const theta = i * Math.PI / 6;
				g.DrawLine(ax + Math.cos(theta) * 6.5 * u, ay + Math.sin(theta) * 6.5 * u,
					ax + Math.cos(theta) * 8 * u, ay + Math.sin(theta) * 8 * u, 0.65 * u, RGB(48, 60, 77));
			}
			g.FillEllipse(ax - 4.5 * u, ay - 4.5 * u, 9 * u, 9 * u, RGB(159, 173, 193));
			g.DrawLine(ax, ay - 1 * u, ax, ay - 5 * u, u, RGB(245, 248, 255));
			// Low-key product engraving, not a row of nonfunctional controls.
			if (typeof gdi.Font === 'function') {
				const font = gdi.Font('Segoe UI', Math.max(10, 13 * u) * sample, 1);
				const tx = margin + 19 * u, ty = h - margin - 42 * u;
				native.GdiDrawText('Georgia-ReBORN', font, RGB(191, 198, 207),
					tx * sample, (ty + 0.45 * u) * sample, 240 * u * sample, 21 * u * sample, 0);
				native.GdiDrawText('Georgia-ReBORN', font, tint(face, 0, 0.58),
					tx * sample, ty * sample, 240 * u * sample, 21 * u * sample, 0);
				g.DrawLine(tx, ty + 23 * u, tx + 144 * u, ty + 23 * u, 0.55 * u, tint(face, 255, 0.24));
			}
			// QQ Music-inspired recessed vertical control, integrated with the metal plinth.
			const lx = w * 0.90, ly = h * 0.89;
			round(lx - 17 * u, ly - 25 * u, 34 * u, 50 * u, 6 * u, tint(face, 255, 0.23));
			round(lx - 16 * u, ly - 24 * u, 32 * u, 48 * u, 5 * u, tint(face, 0, 0.5));
			round(lx - 13 * u, ly - 21 * u, 26 * u, 42 * u, 3 * u, tint(face, 0, 0.29));
			g.FillEllipse(lx - 7 * u, ly - 43 * u, 14 * u, 14 * u, tint(face, 0, 0.55));
			g.DrawEllipse(lx - 6.5 * u, ly - 43 * u, 13 * u, 13 * u, 1.0 * u, RGB(195, 206, 220));
		} finally { img.ReleaseGraphics(native); }
		// Downsample once, not on every screen paint. Huge windows keep a bounded source.
		const cached = sample > 1 ? img.Resize(b.w, b.h) : img;
		this.turntableChassisKey = key;
		this.turntableChassis = cached;
		return cached;
	}

	mouseInTurntableControl(x, y) {
		return this.getTurntableControlAt(x, y) !== null;
	}

	getTurntableControlAt(x, y) {
		if (!this.isTurntableActive()) return null;
		const b = this.getTurntableGeometry(), u = b.unit;
		if (b.w < 80 || b.h < 60 || b.d < 40) return null;
		const cx = b.x + b.w * 0.90, cy = b.y + b.h * 0.89;
		// Match the rocker face; the surrounding bevel and divider are inert.
		if (x < cx - 11 * u || x > cx + 11 * u) return null;
		if (y >= cy - 19 * u && y < cy - u) return 'play';
		if (y > cy + u && y <= cy + 19 * u) return 'pause';
		return null;
	}


	getTurntableArm(b) {
		const u = b.unit, length = b.d * 0.76;
		const left = Math.floor(-length * 0.12 - 18 * u), top = Math.floor(-44 * u);
		const width = Math.ceil(32 * u - left), height = Math.ceil(length + 48 * u - top);
		const key = `${b.d}:${u}`;
		if (this.turntableArmImage && this.turntableArmImageSize === key) return this.turntableArmImage;
		const sample = Math.min(1, 1536 / width, 1536 / height);
		const img = gdi.CreateImage(Math.ceil(width * sample), Math.ceil(height * sample));
		this.turntableBuildCounts.arm++;
		const native = img.GetGraphics(), g = {}, center = 0;
		try {
			for (const name of ['FillSolidRect', 'FillEllipse', 'DrawEllipse', 'DrawLine']) {
				g[name] = (...args) => {
					const transformed = args.slice();
					transformed[0] -= left; transformed[1] -= top;
					if (name === 'DrawLine') { transformed[2] -= left; transformed[3] -= top; }
					for (let i = 0; i < transformed.length - 1; i++) transformed[i] *= sample;
					return native[name](...transformed);
				};
			}
			g.SetSmoothingMode = mode => native.SetSmoothingMode(mode);
			this.turntableArmBounds = { left, top, width, height };
			g.SetSmoothingMode(SmoothingMode.AntiAlias);
			const bezier = (p0, p1, p2, p3, t) => {
				const v = 1 - t;
				return [v * v * v * p0[0] + 3 * v * v * t * p1[0] + 3 * v * t * t * p2[0] + t * t * t * p3[0],
					v * v * v * p0[1] + 3 * v * v * t * p1[1] + 3 * v * t * t * p2[1] + t * t * t * p3[1]];
			};
			// Continuous S tube, inspired by the SL-1200 arm; local y is its forward axis.
			const points = [];
			for (let i = 0; i <= 36; i++) points.push(bezier([0, 0], [0, length * 0.18],
				[0.065 * length, length * 0.3], [0.04 * length, length * 0.52], i / 36));
			for (let i = 1; i <= 36; i++) points.push(bezier([0.04 * length, length * 0.52],
				[0.01 * length, length * 0.76], [-0.12 * length, length * 0.82], [-0.12 * length, length], i / 36));
			const tube = (width, color, ox, oy) => {
				for (let i = 1; i < points.length; i++) {
					const a = points[i - 1], z = points[i];
					g.DrawLine(center + a[0] + ox, center + a[1] + oy,
						center + z[0] + ox, center + z[1] + oy, width, color);
					g.FillEllipse(center + z[0] + ox - width / 2, center + z[1] + oy - width / 2, width, width, color);
				}
			};
			// Directional metallic shading and soft contact shadow, all baked once.
			tube(11 * u, RGBA(0, 0, 0, 32), 4 * u, 5 * u);
			tube(8.5 * u, RGB(65, 72, 82), 0, 0);
			tube(6.5 * u, RGB(143, 155, 171), -0.7 * u, 0);
			tube(4 * u, RGB(207, 217, 229), -1.5 * u, -0.5 * u);
			tube(1.2 * u, RGB(250, 252, 255), -2.6 * u, -0.5 * u);
			// Cylindrical rear counterweight with machined bands.
			g.FillEllipse(center - 11 * u, center - 37 * u, 22 * u, 12 * u, RGB(91, 99, 113));
			g.FillSolidRect(center - 11 * u, center - 31 * u, 22 * u, 20 * u, RGB(136, 148, 165));
			for (let i = 0; i < 22; i++) {
				const light = Math.round(93 + 130 * Math.sin(i * Math.PI / 22));
				g.FillSolidRect(center + (i - 11) * u, center - 31 * u, u, 20 * u, RGB(light, light + 3, Math.min(255, light + 9)));
			}
			g.FillEllipse(center - 11 * u, center - 17 * u, 22 * u, 11 * u, RGB(200, 206, 214));
			g.FillEllipse(center - 8 * u, center - 15 * u, 16 * u, 7 * u, RGB(109, 119, 136));
			for (let i = 0; i < 4; i++) g.DrawLine(center - 10 * u, center - (27 - i * 4) * u,
				center + 10 * u, center - (27 - i * 4) * u, 0.8 * u, RGB(105, 117, 136));
			// Coupler and rounded headshell, with slots rather than a rectangular block.
			const hx = center - length * 0.12, hy = center + length;
			g.DrawLine(hx, hy - 5 * u, hx, hy + 5 * u, 10 * u, RGB(163, 173, 188));
			for (let i = -3; i <= 3; i += 2) g.DrawLine(hx - 5 * u, hy + i * u, hx + 5 * u, hy + i * u, u * 0.6, RGB(65, 73, 85));
			g.DrawLine(hx, hy + 6 * u, hx, hy + 27 * u, 17 * u, RGB(34, 39, 47));
			g.FillEllipse(hx - 8.5 * u, hy, 17 * u, 17 * u, RGB(34, 39, 47));
			g.FillEllipse(hx - 8.5 * u, hy + 19 * u, 17 * u, 17 * u, RGB(34, 39, 47));
			g.DrawLine(hx - 6 * u, hy + 7 * u, hx - 6 * u, hy + 28 * u, 1.4 * u, RGB(130, 141, 157));
			for (const slotX of [-3.7, 3.7]) {
				g.DrawLine(hx + slotX * u, hy + 15 * u, hx + slotX * u, hy + 26 * u, 2.8 * u, RGB(11, 15, 20));
				g.FillEllipse(hx + slotX * u - 1.4 * u, hy + 13.6 * u, 2.8 * u, 2.8 * u, RGB(11, 15, 20));
			}
			for (const sy of [9, 30]) {
				g.FillEllipse(hx - 2 * u, hy + sy * u - 2 * u, 4 * u, 4 * u, RGB(174, 185, 201));
				g.DrawLine(hx - u, hy + sy * u, hx + u, hy + sy * u, u * 0.6, RGB(37, 43, 53));
			}
			// Finger lift, cartridge and a tiny warm stylus tip.
			g.DrawLine(hx + 7 * u, hy + 11 * u, hx + 15 * u, hy + 8 * u, 2.5 * u, RGB(191, 202, 218));
			g.DrawLine(hx + 15 * u, hy + 8 * u, hx + 19 * u, hy + 10 * u, 2.5 * u, RGB(191, 202, 218));
			g.FillSolidRect(hx - 4 * u, hy + 31 * u, 8 * u, 8 * u, RGB(48, 55, 66));
			g.DrawLine(hx, hy + 38 * u, hx, hy + 42 * u, 1.3 * u, RGB(204, 168, 97));
			// Gimbal yoke ties the tube to the fixed bearing pedestal below it.
			g.DrawLine(center - 14 * u, center - 7 * u, center - 14 * u, center + 10 * u, 5 * u, RGB(83, 94, 110));
			g.DrawLine(center + 14 * u, center - 7 * u, center + 14 * u, center + 10 * u, 5 * u, RGB(151, 163, 181));
			g.DrawLine(center - 14 * u, center - 7 * u, center + 14 * u, center - 7 * u, 5 * u, RGB(209, 218, 232));
			g.FillEllipse(center - 6 * u, center - 6 * u, 12 * u, 12 * u, RGB(60, 71, 88));
			g.DrawEllipse(center - 5 * u, center - 5 * u, 10 * u, 10 * u, u, RGB(220, 227, 237));
		} finally { img.ReleaseGraphics(native); }
		this.turntableArmImageSize = key;
		this.turntableArmImage = img;
		return img;
	}

	drawTurntableHiResBadge(gr, b) {
		// Use the same established track state as TT's album-art badge, including older main scripts.
		if (!grSet.showHiResAudioBadge || !grm.ui.isTrackHiRes || !fb.IsPlaying) return;
		grm.ui.loadHiResAudioLogo();
		const logo = grm.ui.hiResAudioLogo;
		if (!logo || logo.Width <= 0 || logo.Height <= 0) return;
		const u = b.unit;
		// Anchor in the circle's inscribed square so all badge corners stay on the CD.
		const inset = b.d * (1 - Math.SQRT1_2) * 0.5 + 18 * u;
		const span = b.d - 2 * inset;
		if (span <= 0) return;
		const height = Math.min(32 * u, span * 0.38, span * 0.38 * logo.Height / logo.Width);
		const width = height * logo.Width / logo.Height;
		const pos = grSet.hiResAudioBadgePos || 'bottomright';
		const left = b.x + b.dx + inset, top = b.y + b.dy + inset;
		const x = pos === 'topleft' || pos === 'bottomleft' ? left : left + span - width;
		const y = pos === 'topleft' || pos === 'topright' ? top : top + span - height;
		// Called only while building the CD bitmap; normal animation rotates the composed image.
		gr.DrawImage(logo, x, y, width, height, 0, 0, logo.Width, logo.Height);
	}

	updateTurntableDynamicBounds(b, ab) {
		const previous = this.turntableDynamicGeometry;
		if (previous && previous.x === b.x && previous.y === b.y && previous.w === b.w && previous.h === b.h && previous.d === b.d) return;
		const { x, y, w, d } = b;
		const dx = x + b.dx, dy = y + b.dy, px = x + w * 0.89, py = dy + d * 0.15;
		const sweepX = [dx, dx + d], sweepY = [dy, dy + d];
		for (const degrees of [4, 24]) {
			const rad = degrees * Math.PI / 180;
			for (const xx of [ab.left, ab.left + ab.width]) for (const yy of [ab.top, ab.top + ab.height]) {
				sweepX.push(px + xx * Math.cos(rad) - yy * Math.sin(rad));
				sweepY.push(py + xx * Math.sin(rad) + yy * Math.cos(rad));
			}
		}
		const minX = Math.min(...sweepX), minY = Math.min(...sweepY);
		this.turntableDynamicBounds = { x: minX, y: minY, w: Math.max(...sweepX) - minX, h: Math.max(...sweepY) - minY };
		this.turntableDynamicGeometry = b;
	}

	getTurntableSettledArm(arm, ab, angle) {
		const cached = this.turntableSettledArm;
		if (cached && cached.source === arm && cached.angle === angle) return cached;
		const rad = angle * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
		const xs = [], ys = [];
		for (const x of [ab.left, ab.left + ab.width]) for (const y of [ab.top, ab.top + ab.height]) {
			xs.push(x * cos - y * sin); ys.push(x * sin + y * cos);
		}
		const left = Math.floor(Math.min(...xs)) - 1, top = Math.floor(Math.min(...ys)) - 1;
		const width = Math.ceil(Math.max(...xs)) - left + 1, height = Math.ceil(Math.max(...ys)) - top + 1;
		const sample = Math.min(1, 1536 / width, 1536 / height);
		const image = gdi.CreateImage(Math.ceil(width * sample), Math.ceil(height * sample));
		this.turntableBuildCounts.arm++;
		const g = image.GetGraphics();
		try {
			const cx = ab.left + ab.width / 2, cy = ab.top + ab.height / 2;
			g.DrawImage(arm, (cx * cos - cy * sin - ab.width / 2 - left) * sample,
				(cx * sin + cy * cos - ab.height / 2 - top) * sample,
				ab.width * sample, ab.height * sample, 0, 0, arm.Width, arm.Height, angle);
		} finally { image.ReleaseGraphics(g); }
		this.turntableSettledArm = { image, source: arm, angle, left, top, width, height };
		return this.turntableSettledArm;
	}

	drawTurntable(gr) {
		const started = grAnimationManager.now();
		try { this.drawTurntableContent(gr); }
		finally { this.turntableRenderCost = Math.max(0, grAnimationManager.now() - started); }
	}

	/** Capture once at resize entry; reuse the complete assembly through native size events. */
	captureTurntableResizeFrame() {
		this.turntableResizeFrame = null;
		const b = this.turntableLastDrawGeometry;
		if (!this.isTurntableActive() || !b || !this.turntableChassis || !this.turntableRecord) return;
		const pad = Math.ceil(16 * b.unit);
		const width = Math.ceil(b.w + 2 * pad), height = Math.ceil(b.h + 2 * pad);
		// One temporary surface only; huge panels use the complete cached-layer fallback.
		if (width > 2048 || height > 2048 || width * height > 4194304) return;
		try {
			const image = GDI(width, height, true, g => {
				g.SetSmoothingMode(SmoothingMode.AntiAlias);
				this.drawTurntableContent(g, { ...b, x: pad, y: pad }, true);
			});
			if (image) this.turntableResizeFrame = { image, pad, w: b.w, h: b.h };
		} catch (e) {
			// Allocation/rendering failure retains the cached assembly, never a chassis-only frame.
			this.turntableResizeFrame = null;
		}
	}

	drawTurntableContent(gr, geometry = null, snapshot = false) {
		const b = geometry || this.getTurntableGeometry();
		const { x, y, w, h, d, unit: u } = b;
		if (w < 80 || h < 60 || d < 40) { this.stopTurntableTimer(); return; }
		if (grAnimationManager.resizing && !snapshot) {
			const frame = this.turntableResizeFrame;
			if (frame) {
				const sx = w / frame.w, sy = h / frame.h;
				gr.DrawImage(frame.image, x - frame.pad * sx, y - frame.pad * sy,
					w + 2 * frame.pad * sx, h + 2 * frame.pad * sy, 0, 0, frame.image.Width, frame.image.Height);
			} else if (this.turntableLastDrawGeometry) {
				this.drawTurntableContent(gr, { ...this.turntableLastDrawGeometry, x, y }, true);
			}
			return;
		}
		const shadow = this.getTurntableShadow(b);
		const pad = shadow ? shadow.pad : 0;
		if (!snapshot) {
			this.turntableLastDrawGeometry = { ...b };
			this.turntableBounds = { x: x - pad, y: y - pad, w: w + 2 * pad, h: h + 2 * pad };
			this.updateTurntableState();
		}
		if (shadow) {
			const img = shadow.image;
			gr.DrawImage(img, x - pad, y - pad, shadow.width, shadow.height, 0, 0, img.Width, img.Height, 0, shadow.alpha);
		}
		const chassis = this.getTurntableChassis(b);
		gr.DrawImage(chassis, x, y, w, h, 0, 0, chassis.Width, chassis.Height);
		const dx = x + b.dx, dy = y + b.dy;
		const img = this.getTurntableRecord(d);
		const recordAngle = this.getTurntablePaintAngle();
		if (D2D && !snapshot) {
			gr.PushTransform();
			try {
				gr.SetTransform(RotationMatrix(dx + d / 2, dy + d / 2, recordAngle, this.turntableMatrix));
				gr.DrawImage(img, dx, dy, d, d, 0, 0, img.Width, img.Height);
			} finally { gr.PopTransform(); }
		} else {
			gr.DrawImage(img, dx, dy, d, d, 0, 0, img.Width, img.Height, recordAngle);
		}
		// Small stationary spindle; preserve the center design on the source CD.
		const cx = dx + d / 2, cy = dy + d / 2;
		gr.FillEllipse(cx - 4 * u, cy - 4 * u, 8 * u, 8 * u, RGB(71, 76, 84));
		gr.FillEllipse(cx - 2.8 * u, cy - 2.8 * u, 5.6 * u, 5.6 * u, RGB(221, 225, 232));
		// Keep the bright cap concentric too; an offset glint looks like a misplaced spindle.
		gr.FillEllipse(cx - u, cy - u, 2 * u, 2 * u, RGB(255, 255, 255));
		const px = x + w * 0.89, py = dy + d * 0.15;
		const smooth = this.turntableArm * this.turntableArm * (3 - 2 * this.turntableArm);
		const angle = 4 + 20 * smooth;
		const arm = this.getTurntableArm(b), ab = this.turntableArmBounds;
		if (!snapshot) this.updateTurntableDynamicBounds(b, ab);
		const settled = Math.abs(this.turntableArm) < 0.00001 || Math.abs(this.turntableArm - 1) < 0.00001;
		if (settled) {
			const still = this.getTurntableSettledArm(arm, ab, this.turntableArm < 0.5 ? 4 : 24);
			gr.DrawImage(still.image, px + still.left, py + still.top, still.width, still.height,
				0, 0, still.image.Width, still.image.Height);
		} else if (D2D && !snapshot) {
			gr.PushTransform();
			try {
				gr.SetTransform(RotationMatrix(px, py, angle, this.turntableMatrix));
				gr.DrawImage(arm, px + ab.left, py + ab.top, ab.width, ab.height, 0, 0, arm.Width, arm.Height);
			} finally { gr.PopTransform(); }
		} else {
			// GDI rotates around the cropped bitmap centre. Rotate that centre
			// around the original bearing so the cropped arm retains its pivot.
			const rad = angle * Math.PI / 180, cx = ab.left + ab.width / 2, cy = ab.top + ab.height / 2;
			const ax = px + cx * Math.cos(rad) - cy * Math.sin(rad) - ab.width / 2;
			const ay = py + cx * Math.sin(rad) + cy * Math.cos(rad) - ab.height / 2;
			gr.DrawImage(arm, ax, ay, ab.width, ab.height, 0, 0, arm.Width, arm.Height, angle);
		}
		const lx = x + w * 0.90, ly = y + h * 0.89;
		const playing = fb.IsPlaying && !fb.IsPaused;
		// Raised rocker face and engraved play/pause marks, with a subtle state tilt.
		gr.FillSolidRect(lx - 11 * u, ly - 19 * u, 22 * u, 38 * u, RGB(65, 72, 82));
		gr.FillSolidRect(lx - 10 * u, ly + (playing ? -17 : -19) * u, 20 * u, 35 * u, RGB(85, 93, 105));
		gr.DrawLine(lx - 10 * u, ly - 18 * u, lx + 10 * u, ly - 18 * u, 0.7 * u, RGB(154, 164, 178));
		const mark = RGB(196, 204, 214);
		gr.DrawLine(lx - 3 * u, ly - 13 * u, lx + 3 * u, ly - 9 * u, 0.8 * u, mark);
		gr.DrawLine(lx + 3 * u, ly - 9 * u, lx - 3 * u, ly - 5 * u, 0.8 * u, mark);
		gr.DrawLine(lx - 3 * u, ly - 5 * u, lx - 3 * u, ly - 13 * u, 0.8 * u, mark);
		gr.DrawLine(lx - 2 * u, ly + 6 * u, lx - 2 * u, ly + 12 * u, 1.4 * u, mark);
		gr.DrawLine(lx + 2 * u, ly + 6 * u, lx + 2 * u, ly + 12 * u, 1.4 * u, mark);
		gr.DrawLine(lx - 8 * u, ly, lx + 8 * u, ly, 0.5 * u, RGB(43, 50, 61));
		gr.FillEllipse(lx - 5 * u, ly - 41.5 * u, 10 * u, 10 * u,
			fb.IsPlaying ? (fb.IsPaused ? RGB(255, 184, 48) : RGB(87, 235, 141)) : RGB(76, 82, 90));
		gr.FillEllipse(lx - 2.6 * u, ly - 40.3 * u, 4 * u, 2.3 * u, RGB(243, 255, 246));
	}

	drawDiscArt(gr) {
		if (this.isTurntableActive()) { this.drawTurntable(gr); return; }
		if (grSet.layout !== 'default' || !grSet.displayDiscArt || !grm.ui.displayDetails || grm.ui.noAlbumArtStub ||
			this.discArtSize.y < grm.ui.albumArtSize.y || this.discArtSize.h > grm.ui.albumArtSize.h) {
			return;
		}

		grm.debug.setDebugProfile(grm.debug.showDrawExtendedTiming, 'create', '绘图 -> 碟片');

		this.syncDiscArtThemeVisualState();

		if (!this.discArtRotation && !this.discArtTrackEntryPending) {
			this.setDiscArtRotation();
		}

		this.syncDiscArtSlideAnimation();
		// Main.drawBackgrounds() has already restored the invalidated surface.
		// A second transition-only blend here flashes cover colours on the right.

		const applyOpacity = grm.ui.albumArtSize.w < grm.ui.ww * 0.66;
		const albumArtOpacity = applyOpacity ? grSet.detailsAlbumArtOpacity : 255;

		if (!grSet.discArtOnTop) {
			this.drawDiscArtImage(gr);
			this.hideDiscArtLeftOverflow(gr);
			if (this.discArtRotation && !this.discArtTrackEntryPending && grSet.detailsAlbumArtDiscAreaOpacity !== 255) {
				const discArtOpacity = applyOpacity ? grSet.detailsAlbumArtDiscAreaOpacity : 255;
				this.createDiscArtAlbumArtMask(gr, grm.ui.albumArtSize.x, grm.ui.albumArtSize.y, grm.ui.albumArtSize.w, grm.ui.albumArtSize.h, 0, 0, grm.ui.albumArtScaled.Width, grm.ui.albumArtScaled.Height, 0, discArtOpacity);
			} else {
				grm.ui.drawAlbumArt(gr, albumArtOpacity);
			}
		} else { // * Draw discArt on top of front cover
			grm.ui.drawAlbumArt(gr, albumArtOpacity);
			// Cover lyrics paint their backing later in drawMain; draw the front disc
			// after that backing so the selected foreground layer stays visible.
			if (!grm.ui.displayLyrics || grSet.detailsLyricsDisplayMode === 'arc') {
				this.drawDiscArtImage(gr);
			}
		}

		grm.debug.setDebugProfile(false, 'print', '绘图 -> 碟片');
	}

	/**
	 * Restores the Details background to the left of the cover after drawing disc art behind it.
	 * This acts as a screen-space clip for both GDI+ and D2D, preventing an oversized disc or its
	 * shadow from reappearing on the cover's left side while it slides into the hidden position.
	 * @param {GdiGraphics} gr - The graphics object.
	 */
	hideDiscArtLeftOverflow(gr) {
		const { x, y, h } = grm.ui.albumArtSize;
		if (!grSet.discArtAnimation || x < 1 || h < 1 || this.discArtSize.x >= x) return;

		gr.FillSolidRect(0, y, x, h, grCol.detailsBg);

		if (grm.ui.albumArt && grSet.styleBlend && grCol.imgBlended && grm.ui.ww > 0 && grm.ui.wh > 0) {
			const srcY = y * grCol.imgBlended.Height / grm.ui.wh;
			const srcW = x * grCol.imgBlended.Width / grm.ui.ww;
			const srcH = h * grCol.imgBlended.Height / grm.ui.wh;
			gr.DrawImage(grCol.imgBlended, 0, y, x, h, 0, srcY, srcW, srcH);
		}
	}

	/**
	 * Returns whether the disc is waiting to enter or is currently sliding.
	 * The settled shadow must not be drawn or retained during these states.
	 * @returns {boolean} True while the entry/slide visual is active.
	 */
	isDiscArtTransitionActive() {
		return !!(this.discArtSlideTimer || this.discArtTrackEntryPending || this.discArtTrackEntryTimer);
	}

	/**
	 * Drops the settled-position shadow as soon as a transition is armed.
	 * The shadow is position-dependent and must never survive while the disc itself
	 * is reset behind the cover or moving toward a new target.
	 */
	clearDiscArtTransitionShadow() {
		if (!this.discArtShadowImg || !this.discArtShadowImg.image) return;
		this.discArtShadowImg = { image: null, size: 0 };
	}

	/**
	 * Draws the disc art image and its shadow (if applicable).
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawDiscArtImage(gr) {
		if (this.isTurntableActive()) return;
		// A replacement bitmap can be installed before its entry timer fires. Do not
		// expose that bitmap (or the previous disc) for an intermediate paint.
		if (this.discArtTrackEntryPending) return;
		if (grSet.discArtOnTop && this.discArtFrontHidden) return;

		// * D2D path: hardware-accelerated rotation via matrix transform, no pre-computed frames needed
		if (D2D) {
			this.drawDiscArtD2DImage(gr);
			return;
		}

		// * GDI+ path
		const paintAngle = this.getDiscArtRotationAngle();
		const frameCount = Math.max(1, grSet.spinDiscArtImageCount);
		const frameIndex = grSet.spinDiscArt ? Math.round(paintAngle * frameCount / 360) % frameCount : this.discArtRotationIndex;
		const discArtImg = this.getDiscArtFrame(frameIndex, paintAngle) || this.discArtRotation;

		if (!grSet.filterAlbumArt && grm.ui.discArtImageDisplayed || !discArtImg) {
			return;
		}

		if (this.discArtShadowImg.image && !this.isDiscArtTransitionActive() && !this.immersiveLayoutTimer) {
			const shadowImg = this.discArtShadowImg.image;
			gr.DrawImage(shadowImg, -this.discArtShadow, grm.ui.albumArtSize.y - this.discArtShadow, shadowImg.Width, shadowImg.Height, 0, 0, shadowImg.Width, shadowImg.Height, 0, this.discArtShadowImg.alpha ?? 255);
		}

		// Missing cache frames keep moving by rotating the nearest prepared frame by
		// only its residual angle. Ready grid frames retain the cheap unrotated draw.
		gr.DrawImage(discArtImg, this.discArtSize.x, this.discArtSize.y, this.discArtSize.w, this.discArtSize.h,
			0, 0, discArtImg.Width, discArtImg.Height, grSet.spinDiscArt ? this.discArtFrameResidualAngle : 0);
	}

	/**
	 * Draws the metadata grid on the left side in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawGrid(gr) {
		if (!this.isPlaybackVisualActive() || !grm.ui.displayDetails) return;

		grm.debug.setDebugProfile(grm.debug.showDrawExtendedTiming, 'create', '绘图 -> 元数据表格');

		gr.SetSmoothingMode(SmoothingMode.HighQuality);
		gr.SetInterpolationMode(InterpolationMode.HighQualityBicubic);

		this.updateResponsiveLayout();
		this.setGridMetrics(gr);
		// Fit measured rows before painting; reserve a separate signature area.
		if (!this.cachedGridMetrics && this.gridContentWidth > 150) {
			const b = this.getDetailsPanelBounds();
			const budget = Math.max(1, b.bottom - this.gridTopStart - this.getSignatureReserve() - SCALE(12));
			// Increase font scale modestly only when the measured content fits.
			// This is a single trial, not repeated work on every repaint.
			const originalHeight = this.measureGridContentHeight(gr);
			if (this.detailsFitScale === 1 && originalHeight > 0 && originalHeight < budget * 0.86) {
				const trialScale = Math.min(1.28, budget * 0.92 / originalHeight);
				this.detailsFitScale = trialScale;
				this.updateResponsiveLayout();
				this.setGridMetrics(gr);
				if (this.measureGridContentHeight(gr) > budget) {
					this.detailsFitScale = 1;
					this.updateResponsiveLayout();
					this.setGridMetrics(gr);
				}
			}
			for (let pass = 0; pass < 5; pass++) {
				const required = this.measureGridContentHeight(gr);
				if (required <= budget || this.detailsFitScale <= 0.55) break;
				this.detailsFitScale = Math.max(0.55, this.detailsFitScale * budget / required * 0.98);
				this.updateResponsiveLayout();
				this.setGridMetrics(gr);
			}
		}
		this.gridTop = this.gridTopStart;

		if (this.gridContentWidth > 150) {
			const spacing = Math.floor(this.gridLineSpacing * 0.33);
			const spacing2 = Math.floor(this.gridLineSpacing * 0.5);

			// * Artist
			if (grSet.showGridArtist_layout) {
				this.gridTop += this.drawGridArtist(gr) + spacing;
			}

			// * Title
			if (grSet.showGridTitle_layout) {
				this.gridTop += this.drawGridTitle(gr) + spacing;
			} else if (!grSet.showGridArtist_layout) {
				this.gridTop += this.drawGridAlbum(gr) + spacing;
			}

			// * Timeline
			if (grSet.showGridTimeline_layout) {
				this.setGridTimelineSize(this.gridMarginLeft, this.gridTop + spacing, grm.ui.albumArtSize.x - this.gridMarginLeft * 2, this.timelineH);
				this.drawGridTimeline(gr);
				this.gridTop += this.timelineH + this.gridLineSpacing;
			}

			// * Album
			if (grSet.showGridArtist_layout || grSet.showGridTitle_layout) {
				this.gridTop += this.drawGridAlbum(gr) + spacing2;
			}

			// * Columns key and value
			this.drawGridColumns(gr);
		}

		this.cachedGridMetrics = true;
		gr.SetInterpolationMode(InterpolationMode.Default);

		grm.debug.setDebugProfile(false, 'print', '绘图 -> 元数据表格');
	}

	/**
	 * Draws the custom metadata grid menu.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawGridMenu(gr) {
		if (!grm.ui.displayMetadataGridMenu || grSet.layout !== 'default') return;

		const x = grm.ui.albumArtSize.x - 1;
		const y = grm.ui.topMenuHeight;
		const width = grm.ui.ww;
		const height = grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight;

		gr.FillSolidRect(x, y, width, height, pl.col.bg);
		for (const c of CustomMenu.controlList) c.draw(gr);

		if (CustomMenu.activeControl && CustomMenu.activeControl instanceof CustomMenuDropDown && CustomMenu.activeControl.isSelectUp) {
			CustomMenu.activeControl.draw(gr);
		}
	}

	/**
	 * Draws the artist on the metadata grid in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 * @returns {number} The height of the artist.
	 */
	drawGridArtist(gr) {
		if (!grStr.artist) return 0;

		// * Apply better anti-aliasing on smaller font sizes in HD res
		gr.SetTextRenderingHint(!RES._4K && (grSet.gridArtistFontSize_layout < 18 || grSet.displayScale < 100) ? TextRenderingHint.ClearTypeGridFit : TextRenderingHint.AntiAliasGridFit);

		const useArtistCountryPairs = grSet.showGridArtistFlags_layout && grm.ui.artistCountryPairs.length;

		if (useArtistCountryPairs) {
			grm.ui.drawGridArtistCountryPairs(gr, this.gridMarginLeft, Math.round(this.gridTop), this.gridContentWidth, this.gridArtistNumLinesHeight);
		}
		else {
			const artistColor = ['white', 'black', 'reborn', 'random'].includes(grSet.theme) ? grCol.detailsText : grSet.theme === 'cream' ? pl.col.header_artist_normal : pl.col.header_artist_playing;
			DrawString(gr, grm.ui.getFormattedString('gridArtist'), grFont.gridArtist, artistColor, this.gridMarginLeft, Math.round(this.gridTop), this.gridContentWidth, this.gridArtistNumLinesHeight, Stringformat.Trim_Ellipsis_Char);

			// * Legacy artist country flags
			if (grStr.artist && grSet.showGridArtistFlags_layout) {
				grm.ui.drawArtistCountryFlag(gr, 'metadataGrid');
			}
		}

		this.gridArtistTop = this.gridTop;
		this.gridArtistBottom = this.gridTop + this.gridArtistNumLinesHeight;
		return this.gridArtistNumLinesHeight;
	}

	/**
	 * Draws the track title on the metadata grid in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 * @returns {number} The height of the title.
	 */
	drawGridTitle(gr) {
		if (!grStr.title) return 0;

		// * Apply better anti-aliasing on smaller font sizes in HD res
		gr.SetTextRenderingHint(!RES._4K && (grSet.gridTitleFontSize_layout < 18 || grSet.displayScale < 100) ? TextRenderingHint.ClearTypeGridFit : TextRenderingHint.AntiAliasGridFit);

		DrawString(gr, grm.ui.getFormattedString('gridTitle'), grFont.gridTitle, grCol.detailsText, this.gridMarginLeft, Math.round(this.gridTop), this.gridContentWidth, this.gridTitleNumLinesHeight, Stringformat.Trim_Ellipsis_Char);

		this.gridTitleTop = this.gridTop;
		this.gridTitleBottom = this.gridTop + this.gridTitleNumLinesHeight;
		return this.gridTitleNumLinesHeight;
	}

	/**
	 * Draws the album on the metadata grid in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 * @returns {number} The height of the album.
	 */
	drawGridAlbum(gr) {
		if (!grStr.album) return 0;

		// * Apply better anti-aliasing on smaller font sizes in HD res
		gr.SetTextRenderingHint(!RES._4K && (grSet.gridAlbumFontSize_layout < 18 || grSet.displayScale < 100) ? TextRenderingHint.ClearTypeGridFit : TextRenderingHint.AntiAliasGridFit);

		DrawString(gr, grStr.album, grFont.gridAlbum, grCol.detailsText, this.gridMarginLeft, Math.round(this.gridTop), this.gridContentWidth, this.gridAlbumNumLinesHeight, Stringformat.Trim_Ellipsis_Char);

		this.gridAlbumTop = this.gridTop;
		this.gridAlbumBottom = this.gridTop + this.gridAlbumNumLinesHeight;
		return this.gridAlbumNumLinesHeight;
	}

	/**
	 * Draws the column key and column value on the metadata grid in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawGridColumns(gr) {
		for (let k = 0; k < grStr.grid.length; k++) {
			this.gridColumnKey = grStr.grid[k].label;
			this.gridColumnValue = grStr.grid[k].val;
			this.gridTxtRec = gr.MeasureString(this.gridColumnValue, grFont.gridVal, 0, 0, this.gridColumnValueWidth, grm.ui.wh);
			this.gridColumnCellHeight = this.gridTxtRec.Height + this.gridRowGap;
			this.gridColumnTop = this.gridTop;

			let gridShowLastFmImage = false;
			let gridShowReleaseFlagImage = false;
			let gridShowCodecLogoImage = false;
			let gridShowChannelLogoImage = false;
			let gridDropShadow = false;
			let gridValueColor = grCol.detailsText;

			if (this.gridColumnValue.length) {
				const columnKey = {
					'目录': () => {
						gridShowReleaseFlagImage = grSet.showGridReleaseFlags_layout;
						if (grSet.showGridReleaseFlags_layout === 'logo') {
							this.gridColumnValue = this.gridColumnValue.replace($('%releasecountry%'), '');
						}
					},
					'发行地区': () => {
						gridShowReleaseFlagImage = grSet.showGridReleaseFlags_layout;
						if (grSet.showGridReleaseFlags_layout === 'logo') this.gridColumnValue = '';
					},
					'编解码': () => {
						gridShowCodecLogoImage = grSet.showGridCodecLogo_layout;
						this.gridColumnValue = grSet.showGridCodecLogo_layout === 'logo' ? '' : this.getCodecString();
						this.gridColumnCellHeight = this.gridColumnValueHeight + this.gridRowGap;
					},
					'声道': () => {
						gridShowChannelLogoImage = grSet.showGridChannelLogo_layout;
						this.gridColumnValue = grSet.showGridChannelLogo_layout === 'logo' ? '' : this.getChannelString($('%channels%'));
						this.gridColumnCellHeight = this.gridColumnValueHeight + this.gridRowGap;
					},
					'热门': () => {
						gridValueColor = grCol.detailsHotness;
						gridDropShadow = true;
					},
					'播放次数': () => {
						gridShowLastFmImage = true;
					},
					'评级': () => {
						gridValueColor = grCol.detailsRating;
						gridDropShadow = true;
					},
					'default': () => {
						let matchCount = 0;
						// * On small player sizes, there is no space for all metadata entries.
						// * Hide them and only display entries from basicMeta.
						if (this.basicMetadataDisplay(this.gridColumnKey)) {
							this.gridColumnValue = '';
							this.gridColumnKey = '';
							matchCount++;
						}
						this.gridTop -= this.gridColumnCellHeight * matchCount;
					}
				};
				(columnKey[this.gridColumnKey] || columnKey.default)();

				if (this.gridTop + this.gridColumnCellHeight <= this.getDetailsPanelBounds().bottom - this.getSignatureReserve() - SCALE(8)) {
					// * Apply better anti-aliasing on smaller font sizes in HD res
					gr.SetTextRenderingHint(!RES._4K && (grSet.gridKeyFontSize_layout < 17 || grSet.gridValueFontSize_layout + SCALE(1) < 18 || grSet.displayScale < 100) ? TextRenderingHint.ClearTypeGridFit : TextRenderingHint.AntiAliasGridFit);

					if (gridDropShadow) {
						const gridBorderWidth = SCALE(0.5);
						gr.DrawString(this.gridColumnValue, grFont.gridVal, grCol.primary_rgb_s050, Math.round(this.gridColumnValueLeft + gridBorderWidth), Math.round(this.gridTop + gridBorderWidth), this.gridColumnValueWidth, this.gridColumnCellHeight, StringFormat(0, 0, 4));
						gr.DrawString(this.gridColumnValue, grFont.gridVal, grCol.primary_rgb_s050, Math.round(this.gridColumnValueLeft - gridBorderWidth), Math.round(this.gridTop + gridBorderWidth), this.gridColumnValueWidth, this.gridColumnCellHeight, StringFormat(0, 0, 4));
						gr.DrawString(this.gridColumnValue, grFont.gridVal, grCol.primary_rgb_s050, Math.round(this.gridColumnValueLeft + gridBorderWidth), Math.round(this.gridTop - gridBorderWidth), this.gridColumnValueWidth, this.gridColumnCellHeight, StringFormat(0, 0, 4));
						gr.DrawString(this.gridColumnValue, grFont.gridVal, grCol.primary_rgb_s050, Math.round(this.gridColumnValueLeft - gridBorderWidth), Math.round(this.gridTop - gridBorderWidth), this.gridColumnValueWidth, this.gridColumnCellHeight, StringFormat(0, 0, 4));
					}
					gr.DrawString(this.gridColumnKey, grFont.gridKey, grCol.detailsText, this.gridMarginLeft, Math.round(this.gridTop), this.gridColumnKeyWidth, this.gridColumnCellHeight, Stringformat.Trim_Ellipsis_Char);
					gr.DrawString(this.gridColumnValue, grFont.gridVal, gridValueColor, this.gridColumnValueLeft, Math.round(this.gridTop), this.gridColumnValueWidth, this.gridColumnCellHeight, StringFormat(0, 0, 4));

					// * Release flag
					if (gridShowReleaseFlagImage) {
						this.drawGridReleaseFlag(gr);
					}
					// * Codec logo
					if (gridShowCodecLogoImage) {
						this.drawGridCodecLogo(gr);
					}
					// * Channel logo
					if (gridShowChannelLogoImage) {
						this.drawGridChannelLogo(gr);
					}
					// * Last.fm logo
					if (gridShowLastFmImage) {
						this.drawGridLastfmLogo(gr);
					}
					this.gridTop += this.gridColumnCellHeight + this.gridRowGap;
				}
			}
		}
	}

	/**
	 * Draws an image on the metadata grid in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 * @param {GdiBitmap} image - The image to draw.
	 * @param {boolean} showLogoOnly - Whether to show only the logo.
	 * @param {number} xOffset - The offset added to x position.
	 * @param {number} yOffset - The offset added to y position.
	 * @param {number} cellHeightAdjustment - The adjustment applied to cell height.
	 */
	drawGridImage(gr, image, showLogoOnly, xOffset = 0, yOffset = 0, cellHeightAdjustment = 0) {
		if (image == null) return;

		// Calculate metrics and ratios
		const gridColumnValueMetrics = gr.MeasureString(showLogoOnly ? '' : this.gridColumnValue, grFont.gridVal, 0, 0, this.gridColumnValueWidth, grm.ui.wh);
		const heightRatio = (gr.CalcTextHeight(showLogoOnly ? 'Ag' : this.gridColumnValue, grFont.gridVal) - cellHeightAdjustment) / image.Height;
		const logoHeight = Math.round(image.Height * heightRatio);
		const logoWidth = Math.round(image.Width * heightRatio);

		// Get the width of the last line
		const newLineWidth = gr.EstimateLineWrap(this.gridColumnValue, grFont.gridVal, this.gridTxtRec.Lines === 1 ? this.gridColumnValueWidth : this.gridTxtRec.Width);
		const lastLineIndex = newLineWidth.length - 1;
		const lastLineWidth = newLineWidth[lastLineIndex] || gridColumnValueMetrics.Width;

		// Initial positions
		const stringWidth = lastLineWidth + xOffset;
		let xPos = this.gridColumnValueLeft + stringWidth;
		let yPos = this.gridTop + yOffset;

		// Adjust positions if the logo width exceeds the grid column width and move logo to the next line
		if (xPos + logoWidth > this.gridColumnValueLeft + this.gridColumnValueWidth) {
			const textHeight = gr.CalcTextHeight('Ag', grFont.gridVal);
			xPos = this.gridColumnValueLeft;
			yPos += textHeight;
			this.gridTxtRec = { ...this.gridTxtRec, Lines: this.gridTxtRec.Lines + 1, Height: this.gridTxtRec.Height + textHeight };
			this.gridColumnCellHeight = this.gridTxtRec.Height + this.gridRowGap;
		}

		gr.DrawImage(image, xPos, yPos, logoWidth, logoHeight, 0, 0, image.Width, image.Height);
	}

	/**
	 * Draws the release flag on the metadata grid in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawGridReleaseFlag(gr) {
		if (this.gridReleaseFlagImg == null) return;

		const logoOnly = grSet.showGridReleaseFlags_layout === 'logo' && this.gridColumnKey === '发行地区';
		const lineHeight = this.gridTxtRec.Height / this.gridTxtRec.Lines;
		const yCorr = (this.gridTxtRec.Lines - 1) * lineHeight;

		this.drawGridImage(gr, this.gridReleaseFlagImg, logoOnly, SCALE(logoOnly ? 0 : 8), logoOnly ? 0 : yCorr);
	}

	/**
	 * Draws the codec logo on the metadata grid in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawGridCodecLogo(gr) {
		if (this.gridCodecLogo == null) {
			this.loadGridCodecLogo();
			if (this.gridCodecLogo == null) return;
		}

		const logoOnly = grSet.showGridCodecLogo_layout === 'logo';
		this.drawGridImage(gr, this.gridCodecLogo, logoOnly, SCALE(logoOnly ? 0 : 8), logoOnly ? -1 : 2);
	}

	/**
	 * Draws the channel logo on the metadata grid in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawGridChannelLogo(gr) {
		if (this.gridChannelLogo == null) {
			this.loadGridChannelLogo();
			if (this.gridChannelLogo == null) return;
		}

		const logoOnly = grSet.showGridChannelLogo_layout === 'logo';
		this.drawGridImage(gr, this.gridChannelLogo, logoOnly, SCALE(logoOnly ? 0 : 8), logoOnly ? -1 : 2);
	}

	/**
	 * Draws the last.fm logo on the metadata grid in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawGridLastfmLogo(gr) {
		if (!this.playCountVerifiedByLastFm) return;

		const lastFmImg = this.getGridLogoImage(grPath.lastFmImageRed);
		const lastFmWhiteImg = this.getGridLogoImage(grPath.lastFmImageWhite);
		const lastFmLogo = grCol.lightBgDetails ? lastFmImg : lastFmWhiteImg;
		const lineHeight = this.gridTxtRec.Height / this.gridTxtRec.Lines;
		const yCorr = (this.gridTxtRec.Lines - 1) * lineHeight;

		this.drawGridImage(gr, lastFmLogo, false, SCALE(8), yCorr, 6);
	}

	/** Responsive logo scale for Details, independent of saved window metrics. */
	getDetailsLogoViewportScale() {
		const height = Math.max(1, grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight);
		return Math.max(0.65, Math.min(1.60, Math.sqrt(
			Math.max(1, grm.ui.ww) / SCALE(1920) * height / SCALE(960))));
	}

	/**
	 * Draws the band logo on the bottom left side in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawBandLogo(gr) {
		if (!this.isPlaybackVisualActive() || !grm.ui.albumArt || grSet.layout !== 'default' || !grm.ui.displayDetails ||
			grSet.lyricsLayout === 'full' && grm.ui.displayLyrics && grSet.detailsLyricsDisplayMode !== 'arc' && !this.isTurntableActive()) {
			return;
		}

		grm.debug.setDebugProfile(grm.debug.showDrawExtendedTiming, 'create', '绘图 -> 艺术家标识');

		gr.SetInterpolationMode(InterpolationMode.HighQualityBicubic);

		const bounds = this.getDetailsPanelBounds();
		const gap = Math.max(SCALE(4), Math.round(SCALE(8) * this.detailsInfoScale));
		const panelBottom = bounds.bottom - gap;
		const availableSpace = panelBottom - this.gridTop - gap;
		const logo = this.selectLogoForBackground(this.bandLogo, this.bandLogoInverted,
			grCol.lightBgDetails || grm.ui.noAlbumArtStub, grCol.detailsBg,
			this.bandLogoTones, this.bandLogoInvertedTones);

		if (logo && logo.Width > 0 && logo.Height > 0 && availableSpace >= SCALE(8)) {
			// Both limits follow the same panel. No native-pixel or fixed 75px gate.
			const maxWidth = Math.max(1, bounds.w - grm.ui.edgeMargin * 2);
			// Panel width already grows with the window; add only a gentle viewport response.
			const viewportScale = Math.sqrt(this.getDetailsLogoViewportScale());
			const targetWidth = Math.min(maxWidth, bounds.w * 0.58 * viewportScale);
			const targetHeight = Math.min(availableSpace, bounds.h * 0.16 * viewportScale);
			const scale = Math.min(targetWidth / logo.Width, targetHeight / logo.Height);
			const w = Math.max(1, Math.round(logo.Width * scale));
			const h = Math.max(1, Math.round(logo.Height * scale));
			const x = Math.round((bounds.w - w) / 2);
			const y = Math.round(this.gridTop + gap + (availableSpace - h) / 2);
			gr.DrawImage(logo, x, y, w, h, 0, 0, logo.Width, logo.Height, 0);
		}

		grm.debug.setDebugProfile(false, 'print', '绘图 -> 艺术家标识');
	}

	/**
	 * Returns whether multiple record-label logos cannot fit beyond the settled disc edge.
	 * Single-label rendering and TT's normal roomy layout are deliberately excluded.
	 * @param {GdiBitmap[]} labels - Currently selected normal/inverted label images.
	 * @param {number} totalLabelWidth - TT's original total desired width.
	 * @param {number} rightSideGap - Gap from the player right edge.
	 * @param {number} leftEdgeGap - Normal separation from artwork.
	 * @returns {boolean} True when the compact bottom-right layout is required.
	 */
	useCompactLabelLogoLayout(labels, totalLabelWidth, rightSideGap, leftEdgeGap) {
		if (labels.length < 2 || !grSet.displayDiscArt) return false;

		const coverRight = grm.ui.albumArtSize.x + grm.ui.albumArtSize.w;
		const measuredDiscWidth = Math.max(0, Number(this.discArtSize.w) || 0);
		// On the first Details frame the bitmap can still be null and discArtSize can still be
		// zero. Reserve the same square geometry TT will assign from the cover a moment later,
		// otherwise the logos briefly enter the normal layout and overflow the window.
		const discWidth = measuredDiscWidth || Math.max(0, grm.ui.albumArtSize.h, grm.ui.albumArtSize.w);
		if (discWidth < 1) return false;

		const safeGap = SCALE(16);
		const availableSpace = Math.max(0, grm.ui.ww - coverRight - safeGap);
		const configuredRatio = Math.max(0, Math.min(1, Number(grSet.discArtDisplayAmount) || 0));
		const exposedPixels = Math.min(discWidth * configuredRatio, availableSpace);
		const responsiveRatio = exposedPixels / discWidth;
		const usefulRatio = responsiveRatio >= this.discArtSlideMinRatio ? responsiveRatio : 0;
		const predictedTargetX = Math.floor(coverRight - discWidth + discWidth * usefulRatio);
		const currentDiscX = Number.isFinite(this.discArtSize.x) ? this.discArtSize.x : predictedTargetX;
		// Keep label geometry locked to the settled playback position while the stop retract
		// animation is active. fb.IsPlaying is already false during that transition; following
		// currentDiscX frame-by-frame makes the bottom-right logos resize/move and leaves
		// visible trails on black/dark themes before the final stopped-state repaint.
		const labelLayoutDiscX = (fb.IsPlaying || this.discArtExitActive) ? predictedTargetX : currentDiscX;
		const discRight = labelLayoutDiscX + discWidth;
		const clearAreaLeft = Math.max(
			grm.ui.albumArtSize.x + grm.ui.albumArtSize.w + leftEdgeGap,
			discRight + leftEdgeGap
		);
		const clearAreaWidth = Math.max(0, grm.ui.ww - rightSideGap - clearAreaLeft);

		const requiredWidth = totalLabelWidth + 12 * (labels.length - 1);
		return requiredWidth > clearAreaWidth;
	}

	/** Visible bounds of the two supplied 400x270 PNGs; all other labels retain their canvas. */
	getLabelVisibleBounds(name, logo) {
		if (logo.Width === 400 && logo.Height === 270) {
			const label = String(name).trim().toLowerCase();
			if (label === 'rca') return { x: 64, y: 0, w: 271, h: 270 };
			if (label === 'sony music latin') return { x: 0, y: 104, w: 400, h: 62 };
		}
		return { x: 0, y: 0, w: logo.Width, h: logo.Height };
	}

	/**
	 * Draws the visible label marks at the disc's bottom-right within TT's row budget.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 * @param {GdiBitmap[]} labels - Currently selected normal/inverted label images.
	 * @param {number} rightSideGap - Gap from the player right edge.
	 * @param {number} leftEdgeGap - Normal TT separation from artwork.
	 * @param {boolean} drawLabelPanel - Whether TT's label background panel is enabled.
	 */
	drawCompactLabelLogos(gr, labels, rightSideGap, leftEdgeGap, drawLabelPanel) {
		const circularLyrics = grm.ui.displayLyrics && (grSet.detailsLyricsDisplayMode === 'arc' || this.isTurntableActive());
		// Ordinary Details follows the viewport for every logo count. Preserve the
		// existing one/two-logo sizing in the rolling lyrics composition.
		const responsiveLabels = !circularLyrics || labels.length > 2;
		const viewportScale = responsiveLabels ? this.getDetailsLogoViewportScale() : 1;
		const countScale = circularLyrics && responsiveLabels ? 0.78 : 1;
		const maxLabelWidth = SCALE(200) * viewportScale * countScale;
		const coverRight = grm.ui.albumArtSize.x + grm.ui.albumArtSize.w;
		const measuredDiscWidth = Math.max(0, Number(this.discArtSize.w) || 0);
		const discWidth = measuredDiscWidth || Math.max(0, grm.ui.albumArtSize.h, grm.ui.albumArtSize.w);
		const availableSpace = Math.max(0, grm.ui.ww - coverRight - SCALE(16));
		const configuredRatio = Math.max(0, Math.min(1, Number(grSet.discArtDisplayAmount) || 0));
		const exposedPixels = Math.min(discWidth * configuredRatio, availableSpace);
		const responsiveRatio = discWidth > 0 ? exposedPixels / discWidth : 0;
		const usefulRatio = responsiveRatio >= this.discArtSlideMinRatio ? responsiveRatio : 0;
		const predictedTargetX = Math.floor(coverRight - discWidth + discWidth * usefulRatio);
		const currentDiscX = Number.isFinite(this.discArtSize.x) ? this.discArtSize.x : predictedTargetX;
		const labelLayoutDiscX = (fb.IsPlaying || this.discArtExitActive) ? predictedTargetX : currentDiscX;
		const discRight = labelLayoutDiscX + discWidth;

		// Preserve the verified two/three-logo budget, but let larger sets borrow a bounded
		// additional portion of the actually exposed disc. The cap grows by logo count rather
		// than opening TT's whole bottom chord, so four logos can recover useful size while
		// five or six still receive a real uniform downscale in a custom-size player.
		const visibleDiscWidth = Math.max(0, discRight - coverRight);
		const clearRightWidth = Math.max(0, grm.ui.ww - rightSideGap - discRight - leftEdgeGap);
		const playerRightWidth = Math.max(0, grm.ui.ww - rightSideGap - coverRight - leftEdgeGap);
		const discBorrowRatio = Math.min(0.70, 0.25 + Math.max(0, labels.length - 3) * 0.15);
		let availableGroupWidth = Math.max(labels.length,
			Math.min(playerRightWidth, clearRightWidth + visibleDiscWidth * discBorrowRatio));
		if (circularLyrics) {
			// Recompute from current dimensions; never freeze a former window's budget.
			availableGroupWidth = responsiveLabels
				? Math.max(labels.length, Math.min(playerRightWidth * 0.80,
					Math.min(playerRightWidth * 0.72, grm.ui.ww * 0.30) * viewportScale) * countScale)
				: Math.max(labels.length, Math.min(playerRightWidth * 0.72, grm.ui.ww * 0.30));
		}
		const sourceKey = labels.map((label, i) => {
			const source = this.labelLogo[i] || label;
			const b = this.labelLogoVisibleBounds[i] || { x: 0, y: 0, w: source.Width, h: source.Height };
			const cropped = b.x || b.y || b.w !== source.Width || b.h !== source.Height;
			return `${source.Width}x${source.Height}${cropped ? `:${b.x},${b.y},${b.w},${b.h}` : ''}`;
		}).join('|');

		let spacing = labels.length > 1
			? Math.min(12, Math.max(3, Math.round((availableGroupWidth / (labels.length - 1)) * 0.048)))
			: 0;

		const sizes = labels.map((label, i) => {
			const source = this.labelLogo[i] || label;
			const bounds = this.labelLogoVisibleBounds[i] || { x: 0, y: 0, w: source.Width, h: source.Height };
			const ttMaxWidth = responsiveLabels ? maxLabelWidth : RES._4K && bounds.w < 200 ? bounds.w * 2 : bounds.w;
			const maxWidth = Math.min(ttMaxWidth, maxLabelWidth);
			return { w: 0, h: 0, maxWidth, weight: Math.sqrt(bounds.w / bounds.h), source, bounds };
		});
		const adaptive = sizes.some(size => size.bounds.x || size.bounds.y ||
			size.bounds.w !== size.source.Width || size.bounds.h !== size.source.Height);

		const availableImageWidth = Math.max(sizes.length, availableGroupWidth - spacing * (sizes.length - 1));
		if (adaptive) {
			// Allocate by visible aspect ratio. Long marks receive more of the same
			// fixed row budget without enlarging the label area over the lyrics.
			let remaining = availableImageWidth;
			let pending = sizes.slice();
			while (pending.length) {
				const totalWeight = pending.reduce((sum, size) => sum + size.weight, 0);
				const capped = pending.filter(size => size.maxWidth < remaining * size.weight / totalWeight);
				if (!capped.length) {
					for (const size of pending) size.w = remaining * size.weight / totalWeight;
					break;
				}
				for (const size of capped) { size.w = size.maxWidth; remaining -= size.w; }
				pending = pending.filter(size => !capped.includes(size));
			}
		} else {
			const unscaledWidth = sizes.reduce((sum, size) => sum + size.maxWidth, 0);
			const scale = Math.min(1, availableImageWidth / Math.max(1, unscaledWidth));
			for (const size of sizes) size.w = size.maxWidth * scale;
		}
		for (let i = 0; i < sizes.length; i++) {
			const size = sizes[i];
			size.w = Math.max(1, Math.round(size.w));
			size.h = Math.max(1, Math.round(size.bounds.h * size.w / size.bounds.w));
		}

		if (circularLyrics) {
			const maxHeight = Math.max(1, Math.min(grm.ui.albumArtSize.h * 0.12,
				(grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight) * 0.12) * viewportScale * countScale);
			const tallest = Math.max(...sizes.map(size => size.h));
			const fit = Math.min(1, maxHeight / Math.max(1, tallest));
			for (const size of sizes) {
				size.w = Math.max(1, Math.floor(size.w * fit));
				size.h = Math.max(1, Math.floor(size.h * fit));
			}
		}
		const groupWidth = sizes.reduce((sum, size) => sum + size.w, 0) + spacing * (sizes.length - 1);
		if (!circularLyrics) this.labelLogoWindowedMetrics[labels.length] = {
			width: groupWidth, budget: availableGroupWidth, spacing, widths: sizes.map(size => size.w), sourceKey
		};
		const groupHeight = Math.max(...sizes.map(size => size.h));
		// Keep the compact row on TT's native 97.5%-of-window right anchor. Only the
		// group scale changes for 2-6 labels; compact mode must not invent a second
		// position tied to the disc edge or the row will sit too far left.
		const ttRightEdge = Math.round(grm.ui.ww * 0.975 + 1);
		const compactRight = Math.min(grm.ui.ww - rightSideGap, ttRightEdge);
		const labelX = Math.round(compactRight - groupWidth);
		const labelY = Math.round(Math.min(grm.ui.albumArtSize.y + grm.ui.albumArtSize.h,
			grm.ui.wh - grm.ui.lowerBarHeight) - groupHeight - SCALE(18));
		const panelPadX = SCALE(12);
		const panelPadY = SCALE(9);

		if (drawLabelPanel) {
			const panelX = labelX - panelPadX;
			const panelY = labelY - panelPadY;
			const panelW = groupWidth + panelPadX * 2;
			const panelH = groupHeight + panelPadY * 2;
			if (!['black', 'nblue', 'ngreen', 'nred', 'ngold'].includes(grSet.theme)) {
				const shadowKey = `${panelW}|${panelH}|${grCol.shadow}`;
				if (this.labelLogoCompactShadowKey !== shadowKey) {
					this.labelLogoCompactShadowKey = shadowKey;
					this.shadowImgLabel = null;
				}
				if (!this.shadowImgLabel && !grAnimationManager.resizing) {
					this.shadowImgLabel = ShadowRect(this.discArtShadow, this.discArtShadow, panelW, panelH, this.discArtShadow, grCol.shadow);
				}
				if (this.shadowImgLabel) gr.DrawImage(this.shadowImgLabel, panelX - this.discArtShadow, panelY - this.discArtShadow,
					panelW + 2 * this.discArtShadow, panelH + 2 * this.discArtShadow,
					0, 0, this.shadowImgLabel.Width, this.shadowImgLabel.Height);
			}
			gr.SetSmoothingMode(SmoothingMode.None);
			gr.FillSolidRect(panelX, panelY, panelW, panelH, grCol.detailsBg);
			gr.DrawRect(panelX, panelY, panelW, panelH - 1, 1, grCol.shadow);
			gr.SetSmoothingMode(SmoothingMode.HighQuality);
		}

		let x = labelX;
		let logoTop = Infinity;
		let logoBottom = -Infinity;
		for (let i = 0; i < labels.length; i++) {
			const size = sizes[i];
			const y = Math.round(labelY + (groupHeight - size.h) * 0.5);
			gr.DrawImage(labels[i], x, y, size.w, size.h,
				size.bounds.x, size.bounds.y, size.bounds.w, size.bounds.h);
			logoTop = Math.min(logoTop, y);
			logoBottom = Math.max(logoBottom, y + size.h);
			x += size.w + spacing;
		}
		const panelMargin = drawLabelPanel ? this.discArtShadow + SCALE(12) : 0;
		const top = drawLabelPanel ? labelY - SCALE(9) - panelMargin : logoTop;
		const bottom = drawLabelPanel ? labelY + groupHeight + SCALE(9) + panelMargin : logoBottom;
		this.labelLogoPaintBounds = { x: labelX - panelMargin, y: top,
			w: groupWidth + panelMargin * 2, h: bottom - top };
	}

	/**
	 * Draws the label logo on the bottom right side in the Details panel.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawLabelLogo(gr) {
		this.labelLogoPaintBounds = null;
		if (!this.isPlaybackVisualActive() || !grm.ui.albumArt || grSet.layout !== 'default' || !grm.ui.displayDetails ||
			grSet.lyricsLayout === 'full' && grm.ui.displayLyrics) {
			return;
		}

		grm.debug.setDebugProfile(grm.debug.showDrawExtendedTiming, 'create', '绘图 -> 唱片公司标识');

		gr.SetInterpolationMode(InterpolationMode.HighQualityBicubic);

		if (this.labelLogo.length > 0) {
			const lightBg = grSet.labelArtOnBg ? grCol.lightBgMain : grCol.lightBgDetails;
			const drawLabelPanel = !grSet.labelArtOnBg && !grSet.noDiscArtBg ||
				grSet.noDiscArtBg && grSet.displayDiscArt && this.discArt;
			// Retain TT's choice on coloured panels; correct only monochrome collisions.
			const labelBg = drawLabelPanel ? grCol.detailsBg : grSet.labelArtOnBg ? grCol.bg : grCol.detailsBg;
			const labels = this.labelLogo.map((logo, i) => this.selectLogoForBackground(
				logo, this.labelLogoInverted[i], lightBg || grm.ui.noAlbumArtStub,
				labelBg, this.labelLogoTones[i], this.labelLogoInvertedTones[i], true));
			const rightSideGap = 20; // How close last label is to right edge
			const leftEdgeGap = (grm.ui.albumArtOffCenter ? 20 : 40) * HD_4K(1, 1.8); // Space between art and label
			const leftEdgeWidth = HD_4K(30, 45); // How far label background extends on left
			const circularLyrics = grm.ui.displayLyrics && (grSet.detailsLyricsDisplayMode === 'arc' || this.isTurntableActive());
			const viewportScale = circularLyrics ? 1 : this.getDetailsLogoViewportScale();
			const maxLabelWidth = SCALE(200) * viewportScale;
			if (!circularLyrics) {
				// Invalidate geometry only when layout changes, not on rotation ticks.
				const a = grm.ui.albumArtSize;
				const key = [grm.ui.ww, grm.ui.wh, grm.ui.topMenuHeight, grm.ui.lowerBarHeight,
					a.x, a.y, a.w, a.h, this.discArtSize.w, this.discArtSize.h, !!this.discArt,
					grSet.displayDiscArt, grSet.discArtDisplayAmount, grSet.discArtAnimation,
					grm.ui.albumArtOffCenter, viewportScale, drawLabelPanel,
					labels.map(label => `${label.Width}x${label.Height}`).join('|')].join(':');
				if (key !== this.labelLogoGeometryKey) {
					this.labelLogoGeometryKey = key;
					this.cachedLabelLastLeftEdge = 0; this.cachedLabelLastHeight = 0;
					this.shadowImgLabel = null;
				}
			}
			let leftEdge = 0;
			let topEdge = 0;
			let totalLabelWidth = 0;
			let labelAreaWidth = 0;
			let labelSpacing = 0;
			let labelWidth;
			let labelHeight;
			let stableSingleLogoWidth = 0;

			for (const label of labels) {
				if (label.Width > maxLabelWidth) {
					totalLabelWidth += maxLabelWidth;
				} else {
					totalLabelWidth += (RES._4K && label.Width < 200 ? label.Width * 2 : label.Width) * viewportScale;
				}
			}


			const circularMultiLabels = labels.length > 1 && circularLyrics;
			const compactMode = circularMultiLabels || this.useCompactLabelLogoLayout(labels, totalLabelWidth, rightSideGap, leftEdgeGap);
			if (this.labelLogoCompactMode !== compactMode) {
				this.labelLogoCompactMode = compactMode;
				this.shadowImgLabel = null;
				this.labelLogoCompactShadowKey = '';
				this.cachedLabelLastLeftEdge = 0;
				this.cachedLabelLastHeight = 0;
				// The triggering paint can be clipped to the disc/artwork rectangle. A full follow-up
				// repaint removes every pixel occupied by the previous (often wider) label layout.
				if (this.labelLogoLayoutRepaintTimer) clearTimeout(this.labelLogoLayoutRepaintTimer);
				this.labelLogoLayoutRepaintTimer = setTimeout(() => {
					this.labelLogoLayoutRepaintTimer = null;
					if (grm.ui.displayDetails) window.Repaint();
				}, 0);
			}
			if (compactMode) {
				this.drawCompactLabelLogos(gr, labels, rightSideGap, leftEdgeGap, drawLabelPanel);
				grm.debug.setDebugProfile(false, 'print', '绘图 -> 唱片公司标识');
				return;
			}

			if (!this.cachedLabelLastLeftEdge) { // We don't want to recalculate this every screen refresh
				grm.debug.debugLog('图标 => 重新计算最后左边缘');
				this.shadowImgLabel = null;
				labelWidth = Math.round(totalLabelWidth / labels.length);
				labelHeight = Math.round(labels[0].Height * labelWidth / labels[0].Width); // Might be recalc'd below
				if (grm.ui.albumArt) {
					if (this.discArt && grSet.displayDiscArt) {
						leftEdge = Math.round(Math.max(grm.ui.albumArtSize.x + grm.ui.albumArtScaled.Width + 5, grm.ui.ww * 0.975 - totalLabelWidth + 1));
						// Disc artwork is installed while still hidden behind the cover. The label cache
						// can be rebuilt at that moment, but its collision layout must use the settled
						// playback position; otherwise it receives a temporarily wider area and appears
						// enlarged for the rest of the track.
						const labelLayoutDiscX = grSet.discArtAnimation && (fb.IsPlaying || this.discArtExitActive)
							? this.getDiscArtSlidePositions().targetX
							: this.discArtSize.x;
						const discCenter = {};
						discCenter.x = Math.round(labelLayoutDiscX + this.discArtSize.w / 2);
						discCenter.y = Math.round(this.discArtSize.y + this.discArtSize.h / 2);
						const radius = discCenter.y - this.discArtSize.y;
						const radiusSquared = radius * radius;
						let posValid = false;

						while (!posValid) {
							const allLabelsWidth = Math.max(Math.min(Math.round((grm.ui.ww - leftEdge - rightSideGap) / labels.length), maxLabelWidth), circularLyrics ? 50 : 1);
							//console.log("leftEdge = " + leftEdge + ", grm.ui.ww-leftEdge-10 = " + (grm.ui.ww-leftEdge-10) + ", allLabelsWidth=" + allLabelsWidth);
							const maxWidth = (RES._4K && labels[0].Width < 200 ? labels[0].Width * 2 : labels[0].Width) * viewportScale;
							labelWidth = (allLabelsWidth > maxWidth) ? maxWidth : allLabelsWidth;
							labelHeight = Math.round(labels[0].Height * labelWidth / labels[0].Width); // Width is based on height scale
							topEdge = Math.round(grm.ui.albumArtSize.y + grm.ui.albumArtSize.h - labelHeight);

							const a = topEdge - discCenter.y + 1; // Adding 1 to a and b so that the border just touches the edge of the discArt
							const b = leftEdge - discCenter.x + 1;

							if ((a * a + b * b) > radiusSquared) {
								posValid = true;
							} else {
								leftEdge += 4;
							}
						}
					} else {
						leftEdge = Math.round(Math.max(grm.ui.albumArtSize.x + grm.ui.albumArtSize.w + leftEdgeWidth + leftEdgeGap, grm.ui.ww * 0.975 - totalLabelWidth + 1));
					}
				} else {
					leftEdge = Math.round(grm.ui.ww * 0.975 - totalLabelWidth);
				}
				labelAreaWidth = grm.ui.ww - leftEdge - rightSideGap;
				this.cachedLabelLastLeftEdge = leftEdge;
				this.cachedLabelLastHeight = labelHeight;
			}
			else { // Already calculated
				leftEdge = this.cachedLabelLastLeftEdge;
				labelHeight = this.cachedLabelLastHeight;
				labelAreaWidth = grm.ui.ww - leftEdge - rightSideGap;
			}
			const savedSingleLogo = this.labelLogoWindowedMetrics[1];
			if (circularLyrics && labels.length === 1 && (UIWizard.WindowState === WindowState.Maximized || UIWizard.WindowState === WindowState.Fullscreen) &&
				savedSingleLogo) {
				const ttRightEdge = Math.min(grm.ui.ww - rightSideGap, Math.round(grm.ui.ww * 0.975 + 1));
				const availableWidth = Math.max(1, ttRightEdge - grm.ui.albumArtSize.x - grm.ui.albumArtSize.w - leftEdgeGap - leftEdgeWidth);
				const sameSource = savedSingleLogo.sourceKey === `${this.labelLogo[0].Width}x${this.labelLogo[0].Height}`;
				stableSingleLogoWidth = Math.min(sameSource ? savedSingleLogo.width : savedSingleLogo.budget, availableWidth);
				leftEdge = Math.round(ttRightEdge - stableSingleLogoWidth);
				labelHeight = Math.round(labels[0].Height * stableSingleLogoWidth / labels[0].Width);
				labelAreaWidth = grm.ui.ww - leftEdge - rightSideGap;
			}
			if (labelAreaWidth >= SCALE(50)) {
				if (labels.length > 1) {
					labelSpacing = Math.min(12, Math.max(3, Math.round((labelAreaWidth / (labels.length - 1)) * 0.048))); // Spacing should be proportional, and between 3 and 12 pixels
				}
				// console.log('labelAreaWidth = ' + labelAreaWidth + ", labelSpacing = " + labelSpacing);
				const eachLabelWidth = (labelAreaWidth - labelSpacing * (labels.length - 1)) / labels.length;
				const allLabelsWidth = Math.max(Math.min(circularLyrics ? Math.round(eachLabelWidth) : Math.floor(eachLabelWidth), maxLabelWidth), circularLyrics ? 50 : 1);
				const origLabelHeight = labelHeight;
				let labelX = leftEdge;
				let renderedLogoWidth = 0;
				const renderedLogoWidths = [];
				let logoTop = Infinity;
				let logoBottom = -Infinity;
				topEdge = grm.ui.albumArtSize.y + grm.ui.albumArtSize.h - labelHeight - 20;

				if (drawLabelPanel) {
					if (!['black', 'nblue', 'ngreen', 'nred', 'ngold'].includes(grSet.theme)) {
						if (!this.shadowImgLabel && !grAnimationManager.resizing) {
							this.shadowImgLabel = ShadowRect(this.discArtShadow, this.discArtShadow, grm.ui.ww - labelX + leftEdgeWidth, labelHeight + 40, this.discArtShadow, grCol.shadow);
						}
						if (this.shadowImgLabel) gr.DrawImage(this.shadowImgLabel, labelX - leftEdgeWidth - this.discArtShadow, topEdge - 20 - this.discArtShadow, grm.ui.ww - labelX + leftEdgeWidth + 2 * this.discArtShadow, labelHeight + 40 + 2 * this.discArtShadow,
							0, 0, this.shadowImgLabel.Width, this.shadowImgLabel.Height);
					}
					gr.SetSmoothingMode(SmoothingMode.None); // Disable smoothing
					gr.FillSolidRect(labelX - leftEdgeWidth, topEdge - 20, grm.ui.ww - labelX + leftEdgeWidth, labelHeight + 40, grCol.detailsBg);
					gr.DrawRect(labelX - leftEdgeWidth, topEdge - 20, grm.ui.ww - labelX + leftEdgeWidth, labelHeight + 40 - 1, 1, grCol.shadow);
					gr.SetSmoothingMode(SmoothingMode.HighQuality);
				}
				for (let i = 0; i < labels.length; i++) {
					// Scale the source-size ceiling with the viewport as well as the row budget.
					const maxWidth = (RES._4K && labels[i].Width < 200 ? labels[i].Width * 2 : labels[i].Width) * viewportScale;
					labelWidth = (allLabelsWidth > maxWidth) ? maxWidth : allLabelsWidth;
					if (stableSingleLogoWidth) labelWidth = Math.min(labelWidth, stableSingleLogoWidth);
					labelHeight = Math.round(labels[i].Height * labelWidth / labels[i].Width); // Width is based on height scale

					const logoY = Math.round(topEdge + origLabelHeight / 2 - labelHeight / 2);
					gr.DrawImage(labels[i], labelX, logoY, labelWidth, labelHeight, 0, 0, this.labelLogo[i].Width, this.labelLogo[i].Height);
					logoTop = Math.min(logoTop, logoY);
					logoBottom = Math.max(logoBottom, logoY + labelHeight);
					renderedLogoWidth += labelWidth;
					renderedLogoWidths.push(labelWidth);
					labelX += labelWidth + labelSpacing;
				}
				const panelMargin = drawLabelPanel ? this.discArtShadow : 0;
				const paintLeft = drawLabelPanel ? leftEdge - leftEdgeWidth - panelMargin : leftEdge;
				const paintTop = drawLabelPanel ? Math.min(logoTop, topEdge - 20 - panelMargin) : logoTop;
				const paintRight = drawLabelPanel ? grm.ui.ww : labelX - labelSpacing;
				const paintBottom = drawLabelPanel ? Math.max(logoBottom, topEdge + origLabelHeight + 20 + panelMargin) : logoBottom;
				this.labelLogoPaintBounds = { x: paintLeft, y: paintTop,
					w: paintRight - paintLeft, h: paintBottom - paintTop };
				if (UIWizard.WindowState !== WindowState.Maximized && UIWizard.WindowState !== WindowState.Fullscreen) {
					this.labelLogoWindowedMetrics[labels.length] = {
						width: renderedLogoWidth + labelSpacing * (labels.length - 1), spacing: labelSpacing,
						budget: allLabelsWidth * labels.length + labelSpacing * (labels.length - 1),
						widths: renderedLogoWidths,
						sourceKey: this.labelLogo.map((label, i) => {
							const b = this.labelLogoVisibleBounds[i] || { x: 0, y: 0, w: label.Width, h: label.Height };
							const cropped = b.x || b.y || b.w !== label.Width || b.h !== label.Height;
							return `${label.Width}x${label.Height}${cropped ? `:${b.x},${b.y},${b.w},${b.h}` : ''}`;
						}).join('|')
					};
				}
			}
		}

		grm.debug.setDebugProfile(false, 'print', '绘图 -> 唱片公司标识');
	}
	// #endregion

	// * PLUBLIC METHODS - METRICS * //
	// #region PUBLIC METHODS - METRICS
	/**
	 * Updates the Details-only responsive scale and derived fonts.
	 * The configured font sizes remain the immutable 1.00 baseline; no setting is written back.
	 */
	updateResponsiveLayout() {
		const bounds = this.getDetailsPanelBounds();
		const geometryKey = [bounds.y, bounds.w, bounds.h, grm.ui.edgeMargin,
			!!this.bandLogo, grStr.artist, grStr.album, grStr.title,
			JSON.stringify(grStr.grid)].join('|');
		if (geometryKey !== this.detailsGeometryKey) {
			this.detailsGeometryKey = geometryKey;
			this.detailsFitScale = 1;
			this.cachedGridMetrics = false;
			this.cachedGridWrapSpace = {};
		}
		const availableWidth = Math.max(0, bounds.w - grm.ui.edgeMargin * 1.5);
		const availableHeight = bounds.h;
		const rawScale = availableWidth && availableHeight ? Math.min(availableWidth / 340, availableHeight / 720) : 1;
		// Preserve FIX 8 exactly until the actual player viewport itself exceeds the HD
		// baseline. High-resolution growth is then added on top of the original capped
		// scales, so a non-maximized QHD window cannot enlarge either original logo path.
		const viewportRatio = Math.max(1, Math.min(grm.ui.ww / 1920, grm.ui.wh / 1080));
		const highResBoost = Math.min(0.27, (viewportRatio - 1) * 0.45);
		const baseHeroScale = Math.max(1, Math.min(1.30, rawScale));
		const baseInfoScale = Math.max(1, Math.min(1.22, 1 + (baseHeroScale - 1) * 0.80));
		const baseLogoScale = Math.max(1, Math.min(1.24, 1 + (baseHeroScale - 1) * 0.90));
		const arcFit = grm.ui.displayLyrics && grSet.detailsLyricsDisplayMode === 'arc' && !this.isTurntableActive() && !this.immersiveMode
			? Math.max(0.68, Math.min(1, grm.ui.albumArtSize.h / SCALE(820))) : 1;
		const heroScale = Math.round(Math.min(1.78, (baseHeroScale + highResBoost) * arcFit * this.detailsFitScale) * 100) / 100;
		const infoScale = Math.round(Math.min(1.58, (baseInfoScale + highResBoost * 0.48) * arcFit * this.detailsFitScale) * 100) / 100;
		const logoScale = Math.round(Math.min(1.38, baseLogoScale + highResBoost * 0.52) * 100) / 100;

		const artistTitle = grSet.showGridArtist_default && grSet.showGridTitle_default || grSet.showGridArtist_artwork && grSet.showGridTitle_artwork;
		const responsiveFontKey = [
			heroScale, infoScale, logoScale, artistTitle, grSet.customThemeFonts,
			grFont.fontGridArtist, grFont.fontGridTitle, grFont.fontGridTitleBold,
			grFont.fontGridAlbum, grFont.fontGridKey, grFont.fontGridValue,
			grSet.gridArtistFontSize_layout, grSet.gridTrackNumFontSize_layout,
			grSet.gridTitleFontSize_layout, grSet.gridAlbumFontSize_layout,
			grSet.gridKeyFontSize_layout, grSet.gridValueFontSize_layout
		].join('|');
		const fontsRecreatedExternally = this.detailsResponsiveFontRefs.artist && this.detailsResponsiveFontRefs.artist !== grFont.gridArtist;

		if (responsiveFontKey === this.detailsResponsiveFontKey && !fontsRecreatedExternally) return;

		this.detailsHeroScale = heroScale;
		this.detailsInfoScale = infoScale;
		this.detailsLogoScale = logoScale;
		grFont.gridArtist      = Font(grFont.fontGridArtist, Math.round(grSet.gridArtistFontSize_layout * heroScale), grSet.customThemeFonts ? FontStyle.Bold : 0);
		grFont.gridTrackNumber = Font(artistTitle ? grFont.fontGridTitle : grFont.fontGridTitleBold, Math.round(grSet.gridTrackNumFontSize_layout * heroScale), 0);
		grFont.gridTitle       = Font(artistTitle ? grFont.fontGridTitle : grFont.fontGridTitleBold, Math.round(grSet.gridTitleFontSize_layout * heroScale), 0);
		grFont.gridAlbum       = Font(grFont.fontGridAlbum, Math.round(grSet.gridAlbumFontSize_layout * heroScale), grSet.customThemeFonts ? FontStyle.Bold : 0);
		grFont.gridKey         = Font(grFont.fontGridKey, Math.round(grSet.gridKeyFontSize_layout * infoScale), 0);
		grFont.gridVal         = Font(grFont.fontGridValue, Math.round((grSet.gridValueFontSize_layout + 1) * infoScale), 0);

		this.detailsResponsiveFontKey = responsiveFontKey;
		this.detailsResponsiveFontRefs = {
			artist: grFont.gridArtist,
			title: grFont.gridTitle,
			album: grFont.gridAlbum,
			key: grFont.gridKey,
			value: grFont.gridVal
		};
		this.cachedGridWrapSpace = {};
		this.cachedGridMetrics = false;
	}

	/**
	 * Sets the metadata grid metrics and caches all calculated values.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	measureGridContentHeight(gr) {
		const spacing = Math.floor(this.gridLineSpacing * 0.33);
		let height = 0;
		if (grSet.showGridArtist_layout) height += this.gridArtistNumLinesHeight + spacing;
		if (grSet.showGridTitle_layout) height += this.gridTitleNumLinesHeight + spacing;
		else if (!grSet.showGridArtist_layout) height += this.gridAlbumNumLinesHeight + spacing;
		if (grSet.showGridTimeline_layout) height += Math.floor(this.gridLineSpacing * 0.33) + this.timelineH + this.gridLineSpacing;
		if (grSet.showGridArtist_layout || grSet.showGridTitle_layout) height += this.gridAlbumNumLinesHeight + Math.floor(this.gridLineSpacing * 0.5);
		for (const row of grStr.grid) {
			if (!row.val || this.basicMetadataDisplay(row.label)) continue;
			height += gr.MeasureString(row.val, grFont.gridVal, 0, 0, this.gridColumnValueWidth, grm.ui.wh).Height + this.gridRowGap * 2;
		}
		return height;
	}

	setGridMetrics(gr) {
		if (this.cachedGridMetrics) return;
		// Metrics are synchronous. A queued Promise must not mark old geometry valid.
		this.setGridMainMetrics(gr, () => {});
		this.setGridTextMetrics(gr, () => {});
	}

	/**
	 * Sets the metadata grid main sizes.
	 * This includes calculating margins, content width, and column dimensions.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 * @param {Function} metricsCalculated - The callback function to be executed after calculations are finished.
	 */
	setGridMainMetrics(gr, metricsCalculated) {
		this.discArtShadow = SCALE(6);
		this.gridTooltipHeight = SCALE(100);
		this.gridLineSpacing = Math.round(SCALE(30) * this.detailsInfoScale);
		this.gridTrackNumSpacing = Math.round(SCALE(8) * this.detailsHeroScale);
		this.gridColumnMargin = Math.round(SCALE(10) * this.detailsInfoScale);
		this.gridRowGap = Math.round(5 * this.detailsInfoScale);
		this.timelineH = Math.round(SCALE(8) * this.detailsInfoScale);

		this.gridMarginLeft   = grm.ui.edgeMargin;
		this.gridTopStart     = this.getDetailsPanelBounds().y + Math.round(grm.ui.edgeMargin * Math.min(1, this.detailsInfoScale));
		this.gridTop          = this.gridTopStart;
		this.gridContentWidth = Math.floor((!grm.ui.albumArt && this.discArt ? this.discArtSize.x : grm.ui.albumArtSize.x) - grm.ui.edgeMargin * 1.5);
		if (grm.ui.isBalancedDetailsLayout?.()) {
			this.gridContentWidth = Math.max(1, Math.floor(grm.ui.getDetailsArtworkBudget().metadataW - grm.ui.edgeMargin * 1.5));
		}

		this.gridColumnKeyWidth  = CalcGridMaxTextWidth(gr, grStr.grid, grFont.gridKey);
		this.gridColumnKeyHeight = gr.MeasureString('Ag', grFont.gridKey, 0, 0, this.gridContentWidth, grm.ui.wh).Height;
		this.gridColumnKeyBottom = this.gridColumnTop + this.gridColumnKeyHeight;

		this.gridColumnValueWidth  = this.gridContentWidth - this.gridColumnMargin - this.gridColumnKeyWidth + SCALE(5);
		this.gridColumnValueHeight = gr.MeasureString('Ag', grFont.gridVal, 0, 0, this.gridContentWidth, grm.ui.wh).Height;
		this.gridColumnValueLeft   = this.gridMarginLeft + this.gridColumnKeyWidth + this.gridColumnMargin;
		this.gridColumnValueBottom = this.gridColumnTop + this.gridColumnValueHeight;

		metricsCalculated();
	}

	/**
	 * Sets the metadata grid text sizes.
	 * This includes calculating wrap information and dimensions for artist, title, album, and other text elements based on the grid configuration.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 * @param {Function} metricsCalculated - The callback function to be executed after calculations are finished.
	 */
	setGridTextMetrics(gr, metricsCalculated) {
		if (grSet.showGridArtist_layout) {
			this.gridFlagSizeW             = grm.ui.getFlagSizeWidth('metadataGrid');
			this.gridFlagSizeWhiteSpace    = grm.ui.getFlagSizeWhiteSpace('metadataGrid');

			const useArtistCountryPairs = grSet.showGridArtistFlags_layout && grm.ui.artistCountryPairs.length;
			if (useArtistCountryPairs) {
				const pairMetrics = grm.ui.getGridArtistCountryPairsMetrics(gr, this.gridContentWidth);
				this.gridArtistWrapInfo        = { lineCount: pairMetrics.lineCount, totalWrapSpace: 0 };
				this.gridArtistWrapLinesExceed = false;
				this.gridArtistWrapWidth       = 0;
				this.gridArtistWidth           = Math.ceil(pairMetrics.totalWidth);
				this.gridArtistHeight          = pairMetrics.lineHeight;
				this.gridArtistTxtRec          = { Lines: pairMetrics.lineCount };
				this.gridArtistNumLines        = pairMetrics.lineCount;
				this.gridArtistNumLinesHeight  = pairMetrics.height;
			}
			else {
				this.gridArtistWrapInfo        = CalcWrapSpace(gr, grStr.artist, grFont.gridArtist, this.gridContentWidth, this.cachedGridWrapSpace);
				this.gridArtistWrapLinesExceed = this.gridArtistWrapInfo.lineCount > 2;
				this.gridArtistWrapWidth       = this.gridArtistWrapInfo.totalWrapSpace - this.gridFlagSizeW;
				this.gridArtistWidth           = Math.ceil(gr.MeasureString(grStr.artist, grFont.gridArtist, 0, 0, 0, 0, Stringformat.Trim_Ellipsis_Char | Stringformat.Measure_Trailing_Spaces).Width + this.gridFlagSizeW + this.gridArtistWrapWidth);
				this.gridArtistHeight          = gr.MeasureString(grStr.artist, grFont.gridArtist, 0, 0, 0, 0).Height;
				this.gridArtistTxtRec          = gr.MeasureString(grStr.artist, grFont.gridArtist, 0, 0, grSet.showGridArtistFlags_layout && grm.ui.flagImgs.length ? this.gridContentWidth - this.gridFlagSizeW : this.gridContentWidth, grm.ui.wh);
				this.gridArtistNumLines        = Math.min(2, this.gridArtistTxtRec.Lines);
				this.gridArtistNumLinesHeight  = gr.CalcTextHeight(grStr.artist, grFont.gridArtist) * this.gridArtistNumLines;
			}
		}
		if (grSet.showGridTitle_layout) {
			this.gridTrackNumWidth        = Math.ceil(gr.MeasureString(grStr.tracknum, grFont.gridTrackNumber, 0, 0, 0, 0).Width);
			this.gridTitleWrapInfo        = CalcWrapSpace(gr, grm.ui.getFormattedString('gridTitle'), grFont.gridTitle, this.gridContentWidth, this.cachedGridWrapSpace);
			this.gridTitleWrapLinesExceed = this.gridTitleWrapInfo.lineCount > 2;
			this.gridTitleWrapWidth       = this.gridTitleWrapInfo.totalWrapSpace;
			this.gridTitleWidth           = Math.ceil(gr.MeasureString(grStr.title, grFont.gridTitle, 0, 0, 0, 0, Stringformat.Trim_Ellipsis_Char | Stringformat.Measure_Trailing_Spaces).Width + this.gridTrackNumWidth + this.gridTrackNumSpacing + this.gridTitleWrapWidth);
			this.gridTitleHeight          = gr.MeasureString(grStr.title, grFont.gridTitle, 0, 0, 0, 0).Height;
			this.gridTitleTxtRec          = gr.MeasureString(grm.ui.getFormattedString('gridTitle'), grFont.gridTitle, 0, 0, this.gridContentWidth, grm.ui.wh);
			this.gridTitleNumLines        = Math.min(2, this.gridTitleTxtRec.Lines);
			this.gridTitleNumLinesHeight  = gr.CalcTextHeight(grStr.title, grFont.gridTitle) * this.gridTitleNumLines;
		}
			this.gridAlbumWrapInfo        = CalcWrapSpace(gr, grStr.album, grFont.gridAlbum, this.gridContentWidth, this.cachedGridWrapSpace);
			this.gridAlbumWrapLinesExceed = this.gridAlbumWrapInfo.lineCount > (grSet.showGridArtist_layout || grSet.showGridTitle_layout ? 2 : 3);
			this.gridAlbumWrapWidth       = this.gridAlbumWrapInfo.totalWrapSpace;
			this.gridAlbumWidth           = Math.ceil(gr.MeasureString(grStr.album, grFont.gridAlbum, 0, 0, 0, 0, Stringformat.Trim_Ellipsis_Char | Stringformat.Measure_Trailing_Spaces).Width) + this.gridAlbumWrapWidth;
			this.gridAlbumHeight          = gr.MeasureString(grStr.album, grFont.gridAlbum, 0, 0, 0, 0).Height;
			this.gridAlbumTxtRec          = gr.MeasureString(grStr.album, grFont.gridAlbum, 0, 0, this.gridContentWidth, grm.ui.wh);
			this.gridAlbumNumLines        = Math.min(grSet.showGridArtist_layout || grSet.showGridTitle_layout ? 2 : 3, this.gridAlbumTxtRec.Lines);
			this.gridAlbumNumLinesHeight  = gr.CalcTextHeight(grStr.album, grFont.gridAlbum) * this.gridAlbumNumLines;

			metricsCalculated();
	}
	// #endregion

	// * PUBLIC METHODS - COMMON * //
	// #region PUBLIC METHODS - COMMON
	/**
	 * Clears individual cache properties, the specified cache type, or all caches.
	 * @param {string} [type] - The type of cache to clear. Can be 'metrics', 'discArt', 'codecLogo', 'channelLogo', 'bandLogo', 'labelLogo'. If not provided, all caches will be cleared.
	 * @param {string} [property] - The specific property to clear within the cache type. Applicable only if `type` is provided.
	 * @param {boolean} [clearArtCache] - Whether to clear everything in the artCache object.
	 * @param {boolean} [keepDiscArt] - Whether to keep the disc art. This is considered only when `type` is 'discArt' or not provided (clearing all caches).
	 * @example
	 * // Clear an individual property within a specific cache type
	 * clearCache('metrics', 'cachedGridMetrics');
	 * @example
	 * // Clear a specific cache type
	 * clearCache('metrics');
	 * @example
	 * // Clear all caches
	 * clearCache();
	 * @example
	 * // Clear all caches and the artCache
	 * clearCache(undefined, undefined, true);
	 */
	clearCache(type, property, clearArtCache, keepDiscArt) {
		const cacheActions = {
			metrics: () => {
				this.cachedGridWrapSpace = {};
				this.cachedGridMetrics = false;
				this.cachedLabelLastLeftEdge = 0;
				this.cachedLabelLastHeight = 0;
			},
			discArt: () => {
				this.discArtAlbumArtMaskCache = null;
				this.discArtLoadToken++;
				this.turntableDiscPending = false;
				if (this.discArtFadeTimer) this.clearTimer('discArtFade');
				if (this.discArtCommitTimer) this.clearTimer('discArtCommit');
				if (this.discArtDeferredStartTimer) this.clearTimer('discArtDeferredStart');
				if (this.discArtPrecomputeTimer) this.clearTimer('discArtPrecompute');
				this.discArt = keepDiscArt ? this.discArt : null;
				this.discArtCover = null;
				this.discArtArray = [];
				this.discArtD2DImage = null;
				this.discArtD2DRotationAngle = 0;
				this.discArtDiskCacheKey = '';
				this.discArtDiskCachedPath = '';
				this.discArtDiskCachedFound = false;
				this.discArtRotation = null;
				this.discArtImageKey = keepDiscArt ? this.discArtImageKey : '';
				this.discArtFadePrevious = null;
				this.discArtFadeProgress = 1;
			},
			codecLogo: () => {
				this.gridCodecLogo = null;
			},
			channelLogo: () => {
				this.gridChannelLogo = null;
			},
			bandLogo: () => {
				this.bandLogo = null;
				this.bandLogoInverted = null;
				this.bandLogoTones = { black: false, white: false };
				this.bandLogoInvertedTones = { black: false, white: false };
			},
			labelLogo: () => {
				this.labelLogo = [];
				this.labelLogoInverted = [];
				this.labelLogoVisibleBounds = [];
				this.pendingLabelLogoVisibleBounds = null;
				this.labelLogoTones = [];
				this.labelLogoInvertedTones = [];
				this.pendingLabelLogo = null;
				this.pendingLabelLogoInverted = null;
				this.shadowImgLabel = null;
				this.labelLogoCompactMode = null;
				this.labelLogoCompactShadowKey = '';
				if (this.labelLogoLayoutRepaintTimer) clearTimeout(this.labelLogoLayoutRepaintTimer);
				this.labelLogoLayoutRepaintTimer = null;
				if (this.labelLogoSettleRepaintTimer) clearTimeout(this.labelLogoSettleRepaintTimer);
				this.labelLogoSettleRepaintTimer = null;
			}
		};

		if (clearArtCache) {
			grm.artCache && grm.artCache.clear();
			grm.debug.debugLog('详情缓存 => 已清除图片缓存');
		}

		if (type) {
			// * Clear individual cache property
			if (property && Object.hasOwnProperty.call(this, property)) {
				this[property] = null;
				grm.debug.debugLog(`详情缓存 => 已清除缓存类型 "${type}" 中的属性 "${property}"`);
			}
			// * Clear specific cache type
			else if (cacheActions[type]) {
				cacheActions[type]();
				grm.debug.debugLog(`详情缓存 => 已清除缓存类型 "${type}"`);
			}
			return;
		}

		// * Clear all caches
		for (const action in cacheActions) {
			cacheActions[action]();
		}
		grm.debug.debugLog('详情缓存 => 已清除全部缓存');
	}

	/**
	 * Clears timers based on the timer type.
	 * @param {string} [type] - The type of timer to clear. If not provided, all timers will be cleared.
	 * - 'discArt'.
	 */
	clearTimer(type) {
		const timers = {
			discArt: {
				timer: this.discArtRotationTimer,
				clear: id => grAnimationManager.remove(id),
				log: '计时器 => 碟片旋转计时器已清除'
			},
			discArtSlide: {
				timer: this.discArtSlideTimer,
				clear: id => grAnimationManager.remove(id),
				log: '计时器 => 碟片滑动计时器已清除'
			},
			discArtFade: {
				timer: this.discArtFadeTimer,
				clear: id => grAnimationManager.remove(id),
				log: '计时器 => 碟片换图过渡计时器已清除'
			},
			discArtCommit: {
				timer: this.discArtCommitTimer,
				clear: clearTimeout,
				log: '计时器 => 碟片换图防抖计时器已清除'
			},
			discArtTrackEntry: {
				timer: this.discArtTrackEntryTimer,
				clear: clearTimeout,
				log: '计时器 => 切歌出碟计时器已清除'
			},
			discArtDeferredStart: {
				timer: this.discArtDeferredStartTimer,
				clear: clearTimeout,
				log: '计时器 => 碟片延迟旋转计时器已清除'
			},
			discArtPrecompute: {
				timer: this.discArtPrecomputeTimer,
				clear: clearTimeout,
				log: '计时器 => 碟片旋转帧预计算计时器已清除'
			}
		};

		const clearTimerByType = (type) => {
			const { timer, clear, log } = timers[type];
			if (timer) {
				clear(timer);
				if (type === 'discArt') {
					this.discArtRotationTimer = null;
					this.discArtRotationNextTick = 0;
				}
				if (type === 'discArtSlide') this.discArtSlideTimer = null;
				if (type === 'discArtFade') this.discArtFadeTimer = null;
				if (type === 'discArtCommit') this.discArtCommitTimer = null;
				if (type === 'discArtTrackEntry') this.discArtTrackEntryTimer = null;
				if (type === 'discArtDeferredStart') this.discArtDeferredStartTimer = null;
				if (type === 'discArtPrecompute') this.discArtPrecomputeTimer = null;
				grm.debug.debugLog(log);
			}
		};

		if (type && timers[type]) {
			clearTimerByType(type);
			if (type === 'discArt') clearTimerByType('discArtPrecompute');
		} else {
			for (const key in timers) {
				clearTimerByType(key);
			}
		}
	}
	// #endregion

	// * PUBLIC METHODS - METADATA GRID * //
	// #region PUBLIC METHODS - METADATA GRID
	/**
	 * Initializes the metadata grid menu and toggles its open/close state.
	 */
	initGridMenuState() {
		if (grSet.layout !== 'default') {
			const msg = grm.msg.getMessage('main', 'metadataGridLiveEdit');
			fb.ShowPopupMessage(msg, '元数据表格实时编辑');
			return;
		}

		grm.ui.displayMetadataGridMenu = !grm.ui.displayMetadataGridMenu;
		grm.ui.displayCustomThemeMenu = false;

		if (grm.ui.displayMetadataGridMenu) {
			if (!grm.ui.displayDetails) {
				grm.ui.displayDetails = true;
				grm.ui.displayPlaylist = false;
				grm.ui.displayLibrary = false;
				grm.ui.displayBiography = false;
				grm.ui.resizeArtwork(true);
			}

			grm.gridMenu.initMetadataGridMenu(1);
		}

		grm.button.initButtonState();
		window.Repaint();
	}

	/**
	 * Determines whether basic metadata should be displayed based on the grid column width.
	 * @param {string} gridColumnKey - The grid column key.
	 * @returns {boolean} True if basic metadata should be displayed, otherwise false.
	 */
	basicMetadataDisplay(gridColumnKey) {
		const resolutions = [
			{ displayRes: 'HD',  maxW: 1250, maxH: 800 },
			{ displayRes: 'QHD', maxW: 1350, maxH: 900 },
			{ displayRes: '4K',  maxW: 2350, maxH: 1550 }
		];

		const basicMeta = ['年份', '唱片公司', '流派', '编解码', '声道', '来源', '数据', '播放次数', '评级'];
		const smallRes = resolutions.some(res => grSet.displayRes === res.displayRes && (grm.ui.ww < res.maxW || grm.ui.wh < res.maxH));

		return grSet.autoHideGridMetadata && grSet.layout === 'default' && smallRes && !basicMeta.includes(gridColumnKey);
	}

	/**
	 * 获取编解码器字符串，如果编解码器是DTS，则返回'DCA'.
	 * @returns {string} 编解码器字符串或'DCA' 如果编解码器是 DTS.
	 */
	getCodecString() {
		const codec = $('$lower($if2(%codec%,$ext(%path%)))');
		if (['dts', 'dca (dts coherent acoustics)'].includes(codec)) {
			return 'DCA'; // 如果编解码是DTS，则仅显示DCA缩写
		}
		return codec;
	}

	/**
	 * Gets the channel string based on the provided channel type.
	 * @param {string} channelType - The type of the channel (e.g., 'mono', 'stereo').
	 * @returns {string} The channel string or an empty string if the channel type is not found.
	 */
	getChannelString(channelType) {
		const channelMapping = {
			'mono':   { number: 1,  string: '单声道' },
			'单声道': { number: 1,  string: '单声道' },
			'stereo': { number: 2,  string: '立体声' },
			'立体声': { number: 2,  string: '立体声' },
			'3ch':    { number: 3,  string: '中置' },
			'3 声道': { number: 3,  string: '中置' },
			'4ch':    { number: 4,  string: '四声道' },
			'4 声道': { number: 4,  string: '四声道' },
			'5ch':    { number: 5,  string: '环绕' },
			'5 声道': { number: 5,  string: '环绕' },
			'6ch':    { number: 6,  string: '环绕' },
			'6 声道': { number: 6,  string: '环绕' },
			'7ch':    { number: 7,  string: '环绕' },
			'7 声道': { number: 7,  string: '环绕' },
			'8ch':    { number: 8,  string: '环绕' },
			'8 声道': { number: 8,  string: '环绕' },
			'10ch':   { number: 10, string: '环绕' },
			'10 声道':{ number: 10, string: '环绕' },
			'12ch':   { number: 12, string: '环绕' },
			'12 声道':{ number: 12, string: '环绕' }
		};

		const channel = channelMapping[channelType];
		if (!channel) return '';

		if (grSet.showGridChannelLogo_layout === 'textlogo') {
			return channel.string;
		} else if (grSet.showGridChannelLogo_layout === false) {
			return `${channel.number} ${Unicode.MiddleDot} ${channel.string}`;
		} else {
			return '';
		}
	}

	/**
	 * Gets the grid tooltip string based on the specified type.
	 * @param {string} type - The type of metadata ('artist', 'title', 'album').
	 * @returns {string} The tooltip string.
	 */
	getGridTooltip(type) {
		const tooltipType = {
			artist: grStr.artist,
			title: `${grStr.tracknum} ${grStr.title} ${grStr.composer}`,
			album: `${grStr.album} ${grStr.composer}`
		};
		return tooltipType[type];
	}

	/**
	 * Handles the grid tooltip. If a tooltip is ready, it displays and then clears it.
	 * @param {number} x - The x-coordinate.
	 * @param {number} y - The y-coordinate.
	 */
	handleGridTooltip(x, y) {
		const artistTooltipRange = this.mouseInMetadataGrid(x, y, 'artist');
		const titleTooltipRange  = this.mouseInMetadataGrid(x, y, 'title');
		const albumTooltipRange  = this.mouseInMetadataGrid(x, y, 'album');

		if (!artistTooltipRange && !titleTooltipRange && !albumTooltipRange) return;

		const showArtistToolTip = artistTooltipRange && grSet.showGridArtist_layout && (
			this.gridArtistWidth > this.gridContentWidth * 2
			||
			this.gridArtistWrapLinesExceed
		);

		const showTitleToolTip = titleTooltipRange && grSet.showGridTitle_layout && (
			this.gridTitleWidth > this.gridContentWidth * 2
			||
			this.gridTitleWrapLinesExceed
		);

		const showAlbumToolTip = albumTooltipRange && (
			!grSet.showGridArtist_layout && !grSet.showGridTitle_layout && (this.gridAlbumWidth > this.gridContentWidth * 3)
			||
			(grSet.showGridArtist_layout || grSet.showGridTitle_layout) && (this.gridAlbumWidth > this.gridContentWidth * 2)
			||
			this.gridAlbumWrapLinesExceed
		);

		const tooltip =
			showArtistToolTip ? this.getGridTooltip('artist') :
			showTitleToolTip  ? this.getGridTooltip('title') :
			showAlbumToolTip  ? this.getGridTooltip('album') : '';

		if (tooltip.length) { // * Display tooltip
			const offset = SCALE(30);
			this.gridTooltipText = tooltip;
			grm.ttip.showDelayed(this.gridTooltipText);
			grm.ui.repaintStyledTooltips(grm.ui.styledToolTipX - offset * 2, grm.ui.styledToolTipY - offset, grm.ui.styledToolTipW + offset * 4, grm.ui.styledToolTipH + offset * 2);
		} else { // * Clear tooltip
			this.gridTooltipText = '';
			grm.ttip.stop();
			window.Repaint();
		}
	}

	/**
	 * Loads the codec logo of the now playing track, displayed in the metadata grid in Details.
	 * @param {FbMetadbHandle} metadb - The metadb of the track.
	 */
	loadGridCodecLogo(metadb = grm.ui.initMetadb()) {
		let codec = $('$lower($if2(%codec%,$ext(%path%)))', metadb);
		let format = $('$lower($ext(%path%))', metadb);

		// Foobar bug showing wrong metadata when DTS is in wav file format
		if (codec === 'pcm' && (format === 'cue' || format === 'wav')) {
			codec = $('$lower($if2(%codec%,$ext(%path%)))');
			format = $('$lower($ext(%path%))');
		}

		const codecFormat = {
			'aac':  'aac', 'aac acm codec': 'aac', 'mp4':  'aac', 
			'ac3':  'ac3', 'atsc a/52': 'ac3', 'e-ac3': 'ac3', 'atsc a/52a (ac-3)': 'ac3',
			'aiff': 'pcm-aiff',
			'alac': 'alac',
			'alaw': 'alaw', 'ccitt a-law': 'alaw',
			'amr':  'amr',
			'ape':  'ape', 'monkey\'s audio': 'ape',
			'caf':  'caf',
			'dsd':  format === 'iso' ? 'dsd-sacd' : 'dsd',
			'dst':  'dsd-sacd',
			'dts':  'dts', 'dca (dts coherent acoustics)': 'dts',
			'dxd':  format === 'iso' ? 'dsd-sacd' : 'dxd',
			'flac': 'flac',
			'gsm':  'gsm', 'gsm 6.10': 'gsm',
			'imaadpcm': 'imaadpcm', 'ima adpcm': 'imaadpcm',
			'la':   'la',
			'mid':  'mid',
			'mlp':  'mlp',
			'mod':  'mod',
			'mp2':  'mp2',
			'mp3':  'mp3', 'mpeg layer-3': 'mp3',
			'mpc':  'musepack', 'musepack': 'musepack',
			'msadpcm': 'msadpcm', 'microsoft adpcm': 'msadpcm',
			'ofr':  'ofr', 'optimfrog': 'ofr',
			'ogg':  'ogg', 'vorbis': 'ogg',
			'opus': 'opus',
			'pcm':  format === 'aiff' ? 'pcm-aiff' : ['w64', 'wav'].includes(format) ? 'pcm-wav' : 'pcm',
			'qoa':  'qoa',
			'shn':  'shn', 'shorten': 'shn',
			'spx':  'spx', 'speex': 'spx',
			'tak':  'tak',
			'tta':  'tta', 'true audio': 'tta',
			'ulaw': 'ulaw', 'ccitt u-law': 'ulaw',
			'usac': 'usac',
			'wav':  'pcm-wav',
			'w64':  'pcm-wav',
			'wma':  'wma',
			'wv':   'wavpack', 'wavpack': 'wavpack'
		};

		let logoName;
		const HDCD = $('%__hdcd%') === 'yes';
		const codecName = codecFormat[codec] || codecFormat[format];

		if (codec.startsWith('dsd')) {
			logoName = codecFormat.dsd;
		} else if (codec.startsWith('dxd')) {
			logoName = codecFormat.dxd;
		} else if (codec.startsWith('dst')) {
			logoName = codecFormat.dst;
		} else {
			logoName = HDCD && codecName === 'pcm-wav' ? 'pcm-hdcd' : HDCD ? `${codecName}-hdcd` : codecName;
		}

		const bw = grCol.lightBgDetails ? 'black' : 'white';
		const path = `${grPath.images}codec\\${logoName}-${bw}.png`;

		this.gridCodecLogo = this.getGridLogoImage(path);
	}

	/**
	 * Loads the channel logo of the now playing track, displayed in the metadata grid in Details.
	 * @param {FbMetadbHandle} metadb - The metadb of the track.
	 */
	loadGridChannelLogo(metadb = grm.ui.initMetadb()) {
		const codec = $('$lower($if2(%codec%,$ext(%path%)))', metadb);
		const format = $('$lower($ext(%path%))', metadb);

		// Foobar bug showing wrong metadata when DTS is in wav file format
		const channels = codec === 'pcm' && (format === 'cue' || format === 'wav') ? $('%channels%') : $('%channels%', metadb);

		const type =
			(grSet.layout === 'default' && grSet.showGridChannelLogo_default === 'textlogo' ||
			 grSet.layout === 'artwork' && grSet.showGridChannelLogo_artwork === 'textlogo') ? '_text' : '';

		const bw = grCol.lightBgDetails ? 'black' : 'white';

		const channelFormat = {
			'mono':   '10_mono',
			'单声道': '10_mono',
			'stereo': '20_stereo',
			'立体声': '20_stereo',
			'3ch':    '30_center',
			'3 声道': '30_center',
			'4ch':    '40_quad',
			'4 声道': '40_quad',
			'5ch':    '50_surround',
			'5 声道': '50_surround',
			'6ch':    '51_surround',
			'6 声道': '51_surround',
			'7ch':    '61_surround',
			'7 声道': '61_surround',
			'8ch':    '71_surround',
			'8 声道': '71_surround',
			'10ch':   '91_surround',
			'10 声道':'91_surround',
			'12ch':   '111_surround',
			'12 声道':'111_surround'
		};

		const channelName = channelFormat[channels];
		const channelLogoPath = (channelName) => `${grPath.images}channels\\${channelName}${type}-${bw}.png`;
		if (channelName) this.gridChannelLogo = this.getGridLogoImage(channelLogoPath(channelName));
	}

	/**
	 * Loads the release country flags, displayed in the metadata grid in Details.
	 * @param {FbMetadbHandle} metadb - The metadb of the track.
	 */
	loadGridReleaseCountryFlag(metadb = undefined) {
		if (!grSet.showGridReleaseFlags_layout) return;
		this.gridReleaseFlagImg = grm.ui.loadFlagImage($(grTF.releaseCountry, metadb));
	}

	/**
	 * Updates the metadata grid in Details, reuses last value for last played unless provided one.
	 * @param {string} currentLastPlayed - The current value of the "Last Played" metadata field.
	 * @param {string} currentPlayingPlaylist - The current active playlist that is being played from.
	 * @param {FbMetadbHandle} metadb - The metadb of the track.
	 * @returns {Array|null} The updated metadata grid, which is an array of objects with properties `label`, `val` and `age`.
	 */
	updateGrid(currentLastPlayed, currentPlayingPlaylist, metadb = undefined) {
		if (!grCfg.metadataGrid) return null;

		if (typeof currentLastPlayed === 'undefined') {
			currentLastPlayed = (grStr && grStr.grid ? grStr.grid.find(value => value.label === '最近播放') || {} : {}).val;
		}

		grStr.grid = [];

		for (const key of grCfg.metadataGrid) {
			let val = $(key.val, metadb);
			if (val && key.label) {
				if (key.age) {
					val = $(`$date(${val})`, metadb); // Never show time
					const age = CalcAgeDateString(val);
					if (age) val += ` (${age})`;
				}
				grStr.grid.push({
					age: key.age,
					label: key.label,
					val
				});
			}
		}
		if (typeof currentLastPlayed !== 'undefined') {
			const lp = grStr.grid.find(value => value.label === '最近播放');
			if (lp) {
				lp.val = $Date(currentLastPlayed);
				if (CalcAgeDateString(lp.val)) {
					lp.val += ` (${CalcAgeDateString(lp.val)})`;
				}
			}
		}
		if (typeof currentPlayingPlaylist !== 'undefined') {
			const pl = grStr.grid.find(value => value.label === '播放列表');
			if (pl) {
				pl.val = currentPlayingPlaylist;
			}
		}

		// Keep the internal TitleFormat configuration value, but never render it as
		// user-facing metadata. Genuine runtime playlist names remain visible.
		const internalPlaylistPlaceholder = grCfg.titleFormat && grCfg.titleFormat.playing_playlist;
		grStr.grid = grStr.grid.filter(row => !(row.label === '播放列表' &&
			(row.val === internalPlaylistPlaceholder || row.val === '请勿更改此值，因为它由主题自行处理')));

		return grStr.grid;
	}

	/** Keep decoded black/white grid marks across palette updates; cap retained images. */
	getGridLogoImage(path) {
		if (!this.gridLogoImageCache) this.gridLogoImageCache = new Map();
		if (this.gridLogoImageCache.has(path)) return this.gridLogoImageCache.get(path);
		const image = gdi.Image(path);
		if (image) {
			if (this.gridLogoImageCache.size >= 10) this.gridLogoImageCache.delete(this.gridLogoImageCache.keys().next().value);
			this.gridLogoImageCache.set(path, image);
		}
		return image;
	}

	/** Refresh the grid's selected color variant without discarding decoded source marks. */
	updateGridLogos() {
		this.clearCache('codecLogo');
		this.clearCache('channelLogo');
	}

	/**
	 * Updates the metadata grid positions in Details.
	 * This method is primarily used to refresh the coordinates for mouseInMetadataGrid.
	 */
	updateGridPos() {
		this.gridTop = 0;
		this.gridArtistTop = 0;
		this.gridArtistBottom = 0;
		this.gridTitleTop = 0;
		this.gridTitleBottom = 0;
		this.gridAlbumTop = 0;
		this.gridAlbumBottom = 0;
	}
	// #endregion

	// * PUBLIC METHODS - METADATA GRID TIMELINE * //
	// #region PUBLIC METHODS - METADATA GRID TIMELINE
	/**
	 * Draws the timeline above the metadata grid in Details.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 */
	drawGridTimeline(gr) {
		gr.SetSmoothingMode(SmoothingMode.None); // Disable smoothing
		gr.FillSolidRect(this.gridMarginLeft, this.timelineY, this.timelineDrawWidth + this.timelineExtraLeftSpace + this.timelineLineWidth, this.timelineH, grCol.timelineAdded);

		if (grSet.theme.startsWith('custom')) {
			gr.DrawRect(this.timelineX - 2, this.timelineY - 2, this.timelineW + 3, this.timelineH + 3, 1, grCol.timelineFrame);
		}

		if (this.timelineFirstPlayedPercent >= 0 && this.timelineLastPlayedPercent >= 0) {
			const x1 = Math.floor(this.timelineDrawWidth * this.timelineFirstPlayedPercent) + this.timelineExtraLeftSpace;
			const x2 = Math.floor(this.timelineDrawWidth * this.timelineLastPlayedPercent)  + this.timelineExtraLeftSpace;
			gr.FillSolidRect(x1 + this.gridMarginLeft, this.timelineY, this.timelineDrawWidth - x1 + this.timelineExtraLeftSpace, this.timelineH, grCol.timelinePlayed);
			gr.FillSolidRect(x2 + this.gridMarginLeft, this.timelineY, this.timelineDrawWidth - x2 + this.timelineExtraLeftSpace + this.timelineLineWidth, this.timelineH, grCol.timelineUnplayed);
		}

		for (let i = 0; i < this.timelinePlayedTimesPercents.length; i++) {
			const x = Math.floor(this.timelineDrawWidth * this.timelinePlayedTimesPercents[i]) + this.gridMarginLeft + this.timelineExtraLeftSpace;
			if (!Number.isNaN(x) && x <= this.timelineW + this.gridMarginLeft * 2) {
				const linePos = Math.max(this.gridMarginLeft, Math.min(x, x));
				gr.DrawLine(linePos, this.timelineY, linePos, this.timelineY + this.timelineH, this.timelineLineWidth, this.timelinePlayCol);
			} else {
				// console.log('Played Times Error! ratio: ' + this.playedTimesPercents[i], 'x: ' + x);
			}
		}

		gr.SetSmoothingMode(SmoothingMode.AntiAlias);
	}

	/**
	 * Handles the grid timeline tooltip. If a tooltip is ready, it displays and then clears it.
	 * @param {number} x - The x-coordinate.
	 * @param {number} y - The y-coordinate.
	 */
	handleGridTimelineTooltip(x, y) {
		if (!this.mouseInMetadataGrid(x, y, 'timeline') || !grSet.showGridTimeline_layout || this.timelinePlayedTimesPercents.length === 0) {
			return;
		}

		let tooltip = '';
		const percent = ToFixed((x + this.timelineX - this.gridMarginLeft * 2 - this.timelineExtraLeftSpace) / this.timelineDrawWidth, 3);
		const timezoneOffset = UpdateTimezoneOffset();

		for (let i = 0; i < this.timelinePlayedTimesPercents.length; i++) {
			if (Math.abs(percent - this.timelinePlayedTimesPercents[i]) <= this.timelineLeeway) {
				const date = new Date(this.timelinePlayedTimes[i]);
				tooltip += tooltip.length ? '\n' : '';
				tooltip += date.toLocaleString();
			}
			else if (percent < this.timelinePlayedTimesPercents[i]) {
				if (!tooltip.length) {
					const added = i === 0 ? DateDiff($Date('[%added%]'), this.timelinePlayedTimes[0], timezoneOffset) : DateDiff(new Date(this.timelinePlayedTimes[i - 1]).toISOString(), this.timelinePlayedTimes[i], timezoneOffset);
					tooltip = added ? (i === 0 ? `添加 ${added} 后首次播放` : `已 ${added} 无播放`) : '';
				}
				break;
			}
		}

		if (tooltip.length) {
			this.gridTimelineTooltipText = tooltip;
			grm.ttip.showImmediate(tooltip);
			window.RepaintRect(this.timelineX, this.timelineY, this.timelineW, this.timelineH);
		} else {
			this.gridTimelineTooltipText = '';
			grm.ttip.stop();
			window.Repaint();
		}
	}

	/**
	 * Sets the width and position of the timeline.
	 * @param {number} x - The x-coordinate.
	 * @param {number} y - The y-coordinate.
	 * @param {number} width - The width of the timeline.
	 * @param {number} height - The height of the timeline.
	 */
	setGridTimelineSize(x, y, width, height) {
		if (this.timelineX === x && this.timelineY === y && this.timelineW === width) {
			return;
		}

		this.timelineX = x;
		this.timelineY = y;
		this.timelineW = width;
		this.timelineH = height;

		this.timelineLineWidth = HD_4K(2, 3);
		this.timelineExtraLeftSpace = SCALE(3); // Add a little space to the left so songs that were played a long time ago show more in the "added" stage
		this.timelineDrawWidth = Math.floor(this.timelineW - this.timelineExtraLeftSpace - 1 - this.timelineLineWidth / 2);
		this.timelineLeeway = (1 / this.timelineDrawWidth) * (this.timelineLineWidth + SCALE(2)) / 2;
	}

	/**
	 * Sets the first and last played percentages, as well as the played time ratios and values.
	 * @param {number} firstPlayed - The percentage of the total play time that represents the first time the item was played.
	 * @param {number} lastPlayed - The percentage of the total play time that represents the last time the item was played.
	 * @param {number} playedTimeRatios - The percentage of time played for each playedTimesValues.
	 * @param {number} playedTimesValues - Contains the actual played times for each interval.
	 * For example, if the intervals are divided into 5 parts, playedTimesValues would be an
	 * array of 5 numbers representing the played times for each interval.
	 */
	setGridTimelinePlayTimes(firstPlayed, lastPlayed, playedTimeRatios, playedTimesValues) {
		this.timelineFirstPlayedPercent = firstPlayed;
		this.timelineLastPlayedPercent = lastPlayed;
		this.timelinePlayedTimesPercents = playedTimeRatios;
		this.timelinePlayedTimes = playedTimesValues;
	}

	/**
	 * Sets date ratios based on various time-related properties of a music track.
	 * @param {boolean} dontUpdateLastPlayed - Whether the last played date should be updated or not.
	 * @param {string} currentLastPlayed - The current value of the last played time.
	 * @param {FbMetadbHandle} metadb - The metadb of the track.
	 */
	setGridTimelineDateRatios(dontUpdateLastPlayed = false, currentLastPlayed, metadb = undefined) {
		const newDate = new Date();
		const timezoneOffset = UpdateTimezoneOffset();

		let ratio;
		let lfmPlayedTimesJsonLast = '';
		let playedTimesJsonLast = '';
		let playedTimesRatios = [];
		let lfmPlayedTimes = [];
		let playedTimes = [];

		let added = ToTime($('$if2(%added_enhanced%,%added%)', metadb), timezoneOffset);
		let lastPlayed = ToTime($('$if2(%last_played_enhanced%,%last_played%)', metadb), timezoneOffset);
		const firstPlayed = ToTime($('$if2(%first_played_enhanced%,%first_played%)', metadb), timezoneOffset);
		const today = DateToYMD(newDate);

		if (dontUpdateLastPlayed && $Date(lastPlayed) === today) {
			lastPlayed = ToTime(currentLastPlayed, timezoneOffset);
		}

		if (Component.EnhancedPlaycount) {
			const playedTimesJson = $('[%played_times_js%]', metadb);
			const lastfmJson = $('[%lastfm_played_times_js%]', metadb);
			const log = ''; // ! Don't need this crap to flood the console // playedTimesJson === playedTimesJsonLast && lastfmJson === lfmPlayedTimesJsonLast ? false : grCfg.settings.showDebugLog;
			lfmPlayedTimesJsonLast = lastfmJson;
			playedTimesJsonLast = playedTimesJson;
			lfmPlayedTimes = ParseJson(lastfmJson, 'lastfm: ', log);
			playedTimes = ParseJson(playedTimesJson, 'foobar: ', log);
		}
		else {
			playedTimes.push(firstPlayed);
			playedTimes.push(lastPlayed);
		}

		if (firstPlayed) {
			if (!added) {
				added = firstPlayed;
			}
			const age = CalcAge(added);

			this.timelineFirstPlayedRatio = CalcAgeRatio(firstPlayed, age);
			this.timelineLastPlayedRatio = CalcAgeRatio(lastPlayed, age);
			if (this.timelineLastPlayedRatio < this.timelineFirstPlayedRatio) {
				// Due to daylight savings time, if there's a single play before the time changed lastPlayed could be < firstPlayed
				this.timelineLastPlayedRatio = this.timelineFirstPlayedRatio;
			}

			if (playedTimes.length) {
				for (let i = 0; i < playedTimes.length; i++) {
					ratio = CalcAgeRatio(playedTimes[i], age);
					playedTimesRatios.push(ratio);
				}
			} else {
				playedTimesRatios = [this.timelineFirstPlayedRatio, this.timelineLastPlayedRatio];
				playedTimes = [firstPlayed, lastPlayed];
			}

			let j = 0;
			const tempPlayedTimesRatios = playedTimesRatios.slice();
			tempPlayedTimesRatios.push(1.0001); // Pick up every last.fm time after lastPlayed fb knows about
			for (let i = 0; i < tempPlayedTimesRatios.length; i++) {
				while (j < lfmPlayedTimes.length && (ratio = CalcAgeRatio(lfmPlayedTimes[j], age)) < tempPlayedTimesRatios[i]) {
					playedTimesRatios.push(ratio);
					playedTimes.push(lfmPlayedTimes[j]);
					j++;
				}
				if (ratio === tempPlayedTimesRatios[i]) { // Skip one instance
					// console.log('skipped -->', ratio);
					j++;
				}
			}
			playedTimesRatios.sort((a, b) => a - b);
			playedTimes.sort((a, b) => a - b);

			this.timelineFirstPlayedRatio = playedTimesRatios[0];
			this.timelineLastPlayedRatio = playedTimesRatios[Math.max(0, playedTimesRatios.length - (dontUpdateLastPlayed ? 2 : 1))];
		}
		else {
			this.timelineFirstPlayedRatio = 0.33;
			this.timelineLastPlayedRatio = 0.66;
		}
		this.setGridTimelinePlayTimes(this.timelineFirstPlayedRatio, this.timelineLastPlayedRatio, playedTimesRatios, playedTimes);
	}

	/**
	 * Updates the timeline by setting the sizes, colors, and last played dates.
	 * @param {boolean} updateLastPlayed - Whether to update the last played date.
	 * @param {FbMetadbHandle} metadb - The metadb of the track.
	 */
	updateGridTimeline(updateLastPlayed, metadb) {
		this.setGridTimelineSize(this.gridMarginLeft, this.gridTop + Math.floor(this.gridLineSpacing * 0.33), grm.ui.albumArtSize.x - this.gridMarginLeft * 2, this.timelineH);

		if (!updateLastPlayed) return;

		const lastPlayed = $(grTF.last_played, metadb);
		this.setGridTimelineDateRatios($Date(grm.ui.currentLastPlayed) !== $Date(lastPlayed), grm.ui.currentLastPlayed, metadb);

		if (lastPlayed.length) {
			const today = DateToYMD(new Date());
			if (!grm.ui.currentLastPlayed.length || $Date(lastPlayed) !== today) {
				grm.ui.currentLastPlayed = lastPlayed;
			}
		}
	}
	// #endregion

	// * PUBLIC METHODS - DISC ART * //
	// #region PUBLIC METHODS - DISC ART
	/**
	 * Creates and masks an image to the disc art.
	 * @param {GdiGraphics} gr - The GDI graphics object.
	 * @param {number} x - The X-coordinate of the disc area.
	 * @param {number} y - The Y-coordinate of the disc area.
	 * @param {number} w - The width of the mask.
	 * @param {number} h - The height of the mask.
	 * @param {number} srcX - The X-coordinate of the source image.
	 * @param {number} srcY - The Y-coordinate of the source image.
	 * @param {number} srcW - The width of the source image.
	 * @param {number} srcH - The height of the source image.
	 * @param {number} [angle] - The angle of the mask in degrees. Default 0.
	 * @param {number} [alpha] - The alpha of the mask. Values 0-255.
	 * @returns {GdiGraphics} The rounded masked image.
	 */
	createDiscArtAlbumArtMask(gr, x, y, w, h, srcX, srcY, srcW, srcH, angle, alpha) {
		const source = grm.ui.albumArtScaled;
		if (!source || ![x, y, w, h, source.Width, source.Height].every(Number.isFinite) ||
			w < 1 || h < 1 || source.Width < 1 || source.Height < 1) return null;
		const maskX = this.discArtSize.x - grm.ui.albumArtSize.x + this.discArtShadow - SCALE(4);
		const maskY = this.discArtSize.y - grm.ui.albumArtSize.y + SCALE(2);
		const maskW = this.discArtSize.w - this.discArtShadow + SCALE(4);
		const maskH = this.discArtSize.h - this.discArtShadow + SCALE(2);
		const key = `${w}:${h}:${maskX}:${maskY}:${maskW}:${maskH}:${source.Width}:${source.Height}`;

		// * First draw album art in the background
		gr.DrawImage(source, x, y, w, h, 0, 0, source.Width, source.Height, 0, alpha);
		if (![maskX, maskY, maskW, maskH].every(Number.isFinite) || maskW <= 0 || maskH <= 0) return null;
		const cached = this.discArtAlbumArtMaskCache;
		if (cached && cached.source === source && cached.key === key) {
			return gr.DrawImage(cached.image, x, y, w, h, 0, 0, cached.image.Width, cached.image.Height, 0, 255);
		}

		// * Mask
		const maskImg = gdi.CreateImage(w, h);
		let g = maskImg.GetGraphics();
		try { g.FillEllipse(maskX, maskY, maskW, maskH, 0xffffffff); }
		finally { maskImg.ReleaseGraphics(g); }

		// * Album art
		const albumArtImg = gdi.CreateImage(w, h);
		g = albumArtImg.GetGraphics();
		try { g.DrawImage(source, 0, 0, w, h, 0, 0, source.Width, source.Height); }
		finally { albumArtImg.ReleaseGraphics(g); }

		const mask = maskImg.Resize(w, h);
		albumArtImg.ApplyMask(mask);
		this.discArtAlbumArtMaskCache = { source, key, image: albumArtImg };

		return gr.DrawImage(albumArtImg, x, y, w, h, 0, 0, albumArtImg.Width, albumArtImg.Height, 0, 255);
	}

	/**
	 * Creates the album cover mask for the disc art stub.
	 * @param {GdiBitmap} img - The image to apply the mask to.
	 * @param {number} w - The width of the mask.
	 * @param {number} h - The height of the mask.
	 */
	createDiscArtCoverMask(img, w, h) {
		const { w: discArtW, h: discArtH } = this.discArtSize;
		const lineW = SCALE(25);

		const outerRingX = lineW * 0.5;
		const outerRingY = lineW * 0.5;
		const outerRingW = discArtW - lineW;
		const outerRingH = discArtH - lineW;

		const innerRingSize = discArtH * 0.666 + lineW * 0.5;
		const innerCenterX  = discArtW * 0.5;
		const innerCenterY  = discArtH * 0.5;
		const innerRadiusX  = discArtW * 0.5 - innerRingSize * 0.5;
		const innerRadiusY  = discArtH * 0.5 - innerRingSize * 0.5;

		const innerRingX = innerCenterX - innerRadiusX;
		const innerRingY = innerCenterY - innerRadiusY;
		const innerRingW = innerRadiusX * 2;
		const innerRingH = innerRadiusY * 2;

		const mask = GDI(discArtW, discArtH, true, g => {
			g.SetSmoothingMode(SmoothingMode.AntiAlias);
			g.FillSolidRect(0, 0, discArtW, discArtH, RGB(255, 255, 255));
			g.FillEllipse(outerRingX, outerRingY, outerRingW, outerRingH, RGB(0, 0, 0)); // Outer ring
			g.FillEllipse(innerRingX, innerRingY, innerRingW, innerRingH, RGB(255, 255, 255)); // Inner ring
		});

		img.ApplyMask(mask.Resize(w, h));
	}

	/**
	 * Combines disc art with album cover art if conditions are met.
	 * @param {boolean} applyMask - Whether to apply the disc art cover mask or not.
	 * @returns {GdiBitmap} The combined image.
	 */
	combineDiscArtWithCover(applyMask) {
		if (['cdAlbumCover', 'vinylAlbumCover'].includes(grSet.discArtStub) &&
			(!this.discArtFound && (!grSet.noDiscArtStub || grSet.showDiscArtStub)) &&
			this.discArtCover && this.discArtCover.Width > 0 && this.discArtCover.Height > 0) {
			let { discArtCover } = this;

			if (applyMask) {
				discArtCover = discArtCover.Clone(0, 0, discArtCover.Width, discArtCover.Height);
				this.createDiscArtCoverMask(discArtCover, discArtCover.Width, discArtCover.Height);
			}

			return CombineImages(this.discArt, discArtCover, this.discArtSize.w, this.discArtSize.h);
		}

		return this.discArt;
	}

	/**
	 * Checks if `drawDiscArt()` is currently compositing disc art and album art together under a non-default
	 * `detailsAlbumArtOpacity`/`detailsAlbumArtDiscAreaOpacity` value, meaning the album art must stay visible
	 * beneath the Lyrics overlay instead of being erased to match the plain Lyrics panel look.
	 * @returns {boolean} True if the disc art composite is currently being rendered at a custom opacity, false otherwise.
	 */
	discArtComposited() {
		const opacityActive = grm.ui.albumArtSize.w < grm.ui.ww * 0.66 &&
			(grSet.detailsAlbumArtOpacity !== 255 || grSet.detailsAlbumArtDiscAreaOpacity !== 255);

		return opacityActive && this.discArtRenderable();
	}

	/**
	 * Checks if `drawDiscArt()` is structurally able to render the disc art/album art composite this frame,
	 * independent of the currently configured opacity values.
	 * @returns {boolean} True if `drawDiscArt()` will draw the composite, false otherwise.
	 */
	discArtRenderable() {
		return (
			grSet.layout === 'default' && grSet.displayDiscArt && grm.ui.displayDetails && !grm.ui.noAlbumArtStub &&
			this.discArtSize.y >= grm.ui.albumArtSize.y && this.discArtSize.h <= grm.ui.albumArtSize.h
		);
	}

	/**
	 * Disposes the disc art image when changing or deactivating disc art.
	 * @param {GdiBitmap} discArtImg - The loaded disc art image.
	 */
	disposeDiscArt(discArtImg) {
		this.discArtSize = new ImageSize(0, 0, 0, 0);
		discArtImg = null;
	}

	/**
	 * Fetches new disc art when a new album is being played.
	 */
	fetchDiscArt() {
		if (!grm.ui.displayDetails && !this.needsTurntableDisc()) {
			this.clearCache('discArt');
			return;
		}

		grm.debug.setDebugProfile(grm.debug.showDebugTiming || grCfg.settings.showDebugPerformanceOverlay, 'create', '获取碟片');

		if (grSet.displayDiscArt && !grm.ui.isStreaming) {
			const discArtPath = this.findDiscArtPath();
			const discArtEmbedded = grSet.discArtEmbedded && (grSet.noDiscArtStub || grSet.showDiscArtStub);

			// * No on-disk disc art file found - fall back to the embedded "Disc" tag picture before the generic stub
			if (!this.discArtFound && discArtEmbedded && this.loadDiscArtEmbedded()) {
				grm.debug.setDebugProfile(false, 'print', '获取碟片');
				return;
			}

			this.loadDiscArt(discArtPath);
		}

		grm.debug.setDebugProfile(false, 'print', '获取碟片');
	}

	/**
	 * Finds the path to the disc art or disc art stub.
	 * @returns {string} The path to the disc art or disc art stub.
	 */
	findDiscArtPath() {
		if (grSet.noDiscArtStub || grSet.showDiscArtStub) {
			const cacheKey = `${grm.ui.currentAlbumFolder}|${$('$if2(%discnumber%,0)')}|${$(`$if2(${grTF.vinyl_side},ZZ)`)}`;

			if (this.discArtDiskCacheKey === cacheKey) {
				this.discArtFound = this.discArtDiskCachedFound;
				if (this.discArtFound) return this.discArtDiskCachedPath;
			}
			else {
				let resolvedPath = '';
				let found = false;
				const groups = GlobGroupTemplatesByDir(grCfg.discArtPaths);

				for (const group of groups) {
					const matches = GlobResolveDirectory(group.dir, group.filenames);
					if (matches.length) {
						resolvedPath = matches[0];
						found = true;
						break;
					}
				}

				this.discArtDiskCacheKey = cacheKey;
				this.discArtDiskCachedPath = resolvedPath;
				this.discArtDiskCachedFound = found;
				this.discArtFound = found;

				if (found) return resolvedPath;
			}
		}
		else {
			this.discArtFound = false;
		}

		return (
			grSet.noDiscArtStub ? '' :
			grPath.discArtStubPaths()[grSet.discArtStub] || grPath.discArtCustomStub
		);
	}

	/**
	 * Initializes the disc art when the Details panel is opened or closed.
	 */
	initDiscArt() {
		if (!grm.ui.displayDetails) {
			if (!this.needsTurntableDisc()) this.clearCache('discArt');
			this.clearTimer('discArt');
			return;
		}

		if (!this.discArtCover) {
			if (grm.ui.albumArtEmbedded) {
				const metadb = grm.ui.initMetadb();
				if (metadb && grm.ui.albumArt && grm.artCache) {
					this.discArtCover = grm.artCache.getImage(metadb.Path, 2) ||
						grm.artCache.encache(grm.ui.albumArt, metadb.Path, 2);
				}
			}
			else if (grm.ui.albumArtList.length) {
				const artIndex = grm.ui.albumArtList[grm.ui.albumArtIndex];
				if (artIndex && grm.artCache) {
					this.discArtCover = grm.artCache.getImage(artIndex, 2) ||
						(grm.ui.albumArt && grm.artCache.encache(grm.ui.albumArt, artIndex, 2));
				}
			}
		}

		if (grSet.displayDiscArt && !grm.ui.isStreaming) {
			if (this.discArt) {
				this.updateDiscArt();
			} else {
				this.fetchDiscArt();
			}
		}
	}

	initDiscArtStub() {
		if (this.detailsClosed || !grSet.displayDiscArt || grSet.noDiscArtStub) return;

		const stubPath = grPath.discArtStubPaths()[grSet.discArtStub] || grPath.discArtCustomStub;
		if (!stubPath || grm.artCache.getImage(stubPath)) return; // already cached

		grm.artCache.loadImageAsync(stubPath, 'stub', () => !this.detailsClosed).then(img => {
			if (!this.detailsClosed && img) grm.artCache.encache(img, stubPath);
		}).catch(e => {
			if (!this.detailsClosed) grm.debug.debugLog(`碟片占位读取失败：${e?.message || e}`);
		});
	}

	/**
	 * Builds a visual identity for a disc image. Album-cover-based placeholders include
	 * the current album identity because the placeholder path itself stays unchanged.
	 * @param {string} sourceKey - Base disc image identity.
	 * @returns {string}
	 */
	getDiscArtImageKey(sourceKey) {
		const usesAlbumCover = ['cdAlbumCover', 'vinylAlbumCover'].includes(grSet.discArtStub) &&
			!this.discArtFound && (!grSet.noDiscArtStub || grSet.showDiscArtStub);
		return usesAlbumCover ? `${sourceKey}|cover:${grm.ui.currentAlbumFolder}|${grStr.album}` : sourceKey;
	}

	/**
	 * Installs only the last disc requested during a burst of track changes.
	 * @param {number} loadToken - Token belonging to the request.
	 * @param {Function} commit - Disc installation work.
	 */
	queueDiscArtCommit(loadToken, commit) {
		if (this.detailsClosed) return;
		this.clearTimer('discArtCommit');
		const delay = !this.needsTurntableDisc() && grSet.discArtAnimation && fb.IsPlaying ? this.discArtCommitDelay : 0;

		if (!delay) {
			if (!this.detailsClosed && loadToken === this.discArtLoadToken) commit();
			return;
		}

		this.discArtCommitTimer = setTimeout(() => {
			this.discArtCommitTimer = null;
			if (!this.detailsClosed && loadToken === this.discArtLoadToken) commit();
		}, delay);
	}

	/**
	 * Loads the disc art from the given path.
	 * @param {string} discArtPath - The path to the disc art.
	 */
	loadDiscArt(discArtPath) {
		if (this.detailsClosed) return;
		const nextKey = this.getDiscArtImageKey(`path:${discArtPath || ''}`);
		const loadToken = ++this.discArtLoadToken;
		const tempDiscArt = grm.ui.albumArtFromCache || this.needsTurntableDisc() ? grm.artCache.getImage(discArtPath) : null;
		this.turntableDiscPending = !!discArtPath && !tempDiscArt;

		if (tempDiscArt) {
			this.queueDiscArtCommit(loadToken, () => {
				const preserveAngle = grm.ui.displayDetails && this.prepareDiscArtSwap(nextKey);
				this.disposeDiscArt(this.discArt);
				this.discArt = tempDiscArt;
				this.turntableDiscPending = false;
				this.discArtImageKey = nextKey;
				if (grm.ui.displayDetails) {
					this.updateDiscArt(false, preserveAngle);
					this.notifyDiscArtTrackEntryReady();
				}
			});
			return;
		}

		grm.artCache.loadImageAsync(discArtPath, 'disc', () => !this.detailsClosed && loadToken === this.discArtLoadToken).then(discArtImg => {
			if (this.detailsClosed || loadToken !== this.discArtLoadToken) return;
			this.queueDiscArtCommit(loadToken, () => {
				const preserveAngle = grm.ui.displayDetails && this.prepareDiscArtSwap(nextKey);
				this.disposeDiscArt(this.discArt); // Delay disposal so we don't get flashing
				this.discArt = grm.artCache.encache(discArtImg, discArtPath);
				this.turntableDiscPending = false;
				this.discArtImageKey = this.discArt ? nextKey : '';

				if (!this.discArt && !grSet.noDiscArtStub) {
					grm.ui.handleArtworkError('discArt');
					// Release an atomically deferred label set even when the incoming disc fails.
					// startDiscArtTrackEntry() will take its no-disc fallback and commit it.
					if (grm.ui.displayDetails) this.notifyDiscArtTrackEntryReady();
				} else if (grm.ui.displayDetails) {
					this.updateDiscArt(false, preserveAngle);
					this.notifyDiscArtTrackEntryReady();
				}

				this.clearCache('metrics', 'cachedLabelLastLeftEdge'); // Recalc label location
				if (grm.ui.displayDetails) this.repaintDiscArt();
			});
		}).catch(() => {
			if (this.detailsClosed || loadToken !== this.discArtLoadToken) return;
			this.turntableDiscPending = false;
			this.discArt = null;
			if (this.isTurntableActive()) window.Repaint();
		});
	}

	/**
	 * Attempts to load the embedded "Disc" album art picture (`AlbumArtId.Disc`) directly from the track's tags
	 * and use it as the active disc art, bypassing the generic CD/vinyl stub fallback.
	 * @param {FbMetadbHandle} metadb - The metadb of the track.
	 * @returns {boolean} True if an embedded disc art image was found and set as the active disc art, false otherwise.
	 */
	loadDiscArtEmbedded(metadb = grm.ui.initMetadb()) {
		if (!metadb) return false;

		const loadToken = ++this.discArtLoadToken;
		const cacheType = 3; // Own artCache slot - do NOT reuse 2, that's discArtCover's slot for the same metadb.Path key
		const nextKey = `embedded:${metadb.Path}`;
		const cachedDiscArt = grm.artCache.getImage(metadb.Path, cacheType);

		if (cachedDiscArt) {
			this.discArtFound = true;
			this.queueDiscArtCommit(loadToken, () => {
				const preserveAngle = grm.ui.displayDetails && this.prepareDiscArtSwap(nextKey);
				this.disposeDiscArt(this.discArt);
				this.discArt = cachedDiscArt;
				this.turntableDiscPending = false;
				this.discArtImageKey = nextKey;
				if (grm.ui.displayDetails) {
					this.updateDiscArt(false, preserveAngle);
					this.notifyDiscArtTrackEntryReady();
				}
			});
			return true;
		}

		const embeddedDiscArt = utils.GetAlbumArtV2(metadb, AlbumArtId.Disc);

		if (!embeddedDiscArt) return false;

		this.discArtFound = true;
		this.queueDiscArtCommit(loadToken, () => {
			const preserveAngle = grm.ui.displayDetails && this.prepareDiscArtSwap(nextKey);
			this.disposeDiscArt(this.discArt); // Delay disposal so we don't get flashing
			this.discArt = grm.artCache.encache(embeddedDiscArt, metadb.Path, cacheType);
			this.turntableDiscPending = false;
			this.discArtImageKey = nextKey;

			this.clearCache('metrics', 'cachedLabelLastLeftEdge'); // Recalc label location
			if (grm.ui.displayDetails) {
				this.updateDiscArt(false, preserveAngle);
				this.notifyDiscArtTrackEntryReady();
			}
		});

		return true;
	}

	/** Stops old-size bitmaps and visual transitions before repeated on_size() callbacks. */
	prepareForResize() {
		this.captureTurntableResizeFrame();
		this.stopTurntableTimer();
		grm.lyrics?.clearTurntableRenderingCaches?.();
		this.discArtAlbumArtMaskCache = null;
		this.pauseDiscArtRotation();
		this.clearTimer('discArt');
		this.clearTimer('discArtSlide');
		this.clearTimer('discArtFade');
		this.clearTimer('discArtPrecompute');
		this.clearTimer('discArtDeferredStart');
		this.stopImmersiveLayoutAnimation();
		this.stopImmersivePanelFade();
		this.discArtSlidePreviousX = null;
		this.discArtSlideVisible = null;
		this.discArtSlideTargetX = null;
		this.discArtFadePrevious = null;
		this.discArtFadeProgress = 1;
		this.discArtArray = [];
		this.discArtRotation = null;
		this.discArtD2DImage = null;
		this.discArtShadowImg = { image: null, size: 0 };
	}

	/** Rebuilds disc source and shadow once after the window stops changing size. */
	finishResize() {
		this.turntableResizeFrame = null;
		if (this.isTurntableActive()) {
			this.clearTurntableImages();
			this.updateTurntableState();
			window.Repaint();
			return;
		}
		if (this.discArtExitActive) {
			const finish = this.discArtExitComplete;
			this.discArtExitActive = false;
			this.discArtExitComplete = null;
			if (finish) finish();
			return;
		}
		if (!this.discArt || !grm.ui.displayDetails || this.discArtSize.w < 1 ||
			grm.ui.ww < 1 || grm.ui.wh < 1) return;
		this.setDiscArtRotation(true);
		this.setDiscArtShadow();
		if (grSet.spinDiscArt && fb.IsPlaying && !fb.IsPaused) {
			this.setDiscArtRotationTimer(grSet.discArtAnimation);
		}
		window.Repaint();
	}

	/** Resizes and positions the disc after the window metrics change. */
	resizeDiscArt(resetDiscArtPosition) {
		if (!this.discArt) {
			this.discArtSize = new ImageSize(0, 0, 0, 0);
			return;
		}

		this.setDiscArtScaleFactor();
		this.setDiscArtSize(resetDiscArtPosition);
		this.setDiscArtPosition(resetDiscArtPosition);
		if (!grAnimationManager.resizing) this.setDiscArtShadow();
	}

	/**
	 * Records the item that actually entered playback and arms Details entry only for a different item.
	 * Comparing RawPath plus SubSong keeps every Library view on the same rule and distinguishes CUE tracks.
	 * @param {FbMetadbHandle} metadb - Newly playing item.
	 * @returns {boolean} True when it is the same playback item as before.
	 */
	handleDiscArtPlaybackTrack(metadb) {
		const rawPath = metadb ? String(metadb.RawPath || metadb.Path || '') : '';
		const subSong = metadb && Number.isFinite(metadb.SubSong) ? metadb.SubSong : 0;
		const nextKey = rawPath ? `${rawPath}\u0000${subSong}` : '';
		const sameTrack = !!nextKey && nextKey === this.discArtPlayingTrackKey;
		this.discArtPlayingTrackKey = nextKey;
		if (!sameTrack) {
			// Invalidate the old disc immediately. Waiting until the next cover load
			// reaches fetchDiscArt leaves a window for an old async commit to win.
			this.discArtLoadToken++;
			this.clearTimer('discArtCommit');
			this.clearTimer('discArtDeferredStart');
			this.clearTimer('discArtPrecompute');
			this.clearTimer('discArtFade');
			this.discArtFadePrevious = null;
			this.discArtFadeProgress = 1;
		}

		if (!grSet.discArtAnimation) return sameTrack;

		if (sameTrack) {
			this.discArtEntryPending = false;
			this.discArtEntryOnOpen = false;
			this.discArtTrackEntryPending = false;
			this.discArtTrackEntryAwaitingArtwork = false;
			this.clearTimer('discArtTrackEntry');
		}
		else if (!grm.ui.displayDetails) {
			this.discArtEntryPending = true;
			this.discArtTrackEntryPending = false;
			this.discArtTrackEntryAwaitingArtwork = false;
			this.clearTimer('discArtTrackEntry');
		}
		else {
			this.discArtEntryPending = false;
			this.discArtEntryOnOpen = false;
			this.discArtTrackEntryPending = true;
			this.discArtTrackEntryQueuedAt = Date.now();
			this.discArtTrackEntryAwaitingArtwork = false;
			this.discArtTrackEntrySerial++;
			this.clearTimer('discArtTrackEntry');
			this.clearDiscArtTransitionShadow();
			// A faster switch interrupts the current eject. Its last painted frame is cleared
			// atomically when the newest ready disc is reset to the hidden position.
			if (this.discArtSlideTimer && !this.discArtExitActive) this.clearTimer('discArtSlide');
			this.repaintDiscArtSlide(this.discArtSize.x, this.discArtSize.x);
		}

		return sameTrack;
	}

	/**
	 * Resets item identity after a real playback stop so replaying the same item is a new session.
	 */
	resetDiscArtPlaybackSession() {
		this.discArtPlayingTrackKey = '';
		this.discArtEntryPending = false;
		this.discArtEntryOnOpen = false;
		this.discArtTrackEntryPending = false;
		this.discArtTrackEntryAwaitingArtwork = false;
		this.clearTimer('discArtTrackEntry');
	}

	/**
	 * Arms the visible track-change eject after Main has determined whether artwork will refresh.
	 * @param {boolean} waitForArtwork - True when the incoming disc must be installed first.
	 */
	queueDiscArtTrackEntry(waitForArtwork) {
		if (!this.discArtTrackEntryPending) return;
		this.discArtTrackEntryAwaitingArtwork = !!waitForArtwork;
		this.clearTimer('discArtTrackEntry');
		if (!this.discArtTrackEntryAwaitingArtwork) this.notifyDiscArtTrackEntryReady();
	}

	/**
	 * Starts only the newest pending entry after the replacement face has been installed.
	 * Stale asynchronous disc loads cannot call this because their load token is rejected first.
	 */
	notifyDiscArtTrackEntryReady() {
		if (this.usesTurntableRenderer()) {
			this.clearTimer('discArtTrackEntry');
			this.discArtTrackEntryPending = false;
			this.discArtTrackEntryAwaitingArtwork = false;
			this.commitPendingLabelLogo();
			return;
		}
		if (!this.discArtTrackEntryPending || !grSet.discArtAnimation) return;
		this.discArtTrackEntryAwaitingArtwork = false;
		this.clearTimer('discArtTrackEntry');
		const requestSerial = this.discArtTrackEntrySerial;

		this.discArtTrackEntryTimer = setTimeout(() => {
			this.discArtTrackEntryTimer = null;
			if (requestSerial !== this.discArtTrackEntrySerial || !this.discArtTrackEntryPending) return;
			this.startDiscArtTrackEntry(requestSerial);
		}, this.discArtTrackEntryDelay);
	}

	/**
	 * Resets the newly installed disc to the cover, then performs one short outward slide.
	 * No outgoing disc is retained and no retract animation is inserted between tracks.
	 * @param {number} requestSerial - Latest-wins request serial.
	 */
	startDiscArtTrackEntry(requestSerial) {
		if (requestSerial !== this.discArtTrackEntrySerial || !this.discArtTrackEntryPending) return;
		if (!fb.IsPlaying || !grm.ui.displayDetails || !this.discArt || this.discArtSize.w < 1) {
			if (fb.IsPlaying && !grm.ui.displayDetails) this.discArtEntryPending = true;
			this.discArtTrackEntryPending = false;
			this.discArtTrackEntryAwaitingArtwork = false;
			this.commitPendingLabelLogo();
			return;
		}
		if ((grm.debug.showDebugTiming || grCfg.settings.showDebugPerformanceOverlay) && this.discArtTrackEntryQueuedAt) {
			console.log(`性能 => 切歌到出碟开始: ${Date.now() - this.discArtTrackEntryQueuedAt} 毫秒`);
		}

		const positions = this.getDiscArtSlidePositions();
		const previousX = this.discArtSize.x;
		this.discArtTrackEntryPending = false;
		this.discArtTrackEntryAwaitingArtwork = false;
		this.discArtSlideVisible = positions.ratio > 0;
		this.discArtSlideTargetX = this.discArtSlideVisible ? positions.targetX : positions.hiddenX;
		this.discArtSize.x = positions.hiddenX;
		this.discArtFrontHidden = grSet.discArtOnTop && !this.discArtSlideVisible;
		// The replacement disc and the complete normal/inverted logo set now belong to
		// the same validated request. Expose the logos at eject start instead of keeping
		// the previous track's set visible until the disc reaches its endpoint.
		this.commitPendingLabelLogo();
		this.repaintDiscArtSlide(previousX, positions.hiddenX);

		if (!this.discArtSlideVisible) {
			this.setDiscArtShadow();
			return;
		}

		this.discArtFrontHidden = false;
		const animation = this.getDiscArtEntryAnimation(true);
		this.startDiscArtSlideAnimation(positions.targetX, animation.duration, null, animation.easing);
	}

	/**
	 * Returns the selected outward-entry motion without changing retract or layout-adjustment motion.
	 * @param {boolean} trackChange - Whether this is the shorter in-Details track-change entry.
	 * @returns {{duration: number, easing: string}}
	 */
	getDiscArtEntryAnimation(trackChange = false) {
		const progressive = grSet.discArtEjectStyle !== 'fast';
		return {
			duration: progressive ? this.discArtProgressiveEntryDuration :
				(trackChange ? this.discArtTrackEntryDuration : this.discArtSlideDuration),
			easing: progressive ? 'progressive' : 'fast'
		};
	}

	/**
	 * Returns whether the Details scene may keep drawing its last playback state.
	 * @returns {boolean}
	 */
	isPlaybackVisualActive() {
		return fb.IsPlaying || this.discArtExitActive || grSet.panelBrowseMode;
	}

	/**
	 * Returns whether a stopped Details page is being retained for the retract animation.
	 * @returns {boolean}
	 */
	isDiscArtExitActive() {
		return this.discArtExitActive;
	}

	/**
	 * Applies the animation master switch without changing any unrelated Details settings.
	 * @param {boolean} enabled - Whether disc animations are enabled.
	 */
	setDiscArtAnimationEnabled(enabled) {
		this.clearTimer('discArtSlide');
		this.clearTimer('discArtFade');
		this.clearTimer('discArtDeferredStart');
		this.clearTimer('discArtTrackEntry');
		this.discArtFadePrevious = null;
		this.discArtFadeProgress = 1;
		this.discArtFrontHidden = false;
		this.discArtSlidePreviousX = null;

		if (!enabled) {
			this.discArtEntryPending = false;
			this.discArtEntryOnOpen = false;
			this.discArtTrackEntryPending = false;
			this.discArtTrackEntryAwaitingArtwork = false;
			const finish = this.discArtExitComplete;
			this.discArtExitActive = false;
			this.discArtExitComplete = null;
			this.discArtSlideVisible = null;
			this.discArtSlideTargetX = null;
			this.commitPendingLabelLogo();
			if (finish) finish();
			else if (this.discArt) grm.ui.resizeArtwork(true);
			return;
		}

		this.discArtSlideVisible = null;
		this.discArtSlideTargetX = null;
	}

	/**
	 * Starts the stopped-state retract transition while the last Details frame is retained.
	 * @param {Function} onComplete - Restores TT's original stopped UI after retraction.
	 * @returns {boolean} True when the transition was started.
	 */
	beginDiscArtStopTransition(onComplete) {
		if (this.discArtExitActive) return true;
		const supported = grSet.discArtAnimation && grSet.displayDiscArt && !grSet.panelBrowseMode &&
			grm.ui.displayDetails && grm.ui.hasArtwork && this.discArt && this.discArtSize.w > 0;
		if (!supported) return false;

		this.clearTimer('discArt');
		this.clearTimer('discArtFade');
		this.clearTimer('discArtCommit');
		this.clearTimer('discArtDeferredStart');
		this.clearTimer('discArtTrackEntry');
		this.discArtTrackEntryPending = false;
		this.discArtTrackEntryAwaitingArtwork = false;
		this.discArtLoadToken++;
		this.discArtFadePrevious = null;
		this.discArtFadeProgress = 1;
		this.discArtExitActive = true;
		this.discArtExitComplete = onComplete;
		this.discArtFrontHidden = false;

		const positions = this.getDiscArtSlidePositions();
		this.discArtSlideVisible = false;
		this.discArtSlideTargetX = positions.hiddenX;
		this.startDiscArtSlideAnimation(positions.hiddenX, this.discArtSlideDuration, () => {
			if (!this.discArtExitActive) return;
			const finish = this.discArtExitComplete;
			this.discArtExitActive = false;
			this.discArtExitComplete = null;
			if (finish) finish();
		});
		return true;
	}

	/**
	 * Cancels a pending stopped-state transition when playback resumes.
	 */
	cancelDiscArtStopTransition() {
		if (!this.discArtExitActive) return;
		this.clearTimer('discArtSlide');
		this.discArtExitActive = false;
		this.discArtExitComplete = null;
		this.discArtSlideVisible = false;
		this.discArtSlideTargetX = this.discArtSize.x;
		this.discArtFrontHidden = false;
		this.repaintDiscArtSlide(this.discArtSize.x, this.discArtSize.x);
	}

	/**
	 * Returns the hidden and responsive visible positions for the disc art slide effect.
	 * The configured display amount is treated as a maximum: available space always wins.
	 * @returns {{hiddenX: number, targetX: number, ratio: number}}
	 */
	getDiscArtSlidePositions() {
		const coverRight = grm.ui.albumArtSize.x + grm.ui.albumArtSize.w;
		const hiddenX = Math.floor(coverRight - this.discArtSize.w);
		const safeGap = SCALE(16);
		const availableSpace = Math.max(0, grm.ui.ww - coverRight - safeGap);
		const configuredRatio = Math.max(0, Math.min(1, Number(grSet.discArtDisplayAmount) || 0));
		const exposedPixels = Math.min(this.discArtSize.w * configuredRatio, availableSpace);
		const responsiveRatio = this.discArtSize.w > 0 ? exposedPixels / this.discArtSize.w : 0;
		const usefulRatio = responsiveRatio >= this.discArtSlideMinRatio ? responsiveRatio : 0;

		return {
			hiddenX,
			targetX: Math.floor(hiddenX + this.discArtSize.w * usefulRatio),
			ratio: usefulRatio
		};
	}

	/**
	 * Synchronizes the disc position with playback and the current responsive layout.
	 * Playing and paused remain exposed; stopped retracts from the current position.
	 */
	syncDiscArtSlideAnimation() {
		if (this.discArtExitActive) return;
		// The next disc owns the slide only after it is ready and the entry timer
		// installs its hidden start position. A paint here must not start a slide.
		if (this.discArtTrackEntryPending) return;

		const slideSupported = grSet.discArtAnimation && grm.ui.hasArtwork && this.discArtSize.w > 0;
		if (!slideSupported) {
			if (this.discArtSlideTimer) this.clearTimer('discArtSlide');
			this.discArtSlideVisible = null;
			this.discArtSlideTargetX = null;
			this.discArtFrontHidden = false;
			return;
		}

		const positions = this.getDiscArtSlidePositions();
		const shouldShow = fb.IsPlaying && positions.ratio > 0;
		const targetX = shouldShow ? positions.targetX : positions.hiddenX;
		const stateChanged = this.discArtSlideVisible !== shouldShow;
		const targetChanged = this.discArtSlideTargetX !== targetX;

		if (!stateChanged && !targetChanged) return;

		const firstSync = this.discArtSlideVisible === null;
		this.discArtSlideVisible = shouldShow;
		this.discArtSlideTargetX = targetX;

		if (firstSync) {
			const animateEntry = this.discArtEntryOnOpen && shouldShow;
			this.discArtEntryOnOpen = false;
			if (animateEntry) {
				this.discArtSize.x = positions.hiddenX;
				this.discArtFrontHidden = false;
				const animation = this.getDiscArtEntryAnimation(false);
				this.startDiscArtSlideAnimation(targetX, animation.duration, null, animation.easing);
			} else {
				this.discArtSize.x = targetX;
				this.discArtFrontHidden = grSet.discArtOnTop && !shouldShow;
				this.setDiscArtShadow();
			}
			return;
		}

		const duration = stateChanged ? this.discArtSlideDuration : 120;
		this.startDiscArtSlideAnimation(targetX, duration);
	}

	/**
	 * Animates from the current disc position to the requested target.
	 * @param {number} targetX - Destination x-coordinate.
	 * @param {number} duration - Animation duration in milliseconds.
	 * @param {Function|null} [onComplete] - Optional completion callback.
	 * @param {string} [easing] - 'progressive' for smoothstep entry, otherwise the legacy fast curve.
	 */
	startDiscArtSlideAnimation(targetX, duration, onComplete = null, easing = 'fast') {
		this.clearTimer('discArtSlide');

		const startX = Number.isFinite(this.discArtSize.x) ? this.discArtSize.x : targetX;
		const distance = targetX - startX;
		this.discArtSlidePreviousX = startX;
		if (this.discArtSlideVisible) this.discArtFrontHidden = false;
		if (Math.abs(distance) < 1) {
			this.discArtSize.x = targetX;
			this.discArtFrontHidden = grSet.discArtOnTop && !this.discArtSlideVisible;
			this.repaintDiscArtSlide(startX, targetX);
			if (onComplete) onComplete();
			return;
		}

		this.clearDiscArtTransitionShadow();
		const startTime = grAnimationManager.now();
		this.discArtSlideTimer = grAnimationManager.add(now => {
			const progress = Math.min(1, (now - startTime) / Math.max(1, duration));
			const eased = easing === 'progressive' ?
				progress * progress * (3 - 2 * progress) :
				1 - Math.pow(1 - progress, 3);
			const previousX = this.discArtSize.x;
			this.discArtSize.x = Math.round(startX + distance * eased);
			this.repaintDiscArtSlide(previousX, this.discArtSize.x);
			this.discArtSlidePreviousX = this.discArtSize.x;

			if (progress >= 1) {
				this.clearTimer('discArtSlide');
				const previousX = this.discArtSize.x;
				this.discArtSize.x = targetX;
				this.discArtFrontHidden = grSet.discArtOnTop && !this.discArtSlideVisible;
				this.setDiscArtShadow();
				this.repaintDiscArtSlide(previousX, targetX);
				this.discArtSlidePreviousX = null;
				if (onComplete) onComplete();
			}
		}, Math.max(16, grSet.spinDiscArtRedrawInterval));
	}

	/**
	 * Repaints only the cover/disc band during slide animation, leaving the waveform untouched.
	 */
	repaintDiscArtSlide(previousX = this.discArtSize.x, currentX = this.discArtSize.x) {
		const cover = grm.ui.albumArtSize;
		const margin = this.discArtShadow + SCALE(2);
		const left = Math.max(0, Math.floor(Math.min(cover.x, previousX, currentX) - margin));
		const right = grm.ui.displayDetails && grm.ui.displayLyrics && grSet.detailsLyricsDisplayMode === 'arc'
			? grm.ui.ww : Math.min(grm.ui.ww, Math.ceil(Math.max(
			cover.x + cover.w,
			previousX + this.discArtSize.w,
			currentX + this.discArtSize.w
		) + margin));
		const top = Math.max(grm.ui.topMenuHeight, Math.floor(Math.min(cover.y, this.discArtSize.y) - margin));
		const bottom = Math.min(grm.ui.wh - grm.ui.lowerBarHeight, Math.ceil(Math.max(
			cover.y + cover.h,
			this.discArtSize.y + this.discArtSize.h
		) + margin));

		window.RepaintRect(left, top, Math.max(1, right - left), Math.max(1, bottom - top), true);
		this.scheduleLabelLogoRepair(left, top, right - left, bottom - top);
	}

	/**
	 * Repair transparent logos separately when a clipped disc repaint crosses them.
	 * The disc may redraw every 30 ms; repainting the entire logo row on every
	 * tick makes albums with several logos needlessly expensive to render.
	 */
	scheduleLabelLogoRepair(x, y, w, h) {
		const label = this.labelLogoPaintBounds;
		if (!label || this.immersiveMode && !this.immersiveUiVisible || w <= 0 || h <= 0 ||
			x >= label.x + label.w || label.x >= x + w ||
			y >= label.y + label.h || label.y >= y + h || this.labelLogoRepairTimer) return;

		const delay = Math.max(0, 200 - (Date.now() - this.labelLogoRepairLastAt));
		this.labelLogoRepairTimer = setTimeout(() => {
			this.labelLogoRepairTimer = null;
			this.labelLogoRepairLastAt = Date.now();
			const current = this.labelLogoPaintBounds;
			if (!current || this.immersiveMode && !this.immersiveUiVisible || !grm.ui.displayDetails) return;
			const left = Math.max(0, Math.floor(current.x));
			const top = Math.max(grm.ui.topMenuHeight, Math.floor(current.y));
			const right = Math.min(grm.ui.ww, Math.ceil(current.x + current.w));
			const bottom = Math.min(grm.ui.wh - grm.ui.lowerBarHeight, Math.ceil(current.y + current.h));
			if (right > left && bottom > top) window.RepaintRect(left, top, right - left, bottom - top, true);
		}, delay);
	}

	/**
	 * Prepares an atomic disc swap while retaining the time-derived angle.
	 * @param {string} nextKey - Stable identity of the incoming disc image.
	 * @returns {boolean} True when the incoming image should inherit the current angle.
	 */
	prepareDiscArtSwap(nextKey) {
		const preserveAngle = !!(
			grSet.discArtAnimation && fb.IsPlaying && !this.discArtExitActive &&
			this.discArt && this.discArtImageKey && this.discArtImageKey !== nextKey
		);
		this.clearTimer('discArtFade');
		this.discArtFadePrevious = null;
		this.discArtFadePreviousD2D = false;
		this.discArtFadeProgress = 1;
		this.discArtFadeRotationIndex = this.discArtRotationIndex;
		this.discArtFadeRotationAngle = this.getDiscArtRotationAngle();
		return preserveAngle;
	}

	/**
	 * Starts the short artwork-only crossfade after the incoming disc is ready.
	 */
	startDiscArtCrossfade() {
		if (!this.discArtFadePrevious || !grSet.discArtAnimation) {
			this.discArtFadePrevious = null;
			this.discArtFadeProgress = 1;
			return;
		}

		this.clearTimer('discArtFade');
		const startTime = grAnimationManager.now();
		this.discArtFadeTimer = grAnimationManager.add(now => {
			this.discArtFadeProgress = Math.min(1, (now - startTime) / this.discArtFadeDuration);
			this.repaintDiscArt();

			if (this.discArtFadeProgress >= 1) {
				this.clearTimer('discArtFade');
				this.discArtFadePrevious = null;
				this.discArtFadePreviousD2D = false;
				this.repaintDiscArt();
			}
		}, 40);
	}

	/**
	 * Repaints the disc art area to only cover the necessary region based on album art opacity settings and disc art layering.
	 */
	repaintDiscArt() {
		if (this.isTurntableActive()) { window.Repaint(); return; }
		// Rotation, artwork fades and theme changes can request a smaller repaint while
		// the disc is sliding. Route all of them through the expanded transition band;
		// otherwise the old settled shadow outside the disc rectangle can survive.
		if (this.isDiscArtTransitionActive()) {
			const previousX = Number.isFinite(this.discArtSlidePreviousX) ? this.discArtSlidePreviousX : this.discArtSize.x;
			this.repaintDiscArtSlide(previousX, this.discArtSize.x);
			return;
		}

		if (grm.ui.displayDetails && grm.ui.displayLyrics && grSet.detailsLyricsDisplayMode === 'arc') {
			const margin = this.discArtShadow + SCALE(4);
			const left = Math.max(0, this.discArtSize.x - margin);
			const top = Math.max(grm.ui.topMenuHeight, this.discArtSize.y - margin);
			const bottom = Math.min(grm.ui.wh - grm.ui.lowerBarHeight, this.discArtSize.y + this.discArtSize.h + margin);
			window.RepaintRect(left, top, grm.ui.ww - left, bottom - top, true);
			return;
		}

		const discArtLeftEdge = (
			grSet.detailsAlbumArtOpacity !== 255 || grSet.detailsAlbumArtDiscAreaOpacity !== 255 || grSet.discArtOnTop
		) ? this.discArtSize.x : grm.ui.albumArtSize.x + grm.ui.albumArtSize.w - 1;

		const dirtyWidth = this.discArtSize.w - (discArtLeftEdge - this.discArtSize.x);
		window.RepaintRect(discArtLeftEdge, this.discArtSize.y, dirtyWidth, this.discArtSize.h,
			!grSet.discArtOnTop && !grm.ui.displayLyrics);
		this.scheduleLabelLogoRepair(discArtLeftEdge, this.discArtSize.y, dirtyWidth, this.discArtSize.h);
	}

	/**
	 * Returns the closest ready GDI+ frame without creating a bitmap on the animation timer.
	 * Every cached frame is generated from the immutable source image, never from the previous frame.
	 * @param {number} targetIndex - Time-derived target frame.
	 * @returns {GdiBitmap|null}
	 */
	getDiscArtFrame(targetIndex, desiredAngle = null) {
		this.discArtFrameResidualAngle = 0;
		const count = Math.max(1, grSet.spinDiscArtImageCount);
		const step = 360 / count;
		let readyIndex = this.discArtArray[targetIndex] ? targetIndex : -1;
		if (readyIndex === -1) {
			for (let distance = 1; distance < count; distance++) {
				const previous = (targetIndex - distance + count) % count;
				if (this.discArtArray[previous]) { readyIndex = previous; break; }
				const next = (targetIndex + distance) % count;
				if (this.discArtArray[next]) { readyIndex = next; break; }
			}
		}
		if (readyIndex === -1) return null;
		const seed = readyIndex === this.discArtRotationSeedIndex;
		const actualAngle = seed ? this.discArtRotationSeedAngle : readyIndex * step;
		if (readyIndex !== targetIndex || seed && Math.abs(actualAngle - readyIndex * step) > 0.000001) {
			const angle = Number.isFinite(desiredAngle) ? desiredAngle : targetIndex * step;
			this.discArtFrameResidualAngle = ((angle - actualAngle) % 360 + 540) % 360 - 180;
		}
		return this.discArtArray[readyIndex];
	}

	/**
	 * Repaints the metadata grid area to only cover the necessary region.
	 */
	repaintMetadataGrid() {
		if (!grm.ui.displayDetails) return;
		window.RepaintRect(0, grm.ui.topMenuHeight, Math.max(grm.ui.albumArtSize.x, SCALE(40)), grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight);
	}

	/**
	 * Set the scale factor for the disc art based on the window size and layout.
	 */
	setDiscArtScaleFactor() {
		const discArtMaxHeight = grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight;
		const scaleFactor = grm.ui.displayPlaylist || grm.ui.displayLibrary ? 0.5 : 0.75;
		const discScale = Math.min(grm.ui.ww * scaleFactor / this.discArt.Width, (discArtMaxHeight - SCALE(16)) / this.discArt.Height);
		this.discArtScaleFactor = discScale;
	}

	/**
	 * Set the size of the disc art based on its scale, window state, and layout settings.
	 * @param {boolean} resetDiscArtPosition - Whether the position of the disc art should be reset.
	 */
	setDiscArtSize(resetDiscArtPosition) {
		const discArtSizeCorr = SCALE(4);

		const discArtSize =
			grm.ui.hasArtwork ? grm.ui.albumArtSize.h - discArtSizeCorr :
			Math.floor(this.discArt.Width * this.discArtScaleFactor) - discArtSizeCorr;

		if (resetDiscArtPosition) {
			this.discArtSize = { w: discArtSize, h: discArtSize };
		} else {
			this.discArtSize.w = Math.max(this.discArtSize.w, discArtSize);
			this.discArtSize.h = this.discArtSize.w;
		}
	}

	/**
	 * Set the position of the disc art based on the window size and layout settings.
	 * @param {boolean} resetDiscArtPosition - Whether the position of the disc art should be reset.
	 */
	setDiscArtPosition(resetDiscArtPosition) {
		const discArtSizeCorr = SCALE(4);
		const discArtMargin = SCALE(2);
		const discArtMaxHeight = grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight;

		if (grm.ui.hasArtwork) {
			// Use the same responsive ratio calculation with or without animation so every
			// menu percentage has one meaning and 100% still respects the right-side limit.
			const positions = this.getDiscArtSlidePositions();
			const holdForTrackEntry = grSet.discArtAnimation && grm.ui.displayDetails && this.discArtTrackEntryPending;
			this.discArtSize.x = holdForTrackEntry ? positions.hiddenX : positions.targetX;
			if (holdForTrackEntry && grSet.discArtOnTop) this.discArtFrontHidden = true;
			this.discArtSize.y = resetDiscArtPosition ? (grm.ui.albumArtSize.y + discArtMargin) :
				Math.min(this.discArtSize.y > 0 ? this.discArtSize.y :
				(grm.ui.albumArtSize.y + discArtMargin), grm.ui.albumArtSize.y + discArtMargin);

			return;
		}

		// * Set no disc art x-coordinate
		const discArtOffCenter = this.discArtScaleFactor === (grm.ui.ww * 0.75 / this.discArt.Width);

		const discArtCenterX =
			discArtOffCenter ? Math.round(grm.ui.ww * 0.66 - grm.ui.edgeMargin) :
			(grm.ui.displayPlaylist || grm.ui.displayLibrary) ? grm.ui.ww * 0.25 :
			grm.ui.ww * 0.5;

		this.discArtSize.x = Math.floor(discArtCenterX - this.discArtSize.w * 0.5);

		// * Set no disc art y-coordinate
		const restrictedWidth = this.discArtScaleFactor !== (discArtMaxHeight - SCALE(16)) / this.discArt.Height;
		const discArtCenterY = grm.ui.topMenuHeight + Math.floor(((discArtMaxHeight - SCALE(16)) / 2) - this.discArtSize.h / 2);
		this.discArtSize.y = restrictedWidth ? Math.min(discArtCenterY, 160) : grm.ui.topMenuHeight + discArtMargin;

		grm.ui.hasArtwork = true;
	}

	/**
	 * Sets up async precomputation of disc art frames, prioritized from current index.
	 * @param {GdiBitmap} combinedImg - The base image to rotate.
	 * @param {string} currentAlbumId - Unique ID to detect album changes.
	 * @param {number} rotationDegreeIncrement - Degrees per frame.
	 */
	setDiscArtPrecomputation(combinedImg, currentAlbumId, rotationDegreeIncrement) {
		this.clearTimer('discArtPrecompute');
		if (this.usesTurntableRenderer()) return;
		if (grAnimationManager.resizing || !combinedImg) return;
		const precomputeToken = this.discArtLoadToken;
		const layoutWidth = Math.max(1, Math.round(this.discArtSize.w));
		const layoutHeight = Math.max(1, Math.round(this.discArtSize.h));
		const width = Math.min(1024, layoutWidth), height = Math.min(1024, layoutHeight);
		// Normalize once, outside the rotation tick. Rotating the full-resolution
		// original for every cached frame repeats large resamples/temporary allocations.
		const source = combinedImg.Width > width || combinedImg.Height > height
			? combinedImg.Resize(width, height, 7) : combinedImg;
		if (!source) return;
		const imageCount = Math.max(1, grSet.spinDiscArtImageCount);
		// Sparse exact-angle frames plus the existing residual-angle drawing keep
		// rotation speed while bounding this native cache to roughly 32 MB.
		const maxFrames = Math.max(1, Math.min(36, Math.floor(8000000 / (width * height))));
		const stride = Math.max(1, Math.ceil(imageCount / Math.max(1, maxFrames - 1)));
		let frameTimeAvg = 0;
		let precomputeIndex = (this.discArtRotationIndex + 1) % imageCount;
		let performanceTierCurrent = 'medium';

		const performanceTiers = {
			low:    { batchSize: 1, batchDelay: 120 },
			medium: { batchSize: 1, batchDelay: 80 },
			high:   { batchSize: 1, batchDelay: 60 }
		};

		const updatePerformanceTier = (frameTime) => {
			frameTimeAvg = (frameTimeAvg + frameTime) / 2;
			const performanceTierNew = frameTimeAvg > 50 ? 'low' : frameTimeAvg < 10 ? 'high' : 'medium';
			if (performanceTierNew === performanceTierCurrent) return;
			performanceTierCurrent = performanceTierNew;
			const tier = performanceTiers[performanceTierCurrent];
			grm.debug.debugLog(`碟片 => 适应 ${performanceTierCurrent} 性能: 批量大小=${tier.batchSize}, 批量延迟=${tier.batchDelay} 毫秒 (avgFrameTime=${Math.round(frameTimeAvg)} 毫秒)`);
		};

		const precomputeBatch = () => {
			this.discArtPrecomputeTimer = null;
			if (this.usesTurntableRenderer()) return;
			if (grAnimationManager.resizing || window.IsVisible === false || !fb.IsPlaying || fb.IsPaused) return;
			if (precomputeToken !== this.discArtLoadToken || !this.discArt || this.discArt.Path !== currentAlbumId || !grm.ui.displayDetails ||
				layoutWidth !== Math.round(this.discArtSize.w) || layoutHeight !== Math.round(this.discArtSize.h) || imageCount !== grSet.spinDiscArtImageCount) return;

			const tier = performanceTiers[performanceTierCurrent];
			let computedInBatch = 0;
			let inspected = 0;

			while (computedInBatch < tier.batchSize && inspected < imageCount) {
				if (precomputeIndex % stride === 0 && !this.discArtArray[precomputeIndex] && this.discArtArray.filter(Boolean).length < maxFrames) {
					const rotationDegrees = rotationDegreeIncrement * precomputeIndex;
					const frameStart = Date.now();
					this.discArtArray[precomputeIndex] = RotateImage(source, width, height, rotationDegrees, grm.artCache.discArtImgMaxRes);
					const frameTime = Date.now() - frameStart;
					updatePerformanceTier(frameTime); // Update per-frame for quicker response
					grm.debug.debugLog(`碟片 => 预计算碟片图像: ${precomputeIndex} (${this.discArtSize.w}x${this.discArtSize.h}) 旋转: ${rotationDegrees} 度`);
					computedInBatch++;
				}
				precomputeIndex = (precomputeIndex + 1) % imageCount;
				inspected++;
			}

			const readyFrames = this.discArtArray.reduce((count, frame) => count + (frame ? 1 : 0), 0);
			if (readyFrames >= Math.min(imageCount, maxFrames) || inspected >= imageCount && !computedInBatch) {
				grm.debug.debugLog('碟片 => 所有帧均已预先计算');
				return;
			}

			this.discArtPrecomputeTimer = setTimeout(precomputeBatch, tier.batchDelay);
		};

		this.discArtPrecomputeTimer = setTimeout(precomputeBatch, performanceTiers.medium.batchDelay);
	}

	/**
	 * Returns the angle the disc should have at the current wall-clock time.
	 * Missed UI ticks therefore never slow down or later catch up the rotation.
	 * @param {number} [now] - Current timestamp.
	 * @returns {number}
	 */
	getDiscArtRotationAngle(now = grAnimationManager.now()) {
		if (!this.discArtRotationEpoch || !fb.IsPlaying || fb.IsPaused || !grSet.spinDiscArt) {
			return (this.discArtRotationAngle % 360 + 360) % 360;
		}

		const step = 360 / Math.max(1, grSet.spinDiscArtImageCount);
		// Keep the old speed until the running angle is captured on a setting change.
		const interval = this.discArtRotationInterval || Math.max(1, grSet.spinDiscArtRedrawInterval);
		const elapsed = Math.max(0, now - this.discArtRotationEpoch);
		return (this.discArtRotationAngle + elapsed * step / interval) % 360;
	}

	/** Freezes the time-derived angle before the rotation timer is stopped. */
	pauseDiscArtRotation() {
		this.discArtRotationAngle = this.getDiscArtRotationAngle();
		this.discArtD2DRotationAngle = this.discArtRotationAngle;
		this.discArtRotationEpoch = 0;
	}

	/**
	 * Sets and creates the disc art rotation animation with RotateImg().
	 * @returns {GdiBitmap} The rotated disc art image.
	 */
	setDiscArtRotation(preserveCurrentAngle = false) {
		if (this.usesTurntableRenderer()) return null;
		if (grAnimationManager.resizing) return null;
		if (!grSet.displayDiscArt || grm.ui.albumArtCorrupt || !grm.ui.albumArt || !this.discArt || this.discArtSize.w < 1) {
			return null;
		}

		// Drawing discArt rotated is slow, so first draw it rotated into the discArtRotation image, and then draw discArtRotation image unrotated in on_paint.
		const vinylAdjustedTrackNumFormat = `$num($if(${grTF.vinyl_tracknum},$sub($mul(${grTF.vinyl_tracknum},2),1),$if2(%tracknumber%,1)),1)`;
		let tracknum = parseInt($(vinylAdjustedTrackNumFormat)) - 1;
		if (!grSet.rotateDiscArt || Number.isNaN(tracknum)) tracknum = 0;

		const rotationStep = 360 / grSet.spinDiscArtImageCount;
		const tracknumRotation = preserveCurrentAngle && grSet.spinDiscArt
			? this.getDiscArtRotationAngle()
			: tracknum * grSet.rotationAmt % 360;
		this.discArtRotationAngle = tracknumRotation;
		this.discArtRotationEpoch = fb.IsPlaying && !fb.IsPaused ? grAnimationManager.now() : 0;

		// * D2D path: store initial angle and build the unrotated source image
		if (D2D) {
			this.discArtD2DRotationAngle = tracknumRotation;
			this.setDiscArtD2DImage();
			this.discArtRotation = this.discArtD2DImage;
			return this.discArtD2DImage;
		}

		// * GDI+ path
		const combinedImg = this.combineDiscArtWithCover(true);

		this.discArtRotation = RotateImage(combinedImg, this.discArtSize.w, this.discArtSize.h, tracknumRotation, grm.artCache.discArtImgMaxRes);
		this.discArtRotationIndex = Math.round(tracknumRotation / rotationStep) % grSet.spinDiscArtImageCount;
		this.discArtRotationSeedIndex = this.discArtRotationIndex;
		this.discArtRotationSeedAngle = tracknumRotation;
		this.discArtArray[this.discArtRotationIndex] = this.discArtRotation;

		return this.discArtRotation;
	}

	/**
	 * Sets the disc art timer with different set interval values for rotating the disc art.
	 */
	setDiscArtRotationTimer(deferHeavyWork = false) {
		if (this.isTurntableActive()) { this.clearTimer('discArt'); this.updateTurntableState(); return; }
		if (grAnimationManager.resizing) return;
		if (grSet.layout !== 'default' || !grm.ui.displayDetails ||
			grm.ui.albumArtCorrupt || !grm.ui.albumArt || !this.discArt || !this.discArtSize.w ||
			!fb.IsPlaying || fb.IsPaused || !grSet.displayDiscArt || !grSet.spinDiscArt) {
			this.pauseDiscArtRotation();
			this.clearTimer('discArt');
			return;
		}

		const configuredInterval = Math.max(1, grSet.spinDiscArtRedrawInterval);
		const intervalChanged = this.discArtRotationInterval !== configuredInterval;
		if (!this.discArtRotationTimer || intervalChanged) {
			// Capture the angle using the OLD speed before switching settings.
			this.discArtRotationAngle = this.getDiscArtRotationAngle();
			this.discArtRotationEpoch = grAnimationManager.now();
			if (this.discArtRotationTimer) this.clearTimer('discArt');
			this.discArtRotationInterval = configuredInterval;
			this.discArtRotationRedrawDelay = Math.max(16, configuredInterval);

			// The shared clock dispatches a single visual tick. Rotation is sampled
			// from elapsed time, while delayed UI work only changes redraw cadence.
			const tick = now => {
				const baseDelay = Math.max(16, this.discArtRotationInterval);
				// A late UI callback should drop one frame, not lower the cadence for
				// several more frames. The wall-clock angle already accounts for elapsed time.
				this.discArtRotationRedrawDelay = baseDelay;
				const angle = this.getDiscArtRotationAngle(now);
				const count = Math.max(1, grSet.spinDiscArtImageCount);
				this.discArtD2DRotationAngle = angle;
				this.discArtRotationIndex = Math.round(angle * count / 360) % count;
				this.repaintDiscArt();
				// Repaint can synchronously stop the animation on a view change.
				if (!this.discArtRotationTimer || !fb.IsPlaying || fb.IsPaused || !grSet.spinDiscArt ||
					!grm.ui.displayDetails || grSet.layout !== 'default' || !this.discArt ||
					!grSet.displayDiscArt || grm.ui.albumArtCorrupt) {
					this.clearTimer('discArt');
					return;
				}
				const delay = Math.round(this.discArtRotationRedrawDelay);
				this.discArtRotationNextTick = grAnimationManager.now() + delay;
				return delay;
			};
			const delay = Math.round(this.discArtRotationRedrawDelay);
			this.discArtRotationNextTick = grAnimationManager.now() + delay;
			this.discArtRotationTimer = grAnimationManager.add(tick, delay);
		}

		// D2D transforms the immutable source bitmap directly and needs no frame cache.
		if (D2D) {
			this.clearTimer('discArtDeferredStart');
			return;
		}

		if (deferHeavyWork && grSet.discArtAnimation) {
			this.clearTimer('discArtDeferredStart');
			const loadToken = this.discArtLoadToken;
			this.discArtDeferredStartTimer = setTimeout(() => {
				this.discArtDeferredStartTimer = null;
				// A deferred bitmap job must not outlive the playback/view state that queued it.
				if (loadToken !== this.discArtLoadToken || !grm.ui.displayDetails ||
					grSet.layout !== 'default' || !grSet.displayDiscArt || !grSet.spinDiscArt ||
					!fb.IsPlaying || fb.IsPaused || grAnimationManager.resizing ||
					grm.ui.albumArtCorrupt || !grm.ui.albumArt || !this.discArt ||
					!this.discArtSize.w || this.isTurntableActive()) return;
				const step = 360 / Math.max(1, grSet.spinDiscArtImageCount);
				this.setDiscArtPrecomputation(this.combineDiscArtWithCover(false), this.discArt.Path, step);
			}, this.discArtDeferredStartDelay);
			return;
		}
		this.clearTimer('discArtDeferredStart');

		// * GDI+ path
		grm.debug.debugLog(`碟片 => 使用异步预计算启动延迟旋转: ${grSet.spinDiscArtImageCount} 帧, 每 ${grSet.spinDiscArtRedrawInterval} 毫秒 1 次`);

		const rotationDegreeIncrement = 360 / grSet.spinDiscArtImageCount;
		const combinedImg = this.combineDiscArtWithCover(false);
		const currentAlbumId = this.discArt.Path;

		// Frame generation is deferred work only; the animation timer never allocates bitmaps.
		this.setDiscArtPrecomputation(combinedImg, currentAlbumId, rotationDegreeIncrement);
	}

	/**
	 * Sets the drop shadow for disc art.
	 */
	setDiscArtShadow() {
		if (this.usesTurntableRenderer()) {
			this.discArtShadowImg = { image: null, size: 0 };
			return;
		}
		if (grAnimationManager.resizing) return;
		// 全局阴影开关：若关闭，则直接退出，不绘制任何阴影
		if (!grSet.enableDiscArtShadows) {
			this.discArtShadowImg = { image: null, size: 0 };
			return;
		}
		if (this.isDiscArtTransitionActive()) {
			this.clearDiscArtTransitionShadow();
			return;
		}

		const isDisabled = !grm.ui.displayDetails || !grSet.displayDiscArt || grSet.layout === 'compact';
		const isMissing = !this.discArt || !grm.ui.hasArtwork && !grm.ui.noAlbumArtStub;
		const shadowRgb = grCol.discArtShadow & 0xffffff;
		const shadowAlpha = (grCol.discArtShadow >>> 24) & 255;
		const shadowKey = `${this.discArtSize.x}:${this.discArtSize.w}:${this.discArtSize.h}:${this.discArtShadow}:${SCALE(2)}:${shadowRgb}`;
		const isCached = this.discArtShadowImg && this.discArtShadowImg.image
			&& this.discArtShadowImg.key === shadowKey;

		// Chameleon may vary shadow opacity along with the palette. Reuse its blurred
		// RGB template; compositing alpha is cheap and does not allocate or blur a bitmap.
		if (isCached) this.discArtShadowImg.alpha = shadowAlpha;

		if (isDisabled || isMissing || isCached) return;

		grm.debug.setDebugProfile(grm.debug.showDebugTiming || grCfg.settings.showDebugPerformanceOverlay, 'create', '创建碟片阴影');

		const discArtMargin = SCALE(2);

		if (grm.ui.albumArtSize.w > 0 || this.discArtSize.w > 0) {
			const width = this.discArt
				? this.discArtSize.x + this.discArtSize.w + 2 * this.discArtShadow
				: grm.ui.albumArtSize.x + grm.ui.albumArtSize.w + 2 * this.discArtShadow;

			const height = this.discArt
				? this.discArtSize.h + discArtMargin + 2 * this.discArtShadow
				: grm.ui.albumArtSize.h + 2 * this.discArtShadow;

			const newShadowImg = gdi.CreateImage(width, height);

			if (grSet.layout === 'default' && newShadowImg) {
				const shimg = newShadowImg.GetGraphics();
				try { if (this.discArt) {
					const offset = this.discArtSize.w * 0.40; // Don't change this value
					const xVal = this.discArtSize.x;
					const shadowOffset = this.discArtShadow * 2;
					const shadowColor = 0xff000000 | shadowRgb;

					shimg.DrawEllipse(xVal + shadowOffset, shadowOffset + discArtMargin, this.discArtSize.w - shadowOffset, this.discArtSize.w - shadowOffset, shadowOffset, shadowColor); // outer shadow
					shimg.DrawEllipse(xVal + this.discArtShadow + offset, offset + this.discArtShadow + discArtMargin, this.discArtSize.w - offset * 2, this.discArtSize.h - offset * 2, 60, shadowColor); // inner shadow
				} } finally { newShadowImg.ReleaseGraphics(shimg); }
				newShadowImg.StackBlur(this.discArtShadow);
			}

			this.discArtShadowImg.image = newShadowImg;
			this.discArtShadowImg.size = this.discArtSize.h;
			this.discArtShadowImg.x = this.discArtSize.x;
			this.discArtShadowImg.key = shadowKey;
			this.discArtShadowImg.alpha = shadowAlpha;
		}

		grm.debug.setDebugProfile(false, 'print', '创建碟片阴影');
	}

	/**
	 * Updates the disc art by resizing artwork, creating rotation, and setting the rotation timer.
	 * @param {boolean} [skipResize] - The flag to to skip the artwork resize step.
	 * @param {boolean} [preserveCurrentAngle] - Retain the outgoing disc angle without generating it twice.
	 */
	updateDiscArt(skipResize, preserveCurrentAngle = false) {
		if (!skipResize) {
			grm.ui.resizeArtwork(true);
		}
		if (this.usesTurntableRenderer()) { this.updateTurntableState(); return; }

		if (!D2D) {
			this.clearTimer('discArtPrecompute');
			this.discArtArray = [];
		}

		this.setDiscArtRotation(preserveCurrentAngle);

		if (!grSet.spinDiscArt) return;

		this.setDiscArtRotationTimer(grSet.discArtAnimation);
	}

	/**
	 * Updates the theme-sensitive shadow without rebuilding the transparent disc source.
	 * Artwork/resize paths own disc bitmaps; background colors do not affect their pixels.
	 */
	syncDiscArtThemeVisualState() {
		const nextKey = `${grCol.discArtShadow}|${grSet.enableDiscArtShadows}`;
		if (nextKey === this.discArtThemeVisualKey) return;
		this.discArtThemeVisualKey = nextKey;

		// Never reset rotation or artwork crossfades for a palette interpolation.
		// The shadow method checks geometry/RGB before deciding whether work is needed.
		this.setDiscArtShadow();
	}
	// #endregion

	// * PUBLIC METHODS - DISC ART - DIRECT2D * //
	// #region PUBLIC METHODS - DISC ART - DIRECT2D
	/**
	 * Draws the disc art using a D2D Matrix3x2 rotation transform applied to a single cached source bitmap.
	 * No pre-rotated frames, no precomputation - the GPU does the work.
	 * @param {GdiGraphics} gr - The D2D graphics object (must be a D2D context).
	 */
	drawDiscArtD2DImage(gr) {
		if (!this.discArtD2DImage || !grSet.filterAlbumArt && grm.ui.discArtImageDisplayed) {
			return;
		}

		// Draw shadow before applying transform so it stays in place
		if (this.discArtShadowImg.image && !this.isDiscArtTransitionActive() && !this.immersiveLayoutTimer) {
			const shadowImg = this.discArtShadowImg.image;
			gr.DrawImage(shadowImg, -this.discArtShadow, grm.ui.albumArtSize.y - this.discArtShadow, shadowImg.Width, shadowImg.Height, 0, 0, shadowImg.Width, shadowImg.Height, 0, this.discArtShadowImg.alpha ?? 255);
		}

		// Rotation pivot = center of the disc art rectangle, build and apply rotation matrix (D2D handles sub-pixel interpolation)
		const centerX = this.discArtSize.x + this.discArtSize.w * 0.5;
		const centerY = this.discArtSize.y + this.discArtSize.h * 0.5;
		// Other repaint sources can draw between rotation ticks. Sample the same
		// clock here rather than reusing a stale timer angle for those paints.
		this.discArtD2DRotationAngle = this.getDiscArtRotationAngle();
		const rotMatrix = RotationMatrix(centerX, centerY, this.discArtD2DRotationAngle, this.discArtD2DRotationMatrix);

		gr.PushTransform();
		try {
			gr.SetTransform(rotMatrix);
			gr.DrawImage(this.discArtD2DImage, this.discArtSize.x, this.discArtSize.y, this.discArtSize.w, this.discArtSize.h,
				0, 0, this.discArtD2DImage.Width, this.discArtD2DImage.Height);
		}
		finally {
			// A theme/artwork swap may invalidate the source during this paint. Always restore
			// the transform so later label logos are never enlarged, rotated or displaced.
			gr.PopTransform();
		}
	}

	/**
	 * Builds and caches a single unrotated, target-size disc art image for D2D transform rotation.
	 * Called once per track/resize. The D2D timer then rotates this in-place via SetTransform without any per-frame bitmap allocation.
	 * @returns {GdiBitmap|null} The cached source image, or null on failure.
	 */
	setDiscArtD2DImage() {
		const combinedImg = this.combineDiscArtWithCover(true);

		if (!combinedImg || this.discArtSize.w < 1) {
			this.discArtD2DImage = null;
			return null;
		}

		// Resize once to the exact render dimensions - no rotation baked in
		this.discArtD2DImage = combinedImg.Resize(Math.floor(this.discArtSize.w), Math.floor(this.discArtSize.h));

		grm.debug.debugLog(`碟片 D2D => 构建源图像 (${this.discArtSize.w}x${this.discArtSize.h})`);

		return this.discArtD2DImage;
	}

	/**
	 * D2D disc art rotation timer. Advances the rotation angle by one step per interval and requests a repaint.
	 * No bitmap allocation occurs per tick - angle is a plain float.
	 */
	setDiscArtD2DRotationTimer() {
		this.setDiscArtRotationTimer(false);
	}
	// #endregion

	// * PUBLIC METHODS - BAND & LABEL LOGO * //
	// #region PUBLIC METHODS - BAND & LABEL LOGO
	/**
	 * Measures alpha-weighted ink once at load time. Opaque black/white backings
	 * remove transparent RGB from the palette without requiring native pixel access.
	 * Two temporary bounded bitmaps; no retained surfaces or paint-time sampling.
	 */
	getLogoInkTones(logo) {
		if (!logo || typeof gdi === 'undefined' || typeof gdi.CreateImage !== 'function') return null;
		try {
			const scale = Math.min(1, 128 / Math.max(logo.Width, logo.Height));
			const w = Math.max(1, Math.round(logo.Width * scale));
			const h = Math.max(1, Math.round(logo.Height * scale));
			const sample = backing => {
				const image = gdi.CreateImage(w, h);
				const gr = image.GetGraphics();
				try {
					gr.FillSolidRect(0, 0, w, h, backing);
					gr.DrawImage(logo, 0, 0, w, h, 0, 0, logo.Width, logo.Height);
				} finally { image.ReleaseGraphics(gr); }
				let total = 0, luminance = 0, colored = 0;
				for (const entry of JSON.parse(image.GetColourSchemeJSON(32))) {
					if (!Number.isFinite(entry.col) || !Number.isFinite(entry.freq) || entry.freq <= 0) continue;
					const r = (entry.col >>> 16) & 255, g = (entry.col >>> 8) & 255, b = entry.col & 255;
					total += entry.freq;
					luminance += (r * 299 + g * 587 + b * 114) / 1000 * entry.freq;
					if (Math.max(r, g, b) - Math.min(r, g, b) > 32) colored += entry.freq;
				}
				return total > 0 ? { brightness: luminance / total, colored: colored / total } : null;
			};
			const dark = sample(0xff000000), light = sample(0xffffffff);
			if (!dark || !light) return null;
			const coverage = Math.max(0, Math.min(1, 1 - (light.brightness - dark.brightness) / 255));
			if (coverage < 0.002 || coverage >= 0.98) return null;
			return { brightness: Math.max(0, Math.min(255, dark.brightness / coverage)),
				monochrome: Math.max(dark.colored, light.colored) / coverage <= 0.25 };
		} catch (e) { return null; }
	}

	/** Sample extreme monochrome tones once per image, outside the paint loop. */
	getLogoExtremeTones(logo) {
		const result = { black: false, white: false, brightness: null, monochrome: false, inkBrightness: null };
		if (!logo) return result;
		try {
			const colors = JSON.parse(logo.GetColourSchemeJSON(5));
			let total = 0;
			let black = 0;
			let white = 0;
			let neutral = 0;
			let gray = 0;
			let luminance = 0;
			for (const entry of colors) {
				if (!Number.isFinite(entry.col) || !Number.isFinite(entry.freq) || entry.freq <= 0) continue;
				const channels = [(entry.col >>> 16) & 255, (entry.col >>> 8) & 255, entry.col & 255];
				if (Math.max(...channels) <= 64) black += entry.freq;
				if (Math.min(...channels) >= 205) white += entry.freq;
				if (Math.max(...channels) - Math.min(...channels) <= 32) {
					neutral += entry.freq;
					if (Math.min(...channels) > 64 && Math.max(...channels) < 205) gray += entry.freq;
				}
				luminance += ((channels[0] * 299 + channels[1] * 587 + channels[2] * 114) / 1000) * entry.freq;
				total += entry.freq;
			}
			if (total > 0) {
				result.black = black / total >= 0.6;
				result.white = white / total >= 0.6;
				result.brightness = luminance / total;
				result.monochrome = neutral / total >= 0.75;
				// A gray plate can dominate average brightness while its actual mark
				// is black or white. Cache the mark's tone once, without pixel scans.
				if (result.monochrome && gray / total >= 0.35) {
					if (black / total >= 0.05 && black >= white * 4) result.inkBrightness = 0;
					else if (white / total >= 0.05 && white >= black * 4) result.inkBrightness = 255;
				}
			}
		} catch (e) { /* Unreadable logo: keep TT's original choice. */ }
		const ink = this.getLogoInkTones(logo);
		if (ink) {
			result.monochrome = ink.monochrome;
			result.inkBrightness = ink.monochrome ? ink.brightness : null;
			result.brightness = ink.brightness;
			result.black = ink.monochrome && ink.brightness <= 64;
			result.white = ink.monochrome && ink.brightness >= 205;
		}
		return result;
	}

	/** Preserve TT's choice unless a monochrome logo blends into its actual panel. */
	selectLogoForBackground(normal, inverted, preferInverted, background, normalTones, invertedTones, grayIsDark = false) {
		const selected = preferInverted && inverted ? inverted : normal;
		if (!normal || !inverted || !Number.isFinite(background)) return selected;
		const red = (background >>> 16) & 255;
		const green = (background >>> 8) & 255;
		const blue = background & 255;
		// Dark theme styles paint the label panel dark gray (for example #3a3a3a),
		// so a near-black-only threshold misses black artwork against that panel.
		const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
		const midGray = grayIsDark && normalTones?.monochrome && invertedTones?.monochrome &&
			Math.max(red, green, blue) - Math.min(red, green, blue) <= 32 && brightness <= 170;
		const tone = midGray || brightness <= 112 ? 'black' : brightness >= 190 ? 'white' : null;
		if (!tone) return selected;
		if (grayIsDark && Number.isFinite(normalTones?.inkBrightness) && Number.isFinite(invertedTones?.inkBrightness) &&
			normalTones.inkBrightness !== invertedTones.inkBrightness) {
			return tone === 'black'
				? (normalTones.inkBrightness > invertedTones.inkBrightness ? normal : inverted)
				: (normalTones.inkBrightness < invertedTones.inkBrightness ? normal : inverted);
		}
		// A black/white outlined logo may have neither extreme tone above 60%.
		// Compare its two cached faces before falling back to the original rule.
		if (normalTones?.monochrome && invertedTones?.monochrome &&
			Number.isFinite(normalTones.brightness) && Number.isFinite(invertedTones.brightness) &&
			Math.abs(normalTones.brightness - invertedTones.brightness) >= 40) {
			return tone === 'black'
				? (normalTones.brightness > invertedTones.brightness ? normal : inverted)
				: (normalTones.brightness < invertedTones.brightness ? normal : inverted);
		}
		// Reborn Black can show the label directly on the near-black main area,
		// while the Details panel itself remains bright. Sparse transparent marks
		// (MCA, Sony Music) may fall below the 60%/40-point tone thresholds.
		if (tone === 'black' && grSet.theme === 'reborn' && grSet.styleRebornBlack) {
			if (Number.isFinite(normalTones?.brightness) && Number.isFinite(invertedTones?.brightness) &&
				Math.abs(normalTones.brightness - invertedTones.brightness) >= 8) {
				return normalTones.brightness > invertedTones.brightness ? normal : inverted;
			}
			return inverted;
		}
		const selectedTones = selected === inverted ? invertedTones : normalTones;
		const otherTones = selected === inverted ? normalTones : invertedTones;
		return selectedTones && selectedTones[tone] && otherTones && !otherTones[tone]
			? (selected === inverted ? normal : inverted) : selected;
	}

	/**
	 * Installs one complete record-label set and invalidates only its position cache.
	 * Bounds travel with the label set across deferred disc entry.
	 * @param {GdiBitmap[]} logos - Normal label images.
	 * @param {GdiBitmap[]} invertedLogos - Inverted label images.
	 */
	setLabelLogoSet(logos, invertedLogos, visibleBounds = []) {
		this.labelLogo = logos;
		this.labelLogoInverted = invertedLogos;
		this.labelLogoVisibleBounds = logos.map((logo, i) => visibleBounds[i] ||
			{ x: 0, y: 0, w: logo.Width, h: logo.Height });
		this.labelLogoTones = logos.map(logo => this.getLogoExtremeTones(logo));
		this.labelLogoInvertedTones = invertedLogos.map(logo => this.getLogoExtremeTones(logo));
		this.cachedLabelLastLeftEdge = 0;
		this.cachedLabelLastHeight = 0;
		this.shadowImgLabel = null;
		this.labelLogoCompactShadowKey = '';
	}

	/**
	 * Atomically exposes the newest track's complete label set when its validated disc entry begins.
	 * @returns {boolean} True when a pending set was committed.
	 */
	commitPendingLabelLogo() {
		if (this.pendingLabelLogo === null) return false;
		const logos = this.pendingLabelLogo;
		const invertedLogos = this.pendingLabelLogoInverted || [];
		const visibleBounds = this.pendingLabelLogoVisibleBounds || [];
		this.pendingLabelLogo = null;
		this.pendingLabelLogoInverted = null;
		this.pendingLabelLogoVisibleBounds = null;
		this.setLabelLogoSet(logos, invertedLogos, visibleBounds);
		window.Repaint();
		return true;
	}

	/**
	 * Gets the band logo path if it exists at various paths.
	 * @param {string} bandStr - The name of the band.
	 * @returns {string} The path of the band logo if it exists.
	 */
	getBandLogoPath(bandStr) {
		if (!bandStr) return '.\\georgia-reborn\\images\\logo\\无艺术家.png'; // 无艺术家标签值显示默认图标

		const testBandLogoPath = (imgDir, name) => {
			const logoPath = `${imgDir}${name}.png`;
			if (IsFile(logoPath)) {
				grm.debug.debugLog(`图标 => 找到艺术家标识: ${logoPath}`);
				return logoPath;
			}
			return '';
		};

		// 优先使用艺术家，其次专辑艺术家，均无则返回默认。 这个部份由 AI 修正
		const artist = ReplaceIllegalChars(bandStr);
		const albumArtist = ReplaceIllegalChars($('[%album artist%]'));

		const candidateList = [
			artist,
			artist.replace(Regex.TextPrefixThe, ''),
			albumArtist,
			albumArtist && albumArtist.replace(Regex.TextPrefixThe, '')
		].filter(Boolean);

		for (const candidate of candidateList) {
			const path = testBandLogoPath(grPath.artistlogos, candidate) ||     // Try 800x310 white
						 testBandLogoPath(grPath.artistlogosColor, candidate);  // Try 800x310 color
			if (path) return path;
		}

		return '.\\georgia-reborn\\images\\logo\\无艺术家图标.png'; // 无艺术家图标显示默认图标
	}
	/**
	 * Gets the band logo and its inverted version based on the current playing album artist in Details.
	 * @param {FbMetadbHandle} metadb - The metadb of the track.
	 */
	getBandLogo(metadb = undefined) {
		this.clearCache('bandLogo');
		let path;

		const artists = GetMetaValues('%artist%', metadb);
		const trackArtist = ReplaceIllegalChars($('[%track artist%]', metadb));
		const albumArtists = GetMetaValues('%album artist%', metadb);

		const artistList = [
			...artists.flatMap(artist => [
				ReplaceIllegalChars(artist), ReplaceIllegalChars(artist).replace(Regex.TextPrefixThe, '')
			]),
			trackArtist,
			...albumArtists.flatMap(artist => [
				ReplaceIllegalChars(artist), ReplaceIllegalChars(artist).replace(Regex.TextPrefixThe, '')
			])
		];
		const uniqueArtistList = [...new Set(artistList)];

		for (const artist of uniqueArtistList) {
			path = this.getBandLogoPath(artist);
			if (path) break;
		}

		if (!path) return;

		this.bandLogo = grm.artCache.getImage(path);
		if (!this.bandLogo) {
			const logo = gdi.Image(path);
			if (logo) {
				this.bandLogo = grm.artCache.encache(logo, path);
				this.bandLogoInverted = grm.artCache.encache(logo.InvertColours(), `${path}-inv`);
			}
		}

		this.bandLogoInverted = grm.artCache.getImage(`${path}-inv`);
		if (!this.bandLogoInverted && this.bandLogo) {
			this.bandLogoInverted = grm.artCache.encache(this.bandLogo.InvertColours(), `${path}-inv`);
		}
		this.bandLogoTones = this.getLogoExtremeTones(this.bandLogo);
		this.bandLogoInvertedTones = this.getLogoExtremeTones(this.bandLogoInverted);
	}

	/**
	 * Gets label logos based on current playing album artist in Details.
	 * @param {FbMetadbHandle} metadb - The metadb of the track.
	 */
	getLabelLogo(metadb) {
		const nextLabelLogo = [];
		const nextLabelLogoInverted = [];
		const nextLabelLogoVisibleBounds = [];
		const labelFields = ['label', 'publisher', 'discogs_label'];
		const labels = new Set(labelFields.flatMap(label => GetMetaValues(label, metadb)));

		let foundLogo = false;
		for (const label of labels) {
			const addLabel = this.loadLabelLogo(label);
			if (addLabel != null) {
				nextLabelLogo.push(addLabel);
				nextLabelLogoVisibleBounds.push(this.getLabelVisibleBounds(label, addLabel));
				try {
					nextLabelLogoInverted.push(addLabel.InvertColours());
				} catch (e) { nextLabelLogoInverted.push(addLabel); }
				foundLogo = true;
			}
		}

		// 如果未找到任何有效标签图标，加载默认图标
		if (!foundLogo) {
			const defaultLogo = this.loadDefaultLogo();
			if (defaultLogo) {
				nextLabelLogo.push(defaultLogo);
				nextLabelLogoVisibleBounds.push(this.getLabelVisibleBounds('', defaultLogo));
				try {
					nextLabelLogoInverted.push(defaultLogo.InvertColours());
				} catch (e) { nextLabelLogoInverted.push(defaultLogo); }
			}
		}

		// A new label set can arrive before the replacement disc is validated. Keep it atomic
		// and latest-wins, then expose it when that same disc begins its outward entry.
		if (grSet.discArtAnimation && this.discArtTrackEntryPending) {
			this.pendingLabelLogo = nextLabelLogo;
			this.pendingLabelLogoInverted = nextLabelLogoInverted;
			this.pendingLabelLogoVisibleBounds = nextLabelLogoVisibleBounds;
			return;
		}

		this.pendingLabelLogo = null;
		this.pendingLabelLogoInverted = null;
		this.pendingLabelLogoVisibleBounds = null;
		this.setLabelLogoSet(nextLabelLogo, nextLabelLogoInverted, nextLabelLogoVisibleBounds);
	}

	loadLabelLogo(publisherString) {
		if (!publisherString) return null;

		const date = new Date();
		const lastSearchYear = date.getFullYear();
		let dir = grPath.labelsBase;
		let labelStr = ReplaceIllegalChars(publisherString);

		const cleanLabelString = (str) => str
			.replace(Regex.ArtImageLabelSuffix, '')
			.replace(Regex.EdgeDotSpaceTrailing, '')
			.replace(Regex.TextDash, '-');

		const checkLabelFolders = (label) => {
			const startYear = parseInt($('$year(%date%)'));
			const baseDir = `${dir}${label}\\`;
			for (let year = startYear; year <= lastSearchYear; year++) {
				const yearFolder = `${baseDir}${year}`;
				if (IsFolder(yearFolder)) {
					grm.debug.debugLog(`图标 => 找到 ${label} 年份 ${year}文件夹.`);
					return `${yearFolder}\\`;
				}
			}
			grm.debug.debugLog(`图标 => 找到 ${label} 文件夹并使用最新图标.`);
			return baseDir;
		};

		const folderExists = (label) => IsFolder(`${dir}${label}`);
		const searchFile = (label) => `${dir}${label}.png`;

		// 优先尝试原始名称
		if (folderExists(labelStr)) {
			dir = checkLabelFolders(labelStr);
		}

		// 清理名称，尝试匹配
		const cleaned = cleanLabelString(labelStr);
		if (labelStr !== cleaned && folderExists(cleaned)) {
			dir = checkLabelFolders(cleaned);
			labelStr = cleaned;
		}

		// 尝试原始名称的PNG文件
		let labelPath = searchFile(labelStr);
		if (IsFile(labelPath)) {
			const img = gdi.Image(labelPath);
			if (img) {
				grm.debug.debugLog('图标 => 找到唱片商标:', labelPath);
				return img;
			}
		}

		// 尝试清理后名称的PNG文件
		labelPath = searchFile(cleaned);
		if (IsFile(labelPath)) {
			const img = gdi.Image(labelPath);
			if (img) {
				grm.debug.debugLog('图标 => 找到清理后唱片商标:', labelPath);
				return img;
			}
		}

		// 尝试带 "Records" 后缀（原始与清理后）
		const variants = [
			`${labelStr} Records`,
			`${cleaned} Records`
		];

		for (const variant of variants) {
			labelPath = searchFile(variant);
			if (IsFile(labelPath)) {
				const img = gdi.Image(labelPath);
				if (img) {
					grm.debug.debugLog('图标 => 找到带Records后缀的商标:', labelPath);
					return img;
				}
			}
		}

		// 尝试去 "The" 前缀（新增关键逻辑）
		const removeThe = (str) => str.replace(/^The\s+/i, '');
		const stripped = removeThe(labelStr);
		const cleanedStripped = removeThe(cleaned);

		if (stripped !== labelStr && folderExists(stripped)) {
			dir = checkLabelFolders(stripped);
			labelPath = searchFile(stripped);
			if (IsFile(labelPath)) {
				const img = gdi.Image(labelPath);
				if (img) {
					grm.debug.debugLog('图标 => 找到去The前缀的商标:', labelPath);
					return img;
				}
			}
		}

		if (cleanedStripped !== cleaned && folderExists(cleanedStripped)) {
			dir = checkLabelFolders(cleanedStripped);
			labelPath = searchFile(cleanedStripped);
			if (IsFile(labelPath)) {
				const img = gdi.Image(labelPath);
				if (img) {
					grm.debug.debugLog('图标 => 找到清理+去The的商标:', labelPath);
					return img;
				}
			}
		}

		// 最后尝试去The后的带Records变体
		const variantsStripped = [
			`${stripped} Records`,
			`${cleanedStripped} Records`
		];

		for (const variant of variantsStripped) {
			labelPath = searchFile(variant);
			if (IsFile(labelPath)) {
				const img = gdi.Image(labelPath);
				if (img) {
					grm.debug.debugLog('图标 => 找到去The+Records的商标:', labelPath);
					return img;
				}
			}
		}

		grm.debug.debugLog('图标 => 未找到任何标签图标:', publisherString);
		return null;
	}

	// 新增：加载默认图标
	loadDefaultLogo() {
		const defaultPath = `${grPath.labelsBase}默认图标.png`; // 无厂牌、发行商、唱片公司显示默认图标
		if (IsFile(defaultPath)) {
			const img = gdi.Image(defaultPath);
			if (img) {
				grm.debug.debugLog('图标 => 加载默认标签图标:', defaultPath);
				return img;
			}
		}
		grm.debug.debugLog('图标 => 默认图标文件不存在:', defaultPath);
		return null;
	}

	// #endregion

	// * PUBLIC METHODS - CALLBACKS * //
	// #region PUBLIC METHODS - CALLBACKS
	/**
	 * Checks if the mouse is within the boundaries of the metadata grid in Details.
	 * @global
	 * @param {number} x - The x-coordinate.
	 * @param {number} y - The y-coordinate.
	 * @param {string} boundary - The boundary to check ('artist', 'title', 'album', 'tagKey', 'tagValue', 'timeline', 'grid').
	 * @returns {boolean} True or false.
	 */
	mouseInMetadataGrid(x, y, boundary) {
		return this.gridSectionBounds[boundary] ? this.gridSectionBounds[boundary](x, y) : false;
	}

	/**
	 * Handles the tooltip when the mouse is in the metadata grid tooltip area.
	 * @param {number} x - The x-coordinate.
	 * @param {number} y - The y-coordinate.
	 * @param {number} m - The mouse mask.
	 */
	on_mouse_move(x, y, m) {
		this.wakeImmersiveUi();
		if (grSet.showTooltipMain || grSet.showTooltipTruncated) {
			this.handleGridTooltip(x, y);
		}
		if (grSet.showTooltipTimeline) {
			this.handleGridTimelineTooltip(x, y);
		}
	}

	/** Returns the compact immersive-toggle hit area placed immediately left of the native window controls. */
	getImmersiveButtonBounds() {
		const size = Math.max(SCALE(26), grm.ui.topMenuHeight - SCALE(10));
		return { x: grm.ui.ww - SCALE(136), y: Math.round((grm.ui.topMenuHeight - size) * 0.5), w: size, h: size };
	}

	/** Checks whether the pointer is over the compact immersive toggle. */
	mouseInImmersiveButton(x, y) {
		if (this.immersiveMode && !this.immersiveUiVisible) return false;
		const b = this.getImmersiveButtonBounds();
		const hitPadding = SCALE(6);
		return grm.ui.displayDetails && b.x - hitPadding <= x && x <= b.x + b.w + hitPadding && b.y - hitPadding <= y && y <= b.y + b.h + hitPadding;
	}

	/** Uses the same delayed tooltip as TT's maximize button. */
	updateImmersiveButtonTooltip(x, y) {
		const hovered = grSet.showTooltipMain && this.mouseInImmersiveButton(x, y);
		if (hovered) grm.ttip.showDelayed(this.immersiveMode ? '退出沉浸模式' : '进入沉浸模式');
		else if (this.immersiveButtonHovered) grm.ttip.stop();
		this.immersiveButtonHovered = hovered;
	}

	/** Own the whole click, then switch after mouse-down returns (mouse-up may be swallowed by the host caption). */
	beginImmersiveButtonClick() {
		if (this.detailsClosed) return;
		if (this.immersiveButtonHovered) grm.ttip.stop();
		this.immersiveButtonHovered = false;
		this.immersiveButtonPressed = true;
		if (this.immersiveButtonClickPending) return;
		this.immersiveButtonClickPending = true;
		this.immersiveButtonClickTimer = setTimeout(() => {
			this.immersiveButtonClickTimer = null;
			this.immersiveButtonClickPending = false;
			if (!this.detailsClosed) this.toggleImmersiveMode();
		}, 0);
	}

	/** Mouse-up is consumed but never required to begin fullscreen. */
	endImmersiveButtonClick() {
		if (!this.immersiveButtonPressed) return false;
		this.immersiveButtonPressed = false;
		return true;
	}

	/** Abandon a missing mouse-up when the next press is elsewhere in the player. */
	cancelImmersiveButtonClick() {
		this.immersiveButtonPressed = false;
	}

	/** Restore visual state when native maximize/F11 exits fullscreen outside our glyph. */
	syncImmersiveWindowState() {
		if (!this.immersiveMode || !this.immersiveWindowChanged) return;
		const atImmersiveSize = this.immersiveKeepWindowState !== null
			? UIWizard.WindowState === this.immersiveKeepWindowState
			: UIWizard.WindowState === WindowState.Fullscreen;
		if (atImmersiveSize) {
			if (!this.immersiveWindowConfirmedFullscreen) {
				this.immersiveWindowConfirmedFullscreen = true;
				clearTimeout(this.immersiveEntryMouseGuardTimer);
				this.immersiveEntryMouseGuardTimer = setTimeout(() => {
					this.immersiveEntryMouseGuardTimer = null;
					this.immersiveEntryMouseGuard = false;
				}, 450);
			}
			return;
		}
		if (!this.immersiveWindowConfirmedFullscreen) return;
		this.immersiveMode = false;
		this.immersiveWindowChanged = false; // Native control already restored; never toggle it again.
		grm.ui.clearImmersiveLyricsBlur?.();
		this.immersiveKeepWindowState = null;
		this.immersiveWindowConfirmedFullscreen = false;
		this.immersiveUiVisible = true;
		this.immersiveWakeClickPending = false;
		this.clearImmersiveEntryMouseGuard();
		this.setImmersiveCursorHidden(false);
		this.immersivePanelOpacity = 255;
		this.stopImmersiveLayoutAnimation();
		this.stopImmersivePanelFade();
		clearTimeout(this.immersiveUiTimer);
		this.immersiveUiTimer = null;
		this.restoreMaximizedAfterImmersive();
		window.Repaint();
	}

	/** Enters true foobar2000 fullscreen first, then hides the Details metadata and lower bar without touching disc-animation state. */
	toggleImmersiveMode() {
		if (this.immersiveMode) {
			this.immersiveMode = false;
			this.immersiveWindowConfirmedFullscreen = false;
			this.immersiveUiVisible = true;
			this.immersiveWakeClickPending = false;
			this.clearImmersiveEntryMouseGuard();
			this.setImmersiveCursorHidden(false);
			this.stopImmersivePanelFade();
			this.stopImmersiveLayoutAnimation();
			this.immersivePanelOpacity = 255;
			clearTimeout(this.immersiveUiTimer);
			this.immersiveUiTimer = null;
			this.setImmersiveFullscreen(false);
			this.immersiveWindowChanged = false;
			this.reflowImmersiveLayout();
			window.Repaint();
			return;
		}

		// This flag records only the native UIWizard fullscreen toggle issued by
		// immersive mode itself. UIWizard.WindowState is asynchronous during window
		// transitions and must not decide whether the next click enters fullscreen.
		this.immersiveMode = true;
		this.immersiveUiVisible = false;
		this.immersiveWakeClickPending = false;
		this.armImmersiveEntryMouseGuard();
		this.setImmersiveCursorHidden(true);
		this.stopImmersivePanelFade();
		this.immersivePanelOpacity = 0;
		clearTimeout(this.immersiveUiTimer);
		this.immersiveUiTimer = null;
		// Set the scene state before the native resize callback runs so that
		// on_size() does not rebuild panels and waveform invisible in fullscreen.
		this.immersiveWindowChanged = this.setImmersiveFullscreen(true);
		if (!this.immersiveWindowChanged) {
			this.immersiveMode = false;
			this.immersiveWindowConfirmedFullscreen = false;
			this.immersiveUiVisible = true;
			this.clearImmersiveEntryMouseGuard();
			this.setImmersiveCursorHidden(false);
			this.immersivePanelOpacity = 255;
			window.Repaint();
			return;
		}
		// A maximized window does not produce on_size() when entering immersion.
		// Move the cover/disc in the existing window and redraw the pure canvas.
		if (this.immersiveKeepWindowState !== null) {
			grm.ui.prepareImmersiveLyricsBlur();
			this.reflowImmersiveLayout();
		}
		// WindowState can settle after ToggleFullscreen returns. Confirm it once
		// before allowing an external restore to clear the immersive state.
		clearTimeout(this.immersiveWindowSyncTimer);
		this.immersiveWindowSyncTimer = setTimeout(() => {
			this.immersiveWindowSyncTimer = null;
			if (this.immersiveMode) this.syncImmersiveWindowState();
		}, 120);
		window.Repaint();
	}

	/**
	 * Keep the host's existing full-size state: TT's maximize button can set
	 * Fullscreen rather than Maximized. ToggleFullscreen in either state would
	 * restore the saved Normal window geometry.
	 * @param {boolean} enter - True to enter fullscreen, false to restore it.
	 */
	setImmersiveFullscreen(enter) {
		if (!enter) grm.ui.clearImmersiveLyricsBlur?.();
		if (!enter && !this.immersiveWindowChanged) return;
		try {
			if (enter && (UIWizard.WindowState === WindowState.Maximized ||
				UIWizard.WindowState === WindowState.Fullscreen)) {
				this.immersiveKeepWindowState = UIWizard.WindowState;
				this.immersiveReturnToMaximized = false;
				return true;
			}
			if (!enter && this.immersiveKeepWindowState !== null) {
				this.immersiveKeepWindowState = null;
				return true;
			}
			if (typeof UIWizard.ToggleFullscreen !== 'function') return false;
			if (enter) UIWizard.ToggleFullscreen();
			else {
				clearInterval(this.immersiveFullscreenEntryTimer);
				this.immersiveFullscreenEntryTimer = null;
				if (UIWizard.WindowState === WindowState.Fullscreen) {
					if (typeof UIWizard.ExitFullscreen === 'function') UIWizard.ExitFullscreen();
					else UIWizard.ToggleFullscreen();
				}
				this.restoreMaximizedAfterImmersive();
			}
			return true;
		} catch (error) {
			return false;
		}
	}

	/** Restores the prior maximized size after native fullscreen has fully exited. */
	restoreMaximizedAfterImmersive() {
		if (!this.immersiveReturnToMaximized || this.immersiveRestoreMaximizeTimer) return;
		let checks = 0;
		let restoreIssued = false;
		this.immersiveRestoreMaximizeTimer = setInterval(() => {
			const state = UIWizard.WindowState;
			if (state === WindowState.Maximized || ++checks >= 60) {
				clearInterval(this.immersiveRestoreMaximizeTimer);
				this.immersiveRestoreMaximizeTimer = null;
				this.immersiveReturnToMaximized = false;
			} else if (state === WindowState.Normal && !restoreIssued && typeof UIWizard.ToggleMaximize === 'function') {
				restoreIssued = true;
				UIWizard.ToggleMaximize();
			}
		}, 25);
	}

	/** Starts the entry guard before the host changes the fullscreen window geometry. */
	armImmersiveEntryMouseGuard() {
		clearTimeout(this.immersiveEntryMouseGuardTimer);
		this.immersiveEntryMouseGuardTimer = null;
		this.immersiveEntryMouseGuard = true;
	}

	/** Clears the fullscreen-entry pointer guard and its pending settle timer. */
	clearImmersiveEntryMouseGuard() {
		clearTimeout(this.immersiveEntryMouseGuardTimer);
		this.immersiveEntryMouseGuardTimer = null;
		this.immersiveEntryMouseGuard = false;
	}

	/** Keeps the pointer synchronized with the pure or interactive immersive scene. */
	setImmersiveCursorHidden(hidden) {
		SetCursor(hidden ? 'Hide' : 'Arrow');
	}

	/** Restores the host window before foobar2000 persists its shutdown geometry. */
	restoreImmersiveWindowForShutdown() {
		if (!this.immersiveMode || !this.immersiveWindowChanged) return false;
		this.immersiveMode = false;
		this.immersiveUiVisible = true;
		this.immersiveWindowConfirmedFullscreen = false;
		this.immersiveWakeClickPending = false;
		this.clearImmersiveEntryMouseGuard();
		this.setImmersiveCursorHidden(false);
		this.stopImmersiveLayoutAnimation();
		this.stopImmersivePanelFade();
		clearTimeout(this.immersiveUiTimer);
		this.immersiveUiTimer = null;

		const toggled = this.setImmersiveFullscreen(false);
		this.immersiveWindowChanged = false;
		return toggled;
	}

	/** Handles the theme Close button and waits briefly for fullscreen restoration before exiting. */
	exitPlayerFromImmersive() {
		if (this.immersiveExitPending) return;
		this.immersiveExitPending = true;
		const restoring = this.restoreImmersiveWindowForShutdown();
		if (!restoring) {
			fb.Exit();
			return;
		}

		let checks = 0;
		clearInterval(this.immersiveExitPollTimer);
		this.immersiveExitPollTimer = setInterval(() => {
			checks++;
			if (UIWizard.WindowState !== WindowState.Fullscreen && !this.immersiveRestoreMaximizeTimer || checks >= 60) {
				clearInterval(this.immersiveExitPollTimer);
				this.immersiveExitPollTimer = null;
				fb.Exit();
			}
		}, 25);
	}

	/** Repositions the cover/disc with an interruptible shared-element transition. */
	reflowImmersiveLayout(animate = true) {
		if (!grm.ui.albumArt || !grm.ui.albumArtSize) return;
		this.stopImmersiveLayoutAnimation();

		const startAlbum = { x: grm.ui.albumArtSize.x, y: grm.ui.albumArtSize.y };
		const startDisc = this.discArt ? { x: this.discArtSize.x, y: this.discArtSize.y } : null;
		grm.ui.setAlbumArtPosition();
		// Cover reflow on mouse wake does not invoke on_size(): move its lyrics too.
		if (this.isLyricsVisible() && grm.lyrics) grm.lyrics.setLyricsPosition();
		if (this.discArt) this.setDiscArtPosition(true);
		const targetAlbum = { x: grm.ui.albumArtSize.x, y: grm.ui.albumArtSize.y };
		const targetDisc = this.discArt ? { x: this.discArtSize.x, y: this.discArtSize.y } : null;

		const distance = Math.max(Math.abs(targetAlbum.x - startAlbum.x), Math.abs(targetAlbum.y - startAlbum.y));
		if (!animate || distance < 1 || this.isDiscArtTransitionActive()) {
			this.invalidateLabelLogoLayout();
			window.Repaint();
			return;
		}

		grm.ui.albumArtSize.x = startAlbum.x;
		grm.ui.albumArtSize.y = startAlbum.y;
		if (this.isLyricsVisible() && grm.lyrics) grm.lyrics.setLyricsPosition();
		if (this.discArt && startDisc) {
			this.discArtSize.x = startDisc.x;
			this.discArtSize.y = startDisc.y;
		}
		// The cached shadow contains the disc's settled screen-space X coordinate.
		// Drop it before moving and rebuild it once the new position is final.
		this.clearDiscArtTransitionShadow();

		const started = grAnimationManager.now();
		this.immersiveLayoutTimer = grAnimationManager.add(now => {
			const progress = Math.min(1, (now - started) / this.immersiveLayoutDuration);
			// Smootherstep keeps both ends quiet while the middle remains visibly progressive.
			const eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
			grm.ui.albumArtSize.x = Math.round(startAlbum.x + (targetAlbum.x - startAlbum.x) * eased);
			grm.ui.albumArtSize.y = Math.round(startAlbum.y + (targetAlbum.y - startAlbum.y) * eased);
			if (this.isLyricsVisible() && grm.lyrics) grm.lyrics.setLyricsPosition();

			if (this.discArt && targetDisc) {
				const positions = this.getDiscArtSlidePositions();
				const shouldShow = fb.IsPlaying && positions.ratio > 0;
				this.discArtSize.x = shouldShow ? positions.targetX : positions.hiddenX;
				this.discArtSize.y = Math.round(startDisc.y + (targetDisc.y - startDisc.y) * eased);
				this.discArtSlideVisible = shouldShow;
				this.discArtSlideTargetX = this.discArtSize.x;
				this.discArtFrontHidden = grSet.discArtOnTop && !shouldShow;
			}

			window.Repaint();
			if (progress >= 1) {
				this.stopImmersiveLayoutAnimation();
				grm.ui.albumArtSize.x = targetAlbum.x;
				grm.ui.albumArtSize.y = targetAlbum.y;
				if (this.isLyricsVisible() && grm.lyrics) grm.lyrics.setLyricsPosition();
				if (this.discArt && targetDisc) {
					this.discArtSize.x = targetDisc.x;
					this.discArtSize.y = targetDisc.y;
					this.discArtSlideTargetX = targetDisc.x;
					this.setDiscArtShadow();
				}
				this.invalidateLabelLogoLayout();
				window.Repaint();
			}
		}, Math.max(16, Math.min(30, grSet.spinDiscArtRedrawInterval)));
	}

	/** Cancels the layout transition at its current visual position. */
	stopImmersiveLayoutAnimation() {
		if (!this.immersiveLayoutTimer) return;
		grAnimationManager.remove(this.immersiveLayoutTimer);
		this.immersiveLayoutTimer = null;
	}

	/** Restores the complete Details interface on mouse activity. */
	wakeImmersiveUi(force = false) {
		if (!this.immersiveMode) return;
		if (this.immersiveEntryMouseGuard && !force) {
			this.setImmersiveCursorHidden(true);
			return;
		}
		const wasHidden = !this.immersiveUiVisible;
		this.immersiveUiVisible = true;
		this.setImmersiveCursorHidden(false);
		this.immersivePanelOpacity = 255;
		this.scheduleImmersiveUiHide();
		if (wasHidden) {
			this.reflowImmersiveLayout();
			window.Repaint();
		}
	}

	/** Starts or restarts the independent immersive idle timer. */
	scheduleImmersiveUiHide(delay = this.immersiveUiDelay) {
		if (!this.immersiveMode) return;
		clearTimeout(this.immersiveUiTimer);
		this.immersiveUiTimer = setTimeout(() => {
			this.immersiveUiTimer = null;
			if (!this.immersiveMode || !this.immersiveUiVisible) return;
			this.immersiveUiVisible = false;
			this.setImmersiveCursorHidden(true);
			this.immersivePanelOpacity = 0;
			this.reflowImmersiveLayout();
			window.Repaint();
		}, delay);
	}

	/** Smoothly adjusts only the left Details backdrop; the cover and disc are never redrawn through this animation. */
	fadeImmersivePanelTo(targetOpacity, duration) {
		this.stopImmersivePanelFade();
		const startOpacity = this.immersivePanelOpacity;
		const started = grAnimationManager.now();
		this.immersivePanelFadeTimer = grAnimationManager.add(now => {
			const progress = Math.min(1, (now - started) / duration);
			this.immersivePanelOpacity = Math.round(startOpacity + (targetOpacity - startOpacity) * (progress * progress * (3 - 2 * progress)));
			window.Repaint();
			if (progress >= 1) this.stopImmersivePanelFade();
		}, 16);
	}

	/** Cancels the independent left-panel fade timer. */
	stopImmersivePanelFade() {
		if (!this.immersivePanelFadeTimer) return;
		grAnimationManager.remove(this.immersivePanelFadeTimer);
		this.immersivePanelFadeTimer = null;
	}
	// #endregion
}
