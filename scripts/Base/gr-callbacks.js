////////////////////////////////////////////////////////////////////////
// * Georgia-ReBORN: 一个简洁、全动态的颜色重生 - Foobar2000 播放器 * //
// * 类型:           Georgia-ReBORN 调用                            * //
// * 作者:           TT                                             * //
// * 网站:           https://github.com/TT-ReBORN/Georgia-ReBORN    * //
// * 版本:           3.0-x64-DEV                                    * //
// * 开发开始:       22-12-2017                                     * //
// * 最后更改:       06-07-2026                                     * //
////////////////////////////////////////////////////////////////////////


'use strict';


////////////////////////
// * MAIN CALLBACKS * //
////////////////////////
/**
 * Called when thread created by gdi.LoadImageAsync is done.
 * @global
 * @param {number} cookie - The return value from the gdi.LoadImageAsync call.
 * @param {GdiBitmap} imagenullable - Null on failure (invalid path/not an image).
 * @param {string} image_path - The path that was originally supplied to gdi.LoadImageAsync.
 */
function on_load_image_done(cookie, imagenullable, image_path) {
	grm.debug.callLog('简介 => 加载_图片_完成');
	bio.call.on_load_image_done(cookie, imagenullable, image_path);
}


/**
 * Called when metadb contents change, i.e tag or database updates.
 * @global
 * @param {FbMetadbHandleList} [handle_list] - Can be undefined when called manually from on_playback_new_track.
 * @param {boolean} [fromhook] - True if notification is not from tag update, but a component that provides tag-like data from a database.
 */
function on_metadb_changed(handle_list, fromhook) {
	grm.debug.debugLog(`播放 => 元数据库_已更改(): ${handle_list ? handle_list.Count : '0'} 个句柄, 来自钩子: ${fromhook}`);

	grm.ui.handlePlaybackMetadb(handle_list);

	// * Not called manually from on_playback_new_track
	if (handle_list) {
			grm.debug.callLog('播放列表 => 元数据库_已更改');
		pl.call && pl.call.on_metadb_changed(handle_list, fromhook); // Always process for Playlist: keeps caches fresh even when hidden

		if (grm.ui.displayLibrary) {
			grm.debug.callLog('曲库 => 元数据库_已更改');
			lib.call && lib.call.on_metadb_changed(handle_list, fromhook);
		}
		if (grm.ui.displayBiography) {
			grm.debug.callLog('简介 => 元数据库_已更改');
			bio.call && bio.call.on_metadb_changed(handle_list, fromhook);
		}
	}

	window.Repaint();
}


/**
 * Called when playing a new track.
 * @global
 * @param {FbMetadbHandle} metadb - The metadb of the track.
 */
function on_playback_new_track(metadb) {
	if (!metadb) return; // Solve weird corner case

	grm.debug.setDebugProfile(grm.debug.showDebugTiming || grCfg.settings.showDebugPerformanceOverlay, 'create', '播放_新的_音轨');
	grm.debug.debugLog('播放 => 播放_新的_音轨()');

	grm.ui.handlePlaybackNewTrack(metadb);
	grm.details.updateTurntableState();
	pl.call.on_playback_new_track(metadb); // Always process for Playlist: updates now-playing state even when hidden

	if (grm.ui.displayLibrary) {
		lib.call.on_playback_new_track(metadb);
	}
	if (grm.ui.displayBiography) {
		bio.call.on_playback_new_track();
	}

	grm.debug.setDebugProfile(false, 'print', '播放_新的_音轨');
}


/**
 * Called when drawing graphics.
 * Draws the main user interface.
 * @global
 * @param {GdiGraphics} gr - The GDI graphics object.
 */
function on_paint(gr) {
	grAnimationManager.syncWindowVisibility();
	if (!grm.ui.loadingThemeComplete) {
		grPreloader.drawPreloader(gr);
		return;
	}
	grm.ui.drawMain(gr);
}


/**
 * Called when window is being resized.
 *
 * !IMPORTANT: Do NOT call window.Repaint from this callback!
 * @global
 */
function on_size() {
	const width = window.Width, height = window.Height;
	const visible = window.IsVisible !== false && width > 0 && height > 0;
	grAnimationManager.syncWindowVisibility(visible);
	// Retain valid geometry while minimized; zero-size events must not clear artwork caches.
	if (!visible) return;
	if (!grAnimationManager.resizing && grm.display.sizeInitialized && grm.details.isTurntableActive() &&
		width === grm.ui.ww && height === grm.ui.wh) {
		grm.details.syncImmersiveWindowState();
		grAnimationManager.requestRepaint();
		return;
	}
	grm.ui.ww = width;
	grm.ui.wh = height;
	grAnimationManager.beginResize();
	grm.details.syncImmersiveWindowState();
	if (grm.details.immersiveMode && grm.details.immersiveWindowConfirmedFullscreen) {
		// UIWizard's WindowState may update just after this size event.
		// A native restore must also refresh the ordinary layout and glyph.
		clearTimeout(grm.details.immersiveWindowSyncTimer);
		grm.details.immersiveWindowSyncTimer = setTimeout(() => {
			grm.details.immersiveWindowSyncTimer = null;
			const wasImmersive = grm.details.immersiveMode;
			grm.details.syncImmersiveWindowState();
			if (wasImmersive && !grm.details.immersiveMode) on_size();
		}, 80);
	}

	grm.debug.debugLog(`大小调整() => 宽: ${grm.ui.ww}, 高: ${grm.ui.wh}`);

	if (grm.ui.ww < 1 || grm.ui.wh < 1) return;

	grm.ui.clearCache('metrics');
	grm.details.clearCache('metrics');
	grm.display.checkRes();

	if (grm.ui.displayDetails && grm.details.immersiveMode) {
		// Immersive mode uses the Details geometry only. Mouse wake can restore
		// its complete interface without rebuilding unrelated panels or waveform.
		grm.ui.setMainMetrics();
		grm.ui.resizeArtwork(true);
		grm.button.createButtons(grm.ui.ww, grm.ui.wh, false);
		if (!grm.details.immersiveUiVisible) grm.details.setImmersiveCursorHidden(true);
		grm.display.sizeInitialized = true;
		window.Repaint();
		return;
	}

	if (!grm.display.sizeInitialized) {
		grm.ui.initPanels();
		grm.display.sizeInitialized = true;
	} else {
		grm.ui.setMainMetrics();
		grm.ui.setMainComponents('all');
		grm.ui.resizeArtwork(true);
		grm.button.createButtons(grm.ui.ww, grm.ui.wh, false);
		grm.ui.setPlaylistSize();
		grm.ui.setLibrarySize();
		grm.ui.setBiographySize();
	}

	grm.bgImg.initBgImage(false, true);
	grm.details.isLyricsVisible() && grm.lyrics.initLyrics();
	grm.colorStyles.setStyleBlend();
	grm.button.initButtonState();
}


/////////////////////////////////////////////////////////////////////////////
// * ASYNC NETWORK CALLBACKS - SINCE SMP 1.7.25.12.8 AND JSplitter 3.7.4 * //
/////////////////////////////////////////////////////////////////////////////
/**
 * Called when {@link utils.DownloadFileAsync} thread is finished
 * New callback and only available since SMP v1.7.25.12.8 or JSplitter v3.7.4/v4.0.4.4-beta.
 * @global
 * @param {string} path - The path of the downloaded file.
 * @param {boolean} success - The success message if the download was successful.
 * @param {string} error_text - The error message if the download failed.
 */
function on_download_file_done(path, success, error_text) {
	if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => on_download_file_done');
		lib.call.on_download_file_done(path, success, error_text);
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => on_download_file_done');
		bio.call.on_download_file_done(path, success, error_text);
	}
}


/**
 * Called when {@link utils.HTTPRequestAsync} request is finished
 * New callback and only available with SMP v1.7.25.12.8 or JSplitter v3.7.4/v4.0.4.4-beta.
 * @global
 * @param {number} task_id - The task id returned by {@link utils.HTTPRequestAsync}
 * @param {boolean} success - The state whether the request was successful.
 * @param {string} response_text - The response body as text.
 * @param {string} status - The HTTP response code.
 * @param {string} content_type - The 'Content-Type' HTTP response header.
 */
function on_http_request_done(task_id, success, response_text, status, content_type) {
	if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => on_http_request_done');
		lib.call.on_http_request_done(task_id, success, response_text, status, content_type);
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => on_http_request_done');
		bio.call.on_http_request_done(task_id, success, response_text, status, content_type);
	}
}


