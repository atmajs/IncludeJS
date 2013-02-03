(function(){

	var fs = require('fs'),
		vm = require('vm');

	 	
	XMLHttpRequest = function(){};
	XMLHttpRequest.prototype = {
		open: function(method, url){
			this.url = url;
		},
		send: function(){
			
			if (this.url.indexOf('file:///') > -1){
				this.url = this.url.replace('file:///','');
			}
			
			var that = this;
			fs.readFile(this.url, 'utf-8', function(err, data){
				if (err) {
					console.error('>>', err.code, err.path);
					data = '';		
				}

				that.readyState = 4;
				that.responseText = data;
				that.onreadystatechange();			
			});
		}
	};

	__eval = function(source, include){	

		global.include = include;
		global.require = require;
	    global.exports = module.exports;
	    global.__filename = getFile(include.url);
	    global.__dirname = getDir(global.__filename);
	    global.module = module;

		vm.runInThisContext(source, include.url);
		
	};


	function getFile(url){
		return url.replace('file:///', '');
	}
	function getDir(url){
		return url.substring(0, url.lastIndexOf('/'));
	}

}());