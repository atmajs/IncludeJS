var cfg,
	Config;
(function(){

	/**
	 *	path = root path. @default current working path, im browser window.location;
	 *	eval = in node.js this conf. is forced
	 *	lockedToFolder = makes current url as root path
	 *		Example "/script/main.js" within this window.location "{domain}/apps/1.html"
	 *		will become "{domain}/apps/script/main.js" instead of "{domain}/script/main.js"
	*/

	Config = function() {};
	Config.prototype = {

		path: null,
		loader: null,
		version: null,
		lockedToFolder: false,
		sync: false,
		eval: document == null,

		call: function(ctx, a, b){
			if (a == null) {
				return this;
			}
			var aType = typeof a;
			var bType = typeof b;
			if (aType === 'string' && b == null) {
				return this[a];
			}
			if (aType === 'string' && b != null) {
				set(a, b);
				return ctx;
			}
			if (aType === 'object' && b == null) {
				for (var key in a) {
					set(key, a[key]);
				}
			}
			return ctx;
		},
	};

	function set(key, value) {
		switch(key){
			case 'loader':
				for(var x in value){
					CustomLoader.register(x, value[x]);
				}
				return;
			case 'modules':
				if (value === true) enableModules();
				return;
			case 'commonjs':
				if (value === true) CommonJS.enable();
				return;
			case 'amd':
				if (value === true) Amd.enable();
				return;
			case 'map':
				PathResolver.map(value);
				return;
		}
		if (key in this === false) {
			console.warn('Not supported config', key);
		}
		this[key] = value;
	}

	cfg = new Config;
}());