/////////////////////////////////
// * USER ACTIVITY CALLBACKS * //
/////////////////////////////////
/**
 * Called when using letter keystrokes from keyboard.
 *
 * Note: in order to use this callback, use window.DlgCode(DLGC_WANTCHARS).
 * See Flags.js > DLGC_WANTCHARS.
 * @global
 * @param {number} code - The character code.
 */
function on_char(code) {
	if (grm.colorDebug.handleAPCACalibrationChar(code)) return;

	if (grm.ui.displayCustomThemeMenu || grm.ui.displayMetadataGridMenu) {
		grm.debug.callLog('自定义菜单 => 字符');
		grm.cusMenu.on_char(code);
	}
	else if (grm.ui.displayPlaylist && !grm.ui.displayLibrary || !grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayLibrarySplit(true)) {
		grm.debug.callLog('播放列表 => 字符');
		const text = String.fromCharCode(code);

		if (!grSet.jumpSearchDisabled && !(grm.jSearch.jSearch === '' && text === ' ')) {
			grm.jSearch.on_char(code);

			// Switch back to Playlist logic
			if (grSet.layout === 'default' && grm.ui.displayDetails) {
				grm.button.btn.details.onClick();
			}
			else if (grSet.layout === 'artwork' && !grm.ui.displayPlaylistArtwork && !grm.ui.displayLibrary) {
				grm.button.btn.playlist.onClick();
			}
		}
	}
	else if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 字符');
		lib.call.on_char(code);
	}
}


/**
 * Called when mouse with content enters another window and determines if that window is a valid drop target.
 *
 * 1. Called first.
 *
 * See fb.DoDragDrop documentation and samples/basic/DragnDrop.txt.
 * @global
 * @param {DropTargetAction} action - The type of drag action being performed.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} mask - The mouse mask.
 */
function on_drag_enter(action, x, y, mask) {
	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 拖动_输入');
		pl.call.on_drag_enter(action, x, y, mask);
	}
}


/**
 * Called when content with mouse moves but stays within the same window.
 *
 * 2. Called after on_drag_enter.
 *
 * See fb.DoDragDrop documentation and samples/basic/DragnDrop.txt.
 * @global
 * @param {DropTargetAction} action - The type of drag action being performed.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} mask - The mouse mask.
 */
function on_drag_over(action, x, y, mask) {
	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 拖动_结束');
		pl.call.on_drag_over(action, x, y, mask);
	}
}


/**
 * Called when mouse with content is being dragged outside of window.
 *
 * 3. Called after on_drag_over.
 *
 * See fb.DoDragDrop documentation and samples/basic/DragnDrop.txt.
 * @global
 */
function on_drag_leave() {
	if (grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) {
		grm.debug.callLog('播放列表 => 拖动_离开');
		pl.call.on_drag_leave();
	}
}


/**
 * Called when mouse with content is being dropped.
 *
 * 4. Called after on_drag_over.
 *
 * See fb.DoDragDrop documentation and samples/basic/DragnDrop.txt.
 * @global
 * @param {DropTargetAction} action - The type of drag action being performed.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} mask - The mouse mask.
 */
function on_drag_drop(action, x, y, mask) {
	if (grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) {
		grm.debug.callLog('播放列表 => 拖动_放入');
		pl.call.on_drag_drop(action, x, y, mask);
	}
}


/**
 * Called when the panel gets or loses focus.
 * @global
 * @param {boolean} is_focused - Whether the panel is focused.
 */
function on_focus(is_focused) {
	if (grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) {
		grm.debug.callLog('播放列表 => 焦点');
		pl.call.on_focus(is_focused);
	}
	else if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 焦点');
		lib.call.on_focus(is_focused);
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 焦点');
		bio.call.on_focus(is_focused);
	}
	if (is_focused) {
		plman.SetActivePlaylistContext(); // When the panel gets focus but not on every click.
	} else {
		grm.ui.clearTimer('hideCursor'); // Not sure this is required, but I think the mouse was occasionally disappearing
	}
}


/**
 * Called when focused item in panel has been changed.
 * @global
 * @param {number} playlistIndex - The index of the playlist.
 * @param {number} from - The index of the previously focused item.
 * @param {number} to - The index of the item that is gaining focus.
 */
function on_item_focus_change(playlistIndex, from, to) {
	if (grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) {
		grm.debug.callLog('播放列表 => 项目_焦点_更改');
		pl.call.on_item_focus_change(playlistIndex, from, to);
	}
	else if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 项目_焦点_更改');
		lib.call.on_item_focus_change();
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 项目_焦点_更改');
		bio.call.on_item_focus_change();
	}
}


/**
 * Called when pressing down keyboard keys.
 *
 * Requires "Grab focus" enabled in the Configuration window.
 *
 * In order to use arrow keys, use window.DlgCode(DLGC_WANTARROWS) (see Flags.js > DLGC_WANTARROWS).
 *
 * Note: keyboard shortcuts defined in the main preferences are always executed first and are not passed to the callback.
 * @global
 * @param {number} vkey - The virtual key code.
 */
function on_key_down(vkey) {
	if (grCfg.settings.showDebugAPCACalibrationOverlay) {
		grm.colorDebug.handleAPCACalibrationKey(vkey);
		return;
	}

	if (grm.ui.displayCustomThemeMenu || grm.ui.displayMetadataGridMenu) {
		grm.debug.callLog('自定义菜单 => 键_下');
		grm.cusMenu.on_key_down(vkey);
	}
	else {
		if (grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) {
			grm.debug.callLog('播放列表 => 键_下');
			if (SuppressKey(vkey)) return;
			pl.call.on_key_down(vkey);
		}
		else if (grm.ui.displayLibrary) {
			grm.debug.callLog('曲库 => 键_下');
			lib.call.on_key_down(vkey);
		}
		if (grm.ui.displayBiography) {
			grm.debug.callLog('简介 => 键_下');
			bio.call.on_key_down(vkey);
		}
	}

	grm.ui.handleKeyAction(vkey);
	grm.display.handleWindowControl('key');
}


/**
 * Called when releasing keyboard keys from pressed state.
 *
 * Requires "Grab focus" enabled in the Configuration window.
 *
 * In order to use arrow keys, use window.DlgCode(DLGC_WANTARROWS) (see Flags.js > DLGC_WANTARROWS).
 * @global
 * @param {number} vkey - The virtual key code.
 */
function on_key_up(vkey) {
	if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 键_上');
		lib.call.on_key_up(vkey);
	}
	else if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 键_上');
		bio.call.on_key_up(vkey);
	}
}


/**
 * Called when adding new songs to the media library index.
 * @global
 * @param {FbMetadbHandleList} handle_list - The handle list of the library items.
 */
function on_library_items_added(handle_list) {
	grm.debug.callLog('曲库 => 库_项_已添加');
	lib.call.on_library_items_added(handle_list);

	grm.debug.callLog('简介 => 库_项_已添加');
	bio.call.on_library_items_added(handle_list);
}


/**
 * Called when media library is being changed, i.e updated by removing/adding tracks.
 * @global
 * @param {FbMetadbHandleList} handle_list - The handle list of the library items.
 */
function on_library_items_changed(handle_list) {
	grm.debug.callLog('曲库 => 库_项_已更改');
	lib.call.on_library_items_changed(handle_list);

	grm.debug.callLog('简介 => 库_项_已更改');
	bio.call.on_library_items_changed(handle_list);
}


/**
 * Called when removing songs from the media library index.
 * @global
 * @param {FbMetadbHandleList} handle_list - The handle list of the library items.
 */
function on_library_items_removed(handle_list) {
	grm.debug.callLog('简介 => 库_项_已移除');
	lib.call.on_library_items_removed(handle_list);

	grm.debug.callLog('简介 => 库_项_已移除');
	bio.call.on_library_items_removed(handle_list);
}


/**
 * Called when double clicking the left mouse button.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} m - The mouse mask.
 */
