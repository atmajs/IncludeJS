import { path_resolveUrl } from '../../src/utils/path';

UTest({
    'should combine domain and subfolder path' () {
        let url = path_resolveUrl('../../baz.js', { location: 'http://foo.de/' });
        eq_(url, 'http://foo.de/baz.js');
    }
})