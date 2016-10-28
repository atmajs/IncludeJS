var bin,
	Bin;
(function(){

	Bin = {
		add: function(type, id, resource) {
			bin[type][id] = resource;
			bin.all[id] = resource;
		},
		get: function(type, id) {
			if (id == null) {
				return;
			}
			var x = bin[type][id];
			if (x == null && /^https?:\//.test(id) && typeof location !== 'undefined') {
				id = id.replace(location.origin, '');
				x = bin[type][id] || bin.all[id];
			}
			if (x == null && cfg.lockedToFolder) {
				var path = path_getDir(location.pathname);
				id = path_combine('/', id.replace(path, ''));
				x = bin[type][id] || bin.all[id];
			}			
			return x || bin.all[id];
		}
	};

	bin = {
		js: {},
		css: {},
		load: {},
		ajax: {},
		embed: {},
		mask: {},

		all: {},
	};
}());