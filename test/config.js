module.exports = {

	suites: {
		'node': {
			exec: 'node',
			env: [ 'lib/include.node.module.js::includeTest' ],
			tests: 'test/**.node.spec.ts'
		},
		'dom': {
			exec: 'dom',
			env: [ 'lib/include.module.js::includeTest' ],
			tests: 'test/**.dom.spec.ts'
		},
		'node-modules': {
			exec: 'node',
			env: [ 'lib/include.node.module.js::includeTest' ],
			tests: 'test/modules/**.spec.ts'
		},
		'dom-modules': {
			exec: 'dom',
			env: [ 'lib/include.module.js::includeTest' ],
			tests: 'test/modules/**.spec.ts'
		}
	}
};
