module.exports = {
	
	suites: {
		'node': {
			env: [
				'lib/include.node.js'
			],
			tests: 'test/*.node.test'
		},
		
		'dom': {
			exec: 'dom',
			env: [
				'lib/include.js'
			],
			tests: 'test/**.dom.test'
		}
	}
	
}
