var ScriptStack = (function() {

	var head,
		stack = [],
		loadScript = function(url, callback) {
			//console.log('load script', url);
			var tag = document.createElement('script');
			tag.type = 'application/javascript';
			tag.src = url;
			tag.onload = tag.onerror = callback;

			(head || (head = document.querySelector('head'))).appendChild(tag);
		},
		afterScriptRun = function(resource) {
			var includes = resource.includes;

			if (includes != null && includes.length) {
				for (var i = 0; i < includes.length; i++) {
					if (includes[i].state != 4) {
						return;
					}
				}
			}
			resource.readystatechanged(4);
		},
		loadByEmbedding = function() {
			if (stack.length === 0) {
				return;
			}

			var resource = stack[0];

			if (resource.state === 1) {
				return;
			}


			resource.state = 1;

			global.include = resource;
			
			loadScript(resource.url, function(e) {

				for (var i = 0, length = stack.length; i < length; i++) {
					if (stack[i] === resource) {
						stack.splice(i, 1);
						break;
					}
				}
				resource.state = 3;
				afterScriptRun(resource);
				loadByEmbedding();
			});

		},

		processByEval = function() {
			var resource = stack[0];

			if (resource && resource.state > 2) {
				resource.state = 0;

				//console.log('evaling', resource.url, stack.length);			
				try {
					__eval(resource.source, resource);
				} catch (error) {
					error.url = resource.url;
					Helper.reportError(error);
				}
				for (var i = 0, x, length = stack.length; i < length; i++) {
					x = stack[i];
					if (x == resource) {
						stack.splice(i, 1);
						break;
					}
				}
				resource.state = 3;
				afterScriptRun(resource);
				processByEval();
			}
		};
		

	return {
		load: function(resource, parent) {
			
			//console.log('LOAD', resource.url, 'parent:',parent ? parent.url : '');

			var added = false;
			if (parent) {
				for (var i = 0, length = stack.length; i < length; i++) {
					if (stack[i] === parent) {
						stack.splice(i, 0, resource);
						added = true;
						break;
					}
				}
			}

			if (!added) {
				stack.push(resource);
			}

			if (cfg.eval) {
				Helper.xhr(resource.url, function(url, response) {
					if (!response) {
						console.error('Not Loaded:', url);
					}

					resource.source = response;
					resource.readystatechanged(3);
					//	process next
					processByEval();
				});
			} else {
				loadByEmbedding();
			}

		}
	};
})();