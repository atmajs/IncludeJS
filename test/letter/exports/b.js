
include.js('c.js::C').done(function(resp){
	include.exports = {
		b: 'b',
		c: resp.C
	}
});
