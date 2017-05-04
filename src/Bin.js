var bin,
	Bin;
(function(){

	Bin = {
		add: function(type, id_, resource) {
			var id = normalizeId(id_);
			bin[type][id] = resource;
			bin.all[id] = resource;
		},
		find: function (url) {
			var id = path_isRelative(url) 
				? '/' + url
				: url;
			for (var type_ in bin) {
				var x = Bin.get(type_, id);
				if (x != null) {
					return x;
				}
			}
			return null;
		},
		remove: function (url) {
			var resource = Bin.find(url);
			if (resource == null) {
				return;
			}
			for (var type_ in bin) {
				clear(bin[type_], resource)
			}
			function clear (hash, x) {
				for (var key in hash) {
					if (hash[key] === x) {
						hash[key] = null;
					}
				}
			}
		},
		get: function(type, id_) {
			if (id_ == null) {
				return;
			}
			if (type == null) {
				return Bin.find(id_);
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