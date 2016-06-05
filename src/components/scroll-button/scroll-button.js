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