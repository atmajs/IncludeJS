
var letter = include.route.params && include.route.params.letter;
assert.equals(typeof letter, 'string', 'Parameter letter should be defined');

include.js(letter + '.js::Letter').done(function(resp){

	assert.equals(letter, resp.Letter, 'Parameter should be equal to returned response');
	assert.match(include.url, '/a.js');
	include.exports = resp.Letter;
})