include.js('b.js::Letter').done(function(resp){

	eq('b', resp.Letter, 'Parameter should be equal to returned response');
	
	assert.notEqual(include.url.indexOf('/a.js'), -1);
	
	include.exports = resp.Letter;
})