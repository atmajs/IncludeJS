
var loadScript = function(url, callback){
	//console.log('load script', url);
	var tag = document.createElement('script');
	tag.type = 'application/javascript';
	tag.src = url;
	tag.onload = callback;
	tag.onerror = callback;
	document.querySelector('head').appendChild(tag);

}

var isEvalEnabled = true; 

var ScriptStack = new(Class({

	Construct: function() {
		this.stack = [];
	},

	load: function(resource, parent) {
		var _this = this;

		//console.log('LOAD', resource.url, 'parent:',parent ? parent.url : '');
		
		var add = false;
		if (parent){
			
			for(var i = 0, x, length = this.stack.length; i<length; i++){				
				x = this.stack[i];
				
				if (x == parent){
					//console.warn('parent', x.url);
					this.stack.splice(i,0, resource);
					add = true;
					break;
				}				
			}
			
		}
		
		if (!add){
			//console.log('push to stack', resource.url, resource.parent);
			this.stack.push(resource);
		}
		
		if (isEvalEnabled){
			Helper.xhr(resource.url, function(url, response) {
				if (!response) console.error('no resp', resource);
				resource.source = response;
	
				resource.readystatechanged(3);
				
				_this.process();
			});	
		}
		else{
			this.loadByEmbedding();
		}
		

		
	},
	
	loadByEmbedding: function(){
		if (this.stack.length == 0) {
			console.log('GG', global.include.url);
			return;
		}
		
		var resource = this.stack[0];
		
		
		
		if (resource.state == 1) {
			return;
		}
		
		//console.log('before load: state:', resource.state, resource.url);
		resource.state = 1;
		
		global.include = resource;
		loadScript(resource.url, function(e){
			
			//console.log('loadED script', resource.url);
			for(var i = 0, x, length = this.stack.length; i<length; i++){
				x = this.stack[i];
				if (x == resource) {
					this.stack.splice(i,1);
					
					break;
				}
				
			}
			
			
			
			resource.state = 3;
			resource.onload(resource.url, ' ');
			
			this.loadByEmbedding();
		}.bind(this));
		
	},

	process: function() {
		var resource = this.stack[0];

		//console.log('process', resource.url, resource.state);
		if (resource && resource.state > 2) {
			resource.state = 0;

			//console.log('evaling', resource.url, this.stack.length);			
			try {
				__eval(resource.source, resource);
			} catch (error) {
				error.url = resource.url;
				Helper.reportError(error);
			}


			

			
			for(var i = 0, x, length = this.stack.length; i<length; i++){
				x = this.stack[i];
				if (x == resource) {
					this.stack.splice(i,1);
					break;
				}
				
			}
			
			
			resource.state = 3;
			resource.onload(resource.url, resource.source);
			this.process();
		}
	}
	

}))();