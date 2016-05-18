module.exports = {

	suites: {
		'node': {
			exec: 'node',
			env: [ 'lib/include.node.module.js::include' ],
			tests: 'test/**.node.test'
		},
		'dom': {
			exec: 'dom',
			env: [ 'lib/include.module.js' ],
			tests: 'test/**.dom.test'
		},
		'node-modules': {
			exec: 'node',
			env: [ 'lib/include.node.module.js::include' ],
			tests: 'test/modules/**.test'
		},
		'dom-modules': {
			exec: 'dom',
			env: [ 'lib/include.module.js::include' ],
			tests: 'test/modules/**.test'
		}
	}

}
