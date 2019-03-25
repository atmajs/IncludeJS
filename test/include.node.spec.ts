
let includeModule = require('../lib/include.node.module.js');
let include = null;

UTest({
	$before () {
		include = includeModule
			.includeLib
			.instance('/test/include.node.test');

		include.routes({
			waterfall: 'letter/waterfall/{0}/{1}.js',
			exports: 'letter/exports/{0}.js',
			condition: 'letter/condition/{0}.js',
		});

	},
	'Waterfall': function(done) {
		global.letters = {};

		include.js({
			waterfall: 'a'
		}).done(function() {

			deepEq(letters, {
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

			deepEq(resp.A, {
				a: 'a'
			}, 'Response from a.js is not "a"');

			deepEq(resp.B, {
				b: 'b',
				c: 'c'
			}, 'Response from b.js is wrong');

			done();
		});
	},
	'Condition' : function(done){
		include.js({
			condition: 'a?letter=b::Letter'
		}).done(function(resp){

			assert(resp.Letter == 'b', 'Condition load failed');

			done();
		})
	},

	'Empty' : function(done){
		include.instance().done(() => {

			var self = include.instance();

				self
					.client()
					.js('WОNT/LOAD')
					.done(() => {
						deepEq_(self.includes, []);
						done();
					});
		});


	}
})