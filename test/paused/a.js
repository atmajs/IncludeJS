var resume = include.pause(),
	resource = include
	;
	
setTimeout(function(){
	resource.exports = 'foo';
	
	resume();
}, 200);