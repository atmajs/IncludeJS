letters.A = {
	loaded: true
}
include.js('a.small.js').done(function(){
	if (!letters.A.a) console.error('a.small. not loaded');
});