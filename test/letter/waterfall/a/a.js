letters.A = {
	loaded: true
}

assert.match(include.url, '/a.js','Current Resource is not a.js');

include.js('a.small.js').done(function() {
	
	assert.equals(letters.A.a, {
		loaded: true
	}, "a.small not loaded");
});