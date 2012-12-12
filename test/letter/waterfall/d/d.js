
var __i = include;
include.js('letterData.js::DData').done(function(resp){
	if (resp.DData.letter != 'D'){
		console.error('Loaded DData has not letter D');
	}	

	include.exports = resp.DData;	
});