function on_mouse_lbtn_dblclk(x, y, m) {
	if (grm.ui.displayCustomThemeMenu || grm.ui.displayMetadataGridMenu) return;

	if ((grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) && mouseInPlaylist(x, y)) {
		grm.debug.callLog('播放列表 => 鼠标_按钮_双击');
		pl.call.on_mouse_lbtn_dblclk(x, y, m);
	}
	else if (grm.ui.displayLibrary && mouseInLibrary(x, y)) {
		grm.debug.callLog('简介 => 鼠标_按钮_双击');
		lib.call.on_mouse_lbtn_dblclk(x, y, m);
	}
	else if (grm.ui.displayBiography && mouseInBiography(x, y)) {
		grm.debug.callLog('简介 => 鼠标_按钮_双击');
		bio.call.on_mouse_lbtn_dblclk(x, y, m);
	}
	else {
		grm.ui.clearTimer('presetIndicator');
		grm.ui.doubleClicked = true;
		if (fb.IsPlaying && !grm.button.mouseInControl && mouseInLowerBar(x, y)) {
			grm.debug.callLog('底栏 => 鼠标_按钮_双击');
			// * Refresh theme
			if (grCfg.settings.doubleClickRefresh) {
				grm.ui.refreshTheme();
			}
			// * Pick a new random theme preset
			else if (grSet.presetAutoRandomMode === 'dblclick') {
				grm.ui.themePresetIndicator = true;
				grm.preset.generateRandomThemePreset();
			}
			// * Generate a new color in Random theme
			else if (grSet.theme === 'random') {
				grm.ui.initTheme();
				grm.debug.debugLog('\n>>> 初始化主题 => 鼠标_按钮_双击 => 随机主题 <<<\n');
			}
		}
	}
}


/**
 * Called when left mouse button is pressed.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} m - The mouse mask.
 */
function on_mouse_lbtn_down(x, y, m) {
	SetCursor('Arrow');
	if (grm.ui.displayDetails && grm.details.immersiveMode && !grm.details.immersiveUiVisible) {
		grm.details.immersiveWakeClickPending = true;
		grm.details.wakeImmersiveUi(true);
		return;
	}
	if (grm.ui.displayDetails && grm.details.immersiveMode) grm.details.wakeImmersiveUi(true);
	const turntableControl = grm.details.getTurntableControlAt(x, y);
	grm.details.turntableControlPressed = turntableControl;
	if (turntableControl) {
		return;
	}

	// The compact glyph is deliberately drawn outside the rectangular caption-button system,
	// so it retains the original lightweight visual while still owning a dedicated hit area.
	if (grm.ui.displayDetails && grm.details.mouseInImmersiveButton(x, y)) {
		// The glyph is not one of TT's native buttons: exclude it from the
		// draggable pseudo-caption before the host processes this click.
		try {
			UIWizard.SetCaptionAreaSize(0, 0, 0, 0);
			grm.display.pseudoCaption = false;
		} catch (e) {}
		grm.details.beginImmersiveButtonClick();
		return;
	}
	if (grm.details.immersiveButtonPressed) grm.details.cancelImmersiveButtonClick();
	if (grm.ui.displayDetails && grm.details.immersiveMode && grm.button.activeButton &&
		grm.button.activeButton.id === 'Maximize') {
		grm.button.on_mouse_lbtn_down(x, y, m);
		return;
	}
	if (grm.button) {
		grm.button.on_mouse_lbtn_down(x, y, m);
	}

	if (grSet.seekbar === 'progressbar' && grm.progBar.mouseInThis(x, y)) {
		grm.debug.callLog('滚动条 => 鼠标_按钮_下');
		grm.progBar.on_mouse_lbtn_down(x, y);
	}
	else if (grSet.seekbar === 'peakmeterbar' && grm.peakBar.mouseInThis(x, y)) {
		grm.debug.callLog('峰值条 => 鼠标_按钮_下');
		grm.peakBar.on_mouse_lbtn_down(x, y);
	}
	else if (!grm.volBtn.on_mouse_lbtn_down(x, y, m)) { // Not handled by volumeBtn
		if (grSet.showProgressBar_layout && mouseInSeekbar(x, y)) {
			grm.ui.handleSeekbarPlayback(x);
		}

		if (grm.ui.displayCustomThemeMenu || grm.ui.displayMetadataGridMenu) {
			grm.debug.callLog('自定义菜单 => 鼠标_按钮_下');
			grm.cusMenu.on_mouse_lbtn_down(x, y, m);
		}

		if (grCfg.updateHyperlink && !fb.IsPlaying && grCfg.updateHyperlink.trace(x, y)) {
			grm.debug.callLog('超链接 => 鼠标_按钮_下');
			grCfg.updateHyperlink.click();
		}

		if ((grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) && mouseInPlaylist(x, y)) {
			if (grm.ui.displayCustomThemeMenu && grm.ui.displayBiography) return;
			grm.debug.callLog('播放列表 => 鼠标_按钮_下');
			pl.call.on_mouse_lbtn_down(x, y, m);
		}
		else if (grm.ui.displayLibrary && mouseInLibrary(x, y)) {
			grm.debug.callLog('曲库 => 鼠标_按钮_下');
			lib.call.on_mouse_lbtn_down(x, y, m);
		}
		if (grm.ui.displayBiography && mouseInBiography(x, y)) {
			grm.debug.callLog('简介 => 鼠标_按钮_下');
			bio.call.on_mouse_lbtn_down(x, y, m);
		}
		if (grm.details.isLyricsVisible() && mouseInLyrics(x, y)) {
			grm.debug.moveLog('歌词 => 鼠标_按钮_下');
			grm.lyrics.on_mouse_lbtn_down(x, y, m);
		}

		// * Clicking on album art or noAlbumArtStub to pause playback
		if (!grCfg.settings.showDebugAPCACalibrationOverlay && mouseInPause(x, y)) {
			setTimeout(() => { // Differentiate between a lyrics drag scroll and a normal click
				if (!grm.details.isTurntableActive() && !grm.lyrics.scrollDrag) fb.PlayOrPause();
			}, grm.ui.displayLyrics ? 200 : 0);
		}
	}
}


/**
 * Called when left mouse button is released from pressed state.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} m - The mouse mask.
 */
function on_mouse_lbtn_up(x, y, m) {
	if (grm.details.turntableControlPressed) {
		const action = grm.details.turntableControlPressed;
		grm.details.turntableControlPressed = null;
		if (grm.details.getTurntableControlAt(x, y) === action) {
			// Each half has one action: repeat play/pause clicks cannot invert its meaning.
			if (action === 'play' && (!fb.IsPlaying || fb.IsPaused) ||
				action === 'pause' && fb.IsPlaying && !fb.IsPaused) fb.PlayOrPause();
		}
		return;
	}
	if (grm.ui.displayDetails && grm.details.immersiveWakeClickPending) {
		grm.details.immersiveWakeClickPending = false;
		return;
	}
	// The immersive glyph changes host-window geometry. Consume its matching mouse-up
	// before the native caption dispatcher sees resized button bounds.
	if (grm.ui.displayDetails && grm.details.endImmersiveButtonClick()) return;
	if (grm.ui.displayDetails && grm.details.immersiveMode && grm.button.downButton &&
		grm.button.downButton.id === 'Maximize') {
		grm.button.on_mouse_lbtn_up(x, y, m);
		return;
	}
	if (grm.button) {
		grm.button.on_mouse_lbtn_up(x, y, m);
	}

	if (grCfg.settings.showDebugAPCACalibrationOverlay) {
		grm.colorDebug.handleAPCACalibrationClick(x, y);
	}

	if (grSet.seekbar === 'progressbar') {
		grm.debug.callLog('进度条 => 鼠标_按钮_上');
		grm.progBar.on_mouse_lbtn_up(x, y);
	} else if (grSet.seekbar === 'peakmeterbar') {
		grm.debug.callLog('峰值条 => 鼠标_按钮_上');
		grm.peakBar.on_mouse_lbtn_up(x, y);
	} else if (grSet.seekbar === 'waveformbar') {
		grm.debug.callLog('波形条 => 鼠标_按钮_上');
		grm.waveBar.on_mouse_lbtn_up(x, y, m);
	}

	if (grm.ui.displayCustomThemeMenu || grm.ui.displayMetadataGridMenu) {
		grm.debug.callLog('自定义菜单 => 鼠标_按钮_上');
		grm.cusMenu.on_mouse_lbtn_up(x, y, m);
	}

	if (grm.volBtn.on_mouse_lbtn_up(x, y, m)) return;

	// Not handled by volumeBtn
	if ((grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit()) && mouseInPlaylist(x, y)) {
		if (grm.ui.displayCustomThemeMenu && grm.ui.displayBiography) return;
		grm.debug.callLog('播放列表 => 鼠标_按钮_上');
		pl.call.on_mouse_lbtn_up(x, y, m);

		if (!grSet.lockPlayerSize) EnableWindowSizing(m);
	}
	else if (grm.ui.displayLibrary && mouseInLibrary(x, y)) {
		if (grm.ui.displayCustomThemeMenu && grSet.libraryLayout === 'split') return;
		grm.debug.callLog('曲库 => 鼠标_按钮_上');
		lib.call.on_mouse_lbtn_up(x, y, m);
	}
	if (grm.ui.displayBiography && mouseInBiography(x, y)) {
		grm.debug.callLog('简介 => 鼠标_按钮_上');
		bio.call.on_mouse_lbtn_up(x, y, m);
	}
	if (grm.details.isLyricsVisible() && mouseInLyrics(x, y)) {
		grm.debug.moveLog('歌词 => 鼠标_按钮_上');
		grm.lyrics.on_mouse_lbtn_up(x, y, m);
	}

	if (grm.ui.doubleClicked) {
		grm.ui.doubleClicked = false; // You just did a double-click, so do nothing
	}

	on_mouse_move(x, y);
}


