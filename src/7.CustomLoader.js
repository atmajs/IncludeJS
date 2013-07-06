var CustomLoader = (function() {

	// import loader/json.js

	var _loaders = {
		'json': JSONParser
	};

	cfg.loader = {
		json : 1
	}
	
	function createLoader(url) {
		var extension = url.substring(url.lastIndexOf('.') + 1);

		if (_loaders.hasOwnProperty(extension)) {
			return _loaders[extension];
		}

		var loaderRoute = cfg.loader[extension],
			path = loaderRoute,
			namespace = null;

		if (typeof loaderRoute === 'object') {
			for (var key in loaderRoute) {
				namespace = key;
				path = loaderRoute[key];
				break;
			}
		}

		return (_loaders[extension] = new Resource('js', Routes.resolve(namespace, path), namespace));
	}
	
	function doLoad(resource, loader, callback) {
		XHR(resource, function(resource, response) {
			callback(resource, loader.process(response, resource));
		});
	}

	return {
		load: function(resource, callback) {

			var loader = createLoader(resource.url);
			
			if (loader.process) {
				doLoad(resource, loader, callback);
				return;
			}
			
			loader.done(function() {
				doLoad(resource, loader.exports, callback);
			});
		},
		exists: function(resource) {
			if (!(resource.url && cfg.loader)) {
				return false;
			}

			var url = resource.url,
				extension = url.substring(url.lastIndexOf('.') + 1);

			return cfg.loader.hasOwnProperty(extension);
		},
		
		/**
		 *	IHandler:
		 *	{ process: function(content) { return _handler(content); }; }
		 */
		register: function(extension, handler){
			_loaders[extension] = handler;
		}
	};
}());
