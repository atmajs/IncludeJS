module.exports = {

	suites: {
		'node': {
			exec: 'node',
			env: [ 'lib/include.node.test.js::include' ],
			tests: 'test/**.node.test'
		},
		'dom': {
			exec: 'dom',
			env: [ 'lib/include.test.js' ],
			tests: 'test/**.dom.test'
		},
		'node-modules': {
			exec: 'node',
			env: [ 'lib/include.node.test.js::include' ],
			tests: 'test/modules/**.test'
		},
		'dom-modules': {
			exec: 'dom',
			env: [ 'lib/include.test.js::include' ],
			tests: 'test/modules/**.test'
		}
	}

}
