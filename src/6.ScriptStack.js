/** @TODO Refactor loadBy* {combine logic} */

var ScriptStack = (function() {

	var head,
		currentResource,
		stack = [],
		
		_cb_complete = [],
		_paused;
		
		
	function loadScript(url, callback) {
		//console.log('load script', url);
		var tag = document.createElement('script');
		tag.type = 'text/javascript';
		tag.src = url;

		if ('onreadystatechange' in tag) {
			tag.onreadystatechange = function() {
				(this.readyState === 'complete' || this.readyState === 'loaded') && callback();
			};
		} else {
			tag.onload = tag.onerror = callback;
		}
		
		;(head || (head = document.getElementsByTagName('head')[0])).appendChild(tag);
	}

	function loadByEmbedding() {
		if (_paused) {
			return;
		}
		
		if (stack.length === 0){
			trigger_complete();
			return;
		}

		if (currentResource != null) {
			return;
		}

		var resource = (currentResource = stack[0]);

		if (resource.state === 1) {
			return;
		}

		resource.state = 1;

		global.include = resource;
		global.iparams = resource.route.params;


		function resourceLoaded(e) {


			if (e && e.type === 'error') {
				console.log('Script Loaded Error', resource.url);
			}

			var i = 0,
				length = stack.length;

			for (; i < length; i++) {
				if (stack[i] === resource) {
					stack.splice(i, 1);
					break;
				}
			}

			if (i === length) {
				console.error('Loaded Resource not found in stack', resource);
				return;
			}

			if (resource.state !== 2.5) 
				resource.readystatechanged(3);
			currentResource = null;
			loadByEmbedding();
		}

		if (resource.source) {
			__eval(resource.source, resource);

			resourceLoaded();
			return;
		}

		loadScript(resource.url, resourceLoaded);
	}
	
	function processByEval() {
		if (_paused) {
			return;
		}
		
		if (stack.length === 0){
			trigger_complete();
			return;
		}
		
		if (currentResource != null) {
			return;
		}

		var resource = stack[0];

		if (resource.state < 2) {
			return;
		}

		currentResource = resource;

		resource.state = 1;
		global.include = resource;

		//console.log('evaling', resource.url, stack.length);
		__eval(resource.source, resource);

		for (var i = 0, x, length = stack.length; i < length; i++) {
			x = stack[i];
			if (x === resource) {
				stack.splice(i, 1);
				break;
			}
		}

		if (resource.state !== 2.5) 
			resource.readystatechanged(3);
		currentResource = null;
		processByEval();

	}
	
	
	function trigger_complete() {
		var i = -1,
			imax = _cb_complete.length;
		while (++i < imax) {
			_cb_complete[i]();
		}
		
		_cb_complete.length = 0;
	}

	

	return {
		load: function(resource, parent, forceEmbed) {

			this.add(resource, parent);

			if (!cfg.eval || forceEmbed) {
				loadByEmbedding();
				return;
			}

			// was already loaded, with custom loader for example
			if (resource.source) {
				resource.state = 2;
				processByEval();
				return;
			}

			XHR(resource, function(resource, response) {
				if (!response) {
					console.error('Not Loaded:', resource.url);
				}

				resource.source = response;
				resource.state = 2;

				processByEval();
			});
		},
		
		add: function(resource, parent){
			
			if (resource.priority === 1) 
				return stack.unshift(resource);
			
			
			if (parent == null) 
				return stack.push(resource);
				
			
			var imax = stack.length,
				i = -1
				;
			// move close to parent
			while( ++i < imax){
				if (stack[i] === parent) 
					return stack.splice(i, 0, resource);
			}
			
			// was still not added
			stack.push(resource);
		},
		
		/* Move resource in stack close to parent */
		moveToParent: function(resource, parent) {
			var length = stack.length,
				parentIndex = -1,
				resourceIndex = -1,
				i;

			for (i = 0; i < length; i++) {
				if (stack[i] === resource) {
					resourceIndex = i;
					break;
				}
			}

			if (resourceIndex === -1) {
				return;
			}

			for (i= 0; i < length; i++) {
				if (stack[i] === parent) {
					parentIndex = i;
					break;
				}
			}

			if (parentIndex === -1) {
				return;
			}

			if (resourceIndex < parentIndex) {
				return;
			}

			stack.splice(resourceIndex, 1);
			stack.splice(parentIndex, 0, resource);


		},
		
		pause: function(){
			_paused = true;
		},
		
		resume: function(){
			_paused = false;
			
			if (currentResource != null) 
				return;
			
			this.touch();
		},
		
		touch: function(){
			var fn = cfg.eval
				? processByEval
				: loadByEmbedding
				;
			fn();
		},
		
		complete: function(callback){
			if (_paused === false && stack.length === 0) {
				callback();
				return;
			}
			
			_cb_complete.push(callback);
		}
	};
})();