/**
 * Called when mouse leaves the window.
 * @global
 */
function on_mouse_leave() {
	grm.details.turntableControlPressed = null;
	if (grm.details.immersiveButtonHovered) grm.details.updateImmersiveButtonTooltip(-1, -1);
	if (grm.ui.displayDetails && grm.details.immersiveMode) {
		grm.details.scheduleImmersiveUiHide();
	}
	if (grSet.showVolumeBtn_layout && grm.volBtn) {
		grm.debug.callLog('音量按钮 => 鼠标_离开');
		grm.volBtn.on_mouse_leave();
	}
	if (grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) {
		grm.debug.callLog('播放列表 => 鼠标_离开');
		pl.call.on_mouse_leave();
	}
	else if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 鼠标_离开');
		lib.call.on_mouse_leave();
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 鼠标_离开');
		bio.call.on_mouse_leave();
	}
	if (grm.details.isLyricsVisible()) {
		grm.debug.moveLog('歌词 => 鼠标_离开');
		grm.lyrics.on_mouse_leave();
	}
}


/**
 * Called when middle mouse (wheel) button is double clicked.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} m - The mouse mask.
 */
function on_mouse_mbtn_dblclk(x, y, m) {
	if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 鼠标_按钮_双击');
		lib.call.on_mouse_mbtn_dblclk(x, y, m);
	}
}


/**
 * Called when middle mouse (wheel) button is pressed.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} m - The mouse mask.
 */
function on_mouse_mbtn_down(x, y, m) {
	if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 鼠标_按钮_下');
		lib.call.on_mouse_mbtn_down(x, y, m);
	}
}


/**
 * Called when middle mouse (wheel) button is released from pressed state.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} m - The mouse mask.
 */
function on_mouse_mbtn_up(x, y, m) {
	if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 鼠标_按钮_上');
		lib.call.on_mouse_mbtn_up(x, y, m);
	}
	else if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 鼠标_按钮_上');
		bio.call.on_mouse_mbtn_up(x, y, m);
	}
}


/**
 * Called when mouse moves in the panel.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} m - The mouse mask.
 */
function on_mouse_move(x, y, m) {
	libImg.onFlowPointerMoved(x, y);
	if (x === grm.ui.state.mouse_x && y === grm.ui.state.mouse_y) return;

	grm.ui.styledTooltipText = '';
	grm.ui.state.mouse_x = x;
	grm.ui.state.mouse_y = y;
	if (grm.ui.displayDetails && grm.details.immersiveMode) {
		grm.details.wakeImmersiveUi();
		if (!grm.details.immersiveUiVisible) {
			grm.details.setImmersiveCursorHidden(true);
			return;
		}
	}
	grm.display.handleWindowCursor(x, y);
	if (grm.ui.displayDetails && grm.details.mouseInImmersiveButton(x, y)) {
		try {
			UIWizard.SetCaptionAreaSize(0, 0, 0, 0);
			grm.display.pseudoCaption = false;
		} catch (e) {}
	} else {
		grm.display.setWindowDrag(x, y);
	}

	if (grm.button) grm.button.on_mouse_move(x, y, m);
	grm.details.updateImmersiveButtonTooltip(x, y);
	if (grCfg.updateHyperlink) grCfg.updateHyperlink.on_mouse_move(grCfg.updateHyperlink, x, y);

	if (grSet.seekbar === 'progressbar') {
		grm.progBar.on_mouse_move(x, y);
	} else if (grSet.seekbar === 'peakmeterbar') {
		grm.peakBar.on_mouse_move(x, y, m);
	} else if (grSet.seekbar === 'waveformbar') {
		grm.waveBar.on_mouse_move(x, y, m);
	}

	// * Top menu compact - collapse top menu to compact when mouse is out of top menu area
	if (grSet.topMenuCompact && !grSet.showTopMenuCompact && grm.ui.state.mouse_y > grm.ui.topMenuHeight * 2) { // Start collapse
		grSet.showTopMenuCompact = true;
		setTimeout(() => {
			grm.button.topMenu(true);
		}, 3000);
		return;
	}

	if (grm.ui.displayCustomThemeMenu || grm.ui.displayMetadataGridMenu) {
		grm.debug.callLog('自定义菜单 => 鼠标_移动');
		grm.cusMenu.on_mouse_move(x, y, m);
		return;
	}

	if ((grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) && mouseInPlaylist(x, y)) {
		grm.debug.moveLog('播放列表 => 鼠标_移动');
		if (SuppressMouseMove(x, y, m)) return;
		DisableWindowSizing(m);
		pl.call.on_mouse_move(x, y, m);
		return;
	}
	if (grm.ui.displayLibrary && mouseInLibrary(x, y)) {
		grm.debug.moveLog('曲库 => 鼠标_移动');
		lib.call.on_mouse_move(x, y, m);
		return;
	}
	if (grm.ui.displayBiography && mouseInBiography(x, y)) {
		grm.debug.moveLog('简介 => 鼠标_移动');
		bio.call.on_mouse_move(x, y, m);
		return;
	}
	if (grm.details.isLyricsVisible() && mouseInLyrics(x, y)) {
		grm.debug.moveLog('歌词 => 鼠标_移动');
		grm.lyrics.on_mouse_move(x, y, m);
		return;
	}
	if (grm.ui.displayDetails && !mouseInLowerBar(x, y)) {
		grm.debug.callLog('详情 => 鼠标_移动');
		grm.details.on_mouse_move(x, y, m);
		return;
	}

	if (mouseInLowerBar(x, y, true)) {
		grm.debug.callLog('底栏工具提示 => 鼠标_移动');
		grm.ui.handleLowerBarTooltip(x, y);
		return;
	}
	else if (grm.ui.lowerBarTooltipText != '') {
		grm.ui.handleLowerBarTooltip(x, y, true);
	}

	if (grSet.showTransportControls_layout && grSet.showVolumeBtn_layout) {
		grm.volBtn.on_mouse_move(x, y, m);
	}

	if (grCfg.settings.showDebugAPCACalibrationOverlay) {
		grm.colorDebug.updateAPCAControlsHover();
	}
}


/**
 * Called when right mouse button is pressed.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} m - The mouse mask.
 */
function on_mouse_rbtn_down(x, y, m) {
	if ((grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) && mouseInPlaylist(x, y) &&
		!(grm.ui.displayCustomThemeMenu && grm.ui.displayBiography)) {
		grm.debug.callLog('播放列表 => 鼠标_按钮_下');
		pl.call.on_mouse_rbtn_down(x, y, m);
	}
}


/**
 * Called when right mouse button is released from pressed state.
 *
 * You must return true, if you want to suppress the default context menu.
 *
 * Note: left shift + left windows key will bypass this callback and will open default context menu.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {number} m - The mouse mask.
 * @returns {boolean} True to suppress the default context menu, otherwise depends on internal conditions.
 */
function on_mouse_rbtn_up(x, y, m) {
	const cmm = new ContextMainMenu();

	const handleContextMenu = (x, y) => {
		grm.ui.activeMenu = true;
		cmm.execute(x, y);
		grm.ui.activeMenu = false;
	};

	if (mouseInTopMenu(x, y)) {
		grm.debug.callLog('顶部菜单 => 鼠标_按钮_上');
		grm.ctxMenu.contextMenuTopBar(cmm);
		handleContextMenu(x, y);
		return true;
	}
	else if (mouseInAlbumArt(x, y) || grm.ui.displayLyrics && mouseInLyrics(x, y) || grm.ui.displayDetails && grm.details.mouseInMetadataGrid(x, y, 'grid')) {
		grm.debug.callLog('封面 => 鼠标_按钮_上');
		grm.ctxMenu.contextMenuAlbumCover(cmm);
		handleContextMenu(x, y);
		return true;
	}
	else if (mouseInLowerBar(x, y) && !mouseInSeekbar(x, y)) {
		grm.debug.callLog('底栏 => 鼠标_按钮_上');
		grm.ctxMenu.contextMenuLowerBar(cmm);
		handleContextMenu(x, y);
		return true;
	}
	else if (mouseInSeekbar(x, y)) {
		grm.debug.callLog('进度条 => 鼠标_按钮_上');
		grm.ctxMenu.contextMenuSeekbar(cmm);
		handleContextMenu(x, y);
		return true;
	}

	if ((grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) && mouseInPlaylist(x, y)) {
		grm.debug.callLog('播放列表 => 鼠标_按钮_上');
		return pl.call.on_mouse_rbtn_up(x, y, m);
	}
	else if (grm.ui.displayLibrary && mouseInLibrary(x, y)) {
		grm.debug.callLog('曲库 => 鼠标_按钮_上');
		return lib.call.on_mouse_rbtn_up(x, y, m);
	}
	else if (grm.ui.displayBiography && mouseInBiography(x, y)) {
		grm.debug.callLog('简介 => 鼠标_按钮_上');
		return bio.call.on_mouse_rbtn_up(x, y, m);
	}
	else {
		return !grCfg.settings.showPanelContextMenu;
	}
}


