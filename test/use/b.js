
include
	.use('a_res', 'c.letter')
	.done(function(resp, a_res, c){
		eq_(a_res, 'a');
		eq_(c, 'c');
		
		include.exports = a_res + 'b';
	});
	
	