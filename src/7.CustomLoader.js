var CustomLoader = (function() {

	var _loaders = {};


	function createLoader(url) {
		var extension = url.substring(url.lastIndexOf('.') + 1);

		if (_loaders.hasOwnProperty(extension)) {
			return _loaders[extension];
		}

		var loaderRoute = cfg.loader[extension],
			path, namespace;

		if (typeof loaderRoute === 'object') {
			for (var key in loaderRoute) {
				namespace = key;
				path = loaderRoute[key];
				break;
			}
		}

		return (_loaders[extension] = new Resource('js', Routes.resolve(namespace, path), namespace));
	}

	return {
		load: function(resource, callback) {

			var loader = createLoader(resource.url);
			loader.done(function() {				
				XHR(resource, function(resource, response) {
					callback(resource, loader.exports.process(response, resource));
				});
			});
		},
		exists: function(resource) {
			if (!(resource.url && cfg.loader)) {
				return false;
			}

			var url = resource.url,
				extension = url.substring(url.lastIndexOf('.') + 1);

			return cfg.loader.hasOwnProperty(extension);
		}
	};
}());