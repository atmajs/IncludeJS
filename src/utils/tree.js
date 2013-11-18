var tree_resolveUsage;


(function(){
	
	tree_resolveUsage = function(resource, usage){
		var use = [],
			imax = usage.length,
			i = -1,
			
			obj, path, name, index
			;
		while( ++i < imax ) {
			
			name = path = usage[i];
			index = path.indexOf('.');
			if ( index !== -1) {
				name = path.substring(0, index);
				path = path.substring(index + 1);
			}
			
			obj = use_resolveExports(name, resource.parent);
			
			if (name !== path) 
				obj = obj_getProperty(obj, path);
			
			
			
			use[i] = obj;
		}
		
		return use;
	};
	
	
	function use_resolveExports(name, resource){
		
		if (resource == null) {
			// if DEBUG
			console.warn('<include:use> Not Found. Ensure to have it included before with correct alias', name);
			// endif
			return null;
		}
		
		
		var includes = resource.includes,
			i = -1,
			imax = includes.length,
			
			include, exports
			;
			
		while( ++i < imax) {
			include = includes[i];
			if (include.route.alias === name) {
				exports = include.resource.exports;
				// if DEBUG
				exports == null && console.warn('<include:use> Used resource has no exports');
				// endif
				return exports;
			}
		}
		
		return use_resolveExports(resource.parent);
	}
	
	
}());