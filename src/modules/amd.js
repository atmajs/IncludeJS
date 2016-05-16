var Amd;
(function(){

	Amd = {
		enable: function () {
			enable();
		}
	};

	var enable;
	(function () {
		enable = function(){
			global.define = global.require = function(a, b, c){
				var i = arguments.length, args = new Array(i);
				while (--i > -1) args[i] = arguments[i];

				var fn = getFn(patterns, args);
				var module = global.include;
				fn(module, a, b, c);
			};
		};
		var patterns = [
			[ [isExports], function(module, exports){
				define(module, null, null, exports);
			} ],
			[ [isString, isExports], function(module, name, exports){
				define(module, name, null, exports);
			} ],
			[ [isString, isArray, isExports], function(module, name, dependencies, exports){
				define(module, name, dependencies, exports);
			} ],
			[ [isArray, isExports], function(module, dependencies, exports){
				define(module, null, dependencies, exports);
			} ]
		];
		function getFn(patterns, args) {
			var i = -1, imax = patterns.length;
			outer: while (++i < imax) {
				var pattern = patterns[i][0];
				if (pattern.length !== args.length) {
					continue;
				}
				var j = -1, jmax = pattern.length;
				while (++j < jmax) {
					var matcher = pattern[j];
					if (matcher(args[j]) === false) {
						continue outer;
					}
				}
				return patterns[i][1];
			}
			console.warn('Define function arguments are invalid', args);
			return emptyFn;
		}
		function emptyFn() {

		}
		function define(module, name, dependencies, exports) {
			if (name != null) {
				_bin.js[name] = module;
			}
			if (dependencies == null) {
				module.exports = getExports(exports);
				return;
			}
			var deps = getDepsInfo(dependencies, module);
			var arr = deps.array;
			var linked = deps.linked;
			if (linked.length === 0) {
				module.exports = getExports(exports, arr);
				return;
			}

			module.js(deps.linked).done(function(resp){
				for(var key in resp) {
					var i = +key;
					arr[i] = resp[key];
				}
				module.exports = getExports(exports, arr);
			});
		}
		function getExports(mix, args) {
			if (typeof mix === 'function') {
				return mix.apply(null, args || []);
			}
			return mix;
		}
		function getDepsInfo(deps, module) {
			var array = new Array(deps.length),
				linked = [],
				imax = deps.length,
				i = -1;
			while (++i < imax) {
				var fn = StaticResolvers[deps[i]];
				if (fn == null) {
					linked.push(deps[i] + '::' + i);
					continue;
				}
				array[i] = fn(module);
			}
			return { array: array, linked: linked };
		}
		var StaticResolvers = {
			'module': function(module) { return module },
			'exports': function(module) { return module.exports },
			'require': function(module) {
				return CommonJS.require;
			}
		};
		function isString(x) {
			return typeof x === 'string';
		}
		function isExports(x) {
			return true;
		}
		function isArray(x) {
			return x instanceof Array;
		}
	}());

	function enableExports() {
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