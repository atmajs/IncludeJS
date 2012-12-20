var fs = require('fs');
 	
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
