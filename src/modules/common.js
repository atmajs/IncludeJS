var CommonJS;
(function(){
	CommonJS = {
		exports: null,
		require: function(path){
			if (path.charCodeAt(0) !== 46 && __requireNative != null) {
				// .
				return __requireNative(path);
			}

			var currentSync = cfg.sync;
			var currentEval = cfg.eval;
			var currentInclude = include;
			var exports = null;

			cfg.sync = true;
			cfg.eval = true;
			include.js(path + '::Module').done(function(resp) {
				exports = resp.Module;
			});
			include = currentInclude;
			cfg.sync = currentSync;
			cfg.eval = currentEval;
			return exports;
		},
		enable: function () {
			if (typeof __requireNative === 'function') {
				return;
			}

			enableExports();
			enableRequire();
		}
	};


	function enableRequire(){
		global.require = CommonJS.require
	}

	function enableExports() {
		if (typeof module != 'undefined') {
			return;
		}
		if (typeof Object.defineProperty === 'undefined'){
			console.warn('Browser do not support Object.defineProperty');
			return;
		}
		Object.defineProperty(global, 'module', {
			get: function() {
				return global.include;
			},
			configurable: true
		});

		Object.defineProperty(global, 'exports', {
			get: function() {
				var current = global.include;
				return (current.exports || (current.exports = {}));
			},
			set: function(exports) {
				global.include.exports = exports;
			},
			configurable: true
		});
	}

}());