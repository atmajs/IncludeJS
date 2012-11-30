if (!letters.A.a) console.error('Small a not loaded');

letters.B = {
	loaded: true
};

include.js(['b.small.js','../c/c.js']).done(function(){
	if (!letters.B.b) console.error('Small b not loaded');
	if (!letters.C.c) console.error('Small c not loaded');
})

