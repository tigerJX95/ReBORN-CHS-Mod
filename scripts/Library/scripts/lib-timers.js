'use strict';

class LibTimers {
	constructor() {
		['cursor', 'jsearch1', 'jsearch2', 'tt'].forEach(v => this[v] = {
			id: null
		});
	}

	// * METHODS * //

	clear(timer) {
		if (!timer) return;
		if (timer.id != null) clearTimeout(timer.id);
		timer.id = null;
	}

	searchCursor(clear) {
		// Repeated focus/resize notifications must not create extra blink intervals.
		this.clear(this.cursor);
		if (!lib.panel.search.cursor) lib.panel.search.cursor = true;
		this.cursor.id = setInterval(() => {
			lib.panel.search.cursor = !lib.panel.search.cursor;
			lib.panel.searchPaint();
		}, 530);
	}

	tooltipLib() {
		this.clear(this.tt);
		this.tt.id = setTimeout(() => {
			lib.pop.deactivateTooltip();
			this.tt.id = null;
		}, 5000);
	}
}
