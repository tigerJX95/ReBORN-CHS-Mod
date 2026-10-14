'use strict';

class LibImages {
	constructor() {
		this.accessed = 0;
		this.asyncBypass = 0;
		this.blockWidth = 150;
		this.cachePath = grSet.customLibraryDir ? $(`${grCfg.customLibraryDir}library-tree-cache-rebase-20260930\\`, undefined, true) : `${fb.ProfilePath}cache\\library\\library-tree-cache-rebase-20260930\\`;
		this.cellWidth = 200;
		this.column = 0;
		this.columnWidth = 150;
		this.database = this.newDatabase();
		this.end = 1;
		this.groupField = '';
		this.items = [];
		this.overlayHeight = 0;
		this.panel = {};
		this.preLoadItems = [];
		this.rootNo = 4;
		this.saveSize = 250;
		this.shadow = null;
		this.shadowStub = null;
		this.start = 0;
		this.toSave = [];
		this.zooming = false;

		this.bor = {
			bot: 6,
			cov: 16,
			pad: 10,
			side: 2
		};

		this.box = {
			h: 100,
			w: 100
		};

		this.cache = {};

		this.cachesize = {
			min: 20
		};

		this.stub = {
			noImg: null,
			root: null
		};

		this.style = {
			image: 0,
			rootComposite: libSet.rootNode && libSet.curRootImg == 3,
			vertical: !(libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' && grSet.libraryLayout === 'full') ? true : lib.ui.h - lib.panel.search.h > lib.ui.w - lib.ui.sbar.w,
			y: 25
		};

		this.im = {
			offset: 0,
			y: 0,
			w: 120
		};

		this.interval = {
			cache: 1,
			preLoad: 7
		};

		this.labels = { statistics: libSet.itemShowStatistics ? 1 : 0 }

		this.letter = {
			albumArtYearAuto: libSet.albumArtYearAuto,
			no: 1,
			show: libSet.albumArtLetter,
			w: 0
		};

		this.mask = {
			fade: null,
			circular: null
		};

		this.row = {
			h: 80
		};

		this.text = {
			x: 0,
			y1: 0,
			y2: 0,
			h: 20,
			w: 20
		};

		this.timer = {
			load: null,
			preLoad: null,
			save: null
		};

		this.drawDebounce = $Lib.debounce(() => {
			if (this.isImageViewVisible()) lib.panel.treePaint();
		}, 500);

		this.loadThrottle = $Lib.throttle(() => {
			if (!lib.panel.imgView) return;
			this.getImages();
		}, 40);

		this.rootDebounce = $Lib.debounce(() => {
			this.checkRootImg();
		}, 250, {
			leading: true,
			trailing: true
		});

		this.sizeDebounce = $Lib.debounce(() => {
			if (!lib.panel.imgView) return;
			this.clearCache();
			this.metrics();
			if (lib.sbar.scroll > lib.sbar.max_scroll) lib.sbar.checkScroll(lib.sbar.max_scroll);
		}, 100);

		this.setRoot();
		this.setNoArtist();
		this.setNoCover();
	}

	// * METHODS * //

	/** Real decoder credits survive cache resets; old native work cannot be cancelled. */
	acquireImageSlot(epoch = this.imageEpoch || 0) {
		if (!this.imageWaiters) this.imageWaiters = [];
		if (this.imagesClosed || epoch !== (this.imageEpoch || 0)) return Promise.resolve(null);
		return new Promise(resolve => {
			if ((this.nativeImageActive || 0) < this.getImageConcurrency()) this.grantImageSlot(resolve);
			else if (this.imageWaiters.length < 32) this.imageWaiters.push({ epoch, resolve });
			else resolve(null);
		});
	}

	grantImageSlot(resolve) {
		this.nativeImageActive = (this.nativeImageActive || 0) + 1;
		this.nativeImagePeak = Math.max(this.nativeImagePeak || 0, this.nativeImageActive);
		let released = false;
		resolve(() => {
			if (released) return;
			released = true; this.nativeImageActive--;
			while (this.imageWaiters?.length && this.nativeImageActive < this.getImageConcurrency()) {
				const next = this.imageWaiters.shift();
				if (!this.isImageViewVisible() || next.epoch !== (this.imageEpoch || 0)) next.resolve(null);
				else this.grantImageSlot(next.resolve);
			}
		});
	}

	getImageConcurrency() {
		return typeof grAnimationManager !== 'undefined' && grAnimationManager.paintPressure >= 80 ? 1 : 3;
	}

	isImageViewVisible() {
		return !this.imagesClosed && window.IsVisible !== false && lib.panel.imgView &&
			(typeof grm === 'undefined' || !grm.ui || grm.ui.displayLibrary);
	}

	/** A native-pixel budget independent of host JS heap statistics. */
	trimWorkingImages() {
		const entries = Object.entries(this.cache);
		let pixels = entries.reduce((sum, [, o]) => sum + (o.img?.Width ? o.img.Width * o.img.Height : 0), 0);
		const visible = new Set();
		for (let i = this.start; i < this.end; i++) if (lib.pop.tree[i]) visible.add(lib.pop.tree[i].key);
		if (lib.pop.tree[0]) visible.add(lib.pop.tree[0].key);
		entries.sort((a, b) => (a[1].accessed || 0) - (b[1].accessed || 0));
		let count = entries.length;
		for (const [key, o] of entries) {
			if (count <= 96 && pixels <= 8000000) break;
			if (visible.has(key) || o.img === 'called') continue;
			pixels -= o.img?.Width ? o.img.Width * o.img.Height : 0;
			delete this.cache[key]; count--;
		}
	}

	async get_album_art_async(handle, art_id, key, ix) {
		const epoch = this.imageEpoch || 0, release = await this.acquireImageSlot(epoch);
		if (!release) { if (epoch === (this.imageEpoch || 0) && this.cache[key]?.img === 'called') delete this.cache[key]; return; }
		try {
			if (epoch !== (this.imageEpoch || 0) || !this.isImageViewVisible()) { if (epoch === (this.imageEpoch || 0)) delete this.cache[key]; return; }
			const result = await utils.GetAlbumArtAsyncV2(0, handle, art_id, false);
			const o = this.cache[key];
			if (!this.imagesClosed && epoch === (this.imageEpoch || 0) && art_id === libSet.artId && o?.img === 'called')
				this.cacheIt(result.image, key, ix, result.path ? `${libMD5.hashStr(result.path)}.jpg` : undefined);
		} catch (e) { if (epoch === (this.imageEpoch || 0)) delete this.cache[key]; }
		finally { release(); }
	}

	async load_image_async(key, image_path, ix, rawCache) {
		const epoch = this.imageEpoch || 0, release = await this.acquireImageSlot(epoch);
		if (!release) { if (epoch === (this.imageEpoch || 0) && this.cache[key]?.img === 'called') delete this.cache[key]; return; }
		try {
			if (epoch !== (this.imageEpoch || 0) || !this.isImageViewVisible()) { if (epoch === (this.imageEpoch || 0)) delete this.cache[key]; return; }
			const image = await gdi.LoadImageAsyncV2(0, image_path);
			const o = this.cache[key];
			if (!this.imagesClosed && epoch === (this.imageEpoch || 0) && o?.img === 'called') !rawCache ? this.cacheIt(image, key, ix) : this.cacheItPreLoad(image, key, ix);
		} catch (e) { if (epoch === (this.imageEpoch || 0)) delete this.cache[key]; }
		finally { release(); }
	}

	cacheIt(image, key, ix, saveName) {
		try {
			if (!image) {
				if (this.style.rootComposite && ix < this.rootNo) this.rootDebounce();
				if (this.albumArtDiskCache && !this.database[key]) {
					this.toSave.unshift({
						key,
						image: null,
						folder: this.cacheFolder,
						saveName: 'noAlbumArt',
						setKeyOnly: true
					});
					this.trimSaveQueue();
				}
			}
			if (image) {
				if (this.albumArtDiskCache && saveName) {
					if (!this.database[key] && $Lib.file(this.cacheFolder + saveName)) {
						this.toSave.unshift({
							key,
							image: null,
							folder: this.cacheFolder,
							saveName,
							setKeyOnly: true
						});
					}
					if (!this.database[key] || !$Lib.file(this.cacheFolder + saveName)) {
						image = this.format(image, 1, 'default', this.saveSize, this.saveSize, false, 'save');
						this.toSave.unshift({
							key,
							image: image.Clone(0, 0, image.Width, image.Height),
							folder: this.cacheFolder,
							saveName,
							setKeyOnly: false
						});
					}
				}

				this.checkCache();
				this.format(image, libSet.artId, ['default', 'crop', 'circular'][this.style.image], this.im.w, this.im.w, libSet.albumArtLabelType == 3, 'display', ix, key);
				this.trimWorkingImages();
				this.trimSaveQueue();
				if (this.style.rootComposite && ix < this.rootNo) this.rootDebounce();
			}

			if (!this.timer.save && this.toSave.length) {
				this.timer.save = setInterval(() => this.saveNextImage(), 1000);
			}
		}
		catch (e) {
			$Lib.trace(`unable to load thumbnail image: ${key}`);
		}
		this.drawDebounce();
	}

	cacheItPreLoad(image, key, ix) {
		try {
			if (image) {
				this.checkCache();
				this.format(image, libSet.artId, ['default', 'crop', 'circular'][this.style.image], this.im.w, this.im.w, libSet.albumArtLabelType == 3, 'displayPreload', ix, key);
				this.trimWorkingImages();
			}
			if (this.style.rootComposite && ix < this.rootNo) this.rootDebounce();
		} catch (e) {
			$Lib.trace(`unable to load thumbnail image: ${key}`);
		}
		lib.panel.treePaint();
	}

	checkCache() {
		if (!this.memoryLimit()) return;
		const ln = this.columns * lib.panel.rows * 3;
		if (this.toSave.length > ln) this.toSave.length = ln;
		this.preLoadItems = [];
		clearInterval(this.timer.preLoad);
		this.timer.preLoad = null;
		this.items = [];
		clearInterval(this.timer.load);
		this.timer.load = null;
		let keys = Object.keys(this.cache);
		const cacheLength = keys.length;
		if (lib.pop.tree.length) {
			const o = this.cache[lib.pop.tree[0].key];
			if (o) o.accessed = Infinity;
		}
		this.cache = this.sortCache(this.cache, 'accessed');
		keys = Object.keys(this.cache);
		const numToRemove = Math.round((cacheLength - this.cachesize.min) / 2);
		if (numToRemove > 0) {
			for (let i = 0; i < numToRemove; i++) this.trimCache(keys[i]);
		}
	}

	checkNowPlaying(item) {
		if (!libSet.highLightNowplaying) return false;
		return !item.root && lib.pop.inRange(lib.pop.nowp, item.item);
	}

	checkRootImg() {
		const key = lib.pop.tree.length ? lib.pop.tree[0].key : null;
		if (!key) return;
		let o = this.cache[key];
		const imgsAvailable = Math.min(Math.round((this.panel.h + this.row.h) / this.row.h) * this.columns, lib.pop.tree.length) - 1;
		const n = Math.max(Math.min(Math.floor(Math.sqrt(imgsAvailable)), 4), 2);
		const cells = Math.pow(n, 2);
		this.rootNo = n * n + 1;
		if (!o) {
			this.cache[key] = {
				img: 'called',
				accessed: ++this.accessed
			};
		}
		o = this.cache[key];
		o.img = $Lib.gr(this.cellWidth * n, this.cellWidth * n, true, g => this.createCollage(g, this.cellWidth, this.cellWidth, n, n, cells));
		if (o.img) {
			if (this.style.image == 2) this.circularMask(o.img, o.img.Width, o.img.Height);
			const fullFlow = libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' && grSet.libraryLayout === 'full' && !this.style.vertical;
			const rootSize = fullFlow ? Math.min(640, this.im.w) : this.im.w;
			o.img = o.img.Resize(rootSize, rootSize, 7);
			if (libSet.albumArtLabelType == 3) this.fadeMask(o.img, o.img.Width, o.img.Height);
		}
		lib.panel.treePaint();
	}

	checkTooltip(gr, item, x, y1, y2, y3, w, tt1, tt2, tt3, font1, font2, font3) {
		if (lib.panel.colMarker) {
			if (tt1) tt1 = tt1.replace(Regex.LibMarkerColor, '');
			if (tt2) tt2 = tt2.replace(Regex.LibMarkerColor, '');
		}
		let text = tt1 || '';
		if (tt2 && (lib.panel.lines == 2 || lib.panel.lines == 1 && this.labels.statistics)) text += `\n${tt2}`;
		if (tt3 && this.labels.statistics) text += `\n${tt3}`;
		item.tt = {
			text,
			x,
			y1,
			y2,
			y3,
			w,
			1: tt1 ? gr.CalcTextWidth(tt1, font1) > w ? tt1 : false : false,
			2: tt2 ? gr.CalcTextWidth(tt2, font2) > w ? tt2 : false : false,
			3: tt3 ? gr.CalcTextWidth(tt3, font3) > w ? tt3 : false : false
		};
	}

	circularMask(image, w, h) {
		image.ApplyMask(this.mask.circular.Resize(w, h));
	}

	clearCache() {
		this.imageEpoch = (this.imageEpoch || 0) + 1;
		for (const waiter of this.imageWaiters || []) waiter.resolve(null);
		this.imageWaiters = [];
		clearInterval(this.timer.load); clearInterval(this.timer.preLoad);
		this.timer.load = this.timer.preLoad = null;
		this.accessed = 0;
		this.cache = {};
		this.jewelCaseCache = [];
		this.flowPerspectiveCache = [];
		this.flowLoads = new Map();
		this.flowLastImages = new Map();
		clearTimeout(this.flowRetryTimer);
		this.flowRetryTimer = null;
		this.cachesize = {
			min: 20
		};
		this.items = [];
	}

	createCollage(g, cellWidth, cellHeight, rows, columns, cells) {
		let x = 0;
		let y = 0;
		for (let row = 0; row < rows; row++) {
			for (let column = 0; column < columns; column++) {
				const idx = column + row * columns + 1;
				if (idx <= cells) {
					let img = lib.pop.tree.length && lib.pop.tree[idx] ? this.getRootImg(lib.pop.tree[idx].key) : null;
					if (!img) img = this.stub.noImg;
					if (img) {
						let cx = 0;
						let cy = 0;
						let cw = img.Width;
						let ch = img.Height;
						if (libSet.albumArtLabelType == 3) {
							if (this.style.image != 2) {
								ch -= this.overlayHeight;
							} else {
								cx = cw * 0.1;
								cy = ch * 0.1;
								cw *= 0.8;
								ch = (ch - this.overlayHeight) * 0.8;
							}
						} else if (this.style.image == 2) {
							cx = cw * 0.1;
							cy = ch * 0.1;
							cw *= 0.8;
							ch *= 0.8;
						}
						img = img.Clone(cx, cy, cw, ch);
						img = this.format(img, libSet.artId, 'crop', this.cellWidth, this.cellWidth, false, 'root');
						g.DrawImage(img, x, y, img.Width, img.Height, 0, 0, img.Width, img.Height);
					}
					x += cellWidth;
				}
			}
			x = 0;
			y += cellHeight;
		}
		x = 0;
		y = 0;
		for (let column = 0; column < columns; column++) {
			x += cellWidth;
			if (this.style.image != 2) g.DrawLine(x, 0, x, cellWidth * columns, lib.ui.l.w, lib.ui.col.rootBlend);
		}
		x = 0;
		y = 0;
		for (let row = 0; row < rows; row++) {
			y += cellHeight;
			if (this.style.image != 2) g.DrawLine(x, y, cellWidth * columns, y, lib.ui.l.w, lib.ui.col.rootBlend);
		}
		if (this.style.image != 2) g.DrawRect(0, 0, cellWidth * columns - 1, cellWidth * columns - 1, 1, lib.ui.col.rootBlend);
	}

	createImages() {
		this.mask.circular = $Lib.gr(500, 500, true, g => {
			g.FillSolidRect(0, 0, 500, 500, RGB(255, 255, 255));
			g.SetSmoothingMode(2);
			g.FillEllipse(1, 1, 498, 498, RGBA(0, 0, 0, 255));
			g.SetSmoothingMode(0);
		});
		this.mask.fade = $Lib.gr(500, 500, true, g => {
			g.FillSolidRect(0, 0, 500, 500, RGB(220, 220, 220));
		});
	}

	draw(gr) {
		if (!lib.panel.imgView) return;
		// IMAGE PIPELINE REBASE: use the original discovery/loader on every paint.
		if ((libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' && grSet.libraryLayout === 'full') && !this.style.vertical) {
			this.getItemsToDraw();
			this.drawFlow3D(gr);
			lib.ui.drawTopBarUnderlay(gr);
			return;
		}
		let box_x;
		let box_y;
		let iw;
		let ih;
		this.getItemsToDraw();
		this.column = 0;
		for (let i = this.start; i < this.end; i++) {
			const row = this.style.vertical ? Math.floor(i / this.columns) : 0;
			box_x = this.style.vertical ? Math.floor(lib.ui.x + this.panel.x + this.column * this.columnWidth + this.bor.side) : Math.floor(lib.ui.x + this.panel.x + i * this.columnWidth + this.bor.side - lib.sbar.delta + ((libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' && grSet.libraryLayout === 'full') ? SCALE(18) : 0));
			box_y = this.style.vertical ? Math.floor(lib.ui.y + this.panel.y + row * this.row.h - lib.sbar.delta) : lib.ui.y + this.style.y;
			if (box_y >= 0 - this.row.h && box_y < this.panel.y + this.panel.h) {
				const item = lib.pop.tree[i];
				lib.pop.getItemCount(item);
				const grp = item.grp;
				const lot = item.lot;
				const statistics = this.labels.statistics ? (!item.root && this.labels.counts ? item.count + (item.count && item._statistics ? ' | ' : '') : '') + item._statistics : '';
				const cur_img = !this.zooming ? this.getImg(item.key) : null;
				const nowp = this.checkNowPlaying(item);
				// const grpCol = this.getGrpCol(item, nowp, lib.pop.highlight.text && i == lib.pop.m.i);
				// const lotCol = this.getLotCol(item, nowp, lib.pop.highlight.text && i == lib.pop.m.i);
				const coversRightBottom = ['coversLabelsRight', 'coversLabelsBottom'].includes(grSet.libraryDesign) || libSet.albumArtLabelType === 2;
				const updatedNowpBg = pl.col.header_nowplaying_bg !== null; // * Wait until nowplaying bg has a new color to prevent flashing
				const colNowPlaying = grSet.libraryBgImg ? RGBtoRGBA(lib.ui.col.nowPlayingBg, grSet.libraryBgRowOpacity) : lib.ui.col.nowPlayingBg;
				const colRowStripes = grSet.libraryBgImg ? RGBtoRGBA(lib.ui.col.rowStripes, grSet.libraryBgRowOpacity) : lib.ui.col.rowStripes;

				this.drawSelBg(gr, cur_img, box_x, box_y, i, nowp);

				// * Now playing bg for labels overlay mode ( album art )
				if (this.labels.overlay && !item.root && lib.pop.inRange(lib.pop.nowp, item.item) && updatedNowpBg) {
					gr.FillSolidRect(box_x, box_y, this.box.w, this.box.h, colNowPlaying);
				}
				// * Now playing bg selection with now playing deactivated ( album art )
				if (item.sel && libSet.albumArtShow && !coversRightBottom && updatedNowpBg) {
					gr.FillSolidRect(box_x, box_y, this.box.w, this.box.h, colNowPlaying);
				}
				// * Now playing bg selection with now playing deactivated
				if (!lib.pop.highlight.nowPlaying && item.sel && coversRightBottom && updatedNowpBg) {
					gr.FillSolidRect(lib.ui.x, box_y, lib.sbar.w ? lib.ui.w - SCALE(42) : lib.ui.w, this.box.h, colNowPlaying);
					gr.FillSolidRect(lib.ui.x, box_y, lib.ui.sz.sideMarker, this.box.h, lib.ui.col.sideMarker);
				}
				// * Marker selection with now playing active
				if (lib.pop.highlight.nowPlaying && item.sel && grSet.libraryDesign !== 'flowMode') {
					gr.DrawRect(lib.ui.x, box_y, lib.sbar.w ? lib.ui.w - SCALE(42) - 1 : lib.ui.w, this.box.h, 1, lib.ui.col.selectionFrame);
					gr.FillSolidRect(lib.ui.x, box_y, lib.ui.sz.sideMarker, this.box.h + 1, lib.ui.col.sideMarker);
				}
				// * Hide DrawRect gaps when all songs are completely selected and mask lines when selecting now playing
				if ((['white', 'black', 'cream'].includes(grSet.theme) && !grSet.styleBlackAndWhite2) && (lib.pop.highlight.nowPlaying && item.sel && !item.root && lib.pop.inRange(lib.pop.nowp, item.item) && coversRightBottom) && updatedNowpBg) {
					gr.DrawRect(lib.ui.x, box_y, lib.pop.fullLineSelection ? lib.sbar.w ? lib.ui.w - SCALE(42) : lib.ui.w : lib.ui.w + lib.ui.sz.margin + box_x - lib.ui.x - lib.ui.sz.sideMarker, this.box.h, 1, lib.ui.col.nowPlayingBg);
				}

				this.im.y = this.labels.overlay ? this.im.offset + box_y + libSet.thumbNailGapCompact / 2 : this.im.offset + box_y;
				if (lib.pop.rowStripes && this.labels.right) {
					if (i % 2 == 0) gr.FillSolidRect(0, box_y + 1, lib.panel.tree.stripe.w, this.row.h, colRowStripes /*ui.col.bg1*/);
					else gr.FillSolidRect(0, box_y, lib.panel.tree.stripe.w, this.row.h, lib.ui.col.bg2);
				}
				let x1 = 0;
				const x2 = Math.round(box_x + (this.bor.cov) / 2);
				let y1 = 0;
				let y2 = this.im.y + 2 + this.im.w - this.overlayHeight;
				if (cur_img) {
					iw = cur_img.Width;
					ih = cur_img.Height;
					x1 = box_x + Math.round((this.box.w - iw) / 2);
					y1 = this.im.y + 1 + this.im.w - ih;
					const w = iw;
					const h = ih;
					if (this.style.dropShadow && this.shadow) {
						if (this.style.image) {
							gr.DrawImage(this.shadow, x1, y1, this.shadow.Width, this.shadow.Height, 0, 0, this.shadow.Width, this.shadow.Height);
						} else {
							gr.DrawImage(this.shadow, x1, y1, Math.ceil(w * 1.15), Math.ceil(h * 1.15), 0, 0, this.shadow.Width, this.shadow.Height);
						}
					} else if (this.style.dropGrad) {
						if (this.style.image != 2) {
							FillGradRect(gr, x1 + w, y1, 4 * $Lib.scale, h,  0, RGBA(0, 0, 0, 56), 0);
							FillGradRect(gr, x1, y1 + h, w, 4 * $Lib.scale, 90, RGBA(0, 0, 0, 56), 0);
						} else {
							gr.SetSmoothingMode(4);
							gr.DrawEllipse(x1, y1, iw, ih, 4 * $Lib.scale, RGBA(0, 0, 0, 32));
							gr.SetSmoothingMode(0);
						}
					}

					this.drawThumbnailImage(gr, cur_img, x1, y1);

					if (this.labels.overlayDark) {
						if (item.sel || nowp) gr.FillSolidRect(x2, y2, this.im.w, this.overlayHeight, RGBA(150, 150, 150, 150));
						gr.FillSolidRect(x2, y2, this.im.w, this.overlayHeight, this.getSelBgCol(item, nowp));
					}
					if (grSet.libraryThumbnailBorder !== 'none' && (!item.sel || !this.labels.overlay || this.style.image != 2)) {
						if (this.style.image != 2) gr.DrawRect(x1, y1, iw - 1, ih - 1, 1, lib.ui.col.imgBor);
						else {
							gr.SetSmoothingMode(2);
							gr.DrawEllipse(x1, y1, iw - 1, ih - 1, 1, lib.ui.col.imgBor);
							gr.SetSmoothingMode(0);
						}
					}
					gr.SetSmoothingMode(0);
				}
				else {
					iw = this.im.w;
					ih = this.im.w;
					x1 = box_x + Math.round((this.box.w - iw) / 2);
					y1 = this.im.y + 2 + iw - ih;
					if (!item.root) {
						if (this.style.dropShadowStub && this.shadowStub) {
							gr.DrawImage(this.shadowStub, x1, y1, this.shadowStub.Width, this.shadowStub.Height, 0, 0, this.shadowStub.Width, this.shadowStub.Height);
						} else if (this.style.dropGradStub) {
							if (this.style.image != 2) {
								FillGradRect(gr, x1 + iw - 2 * $Lib.scale, y1, 6 * $Lib.scale, ih,  0, RGBA(0, 0, 0, 56), 0);
								FillGradRect(gr, x1, y1 + ih - 2 * $Lib.scale, iw, 6 * $Lib.scale, 90, RGBA(0, 0, 0, 56), 0);
							} else {
								gr.SetSmoothingMode(2);
								gr.DrawEllipse(x1, y1, iw, ih, 4 * $Lib.scale, RGBA(0, 0, 0, 32));
								gr.SetSmoothingMode(0);
							}
						}
						this.stub.noImg && gr.DrawImage(this.stub.noImg, x1, y1, iw, ih, 0, 0, iw, ih);
					}
					else if (!this.style.rootComposite && this.stub.root) gr.DrawImage(this.stub.root, x1, y1, iw, ih, 0, 0, iw, ih);

					if (this.labels.overlay) {
						FillGradRect(gr, x1, y2 - 1, iw / 2, lib.ui.l.w, 1, RGBA(0, 0, 0, 0), lib.ui.col.imgBor);
						FillGradRect(gr, x1 + iw / 2, y2 - 1, iw / 2, lib.ui.l.w, 1, lib.ui.col.imgBor, RGBA(0, 0, 0, 0));
					}
					if (this.labels.overlayDark) {
						if (item.sel || nowp) gr.FillSolidRect(x2, y2, this.im.w, this.overlayHeight, RGBA(150, 150, 150, 150));
						gr.FillSolidRect(x2, y2, this.im.w, this.overlayHeight, this.getSelBgCol(item, nowp));
					}
				}
				this.drawItemOverlay(gr, item, x1, y1, iw, ih);
				if (i == lib.pop.m.i) {
					if (lib.pop.highlight.row == 3 || lib.pop.highlight.row == 2 && (((this.labels.overlay || this.labels.hide) && this.style.image != 2))) {
						if (!libSet.frameImage) this.drawFrame(gr, box_x, box_y, /*ui.col.frameImgSel*/ lib.ui.col.selectionFrame2, !this.labels.overlay && !this.labels.hide ? 'stnd' : 'thick');
						else this.drawImageFrame(gr, x1, y1, iw, ih, /*ui.col.frameImgSel*/ lib.ui.col.selectionFrame2);
					} // else if (lib.pop.highlight.row == 1 && !lib.sbar.draw_timer) gr.FillSolidRect(lib.ui.l.w, y1, lib.ui.sz.sideMarker, this.im.w, lib.ui.col.sideMarker);
				}
				if (item.sel) {
					// if (this.labels.overlay && this.style.image != 2) this.drawFrame(gr, box_x, box_y, /* lib.ui.col.frameImgSel */ lib.ui.col.selectionFrame2, 'thick');
					// else if (this.labels.hide && lib.pop.highlight.row == 3 && libSet.frameImage) this.drawImageFrame(gr, x1, y1, iw, ih, /* lib.ui.col.frameImgSel */  lib.ui.col.selectionFrame2);
					if (this.labels.hide && lib.pop.highlight.row == 3 && libSet.frameImage) this.drawImageFrame(gr, x1, y1, iw, ih, /* lib.ui.col.frameImgSel */  lib.ui.col.selectionFrame2);
				}
				if (!this.labels.hide) {
					const x = box_x + this.text.x;
					let type = 0;

					const txt_c =
						lib.pop.highlight.nowPlaying && !item.root && lib.pop.inRange(lib.pop.nowp, item.item) && updatedNowpBg ? lib.ui.col.text_nowp :
						item.sel ? lib.ui.col.textSel :
						lib.pop.m.i === i ? lib.ui.col.text_h : lib.ui.col.text;

					if (lib.panel.colMarker) type = item.sel ? 2 : lib.pop.highlight.text && i == lib.pop.m.i ? 1 : 0;
					if (!this.labels.overlay) {
						y1 = this.im.y + this.text.y1;
						y2 = this.im.y + this.text.y2;
						const y3 = this.im.y + this.text.y3;
						if (lib.panel.lines == 2) {
							this.checkTooltip(gr, item, x, y1, y2, y3, this.text.w, grp, lot, statistics, lib.ui.font.group, /*ui.font.lot,*/ lib.ui.font.group, lib.ui.font.statistics);
							!lib.panel.colMarker ? gr.GdiDrawText(grp, lib.ui.font.group, txt_c /*grpCol*/, x, y1, this.text.w, this.text.h, this.getLabelFormat(!item.tt[1])) : lib.pop.cusCol(gr, grp, item, x, y1, this.text.w, this.text.h, type, nowp, lib.ui.font.group, lib.ui.font.groupEllipsisSpace, 'group');
							!lib.panel.colMarker ? gr.GdiDrawText(lot, lib.ui.font.lot, txt_c /*lotCol*/, x, y2, this.text.w, this.text.h, this.getLabelFormat(!item.tt[2])) : lib.pop.cusCol(gr, lot, item, x, y2, this.text.w, this.text.h, type, nowp, lib.ui.font.lot, lib.ui.font.lotEllipsisSpace, 'lott');
							if (statistics) gr.GdiDrawText(statistics, lib.ui.font.statistics, txt_c /*lotCol*/, x, y3, this.text.w, this.text.h, this.getLabelFormat(!item.tt[3]));
							} else {
							this.checkTooltip(gr, item, x, y1, statistics ? y2 : -1, -1, this.text.w, grp, statistics, false, lib.ui.font.group, lib.ui.font.statistics);
							!lib.panel.colMarker ? gr.GdiDrawText(grp, lib.ui.font.group, txt_c /*grpCol*/, x, y1, this.text.w, this.text.h, this.getLabelFormat(!item.tt[1])) : lib.pop.cusCol(gr, grp, item, x, y1, this.text.w, this.text.h, type, nowp, lib.ui.font.group, lib.ui.font.mainEllipsisSpace, 'group');
							if (statistics) gr.GdiDrawText(statistics, lib.ui.font.statistics, txt_c /*lotCol*/, x, y2, this.text.w, this.text.h, this.getLabelFormat(!item.tt[2]));
							}
					} else {
						y1 = this.im.y + this.text.y1;
						y2 = y1 + this.text.h * (this.labels.statistics ? 0.93 : 0.9);
						const y3 = y2 + this.text.h * 0.95;
						if (lib.panel.lines == 2) {
							this.checkTooltip(gr, item, x, y1, y2, y3, this.text.w, grp, lot, statistics, lib.ui.font.group, /*ui.font.lot,*/ lib.ui.font.group, lib.ui.font.statistics);
							!lib.panel.colMarker ? gr.GdiDrawText(grp, lib.ui.font.group, txt_c /*grpCol*/, x, y1, this.text.w, this.text.h, this.getLabelFormat(!item.tt[1])) : lib.pop.cusCol(gr, grp, item, x, y1, this.text.w, this.text.h, type, nowp, lib.ui.font.group, lib.ui.font.groupEllipsisSpace, 'lott');
							!lib.panel.colMarker ? gr.GdiDrawText(lot, lib.ui.font.lot, txt_c /*lotCol*/, x, y2, this.text.w, this.text.h, this.getLabelFormat(!item.tt[2])) : lib.pop.cusCol(gr, lot, item, x, y2, this.text.w, this.text.h, type, nowp, lib.ui.font.lot, lib.ui.font.lotEllipsisSpace, 'group');
							if (statistics) gr.GdiDrawText(statistics, lib.ui.font.statistics, txt_c /*lotCol*/, x, y3, this.text.w, this.text.h, this.getLabelFormat(!item.tt[3]));
							} else {
							this.checkTooltip(gr, item, x, y1, statistics ? y2 : -1, -1, this.text.w, grp, statistics, false, lib.ui.font.group, /*ui.font.lot,*/ lib.ui.font.group, lib.ui.font.statistics);
							!lib.panel.colMarker ? gr.GdiDrawText(grp, lib.ui.font.group, txt_c /*grpCol*/, x, y1, this.text.w, this.text.h, this.getLabelFormat(!item.tt[1])) : lib.pop.cusCol(gr, grp, item, x, y1, this.text.w, this.text.h, type, nowp, lib.ui.font.group, lib.ui.font.groupEllipsisSpace, 'group');
							if (statistics) gr.GdiDrawText(statistics, lib.ui.font.statistics, txt_c /*lotCol*/, x, y2, this.text.w, this.text.h, this.getLabelFormat(!item.tt[2]));
							}
					}
				}
			}
			if (this.column == this.columns - 1) this.column = 0;
			else this.column++;
		}
		lib.ui.drawTopBarUnderlay(gr);
	}

	/**
	 * TT 3D Jewel Case Flow prototype.
	 * Uses inexpensive vertical-strip perspective so it works with the existing
	 * SMP/GDI renderer and does not require a WebGL/Direct3D dependency.
	 */
	isFlowActive() {
		return this.isImageViewVisible() && libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' &&
			grSet.libraryLayout === 'full' && !this.style.vertical;
	}

	// Called by the existing main paint path: cancel hidden timers and restart on re-entry.
	syncFlowVisibility() {
		const active = this.isFlowActive();
		if (active === this.flowWasVisible) return;
		this.flowWasVisible = active;
		if (active) this.noteFlowActivity();
		else this.cancelFlowIdle();
	}

	flowSetting(name, fallback, minimum, maximum) {
		const value = Number(libSet[name]);
		return $Lib.clamp(Number.isFinite(value) ? value : fallback, minimum, maximum);
	}

	cancelFlowIdle() {
		clearTimeout(this.flowIdleTimer);
		this.flowIdleTimer = null;
		this.flowIdleArmed = false;
	}

	noteFlowActivity() {
		this.cancelFlowIdle();
		this.flowLastActivity = Date.now();
		this.armFlowIdle();
	}

	onFlowPointerMoved(x, y) {
		if (this.flowPointerX === x && this.flowPointerY === y) return;
		this.flowPointerX = x; this.flowPointerY = y;
		if (this.isFlowActive()) this.noteFlowActivity();
	}

	armFlowIdle() {
		if (this.flowIdleArmed || !this.isFlowActive() || !fb.IsPlaying) return;
		const seconds = this.flowSetting('flowIdleSeconds', 5, 0, 30);
		if (!seconds) return;
		this.flowIdleArmed = true;
		if (!Number.isFinite(this.flowLastActivity)) this.flowLastActivity = Date.now();
		const delay = Math.max(50, seconds * 1000 - (Date.now() - this.flowLastActivity));
		this.flowIdleTimer = setTimeout(() => {
			this.flowIdleTimer = null;
			if (!this.isFlowActive() || !fb.IsPlaying) { this.flowIdleArmed = false; return; }
			// No selection or playlist changes. Wait until editing, menus, dragging and scrolling end.
			if (grm.ui.activeMenu || grm.button?.mainMenuOpen || lib.pop.lbtnDn || lib.sbar.bar.isDragging ||
				lib.sbar.touch?.dn || lib.panel.search.active || lib.sbar.draw_timer) {
				this.flowIdleArmed = false;
				this.flowLastActivity = Date.now();
				this.armFlowIdle();
				return;
			}
			this.returnFlowToNowPlaying();
		}, delay);
	}

	returnFlowToNowPlaying() {
		if (!this.isFlowActive() || !fb.IsPlaying || !this.columnWidth) return false;
		const handle = fb.GetNowPlaying();
		const nowp = handle ? lib.panel.list.Find(handle) : -1;
		if (nowp < 0) return false; // A filtered-out album must not change filters or playback.
		const index = lib.pop.tree.findIndex(item => !item.root && item.item && lib.pop.inRange(nowp, item.item));
		if (index < 0) return false;
		const target = this.bor.side + (index + 0.5) * this.columnWidth - this.panel.w * 0.5;
		lib.sbar.checkScroll($Lib.clamp(target, 0, lib.sbar.max_scroll), 'step');
		return true;
	}

	setFlowSetting(name, value) {
		libSet[name] = value;
		this.flowPerspectiveCache = [];
		this.jewelCaseCache = [];
		this.noteFlowActivity();
		lib.panel.treePaint();
	}

	/** One continuous scene is shared by painting and hit testing. */
	getFlowScene() {
		if (!this.columnWidth || !lib.pop.tree.length || this.panel.w <= 0 || this.panel.h <= 0) return null;
		const viewportX = lib.ui.x + this.panel.x, viewportW = this.panel.w;
		const viewportCx = viewportX + viewportW * 0.5;
		const focusPos = $Lib.clamp((lib.sbar.delta + viewportW * 0.5 - this.bor.side) / this.columnWidth - 0.5,
			0, lib.pop.tree.length - 1);
		const center = Math.round(focusPos);
		const size = this.flowSetting('flowCenterSize', 100, 70, 140) / 100;
		const labelRoom = this.labels.hide ? SCALE(20) : Math.max(SCALE(50), this.text.h * (lib.panel.lines + 1));
		// Reserve the complete size range inside the viewport before scaling.
		// Clamping every choice to the same limit made 120% and 140% identical.
		const fit = Math.max(2, Math.min((this.panel.h - labelRoom) * 0.94, viewportW * 0.60 / 1.14));
		const standard = Math.min(Math.max(2, this.im.w), fit / 1.4);
		const base = Math.max(2, Math.min(fit, standard * size));
		const centerY = lib.ui.y + this.panel.y + Math.max(0, (this.panel.h - labelRoom - base) * 0.5);
		const maxSide = Math.max(2, Math.min(7, Math.ceil(viewportW / Math.max(standard * 0.35, 1))));
		const boxes = [];
		for (let i = Math.max(0, center - maxSide); i <= Math.min(lib.pop.tree.length - 1, center + maxSide); i++) {
			const rel = i - focusPos;
			const box = this.getFlowCaseGeometry(rel, base, viewportCx, centerY, standard);
			if (box.x + box.w < viewportX || box.x > viewportX + viewportW || box.h < 2) continue;
			boxes.push({ ...box, index: i, rel, dist: Math.abs(rel) });
		}
		// Far cases first. The same order, reversed, is used to select the topmost visible case.
		boxes.sort((a, b) => b.dist - a.dist || a.index - b.index);
		return { viewportX, viewportW, viewportCx, focusPos, center, base, sideBase: standard, centerY, boxes };
	}

	drawFlow3D(gr) {
		if (!lib.pop.tree.length || !this.columnWidth) return;

		this.armFlowIdle();
		const scene = this.getFlowScene();
		if (!scene) return;
		const { viewportW, viewportCx, focusPos, center, base, centerY } = scene;
		this.flowMaterialHeight = Math.max(2, Math.round(Math.max(base, scene.sideBase)));
		const order = scene.boxes;

		for (let n = 0; n < order.length; n++) {
			const box = order[n];
			const i = box.index, rel = box.rel, dist = box.dist;
			const item = lib.pop.tree[i];
			if (!item) continue;
			lib.pop.getItemCount(item);

			const isCenter = i === center;
			// PRE2 progressive LOD: material detail fades in as an album approaches the focal slot.
			// This keeps expensive-looking detail concentrated around the centre without using blur or shaders.
			const focusMix = Math.max(0, Math.min(1, 1 - Math.abs(i - focusPos)));
			const nearMix = Math.max(0, Math.min(1, 2 - Math.abs(i - focusPos)));
			const { x, y, h } = box;
			const projectedW = box.w;
			const img = this.getFlowImg(item.key);

			// FOCUS DEPTH FIX1: the centre case gets a layered soft floor shadow so it
			// reads as physically forward of the receding row. Side cases retain only
			// a light contact shadow. Ellipses are inexpensive and avoid runtime blur.
			gr.SetSmoothingMode(2);
			const shadowY = y + h + h * 0.022;
			const shadowW = projectedW * (0.78 + 0.16 * focusMix);
			gr.FillEllipse(x + (projectedW - shadowW) * 0.5, shadowY, shadowW,
				Math.max(3, h * (0.016 + 0.029 * focusMix)), RGBA(0, 0, 0, 38));
			if (focusMix > 0.01) gr.FillEllipse(x + projectedW * 0.14, shadowY + h * 0.006,
				projectedW * 0.72, Math.max(3, h * 0.026), RGBA(0, 0, 0, Math.round(92 * focusMix)));

			gr.SetSmoothingMode(0);

			if (img) {
				if (dist < 0.001) this.drawJewelCaseFront(gr, img, x, y, projectedW, h, focusMix);
				else this.drawJewelCasePerspective(gr, img, x, y, projectedW, h, rel < 0, Math.max(1, Math.ceil(dist)), nearMix, box.farInset);
			} else {
				const stub = !item.root ? this.stub.noImg : (!this.style.rootComposite ? this.stub.root : null);
				if (stub) {
					if (dist < 0.001) this.drawJewelCaseFront(gr, stub, x, y, projectedW, h, focusMix);
					else this.drawJewelCasePerspective(gr, stub, x, y, projectedW, h, rel < 0, Math.max(1, Math.ceil(dist)), nearMix, box.farInset);
				}
			}

			// The focused album remains readable without adding labels to every receding case.
			if (isCenter && !this.labels.hide) {
				const textY = y + h + Math.round(base * 0.055);
				const textH = Math.max(this.text.h, SCALE(18));
				const textW = Math.min(viewportW * 0.72, base * 1.8);
				const textX = viewportCx - textW / 2;
				gr.GdiDrawText(item.grp || '', lib.ui.font.group, lib.ui.col.text, textX, textY, textW, textH, lib.panel.cc);
				if (lib.panel.lines == 2 && item.lot) gr.GdiDrawText(item.lot, lib.ui.font.lot, lib.ui.col.text, textX, textY + textH, textW, textH, lib.panel.cc);
			}
		}
	}


	/**
	 * GEO/INTERACTION FIX2: hit-test the exact 3D Flow case geometry.
	 * Returns the visually topmost album index, or -1 when the pointer is not
	 * over a rendered jewel case. Coordinates are absolute panel coordinates.
	 */
	getFlowHitIndex(mouseX, mouseY) {
		if (!this.isFlowActive()) return -1;
		const scene = this.getFlowScene();
		if (!scene || mouseX < scene.viewportX || mouseX > scene.viewportX + scene.viewportW ||
			mouseY < lib.ui.y + this.panel.y || mouseY > lib.ui.y + this.panel.y + this.panel.h) return -1;
		for (let n = scene.boxes.length - 1; n >= 0; n--) {
			const b = scene.boxes[n], { x, y, w, h, farInset } = b;
			const poly = b.rel < 0 ? [[x,y+farInset],[x+w,y],[x+w,y+h],[x,y+h-farInset]] :
				[[x,y],[x+w,y+farInset],[x+w,y+h-farInset],[x,y+h]];
			if (this.pointInFlowPolygon(mouseX, mouseY, poly)) return b.index;
		}
		return -1;
	}

	pointInFlowPolygon(x, y, poly) {
		let inside = false;
		for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
			const xi = poly[i][0], yi = poly[i][1];
			const xj = poly[j][0], yj = poly[j][1];
			const crosses = ((yi > y) !== (yj > y)) &&
				x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi;
			if (crosses) inside = !inside;
		}
		return inside;
	}

	/** Every side case lies between the same two straight rails on its side. */
	getFlowCaseGeometry(rel, base, cx, centerY, sideBase = base) {
		const dist = Math.abs(rel), t = Math.min(1, dist), blend = t * t * (3 - 2 * t);
		const depth = (this.flowSetting('flowDepth', 100, 60, 140) - 60) / 80;
		const spacing = (this.flowSetting('flowSpacing', 100, 80, 120) - 80) / 40;
		// Depth controls angle, recession and edge slope together; centre remains flat.
		const angle = (32 + 36 * depth) * Math.PI / 180;
		const recession = 0.12 + 0.16 * depth;
		const scale = Math.max(0.42, 1 - recession * blend - (0.035 + 0.035 * depth) * Math.max(0, dist - 1));
		// Only the focal slot changes size. Interpolate while entering/leaving it;
		// Only the nearest album can grow; the influence reaches zero halfway
		// to the next slot, keeping every other album at its fixed side size.
		const focusT = Math.min(1, dist * 2), focusBlend = focusT * focusT * (3 - 2 * focusT);
		const localBase = sideBase + (base - sideBase) * (1 - focusBlend);
		const h = localBase * scale, w = h * 1.14 * Math.cos(angle * blend);
		// Space cases by their projected width, so stronger perspective does not
		// leave the large empty gaps produced by a fixed base-size offset.
		const sideWidth = sideBase * (1 - recession) * 1.14 * Math.cos(angle);
		const firstOffset = (base * 1.14 + sideWidth) * 0.5 * (0.68 + 0.30 * spacing);
		const outerStep = Math.max(sideBase * 0.14, sideWidth * (0.46 + 0.40 * spacing));
		const offset = firstOffset * t + outerStep * Math.max(0, dist - 1);
		return { x: cx + Math.sign(rel) * offset - w * 0.5, y: centerY + (base - h) * 0.5,
			w, h, farInset: Math.min(h * (0.04 + 0.10 * depth) * blend, w * 0.26) };
	}

	drawJewelCaseFront(gr, img, x, y, w, h, focusMix) {
		if (!img || w < 2 || h < 2) return;
		const face = this.getJewelCaseBitmap(img, Math.round((this.flowMaterialHeight || h) * 1.14), this.flowMaterialHeight || Math.round(h), true);
		if (!face) return;
		gr.SetInterpolationMode(7);
		try { gr.DrawImage(face, x, y, w, h, 0, 0, face.Width, face.Height); }
		finally { gr.SetInterpolationMode(0); }
	}

	/** One reference-style jewel case is shared by the front and perspective views. */
	getJewelCaseBitmap(img, width, height, detailed) {
		const sample = Math.min(1, 768 / width, 768 / height, Math.sqrt(500000 / (width * height)));
		width = Math.max(2, Math.floor(width * sample)); height = Math.max(2, Math.floor(height * sample));
		if (!this.jewelCaseCache) this.jewelCaseCache = [];
		const cache = this.jewelCaseCache;
		const index = cache.findIndex(entry => entry.img === img && entry.width === width &&
			entry.height === height && entry.detailed === detailed);
		if (index !== -1) {
			const entry = cache.splice(index, 1)[0];
			cache.push(entry);
			return entry.bitmap;
		}
		const bitmap = $Lib.gr(width, height, true, g => {
			this.paintJewelCase(g, img, width, height, detailed);
		});
		if (!bitmap) return null;
		cache.push({ img, width, height, detailed, bitmap });
		// Cache finished material, not per-frame rib/clip drawings. Bound both count
		// and pixel area so browsing a large library does not retain all its covers.
		let pixels = cache.reduce((sum, entry) => sum + entry.width * entry.height, 0);
		while (cache.length > 24 || cache.length > 1 && pixels > 8000000) {
			const entry = cache.shift();
			pixels -= entry.width * entry.height;
		}
		return bitmap;
	}

	paintJewelCase(gr, img, w, h, detailed) {
		const rim = Math.max(1, Math.round(h * 0.011));
		const spine = Math.max(3, Math.round(w * 0.095));
		const coverSize = Math.max(1, Math.min(h - rim * 2, w - spine - rim * 3));
		const coverX = spine + rim;
		const coverY = Math.round((h - coverSize) / 2);
		const faceRight = coverX + coverSize;
		const lineWidth = Math.max(0.6, h / 430);

		// Thin clear shell around a square booklet, with a dark ribbed left tray.
		gr.FillSolidRect(0, 0, w, h, RGBA(118, 122, 130, 100));
		gr.FillSolidRect(coverX, coverY, coverSize, coverSize, RGB(22, 22, 25));
		const fit = Math.min(coverSize / img.Width, coverSize / img.Height);
		const artW = img.Width * fit, artH = img.Height * fit;
		gr.SetInterpolationMode(7);
		try {
			gr.DrawImage(img, coverX + (coverSize - artW) / 2, coverY + (coverSize - artH) / 2,
				artW, artH, 0, 0, img.Width, img.Height);
		} finally { gr.SetInterpolationMode(0); }
		gr.FillGradRect(1, rim, spine - 1, h - rim * 2, 0,
			RGBA(62, 63, 68, 255), RGBA(29, 30, 34, 255), 1);
		const ribPitch = Math.max(2, Math.round(h / 180));
		for (let rib = 3; rib < spine - 2; rib += ribPitch) {
			gr.FillSolidRect(rib, rim + 1, 1, h - rim * 2 - 2, RGBA(125, 127, 136, 50));
		}
		gr.FillSolidRect(spine - 1, rim, 1, h - rim * 2, RGBA(11, 12, 16, 230));
		gr.FillSolidRect(spine, rim, 1, h - rim * 2, RGBA(216, 217, 225, 80));

		// Moulded transparent rails: all highlights remain inside the case silhouette.
		gr.FillSolidRect(0, 0, w, rim, RGBA(171, 173, 183, 140));
		gr.FillSolidRect(0, h - rim, w, rim, RGBA(157, 160, 171, 155));
		gr.FillSolidRect(w - rim, 0, rim, h, RGBA(143, 147, 158, 165));
		gr.FillSolidRect(0, 0, 1, h, RGBA(205, 207, 216, 95));
		gr.FillSolidRect(spine + 1, rim, w - spine - rim * 2 - 1, 1, RGBA(241, 242, 250, 100));
		gr.FillSolidRect(spine + 1, h - rim - 1, w - spine - rim * 2 - 1, 1, RGBA(235, 237, 247, 125));
		gr.FillSolidRect(w - rim - 2, rim, 1, h - rim * 2, RGBA(226, 228, 239, 65));
		gr.FillSolidRect(faceRight + 1, rim, 1, h - rim * 2, RGBA(25, 27, 36, 110));

		gr.SetSmoothingMode(2);
		try {
			// Four inward half-circle booklet clips match the supplied case.
			const radius = Math.max(2, coverSize * 0.04);
			const segments = detailed ? 14 : 8;
			for (const position of [0.18, 0.84]) {
				const cx = coverX + coverSize * position;
				for (const bottom of [false, true]) {
					const edgeY = bottom ? h - rim - 1 : rim + 1;
					for (let i = 0; i < segments; i++) {
						const a = Math.PI * i / segments, b = Math.PI * (i + 1) / segments;
						gr.DrawLine(cx + Math.cos(a) * radius, edgeY + (bottom ? -1 : 1) * Math.sin(a) * radius,
							cx + Math.cos(b) * radius, edgeY + (bottom ? -1 : 1) * Math.sin(b) * radius,
							lineWidth, RGBA(224, 225, 237, detailed ? 105 : 65));
					}
				}
			}
			// A restrained clear-lid reflection preserves the cover's colours and text.
			gr.FillPolygon(RGBA(226, 229, 239, detailed ? 20 : 10), 0,
				[coverX + 1, coverY + 1, coverX + coverSize * 0.58, coverY + 1,
					coverX + coverSize * 0.25, coverY + coverSize * 0.47, coverX + 1, coverY + coverSize * 0.76]);
		} finally { gr.SetSmoothingMode(0); }
		// Clear hinge ends and a subtle right-side closure seam.
		const tabH = Math.max(2, Math.round(h * 0.016));
		gr.FillSolidRect(2, rim, Math.max(1, spine - 4), tabH, RGBA(188, 190, 202, 45));
		gr.FillSolidRect(2, h - rim - tabH, Math.max(1, spine - 4), tabH, RGBA(188, 190, 202, 45));
		gr.FillSolidRect(w - rim - 2, Math.round(h * 0.43), 2, Math.max(2, Math.round(h * 0.12)), RGBA(43, 46, 55, 95));
	}

	drawJewelCasePerspective(gr, img, x, y, w, h, leftSide, depth, nearMix, farInset = w * 0.11) {
		if (!img || w < 2 || h < 2) return;
		// Moving geometry changes every frame. Compose only settled projections;
		// use the original strip renderer during scrolling to avoid cache churn.
		if (lib.sbar?.draw_timer || Math.abs((lib.sbar?.scroll || 0) - (lib.sbar?.delta || 0)) > 1) {
			this.paintJewelCasePerspective(gr, img, x, y, w, h, leftSide, depth, nearMix, farInset);
			return;
		}
		if (!this.flowPerspectiveCache) this.flowPerspectiveCache = [];
		const cache = this.flowPerspectiveCache;
		let entry = cache.find(e => e.img === img && e.w === w && e.h === h && e.leftSide === leftSide && e.depth === depth && e.farInset === farInset);
		if (!entry) {
			const sample = Math.min(1, Math.sqrt(500000 / (Math.ceil(w) * Math.ceil(h))));
			const bitmap = $Lib.gr(Math.ceil(w * sample), Math.ceil(h * sample), true, g => {
				const scaled = {
					SetInterpolationMode: mode => g.SetInterpolationMode(mode),
					DrawImage: (source, dx, dy, dw, dh, ...rest) => g.DrawImage(source, dx * sample, dy * sample, dw * sample, dh * sample, ...rest)
				};
				this.paintJewelCasePerspective(scaled, img, 0, 0, w, h, leftSide, depth, nearMix, farInset);
			});
			if (!bitmap) return;
			entry = { img, w, h, leftSide, depth, farInset, bitmap, sample };
			cache.push(entry);
			let pixels = cache.reduce((sum, e) => sum + e.bitmap.Width * e.bitmap.Height, 0);
			while (cache.length > 24 || cache.length > 1 && pixels > 8000000) {
				const old = cache.shift(); pixels -= old.bitmap.Width * old.bitmap.Height;
			}
		} else { cache.splice(cache.indexOf(entry), 1); cache.push(entry); }
		gr.SetInterpolationMode(7);
		try { gr.DrawImage(entry.bitmap, x, y, w, h, 0, 0, entry.bitmap.Width, entry.bitmap.Height); }
		finally { gr.SetInterpolationMode(0); }
	}

	paintJewelCasePerspective(gr, img, x, y, w, h, leftSide, depth, nearMix, farInset = w * 0.11) {
		if (!img || w <= 0 || h <= 0) return;
		const materialH = this.flowMaterialHeight || Math.round(h);
		const face = this.getJewelCaseBitmap(img, Math.max(2, Math.round(materialH * 1.14)),
			Math.max(2, materialH), depth <= 2);
		if (!face) return;
		// GEOMETRY FIX3: left outer edge is short, centre-facing edge is tall.
		// Shared midpoint sampling agrees with the hit-test trapezoid on both sides.
		const insetAt = t => farInset * (leftSide ? 1 - t : t);
		const moving = !!lib.sbar?.draw_timer || Math.abs((lib.sbar?.scroll || 0) - (lib.sbar?.delta || 0)) > 1;
		const strips = Math.min(Math.round(w), moving ? (depth <= 2 ? 32 : 20) : depth <= 2 ? 72 : depth <= 4 ? 48 : 32);
		gr.SetInterpolationMode(7); // HighQualityBicubic
		try {
			for (let i = 0; i < strips; i++) {
				const dx0 = Math.round(w * i / strips);
				const dx1 = Math.round(w * (i + 1) / strips);
				if (dx1 <= dx0) continue;
				const t0 = dx0 / w;
				const t1 = dx1 / w;
				const inset = insetAt((t0 + t1) / 2);
				// Exactly adjacent destination spans: no extra pixel or duplicated source bands.
				gr.DrawImage(face, x + dx0, y + inset, dx1 - dx0, h - inset * 2,
					face.Width * t0, 0, face.Width * (t1 - t0), face.Height);
			}
		} finally { gr.SetInterpolationMode(0); }
		// Project the complete shell, spine and clips with the artwork. The left
		// hinge stays on the left of each physical case, including the receding row.
	}

	drawFrame(gr, box_x, box_y, col, weight) {
		let x;
		let y;
		let w;
		let h;
		let l_w;
		switch (weight) {
			case 'stnd':
				x = !this.labels.right ? box_x + 1 : lib.ui.sz.pad + 1;
				y = box_y + (!this.labels.right ? 1 : 1);
				w = !this.labels.right ? this.box.w - 2 : lib.panel.tree.sel.w;
				h = this.box.h - (!this.labels.right ? 2 : 0);
				l_w = 2;
				break;
			case 'thick':
				x = box_x + Math.round((this.box.w - this.im.w) / 2) + 1;
				y = this.im.y + 2;
				w = this.im.w;
				h = this.im.w - 2;
				l_w = 4;
				break;
		}
		gr.DrawRect(x, y, w, h, l_w, col);
	}

	drawImageFrame(gr, x, y, w, h, col) {
		const l_w = 3;
		gr.SetSmoothingMode(2);
		if (this.style.image != 2) gr.DrawRect(x + 1, y + 1, w - l_w / 2 - 1, h - l_w / 2 - 1, l_w, col);
		else gr.DrawEllipse(x, y, w - l_w / 2, h - l_w / 2, l_w, col);
		gr.SetSmoothingMode(0);
	}

	drawItemOverlay(gr, item, x, y, w) {
		if (item.root) return;
		switch (libSet.itemOverlayType) {
			case 1: {
				if (!item.count) break;
				let count_w = Math.max(gr.CalcTextWidth(`${item.count} `, lib.ui.font.tracks), 8);
				const count_h = Math.max(gr.CalcTextHeight(item.count, lib.ui.font.tracks), 8);
				let count_x = x + (this.style.image != 2 ? w - count_w - 3 : (w - count_w - 2) / 2);
				const count_y = y + (this.style.image != 2 ? 0 : count_h / 1.67);
				let count = item.count;
				let count_h2 = count_h;
				if (count_w > this.im.w) {
					count = item.count.split(' ');
					count_h2 = count_h * 2;
					count_w = Math.max(gr.CalcTextWidth(count[0], lib.ui.font.tracks), gr.CalcTextWidth(count[1], lib.ui.font.tracks));
					count_x = x + (this.style.image != 2 ? w - count_w - 3 : (w - count_w - 2) / 2);
					gr.SetSmoothingMode(2);
					gr.FillSolidRect(count_x, count_y, count_w + 2, count_h2, RGBA(0, 0, 0, 115));
					gr.GdiDrawText(count[0], lib.ui.font.tracks, RGB(255, 255, 255), count_x + 1, count_y, count_w, count_h, this.style.image != 2 ? lib.panel.rc : lib.panel.cc);
					gr.GdiDrawText(count[1], lib.ui.font.tracks, RGB(255, 255, 255), count_x + 1, count_y + count_h, count_w, count_h, this.style.image != 2 ? lib.panel.rc : lib.panel.cc);
					gr.SetSmoothingMode(0);
				} else {
					gr.SetSmoothingMode(2);
					gr.FillSolidRect(count_x, count_y, count_w + 2, count_h2, RGBA(0, 0, 0, 115));
					gr.GdiDrawText(count, lib.ui.font.tracks, RGB(255, 255, 255), count_x + 1, count_y, count_w, count_h, lib.panel.cc);
					gr.SetSmoothingMode(0);
				}
				break;
			}
			case 2: {
				if (!item.year) break;
				const year_w = Math.max(gr.CalcTextWidth(`${item.year} `, lib.ui.font.tracks), 8);
				const year_h = Math.max(gr.CalcTextHeight(item.year, lib.ui.font.tracks), 8);
				const year_x = x + (this.style.image != 2 ? 0 : (w - year_w - 2) / 2);
				const year_y = y + (this.style.image != 2 ? 0 : year_h / 1.67);
				gr.SetSmoothingMode(2);
				gr.FillSolidRect(year_x, year_y, year_w + 2, year_h, RGBA(0, 0, 0, 115));
				gr.GdiDrawText(item.year, lib.ui.font.tracks, RGB(255, 255, 255), year_x + 1, year_y, year_w, year_h, lib.panel.cc);
				gr.SetSmoothingMode(0);
				break;
			}
		}
	}

	drawSelBg(gr, cur_img, box_x, box_y, i, nowpOrSel) {
		if (this.labels.hide && (this.style.image != 2 || lib.pop.highlight.row == 3 && libSet.frameImage)) return;
		let x;
		let y;
		let w;
		let h;
		switch (true) {
			case nowpOrSel:
				// col = lib.ui.col.imgBgSel;
				switch (this.labels.overlay || this.labels.hide) {
					case true:
						x = box_x + Math.round((this.box.w - (cur_img ? cur_img.Width + 1 : this.im.w + 2)) / 2);
						y = box_y + (cur_img ? libSet.thumbNailGapCompact / 2 + this.im.w - cur_img.Height + 1 : libSet.thumbNailGapCompact / 2 + 2);
						w = cur_img ? cur_img.Width : this.im.w;
						h = cur_img ? cur_img.Height : this.im.w;
						break;
					case false:
						x = !this.labels.right ? box_x : lib.ui.x;
						y = box_y + (!this.labels.right ? 1 : 1);
						w = !this.labels.right ? this.box.w : lib.panel.tree.sel.w;
						h = this.box.h - 1;
						break;
				}
				break;
			case lib.pop.highlight.row == 2 && i == lib.pop.m.i:
				// col = lib.ui.col.bg_h;
				if ((this.labels.overlay || this.labels.hide) && this.style.image == 2) {
					x = box_x + Math.round((this.box.w - (cur_img ? cur_img.Width : this.im.w)) / 2);
					y = box_y + (cur_img ? this.im.w - cur_img.Height : 0);
					w = cur_img ? cur_img.Width : this.im.w;
					h = cur_img ? cur_img.Height : this.im.w;
				} else {
					x = !this.labels.right ? box_x : lib.ui.sz.pad;
					y = box_y + ((this.labels.overlay || this.labels.hide) ? 0 : (!this.labels.right ? 2 : 1));
					w = !this.labels.right ? this.box.w : lib.panel.tree.sel.w;
					h = this.box.h + ((this.labels.overlay || this.labels.hide) ? 2 : 0);
				}
				break;
		}

		x = this.labels.overlay ? box_x + Math.round((this.box.w - (cur_img ? cur_img.Width + 1 : this.im.w + 2)) / 2) : !this.labels.right ? box_x : lib.ui.x;
		y = this.labels.overlay ? box_y + (cur_img ? libSet.thumbNailGapCompact / 2 + this.im.w - cur_img.Height + 1 : libSet.thumbNailGapCompact / 2 + 2) : box_y + (!this.labels.right ? 1 : 1);
		const coversRight = grSet.libraryDesign === 'coversLabelsRight' || libSet.albumArtLabelType === 2;

		const colNowPlaying = grSet.libraryBgImg ? RGBtoRGBA(lib.ui.col.nowPlayingBg, grSet.libraryBgRowOpacity) : lib.ui.col.nowPlayingBg;
		gr.FillSolidRect(x, coversRight ? y - 1 : y, w - (lib.sbar.w && coversRight ? SCALE(42) : 0), coversRight ? h + 2 : h, colNowPlaying);

		if ((grSet.theme !== 'white' && grSet.theme !== 'black') && (!libSet.albumArtShow || libSet.albumArtShow && coversRight) ||
			(grSet.styleBlackAndWhite || grSet.styleBlackAndWhite2) && libSet.albumArtShow && coversRight) {
			gr.FillSolidRect(x, y - 1, lib.ui.sz.sideMarker, h + 2, lib.ui.col.sideMarker);
		}
	}

	fadeMask(image, w, h) {
		const mask = $Lib.gr(w, h, true, g => g.DrawImage(this.mask.fade, 0, h - this.overlayHeight, w, this.overlayHeight, 0, 0, this.mask.fade.Width, this.mask.fade.Height));
		image.ApplyMask(mask);
	}

	format(image, n, type, w, h, fade, caller, i, key) {
		if (caller.startsWith('display') && libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' && grSet.libraryLayout === 'full' && !this.style.vertical) {
			const sample = Math.min(1, 640 / w, 640 / h); w = Math.round(w * sample); h = Math.round(h * sample);
		}
		let ix = 0;
		let iy = 0;
		let iw = image.Width;
		let ih = image.Height;
		switch (type) {
			case 'crop':
			case 'circular': {
				const s1 = iw / w;
				const s2 = ih / h;
				const r = s1 / s2;
				if (this.needTrim(n, r)) {
					if (s1 > s2) {
						iw = Math.round(w * s2);
						ix = Math.round((image.Width - iw) / 2);
					} else {
						ih = Math.round(h * s1);
						iy = Math.round((image.Height - ih) / 8);
					}
					image = image.Clone(ix, iy, iw, ih);
				}
				image = image.Resize(w, h, 7);
				if (type == 'circular') this.circularMask(image, image.Width, image.Height);
				break;
			}

			default: {
				const sc = caller != 'save' ? Math.min(h / ih, w / iw) : Math.max(h / ih, w / iw);
				const im_w = Math.round(iw * sc);
				const im_h = Math.round(ih * sc);
				image = image.Resize(im_w, im_h, 7);
				break;
			}
		}
		if (fade) this.fadeMask(image, image.Width, image.Height);
		if (caller.startsWith('display')) {
			this.cache[key] = {
				img: image,
				accessed: caller == 'display' ? ++this.accessed : 0
			};
		}
		else return image;
	}

	getCurrentDatabase() {
		this.albumArtDiskCache = libSet.albumArtDiskCache;
		if (!this.albumArtDiskCache) return;
		const cacheFolder = this.cacheFolder;
		$Lib.buildPth(this.cachePath);
		this.saveSize = this.im.w > 500 ? 750 : this.im.w > 250 ? 500 : 250;
		this.interval = {
			cache: this.saveSize == 250 ? 1 : this.saveSize == 500 ? 4 : 9,
			preLoad: this.saveSize == 250 ? (libSet.albumArtLabelType != 3 ? 7 : 15) : this.saveSize == 500 ? 20 : 45
		}
		this.cacheFolder = `${this.cachePath + ['front', 'back', 'disc', 'icon', 'artist'][libSet.artId] + (this.saveSize == 250 ? '' : this.saveSize)}\\`;
		$Lib.create(this.cacheFolder);
		this.database = $Lib.jsonParse(`${this.cacheFolder}database.dat`, this.newDatabase(), 'file');
		if (this.cacheFolder != cacheFolder) {
			this.preLoadItems = [];
			clearInterval(this.timer.preLoad);
			this.timer.preLoad = null;
			this.items = [];
			clearInterval(this.timer.load);
			this.timer.load = null;
			this.toSave = [];
			clearInterval(this.timer.save);
			this.timer.save = null;
		}
	}

	getField(handle, name, arr) {
		const f = handle.GetFileInfo();
		if (f) {
			for (let i = 0; i < f.MetaCount; ++i) {
				let fullName = '';
				for (let j = 0; j < f.MetaValueCount(i); ++j) {
					fullName += f.MetaValue(i, j) + (j < f.MetaValueCount(i) - 1 ? ', ' : '');
					if (f.MetaValue(i, j) == name || fullName == name) arr.push(f.MetaName(i).toLowerCase());
				}
			}
		}
	}

	getGrpCol(item, nowp, hover) {
		return nowp ? lib.ui.col.nowp : hover ? (lib.panel.textDiffHighlight ? lib.ui.col.nowp : lib.ui.col.text_h) : item.sel ? !this.labels.overlayDark ? lib.ui.col.textSel : lib.ui.col.text : !this.labels.overlayDark ? lib.ui.col.text : RGB(240, 240, 240);
	}

	getImages() {
		const extraRows = this.albumArtDiskCache ? lib.panel.rows * 2 : lib.panel.rows; // will load any extra including those after any preLoad

		if (!this.isImageViewVisible()) return;
		this.items = [];
		let begin = this.start == 0 ? libSet.rootNode ? 1 : 0 : this.start;
		const end = this.end != 0 ? Math.min(this.end + this.columns * extraRows, lib.pop.tree.length) : this.end;
		for (let i = begin; i < end; i++) {
			if (!lib.pop.tree[i]) continue;
			const key = lib.pop.tree[i].key;
			if (key && !this.cache[key]) {
				this.items.push({
					ix: i,
					handle: lib.pop.tree[i].handle,
					key
				});
			}
		}

		begin = Math.max(libSet.rootNode ? 1 : 0, begin - this.columns * extraRows);

		let i = end;
		while (i--) {
			if (i < begin) break;
			if (!lib.pop.tree[i]) continue;
			const key = lib.pop.tree[i].key;
			if (key && !this.cache[key]) {
				this.items.push({
					ix: i,
					handle: lib.pop.tree[i].handle,
					key
				});
			}
		}
		if (!this.items.length) return;

		let interval = !lib.sbar.bar.isDragging && !lib.sbar.touch.dn ? 5 : 50;
		const allCached = this.albumArtDiskCache ? this.items.every(v => v.key && this.database[v.key]) : false;
		if (allCached) interval = this.interval.cache;

		clearInterval(this.timer.load);
		this.timer.load = null;
		let j = 0;
		this.timer.load = setInterval(() => {
			if (!this.isImageViewVisible()) { clearInterval(this.timer.load); this.timer.load = null; return; }
			if (j < this.items.length) {
				const v = this.items[j];
				const key = v.key;
				if (!this.cache[key]) {
					if (this.albumArtDiskCache && $Lib.file(this.cacheFolder + this.database[key])) {
						this.cache[key] = {
							img: 'called',
							accessed: ++this.accessed
						};
						this.load_image_async(key, this.cacheFolder + this.database[key], v.ix);
					} else {
						this.cache[key] = {
							img: 'called',
							accessed: ++this.accessed
						};
						if (v.handle) this.get_album_art_async(v.handle, libSet.artId, key, v.ix);
					}
				}
				j++;
			} else {
				clearInterval(this.timer.load);
				this.timer.load = null;
			}
		}, interval);
	}

	getImg(key) {
		const o = this.cache[key];
		if (!o || o.img == 'called') return undefined;
		o.accessed = ++this.accessed;
		return o.img;
	}

	/** Keep a small set of known covers through working-cache eviction/reloads. */
	getFlowImg(key) {
		const image = this.getImg(key);
		if (!this.flowLastImages) this.flowLastImages = new Map();
		const retained = this.flowLastImages;
		if (image && Number.isFinite(image.Width) && Number.isFinite(image.Height)) {
			retained.delete(key);
			retained.set(key, image);
			let pixels = 0;
			for (const img of retained.values()) pixels += img.Width * img.Height;
			while (retained.size > 32 || retained.size > 1 && pixels > 4000000) {
				const first = retained.keys().next().value;
				const img = retained.get(first);
				pixels -= img.Width * img.Height;
				retained.delete(first);
			}
			return image;
		}
		const previous = retained.get(key);
		if (previous) {
			retained.delete(key);
			retained.set(key, previous);
		}
		return previous;
	}

	/** Flow loads the current visible range first; repaint cannot replace a live queue. */
	getFlowImages() {
		const active = lib.panel.imgView && libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' &&
			grSet.libraryLayout === 'full' && !this.style.vertical;
		clearTimeout(this.flowRetryTimer);
		this.flowRetryTimer = null;
		if (!active || !this.isImageViewVisible()) return;
		const context = `${libSet.artId}|${this.style.image}|${libSet.albumArtLabelType}|${this.cacheFolder}`;
		if (this.flowImageContext && this.flowImageContext !== context) this.clearCache();
		this.flowImageContext = context;
		if (!this.flowLoads) this.flowLoads = new Map();
		// The grid loader owns a mutable this.items array; do not let its timer race
		// this mode's immutable per-request records or keep old offscreen preloads alive.
		clearInterval(this.timer.load);
		this.timer.load = null;
		clearInterval(this.timer.preLoad);
		this.timer.preLoad = null;
		const focus = (lib.sbar.delta + this.panel.w / 2 - this.bor.side) / this.columnWidth - 0.5;
		const order = [];
		const scene = this.getFlowScene();
		if (scene) scene.boxes.forEach(box => order.push(box.index));
		const direction = Math.sign(lib.sbar.scroll - lib.sbar.delta);
		const indices = scene ? scene.boxes.map(box => box.index) : [];
		const first = indices.length ? Math.min(...indices) : Math.round(focus);
		const last = indices.length ? Math.max(...indices) : Math.round(focus);
		for (const side of direction ? [direction] : [-1, 1]) for (let distance = 1; distance <= 2; distance++) {
			const index = (side > 0 ? last : first) + side * distance;
			if (index >= 0 && index < lib.pop.tree.length && !order.includes(index)) order.push(index);
		}

		if (!scene) for (let i = this.start; i < this.end; i++) order.push(i);
		const visible = new Set(scene ? scene.boxes.map(box => box.index) : order);
		order.sort((a, b) => Number(!visible.has(a)) - Number(!visible.has(b)) ||
			Math.abs(a - focus) - Math.abs(b - focus));
		const now = Date.now();
		let retryAt = Infinity;
		for (const ix of order) {
			const item = lib.pop.tree[ix];
			if (!item?.key || item.root || !item.handle) continue;
			const key = item.key;
			const o = this.cache[key];
			if (o?.img && o.img !== 'called') {
				this.getFlowImg(key);
				continue;
			}
			if (o?.flowNoArt || this.flowLoads.has(key)) continue;
			if (o?.flowRetryAt > now) {
				retryAt = Math.min(retryAt, o.flowRetryAt);
				continue;
			}
			if (this.flowLoads.size >= 3) continue;
			const request = { key, ix, handle: item.handle, artId: libSet.artId,
				context, epoch: this.imageEpoch || 0, failures: o?.flowFailures || 0, missingReads: o?.flowMissingReads || 0 };
			this.flowLoads.set(key, request);
			this.cache[key] = { img: 'called', accessed: ++this.accessed };
			this.loadFlowImage(request);
		}
		if (Number.isFinite(retryAt)) {
			this.flowRetryTimer = setTimeout(() => this.getFlowImages(), Math.max(40, retryAt - Date.now()));
		}
	}

	async loadFlowImage(request) {
		const { key, ix } = request;
		let image = null;
		let saveName;
		let missing = false;
		const release = await this.acquireImageSlot(request.epoch);
		if (!release || !this.isImageViewVisible() || this.flowLoads.get(key) !== request) {
			if (release) release();
			if (this.flowLoads.get(key) === request) {
				this.flowLoads.delete(key);
				if (this.cache[key]?.img === 'called') delete this.cache[key];
				clearTimeout(this.flowRetryTimer);
				if (!this.imagesClosed) this.flowRetryTimer = setTimeout(() => this.getFlowImages(), 250);
			}
			return;
		}
		try {
			const cachedFile = this.database[key];
			if (this.albumArtDiskCache && cachedFile && cachedFile !== 'noAlbumArt' &&
				$Lib.file(this.cacheFolder + cachedFile)) {
				// Broken/missing disk thumbnails fall back to the original track artwork.
				try { image = await gdi.LoadImageAsyncV2(0, this.cacheFolder + cachedFile); }
				catch (e) { image = null; }
			}
			if (!image) {
				if (!this.isImageViewVisible() || this.flowLoads.get(key) !== request) return;
				const result = await utils.GetAlbumArtAsyncV2(0, request.handle, request.artId, false);
				image = result?.image;
				missing = !image;
				if (image && result.path) saveName = `${libMD5.hashStr(result.path)}.jpg`;
			}
			const currentContext = `${libSet.artId}|${this.style.image}|${libSet.albumArtLabelType}|${this.cacheFolder}`;
			if (this.flowLoads.get(key) !== request || this.flowImageContext !== currentContext || currentContext !== request.context) return;
			if (image) {
				this.cacheIt(image, key, ix, saveName);
				if (this.getFlowImg(key)) return;
			}
		} catch (e) {
			// Async rejection is a transient read failure, never proof of no artwork.
			missing = false;
		} finally {
			release();
			const currentContext = `${libSet.artId}|${this.style.image}|${libSet.albumArtLabelType}|${this.cacheFolder}`;
			if (this.flowLoads.get(key) === request) {
				if (this.flowImageContext === currentContext && currentContext === request.context) {
					const current = this.getImg(key);
					if (!current || current === 'called') {
						const failures = request.failures + 1;
						const missingReads = missing ? request.missingReads + 1 : 0;
						const known = this.flowLastImages?.has(key);
						this.cache[key] = { img: null, accessed: ++this.accessed, flowFailures: failures,
							flowMissingReads: missingReads, flowNoArt: missingReads >= 2 && !known,
							flowRetryAt: Date.now() + Math.min(10000, failures * 1500) };
					}
				}
				this.flowLoads.delete(key);
				if (this.isImageViewVisible()) lib.panel.treePaint();
				this.getFlowImages();
			}
		}
	}

	getItem(i) {
		if (!lib.pop.tree[i]) {
			return null;
		}
		const key = lib.pop.tree[i].key;
		if (!this.cache[key] && this.database[key] && this.database[key] != 'noAlbumArt') {
			if ($Lib.file(this.cacheFolder + this.database[key])) { // cacheItPreload if file exists
				return {
					ix: i,
					key
				}
			}
		}
		return null;
	}

	getItemsToDraw(preLoad) {
		switch (true) {
			case this.style.vertical:
				if (lib.pop.tree.length <= lib.panel.rows * this.columns) {
					this.start = 0;
					this.end = lib.pop.tree.length;
				} else {
					this.start = Math.round(lib.sbar.delta / this.row.h) * this.columns;
					this.start = $Lib.clamp(this.start, 0, this.start - this.columns);
					this.end = Math.ceil((lib.sbar.delta + this.panel.h) / this.row.h) * this.columns;
					this.end = Math.min(this.end, lib.pop.tree.length);
				}
				break;
			case !this.style.vertical:
				if (lib.pop.tree.length <= lib.panel.rows) {
					this.start = 0;
					this.end = lib.pop.tree.length;
				} else {
					this.start = Math.round(lib.sbar.delta / this.blockWidth);
					this.end = Math.min(this.start + lib.panel.rows + 2, lib.pop.tree.length);
					this.start = $Lib.clamp(this.start, 0, this.start - 1);
				}
				break;
		}
		// Projected cases share the stock pipeline; request the entire painted range.
		if (libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' && grSet.libraryLayout === 'full' && !this.style.vertical && this.columnWidth) {
			const focus = $Lib.clamp((lib.sbar.delta + this.panel.w / 2 - this.bor.side) / this.columnWidth - 0.5, 0, lib.pop.tree.length - 1);
			const center = Math.round(focus);
			const sides = Math.max(3, Math.min(7, Math.ceil(this.panel.w / Math.max(this.im.w * 0.42, 1))));
			this.start = Math.max(0, center - sides);
			this.end = Math.min(lib.pop.tree.length, center + sides + 1);
			this.getFlowImages();
			return;
		}
		this.albumArtDiskCache ? (preLoad ? this.preLoad() : this.getImages()) : this.loadThrottle();
	}

	getLabelFormat(fits) {
		if (this.labels.right || !fits) {
			return lib.panel.lc;
		}

		if (libSet.albumArtTextAlign === 1) {
			return lib.panel.cc;
		}
		else if (libSet.albumArtTextAlign === 2) {
			return lib.panel.rc;
		}
		else {
			return lib.panel.lc;
		}
	}

	getLotCol(item, nowp, hover) {
		return nowp ? lib.ui.col.nowp : hover ? (lib.panel.textDiffHighlight ? lib.ui.col.nowp : lib.ui.col.text_h) : item.sel ? !this.labels.overlayDark ? lib.ui.col.selBlend : lib.ui.col.lotBlend : !this.labels.overlayDark ? lib.ui.col.lotBlend : RGB(220, 220, 220);
	}

	getMostFrequentField(arr) {
		const counts = arr.reduce((a, c) => {
			a[c] = (a[c] || 0) + 1;
			return a;
		}, {});
		const maxCount = Math.max(...Object.values(counts));
		const mostFrequent = Object.keys(counts).filter(k => counts[k] === maxCount);
		return lib.panel.grp[libSet.viewBy].type.includes(mostFrequent[0]) ? mostFrequent[0] : '';
	}

	getShadow() {
		const xy = this.im.w * 0.02;
		let wh = this.style.image ? this.im.w * 0.985 : this.im.w; // draw at actual size if possible as faster; regular have to be resized during draw
		const sz = this.im.w * 1.17;
		if (this.style.image != 2) {
			this.shadow = $Lib.gr(sz, sz, true, g => g.FillSolidRect(xy, xy, wh, wh, RGBA(0, 0, 0, 128)));
			this.shadow.StackBlur(5);
		} else {
			this.shadow = $Lib.gr(sz, sz, true, g => g.FillEllipse(xy, xy, wh, wh, RGBA(0, 0, 0, 128)));
			this.shadow.StackBlur(4);
		}
		wh = this.im.w * 0.985; // always drawn at actual size
		if (libSet.artId == 4) {
			if (libSet.curNoArtistImg == 0 || libSet.curNoArtistImg == 2 || this.style.image == 2) {
				this.shadowStub = $Lib.gr(sz, sz, true, g => g.FillEllipse(xy, xy, wh, wh, RGBA(0, 0, 0, 128)));
				this.shadowStub.StackBlur(4);
			} else if (libSet.curNoArtistImg != 4) {
				this.shadowStub = $Lib.gr(sz, sz, true, g => g.FillSolidRect(xy, xy, wh, wh, RGBA(0, 0, 0, 128)));
				this.shadowStub.StackBlur(5);
			} else {
				this.shadowStub = null;
			}
		} else if (libSet.curNoCoverImg > 2) {
			this.shadowStub = $Lib.gr(sz, sz, true, g => g.FillSolidRect(xy, xy, wh, wh, RGBA(0, 0, 0, 128)));
			this.shadowStub.StackBlur(5);
		} else {
			this.shadowStub = null;
		}
	}

	getRootImg(key) {
		const o = this.cache[key];
		if (!o || o.img == 'called') return undefined;
		o.accessed = ++this.accessed;
		return o.img;
	}

	getSelBgCol(item, nowp) {
		return nowp || item.sel ? this.albumArtShowLabels ? lib.ui.col.imgBgSel : lib.ui.col.imgOverlaySel : RGBA(0, 0, 0, 175);
	}

	getStyle() {
		switch (libSet.artId) {
			case 0:
				return libSet.imgStyleFront;
			case 1:
				return libSet.imgStyleBack;
			case 2:
				return libSet.imgStyleDisc;
			case 3:
				return libSet.imgStyleIcon;
			case 4:
				return libSet.imgStyleArtist;
		}
	}

	load() {
		const albumArtGrpNames = $Lib.jsonParse(libSet.albumArtGrpNames, {});
		const fields = [];
		const mod = lib.pop.tree.length < 1000 ? 1 : lib.pop.tree.length < 3500 ? Math.round(lib.pop.tree.length / 1000) : 3;
		const tf_d = FbTitleFormat('[$year(%date%)]');
		this.groupField = albumArtGrpNames[`${lib.panel.grp[libSet.viewBy].type.trim()}${lib.panel.lines}`];

		lib.pop.tree.forEach((v, i) => {
			const item = v.item[0].start;
			if (item >= lib.panel.list.Count) return;
			const handle = lib.panel.list[item];
			v.handle = handle;
			const arr = lib.pop.tree[i].name.split('^@^');
			v.grp = lib.panel.lines == 1 || !libSet.albumArtFlipLabels ? arr[0] : arr[1];
			v.lot = lib.panel.lines == 2 ? !libSet.albumArtFlipLabels ? arr[1] : arr[0] : '';
			v.key = libMD5.hashStr(handle.Path + handle.SubSong + (lib.panel.lines == 1 ? (arr[0] || 'Unknown') : (`${arr[0] || 'Unknown'} - ${arr[1] || 'Unknown'}`)) + libSet.artId);
			if (libSet.itemOverlayType == 2) v.year = tf_d.EvalWithMetadb(handle).replace('0000', '');
			if (!this.groupField && !lib.panel.folderView && i % mod === 0) this.getField(handle, lib.panel.lines == 1 || libSet.albumArtFlipLabels ? v.grp : v.lot, fields);
		});
		if (!this.groupField && !lib.panel.folderView) {
			this.groupField = this.getMostFrequentField(fields) || '项';
			this.groupField = $Lib.titlecase(this.groupField);
		}

		if (libSet.rootNode) {
			if (!lib.pop.tree[0]) return;
			if (!this.groupField) this.groupField = '项';
			const plurals = this.groupField.split(' ').map(v => pluralize(v));
			const pluralField = plurals.join(' ').replace(Regex.LibTypesPlural, '$1 ').replace(Regex.LibSimilarArtist, '$1s ').replace(Regex.LibYearsAlbums, '年份 - 专辑');
			lib.pop.tree[0].key = lib.pop.tree[0].name;
			const ln1 = lib.pop.tree.length - 1;
			const ln2 = lib.panel.list.Count;
			const nm = `${!libSet.showSource ? '全部' : lib.panel.sourceName} (${ln1}${ln1 > 1 ? ` ${pluralField}` : ` ${this.groupField}`})`;
			if (libSet.rootNode == 3) lib.pop.tree[0].grp = nm;
			else if (lib.panel.lines == 1) lib.pop.tree[0].grp = lib.panel.rootName + (libSet.nodeCounts ? ` (${libSet.nodeCounts == 2 && libSet.rootNode != 3 ? ln1 + (ln1 > 1 ? ` ${pluralField}` : ` ${this.groupField}`) : ln2 + (ln2 > 1 ? ' 个音轨' : ' 个音轨')})` : '');
			if (lib.panel.lines == 2) {
				if (libSet.rootNode != 3) lib.pop.tree[0].grp = lib.panel.rootName;
				lib.pop.tree[0].lot = libSet.nodeCounts == 2 && libSet.rootNode != 3 ? ln1 + (ln1 > 1 ? ` ${pluralField}` : ` ${this.groupField}`) : ln2 + (ln2 > 1 ? ' 个音轨' : ' 个音轨');
			}
		}
		this.metrics();
		lib.panel.treePaint();
	}

	memoryLimit() {
		if (!window.JsMemoryStats) return;
		const limit = !libSet.memoryLimit ? window.JsMemoryStats.TotalMemoryLimit * 0.5 : Math.min(libSet.memoryLimit * 1048576, window.JsMemoryStats.TotalMemoryLimit * 0.8);
		return window.JsMemoryStats.TotalMemoryUsage > limit;
	}

	metrics() {
		if (!lib.ui.w || !lib.ui.h) return;
		$Lib.gr(1, 1, false, g => {
			const lineSpacing = this.labels.hide || this.labels.overlay ? Math.max(libSet.verticalAlbumArtPad - 2, 0) : libSet.verticalAlbumArtPad;
			this.letter.w = Math.round(g.CalcTextWidth('W', lib.ui.font.main));
			this.text.h = Math.max(Math.round(g.CalcTextHeight('String', lib.ui.font.group)) + lineSpacing, Math.round(g.CalcTextHeight('String', lib.ui.font.lot)) + lineSpacing, 10);
		});
		this.style = {
			dropShadow: libSet.albumArtDropShadow && libSet.albumArtLabelType != 3,
			dropShadowStub: libSet.albumArtDropShadow && libSet.albumArtLabelType != 3 && (libSet.artId == 4 || libSet.curNoCoverImg > 2),
			image: this.getStyle(),
			rootComposite: libSet.rootNode && libSet.curRootImg == 3,
			vertical: !(libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' && grSet.libraryLayout === 'full') ? true : lib.ui.h - lib.panel.search.h > lib.ui.w - lib.ui.sbar.w
		}

		this.style.dropGrad = libSet.albumArtDropShadow && !this.style.dropShadow;
		this.style.dropGradStub = libSet.albumArtDropShadow && !this.style.dropShadowStub;

		this.letter.show = libSet.albumArtLetter;
		this.letter.no = libSet.albumArtLetterNo;
		this.letter.albumArtYearAuto = libSet.albumArtYearAuto;

		switch (this.style.vertical) {
			case true: {
				this.labels = {
					hide: !libSet.albumArtLabelType,
					bottom: libSet.albumArtLabelType == 1 || (libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' && grSet.libraryLayout === 'full') && libSet.albumArtLabelType == 2,
					right: !(libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' && grSet.libraryLayout === 'full') ? libSet.albumArtLabelType == 2 : false,
					overlay: libSet.albumArtLabelType == 3 || libSet.albumArtLabelType == 4,
					overlayDark: libSet.albumArtLabelType == 4,
					flip: libSet.albumArtFlipLabels,
					statistics: libSet.itemShowStatistics ? 1 : 0
				};
				this.bor.pad = !this.labels.hide && !this.labels.overlay ? (libSet.thumbNailGapStnd == 0 ? Math.round(this.text.h * (!this.labels.right && grSet.libraryThumbnailSize !== 'playlist' ? 1.05 : 0.75)) : libSet.thumbNailGapStnd - Math.round(2 * $Lib.scale)) : libSet.thumbNailGapCompact;
				this.im.offset = Math.round(!this.labels.hide && !this.labels.overlay ? this.bor.pad / 2 : -2);

				if (this.labels.hide || this.labels.overlay) {
					this.panel.y = lib.panel.search.h + Math.round(this.bor.pad / 2);
					this.bor.bot = 0;
					this.bor.side = 0;
					this.bor.cov = libSet.thumbNailGapCompact;
				} else {
					this.panel.y = lib.panel.search.h;
					this.bor.cov = Math.round(this.bor.pad / 2);
					this.bor.side = Math.round(2 * $Lib.scale);
					this.bor.bot = this.bor.side * 2;
				}

				const margin = libSet.margin;
				this.panel.x = (libSet.sbarShow != 2 ? Math.max(margin, lib.ui.sbar.w) : margin) + lib.ui.l.w - SCALE(3);
				this.panel.w = lib.ui.w - lib.ui.l.w * 2 - (lib.ui.sbar.type == 0 || libSet.sbarShow != 2 ? Math.max(margin, lib.ui.sbar.w) * 2 + SCALE(20) : (margin * 2 + lib.ui.sbar.w) + SCALE(20));
				this.panel.h = lib.ui.h - this.panel.y;

				this.blockWidth = grSet.libraryThumbnailSize === 'playlist' ? pl.thumbnail_size + (this.bor.side * 2 + this.bor.cov * 2) :
					Math.round(lib.ui.row.h * 4 * $Lib.scale * libSet.zoomImg / 100 *
					[// Thumbnail size
						0.66,  // Mini
						1,     // Small
						1.5,   // Regular
						1.75,  // Medium
						2.5,   // Large
						3,     // XL
						3.5,   // XXL
						5      // MAX
					][libSet.thumbNailSize]);

				this.columns = (libSet.albumArtFlowMode && grSet.libraryDesign === 'flowMode' && grSet.libraryLayout === 'full') || this.labels.right ? 1 : Math.max(Math.floor(this.panel.w / this.blockWidth), 1);
				let gap = this.panel.w - this.columns * this.blockWidth;
				gap = Math.floor(gap / this.columns);
				this.columnWidth = !this.labels.right ? $Lib.clamp(this.blockWidth + (grSet.libraryThumbnailSize === 'playlist' ? 0 : gap), 10, Math.min(this.panel.w, this.panel.h)) : $Lib.clamp(this.blockWidth, 10, Math.min(this.panel.w, this.panel.h));
				this.overlayHeight = !this.labels.overlay ? 0 : (lib.panel.lines != 2 ? this.text.h * (1.2 + this.labels.statistics) : Math.round(this.text.h * (2.1 + this.labels.statistics)));
				this.im.w = Math.round(Math.max(this.columnWidth - this.bor.side * 2 - this.bor.cov * 2 - (this.labels.hide || this.labels.overlay ? 1 : 0), 10));

				if (this.labels.hide || this.labels.overlay) {
					this.im.w = Math.round(Math.max(this.columnWidth - this.bor.cov, 10));
					this.row.h = this.im.w + this.bor.cov;
				} else {
					this.im.w = Math.round(Math.max(this.columnWidth - this.bor.cov * 2 - this.bor.side * 2, 10));
					this.row.h = !this.labels.right ? this.im.w + this.text.h * (lib.panel.lines + this.labels.statistics) + this.bor.cov * 2 + this.bor.side * 2 : this.im.w + this.bor.pad + 2;
				}
				if (this.row.h > this.panel.h) {
					this.im.w -= this.row.h - this.panel.h;
					this.im.w = Math.max(this.im.w, 10);
					this.row.h = this.panel.h;
				}
				this.box.w = this.columnWidth - this.bor.side * 2;
				this.box.h = this.row.h - (!this.labels.right ? this.bor.side * 2 : 0);
				lib.panel.rows = Math.max(Math.floor(this.panel.h / this.row.h));
				lib.sbar.metrics(lib.sbar.x, lib.sbar.y, lib.sbar.w, lib.sbar.h, lib.panel.rows, this.row.h, this.style.vertical);
				lib.sbar.setRows(Math.ceil(lib.pop.tree.length / this.columns));
				break;
			}
			case false: { // only H-Flow
				this.labels = {
					hide: !libSet.albumArtLabelType,
					bottom: libSet.albumArtLabelType == 1 || libSet.albumArtLabelType == 2,
					right: false,
					overlay: libSet.albumArtLabelType == 3 || libSet.albumArtLabelType == 4,
					overlayDark: libSet.albumArtLabelType == 4,
					flip: libSet.albumArtFlipLabels,
					statistics: libSet.itemShowStatistics ? 1 : 0
				};
				this.bor.pad = !this.labels.hide && !this.labels.overlay ? (libSet.thumbNailGapStnd == 0 ? Math.round(this.text.h * 1.05) : libSet.thumbNailGapStnd - Math.round(2 * $Lib.scale)) : libSet.thumbNailGapCompact;
				this.im.offset = Math.round(!this.labels.hide && !this.labels.overlay ? this.bor.pad / 2 : -2);
				if (this.labels.hide || this.labels.overlay) {
					this.bor.bot = 0;
					this.bor.side = 0;
					this.bor.cov = libSet.thumbNailGapCompact;
				} else {
					this.bor.cov = Math.round(this.bor.pad / 2);
					this.bor.side = Math.round(2 * $Lib.scale);
					this.bor.bot = this.bor.side * 2;
				}
				this.panel.x = 0;
				const spacer = this.letter.show ? (this.labels.bottom ? this.text.h * 0.5 - this.bor.pad / 4 : this.text.h * 0.75) : (this.labels.bottom ? 0 : Math.round(this.bor.pad / 2));
				this.panel.y = lib.panel.search.h + spacer - SCALE(3);
				this.panel.h = lib.ui.h - this.panel.y - lib.ui.l.w * 3 - spacer - lib.ui.sbar.w - SCALE(34);

				this.panel.w = lib.ui.w;
				if (!this.labels.hide && !this.labels.overlay) {
					this.row.h = this.panel.h;
					const extra = this.text.h * (lib.panel.lines + this.labels.statistics) + this.bor.cov * 2 + this.bor.side * 2;
					this.im.w = Math.min(this.panel.h - extra, this.panel.h - extra);
					this.im.w = $Lib.clamp(this.im.w, 10, Math.round(this.panel.w - (this.bor.cov * 2 + this.bor.side * 2)));
					this.blockWidth = this.im.w + this.bor.cov * 2 + this.bor.side * 2;
					this.row.h = this.im.w + extra;
				} else {
					const extra = this.bor.cov;
					this.im.w = Math.min(this.panel.h - extra, this.panel.h - extra);
					this.im.w = $Lib.clamp(this.im.w, 10, Math.round(this.panel.w - this.bor.cov));
					this.blockWidth = this.im.w + this.bor.cov;
					this.row.h = this.im.w + extra;
				}
				this.columns = Math.max(Math.floor(this.panel.w / this.blockWidth), 1);
				this.overlayHeight = !this.labels.overlay ? 0 : (lib.panel.lines != 2 ? this.text.h * (1.2 + this.labels.statistics) : Math.round(this.text.h * (2.1 + this.labels.statistics)));
				this.box.w = this.blockWidth - this.bor.side * 2;
				this.box.h = this.row.h - this.bor.bot;
				lib.panel.rows = Math.max(Math.floor(this.panel.w / this.blockWidth));
				this.columnWidth = this.blockWidth;

				lib.sbar.metrics(lib.sbar.x, lib.sbar.y, lib.ui.w, lib.ui.sbar.w, lib.panel.rows, this.blockWidth, this.style.vertical);
				lib.sbar.setRows(Math.ceil(lib.pop.tree.length));
				break;
			}
		}

		this.cellWidth = Math.max(200, Math.min(320, this.im.w / 2));
		this.labels.counts = libSet.itemOverlayType != 1 && libSet.nodeCounts;
		this.style.y = this.style.vertical ? Math.floor(this.panel.y + (!this.labels.hide && !this.labels.overlay ? libSet.thumbNailGapStnd / 2 : libSet.thumbNailGapCompact / 2)) : this.panel.y;
		if (this.style.dropShadow) this.getShadow();

		if (!this.labels.hide) {
			if (!this.labels.overlay) {
				this.text.x = !this.labels.right ? Math.round((this.box.w - this.im.w) / 2) : Math.max(Math.round((this.box.w - this.im.w) / 2), 5 * $Lib.scale) * 2 + this.im.w;
				this.text.y1 = !this.labels.right ? this.im.w + Math.round(this.bor.cov * 0.5) : Math.round((this.im.w - this.text.h * lib.panel.lines) / 2) - (this.labels.statistics ? this.text.h / 2 : 0);
				this.text.y2 = !this.labels.right ? Math.round(this.text.y1 + this.text.h * 0.95) : this.text.y1 + this.text.h;
				this.text.y3 = !this.labels.right ? Math.round(this.text.y2 + this.text.h * 0.95) : this.text.y2 + this.text.h;
				this.text.w = !this.labels.right ? this.im.w : this.panel.w - this.text.x - 12;
			} else {
				this.text.x = Math.round(10 + (libSet.thumbNailGapCompact - 3) / 2);
				this.text.y1 = Math.round(this.im.w - this.overlayHeight + 2 + (this.overlayHeight - this.text.h * (lib.panel.lines + this.labels.statistics)) / 2);
				this.text.w = this.box.w - 20 - libSet.thumbNailGapCompact - 6;
				libSet.thumbNailGapCompact = 22;
			}
		}

		this.cachesize.min = lib.panel.rows * this.columns * 3 + (this.albumArtDiskCache ? lib.panel.rows * 2 : lib.panel.rows) * this.columns * 2;
		this.createImages();
		this.getCurrentDatabase();
		if (libSet.albumArtPreLoad && !this.zooming && this.albumArtDiskCache) this.getItemsToDraw(true);
		this.setNoArtist();
		this.setNoCover();
		this.setRoot();
		if (this.style.rootComposite) this.checkRootImg();
		const stub = libSet.artId != 4 ? this.no_cover_img : this.no_artist_img;
		if (stub) this.stub.noImg = this.format(stub, libSet.artId, ['default', 'default', 'circular'][this.style.image], this.im.w, this.im.w, libSet.albumArtLabelType == 3, 'noImg');
		if (this.root_img) this.stub.root = this.format(this.root_img, libSet.artId, 'default', this.im.w, this.im.w, libSet.albumArtLabelType == 3, 'root');
		lib.panel.treePaint();
	}

	needTrim(n, ratio) {
		return n || Math.abs(ratio - 1) >= 0.05;
	}

	newDatabase() {
		return {
			'-----------group key------------': '-----------image key------------.jpg'
		};
	}

	on_key_down() {
		this.zooming = lib.vk.k('zoom');
		if (this.zooming) {
			clearInterval(this.timer.preLoad);
			this.timer.preLoad = null;
		}
	}

	on_key_up() {
		if (this.zooming && this.zooming != lib.vk.k('zoom')) {
			this.zooming = false;
			if (libSet.albumArtPreLoad && this.albumArtDiskCache && lib.panel.imgView) this.metrics();
			lib.panel.treePaint();
		}
	}

	preLoad() {
		if (!this.isImageViewVisible()) return;
		this.preLoadItems = [];
		const begin = this.start == 0 ? libSet.rootNode ? 1 : 0 : this.start;
		const end = this.end != 0 ? Math.min(this.end + this.columns, lib.pop.tree.length) : this.end;
		for (let i = begin; i < end; i++) {
			const v = this.getItem(i);

			if (v) {
				const key = v.key;
				if (!this.cache[key]) {
					this.cache[key] = {
						img: 'called',
						accessed: ++this.accessed
					};
					this.load_image_async(key, this.cacheFolder + this.database[key], v.ix, true);
				}
			}
		}

		const upBegin = this.start == 0 ? libSet.rootNode ? 1 : 0 : this.start - 1;
		const upEnd = libSet.rootNode ? 1 : 0;
		const downBegin = this.end != 0 ? Math.min(this.end + 1 + this.columns, lib.pop.tree.length) : this.end;
		const downEnd = lib.pop.tree.length;

		const doPreload = () => {
			clearInterval(this.timer.preLoad);
			this.timer.preLoad = null;
			let i = downBegin;
			let j = upBegin;
			if (i < downEnd || j > upEnd) {
				this.timer.preLoad = setInterval(() => {
					if (!this.isImageViewVisible()) { clearInterval(this.timer.preLoad); this.timer.preLoad = null; return; }
					let v = null;
					if (i < downEnd || j > upEnd) { // interleave
						if (i < downEnd) v = this.getItem(i++);
						if (v) {
							const key = v.key;
							if (!this.cache[key]) {
								this.cache[key] = {
									img: 'called',
									accessed: 0
								};
								this.load_image_async(key, this.cacheFolder + this.database[key], v.ix, true);
							}
						}

						if (j > upEnd) v = this.getItem(j--);
						if (v) {
							const key = v.key;
							if (!this.cache[key]) {
								this.cache[key] = {
									img: 'called',
									accessed: 0
								};
								this.load_image_async(key, this.cacheFolder + this.database[key], v.ix, true);
							}
						}
					} else {
						clearInterval(this.timer.preLoad);
						this.timer.preLoad = null;
					}
		}, this.interval.preLoad);
			}
		};

		doPreload();
	}

	refresh(items) {
		let itemsToRemove = [];
		if (items === 'all') {
			if (!libSet.albumArtDiskCache) return;
			const continue_confirmation = (status, confirmed) => {
				if (confirmed) {
					try {
						this.clearCache();
						const app = new ActiveXObject('Shell.Application');
						app.NameSpace(10).MoveHere(this.cachePath); // remove all saved images & databases if albumArtDiskCache
					} catch (e) {
						$Lib.trace('无法清空图片缓存：可以在windows资源管理器中清空'); // Wine fix
					}
				}
			};
			const caption = '刷新全部图片';
			const prompt = '此操作将重置曲库（library tree）缩略图磁盘缓存\n\n继续?';
			const wsh = lib.popUpBox.isHtmlDialogSupported() ? lib.popUpBox.confirm(caption, prompt, '是', '否', false, 'center', continue_confirmation) : true;
			if (wsh) continue_confirmation('ok', $Lib.wshPopup(prompt, caption));
			return;
		}

		const allSelected = lib.pop.sel_items.length == fb.GetLibraryItems().Count;
		const base = this.cachePath + ['front', 'back', 'disc', 'icon', 'artist'][libSet.artId];
		const databases = [`${base}\\database.dat`, `${base}500\\database.dat`, `${base}750\\database.dat`];
		if (allSelected) {
			this.clearCache(); // full clear of working cache
			if (!libSet.albumArtDiskCache) return;
			this.database = this.newDatabase(); // full clear of databases for current image type
			databases.forEach(v => {
				if ($Lib.file(v)) $Lib.save(v, JSON.stringify(this.newDatabase(), null, 3), true);
			});
			return;
		}

		// refresh selected images
		items.Convert().forEach(v => {
			const item = lib.panel.list.Find(v);
			let ind = -1;
			lib.pop.tree.forEach((v, j) => {
				if (!v.root && lib.pop.inRange(item, v.item)) ind = j;
			});
			if (ind != -1) itemsToRemove.push(lib.pop.tree[ind].key);
		});
		itemsToRemove = [...new Set(itemsToRemove)];
		itemsToRemove.forEach(v => this.trimCache(v)); // clear working cache of selected keys: won't check if same images are used with other keys
		if (!libSet.albumArtDiskCache) return;
		let imgsToRemove = itemsToRemove.map(v => this.database[v]);
		imgsToRemove = [...new Set(imgsToRemove)];
		databases.forEach(v => {
			if ($Lib.file(v)) {
				const cur_db = v == `${this.cacheFolder}database.dat`;
				const imgDatabase = $Lib.jsonParse(v, this.newDatabase(), 'file');
				Object.entries(imgDatabase).forEach(w => { // clear working cache & database of all keys that reference a particular image: this should always work even if images in use
					if (w[0] != '-----------group key------------') {
						if (imgsToRemove.includes(w[1]) || !$Lib.file(this.cacheFolder + w[1])) { // images are refreshed as loaded, overwriting existing
							if (cur_db) this.trimCache(w[0]);
							delete imgDatabase[w[0]];
						}
					}
				});
				Object.entries(imgDatabase).forEach(w => {
					if (w[0] != '-----------group key------------') {
						if (w[1] != 'noAlbumArt' && !$Lib.file(this.cacheFolder + w[1])) delete imgDatabase[w[0]];
					}
				}); // remove any user deleted images from database
				$Lib.save(v, JSON.stringify(imgDatabase, null, 3), true);
			}
		});
		this.getCurrentDatabase();
	}

	setNoArtist() {
		this.artist_images = lib_my_utils.getImageAssets('noArtist').sort();
		libSet.curNoArtistImg = $Lib.clamp($Lib.value(libSet.curNoArtistImg, 0, 0), 0, this.artist_images.length - 1);
		const artistImages = this.artist_images.map(v => ({
			name: utils.SplitFilePath(v)[1],
			path: `file://${v.replace('noArtist', 'noArtist/small')}`
		}));
		this.no_artist_img = gdi.Image(this.artist_images[libSet.curNoArtistImg]);
		libSet.noArtistImages = JSON.stringify(artistImages);
	}

	setNoCover() {
		this.cover_images = lib_my_utils.getImageAssets('noCover').sort();
		libSet.curNoCoverImg = $Lib.clamp($Lib.value(libSet.curNoCoverImg, 0, 0), 0, this.cover_images.length - 1);
		const coverImages = this.cover_images.map(v => ({
			name: utils.SplitFilePath(v)[1],
			path: `file://${v.replace('noCover', 'noCover/small')}`
		}));
		this.no_cover_img = gdi.Image(this.cover_images[libSet.curNoCoverImg]);
		libSet.noCoverImages = JSON.stringify(coverImages);
	}

	setRoot() {
		this.root_images = lib_my_utils.getImageAssets('root').sort();
		libSet.curRootImg = $Lib.clamp($Lib.value(libSet.curRootImg, 0, 0), 0, this.root_images.length - 1);
		const rootImages = this.root_images.map(v => ({
			name: utils.SplitFilePath(v)[1],
			path: `file://${v.replace('root', 'root/small')}`
		}));
		if (libSet.rootNode && libSet.curRootImg == 3) {
			this.style.rootComposite = true;
			this.root_img = null;
		} else {
			this.style.rootComposite = false;
			this.root_img = gdi.Image(this.root_images[libSet.curRootImg]);
		}
		libSet.rootImages = JSON.stringify(rootImages);
	}

	sort(data, prop) {
		data.sort((a, b) => a[prop] - b[prop]);
		return data;
	}

	sortCache(o, prop) {
		const sorted = {};
		Object.keys(o).sort((a, b) => o[a][prop] - o[b][prop]).forEach(key => sorted[key] = o[key]);
		return sorted;
	}

	trimCache(key) {
		delete this.cache[key];
	}

	trimSaveQueue() {
		let pixels = this.toSave.reduce((sum, o) => sum + (o.image ? o.image.Width * o.image.Height : 0), 0);
		while (this.toSave.length > 24 || this.toSave.length > 1 && pixels > 2000000) {
			const old = this.toSave.pop();
			if (old.image) pixels -= old.image.Width * old.image.Height;
		}
	}

	saveNextImage() {
		const item = this.toSave.pop();
		try {
			if (item && (item.setKeyOnly || item.image.SaveAs(item.folder + item.saveName, 'image/jpeg'))) {
				this.database[item.key] = item.saveName;
				this.imageDatabaseDirty = true;
			}
			if (item && this.imageDatabaseDirty && (!this.toSave.length || Date.now() - (this.imageDatabaseSavedAt || 0) >= 5000)) {
				$Lib.save(`${item.folder}database.dat`, JSON.stringify(this.database, null, 3), true);
				this.imageDatabaseDirty = false; this.imageDatabaseSavedAt = Date.now();
			}
		} catch (e) { $Lib.trace(`thumbnail cache write skipped: ${e.message || e}`); }
		finally {
			if (!this.toSave.length) { clearInterval(this.timer.save); this.timer.save = null; }
		}
	}

	/** Preserve the original one-pixel crop without asking D2D to read past the source. */
	drawThumbnailImage(gr, image, x, y) {
		if (!image || ![image.Width, image.Height].every(value => Number.isFinite(value) && value >= 1)) return;
		const inset = grSet.libraryThumbnailBorder === 'border' ? 0 : Math.min(1, image.Width - 1, image.Height - 1);
		gr.DrawImage(image, x, y, image.Width - inset, image.Height - inset,
			inset, inset, image.Width - inset, image.Height - inset);
	}

	shutdownImages() {
		this.cancelFlowIdle();
		this.imagesClosed = true;
		this.clearCache();
		for (const key of ['load', 'preLoad', 'save']) { clearInterval(this.timer[key]); this.timer[key] = null; }
		this.toSave = []; this.preLoadItems = [];
		this.drawDebounce?.cancel?.(); this.loadThrottle?.cancel?.(); this.rootDebounce?.cancel?.(); this.sizeDebounce?.cancel?.();
	}
}

/**
 * The instance of `LibImages` class for library image operations.
 * @typedef {LibImages}
 * @global
 */
const libImg = new LibImages();
