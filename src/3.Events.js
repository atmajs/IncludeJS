var Events = (function(document) {
	if (document == null) {
		return {
			ready: Helper.doNothing,
			load: Helper.doNothing
		};
	}
	var readycollection = [],
		timer = Date.now();

	function onReady() {
		Events.ready = Helper.doNothing;

		if (readycollection == null) {
			return;
		}

		Helper.invokeEach(readycollection);
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