/**
 * Called when using the mouse wheel, also used to cycle through album artworks and control the seekbar.
 * @global
 * @param {number} step - The scroll direction: -1 or 1.
 */
function on_mouse_wheel(step) {
	if (mouseInTopMenu(grm.ui.state.mouse_x, grm.ui.state.mouse_y)) {
		KeyPressAction({
			ctrlNoShift: () => grm.display.setMenuFontSize(step),
			altNoShift: () => grm.display.setMenuFontSize(0)
		});
		return;
	}

	if (mouseInAlbumArt(grm.ui.state.mouse_x, grm.ui.state.mouse_y) &&
		grSet.albumArtCycleMouseWheel && grm.ui.albumArtList.length > 1 && !grm.ui.displayLyrics) {
		grm.ui.cycleAlbumArtImage(step);
		return;
	}

	if (mouseInTransport(grm.ui.state.mouse_x, grm.ui.state.mouse_y)) {
		KeyPressAction({
			ctrlNoShift: () => grm.display.setTransportBtnSize(step),
			altNoShift: () => grm.display.setTransportBtnSize(0),
			altShift: () => grm.display.setTransportBtnSpacing(0),
			shiftNoAlt: () => grm.display.setTransportBtnSpacing(step)
		});
		grSet.showVolumeBtn_layout && grm.volBtn.on_mouse_wheel(step);
		return;
	}

	if (mouseInSeekbar(grm.ui.state.mouse_x, grm.ui.state.mouse_y)) {
		grm.ui.handleSeekbarPlayback(0, step);
		return;
	}

	if (mouseInLowerBar(grm.ui.state.mouse_x, grm.ui.state.mouse_y)) {
		KeyPressAction({
			ctrlNoShift: () => grm.display.setLowerBarFontSize(step),
			altNoShift: () => grm.display.setLowerBarFontSize(0)
		});
		return;
	}

	if (grm.ui.displayDetails) {
		if (grm.details.mouseInMetadataGrid(grm.ui.state.mouse_x, grm.ui.state.mouse_y, 'artist')) {
			KeyPressAction({
				ctrlNoShift: () => grm.display.setGridArtistFontSize(step),
				altNoShift: () => grm.display.setGridArtistFontSize(0)
			});
			return;
		}
		if (grm.details.mouseInMetadataGrid(grm.ui.state.mouse_x, grm.ui.state.mouse_y, 'title')) {
			KeyPressAction({
				ctrlNoShift: () => grm.display.setGridTitleFontSize(step),
				altNoShift: () => grm.display.setGridTitleFontSize(0)
			});
			return;
		}
		if (grm.details.mouseInMetadataGrid(grm.ui.state.mouse_x, grm.ui.state.mouse_y, 'album')) {
			KeyPressAction({
				ctrlNoShift: () => grm.display.setGridAlbumFontSize(step),
				altNoShift: () => grm.display.setGridAlbumFontSize(0)
			});
			return;
		}
		if (grm.details.mouseInMetadataGrid(grm.ui.state.mouse_x, grm.ui.state.mouse_y, 'tagKey')) {
			KeyPressAction({
				ctrlNoShift: () => grm.display.setGridTagKeyFontSize(step),
				altNoShift: () => grm.display.setGridTagKeyFontSize(0)
			});
			return;
		}
		if (grm.details.mouseInMetadataGrid(grm.ui.state.mouse_x, grm.ui.state.mouse_y, 'tagValue')) {
			KeyPressAction({
				ctrlNoShift: () => grm.display.setGridTagValueFontSize(step),
				altNoShift: () => grm.display.setGridTagValueFontSize(0)
			});
		}
		if (grm.details.isLyricsVisible() && (
			(grSet.detailsLyricsDisplayMode === 'arc' || grm.details.isTurntableActive())
				? mouseInDetailsArcLyrics(grm.ui.state.mouse_x, grm.ui.state.mouse_y)
				: mouseInLyrics(grm.ui.state.mouse_x, grm.ui.state.mouse_y)
		)) {
			KeyPressAction({
				ctrlShift: () => grm.display.setLyricsLineSpacingSize(step),
				ctrlAltShift: () => grm.display.setLyricsSentenceSpacingSize(step),
				ctrlNoShift: () => grm.display.setLyricsFontSize(step),
				altNoShift: () => { grm.display.setLyricsFontSize(0); grm.display.setLyricsLineSpacingSize(0); grm.display.setLyricsSentenceSpacingSize(0) },
				shift: () => (grSet.detailsLyricsDisplayMode === 'arc' || grm.details.isTurntableActive())
					? grm.lyrics.on_mouse_wheel(step, grSet.detailsLyricsDisplayMode === 'arc' && !grm.details.isTurntableActive())
					: grm.bgImg.cycleBgImage('lyrics', step),
				default: () => grm.lyrics.on_mouse_wheel(step, grSet.detailsLyricsDisplayMode === 'arc' && !grm.details.isTurntableActive())
			});
		}
		return;
	}
	if ((grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayPlaylistArtwork || grm.ui.displayLibrarySplit(true)) && mouseInPlaylist(grm.ui.state.mouse_x, grm.ui.state.mouse_y)) {
		grm.debug.callLog('播放列表 => 鼠标_滚轮');
		KeyPressAction({
			ctrlNoShift: () => grm.display.setPlaylistFontSize(step),
			altNoShift: () => grm.display.setPlaylistFontSize(0),
			shift: () => grm.bgImg.cycleBgImage('playlist', step),
			default: () => pl.call.on_mouse_wheel(step)
		});
	} else if (grm.ui.displayLibrary && mouseInLibrary(grm.ui.state.mouse_x, grm.ui.state.mouse_y)) {
		grm.debug.callLog('曲库 => 鼠标_滚轮');
		KeyPressAction({
			ctrlNoShift: () => grm.display.setLibraryFontSize(step),
			altNoShift: () => grm.display.setLibraryFontSize(0),
			shift: () => grm.bgImg.cycleBgImage('library', step),
			default: () => lib.call.on_mouse_wheel(step)
		});
	} else if (grm.ui.displayBiography && mouseInBiography(grm.ui.state.mouse_x, grm.ui.state.mouse_y)) {
		grm.debug.callLog('简介 => 鼠标_滚轮');
		if (bio.panel.trace.text) {
			if (bio.txt.lyricsDisplayed()) {
				KeyPressAction({
					ctrlAltShift: () => grm.display.setBioLyricsSentenceSpacingSize(step),
					ctrlShift: () => grm.display.setBioLyricsLineSpacingSize(step),
					ctrlNoShift: () => grm.display.setBioLyricsFontSize(step),
					altNoShift: () => { grm.display.setBioLyricsFontSize(0); grm.display.setBioLyricsLineSpacingSize(0); grm.display.setBioLyricsSentenceSpacingSize(0); },
					shift: () => grm.bgImg.cycleBgImage('biography', step),
					default: () => bio.call.on_mouse_wheel(step)
				});
			} else {
				KeyPressAction({
					ctrlNoShift: () => grm.display.setBiographyFontSize(step),
					altNoShift: () => grm.display.setBiographyFontSize(0),
					shift: () => grm.bgImg.cycleBgImage('biography', step),
					default: () => bio.call.on_mouse_wheel(step)
				});
			}
		} else {
			bio.call.on_mouse_wheel(step);
		}
	} else if (grm.details.isLyricsVisible() && mouseInLyrics(grm.ui.state.mouse_x, grm.ui.state.mouse_y)) {
		KeyPressAction({
			ctrlShift: () => grm.display.setLyricsLineSpacingSize(step),
			ctrlAltShift: () => grm.display.setLyricsSentenceSpacingSize(step),
			ctrlNoShift: () => grm.display.setLyricsFontSize(step),
			altNoShift: () => { grm.display.setLyricsFontSize(0); grm.display.setLyricsLineSpacingSize(0); grm.display.setLyricsSentenceSpacingSize(0) },
			shift: () => grm.bgImg.cycleBgImage('lyrics', step),
			default: () => grm.lyrics.on_mouse_wheel(step)
		});
	}
}


