deepEq(letters.A.a, {
	loaded: true
}, "Small A in b.js not loaded");


letters.B = {
	loaded: true
};

include.js(['b.small.js', '../c/c.js']).done(function() {
	deepEq(letters.B.b, {
		loaded: true
	}, 'Small b not loaded');
	deepEq(letters.C.c, {
		loaded: true
	}, 'Small c not loaded');
});