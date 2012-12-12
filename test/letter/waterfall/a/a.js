letters.A = {
	loaded: true
}


include.js('a.small.js').done(function() {
	
	assert.equals(letters.A.a, {
		loaded: true
	}, "a.small not loaded");
});