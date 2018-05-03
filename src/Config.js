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

	var isFileProtocol = document 
		&& document.location 
		&& document.location.protocol === 'file:'

	Config = function() {};
	Config.prototype = {

		path: null,
		loader: null,
		version: null,
		lockedToFolder: isFileProtocol,
		sync: false,
		eval: document == null,
		es6Exports: false,

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
				set(this, a, b);
				return ctx;
			}
			if (aType === 'object' && b == null) {
				for (var key in a) {
					set(this, key, a[key]);
				}
			}
			return ctx;
		},
	};

	function set(cfg, key, value) {
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
				PathResolver.configMap(value);
				return;
			case 'extentionDefault':
				PathResolver.configExt({ def: value });
				return;
			case 'extentionTypes':
				PathResolver.configExt({ types: value });
				return;
		}
		if ((key in cfg) === false) {
			console.warn('Not supported config', key);
		}
		cfg[key] = value;
	}

	cfg = new Config;

	function enableModules() {
		if (typeof Object.defineProperty === 'undefined'){
			console.warn('Browser do not support Object.defineProperty');
			return;
		}
		Object.defineProperty(global, 'module', {
			get: function() {
				return global.include;
			}
		});

		Object.defineProperty(global, 'exports', {
			get: function() {
				var current = global.include;
				return (current.exports || (current.exports = {}));
			},
			set: function(exports) {
				global.include.exports = exports;
			}
		});
	}

}());