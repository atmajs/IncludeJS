var path_getDir,
	path_getFile,
	path_getExtension,
	path_resolveCurrent,
	path_normalize,
	path_win32Normalize,
	path_resolveUrl,
	path_combine,
	path_isRelative
	;

(function(){


	path_getDir = function(path) {
		return path.substring(0, path.lastIndexOf('/') + 1);
	};

	path_getFile = function(path) {
		path = path
			.replace('file://', '')
			.replace(/\\/g, '/')
			.replace(/\?[^\n]+$/, '');

		if (/^\/\w+:\/[^\/]/i.test(path)){
			// win32 drive
			return path.substring(1);
		}
		return path;
	};

	path_getExtension = function(path) {
		var query = path.indexOf('?');
		if (query === -1) {
			return path.substring(path.lastIndexOf('.') + 1);
		}

		return path.substring(path.lastIndexOf('.', query) + 1, query);
	};

	path_resolveCurrent = function() {

		if (document == null) {
			return typeof module === 'undefined'
				? ''
				: path_win32Normalize(module.parent.filename);
		}
		var scripts = document.getElementsByTagName('script'),
			last = scripts[scripts.length - 1],
			url = last && last.getAttribute('src') || '';

		if (url[0] === '/') {
			return url;
		}

		var location = window
			.location
			.pathname
			.replace(/\/[^\/]+\.\w+$/, '');

		if (location[location.length - 1] !== '/') {
			location += '/';
		}

		return location + url;
	};

	path_normalize = function(path) {
		return path
			.replace(/\\/g, '/')
			// remove double slashes, but not near protocol
			.replace(/([^:\/])\/{2,}/g, '$1/')
			;
	};

	path_win32Normalize = function(path){
		path = path_normalize(path);
		if (path.substring(0, 5) === 'file:')
			return path;

		return 'file:///' + path;
	};

	path_resolveUrl = function(url, parent) {

		if (reg_hasProtocol.test(url)) {
			return path_collapse(url);
		}
		if (url.substring(0, 2) === './') {
			url = url.substring(2);
		}
		if (url[0] === '/' && parent != null && parent.base != null) {
			url = path_combine(parent.base, url);
			if (reg_hasProtocol.test(url)) {
				return path_collapse(url);
			}
		}
		if (url[0] === '/' && cfg.path) {
			url = cfg.path + url.substring(1);
			if (reg_hasProtocol.test(url)) {
				return path_collapse(url);
			}
		}
		if (url[0] !== '/' && parent != null && parent.location != null) {
			url = parent.location + url;
		}
		if (url[0] === '/' && (isWeb === false || cfg.lockedToFolder === true)) {
			url = url.substring(1);
		}
		return path_collapse(url);
	};

	path_isRelative = function(path) {
		var c = path.charCodeAt(0);

		switch (c) {
			case 47:
				// /
				return false;
			case 102:
				// f
			case 104:
				// h
				return reg_hasProtocol.test(path) === false;
		}

		return true;
	};

	path_combine = function() {
		var out = '',
			imax = arguments.length,
			i = -1,
			x
			;
		while ( ++i < imax ){
			x = arguments[i];
			if (!x)
				continue;

			x = path_normalize(x);

			if (out === '') {
				out = x;
				continue;
			}

			if (out[out.length - 1] !== '/')
				out += '/'

			if (x[0] === '/')
				x = x.substring(1);

			out += x;
		}

		return out;
	};

	function path_collapse(url) {
		while (url.indexOf('../') !== -1) {
			url = url.replace(reg_subFolder, '');
		}

		return url.replace(/\/\.\//g, '/');
	}

}());
