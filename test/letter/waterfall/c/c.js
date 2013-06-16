letters.C = {
	loaded: true
};

include.js('c.small.js').done(function() {
	deepEq(letters.B.b, {
		loaded: true
	}, 'c.js: Small b not loaded');
	deepEq(letters.C.c, {
		loaded: true
	}, 'c.js: Small c not loaded');
});