/**
 * Called in other panels after window.NotifyOthers is executed.
 * @global
 * @param {string} name - The name of the data that was updated.
 * @param {*} info - The data that was updated:
 *
 * - 1. Data from `info` argument is only accessible inside `on_notify_data` callback:
 * if stored and accessed outside of the callback it will throw JS error.
 * This also applies to the data produced from that `info`: e.g. storing `info.Path` directly (if `info` is FbMetadbHandle).
 *
 * - 2. If you want to store the data from `info` you have to perform a deep copy:
 * `String(info)` for strings.
 * `JSON.parse(JSON.stringify(info))` for serializable objects.
 * `new ObjectType(info)` for objects that have an appropriate constructor available, e.g. `new GdiBitmap(info)` or `new FbMetadbHandleList(info)`.
 *
 * - 3. `info` argument is shared between panels, so it should NOT be modified in any way.
 */
function on_notify_data(name, info) {
	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 通知_数据');
		pl.call.on_notify_data(name, info);
	}
	else if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 通知_数据');
		lib.call.on_notify_data(name, info);
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 通知_数据');
		bio.call.on_notify_data(name, info);
	}
}


/**
 * Called when Per-track dynamic info (stream track titles etc) changes.
 *
 * Happens less often than on_playback_dynamic_info.
 * @global
 */
function on_playback_dynamic_info_track() {
	// How frequently does this get called?
	const metadb = fb.IsPlaying ? fb.GetNowPlaying() : null;
	on_playback_new_track(metadb);

	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 播放_动态_信息_音轨');
		pl.call.on_playback_dynamic_info_track();
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 播放_动态_信息_音轨');
		bio.call.on_playback_dynamic_info_track();
	}
	if (grm.details.isLyricsVisible()) { // No need to try retrieving them if we aren't going to display them now
		grm.lyrics.initLyrics();
	}
}


/**
 * Called when playback order is changed via the transport playback order button or foobar's playback menu.
 * @global
 * @param {number} pbo - The playback order has following settings:
 * - 0 - Default.
 * - 1 - Repeat (Playlist).
 * - 2 - Repeat (Track).
 * - 3 - Random, 4 Shuffle (tracks).
 * - 5 - Shuffle (albums).
 * - 6 - Shuffle (folders).
 */
function on_playback_order_changed(pbo) {
	grm.debug.callLog('主要 => 播放_次序_已更改');
	grm.ui.handlePlaybackOrder(pbo);
}


/**
 * Called when pausing current playing track.
 * @global
 * @param {boolean} state - Whether the playback is paused or not.
 */
function on_playback_pause(state) {
	grm.ui.handlePlaybackPause(state);
	grm.details.updateTurntableState();

	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 播放_暂停');
		pl.call.on_playback_pause(state);
	}
	if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 播放_暂停');
		lib.call.on_playback_pause(state);
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 播放_暂停');
		bio.call.on_playback_pause(state);
	}
	if ((grm.ui.albumArt || grm.ui.noAlbumArtStub) && grm.details.isLyricsVisible()) { // If we are displaying lyrics we need to refresh all the lyrics to avoid tearing at the edges of the pause button
		grm.debug.callLog('歌词 => 播放_暂停');
		grm.lyrics.on_playback_pause(state);
	}
}


/**
 * Called when adding new playlist tracks in queue.
 * @global
 * @param {number} origin - The parameter has following settings:
 * - 0 - User added.
 * - 1 - User removed.
 * - 2 - Playback advance.
 */
function on_playback_queue_changed(origin) {
	grm.debug.callLog('播放列表 => 播放_队列_已更改');
	pl.call.on_playback_queue_changed(origin);
	lib.call.on_playback_queue_changed();
	lib.ex.calls.on_playback_queue_changed(origin);
}


/**
 * Called when playback time is being seeked, float value in seconds.
 * @global
 */
function on_playback_seek() {
	on_playback_time();

	grm.ui.handlePlaybackSeek();

	if (grm.ui.displayBiography) {
		bio.call.on_playback_seek();
	}
}


/**
 * Called when playback process is being initialized, on_playback_new_track should be called soon after this when first file is successfully opened for decoding.
 * @global
 * @param {number} cmd - The command has following settings:
 * - 0 - Default.
 * - 1 - Play.
 * - 2 - Plays the next track from the current playlist according to the current playback order.
 * - 3 - Plays the previous track from the current playlist according to the current playback order.
 * - 4 - settrack (internal fb2k value).
 * - 5 - Plays a random track from the current playlist.
 * - 6 - resume (internal fb2k value).
 * @param {boolean} is_paused - Whether the playback is paused.
 */
function on_playback_starting(cmd, is_paused) {
	grm.ui.handlePlaybackStart();
}


/**
 * Called when playback is stopped.
 * @global
 * @param {number} reason - The playback stop has following settings:
 * - 0 - Invoked by user.
 * - 1 - End of file.
 * - 2 - Starting another track.
 * - 3 - Fb2k is shutting down.
 */
function on_playback_stop(reason) {
	grm.debug.debugLog('播放 => 重绘 播放_停止:', reason);

	grm.ui.handlePlaybackStop(reason);
	grm.details.updateTurntableState();

	// The playing playlist state always needs to be cleared when the Playlist is not displayed,
	// i.e., when the startup panel is not set to `Playlist` and when clicking on the stop button.
	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork || grSet.showPanelOnStartup !== 'playlist' || !grSet.returnToHomeOnPlaybackStop) {
		grm.debug.callLog('播放列表 => 播放_停止');
		pl.call.on_playback_stop(reason);
	}
	else if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 播放_停止');
		lib.call.on_playback_stop(reason);
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 播放_停止');
		bio.call.on_playback_stop(reason);
	}
	if (grm.details.isLyricsVisible()) {
		grm.ui.initLyricsDisplayState('stopTrack');
		grm.lyrics.on_playback_stop(reason);
	}
}


/**
 * Refresh playback time plus playback time remaining every second.
 * @global
 */
function on_playback_time() {
	grm.ui.handlePlaybackTime();
	grm.waveBar.on_playback_time(fb.PlaybackTime);
	grm.ui.displayBiography && bio.call.on_playback_time();
}


/**
 * Called when clicking on playlist items that are visible in the playlist panel.
 * @global
 * @param {number} playlistIndex - The index of the playlist.
 * @param {number} playlistItemIndex - The index of the playlist item.
 */
function on_playlist_item_ensure_visible(playlistIndex, playlistItemIndex) {
	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 播放列表_项_确保_可见');
		pl.call.on_playlist_item_ensure_visible(playlistIndex, playlistItemIndex);
	}
}


/**
 * Called when adding tracks to the playlist.
 * @global
 * @param {number} playlistIndex - The index of the playlist.
 */
function on_playlist_items_added(playlistIndex) {
	if (pl.history) {
		pl.history.playlistAltered(PlaylistMutation.Added);
	}
	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 播放列表_项_已添加');
		pl.call.on_playlist_items_added(playlistIndex);
	}
	if (grm.ui.displayLibrary || grm.ui.displayLibrarySplit()) {
		grm.debug.callLog('曲库 => 播放列表_项_已添加');
		lib.call.on_playlist_items_added(playlistIndex);
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 播放列表_项_已添加');
		bio.call.on_playlist_items_added(playlistIndex);
	}
}


/**
 * Called when removing tracks from the playlist.
 * @global
 * @param {number} playlistIndex - The index of the playlist.
 */
function on_playlist_items_removed(playlistIndex) {
	if (pl.history) {
		pl.history.playlistAltered(PlaylistMutation.Removed);
	}
	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 播放列表_项_已移除');
		pl.call.on_playlist_items_removed(playlistIndex);
	}
	if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 播放列表_项_已移除');
		lib.call.on_playlist_items_removed(playlistIndex);
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 播放列表_项_已移除');
		bio.call.on_playlist_items_removed(playlistIndex);
	}
}


/**
 * Called when reordering tracks in the playlist, i.e by dragging them up or down.
 * Changes selection too. Doesn't actually change the set of items that are selected or item having focus, just changes their order.
 * @global
 * @param {number} playlistIndex - The index of the playlist.
 */
function on_playlist_items_reordered(playlistIndex) {
	if (pl.history) {
		pl.history.playlistAltered(PlaylistMutation.Reordered);
	}
	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 播放列表_项_重新排序');
		pl.call.on_playlist_items_reordered(playlistIndex);
	}
	if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 播放列表_项_重新排序');
		lib.call.on_playlist_items_reordered(playlistIndex);
	}
}


