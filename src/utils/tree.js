var tree_resolveUsage;


(function(){
	
	tree_resolveUsage = function(resource, usage){
		var use = [],
			imax = usage.length,
			i = -1;
		while( ++i < imax ) {
			
			use[i] = use_resolveExports(usage[i], resource.parent);
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
				console.warn('<include:use> Used resource has no exports');
				// endif
				return exports;
			}
		}
		
		return use_resolveExports(resource.parent);
	}
	
	
}());