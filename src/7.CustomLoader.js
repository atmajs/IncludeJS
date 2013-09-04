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
		var extension = path_getExtension(url),
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
	
	function loader_completeDelegate(callback, resource) {
		return function(response){
			callback(resource, response);
		};
	}
	
	function loader_process(source, resource, loader, callback) {
		var delegate = loader_completeDelegate(callback, resource),
			syncResponse = loader.process(source, resource, delegate);
		
		// match also null
		if (typeof syncResponse !== 'undefined') {
			callback(resource, syncResponse);
		}
	}
	
	function tryLoad(resource, loader, callback) {
		if (typeof resource.exports === 'string') {
			loader_process(resource.exports, resource, loader, callback);
			return;
		}
		
		XHR(resource, function(resource, response) {
			loader_process(response, resource, loader, callback);
		});
	}

	return {
		load: function(resource, callback) {

			var loader = createLoader(resource.url);
			
			if (loader.process) {
				tryLoad(resource, loader, callback);
				return;
			}
			
			loader.done(function() {
				tryLoad(resource, loader.exports, callback);
			});
		},
		exists: function(resource) {
			if (!resource.url) {
				return false;
			}

			var ext = path_getExtension(resource.url);

			return cfg.loader.hasOwnProperty(ext);
		},
		
		/**
		 *	IHandler:
		 *	{ process: function(content) { return _handler(content); }; }
		 *
		 *	Url:
		 *	 path to IHandler
		 */
		register: function(extension, handler){
			if (typeof handler === 'string'){
				var resource = include;
				if (resource.location == null) { 
					resource = {
						location: path_getDir(path_resolveCurrent())
					};
				}

				handler = path_resolveUrl(handler, resource);
			}

			cfg.loader[extension] = handler;
		}
	};
}());