/**
 * Called as a workaround for some 3rd party playlist viewers not working with on_selection_changed.
 * @global
 */
function on_playlist_items_selection_change() {
	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 播放列表_项_选择已更改');
		pl.call.on_playlist_items_selection_change();
		grm.ui.initBrowseMode();
	}
}


/**
 * Called when switching the current active playlist to another.
 * @global
 */
function on_playlist_switch() {
	if (pl.history) {
		pl.history.playlistAltered(PlaylistMutation.Switch);
	}
	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 播放列表_切换');
		pl.call.on_playlist_switch();
	}
	if (grm.ui.displayLibrary || libSet.libSource === 0) {
		grm.debug.callLog('曲库 => 播放列表_切换');
		lib.call.on_playlist_switch();
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 播放列表_切换');
		bio.call.on_playlist_switch();
	}
}


/**
 * Called when playlists are added/removed/reordered/renamed or a playlist's lock status changes.
 * @global
 */
function on_playlists_changed() {
	if (pl.history) {
		pl.history.reset(); // When playlists are changed, indexes no longer apply, and so we have to wipe history
	}
	if (grm.ui.displayPlaylist || grm.ui.displayPlaylistArtwork) {
		grm.debug.callLog('播放列表 => 播放列表_已更改');
		pl.call.on_playlists_changed();
	}
	if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 播放列表_已更改');
		lib.call.on_playlists_changed();
	}
	if (grm.ui.displayBiography) {
		grm.debug.callLog('简介 => 播放列表_已更改');
		bio.call.on_playlists_changed();
	}
}


/**
 * Called when script is reloaded via context menu > Reload or script is changed via panel menu > Configure or fb2k is exiting normally.
 * @global
 */
function on_script_unload() {
	grm.debug.debugLog('卸载脚本');
	// Fallback for Alt+F4, script reload, and other exits that bypass the theme Close button.
	grm.details.restoreImmersiveWindowForShutdown();
	grm.ui.artworkClosed = true;
	grm.ui.albumArtRequestSerial = (grm.ui.albumArtRequestSerial || 0) + 1;
	grm.ui.clearImmersiveLyricsBlur();
	grm.details.detailsClosed = true;
	grm.details.discArtLoadToken = (grm.details.discArtLoadToken || 0) + 1;
	grm.artCache.shutdownImageReads();
	grm.bgImg.shutdown();
	grm.details.stopTurntableRecovery();
	for (const property of ['immersiveUiTimer', 'immersiveWindowSyncTimer', 'immersiveEntryMouseGuardTimer',
		'immersiveButtonClickTimer', 'immersiveFullscreenEntryTimer', 'immersiveRestoreMaximizeTimer',
		'immersiveExitPollTimer', 'turntableLyricsInitTimer', 'labelLogoLayoutRepaintTimer',
		'labelLogoSettleRepaintTimer', 'labelLogoRepairTimer']) {
		clearTimeout(grm.details[property]); grm.details[property] = null;
	}
	grm.details.stopTurntableTimer();
	grm.details.clearTurntableImages();
	grm.details.clearTimer();
	grm.ui.clearTimer();
	if (grm.lyrics) {
		grm.lyrics.lyricsClosed = true;
		grm.lyrics.abortSearch();
		clearTimeout(grm.lyrics.translationAutoCollapseTimer);
		clearTimeout(grm.lyrics.showOffsetTimer);
		grm.lyrics.stop();
		if (grm.lyrics.translationBlendTimer) grAnimationManager.remove(grm.lyrics.translationBlendTimer);
		clearInterval(grm.lyrics.lyricsSearchTimer);
		grm.lyrics.shadowBitmapCache.clear();
	}
	grAnimationManager.shutdown();
	grm.waveBar.on_script_unload();

	// It appears we don't need to dispose the images which we loaded using gdi.Image in their declaration for some reason. Attempting to dispose them causes a script error.
	if (lib.call) {
		grm.debug.callLog('曲库 => 脚本卸载');
		lib.call.on_script_unload();
	}

	grm.debug.callLog('简介 => 脚本卸载');
	bio.call.on_script_unload();
}


/**
 * Called when selection changes based on File > Preferences > Display > Selection viewers.
 * @global
 */
function on_selection_changed() {
	if (grm.ui.displayLibrary) {
		grm.debug.callLog('曲库 => 选择_已更改');
		lib.call.on_selection_changed();
		grm.ui.initBrowseMode();
	}
}


/**
 * Called when volume changes, i.e the volume bar in the volume button.
 * @global
 * @param {number} val - The volume level in dB. Minimum is -100. Maximum is 0.
 */
function on_volume_change(val) {
	grm.debug.callLog('音量条 => 音量条_已更改');
	grm.volBtn.on_volume_change(val);
}


//////////////////////////
// * CUSTOM CALLBACKS * //
//////////////////////////
/**
 * Checks if the mouse is within the boundaries of the top menu.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInTopMenu(x, y) {
	if (x < grm.ui.ww - SCALE(100) && y < grm.ui.topMenuHeight) {
		grm.debug.moveLog('鼠标在顶部菜单');
		return true;
	}

	return false;
}


/**
 * Checks if the mouse is within the boundaries of the album art.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInAlbumArt(x, y) {
	const displayAlbumArt =
		grSet.layout === 'default' && !grm.ui.displayBiography && (grm.ui.displayPlaylist && !grm.ui.displayLibrary && grSet.playlistLayout !== 'full' // Playlist
		||
		grm.ui.displayLibrary && grSet.libraryLayout === 'normal' && grSet.libraryDesign !== 'flowMode' // Library
		||
		!grm.ui.displayPlaylist && !grm.ui.displayLibrary || grm.ui.displayLyrics) // Details, Lyrics
		||
		grSet.layout === 'artwork' && !grm.ui.displayBiography && (grm.ui.displayPlaylist || !grm.ui.displayPlaylistArtwork && !grm.ui.displayLibrary); // Cover, Details, Lyrics

	const albumArtBounds =
		x > grm.ui.albumArtSize.x && x < grm.ui.albumArtSize.x + grm.ui.albumArtSize.w &&
		y > grm.ui.albumArtSize.y && y < grm.ui.albumArtSize.y + grm.ui.albumArtSize.h;

	if ((grm.ui.albumArt || grm.ui.noAlbumArtStub) && (displayAlbumArt && albumArtBounds)) {
		grm.debug.moveLog('鼠标在封面');
		return true;
	}

	if (grm.lyrics.scrollDrag && grSet.lyricsLayout === 'normal') {
		grm.lyrics.scrollDrag = false;
	}

	return false;
}


/**
 * Checks if the mouse can pause when clicking on the album art or noAlbumArtStub.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInPause(x, y) {
	// The turntable owns its dedicated play/pause rocker, not the album-art shortcut.
	if (grm.details.isTurntableActive()) return false;
	// * Do not pause when Playlist/Library layout is in full width or when using Library's flow mode
	const panelPlaylist = grm.ui.displayPlaylist && !grm.ui.displayLibrary && !grm.ui.displayBiography && grSet.playlistLayout !== 'full';
	const panelDetails  = grm.ui.displayDetails;
	const panelLibrary  = grm.ui.displayLibrary && grSet.libraryLayout === 'normal' && grSet.libraryDesign !== 'flowMode';
	const panelLyrics   = grm.ui.displayLyrics && grSet.lyricsLayout !== 'full';
	const artworkLayout = grSet.layout === 'artwork' && !grm.ui.displayDetails && !grm.ui.displayPlaylistArtwork && !grm.ui.displayLibrary && !grm.ui.displayBiography;

	const albumArtBounds   = grm.ui.albumArtSize.x <= x && grm.ui.albumArtSize.y <= y && grm.ui.albumArtSize.x + grm.ui.albumArtSize.w >= x && grm.ui.albumArtSize.y + grm.ui.albumArtSize.h >= y;
	const discArtBounds    = grm.details.discArtSize.x  <= x && grm.details.discArtSize.y  <= y && grm.details.discArtSize.x  + grm.details.discArtSize.w  >= x && grm.details.discArtSize.y  + grm.details.discArtSize.h  >= y;
	const noAlbumArtBounds = grm.ui.state.mouse_x > 0 && grm.ui.state.mouse_x <= (grm.ui.displayPlaylist || grm.ui.displayLibrary ? grm.ui.albumArtSize.x + grm.ui.albumArtSize.w : !grm.ui.displayPlaylist || !grm.ui.displayLibrary ? grm.ui.ww : grm.ui.ww * 0.5) &&
							 grm.ui.state.mouse_y > grm.ui.albumArtSize.y && grm.ui.state.mouse_y <= grm.ui.albumArtSize.h + grm.ui.topMenuHeight;
	const pauseOnAlbumArt =
		(grSet.layout === 'default' && grm.ui.albumArt && (panelPlaylist || panelDetails || panelLibrary || panelLyrics) || artworkLayout) &&
		!grm.ui.displayCustomThemeMenu && !grm.ui.displayMetadataGridMenu && albumArtBounds || grm.details.discArt && !grm.ui.albumArt && discArtBounds;

	const pauseOnNoAlbumArt =
		(grSet.layout === 'default' && !grm.ui.albumArt && (panelPlaylist || panelDetails || panelLibrary || panelLyrics) || artworkLayout) &&
		!grm.ui.displayCustomThemeMenu && !grm.ui.displayMetadataGridMenu && noAlbumArtBounds;

	if ((grm.ui.albumArt || grm.ui.noAlbumArtStub) && (pauseOnAlbumArt || pauseOnNoAlbumArt)) {
		grm.debug.moveLog('鼠标在暂停');
		return true;
	}

	return false;
}


/**
 * Checks if the mouse is within the boundaries of the lower bar and within the tooltip area.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @param {string} tooltip - Wheter to check the artist/title lowerbar tooltip area.
 * @returns {boolean} True or false.
 */
