
letters.C = {
	loaded: true
};

include.js('c.small.js').done(function(){
	if (!letters.B.b) console.error('Small b not loaded in C');
	if (!letters.C.c) console.error('Small c not loaded');
})

