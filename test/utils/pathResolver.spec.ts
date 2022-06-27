import { NodeModulePaths } from '../../src/PathResolver';

UTest({
    'should build paths' () {
        let paths = NodeModulePaths.getPaths('/src/baz.js', 'foo');
        deepEq_(paths, [
            '/src/node_modules/foo/package.json',
            '/node_modules/foo/package.json'
        ]);
    }
})
