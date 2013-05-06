var Events = (function(document) {
	if (document == null) {
		return {
			ready: fn_doNothing,
			load: fn_doNothing
		};
	}
	var readycollection = [];

	function onReady() {
		Events.ready = fn_doNothing;

		if (readycollection == null) {
			return;
		}

		arr_invoke(readycollection);
		readycollection = null;
	}

	/** TODO: clean this */

	if (document.hasOwnProperty('onreadystatechange')) {
		document.onreadystatechange = function() {
			if (/complete|interactive/g.test(document.readyState) === false) {
				return;
			}
			onReady();
		};
	} else if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', onReady);
	}else {
		window.onload = onReady;
	}


	return {
		ready: function(callback) {
			readycollection.unshift(callback);
		}
	};
})(document);
