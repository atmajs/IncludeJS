include.js('coffee-script.js').done(function(){
	
	include.exports = {
		process: function(source){			
			return CoffeeScript.compile(source);			
		}
	};
	
});