function mouseInLowerBar(x, y, tooltip) {
	if (tooltip) {
		const zoneX = grm.ui.edgeMargin;
		const zoneY = grm.ui.wh - grm.ui.lowerBarHeight + SCALE(15);
		const zoneW = grm.ui.lowerBarAvailableW;
		const zoneH = grm.ui.lowerBarHeight * 0.33;

		if (zoneX <= x && zoneY <= y && zoneX + zoneW >= x && zoneY + zoneH >= y) {
			grm.debug.moveLog('鼠标在底栏 工具提示');
			return true;
		}
	}
	else if (y > grm.ui.wh - SCALE(120)) {
		grm.debug.moveLog('鼠标在底栏');
		return true;
	}

	return false;
}


/**
 * Checks if the mouse is within the boundaries of the transport buttons.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInTransport(x, y) {
	const buttonSize = SCALE(grSet.transportButtonSize_layout);
	const startX = (grm.ui.ww - grm.ui.lowerBarTotalBtnW) / 2;
	const endX = startX + grm.ui.lowerBarTotalBtnW + (grm.volBtn ? grm.volBtn.w + buttonSize : 0);
	const startY = grm.ui.lowerBarBtnY;
	const endY = startY + buttonSize;

	if (x >= startX && x <= endX && y >= startY && y <= endY) {
		grm.debug.moveLog('鼠标在通用');
		return true;
	}

	return false;
}


/**
 * Checks if the mouse is within the boundaries of the seekbar.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInSeekbar(x, y) {
	if (x >= grm.ui.edgeMargin && x < grm.ui.ww - grm.ui.edgeMargin &&
		y >= grm.ui.seekbarY && y <= grm.ui.seekbarY + grm.ui.seekbarHeight * 2) {
		grm.debug.moveLog('鼠标在进度条');
		return true;
	}

	return false;
}


/**
 * Checks if the mouse is within the boundaries of the panel.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInPanel(x, y) {
	if (y > grm.ui.topMenuHeight && y < grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight) {
		grm.debug.moveLog('鼠标在面板');
		return true;
	}

	return false;
}


/**
 * Checks if the mouse is within the boundaries of the Playlist.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInPlaylist(x, y) {
	if (x >= pl.playlist.x && x < pl.playlist.x + pl.playlist.w &&
		y >= pl.playlist.y - SCALE(plSet.row_h) && y < pl.playlist.y + pl.playlist.h) {
		grm.debug.moveLog('播放列表 => 鼠标在播放列表');
		return true;
	}

	if (PlaylistRow.hovered && PlaylistRow.hovered.is_hovered) {
		PlaylistRow.hovered.is_hovered = false;
		pl.playlist.repaint();
	}

	if (pl.playlist.scrollbar.b_is_dragging) {
		pl.playlist.scrollbar.b_is_dragging = false;
		pl.playlist.scrollbar.desiredScrollPosition = undefined;
	}

	return false;
}


/**
 * Checks if the mouse is within the boundaries of the Library.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInLibrary(x, y) {
	if (x >= lib.ui.x && x < lib.ui.x + lib.ui.w && y >= lib.ui.y && y < lib.ui.y + lib.ui.h) {
		grm.debug.moveLog('曲库 => 鼠标在曲库');
		return true;
	}

	if (lib.sbar.bar.isDragging) {
		lib.sbar.bar.isDragging = false;
		lib.but.Dn = false;
	}

	return false;
}


/**
 * Checks if the mouse is within the boundaries of the Library search.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInLibrarySearch(x, y) {
	if (!lib.but.Dn && x > lib.ui.x + lib.but.q.h + lib.but.margin && x < lib.panel.search.x + lib.panel.search.w &&
		y > lib.ui.y && y < lib.ui.y + lib.panel.search.h && libSet.searchShow) {
		grm.debug.moveLog('曲库 => 鼠标在曲库搜索');
		return true;
	}

	return false;
}


/**
 * Checks if the mouse is within the boundaries of the Biography.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInBiography(x, y) {
	if (x >= bio.ui.x && x < bio.ui.x + bio.ui.w && y >= bio.ui.y && y < bio.ui.y + bio.ui.h) {
		grm.debug.moveLog('简介 => 鼠标在简介');
		return true;
	}

	if (bio.alb_scrollbar.bar.isDragging || bio.art_scrollbar.bar.isDragging || bio.art_scroller.bar.isDragging || bio.cov_scroller.bar.isDragging) {
		bio.alb_scrollbar.bar.isDragging = false;
		bio.art_scrollbar.bar.isDragging = false;
		bio.art_scroller.bar.isDragging = false;
		bio.cov_scroller.bar.isDragging = false;
		bio.but.Dn = false;
	}

	if (bio.lyrics.scrollDrag) {
		bio.lyrics.scrollDrag = false;
	}

	return false;
}


/**
 * Checks the visible CD lyric rail on the Details page. Keep the region tied to
 * the current disc position so wheel control follows the disc during resizing.
 */
function mouseInDetailsArcLyrics(x, y) {
	if (grm.details?.isTurntableActive()) {
		const b = grm.details.getTurntableLyricsBounds();
		return !!b && x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
	}
	const disc = grm.details?.discArtSize;
	if (!disc || !grm.details.discArt || !grSet.displayDiscArt || disc.w <= 0 || disc.h <= 0) return false;
	const radius = Math.max(SCALE(40), Math.min(disc.w, disc.h) * 0.5 + SCALE(5));
	const top = Math.max(grm.ui.topMenuHeight, disc.y + disc.h * 0.5 - radius * 0.86);
	const bottom = Math.min(grm.ui.wh - grm.ui.lowerBarHeight, disc.y + disc.h * 0.5 + radius * 0.86);
	return x >= disc.x + disc.w * 0.5 && x < grm.ui.ww - SCALE(8) && y >= top && y <= bottom;
}


/**
 * Checks if the mouse is within the boundaries of the Lyrics.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInLyrics(x, y) {
	if (grm.details.isTurntableActive()) return grm.details.isLyricsVisible() && mouseInDetailsArcLyrics(x, y);
	if (grSet.lyricsLayout !== 'normal' &&
		(y > grm.ui.topMenuHeight && y < grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight) || mouseInAlbumArt(x, y)) {
		grm.debug.moveLog('鼠标在歌词');
		grm.ui.mouseInLyricsAlbumArt = mouseInAlbumArt(x, y);
		grm.ui.mouseInLyricsFullLayoutEdge = mouseInLyricsFullLayoutEdge(x, y);
		return true;
	}

	grm.ui.mouseInLyricsAlbumArt = false;
	grm.ui.mouseInLyricsFullLayoutEdge = false;
	return false;
}


/**
 * Checks if the mouse is within the boundaries of the Lyrics full layout right edge bounds.
 * @global
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {boolean} True or false.
 */
function mouseInLyricsFullLayoutEdge(x, y) {
	if (grSet.lyricsLayout === 'full' && grm.ui.displayLyrics &&
		(y > grm.ui.topMenuHeight && y < grm.ui.wh - grm.ui.topMenuHeight - grm.ui.lowerBarHeight) &&
		(x > grm.ui.ww - SCALE(50) && x <= grm.ui.ww)) {
		grm.debug.moveLog('鼠标在歌词边缘边界');
		return true;
	}

	return false;
}
