
var letter = include.route.params && include.route.params.letter;

assert(letter);

include.js(letter + '.js::Letter').done(function(resp){

	eq(letter, resp.Letter, 'Parameter should be equal to returned response');
	
	assert.notEqual(include.url.indexOf('/a.js'), -1);
	
	include.exports = resp.Letter;
})