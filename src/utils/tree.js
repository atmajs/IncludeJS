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
			
			// if DEBUG
			(typeof obj === 'object' && obj == null)
				&& console.warn('<include:use> Used resource has no exports', name, resource.url);
			// endif
			
			
			use[i] = obj;
		}
		
		return use;
	};
	
	
	function use_resolveExports(name, resource, initiator){
		
		if (resource == null) {
			// if DEBUG
			console.warn('<include> Usage Not Found:', name);
			console.warn('- Ensure to have it included before with the correct alias')
			console.warn('- Initiator:', initiator.url);
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
			
			if (include.route.alias === name) 
				return include.resource.exports;
		}
		
		return use_resolveExports(name, resource.parent, initiator || resource);
	}
	
	
}());