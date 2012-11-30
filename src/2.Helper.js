
var Helper = { /** TODO: improve url handling*/
	uri: {
		getDir: function(url) {
			var index = url.lastIndexOf('/');
			return index == -1 ? '' : url.substring(index + 1, -index);
		},
		/** @obsolete */
		resolveCurrent: function() {
			var scripts = document.querySelectorAll('script');
			return scripts[scripts.length - 1].getAttribute('src');
		},
		resolveUrl: function(url, parent) {
			if (cfg.path && url[0] == '/') {
				url = cfg.path + url.substring(1);
			}
			if (url[0] == '/') {
				if (isWeb === false || cfg.lockedToFolder === true) {
					return url.substring(1);
				}
				return url;
			}
			switch (url.substring(0, 4)) {
			case 'file':
			case 'http':
				return url;
			}

			if (parent != null && parent.location != null) {
				return parent.location + url;
			}
			return url;
		}
	},
	extend: function(target, source) {
		for (var key in source) {
			target[key] = source[key];
		}
		return target;
	},
	/**
	 *	@arg x :
	 *	1. string - URL to resource
	 *	2. array - URLs to resources
	 *	3. object - {route: x} - route defines the route template to resource,
	 *		it must be set before in include.cfg.
	 *		example:
	 *			include.cfg('net','scripts/net/{name}.js')
	 *			include.js({net: 'downloader'}) // -> will load scipts/net/downloader.js
	 *	@arg namespace - route in case of resource url template, or namespace in case of LazyModule
	 *
	 *	@arg fn - callback function, which receives namespace|route, url to resource and ?id in case of not relative url
	 *	@arg xpath - xpath string of a lazy object 'object.sub.and.othersub';
	 */
	eachIncludeItem: function(type, x, fn, namespace, xpath) {
		var key;
		
		if (x == null) {
			console.error('Include Item has no Data', type, namespace);
			return;
		}

		if (type == 'lazy' && xpath == null) {
			for (key in x) {
				this.eachIncludeItem(type, x[key], fn, null, key);
			}
			return;
		}
		if (x instanceof Array) {
			for (var i = 0; i < x.length; i++) {
				this.eachIncludeItem(type, x[i], fn, namespace, xpath);
			}
			return;
		}
		if (typeof x === 'object') {
			for (key in x) {
				this.eachIncludeItem(type, x[key], fn, key, xpath);
			}
			return;
		}

		if (typeof x === 'string') {
			var route = namespace && cfg[namespace];
			if (route) {
				namespace += '.' + x;
				x = route.replace(regexpName, x);
			}
			fn(namespace, x, xpath);
			return;
		}

		console.error('Include Package is invalid', arguments);
	},
	invokeEach: function(arr, args) {
		if (arr == null) {
			return;
		}
		if (arr instanceof Array) {
			for (var i = 0, x, length = arr.length; i < length; i++) {
				x = arr[i];
				if (typeof x === 'function'){
					(args != null ? x.apply(this, args) : x());
				}
			}
		}
	},
	doNothing: function(fn) {
		typeof fn == 'function' && fn();
	},
	reportError: function(e) {
		console.error('IncludeJS Error:', e, e.message, e.url);
		typeof handler.onerror == 'function' && handler.onerror(e);
	},
	ensureArray: function(obj, xpath) {
		if (!xpath) {
			return obj;
		}
		var arr = xpath.split('.');
		while (arr.length - 1) {
			var key = arr.shift();
			obj = obj[key] || (obj[key] = {});
		}
		return (obj[arr.shift()] = []);
	},
	xhr: function(url, callback) {
		var xhr = new XMLHttpRequest(),
			s = Date.now();
		xhr.onreadystatechange = function() {
			xhr.readyState == 4 && callback && callback(url, xhr.responseText);
		};
		
		xhr.open('GET', url, true);
		xhr.send();
	}
};