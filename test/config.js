module.exports = {

	suites: {
		'node': {
			exec: 'node',
			env: [ 'lib/include.node.module.js::includeTest' ],
			tests: 'test/**.node.test'
		},
		'dom': {
			exec: 'dom',
			env: [ 'lib/include.module.js::includeTest' ],
			tests: 'test/**.dom.test'
		},
		'node-modules': {
			exec: 'node',
			env: [ 'lib/include.node.module.js::includeTest' ],
			tests: 'test/modules/**.test'
		},
		'dom-modules': {
			exec: 'dom',
			env: [ 'lib/include.module.js::includeTest' ],
			tests: 'test/modules/**.test'
		}
	}

}
