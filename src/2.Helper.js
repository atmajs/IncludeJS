var Helper = { /** TODO: improve url handling*/
	uri: {
		getDir: function(url) {
			var index = url.lastIndexOf('/');
			return index == -1 ? '' : url.substring(index + 1, -index);
		},
		/** @obsolete */
		resolveCurrent: function() {
			var scripts = document.getElementsByTagName('script');
			return scripts[scripts.length - 1].getAttribute('src');
		},
		resolveUrl: function(url, parent) {
			if (cfg.path && url[0] == '/') {
				url = cfg.path + url.substring(1);
			}

			switch (url.substring(0, 5)) {
				case 'file:':
				case 'http:':
					return url;
			}

			if (url.substring(0,2) === './'){
				url = url.substring(2);
			}


			if (url[0] === '/') {
				if (isWeb === false || cfg.lockedToFolder === true) {
					url = url.substring(1);
				}
			}else if (parent != null && parent.location != null) {
				url = parent.location + url;
			}


			while(url.indexOf('../') > -1){
				url = url.replace(/[^\/]+\/\.\.\//,'');
			}

			return url;
		}
	},
	extend: function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			if (typeof source === 'function') {
				source = source.prototype;
			}
			for (var key in source) {
				target[key] = source[key];
			}
		}
		return target;
	},
	invokeEach: function(arr, args) {
		if (arr == null) {
			return;
		}
		if (arr instanceof Array) {
			for (var i = 0, x, length = arr.length; i < length; i++) {
				x = arr[i];
				if (typeof x === 'function') {
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
	}
},

	XHR = function(resource, callback) {
		var xhr = new XMLHttpRequest(),
			s = Date.now();
		xhr.onreadystatechange = function() {
			xhr.readyState == 4 && callback && callback(resource, xhr.responseText);
		};

		xhr.open('GET', typeof resource === 'object' ? resource.url : resource, true);
		xhr.send();
	};
