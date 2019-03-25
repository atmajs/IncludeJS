
var resource = include;

UTest({
	'paused': function(done){
		resource
			.js('./paused/a.js')
			.done(function(resp){
				
				eq(resp.a, 'foo');
				done();
			})		
	}
})
