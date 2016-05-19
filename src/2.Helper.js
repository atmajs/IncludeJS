var Helper = { /** TODO: improve url handling*/

	reportError: function(e) {
		console.error('IncludeJS Error:', e, e.message, e.url);
		typeof handler.onerror === 'function' && handler.onerror(e);
	}

},

	XHR = function(resource, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			xhr.readyState === 4 && callback && callback(resource, xhr.responseText);
		};

		var url = typeof resource === 'object' ? resource.url : resource;
		var async = cfg.sync === true ? false : true;
		if (isBrowser && cfg.version) {
			url = (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + cfg.version;
		}
		xhr.open('GET', url, async);
		xhr.send();
	},
	XHR_LOAD = function (url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState !== 4) {
				return;
			}
			if (xhr.status !== 200) {
				callback(xhr.status);
				return;
			}
			callback(null, xhr.responseText);
		};

		xhr.open('GET', url, cfg.sync === true ? false : true);
		xhr.send();
	};
