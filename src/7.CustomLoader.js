var CustomLoader = (function() {

	// import loader/json.js

	cfg.loader = {
		json : JSONParser
	};
	
	function loader_isInstance(x) {
		if (typeof x === 'string')
			return false;
		
		return typeof x.ready === 'function' || typeof x.process === 'function';
	}
	
	function createLoader(url) {
		var extension = url.substring(url.lastIndexOf('.') + 1),
			loader = cfg.loader[extension];

		if (loader_isInstance(loader)) {
			return loader;
		}

		var path = loader,
			namespace;

		if (typeof path === 'object') {
			// is route {namespace: path}
			for (var key in path) {
				namespace = key;
				path = path[key];
				break;
			}
		}

		return (cfg.loader[extension] = new Resource('js', Routes.resolve(namespace, path), namespace));
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
			if (!resource.url) {
				return false;
			}

			var url = resource.url,
				extension = url.substring(url.lastIndexOf('.') + 1);

			return cfg.loader.hasOwnProperty(extension);
		},
		
		/**
		 *	IHandler:
		 *	{ process: function(content) { return _handler(content); }; }
		 *
		 *	Url:
		 *	 path to IHandler
		 */
		register: function(extension, handler){
			cfg.loader[extension] = handler;
		}
	};
}());
