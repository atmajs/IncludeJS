var tree_resolveUsage;


(function(){
	
	tree_resolveUsage = function(resource, usage, next){
		var use = [],
			imax = usage.length,
			i = -1,
			
			obj, path, name, index, parent
			;
		while( ++i < imax ) {
			
			name = path = usage[i];
			index = path.indexOf('.');
			if ( index !== -1) {
				name = path.substring(0, index);
				path = path.substring(index + 1);
			}
			
			parent = use_resolveParent(name, resource.parent, resource);
			if (parent == null) 
				return null;
			
			if (parent.state !== 4){
				resource.state = 3;
				parent.on(4, next, parent, 'push');
				return null;
			}
			
			obj = parent.exports;
			
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
	
	
	function use_resolveParent(name, resource, initiator){
		
		if (resource == null) {
			// if DEBUG
			console.warn('<include> Usage Not Found:', name);
			console.warn('- Ensure to have it included before with the correct alias')
			console.warn('- Initiator Stacktrace:');
			
			var arr = [], res = initiator;
			while(res != null){
				arr.push(res.url);
				res = res.parent;
			}
			console.warn(arr.join('\n'));
			// endif
			
			return null;
		}
		
		
		var includes = resource.includes,
			i = -1,
			imax = includes.length,
			
			include, exports, alias
			;
			
		while( ++i < imax ) {
			include = includes[i];
			alias = include.route.alias || Routes.parseAlias(include.route);
			if (alias === name) 
				return include.resource;
		}
		
		return use_resolveParent(name, resource.parent, initiator);
	}
	
	
}());