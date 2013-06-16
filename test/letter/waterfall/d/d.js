

include.js('letterData.js::DData').done(function(resp){
	
	eq(resp.DData.letter, 'D');
	
	include.exports = resp.DData;	
});



