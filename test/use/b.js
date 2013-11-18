
include
	.use('a_res', 'c.letter')
	.done(function(resp, a_res, c){
		
		eq(a_res, 'a');
		eq(c, 'c');
		
		include.exports = a_res + 'b';
	});
	
	