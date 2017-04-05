var bin,
	Bin;
(function(){

	Bin = {
		add: function(type, id_, resource) {
			var id = normalizeId(id_);
			bin[type][id] = resource;
			bin.all[id] = resource;
		},
		get: function(type, id_) {
			if (id_ == null) {
				return;
			}
			var id = normalizeId(id_);
			var x = bin[type][id];
			if (x == null && /^https?:\//.test(id) && typeof location !== 'undefined') {
				id = id.replace(location.origin, '');
				x = bin[type][id] || bin.all[id];
			}
			if (x == null && cfg.lockedToFolder) {
				var path = path_getDir(location.pathname);
				var sub = path_combine('/', id.replace(path, ''));
				x = bin[type][sub] || bin.all[sub];
			}
			if (x == null && isBrowser && id[0] === '/') {
				var path = path_combine(global.location.origin, id);
				x = bin[type][path] || bin.all[path];
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


	function normalizeId(id_) {
		var id = id_;
		var q = id.indexOf('?');
		if (q !== -1)
			id = id.substring(0, q);

		return id.toLowerCase();
	}
}());