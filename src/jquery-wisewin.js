/*
 * jQuery WiseWin plugin.
 * Depends on jQuery 1.3.2 or higher, jQueryUI 1.7.1 or higher and EasyData library
 */
(function($, ED){
	

$.fn.wisewin = function(_dialogOptions) {
	var groupSpacialConfig = {},
		windowStack = {},
		nextZIndex = 0;
	
	
	function saveSpacialConfig(i, el) {
		var id = this.id,
			$this = $(this),
			offset = $this.offset();
			
		groupSpacialConfig[id] = {
			pos: {
				y: offset.top,
				x: offset.left
			},
			dim: {
				w: $this.width(),
				h: $this.height()
			},
			z: $this.css('z-index')
		};
	}
	
	function saveStackIndexes() {
		var win;
		for (id in windowStack) {
			win = windowStack[id];
			win.saveZIndex();
		}
	}
	
	function getNextZIndex() {
		return nextZIndex++;
	}
	
	function makeWiseWin(i, el) {
		var that = this,
			$that = $(this),
			dialogOptions = _dialogOptions || {},
			settings = {},
			positionOptions = dialogOptions.position,
			id = this.id,
			spacialConfig = groupSpacialConfig[id],
			minHeight = ($that.css('min-height') || '').replace(/\D/g, ''),
			minWidth = ($that.css('min-width') || '').replace(/\D/g, ''),
			maxHeight = ($that.css('max-height') || '').replace(/\D/g, ''),
			maxWidth = ($that.css('max-width') || '').replace(/\D/g, ''),
			minHeightParam = (!isNaN(minHeight) && minHeight) || dialogOptions.minHeight,
			minWidthParam = (!isNaN(minWidth) && minWidth) || dialogOptions.minWidth,
			maxHeightParam = (!isNaN(maxHeight) && maxHeight) || dialogOptions.maxHeight,
			maxWidthParam = (!isNaN(maxWidth) && maxWidth) || dialogOptions.maxWidth,
			Cookies = ED.Cookies,
			namespace = dialogOptions.namespace || 'jquery-wisewin',
			cookieName = namespace + '_' + id,
			cookieOptions = {
				path: '/'
			},
			cookie = Cookies.get(cookieName, true) || {},
			// Index numbers used for jQueryUI
			topIndex = 0,
			leftIndex = 1;
			
		
		function init() {
			var position = cookie.pos || (spacialConfig && spacialConfig.pos),
				dimensions = cookie.dim || (spacialConfig && spacialConfig.dim),
				zIndex = parseInt(cookie.z) || parseInt(spacialConfig && spacialConfig.z) || getNextZIndex(),
				isClosed = parseInt(cookie.closed),
				offset = $that.offset(),
				params = {},
				options = {
					duration: 1000
				};
			
			// Save this window to the stack, so that its z-index can be saved later.
			windowStack[id] = that;
			
			if (position) {
				if (positionOptions && !$.isArray(positionOptions)) {
					params.position = positionOptions;
				}
				else {
					params.position = [
						(positionOptions && positionOptions[leftIndex]) || position.x || 0,
						(positionOptions && positionOptions[topIndex]) || position.y || 0
					];
				}
			}
			if (dimensions) {
				params.width = dimensions.w || minWidthParam || 0;
				params.height = dimensions.h || minHeightParam || 0;
			}
			if (zIndex) {
				params.zIndex = zIndex;
			}
			
			// Dimensions boundaries
			if (minWidthParam) {
				params.minWidth = minWidthParam;
			}
			if (minHeightParam) {
				params.minHeight = minHeightParam;
			}
			if (maxWidthParam) {
				params.maxWidth = maxWidthParam;
			}
			if (maxHeightParam) {
				params.maxHeight = maxHeightParam;
			}
			
			function forceTrigger() {
				return function(event, ui) {
					$that.trigger(event, ui);
				}
			}
			
			params.dragStop = forceTrigger();
			params.resizeStop = forceTrigger();
			
			$.extend(settings, dialogOptions, params);
			
			// Make draggable and resizable.
			$that.dialog(settings);
			repairZIndex(zIndex);
			
			$that.bind('dragstop', moved);
			$that.bind('resizestop', resized);
			$that.bind('dialogfocus', focused);
			$that.bind('dialogopen', opened);
			$that.bind('dialogclose', closed);
			
			// Snapping after the dialogs construction
			$.each(dialogOptions.dragOptions, function(i, val){
				$that.parent().draggable('option', i, val);
			});
			
			if (isClosed) {
				$that.dialog('close');
			}
		}
		
		function moved(event, ui) {
			cookie.pos = {
				y: parseInt(ui.offset.top),
				x: parseInt(ui.offset.left)
			};
			Cookies.set(cookieName, cookie, true, cookieOptions);
		}
		
		function resized(event, ui) {
			cookie.dim = {
				w: parseInt(ui.helper.width()),
				h: parseInt(ui.helper.height())
			};
			Cookies.set(cookieName, cookie, true, cookieOptions);
		}
		
		function focused(event, ui) {
			saveStackIndexes();
		}
		
		function opened(event, ui) {
			cookie.closed = 0;
			Cookies.set(cookieName, cookie, true, cookieOptions);
		}
		
		function closed(event, ui) {
			cookie.closed = 1;
			Cookies.set(cookieName, cookie, true, cookieOptions);
		}
		
		function repairZIndex(zIndex) {
			$that.parent('.ui-dialog').css('z-index', zIndex);
		}
		
		this.saveZIndex = function() {
			cookie.z = $that.parent('.ui-dialog').css('z-index');
			Cookies.set(cookieName, cookie, true, cookieOptions);
		};
		
		init();
	}
	
	this.each(saveSpacialConfig);
	this.each(makeWiseWin);
	
	return this;
};

})(jQuery, EasyData);