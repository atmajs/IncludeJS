var Events = (function(document) {
	if (document == null) {
		return {
			ready: Helper.doNothing,
			load: Helper.doNothing
		};
	}
	var readycollection = [],
		loadcollection = null,
		readyqueue = null,
		timer = Date.now();

	document.onreadystatechange = function() {
		if (/complete|interactive/g.test(document.readyState) === false) {
			return;
		}
		if (timer) {
			console.log('DOMContentLoader', document.readyState, Date.now() - timer, 'ms');
		}
		Events.ready = (Events.readyQueue = Helper.doNothing);


		Helper.invokeEach(readyqueue);

		Helper.invokeEach(readycollection);
		readycollection = null;
		readyqueue = null;


		if (document.readyState == 'complete') {
			Events.load = Helper.doNothing;
			Helper.invokeEach(loadcollection);
			loadcollection = null;
		}
	};

	return {
		ready: function(callback) {
			readycollection.unshift(callback);
		},
		readyQueue: function(callback) {
			(readyqueue || (readyqueue = [])).push(callback);
		},
		load: function(callback) {
			(loadcollection || (loadcollection = [])).unshift(callback);
		}
	};
})(document);