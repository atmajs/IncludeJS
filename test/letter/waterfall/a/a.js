letters.A = {
	loaded: true
}

assert.notEqual(include.url.indexOf('/a.js'), -1,'Current Resource is not a.js');

include.js('a.small.js').done(function() {

	deepEq(letters.A.a, {
		loaded: true
	}, "a.small not loaded");
});
