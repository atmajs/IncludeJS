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
				var path = id.replace(location.origin, '');
				x = bin[type][path];
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