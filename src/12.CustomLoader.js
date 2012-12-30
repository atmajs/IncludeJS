var CustomLoader = (function() {

	var _handlers = {};
	return {
		handle: function(resource) {
			
			if (!resource.url){
				return false;
			}

			var url = resource.url,
				extension = url.substring(url.lastIndexOf('.') + 1);
			
			
			if (_handlers.hasOwnProperty(extension) === false){
				return false;
			}
			
			Helper.xhr(resource.url, function(url, response){
				resource.source = resource;
				
				
				_handlers[extension](resource);
				
				resource.readystatechanged(3);
			});
			
			return true;
		},
		register: function(extension, handler) {
			_handlers[extension] = handler;
		}
	};
}());