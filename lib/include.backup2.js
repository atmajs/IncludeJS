;
void

function(w, d) {



	var handler = {},
		helper = {
			isArray: function(value) {
				//- return value && value.toString && value.toString() == '[object Array]';
				return value != null && typeof value === 'object' && value.splice != null;
			},
			extend: function(target, source) {
				for (var key in source) target[key] = source[key];
				return target;
			},
			each: function(arr, fn) {
				if (helper.isArray(arr)) {
					for (var i = 0; i < arr.length; i++) {
						fn(arr[i], i);
					}
				} else if (arr != null) fn(arr, 0);
			},
			invokeEach: function(arr) {
				this.each(arr, function(x, args) {
					if (typeof x === 'function')(args != null ? x.apply(this, args) : x());
				});
			},
			count: function(arr) {
				return helper.isArray(arr) ? arr.length : (arr == null ? 0 : 1);

			},
			doNothing: function(fn) {
				typeof fn == 'function' && fn()
			},
			empty: {},
			reportError: function(e) {
				console.error('IncludeJS:', e.toString(), e);
				typeof handler.onerror == 'function' && handler.onerror(e);
			}
		}

		var newInstance = function(w, d) {
		var cfg = {
			path: ''
		},
			bin = {
				rest: {},
				load: w.loadbin || {},
				script: w.scriptbin || {},
				css: w.cssbin || {},
				modules: {}
			}

			var events = (function(w, d) {
			var readycollection = [],
				loadcollection = [],
				timer = Date.now();

			d.onreadystatechange = function() {
				if (/complete|interactive/g.test(d.readyState) == false) return;


				if (timer) console.log('DOMContentLoader', d.readyState, Date.now() - timer, 'ms');
				events.domReady = true;
				events.ready = helper.doNothing;

				helper.invokeEach(readycollection);
				readycollection = null;

				if (d.readyState == 'complete') {
					events.load = helper.doNothing;
					helper.invokeEach(loadcollection);
					loadcollection = null;
				}
			};
			return {
				ready: function(callback) {
					readycollection.push(callback);
				},
				load: function(callback) {
					loadcollection.push(callback);
				}
			}
		})(w, d);

		function IncludeDeferred() {}
		IncludeDeferred.prototype = { /** assest loaded and dom is ready */
			ready: function(callback) {
				this.onready = callback;
				this._doresolve();
				return this;
			},
			/** assest loaded and window is loaded */
			load: function(callback) {
				this.onload = callback;
				this._doresolve();
				return this;
			},
			/** assest loaded */
			done: function(callback) {
				this.ondone = callback;
				this._doresolve();
				return this;
			},
			resolve: function() {
				this._isresolved = true;
				this._arguments = arguments;
				this._doresolve();
			},
			_doresolve: function() {
				if (this._isresolved != true) return;
				if (this.onready) {
					var callback = this.onready;
					delete this.onready;
					events.ready(callback.bind(this, this._arguments));
				}
				if (this.onload) {
					var callback = this.onload;
					delete this.onready;
					events.load(callback.bind(this, this._arguments));
				}
				if (this.ondone) this.ondone.apply(this, this._arguments);
			}
		}

		var xhr = {
			load: function(url, callback) {
				var xhr = new XMLHttpRequest(),
					s = Date.now();
				xhr.onreadystatechange = function() {
					xhr.readyState == 4 && callback && callback(url, xhr.responseText);
				}
				xhr.open('GET', url, true);
				xhr.send();
			}
		}

		function Resource(type, index, url) {
			//-var _type = type =='compos' ? 'js' : type;
			var _type = type;

			if (bin[_type] && bin[_type][url]) return bin[_type][url];

			(bin[_type] || (bin[_type] = {}))[url] = this;
			this.url = url;
			this.readyState = 0;
			this.stateCallbacks = [];
			this.type = type;
			this.index = 0;

			var tag;
			switch (type) {
			case 'js':
				//-case 'compos':
				this.includes = [];
				xhr.load(url, this.onload.bind(this));

				tag = d.createElement('script');
				tag.type = "application/x-included-placeholder";
				tag.src = url;
				break;
			case 'rest':
			case 'load':
				xhr.load(url, this.onload.bind(this));
				break;
			case 'css':
				this.readyState = 4;

				tag = d.createElement('link');
				tag.href = url;
				tag.rel = "stylesheet";
				tag.type = "text/css";
				break;
			}
			if (tag != null) d.querySelector('head').appendChild(tag);
			return this;
		}

		Resource.prototype = {
			on: function(state, callback) {
				state <= this.readyState ? callback() : this.stateCallbacks.push({
					state: state,
					callback: callback
				});
			},
			onload: function(url, response) {
				if (!response) {
					console.warn('Resource cannt be loaded', this.url);
					this.readystatechanged(4);
					return;
				}
				switch (this.type) {
				case 'load':
				case 'rest':
					this.obj = response;
				case 'css':
					this.readystatechanged(4);
					return;
				};
				
				
				try {

					var include = extendInclude(w.include.bind(this)),
						index = url.lastIndexOf('/');

					include.location = url.substring(index + 1, -index);

					this.obj = eval(response);
				} catch (error) {
					error.url = this.url;
					helper.reportError(error);
					
					this.readystatechanged(4);
					return;
				}
				if (this.includes.length) {
					this.readystatechanged(3);
					helper.each(this.includes, function(x) {
						x.on(4, this.scriptCompleted.bind(this))
					}.bind(this))

				} else {
					this.readystatechanged(4);
				}
			},
			scriptCompleted: function() {
				for (var i = 0; i < this.includes.length; i++) if (this.includes[i].readyState != 4) return;
				this.readystatechanged(4);
			},
			readystatechanged: function(state) {
				if (this.readyState >= state) return;
				this.readyState = state;

				helper.each(this.stateCallbacks, function(x) {
					if (x.state > state || x.callback == null) return;
					x.callback(this.type, this.index, this.url, this.obj);
					x.callback = null;
				}.bind(this))

				if (state == 4) this.stateCallbacks = null;
			}
		}


		// TODO: embedd lazy module loading into include function

		function LazyModule(namespace, url, callback) {
			this.url = url;
			this.includes = [];
			xhr.load(url, function(url, code) {
				this.code = code;
				callback && callback();
			}.bind(this));
			var arr = namespace.split('.'),
				obj = window,
				module = arr[arr.length - 1];
			while (arr.length > 1) {
				var prop = arr.shift();
				obj = obj[prop] || (obj[prop] = {});
			}
			obj.__defineGetter__(module, function() {
				delete obj[module];
				try {
					var include = extendInclude(this._include.bind(this));
					var result = eval(this.code);
					if (typeof result === 'object') obj[module] = result;
				} catch (error) {
					error.url = url;
					helper.reportError(e);
				} finally {
					delete this.code;
					delete this.includes;
					return obj[module];
				}
			}.bind(this));
		}

		var include = function(pckg, arg1, arg2) {
			var callback, module;

			if (typeof arg1 === 'function') callback = arg1;
			else if (typeof arg1 === 'string') module = arg1;

			if (typeof arg2 === 'function') callback = arg2;
			else if (typeof arg2 === 'string') module = arg2;

			var dfr = new IncludeDeferred(),
				toload = 0,
				response = {},
				onload = function(type, index, url, data) {

					if (data) {
						(response[type] || (response[type] = [])).splice(index, 0, data);
					}
					if (--toload == 0) {
						callback && callback(response);
						module && include.trigger(module);

						dfr.resolve(response);
					}
				};

			if (helper.isArray(pckg) || typeof pckg === 'string') {
				pckg = {
					js: pckg
				};
			}

			for (var key in pckg) {
				toload += helper.count(pckg[key]);
			}

			function load(type, uris) {
				helper.each(uris, function(x, index) {
					//-if (type == 'compos') {
					if (type in cfg) {
						x = cfg[type].replace(new RegExp('\\{name\\}', 'g'), x);
						type = 'js';
					}

					var resource = new Resource(type, index, cfg.path + x);
					if (this instanceof Resource) {
						this.includes.push(resource);
					}
					resource.on(4, onload);
				}.bind(this));
			}

			for (var key in pckg) {
				load.call(this, key, pckg[key]);
			}

			return dfr;
		}

		function extendInclude(include) {
			return helper.extend(include, {
				cfg: function(arg) {
					if (typeof arg === 'object') {
						var params = arg;
						for (var key in params) cfg[key] = params[key];
					} else if (typeof arg == 'string') {
						if (arguments.length == 1) return cfg[arg];
						if (arguments.length == 2) cfg[arg] = arguments[1];
					}
					return include;
				},

				ready: function(moduleName, callback) {
					if ((modules[moduleName] || helper.empty).readyState == 4) {
						callback();
					};
					(modules[moduleName] || (modules[moduleName] = {
						callbacks: []
					})).callbacks.push(callback);
				},
				trigger: function(module) {
					var callbacks = modules[module] ? modules[module].callbacks : null;
					modules[module] = {
						readyState: 4
					};
					helper.each(callbacks, function(x) {
						x(module);
					});
				},
				promise: function(namespace) {
					var arr = namespace.split('.'),
						obj = window;						
					while (arr.length) {
						var key = arr.shift();
						obj = obj[key] || (obj[key] = {});
					}
					return obj;
				},
				from: function(path) {
					var b = cfg.path;

					cfg.path = path;
					return function() {
						var r = include.apply(this, arguments);
						cfg.path = b;
						return r;
					}
				},
				module: include,
				scriptbin: bin.script
			});
		}

		return extendInclude(include);

	};

	w.include = newInstance(w, d);
	w.include.newInstance = newInstance;


	if (typeof Function.prototype.bind === 'undefined') {
		Function.prototype.bind = function() {
			if (arguments.length < 2 && typeof arguments[0] == "undefined") return this;
			var __method = this,
				args = Array.prototype.slice.call(arguments),
				object = args.shift();
			return function() {
				return __method.apply(object, args.concat(Array.prototype.slice.call(arguments)));
			}
		}
	}

}(window, document)