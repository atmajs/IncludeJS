module.exports = {
	
	suites: {
		'node': {
			env: [
				'lib/include.node.test.js::include'
			],
			tests: 'test/**.node.test'
		},
		
		'dom': {
			exec: 'dom',
			env: [
				'lib/include.test.js'
			],
			tests: 'test/**.dom.test'
		}
	}
	
}
