/*
 * jQuery Taskbar plugin.
 * Depends on jQuery 1.3.2 or higher, jQueryUI 1.7.1 or higher, WiseWin plugin and EasyData library
 */
(function($, ED){
	

$.fn.taskbar = function(options, wins) {
	var id = this[0].id,
		that = this,
		defaults = {
			insertIntoContainer: function(element, container) {
				var title = element.prev('.ui-dialog-titlebar').find('.ui-dialog-title').text(),
					elHtml = '<span id="' + element[0].id + '_holder"><a href="#" alt="' + title + '">' + title + '</a></span>';
					holder = $(elHtml).hide();
				container.append(holder);
				return holder;
			},
			findHolders: function() {
				return that.find('span');
			}
		},
		settings = $.extend({}, defaults, options) ;
	
	function showClosed(event) {
		var holder = event.data.holder,
			win = event.data.win;
			
		holder.fadeIn();
	}
	
	function hideOpened(event) {
		var holder = event.data.holder,
			win = event.data.win;
			
		holder.fadeOut();
	}
	
	this.add = function(winsToAdd) {
		var container = $(that);
		$(winsToAdd).each(function(){
			var $this = $(this),
				holder = settings.insertIntoContainer($this, container),
				data = {
					win: $this,
					holder: holder
				};
			$this.bind('dialogopen', data, hideOpened);
			$this.bind('dialogclose', data, showClosed);
			
			holder.bind('click', function(){
				$this.dialog('open');
				return false;
			});
			
			if (!$this.dialog('isOpen')) {
				showClosed({data: data});
			}
		});
	};
	
	if (wins) this.add(wins);
};

})(jQuery, EasyData);