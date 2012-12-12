letters.C = {
	loaded: true
};

include.js('c.small.js').done(function() {
	assert.equals(letters.B.b, {
		loaded: true
	}, 'c.js: Small b not loaded');
	assert.equals(letters.C.c, {
		loaded: true
	}, 'c.js: Small c not loaded');
});