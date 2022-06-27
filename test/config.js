module.exports = {

    suites: {
        'node': {
            exec: 'node',
            tests: 'test/**.node.spec.ts',
            $config: {
                includejs: {
                    extentionDefault: { js: 'ts' },
                    amd: true,
                    map: {
                        'includedev': '/lib/include.node.module.js'
                    }
                }
            }
        },
        'dom': {
            exec: 'dom',
            //env: [ 'lib/include.module.js' ],
            tests: 'test/**.dom.spec.ts',
            $config: {
                includejs: {
                    extentionDefault: { js: 'ts' },
                    amd: true,
                    map: {
                        'includedev': '/lib/include.module.js'
                    }
                }
            }
        },
        'node-modules': {
            exec: 'node',
            //env: [ 'lib/include.node.module.js::includeModule' ],
            tests: 'test/modules/**.spec.ts',
            $config: {
                includejs: {
                    extentionDefault: { js: 'ts' },
                    amd: true,
                    map: {
                        'includedev': '/lib/include.node.module.js'
                    }
                }
            }
        },
        'dom-modules': {
            exec: 'dom',
            //env: [ 'lib/include.module.js' ],
            tests: 'test/modules/**.spec.ts',
            $config: {
                includejs: {
                    extentionDefault: { js: 'ts' },
                    amd: true,
                    map: {
                        'includedev': '/lib/include.module.js'
                    }
                }
            }
        }
    }
};
