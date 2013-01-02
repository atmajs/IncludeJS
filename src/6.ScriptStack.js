var ScriptStack = (function() {

	var head, currentResource, stack = [],
		loadScript = function(url, callback) {
			//console.log('load script', url);
			var tag = document.createElement('script');
			tag.type = 'text/javascript';
			tag.src = url;
			
			if ('onreadystatechange' in tag){
				tag.onreadystatechange = function(){
					(this.readyState == 'complete' || this.readyState == 'loaded') && callback();
				};
			}else{			
				tag.onload = tag.onerror = callback;
			}

			(head || (head = document.getElementsByTagName('head')[0])).appendChild(tag);
		},
		////////afterScriptRun = function(resource) {
		////////	var includes = resource.includes;
		////////	
		////////	if (includes != null && includes.length) {
		////////		for (var i = 0; i < includes.length; i++) {
		////////			if (includes[i].state != 4) {
		////////				return;
		////////			}
		////////		}
		////////	}			
		////////	
		////////	resource.readystatechanged(4);
		////////},
		loadByEmbedding = function() {
			if (stack.length === 0) {
				return;
			}

			if (currentResource != null){
				return;
			}


			var resource = (currentResource = stack[0]);

			if (resource.state === 1) {
				return;
			}

			resource.state = 1;

			global.include = resource;
			global.iparams = resource.route.params;
			
			
			loadScript(resource.url, function(e) {
				if (e && e.type == 'error'){
					console.log('Script Loaded Error', resource.url);					
				}
				for (var i = 0, length = stack.length; i < length; i++) {
					if (stack[i] === resource) {
						stack.splice(i, 1);
						break;
					}
				}
				
				//-resource.state = 3;
				//-afterScriptRun(resource);
				resource.readystatechanged(3);

				currentResource = null;
				loadByEmbedding();
			});
		},
		processByEval = function() {
			if (stack.length === 0){
				return;
			}
			if (currentResource != null){
				return;
			}

			var resource = stack[0];
			if (resource && resource.state > 1) {
				currentResource = resource;
			
				resource.state = 1;
				global.include = resource;
				
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
				//-resource.state = 3;
				//-afterScriptRun(resource);
				resource.readystatechanged(3);

				currentResource = null;
				processByEval();
			}
		};


	return {
		load: function(resource, parent, forceEmbed) {

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
			
			if (!cfg.eval || forceEmbed){
				loadByEmbedding();
				return;
			}

			
			Helper.xhr(resource.url, function(url, response) {
				if (!response) {
					console.error('Not Loaded:', url);
				}

				resource.source = response;
				resource.state = 2;
				
				processByEval();
			});		
		},
		/** Move resource in stack close to parent */
		moveToParent: function(resource, parent){
			var i, length, x, tasks = 2;
			
			for(i = 0, x, length = stack.length; i<length && tasks; i++){
				x = stack[i];
				
				if (x === resource){
					stack.splice(i, 1);
					length--;
					i--;
					tasks--;
				}
				
				if (x === parent){
					stack.splice(i, 0, resource);
					length++;
					i++;
					tasks--;					
				}
			}
			
			if (parent == null){
				stack.unshift(resource);
			}
			
		}/*,
		afterScriptRun: afterScriptRun*/
	};
})();