var bin,
	Bin;
(function(){

	Bin = {
		add: function(type, id, resource) {
			bin[type][id] = resource;
			bin.all[id] = resource;
		},
		get: function(type, id) {
			var x = bin[type][id];
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