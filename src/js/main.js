$(function() {

	$('.scroll-button').on('click', function (event) {
		event.preventDefault();
		var el = $(this);
		var targetEl = $($(el).attr('href'));
		var targetElOffset = targetEl.offset().top - 50;
		animateScroll(targetElOffset);
	});

	function animateScroll(targetElOffset) {
		$('html, body').stop().animate({
			scrollTop: targetElOffset
		}, 600);
	}

});
$(function() {

	$('.waypoints').waypoint(function(direction) {
		if (direction === 'down') {
			var elementId = this.element.id;
			changeActiveLink(elementId);
		}
	}, {
		offset: '50%'
	});

	$('.waypoints').waypoint(function(direction) {
		if (direction === 'up') {
			var elementId = this.element.id;
			changeActiveLink(elementId);
		}
	}, {
		offset: '-50%'
	});

	function changeActiveLink(elementId) {
		$('.main-menu__link').each(function() {
			var el = $(this);
			if (el.attr('href') == '#' + elementId) {
				el
					.parent().addClass('main-menu__item_active')
					.siblings().removeClass('main-menu__item_active');
			}
		});
	}

});
$(function() {
	$('.weight-form__select').customSelect();

	$('.weight-form__input').placeholder();
});
//# sourceMappingURL=maps/main.js.map
