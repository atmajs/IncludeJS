
include
	.use('a_res')
	.done(function(resp, a_res){
		
		eq(a_res, 'a');
		
		include.exports = a_res + 'b';
	});
	
	