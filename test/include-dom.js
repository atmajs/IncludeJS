window.global = window;


var root = buster.env.contextPath;

include.routes({
	waterfall: '/test/letter/waterfall/{0}/{1}.js',
	exports: '/test/letter/exports/{0}.js',
	condition: '/test/letter/condition/{0}.js',
});

include.cfg({
	path: buster.env.contextPath + '/'
});

buster.testRunner.timeout = 500;

buster.testCase('Load:DOM', {
	'Waterfall': function(done) {

		global.letters = {};

		include.js({
			waterfall: 'a'
		}).done(function() {
			assert.equals(letters, {
				A: {
					loaded: true,
					a: {
						loaded: true
					}
				},
				B: {
					loaded: true,
					b: {
						loaded: true
					}
				},
				C: {
					loaded: true,
					c: {
						loaded: true
					}
				}
			}, "Waterfall failed");
			done();
		});
	},
	'Exports': function(done) {
		include.js({
			exports: ['a::A', 'b::B']
		}).done(function(resp) {

			assert.equals(resp.A, {
				a: 'a'
			}, 'Response from a.js::A is not "a" |');

			assert.equals(resp.B, {
				b: 'b',
				c: 'c'
			}, 'Response from b.js is wrong');

			done();
		});
	},
	'Condition': function(done) {
		include.instance().js({
			condition: 'a?letter=b::Letter'
		}).done(function(resp) {
			assert.equals(resp, {
				Letter: 'b'
			}, 'Condition load failed');
			
			done();
		})
	}
})